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
			orderBy: {
				createdAt: "desc", // Ambil data terbaru
			},
		});

		// Jika tidak ada data, kembalikan respons dengan pesan khusus
		if (!nomorAntrianHariIni) {
			return NextResponse.json({
				status: 203,
				message: "Belum ada nomor antrian untuk hari ini",
				id: nomorAntrianHariIni.id,
				nomor: null,
			});
		}

		return NextResponse.json({
			status: 200,
			message: "OK",
			id: nomorAntrianHariIni.id,
			nomor: nomorAntrianHariIni.number,
		});
	} catch (err) {
		return NextResponse.json({ status: 500, message: err.message });
	}
}
