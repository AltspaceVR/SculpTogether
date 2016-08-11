function SETUP_leapmotion(){
	
	function isFingerPointing(fingerName,handName){
		
		var baseJoint = skeletonInfo.getJoint(fingerName,handName,0);
		var firstJoint = skeletonInfo.getJoint(fingerName,handName,3);
		
		var bendAmt = quatDist(baseJoint.quaternion,firstJoint.quaternion);
		
		return (bendAmt < 0.03);
		
	}
	
	
	
	function isThumbUp(handName){
		
		var rootJoint = skeletonInfo.getJoint('Thumb',handName,0).quaternion.clone();
		var tipJoint = skeletonInfo.getJoint('Thumb',handName,3).quaternion.clone();
		
		rootJoint.inverse();
		
		var localQuat = new THREE.Quaternion().multiplyQuaternions(rootJoint,tipJoint);
		
		var thumbVec = new THREE.Vector3(0,0,1);
		thumbVec.applyQuaternion(localQuat);
		
		return (thumbVec.y > -0.5);
		
	}
	
	
	function getFingertipPos(fingerName,handName,posOut,quatOut){
		
		var lastJointIndex = 3;//check if this needs to be changed for thumb, presumably?
		
		
		// finger joints aren't NECESSARILY the same length but it's the right ballpark
		
		var midJoint = skeletonInfo.getJoint(fingerName,handName,lastJointIndex-1);
		var lastJoint = skeletonInfo.getJoint(fingerName,handName,lastJointIndex);
		
		var jointLength = midJoint.position.distanceTo(lastJoint.position);
		
		posOut.copy(offPtInDir(lastJoint.position,lastJoint.quaternion,jointLength));
		quatOut.copy(lastJoint.quaternion);
		
	}
	
	
	
	var pinchDebugGeom = new THREE.SphereGeometry(0.2);
	var pinchDebugMat = new THREE.MeshBasicMaterial({color:0xFF00FF});
	var pinchDebugMeshes = {
		'Left':new THREE.Mesh(pinchDebugGeom,pinchDebugMat),
		'Right':new THREE.Mesh(pinchDebugGeom,pinchDebugMat)
	}
	
	//scene.add(pinchDebugMeshes['Left']);
	//scene.add(pinchDebugMeshes['Right']);
	
	
	
	function getHandPinch(handName,threshhold){
		
		var indexPos = new THREE.Vector3();
		var thumbPos = new THREE.Vector3();
		var dummyQuat = new THREE.Quaternion();
		
		getFingertipPos('Index',handName,indexPos,dummyQuat);
		getFingertipPos('Thumb',handName,thumbPos,dummyQuat);
		
		var pinchGap = indexPos.distanceTo(thumbPos);
		
		if (pinchGap < toWorldUnits(threshhold)) {
			
			
			//return new THREE.Vector3(
			//	(indexPos.x+thumbPos.x)/2,
			//	(indexPos.y+thumbPos.y)/2,
			//	(indexPos.z+thumbPos.z)/2
			//);
			
			// turns out that opening your fingers moves your index farther than your thumb,
			// so to avoid drift when releasing, let's assume pinches are a fixed point away from your palm
			
			var palmJoint = skeletonInfo.getJoint('Hand',handName,0);
			var pinchPoint = new THREE.Vector3(
				toWorldUnits(0.5),
				toWorldUnits(-1),
				toWorldUnits(1.5)
			);
			if (handName == "Left") pinchPoint.x *= -1;
			pinchPoint.applyQuaternion(palmJoint.quaternion);
			pinchPoint.add(palmJoint.position);
			
			pinchDebugMeshes[handName].position.copy(pinchPoint);
			
			return pinchPoint;
			
		} else {
			return false;
		}
		
	}
	
	
	
	function isHandActive(handName){
		var handInfo = skeletonInfo.getJoint('Hand',handName);
		if (!handInfo) return false;
		if (handInfo.confidence < 2) return false;
		return true;
	}
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	if (scene) {
		var detonatorHolder = new THREE.Object3D();
		scene.add(detonatorHolder);
		
		var detonatorBaseCanvas = document.createElement('canvas');
		detonatorBaseCanvas.width = detonatorBaseCanvas.height = 8;
		var detonatorBaseCtx = detonatorBaseCanvas.getContext('2d');
		detonatorBaseCtx.scale(detonatorBaseCanvas.width, detonatorBaseCanvas.height);
		var detonatorBaseGrad = detonatorBaseCtx.createLinearGradient(0,0,0,1);
		detonatorBaseGrad.addColorStop(0,"#111");
		detonatorBaseGrad.addColorStop(1,"#444");
		detonatorBaseCtx.fillStyle = detonatorBaseGrad;
		detonatorBaseCtx.fillRect(0,0,1,1);
		
		var detonatorRad = toWorldUnits(0.3);
		var detonatorHeight = toWorldUnits(1.5);
		var detonatorBase = new THREE.Mesh(
			new THREE.CylinderGeometry(detonatorRad,detonatorRad,detonatorHeight,12),
			new THREE.MeshBasicMaterial({map:new THREE.Texture(detonatorBaseCanvas)})
		);
		detonatorBase.position.set(
			0,
			toWorldUnits(-0.5),
			toWorldUnits(1.0)
		);
		detonatorBase.rotation.set(
			Math.PI*0.1,
			0,
			Math.PI*0.5,
			'XYZ'
		);
		detonatorHolder.add(detonatorBase);
		
		var detonatorButtonW = detonatorRad*0.7;
		var detonatorButtonH = detonatorHeight*0.2;
		var detonatorButtonUp = new THREE.Mesh(
			new THREE.CylinderGeometry(detonatorButtonW,detonatorButtonW,detonatorButtonH,12),
			new THREE.MeshBasicMaterial({color:0x880000})
		);
		detonatorButtonUp.position.y = (detonatorHeight+detonatorButtonH)/2;
		detonatorBase.add(detonatorButtonUp);
		
		var detonatorButtonDownH = detonatorButtonH*0.5;
		var detonatorButtonDown = new THREE.Mesh(
			new THREE.CylinderGeometry(detonatorButtonW,detonatorButtonW*1.3,detonatorButtonDownH,12),
			new THREE.MeshBasicMaterial({color:0xFF0000})
		);
		detonatorButtonDown.position.y = (detonatorHeight+detonatorButtonDownH)*0.5;
		detonatorBase.add(detonatorButtonDown);
		
		objHide(detonatorHolder);
	}
	
	
	
	
	
	
	
	
	
	
	
	
	
	var oldDetonatorPressed = false;
	
	var hasEverBeenAvailable = false;
	
	var curMode;
	
	
	return {
		
		isAvailable:function(){
			if (isHandActive('Left') || isHandActive('Right')) hasEverBeenAvailable = true;
			return hasEverBeenAvailable;
		},
		
		open:function(){
			
		},
		
		close:function(){
			objHide(detonatorHolder);
		},
		
		modeSwitch:function(newMode){
			
			switch(curMode){
				case 0://draw
				
				break;
				case 1://prim only (should be impossible with these controls!)
				
				break;
				case 2://erase
					objHide(detonatorHolder);
				break;
			}
			
			curMode = newMode;
			
			switch(newMode){
				case 0://draw
					
				break;
				case 1://prim only (should be impossible with these controls!)
				
				break;
				case 2://erase
					objShow(detonatorHolder);
				break;
			}
			
		},
		
		frameFunc:function(){
			
		},
		
		getDominantPointing:function(){
			
			if (!isHandActive(dominantHand)) return false;
			
			if (isFingerPointing('Ring',dominantHand)) return false;
			if (!isFingerPointing('Index',dominantHand)) return false;
			
			
			
			var fingerPos = new THREE.Vector3();
			var fingerQuat = new THREE.Quaternion();
			getFingertipPos('Index',dominantHand,fingerPos,fingerQuat);
			
			
			
			return {
				fingerPos:fingerPos,
				fingerQuat:fingerQuat
			};
			
		},
		
		getBothPinching:function(){
			
			var pinchThreshhold = 1;
			
			if (!isHandActive('Right')) return false;
			if (!isHandActive('Left')) return false;
			
			var rightPinch = getHandPinch('Right',pinchThreshhold);
			if (!rightPinch) return false;
			
			var leftPinch = getHandPinch('Left',pinchThreshhold);
			if (!leftPinch) return false;
			
			var rightQuat = skeletonInfo.getJoint('Hand','Right').quaternion;
			var leftQuat = skeletonInfo.getJoint('Hand','Left').quaternion;
			
			return {
				rightPinch:rightPinch,
				leftPinch:leftPinch,
				rightQuat:rightQuat,
				leftQuat:leftQuat
			};
			
		},
		
		
		// also animates detonator attachment, in this case! maybe a weird place to put it, but it gets called every frame while relevant, so w/e
		getDetonatorPressed:function(){
			
			
			
			if (isHandActive(otherHand)) {
				
				var detonatorHandInfo = skeletonInfo.getJoint('Hand',otherHand);
				
				//this is NOT strictly necessary since position is how it's being hidden right now anyway,
				//but for the sake of supporting changes to the show/hide system, let's put it in
				objShow(detonatorHolder);
				
				detonatorHolder.position.copy(detonatorHandInfo.position);
				detonatorHolder.quaternion.copy(detonatorHandInfo.quaternion);
				
				detonatorBase.rotation.y = (otherHand == 'Left') ? 0 : Math.PI ;
				
				detonatorIsPressed = !isThumbUp(otherHand);
				detonatorButtonUp.visible = !detonatorIsPressed;
				detonatorButtonDown.visible = detonatorIsPressed;
				
				oldDetonatorPressed = detonatorIsPressed;
				
			} else {
				
				objHide(detonatorHolder);
				
			}
			
			return oldDetonatorPressed;
			
			
		}
		
		
	};
	
}