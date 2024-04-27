import { db } from "./drizzle/db.js";
import { connections, users } from "./drizzle/schema.js";

async function main() {
  await db.insert(users).values({
    hash: "testing testing",
  });
  await db.query.users.findFirst();
}

main();
