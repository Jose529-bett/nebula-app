const firebaseURL = "https://nebula-plus-app-default-rtdb.firebaseio.com/";

let users = [];
let movies = [];
let currentBrand = 'disney';
let currentType = 'pelicula';

window.onload = () => {
    setTimeout(() => {
        document.getElementById('intro-screen').classList.add('fade-out');
        cargarDesdeFirebase();
    }, 3500);
};

async function cargarDesdeFirebase() {
    try {
        const resU = await fetch(`${firebaseURL}users.json`);
        const dataU = await resU.json();
        users = dataU ? Object.keys(dataU).map(id => ({ id, ...dataU[id] })) : [];

        const resM = await fetch(`${firebaseURL}movies.json`);
        const dataM = await resM.json();
        movies = dataM ? Object.keys(dataM).map(id => ({ id, ...dataM[id] })) : [];

        actualizarVista();
        renderTablas();
    } catch (e) { console.error("Error Firebase"); }
}

// BUSCADOR FUNCIONANDO
function buscar() {
    const q = document.getElementById('search-box').value.toLowerCase();
    const filtrados = movies.filter(m => m.title.toLowerCase().includes(q));
    const grid = document.getElementById('grid');
    grid.innerHTML = filtrados.map(m => `
        <div class="poster" style="background-image:url('${m.poster}')" onclick="reproducir('${m.video}','${m.title}')"></div>
    `).join('');
}

// FILTROS MARCA Y TIPO
function seleccionarMarca(b) {
    currentBrand = b;
    actualizarVista();
}

function cambiarTipo(t) {
    currentType = t;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('t-' + t).classList.add('active');
    actualizarVista();
}

function actualizarVista() {
    const grid = document.getElementById('grid');
    // Filtra por marca Y por tipo (pelicula o serie)
    const filtrados = movies.filter(m => m.brand === currentBrand && m.type === currentType);
    grid.innerHTML = filtrados.map(m => `
        <div class="poster" style="background-image:url('${m.poster}')" onclick="reproducir('${m.video}','${m.title}')"></div>
    `).join('');
}

// REPRODUCTOR
function reproducir(v, t) {
    document.getElementById('p-title').innerText = t;
    document.getElementById('main-iframe').src = v;
    document.getElementById('video-player').classList.remove('hidden');
}

function cerrarReproductor() {
    document.getElementById('main-iframe').src = "";
    document.getElementById('video-player').classList.add('hidden');
}

// LOGIN Y ADMIN
function entrar() {
    const u = document.getElementById('log-u').value;
    const p = document.getElementById('log-p').value;
    const ok = users.find(x => x.u === u && x.p === p);
    if(ok) {
        document.getElementById('u-display').innerText = "Usuario: " + u;
        switchScreen('sc-main');
    } else { alert("Datos incorrectos"); }
}

function renderTablas() {
    document.getElementById('user-table').innerHTML = users.map(u => `
        <tr><td>${u.u}</td><td>${u.d || '---'}</td><td><button class="btn-del" onclick="borrar('users','${u.id}')">X</button></td></tr>
    `).join('');
    document.getElementById('movie-table').innerHTML = movies.map(m => `
        <tr><td>${m.title}</td><td>${m.brand}</td><td><button class="btn-del" onclick="borrar('movies','${m.id}')">X</button></td></tr>
    `).join('');
}

async function borrar(n, id) {
    if(confirm("¿Eliminar?")) {
        await fetch(`${firebaseURL}${n}/${id}.json`, { method: 'DELETE' });
        cargarDesdeFirebase();
    }
}

// NAVEGACIÓN
function toggleMenu() { document.getElementById('drop-menu').classList.toggle('hidden'); }
function abrirAdmin() { if(prompt("CLAVE:") === "2026") switchScreen('sc-admin'); }
function cerrarSesion() { window.location.reload(); }
function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

// GUARDADO
async function guardarUser() {
    const u = document.getElementById('adm-un').value;
    const p = document.getElementById('adm-up').value;
    const d = document.getElementById('adm-ud').value;
    if(u && p) {
        await fetch(`${firebaseURL}users.json`, { method: 'POST', body: JSON.stringify({u,p,d}) });
        cargarDesdeFirebase();
        alert("Usuario creado");
    }
}

async function guardarContenido() {
    const title = document.getElementById('c-title').value;
    const poster = document.getElementById('c-post').value;
    const video = document.getElementById('c-video').value;
    const brand = document.getElementById('c-brand').value;
    const type = document.getElementById('c-type').value;
    if(title && video) {
        await fetch(`${firebaseURL}movies.json`, { method: 'POST', body: JSON.stringify({title, poster, video, brand, type}) });
        cargarDesdeFirebase();
        alert("Publicado");
    }
}
