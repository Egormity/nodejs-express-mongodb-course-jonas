const fs = require('fs');
const http = require('http');
const url = require('url');

const slugify = require('slugify');

const replaceTemplate = require('./modules/replaceTemplate');

//////////////////////////////////////////////////
// ===> FILES <=== //

// =====> SYNC WAY <===== //
// const textIn = fs.readFileSync('./txt/input.txt', 'utf-8');
// const textOut = `(${new Date()}) About avocado: ${textIn}`;
// fs.writeFileSync('./txt/output.txt', textOut);

// ===> ASYNC WAY <=== //
// fs.readFile('./txt/start.txt', 'utf-8', (err1, data1) => {
//   if (err1) return console.log('ERROR! 💥');

//   fs.readFile(`./txt/${data1}.txt`, 'utf-8', (err2, data2) => {
//     fs.readFile(`./txt/append.txt`, 'utf-8', (err3, data3) => {
//       fs.writeFile('./txt/final.txt', `${data2}\n${data3}`, 'utf-8', err4 => {
//         console.log('Your file has been written 😁');
//       });
//     });
//   });
// });
// console.log('Reading file');

//////////////////////////////////////////////////
// ===> SERVER <=== //
const tempOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, 'utf-8');
const tempCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8');
const tempProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`, 'utf-8');

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObj = JSON.parse(data);

const slugs = dataObj.map(el => slugify(el.productName, { lower: true }));
console.log(slugs);

const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);

  // ===> OVERVIEW PAGE <=== //
  if (pathname === '/' || pathname === '/overview') {
    res.writeHead(200, { 'Content-type': 'text/html' });

    const cardsHtml = dataObj.map(el => replaceTemplate(tempCard, el)).join('');

    res.end(tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml));

    // ===> PRODUCT PAGE <=== //
  } else if (pathname === '/product') {
    const product = dataObj[query.id];
    const output = replaceTemplate(tempProduct, product);

    res.writeHead(200, { 'Content-type': 'text/html' });
    res.end(output);

    // ===> API <=== //
  } else if (pathname === '/api') {
    res.writeHead(200, { 'Content-type': 'application/json' });
    res.end(data);

    // ===> NOT FOUND <=== //
  } else {
    res.writeHead(404, { 'Content-type': 'text/html', 'my-own-header': 'hello-world' });
    res.end('<h1>Page not found! 404</h1>');
  }
});

server.listen(8000, '127.0.0.1', () => {
  console.log('Server listening on port 8000');
});
