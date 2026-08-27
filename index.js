import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const PORT = process.env.PORT ?? 8080;
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

app.get("/", (req, res) => {
  return res.sendFile(path.join(currentDirectory, "index.html"));
});

app.get("/api", (req, res) => {
  return res.json({ message: "Hello from the server v2:latest deployed!" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});