var sys   = require('sys');
var path  = require('path');
var url   = require('url');
var fs    = require('fs');
var http  = require('http');
var Mu    = require('./../vendor/Mu/lib/mu');
var db    = require('./database');
var Game  = require('./game').Game;
var Match = db.Match;
Mu.templateRoot = __dirname + '/../views';

var renderOptions = { cached: false };
function responseWriter(response) {
  return(function(err, output) {
    if (err) throw err;
    output.addListener('data', function(x) { response.write(x); });
    output.addListener('end', function(x) { response.end(); });
  });
}
function layoutWriter(response) {
  return(function(err, output) {
    if (err) throw err;
    var content = '';
    output.addListener('data', function(x) { content += x; });
    output.addListener('end', function() {
      Mu.render('layout.html', {content: content}, renderOptions, responseWriter(response));
    });
  });
}
function render(name, ctx, response, skipLayout) {
  if (typeof(skipLayout) == 'undefined')
    skipLayout = false;

  response.writeHead(200, {'Content-Type': 'text/html'});
  Mu.render(name+'.html', ctx, renderOptions, (skipLayout ? responseWriter : layoutWriter)(response));
}
function renderJSON(object, response) {
  response.writeHead(200, {'Content-Type': 'application/json'});
  response.end(JSON.stringify(object));
}
function redirect(url, response) {
  response.writeHead(302, { 'Location': url });
  response.end();
}
function not_found(response) {
  response.writeHead(404);
  response.end();
}
function is_xhr(request) {
  var h = request.headers['x-requested-with'];
  return h ? h.match(/XMLHttpRequest/i) : false;
}

exports.server = http.createServer(function(request, response) {
  var md, game, match, player;
  var rurl = url.parse(request.url, true)
  var ip = request.connection.remoteAddress;
  var xhr = is_xhr(request);
  //sys.puts(sys.inspect(request));
  if (rurl.pathname == "/") {
    match = new Match({status: 'new'});
    match.save(function() {
      redirect('/matches/' + match._id.toHexString(), response);
    });
  }
  else if (md = rurl.pathname.match(/^\/matches\/([0-9a-f]+)$/)) {
    var match_id = md[1];
    Match.findById(match_id, function(match) {
      if (!match) { not_found(response); return; }

      var ctx = { id: match_id, board: [], started: false };
      if (match.status == 'started') {
        ctx.started = true;
        ctx.board = match.game.board;
      }

      var go = function() {
        ctx.players = match.players;
        ctx.owner = player.owner;
        ctx.board = JSON.stringify(ctx.board);
        xhr ? renderJSON(ctx, response) : render('match', ctx, response);
      };

      for (var i = 0; i < match.players.length; i++) {
        if (match.players[i].ip == ip) {
          player = match.players[i];
          break;
        }
      }
      if (!player) {
        // new player
        player = { ip: ip, wins: 0, losses: 0, ties: 0, score: 0 };
        if (match.players.length == 0) player.owner = true;
        match.players.push(player);
        match.save(go);
      }
      else { go(); }
    });
  }
  else if (md = rurl.pathname.match(/^\/matches\/([0-9a-f]+)\/game\/create$/)) {
    var match_id = md[1];
    Match.findById(match_id, function(match) {
      if (!match) { not_found(response); return; }

      match.game = new Game();
      match.status = 'started';
      match.save(function() {
        renderJSON({ board: match.game.board }, response);
      });
    });
  }
  else if (md = rurl.pathname.match(/^\/matches\/([0-9a-f]+)\/guess$/)) {
    var match_id = md[1];
    Match.findById(match_id, function(match) {
      if (!match) { not_found(response); return; }

      if (match.status != 'started' || !rurl.query.guess || !rurl.query.guess.value) {
        sys.puts(sys.inspect(rurl));
        renderJSON({ status: 'invalid' }, response);
        return;
      }
      var val = rurl.query.guess.value;
      var game = match.game;
      var found = false;
      var result = {word: val};
      var go = function() { renderJSON(result, response); };
      for (var i = 0; i < game.words.length; i++) {
        if (game.words[i].word != val)
          continue;

        found = true;
        if (game.words[i].guessed) {
          // already guessed
          result.status = 'taken';
        }
        else {
          result.status = 'success';
          game.words[i].guessed = true;
          match.save(go);
          return;
        }
        break;
      }
      if (!found)
        result.status = 'invalid';
      go();
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
        var md = file.match(/\.(\w+?)$/);
        var type = 'text/plain';
        switch(md[1]) {
        case 'css':
          type = 'text/css';
          break;
        case 'js':
          type = 'text/javascript';
          break;
        }

        response.writeHead(200, { 'Content-Type': type });
        fs.readFile(file, function(err, data) {
          response.end(data);
        });
      }
    });
  }
});
