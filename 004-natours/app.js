const fs = require("fs");

const express = require("express");

//
const app = express();
app.use(express.json());

//
let tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));

//
const getAllTours = (req, res) => {
    res.status(200).json({
        status: "success",
        results: tours.length,
        data: tours,
    });
};

//
const getATour = (req, res) => {
    const { id } = req.params;
    const tour = tours.find((item) => item.id + "" === id);
    if (tour) {
        res.status(200).json({
            status: "success",
            data: tour,
        });
    } else {
        res.status(404).json({
            status: "error",
            message: "Invalid id",
            data: null,
        });
    }
};

//
const postATour = (req, res) => {
    const newId = tours.at(-1).id + 1;
    newTour = Object.assign(req.body, { id: newId });
    tours.push(newTour);
    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), (err) => {
        if (err) console.log(err);
    });
    res.status(201).json({
        status: "success",
        data: newTour,
    });
};

//
const pathATour = (req, res) => {
    const { id } = req.params;
    const tour = tours.find((item) => item.id + "" === id);
    if (tour) {
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
    } else {
        res.status(404).json({ status: "error", message: "Invalid id", data: null });
    }
};

//
const deleteATour = (req, res) => {
    const { id } = req.params;
    const isTour = tours.some((item) => item.id + "" === id);
    if (isTour) {
        tours = tours.filter((item) => item.id + "" !== id);
        res.status(201).json({ status: "success", data: null });
    } else {
        res.status(204).json({ status: "error", message: "Invalid id", data: null });
    }
};

//
// app.get("/api/v1/tours", getAllTours);
// app.get("/api/v1/tours/:id", getATour);
// app.post("/api/v1/tours", postATour);
// app.patch("/api/v1/tours/:id", pathATour);
// app.delete("/api/v1/tours/:id", deleteATour);

//
app.route("/api/v1/tours")
    .get(getAllTours)
    .get(getATour)
    .post(postATour)
    .patch(pathATour)
    .delete(deleteATour);

//
const port = 3000;
app.listen(port, () => {
    console.log(`App running on port ${port}`);
});
