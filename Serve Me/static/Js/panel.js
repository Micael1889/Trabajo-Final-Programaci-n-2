const navBar = document.querySelector(".navBar");
const despBoton = document.querySelector("#despBoton");
const buscar = document.querySelector(".bx-search");
const ordenes = document.querySelector(".bx-takeaway");
const contenidoPanel = document.getElementById("contenidoPanel");
const botonProductos = document.getElementById("crudProductos");
const botonAvisos = document.getElementById("btnAvisos");
const botonEliminarAvisos = document.getElementById("btnEliminarAvisos");
const botonLlamado = document.querySelector(".llamado");

// --- TOGGLE NAVBAR ---
if (despBoton && navBar) {
  despBoton.addEventListener("click", () => {
    navBar.classList.toggle("open");
    iconoCambio();
  });
}

if (buscar && navBar) {
  buscar.addEventListener("click", () => {
    navBar.classList.toggle("open");
    iconoCambio();
  });
}

function iconoCambio() {
  if (navBar && despBoton) {
    if (navBar.classList.contains("open")) {
      despBoton.classList.replace("bx-menu", "bx-arrow-big-left-line");
    } else {
      despBoton.classList.replace("bx-arrow-big-left-line", "bx-menu");
    }
  }
}

// --- CREAR ELEMENTO ---
function crearElemento(
  elemento,
  textoContenido = "",
  tipoEstilo = "",
  contenidoEstilo = "",
  clase = "",
  id = ""
) {
  let etiqueta = document.createElement(elemento);
  if (clase) etiqueta.className = clase;
  if (tipoEstilo && contenidoEstilo)
    etiqueta.style[tipoEstilo] = contenidoEstilo;
  if (textoContenido) etiqueta.textContent = textoContenido;
  if (id) etiqueta.id = id;
  return etiqueta;
}

// --- CARGAR PRODUCTOS ---
function cargarProductos() {
  if (!contenidoPanel) return;
  contenidoPanel.innerHTML = "";

  let titulazo = crearElemento("h1", "CARGAR PRODUCTO", "", "", "titulazo");
  let divForm = crearElemento("form", "", "", "", "divForm");
  divForm.action = "form/cargaProductos";
  divForm.method = "POST";
  divForm.enctype = "multipart/form-data";

  let nombreProd = crearElemento("input", "", "", "", "input-productos");
  nombreProd.type = "text";
  nombreProd.name = "nombre_producto";
  nombreProd.placeholder = "Ingrese un nombre";

  let imgProd = crearElemento("input", "", "", "", "input-productos");
  imgProd.type = "file";
  imgProd.name = "imagen_referencia";

  let descProd = crearElemento("textarea", "", "", "", "input-productos");
  descProd.name = "descripcion_producto";
  descProd.placeholder = "Ingrese la descripción";

  let catProd = crearElemento("input", "", "", "", "input-productos");
  catProd.type = "text";
  catProd.name = "categoria_producto";
  catProd.placeholder = "Ingrese la categoría";

  let precioProd = crearElemento("input", "", "", "", "input-productos");
  precioProd.type = "number";
  precioProd.name = "precio_estimado";
  precioProd.placeholder = "Ingrese el precio";

  let enviar = crearElemento("input", "", "", "", "enviarInputPanel");
  enviar.type = "submit";
  enviar.value = "Enviar Solicitud de Producto";

  divForm.append(
    titulazo,
    nombreProd,
    imgProd,
    descProd,
    catProd,
    precioProd,
    enviar
  );
  contenidoPanel.appendChild(divForm);

  // --- MODIFICAR PRODUCTO ---
  let titulazoModificar = crearElemento(
    "h1",
    "MODIFICAR PRODUCTO",
    "",
    "",
    "titulazo"
  );
  let formModificar = crearElemento("form", "", "", "", "divForm");
  formModificar.action = "/form/modificarProducto";
  formModificar.method = "POST";
  formModificar.enctype = "multipart/form-data";

  let selectorModificar = crearElemento(
    "select",
    "",
    "",
    "",
    "select-productos"
  );
  selectorModificar.name = "id_producto";

  let nombreMod = crearElemento("input", "", "", "", "input-productos");
  nombreMod.name = "nombre";
  nombreMod.placeholder = "Nuevo nombre";

  let precioMod = crearElemento("input", "", "", "", "input-productos");
  precioMod.name = "precio";
  precioMod.type = "number";
  precioMod.placeholder = "Nuevo precio";

  let categoriaMod = crearElemento("input", "", "", "", "input-productos");
  categoriaMod.name = "categoria";
  categoriaMod.placeholder = "Nueva categoría";

  let descripcionMod = crearElemento("textarea", "", "", "", "input-productos");
  descripcionMod.name = "descripcion";
  descripcionMod.placeholder = "Nueva descripción";

  let imagenMod = crearElemento("input", "", "", "", "input-productos");
  imagenMod.name = "imagen";
  imagenMod.type = "file";

  let enviarMod = crearElemento("input", "", "", "", "enviarInputPanel");
  enviarMod.type = "submit";
  enviarMod.value = "Guardar Cambios";

  fetch("/api/productos")
    .then((res) => res.json())
    .then((productos) => {
      productos.forEach((p) => {
        let opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = p.nombre;
        selectorModificar.appendChild(opt);
      });

      if (productos.length > 0) rellenarFormulario(productos[0]);

      selectorModificar.addEventListener("change", () => {
        const producto = productos.find((p) => p.id == selectorModificar.value);
        rellenarFormulario(producto);
      });

      function rellenarFormulario(producto) {
        selectorModificar.value = producto.id;
        nombreMod.value = producto.nombre;
        precioMod.value = producto.precio;
        categoriaMod.value = producto.categoria || "";
        descripcionMod.value = producto.descripcion || "";
      }
    });

  formModificar.append(
    titulazoModificar,
    selectorModificar,
    nombreMod,
    precioMod,
    categoriaMod,
    descripcionMod,
    imagenMod,
    enviarMod
  );
  contenidoPanel.appendChild(formModificar);

  // --- ELIMINAR PRODUCTO ---
  let titulazoEliminar = crearElemento(
    "h1",
    "ELIMINAR PRODUCTO",
    "",
    "",
    "titulazo"
  );
  let formEliminar = crearElemento("div", "", "", "", "divForm");

  let seleccionar = crearElemento("select", "", "", "", "select-productos");
  seleccionar.name = "nombre_producto";

  let borrar = crearElemento("button", "Eliminar", "", "", "enviarInputPanel");

  borrar.addEventListener("click", (e) => {
    e.preventDefault();
    const nombre = seleccionar.value;

    fetch("/api/eliminar-producto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre }),
    })
      .then((res) => res.json())
      .then((data) => {
        Swal.fire("Éxito", data.status, "success");
        seleccionar.remove(seleccionar.selectedIndex);
      })
      .catch(() => {
        Swal.fire("Error", "No se pudo eliminar el producto", "error");
      });
  });

  fetch("/api/nombres-productos")
    .then((res) => res.json())
    .then((nombres) => {
      nombres.forEach((nombre) => {
        let option = document.createElement("option");
        option.value = nombre;
        option.textContent = nombre;
        seleccionar.appendChild(option);
      });
    });

  formEliminar.append(titulazoEliminar, seleccionar, borrar);
  contenidoPanel.appendChild(formEliminar);
}

// --- CARGAR FORMULARIOS DE AVISOS (AGREGAR + ELIMINAR) ---
function cargarFormularioAvisos() {
  if (!contenidoPanel) return;
  contenidoPanel.innerHTML = "";

  // FORMULARIO PARA AGREGAR AVISO
  let titulazo = crearElemento("h1", "CARGAR AVISO", "", "", "titulazo");
  let formAviso = crearElemento("form", "", "", "", "divForm");
  formAviso.action = "form/cargaAviso";
  formAviso.method = "POST";
  formAviso.enctype = "multipart/form-data";

  let inputTitulo = crearElemento("input", "", "", "", "input-productos");
  inputTitulo.type = "text";
  inputTitulo.name = "nombre_aviso";
  inputTitulo.placeholder = "Ingrese el título del aviso";

  let inputDescripcion = crearElemento(
    "textarea",
    "",
    "",
    "",
    "input-productos"
  );
  inputDescripcion.name = "descripcion_aviso";
  inputDescripcion.placeholder = "Ingrese la descripción";

  let inputImagen = crearElemento("input", "", "", "", "input-productos");
  inputImagen.type = "file";
  inputImagen.name = "imagen_aviso";

  let btnEnviar = crearElemento("input", "", "", "", "enviarInputPanel");
  btnEnviar.type = "submit";
  btnEnviar.value = "Publicar Aviso";

  formAviso.append(
    titulazo,
    inputTitulo,
    inputDescripcion,
    inputImagen,
    btnEnviar
  );
  contenidoPanel.appendChild(formAviso);

  // FORMULARIO PARA ELIMINAR AVISO
  let titulazoEliminar = crearElemento(
    "h1",
    "ELIMINAR AVISO",
    "",
    "",
    "titulazo"
  );
  let formEliminar = crearElemento("div", "", "", "", "divForm");

  let seleccionar = crearElemento("select", "", "", "", "select-productos");
  seleccionar.name = "nombre_aviso";

  let borrar = crearElemento(
    "button",
    "Eliminar Aviso",
    "",
    "",
    "enviarInputPanel"
  );

  borrar.addEventListener("click", (e) => {
    e.preventDefault();
    const nombre = seleccionar.value;

    fetch("/api/eliminar-aviso", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre }),
    })
      .then((res) => res.json())
      .then((data) => {
        Swal.fire("Éxito", data.status, "success");
        const index = seleccionar.selectedIndex;
        seleccionar.remove(index);
      })
      .catch(() => {
        Swal.fire("Error", "No se pudo eliminar el aviso", "error");
      });
  });

  fetch("/api/nombres-avisos")
    .then((res) => res.json())
    .then((nombres) => {
      nombres.forEach((nombre) => {
        let option = document.createElement("option");
        option.value = nombre;
        option.textContent = nombre;
        seleccionar.appendChild(option);
      });
    });

  formEliminar.append(titulazoEliminar, seleccionar, borrar);
  contenidoPanel.appendChild(formEliminar);
}

if (botonProductos) {
  botonProductos.addEventListener("click", cargarProductos);
}

if (botonAvisos) {
  botonAvisos.addEventListener("click", cargarFormularioAvisos);
}

if (botonEliminarAvisos) {
  botonEliminarAvisos.addEventListener("click", cargarFormularioEliminarAviso);
}

// --- LLAMADO AL MOZO ---
if (botonLlamado) {
  botonLlamado.addEventListener("click", () => {
    fetch("/llamar-mozo", { method: "POST" }).then(() => {
      Swal.fire({
        icon: "success",
        title: "Has llamado al mozo",
        toast: true,
        timer: 2000,
        position: "top-end",
        showConfirmButton: false,
      });
    });
  });
}

// --- SSE NOTIFICACIONES ---
const evtSource = new EventSource("/stream");

evtSource.onmessage = function (event) {
  Swal.fire({
    icon: "info",
    title: "Llamado al mozo",
    text: event.data,
    confirmButtonColor: "#5c5353",
  });
};

evtSource.onerror = function (err) {
  console.error("Error en la conexión SSE:", err);
};
