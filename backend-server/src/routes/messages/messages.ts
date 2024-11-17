import { Hono } from "hono";

import { validateToken } from "../../models/authSchemas";
import { getChatMessages } from "../../controllers/get-chat-messages";

export const messages = new Hono().basePath("/messages");

//return all messages for a chat
messages.get("/:otherUserId", validateToken, getChatMessages);
