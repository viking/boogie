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
    <script src="/boogie.js"></script>
  </head>
  <body>
    <div id="main">
      <div id="board"></div>
      <div id="guess"></div>
      <ul id="words"></ul>
    </div>
    <script type="text/javascript">
      function guess(word) {
        $.ajax({
          url: '/games/{{id}}/guesses',
          data: {'guess[value]': word},
          success: function(data, status, xhr) {
            if (data) {
              var li = $('<li>'+data.word+'</li>')
                .addClass(data.status)
                .prependTo('#words');
            }
            $('#guess').val('');
          },
          dataType: 'json'
        });
      }
      var letters = {{{board}}};
      var board;
      $(function() {
        board = new Board('board', letters);
      });
    </script>
  </body>
</html>
