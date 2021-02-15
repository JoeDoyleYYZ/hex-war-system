/**
 *
 */
//
//Start State
//
//
//State machine to manage states
//

import {    BSStart,
			BSPlayer1Setup,
			BSPlayer2Setup,
			BSPlayer1Move,
			BSPlayer2Move,
			BSPlayer1Combat,
			BSPlayer2Combat,
			BSNewTurnState } from './ChildStates.js'

import { STATE } from './Constants.js'

export default class BSStateMachine {
	constructor(controller) {
		this.controller = controller;
		this.state = new BSStart(this);
		this.turnCount = 0;
		this.nextState = function () {
			this.state.changeState();
		};
		this.changeState = function (newState) {
			this.state = newState;
			this.state.activate();
		};
		this.start = function () {
			state.changeState();
		};
		this.getController = function () { return this.controller; };
		this.getState = function () { return this.state; };
		this.incrementTurn = function () { this.turnCount++; };
		this.serialize = function (data) {
			data.table.push({ turn: this.turnCount, phase: this.state.identity() });
		};
		this.stateFromId = function (id) {
			switch (id) {
				case STATE.BEGIN:
					return new BSStart(this);
				case STATE.PLAYER_1_SETUP:
					return new BSPlayer1Setup(this);
				case STATE.PLAYER_2_SETUP:
					return new BSPlayer2Setup(this);
				case STATE.PLAYER_1_MOVE:
					return new BSPlayer1Move(this);
				case STATE.PLAYER_1_COMBAT:
					return new BSPlayer1Combat(this);
				case STATE.PLAYER_2_MOVE:
					return new BSPlayer2Move(this);
				case STATE.PLAYER_2_COMBAT:
					return new BSPlayer2Combat(this);
				case STATE.END_TURN:
				default:
					return new BSNewTurnState(this);
			}
		};
		this.deserialize = function (data) {
			this.turnCount = data.turn;
			var idState = data.phase;
			//Activate new state object based on phase
			this.changeState(this.stateFromId(idState));
		};
		this.getPhase = function () { return this.state.identity(); };
		this.gameStarted = function () { return this.turnCount > 0; };
		this.incrementTurn = function () { this.turnCount++; };
		this.gameState = function () { return this.getPhase(); };
		//this.setState = function(state){ alert("ERROR: Someone trying to set the state explicitly"); }
		this.getTurnCount = function () { return this.turnCount; };
	}
}

