"use client";
import { useState, useEffect } from "react";
import axios from "axios";

export default function QueueControl() {
	const [nomor, setNomor] = useState(0);

	const addQueue = async () => {
		axios.put("/api/adding").then((res) => {
			if (res.data.status === 200) {
				setNomor(res.data.nomorAntrian);
			} else {
				alert("Belum ada yang mengambil antrian");
			}
			console.log(res.data);
		});
	};

	const subtractQueue = async () => {
		if (nomor < 1) {
			setNomor(0);
		} else {
			try {
				axios.post("/api/substract").then((res) => {
					setNomor(res.data.nomorAntrian);
					console.log(res.data);
				});
			} catch (error) {
				console.error("Error subtracting queue:", error);
				setNomor("Gagal mengurangi nomor antrian");
			}
		}
	};

	const resetQueue = async () => {
		if (nomor < 1) {
			setNomor(0);
		} else {
			try {
				axios.put("/api/reset", { nomor: 0 }).then((res) => {
					setNomor(res.data.nomorAntrian);
					console.log(res.data);
				});
			} catch (error) {
				console.error("Error resetting queue:", error);
				setNomor("Gagal mereset nomor antrian");
			}
		}
	};

	useEffect(() => {
		// Cek apakah ada data di localStorage
		// Jika tidak ada, ambil dari server
		axios
			.get("/api/queue-running")
			.then((res) => {
				if (res.data.status === 200) {
					setNomor(res.data.nomor);
				}
				console.log(res.data);
			})
			.catch((err) =>
				console.error("Error fetching latest queue:", err.message)
			);

		axios
			.put("/api/update-data-service", { numberNow: nomor })
			.then((res) => {
				if (res.data.status === 200) {
					console.log(res.data);
				}
				console.log(res.data);
			})
			.catch((err) =>
				console.error("Error fetching latest queue:", err.message)
			);
	}, [nomor]);

	// Fungsi untuk menghapus cookie
	const handleLogout = () => {
		// Pastikan path sama dengan yang digunakan saat set cookie
		document.cookie = "access_key=; path=/; max-age=0;";
		window.location.href = "/auth";
	};

	return (
		<div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[90%] md:w-[500px]">
			<div className="bg-white rounded-lg p-3 flex flex-col gap-3 text-center w-[90%] md:w-[400px]">
				<h1 className="text-2xl font-bold">Nomor Antrian</h1>
				<h1 className="text-2xl font-bold">{nomor}</h1>
				<div className="mt-4 flex gap-3">
					<button
						onClick={addQueue}
						className="bg-green-500 text-white p-2 mr-2 w-full"
					>
						+
					</button>
					<button
						onClick={subtractQueue}
						className="bg-red-500 text-white p-2 w-full"
					>
						-
					</button>
				</div>
				<button
					onClick={resetQueue}
					className="bg-orange-500 text-white p-2 w-full"
				>
					Reset
				</button>
				<button
					onClick={handleLogout}
					className="bg-red-500 text-white p-2 w-full"
				>
					Keluar
				</button>
				<small className="text-center italic text-slate-500">
					Licensed by me &copy; 2024
				</small>
			</div>
		</div>
	);
}
