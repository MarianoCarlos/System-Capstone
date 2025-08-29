"use client";

import { useState } from "react";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation"; // <-- add this
import Link from "next/link";

export default function AuthToggleForm() {
	const router = useRouter(); // <-- initialize router
	const [isSignup, setIsSignup] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		userType: "DHH",
		password: "",
		confirmPassword: "",
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		console.log(isSignup ? "Signup data:" : "Login data:", formData);

		// Simulate authentication success
		// Here you would call your backend API to verify credentials
		setTimeout(() => {
			// Redirect user to dashboard after login/signup
			router.push("/userdashboard");
		}, 500);
	};

	return (
		<div className="relative min-h-screen flex flex-col items-center p-8">
			{/* Back to Home Button */}
			<Link
				href="/"
				className="absolute top-8 left-8 flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-neutral-800/50 shadow-md hover:bg-white/90 dark:hover:bg-neutral-700/70 text-gray-700 dark:text-gray-200 transition"
			>
				<ArrowLeft className="w-4 h-4" />
				<span className="font-medium text-sm">Home</span>
			</Link>

			{/* Logo */}
			<div className="flex flex-col items-center mt-12 mb-8">
				<img src="/favicon.ico" alt="App Logo" className="w-20 h-20 mb-3" />
				<h1 className="text-3xl font-bold text-blue-400">ASL Translator</h1>
			</div>

			{/* Auth Card */}
			<div className="w-full max-w-lg bg-white/90 dark:bg-neutral-900/80 backdrop-blur-md rounded-3xl shadow-xl p-8 transition-all duration-500">
				{/* Toggle Buttons with Semi-Box Shape */}
				<div className="relative flex justify-between bg-gray-200 dark:bg-neutral-800 rounded-md p-1 mb-8">
					<div
						className={`absolute top-1 left-1 h-9 w-1/2 bg-gradient-to-r from-indigo-500 to-blue-400 rounded-md transition-all duration-300 transform ${
							isSignup ? "translate-x-full" : "translate-x-0"
						}`}
					></div>
					<button
						onClick={() => setIsSignup(false)}
						className={`relative w-1/2 h-9 rounded-md font-semibold text-sm transition-colors duration-300 ${
							!isSignup ? "text-white" : "text-indigo-500 dark:text-white"
						}`}
					>
						Log In
					</button>
					<button
						onClick={() => setIsSignup(true)}
						className={`relative w-1/2 h-9 rounded-md font-semibold text-sm transition-colors duration-300 ${
							isSignup ? "text-white" : "text-indigo-500 dark:text-white"
						}`}
					>
						Sign Up
					</button>
				</div>

				{/* Header */}
				<div className="text-center mb-6">
					<h2 className="text-2xl font-extrabold text-blue-400 mb-2">
						{isSignup ? "Create Account" : "Welcome Back"}
					</h2>
					<p className="text-gray-600 dark:text-gray-300 text-sm">
						{isSignup
							? "Sign up to start your ASL journey."
							: "Log in to continue learning and translating ASL."}
					</p>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit} className="space-y-4">
					{isSignup && (
						<>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
										First Name
									</label>
									<input
										type="text"
										name="firstName"
										value={formData.firstName}
										onChange={handleChange}
										required
										className="w-full h-11 px-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 outline-none"
										placeholder="John"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
										Last Name
									</label>
									<input
										type="text"
										name="lastName"
										value={formData.lastName}
										onChange={handleChange}
										required
										className="w-full h-11 px-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 outline-none"
										placeholder="Doe"
									/>
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
									Email
								</label>
								<input
									type="email"
									name="email"
									value={formData.email}
									onChange={handleChange}
									required
									className="w-full h-11 px-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 outline-none"
									placeholder="you@example.com"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
									User Type
								</label>
								<select
									name="userType"
									value={formData.userType}
									onChange={handleChange}
									className="w-full h-11 px-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 outline-none"
								>
									<option value="DHH">DHH</option>
									<option value="Hearing">Hearing</option>
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
									Password
								</label>
								<div className="relative">
									<input
										type={showPassword ? "text" : "password"}
										name="password"
										value={formData.password}
										onChange={handleChange}
										required
										className="w-full h-11 px-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 outline-none pr-10"
										placeholder="********"
									/>
									<button
										type="button"
										className="absolute right-0 top-0 h-11 w-10 flex items-center justify-center"
										onClick={() => setShowPassword(!showPassword)}
									>
										{showPassword ? (
											<EyeOff className="w-4 h-4 text-gray-500" />
										) : (
											<Eye className="w-4 h-4 text-gray-500" />
										)}
									</button>
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
									Confirm Password
								</label>
								<div className="relative">
									<input
										type={showPassword ? "text" : "password"}
										name="confirmPassword"
										value={formData.confirmPassword}
										onChange={handleChange}
										required
										className="w-full h-11 px-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 outline-none pr-10"
										placeholder="********"
									/>
									<button
										type="button"
										className="absolute right-0 top-0 h-11 w-10 flex items-center justify-center"
										onClick={() => setShowPassword(!showPassword)}
									>
										{showPassword ? (
											<EyeOff className="w-4 h-4 text-gray-500" />
										) : (
											<Eye className="w-4 h-4 text-gray-500" />
										)}
									</button>
								</div>
							</div>
						</>
					)}

					{!isSignup && (
						<>
							<div>
								<label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
									Email
								</label>
								<input
									type="email"
									name="email"
									value={formData.email}
									onChange={handleChange}
									required
									className="w-full h-11 px-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 outline-none"
									placeholder="you@example.com"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
									Password
								</label>
								<div className="relative">
									<input
										type={showPassword ? "text" : "password"}
										name="password"
										value={formData.password}
										onChange={handleChange}
										required
										className="w-full h-11 px-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 outline-none pr-10"
										placeholder="********"
									/>
									<button
										type="button"
										className="absolute right-0 top-0 h-11 w-10 flex items-center justify-center"
										onClick={() => setShowPassword(!showPassword)}
									>
										{showPassword ? (
											<EyeOff className="w-4 h-4 text-gray-500" />
										) : (
											<Eye className="w-4 h-4 text-gray-500" />
										)}
									</button>
								</div>
							</div>
						</>
					)}

					{/* Submit Button */}
					<button
						type="submit"
						className="w-full h-11 bg-gradient-to-r from-indigo-500 to-blue-400 text-white font-bold rounded-md shadow-lg hover:shadow-indigo-400/50 transition-all duration-300 transform hover:scale-105 hover:brightness-110"
					>
						{isSignup ? "Sign Up" : "Log In"}
					</button>
				</form>
			</div>
		</div>
	);
}
