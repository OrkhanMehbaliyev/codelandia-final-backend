const express = require("express");
require("dotenv").config();
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const productRouter = require("./routes/productRoutes");
const orderRouter = require("./routes/orderRoutes");
const cartRouter = require("./routes/cartRoutes");
const categoryRouter = require("./routes/categoryRoutes");
const userRouter = require("./routes/userRoutes");
const authRouter = require("./routes/authRoutes");
const wishlistRouter = require("./routes/wishlistRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const analyticsRouter = require("./routes/analyticsRoutes");
const cors = require("cors");

const cookieParser = require("cookie-parser");
app.use(bodyParser.json());
app.use(morgan("dev"));
app.use(cors({ credentials: true, origin: "http://localhost:5173" }));
app.use(cookieParser());
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/v1/products", productRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/carts", cartRouter);
app.use("/api/v1/wishlists", wishlistRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/analytics", analyticsRouter);
app.post("/data", (req, res) => {
  res.json({ message: "Data received", data: req.body });
});

module.exports = app;
