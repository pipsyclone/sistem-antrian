import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { endOfDay, startOfDay } from "date-fns";

const prisma = new PrismaClient();

export async function PUT(request) {
	const now = new Date();
	const start = startOfDay(now);
	const end = endOfDay(now);

	try {
		const body = await request.json();
		const { numberNow } = body;

		// Validasi numberNow
		if (!numberNow || numberNow <= 0) {
			return NextResponse.json({
				status: 400,
				message: "Nomor antrian tidak valid.",
			});
		}

		// Ambil data antrian saat ini
		const queue = await prisma.queue.findFirst({
			where: {
				createdAt: {
					gte: start,
					lte: end,
				},
				number: numberNow,
			},
		});

		// Ambil data antrian sebelumnya
		const queueBefore = await prisma.queue.findFirst({
			where: {
				createdAt: {
					gte: start,
					lte: end,
				},
				number: numberNow - 1,
			},
		});

		// Update waktu mulai untuk antrian saat ini
		if (queue !== null) {
			await prisma.queue.update({
				where: { id: queue.id },
				data: { start_time: now },
			});
		}

		// Jika antrian sebelumnya ada dan waktu mulai sudah diatur, perbarui waktu selesai
		if (queueBefore && queueBefore.start_time !== null) {
			await prisma.queue.update({
				where: { id: queueBefore.id },
				data: { end_time: now },
			});
		}

		return NextResponse.json({
			status: 200,
			message: "Berhasil memperbarui data layanan.",
			queue,
			queueBefore,
		});
	} catch (err) {
		return NextResponse.json({
			status: 500,
			message: `Terjadi kesalahan: ${err.message}`,
		});
	}
}
