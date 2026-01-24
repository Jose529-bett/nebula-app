const firebaseURL = "https://nebula-plus-default-rtdb.firebaseio.com/";
let users = [];
let movies = [];
let currentBrand = 'disney';
let currentType = 'pelicula';

// INTRO
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.getElementById('intro-screen').classList.add('fade-out');
        cargarDesdeFirebase();
    }, 3500);
});

// CONEXIÓN FIREBASE
async function cargarDesdeFirebase() {
    try {
        const resU = await fetch(`${firebaseURL}users.json`);
        const dataU = await resU.json();
        users = dataU ? Object.keys(dataU).map(id => ({ id, ...dataU[id] })) : [];

        const resM = await fetch(`${firebaseURL}movies.json`);
        const dataM = await resM.json();
        movies = dataM ? Object.keys(dataM).map(id => ({ id, ...dataM[id] })) : [];

        actualizarVista();
        if(!document.getElementById('sc-admin').classList.contains('hidden')) {
            renderUserTable();
            renderMovieTable();
        }
    } catch (e) { console.error("Error cargando Firebase", e); }
}

// LOGIN
function entrar() {
    const u = document.getElementById('log-u').value;
    const p = document.getElementById('log-p').value;
    const user = users.find(x => x.u === u && x.p === p);
    if(user) {
        document.getElementById('u-name').innerText = "Perfil: " + u;
        switchScreen('sc-main');
        actualizarVista();
    } else { alert("Usuario o PIN incorrecto"); }
}

// ADMIN ACCIONES (FIREBASE)
async function guardarUser() {
    const u = document.getElementById('adm-un').value;
    const p = document.getElementById('adm-up').value;
    const d = document.getElementById('adm-ud').value;
    if(u && p) {
        await fetch(`${firebaseURL}users.json`, {
            method: 'POST',
            body: JSON.stringify({u, p, d})
        });
        cargarDesdeFirebase();
    }
}

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
        cargarDesdeFirebase();
        alert("Publicado en la nube!");
    }
}

async function borrar(tipo, id) {
    if(confirm("¿Eliminar?")) {
        await fetch(`${firebaseURL}${tipo}/${id}.json`, { method: 'DELETE' });
        cargarDesdeFirebase();
    }
}

// RENDERS
function renderUserTable() {
    const table = document.getElementById('user-list');
    table.innerHTML = users.map(u => `
        <tr><td>${u.u}</td><td style="text-align:right"><button onclick="borrar('users','${u.id}')" style="color:red; background:none; border:none;">X</button></td></tr>
    `).join('');
}

function renderMovieTable() {
    const table = document.getElementById('movie-list');
    table.innerHTML = movies.map(m => `
        <tr><td>${m.title}</td><td style="text-align:right"><button onclick="borrar('movies','${m.id}')" style="color:red; background:none; border:none;">X</button></td></tr>
    `).join('');
}

// NAVEGACIÓN Y VISTA
function seleccionarMarca(b) { currentBrand = b; actualizarVista(); }
function cambiarTipo(t) { 
    currentType = t; 
    document.getElementById('t-peli').classList.toggle('active', t === 'pelicula');
    document.getElementById('t-serie').classList.toggle('active', t === 'serie');
    actualizarVista(); 
}

function actualizarVista() {
    const grid = document.getElementById('grid');
    if(!grid) return;
    const filtrados = movies.filter(m => m.brand === currentBrand && m.type === currentType);
    grid.innerHTML = filtrados.map(m => `
        <div class="poster" style="background-image:url('${m.poster}')" onclick="reproducir('${m.video}', '${m.title}')"></div>
    `).join('');
}

function abrirAdmin() { if(prompt("PASSWORD:") === "2026") switchScreen('sc-admin'); }
function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}
function cerrarSesion() { window.location.reload(); }
function reproducir(u, t) {
    document.getElementById('main-iframe').src = u;
    document.getElementById('player-title').innerText = t;
    document.getElementById('video-player').classList.remove('hidden');
}
function cerrarReproductor() { document.getElementById('main-iframe').src = ""; document.getElementById('video-player').classList.add('hidden'); }
