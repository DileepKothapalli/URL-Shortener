const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema(
  {
    shortCode: { type: String, required: true, unique: true },
    longUrl: { type: String, required: true },
    clickCount: { type: Number, default: 0 },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Url', urlSchema);
