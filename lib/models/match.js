var Game = require('../game').Game;
exports.options = {
  properties: [ { players: [] }, 'game', 'status' ],
  methods: {
    startGame: function(callback) {
      this.game = new Game();
      this.status = 'started';

      var self = this;
      this.save(function() {
        setTimeout(function() { self.finishGame.call(self) }, 180000);
        callback.call(self);
      });
    },
    finishGame: function() {
      // calculate wins/losses
      var results = [], top = 0;
      for (var i = 0; i < this.players.length; i++) {
        var cur = { player: this.players[i] }
        var score = cur.player.score;
        if (score >= top) {
          cur.attrib = 'wins';
          if (score > top) {
            top = score;
            for (var j = 0; j < results.length; j++)
              results[j].attrib = 'losses';
          }
        }
        else {
          cur.attrib = 'losses';
        }
        results.push(cur);
      }

      for (var i = 0; i < results.length; i++)
        results[i].player[results[i].attrib]++;

      this.status = 'pending';
      this.save();
    }
  }
};
