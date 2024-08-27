import { Context, Next } from "hono";
import { verifyToken } from "../config/jwt";
import React from "react";
import { db } from "../drizzle/db";
import { errorLog } from "../drizzle/schema";

type ErrorType = {
  error: Error;
  info: React.ErrorInfo;
};
/*
  log an error record once Error boundary is set
 */
export const logError = async (c: Context, next: Next) => {
  try {
    const token = c.req.header("TILK-token");
    let payload;
    // there might not be a token since the error might arise before the user has
    // a token and axios took the token and put it in the request header.
    if (token) {
      payload = (await verifyToken(token)) as { userId: string };
    }
    const userId = payload?.userId ? JSON.stringify(payload.userId) : null;
    let { error, info } = (await c.req.json()) as ErrorType;
    await db.insert(errorLog).values({
      error: JSON.stringify(error),
      info: JSON.stringify(info),
      userId,
    });
    return c.json({ message: "Error record saved!" }, 200);
  } catch (error) {
    console.log("Invalid token!");
    return c.json({ message: "Invalid token!", error }, 401);
  }
};
