const axios = require('axios');
const express = require('express');
const app = express();
const port = 3000;

require('dotenv').config();


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

async function getAllProducts(baseUrl, consumerKey, consumerSecret, table, perPage = 100) {
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

async function SearchBy(nombre, array, searchby, parentId = 0) {

  parentId = 0;
  //busca los que tienen el parient 0 de ahi buscar  subcategorias hasta el hijso mas chico

  const parents = array.filter(element => element.name == nombre);





}
async function arraCategories(string, wc) {
  const allCat = [];
  const listCategories = string.split(",");
  for (const cat of listCategories) {
    const catArray = cat.split(">").map(c => c.trim());
    const id = await searchby(catArray, 0, wc);
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


async function BuscarID(String, categories) {
  const StringArray = String.split('>');
  parentId = 0;
  let contador = 0;
   let categoria;
  if (StringArray.length > 0) {
    while (contador < StringArray.length) {
      console.log(StringArray.at(contador))
     categoria= categories.filter((categorie) => {

        if (categorie.name == StringArray.at(contador) && categorie.parent == parentId) {
          parentId=categorie.id;
        return  categorie.name == StringArray.at(contador) && categorie.parent == parentId;

        }


      })
      contador++;


    }


  }
  return parentId;
}

//funcion Buscar Tags
async function SearchTags(nombre , Tags) {
   let TagId=0;
   Tags.filter((Tag)=>{
    if(Tag.name==nombre){
    TagId=Tag.id;
      return Tag.name==nombre;
    }


   });
  return TagId;
  
}
  // Uso del código
  (async () => {
    const baseUrl = process.env. URL;
    const consumerKey = process.env.CONSUMER_KEY;
    const consumerSecret = process.env.CONSUMER_SECRET;
    const table = 'products';

    const allProducts = await getAllProducts(baseUrl, consumerKey, consumerSecret, table);
    console.log(`Total productos obtenidos: ${allProducts.length}`);
    const table1 = 'products/categories';
    const allCategories = await getAllProducts(baseUrl, consumerKey, consumerSecret, table1);
    console.log(`Total categories obtenidos: ${allCategories.length}`);
    const table2 = 'products/tags';
    const allTags = await getAllProducts(baseUrl, consumerKey, consumerSecret, table2);
    console.log(`Total etiquetas obtenidos: ${allTags.length}`);
    //recibimos todas las categorias y empezamos con el parentId=0

 
    const nombre = 'Ropa';

    const resultado=await BuscarID(nombre,allCategories);
    console.log(resultado);
    const  Tagtest='Flores';
    const Tag= await SearchTags(Tagtest,allTags);

    console.log('la etiqueta es :'+Tag);
    console.log(allTags);
  })();



 