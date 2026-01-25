const fbURL = "https://nebula-plus-app-default-rtdb.firebaseio.com/";
let users = [], movies = [], currentBrand = 'disney', currentType = 'pelicula';

window.onload = () => { cargarDatos(); };

async function cargarDatos() {
    try {
        const [resU, resM] = await Promise.all([
            fetch(`${fbURL}users.json`),
            fetch(`${fbURL}movies.json`)
        ]);
        const dataU = await resU.json();
        const dataM = await resM.json();
        users = dataU ? Object.keys(dataU).map(id => ({ id, ...dataU[id] })) : [];
        movies = dataM ? Object.keys(dataM).map(id => ({ id, ...dataM[id] })) : [];
        renderUserTable();
        renderMovieTable();
        actualizarVista();
    } catch (e) { console.log("Error sincronizando"); }
}

// LOGIN: Evalúa y dirige al Catálogo
function entrar() {
    const u = document.getElementById('log-u').value;
    const p = document.getElementById('log-p').value;
    const userValid = users.find(x => x.u === u && x.p === p);
    
    if(p === "2026" || userValid) {
        switchScreen('sc-main');
    } else {
        alert("Acceso Denegado");
    }
}

// SALIDA: Siempre redirige al LOGIN (sea desde Admin o Catálogo)
function cerrarSesion() {
    // Limpiamos los inputs por seguridad
    document.getElementById('log-u').value = "";
    document.getElementById('log-p').value = "";
    document.getElementById('drop-menu').classList.add('hidden');
    
    // Redirección directa a la pantalla de Login
    switchScreen('sc-login');
}

// PANEL ADMIN
function abrirAdmin() {
    if(prompt("PIN MAESTRO:") === "2026") {
        switchScreen('sc-admin');
    }
}

async function guardarContenido() {
    const title = document.getElementById('c-title').value;
    const poster = document.getElementById('c-post').value;
    const video = document.getElementById('c-video').value;
    const brand = document.getElementById('c-brand').value;
    const type = document.getElementById('c-type').value;
    if(!title || !poster || !video) return;
    await fetch(`${fbURL}movies.json`, { method: 'POST', body: JSON.stringify({title, poster, video, brand, type}) });
    await cargarDatos();
}

async function guardarUser() {
    const u = document.getElementById('adm-un').value;
    const p = document.getElementById('adm-up').value;
    const d = document.getElementById('adm-ud').value;
    if(!u || !p || !d) return;
    await fetch(`${fbURL}users.json`, { method: 'POST', body: JSON.stringify({u, p, d}) });
    await cargarDatos();
}

async function borrar(path, id) {
    if(confirm("¿Eliminar registro?")) {
        await fetch(`${fbURL}${path}/${id}.json`, { method: 'DELETE' });
        await cargarDatos();
    }
}

// VISTAS Y REPRODUCTOR
function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

function renderMovieTable() {
    const t = document.getElementById('movie-list');
    t.innerHTML = movies.map(m => `<tr><td>${m.title}</td><td><button onclick="borrar('movies','${m.id}')" style="color:red">X</button></td></tr>`).join('');
}

function renderUserTable() {
    const t = document.getElementById('user-list');
    t.innerHTML = users.map(u => `<tr><td>${u.u}</td><td><button onclick="borrar('users','${u.id}')" style="color:red">X</button></td></tr>`).join('');
}

function seleccionarMarca(b) { currentBrand = b; actualizarVista(); }
function cambiarTipo(t) { 
    currentType = t; 
    document.getElementById('t-peli').classList.toggle('active', t === 'pelicula');
    document.getElementById('t-serie').classList.toggle('active', t === 'serie');
    actualizarVista(); 
}

function actualizarVista() {
    const grid = document.getElementById('grid');
    const filtrados = movies.filter(m => m.brand === currentBrand && m.type === currentType);
    grid.innerHTML = filtrados.map(m => `<div class="poster" style="background-image:url('${m.poster}')" onclick="reproducir('${m.video}', '${m.title}')"></div>`).join('');
}

function buscar() {
    const q = document.getElementById('search-box').value.toLowerCase();
    const filtered = movies.filter(m => m.title.toLowerCase().includes(q));
    document.getElementById('grid').innerHTML = filtered.map(m => `<div class="poster" style="background-image:url('${m.poster}')" onclick="reproducir('${m.video}', '${m.title}')"></div>`).join('');
}

function reproducir(u, t) {
    document.getElementById('main-iframe').src = u;
    document.getElementById('player-title').innerText = t;
    document.getElementById('video-player').classList.remove('hidden');
}

function cerrarReproductor() { document.getElementById('main-iframe').src = ""; document.getElementById('video-player').classList.add('hidden'); }
function toggleMenu() { document.getElementById('drop-menu').classList.toggle('hidden'); }
