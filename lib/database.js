require.paths.unshift(__dirname+'/../vendor/mongoose');
var mongoose = require('mongoose').Mongoose;
mongoose.model('Match', require('./models/match').options);

var db = mongoose.connect('mongodb://localhost/boogie');
exports.db    = db;
exports.Match = db.model('Match');
