import { Hono } from "hono";

import { logError } from "../../controllers/log-error";

export const errors = new Hono().basePath("/errors");

errors.post("/", logError);
