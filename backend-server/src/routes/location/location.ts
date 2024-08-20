import { Hono } from "hono";

import { validateToken } from "../../models/authSchemas";
import { getKnn } from "../../controllers/get-knn";

export const location = new Hono().basePath("/location");

location.post("/", validateToken, getKnn);
