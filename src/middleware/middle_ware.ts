import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ClassSession } from '../models/ClassSessionModel'
import { Booking } from "../models/BookingModel";





const authorizeUserIdentity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ msg: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { email: string, role: string }
    const sessionId = req.params.sessionID;
    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({ msg: "Invalid or missing session ID" });
    }
    const session = await Booking.findOne({ id: sessionId });
    if (!session) {
      return res.status(404).json({ msg: "Not found" });
    }

    const isTheMember = session.member === decoded.email;

    const isMember = decoded.role === 'Member';
    if (!isTheMember || !isMember) {
      return res.status(403).json({ msg: "Unauthorized" });
    }
    next()
  } catch (error) {
    return res.status(401).json({ msg: "Invalid token" })
  }
}


const authorizeTrainer = (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ msg: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { email: string, role: string }

    if (decoded.role !== "Trainer") {
      return res.status(403).json({ msg: "Unauthorized" })
    }
    next()
  } catch (error) {
    return res.status(401).json({ msg: "Invalid token" })
  }
}


const authorizeUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ msg: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { email: string, role: string }

    if (decoded.role !== "Member") {
      return res.status(403).json({ msg: "Unauthorized" })
    }
    next()
  } catch (error) {
    return res.status(401).json({ msg: "Invalid token" })
  }
}


const authorization = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ msg: "Log in first" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { email: string, role: string }
    const sessionId = req.params.sessionID;
    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({ msg: "Invalid or missing session ID" });
    }
    const session = await ClassSession.findOne({ id: sessionId });

    if (!session) {
      return res.status(404).json({ msg: "Not found" });
    }

    const isTheTrainer = session.trainer === decoded.email;

    const isTrainer = decoded.role === 'Trainer';
    if (!isTheTrainer || !isTrainer) {
      return res.status(403).json({ msg: "Unauthorized" });
    }
    next()
  } catch (error) {
    return res.status(401).json({ msg: "Invalid token" })
  }
}





export { authorization, authorizeUser, authorizeUserIdentity, authorizeTrainer }