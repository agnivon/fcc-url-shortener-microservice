import mongoose from "mongoose";
import { urlSchema } from "./schema";

export const Url = mongoose.model('Url', urlSchema);