const axios = require('axios');
const express = require('express');
const app = express();
const port = 3000;
async function fetchProducts(url, auth, params) {
  try {
    const response = await axios.get(url, {
      auth: auth,
      params: params
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching products: ${error}`);
    return [];
  }
}

async function getAllProducts(baseUrl, consumerKey, consumerSecret,table, perPage = 100) {
  const url = `${baseUrl}/wp-json/wc/v3/${table}`;
  const auth = {
    username: consumerKey,
    password: consumerSecret
  };
  let products = [];
  let page = 1;

  while (true) {
    const params = {
      per_page: perPage,
      page: page
    };
    const response = await fetchProducts(url, auth, params);
    if (response.length === 0) {
      break;
    }
    products = products.concat(response);
    page++;
  }

  return products;
}

// Uso del código
(async () => {
  const baseUrl = 'https://janadigital.com.mx/';
  const consumerKey = '';
  const consumerSecret = '';
  const table = 'products';

  const allProducts = await getAllProducts(baseUrl, consumerKey, consumerSecret,table);
  console.log(`Total productos obtenidos: ${allProducts.length}`);
  const table1 = 'products/categories';
  const allCategories = await getAllProducts(baseUrl, consumerKey, consumerSecret,table1);
  console.log(`Total categories obtenidos: ${allCategories.length}`);
  const table2 = 'products/tags';
  const allTags = await getAllProducts(baseUrl, consumerKey, consumerSecret,table2);
  console.log(`Total etiquetas obtenidos: ${allTags.length}`);

  allProducts.forEach(product => {
    
    console.log(product.categories);
  });

 

})();



app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });