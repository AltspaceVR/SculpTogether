function SETUP_cursor(){
	
	var clickCatcherHolder = new THREE.Object3D();
	scene.add(clickCatcherHolder);
	objHide(clickCatcherHolder);
	
	var clickCatcherMaterial = new THREE.MeshBasicMaterial({visible:false});
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
	for(var i=0; i<2; i++){
		var clickCatcherCap = new THREE.Mesh(clickCatcherCapGeom,clickCatcherMaterial);
		clickCatcherCap.rotation.x = Math.PI/2 + Math.PI*i;
		clickCatcherCap.position.y = catcherHeight/2 * ((i-0.5)*-2);
		clickCatcherCap.scale.set(hitzoneScaleFactor,hitzoneScaleFactor,hitzoneScaleFactor);
		clickCatcherHolder.add(clickCatcherCap);
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
	
	return {
		
		open:function(){
			cursorUpFunc();
			objShow(clickCatcherHolder);
			
			scene.addEventListener('cursorup',cursorUpFunc);
			scene.addEventListener('cursordown',cursorDownFunc);
			scene.addEventListener('cursormove',cursorMoveFunc);
		},
		
		close:function(){
			objHide(clickCatcherHolder);
			
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
			clickCatcherHolder.position.copy(skeletonInfo.getJoint('Head').position);
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