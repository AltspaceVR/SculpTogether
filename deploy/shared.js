var hasBeenFocused;

window.addEventListener('focus',function(){
	console.log("[FOCUS]");
	hasBeenFocused = true;
});
window.addEventListener('blur',function(){
	console.log("[BLUR]");
});


var controlSystems;

function initControlSystems(){
	controlSystems = {
		cursor: SETUP_cursor(),
		leapmotion: SETUP_leapmotion(),
		tracked: SETUP_tracked()
	};
}




function detectControlSystemMode(){
	
	if (curControlSystem != controlSystems.tracked) {//Tracked is most preferable, so stop looking
		
		if (controlSystems.tracked.isAvailable()) {
			changeControlSystem(controlSystems.tracked);
		} else {
			
			if (curControlSystem != controlSystems.leapmotion){
				
				if (controlSystems.leapmotion.isAvailable()) {
					changeControlSystem(controlSystems.leapmotion);
				}
				
			}
			
		}
		
	}
	
}