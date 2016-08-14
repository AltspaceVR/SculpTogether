function SETUP_tracked(){
	
	
	
	
	
	var pads;
	
	var curMode;
	
	var GRIPINDEX = 1;
	
	
	return {
		
		label:"tracked",
		
		isAvailable:function(){
			
			if (pads) return true;
			
			
			var gamepadsList = altspace.getGamepads();
			if (gamepadsList.length < 2) return false;
			
			
			var padL, padR;
			
			for(var i=0; i<gamepadsList.length; i++) {
				var curPadInfo = gamepadsList[i];
				switch(curPadInfo.mapping){
					case "standard":
						continue;
					break;
					case "steamvr":
						if (curPadInfo.hand == "left") {
							padL = curPadInfo;
						} else {
							padR = curPadInfo;
						}
					break;
					default:
						console.log("UNKNOWN CONTROLLER TYPE??",curPadInfo.mapping);
					break;
				}
			}
			
			if (!padL || !padR) return false;
			
			pads = {'Right':padR,'Left':padL};
			return true;
			
		},
		
		open:function(){
			
		},
		
		close:function(){
			
		},
		
		modeSwitch:function(newMode){
			
			switch(curMode){
				case 0://draw
				
				break;
				case 1://prim only
				
				break;
				case 2://erase
					
				break;
			}
			
			curMode = newMode;
			
			switch(newMode){
				case 0://draw
					
				break;
				case 1://prim only
				
				break;
				case 2://erase
					
				break;
			}
			
		},
		
		frameFunc:function(){
			
		},
		
		getDominantPointing:function(){
			
			if (curMode == 1) return false;
			
			var domPad = pads[dominantHand];
			
			if (curMode != 2) {//non-clicked pointing is only allowed in erase mode; otherwise fail if there's no click
				if (!domPad.buttons[GRIPINDEX].pressed) return false;
			}
			
			var fingerPos = new THREE.Vector3().copy(domPad.position);
			var fingerQuat = new THREE.Quaternion().copy(domPad.rotation);
			
			return {
				fingerPos:fingerPos,
				fingerQuat:fingerQuat,
				pointSafeDist:2
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