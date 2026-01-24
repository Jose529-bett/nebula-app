// CONFIGURACIÓN DE TU NUBE EN FIREBASE
const firebaseURL = "https://nebula-plus-default-rtdb.firebaseio.com/";

let users = [];
let movies = [];
let currentBrand = 'disney';
let currentType = 'pelicula';

// --- 1. CARGA INICIAL Y AUTO-LOGIN ---
async function cargarDatos() {
    try {
        // Traer Usuarios de la nube
        const resU = await fetch(`${firebaseURL}users.json`);
        const dataU = await resU.json();
        users = dataU ? Object.keys(dataU).map(id => ({ id, ...dataU[id] })) : [{u:'admin', p:'1234', d:'2026-12-31'}];

        // Traer Películas de la nube
        const resM = await fetch(`${firebaseURL}movies.json`);
        const dataM = await resM.json();
        movies = dataM ? Object.keys(dataM).map(id => ({ id, ...dataM[id] })) : [];

        // --- LÓGICA DE PERSISTENCIA (MANTENER SESIÓN) ---
        const usuarioGuardado = localStorage.getItem('usuario_actual');
        if (usuarioGuardado) {
            const existe = users.find(x => x.u === usuarioGuardado);
            // Si el usuario existe en la nube o es el admin, entra directo
            if (existe || usuarioGuardado === "admin") {
                document.getElementById('u-name').innerText = "Perfil: " + usuarioGuardado;
                switchScreen('sc-main'); 
            } else {
                // Si lo borraste de la nube, le quitamos el acceso automático
                localStorage.removeItem('usuario_actual');
            }
        }

        actualizarVista();
        
        // Refrescar tablas si el admin está dentro
        if(!document.getElementById('sc-admin').classList.contains('hidden')) {
            renderUserTable();
            renderMovieTable();
        }
    } catch (e) { console.error("Error de conexión:", e); }
}

// Revisar la nube cada 10 segundos para detectar cambios o expulsiones
setInterval(cargarDatos, 10000);

// --- 2. LOGIN Y NAVEGACIÓN ---
function entrar() {
    const u = document.getElementById('log-u').value;
    const p = document.getElementById('log-p').value;
    const user = users.find(x => x.u === u && x.p === p);
    
    if(user) {
        localStorage.setItem('usuario_actual', u); // Guardar sesión en el cel
        document.getElementById('u-name').innerText = "Perfil: " + u;
        switchScreen('sc-main');
        actualizarVista();
    } else { alert("Datos incorrectos"); }
}

function cerrarSesion() {
    localStorage.removeItem('usuario_actual'); // Olvidar sesión
    document.getElementById('drop-menu').classList.add('hidden');
    switchScreen('sc-login');
}

// --- 3. MOTOR DE VISTA Y SEGURIDAD ---
function actualizarVista() {
    // EL GUARDIA: Si el usuario está logueado pero ya no existe en la nube, ¡FUERA!
    const yo = localStorage.getItem('usuario_actual');
    if (yo && yo !== "admin") {
        const todaviaExiste = users.find(x => x.u === yo);
        if (!todaviaExiste) {
            alert("Tu cuenta ha sido desactivada.");
            cerrarSesion();
            return;
        }
    }

    const grid = document.getElementById('grid');
    if(!grid) return;
    
    document.getElementById('cat-title').innerText = currentBrand.toUpperCase() + " > " + currentType.toUpperCase();
    const filtrados = movies.filter(m => m.brand === currentBrand && m.type === currentType);
    
    grid.innerHTML = filtrados.map(m => `
        <div class="poster" style="background-image:url('${m.poster}')" onclick="reproducir('${m.video}', '${m.title}')"></div>
    `).join('');
}

// --- 4. PANEL DE ADMINISTRACIÓN ---
function abrirAdmin() {
    if(prompt("PASSWORD ADMIN:") === "2026") {
        switchScreen('sc-admin');
        renderUserTable();
        renderMovieTable();
    }
}

// GUARDAR Y ELIMINAR (NUBE)
async function guardarContenido() {
    const title = document.getElementById('c-title').value;
    const poster = document.getElementById('c-post').value;
    const video = document.getElementById('c-video').value;
    const brand = document.getElementById('c-brand').value;
    const type = document.getElementById('c-type').value;

    if(title && poster && video) {
        await fetch(`${firebaseURL}movies.json`, {
            method: 'POST',
            body: JSON.stringify({title, poster, video, brand, type})
        });
        alert("¡Contenido Publicado!");
        document.getElementById('c-title').value = "";
        document.getElementById('c-post').value = "";
        document.getElementById('c-video').value = "";
        cargarDatos();
    }
}

async function guardarUser() {
    const u = document.getElementById('adm-un').value;
    const p = document.getElementById('adm-up').value;
    const d = document.getElementById('adm-ud').value;
    if(u && p && d) {
        await fetch(`${firebaseURL}users.json`, { method: 'POST', body: JSON.stringify({u, p, d}) });
        alert("Usuario " + u + " registrado");
        document.getElementById('adm-un').value = "";
        document.getElementById('adm-up').value = "";
        cargarDatos();
    }
}

async function borrarUser(id) {
    if(confirm("¿Eliminar usuario definitivamente?")) {
        await fetch(`${firebaseURL}users/${id}.json`, { method: 'DELETE' });
        cargarDatos();
    }
}

async function borrarMovie(id) {
    if(confirm("¿Eliminar película/serie?")) {
        await fetch(`${firebaseURL}movies/${id}.json`, { method: 'DELETE' });
        cargarDatos();
    }
}

// --- 5. TABLAS Y REPRODUCTOR ---
function renderUserTable() {
    const table = document.getElementById('user-list');
    let html = `<tr><th>Usuario</th><th>X</th></tr>`;
    users.forEach(u => {
        html += `<tr><td>${u.u}</td><td><button onclick="borrarUser('${u.id}')" style="color:red; background:none; border:none; font-weight:bold;">X</button></td></tr>`;
    });
    table.innerHTML = html;
}

function renderMovieTable() {
    const table = document.getElementById('movie-list');
    let html = `<tr><th>Título</th><th>Marca</th><th>X</th></tr>`;
    movies.forEach(m => {
        html += `<tr><td>${m.title}</td><td>${m.brand}</td><td><button onclick="borrarMovie('${m.id}')" style="color:red; background:none; border:none; font-weight:bold;">X</button></td></tr>`;
    });
    table.innerHTML = html;
}

function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

function toggleMenu() { document.getElementById('drop-menu').classList.toggle('hidden'); }

function reproducir(url, titulo) {
    const player = document.getElementById('video-player');
    const iframe = document.getElementById('main-iframe');
    const titleDisp = document.getElementById('player-title');
    iframe.src = url;
    titleDisp.innerText = titulo;
    player.classList.remove('hidden');
}

function cerrarReproductor() {
    document.getElementById('main-iframe').src = "";
    document.getElementById('video-player').classList.add('hidden');
}

function seleccionarMarca(brand) { currentBrand = brand; actualizarVista(); }
function cambiarTipo(type) {
    currentType = type;
    document.getElementById('t-peli').classList.toggle('active', type === 'pelicula');
    document.getElementById('t-serie').classList.toggle('active', type === 'serie');
    actualizarVista();
}

function buscar() {
    const q = document.getElementById('search-box').value.toLowerCase();
    const grid = document.getElementById('grid');
    const filtered = movies.filter(m => m.title.toLowerCase().includes(q));
    grid.innerHTML = filtered.map(m => `<div class="poster" style="background-image:url('${m.poster}')" onclick="reproducir('${m.video}', '${m.title}')"></div>`).join('');
}

// INICIAR TODO AL CARGAR LA PÁGINA
cargarDatos();
