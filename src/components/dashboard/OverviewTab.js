"use client";

import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const OverviewTab = ({ recentUsers = [], recentFeedback = [], feedbackStats = {} }) => {
	// Prepare pie chart data
	const userTypeCounts = recentUsers.reduce((acc, user) => {
		acc[user.type] = (acc[user.type] || 0) + 1;
		return acc;
	}, {});

	const pieData = {
		labels: Object.keys(userTypeCounts),
		datasets: [
			{
				data: Object.values(userTypeCounts),
				backgroundColor: ["#4f46e5", "#f97316"], // DHH: Indigo, Hearing: Orange
				hoverBackgroundColor: ["#6366f1", "#fb923c"],
			},
		],
	};

	return (
		<div className="grid lg:grid-cols-3 gap-6">
			{/* Left Column */}
			<div className="lg:col-span-2 space-y-6">
				{/* Recent Users */}
				<div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
					<div className="px-6 py-4 border-b">
						<h2 className="font-semibold text-xl text-gray-900">Recent Users</h2>
					</div>
					<ul className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
						{recentUsers.length ? (
							recentUsers.map((u) => {
								const avatarColor = u.type === "DHH" ? "bg-indigo-600" : "bg-orange-500";
								const statusColor =
									u.status === "active"
										? "bg-green-500"
										: u.status === "pending"
										? "bg-yellow-400"
										: "bg-gray-400";
								return (
									<li
										key={u.id}
										className="flex justify-between items-center px-6 py-3 hover:bg-gray-50 transition"
									>
										<div className="flex items-center gap-4">
											<div
												className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${avatarColor}`}
											>
												{u.name
													.split(" ")
													.map((n) => n[0])
													.join("")
													.toUpperCase()}
											</div>
											<div>
												<p className="font-medium text-gray-900">{u.name}</p>
												<p className="text-sm text-gray-500">{u.type}</p>
											</div>
										</div>
										<div className="flex flex-col items-end gap-1">
											<span className="text-sm text-gray-400">{u.joined}</span>
											<span className={`text-xs font-semibold flex items-center gap-1`}>
												<span className={`w-2 h-2 rounded-full ${statusColor}`}></span>
												{u.status.charAt(0).toUpperCase() + u.status.slice(1)}
											</span>
										</div>
									</li>
								);
							})
						) : (
							<li className="p-4 text-gray-500">No users found.</li>
						)}
					</ul>
				</div>

				{/* Recent Feedback */}
				<div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
					<div className="px-6 py-4 border-b flex justify-between items-center">
						<h2 className="font-semibold text-xl text-gray-900">Recent Feedback</h2>
						<div className="flex gap-4 text-sm text-gray-500">
							<span>Avg: {feedbackStats.averageRating || 0} ★</span>
							<span>New: {feedbackStats.newFeedback || 0}</span>
							<span>Pending: {feedbackStats.pendingReview || 0}</span>
						</div>
					</div>
					<ul className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
						{recentFeedback.length ? (
							recentFeedback.map((f) => (
								<li
									key={f.id}
									className="px-6 py-3 hover:bg-gray-50 transition rounded-md flex flex-col gap-1"
								>
									<div className="flex justify-between items-center">
										<p className="font-medium text-gray-900">{f.user}</p>
										<span className="text-xs text-gray-400">{f.time}</span>
									</div>
									<p className="text-sm text-gray-600">{f.comment}</p>
									<div className="flex items-center gap-1">
										{Array.from({ length: 5 }).map((_, i) => (
											<span
												key={i}
												className={`text-sm ${
													i < f.rating ? "text-yellow-400" : "text-gray-300"
												}`}
											>
												★
											</span>
										))}
									</div>
								</li>
							))
						) : (
							<li className="p-4 text-gray-500">No feedback found.</li>
						)}
					</ul>
				</div>
			</div>

			{/* Right Column Pie Chart */}
			<div className="space-y-6">
				<div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 flex flex-col items-center">
					<h2 className="font-semibold text-lg text-gray-900 mb-4">User Type Distribution</h2>
					<div className="w-56 h-56">
						<Pie data={pieData} />
					</div>
				</div>
			</div>
		</div>
	);
};

export default OverviewTab;
