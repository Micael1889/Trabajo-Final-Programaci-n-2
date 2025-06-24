let divPrincipal = document.getElementById("div-input");
let boton = document.getElementById("botonEnvio");
let contador = 0;

let contenidoIngreso = `
<form action="inicioCorrecto" method="POST" enctype="multipart/form-data">
    <div class="linea_input">
        <img class="icon_input" src="../IMG/agregar-usuario.png" alt="">
        <input class="input-registro" type="text" id="login-nombre" name = "usuario-ingresado" placeholder="Ingrese su nombre o email">
        <span class="error" id="error-login-nombre"></span>
    </div>
    <div class="linea_input">
        <input class="input-registro" type="password" id="login-contrasena" name = "contraseña-ingresada" placeholder="Ingrese la contraseña">
        <span class="error" id="error-login-contrasena"></span>
    </div>
    
                <button type="submit" id="btnEnviar" class="btn-enviar">
  <img class="iconoEnvio" src="../static/img/enviar.png" alt="Enviar">
</button>

</form>
    `;

let contenidoRegistro = `
    <div class="linea_input">
        <img class="icon_input" src="../IMG/agregar-usuario.png" alt="">
        <input class="input-registro" type="text" id="reg-nombre" placeholder="Ingrese el nombre">
        <span class="error" id="error-reg-nombre"></span>
    </div>
    <div class="linea_input">
        <img class="icon_input" src="../IMG/agregar-usuario.png" alt="">
        <input class="input-registro" type="text" id="reg-apellido" placeholder="Ingrese el apellido">
        <span class="error" id="error-reg-apellido"></span>
    </div>
    <div class="linea_input">
        <img class="icon_input" src="../IMG/email.png" alt="">
        <input class="input-registro" type="email" id="reg-email" placeholder="Ingrese el Email">
        <span class="error" id="error-reg-email"></span>
    </div>
    <div class="linea_input">
        <img class="icon_input" src="../IMG/ojo.png" alt="">
        <input class="input-registro" type="password" id="reg-contrasena" placeholder="Ingrese la contraseña">
        <span class="error" id="error-reg-contrasena"></span>
    </div>
    <div class="linea_input">
        <img class="icon_input" src="../IMG/ojo.png" alt="">
        <input class="input-registro" type="password" id="reg-rep-contrasena" placeholder="Repite la contraseña">
        <span class="error" id="error-reg-rep-contrasena"></span>
    </div>`;

function cargarContenido() {
  divPrincipal.innerHTML =
    contador === 0 ? contenidoIngreso : contenidoRegistro;
  boton.textContent =
    contador === 0
      ? "¿Olvidaste la contraseña o necesitas registrarte?"
      : "¿Ya tienes cuenta? Ingresá aquí";

  agregarListenerEnvio();
  agregarValidacionesIndividuales();
}

cargarContenido();
