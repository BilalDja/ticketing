import { json } from "body-parser";
import express from "express";
import "express-async-errors";
import cookieSession from "cookie-session";

import { UserRouter } from "./routes/users";
import {errorHandler, NotFoundError} from "@djagotickets/common";

const app = express();
app.set("trust proxy", true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test",
  })
);

app.use(UserRouter);

app.all("*", async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
