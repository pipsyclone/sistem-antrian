"use client";
// components/Countdown.js

import { useEffect, useState } from "react";

const Countdown = ({ targetTime }) => {
	const [timeLeft, setTimeLeft] = useState(targetTime);

	useEffect(() => {
		if (timeLeft <= 0) return; // Jangan jalankan timer jika waktu sudah habis

		const timer = setInterval(() => {
			const now = new Date().getTime();
			const remainingTime = targetTime - now;

			if (remainingTime <= 0) {
				setTimeLeft(0);
				clearInterval(timer);
			} else {
				setTimeLeft(remainingTime);
			}
		}, 1000);

		return () => clearInterval(timer);
	}, [targetTime, timeLeft]);

	const formatTime = (ms) => {
		const totalSeconds = Math.floor(ms / 1000);
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;

		return `${hours.toString().padStart(2, "0")}:${minutes
			.toString()
			.padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
	};

	return (
		<div className="text-center bg-sky-400 border border-sky-500 p-3 rounded-lg w-full">
			<h2>Estimasi Waktu Tunggu Anda : </h2>
			<p>{timeLeft > 0 ? formatTime(timeLeft) : "Waktu Habis!"}</p>
		</div>
	);
};

export default Countdown;
