function Board(id, letters, inputCallback, startCallback) {
  if (typeof(allowStart) == 'undefined')
    allowStart = false;

  var r = Raphael(id, 240, 310);
  this.cells = [];
  for (var i = 0; i < 16; i++) {
    this.cells.push(new Cell(r, Math.floor(i / 4), i % 4, letters[i]));
  }
  this.started = letters.length > 0;
  this.input = new Input(r, inputCallback);
  if (!this.started) {
    this.input.disable();
    if (startCallback) {
      var button = r.rect(33, 93, 180, 54, 10);
      button.attr('fill', 'red');
      var text = r.print(69, 121, 'START', r.getFont('ChunkFive'), 30);
      text.attr('fill', 'white');

      $(button.node).click(function(event) {
        button.remove(); text.remove();
        startCallback.call(this, event);
      });
    }
  }
  this.paper = r;
}
Board.prototype = {
  start: function(letters) {
    this.started = true;
    for (var i = 0; i < 16; i++)
      this.cells[i].setLetter(letters[i]);
    this.input.enable();
  }
};

function Cell(paper, row, col, letter) {
  this.row = row;
  this.col = col;
  this.x = 60 * col + 3;
  this.y = 60 * row + 3;
  this.rect = paper.rect(this.x, this.y, 54, 54, 6);
  this.rect.attr('fill', 'white');
  this.paper = paper;
  if (letter)
    this.setLetter(letter);
}
Cell.prototype = {
  setLetter: function(letter) {
    var l = this.paper.print(this.x, this.y, letter.toUpperCase(), this.paper.getFont('ChunkFive'), 30);
    l.attr('fill', "black");
    /*l.rotate(Math.floor(Math.random()*4) * 90);*/
    var box = l.getBBox();
    l.translate((54 - box.width) / 2, box.height / 2 + (54 - box.height) / 2);
    this.letter = l;
  }
};

function Input(paper, callback) {
  if (typeof(disabled) == 'undefined')
    disabled = false;

  this.rect = paper.rect(3, 263, 234, 44, 6);
  this.rect.attr('fill', 'white');
  this.cursor = new Cursor(paper);
  this.value = '';
  this.gfx = null;
  this.font = paper.getFont('ChunkFive');
  this.enabled = true;

  var self = this;
  $(document).keydown(function(e) {
    if (!self.enabled || e.ctrlKey || e.altKey || e.metaKey)
      return true;

    var dirty = false;
    var result = true;
    if (e.which == 13) {
      result = false;
      if (self.value.length > 0) {
        callback(self.value);
        self.value = '';
        self.gfx.remove();
        self.gfx = null;
        dirty = true;
      }
    }
    else if (e.which == 8) {
      result = false;
      if (self.value.length > 0) {
        self.value = self.value.substring(0, self.value.length - 1);
        if (self.gfx) self.gfx.remove();
        if (self.value.length > 0)
          self.gfx = paper.print(9, 287, self.value.toUpperCase(), self.font, 25);
        else
          self.gfx = null;
        dirty = true;
      }
    }
    else {
      var c = String.fromCharCode(e.which);
      if (c.match(/\w/)) {
        result = false;
        if (self.value.length < 16) {
          self.value = self.value + c.toLowerCase();
          if (self.gfx) self.gfx.remove();
          self.gfx = paper.print(9, 287, self.value.toUpperCase(), self.font, 25);
          dirty = true;
        }
      }
    }
    if (dirty)
      self.cursor.placeAfter(self.gfx);
    return result;
  });
}
Input.prototype = {
  enable: function() {
    this.enabled = true;
    this.rect.show();
    this.cursor.show();
  },
  disable: function() {
    this.enabled = false;
    this.rect.hide();
    this.cursor.hide();
  }
};

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
  show: function() {
    this.line.show();
  },
  hide: function() {
    this.line.hide();
  },
  placeAfter: function(gfx) {
    var x = gfx ? gfx.getBBox().width+3 : 0;
    var amount = x - this.pos;
    this.pos = x;
    this.line.translate(amount, 0);
  }
}
