//
const fs = require("fs");

//
const PATH = `${__dirname}/../dev-data/data/tours-simple.json`;
let tours = JSON.parse(fs.readFileSync(PATH));

//
exports.checkTourId = (req, res, next, value) => {
    const isTour = tours.some((item) => item.id + "" === value);
    if (!isTour) {
        return res.status(404).json({
            status: "error",
            message: "Invalid id",
            data: null,
        });
    }
    next();
};

//
exports.checkPostTour = (req, res, next, value) => {
    if (!req.body.name || !req.body.price) {
        return res.status(400).json({
            status: "fail",
            message: "Missing name or price",
        });
    }
    next();
};

//
exports.getTours = (req, res) => {
    res.status(200).json({
        status: "success",
        results: tours.length,
        data: tours,
    });
};

//
exports.getTour = (req, res) => {
    const { id } = req.params;
    const tour = tours.find((item) => item.id + "" === id);
    res.status(200).json({
        status: "success",
        data: tour,
    });
};

//
exports.postTour = (req, res) => {
    const newId = tours.at(-1).id + 1;
    newTour = Object.assign(req.body, { id: newId });
    tours.push(newTour);
    fs.writeFile(PATH, JSON.stringify(tours), (err) => {
        if (err) console.log(err);
    });
    res.status(201).json({
        status: "success",
        data: newTour,
    });
};

//
exports.patchTour = (req, res) => {
    const { id } = req.params;
    const tour = tours.find((item) => item.id + "" === id);
    const newFields = req.body;
    delete newFields["id"];
    Object.keys(newFields).forEach((field) => {
        if (!tour[field]) delete newFields[field];
    });
    const updatedTour = { ...item, ...newFields };
    tours = tours.map((item) => (item.id + "" === id ? updatedTour : item));
    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), (err) => {
        if (err) console.log(err);
    });
    res.status(201).json({ status: "success", data: updatedTour });
};

//
exports.deleteTour = (req, res) => {
    const { id } = req.params;
    tours = tours.filter((item) => item.id + "" !== id);
    res.status(201).json({ status: "success", data: null });
};
