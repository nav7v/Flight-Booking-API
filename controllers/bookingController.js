import Booking from "../models/Booking.js";
import Flight from "../models/Flight.js";
import { getIo } from "../utils/socket.js";
import { sendMail } from "../utils/mailer.js";

export const createBooking = async (req, res, next) => {
  try {
    const { flightId, passengers } = req.body;
    const seats = passengers.length;
    const flight = await Flight.findById(flightId);
    if (!flight) return res.status(404).json({ message: "Flight not found" });
    if (flight.availableSeats < seats)
      return res.status(400).json({ message: "Not enough seats" });
    flight.availableSeats -= seats;
    await flight.save();
    const totalPrice = seats * flight.price;
    const booking = await Booking.create({
      user: req.user._id,
      flight: flight._id,
      passengers,
      seats,
      totalPrice,
    });
    // notify via websocket
    const io = getIo();
    if (io)
      io.emit("seatUpdate", {
        flightId: flight._id,
        availableSeats: flight.availableSeats,
      });
    // send confirmation email (best-effort)
    try {
      if (req.user && req.user.email)
        await sendMail({
          to: req.user.email,
          subject: "Booking confirmation",
          text: `Your booking ${booking._id} is confirmed.`,
        });
    } catch (e) {
      console.error("Mail error", e.message || e);
    }
    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
};

export const getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("flight")
      .populate("user", "-password");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    // only owner or admin
    if (
      String(booking.user._id) !== String(req.user._id) &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }
    res.json(booking);
  } catch (err) {
    next(err);
  }
};

export const requestCancel = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (String(booking.user) !== String(req.user._id))
      return res.status(403).json({ message: "Forbidden" });
    booking.status = "cancellation_requested";
    await booking.save();
    res.json({ message: "Cancellation requested" });
  } catch (err) {
    next(err);
  }
};

export const adminCancel = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.status === "cancelled")
      return res.status(400).json({ message: "Already cancelled" });
    booking.status = "cancelled";
    await booking.save();
    // restore seats
    const flight = await Flight.findById(booking.flight);
    flight.availableSeats += booking.seats;
    await flight.save();
    // notify websocket
    const io2 = getIo();
    if (io2)
      io2.emit("seatUpdate", {
        flightId: flight._id,
        availableSeats: flight.availableSeats,
      });
    // send email
    try {
      const populated = await booking.populate("user");
      if (populated && populated.user && populated.user.email)
        await sendMail({
          to: populated.user.email,
          subject: "Booking cancelled",
          text: `Your booking ${booking._id} has been cancelled by admin.`,
        });
    } catch (e) {
      console.error("Mail error", e.message || e);
    }
    res.json({ message: "Booking cancelled" });
  } catch (err) {
    next(err);
  }
};

export default { createBooking, getBooking, requestCancel, adminCancel };
