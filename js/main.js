(function() {
	const formulario = document.querySelector('#formulario');
	const inputFormulario = document.querySelector('#inputCodigo');
	const spinner = document.querySelector('#spinner');
	const tbody = document.querySelector("#tabla tbody");	
	const btnSubmit = document.querySelector('#btnsubmit');
	const btnExportar = document.querySelector('#btnExport');


	
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
		let selectedOption = document.querySelector('input[name="inlineRadioOptions"]:checked');
		if(selectedOption === null){
			imprimirAlerta('Seleccione el proveedor','error');
			ocultarSpinner();
			return;	
		}
		else if(selectedOption.value === "HP") {
			apiHp();
		} else if (selectedOption.value === "Acer") {
			apiAcer();
		} else if (selectedOption.value === "option3") {
			apiLenovo();
		}
	});

	function eliminarProducto() {
		for (let i = 0; i < deleteButtons.length; i++) {
			deleteButtons[i].addEventListener("click");
		  }
	}

	const apiHp = async (e) => {
		const url = `https://pro-psurf-app.glb.inc.hp.com/partsurferapi/Search/GenericSearch/${codigo}/country/US/usertype/EXT`;
	
		const response = await fetch(url, {
			headers: {
				'Authorization': 'Basic MjAyMzEzNy1wYXJ0c3VyZmVyOlBTVVJGQCNQUk9E',
			},
		});
	
		const data = await response.json();
	
		const datos = data.Body.SNRProductLists?.[0] ?? data.Body.SerialNumberBOM?.wwsnrsinput;
	
		ocultarSpinner();
	
		if (datos?.product_Desc || datos?.product_no) {
			if (existeStorage(codigo || datos?.serial_no)) {
				imprimirAlerta('Producto ya existe', 'error');
				return;
			}
	
			const { product_Desc, product_Id, serial_no, product_no, user_name } = datos;
	
			const plantilla = {
				marca: 'HP',
				serial_no: serial_no || codigo,
				product_no: product_no || product_Id,
				user_name: product_Desc || user_name
			};
	
			agregarProducto(plantilla);
		} else {
			imprimirAlerta('No se encontró el producto', 'error');
			formulario.reset();
		}
	};
			


	const apiAcer = async (e) => {
		const urla = `https://www.acer.com/ee-en/api/support/find/03/${codigo}`;
	
		try {
			const response = await fetch(urla);
			const { url } = await response.json();
			ocultarSpinner();
	
			const dataApi = url.replace("?search=", "").split(";");
			const [serial_no, product_no, user_name] = [
				dataApi[0],
				dataApi[1],
				dataApi[2].replace(/&filter=global_download/g, "")
			];
	
			const plantilla = {
				marca: 'Acer',
				serial_no,
				product_no,
				user_name
			};
	
			if (existeStorage(plantilla.serial_no)) {
				imprimirAlerta('Ya existe un producto con ese código', 'error');
			} else {
				marca = 'Acer';
				agregarProducto(plantilla);
			}
		} catch (err) {
			imprimirAlerta("No se encontró el producto", 'error');
			console.log(err);
			formulario.reset();
		}
	};
	//Bajo pruebas
	 function apiLenovo(e) {

		fetch("https://pcsupport.lenovo.com/us/en/api/v4/mse/getproducts?productId=1S4004H1UMJ65PR8", {
			"referrerPolicy": "no-referrer",
			"body": null,
			"method": "GET",
			"origin": "*",
			"mode": "no-cors",
			"credentials": "include"
				}).then(response => console.log(response.json()))
			




		// const url = `https://pcsupport.lenovo.com/us/en/api/v4/mse/getproducts?productId=${codigo}`;
		// fetch(url, { mode: 'no-cors' })
		//   .then(response => response.json())
		//   .then(data => console.log(data,'wenas'))
		//   .catch(error => console.log(error) + ocultarSpinner());
		  

	};


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


	const existeStorage = id => JSON.parse(localStorage.getItem('productos') || '[]').some(producto => producto.serial_no === id);

   
	const cargarDatos = () => {
		const Lista = JSON.parse(localStorage.getItem('productos') || '[]');
		limpiarHTML(tbody);
		Lista.forEach(data => {
			const {product_no,serial_no,user_name,marca} = data;
			const HTML = `
				<td>${marca}</td>
				<td>${serial_no}</td>
				<td>${product_no}</td>
				<td>${user_name}</td>
				<td><button type="button" id="btndelete" class="btn btn-danger btn-sm">Delete</button></td>
			`;
	
			const tr = document.createElement("tr");
			tr.innerHTML = HTML;
			tbody.appendChild(tr);
	
			const btnDelete = tr.querySelector("#btndelete");
			btnDelete.addEventListener("click", () => eliminarProducto(product_no));
		});
	};
	
  
   function agregarProducto(producto) 
   {	
		let Lista = JSON.parse(localStorage.getItem('productos') || '[]');
		localStorage.setItem('productos', JSON.stringify([...Lista, producto]));
		formulario.reset();
		imprimirAlerta('Articulo Agregado!');
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
