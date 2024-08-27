import { Hono } from "hono";

import { validateToken } from "../../models/authSchemas";
import { logError } from "../../controllers/log-error";

export const errorLog = new Hono().basePath("/error-log");

errorLog.post("/", logError);
