(function() {
	const formulario = document.querySelector('#formulario');
	const inputFormulario = document.querySelector('#inputCodigo');
	const spinner = document.querySelector('#spinner');
	const tbody = document.querySelector("#tabla tbody");	
	const btnSubmit = document.querySelector('#btnsubmit');
	const btnExportar = document.querySelector('#btnExport');


	let Lista = JSON.parse(localStorage.getItem('productos')) ?? [];

	let codigo;

	const mostrarSpinner = ()  => {spinner.classList.remove("d-none")};
	const ocultarSpinner = () => {spinner.classList.add("d-none")};

	document.addEventListener('DOMContentLoaded', () => {
		
		cargarDatos();
	});


	btnSubmit.addEventListener('click',function(){
		if(inputFormulario.value === ''){
			return;
		};
		mostrarSpinner();		
	})
	btnExportar.addEventListener('click',()=>{
		exportarCSV();
	});
	inputFormulario.addEventListener('input', function(e) {
		codigo = e.target.value
	});

	formulario.addEventListener('submit',function (e) {
				
		e.preventDefault();
		var selectedOption = document.querySelector('input[name="inlineRadioOptions"]:checked');
		if(selectedOption === null){
			imprimirAlerta('Seleccione el proveedor','error');
			ocultarSpinner();
			return;	
		}
		else if(selectedOption.value === "option1") {
			apiHp();
		} else if (selectedOption.value === "option2") {
			apiAcer();
		} else if (selectedOption.value === "option3") {
		  console.log('Brain arregla la api');
		}
	});

	function eliminarProducto() {
		for (let i = 0; i < deleteButtons.length; i++) {
			deleteButtons[i].addEventListener("click");
		  }
	}

	async function apiHp(e) {
		const url = `https://pro-psurf-app.glb.inc.hp.com/partsurferapi/Search/GenericSearch/${codigo}/country/US/usertype/EXT`;

		const response = await fetch(url, {
			
		headers: {
			'Authorization': 'Basic MjAyMzEzNy1wYXJ0c3VyZmVyOlBTVVJGQCNQUk9E',
		},
		
		});
		const text = await response.json()
		.then(data=> {
			ocultarSpinner()
			if (existeStorage(data.Body.SerialNumberBOM.wwsnrsinput.serial_no)) {
				imprimirAlerta('Ya existe un producto con ese código','error');
				
			}else{
				agregarProducto(data.Body.SerialNumberBOM.wwsnrsinput);
			};
			
		})
		.catch(error => imprimirAlerta("No se encontro el producto",'error')+ console.log(error));	
			
	};

	async function apiAcer(e) {

		const urla = `https://www.acer.com/ee-en/api/support/find/03/${codigo}`;

		const response = await fetch(urla).then(response => response.json())
				.then(data => {
					const {url} = data;
					dataApi = url.replace("?search=", "").split(";");
					let resultArray = [dataApi[0], dataApi[1], dataApi[2].replace(/&filter=global_download/g, "")];
					const plantilla = 
					{product_no : resultArray[0],
					 serial_no : resultArray[1],
					 user_name : resultArray[2]
					};
					ocultarSpinner();
					if (existeStorage(plantilla.serial_no)) {
						imprimirAlerta('Ya existe un producto con ese código','error');
						
					}else{
						agregarProducto(plantilla);
					};

				}
				).catch(err => {console.log(err)});


	};
	//Bajo pruebas
	async function apiLenovo(e) {
			e.preventDefault();
			
		const url = `https://pcsupport.lenovo.com/us/en/api/v4/mse/getproducts?productId=${codigo}`;
		fetch(url, { mode: 'no-cors' })
		  .then(response => response.json())
		  .then(data => console.log(data))
		  .catch(error => console.log(error));
	}


	function imprimirAlerta(mensaje, tipo) {

		const alerta = document.querySelector('.alerta');
		if (!alerta) {
			const div = document.createElement('div');
			div.classList.add('px-4','py-3','rounded','max-w-lg','mx-auto','mt-6','text-center','alerta');
		   
		   if (tipo === 'error') {
	
			div.classList.add('alert-danger');
		   }
		   else{
			div.classList.add('alert-success');
			div.innerText = mensaje;
		   }
		   div.innerText = mensaje;
		   document.querySelector('#formulario').insertBefore( div , document.querySelector('#btnsubmit'));
		   
			setTimeout(() => {
				div.remove();
	
			}, 3000);
			
		};
	
	};


    function existeStorage(id) {    
        const productos = JSON.parse(localStorage.getItem('productos')) ?? [];
        return productos.some(producto => producto.serial_no === id);
        
    };
   
   function cargarDatos() {
		Lista = JSON.parse(localStorage.getItem('productos'))?? [];
		console.log(Lista);
		limpiarHTML(tbody);
		Lista.forEach(data => {
			const {product_no,serial_no,user_name} = data;					
			const HTML = `
				<td>${serial_no}</td>
				<td>${product_no}</td>
				<td>${user_name}</td>
				<td><button type="button" id="btndelete" class="btn btn-danger">Delete</button></td>
			`;
			
			var tr = document.createElement("tr");

			tr.innerHTML = HTML;
			tbody.appendChild(tr);
			const btnDelete = tr.querySelector("#btndelete");
			btnDelete.addEventListener("click", function(e){
				eliminarProducto(product_no);
			});			
			
		});
	 };
  
   function agregarProducto(producto) 
   {
		localStorage.setItem('productos', JSON.stringify([...Lista, producto]));
		formulario.reset();
		imprimirAlerta('Articulo Agregado!');
		console.log(Lista);
		cargarDatos();

	};

   function limpiarHTML(ref) 
   {
		while (ref.firstChild) {
			ref.removeChild(ref.firstChild);
		};
	};
 
	function eliminarProducto(product_no) {
		const listaProductos = JSON.parse(localStorage.getItem("productos")) || [];
	  
		const indiceProducto = listaProductos.findIndex(p => p.product_no === product_no);
	  
		if (indiceProducto !== -1) {
		  listaProductos.splice(indiceProducto, 1);
		  localStorage.setItem("productos", JSON.stringify(listaProductos));
		  imprimirAlerta("Producto Eliminado!")
		};
		cargarDatos();
	};

	function exportarCSV() {
		imprimirAlerta('Archivo generado')
		const listaProductos = JSON.parse(localStorage.getItem('productos')) ?? [];
		const csv = listaProductos.map(p => Object.values(p).join(",")).join("\n");
		const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.setAttribute("href", url);
		link.setAttribute("download", "productos.csv");
		link.style.display = "none";
		document.body.appendChild(link);
		link.click();
		URL.revokeObjectURL(url);
	};


})(jQuery);
