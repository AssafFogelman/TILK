import { Context } from "hono";
import { compareHash } from "../config/bcrypt";
import { db } from "../drizzle/db";
import { users } from "../drizzle/schema";
import { generateToken } from "../config/jwt";

/*  
    the user sends the server the code that he got+phone number+the hash. 
     - the server checks for validity of the hash,
     - the server checks whether the phone number exists in the database.
     - if so, it returns a token
     - if not, it creates a user and returns a token
     the token:
     * userId

     - the server also returns global user attributes: (to be added to the context)
     the attributes:
     * userId
     * chosenPhoto
     * chosenBio
     * chosenTags
     * isAdmin
     * off-grid (specifically not determined by the server, but by the app)


    create and return a new token containing the new user unique phone ID and phone number and register the user.
    
 */

export const createToken = async (c: Context) => {
  try {
    const {
      phoneNumber,
      code,
      hash,
    }: { phoneNumber: string; code: string; hash: string } = await c.req.json();

    //is the hash valid?
    const hashValid = compareHash(
      phoneNumber + code + process.env.VALIDATION_KEY,
      hash
    );
    if (!hashValid) throw "the hash is not valid! retry the validation process";

    //does the user exist?
    let user = await db.query.users.findFirst({
      where: (table, funcs) => funcs.eq(table.phoneNumber, phoneNumber),
    });

    //if not, create user
    let newUser;
    if (!user) {
      newUser = await db
        .insert(users)
        .values({
          phoneNumber: phoneNumber,
        })
        .returning({ userId: users.userId });
      console.log("newUser:", newUser);
    }
    const userId = newUser ? newUser[0].userId : user?.userId;
    // create token
    const token = await generateToken({ userId: userId }, "6 months");
    return c.json({
      token: token,
      userId: userId,
      chosenPhoto: false,
      chosenBio: false,
      chosenTags: false,
      isAdmin: user ? user.admin : false,
    });
  } catch (error) {
    console.log('error in "create-token" route:', error);
    return c.json({ message: 'error in "create-token" route:' + error }, 401);
  }
};
