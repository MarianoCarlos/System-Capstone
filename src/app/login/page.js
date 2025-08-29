"use client";

import AuthForm from "@/components/AuthForm";

export default function Login() {
	return (
		<main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-neutral-900 dark:to-black px-6">
			<AuthForm type="login" />
		</main>
	);
}
