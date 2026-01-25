const fbURL = "https://nebula-plus-app-default-rtdb.firebaseio.com/";
let users = [], movies = [], currentBrand = 'disney', currentType = 'pelicula';

// CARGA INICIAL
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
    } catch (e) { console.error("Error Firebase"); }
}

// LOGIN
function entrar() {
    const u = document.getElementById('log-u').value;
    const p = document.getElementById('log-p').value;
    const user = users.find(x => x.u === u && x.p === p);
    
    if(p === "2026" || user) {
        document.getElementById('u-name-display').innerText = u || "Admin";
        switchScreen('sc-main');
    } else { alert("Credenciales incorrectas"); }
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

// BUSCADOR ACTIVO
function buscar() {
    const q = document.getElementById('search-box').value.toLowerCase();
    const grid = document.getElementById('grid');
    if(q.length > 0) {
        const filtered = movies.filter(m => m.title.toLowerCase().includes(q));
        grid.innerHTML = filtered.map(m => `
            <div class="poster" style="background-image:url('${m.poster}')" onclick="reproducir('${m.video}', '${m.title}')"></div>
        `).join('');
    } else {
        actualizarVista();
    }
}

// REPRODUCTOR SUPER TV
function reproducir(url, titulo) {
    const player = document.getElementById('video-player');
    const iframe = document.getElementById('main-iframe');
    document.getElementById('player-title').innerText = titulo;
    iframe.src = url;
    player.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function cerrarReproductor() {
    document.getElementById('main-iframe').src = "";
    document.getElementById('video-player').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// CATÁLOGO
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
    document.getElementById('cat-title').innerText = `${currentBrand.toUpperCase()} > ${currentType.toUpperCase()}`;
    const filtrados = movies.filter(m => m.brand === currentBrand && m.type === currentType);
    grid.innerHTML = filtrados.map(m => `
        <div class="poster" style="background-image:url('${m.poster}')" onclick="reproducir('${m.video}', '${m.title}')"></div>
    `).join('');
}

// ADMIN LOGIC
function abrirAdmin() { if(prompt("PASSWORD ADMIN:") === "2026") switchScreen('sc-admin'); }

async function guardarContenido() {
    const data = {
        title: document.getElementById('c-title').value,
        poster: document.getElementById('c-post').value,
        video: document.getElementById('c-video').value,
        brand: document.getElementById('c-brand').value,
        type: document.getElementById('c-type').value
    };
    await fetch(`${fbURL}movies.json`, { method: 'POST', body: JSON.stringify(data) });
    cargarDatos();
}

async function guardarUser() {
    const u = document.getElementById('adm-un').value;
    const p = document.getElementById('adm-up').value;
    const d = document.getElementById('adm-ud').value;
    await fetch(`${fbURL}users.json`, { method: 'POST', body: JSON.stringify({u, p, d}) });
    cargarDatos();
}

function renderMovieTable() {
    const table = document.getElementById('movie-list');
    table.innerHTML = `<tr><th>Título</th><th>Marca</th><th>X</th></tr>` + 
    movies.map(m => `<tr><td>${m.title}</td><td>${m.brand}</td><td><button onclick="borrar('movies','${m.id}')">X</button></td></tr>`).join('');
}

function renderUserTable() {
    const table = document.getElementById('user-list');
    table.innerHTML = `<tr><th>Usuario</th><th>X</th></tr>` + 
    users.map(u => `<tr><td>${u.u}</td><td><button onclick="borrar('users','${u.id}')">X</button></td></tr>`).join('');
}

async function borrar(path, id) {
    if(confirm("¿Eliminar?")) {
        await fetch(`${fbURL}${path}/${id}.json`, { method: 'DELETE' });
        cargarDatos();
    }
}
