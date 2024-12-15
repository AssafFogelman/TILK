import { MessageType } from "../../../../types/types";

export async function sendMessage(message: MessageType) {
  /*
  check if the message is a duplicate (look for the last message from this sender. 
  it should have the same Pid as the last message from this sender)
  */
  //if it is a duplicate, send an error message to make the client stop sending the message.
  //if it's not, add the message to the DB with a new message Id
  //add the message to the current chat as the last message ()
  //if it's not a duplicate, send acknowledgement
  //emit the message to the other user
}
