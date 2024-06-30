import { Hono } from "hono";
import { auth } from "./auth/auth";
import { admin } from "./admin/admin";

export const routes = new Hono();

routes.route("/", auth); //Handle route "auth"
// routes.route("/", admin); //Handle route "admin"
