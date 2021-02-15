import { createUnit, cacheKeyByElement, cacheKeyByValue, retrieveElementByKey, addEvent, HoverListener, Point2d, debugAlert, addListenerToElement, getRandomInt, inside, serialize, scaleImage, addToFrontOfArray, HexListener} from './GeneralUtilities'
import {BOARD_SIZE_KEY, BG_IMG_KEY, TERRAIN } from './Constants'
import {BSBoardPrototype} from './GameBoard'

var BSBoardCreatorSingleton = (function () {
    var instance = null;
    function createInstance() {
        var game = new BSBoardCreator();
        return game;
    }
 
    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();


function onSave(){
  BSBoardCreatorSingleton.getInstance().doSave();

}

class BSBoardCreator {
  constructor() {
  }
  init() {
    var boardSize = retrieveElementByKey(BOARD_SIZE_KEY);
    if(boardSize == null) boardSize = "Medium";
    var bgImg = retrieveElementByKey(BG_IMG_KEY);
    this.board = new BSBoardPrototype();
    this.board.init(false, boardSize, bgImg);
    this.terrainBrush = TERRAIN.FOREST;
    this.nextStep = document.getElementById("terrain-type-id");
    addListenerToElement(this.nextStep, onSave, "click");
  }
  getBoard() {
    return this.board;
  }
  doSave() {
    this.serialize();
  }
  serialize() {
    //Gather up all the persistent data in a table
    var data = {
      table: []
    };
    //Gather basic game settings	
    //data.table.push({ size : this.getGameScale()});
    //Write out the current state
    //this.state.serialize(data);
    //this.stateMachine.serialize(data);
    //Get all the units owned by the game 
    //data.table.push({ units:[]});
    //for(i=0; i<this.getGamePieces().length; i++){
    //	this.getGamePieces()[i].serialize(data.table[2].units);
    //}
    //Play region specific seriialization
    //for(var i=0; i<this.playRegions.length; i++){
    //	this.playRegions[i].serialize(data); 
    //}
    this.board.serialize(data);
    serialize(data);
  }
  getTerrainBrush() {
    var terrainSelector = document.getElementsByName("terrain-type");
    var value = terrainSelector[0].value;
/*
    for (var i = 0, length = radios.length; i < length; i++) {
      if (radios[i].checked) {
        // do whatever you want with the checked radio
        value = radios[i].value;
        //alert(radios[i].value);
        // only one radio can be logically checked, don't check the rest
        break;
      }
    }
*/    
    switch (value) {
      case "Forest":
        return TERRAIN.FOREST;
      case "Clearing":
        return TERRAIN.CLEARING;
      case "Mountain":
        return TERRAIN.MOUNTAIN;
      case "Town":
        return TERRAIN.TOWN;
      case "Fortification":
        return TERRAIN.FORTIFICATION;
      case "Sea":
        return TERRAIN.SEA;
      case "Low Hill":
        return TERRAIN.HILL_L;
      case "Medium Hill":
        return TERRAIN.HILL_M;
      case "High Hill":
        return TERRAIN.HILL_H;
      case "Road":
        return TERRAIN.ROAD;
      case "River":
        return TERRAIN.RIVER;
      case "Marsh":
        return TERRAIN.MARSH;
      case "Desert":
        return TERRAIN.DESERT;
    }
    return TERRAIN.NONE;
  }
}

export {BSBoardCreator, BSBoardCreatorSingleton}


