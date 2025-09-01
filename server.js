// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// --- Routes ---
app.get("/", (req, res) => {
	res.send("Welcome! Socket.IO server is running.");
});

app.get("/health", (req, res) => {
	res.send("✅ Server is alive!");
});

// --- Socket.IO setup ---
const io = new Server(server, {
	cors: {
		origin: "*", // change to your frontend origin in production
		methods: ["GET", "POST"],
	},
});

const rooms = {}; // Track users in rooms

io.on("connection", (socket) => {
	console.log("New user connected:", socket.id);

	socket.on("join-room", (roomId) => {
		console.log(`${socket.id} joined room ${roomId}`);

		if (!rooms[roomId]) rooms[roomId] = [];
		rooms[roomId].push(socket.id);

		// Notify the other user in the room
		const otherUser = rooms[roomId].find((id) => id !== socket.id);
		if (otherUser) {
			socket.emit("new-user", otherUser); // notify new user
			io.to(otherUser).emit("new-user", socket.id); // notify existing user
		}

		// --- WebRTC signaling ---
		socket.on("offer", ({ sdp, to }) => {
			io.to(to).emit("offer", { sdp, from: socket.id });
		});

		socket.on("answer", ({ sdp, to }) => {
			io.to(to).emit("answer", { sdp, from: socket.id });
		});

		socket.on("ice-candidate", ({ candidate, to }) => {
			io.to(to).emit("ice-candidate", { candidate, from: socket.id });
		});

		// --- Disconnect handling ---
		socket.on("disconnect", () => {
			console.log(`${socket.id} disconnected`);
			rooms[roomId] = rooms[roomId].filter((id) => id !== socket.id);
			if (rooms[roomId].length === 0) delete rooms[roomId];
		});
	});
});

// --- Start server ---
const PORT = 3002;
server.listen(PORT, () => {
	console.log(`✅ Server is running on http://localhost:${PORT}`);
});
