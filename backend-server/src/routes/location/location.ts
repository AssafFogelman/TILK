import { Hono } from "hono";

import { validateToken } from "../../models/authSchemas";
import { getKnn } from "../../controllers/get-knn";

export const user = new Hono().basePath("/location");

user.post("/", validateToken, getKnn);
