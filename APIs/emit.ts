import { Socket } from "socket.io-client";

type EmitCallback<T> = (error: Error | null, response?: T) => void;
/*
 emit is designed to handle cases where the server does not respond to the event
 due to connection problems.
 but that means the server must return an acknowledgement, even if there is no data we need.
*/
export function emit<T>(
  socket: Socket,
  event: string,
  arg: unknown,
  onAcknowledgement?: EmitCallback<T>
) {
  //how many times we should check the connection before giving up
  let count = 0;
  //emit only if the websocket is connected
  checkConnection();

  //check if the websocket is connected, if not, wait for 1 second and check again
  function checkConnection() {
    if (!socket.connected) {
      //on the tenth time, give up
      if (count > 9) {
        console.log("socket is not connected, giving up");
        return;
      }
      //wait for 1 second and check connection again
      setTimeout(() => {
        count++;
        checkConnection();
      }, 1000);
      //we have a connection. Let's emit the event
    } else tryEmit();
  }

  function tryEmit() {
    socket
      .timeout(5000)
      .emit(event, arg, (error: Error | null, response?: T) => {
        if (error) {
          console.log(error, " retrying emit");
          //no acknowledgement received from the server in the given time. let's retry indefinitely
          tryEmit();
        } else {
          // the server has received the event, let's call the callback with either the error or response from the server
          onAcknowledgement?.(error, response);
        }
      });
  }
}
