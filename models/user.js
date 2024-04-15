const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minlength: 4,
    unique: true,
  },
  favoriteGenre: {
    type: String,
    required: true,
  },
})

module.exports = mongoose.model('User', schema)
