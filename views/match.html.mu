<div id="main">
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
  function start() {
    $.ajax({
      type: 'GET',
      url: '/matches/{{id}}/game/create',
      success: function(data, status, xhr) {
        $('#words').show();
        board.start(data.board);
      },
      dataType: 'json'
    });
  }
  function update() {
    $.ajax({
      url: '/matches/{{id}}',
      success: function(data, status, xhr) {
        var ul = $('<ul></ul>');
        $.each(data.players, function() {
          ul.append('<li>'+this.ip+'</li>');
        });
        $('#players ul').replaceWith(ul);

        if (data.started && !board.started) {
          board.start(data.board);
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
  var board;
  $(function() {
    board = new Board('board', {{{board}}}, guess{{^started}}, start{{/started}});
    {{#started}}$('#words').show();{{/started}}
    window.setInterval(update, 1000);
  });
</script>
