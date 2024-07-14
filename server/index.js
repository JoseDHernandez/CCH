import express from "express";
import morgan from "morgan";
import { Server as SocketServer } from "socket.io";
import cors from "cors";
import { PORT, urlClient, DB_HOST } from "./config.js";
import cardsRoutes from "./routes/cards.routes.js";
import usersRoutes from "./routes/users.routes.js";
import gameRoutes from "./routes/game.routes.js";
import authRoutes from "./routes/auth.routes.js";
import http from "http";
import sockets from "./routes/sockets.js";
const app = express();
const server = http.createServer(app);
//Cors of the Sockets
const io = new SocketServer(server, {
  cors: {
    origin: urlClient,
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});
//Morgan format
app.use(morgan("dev"));
//axios cors
app.use(
  cors({
    origin: urlClient,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);
//Routes and listeners
sockets(io);
app.use(express.json());
app.use(cardsRoutes);
app.use(usersRoutes);
app.use(gameRoutes);
app.use(authRoutes);
server.listen(PORT);
//Console information
console.log(`\n\n=================================================`);
console.log("URL Client:  " + urlClient);
console.log("Server running:  " + DB_HOST + ":" + PORT);
console.log(`=================================================\n\n`);
