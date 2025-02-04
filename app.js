require("dotenv").config();
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db.config");
const jwt = require("jsonwebtoken")


connectDB();

const UserModel = require("./models/user.model");
const FolderModel = require("./models/folders.model");
const NoteModel = require("./models/notes.model");


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await UserModel.hashPassword(password);
  const user = await UserModel.create({ name, email, password: hashedPassword });
  const token = await user.generateToken();
  res.cookie("token", token);
  delete user._doc.password;
  res.status(201).json({ message: "User created successfully", user, token });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const token = await user.generateToken();
  res.cookie("token", token);
  delete user._doc.password;
  res.status(200).json({ message: "Login successful", user, token });
});

app.post("/create-folder", isLoggedIn, async (req, res) => {
  const { title} = req.body;
  const userId = req.user._id;
  const folder = await FolderModel.create({ title, userId });
  res.status(201).json({ message: "Folder created successfully", folder });
});

app.post("/create-note/:folderId", isLoggedIn, async (req, res) => {
 const folderId = req.params.folderId;
  const { title, content } = req.body;
  const userId = req.user._id;
  const note = await NoteModel.create({ title, content, folderId, userId });
  const folder = await FolderModel.findById(folderId);
  folder.notes.push(note._id);
  await folder.save();
  res.status(201).json({ message: "Note created successfully", note });
});

app.get("/show-folders", isLoggedIn, async (req, res) => {
  const userId = req.user._id;
  console.log(userId)
  const folders = await FolderModel.find({ userId }).populate("notes");
  res.status(200).json({ folders}); 
});

app.get("/show-notes/:folderId", isLoggedIn, async (req, res) => {
  const folderId = req.params.folderId;
  const notes = await NoteModel.find({ folderId });
  res.status(200).json({ notes });
});

app




async function isLoggedIn(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
 
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    const user = await UserModel.findById(decoded.id); 
    if (!user) {
      return res.status(401).json({ message: "Unauthorized user" });
    }
    
    req.user = user;
    next();
 
}




app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
