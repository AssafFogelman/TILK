import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { prettyJSON } from "hono/pretty-json";
import { secureHeaders } from "hono/secure-headers";
import { logger } from "hono/logger";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { serveStatic } from "@hono/node-server/serve-static";
import { cors } from "hono/cors";
import { Server } from "socket.io";
import { Server as HttpServer } from "http";

//"strict: false" means that "api/" and "api" will reach the same end-point
const app = new Hono({ strict: false });

/* Pretty JSON middleware enables "JSON pretty print" for JSON response body. 
  Adding 
  "?pretty"
  to url query param, the JSON strings are prettified. */
//ex. GET /?pretty
app.use(prettyJSON());
//like "helmet".
//conflicts with poweredBy() middleware (adds a header: "X-Powered-By": "Hono").
//But I frankly don't care
app.use(secureHeaders());
//logger
app.use(logger());

//enable cors if we are not in production mode
// app.use(
//   "*",
//   cors({ origin: process.env.DEV_OR_PRODUCTION === "production" ? "*" : "" })
// );
app.use(cors({ origin: "*" }));
//! Is this needed? It seems to work without CORS.. does this work?! if so, add it to the notebook

app.get("/", (c) => {
  return c.json({ message: "Hello Hono!" });
});

//setting a static (public) directory
app.use("/files/*", serveStatic({ root: "./" }));
//It works!

//setting up the server listener to the port
const port = 5000;

const server = serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`Server is running on: http://${info.address}:${info.port}`);
    //http://127.0.0.1:5000/
  }
);
const io = new Server(server as HttpServer, {
  path: "/",
  serveClient: true,
  cors: {
    origin: process.env.DEV_OR_PRODUCTION === "production" ? false : "*",
  },
});
io.on("error", (err) => console.log("error: ", err));
io.on("connection", (socket) => {
  console.log(
    `client connected! id: ${socket.id}, headers: ${socket.request.headers}`
  );
  socket.on("disconnect", () => {
    console.log(`user ${socket.id} disconnected`);
  });
});
