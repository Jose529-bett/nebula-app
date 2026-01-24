const firebaseURL = "https://nebula-plus-default-rtdb.firebaseio.com/";
let users = [];
let movies = [];
let currentBrand = 'disney';

// --- INTRO Y CARGA ---
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.getElementById('intro-screen').classList.add('fade-out');
        cargarDatos();
    }, 3500);
});

async function cargarDatos() {
    try {
        const resU = await fetch(`${firebaseURL}users.json`);
        const dataU = await resU.json();
        users = dataU ? Object.keys(dataU).map(id => ({ id, ...dataU[id] })) : [{u:'admin', p:'2026'}];

        const resM = await fetch(`${firebaseURL}movies.json`);
        const dataM = await resM.json();
        movies = dataM ? Object.keys(dataM).map(id => ({ id, ...dataM[id] })) : [];

        // Seguridad: Expulsar si el usuario no existe
        const yo = localStorage.getItem('usuario_actual');
        if (yo && yo !== "admin" && !users.find(x => x.u === yo)) {
            localStorage.removeItem('usuario_actual');
            window.location.reload();
        }

        if (yo && !document.getElementById('sc-login').classList.contains('hidden')) {
            switchScreen('sc-main');
        }

        actualizarVista();
        if(!document.getElementById('sc-admin').classList.contains('hidden')) {
            renderTables();
        }
    } catch (e) { console.log(e); }
}

setInterval(cargarDatos, 6000);

// --- NAVEGACIÓN ---
function entrar() {
    const u = document.getElementById('log-u').value;
    const p = document.getElementById('log-p').value;
    const user = users.find(x => x.u === u && x.p === p);
    if(user) { localStorage.setItem('usuario_actual', u); window.location.reload(); }
}

function abrirAdmin() {
    if(prompt("PIN:") === "2026") switchScreen('sc-admin');
}

// --- FIREBASE ACCIONES ---
async function guardarUser() {
    const u = document.getElementById('adm-un').value;
    const p = document.getElementById('adm-up').value;
    if(u && p) {
        await fetch(`${firebaseURL}users.json`, { method: 'POST', body: JSON.stringify({u, p}) });
        cargarDatos();
    }
}

async function guardarContenido() {
    const title = document.getElementById('c-title').value;
    const poster = document.getElementById('c-post').value;
    const video = document.getElementById('c-video').value;
    const brand = document.getElementById('c-brand').value;
    const type = document.getElementById('c-type').value;
    if(title && poster && video) {
        await fetch(`${firebaseURL}movies.json`, { method: 'POST', body: JSON.stringify({title, poster, video, brand, type}) });
        cargarDatos();
    }
}

async function borrar(tipo, id) {
    await fetch(`${firebaseURL}${tipo}/${id}.json`, { method: 'DELETE' });
    cargarDatos();
}

// --- VISTAS ---
function renderTables() {
    document.getElementById('user-list').innerHTML = users.map(u => `<tr><td>${u.u}</td><td><button class="btn-del" onclick="borrar('users','${u.id}')">X</button></td></tr>`).join('');
    document.getElementById('movie-list').innerHTML = movies.map(m => `<tr><td>${m.title}</td><td><button class="btn-del" onclick="borrar('movies','${m.id}')">X</button></td></tr>`).join('');
}

function actualizarVista() {
    const grid = document.getElementById('grid');
    if(!grid) return;
    const filtered = movies.filter(m => m.brand === currentBrand);
    grid.innerHTML = filtered.map(m => `<div class="poster" tabindex="0" onclick="reproducir('${m.video}')" style="background-image:url('${m.poster}')"></div>`).join('');
}

function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

function cerrarSesion() { localStorage.removeItem('usuario_actual'); window.location.reload(); }
function seleccionarMarca(b) { currentBrand = b; actualizarVista(); }
function reproducir(u) { document.getElementById('main-iframe').src = u; document.getElementById('video-player').classList.remove('hidden'); }
function cerrarReproductor() { document.getElementById('main-iframe').src = ""; document.getElementById('video-player').classList.add('hidden'); }
