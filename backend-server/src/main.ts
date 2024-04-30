import { ne, sql } from "drizzle-orm";
import { db } from "./drizzle/db.js";
import { connections, users } from "./drizzle/schema.js";
import { ALL } from "dns";

async function main() {
  try {
    //deleting all former users:
    // await db.delete(users).where(ne(users.gender, "woman"));

    //testing for distance:
    //* adding cities:
    // await db.insert(users).values({
    //   phoneNumber: "+972-54-6735391",
    //   gender: "man",
    //   nickname: "Eilat",
    //   locationDate: new Date(),
    //   dateOfBirth: "1983-01-13",
    // });

    //* inserting locations
    // const coordinates = {
    //   Holon: { lon: 32.01528, lat: 34.7875 },
    //   TelAviv: { lon: 32.06694, lat: 34.77778 },
    //   Jerusalem: { lon: 31.76944, lat: 35.21306 },
    //   Haifa: { lon: 32.79639, lat: 34.98444 },
    //   Eilat: { lon: 29.56, lat: 34.95111 },
    // };
    // const sqlQuery = sql.raw(
    //   `UPDATE users
    //    SET location=ST_SetSRID(ST_MakePoint(${coordinates.Eilat.lon},${coordinates.Eilat.lat}),4326)
    //    WHERE nickname='Eilat';`
    // );
    // await db.execute(sqlQuery);

    //* getting the 3 nearest cities to Eilat
    const knn = `SELECT users.nickname, users.location <-> 'SRID=4326;POINT(34.786712 31.253107)'::geometry AS distance FROM users ORDER BY distance LIMIT 3;`;
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

// ST_SetSRID(ST_MakePoint(long, lat), 4326);
