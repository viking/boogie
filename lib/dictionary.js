var fs = require('fs');
var Buffer = require('buffer').Buffer;

var dictionary = {};
fs.open('/usr/share/dict/american-english', 'r', undefined, function(err, fd) {
  var buf = new Buffer('x', 'utf8');
  var word = new Buffer(16);
  var pos = 0;
  var ignore = false;
  while (fs.readSync(fd, buf, 0, 1, null) > 0) {
    if (buf[0] == 0x0a) {
      if (!ignore && pos > 2) {
        // add word to dictionary
        var cur = dictionary;
        for (var i = 0; i < pos; i++) {
          var l = word.toString('utf8', i, i+1);
          if (i == pos - 1) {
            if (typeof(cur.leaves) == 'undefined')
              cur.leaves = [];
            cur.leaves.push(l);
          }
          else {
            if (typeof(cur[l]) == 'undefined')
              cur[l] = {};
            cur = cur[l];
          }
        }
      }
      ignore = false;
      pos = 0;
    }
    else if (!ignore) {
      if (pos < 16 && buf[0] >= 0x61 && buf[0] <= 0x7a) {
        word[pos++] = buf[0];
      }
      else {
        ignore = true;
      }
    }
  }
});

exports.dictionary = dictionary;
