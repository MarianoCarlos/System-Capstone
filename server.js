// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
	cors: {
		origin: "*", // adjust for your frontend origin in production
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

		const otherUser = rooms[roomId].find((id) => id !== socket.id);
		if (otherUser) {
			socket.emit("new-user", otherUser); // Notify self who is remote
		}

		socket.on("offer", ({ sdp, to }) => {
			io.to(to).emit("offer", { sdp, from: socket.id });
		});

		socket.on("answer", ({ sdp, to }) => {
			io.to(to).emit("answer", { sdp });
		});

		socket.on("ice-candidate", ({ candidate, to }) => {
			io.to(to).emit("ice-candidate", candidate);
		});

		socket.on("disconnect", () => {
			console.log(`${socket.id} disconnected`);
			rooms[roomId] = rooms[roomId].filter((id) => id !== socket.id);
			if (rooms[roomId].length === 0) delete rooms[roomId];
		});
	});
});

server.listen(3001, () => {
	console.log("Socket.IO server running on port 3001");
});
