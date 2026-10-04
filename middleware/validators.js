import { body, validationResult } from "express-validator";

export const registerValidator = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email required"),
  body("password").isLength({ min: 6 }).withMessage("Password min length 6"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    next();
  },
];

export const loginValidator = [
  body("email").isEmail(),
  body("password").notEmpty(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    next();
  },
];

export const flightValidator = [
  body("flightNumber").notEmpty(),
  body("airline").notEmpty(),
  body("departureCity").notEmpty(),
  body("arrivalCity").notEmpty(),
  body("departureDate").notEmpty(),
  body("arrivalDate").notEmpty(),
  body("price").isNumeric(),
  body("availableSeats").isInt({ min: 0 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    next();
  },
];

export const bookingValidator = [
  body("flightId").notEmpty(),
  body("passengers").isArray({ min: 1 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    next();
  },
];
