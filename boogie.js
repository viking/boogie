var sys = require('sys');
var http = require('http');
var Mu = require('./vendor/Mu/lib/mu');
require.paths.unshift('vendor/mongoose');
var mongoose = require('mongoose').Mongoose;

/* Mu setup */
Mu.templateRoot = './views';

/* Mongoose setup */
mongoose.model('Game', {
  properties: [ { board: [] }, { words: [] } ]
});
var db = mongoose.connect('mongodb://localhost/boogie');
var Game = db.model('Game');

/* Game parameters */
var cubes = [
  ['a', 'a', 'c', 'i', 'o', 't'],
  ['d', 'e', 'n', 'o', 's', 'w'],
  ['a', 'b', 'i', 'l', 't', 'y'],
  ['d', 'k', 'n', 'o', 't', 'u'],
  ['a', 'b', 'j', 'm', 'o', 'q'],
  ['e', 'e', 'f', 'h', 'i', 'y'],
  ['a', 'c', 'd', 'e', 'm', 'p'],
  ['e', 'g', 'i', 'n', 't', 'v'],
  ['a', 'c', 'e', 'l', 's', 'r'],
  ['e', 'g', 'k', 'l', 'u', 'y'],
  ['a', 'd', 'e', 'n', 'v', 'z'],
  ['e', 'h', 'i', 'n', 'p', 's'],
  ['a', 'h', 'm', 'o', 'r', 's'],
  ['e', 'l', 'p', 's', 't', 'u'],
  ['b', 'f', 'i', 'o', 'r', 'x'],
  ['g', 'i', 'l', 'r', 'u', 'w']
];
function randomize() {
  return Math.random();
}
function discover(board, which, pos, word, dict, results) {
  if (which[pos]) {
    // already been here
    return;
  }
  which[pos] = true;

  var l = board[pos];
  if (dict.leaves && dict.leaves.indexOf(l) >= 0)
    results.push(word + l);

  if (typeof(dict[l]) == 'undefined')
    // no possible words
    return;

  var w = word + l;
  var d = dict[l];
  var col = pos % 4;
  var row = pos / 4;
  if (row != 0)
    discover(board, which, pos-4, w, d, results);
  if (col != 0)
    discover(board, which, pos-1, w, d, results);
  if (col != 3)
    discover(board, which, pos+1, w, d, results);
  if (row != 3)
    discover(board, which, pos+4, w, d, results);
}
var dict = require('./lib/dictionary').dictionary;

/* Main server */
http.createServer(function(request, response) {
  switch(request.url) {
  case '/':
    var game = new Game();
    game.board = [];
    cubes.sort(randomize);
    for (var i = 0; i < 16; i++) {
      var index = Math.floor(Math.random() * 6);
      game.board.push(cubes[i][index]);
    }

    /* discover all words */
    for (var i = 0; i < 16; i++) {
      var which = new Array(16);
      discover(game.board, which, i, '', dict, game.words);
    }
    var ctx = {
      board: function() {
        var result = '';
        for (var i = 0; i < 16; i++) {
          result += "<div>" + game.board[i] + "</div>";
        }
        return result;
      },
      words: function() {
        var result = '';
        for (var i = 0; i < game.words.length; i++) {
          result += "<div>" + game.words[i] + "</div>";
        }
        return result;
      }
    };
    //game.save(function() {
      response.writeHead(200, {'Content-Type': 'text/html'});
      Mu.render('boogie.html', ctx, {}, function(err, output) {
        if (err) throw err;
        output.addListener('data', function(x) { response.write(x); });
        output.addListener('end', function() { response.end(); });
      })
    //});
  }
}).listen(37234);
