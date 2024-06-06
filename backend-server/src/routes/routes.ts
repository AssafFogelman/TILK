import { Hono } from "hono";
import { auth } from "./auth/auth";

export const routes = new Hono();

routes.route("/", auth); //Handle route "auth"
