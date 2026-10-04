import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/config.js";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import flightRoutes from "./routes/flights.js";
import bookingRoutes from "./routes/bookings.js";
import errorHandler from "./middleware/errorHandler.js";
import { initSocket } from "./utils/socket.js";
import { Server as IOServer } from "socket.io";
import http from "http";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

//1.creating server using express
const server = express();
//2.middleware to enable CORS
server.use(cors());
//middleware to parse JSON request bodies
server.use(express.json());

server.use(cookieParser());
server.use(morgan("dev"));

//4. routes
server.use("/api/auth", authRoutes);
server.use("/api/users", userRoutes);
server.use("/api/flights", flightRoutes);
server.use("/api/bookings", bookingRoutes);

// global error handler
server.use(errorHandler);

// Serve static client
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
server.use(express.static(path.join(__dirname, "client")));
server.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "client", "index.html"));
});

//5. Starting the server and listening on a specific port
const PORT = process.env.PORT || 3000;
const httpServer = http.createServer(server);
const io = new IOServer(httpServer, { cors: { origin: "*" } });
initSocket(io);

// Swagger
const openapi = YAML.load("./docs/openapi.yaml");
server.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openapi));

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
