import { Socket } from "socket.io-client";

type EmitCallback<T> = (error: Error | null, response?: T) => void;

export function emit<T>(
  socket: Socket,
  event: string,
  arg: unknown,
  onAcknowledgement?: EmitCallback<T>
) {
  tryEmit();
  function tryEmit() {
    socket
      .timeout(2000)
      .emit(event, arg, (error: Error | null, response?: T) => {
        if (error) {
          //the emit failed, let's retry indefinitely
          tryEmit();
        } else {
          // the server has received the event, let's call the callback with either the error or response from the server
          onAcknowledgement?.(error, response);
        }
      });
  }
}
