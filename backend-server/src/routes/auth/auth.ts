import { Hono } from "hono";
import { validatePhoneNo } from "../../models/authSchemas";
import { sendSms } from "../../controllers/send-sms";

export const auth = new Hono().basePath("/auth");

/*
receives a telephone number, 
validates it, 
makes-up a code, 
calculates a hash out of the key+code+phone number
sends an SMS with the code,
returns the hash
*/
auth.get("/sendsms", validatePhoneNo, sendSms);

/*  
    next we will need the user to send the server the code that he got+phone number+unique phone identifier. (and the hash). 
    the server, in a different route, will check for validity of the hash,
    create a new hash containing the unique phone ID and phone number and register the user.
    
 */
