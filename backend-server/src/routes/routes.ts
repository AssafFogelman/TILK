import { Hono } from "hono";
import { auth } from "./auth/auth";
import { user } from "./user/user";
import { location } from "./location/location";

export const routes = new Hono();

routes.route("/", auth); //Handle route "auth"
routes.route("/", user); //Handle route "user"
routes.route("/", location); //Handle route "auth"

// routes.route("/", admin); //Handle route "admin"
