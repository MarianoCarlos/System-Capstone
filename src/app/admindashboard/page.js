"use client";

import React, { useState } from "react";
import StatCard from "@/components/dashboard/StatCard";
import OverviewTab from "@/components/dashboard/OverviewTab";
import UsersTab from "@/components/dashboard/UserTab";
import AnalyticsTab from "@/components/dashboard/AnalyticsTab";
import FeedbackTab from "@/components/dashboard/FeedbackTab";

const AdminDashboard = () => {
	const systemStats = { totalUsers: 1248, activeUsers: 892, dailyTranslations: 3456 };
	const recentUsers = [
		{ id: 1, name: "Sarah Johnson", type: "DHH", status: "active", joined: "2 hours ago" },
		{ id: 2, name: "Mike Chen", type: "Hearing", status: "active", joined: "5 hours ago" },
		{ id: 3, name: "Lisa Rodriguez", type: "DHH", status: "pending", joined: "1 day ago" },
	];
	const recentFeedback = [
		{ id: 1, user: "John D.", rating: 5, comment: "Excellent translation accuracy!", time: "1 hour ago" },
		{ id: 2, user: "Maria S.", rating: 4, comment: "Great tool, minor lag issues", time: "3 hours ago" },
		{ id: 3, user: "Alex K.", rating: 5, comment: "Perfect for my daily needs", time: "6 hours ago" },
	];
	const feedbackStats = { averageRating: 4.6, newFeedback: 8, pendingReview: 12 };

	const [activeTab, setActiveTab] = useState("overview");

	// Mocked logged-in admin name
	const adminName = "John Doe";

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
			{/* Header */}
			<header className="border-b border-gray-200 backdrop-blur-md bg-white/80">
				<div className="container mx-auto px-6 py-4 flex justify-between items-center">
					<div className="flex items-center space-x-3">
						<div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">
							⚡
						</div>
						<div>
							<h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
							<p className="text-sm text-gray-500">Hi, {adminName}!</p>
						</div>
					</div>

					{/* Avatar + Logout */}
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
							{adminName.charAt(0)}
						</div>
						<button
							onClick={() => console.log("Logout clicked")}
							className="px-3 py-1 border rounded-md text-sm hover:bg-gray-100"
						>
							Logout
						</button>
					</div>
				</div>
			</header>

			{/* Stats */}
			<div className="container mx-auto px-6 py-8">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
					<StatCard title="Total Users" value={systemStats.totalUsers} growth="+12% this month" />
					<StatCard title="Active Users" value={systemStats.activeUsers} growth="+8% today" />
					<StatCard
						title="Daily Translations"
						value={systemStats.dailyTranslations}
						growth="+15% vs yesterday"
					/>
				</div>

				{/* Tabs */}
				<div>
					<div className="grid grid-cols-4 border-b mb-6">
						{["overview", "users", "analytics", "feedback"].map((tab) => (
							<button
								key={tab}
								onClick={() => setActiveTab(tab)}
								className={`py-2 text-sm font-medium ${
									activeTab === tab ? "border-b-2 border-indigo-600 text-indigo-600" : "text-gray-500"
								}`}
							>
								{tab.charAt(0).toUpperCase() + tab.slice(1)}
							</button>
						))}
					</div>

					{/* Tab Content */}
					{activeTab === "overview" && (
						<OverviewTab
							recentUsers={recentUsers}
							recentFeedback={recentFeedback}
							feedbackStats={feedbackStats}
						/>
					)}
					{activeTab === "users" && <UsersTab recentUsers={recentUsers} />}
					{activeTab === "analytics" && <AnalyticsTab />}
					{activeTab === "feedback" && <FeedbackTab recentFeedback={recentFeedback} />}
				</div>
			</div>
		</div>
	);
};

export default AdminDashboard;
