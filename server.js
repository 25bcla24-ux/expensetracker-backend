const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ DEBUG: check env
console.log("MONGO_URI:", process.env.MONGO_URI);

// ✅ Better Mongo options (fix connection issues)
const client = new MongoClient(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000
});

let db;

// ✅ Connect DB (Improved)
async function connectDB() {
  try {
    await client.connect();
    db = client.db("expenseDB");
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ DB Error:", err.message);

    console.log("👉 FIX CHECKLIST:");
    console.log("1. Check internet connection");
    console.log("2. Allow IP in MongoDB Atlas (0.0.0.0/0)");
    console.log("3. Check MONGO_URI in .env");
    console.log("4. Try non-SRV connection string");
  }
}
connectDB();

// Root
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

// ➕ ADD
app.post("/api/expenses", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "DB not connected" });

    const { title, amount, category } = req.body;

    if (!title?.trim() || !amount || !category?.trim()) {
      return res.status(400).json({ error: "All fields required" });
    }

    const result = await db.collection("expenses").insertOne({
      title: title.trim(),
      amount: Number(amount),
      category: category.trim(),
      createdAt: new Date()
    });

    res.json({ message: "Added", result });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📥 GET
app.get("/api/expenses", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "DB not connected" });

    const data = await db
      .collection("expenses")
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ❌ DELETE
app.delete("/api/expenses/:id", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "DB not connected" });

    await db.collection("expenses").deleteOne({
      _id: new ObjectId(req.params.id)
    });

    res.json({ message: "Deleted" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✏️ UPDATE
app.put("/api/expenses/:id", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "DB not connected" });

    const { title, amount, category } = req.body;

    await db.collection("expenses").updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          title: title.trim(),
          amount: Number(amount),
          category: category.trim()
        }
      }
    );

    res.json({ message: "Updated" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🚀 START
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Running on ${PORT}`));