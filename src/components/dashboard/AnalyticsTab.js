"use client";
import React from "react";
import {
	BarChart,
	Bar,
	LineChart,
	Line,
	PieChart,
	Pie,
	Cell,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
} from "recharts";

function AnalyticsDashboard() {
	// Example mock data (replace with Firestore or API later)
	const userGrowth = [
		{ month: "Jan", users: 120 },
		{ month: "Feb", users: 200 },
		{ month: "Mar", users: 320 },
		{ month: "Apr", users: 450 },
	];

	const ageGroups = [
		{ name: "<18", value: 40 },
		{ name: "18-25", value: 120 },
		{ name: "26-40", value: 90 },
		{ name: "40+", value: 50 },
	];

	// Removed "Others"
	const disabilityTypes = [
		{ name: "DHH", value: 100, color: "#4F46E5" }, // Indigo/Blue
		{ name: "Hearing", value: 150, color: "#22C55E" }, // Green
	];

	return (
		<div className="p-6 space-y-6">
			{/* Charts */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* User Growth */}
				<div className="bg-white shadow rounded-lg p-4">
					<h3 className="font-semibold text-gray-700 mb-2">User Growth</h3>
					<ResponsiveContainer width="100%" height={250}>
						<LineChart data={userGrowth}>
							<XAxis dataKey="month" />
							<YAxis />
							<Tooltip />
							<Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} />
						</LineChart>
					</ResponsiveContainer>
				</div>

				{/* Age Groups */}
				<div className="bg-white shadow rounded-lg p-4">
					<h3 className="font-semibold text-gray-700 mb-2">Users by Age Group</h3>
					<ResponsiveContainer width="100%" height={250}>
						<PieChart>
							<Pie data={ageGroups} dataKey="value" nameKey="name" outerRadius={100}>
								{ageGroups.map((entry, index) => (
									<Cell
										key={`cell-${index}`}
										fill={["#8884d8", "#82ca9d", "#ffc658", "#ff8042"][index % 4]}
									/>
								))}
							</Pie>
							<Tooltip />
						</PieChart>
					</ResponsiveContainer>
				</div>

				{/* Disability Types */}
				<div className="bg-white shadow rounded-lg p-4 col-span-1 md:col-span-2">
					<h3 className="font-semibold text-gray-700 mb-2">Users by Disability Type</h3>
					<ResponsiveContainer width="100%" height={250}>
						<BarChart data={disabilityTypes}>
							<XAxis dataKey="name" />
							<YAxis />
							<Tooltip />
							<Bar dataKey="value">
								{disabilityTypes.map((entry, index) => (
									<Cell key={`cell-${index}`} fill={entry.color} />
								))}
							</Bar>
						</BarChart>
					</ResponsiveContainer>

					{/* Legend */}
					<div className="flex items-center gap-4 mt-3">
						<div className="flex items-center gap-2">
							<span className="w-4 h-4 bg-indigo-600 inline-block rounded"></span>
							<span className="text-sm text-gray-600">DHH</span>
						</div>
						<div className="flex items-center gap-2">
							<span className="w-4 h-4 bg-green-500 inline-block rounded"></span>
							<span className="text-sm text-gray-600">Hearing</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default AnalyticsDashboard;
