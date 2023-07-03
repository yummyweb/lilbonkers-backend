const { addEarning } = require("./api/api");
const express = require("express");
const dotenv = require("dotenv");

const app = express();
const cors = require("cors");
const corsOptions = {
  // origin: "http://10.10.10.79:3000 https://play.robotfactory.works",
  origin: "https://play.littlebonkers.xyz",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json());
dotenv.config();
const server = require("http").createServer(app);
const connectDB = require("./config/db");

//db connection

connectDB();

app.use("/api/users", require("./routes/api/users"));

// gaming

//

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
