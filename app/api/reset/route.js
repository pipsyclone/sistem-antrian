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

export async function PUT() {
	try {
		// Cari nomor antrian terbaru untuk hari ini
		const queueExists = await prisma.queueRunning.findFirst({
			where: {
				createdAt: {
					gte: startOfDay(new Date()),
					lte: endOfDay(new Date()),
				},
			},
			orderBy: { createdAt: "desc" },
		});

		// Kirim event ke Pusher
		pusher.trigger("queue-channel", "new-queue", { id: 0 });

		await prisma.queueRunning.update({
			where: {
				id: queueExists.id,
			},
			data: {
				number: 0,
			},
		});

		// Kirim respons
		return NextResponse.json({
			status: 200,
			nomorAntrian: 0,
			queueExists,
		});
	} catch (err) {
		// Penanganan error
		return NextResponse.json({
			status: 500,
			message: err.message,
		});
	}
}
