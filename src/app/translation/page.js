"use client";
import { useRef, useState, useEffect } from "react";
import io from "socket.io-client";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhone } from "react-icons/fa";

const SOCKET_SERVER_URL = "https://backend-capstone-l19p.onrender.com"; // Replace with your server IP or domain

export default function VideoCallPage() {
	const localVideoRef = useRef(null);
	const remoteVideoRef = useRef(null);
	const pc = useRef(null);
	const socket = useRef(null);
	const iceQueue = useRef([]);
	const remoteIdRef = useRef(null);

	const [remoteId, setRemoteId] = useState(null);
	const [isMuted, setIsMuted] = useState(false);
	const [cameraOn, setCameraOn] = useState(true);
	const [liveTranslation, setLiveTranslation] = useState("");
	const [translations, setTranslations] = useState([
		{
			sender: "local",
			textEn: "Hello, how are you?",
			textFil: "Kamusta, kumusta ka?",
			accuracy: "98%",
			timestamp: "10:32 AM",
			showLang: "En",
		},
		{
			sender: "remote",
			textEn: "I am fine, thank you!",
			textFil: "Ayos lang ako, salamat!",
			accuracy: "97%",
			timestamp: "10:33 AM",
			showLang: "En",
		},
	]);

	useEffect(() => {
		// Initialize Socket.IO
		socket.current = io(SOCKET_SERVER_URL);

		// Initialize PeerConnection
		pc.current = new RTCPeerConnection({
			iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
		});

		// Handle remote stream
		pc.current.ontrack = (event) => {
			if (remoteVideoRef.current) {
				remoteVideoRef.current.srcObject = event.streams[0];
			}
		};

		// ICE candidates
		pc.current.onicecandidate = (event) => {
			if (event.candidate) {
				if (remoteIdRef.current) {
					socket.current.emit("ice-candidate", { candidate: event.candidate, to: remoteIdRef.current });
				} else {
					iceQueue.current.push(event.candidate);
				}
			}
		};

		// New user joined
		socket.current.on("new-user", async (id) => {
			console.log("Discovered new user:", id);
			setRemoteId(id);
			remoteIdRef.current = id;

			// Send queued ICE candidates
			iceQueue.current.forEach((candidate) => socket.current.emit("ice-candidate", { candidate, to: id }));
			iceQueue.current = [];

			// Create offer if local video exists
			if (localVideoRef.current?.srcObject) {
				try {
					const offer = await pc.current.createOffer();
					await pc.current.setLocalDescription(offer);
					socket.current.emit("offer", { sdp: offer, to: id });
				} catch (err) {
					console.error("Error creating offer:", err);
				}
			}
		});

		// Receive offer
		socket.current.on("offer", async (data) => {
			setRemoteId(data.from);
			remoteIdRef.current = data.from;

			try {
				await pc.current.setRemoteDescription(data.sdp);
				const answer = await pc.current.createAnswer();
				await pc.current.setLocalDescription(answer);
				socket.current.emit("answer", { sdp: answer, to: data.from });
			} catch (err) {
				console.error("Error handling offer:", err);
			}
		});

		// Receive answer
		socket.current.on("answer", async (data) => {
			try {
				await pc.current.setRemoteDescription(data.sdp);
			} catch (err) {
				console.error("Error setting remote description (answer):", err);
			}
		});

		// Receive ICE candidates
		socket.current.on("ice-candidate", async ({ candidate }) => {
			if (!candidate) return;
			try {
				await pc.current.addIceCandidate(candidate);
			} catch (err) {
				console.error("Error adding ICE candidate:", err);
			}
		});

		// Join room
		socket.current.emit("join-room", "my-room");

		return () => {
			// Cleanup
			socket.current.disconnect();
			pc.current.close();
			localVideoRef.current?.srcObject?.getTracks().forEach((track) => track.stop());
			remoteVideoRef.current?.srcObject?.getTracks().forEach((track) => track.stop());
		};
	}, []);

	const startVideo = async () => {
		if (!navigator.mediaDevices?.getUserMedia) {
			alert("Camera/microphone not supported. Use Chrome, Edge, or Safari over HTTPS.");
			return;
		}

		try {
			const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
			if (localVideoRef.current) localVideoRef.current.srcObject = stream;
			stream.getTracks().forEach((track) => pc.current.addTrack(track, stream));

			// Offer is only sent via 'new-user' event to avoid duplicates
		} catch (err) {
			console.error("Error accessing camera/microphone:", err);
			alert("Cannot access camera/microphone. Please allow permissions and use HTTPS.");
		}
	};

	const toggleMute = () => {
		const newMuted = !isMuted;
		localVideoRef.current?.srcObject?.getAudioTracks().forEach((track) => (track.enabled = !newMuted));
		setIsMuted(newMuted);
	};

	const toggleCamera = () => {
		const newCameraOn = !cameraOn;
		localVideoRef.current?.srcObject?.getVideoTracks().forEach((track) => (track.enabled = newCameraOn));
		setCameraOn(newCameraOn);
	};

	const copyText = (text) => navigator.clipboard.writeText(text);
	const speakText = (text, lang) => {
		speechSynthesis.cancel(); // Cancel any ongoing speech
		const utterance = new SpeechSynthesisUtterance(text);
		utterance.lang = lang === "Filipino" ? "fil-PH" : "en-US";
		speechSynthesis.speak(utterance);
	};
	const toggleChatLang = (index) => {
		setTranslations((prev) =>
			prev.map((item, i) => (i === index ? { ...item, showLang: item.showLang === "En" ? "Fil" : "En" } : item))
		);
	};

	return (
		<div className="flex h-screen bg-gray-100 text-gray-900">
			<main className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
				<div className="flex gap-6 w-full justify-center flex-wrap relative">
					<div className="relative">
						<video
							ref={localVideoRef}
							autoPlay
							muted
							playsInline
							className="w-80 h-60 md:w-[35rem] md:h-[25rem] bg-black rounded-xl shadow-lg"
						/>
						<div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded flex items-center gap-2 text-sm">
							<span>You</span>
							{isMuted ? (
								<FaMicrophoneSlash className="text-red-500" />
							) : (
								<FaMicrophone className="text-green-500" />
							)}
							{cameraOn ? (
								<FaVideo className="text-green-500" />
							) : (
								<FaVideoSlash className="text-red-500" />
							)}
						</div>
					</div>

					<div className="relative">
						<video
							ref={remoteVideoRef}
							autoPlay
							playsInline
							className="w-80 h-60 md:w-[35rem] md:h-[25rem] bg-black rounded-xl shadow-lg"
						/>
						<div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded flex items-center gap-2 text-sm">
							<span>Remote</span>
							<FaMicrophone className="text-green-500" />
							<FaVideo className="text-green-500" />
						</div>
					</div>
				</div>

				<div className="flex gap-6">
					<button
						onClick={toggleMute}
						className={`flex items-center gap-2 px-5 py-3 rounded-full shadow-lg text-white transition-transform hover:scale-105 ${
							isMuted ? "bg-gray-500" : "bg-red-500"
						}`}
					>
						{isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />} <span>{isMuted ? "Unmute" : "Mute"}</span>
					</button>
					<button
						onClick={toggleCamera}
						className={`flex items-center gap-2 px-5 py-3 rounded-full shadow-lg text-white transition-transform hover:scale-105 ${
							cameraOn ? "bg-blue-500" : "bg-gray-500"
						}`}
					>
						{cameraOn ? <FaVideo /> : <FaVideoSlash />} <span>{cameraOn ? "Camera On" : "Camera Off"}</span>
					</button>
					<button
						onClick={startVideo}
						className="flex items-center gap-2 px-5 py-3 rounded-full bg-green-500 shadow-lg text-white transition-transform hover:scale-105"
					>
						<FaPhone /> <span>Start Call</span>
					</button>
				</div>

				<div className="w-full max-w-4xl bg-white rounded-xl shadow p-4">
					<div className="flex justify-between items-center mb-2">
						<h3 className="text-md font-semibold">Live Translation</h3>
						<button
							onClick={() => setLiveTranslation("")}
							className="px-3 py-1 text-xs bg-red-500 text-white rounded shadow hover:bg-red-600"
						>
							Clear
						</button>
					</div>
					<div className="h-28 bg-gray-50 p-3 rounded-md border overflow-y-auto">
						<p className="text-gray-700">{liveTranslation || "Ongoing translation appears here..."}</p>
					</div>
				</div>
			</main>

			<aside className="w-80 flex-shrink-0 bg-white shadow-lg p-4 overflow-y-auto border-l border-gray-200 flex flex-col">
				<h2 className="text-lg font-semibold mb-4">Translation History</h2>
				<div className="flex flex-col gap-3">
					{translations.map((item, i) => {
						const textToShow = item.showLang === "En" ? item.textEn : item.textFil;
						const langLabel = item.showLang === "En" ? "English" : "Filipino";
						const alignment =
							item.sender === "local"
								? "self-end bg-blue-100 text-right"
								: "self-start bg-green-100 text-left";
						return (
							<div key={i} className={`p-3 rounded-lg shadow-sm max-w-[85%] ${alignment}`}>
								<p className="font-medium">{textToShow}</p>
								<p className="text-xs text-gray-600">{item.timestamp}</p>
								<p className="text-xs text-green-700">Accuracy: {item.accuracy}</p>
								<div className="flex gap-2 mt-2 justify-end">
									<button
										onClick={() => toggleChatLang(i)}
										className="px-2 py-1 text-xs bg-yellow-500 text-white rounded"
									>
										{langLabel} ↔ {item.showLang === "En" ? "Filipino" : "English"}
									</button>
									<button
										onClick={() => copyText(textToShow)}
										className="px-2 py-1 text-xs bg-blue-500 text-white rounded"
									>
										Copy
									</button>
									<button
										onClick={() => speakText(textToShow, langLabel)}
										className="px-2 py-1 text-xs bg-gray-700 text-white rounded"
									>
										Speak
									</button>
								</div>
							</div>
						);
					})}
				</div>
			</aside>
		</div>
	);
}
