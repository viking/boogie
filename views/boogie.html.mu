<html>
  <head>
    <title>Boogie</title>
    <style type="text/css">
      #board {
        position: relative;
        margin: 1em auto;
        width: 320px;
        height: 320px;
      }
    </style>
    <script src="/jquery-1.4.2.min.js"></script>
    <script src="/raphael-min.js"></script>
    <script src="/ChunkFive_400.font.js"></script>
  </head>
  <body>
    <div id="board"></div>
    <script type="text/javascript">
      function Board(id, letters) {
        this.paper = Raphael(id, 320, 320);
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

        var l = paper.print(x, y, letter.toUpperCase(), paper.getFont('ChunkFive'), 30);
        l.attr({fill: "black"});
        /*l.rotate(Math.floor(Math.random()*4) * 90);*/
        var box = l.getBBox();
        l.translate((54 - box.width) / 2, box.height / 2 + (54 - box.height) / 2);
        this.letter = l;
      }
      var letters = {{{board}}};
      var board;
      $(function() {
        board = new Board('board', letters);
      });
    </script>
  </body>
</html>
