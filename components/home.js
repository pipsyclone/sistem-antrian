"use client";
import { useState, useEffect } from "react";
import Pusher from "pusher-js";
import axios from "axios";
import Countdown from "@/components/countdown";

export default function Home() {
	const [id, setId] = useState("");
	const [myQueue, setMyQueue] = useState(null); // Nomor antrian customer
	const [latestQueue, setLatestQueue] = useState(null);
	const [estimateData, setEstimateData] = useState(null);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		// Cek apakah ada data di localStorage
		// Jika tidak ada, ambil dari server
		axios
			.get("/api/queue-running")
			.then((res) => {
				if (res.data.status === 200) {
					setId(res.data.id);
					setLatestQueue(res.data.nomor);
				}
			})
			.catch((err) =>
				console.error("Error fetching latest queue:", err.message)
			);

		if (latestQueue && myQueue && latestQueue <= myQueue) {
			axios
				.get(
					`/api/estimated-waiting?currentQueueNumber=${latestQueue}&targetQueueNumber=${myQueue}`
				)
				.then((res) => {
					if (res.data.status === 200) {
						setEstimateData(res.data.data);
					}
				})
				.catch((err) =>
					console.error("Error fetching latest queue:", err.message)
				);
		}
	}, [latestQueue, myQueue]);

	useEffect(() => {
		// Hubungkan ke Pusher
		const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
			cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
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
			setIsLoading(true);
			const response = await axios.post("/api/take", {
				latestPusher: latestQueue,
			});
			setIsLoading(false);
			setMyQueue(response.data.number);
			console.log(response.data);
		} catch (err) {
			setIsLoading(false);
			console.error("Error taking queue:", err.message);
		}
	};

	return (
		<div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[90%] md:w-[500px]">
			<div className="w-full bg-sky-400 text-sky-950 p-3 rounded-lg border border-sky-500 mb-3 text-center m-3 mx-auto">
				<b>INFORMASI!</b> Tunjukkan halaman ini pada staff, untuk mengkonfirmasi
				bahwa nomor antrian benar!
			</div>
			<div className="w-full bg-red-400 text-red-950 p-3 rounded-lg border border-red-500 mb-3 text-center m-3 mx-auto">
				<b>INFORMASI!</b> Dilarang refresh halaman ketika anda sudah mengambil
				nomor antrian untuk menghindari antri ulang!
			</div>
			<div className="w-full md:w-[500px] bg-white rounded-lg p-3 border flex flex-col gap-5 mx-auto">
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
				{!myQueue ? (
					<button
						type="button"
						onClick={takeQueue}
						className={
							isLoading
								? "p-2 rounded-lg bg-blue-500 text-white disabled:opacity-75"
								: "p-2 rounded-lg bg-blue-500 text-white"
						}
						disabled={isLoading}
					>
						{isLoading ? "Memuat..." : "Ambil Nomor Antrian"}
					</button>
				) : latestQueue < myQueue && estimateData ? (
					<Countdown
						targetTime={Date.now() + estimateData.estimatedWaitTime * 1000}
					/>
				) : latestQueue > myQueue ? (
					<span className="text-center text-green-500 italic font-medium">
						Terima Kasih Telah Menunggu, sekarang anda bisa refresh halaman
						anda!
					</span>
				) : latestQueue === 0 ? (
					<span className="text-center text-green-500 italic font-medium">
						Antrian belum dimulai mohon tunggu!
					</span>
				) : latestQueue === myQueue ? (
					<span className="text-center text-green-500 italic font-medium">
						Silahkan giliran anda!
					</span>
				) : (
					<span className="text-center text-green-500 italic font-medium">
						Giliran anda sebentar lagi mohon tunggu dipanggil yaa!
					</span>
				)}
				<small className="text-center italic text-slate-500">
					Licensed by me &copy; 2024
				</small>
			</div>
		</div>
	);
}
