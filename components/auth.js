"use client";
import { useState } from "react";
import Swal from "sweetalert2";

export default function Auth() {
	const [accessKey, setAccessKey] = useState("");

	const handleLogin = (e) => {
		e.preventDefault();

		if (accessKey === "keydummy") {
			// Set cookie menggunakan document.cookie
			document.cookie = `access_key=${accessKey}; max-age=${
				1 * 24 * 60 * 60
			}; path=/`;

			// Redirect ke halaman staff
			window.location.href = "/staff";
		} else {
			Swal.fire({
				icon: "error",
				title: "Gagal Masuk!",
				text: "Kunci akses anda tidak sesuai!",
				allowOutsideClick: false,
			});
		}
	};

	return (
		<div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[90%] md:w-[400px] bg-white rounded-lg p-3">
			<div className="flex flex-col gap-3">
				<label htmlFor="access-key">Masukkan Kunci Akses:</label>
				<input
					type="text"
					id="access-key"
					name="access-key"
					value={accessKey}
					onChange={(e) => setAccessKey(e.target.value)}
					className="bg-slate-300 hover:bg-white outline-0 focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded-lg p-3"
					placeholder="Access Key"
				/>

				<button
					type="submit"
					onClick={handleLogin}
					className="bg-blue-500 p-2 rounded-lg text-white"
				>
					Masuk
				</button>
				<small className="text-center italic text-slate-500">
					Licensed by me &copy; 2024
				</small>
			</div>
		</div>
	);
}
