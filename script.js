// CONFIGURACIÓN DE TU NUBE
const firebaseURL = "https://nebula-plus-default-rtdb.firebaseio.com/";

let users = [];
let movies = [];
let currentBrand = 'disney';
let currentType = 'pelicula';

// --- 1. CARGA INICIAL (Sincroniza con Firebase) ---
async function cargarDatos() {
    try {
        // Cargar Usuarios desde la nube
        const resUsers = await fetch(`${firebaseURL}users.json`);
        const dataUsers = await resUsers.json();
        users = dataUsers ? Object.keys(dataUsers).map(id => ({
            id: id, u: dataUsers[id].u, p: dataUsers[id].p, d: dataUsers[id].d 
        })) : [{u:'admin', p:'1234', d:'2026-12-31'}];

        // Cargar Películas/Series desde la nube
        const resMovies = await fetch(`${firebaseURL}movies.json`);
        const dataMovies = await resMovies.json();
        movies = dataMovies ? Object.keys(dataMovies).map(id => ({
            id: id, ...dataMovies[id]
        })) : [];

        actualizarVista();
    } catch (error) {
        console.error("Error sincronizando:", error);
    }
}

// --- 2. LOGIN Y NAVEGACIÓN ---
function entrar() {
    const u = document.getElementById('log-u').value;
    const p = document.getElementById('log-p').value;
    const user = users.find(x => x.u === u && x.p === p);

    if(user) {
        document.getElementById('u-name').innerText = "Perfil: " + u;
        switchScreen('sc-main');
        actualizarVista();
    } else { alert("Usuario no encontrado"); }
}

function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

function cerrarSesion() {
    document.getElementById('drop-menu').classList.add('hidden');
    switchScreen('sc-login');
}

function toggleMenu() { document.getElementById('drop-menu').classList.toggle('hidden'); }

// --- 3. REPRODUCTOR ---
function reproducir(url, titulo) {
    const player = document.getElementById('video-player');
    const iframe = document.getElementById('main-iframe');
    const titleDisp = document.getElementById('player-title');
    iframe.src = url;
    titleDisp.innerText = titulo;
    player.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function cerrarReproductor() {
    const player = document.getElementById('video-player');
    const iframe = document.getElementById('main-iframe');
    iframe.src = "";
    player.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// --- 4. PANEL ADMIN (BOTÓN SECRETO) ---
function abrirAdmin() {
    if(prompt("PASSWORD ADMIN:") === "2026") {
        switchScreen('sc-admin');
        renderUserTable();
        renderMovieTable();
    }
}

// --- 5. GESTIÓN DE CONTENIDO (NUBE) ---
async function guardarContenido() {
    const title = document.getElementById('c-title').value;
    const poster = document.getElementById('c-post').value;
    const video = document.getElementById('c-video').value;
    const brand = document.getElementById('c-brand').value;
    const type = document.getElementById('c-type').value;

    if(title && poster && video) {
        const nuevaPeli = {title, poster, video, brand, type};
        await fetch(`${firebaseURL}movies.json`, {
            method: 'POST',
            body: JSON.stringify(nuevaPeli)
        });
        
        document.getElementById('c-title').value = "";
        document.getElementById('c-post').value = "";
        document.getElementById('c-video').value = "";
        
        alert("Publicado en la nube!");
        await cargarDatos(); // Refrescar lista
        renderMovieTable();
    }
}

async function borrarMovie(id) {
    if(confirm("¿Eliminar contenido?")) {
        await fetch(`${firebaseURL}movies/${id}.json`, { method: 'DELETE' });
        await cargarDatos();
        renderMovieTable();
    }
}

function renderMovieTable() {
    const table = document.getElementById('movie-list');
    let html = `<tr><th>Título</th><th>Marca</th><th>X</th></tr>`;
    movies.forEach((m) => {
        html += `<tr><td>${m.title}</td><td>${m.brand}</td><td><button onclick="borrarMovie('${m.id}')" style="color:red">X</button></td></tr>`;
    });
    table.innerHTML = html;
}

// --- 6. GESTIÓN DE USUARIOS (NUBE) ---
async function guardarUser() {
    const u = document.getElementById('adm-un').value;
    const p = document.getElementById('adm-up').value;
    const d = document.getElementById('adm-ud').value;
    
    if(u && p && d) {
        await fetch(`${firebaseURL}users.json`, {
            method: 'POST',
            body: JSON.stringify({u, p, d})
        });
        alert("Usuario creado en la nube");
        await cargarDatos();
        renderUserTable();
    }
}

async function borrarUser(id) {
    if(confirm("¿Eliminar usuario?")) {
        await fetch(`${firebaseURL}users/${id}.json`, { method: 'DELETE' });
        await cargarDatos();
        renderUserTable();
    }
}

function renderUserTable() {
    const table = document.getElementById('user-list');
    let html = `<tr><th>Usuario</th><th>X</th></tr>`;
    users.forEach((u) => {
        html += `<tr><td>${u.u}</td><td><button onclick="borrarUser('${u.id}')" style="color:red">X</button></td></tr>`;
    });
    table.innerHTML = html;
}

// --- 7. MOTOR DE VISTA ---
function seleccionarMarca(brand) {
    currentBrand = brand;
    actualizarVista();
}

function cambiarTipo(type) {
    currentType = type;
    document.getElementById('t-peli').classList.toggle('active', type === 'pelicula');
    document.getElementById('t-serie').classList.toggle('active', type === 'serie');
    actualizarVista();
}

function actualizarVista() {
    const grid = document.getElementById('grid');
    if(!grid) return;
    document.getElementById('cat-title').innerText = currentBrand.toUpperCase() + " > " + currentType.toUpperCase();
    
    const filtrados = movies.filter(m => m.brand === currentBrand && m.type === currentType);
    
    grid.innerHTML = filtrados.map(m => `
        <div class="poster" style="background-image:url('${m.poster}')" onclick="reproducir('${m.video}', '${m.title}')"></div>
    `).join('');
}

function buscar() {
    const q = document.getElementById('search-box').value.toLowerCase();
    const grid = document.getElementById('grid');
    const filtered = movies.filter(m => m.title.toLowerCase().includes(q));
    grid.innerHTML = filtered.map(m => `<div class="poster" style="background-image:url('${m.poster}')" onclick="reproducir('${m.video}', '${m.title}')"></div>`).join('');
}

// INICIAR CARGA
cargarDatos();
