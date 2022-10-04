const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let userSchema = new Schema({
    Users: {
        type: String,
        required: true,
        unique: true,
    },
    Msgs: {
        type: Number,
        required: true,
    },
    Owner: {
        type: Number,
        required: true,
    },
    Date: {
        type: Number,
        required: true,
    },
});

let Channel = mongoose.model('Channel', userSchema);

module.exports = Channel;
