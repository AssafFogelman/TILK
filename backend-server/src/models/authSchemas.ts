import { HTTPException } from "hono/http-exception";
import { validator } from "hono/validator";
import { z } from "zod";

//*"sendsms" route

export const phoneNumberSchema = z.string().regex(/^\+[1-9]\d{1,14}$/); //Regular expression matching E.164 formatted phone numbers

export const validatePhoneNo = validator("query", (value, c) => {
  const { phoneNumber } = value;
  console.log("phoneNumber", phoneNumber);
  const result = phoneNumberSchema.safeParse(phoneNumber);
  if (!result.success) {
    console.log("Invalid phone number!");
    throw new HTTPException(401, { message: "Invalid phone number!" });
  }
  return result.data;
});

//* might com in handy -
// const buildJsonValidator = (schema: z.Schema) => {
//     return validator('json', (value, c) => {
//       const result = schema.safeParse(value)
//       if (!result.success) {
//         return c.json({ errors: result.error/*.formErrors.fieldErrors*/ }, 400)
//       }
//       return result.data
//     })
//   }
//  const validatePost = buildValidator(postSchema)
