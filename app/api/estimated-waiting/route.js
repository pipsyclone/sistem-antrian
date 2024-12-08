import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { differenceInMinutes } from "date-fns";

const prisma = new PrismaClient();

export async function GET(request) {
	try {
		// Ambil nomor antrian berjalan dan nomor target dari query
		const { searchParams } = new URL(request.url);
		const currentQueueNumber = parseInt(
			searchParams.get("currentQueueNumber"),
			10
		);
		const targetQueueNumber = parseInt(
			searchParams.get("targetQueueNumber"),
			10
		);

		// Ambil semua entri Queue dengan start_time dan end_time yang tidak null
		const queues = await prisma.queue.findMany({
			where: {
				NOT: {
					start_time: null,
					end_time: null,
				},
			},
		});

		// Filter durasi yang valid
		const validDurations = queues
			.map((queue) => {
				if (queue.start_time && queue.end_time) {
					const duration = differenceInMinutes(
						new Date(queue.end_time),
						new Date(queue.start_time)
					);
					// Pastikan durasi tidak negatif
					if (duration > 0) {
						return duration;
					}
				}
				return null;
			})
			.filter((duration) => duration !== null);

		if (validDurations.length === 0) {
			return NextResponse.json({
				status: 400,
				message:
					"Estimasi masih belum tersedia tunggu hingga antrian pertama selesai!",
			});
		}

		// Hitung rata-rata durasi
		const totalDuration = validDurations.reduce(
			(sum, duration) => sum + duration,
			0
		);
		const averageDuration = totalDuration / validDurations.length;

		// Hitung estimasi waktu tunggu
		const queueDifference = targetQueueNumber - currentQueueNumber;
		const estimatedWaitTime = queueDifference * averageDuration * 60;

		return NextResponse.json({
			status: 200,
			message: "OK",
			data: {
				currentQueueNumber,
				targetQueueNumber,
				averageDuration,
				estimatedWaitTime,
			},
		});
	} catch (err) {
		return NextResponse.json({ status: 500, message: err.message });
	}
}
