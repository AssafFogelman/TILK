import { sql } from "drizzle-orm";
import { db } from "./drizzle/db.js";
import { connections, users } from "./drizzle/schema.js";

async function main() {
  // await db.insert(users).values({
  //   hash: "testing testing",
  //   phoneNumber: "+972-54-6735391",
  //   gender: "man",
  //   nickname: "Assaf Fogelman",
  //   locationDate: new Date(),
  //   dateOfBirth: "12/11/1983",
  // });
  const long = 7.11111;
  const lat = 8.22222;
  const sqlQuery = sql.raw(
    `UPDATE users 
     SET location=ST_SetSRID(ST_MakePoint(${long},${lat}),4326)
     WHERE user_id='40fa8c75-2956-44f5-906c-ab5e646ba438';`
  );
  await db.execute(sqlQuery);
  // const user = await db.query.users.findFirst({
  //   where: (user, { eq }) =>
  //     eq(user.userId, "40fa8c75-2956-44f5-906c-ab5e646ba438"),
  // });
  // console.log("user:", user);
  //! it works but doesn't return the location column

  const getLocation = sql.raw(
    `SELECT location FROM users WHERE user_id='40fa8c75-2956-44f5-906c-ab5e646ba438';`
  );
  const assafsLocation = await db.execute(getLocation);
  console.log("Assafs location:", assafsLocation);
}
//works and returns the location column as:
// Result(1) [
//  { location: '0101000020E6100000C408E1D1C6711C40C408E1D1C6712040' }
//]

main();

// ST_SetSRID(ST_MakePoint(long, lat), 4326);
