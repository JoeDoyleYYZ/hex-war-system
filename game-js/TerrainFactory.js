//Terrain module
//

import {    BSFortification, 
            BSRoad, 
            BSForest, 
            BSMountain, 
            BSTown, 
            BSClearing, 
            BSNullTerrain,  
            BSSea, 
            BSHill,
            BSDesert} from './Terrain'
import {    TERRAIN  } from './Constants.js'
    


var ForestSingleton = (function () {
    var instance = null;
    function createInstance() {
        var forest = new BSForest();
        return forest;
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
var MountainSingleton = (function () {
    var instance = null;
    function createInstance() {
        var mtn = new BSMountain();
        return mtn;
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
var TownSingleton = (function () {
    var instance = null;
    function createInstance() {
        var town = new BSTown();
        return town;
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
var ClearingSingleton = (function () {
    var instance = null;
    function createInstance() {
        var clr = new BSClearing();
        return clr;
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
var FortificationSingleton = (function () {
    var instance = null;
    function createInstance() {
        var clr = new BSFortification();
        return clr;
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
var SeaSingleton = (function () {
    var instance = null;
    function createInstance() {
        var clr = new BSSea();
        return clr;
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
var NoTerrainSingleton = (function () {
    var instance = null;
    function createInstance() {
        var clr = new BSNullTerrain();
        return clr;
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
var LowHillSingleton = (function () {
    var instance = null;
    function createInstance(terrain) {
        var clr = new BSHill(terrain);
        return clr;
    }

    return {
        getInstance: function (terrain) {
            if (!instance) {
                instance = createInstance(terrain);
            }
            return instance;
        }
    };
})();
var MedHillSingleton = (function () {
    var instance = null;
    function createInstance(terrain) {
        var clr = new BSHill(terrain);
        return clr;
    }

    return {
        getInstance: function (terrain) {
            if (!instance) {
                instance = createInstance(terrain);
            }
            return instance;
        }
    };
})();
var HighHillSingleton = (function () {
    var instance = null;
    function createInstance() {
        var clr = new BSHill();
        return clr;
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


export default function TerrainFactory(terrain) {
    var t = null;
    switch (terrain) {
        case TERRAIN.FOREST:
            {
                t = ForestSingleton.getInstance();//new BSForest();
            }
            break;
        case TERRAIN.MOUNTAIN:
            {
                t = MountainSingleton.getInstance();
            }
            break;
        case TERRAIN.TOWN:
            {
                t = TownSingleton.getInstance();
            }
            break;
        case TERRAIN.FORTIFICATION:
            {
                t = FortificationSingleton.getInstance();
            }
            break;
        case TERRAIN.SEA:
        	{
				t = SeaSingleton.getInstance();
        	}
        	break;
        case TERRAIN.CLEARING:
            {
                t = ClearingSingleton.getInstance();
            }
            break;
		case TERRAIN.HILL_L:
			{
				t = LowHillSingleton.getInstance();
				t.elev = 25;
			}
			break;            
		case TERRAIN.HILL_M:
			{
				t = MedHillSingleton.getInstance();
				t.elev = 50;
			}
			break;            
		case TERRAIN.HILL_H:
			{
				t = HighHillSingleton.getInstance();
				t.elev = 75;
			}
			break;            
        case TERRAIN.ROAD:
			{
				t = new BSRoad();
			}
			break;            
        case TERRAIN.DESERT:
            {
                t = new BSDesert();
            }
            break;            
        default:
        	{
        		t = NoTerrainSingleton.getInstance();
        	}
        	break;
    }
    return t;
}


