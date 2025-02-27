import { Socket } from "socket.io-client";
import { EmitResponse } from "../types/types";

type EmitCallback<T> = (emitResponse: EmitResponse<T>) => void;
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
  let attempts = 0;
  const MAX_ATTEMPTS = 100;

  tryEmit();

  function tryEmit() {
    // If we've exceeded max attempts, stop trying
    if (attempts >= MAX_ATTEMPTS) {
      console.log(`Failed to emit ${event} after ${MAX_ATTEMPTS} attempts`);
      onAcknowledgement?.({
        error: new Error(`Failed to emit after ${MAX_ATTEMPTS} attempts`),
      });
      return;
    }

    // If socket is disconnected, wait for reconnection
    console.log("in emit.ts - socket is connected:", socket.connected);
    if (!socket.connected) {
      console.log(
        `Socket disconnected, waiting for reconnection before emitting ${event}`,
        {
          isConnected: socket.connected,
        }
      );

      //listen for reconnection only once
      socket.once("connect", reconnectHandler);
      return;

      function reconnectHandler() {
        console.log("Socket reconnected, retrying emit");
        socket.off("connect", reconnectHandler);
        setTimeout(() => tryEmit(), 100); // Small delay to ensure socket is ready
      }
    }

    attempts++;
    socket
      .timeout(5000)
      .emit(
        event,
        arg,
        (error: Error | null, emitResponse: EmitResponse<T>) => {
          if (error) {
            // no ack arrived from the server until the timeout, let's retry
            console.log(
              `Emit attempt ${attempts} failed for event "${event}":`,
              error
            );
            tryEmit();
          } else {
            // the response from the server (which includes an error property that might be null)
            onAcknowledgement?.(emitResponse);
          }
        }
      );
  }
}
