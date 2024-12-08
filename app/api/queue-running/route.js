import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { endOfDay, startOfDay } from "date-fns";

const prisma = new PrismaClient();

export async function GET() {
	try {
		// Ambil nomor antrian terbaru hari ini
		const nomorAntrianHariIni = await prisma.queueRunning.findFirst({
			where: {
				createdAt: {
					gte: startOfDay(new Date()), // Awal hari
					lte: endOfDay(new Date()), // Akhir hari
				},
			},
		});

		// Jika tidak ada data, kembalikan respons dengan pesan khusus
		if (!nomorAntrianHariIni) {
			return NextResponse.json({
				status: 203,
				message: "Belum ada nomor antrian untuk hari ini",
				nomor: 0,
			});
		}

		return NextResponse.json({
			status: 200,
			message: "OK",
			nomor: nomorAntrianHariIni.number,
		});
	} catch (err) {
		return NextResponse.json({ status: 500, message: err.message });
	}
}
