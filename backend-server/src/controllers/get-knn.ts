import { Context } from "hono";
import { db } from "../drizzle/db";
import { sql } from "drizzle-orm";
import { user } from "../routes/user/user";

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
    let { latitude, longitude, limit = 20 } = (await c.req.json()) as ReqType;

    if (limit < 1 || !Number.isInteger(limit) || limit > 200)
      throw { message: "invalid limit value" };

    if (isNaN(latitude) || isNaN(longitude))
      throw { message: "invalid coordinates" };

    // the GPS in Israel is weird. It may put users in Jordan Or Lebanon. So for now all users have fixed locations.
    //FIXME
    if (userId === "6a128622-f8aa-48cb-94f8-1d2edd8cdd2a") {
      //if it's Yonatan, set his location to Jerusalem 13, Haifa
      latitude = 32.80895713046889;
      longitude = 34.998082571165114;
    }
    if (userId === "a8d8bbc4-6ae9-4f0c-87ca-2cb4da6a210c") {
      //if it's Assaf, set his location to Kvish Hasholom 25, Yagur
      latitude = 32.74185604627125;
      longitude = 35.07593527465838;
    }
    if (userId === "a95297c4-ac21-4bae-b0ec-2615d2732bf4") {
      //if it's Mirpaa, set his location to kolbo, Yagur
      latitude = 32.73975972061658;
      longitude = 35.07946220253626;
    }

    //* enter user's location to DB
    await db.execute(
      sql.raw(`
          UPDATE users
          SET user_location=ST_MakePoint(${longitude},${latitude})
          WHERE user_id='${userId}';`),
    );
    //currently_connected
    // finding KNN
    const knnQuery = `
            SELECT 
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
                (
                 SELECT unread 
                 FROM connection_requests 
                 WHERE sender_id = users.user_id AND recipient_id = '${userId}'
                 ) AS unread,
                ARRAY(
                    SELECT tag_content 
                    FROM tags 
                    INNER JOIN tags_users ON tags.tag_id = tags_users.tag_id 
                    WHERE tags_users.user_id = users.user_id
                ) AS tags
            FROM users
            WHERE 
                user_id <> '${userId}'
                AND active_user = TRUE
                AND (
                    off_grid = FALSE 
                    OR 
                    EXISTS (
                        SELECT 1 
                        FROM connections 
                        WHERE (connected_user1 = '${userId}' AND connected_user2 = users.user_id) 
                        OR (connected_user2 = '${userId}' AND connected_user1 = users.user_id)
                    )
                    OR 
                    EXISTS (
                        SELECT 1 
                        FROM connection_requests 
                        WHERE sender_id = users.user_id AND recipient_id = '${userId}'
                    )
                )
                AND user_id NOT IN (
                    SELECT blocked_user_id 
                    FROM blocks 
                    WHERE blocking_user_id = '${userId}'
                )
               AND user_id NOT IN (
                    SELECT blocking_user_id
                    FROM blocks
                    WHERE blocked_user_id = '${userId}'
                )
                AND user_location <-> ST_MakePoint(${longitude}, ${latitude}) < 10000
            ORDER BY distance
            LIMIT ${limit};
    `;
    const knn = await db.execute(sql.raw(knnQuery));
    console.log("knn: ", knn);
    return c.json({ knn }, 200);
  } catch (error) {
    console.log("error retrieving nearest neighbor user data: ", error);
    return c.json(
      { message: "error retrieving nearest neighbor user data: ", error },
      401,
    );
  }
};
