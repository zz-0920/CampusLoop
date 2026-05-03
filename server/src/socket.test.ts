import { describe, it, beforeAll, afterAll } from "vitest";
import { io as ioc, type Socket as ClientSocket } from "socket.io-client";
import { httpServer, app } from "./app.js";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";

describe("Socket Room Management", () => {
  let clientSocket: ClientSocket;
  const port = 4001;
  const token = jwt.sign({ id: 1, username: "testuser" }, process.env.JWT_SECRET || "loading_secret");

  beforeAll(() => {
    return new Promise((resolve) => {
      httpServer.listen(port, () => {
        clientSocket = ioc(`http://localhost:${port}`, {
          auth: { token },
          transports: ['websocket'],
        });
        clientSocket.on("connect", resolve);
      });
    });
  });

  afterAll(() => {
    httpServer.close();
    clientSocket.disconnect();
  });

  it("should receive message when in room after joining", () => {
    return new Promise((resolve, reject) => {
      const roomId = "test_room";
      const testMessage = { content: "hello" };

      clientSocket.emit("join_room", roomId);

      clientSocket.on("receive_message", (msg) => {
        if (msg.content === "hello") {
            resolve(true);
        }
      });

      // Trigger emit from server side after some delay to allow join_room to be processed
      setTimeout(() => {
        const io = app.context.io as Server;
        io.to(roomId).emit("receive_message", testMessage);
      }, 200);

      // Timeout if not received
      setTimeout(() => {
        reject(new Error("Message not received in room test_room"));
      }, 2000);
    });
  });

  it("should NOT receive message after leaving room", () => {
    return new Promise((resolve, reject) => {
      const roomId = "test_room_leave";
      const testMessage = { content: "should not see this" };
      let received = false;

      clientSocket.emit("join_room", roomId);
      
      setTimeout(() => {
        clientSocket.emit("leave_room", roomId);
        
        setTimeout(() => {
          clientSocket.on("receive_message", (msg) => {
            if (msg.content === "should not see this") {
                received = true;
            }
          });

          const io = app.context.io as Server;
          io.to(roomId).emit("receive_message", testMessage);

          setTimeout(() => {
            if (received) {
              reject(new Error("Received message after leaving room"));
            } else {
              resolve(true);
            }
          }, 500);
        }, 100);
      }, 100);
    });
  });
});
