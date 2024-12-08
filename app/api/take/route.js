import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { startOfDay, endOfDay } from "date-fns";

const prisma = new PrismaClient();

export async function POST(request) {
	const now = new Date();
	const start = startOfDay(now);
	const end = endOfDay(now);

	try {
		const body = await request.json();
		const { latestPusher } = body;

		// Ambil entri antrian maksimum berdasarkan tanggal hari ini
		const maxQueueEntry = await prisma.queue.findFirst({
			where: {
				createdAt: {
					gte: start,
					lte: end,
				},
			},
			orderBy: { number: "desc" },
		});

		// Tentukan nomor antrian baru
		const maxNumber = maxQueueEntry?.number || 0; // Default ke 0 jika tidak ada entri
		const newNumber = Math.max(latestPusher, maxNumber) + 1;

		// Tambahkan entri antrian baru
		await prisma.queue.create({
			data: {
				number: newNumber,
				createdAt: now,
			},
		});

		return NextResponse.json({
			status: 200,
			message: "Nomor antrian berhasil dibuat.",
			number: newNumber,
		});
	} catch (err) {
		return NextResponse.json({
			status: 500,
			message: `Terjadi kesalahan: ${err.message}`,
		});
	}
}
