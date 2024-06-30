import { validator } from "hono/validator";
import { z } from "zod";
import { verifyToken } from "../config/jwt";
import { Context, Next } from "hono";

//*"send-sms" route

export const phoneNumberSchema = z.string().regex(/^\+[1-9]\d{6,14}$/); //Regular expression matching E.164 formatted phone numbers

export const validatePhoneNo = validator("json", (value, c) => {
  const { phoneNumber } = value;
  const result = phoneNumberSchema.safeParse(phoneNumber);
  if (!result.success) {
    console.log("Invalid phone number!");
    return c.json({ message: "Invalid phone number!" }, 401);
  }
  return result.data;
});

export const codeSchema = z.string().regex(/^\d{5}$/); //5 digit code
export const validateCode = validator("json", (value, c) => {
  const { code } = value;
  const result = phoneNumberSchema.safeParse(codeSchema);
  if (!result.success) {
    console.log("Invalid code!");
    return c.json({ message: "Invalid code!" }, 401);
  }
  return result.data;
});

//! how the fuck do I validate a token that comes from the header? spelling mistake (so you will come here)
//! and I still need to build a route to validate the token.... perhaps only then can I insert the token into the requests header?

export const validateToken = async (c: Context, next: Next) => {
  try {
    const token = c.req.header("TILK-token");
    console.log("testing! (in: validateToken middleware) the token is:", token);
    if (!token) throw new Error("no token provided");
    const payload = await verifyToken(token);
    c.set("tokenPayload", payload);
    await next();
  } catch (error) {
    console.log("Invalid token!");
    return c.json({ message: "Invalid token!", error }, 401);
  }
};
