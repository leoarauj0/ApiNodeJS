const mongoose = require("mongoose");

mongoose.connect('mongodb://localhost/nodebd', { useMongoClient : true });

mongoose.Promise = global.Promise;

module.exports = mongoose;