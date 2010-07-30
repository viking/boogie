<div id="main">
  <div id="timer" style="display: none;">
    <strong>Seconds left</strong>: <span></span>
  </div>
  <div id="players">
    <h2>Players</h2>
    <ul>
    {{#players}}
      <li>{{ip}}</li>
    {{/players}}
    </ul>
  </div>
  <div id="board"></div>
  <div id="words" style="display: none;">
    <h2>Words</h2>
    <ul></ul>
  </div>
</div>
<script type="text/javascript">
  var board, time_left, interval_1, interval_2;
  function createGame() {
    $.ajax({
      type: 'GET',
      url: '/matches/{{id}}/game/create',
      success: function(data, status, xhr) { 
        time_left = data.time_left;
        board.start(data.board);
        start();
      },
      dataType: 'json'
    });
  }
  function start() {
    $('#timer span').html(time_left);
    $('#timer').show();
    $('#words').show();
    interval_2 = window.setInterval(decrease_timer, 1000);
  }
  function update() {
    $.ajax({
      url: '/matches/{{id}}.json',
      success: function(data, status, xhr) {
        var ul = $('<ul></ul>');
        $.each(data.players, function() {
          ul.append('<li>'+this.ip+'</li>');
        });
        $('#players ul').replaceWith(ul);

        if (data.started) {
          if (!board.started)
            board.start(data.board);
          if (data.time_left)
            time_left = data.time_left;
        }
      },
      dataType: 'json'
    });
  }
  function guess(word) {
    $.ajax({
      url: '/matches/{{id}}/guess',
      data: {'guess[value]': word},
      success: function(data, status, xhr) {
        if (data) {
          var li = $('<li>'+data.word+'</li>')
            .addClass(data.status)
            .prependTo('#words ul');
        }
        $('#guess').val('');
      },
      dataType: 'json'
    });
  }
  function decrease_timer() {
    $('#timer span').html(time_left--);
  }

  time_left = {{time_left}};
  $(function() {
    board = new Board('board', {{{board}}}, guess{{#startable}}, createGame{{/startable}});
    interval_1 = window.setInterval(update, 5000);
    {{#started}}start();{{/started}}
  });
</script>
