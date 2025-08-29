"use client";

import React, { useState } from "react";

const UsersTab = ({ recentUsers = [] }) => {
	const [users, setUsers] = useState(recentUsers);
	const [newUser, setNewUser] = useState({
		name: "",
		email: "",
		password: "",
		type: "DHH",
		status: "active", // default to active
	});
	const [editId, setEditId] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	// Open modal (for create or edit)
	const openModal = (user = null) => {
		if (user) {
			setEditId(user.id);
			setNewUser({
				name: user.name,
				email: user.email,
				password: user.password,
				type: user.type,
				status: user.status, // keep current status
			});
		} else {
			setEditId(null);
			setNewUser({ name: "", email: "", password: "", type: "DHH", status: "active" });
		}
		setIsModalOpen(true);
	};

	// Close modal
	const closeModal = () => {
		setIsModalOpen(false);
		setEditId(null);
		setNewUser({ name: "", email: "", password: "", type: "DHH", status: "active" });
	};

	// Create or Update User
	const handleSubmit = (e) => {
		e.preventDefault();
		if (!newUser.name.trim() || !newUser.email.trim() || (!editId && !newUser.password.trim())) return;

		if (editId) {
			setUsers(users.map((u) => (u.id === editId ? { ...u, ...newUser, joined: u.joined } : u)));
		} else {
			const user = {
				id: Date.now(),
				...newUser,
				joined: new Date().toLocaleDateString(),
			};
			setUsers([user, ...users]);
		}
		closeModal();
	};

	// Delete
	const handleDeleteUser = (id) => {
		setUsers(users.filter((u) => u.id !== id));
	};

	return (
		<div className="bg-white p-6 rounded-xl shadow overflow-x-auto relative">
			<div className="flex justify-between items-center mb-4">
				<h2 className="font-semibold text-xl text-gray-900">User Management</h2>
				<button onClick={() => openModal()} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm">
					Create User
				</button>
			</div>

			{/* Sliding Modal / Form */}
			{isModalOpen && (
				<div className="flex justify-center mb-6">
					<div className="w-full max-w-md">
						<div className="bg-gray-50 border rounded-lg p-6 shadow-inner transition-all duration-500 overflow-hidden">
							{/* Cancel button */}
							<button
								className="mb-4 w-full text-gray-700 border border-gray-300 rounded-lg py-2 hover:bg-gray-100 transition"
								onClick={closeModal}
							>
								Cancel
							</button>

							{/* Form */}
							<h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
								{editId ? "Edit User" : "Create User"}
							</h3>
							<form onSubmit={handleSubmit} className="space-y-4">
								{/* Full Name */}
								<div className="flex flex-col">
									<label className="text-gray-700 text-sm mb-1">Full Name</label>
									<input
										type="text"
										value={newUser.name}
										onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
										className="w-full border rounded-lg px-3 py-2 text-sm"
										required
									/>
								</div>

								{/* Email */}
								<div className="flex flex-col">
									<label className="text-gray-700 text-sm mb-1">Email</label>
									<input
										type="email"
										value={newUser.email}
										onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
										className="w-full border rounded-lg px-3 py-2 text-sm"
										required
										disabled={!!editId}
									/>
								</div>

								{/* Password */}
								<div className="flex flex-col">
									<label className="text-gray-700 text-sm mb-1">Password</label>
									<input
										type="password"
										value={newUser.password}
										onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
										className="w-full border rounded-lg px-3 py-2 text-sm"
										required={!editId}
									/>
								</div>

								{/* User Type */}
								<div className="flex flex-col">
									<label className="text-gray-700 text-sm mb-1">User Type</label>
									<select
										value={newUser.type}
										onChange={(e) => setNewUser({ ...newUser, type: e.target.value })}
										className="w-full border rounded-lg px-3 py-2 text-sm"
									>
										<option value="DHH">DHH</option>
										<option value="Hearing">Hearing</option>
									</select>
								</div>

								{/* Submit Button */}
								<button
									type="submit"
									className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm"
								>
									{editId ? "Update User" : "Create User"}
								</button>
							</form>
						</div>
					</div>
				</div>
			)}

			{/* User Table */}
			<table className="w-full table-auto border-collapse">
				<thead>
					<tr className="bg-gray-100">
						<th className="p-3 text-left text-sm font-medium text-gray-700">Name</th>
						<th className="p-3 text-left text-sm font-medium text-gray-700">Email</th>
						<th className="p-3 text-left text-sm font-medium text-gray-700">Type</th>
						<th className="p-3 text-left text-sm font-medium text-gray-700">Status</th>
						<th className="p-3 text-left text-sm font-medium text-gray-700">Joined</th>
						<th className="p-3 text-left text-sm font-medium text-gray-700">Action</th>
					</tr>
				</thead>
				<tbody>
					{users.map((u) => {
						const statusColor = u.status === "active" ? "text-green-500" : "text-gray-400";

						// Force status display as either Active or Offline
						const displayStatus = u.status === "active" ? "Active" : "Offline";

						return (
							<tr key={u.id} className="border-b hover:bg-gray-50 transition">
								<td className="p-3 flex items-center gap-2">
									<div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">
										{u.name
											.split(" ")
											.map((n) => n[0])
											.join("")
											.toUpperCase()}
									</div>
									{u.name}
								</td>
								<td className="p-3 text-gray-900">{u.email}</td>
								<td className="p-3 text-gray-900">{u.type}</td>
								<td className={`p-3 font-semibold ${statusColor}`}>{displayStatus}</td>
								<td className="p-3 text-gray-500">{u.joined}</td>
								<td className="p-3 flex gap-3">
									<button
										onClick={() => openModal(u)}
										className="text-blue-500 hover:text-blue-700 text-sm font-medium"
									>
										Edit
									</button>
									<button
										onClick={() => handleDeleteUser(u.id)}
										className="text-red-500 hover:text-red-700 text-sm font-medium"
									>
										Delete
									</button>
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
};

export default UsersTab;
