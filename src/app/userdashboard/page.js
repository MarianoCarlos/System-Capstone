"use client";

import Link from "next/link";
import { Book, MessageSquare, User, LogOut, Camera, Play, Volume2, Eye } from "lucide-react";

export default function UserDashboard() {
	const userName = "John Doe"; // Replace with dynamic user data

	const translationHistory = [
		{ id: 1, text: '"Hello"', timeAgo: "2 mins ago", accuracy: "95%", language: "English" },
		{ id: 2, text: '"Salamat"', timeAgo: "1 hour ago", accuracy: "92%", language: "Filipino" },
		{ id: 3, text: '"Yes"', timeAgo: "1 day ago", accuracy: "98%", language: "English" },
		{ id: 4, text: '"Hindi"', timeAgo: "3 days ago", accuracy: "90%", language: "Filipino" },
	];

	const averageAccuracy =
		translationHistory.reduce((sum, t) => sum + parseInt(t.accuracy), 0) / translationHistory.length;

	// Common class for cards with large white border
	const cardBaseClass =
		"flex items-center justify-between p-6 bg-gray-100 dark:bg-gray-700 rounded-lg border-4 border-white/60 shadow-lg hover:shadow-xl transition";

	return (
		<div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
			{/* Sidebar */}
			<aside className="w-64 bg-white dark:bg-gray-800 shadow-md p-6 hidden md:flex flex-col">
				<h2 className="text-2xl font-bold text-blue-500 mb-6">Dashboard</h2>
				<nav className="flex flex-col gap-3 flex-1">
					<Link
						href="/translation"
						className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-blue-500"
					>
						<Camera className="w-5 h-5" /> Translation
					</Link>
					<Link
						href="/gesturelibrary"
						className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-blue-500"
					>
						<Book className="w-5 h-5" /> Gesture Library
					</Link>
					<Link
						href="/feedback"
						className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-blue-500"
					>
						<MessageSquare className="w-5 h-5" /> Feedback
					</Link>
					<Link
						href="/profile"
						className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-blue-500"
					>
						<User className="w-5 h-5" /> Profile
					</Link>
				</nav>
			</aside>

			{/* Main Content */}
			<main className="flex-1 p-8">
				<header className="flex justify-between items-center mb-8">
					<h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Welcome, {userName}!</h1>
					<Link
						href="/"
						className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-red-500"
					>
						<LogOut className="w-5 h-5" /> Logout
					</Link>
				</header>

				{/* Dashboard Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
					{[
						{
							title: "Total Translations",
							value: 23,
							icon: <User className="w-6 h-6 text-blue-400" />,
							bg: "bg-primary-light",
						},
						{
							title: "Today's Translations",
							value: 15,
							icon: <User className="w-6 h-6 text-blue-400" />,
							bg: "bg-accent-light",
						},
						{
							title: "Active Users",
							value: 8,
							icon: <User className="w-6 h-6 text-blue-400" />,
							bg: "bg-success/10",
						},
						{
							title: "Accuracy Rate",
							value: `${averageAccuracy.toFixed(1)}%`,
							icon: <User className="w-6 h-6 text-green-400" />,
							bg: "bg-secondary-light",
						},
					].map((card, idx) => (
						<div key={idx} className={cardBaseClass}>
							<div>
								<p className="text-sm text-gray-500 dark:text-gray-400">{card.title}</p>
								<p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{card.value}</p>
							</div>
							<div className={`w-12 h-12 ${card.bg} rounded-lg flex items-center justify-center`}>
								{card.icon}
							</div>
						</div>
					))}
				</div>

				{/* Quick Actions */}
				<div className="mb-10">
					<h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Quick Actions</h3>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
						{[
							{
								title: "Feedback",
								href: "/feedback",
								icon: <MessageSquare className="w-6 h-6 text-blue-400" />,
								bg: "bg-primary-light",
							},
							{
								title: "Gesture Library",
								href: "/gesturelibrary",
								icon: <Book className="w-6 h-6 text-blue-400" />,
								bg: "bg-accent-light",
							},
							{
								title: "Translation History",
								href: "/translation-history",
								icon: <User className="w-6 h-6 text-blue-400" />,
								bg: "bg-success/10",
							},
							{
								title: "Translation Camera",
								href: "/translation",
								icon: <Camera className="w-6 h-6 text-blue-400" />,
								bg: "bg-secondary-light",
							},
						].map((action, idx) => (
							<Link key={idx} href={action.href} className={cardBaseClass}>
								<div>
									<p className="text-sm text-gray-500 dark:text-gray-400">{action.title}</p>
								</div>
								<div className={`w-12 h-12 ${action.bg} rounded-lg flex items-center justify-center`}>
									{action.icon}
								</div>
							</Link>
						))}
					</div>
				</div>

				{/* Translation History */}
				<div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6">
					<h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Recent Translations</h3>
					<p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Your latest ASL to text conversions</p>
					<div className="space-y-4">
						{translationHistory.map((t) => (
							<div
								key={t.id}
								className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
							>
								<div className="flex-1">
									<p className="font-medium text-gray-800 dark:text-gray-100">{t.text}</p>
									<div className="flex items-center space-x-4 mt-1">
										<span className="text-sm text-gray-500 dark:text-gray-400">{t.timeAgo}</span>
										<span className="px-2 py-0.5 border rounded text-xs text-gray-700 dark:text-gray-200">
											{t.language}
										</span>
										<span className="text-sm text-green-600 dark:text-green-400">
											{t.accuracy} accuracy
										</span>
									</div>
								</div>
								<div className="flex items-center space-x-2">
									<button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
										<Play className="w-4 h-4" />
									</button>
									<button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
										<Volume2 className="w-4 h-4" />
									</button>
									<button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
										<Eye className="w-4 h-4" />
									</button>
								</div>
							</div>
						))}
					</div>
					<button className="w-full mt-4 border-2 border-white/60 rounded-lg py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
						View All History
					</button>
				</div>
			</main>
		</div>
	);
}
