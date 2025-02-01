const fs = require("fs");
const http = require("http");
const url = require("url");

// --- Sync files ---
// const textIn = fs.readFileSync("./txt/input.txt", "utf-8")
// const textOut = `This is what we know about the avocados: ${textIn}.\nCreated on ${Date.now()}`
// fs.writeFileSync('./txt/output.txt', textOut);

// --- Async files ---
// fs.readFile("./txt/start.txt", "utf-8", (err1, data1) => {
//     if (err1) return console.log("Error!")
//     fs.readFile(`./txt/${data1}.txt`, "utf-8", (err2, data2) => {
//         if (err2) return console.log("Error!")
//         fs.readFile(`./txt/append.txt`, "utf-8", (err3, data3) => {
//             if (err3) return console.log("Error!")
//             fs.writeFile("./txt/final.txt", `${data2}\n${data3}`, "utf-8", err4 => {
//                 if (err4) return console.log("Error!")
//                 console.log("Good!")
//             })
//         })
//     })
// })

// --- http ---
const replaceTemplate = (template, product) => {
    let output = template; 
    output = output.replace(/{%NAME%}/g, product.productName);
    output = output.replace(/{%IMAGE%}/g, product.image);
    output = output.replace(/{%PRICE%}/g, product.price);
    output = output.replace(/{%FROM%}/g, product.from);
    output = output.replace(/{%NUTRIENTS%}/g, product.nutrients);
    output = output.replace(/{%QUANTITY%}/g, product.quantity);
    output = output.replace(/{%ID%}/g, product.id);
    if (!product.organic) output = output.replace(/{%NOT_ORGANIC%}/g, "not_organic");
    return output;
}

const templateOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, "utf-8");
const templateCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, "utf-8");
const templateProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`, "utf-8");

const dataJson = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8");
const dataObj = JSON.parse(dataJson);

const server = http.createServer((req, res) => {
    const pathName = req.url;

    // Api
    if (pathName === "/api") {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(dataJson);
    }

    // Page overview
    else if (pathName === "/" || pathName === "/overview") {
        res.writeHead(200, { "content-type": "text/html" });
        const cardsHtml = dataObj.map((el) => replaceTemplate(templateCard, el)).join("");
        const updatedTemplate = templateOverview.replace("{%PRODUCT_CARDS%}", cardsHtml);
        res.end(updatedTemplate);
    }
    
    // Page product
    else if (pathName === "/product") {
        res.end("PRODUCT");
    }
    
    // Page not found
    else {
        res.writeHead(404, {
            "content-type": "text/html",
            "my-header": "Hello headers!"
        });
        res.end("<h1>404 Page not found</h1>");
    }
});

server.listen(8000, "127.0.0.1", () => {
    console.log("Listening to requests on port 8000");
})