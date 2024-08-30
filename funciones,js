const fs = require('fs');
const csv = require('csv-parser');

function leerArchivo(path, titulos) {
    return new Promise((resolve, reject) => {
        const objetos = [];
        fs.createReadStream(path)
            .pipe(csv())
            .on('data', (row) => {
                const temporal = Object.values(row);
                if (objetos.length > 0) {
                    const arrayCombinado = Object.fromEntries(titulos.map((titulo, i) => [titulo, temporal[i]]));
                    objetos.push(arrayCombinado);
                }
                titulos = Object.keys(row); // Usar la primera fila como títulos
            })
            .on('end', () => resolve(objetos))
            .on('error', (error) => reject(error));
    });
}


const axios = require('axios');

async function findCategoryId(categories, parentId = 0, woocommerce) {
    let currentParentId = parentId;

    for (const categoryName of categories) {
        let page = 1;
        let allProducts = [];
        let products;

        do {
            try {
                products = await axios.get(`${woocommerce.baseURL}/products/categories`, {
                    params: {
                        parent: currentParentId,
                        per_page: 100,
                        page: page
                    },
                    headers: { 'Authorization': `Bearer ${woocommerce.token}` }
                });
                allProducts = allProducts.concat(products.data);
                page++;
            } catch (error) {
                console.error("Can't get products:", error);
                return null;
            }
        } while (products.data.length > 0);

        const subcategories = allProducts;
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
async function getAll(nombre, wc) {
    let page = 1;
    let allProducts = [];
    let products;

    do {
        try {
            products = await axios.get(`${wc.baseURL}/${nombre}`, {
                params: {
                    per_page: 100,
                    page: page
                },
                headers: { 'Authorization': `Bearer ${wc.token}` }
            });
            allProducts = allProducts.concat(products.data);
            page++;
        } catch (error) {
            console.error("Can't get products:", error);
            return [];
        }
    } while (products.data.length > 0);

    return allProducts;
}

function length(array) {
    return array.length;
}
function searchTags(tags, name) {
    let id = 0;
    for (const tag of tags) {
        if (tag.name === name) {
            id = tag.id;
            break;
        }
    }
    return id;
}
function arrayTags(tags, string) {
    const allTags = [];
    const listTag = string.split(",");
    listTag.forEach(tag => {
        const id = searchTags(tags, tag.trim());
        if (id !== 0) {
            allTags.push({ id: id });
        }
    });
    return allTags;
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
function buscarenstrclass(objetos, r) {
    return objetos.filter(obj => obj.parent === r);
}
function imagenes(string) {
    const images = string.split(",");
    return images.map(img => ({ src: img.trim() }));
}


