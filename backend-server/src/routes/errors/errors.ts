import { Hono } from "hono";

import { validateToken } from "../../models/authSchemas";
import { logError } from "../../controllers/log-error";

export const errors = new Hono().basePath("/errors");

errors.post("/", logError);
