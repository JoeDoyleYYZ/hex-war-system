
import BSStateBase from './StateBase.js'
import {    STATE, 
            STATE_DESCRIPTOR,
            PLAYER } from './Constants.js'

class BSStart extends BSStateBase{
	constructor(context) {
		super(context);
	}
	_activate(ctx) {
	}
	_changeState() {
		this.ctx.changeState(new BSNewTurnState(this.ctx));
	}
	_identity() { return STATE.BEGIN; }
	_label() { return STATE_DESCRIPTOR.BEGIN; }
}

//
//Player 1 Setup State
//
class BSPlayer1Setup extends BSStateBase{
    constructor(context) {
		super(context);
    }
    _activate(ctx) {
        if (this.ctx.getController().hasUnitsToDeploy(PLAYER.ONE))
            this.ctx.getController().openTray(PLAYER.ONE);
        else
            this._changeState();
    }
    _changeState() {
        this.ctx.getController().closeTray(PLAYER.ONE);
        this.ctx.changeState(new BSPlayer2Setup(this.ctx));
    }
    _identity() { return STATE.PLAYER_1_SETUP; }
    _label() { return STATE_DESCRIPTOR.PLAYER_1_SETUP; }
}

//
//Player 2 Setup State
//
class BSPlayer2Setup  extends BSStateBase{
    constructor(context) {
		super(context);
    }
    _activate(ctx) {
        if (this.ctx.getController().hasUnitsToDeploy(PLAYER.TWO))
            this.ctx.getController().openTray(PLAYER.TWO);
        else
            this._changeState();
    }
    _changeState() {
        this.ctx.getController().closeTray(PLAYER.TWO);
        this.ctx.changeState(new BSPlayer1Move(this.ctx));
    }
    _identity() { return STATE.PLAYER_2_SETUP; }
    _label() { return STATE_DESCRIPTOR.PLAYER_2_SETUP; }
}

//
//Player 1 Movement State
//
class BSPlayer1Move  extends BSStateBase{
    constructor(context) {
		super(context);
    }
    _activate(ctx) {
        this.ctx.getController().adjustUI();
        this.ctx.getController().setZOCs(PLAYER.TWO);
    }
    _changeState() {
        //Remove ZOCs before switching state 
        this.ctx.getController().resetAfterPlayerTurn();
        this.ctx.changeState(new BSPlayer1Combat(this.ctx));
    }
    _identity() { return STATE.PLAYER_1_MOVE; }
    _label() { return STATE_DESCRIPTOR.PLAYER_1_MOVE; }
}

//
//Player 1 Combat State
//
class BSPlayer1Combat  extends BSStateBase{
    constructor(context) {
		super(context);
    }
    _activate(ctx) {
        this.ctx.getController().adjustUI();
    }
    _changeState() {
        this.ctx.getController().removeTheDead();
        this.ctx.changeState(new BSPlayer2Move(this.ctx));
    }
    _identity() { return STATE.PLAYER_1_COMBAT; }
    _label() { return STATE_DESCRIPTOR.PLAYER_1_COMBAT; }
}

//
//Player 2 Movement State
//
class BSPlayer2Move  extends BSStateBase{
    constructor(context) {
		super(context);
    }
    _activate(ctx) {
        this.ctx.getController().adjustUI();
        //Add ZOCs
        this.ctx.getController().setZOCs(PLAYER.ONE);
    }
    _changeState() {
        //Remove ZOCs
        this.ctx.getController().resetAfterPlayerTurn();
        this.ctx.changeState(new BSPlayer2Combat(this.ctx));
    }
    _identity() { return STATE.PLAYER_2_MOVE; }
    _label() { return STATE_DESCRIPTOR.PLAYER_2_MOVE; }
}

//
//Player 2 Combat State
//
class BSPlayer2Combat  extends BSStateBase{
    constructor(context) {
		super(context);
    }
    _activate(ctx) {
        this.ctx.getController().adjustUI();
    }
    _changeState() {
        this.ctx.getController().removeTheDead();
        this.ctx.changeState(new BSNewTurnState(this.ctx));
    }
    _identity() { return STATE.PLAYER_2_COMBAT; }
    _label() { return STATE_DESCRIPTOR.PLAYER_2_COMBAT; }
}

//
//New Turn State: does end of turn cleanup and then returns to the start of the cycle (player1Move)
//
class BSNewTurnState  extends BSStateBase{
    constructor(context) {
		super(context);
    }
    _activate(ctx) {
        this.ctx.getController().adjustUI();
        this.ctx.getController().resetForNewTurn();
        this.ctx.incrementTurn();
        //Once done end of turn activity move onto the next state
        this.ctx.nextState();
    }
    _changeState() {
        this.ctx.changeState(new BSPlayer1Setup(this.ctx));
    }
    _identity() { return STATE.END_TURN; }
    _label() { return STATE_DESCRIPTOR.END_TURN; }
}


export {    BSStart,
            BSPlayer1Setup,
            BSPlayer2Setup,
            BSPlayer1Move,
            BSPlayer2Move,
            BSPlayer1Combat,
            BSPlayer2Combat,
            BSNewTurnState }
