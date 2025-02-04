const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  title: { type: String },
  content: { type: String },
  folderId: { type: mongoose.Schema.Types.ObjectId,
    ref: "Folder" },
    date: { type: Date, default: Date.now },
    userId: { type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
}, { timestamps: true });

const NoteModel = mongoose.model("Note", noteSchema);
module.exports = NoteModel;
