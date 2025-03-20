const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const ModelTour = require("../models/modelTour");
const ModelBooking = require("../models/modelBooking");

const utilCatchAsync = require("../utils/functions/utilCatchAsync");
const utilSendResJson = require("../utils/functions/utilSendResJson");

//
exports.getCheckoutSession = utilCatchAsync(async (req, res, next) => {
    // 1. Get the currently booked tour
    const { tourId } = req.params;
    await ModelTour.findById(tourId);

    // 2. Create checkout session
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        success_url: `${baseUrl}?tour=${tourId}&user=${trq.user._id}&price=${tour.price}`,
        cancel_url: `${baseUrl}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: tourId,
        line_items: [
            {
                name: `${tour.name} Tour`,
                description: tour.summary,
                images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
                amount: tour.price * 100,
                currency: "usd",
                quantity: 1,
            },
        ],
    });

    // 3. Create session as response
    utilSendResJson({ res, statusCode: 200, session });
});

//
exports.createBookingCheckout = utilCatchAsync(async (req, res, next) => {
    // 1. TODO: Temporarily, not secure
    const { tour, user, price } = req.query;
    if (!tour || !user || !price) return next();

    //
    await ModelBooking.create({ tour, user, price });
    res.redirect(req.originalUrl.split("?")[0]);
});
