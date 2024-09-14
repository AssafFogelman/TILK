import { Hono } from "hono";
import { auth } from "./auth/auth";
import { user } from "./user/user";
import { location } from "./location/location";
import { errors } from "./errors/errors";

export const routes = new Hono();

routes.route("/", auth); //Handle route "auth"
routes.route("/", user); //Handle route "user"
routes.route("/", location); //Handle route "auth"
routes.route("/", errors); //Handle route "error-log"

// routes.route("/", admin); //Handle route "admin"
