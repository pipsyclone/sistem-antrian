"use client";
import { useState, useEffect } from "react";
import Pusher from "pusher-js";
import axios from "axios";

export default function Home() {
	const [id, setId] = useState("");
	const [myQueue, setMyQueue] = useState(null); // Nomor antrian customer
	const [latestQueue, setLatestQueue] = useState(null);

	useEffect(() => {
		// Cek apakah ada data di localStorage
		// Jika tidak ada, ambil dari server
		axios
			.get("/api/nomor-antrian-berjalan")
			.then((res) => {
				if (res.data.status === 200) {
					setId(res.data.id);
					setLatestQueue(res.data.nomor);
				}
				console.log(res.data);
			})
			.catch((err) =>
				console.error("Error fetching latest queue:", err.message)
			);

		// if (localStorage.getItem("id")) {
		// 	setMyQueue(localStorage.getItem("nomor"));
		// }
	}, []);

	useEffect(() => {
		// Hubungkan ke Pusher
		const pusher = new Pusher("ebe2ac36546d3e8dadf5", {
			cluster: "ap1",
		});

		const channel = pusher.subscribe("queue-channel");
		channel.bind("new-queue", (data) => {
			setLatestQueue(data.id); // Update nomor antrian terbaru
			localStorage.setItem("latestQueue", data.id); // Simpan ke localStorage
		});

		return () => {
			channel.unbind_all();
			channel.unsubscribe();
		};
	}, []);

	const takeQueue = async () => {
		try {
			const response = await axios.post("/api/take", {
				id,
				latestPusher: latestQueue,
			});
			setMyQueue(response.data.number);
			// localStorage.setItem("id", id);
			// localStorage.setItem("nomor", latestQueue);
			console.log(response.data);
		} catch (err) {
			console.error("Error taking queue:", err.message);
		}
	};

	useEffect(() => {
		// Simpan latestQueue ke localStorage setiap kali berubah
		if (latestQueue !== null) {
			localStorage.setItem("latestQueue", latestQueue);
		}
	}, [latestQueue]);

	return (
		<div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
			<div className="w-[90%] md:w-[500px] bg-sky-400 text-sky-950 p-3 rounded-lg border border-sky-500 mb-3 text-center">
				<b>INFORMASI!</b> Tunjukkan halaman ini pada staff, untuk mengkonfirmasi
				bahwa nomor antrian benar!
			</div>
			<div className="w-[90%] md:w-[500px] bg-white rounded-lg p-3 border flex flex-col gap-5">
				<h1 className="text-2xl font-bold mb-3 text-center">
					Sistem Antrian Customer
				</h1>
				<hr />
				<div className="flex gap-3 justify-center items-center text-center bg-sky-300 border border-sky-500 text-black">
					<div className="grow text-2xl">
						<p>Antrian Berjalan</p>
						{latestQueue ? latestQueue : 0}
					</div>
					|
					<div className="grow text-2xl">
						<p>Antrian Saya</p>
						{myQueue ? myQueue : 0}
					</div>
				</div>
				{myQueue ? (
					""
				) : (
					<button
						type="button"
						onClick={takeQueue}
						className="p-2 rounded-lg bg-blue-500 text-white"
					>
						Ambil Nomor Antrian
					</button>
				)}
				<small className="text-center italic text-slate-500">
					Licensed by me &copy; 2024
				</small>
			</div>
		</div>
	);
}
