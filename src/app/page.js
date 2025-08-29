"use client";

export default function Home() {
	return (
		<main className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-neutral-950 dark:to-black">
			{/* Header / Navbar */}
			<header className="fixed top-0 left-0 w-full flex justify-between items-center px-8 py-5 bg-white/80 dark:bg-neutral-900/70 backdrop-blur-lg shadow-sm z-50">
				<div className="flex items-center gap-2">
					<div className="w-11 h-11 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full flex items-center justify-center text-white font-extrabold shadow-md">
						ASL
					</div>
					<span className="text-xl font-bold text-blue-500 tracking-wide">InSync</span>
				</div>
				<a
					href="/login"
					className="px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-400 text-white font-medium rounded-full shadow hover:shadow-blue-300/50 transition-transform hover:scale-105"
				>
					Login
				</a>
			</header>

			{/* Hero Section */}
			<section className="text-center max-w-3xl pt-32 mx-auto px-6">
				<h1 className="text-6xl md:text-7xl font-extrabold mb-6 tracking-tight leading-tight">
					Learn & Translate <span className="text-blue-500">ASL</span> Seamlessly
				</h1>
				<p className="text-lg opacity-80 mb-10 max-w-2xl mx-auto">
					An interactive platform to{" "}
					<span className="font-semibold text-blue-500">translate, learn, and practice</span> American Sign
					Language — making communication more inclusive and accessible.
				</p>
				<div className="flex justify-center">
					<a
						href="/signup"
						className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-400 text-white font-semibold rounded-full shadow-lg hover:shadow-blue-300/50 transition-transform hover:scale-110"
					>
						Get Started
					</a>
				</div>
			</section>

			{/* Features Section */}
			<section className="mt-36 grid md:grid-cols-3 gap-10 max-w-6xl w-full px-6 mx-auto">
				{[
					{
						title: "⚡ Real-Time Translation",
						desc: "Translate ASL hand signs instantly with our AI-powered recognition engine.",
					},
					{
						title: "📚 Interactive Learning",
						desc: "Master ASL through guided lessons, practice activities, and real-time feedback.",
					},
					{
						title: "🌍 Accessible for All",
						desc: "Breaking barriers and promoting inclusivity with tools designed for everyone.",
					},
				].map((feature, i) => (
					<div
						key={i}
						className="p-8 rounded-3xl shadow-lg bg-white/80 dark:bg-neutral-900/70 backdrop-blur-md border border-white/20 hover:shadow-xl transition-transform hover:-translate-y-2"
					>
						<h2 className="text-2xl font-semibold mb-3 text-blue-500">{feature.title}</h2>
						<p className="opacity-80">{feature.desc}</p>
					</div>
				))}
			</section>

			{/* Footer */}
			<footer className="mt-40 py-8 text-sm opacity-70 text-center border-t border-white/20 dark:border-neutral-800">
				<p>© {new Date().getFullYear()} InSync. All rights reserved.</p>
			</footer>
		</main>
	);
}
