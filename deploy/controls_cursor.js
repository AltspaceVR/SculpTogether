function SETUP_cursor(){
	
	if (scene) {
		
		var clickCatcherHolder = new THREE.Object3D();
		scene.add(clickCatcherHolder);
		objHide(clickCatcherHolder);
		
		var clickCatcherMaterial = new THREE.MeshBasicMaterial({visible:false});//map:THREE.ImageUtils.loadTexture("debug.png")});//
		var catcherSides = 8;
		var catcherRad = toWorldUnits(40);
		var catcherHeight = toWorldUnits(40);
		var clickCatcherSideGeom = new THREE.PlaneGeometry(catcherRad*2,catcherHeight);//this is wider than necessary but that doesn't hurt anything
		
		var hitzoneScaleFactor = 1/0.6;
		
		for(var i=0; i<catcherSides; i++){
			var catcherSide = new THREE.Mesh(clickCatcherSideGeom,clickCatcherMaterial);
			var myAng = (i/catcherSides)*Math.PI*2;
			catcherSide.position.set(
				Math.cos(myAng)*catcherRad,
				0,
				Math.sin(myAng)*catcherRad
			);
			catcherSide.rotation.y = -myAng-Math.PI/2;
			catcherSide.scale.set(hitzoneScaleFactor,hitzoneScaleFactor,hitzoneScaleFactor);
			clickCatcherHolder.add(catcherSide);
		}
		
		var clickCatcherCapGeom = new THREE.PlaneGeometry(catcherRad*2,catcherRad*2);
		var clickCatcherTop = new THREE.Mesh(clickCatcherCapGeom,clickCatcherMaterial);
		clickCatcherTop.rotation.x = Math.PI/2;
		clickCatcherTop.position.y = catcherHeight/2;
		clickCatcherTop.scale.set(hitzoneScaleFactor,hitzoneScaleFactor,hitzoneScaleFactor);
		clickCatcherHolder.add(clickCatcherTop);
		
		var clickCatcherFloor = new THREE.Mesh(clickCatcherCapGeom,clickCatcherMaterial);
		clickCatcherFloor.rotation.x = -Math.PI/2;
		clickCatcherFloor.position.y = -enclosureInfo.innerHeight/2 + toWorldUnits(0.5);
		clickCatcherFloor.scale.set(hitzoneScaleFactor,hitzoneScaleFactor,hitzoneScaleFactor);
		scene.add(clickCatcherFloor);
		objHide(clickCatcherFloor);
		
	}
	
	
	
	var cursorIsDown = false;
	var lastRay;
	var lastPos;
	var lastQuat;
	var lastUnit;
	function cursorUpFunc(e){
		cursorIsDown = false;
		lastPos = false;
	}
	function cursorDownFunc(e){
		cursorIsDown = true;
	}
	function cursorMoveFunc(e){
		lastRay = e.ray;
	}
	
	
	var forwardUnit = new THREE.Vector3(0,0,1);
	var upUnit = new THREE.Vector3(0,1,0);
	var zeroVec = new THREE.Vector3(0,0,0);
	
	
	var curMode;
	var currentlyEnabled;
	
	return {
		
		updateEnabledness:function(isEnabled){
			currentlyEnabled = isEnabled;
			if (currentlyEnabled) {
				objShow(clickCatcherHolder);
				objShow(clickCatcherFloor);
			} else {
				objHide(clickCatcherHolder);
				objHide(clickCatcherFloor);
			}
		},
		
		open:function(){
			cursorUpFunc();
			objShow(clickCatcherHolder);
			objShow(clickCatcherFloor);
			
			scene.addEventListener('cursorup',cursorUpFunc);
			scene.addEventListener('cursordown',cursorDownFunc);
			scene.addEventListener('cursormove',cursorMoveFunc);
			
		},
		
		close:function(){
			objHide(clickCatcherHolder);
			objHide(clickCatcherFloor);
			
			scene.removeEventListener('cursorup',cursorUpFunc);
			scene.removeEventListener('cursordown',cursorDownFunc);
			scene.removeEventListener('cursormove',cursorMoveFunc);
		},
		
		modeSwitch:function(newMode){
			
			curMode = newMode;
			
			switch(newMode){
				case 0://draw
					
				break;
				case 1://erase
				
				break;
			}
			
		},
		
		frameFunc:function(){
			if (currentlyEnabled) {
				clickCatcherHolder.position.copy(skeletonInfo.getJoint('Head').position);
				clickCatcherFloor.position.x = clickCatcherHolder.position.x;
				clickCatcherFloor.position.z = clickCatcherHolder.position.z;
			}
		},
		
		getDominantPointing:function(){
			
			if (!cursorIsDown) return false;
			
			
			var fingerPos = lastRay.at(toWorldUnits(40));
			var fingerQuat = new THREE.Quaternion();
			
			switch(curMode){
				
				// it seriously might make way more sense to send a ray rather than a position + quaternion...
				
				case 0://draw
					if (lastPos) {
						// okay this is HORRIBLY convoluted but it'll do!!
						var gapVect = new THREE.Vector3().subVectors(fingerPos,lastPos);
						var lookMtx = new THREE.Matrix4().lookAt(zeroVec,gapVect,lastUnit);
						var lookQuat = new THREE.Quaternion().setFromRotationMatrix(lookMtx);
						lastUnit = new THREE.Vector3(0,1,0).applyQuaternion(lookQuat);
						fingerQuat.setFromUnitVectors(lastUnit,upUnit);//up isn't used anyway; this definitely could be cleaned way way up
					} else {
						fingerQuat.setFromUnitVectors(forwardUnit,upUnit);
						lastUnit = upUnit.clone();
					}
					lastPos = fingerPos;
					lastQuat = fingerQuat;
				break;
				case 1://erase
					fingerQuat.setFromUnitVectors(forwardUnit,lastRay.direction);
				break;
				
			}
			
			
			return {
				fingerPos:fingerPos,
				fingerQuat:fingerQuat
			};
			
		},
		
		getBothPinching:function(){
			return false;
			/*
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
			*/
		},
		
		
		// also animates detonator attachment, in this case! maybe a weird place to put it, but it gets called every frame while relevant, so w/e
		getDetonatorPressed:function(){
			return false;
			/*
			
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
			
			*/
		}
		
		
	};
	
}