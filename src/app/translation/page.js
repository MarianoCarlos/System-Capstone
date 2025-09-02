"use client";
import { useRef, useState, useEffect } from "react";
import io from "socket.io-client";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhone, FaPhoneSlash } from "react-icons/fa";

const SOCKET_SERVER_URL = "https://backend-capstone-l19p.onrender.com";
const ASL_BACKEND_URL = "https://backend-web-service-5f90.onrender.com/predict";

export default function VideoCallPage() {
	const localVideoRef = useRef(null);
	const remoteVideoRef = useRef(null);
	const pc = useRef(null);
	const socket = useRef(null);
	const iceQueue = useRef([]);
	const remoteIdRef = useRef(null);

	const [isMuted, setIsMuted] = useState(false);
	const [cameraOn, setCameraOn] = useState(true);
	const [callActive, setCallActive] = useState(false);

	const [liveTranslationLocal, setLiveTranslationLocal] = useState("");
	const [liveTranslationRemote, setLiveTranslationRemote] = useState("");
	const [translations, setTranslations] = useState([]);

	// ---------------- Socket.IO Setup ----------------
	useEffect(() => {
		socket.current = io(SOCKET_SERVER_URL);

		socket.current.on("new-user", async (id) => {
			remoteIdRef.current = id;
			await sendQueuedICE(id);
			if (localVideoRef.current?.srcObject) await createOffer(id);
		});

		socket.current.on("offer", async (data) => {
			remoteIdRef.current = data.from;
			await handleOffer(data.sdp, data.from);
		});

		socket.current.on("answer", async (data) => {
			try {
				await pc.current?.setRemoteDescription(data.sdp);
			} catch (err) {
				console.error("Error setting remote description (answer):", err);
			}
		});

		socket.current.on("ice-candidate", async ({ candidate }) => {
			if (candidate) {
				try {
					await pc.current?.addIceCandidate(candidate);
				} catch (err) {
					console.error("Error adding ICE candidate:", err);
				}
			}
		});

		socket.current.on("end-call", () => endCall(false));
		socket.current.emit("join-room", "my-room");

		return () => {
			endCall(false);
			socket.current.disconnect();
		};
	}, []);

	// ---------------- WebRTC Setup ----------------
	const initializePeerConnection = () => {
		pc.current = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });

		pc.current.ontrack = (event) => {
			if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
		};

		pc.current.onicecandidate = (event) => {
			if (!event.candidate) return;
			if (remoteIdRef.current && pc.current.remoteDescription) {
				socket.current.emit("ice-candidate", { candidate: event.candidate, to: remoteIdRef.current });
			} else {
				iceQueue.current.push(event.candidate);
			}
		};
	};

	const sendQueuedICE = async (id) => {
		if (!pc.current || !pc.current.remoteDescription) return;
		iceQueue.current.forEach((candidate) => socket.current.emit("ice-candidate", { candidate, to: id }));
		iceQueue.current = [];
	};

	const createOffer = async (id) => {
		if (!pc.current) return;
		try {
			const offer = await pc.current.createOffer();
			await pc.current.setLocalDescription(offer);
			socket.current.emit("offer", { sdp: offer, to: id });
			setTimeout(() => sendQueuedICE(id), 100);
		} catch (err) {
			console.error("Error creating offer:", err);
		}
	};

	const handleOffer = async (sdp, from) => {
		if (!pc.current) initializePeerConnection();
		const localTracks = localVideoRef.current?.srcObject?.getTracks() || [];
		localTracks.forEach((track) => {
			const alreadyAdded = pc.current.getSenders().some((sender) => sender.track === track);
			if (!alreadyAdded) pc.current.addTrack(track, localVideoRef.current.srcObject);
		});

		try {
			await pc.current.setRemoteDescription(sdp);
			const answer = await pc.current.createAnswer();
			await pc.current.setLocalDescription(answer);
			socket.current.emit("answer", { sdp: answer, to: from });
			await sendQueuedICE(from);
		} catch (err) {
			console.error("Error handling offer:", err);
		}
	};

	// ---------------- Video Call Controls ----------------
	const startVideo = async () => {
		if (callActive) return;
		initializePeerConnection();

		if (!navigator.mediaDevices?.getUserMedia) {
			alert("Camera/microphone not supported. Use Chrome, Edge, or Safari over HTTPS.");
			return;
		}

		try {
			const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
			if (localVideoRef.current) localVideoRef.current.srcObject = stream;
			stream.getTracks().forEach((track) => pc.current.addTrack(track, stream));
			setCallActive(true);
		} catch (err) {
			console.error("Cannot access camera/microphone:", err);
			alert("Please allow camera/microphone permissions.");
		}
	};

	const endCall = (notifyRemote = true) => {
		if (!callActive) return;
		if (notifyRemote && remoteIdRef.current) socket.current.emit("end-call", { to: remoteIdRef.current });

		localVideoRef.current?.srcObject?.getTracks().forEach((track) => track.stop());
		localVideoRef.current.srcObject = null;

		remoteVideoRef.current?.srcObject?.getTracks().forEach((track) => track.stop());
		remoteVideoRef.current.srcObject = null;

		pc.current?.close();
		pc.current = null;
		remoteIdRef.current = null;
		setLiveTranslationLocal("");
		setLiveTranslationRemote("");
		setCallActive(false);
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
		speechSynthesis.cancel();
		const utterance = new SpeechSynthesisUtterance(text);
		utterance.lang = lang === "Filipino" ? "fil-PH" : "en-US";
		speechSynthesis.speak(utterance);
	};
	const toggleChatLang = (index) => {
		setTranslations((prev) =>
			prev.map((item, i) => (i === index ? { ...item, showLang: item.showLang === "En" ? "Fil" : "En" } : item))
		);
	};

	// ---------------- ASL Integration for both users ----------------
	const captureFrameBlob = (videoRef, scale = 1) => {
		if (!videoRef.current) return null;
		const video = videoRef.current;
		const canvas = document.createElement("canvas");
		canvas.width = video.videoWidth * scale;
		canvas.height = video.videoHeight * scale;
		const ctx = canvas.getContext("2d");
		ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
		return new Promise((resolve) => {
			canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.8);
		});
	};

	const sendFrameToBackend = async (videoRef, setTranslation, sender = "local") => {
		const blob = await captureFrameBlob(videoRef, sender === "remote" ? 0.3 : 1);
		if (!blob) return;
		const formData = new FormData();
		formData.append("file", blob, "frame.jpg");

		try {
			const response = await fetch(ASL_BACKEND_URL, { method: "POST", body: formData });
			const data = await response.json();
			if (data.prediction) {
				setTranslation(data.prediction);
				setTranslations((prev) => [
					...prev,
					{
						textEn: data.prediction,
						textFil: data.prediction,
						timestamp: new Date().toLocaleTimeString(),
						sender: sender,
						showLang: "En",
						accuracy: "N/A",
					},
				]);
			}
		} catch (err) {
			console.error(`${sender} ASL prediction error:`, err);
		}
	};

	useEffect(() => {
		let localInterval, remoteInterval;
		if (callActive) {
			localInterval = setInterval(() => sendFrameToBackend(localVideoRef, setLiveTranslationLocal, "local"), 500);
			remoteInterval = setInterval(
				() => sendFrameToBackend(remoteVideoRef, setLiveTranslationRemote, "remote"),
				1000
			);
		}
		return () => {
			clearInterval(localInterval);
			clearInterval(remoteInterval);
		};
	}, [callActive]);

	// ---------------- JSX ----------------
	return (
		<div className="flex h-screen bg-gray-100 text-gray-900">
			<main className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
				<div className="flex gap-6 w-full justify-center flex-wrap relative">
					{/* Local Video */}
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

					{/* Remote Video */}
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

				{/* Controls */}
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
					{!callActive ? (
						<button
							onClick={startVideo}
							className="flex items-center gap-2 px-5 py-3 rounded-full bg-green-500 shadow-lg text-white transition-transform hover:scale-105"
						>
							<FaPhone /> <span>Start Call</span>
						</button>
					) : (
						<button
							onClick={() => endCall()}
							className="flex items-center gap-2 px-5 py-3 rounded-full bg-red-600 shadow-lg text-white transition-transform hover:scale-105"
						>
							<FaPhoneSlash /> <span>End Call</span>
						</button>
					)}
				</div>

				{/* Live Translations */}
				<div className="w-full max-w-4xl bg-white rounded-xl shadow p-4">
					<h3 className="text-md font-semibold">Your Translation</h3>
					<div className="h-24 bg-gray-50 p-3 rounded-md border overflow-y-auto">
						<p className="text-gray-700">{liveTranslationLocal || "Your signing translation..."}</p>
					</div>
				</div>
				<div className="w-full max-w-4xl bg-white rounded-xl shadow p-4 mt-4">
					<h3 className="text-md font-semibold">Remote Translation</h3>
					<div className="h-24 bg-gray-50 p-3 rounded-md border overflow-y-auto">
						<p className="text-gray-700">{liveTranslationRemote || "Remote signing translation..."}</p>
					</div>
				</div>
			</main>

			{/* Translation History Sidebar */}
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
