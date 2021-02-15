
import {  Point2d } from './GeneralUtilities'
import BSGameBoard from './GameBoard'
import {BSContextMenu,BSInfoWindow,BSUnitFlyout} from './UIWidgets'
import { BSGame, GameSingleton } from './GameBase'

//Context menu handlers
function onTerrainInfo(e, target) {
	console.log("onTerrainInfo");
	var x = e.offsetX;
	var y = e.offsetY;
	var pt = new Point2d(x, y);
	var onHex = target.centerOnHex(pt);

	//create a new info window
	if (onHex != null) {
		var strDisplay = onHex.getTerrain().getDescriptor();
		if(onHex.hasImprovements())
		{
			let improvements = onHex.getImprovements();
			strDisplay = improvements[0].getDescriptor();
		}
		//var moveCost = onHex.getTerrain().getMovementCost();
		//strDisplay += '\n\';
		if (onHex.isNoEntryAllowed())
			strDisplay += ('\n\Hex is impassable');
		else if (onHex.isStopOnEntry())
			strDisplay += ('\n\Unit must stop on entry');
		else
			strDisplay += ('\n\Move Cost: ' + onHex.getTerrain().getMovementCost());
		strDisplay += ('\n\Defense Factor: ' + onHex.getTerrain().getDefenseFactor());
		strDisplay += ('\n\Stack Limit: ' + onHex.getTerrain().getStackingLimit());

		var child = new BSInfoWindow(x, y, 100, 50, "#ffffff", strDisplay, target, false, 0);
		target.addWidget(child);
		child.draw(target.canvas.getContext("2d"), null);
	}
}

function onSelectAll(e, target) {
	console.log("onSelectAll");
	var x = e.offsetX;
	var y = e.offsetY;
	var pt = new Point2d(x, y);
	var onHex = target.centerOnHex(pt);
	var units = onHex.getUnitsOnHex();
	var theGame = GameSingleton.getInstance();
	for (var i = 0; i < units.length; i++) {
		theGame.getSelectionSet().addToSelection(units[i]);
	}
	theGame.activateSelection();
}


function onMoveStack(e, target) {
	console.log("onMoveStack");
	var x = e.offsetX;
	var y = e.offsetY;
	var pt = new Point2d(x, y);
	var onHex = target.centerOnHex(pt);
	var units = onHex.getUnitsOnHex();
	var theGame = GameSingleton.getInstance();
	//Add the stack to the selection set
	for (var i = 0; i < units.length; i++) {
		theGame.getSelectionSet().addToSelection(units[i]);
	}
	theGame.defaultActionOnStackSelection();

}


function onReorderUnits(e, newTop, target) {
	var x = e.offsetX;
	var y = e.offsetY;
	var pt = new Point2d(x, y);
	var onHex = target.centerOnHex(pt);
	if (onHex != null && onHex.getUnitsOnHex() != null && onHex.getUnitsOnHex().length > 1) {
		onHex.setTop(newTop);
	}
}

function onUnitsFlyout(e, target) {
	console.log("onUnitsFlyout");
	var x = e.offsetX;
	var y = e.offsetY;
	var pt = new Point2d(x, y);
	var onHex = target.centerOnHex(pt);

	//create a new info window
	if (onHex != null && onHex.getUnitsOnHex() != null && onHex.getUnitsOnHex().length > 1) {
		var child = new BSUnitFlyout(x, y, 100, 50, "#2133aa", onHex.getUnitsOnHex(), target, onReorderUnits);
		target.addWidget(child);
		child.draw(target.canvas.getContext("2d"), null);
	}
}

function onNextUnit(e, target) {
	console.log("onNext Unit");
	var x = e.offsetX;
	var y = e.offsetY;

	//First, center the event on the center of the hex
	var pt = new Point2d(x, y);
	var onHex = target.centerOnHex(pt);
	if (onHex != null)
		onHex.rotateUnits();
}


function onHelp(e, target) {
	console.log("onHelp");
}

function onZoomOut() {
	console.log("onZoomOut");
	var theGame = GameSingleton.getInstance();
	theGame.scaleGame(false);
}
function onZoomIn() {
	console.log("onZoomIn");
	var theGame = GameSingleton.getInstance();
	theGame.scaleGame(true);
}

function onSplitUnit(e, target) {
	console.log("onSplitUnit");
	var x = e.offsetX;
	var y = e.offsetY;

	//First, center the event on the center of the hex
	var pt = new Point2d(x, y);
	var onHex = target.centerOnHex(pt);
	if (onHex != null) {
		var unit = onHex.getTop();
		if (unit.canSplit())
			unit.doSplit();

		var theGame = GameSingleton.getInstance();
		theGame.invalidateRegionUnits();
	}
}

function onUnitDetails(e, target) {
	var x = e.offsetX;
	var y = e.offsetY;

	//First, center the event on the center of the hex
	var pt = new Point2d(x, y);
	var onHex = target.centerOnHex(pt);
	if (onHex != null) {
		var unit = onHex.getTop();
		if (unit != null) {
			var strDisplay = unit.getUnitTypeName();
			strDisplay += ('\n\Combat Factor: ' + unit.getAttackFactor());
			strDisplay += ('\n\Move Factor: ' + unit.getMovementCapacity());
			strDisplay += ('\nEra: ' + unit.era);

			var child = new BSInfoWindow(x, y, 100, 50, "#ffffff", strDisplay, target, false, 0);
			target.addWidget(child);
			child.draw(target.canvas.getContext("2d"), null);
		}
	}
}
function stopHoverAction(context) {


}

function onHover(context, onHex) {
	if (onHex != null) {
		var x = onHex.getOrigin().getX();
		var y = onHex.getOrigin().getY();
		if (onHex.getUnitsOnHex() != null) {

			if (onHex.getUnitsOnHex().length > 1) {
				var child = new BSUnitFlyout(x, y, 100, 50, "#2133aa", onHex.getUnitsOnHex(), context, onReorderUnits);
				context.addWidget(child);
				child.draw(context.canvas.getContext("2d"), null);
			}
			else {
				var unit = onHex.getTop();
				if (unit != null) {
					var strDisplay = unit.getUnitTypeName();
					strDisplay += ('\n\Combat Factor: ' + unit.getAttackFactor());
					strDisplay += ('\n\Move Factor: ' + unit.getMovementCapacity());
					strDisplay += ('\nEra: ' + unit.era);

					var child = new BSInfoWindow(x, y, 100, 50, "#ffffff", strDisplay, context, true, 1000);
					context.addWidget(child);
					child.draw(context.canvas.getContext("2d"), null);
				}
			}
		}
	}
}


export { onHover, onUnitDetails, onSplitUnit, onZoomIn, onZoomOut, onHelp, onNextUnit, onUnitsFlyout, onTerrainInfo, onSelectAll, onMoveStack, onReorderUnits}
//import { onHover, onUnitDetails, onSplitUnit, onZoomIn, onZoomOut, onHelp, onNextUnit, onUnitsFlyout, onTerrainInfo, onSelectAll, onMoveStack, onReorderUnits} from './GameBoardCtxMenuHandlers'
