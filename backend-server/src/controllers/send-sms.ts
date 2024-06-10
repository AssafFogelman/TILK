import { Context } from "hono";
import { createHash } from "../config/bcrypt";
import twilio from "twilio";
import "dotenv/config";

/** Twilio setup */
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

/*
receives a telephone number, 
validates it, 
makes-up a code, 
calculates a hash out of the key+code+phone number
sends an SMS with the code,
returns the hash
*/

export const sendSms = async (c: Context) => {
  try {
    const { phoneNumber } = c.req.query();
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const hash = await createHash(
      phoneNumber + code + process.env.VALIDATION_KEY
    );
    //send SMS
    await client.messages
      .create({
        body: "enter the following code: " + code,
        from: "TILK",
        to: phoneNumber,
      })
      .then((message) => console.log(message.sid));

    return c.json({ hash: hash });
  } catch (error) {
    console.log('error in "smssend" route:', error);
    return c.json({ message: 'error in "smssend" route:' + error });
  }
};
