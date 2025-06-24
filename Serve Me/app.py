from flask import Flask, render_template, request, redirect, url_for, jsonify, flash, Response
from werkzeug.utils import secure_filename
from flask_sqlalchemy import SQLAlchemy
import os
import queue

app = Flask(__name__)

# Configuración base de datos
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///serveME_base_de_datos.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Configuración subida archivos
UPLOAD_FOLDER = "static/img"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

app.config['SECRET_KEY'] = 'una_clave_secreta_super_segura_y_aleatoria_para_tu_app_prod'
db = SQLAlchemy(app)

# Cola para notificaciones SSE
cola_notificaciones = queue.Queue()

# MODELOS
class Producto(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False, unique=True)
    precio = db.Column(db.Float, nullable=False)
    src = db.Column(db.String(255), nullable=True)
    descripcion = db.Column(db.Text, nullable=True)
    categoria = db.Column(db.String(50), nullable=True)

    def __init__(self, nombre, precio, src, descripcion, categoria):
        self.nombre = nombre
        self.precio = precio
        self.src = src
        self.descripcion = descripcion
        self.categoria = categoria


class Usuario(db.Model):
    id_usuario = db.Column(db.Integer, primary_key=True)
    nombre_usuario = db.Column(db.String(100), nullable=False, unique=True)
    contra_usuario = db.Column(db.String(50), nullable=True)

    def __init__(self, nombre_usuario_param, contrasena_texto_plano):
        self.nombre_usuario = nombre_usuario_param
        self.contra_usuario = contrasena_texto_plano

    def __repr__(self):
        return f'<Usuario {self.nombre_usuario}>'

class Aviso(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False, unique=True)
    src = db.Column(db.String(255), nullable=True)
    descripcion = db.Column(db.Text, nullable=True)

    def __init__(self, nombre, src, descripcion):
        self.nombre = nombre
        self.src = src
        self.descripcion = descripcion

# RUTAS API Y WEB

@app.route('/api/nombres-productos')
def nombres_productos():
    productos = Producto.query.all()
    nombres = [producto.nombre for producto in productos]
    return jsonify(nombres)

@app.route('/api/productos')
def api_productos():
    productos = Producto.query.all()
    return jsonify([{
        "id": p.id,
        "nombre": p.nombre,
        "precio": p.precio,
        "categoria": p.categoria,
        "descripcion": p.descripcion,
        "src": p.src
    } for p in productos])

@app.route('/')
def home():
    return render_template("index.html")

@app.route('/inicio', methods=["GET"])
def inicio():
    return render_template("ingreso-registro.html")

@app.route('/inicioCorrecto', methods=["POST"])
def inicioCorrecto():
    nombre = request.form.get("usuario-ingresado")
    contra = request.form.get("contraseña-ingresada")

    usuario = Usuario.query.filter_by(nombre_usuario=nombre).first()

    if usuario:
        if usuario.contra_usuario == contra:
            flash('Inicio de sesión exitoso!', 'success')
            return redirect(url_for('formularioCarga'))
        else:
            flash('Contraseña incorrecta. Intenta de nuevo.', 'error')
            return render_template("ingreso-registro.html")
    else:
        flash('Usuario no encontrado. Por favor, verifica tu nombre de usuario.', 'error')
        return render_template("ingreso-registro.html")

@app.route('/form', methods=["GET"])
def formularioCarga():
    return render_template("panel.html")

@app.route('/form/cargaProductos', methods=["POST"])
def cargarProducto():
    nombre = request.form.get("nombre_producto")
    precio = float(request.form.get("precio_estimado"))
    imagen = request.files.get('imagen_referencia')
    descripcion = request.form.get("descripcion_producto")
    categoria = request.form.get("categoria_producto")

    filename = None
    src = None
    if imagen and imagen.filename != "":
        filename = secure_filename(imagen.filename)
        ruta_guardado = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        imagen.save(ruta_guardado)
        src = f"../static/img/{filename}"

    producto_nuevo = Producto(nombre, precio, src, descripcion, categoria)
    db.session.add(producto_nuevo)
    db.session.commit()

    return redirect(url_for('formularioCarga'))

@app.route('/api/modificar-producto/<int:id>', methods=['PUT'])
def modificarProducto(id):
    data = request.get_json()

    producto = Producto.query.get(id)

    if not producto:
        return jsonify({'mensaje': 'Producto no encontrado'}), 404

    producto.nombre = data['nombre']
    producto.precio = data['precio']
    producto.src = data['src']
    producto.descripcion = data['descripcion']
    producto.categoria = data['categoria']

    try:
        db.session.commit()
        return jsonify({'mensaje': 'Producto modificado correctamente'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'mensaje': 'Error al modificar el producto', 'error': str(e)}), 500

@app.route('/form/modificarProducto', methods=['POST'])
def modificarProductoForm():
    id_producto = int(request.form.get("id_producto"))
    producto = Producto.query.get(id_producto)

    if not producto:
        return jsonify({"error": "Producto no encontrado"}), 404

    producto.nombre = request.form.get("nombre")
    producto.precio = float(request.form.get("precio"))
    producto.descripcion = request.form.get("descripcion")
    producto.categoria = request.form.get("categoria")

    if 'imagen' in request.files:
        imagen = request.files['imagen']
        if imagen.filename != "":
            filename = secure_filename(imagen.filename)
            ruta_guardado = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            imagen.save(ruta_guardado)
            producto.src = f"../static/img/{filename}"

    try:
        db.session.commit()
        return redirect(url_for("formularioCarga"))
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/api/eliminar-producto', methods=['POST'])
def eliminar_producto():
    data = request.get_json()
    nombre_producto = data.get('nombre')

    producto = Producto.query.filter_by(nombre=nombre_producto).first()
    if not producto:
        return jsonify({'status': 'Producto no encontrado'}), 404

    try:
        db.session.delete(producto)
        db.session.commit()
        return jsonify({'status': 'Producto eliminado correctamente'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': f'Error al eliminar producto: {str(e)}'}), 500

# AVISOS

@app.route('/form/cargaAviso', methods=['POST'])
def cargar_aviso():
    nombre = request.form.get("nombre_aviso")
    descripcion = request.form.get("descripcion_aviso")
    imagen = request.files.get("imagen_aviso")

    if not nombre:
        return jsonify({"error": "El nombre del aviso es obligatorio."}), 400

    src = None
    if imagen and imagen.filename != "":
        filename = secure_filename(imagen.filename)
        ruta_guardado = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        imagen.save(ruta_guardado)
        src = f"../static/img/{filename}"

    aviso_nuevo = Aviso(nombre, src, descripcion)
    db.session.add(aviso_nuevo)
    db.session.commit()

    return redirect(url_for('formularioCarga'))

@app.route('/api/avisos')
def api_avisos():
    avisos = Aviso.query.all()
    return jsonify([
        {
            "id": a.id,
            "nombre": a.nombre,
            "descripcion": a.descripcion,
            "src": a.src
        } for a in avisos
    ])

@app.route('/api/nombres-avisos')
def nombres_avisos():
    avisos = Aviso.query.all()
    nombres = [aviso.nombre for aviso in avisos]
    return jsonify(nombres)

@app.route('/api/eliminar-aviso', methods=['POST'])
def eliminar_aviso():
    data = request.get_json()
    nombre_aviso = data.get('nombre')

    aviso = Aviso.query.filter_by(nombre=nombre_aviso).first()
    if not aviso:
        return jsonify({'status': 'Aviso no encontrado'}), 404

    try:
        db.session.delete(aviso)
        db.session.commit()
        return jsonify({'status': 'Aviso eliminado correctamente'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': f'Error al eliminar aviso: {str(e)}'}), 500

# LLAMADO AL MOZO Y SSE

@app.route('/llamar-mozo', methods=['POST'])
def llamar_mozo():
    mensaje = '¡Un cliente llamó al mozo!'
    cola_notificaciones.put(mensaje)
    return jsonify({'status': 'ok'}), 200

@app.route('/stream')
def stream():
    def event_stream():
        while True:
            mensaje = cola_notificaciones.get()
            yield f"data: {mensaje}\n\n"
    return Response(event_stream(), mimetype='text/event-stream')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
