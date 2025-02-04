const mongoose = require("mongoose");

const folderSchema = new mongoose.Schema({
  title: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  notes: [{ type: mongoose.Schema.Types.ObjectId,
    ref: "Note",
  }],

}, { timestamps: true });

const FolderModel = mongoose.model("Folder", folderSchema);
module.exports = FolderModel;
