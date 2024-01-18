const express = require("express");
const app = express();
require("dotenv").config();

const userRoutes = require("./routes/User");
const courseRoutes = require("./routes/Course");
const profileRoutes = require("./routes/Profile");
const paymentRoutes = require("./routes/Payments");
const { dbConnect } = require("./config/database");
const cookieParser = require("cookie-parser");
const { cloudinaryConnect } = require("./config/cloudnary");
const fileUpload = require("express-fileupload");
const cors = require('cors');

require("dotenv").config();

const PORT = process.env.PORT || 4000;
dbConnect();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "https://localhost:4200",
    Credential: true,
  })
);

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  })
);

cloudinaryConnect();

app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Server up",
  });
});

app.listen(PORT, () => {
  console.log("Server Listening at ", PORT);
});
