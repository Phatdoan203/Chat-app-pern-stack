import express from 'express';
import dotenv from 'dotenv';
import cookieParser from "cookie-parser"
import authRoute from './routes/auth.route.js';
import messageRoute from './routes/message.route.js'

const app = express();
const port = 8080;
dotenv.config();

app.use(express.json()); // for parsing application/json
app.use(cookieParser()); // for parsing cookies
app.use("/api/auth", authRoute);
app.use("/api/message", messageRoute)

app.get("/", (req, res) => {
    res.send("Hello World! 2");
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})