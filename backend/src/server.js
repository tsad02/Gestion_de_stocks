console.log("=== SERVER.JS LOADED ===");
console.log("SERVER FILE EXECUTED");
require("dotenv").config();
const app = require("./app");

console.log("JWT_SECRET:", process.env.JWT_SECRET ? "OK" : "MISSING");
console.log("JWT_EXPIRES_IN:", process.env.JWT_EXPIRES_IN || "MISSING");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});