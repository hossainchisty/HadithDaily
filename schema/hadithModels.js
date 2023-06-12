const mongoose = require('mongoose');

// Create a schema for the Hadith collection
const hadithSchema = new mongoose.Schema({
  quote: {
    type: String,
    required: true,
  },
  reference: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Hadith', hadithSchema);
