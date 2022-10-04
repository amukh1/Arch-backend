const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let userSchema = new Schema({
    Username: {
        type: String,
        required: true,
        unique: true,
    },
    Password: {
        type: String,
        required: true,
    },
    Token: {
        type: String,
        required: true,
      unique: true,
    },
  uuid: {
        type: Number,
        required: true,
    unique: true,
    },
});

let User = mongoose.model('User', userSchema);

module.exports = User;
