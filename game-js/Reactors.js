import {GameSingleton} from './GameBase'

function onRunTest(){
	var scenario = "/Users/joedo/Documents/Battlesim/Scenarios/" + document.getElementById("scenario_chooser").files[0].name;
	GameSingleton.getInstance().deserialize(scenario);	
}
function onSave(){
	GameSingleton.getInstance().serialize();	
	
}	
function onUnitCreation(){
	GameSingleton.getInstance().selectPieces();
	
}
function onChangeState(){
	GameSingleton.getInstance().getStateMachine().nextState();
	GameSingleton.getInstance().activityButton.innerHTML = GameSingleton.getInstance().getStateMachine().getState().label();
}

var assignTerrain = false;
function onDefineTerrain(event){
	//Toggle assign terrain mode	
	assignTerrain = !assignTerrain;
	if(assignTerrain){
		GameSingleton.getInstance().activeTerrain = event.currentTarget.innerHTML;
		//Get the 
		var terrain = document.getElementById("activeTerrainId").value;
		GameSingleton.getInstance().activeTerrain = terrain;

		GameSingleton.getInstance().authorMode = true;
	}
	else
		GameSingleton.getInstance().authorMode = false;
}


export { onRunTest, onSave, onChangeState, onUnitCreation, onDefineTerrain }