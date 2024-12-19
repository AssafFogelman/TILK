import { Hono } from "hono";
import { auth } from "./auth/auth";
import { user } from "./user/user";
import { location } from "./location/location";
import { errors } from "./errors/errors";
import { chats } from "./chats/chats";
import { messages } from "./messages/messages";
import { notifications } from "./notifications/notifications";

export const routes = new Hono();

routes.route("/", auth); //Handle route "auth"
routes.route("/", user); //Handle route "user"
routes.route("/", location); //Handle route "auth"
routes.route("/", errors); //Handle route "error-log"
routes.route("/", chats); //Handle route "chats"
routes.route("/", messages); //Handle route "messages"
routes.route("/", notifications); //Handle route "notifications"

// routes.route("/", admin); //Handle route "admin"
