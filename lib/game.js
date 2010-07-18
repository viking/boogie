require.paths.unshift(__dirname+'/../vendor/mongoose');
var mongoose = require('mongoose').Mongoose;
var dict = require('./dictionary').dictionary;

/* letter cubes */
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
/* for sorting */
function randomize() {
  return Math.random();
}
/* discover words on a board */
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

mongoose.model('Game', {
  properties: [ { board: [] }, { words: [] } ],
  methods: {
    save: function(callback) {
      if (this.isNew) {
        this.board = [];
        cubes.sort(randomize);
        for (var i = 0; i < 16; i++) {
          var index = Math.floor(Math.random() * 6);
          this.board.push(cubes[i][index]);
        }

        /* discover all words */
        for (var i = 0; i < 16; i++) {
          var which = new Array(16);
          discover(this.board, which, i, '', dict, this.words);
        }
      }
      return this.__super__(callback);
    }
  }
});

var db = mongoose.connect('mongodb://localhost/boogie');
exports.Game = db.model('Game');
