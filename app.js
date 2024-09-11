const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const _ = require('lodash');
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
const app = express();
const port = 3000;

const WooCommerce = new WooCommerceRestApi({
  url: 'https://janadigital.com.mx/', // Your store URL
  consumerKey: 'ck_1c412e9273036147294f84afc40a5470e323235c', // Your consumer key
  consumerSecret: 'cs_e0b80624365bc7961a5135d80531fcb647b203f4', // Your consumer secret
  version: 'wc/v3', // WooCommerce WP REST API version
  timeout:120000
});

async function fetchProducts(url, auth, params) {
  try {
    const response = await axios.get(url, {
      auth: auth,
      params: params,
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching products: ${error}`);
    return [];
  }
}

async function Actualizar(allProducts, data) {
  let update = [];
  let create = [];


  for (const dato of data) {

    let resultado = await Buscar(allProducts, dato.sku);

    if (resultado != 0) {

      const arrayDeEntradas = Object.entries(dato);

      arrayDeEntradas.unshift(['id', resultado]);
      arrayDeEntradas.splice(1, 1);

      let value = Object.fromEntries(arrayDeEntradas)
      //dato.id = resultado;
      update.push(value);
    } else {

      //
      const arrayDeEntradas2 = Object.entries(dato);

      arrayDeEntradas2.splice(0, 1);

      let value2 = Object.fromEntries(arrayDeEntradas2)
      create.push(value2)

    }



  }


  /*WooCommerce.put("products/batch", data)
    .then((response) => {
      console.log(response.data);
    })
    .catch((error) => {
      console.log(error.response.data);
    });*/
  return { update, create }
}


async function Buscar(allProducts, skuSearch) {
  id = 0;

  /*const producto = allProducts.filter(producto => producto.sku === skuSearch)
  return producto;*/
  let producto=allProducts.filter(producto=>producto.sku== skuSearch)
  if(producto.length >0 && producto.length<2){
     id=producto[0].id;

  }
  return id;

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
      page: page,
      orderby:'id',
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
  const images = String.split(',');
  let arrayImages = [];

  if (images.length > 0) {
    images.forEach(image => {
      arrayImages.push({ src: image })
    })


  }
  return arrayImages;

}
async function ProcesarDatos(datos, AllCategories, allTags) {
  let newDatos = [];
  for (const dato of datos) {
    dato['dimension'] = {
      'length': dato.length,
      'width': dato.width,
      'height': dato.height,
    }
    dato['categories'] = await ArrayCategories(dato.categories, AllCategories);
    dato['tags'] = await ArrayTags(dato.tags, allTags);
    dato['images'] = await arrayImages(dato.images);
    attributes = dato.Attribute_1_value.split(',')
    dato['attributes'] = [{

      name: dato.Attribute_1_name,
      position: dato.Position,
      visible: true,
      variation: true,
      options: attributes


    }]
    delete dato['new'];
    delete dato['length'];
    delete dato['width'];
    delete dato['height'];
    delete dato['meta_data'];
    delete dato['default_attributes'];
    delete dato['Attribute_1_name'];
    delete dato['Attribute_1_value'];
    delete dato['Position'];
    delete dato['button_text'];

    delete dato['backorders_allowed'];
    delete dato['cross_sell_ids'];
    delete dato['upsell_ids'];
    delete dato['parent_id'];


    newDatos.push(dato);
  }
  return newDatos;

}
async function getAttribute(nombre, allAtributes) {

  allAtributes.filter(elemento => {

    return elemento.name == nombre;
  })



}
async function getAllAtributtes(baseUrl, consumerKey, consumerSecret) {

  const url = `${baseUrl}/wp-json/wc/v3/products/attributes`
  const auth = {
    username: consumerKey,
    password: consumerSecret
  };
  try {
    const response = await axios.get(url, {
      auth: auth
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching products: ${error}`);
    return [];
  }
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

        const allAttributes = await getAllAtributtes(baseUrl, consumerKey, consumerSecret)
        console.log(`Total attributos recuperados:${allAttributes.length}`);
        const nombre = 'Motorola';
     
        contador = 0;
        //console.log(allProducts);
        const datos = await ProcesarDatos(results, allCategories, allTags);


         const producto = await Actualizar(allProducts, datos);
          console.log(producto.update.length)
          console.log(producto.create.length)
  
          const Update = _.chunk(producto.update, 100);
  
          console.log(Update.length);
          const Create = _.chunk(producto.create, 1);
          producto.update.forEach((element,indice) => {

            console.log(indice)
            console.log(element)
            
          });
       
        /*const promises = Update.map((arreglo, indice) =>
          WooCommerce.post("products/batch", { update: arreglo })
            .then(response => {
              console.log(`Entro: ${indice},`);
             // console.log(response.data)
             
              //console.log(response.create.error)
            })
            .catch(response => {
             
             // console.log(response);
              console.log(`Error de actualización: ${indice} ${response},`);
            })
        );

        await Promise.all(promises);*/



        /* Update.forEach((arreglo,indice)=>{
      
        
            WooCommerce.post("products/batch",{update:arreglo})
            .then((response) => { 
              
              console.log(`entro: ${indice},` )
              //console.log(response.data);
              //console.log(response);
            })
            .catch((error) => {
              console.log('')
              console.log(`error de actualizacion: ${indice},` )
              //console.log(error);
            });
  
  
          });
        
  
         /* Create.forEach((creacion,indice)=>{
  
        
            WooCommerce.post("products/batch",{create:creacion})
            .then((response,) => { 
              contador++
              console.log(`creacion: ${indice},` )
              console.log(response.data);
              console.log(response.error);
              //console.log(response);
            })
            .catch((error) => {
              
              console.log(`error de crecion: ${indice},` )
              console.log(error.data);
            });
  
  
          });
        
          
          
          
  
          // console.log(producto.create);
  
  
          //console.log(datos)
          /* datos.forEach(productos=>{
    
            console.log(productos);
      
           })*/

      })();

    


    });


});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
