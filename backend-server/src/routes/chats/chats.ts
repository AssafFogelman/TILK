import { Hono } from "hono";

import { validateToken } from "../../models/authSchemas";
import { userData } from "../../controllers/user-data";
import { avatarLinks } from "../../controllers/avatar-links";
import { postAvatars } from "../../controllers/post-avatars";
import { postBio } from "../../controllers/post-bio";
import { getTags } from "../../controllers/get-tags";
import { postTags } from "../../controllers/post-tags";
import { activateUser } from "../../controllers/activate-user";
import { getConnectionsList } from "../../controllers/get-connections-list";
import { userSelectedTags } from "../../controllers/user-selected-tags";
import { markAsRead } from "../../controllers/mark-as-read";
import { getChatsList } from "../../controllers/get-chats-list";
import { getChatMessages } from "../../controllers/get-chat-messages";

export const chats = new Hono().basePath("/chats");

//return all chats for the user
chats.get("/", validateToken, getChatsList);

//return all messages for a chat
chats.get("/:otherUserId", /*validateToken,*/ getChatMessages);
