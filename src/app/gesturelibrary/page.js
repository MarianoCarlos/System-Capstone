"use client";

import { useState } from "react";

export default function GestureLibrary() {
	const [searchTerm, setSearchTerm] = useState("");
	const [filter, setFilter] = useState("all");

	const gestures = [
		// Letters (images)
		{ title: "Letter A", category: "letters", type: "image", src: "/gestures/letters/A.png" },
		{ title: "Letter B", category: "letters", type: "image", src: "/gestures/letters/B.png" },
		// Numbers (images)
		{ title: "Number 1", category: "numbers", type: "image", src: "/gestures/numbers/1.png" },
		{ title: "Number 2", category: "numbers", type: "image", src: "/gestures/numbers/2.png" },
		// Words (videos)
		{ title: "Hello", category: "words", type: "video", src: "/gestures/words/hello.mp4" },
		{ title: "Thank You", category: "words", type: "video", src: "/gestures/words/thankyou.mp4" },
		// Phrases (videos)
		{ title: "Good Morning", category: "phrases", type: "video", src: "/gestures/phrases/goodmorning.mp4" },
		{ title: "How are you?", category: "phrases", type: "video", src: "/gestures/phrases/howareyou.mp4" },
	];

	const filteredGestures = gestures.filter((gesture) => {
		const matchesCategory = filter === "all" || gesture.category === filter;
		const matchesSearch = gesture.title.toLowerCase().includes(searchTerm.toLowerCase());
		return matchesCategory && matchesSearch;
	});

	return (
		<div className="min-h-screen p-6">
			<h1 className="text-center text-3xl font-bold mb-6">Gesture Library</h1>

			{/* Search Bar */}
			<div className="flex justify-center mb-4">
				<input
					type="text"
					placeholder="Search gestures..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="px-4 py-2 rounded-full w-full max-w-md focus:outline-none border"
				/>
			</div>

			{/* Category Filter */}
			<div className="flex justify-center gap-3 flex-wrap mb-6">
				{["all", "numbers", "letters", "words", "phrases"].map((cat) => (
					<button
						key={cat}
						className={`px-4 py-2 rounded-full font-semibold border ${
							filter === cat ? "text-indigo-600" : "text-gray-700"
						}`}
						onClick={() => setFilter(cat)}
					>
						{cat.charAt(0).toUpperCase() + cat.slice(1)}
					</button>
				))}
			</div>

			{/* Gesture Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
				{filteredGestures.map((gesture, idx) => (
					<div key={idx} className="rounded-xl p-4 flex flex-col items-center border">
						{gesture.type === "image" ? (
							<img
								src={gesture.src}
								alt={gesture.title}
								className="w-full h-40 object-contain rounded-lg"
							/>
						) : (
							<video src={gesture.src} controls className="w-full h-40 object-contain rounded-lg" />
						)}
						<h3 className="font-bold mt-2">{gesture.title}</h3>
						<p className="text-sm capitalize">{gesture.category}</p>
					</div>
				))}
				{filteredGestures.length === 0 && <p className="col-span-full text-center mt-6">No gestures found.</p>}
			</div>
		</div>
	);
}
