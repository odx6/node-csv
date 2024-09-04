const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

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

      categoria = categories.filter((categorie) => {

        if (categorie.name == StringArray.at(contador) && categorie.parent == parentId) {
          parentId = categorie.id;
          return categorie.name == StringArray.at(contador) && categorie.parent == parentId;

        }


      })
      contador++;


    }


  }
  return parentId;
}

//funcion Buscar Tags
async function SearchTags(nombre, Tags) {
  let TagId = 0;
  Tags.filter((Tag) => {
    if (Tag.name == nombre) {
      TagId = Tag.id;
      return Tag.name == nombre;
    }


  });
  return TagId;

}
async function ArrayCategories(String, allCategories) {
  let arrayCategories = []
  const Categories = String.split(",")

  if (Categories.length > 0) {
    Categories.forEach(categorie => {

      BuscarID(categorie, allCategories).then(response => {
        if (response !== 0) arrayCategories.push({ id: response })
      }).catch(response => {
        console.log("Error" + response);

      })


    })


  }
  return arrayCategories;
}

async function ArrayTags(String, allTags) {
  let arrayTags = [];
  const Tags = String.split(",");
  if (Tags.length > 0) {
    Tags.forEach(Tag => {
      SearchTags(Tag, allTags).then(response => {

        if (response !== 0) arrayTags.push({ id: response })
      }).catch(response => {

        console.log('Error' + response);
      })


    })



  }

 return arrayTags;


}
async function arrayImages(String) {
  const images=String.split(',');
  let arrayImages=[];
  
  if(images.length>0){
    images.forEach(image =>{
      arrayImages.push({src:image})
    })
  

  }
  return arrayImages;
  
}



// Configuración de multer para manejar la carga de archivos
const upload = multer({ dest: 'uploads/' });

// Configurar el motor de plantillas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Ruta para mostrar el formulario de carga
app.get('/', (req, res) => {
  res.render('index');
});

// Ruta para manejar la carga del archivo CSV
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (row) => results.push(row))
    .on('end', () => {
      fs.unlinkSync(req.file.path); // Eliminar el archivo después de la lectura

      res.render('display', { data: results });



      (async () => {

        
        const baseUrl = 'https://janadigital.com.mx/';
        const consumerKey = 'ck_1c412e9273036147294f84afc40a5470e323235c';
        const consumerSecret = 'cs_e0b80624365bc7961a5135d80531fcb647b203f4';
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
/*

        const nombre = 'Ropa>Camisas>Grande,Ropa>Camisas>Grande';

        const resultado = await ArrayCategories(nombre, allCategories);
        console.log(resultado);
        const Tagtest = 'Flores,Promocion,Puntos 10,Promocion;Ventas de Agosto';
        const Tag = await ArrayTags(Tagtest, allTags);

        console.log(Tag);
        const imagenesPrueba='https://janadigital.com.mx/wp-content/uploads/2024/08/blog-2-100x100.jpg,https://janadigital.com.mx/wp-content/uploads/2024/08/blog-2-100x100.jpg'
         const arrayIma=await arrayImages(imagenesPrueba);
         console.log(arrayIma);*/
        contador = 0;
        results.forEach(productos => {

          productos['dimension'] = {
            'length': productos.length,
            'width': productos.width,
            'height': productos.height,
          }
          
          ArrayCategories(productos.categories, allCategories).then(response=>{
            productos['categories']=response;
            console.log(productos)
          }).catch(response=>{

            console.log(response)
          })

         

        })

      })();


      // console.log(results);
      

    });


});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
