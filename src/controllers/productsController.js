const fs = require('fs');
const path = require('path');

const productsFilePath = path.join(__dirname, '../data/productsDataBase.json');
const products = JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));
const writeJson = (dataBase) => fs.writeFileSync(productsFilePath, JSON.stringify(dataBase), 'utf-8') /* modulo para escribir el json cuando agrega porductos */


const toThousand = n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const controller = {
	// Root - Show all products
	index: (req, res) => {
		res.render('products', {
			products,
			toThousand
		})
	},

	// Detail - Detail from one product
	detail: (req, res) => {
		let productId = +req.params.id;/*  1° capturo el id con req.params.id CREO UNA VARIABLE Y LE PASO req.params.id(ASI CAPTURO EL ID)*/
		let product = products.find(product => product.id === productId) /*3° PARA CAPTURAR EL PRODUCTO: creo una variable product, y le digo de la base de datos product le paso el metodo find para que encuentre el producto cuya propiedad id sea === a productId */

		res.render('detail', {     /* 2° hago res. render y vista detail         */
			product, /* le paso el producto */
			toThousand /* le paso la funcion  toThousand */
		})
	},

	
	// Create - Form to create MIN 21 A 38
	create: (req, res) => {
		res.render('product-create-form') /* aca renderiza campos del formulario */
	},
	
	// Create -  Method to store
	store: (req, res) => { /* aca recibe y toma los datos que se cargan al formulario */
		const {name, price, discount, category, description} = req.body  /* en body viajan los datos del formulario, aca hacemos destructuring de cada una de sus propiedades */
		//res.send(req.file)
		let lastId = 1; /* crear variable definiendo un numero de id */

		products.forEach(product => {  /* nos traemos la variable products que es la variable que contiene el json de productos */
			if(product.id > lastId){   /* le aplicamos un foreach, cada uno de los elementos es un producto, si el producto que estoy iterando product.id es > lastid, */
				lastId = product.id    /* entonces lastid ahora tiene asignado product.id, y asi siempre tenemos el ultimo id cada vez que recorre el array*/
			} 
			
		})

		let newProduct = { /* ahora creamos una nueva variable a la que le asignamos un objeto y listamos las propiedades */
			id: lastId + 1,  /* el id...es lastid +1 ver el foreach */
			name:name,       /* todas las propiedades del json y que se cargan por formulario eso vamos listando*/
			price:+price, 
			discount:+discount,
			category:category,
			description:description,
			image: req.file ? req.file.filename : "default-image.png"  /* asignamos una imagen vacia por defecto */
		} 

		products.push(newProduct) /* ahora pushear el nuevo producto al json de productos */

		writeJson(products)  /* escribir el json, osea agregar el producto nuevo al json que ya tenemos, USAMOS EL MODULO VER ARRIBA */
		
		res.redirect('/products') /* ahora redireccionamos a la vista de productos */
		
	},
/* -----------------------------EDITAR Y ACTUALIZAR---------------------------------------------------------------------------- */
	// Update - Form to edit
	edit: (req, res) => {
		let productId = +req.params.id;
		let productToEdit = products.find(product => product.id === productId);

		res.render('product-edit-form', {
			product: productToEdit
		})

	}, 
	// Update - Method to update
	update: (req, res) => {
		let productId = +req.params.id; 

	 	const {name, price, discount, category, description} = req.body  /* en body viajan los datos del formulario, aca hacemos destructuring de cada una de sus propiedades */

		products.forEach(product => {
			if(product.id === productId){
				product.id = product.id
				product.name = name,
				product.price = price,
				product.discount = discount,
				product.description = description
				if(req.file){ /* MULTER:::::si existe el archivo, borramelo */
					if(fs.existsSync("./public/images/products/", product.image)) {
						fs.unlinkSync(`./public/images/products/${product.image}`)
	
					}else{
						console.log('no encontre el archivo')
					}
					product.image = req.file.filename
				}else{ /* caso contrario dejame el que estaba */
					product.image = product.image
				}
				/* product.image = ifreq.file ? req.file.filename : product.image */ /* sube archivo? agregarlo- no sube? dejar el que estaba */

			}
		})
	 	writeJson(products) 
		res.redirect(`/products/detail/${productId}`) 
	},
/* --------------------------------------------------------------------------------------------------------- */
	// Delete - Delete one product from DB
	destroy : (req, res) => {
		let productId = +req.params.id;

		products.forEach(product => {
			if(product.id === productId){ // 1:20:00 eliminar imagenes subidas con multer
				if(fs.existsSync("./public/images/products/", product.image)) { /* MULTER::::: */
					fs.unlinkSync(`./public/images/products/${product.image}`)  /* MULTER::::: */

				}else{  /* MULTER::::: */
					console.log('no encontre el archivo')  /* MULTER::::: */
				}

				let productToDestroyIndex = products.indexOf(product) /* si lo encuentra devuelve el indice */
				if(productToDestroyIndex !== -1) {
				     products.splice(productToDestroyIndex, 1) // primer parametro es el indice del elemento a borrar, el segundo la cantidad
				}else{
					console.log('No encontré el producto') 
				}
				/* ----- */
				/*let productToDestroyIndex = products.indexOf(product) /* si lo encuentra devuelve el indice */
				/*productToDestroyIndex !== -1?
				products.splice(productToDestroyIndex, 1) : // primer parametro es el indice del elemento a borrar, el segundo la cantidad
				console.log('No encontré el producto') */

			}
		})

		writeJson(products)
		res.redirect('/products')
	}
};

module.exports = controller;