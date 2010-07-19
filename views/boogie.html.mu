<html>
  <head>
    <title>Boogie</title>
    <style type="text/css">
      body {
        background-color: #ddd;
      }
      #main {
        margin: 10em auto;
        width: 240px;
      }
      #board {
        position: relative;
      }
      #guess {
        width: 100%;
        border: 1px solid black;
        background-color: white;
      }
      #words {
        list-style-type: none;
        margin: 0;
        padding: 0;
      }
      #words li {
        margin: 0 0 0.2em 0;
        display: block;
        border: 1px solid black;
        padding: 0.2em;
        text-align: center;
        color: white;
      }
      #words li.success { background-color: green; }
      #words li.taken { background-color: yellow; color: black; }
      #words li.invalid { background-color: red; }
    </style>
    <script src="/jquery-1.4.2.min.js"></script>
    <script src="/raphael-min.js"></script>
    <script src="/ChunkFive_400.font.js"></script>
  </head>
  <body>
    <div id="main">
      <div id="board"></div>
      <form action="/games/{{id}}/guesses" method="get">
        <p>
          <input id="guess" type="text" name="guess[value]" />
        </p>
      </form>
      <ul id="words"></ul>
    </div>
    <script type="text/javascript">
      function Board(id, letters) {
        this.paper = Raphael(id, 240, 240);
        this.rows = [];
        var row = [];
        for (var i = 0; i < 16; i++) {
          row.push(new Cell(this.paper, Math.floor(i / 4), i % 4, letters[i]));
          if (i % 4 == 3) {
            this.rows.push(row);
            row = [];
          }
        }
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
      var letters = {{{board}}};
      var board;
      $(function() {
        board = new Board('board', letters);
        $('form').submit(function() {
          var f = $(this);
          $.get(f.attr('action'), f.serialize(), function(data, status, xhr) {
            if (data) {
              var li = $('<li>'+data.word+'</li>')
                .addClass(data.status)
                .prependTo('#words');
            }
            $('#guess').val('');
          }, 'json');
          return false;
        });
      });
    </script>
  </body>
</html>
