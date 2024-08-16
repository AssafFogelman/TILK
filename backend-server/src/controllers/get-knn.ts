import { Context } from "hono";
import { db } from "../drizzle/db";
import { sql } from "drizzle-orm";

type ReqType = {
  limit: number;
  latitude: number;
  longitude: number;
};
/*
 * get the userId, the starting record and the ending record, user's location
 * update user's location
 * get the users' data
 * return to the client
 */
export const getKnn = async (c: Context) => {
  try {
    const { userId } = c.get("tokenPayload");
    const { limit = 20, latitude, longitude } = (await c.req.json()) as ReqType;

    if (limit < 1 || !Number.isInteger(limit) || limit > 200)
      throw { message: "invalid limit value" };
    //* enter user's location to DB
    await db.execute(
      sql.raw(`
          UPDATE users
          SET user_location=ST_MakePoint(${longitude},${latitude})
          WHERE user_id='${userId}';`),
    );

    // finding KNN
    // const knnQuery = `
    // SELECT nickname, user_location <-> ST_MakePoint(${longitude},${latitude}) AS distance
    // FROM users
    // WHERE user_location <-> ST_MakePoint(${longitude},${latitude})<10000
    // ORDER BY distance
    // LIMIT ${limit};`;
    const knnQuery = `SELECT 
        u.userId, 
        u.originalAvatars, 
        u.smallAvatar, 
        u.gender, 
        u.nickname, 
        u.currentlyConnected, 
        u.dateOfBirth, 
        u.biography, 
        u.user_location <-> ST_MakePoint(${longitude},${latitude}) AS distance,
        EXISTS (
          SELECT 1 FROM connections 
          WHERE (connectedUser1 = u.userId AND connectedUser2 = '${userId}') 
             OR (connectedUser2 = u.userId AND connectedUser1 = '${userId}')
        ) AS connected,
        EXISTS (
          SELECT 1 FROM sent_connection_requests 
          WHERE senderId = '${userId}' AND recipientId = u.userId
        ) AS sent_request,
        EXISTS (
          SELECT 1 FROM received_connection_requests 
          WHERE senderId = u.userId AND recipientId = '${userId}'
        ) AS received_request,
        ARRAY(
          SELECT t.tagContent
          FROM tagsUsers tu
          JOIN tags t ON tu.tagId = t.tagId
          WHERE tu.userId = u.userId
        ) AS tag_names
      FROM users u
      WHERE u.userId != '${userId}'
        AND u.user_location <-> ST_MakePoint(${longitude},${latitude}) < 10000
        AND u.activeUser = true
        AND NOT EXISTS (
          SELECT 1 FROM blocks 
          WHERE (blockingUserId = '${userId}' AND blockedUserId = u.userId) 
             OR (blockingUserId = u.userId AND blockedUserId = '${userId}')
        )
        AND (
          u.offGrid = false 
          OR EXISTS (
            SELECT 1 FROM connections 
            WHERE (connectedUser1 = u.userId AND connectedUser2 = '${userId}') 
               OR (connectedUser2 = u.userId AND connectedUser1 = '${userId}')
          )
          OR EXISTS (
            SELECT 1 FROM sent_connection_requests 
            WHERE senderId = u.userId AND recipientId = '${userId}'
          )
        )
      ORDER BY distance
      LIMIT ${limit};
    `;
    const knn = await db.execute(sql.raw(knnQuery));
    return c.json({ knn }, 200);
  } catch (error) {
    console.log("error retrieving nearest neighbor user data: ", error);
    return c.json(
      { message: "error retrieving nearest neighbor user data: ", error },
      401,
    );
  }
};
