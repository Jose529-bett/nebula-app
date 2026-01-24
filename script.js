// 1. REEMPLAZA ESTE LINK CON EL TUYO
const firebaseURL = "TU_LINK_NUEVO_AQUI.firebaseio.com/"; 

let users = [];
let movies = [];
let currentBrand = 'disney';
let currentType = 'pelicula';

// INTRO
window.onload = () => {
    setTimeout(() => {
        document.getElementById('intro-screen').classList.add('fade-out');
        cargarDesdeFirebase();
    }, 3000);
};

// FIREBASE FETCH
async function cargarDesdeFirebase() {
    try {
        const resU = await fetch(`${firebaseURL}users.json`);
        const dataU = await resU.json();
        users = dataU ? Object.keys(dataU).map(id => ({ id, ...dataU[id] })) : [];

        const resM = await fetch(`${firebaseURL}movies.json`);
        const dataM = await resM.json();
        movies = dataM ? Object.keys(dataM).map(id => ({ id, ...dataM[id] })) : [];

        actualizarVista();
        renderUserTable();
        renderMovieTable();
    } catch (e) { console.error("Error Firebase:", e); }
}

// LOGIN
function entrar() {
    const u = document.getElementById('log-u').value;
    const p = document.getElementById('log-p').value;
    const user = users.find(x => x.u === u && x.p === p);
    if(user) {
        document.getElementById('u-name').innerText = u;
        switchScreen('sc-main');
        actualizarVista();
    } else { alert("PIN Incorrecto"); }
}

// ADMIN ACCIONES
async function guardarUser() {
    const u = document.getElementById('adm-un').value;
    const p = document.getElementById('adm-up').value;
    const d = document.getElementById('adm-ud').value;
    if(u && p) {
        await fetch(`${firebaseURL}users.json`, { method: 'POST', body: JSON.stringify({u, p, d}) });
        cargarDesdeFirebase();
        alert("Usuario Guardado");
    }
}

async function guardarContenido() {
    const title = document.getElementById('c-title').value;
    const poster = document.getElementById('c-post').value;
    const video = document.getElementById('c-video').value;
    const brand = document.getElementById('c-brand').value;
    const type = document.getElementById('c-type').value;
    if(title && poster) {
        await fetch(`${firebaseURL}movies.json`, { method: 'POST', body: JSON.stringify({title, poster, video, brand, type}) });
        cargarDesdeFirebase();
        alert("Publicado!");
    }
}

async function borrar(tipo, id) {
    if(confirm("¿Eliminar?")) {
        await fetch(`${firebaseURL}${tipo}/${id}.json`, { method: 'DELETE' });
        cargarDesdeFirebase();
    }
}

// UI RENDERS
function renderUserTable() {
    document.getElementById('user-list').innerHTML = users.map(u => `<tr><td>${u.u}</td><td><button onclick="borrar('users','${u.id}')">X</button></td></tr>`).join('');
}
function renderMovieTable() {
    document.getElementById('movie-list').innerHTML = movies.map(m => `<tr><td>${m.title}</td><td><button onclick="borrar('movies','${m.id}')">X</button></td></tr>`).join('');
}
function seleccionarMarca(b) { currentBrand = b; actualizarVista(); }
function cambiarTipo(t) { currentType = t; actualizarVista(); }
function actualizarVista() {
    const grid = document.getElementById('grid');
    if(!grid) return;
    const filtrados = movies.filter(m => m.brand === currentBrand && m.type === currentType);
    grid.innerHTML = filtrados.map(m => `<div class="poster" style="background-image:url('${m.poster}')" onclick="reproducir('${m.video}', '${m.title}')"></div>`).join('');
}
function abrirAdmin() { if(prompt("CLAVE:") === "2026") switchScreen('sc-admin'); }
function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}
function cerrarSesion() { window.location.reload(); }
function reproducir(u, t) {
    document.getElementById('main-iframe').src = u;
    document.getElementById('video-player').classList.remove('hidden');
}
function cerrarReproductor() { document.getElementById('main-iframe').src = ""; document.getElementById('video-player').classList.add('hidden'); }
