function Board(id, letters) {
  var self = this;
  var r = Raphael(id, 240, 310);
  this.rows = [];
  var row = [];
  for (var i = 0; i < 16; i++) {
    row.push(new Cell(r, Math.floor(i / 4), i % 4, letters[i]));
    if (i % 4 == 3) {
      this.rows.push(row);
      row = [];
    }
  }
  this.input = r.rect(3, 263, 234, 44, 6);
  this.input.attr('fill', 'white');
  this.cursor = new Cursor(r);
  this.paper = r;

  this.word = '';
  this.rword = null;
  $('body').keypress(function(e) {
    if (e.which == 13) {
      guess(self.word);
      self.word = '';
      if (self.rword)
        self.rword.remove();
      self.cursor.shift(0);
    }
    else {
      var c = String.fromCharCode(e.charCode);
      self.word = self.word + c;
      if (self.rword)
        self.rword.remove();
      self.rword = self.paper.print(9, 287, self.word.toUpperCase(), self.paper.getFont('ChunkFive'), 25);
      self.cursor.shift(self.rword.getBBox().width + 3);
    }
  });
}
function Cell(paper, row, col, letter) {
  this.row = row;
  this.col = col;
  var x = 60 * col + 3;
  var y = 60 * row + 3;
  this.rect = paper.rect(x, y, 54, 54, 6);
  this.rect.attr('fill', 'white');

  var l = paper.print(x, y, letter.toUpperCase(), paper.getFont('ChunkFive'), 30);
  l.attr('fill', "black");
  /*l.rotate(Math.floor(Math.random()*4) * 90);*/
  var box = l.getBBox();
  l.translate((54 - box.width) / 2, box.height / 2 + (54 - box.height) / 2);
  this.letter = l;
}
function Cursor(paper) {
  var line = this.line = paper.path("M9 268L9 302");
  this.pos = 0;
  var blinkOn = function() {
    line.animate({'stroke-opacity': 100}, 100, function() {
      setTimeout(blinkOff, 500);
    });
  };
  var blinkOff = function() {
    line.animate({'stroke-opacity': 0}, 100, function() {
      setTimeout(blinkOn, 500);
    });
  };
  setTimeout(blinkOff, 500);
}
Cursor.prototype = {
  shift: function(x) {
    var amount = x - this.pos;
    this.pos = x;
    this.line.translate(amount, 0);
  }
}
