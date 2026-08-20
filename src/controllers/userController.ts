import { Request, Response } from "express"
import { User } from '../models/userModel'
import { Booking } from '../models/BookingModel'


import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ClassSession } from "../models/ClassSessionModel";

const maxAge = 60 * 60 // 1 hour

const createToken = (email: String, role: string): string => {
  return jwt.sign({ email, role }, process.env.JWT_SECRET as string, {
    expiresIn: maxAge,
  })
}


const signUp = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;


    const userExists = await User.findOne({ email: email });

    if (userExists) {
      return res.status(400).json({ msg: "User already exists" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const theUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    const token = createToken(theUser.email, theUser.role);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: maxAge * 1000,
    })

    res.status(201).json({
      status: 201,
      msg: "user created"
    });
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
}


const signIn = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid email or password" })
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid email or password" })
    }

    const token = createToken(user.email, user.role);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: maxAge * 1000,
    })

    res.status(200).json({
      status: 200,
      data: user.email,
    });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
}


const signOut = (req: Request, res: Response) => {
  res.clearCookie("token")

  res.status(200).json({
    status: 200,
    msg: "Logged out successfully",
  })
}


const get_BookingsForMySessions = async (req: Request, res: Response) => {
  try {
    const ID = req.params.sessionID as string;
    const bookings = await Booking.find({ session_reference: ID });
    if (!bookings) {
      res.status(404).json({
        status: 404,
        msg: "Not found",
      });
    }
    return res.json(bookings);
  } catch {
    return res.status(400).json({ error: "Unknown Error" })
  }
}
const patch_BookingsForMySessions = async (req: Request, res: Response) => {

  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ msg: "Unauthorized" });
  }

  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { email: string, role: string }
    const ID = req.params.sessionID as string;
    const { title, timeSlot, capacity } = req.body;

    const session = await ClassSession.findOne({ id: ID });
    if (!session) {
      return res.status(404).json({
        status: 404,
        msg: "Not found",
      });
    }
    const result = await ClassSession.updateOne(
      { id: ID },
      { $set: { title, trainer:decoded.email, timeSlot, capacity } }
    );
    return res.json(result);
  } catch {
    return res.status(400).json({ error: "Unknown Error" })
  }
}
const put_BookingsForMySessions = async (req: Request, res: Response) => {


  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ msg: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { email: string, role: string }
    const {
      title,
      timeSlot,
      capacity } = req.body;



    const totalSessions = await ClassSession.countDocuments();

    const theSession = await ClassSession.create({
      id: String(totalSessions + 1),
      title,
      trainer: decoded.email,
      timeSlot,
      capacity
    });

    res.status(201).json(theSession);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
}
const delete_BookingsForMySessions = async (req: Request, res: Response) => {

  try {
    const ID = req.params.sessionID as string;
    const result = await ClassSession.deleteOne({ id: ID });
    return res.json(result);
  } catch {

    return res.status(400).json({ error: "Error" })
  }
}


const view_all_available_sessions = async (req: Request, res: Response) => {
  try {
    const sessions = await ClassSession.find();
    if (!sessions) {
      res.status(404).json({
        status: 404,
        msg: "Not found",
      });
    }
    return res.json(sessions);
  } catch {
    return res.status(400).json({ error: "Unknown Error" })
  }
}
const createBooking = async (req: Request, res: Response) => {


 const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ msg: "Unauthorized" });
  }

  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { email: string, role: string }
    const {
      session_reference } = req.body;

    const session = await ClassSession.findOne({ id: session_reference });
    if (!session) {
      return res.status(404).json({ msg: "Session not found" });
    } else if (session.capacity == 0) {
      return res.status(404).json({ msg: "Session is full" });
    }
    const book = await Booking.findOne({ session_reference, member:decoded.email });

    if (book && book.status != 'Cancelled') {
      return res.status(404).json({ msg: "User already registered for this session" });

    }
    const cap = parseInt(String(session.capacity), 10);


    const result = await ClassSession.updateOne(
      { id: session_reference },
      { $set: { capacity: String(cap - 1) } }
    );

    const totalBookings = await Booking.countDocuments();

    const theSession = await Booking.create({
      id: String(totalBookings + 1),
      session_reference,
      member:decoded.email
    });

    res.status(201).json(theSession);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
}
const cancelBooking = async (req: Request, res: Response) => {

  try {
    const ID = req.params.sessionID as string;

    const session = await Booking.findOne({ id: ID });
    if (!session) {
      return res.status(404).json({
        status: 404,
        msg: "Not found",
      });
    }

    const result = await Booking.updateOne(
      { id: ID },
      { $set: { status: "Cancelled" } }
    );
    return res.json(result);
  } catch {
    return res.status(400).json({ error: "Unknown Error" })
  }
}
export { signOut, signUp, signIn, get_BookingsForMySessions, patch_BookingsForMySessions, put_BookingsForMySessions, delete_BookingsForMySessions, view_all_available_sessions, createBooking, cancelBooking }
