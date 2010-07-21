var dict = require('./dictionary').dictionary;

/* original cubes */
/*
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
*/
/* uber cubes (http://studio711.com/cs/blogs/ben/archive/2010/03/12/31963.aspx) */
var cubes = [
  [ 'e', 'o', 'n', 'm', 'x', 'h'],
  [ 'a', 't', 'i', 'l', 's', 'm'],
  [ 'v', 'a', 's', 't', 'h', 'n'],
  [ 'r', 's', 'a', 'i', 'o', 'l'],
  [ 'n', 'j', 'w', 'l', 'o', 'd'],
  [ 'f', 't', 'd', 'a', 'i', 'g'],
  [ 't', 'o', 'a', 'e', 't', 't'],
  [ 's', 'a', 'o', 'r', 'i', 'o'],
  [ 's', 'i', 'c', 'p', 't', 't'],
  [ 'i', 'e', 'p', 'w', 'k', 'e'],
  [ 'e', 'i', 'c', 'e', 't', 'h'],
  [ 'r', 'd', 'p', 'e', 'o', 'n'],
  [ 'r', 'i', 'e', 'e', 's', 't'],
  [ 'e', 'a', 'u', 'p', 'r', 't'],
  [ 'a', 'a', 'e', 'i', 'b', 'w'],
  [ 'm', 'a', 's', 'y', 'd', 'n']
];

/* for sorting */
function randomize() {
  return Math.random();
}
/* discover words on a board */
function discover(board, visited, pos, word, dict, results) {
  if (visited[pos]) {
    // already been here
    return;
  }
  var v = visited.map(function(x) { return x; });  // clone
  v[pos] = true;

  var l = board[pos];
  if (word.length > 1 && dict.leaves && dict.leaves.indexOf(l) >= 0)
    results.push({ word: word + l, guessed: false });

  if (typeof(dict[l]) == 'undefined')
    // no possible words
    return;

  var w = word + l;
  var d = dict[l];
  if (pos > 0)
    discover(board, v, pos-1, w, d, results);
  if (pos > 3)
    discover(board, v, pos-4, w, d, results);
  if (pos < 12)
    discover(board, v, pos+4, w, d, results);
  if (pos < 15)
    discover(board, v, pos+1, w, d, results);
}

exports.Game = function() {
  this.board = [];
  cubes.sort(randomize);
  for (var i = 0; i < 16; i++) {
    var index = Math.floor(Math.random() * 6);
    this.board.push(cubes[i][index]);
  }

  /* discover all words */
  this.words = [];
  for (var i = 0; i < 16; i++) {
    var visited = new Array(16);
    discover(this.board, visited, i, '', dict, this.words);
  }
};
