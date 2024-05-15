import { ne, sql } from "drizzle-orm";
import { db } from "./drizzle/db.js";
import { connections, users } from "./drizzle/schema.js";
import { ALL } from "dns";

async function main() {
  try {
    //*deleting all former users:
    // await db.delete(users).where(ne(users.gender, "woman"));

    //* adding cities:
    // await db.insert(users).values({
    //   phoneNumber: "+972-54-6735391",
    //   gender: "man",
    //   nickname: "Holon",
    //   locationDate: new Date(),
    //   dateOfBirth: "1983-01-13",
    // });

    // * inserting locations
    // const coordinates = {
    //   Holon: { lon: 32.01528, lat: 34.7875 },
    //   TelAviv: { lon: 32.06694, lat: 34.77778 },
    //   Jerusalem: { lon: 31.76944, lat: 35.21306 },
    //   Haifa: { lon: 32.79639, lat: 34.98444 },
    //   Eilat: { lon: 29.56, lat: 34.95111 },
    // };
    // const sqlQuery = sql.raw(
    //   `UPDATE users
    //    SET user_location=ST_MakePoint(${coordinates.Holon.lon},${coordinates.Holon.lat})
    //    WHERE nickname='Holon';`
    // );
    // await db.execute(sqlQuery);

    //* getting the 10 nearest cities to "Hasataf" creek
    /* showing results up to 10 KM */

    const knn = `
    SELECT nickname, user_location <-> ST_MakePoint(31.77185142779806, 35.12806329924837) AS distance 
    FROM users 
    WHERE user_location <-> ST_MakePoint(31.77185142779806, 35.12806329924837)<10000
    ORDER BY distance 
    LIMIT 10;`;
    const closestCities = await db.execute(sql.raw(knn));
    console.log("closestCities:", closestCities);
    /************ */
    // const users1 = await db.query.users.findMany();
    // console.log("users:", users1);
  } catch (error) {
    console.log('there was an error trying to execute function "main":', error);
  }
}

main();
