var mongoose = require('mongoose');

mongoose.Promise = global.Promise;

var TextSchema = new mongoose.Schema({
    text: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    }
});

module.exports =  mongoose.model('Text', TextSchema);