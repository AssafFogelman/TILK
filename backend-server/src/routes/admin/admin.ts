import { Hono } from "hono";
import { validateCode, validatePhoneNo } from "../../models/authSchemas";
import { sendSms } from "../../controllers/send-sms";
import { createToken } from "../../controllers/create-token";

export const admin = new Hono().basePath("/admin");

admin.post("/add-tags", validateTags, addTags);
