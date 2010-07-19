var sys  = require('sys');
var path = require('path');
var url  = require('url');
var fs   = require('fs');
var http = require('http');
var Mu   = require('./../vendor/Mu/lib/mu');
var Game = require('./game').Game;
Mu.templateRoot = __dirname + '/../views';

exports.server = http.createServer(function(request, response) {
  var md;
  var game;
  var rurl = url.parse(request.url, true)
  if (rurl.pathname == "/") {
    game = new Game();
    game.save(function() {
      var ctx = { board: JSON.stringify(game.board), id: game._id.toHexString() };
      response.writeHead(200, {'Content-Type': 'text/html'});
      Mu.render('boogie.html', ctx, {cached: false}, function(err, output) {
        if (err) throw err;
        output.addListener('data', function(x) { response.write(x); });
        output.addListener('end', function() { response.end(); });
      })
    });
  }
  else if (md = rurl.pathname.match(/^\/games\/([0-9a-f]+)\/guesses$/)) {
    Game.findById(md[1], function(game) {
      if (game) {
        var val, result;
        response.writeHead(200, {'Content-Type': 'application/json'});
        if (rurl.query.guess && (val = rurl.query.guess.value)) {
          var found = false;
          for (var i = 0; i < game.words.length; i++) {
            if (game.words[i].word != val)
              continue;

            found = true;
            if (game.words[i].guessed) {
              // already guessed
              response.end(JSON.stringify({ status: 'taken', word: val }));
            }
            else {
              game.words[i].guessed = true;
              game.save(function() {
                response.end(JSON.stringify({ status: 'success', word: val }));
              });
            }
            break;
          }
          if (!found)
            response.end(JSON.stringify({ status: 'invalid', word: val }));
        }
        else {
          response.end(JSON.stringify({ status: 'invalid' }));
        }
      }
      else {
        response.writeHead(404);
        response.end();
      }
    });
  }
  else {
    // try to serve a public file
    var file = __dirname + "/../public/" + rurl.pathname;
    path.exists(file, function(exists) {
      if (!exists) {
        response.writeHead(404);
        response.end("Not found: " + sys.inspect(request.url));
      }
      else {
        response.writeHead(200, { 'Content-Type': 'text/javascript' });
        fs.readFile(file, function(err, data) {
          response.end(data);
        });
      }
    });
  }
});
