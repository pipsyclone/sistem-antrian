import { NextResponse } from "next/server";
import Pusher from "pusher";
import { PrismaClient } from "@prisma/client";
import { startOfDay, endOfDay } from "date-fns";

const prisma = new PrismaClient();

const pusher = new Pusher({
	appId: process.env.NEXT_PUBLIC_PUSHER_APPID,
	key: process.env.NEXT_PUBLIC_PUSHER_KEY,
	secret: process.env.NEXT_PUBLIC_PUSHER_SECRET,
	cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
	useTLS: true,
});

export async function POST() {
	try {
		// Cari nomor antrian terbaru untuk hari ini
		const QueueExists = await prisma.queueRunning.findFirst({
			where: {
				createdAt: {
					gte: startOfDay(new Date()), // Awal hari
					lte: endOfDay(new Date()), // Akhir hari
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		// Tentukan nomor antrian baru
		let queueNumber = QueueExists ? QueueExists.number : 0;

		if (queueNumber <= 0) {
			return NextResponse.json({
				status: 400,
				message: "No queue numbers to subtract",
			});
		}

		queueNumber -= 1; // Kurangi nomor antrian

		// Update nomor antrian dalam database
		if (QueueExists) {
			await prisma.queueRunning.update({
				where: { id: QueueExists.id },
				data: {
					number: queueNumber,
				},
			});
		} else {
			await prisma.queueRunning.upsert({
				where: {
					id: QueueExists.id,
				},
				update: { number: queueNumber },
				create: {
					number: queueNumber,
				},
			});
		}

		// Kirim event ke Pusher
		pusher.trigger("queue-channel", "new-queue", { id: queueNumber });

		// Kirim respons
		return NextResponse.json({
			status: 200,
			nomorAntrian: queueNumber,
		});
	} catch (err) {
		// Penanganan error
		return NextResponse.json({
			status: 500,
			message: err.message,
		});
	}
}
