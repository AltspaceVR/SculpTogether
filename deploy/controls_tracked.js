/* exported SETUP_tracked */
/* global THREE, altspace, hasBeenFocused, dominantHand, toWorldUnits */
function SETUP_tracked(){
	
	
	
	
	
	var pads;
	
	var curMode;
	
	var GRIPINDEX = 1;

	// Call immediately to indicate that we want gamepad updates
	altspace.getGamepads();
	
	
	return {
		
		label:"tracked",

		canDetermineAvailability: function () {
			return hasBeenFocused;
		},
		
		isAvailable:function(){
			
			
			var gamepadsList = altspace.getGamepads();//always ask regardless of anything
			
			
			if (!this.canDetermineAvailability()) {
				//console.log("tracked unavailable because HASN'T BEEN FOCUSED");
				return false;
			}
			
			if (pads) return true;
			
			if (gamepadsList.length < 2) {
				//console.log("tracked unavailable because ONLY",gamepadsList.length,"PADS");
				return false;
			}
			
			
			var padL, padR;
			
			for(var i=0; i<gamepadsList.length; i++) {
				var curPadInfo = gamepadsList[i];
				switch(curPadInfo.mapping){
					case "standard":
						continue;
					case "touch":
					case "steamvr":
						this.mapping = curPadInfo.mapping;
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
			
			if (!padL || !padR || !padL.connected || !padR.connected) {
				//console.log("tracked unavailable because THERE'S",gamepadsList.length,"PADS, BUT NO HANDEDNESS");
				return false;
			}
			
			pads = {Right:padR,Left:padL};
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
			
			if (curMode == 1 || !pads) return false;
			
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
			
			if (curMode != 1 || !pads) return false;
			
			if (!pads.Right.buttons[GRIPINDEX].pressed) return false;
			if (!pads.Left.buttons[GRIPINDEX].pressed) return false;
			
			var rightQuat = new THREE.Quaternion().copy(pads.Right.rotation);
			var leftQuat = new THREE.Quaternion().copy(pads.Left.rotation);
			
			var rightPinch = new THREE.Vector3().copy(pads.Right.position);
			var leftPinch = new THREE.Vector3().copy(pads.Left.position);
			
			var offDist = toWorldUnits(1);
			
			var rightOff = new THREE.Vector3(offDist,0,0);
			rightOff.applyQuaternion(rightQuat);
			rightPinch.add(rightOff);
			
			var leftOff = new THREE.Vector3(-offDist,0,0);
			leftOff.applyQuaternion(leftQuat);
			leftPinch.add(leftOff);
			
			return {
				rightPinch:rightPinch,
				leftPinch:leftPinch,
				rightQuat:rightQuat,
				leftQuat:leftQuat,
				spawnMargin:2
			};
			
		},
		
		
		getDetonatorPressed:function(){
			
			if (curMode != 2 || !pads) return false;//though I don't think this'll even be polled unless it's the right mode already...
			
			return pads[dominantHand].buttons[GRIPINDEX].pressed;
			
		}
		
		
	};
	
}
