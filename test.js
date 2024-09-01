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

async function  SearchBy(nombre, array , searchby,parentId=0)
{

        parentId=0;
     //busca los que tienen el parient 0 de ahi buscar  subcategorias hasta el hijso mas chico

     const parents=array.filter(element=> element.name==nombre );
         




}
async function arraCategories(string, wc) {
  const allCat = [];
  const listCategories = string.split(",");
  for (const cat of listCategories) {
      const catArray = cat.split(">").map(c => c.trim());
      const id = await findCategoryId2(catArray, 0, wc);
      if (id !== 0) {
          allCat.push({ id: id });
      }
  }
  return allCat;
}
function buscarenstrclass(objetos, r) {
  return objetos.filter(obj => obj.parent === r);
}

async function findCategoryId2(categories, parentId = 0, allCat) {
  let currentParentId = parentId;

  for (const categoryName of categories) {
      const subcategories = buscarenstrclass(allCat, currentParentId);

      let found = false;
      for (const subcategory of subcategories) {
          if (subcategory.name === categoryName) {
              currentParentId = subcategory.id;
              found = true;
              break;
          }
      }

      if (!found) {
          return null;
      }
  }

  return currentParentId;
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
  //recibimos todas las categorias y empezamos con el parentId=0

  const nombre='Ropa';
  const parent=0;
 
  const categories=allCategories.filter(categorie=>{

  return  categorie.name==nombre && categorie.parent==parent;

  })

  categories.forEach(categorie=>{
    console.log(categorie.id)
  })


})();



app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });