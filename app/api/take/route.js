import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
	try {
		const body = await request.json();
		const { id, latestPusher } = body;

		// Get the most recent queue entry based on the provided id
		const maxNumber = await prisma.queue.findFirst({
			where: { id },
			orderBy: { number: "desc" },
		});

		if (maxNumber) {
			// If there is an existing entry and latestPusher is less than maxNumber.number
			if (maxNumber.number > latestPusher) {
				const newNumber = maxNumber.number + 1;

				await prisma.queue.create({
					data: {
						id,
						number: newNumber,
					},
				});

				return NextResponse.json({ number: newNumber });
			}

			// If latestPusher is not less than maxNumber.number, return the current maxNumber
			return NextResponse.json({ number: maxNumber.number });
		}

		// If no entry exists for the given id, create the first one
		const newNumber = latestPusher + 1;
		await prisma.queue.create({
			data: {
				id,
				number: newNumber,
			},
		});

		return NextResponse.json({ number: newNumber });
	} catch (err) {
		return NextResponse.json({ status: 500, message: err.message });
	}
}
