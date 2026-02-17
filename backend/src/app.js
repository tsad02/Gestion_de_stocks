require("dotenv").config();
const express = require("express");
const productsRoutes = require("./routes/products.routes");
const healthRoutes = require("./routes/health.routes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(express.json());

// routes
app.use("/api/health", healthRoutes);
app.use("/api/products", productsRoutes);

// middlewares finaux
app.use(notFound);
app.use(errorHandler);

module.exports = app;
