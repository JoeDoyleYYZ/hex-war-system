import {BSBoardCreator, BSBoardCreatorSingleton} from './BoardCreator'



//var theGame = null;
function initGame(){
	theGame = GameSingleton.getInstance();
	theGame.reset();
	theGame.init();
	//theGame.defaultGamePieceInit();
	debugAlert("Game Initialized", false);
	//debugger;
	//el = document.getElementById("increment");
	//addListenerToElement(el, onClick, "mousedown");
}
//Entry point for defining a new board
function initBoardCreation(){
	var theCreator = BSBoardCreatorSingleton.getInstance();
	theCreator.init();
}
function onClick(){
	incrementPhase();
}
function incrementPhase(){
	//debugger;
	theGame = GameSingleton.getInstance();
	if(theGame.gameStarted() == false)
		theGame.startGame();
	theGame.incrementPhase();
	
}


export { initBoardCreation }

