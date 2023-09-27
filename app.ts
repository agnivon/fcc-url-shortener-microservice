import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import dns from "dns";
import { Url } from "./model";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;
const mongoURI = process.env.MONGO_URI || "";

const URL_REGEX = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9.-]+)\.([a-zA-Z]{2,})(\/\S*)?/;

app.use(cors({ optionsSuccessStatus: 200 }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (_req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.post("/api/shorturl", async (req: Request, res: Response) => {
  try {
    const originalUrl = req.body.url;
    console.log(originalUrl);
    if (typeof originalUrl === "string" && URL_REGEX.test(originalUrl)) {
      const url = await Url.findOne({ original_url: originalUrl });
      if (url)
        return res.json({
          original_url: url.original_url,
          short_url: url._id,
        });
      else {
        const newUrl = new Url({ original_url: originalUrl });
        await newUrl.save();
        return res.json({
          original_url: newUrl.original_url,
          short_url: newUrl._id,
        });
      }
    } else {
      return res.status(400).json({ error: "invalid url" });
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get("/api/shorturl/:id", async (req: Request, res: Response) => {
  try {
    const shortUrlId = req.params.id;
    if (shortUrlId) {
      const url = await Url.findById(shortUrlId);
      if (url?.original_url) return res.redirect(url.original_url);
      else return res.status(404).send();
    } else {
      return res.status(400).send();
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

app.listen(port, async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  } catch (e) {
    console.error(e);
    console.log(`Server run failed`);
  }
});
