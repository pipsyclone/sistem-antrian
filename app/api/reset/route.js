import { NextResponse } from "next/server";
import Pusher from "pusher";
import { PrismaClient } from "@prisma/client";
import { startOfDay, endOfDay } from "date-fns";

const prisma = new PrismaClient();

const pusher = new Pusher({
	appId: "1876851",
	key: "ebe2ac36546d3e8dadf5",
	secret: "934f8d5f9cca665468fc",
	cluster: "ap1",
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
