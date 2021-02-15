/* eslint-disable no-var */
/**
 *
 */

import { UnitFactorySingleton, BSUnitFactory } from './Units.js'
import { UNIT } from './Constants'


//2d point class
class Point2d {
  constructor(X, Y) {
    this.x = X;
    this.y = Y;
  }
  getX() { return this.x; }
  getY() { return this.y; }
  setPos(x, y) { this.x = x; this.y = y; }
  setX(x) { this.x = x; }
  setY(y) { this.y = y; }
  isEqual(x, y) {
    if ((this.x == x) && (this.y == y))
      return true;
    return false;
  }
  translate(dx, dy) { this.x += dx; this.y += dy; }
}
function debugAlert(str, isDebug) {
  if (isDebug == true)
    window.alert(str);
}

//Reduce carpal tunnel syndrome
var D = function () { debugger; };

//Thin wrapper around adding event listner to an element
function addListenerToElement(element, callback, type) {
  element.addEventListener(type, callback, false);
}

//Get random integer between min and max inclusive
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max + 1 - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function inside(ptToTest, poly) {
  // ray-casting algorithm based on
  // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

  var x = ptToTest.getX(), y = ptToTest.getY();

  var inside = false;
  for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    var xi = poly[i].getX(), yi = poly[i].getY();
    var xj = poly[j].getX(), yj = poly[j].getY();

    var intersect = ((yi > y) != (yj > y))
			&& (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  return inside;
};

function colinear( start, mid, end ){
  let rise1 = end.getY() - mid.getY();
  let rise2 = end.getY() - start.getY();

  if( rise1 != rise2)
    return false;


  return true;
}
//var fs = require('fs');
function serialize(data) {
  //var file = new File([""], "myfile.json");
  //var writer = new FileWriter();
  //file.open("w");
  var json = JSON.stringify(data);
  //file.writeln(json);
  //file.close();
  //fs.writeFile('myfile.json', json)
  console.log(json);
}
//Helper function to establish the derived-base inheritance relationship
function establishInheritance(derived, base) {

  //Set the prototype to the base class prototype. After this is done any virtual methods
  //that need to be overwritten will be done as follows:
  //derived.prototype.method = function{}
  //If not, then the base method will be called because of the relationship we establish here
  derived.prototype = Object.create(base.prototype);
  //OVerwriting the prototype with the base class prototype resets the constructor to the base clase constructor
  //so need to reset it to the derived class. This is needed because we want to use the constructor property.
  derived.prototype.constructor = derived;

}


//Scale an image to fit the box specified by upper left and lower right corners
function scaleImage(img, ul, lr) {
  var xdim = lr.getX() - ul.getX();
  var ydim = lr.getY() - ul.getY();
  var yimg = img.height;
  var ximg = img.width;
  var scaleFactor = ximg / xdim;
  if (yimg / ydim > ximg / xdim) {
    scaleFactor = yimg / ydim;

  }
  img.height /= scaleFactor;
  img.width / - scaleFactor;
  return img;
}

function addToFrontOfArray(v, el) {
  return v.unshift(el);
}

var HexListener = {
  mTimer: null,
  mMonitoredHex: null,
  monitorHex: function (hex, callback, delay, context) {
    //if( hex == this.mMonitoredHex)	
    //return;
    //else
    this.mMonitoredHex = hex;
    if (this.mTimer != null) {
      clearTimeout(this.mTimer);
      this.mTimer = null;
    }
    if (this.mTimer == null) {
      this.mTimer = setTimeout(callback, delay, context, this.mMonitoredHex);
    }
  },
  unMonitorHex: function () {
    if (this.mTimer != null) {
      clearTimeout(this.mTimer);
      this.mTimer = null;
    }
    this.monitoredHex = null;
  }
}

//Listener for a hover event
var HoverListener = {
  addElem: function (elem, callback, delay) {
    if (delay === undefined) {
      delay = 1000;
    }
    var hoverTimer;
    //Watch for a mouseover to start the timer
    addEvent(elem, 'mouseover', function () {
      console.log("start timer");
      hoverTimer = setTimeout(callback, delay);
    });
    //End the timer on mouse out
    addEvent(elem, 'mouseout', function () {
      console.log("clear timer");
      clearTimeout(hoverTimer);
    });
  }
}

function tester() {
  alert('hi');
}
//  Generic event abstractor
function addEvent(obj, evt, fn) {
  if ('undefined' != typeof obj.addEventListener) {
    obj.addEventListener(evt, fn, false);
  }
  else if ('undefined' != typeof obj.attachEvent) {
    obj.attachEvent("on" + evt, fn);
  }
}



/*
addEvent( window, 'load', function()
{
  HoverListener.addElem(
      document.getElementById( 'test' )
    , tester 
  );
  HoverListener.addElem(
      document.getElementById( 'test2' )
    , function()
      {
        alert( 'Hello World!' );
      }
    , 2300
  );
} );
*/

//Utilities for caching and retrieving values of elements between HTML pages
function cacheKeyByElement(element, key) {
  var value = document.getElementById(element).value;
  window.localStorage.setItem(key, value);

}
function cacheKeyByValue(value, key) {
  window.localStorage.setItem(key, value);

}
function retrieveElementByKey(key) {
  var val = window.localStorage.getItem(key);
  return val;
}

//const UnitModule = require('./Units');

 function createUnit() {
  var data = {
    table: []
  }
  //data.table.push({ units:[]});

  //var factory = UnitModule.UnitFactorySingleton.getInstance();
  var factory = UnitFactorySingleton.getInstance();
  var unit = factory.createUnit(UNIT.CUSTOM);
  unit.init(-1, -1);

  unit.owningPlayer = 1;
  unit.imageTag = document.getElementById("image_chooser").files[0].name;
  unit.typeTag = document.getElementById("unitTypeId").value;
  unit.attackFactor = document.getElementById("attackFactorId").value;
  unit.defenseFactor = document.getElementById("defenseFactorId").value;
  unit.movementFactor = document.getElementById("movementFactorId").value;
  unit.range = document.getElementById("rangeId").value;
  var splittable = document.getElementById("splittableId").value;
  unit.splittable = splittable == "Yes" ? true : false;
  var era = document.getElementById("unit_era").value;
  unit.era = era;
  var exertsZOC = document.getElementById("zone-of-control").value;
  unit.ZOC = exertsZOC == "Yes" ? true : false;
  unit.role = document.getElementById("unit_role").value;
  unit.shape = document.getElementById("unit_shape").value;
  //Create a unit based on the data
  unit.serialize(data.table);
  let filename = document.getElementById("unitTypeId").value;
  filename += ".json";

  //serialize(data.table[0]);
  let json = JSON.stringify(data.table[0]);
  console.log(json);
  /*
  let port = "http://localhost:8082";
  let folder = "/units/";
  let storagepath = port + folder;

  var xhr = new XMLHttpRequest();
  xhr.overrideMimeType("application/json");
  xhr.open('POST', storagepath, true);
  xhr.onload = function () {
      // do something to response
      console.log(this.responseText);
  };
  xhr.send(filename);
*/
 
}
/*
writeJSON(jsonFile, context, function(jsonFile, context){
  var rawFile = new XMLHttpRequest();
  rawFile.overrideMimeType("application/json");
  rawFile.open("PUT", file, true);
  rawFile.send();

  rawFile.onreadystatechange = function() {
    if (rawFile.readyState === 4 ){//}&& rawFile.status == "200") {
      callback(rawFile.responseText, context);
    }
  }
  rawFile.send(null);
}) 
{
}
*/
//export default createUnit;

//export {addListenerToElement}

export { colinear, createUnit, cacheKeyByElement, cacheKeyByValue, retrieveElementByKey, addEvent, HoverListener, Point2d, debugAlert, addListenerToElement, getRandomInt, inside, serialize, scaleImage, addToFrontOfArray, HexListener}
//import { createUnit, cacheKeyByElement, cacheKeyByValue, retrieveElementByKey, addEvent, HoverListener, Point2d, debugAlert, addListenerToElement, getRandomInt, inside, serialize, scaleImage, addToFrontOfArray, HexListener} from './GeneralUtilities'
//import { createUnit, cacheKeyByElement, cacheKeyByValue, retrieveElementByKey, addEvent, HoverListener, Point2d, debugAlert, addListenerToElement, getRandomInt, inside, serialize, scaleImage, addToFrontOfArray, HexListener} from '../../game-js/GeneralUtilities.js'
