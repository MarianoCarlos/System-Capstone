"use client";

import React, { useState, useMemo } from "react";

const FeedbackTab = ({ recentFeedback = [] }) => {
	const [selectedRating, setSelectedRating] = useState("all");
	const [selectedUserType, setSelectedUserType] = useState("all");

	const filteredFeedback = useMemo(() => {
		return recentFeedback.filter((f) => {
			const ratingMatch = selectedRating === "all" || f.rating === Number(selectedRating);
			const userTypeMatch = selectedUserType === "all" || f.userType === selectedUserType;
			return ratingMatch && userTypeMatch;
		});
	}, [recentFeedback, selectedRating, selectedUserType]);

	const averageRating = recentFeedback.length
		? (recentFeedback.reduce((acc, f) => acc + f.rating, 0) / recentFeedback.length).toFixed(1)
		: 0;
	const totalFeedback = recentFeedback.length;

	const formatDate = (dateStr) => {
		const d = new Date(dateStr);
		return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
	};

	if (!recentFeedback.length)
		return (
			<div className="bg-white p-6 rounded-xl shadow">
				<h2 className="text-2xl font-semibold text-gray-900 mb-4">Feedback</h2>
				<p className="text-gray-500">No feedback available.</p>
			</div>
		);

	return (
		<div className="bg-white p-6 rounded-xl shadow-md">
			{/* Header & Stats */}
			<div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
				<h2 className="text-2xl font-semibold text-gray-900">Feedback Overview</h2>

				<div className="flex gap-6">
					<div className="flex flex-col items-center bg-indigo-50 p-3 rounded-lg shadow-sm w-32">
						<div className="text-lg font-bold text-indigo-600">{averageRating} ★</div>
						<div className="text-gray-500 text-sm text-center">Average Rating</div>
					</div>
					<div className="flex flex-col items-center bg-green-50 p-3 rounded-lg shadow-sm w-32">
						<div className="text-lg font-bold text-green-600">{totalFeedback}</div>
						<div className="text-gray-500 text-sm text-center">Total Feedback</div>
					</div>
				</div>
			</div>

			{/* Filters */}
			<div className="flex flex-wrap gap-4 items-center mb-6">
				<div className="flex items-center gap-2">
					<label className="font-medium text-gray-700">Rating:</label>
					<select
						value={selectedRating}
						onChange={(e) => setSelectedRating(e.target.value)}
						className="border rounded-lg p-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
					>
						<option value="all">All</option>
						{[5, 4, 3, 2, 1].map((r) => (
							<option key={r} value={r}>
								{r} ★
							</option>
						))}
					</select>
				</div>

				<div className="flex items-center gap-2">
					<label className="font-medium text-gray-700">User Type:</label>
					<select
						value={selectedUserType}
						onChange={(e) => setSelectedUserType(e.target.value)}
						className="border rounded-lg p-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
					>
						<option value="all">All</option>
						<option value="DHH">DHH</option>
						<option value="Hearing">Hearing</option>
					</select>
				</div>
			</div>

			{/* Feedback Table */}
			<div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm">
				<table className="min-w-full border-separate border-spacing-0">
					<thead className="bg-gray-50 border-b border-gray-200">
						<tr>
							<th className="p-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">
								User
							</th>
							<th className="p-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">
								User Type
							</th>
							<th className="p-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">
								Comment
							</th>
							<th className="p-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">
								Rating
							</th>
							<th className="p-3 text-left text-sm font-semibold text-gray-700">Date</th>
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-100">
						{filteredFeedback.length ? (
							filteredFeedback.map((f, idx) => (
								<tr
									key={f.id}
									className={`hover:bg-gray-50 transition ${
										idx % 2 === 0 ? "bg-white" : "bg-gray-50"
									}`}
								>
									<td className="p-3 text-gray-900 font-medium">{f.user}</td>
									<td className="p-3 text-gray-900">{f.userType}</td>
									<td className="p-3 text-gray-800">{f.comment}</td>
									<td className="p-3 text-yellow-500 font-semibold">{f.rating} ★</td>
									<td className="p-3 text-gray-500">{formatDate(f.date)}</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan={5} className="text-center p-6 text-gray-500">
									No feedback matching the filters.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default FeedbackTab;
