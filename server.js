import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json()); // Parse JSON bodies

app.post("/api/shorten", async (req, res) => {
    const { url } = req.body;

    try {
        const response = await fetch("https://cleanuri.com/api/v1/shorten", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ url }),
        });

        const data = await response.json();
        res.setHeader("Access-Control-Allow-Origin", "*"); // Fix CORS
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "Something went wrong" });
    }
});

app.listen(3000, () => console.log("✅ Server running on http://localhost:3000"));

