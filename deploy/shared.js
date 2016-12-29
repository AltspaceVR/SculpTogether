/* global 
	SETUP_cursor, SETUP_leapmotion, SETUP_tracked, curControlSystem, changeControlSystem, 
	artServer, walkingDead, userInfo */
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
	
	//Tracked is most preferable, so stop looking
	if (curControlSystem != controlSystems.tracked && controlSystems.tracked.canDetermineAvailability()) {
		if (controlSystems.tracked.isAvailable()) {
			changeControlSystem(controlSystems.tracked);
		} else if (curControlSystem != controlSystems.leapmotion && controlSystems.leapmotion.isAvailable()){
			changeControlSystem(controlSystems.leapmotion);
		}
	}
	
}












var previousWipeNum;

function setupResetSystem(isPopup){
	
	var wipeInfoServer = artServer.child('wipeInfo');
	wipeInfoServer.on('value',function(snapshot){
		
		var newWipeInfo = snapshot.val();
		if (!newWipeInfo) console.log("no existing wipe info, this seems to be a new room!");
		
		var newWipeNum = newWipeInfo ? newWipeInfo.num : 1 ;
		console.log("current wipenum val:",newWipeNum);
		
		if (previousWipeNum) {
			
			console.log("previous wipenum val:",previousWipeNum);
			if (newWipeNum != previousWipeNum) {
				console.log("they're different, so time to reload.");
				if (walkingDead) {
					console.log("EXCEPT, I'm the one who sent the message, so I'm not going to until I hear back from the server!!");
				} else {
					location.reload();
				}
			} else {
				console.log("they still match, so no reloading just yet.");
			}
			
		} else {
			
			console.log("this is the first wipenum I've seen, so I'll remember it.");
			previousWipeNum = newWipeNum;
			
			if (isPopup){
				var resetMsg = newWipeInfo ? ("Last reset was by "+newWipeInfo.user+".") : "This room has not yet been reset.";
				document.getElementById('previousResetInfo').innerHTML = resetMsg;
			}
			
		}
		
	});
	
	
	
}


function resetRoom(){
	
	walkingDead = true;
	
	artServer.set({wipeInfo:{
		num:(previousWipeNum+1),
		user:userInfo.displayName
	}},function(error){
		console.log("ok, news of reset has reached server, so I can reset now.");
		location.reload();
	});
	
}



