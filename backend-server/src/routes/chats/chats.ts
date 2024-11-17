import { Hono } from "hono";

import { validateToken } from "../../models/authSchemas";
import { getChatMessages } from "../../controllers/get-chat-messages";
import { getChatsList } from "../../controllers/get-chats-list";

export const chats = new Hono().basePath("/chats");

//return all chats for the user - perhaps should get only last message of each chat
chats.get("/", validateToken, getChatsList);
