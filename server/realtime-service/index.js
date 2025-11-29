require("dotenv").config();

const express = require("express");
const http = require("http");
const amqp = require("amqplib");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "secret_key";

// Log JWT_SECRET info (first 4 chars only for security)
console.log(`🔑 JWT_SECRET configured: ${JWT_SECRET.substring(0, 4)}... (length: ${JWT_SECRET.length})`);

const PORT = process.env.PORT || 4100;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const RABBIT_URL =
  process.env.RABBITMQ_URI ||
  process.env.RABBITMQ_URL ||
  "amqp://rabbitmq:5672";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL || "*", // Allow all origins if FRONTEND_URL not set
    credentials: true,
    methods: ["GET", "POST"],
    allowedHeaders: ["Authorization", "Content-Type"],
  },
  transports: ["websocket", "polling"], // Support both transports
  allowEIO3: true, // Backward compatibility
  pingTimeout: 60000, // 60 seconds - tăng timeout để tránh disconnect
  pingInterval: 25000, // 25 seconds - ping mỗi 25s để giữ connection alive
  upgradeTimeout: 10000, // 10 seconds cho upgrade
});

app.get("/healthz", (req, res) => {
  res.json({ status: "ok", rabbit: !!currentChannel });
});

io.use((socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(" ")[1];
    
    if (!token) {
      console.warn(`⚠️ Connection rejected: Missing token from ${socket.handshake.address || 'unknown'}`);
      // Return error nhưng không đóng connection ngay - để client có thể retry
      return next(new Error("Missing token"));
    }
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.user = decoded;
      console.log(`✅ Connection authenticated: ${decoded.id || decoded._id || decoded.email || 'unknown'} (${socket.id})`);
      next();
    } catch (jwtErr) {
      // Log error nhưng không quá verbose
      if (jwtErr.message.includes("expired")) {
        console.warn(`⚠️ Connection rejected: Token expired for ${socket.handshake.address || 'unknown'}`);
      } else if (jwtErr.message.includes("signature")) {
        console.warn(`⚠️ Connection rejected: Invalid token signature for ${socket.handshake.address || 'unknown'}`);
      } else {
        console.warn(`⚠️ Connection rejected: ${jwtErr.message} for ${socket.handshake.address || 'unknown'}`);
      }
      next(new Error(`Invalid token: ${jwtErr.message}`));
    }
  } catch (err) {
    console.error("❌ Auth middleware error:", err.message);
    next(new Error(`Authentication error: ${err.message}`));
  }
});

io.on("connection", (socket) => {
  console.log(`🔌 Client connected: ${socket.id} (user: ${socket.user?.id || socket.user?._id || socket.user?.email || 'unknown'})`);
  
  // Setup ping/pong để giữ connection alive
  socket.on("ping", () => {
    socket.emit("pong");
  });

  socket.on("disconnect", (reason) => {
    console.log(`🔌 Client disconnected: ${socket.id} (reason: ${reason})`);
    
    // Log chi tiết hơn về lý do disconnect
    if (reason === "transport close") {
      console.warn(`⚠️ Transport closed for ${socket.id} - may be due to network timeout`);
    } else if (reason === "ping timeout") {
      console.warn(`⚠️ Ping timeout for ${socket.id} - connection may be unstable`);
    }
  });
  
  socket.on("error", (err) => {
    console.error(`❌ Socket error for ${socket.id}:`, err.message);
  });

  socket.on("connect_error", (err) => {
    console.error(`❌ Connection error for ${socket.id}:`, err.message);
  });

  // Handle reconnection từ client
  socket.on("reconnect_attempt", () => {
    console.log(`🔄 Client ${socket.id} attempting to reconnect...`);
  });
});

// Handle server-level errors
io.engine.on("connection_error", (err) => {
  console.error("❌ Engine connection error:", err.message);
});

server.on("error", (err) => {
  console.error("❌ HTTP server error:", err.message);
});

let currentChannel;

const broadcastEvent = ({ event, payload }, source) => {
  const evt = event || source || "event";
  io.emit(evt, {
    payload: payload ?? {},
    source,
    timestamp: new Date().toISOString(),
  });
};

const subscribeToExchange = async (channel, exchange) => {
  await channel.assertExchange(exchange, "fanout", { durable: false });
  const { queue } = await channel.assertQueue("", { exclusive: true });
  await channel.bindQueue(queue, exchange, "");

  channel.consume(
    queue,
    (msg) => {
      if (!msg?.content) return;
      try {
        const data = JSON.parse(msg.content.toString());
        broadcastEvent(data, msg.fields.exchange);
      } catch (err) {
        console.error("❌ Failed to broadcast event:", err.message);
      }
    },
    { noAck: true }
  );

  console.log(`📡 Subscribed to exchange ${exchange}`);
};

const connectRabbit = async () => {
  try {
    const connection = await amqp.connect(RABBIT_URL);
    connection.on("close", () => {
      console.warn("⚠️ RabbitMQ connection closed. Reconnecting...");
      currentChannel = null;
      setTimeout(connectRabbit, 5000);
    });
    connection.on("error", (err) => {
      console.error("⚠️ RabbitMQ connection error:", err.message);
    });

    const channel = await connection.createChannel();
    currentChannel = channel;

    await subscribeToExchange(channel, "director_events");
    await subscribeToExchange(channel, "plan_events");

    console.log("✅ Realtime service connected to RabbitMQ");
  } catch (error) {
    console.error("❌ Cannot connect to RabbitMQ:", error.message);
    currentChannel = null;
    setTimeout(connectRabbit, 5000);
  }
};

connectRabbit();

server.listen(PORT, () => {
  console.log(`🚀 Realtime service listening on port ${PORT}`);
});

