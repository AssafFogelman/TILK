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
    const knnQuery = `   SELECT 
                user_id, 
                nickname, 
                original_avatars, 
                small_avatar, 
                gender, 
                currently_connected, 
                date_of_birth, 
                biography,
                user_location <-> ST_MakePoint(${longitude}, ${latitude}) AS distance,
                EXISTS (
                    SELECT 1 
                    FROM connections 
                    WHERE (connected_user1 = '${userId}' AND connected_user2 = users.user_id) 
                       OR (connected_user2 = '${userId}' AND connected_user1 = users.user_id)
                ) AS connected,
                EXISTS (
                    SELECT 1 
                    FROM connection_requests 
                    WHERE sender_id = '${userId}' AND recipient_id = users.user_id
                ) AS request_recipient,
                EXISTS (
                    SELECT 1 
                    FROM connection_requests 
                    WHERE sender_id = users.user_id AND recipient_id = '${userId}'
                ) AS request_sender,
                 (SELECT unread FROM connection_requests WHERE sender_id = users.user_id AND recipient_id = '${userId}') AS unread,
                ARRAY(
                    SELECT tag_content 
                    FROM tags 
                    INNER JOIN tags_users ON tags.tag_id = tags_users.tag_id 
                    WHERE tags_users.user_id = users.user_id
                ) AS tags
            FROM users
            WHERE user_id <> '${userId}'
            AND active_user = TRUE
            AND (off_grid = FALSE OR connected IS TRUE OR request_sender IS TRUE)
            AND user_id NOT IN (
                SELECT blocked_user_id 
                FROM blocks 
                WHERE blocking_user_id = '${userId}'
            )
            AND user_location <-> ST_MakePoint(${longitude}, ${latitude}) < 10000
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
