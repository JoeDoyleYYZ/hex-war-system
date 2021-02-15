
import {BSGame, GameSingleton} from "./GameBase.js"
import {RMB_DOWN, RMB_UP} from './Constants'

//Event handlers. Ideally we would pass in the BSBoard's event handlers when creating listeners but haven't figured out how to do that. So, have to create 
//these global handlers which route the message through the game Singleton
function onMouseMove(e){
	//debugger;
	var target = GameSingleton.getInstance().findTargetRegionFromId(e.currentTarget.id);
	if(target == null){
		debugger;
		return;
	}
	target.onMouseMove(e);
}
function onMouseEnter(e){
	//debugger;
	var target = GameSingleton.getInstance().findTargetRegionFromId(e.currentTarget.id);
	if(target == null){
		debugger;
		return;
	}
	target.onMouseEnter(e);
}
function onMouseExit(e){
	var target = GameSingleton.getInstance().findTargetRegionFromId(e.currentTarget.id);
	if(target == null){
		debugger;
		return;
	}
	target.onMouseExit(e);
}
function onContextMenu(e){
	var target = GameSingleton.getInstance().findTargetRegionFromId(e.currentTarget.id);
	if(target == null){
		debugger;
		return;
	}
	target.onContextMenu(e);
}
function onMouseDown(e){
//debugger;
	//Identify the target region for the mouse action
	var target = GameSingleton.getInstance().findTargetRegionFromId(e.currentTarget.id);
	if(target == null){
		debugger;
		return;
	}
	if(e.which === RMB_DOWN)
		target.onRMBDown(e);
	else
		target.onLMBDown(e);
}


function onMouseUp(e){
//debugger;
	//Identify the target region for the mouse action
	var target = GameSingleton.getInstance().findTargetRegionFromId(e.currentTarget.id);
	if(target == null){
		debugger;
		return;
	}
	if(e.which === RMB_UP){
		target.onRMBUp(e);
	}
	else
		target.onLMBUp(e);
}


export {onMouseMove,onMouseEnter,onMouseExit,onContextMenu,onMouseDown,onMouseUp}
