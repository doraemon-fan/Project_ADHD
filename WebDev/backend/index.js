require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const geminiRoutes = require("./routes/geminiRoutes");
const googleTokenRoute =  require("./routes/googleToken.js");
const googleTasksRoutes = require("./routes/googleTasksRoutes");
const { ClerkExpressWithAuth } = require("@clerk/clerk-sdk-node");
const authMiddleware = require("./middleware/authMiddleware");
const Task = require("./models/Task");




const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: "*", // Allow all origins or specify your frontend origin
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Authorization", "Content-Type"],
  })
);
app.use(express.json());
// app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(
  ClerkExpressWithAuth({
    apiKey: process.env.CLERK_SECRET_KEY,
  })
);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));


// Routes
app.use("/api/tasks", authMiddleware, require("./routes/taskRoutes"));
app.use("/api/sessions", authMiddleware, require("./routes/sessionRoutes"));
app.use(geminiRoutes);
app.use("/api/google-token", googleTokenRoute);
app.use("/api/google-tasks", authMiddleware, googleTasksRoutes);

app.get("/checkTasks", async (req, res) => {
  try {
    //res.json(req.auth.userId);
    const tasks = await Task.find().sort({ position: 1 }); 
    res.json(tasks);
    //console.log(req.auth.userId);
  } catch (error) {
   // console.error("Error fetching tasks:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/api/test-auth", authMiddleware, (req, res) => {
  console.log("Auth Object:", req.auth);
  res.json({ auth: req.auth });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
