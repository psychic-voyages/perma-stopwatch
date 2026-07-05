import express from "express";
import morgan from "morgan";
import cors from "cors";
import apiRouter from "./server/api/apiRouter.js";

const app = express();
export default app;

app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

app.use("/api", apiRouter);

app.use((err, req, res, next) => {
    console.log(err.message);
    res.status(500).send({error: err.message});
})