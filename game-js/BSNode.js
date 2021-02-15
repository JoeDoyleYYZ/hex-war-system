var http = require("http");
var fs = require('fs');
var express = require('express');
var port = 8080;
var serverUrl = "127.0.0.1";
var counter = 0;
//var nStatic = require(\node-static');
//var fileServer = new nStatic.Server('./public');
var app = express();

var server = http.createServer(function(req, res) {

  counter++;
  console.log("Request: " + req.url + " (" + counter + ")");

  if(req.url == "/battlesim_test.html") {

    fs.readFile("battlesim_test.html", function(err, text){
app.use(express.static(__dirname +'public'));

      res.setHeader("Content-Type", "text/html");
      res.end(text);
    });

    return;

  }

  res.setHeader("Content-Type", "text/html");
  res.end("<p>Hello World. Request counter: " + counter + ".</p>");

});

console.log("Starting web server at " + serverUrl + ":" + port);
server.listen(port, serverUrl);