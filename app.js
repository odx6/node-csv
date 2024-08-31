const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
const port = 3000;

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
    });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
