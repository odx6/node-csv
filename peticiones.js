const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api"; // Supports ESM
const app = express();
const WooCommerce = new WooCommerceRestApi({
  url: 'https://janadigital.com.mx/', // Your store URL
  consumerKey: '', // Your consumer key
  consumerSecret: '', // Your consumer secret
  version: 'wc/v3' // WooCommerce WP REST API version
});
module.exports=WooCommerce;

app.use(express.json());

let result=null
WooCommerce.get("products",{per_page:100, page:1})
  .then((response) => {
      result=response.data;
    
    
  })
  .catch((error) => {
    console.log(error.response.data);
  });


console.log(result)

  app.listen(3000, () => {
    console.log('Servidor iniciado en http://localhost:3000');
});
