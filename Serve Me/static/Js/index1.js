/* Funciones principales */
function crearElemento(
  elemento,
  textoContenido = "",
  tipoEstilo = "",
  contenidoEstilo = "",
  clase = "",
  id = ""
) {
  let etiqueta = document.createElement(elemento);
  if (clase != "") {
    etiqueta.className = clase;
  }
  if (tipoEstilo != "" && contenidoEstilo !== "") {
    etiqueta.style[tipoEstilo] = contenidoEstilo;
  }
  if (textoContenido != "") {
    etiqueta.textContent = textoContenido;
  }
  if (id != "") {
    etiqueta.id = id;
  }

  return etiqueta;
}
/* FIN Funciones principales */
/* Avisos */
const aviso = [];
const contenedorAviso = document.querySelector(".contenedor-avisos");

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cargarAvisos() {
  fetch("/api/avisos")
    .then((response) => response.json())
    .then((datosAvisos) => {
      // Llenar el array aviso con los datos recibidos
      datosAvisos.forEach((a) => {
        aviso.push({
          titulo: a.titulo || a.nombre || "", // dependiendo del nombre del campo en el JSON
          descripcion: a.descripcion || "",
          srcIMG: a.imagen || a.src || "", // el campo que tengas para la imagen
        });
      });
      addAvisosWithDelay();
    })
    .catch((error) => {
      console.error("Error al obtener avisos:", error);
    });
}

async function addAvisosWithDelay() {
  if (aviso.length === 0) {
    return;
  }
  var x = 0;

  while (true) {
    const currentAviso = aviso[x];

    let divDesc = crearElemento(
      "div",
      "",
      "",
      "",
      "descripcion-aviso desc-entrando"
    );
    divDesc.appendChild(crearElemento("h1", currentAviso.titulo, "", ""));
    divDesc.appendChild(crearElemento("p", currentAviso.descripcion, "", ""));

    let imgElem = crearElemento("img", "", "", "", "img-aviso img-entrando");
    imgElem.setAttribute("src", currentAviso.srcIMG);
    imgElem.width = "150";
    imgElem.height = "150";

    contenedorAviso.appendChild(divDesc);
    contenedorAviso.appendChild(imgElem);

    await delay(1000);

    divDesc.classList.remove("desc-entrando");
    imgElem.classList.remove("img-entrando");

    await delay(2000);

    divDesc.classList.add("desc-saliendo");
    imgElem.classList.add("img-saliendo");

    await delay(1000);

    contenedorAviso.innerHTML = "";

    if (x === aviso.length - 1) {
      x = 0;
    } else {
      x++;
    }
  }
}

// Llamar la función para obtener avisos y empezar el ciclo
cargarAvisos();
/* Fin avisos */
/* Productos */

let menu = [];

fetch("/api/productos")
  .then((response) => response.json())
  .then((productos) => {
    menu = productos;
    inicializarMenu();
  })
  .catch((error) => {
    console.error("Error al obtener productos:", error);
  });

function inicializarMenu() {
  const cat = [];
  const lista = document.querySelector(".list-prod");
  const categorias = document.querySelector(".contenedor-categorias");

  for (let x = 0; x < menu.length; x++) {
    if (!cat.includes(menu[x].categoria)) {
      cat.push(menu[x].categoria);
    }
  }

  for (let x = 0; x < cat.length; x++) {
    const contenedorSeccionCat = crearElemento(
      "div",
      "",
      "",
      "",
      "lista-categoria-items"
    );
    const tituloCat = crearElemento("h1", cat[x], "", "", "titulo");
    contenedorSeccionCat.appendChild(tituloCat);

    for (let y = 0; y < menu.length; y++) {
      if (cat[x] === menu[y].categoria) {
        let divProd = crearProductoItem(menu[y]);
        contenedorSeccionCat.appendChild(divProd);
      }
    }
    lista.appendChild(contenedorSeccionCat);

    let catProd = crearElemento("div", "", "", "", "categoria carousel__slide");
    catProd.appendChild(
      crearElemento("h4", cat[x], "", "", "titulo-cat", cat[x])
    );
    categorias.appendChild(catProd);
  }
}

function crearProductoItem(producto) {
  const divProd = crearElemento("div", "", "", "", "item");
  const divProd2 = crearElemento("div", "", "", "", "info-imp");

  const precio = crearElemento("p", "", "", "", "precio");
  precio.innerHTML = `$<span class="precio-item">${producto.precio}</span>`;

  const img = crearElemento("img");
  img.setAttribute("src", producto.src);
  img.setAttribute("alt", producto.nombre);

  divProd.appendChild(divProd2);
  divProd2.appendChild(crearElemento("h3", producto.nombre));
  divProd2.appendChild(
    crearElemento("p", producto.descripcion, "", "", "desc")
  );
  divProd2.appendChild(precio);
  divProd.appendChild(img);

  return divProd;
}

//inicio carrito n1ck

//mostrar carrito
function mostrarCarrito() {
  const contenedor = document.getElementById("contenedor-productos-carrito");
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  contenedor.innerHTML = "";

  let subtotal = 0;

  carrito.forEach((producto) => {
    const div = document.createElement("div");
    div.classList.add("producto");

    subtotal += producto.precio * producto.cantidad;

    div.innerHTML = `
      <img class="img-carrito" src="${producto.src}" alt="${producto.nombre}">
      <div class="detalle-producto">
        <p class="desc-carrito"><strong>${producto.nombre}</strong></p>
        <p class="desc-carrito">$${producto.precio}</p>
      </div>
      <div class="controles">
        <button onclick="cambiarCantidad('${producto.nombre}', -1)">-</button>
        <span>${producto.cantidad}</span>
        <button onclick="cambiarCantidad('${producto.nombre}', 1)">+</button>
      </div>
    `;

    contenedor.appendChild(div);
  });

  document.querySelector(".subtotal").textContent = `Subtotal: $${subtotal}`;
}
//cambiar cantidad
function cambiarCantidad(nombre, cambio) {
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const producto = carrito.find((p) => p.nombre === nombre);
  if (!producto) return;

  producto.cantidad += cambio;

  if (producto.cantidad <= 0) {
    carrito = carrito.filter((p) => p.nombre !== nombre);
  }

  localStorage.setItem("carrito", JSON.stringify(carrito));
  mostrarCarrito();
  actualizarContador();
  const nuevoTotal = carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  const nuevaCantidad = carrito.reduce((acc, p) => acc + p.cantidad, 0);
  total = nuevoTotal;
  totalProd = nuevaCantidad;
  montoTotal.innerHTML = `$${total}`;
  cantProd.textContent = totalProd;
}
//agregar al carrito
function agregarAlCarrito(producto) {
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  const existente = carrito.find((p) => p.nombre === producto.nombre);
  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }

  localStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarContador();
}
//contador visual
function actualizarContador() {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const total = carrito.reduce((acc, p) => acc + p.cantidad, 0);
  document.getElementById("cant").textContent = total;
}
//toggle carrito
function toggleCarrito() {
  const carritoSection = document.getElementById("carrito-desplegable");
  if (carritoSection.style.display === "none") {
    carritoSection.style.display = "block";
    mostrarCarrito();
  } else {
    carritoSection.style.display = "none";
  }
}
//cargar pagina
document.addEventListener("DOMContentLoaded", () => {
  mostrarProductosAgrupados();
  mostrarCarrito();
  actualizarContador();
});

function mostrarProductosAgrupados() {
  const contenedor = document.querySelector(".list-prod");
  contenedor.innerHTML = "";

  const categoriasUnicas = [...new Set(menu.map((p) => p.categoria))];

  categoriasUnicas.forEach((cat) => {
    const contenedorSeccion = crearElemento(
      "div",
      "",
      "",
      "",
      "lista-categoria-items"
    );
    const tituloCat = crearElemento("h1", cat, "", "", "titulo");
    contenedorSeccion.appendChild(tituloCat);

    menu
      .filter((p) => p.categoria === cat)
      .forEach((producto) => {
        const divProducto = crearProductoItem(producto);
        contenedorSeccion.appendChild(divProducto);
      });

    contenedor.appendChild(contenedorSeccion);
  });
}
//funcion confirmar pedido

function confirmarPedido(metodo) {
  localStorage.removeItem("carrito");
  mostrarCarrito();
  actualizarContador();
  toggleCarrito();

  let mensaje = "";

  if (metodo === "mercado") {
    mensaje = "Paga con MercadoPago";
  } else if (metodo === "efectivo") {
    mensaje = "El mozo pasará a cobrar en efectivo";
  }
  total = 0;
  totalProd = 0;
  montoTotal.innerHTML = `$${total}`;
  cantProd.textContent = totalProd;
  Swal.fire({
    icon: "success",
    title: "¡Pedido confirmado!",
    text: mensaje,
    confirmButtonColor: "#3085d6",
  });
}

function crearProductoItem(producto) {
  const divProd = crearElemento("div", "", "", "", "item");
  const divProd2 = crearElemento("div", "", "", "", "info-imp");

  const h3DivProd2 = crearElemento("h3", producto.nombre);
  const pDivProd2 = crearElemento("p", producto.descripcion, "", "", "desc");
  const precioDivProd2 = crearElemento("p", "", "", "", "precio");
  precioDivProd2.innerHTML = `$<span class="precio-item">${producto.precio}</span>`;

  const imgDivProd = crearElemento("img");
  imgDivProd.setAttribute("src", producto.src);
  imgDivProd.setAttribute("alt", producto.nombre);

  const btnAgregar = crearElemento("button", "Agregar", "", "", "btn-agregar");
  btnAgregar.addEventListener("click", () => {
    const prodOriginal = menu.find((p) => p.nombre === producto.nombre);
    if (prodOriginal) {
      agregarAlCarrito(prodOriginal); // Agrega el producto real
      Swal.fire({
        position: "center",
        icon: "success",
        title: `${producto.nombre} agregado al carrito`,
        showConfirmButton: false,
        timer: 800,
      });
    }
  });

  divProd2.appendChild(h3DivProd2);
  divProd2.appendChild(pDivProd2);
  divProd2.appendChild(precioDivProd2);
  divProd.appendChild(divProd2);
  divProd.appendChild(imgDivProd);
  divProd.appendChild(btnAgregar);

  return divProd;
}
function mostrarProductos() {
  const contenedor = document.querySelector(".list-prod");
  contenedor.innerHTML = "";

  menu.forEach((producto) => {
    const divProducto = crearProductoItem(producto);
    contenedor.appendChild(divProducto);
  });
}
function crearProductoItem(producto) {
  const divProd = crearElemento("div", "", "", "", "item");
  const divProd2 = crearElemento("div", "", "", "", "info-imp");

  const h3DivProd2 = crearElemento("h3", producto.nombre);
  const pDivProd2 = crearElemento("p", producto.descripcion, "", "", "desc");
  const precioDivProd2 = crearElemento("p", "", "", "", "precio");
  precioDivProd2.innerHTML = `$<span class="precio-item">${producto.precio}</span>`;

  const imgDivProd = crearElemento("img");
  imgDivProd.setAttribute("src", producto.src);
  imgDivProd.setAttribute("alt", producto.nombre);

  //a l hacer clic en todo el div, se agrega al carrito
  divProd.addEventListener("click", () => {
    agregarAlCarrito(producto);
    Swal.fire({
      position: "center",
      icon: "success",
      title: `${producto.nombre} agregado al carrito`,
      showConfirmButton: false,
      timer: 800,
    });
  });

  divProd2.appendChild(h3DivProd2);
  divProd2.appendChild(pDivProd2);
  divProd2.appendChild(precioDivProd2);
  divProd.appendChild(divProd2);
  divProd.appendChild(imgDivProd);

  return divProd;
}

//fin carrito n1ck

/* Fin Productos */

const cat = [];
const lista = document.querySelector(".list-prod");
const categorias = document.querySelector(".contenedor-categorias");

/* Crear array de las categorias sin repetirlas */
for (let x = 0; x < menu.length; x++) {
  if (!cat.includes(menu[x].categoria)) {
    cat.push(menu[x].categoria);
  }
}
/* FIN Crear array de las categorias sin repetirlas */

/* CREACION DE TITULOS CAT Y PRODUCTOS */
for (let x = 0; x < cat.length; x++) {
  const contenedorSeccionCat = crearElemento(
    "div",
    "",
    "",
    "",
    "lista-categoria-items"
  );
  tituloCat = crearElemento("h1", cat[x], "", "", "titulo");
  contenedorSeccionCat.appendChild(tituloCat);
  for (let y = 0; y < menu.length; y++) {
    if (cat[x] == menu[y].categoria) {
      let divProd = crearElemento("div", "", "", "", "item");
      let divProd2 = crearElemento("div", "", "", "", "info-imp");
      let h3DivProd2 = crearElemento("h3", menu[y].nombre);
      let pDivProd2 = crearElemento("p", menu[y].descripcion, "", "", "desc");
      let precioDivProd2 = crearElemento("p", "", "", "", "precio");
      precioDivProd2.innerHTML = `$<span class = "precio-item ">${menu[y].precio}</span>`;
      let imgDivProd = crearElemento("img");
      imgDivProd.setAttribute("src", menu[y].src);
      divProd2.appendChild(h3DivProd2);
      divProd2.appendChild(pDivProd2);
      divProd2.appendChild(precioDivProd2);
      divProd.appendChild(divProd2);
      divProd.appendChild(imgDivProd);
      contenedorSeccionCat.appendChild(divProd);
    }
  }
  lista.appendChild(contenedorSeccionCat);
}

/* CREACION DE CATEGORIAS */
for (let x = 0; x < cat.length; x++) {
  let catProd = crearElemento("div", "", "", "", "categoria carousel__slide");
  let h4catProd = crearElemento("h4", cat[x], "", "", "titulo-cat", cat[x]);
  catProd.appendChild(h4catProd);
  categorias.appendChild(catProd);
}
/* FIN CREACION DE CATEGORIAS */
/* FILTRO POR CATEGORIA */
const categoriaElegida = document.getElementsByClassName("titulo-cat");
async function ElegirCategoria(event) {
  if (event.target.id !== "") {
    lista.classList.remove("list-entrando");
    lista.classList.add("list-saliendo");
    await delay(1000);
    lista.classList.remove("list-saliendo");
    lista.classList.add("list-entrando");

    while (lista.hasChildNodes()) {
      lista.removeChild(lista.firstChild);
    }

    const tituloCat = crearElemento("h1", event.target.id, "", "", "titulo");
    lista.appendChild(tituloCat);

    for (let y = 0; y < menu.length; y++) {
      if (event.target.id == menu[y].categoria) {
        const divProd = crearProductoItem(menu[y]); // 👈 ESTO AGREGA EL EVENTO
        lista.appendChild(divProd);
      }
    }
  }
}
categorias.addEventListener("click", ElegirCategoria);

/* FIN FILTRO POR CATEGORIA */

/* -------------------------------- FIN ALERTA MOZO ------------------------------------- */
/* -------------------------------- ALERTA item agregado ------------------------------------- */
const montoTotal = document.getElementById("montoTotal");
var total = 0;
montoTotal.innerHTML = `$${total}`;
var cantProd = document.getElementById("cant");
var totalProd = 0;
cantProd.textContent = totalProd;

function suma_Prod(event) {
  let producto = event.target.closest(".item");
  let nombre = producto.querySelector("h3").textContent;
  let precio = producto.querySelector(".precio span").textContent;
  precio = parseFloat(precio);
  total += precio;
  montoTotal.innerHTML = "";
  montoTotal.innerHTML = `$${total}`;
  totalProd += 1;
  cantProd.textContent = totalProd;
  Swal.fire({
    position: "center",
    icon: "success",
    title: `${nombre} agregado al carrito `,
    showConfirmButton: false,
    timer: 800,
  });
}
lista.addEventListener("click", suma_Prod);

/* -------------------------------- Fin ALERTA item agregado ------------------------------------- */
const botonLlamado = document.querySelector(".llamado");
if (botonLlamado) {
  botonLlamado.addEventListener("click", () => {
    fetch("/llamar-mozo", { method: "POST" })
      .then(() => {
        Swal.fire({
          icon: "success",
          title: "Avisamos al mozo",
          text: "En breve pasará por tu mesa.",
          confirmButtonColor: "#5c5353",
        });
      })
      .catch((error) => {
        console.error("Error al llamar al mozo:", error);
        Swal.fire({
          icon: "error",
          title: "Error al llamar al mozo",
          text: "Por favor, intenta nuevamente.",
        });
      });
  });
}
