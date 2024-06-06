import { Hono } from "hono";
import { z } from "zod";

export const auth = new Hono().basePath("/auth");

const phoneNumberSchema = z.string().regex(/^\+[1-9]\d{1,14}$/); //Regular expression matching E.164 formatted phone numbers
auth.post("/sendsms", (c) => c.text("hi!")); // POST /auth/
