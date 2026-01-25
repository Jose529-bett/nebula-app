const fbURL = "https://nebula-plus-app-default-rtdb.firebaseio.com/";
let users = [];
let movies = [];
let currentBrand = 'disney';
let currentType = 'pelicula';

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
    } catch (e) { console.error("Error en Firebase"); }
}

function entrar() {
    const u = document.getElementById('log-u').value;
    const p = document.getElementById('log-p').value;
    const user = users.find(x => x.u === u && x.p === p);
    if(p === "2026" || user) {
        document.getElementById('u-name').innerText = "Perfil: " + (u || "Admin");
        switchScreen('sc-main');
        actualizarVista();
    } else { alert("Usuario no encontrado"); }
}

function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

function cerrarSesion() {
    document.getElementById('log-u').value = "";
    document.getElementById('log-p').value = "";
    document.getElementById('drop-menu').classList.add('hidden');
    switchScreen('sc-login');
}

function toggleMenu() { document.getElementById('drop-menu').classList.toggle('hidden'); }

async function guardarContenido() {
    const title = document.getElementById('c-title').value;
    const poster = document.getElementById('c-post').value;
    const video = document.getElementById('c-video').value;
    const brand = document.getElementById('c-brand').value;
    const type = document.getElementById('c-type').value;

    if(title && poster && video) {
        await fetch(`${fbURL}movies.json`, { method: 'POST', body: JSON.stringify({title, poster, video, brand, type}) });
        document.getElementById('c-title').value = "";
        document.getElementById('c-post').value = "";
        document.getElementById('c-video').value = "";
        await cargarDatos();
    }
}

async function guardarUser() {
    const u = document.getElementById('adm-un').value;
    const p = document.getElementById('adm-up').value;
    const d = document.getElementById('adm-ud').value;
    if(u && p && d) {
        await fetch(`${fbURL}users.json`, { method: 'POST', body: JSON.stringify({u, p, d}) });
        document.getElementById('adm-un').value = "";
        document.getElementById('adm-up').value = "";
        await cargarDatos();
    }
}

async function borrarMovie(id) {
    if(confirm("¿Eliminar?")) {
        await fetch(`${fbURL}movies/${id}.json`, { method: 'DELETE' });
        await cargarDatos();
    }
}

async function borrarUser(id) {
    if(confirm("¿Eliminar?")) {
        await fetch(`${fbURL}users/${id}.json`, { method: 'DELETE' });
        await cargarDatos();
    }
}

function renderMovieTable() {
    const table = document.getElementById('movie-list');
    let html = `<tr><th>Título</th><th>X</th></tr>`;
    movies.forEach(m => html += `<tr><td>${m.title}</td><td><button onclick="borrarMovie('${m.id}')" style="color:red">X</button></td></tr>`);
    table.innerHTML = html;
}

function renderUserTable() {
    const table = document.getElementById('user-list');
    let html = `<tr><th>Usuario</th><th>X</th></tr>`;
    users.forEach(u => html += `<tr><td>${u.u}</td><td><button onclick="borrarUser('${u.id}')" style="color:red">X</button></td></tr>`);
    table.innerHTML = html;
}

function reproducir(url, titulo) {
    document.getElementById('main-iframe').src = url;
    document.getElementById('player-title').innerText = titulo;
    document.getElementById('video-player').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function cerrarReproductor() {
    document.getElementById('main-iframe').src = "";
    document.getElementById('video-player').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function abrirAdmin() {
    if(prompt("PIN:") === "2026") switchScreen('sc-admin');
}

function seleccionarMarca(brand) { currentBrand = brand; actualizarVista(); }

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
    const filtered = movies.filter(m => m.title.toLowerCase().includes(q));
    document.getElementById('grid').innerHTML = filtered.map(m => `
        <div class="poster" style="background-image:url('${m.poster}')" onclick="reproducir('${m.video}', '${m.title}')"></div>
    `).join('');
}
