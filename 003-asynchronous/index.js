const fs = require("fs");
const superagent = require("superagent");

//
// fs.readFile(`${__dirname}/dog.txt`, (err, data) => {
//     if (err) return console.log(err.message);

//     superagent.get(`https://dog.ceo/api/breed/${data.toString()}/images/random`).end((err, res) => {
//         if (err) return console.log(err.message);

//         fs.writeFile("dog-img.txt", res.body.message, (err) => {
//             if (err) return console.log(err.message);
//             console.log("Random dog image written!");
//         });
//     });
// });

//
const readFilePro = (file) =>
    new Promise((resolve, reject) =>
        fs.readFile(file, (err, data) => (err ? reject(err.message) : resolve(data)))
    );

const writeFilePro = (file, data) =>
    new Promise((resolve, reject) =>
        fs.writeFile(file, data, (err) => (err ? reject(err) : resolve("Success")))
    );

//
// readFilePro(`${__dirname}/dog.txt`)
//     .then((res) => superagent.get(`https://dog.ceo/api/breed/${res.toString()}/images/random`))
//     .then((res) => writeFilePro("dog-img.txt", res.body.message))
//     .then((res) => console.log(res))
//     .catch((err) => console.log(err));

//
const getDigPic = async () => {
    try {
        const name = await readFilePro(`${__dirname}/dog.txt`);
        const res = await superagent.get(`https://dog.ceo/api/breed/${name.toString()}/images/random`);
        const image = res.body.message;
        const result = writeFilePro("dog-img.txt", image);
        console.log(result);
    } catch (err) {
        console.log(err);
    }
};

(async () => {
    try {
        const name = await readFilePro(`${__dirname}/dog.txt`);
        const res1 = await superagent.get(`https://dog.ceo/api/breed/${name.toString()}/images/random`);
        const res2 = await superagent.get(`https://dog.ceo/api/breed/${name.toString()}/images/random`);
        const res3 = await superagent.get(`https://dog.ceo/api/breed/${name.toString()}/images/random`);
        const all = await Promise.all([res1, res2, res3].map((el) => el.body.message));
        writeFilePro("dog-img.txt", all.join("\n"));
    } catch (err) {
        console.log(err);
    }
})();
