const firebaseURL = "https://nebula-plus-app-default-rtdb.firebaseio.com/";

let users = [];
let movies = [];
let currentBrand = 'disney';
let currentType = 'pelicula';

window.onload = () => {
    setTimeout(() => {
        document.getElementById('intro-screen').classList.add('fade-out');
        cargarDesdeFirebase();
    }, 3000);
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
    } catch (e) { console.log("Error de conexión"); }
}

// TABLAS CON ELIMINAR
function renderTablas() {
    document.getElementById('user-list').innerHTML = users.map(u => `
        <tr><td>${u.u}</td><td align="right"><button class="btn-del" onclick="borrar('users','${u.id}')">ELIMINAR</button></td></tr>
    `).join('');
    
    document.getElementById('movie-list').innerHTML = movies.map(m => `
        <tr><td>${m.title}</td><td align="right"><button class="btn-del" onclick="borrar('movies','${m.id}')">ELIMINAR</button></td></tr>
    `).join('');
}

async function borrar(nodo, id) {
    if(confirm("¿Seguro que deseas eliminarlo?")) {
        await fetch(`${firebaseURL}${nodo}/${id}.json`, { method: 'DELETE' });
        cargarDesdeFirebase();
    }
}

// BÚSQUEDA REAL
function buscar() {
    const q = document.getElementById('search-box').value.toLowerCase();
    const filtrados = movies.filter(m => m.title.toLowerCase().includes(q));
    const grid = document.getElementById('grid');
    grid.innerHTML = filtrados.map(m => `
        <div class="poster" style="background-image:url('${m.poster}')" onclick="reproducir('${m.video}', '${m.title}')"></div>
    `).join('');
}

function entrar() {
    const u = document.getElementById('log-u').value;
    const p = document.getElementById('log-p').value;
    const user = users.find(x => x.u === u && x.p === p);
    if(user) {
        document.getElementById('u-display').innerText = "Hola, " + u;
        switchScreen('sc-main');
    } else { alert("PIN Incorrecto"); }
}

async function guardarUser() {
    const u = document.getElementById('adm-un').value;
    const p = document.getElementById('adm-up').value;
    if(u && p) {
        await fetch(`${firebaseURL}users.json`, { method: 'POST', body: JSON.stringify({u, p}) });
        cargarDesdeFirebase();
        alert("Usuario Creado");
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
        alert("Publicado");
    }
}

function seleccionarMarca(b) { currentBrand = b; actualizarVista(); }
function cambiarTipo(t) { currentType = t; actualizarVista(); }

function actualizarVista() {
    const grid = document.getElementById('grid');
    const filtrados = movies.filter(m => m.brand === currentBrand && m.type === currentType);
    grid.innerHTML = filtrados.map(m => `
        <div class="poster" style="background-image:url('${m.poster}')" onclick="reproducir('${m.video}', '${m.title}')"></div>
    `).join('');
}

function reproducir(url, titulo) {
    document.getElementById('p-title').innerText = titulo;
    document.getElementById('main-iframe').src = url;
    document.getElementById('video-player').classList.remove('hidden');
}

function cerrarReproductor() {
    document.getElementById('main-iframe').src = "";
    document.getElementById('video-player').classList.add('hidden');
}

function toggleMenu() { document.getElementById('drop-menu').classList.toggle('hidden'); }
function abrirAdmin() { if(prompt("PIN:") === "2026") switchScreen('sc-admin'); }
function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}
function cerrarSesion() { window.location.reload(); }
