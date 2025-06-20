import { Request, Response } from "express";
import prisma from "../lib/prisma";

export const createBooking = async (req: Request, res: Response) => {
  const { date, service, userId } = req.body;

  try {
    const booking = await prisma.booking.create({
      data: {
        date: new Date(date),
        service,
        user: { connect: { id: userId } },
      },
    });
    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error creating booking");
  }
};
