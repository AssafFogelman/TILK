import { Hono } from "hono";
import {
  validateCode,
  validatePhoneNo,
  validateToken,
} from "../../models/authSchemas";
import { userData } from "../../controllers/user-data";

export const user = new Hono().basePath("/user");

/* 
    1. receives a token
    2. checks that the token is valid
    3. checks whether the user exists in the database. 
    if not, returns an error.
    if so, returns all relevant user data.
*/

user.get("/user-data", validateToken, userData);
