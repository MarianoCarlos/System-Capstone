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

	// ---------------- Socket.IO ----------------
	useEffect(() => {
		socket.current = io(SOCKET_SERVER_URL);

		socket.current.on("connect", () => socket.current.emit("join-room", "my-room"));

		socket.current.on("new-user", async (id) => {
			remoteIdRef.current = id;
			if (!pc.current) initializePeerConnection();
			addLocalTracks();
			await createOffer(id);
			flushICEQueue(id);
		});

		socket.current.on("offer", async ({ sdp, from }) => {
			remoteIdRef.current = from;
			if (!pc.current) initializePeerConnection();
			addLocalTracks();
			await handleOffer(sdp, from);
		});

		socket.current.on("answer", async ({ sdp }) => {
			if (pc.current) await pc.current.setRemoteDescription(sdp);
		});

		socket.current.on("ice-candidate", async ({ candidate }) => {
			if (candidate && pc.current) {
				try {
					await pc.current.addIceCandidate(candidate);
				} catch (err) {
					console.error("Error adding ICE candidate:", err);
				}
			}
		});

		socket.current.on("end-call", () => endCall(false));

		return () => {
			endCall(false);
			socket.current.disconnect();
		};
	}, []);

	// ---------------- WebRTC ----------------
	const initializePeerConnection = () => {
		pc.current = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });

		pc.current.ontrack = (event) => {
			if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
		};

		pc.current.onicecandidate = (event) => {
			if (event.candidate) {
				if (remoteIdRef.current) {
					socket.current.emit("ice-candidate", { candidate: event.candidate, to: remoteIdRef.current });
				} else {
					iceQueue.current.push(event.candidate);
				}
			}
		};
	};

	const flushICEQueue = (id) => {
		iceQueue.current.forEach((candidate) => socket.current.emit("ice-candidate", { candidate, to: id }));
		iceQueue.current = [];
	};

	const addLocalTracks = () => {
		if (!pc.current || !localVideoRef.current?.srcObject) return;
		localVideoRef.current.srcObject.getTracks().forEach((track) => {
			if (!pc.current.getSenders().some((s) => s.track === track)) {
				pc.current.addTrack(track, localVideoRef.current.srcObject);
			}
		});
	};

	const createOffer = async (id) => {
		if (!pc.current) return;
		try {
			const offer = await pc.current.createOffer();
			await pc.current.setLocalDescription(offer);
			socket.current.emit("offer", { sdp: offer, to: id });
		} catch (err) {
			console.error("Error creating offer:", err);
		}
	};

	const handleOffer = async (sdp, from) => {
		if (!pc.current) initializePeerConnection();
		addLocalTracks();
		try {
			await pc.current.setRemoteDescription(sdp);
			const answer = await pc.current.createAnswer();
			await pc.current.setLocalDescription(answer);
			socket.current.emit("answer", { sdp: answer, to: from });
		} catch (err) {
			console.error("Error handling offer:", err);
		}
	};

	// ---------------- Video Controls ----------------
	const startVideo = async () => {
		if (callActive) return;
		if (!navigator.mediaDevices?.getUserMedia) {
			alert("Camera/microphone not supported.");
			return;
		}
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
			localVideoRef.current.srcObject = stream;
			if (!pc.current) initializePeerConnection();
			addLocalTracks();
			setCallActive(true);
		} catch (err) {
			console.error("Cannot access camera/microphone:", err);
			alert("Allow camera/microphone permissions.");
		}
	};

	const endCall = (notifyRemote = true) => {
		if (!callActive) return;
		if (notifyRemote && remoteIdRef.current) socket.current.emit("end-call", { to: remoteIdRef.current });

		localVideoRef.current?.srcObject?.getTracks().forEach((t) => t.stop());
		localVideoRef.current.srcObject = null;
		remoteVideoRef.current?.srcObject?.getTracks().forEach((t) => t.stop());
		remoteVideoRef.current.srcObject = null;

		pc.current?.close();
		pc.current = null;
		remoteIdRef.current = null;
		setLiveTranslationLocal("");
		setLiveTranslationRemote("");
		setCallActive(false);
	};

	const toggleMute = () => {
		setIsMuted((prev) => {
			localVideoRef.current?.srcObject?.getAudioTracks().forEach((t) => (t.enabled = prev));
			return !prev;
		});
	};

	const toggleCamera = () => {
		setCameraOn((prev) => {
			localVideoRef.current?.srcObject?.getVideoTracks().forEach((t) => (t.enabled = !prev));
			return !prev;
		});
	};

	// ---------------- ASL Translation ----------------
	const captureFrameBlob = (videoRef, scale = 1) => {
		if (!videoRef.current) return null;
		const video = videoRef.current;
		const canvas = document.createElement("canvas");
		canvas.width = video.videoWidth * scale;
		canvas.height = video.videoHeight * scale;
		canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
		return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.8));
	};

	const sendFrameToBackend = async (videoRef, setTranslation, sender = "local") => {
		const blob = await captureFrameBlob(videoRef, sender === "remote" ? 0.3 : 1);
		if (!blob) return;
		const formData = new FormData();
		formData.append("file", blob, "frame.jpg");

		try {
			const res = await fetch(ASL_BACKEND_URL, { method: "POST", body: formData });
			const data = await res.json();
			if (data.prediction) {
				setTranslation(data.prediction);
				setTranslations((prev) => [
					...prev,
					{
						textEn: data.prediction,
						textFil: data.prediction,
						timestamp: new Date().toLocaleTimeString(),
						sender,
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

	const toggleChatLang = (index) => {
		setTranslations((prev) =>
			prev.map((item, i) => (i === index ? { ...item, showLang: item.showLang === "En" ? "Fil" : "En" } : item))
		);
	};

	const copyText = (text) => navigator.clipboard.writeText(text);
	const speakText = (text, lang) => {
		speechSynthesis.cancel();
		const u = new SpeechSynthesisUtterance(text);
		u.lang = lang === "Filipino" ? "fil-PH" : "en-US";
		speechSynthesis.speak(u);
	};

	// ---------------- JSX ----------------
	return (
		<div className="flex h-screen bg-gray-100 text-gray-900">
			<main className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
				<div className="flex gap-6 w-full justify-center flex-wrap relative">
					{/* Local */}
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
					{/* Remote */}
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
						className={`flex items-center gap-2 px-5 py-3 rounded-full ${
							isMuted ? "bg-gray-500" : "bg-red-500"
						} text-white`}
					>
						{isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />} {isMuted ? "Unmute" : "Mute"}
					</button>
					<button
						onClick={toggleCamera}
						className={`flex items-center gap-2 px-5 py-3 rounded-full ${
							cameraOn ? "bg-blue-500" : "bg-gray-500"
						} text-white`}
					>
						{cameraOn ? <FaVideo /> : <FaVideoSlash />} {cameraOn ? "Camera On" : "Camera Off"}
					</button>
					{!callActive ? (
						<button
							onClick={startVideo}
							className="flex items-center gap-2 px-5 py-3 rounded-full bg-green-500 text-white"
						>
							<FaPhone /> Start Call
						</button>
					) : (
						<button
							onClick={() => endCall()}
							className="flex items-center gap-2 px-5 py-3 rounded-full bg-red-600 text-white"
						>
							<FaPhoneSlash /> End Call
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

			{/* Translation History */}
			<aside className="w-80 flex-shrink-0 bg-white shadow-lg p-4 overflow-y-auto border-l border-gray-200 flex flex-col">
				<h2 className="text-lg font-semibold mb-4">Translation History</h2>
				<div className="flex flex-col gap-3">
					{translations.map((item, i) => {
						const text = item.showLang === "En" ? item.textEn : item.textFil;
						const alignment =
							item.sender === "local"
								? "self-end bg-blue-100 text-right"
								: "self-start bg-green-100 text-left";
						return (
							<div key={i} className={`p-3 rounded-lg shadow-sm max-w-[85%] ${alignment}`}>
								<p className="font-medium">{text}</p>
								<p className="text-xs text-gray-600">{item.timestamp}</p>
								<p className="text-xs text-green-700">Accuracy: {item.accuracy}</p>
								<div className="flex gap-2 mt-2 justify-end">
									<button
										onClick={() => toggleChatLang(i)}
										className="px-2 py-1 text-xs bg-yellow-500 text-white rounded"
									>
										{item.showLang === "En" ? "Filipino" : "English"}
									</button>
									<button
										onClick={() => copyText(text)}
										className="px-2 py-1 text-xs bg-blue-500 text-white rounded"
									>
										Copy
									</button>
									<button
										onClick={() => speakText(text, item.showLang === "En" ? "English" : "Filipino")}
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
