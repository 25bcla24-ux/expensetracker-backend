const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();

// ✅ Allow all origins (important for Vercel)
app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGO_URI);

let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db("expenseDB");
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ DB Error:", err.message);
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
    const { title, amount, category } = req.body;

    const result = await db.collection("expenses").insertOne({
      title,
      amount: Number(amount),
      category,
      createdAt: new Date()
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📥 GET
app.get("/api/expenses", async (req, res) => {
  try {
    const data = await db.collection("expenses").find().toArray();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ❌ DELETE
app.delete("/api/expenses/:id", async (req, res) => {
  try {
    await db.collection("expenses").deleteOne({
      _id: new ObjectId(req.params.id)
    });

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🚀 START
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Running on ${PORT}`));