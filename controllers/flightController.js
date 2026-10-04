import Flight from "../models/Flight.js";

export const createFlight = async (req, res, next) => {
  try {
    const {
      flightNumber,
      airline,
      departureCity,
      arrivalCity,
      departureDate,
      arrivalDate,
      price,
      availableSeats,
    } = req.body;
    const flightData = {
      flightNumber,
      airline,
      departureCity,
      arrivalCity,
      departureDate,
      arrivalDate,
      price: Number(price || 0),
      availableSeats: Number(availableSeats || 0),
      createdBy: req.user ? req.user._id : undefined,
    };
    if (req.file) flightData.image = `/uploads/${req.file.filename}`;
    const flight = await Flight.create(flightData);
    res.status(201).json(flight);
  } catch (err) {
    next(err);
  }
};

export const getFlights = async (req, res, next) => {
  try {
    const {
      departureCity,
      arrivalCity,
      departureDate,
      minPrice,
      maxPrice,
      airline,
      page = 1,
      limit = 10,
      sort,
    } = req.query;
    const query = {};
    if (departureCity) query.departureCity = departureCity;
    if (arrivalCity) query.arrivalCity = arrivalCity;
    if (departureDate) query.departureDate = { $gte: new Date(departureDate) };
    if (airline) query.airline = airline;
    if (minPrice || maxPrice) query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);

    const skip = (Number(page) - 1) * Number(limit);
    let q = Flight.find(query).skip(skip).limit(Number(limit));
    if (sort) q = q.sort(sort);
    const [flights, total] = await Promise.all([
      q.exec(),
      Flight.countDocuments(query),
    ]);
    res.json({
      flights,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    next(err);
  }
};

export const getFlight = async (req, res, next) => {
  try {
    const flight = await Flight.findById(req.params.id);
    if (!flight) return res.status(404).json({ message: "Flight not found" });
    res.json(flight);
  } catch (err) {
    next(err);
  }
};

export const updateFlight = async (req, res, next) => {
  try {
    const flight = await Flight.findById(req.params.id);
    if (!flight) return res.status(404).json({ message: "Flight not found" });
    Object.assign(flight, req.body);
    if (req.file) flight.image = `/uploads/${req.file.filename}`;
    await flight.save();
    res.json(flight);
  } catch (err) {
    next(err);
  }
};

export const deleteFlight = async (req, res, next) => {
  try {
    const flight = await Flight.findByIdAndDelete(req.params.id);
    if (!flight) return res.status(404).json({ message: "Flight not found" });
    res.json({ message: "Flight deleted" });
  } catch (err) {
    next(err);
  }
};

export default {
  createFlight,
  getFlights,
  getFlight,
  updateFlight,
  deleteFlight,
};
