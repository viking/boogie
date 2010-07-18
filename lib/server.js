var sys = require('sys');
var path = require('path');
var fs = require('fs');
var http = require('http');
var Mu = require('./../vendor/Mu/lib/mu');
var Game = require('./game').Game;
Mu.templateRoot = __dirname + '/../views';

exports.server = http.createServer(function(request, response) {
  switch(request.url) {
  case '/':
    var game = new Game();
    game.save(function() {
      var ctx = { board: JSON.stringify(game.board) };
      response.writeHead(200, {'Content-Type': 'text/html'});
      Mu.render('boogie.html', ctx, {}, function(err, output) {
        if (err) throw err;
        output.addListener('data', function(x) { response.write(x); });
        output.addListener('end', function() { response.end(); });
      })
    });
    break;
  default:
    // try to serve a public file
    var file = __dirname + "/../public/" + request.url;
    path.exists(file, function(exists) {
      if (!exists) {
        response.writeHead(404);
        response.end();
      }
      else {
        response.writeHead(200, { 'Content-Type': 'text/javascript' });
        fs.readFile(file, function(err, data) {
          response.end(data);
        });
      }
    });
    break;
  }
});
