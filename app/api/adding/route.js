import { NextResponse } from "next/server";
import Pusher from "pusher";
import { PrismaClient } from "@prisma/client";
import { endOfDay, startOfDay } from "date-fns";

const prisma = new PrismaClient();

const pusher = new Pusher({
	appId: "1876851",
	key: "ebe2ac36546d3e8dadf5",
	secret: "934f8d5f9cca665468fc",
	cluster: "ap1",
	useTLS: true,
});

export async function POST() {
	const now = new Date();
	const start = startOfDay(now);
	const end = endOfDay(now);

	try {
		// Cari nomor antrian terbaru untuk hari ini
		const latestQueue = await prisma.queueRunning.findFirst({
			where: {
				createdAt: {
					gte: start,
					lte: end,
				},
			},
			orderBy: { createdAt: "desc" },
		});

		let newQueueNumber;

		if (!latestQueue) {
			// Jika belum ada data hari ini, mulai dengan nomor 1
			newQueueNumber = 1;
			await prisma.queueRunning.create({
				data: {
					number: newQueueNumber,
				},
			});
		} else {
			// Tambahkan nomor antrian dari yang terbaru
			newQueueNumber = latestQueue.number + 1;
			await prisma.queueRunning.upsert({
				where: {
					id: latestQueue.id,
				},
				update: { number: newQueueNumber },
				create: {
					number: newQueueNumber,
				},
			});
		}

		// Kirim event ke Pusher
		pusher.trigger("queue-channel", "new-queue", { id: newQueueNumber });

		return NextResponse.json({
			status: 200,
			nomorAntrian: newQueueNumber,
		});
	} catch (err) {
		return NextResponse.json({ status: 500, message: err.message });
	}
}
