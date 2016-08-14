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