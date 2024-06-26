import { validator } from "hono/validator";
import { z } from "zod";

//*"add-tags" route

!!!!

export const phoneNumberSchema = z.string().regex(/^\+[1-9]\d{6,14}$/); //Regular expression matching E.164 formatted phone numbers

export const validatePhoneNo = validator("json", (value, c) => {
  const { phoneNumber } = value;
  const result = phoneNumberSchema.safeParse(phoneNumber);
  if (!result.success) {
    console.log("Invalid phone number!");
    return c.json({ message: "Invalid phone number!" }, 401);
  }
  return result.data;
});

export const codeSchema = z.string().regex(/^\d{5}$/); //5 digit code
export const validateCode = validator("json", (value, c) => {
  const { code } = value;
  const result = phoneNumberSchema.safeParse(codeSchema);
  if (!result.success) {
    console.log("Invalid code!");
    return c.json({ message: "Invalid code!" }, 401);
  }
  return result.data;
});

//* might come in handy -
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
