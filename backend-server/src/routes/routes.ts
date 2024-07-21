import { Hono } from "hono";
import { auth } from "./auth/auth";
import { user } from "./user/user";

export const routes = new Hono();

routes.route("/", auth); //Handle route "auth"
routes.route("/", user); //Handle route "auth"
// routes.route("/", admin); //Handle route "admin"
