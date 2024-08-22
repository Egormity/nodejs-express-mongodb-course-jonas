module.exports = function (temp, product) {
  const newTemp = temp;
  return newTemp
    .replace(/{%PRODUCTNAME%}/g, product.productName)
    .replace(/{%IMAGE%}/g, product.image)
    .replace(/{%PRICE%}/g, product.price)
    .replace(/{%FROM%}/g, product.from)
    .replace(/{%NUTRIENTS%}/g, product.nutrients)
    .replace(/{%QUANTITY%}/g, product.quantity)
    .replace(/{%ID%}/g, product.id)
    .replace(/{%NOT_ORGANIC%}/g, !product.organic ? 'not-organic' : '')
    .replace(/{%DESCRIPTION%}/g, product.description);
};
