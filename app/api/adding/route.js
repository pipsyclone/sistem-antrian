import { NextResponse } from "next/server";
import Pusher from "pusher";
import { PrismaClient } from "@prisma/client";
import { endOfDay, startOfDay } from "date-fns";

const prisma = new PrismaClient();

const pusher = new Pusher({
	appId: process.env.NEXT_PUBLIC_PUSHER_APPID,
	key: process.env.NEXT_PUBLIC_PUSHER_KEY,
	secret: process.env.NEXT_PUBLIC_PUSHER_SECRET,
	cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
	useTLS: true,
});

export async function PUT() {
	const now = new Date();
	const start = startOfDay(now);
	const end = endOfDay(now);

	try {
		// Ambil antrian yang sudah diambil hari ini
		const queueTaked = await prisma.queue.findMany({
			where: {
				createdAt: {
					gte: start,
					lte: end,
				},
			},
		});

		if (queueTaked.length < 1) {
			return NextResponse.json({
				status: 400,
				message: "Belum ada yang mengambil antrian!",
			});
		}

		// Ambil antrian yang sedang berjalan hari ini
		const latestQueue = await prisma.queueRunning.findFirst({
			where: {
				createdAt: {
					gte: start,
					lte: end,
				},
			},
			orderBy: { createdAt: "desc" },
		});

		let newQueueNumber = 1; // Default ke 1 jika belum ada antrian

		if (!latestQueue) {
			await prisma.queueRunning.create({
				data: {
					number: newQueueNumber,
				},
			});
		}

		if (latestQueue) {
			newQueueNumber = latestQueue.number + 1; // Tambahkan dari nomor terakhir
			// Update atau buat queueRunning baru
			await prisma.queueRunning.upsert({
				where: { id: latestQueue.id },
				create: { number: newQueueNumber },
				update: { number: newQueueNumber },
			});
		}

		// Kirim event ke Pusher
		await pusher.trigger("queue-channel", "new-queue", { id: newQueueNumber });

		return NextResponse.json({
			status: 200,
			nomorAntrian: newQueueNumber,
		});
	} catch (err) {
		return NextResponse.json({ status: 500, message: err.message });
	}
}
