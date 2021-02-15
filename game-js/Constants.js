/**
 * 
 */

var SIN_OF_60 = 0.866;
var COS_OF_60 = 0.5;
var COS_OF_30 = 0.866;
var SIN_OF_30 = 0.5;

var RMB_DOWN = 3, RMB_UP = 3;
var CHIT_SPACING = 1.5;//Spacing between chits in an array
var BOARD_BGRD = "#758d91";
var CHIT_TRAY1_BGRD = "#b63dc6";
var CHIT_TRAY2_BGRD = "#c6763d";
var HOT_SEAT_MODE = 1;
var AI_MODE = 2;
var UNITS_PER_SIDE = 25;
var PLAYER1_COLOR = "#28a1b7";
var PLAYER2_COLOR = "#28b755";
var DICE_SIDES = 6;
var DIALOG_BACKGROUND = "http://localhost:8082/images/linen.jpg";
var BOARD_SIZE_KEY = "BoardSize";
var BG_IMG_KEY = "BGImage";

//State phases
let STATE = {
    ASSIGN_TERRAIN : -1,
    BEGIN : 0,
    PLAYER_1_SETUP : 1,
    PLAYER_2_SETUP : 2,
    START_GAME : 3,
    START_TURN : 4,
    PLAYER_1_MOVE : 5,
    PLAYER_1_COMBAT : 6,
    PLAYER_2_MOVE : 7,
    PLAYER_2_COMBAT : 8,
    END_TURN : 9
}
;let STATE_DESCRIPTOR = {
    ASSIGN_TERRAIN : " Assign Terrain",
    BEGIN : "Begin",
    PLAYER_1_SETUP : "Player 1 Setup",
    PLAYER_2_SETUP : "Player 2 Setup",
    START_GAME: "Start Game",
    START_TURN : "Start Turn",
    PLAYER_1_MOVE : "Player 1 Move",
    PLAYER_1_COMBAT : "Player 1 Combat",
    PLAYER_2_MOVE : "Player 2 Move",
    PLAYER_2_COMBAT : "Player 2 Combat",
    END_TURN : "Next Turn"
};

var STATE_PREFIX = "Current Phase: ";
let COLORS = {
    INFO_WINDOW: "#67d7db",
    UNIT_ALERT: "#ff3300",
}

//Terrain types
let TERRAIN = {
    NONE: 0,
    FOREST : 1,
    ROAD : 2,
    CLEARING : 3,
    MOUNTAIN : 4,
    RIVER : 5,
    TOWN : 6,
    FORTIFICATION : 7,
    MARSH : 8,
    HILL_L : 9,
    HILL_M : 10,
    HILL_H : 11,
    DESERT: 12
}
let NOTIFICATIONS = {
    INVALID_IMPROVEMENT: "Invalid Improvement",
}
let TERRAIN_DESCRIPTOR = {
    NONE: "No Terrain",
    FOREST : "Forest",
    ROAD : "Road",
    CLEARING : "Clearing",
    MOUNTAIN : "Mountain",
    RIVER : "River",
    TOWN : "Town",
    FORTIFICATION : "Fortification",
    HILL_L : "Low Hill",
    HILL_M : "Medium Hill",
    HILL_H : "High Hill",
    MARSH : "Marsh",
    SEA : "Sea",
    DESERT: "Desert"
}
//Terrain costs
let COST = {
    NONE: 1000,
    FOREST : 2,
    ROAD : .5,
    CLEARING : 1,
    MOUNTAIN : 2,
    RIVER : 2,
    TOWN : 1,
    FORTIFICATION: 1,
    HILL : 1.5, 
    MARSH : 2,
    SEA : 1000,
    IMPASSABLE : 1000,
    DESERT: 1
}
//Terrain Colors
let TERRAIN_COLORS_NO_EMPHASIS = {
    NONE: "#eb1010",
    FOREST : "#156124",
    CLEARING : "#c1b8a2",
    MOUNTAIN : "#524008",
    TOWN : "#ff930f",
    SEA : "#3021d1",
    DESERT: "#e0eb10"
}
let TERRAIN_COLORS_EMPHASIS = {
    FOREST : "DarkGrey",
    CLEARING : "DarkGrey",
    MOUNTAIN : "DarkGrey",
    TOWN : "DarkGrey",
    SEA : "Blue",
    DESERT: "Yellow"
}
let TERRAIN_FLAGS = {
    FOREST :        0b0000000000000001,
    ROAD :          0b0000000000000010,
    CLEARING :      0b0000000000000100,
    MOUNTAIN :      0b0000000000001000,
    RIVER :         0b0000000000010000,
    TOWN :          0b0000000000100000,
    FORTIFICATION:  0b0000000001000000,
    HILL :          0b0000000010000000, 
    MARSH :         0b0000000100000000,
    SEA :           0b0000001000000000,
    DESERT:         0b0000010000000000,
    IMPASSABLE :    0,
}
//Terrain imagery
let NORMAL_IMAGE = {
    NONE: "",
    FOREST : "http://localhost:8082/images/forest.jpg",
    ROAD : "",
    CLEARING : "",
    MOUNTAIN : "http://localhost:8082/images/mountain2.jpg",
    RIVER : "",
    TOWN : "http://localhost:8082/images/city.jpg",
    FORTIFICATION: "http://localhost:8082/images/fortification.jpg",
    HILL : "", 
    MARSH : "",
    SEA : "",
    DESERT: ""
}
let SELECTED_IMAGE = {
    NONE: "",
    FOREST : "http://localhost:8082/images/forest_bw.jpg",
    ROAD : "",
    CLEARING : "",
    MOUNTAIN : "http://localhost:8082/images/mountain_bw.jpg",
    RIVER : "",
    TOWN : "",
    FORTIFICATION: "http://localhost:8082/images/fortification.jpg",
    HILL : "", 
    MARSH : "",
    SEA : "",
    DESERT: "",
}


let UNIT = {
    INFANTRY : "Infantry",
    CAVALRY : "Cavalry",
    ARTILLERY : "Artillery",
    BOMBER : "Bomber",
    LEADER : "Leader",
    CUSTOM : "Custom"
}
//Enumerate the unit era to properly weight units of different eras
let UNIT_ERA_ID = {
    ANCIENT: 1,
    CLASSIC: 2, 
    MEDIEVAL: 3,
    INDUSTRIAL: 4, 
    MODERN: 5, 
    POST_MODERN: 6
}
let UNIT_ROLE = {
    LEADER: "leader",
    COMBAT_UNIT: "combat_unit",
    SUPPLY_UNIT: "supply_unit",
    FIXED_UNIT: "fixed_unit"
}
let PLAYER = {
    ONE : 1,
    TWO : 2
};
let PLAYER_IDENT = {
    PLAYER_ONE : "Player One",
    PLAYER_TWO: "Player Two"
}

var A_ELIM = 0;
var D_ELIM = 1;
var EXCHANGE = 2;
var A_DAMAGED = 3;
var D_DAMAGED = 4;
var NO_EFFECT = 5;


let BOARD_SIZE_TAG = {
    TINY : "Tiny",
    SMALL : "Small",
    MED : "Medium",
    LARGE : "Large",
    XLARGE : "Extra Large",
    GIGANTIC : "Gigantic"
}
let BOARD_SIZE = {
    TINY: [15,10],
    SMALL: [25,15],
    MED: [40,20],
    LARGE: [50,30],
    XLARGE: [75,50],
    GIGANTIC : [100, 60]
}

let DEFAULT_BOARD_SIZE ={
    WIDTH: 1400,
    HEIGHT: 900
}
let PIECE_SIZE = {
    SMALL : 20,
    MED: 25,
    LARGE: 30,
    XLARGE : 35,
    XXLARGE: 50
};
let PIECE_SIZE_TAG = {
    SMALL : "Small",
    MED : "Medium",
    LARGE : "Large",
    XLARGE : "Extra Large",
    XXLARGE : "Extra-extra Large"
};
let UNIT_ERA = {
    PRE_HISTORIC: "Pre-Historic",
    CLASSICAL: "Classical",
    MEDIEVAL: "Medieval",
    INDUSTRIAL: "Industrial",
    EARLY_MODERN: "Early Modern",
    MODERN: "Modern",
    POST_MODERN_1: "Post-Modern 1",
    POST_MODERN_2: "Post-Modern 2",
    POST_MODERN_3: "Post-Modern 3",
};
let UNIT_SHAPE = {
    TRIANGLE: "triangle",
    SQUARE: "square",
    CIRCLE: "circle",
}

var BASIC_RESULTS_TABLE = [
[A_DAMAGED, A_DAMAGED, A_DAMAGED, A_DAMAGED, D_DAMAGED, D_DAMAGED, D_ELIM, D_ELIM, D_ELIM, D_ELIM, D_ELIM],
[A_ELIM, A_DAMAGED, A_DAMAGED, A_DAMAGED, EXCHANGE, EXCHANGE, EXCHANGE, EXCHANGE, EXCHANGE, D_DAMAGED, D_DAMAGED],
[A_ELIM, A_ELIM, A_DAMAGED, A_DAMAGED, A_DAMAGED, D_DAMAGED, D_DAMAGED, D_DAMAGED, D_DAMAGED, D_ELIM, D_ELIM],
[A_ELIM, A_ELIM, A_ELIM, A_DAMAGED, A_DAMAGED, D_DAMAGED, D_DAMAGED, D_DAMAGED, D_DAMAGED, D_DAMAGED, D_ELIM],
[A_ELIM, A_ELIM, A_ELIM, A_ELIM, A_ELIM, A_DAMAGED, EXCHANGE, EXCHANGE, D_ELIM, D_ELIM, D_ELIM],
[A_ELIM, A_ELIM, A_ELIM, A_ELIM, A_ELIM, A_ELIM,A_DAMAGED, D_ELIM, D_ELIM, D_ELIM, D_ELIM]
];



export {    DEFAULT_BOARD_SIZE, 
            SIN_OF_60, 
            COS_OF_60, 
            COS_OF_30, 
            SIN_OF_30,
            HOT_SEAT_MODE,
            PIECE_SIZE,
            CHIT_TRAY1_BGRD,
            UNIT,
            UNIT_ROLE,
            PLAYER,
            STATE, 
            STATE_DESCRIPTOR,
            RMB_DOWN,
            RMB_UP,
            CHIT_SPACING,
            PLAYER_IDENT,
            SELECTED_IMAGE,
            TERRAIN_FLAGS,
            TERRAIN_COLORS_NO_EMPHASIS,
            TERRAIN,
            COST,
            TERRAIN_DESCRIPTOR,
            NORMAL_IMAGE,
            PLAYER1_COLOR, 
            PLAYER2_COLOR, 
            UNIT_SHAPE,
            UNIT_ERA,
            BOARD_SIZE_TAG,
            BOARD_SIZE,
            BOARD_BGRD,
            COLORS, 
            DIALOG_BACKGROUND,
            DICE_SIDES,
            BASIC_RESULTS_TABLE,
            A_DAMAGED,
            D_DAMAGED,
            A_ELIM,
            D_ELIM,
            EXCHANGE,
            BOARD_SIZE_KEY,
            BG_IMG_KEY,
            NOTIFICATIONS
        }
