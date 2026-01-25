const firebaseURL = "https://nebula-plus-app-default-rtdb.firebaseio.com/";
let movies = [], users = [], marcaActual = "";

window.onload = async () => {
    await cargarDesdeFirebase();
    setTimeout(() => {
        document.getElementById('intro-screen').classList.add('hidden');
        switchScreen('sc-login');
    }, 3000);
};

async function cargarDesdeFirebase() {
    try {
        const [resU, resM] = await Promise.all([
            fetch(`${firebaseURL}users.json`),
            fetch(`${firebaseURL}movies.json`)
        ]);
        const dataU = await resU.json();
        const dataM = await resM.json();
        users = dataU ? Object.keys(dataU).map(id => ({ id, ...dataU[id] })) : [];
        movies = dataM ? Object.keys(dataM).map(id => ({ id, ...dataM[id] })) : [];
        renderTablas();
    } catch (e) { console.error("Error cargando datos"); }
}

function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

function abrirAdmin() {
    let pin = prompt("PIN ADMINISTRADOR:");
    if(pin === "2026") switchScreen('sc-admin');
}

function entrar() {
    const u = document.getElementById('log-u').value;
    const p = document.getElementById('log-p').value;
    // Buscamos si el PIN ingresado coincide con algún usuario o el maestro
    if(p === "2026" || users.find(x => x.u === u && x.p === p)) {
        switchScreen('sc-main');
    } else {
        alert("Credenciales incorrectas");
    }
}

// LÓGICA DE CATÁLOGO
function seleccionarMarca(marca) {
    marcaActual = marca;
    document.getElementById('brand-menu').classList.add('hidden');
    document.getElementById('type-selector').classList.remove('hidden');
}

function filtrarTipo(tipo) {
    const filtrados = movies.filter(m => m.brand === marcaActual && m.type === tipo);
    const grid = document.getElementById('grid');
    grid.innerHTML = filtrados.map(m => `
        <div class="movie-card" onclick="verVideo('${m.video}','${m.title}')">
            <img src="${m.poster}">
        </div>
    `).join('');
}

function volverAMarcas() {
    document.getElementById('brand-menu').classList.remove('hidden');
    document.getElementById('type-selector').classList.add('hidden');
    document.getElementById('grid').innerHTML = "";
}

// REPRODUCTOR
function verVideo(url, titulo) {
    document.getElementById('main-iframe').src = url;
    document.getElementById('now-playing').innerText = titulo;
    document.getElementById('video-player').classList.remove('hidden');
}

function cerrarPlayer() {
    document.getElementById('main-iframe').src = "";
    document.getElementById('video-player').classList.add('hidden');
}

// GESTIÓN ADMIN
async function guardarContenido() {
    const data = {
        title: document.getElementById('c-title').value,
        poster: document.getElementById('c-post').value,
        video: document.getElementById('c-video').value,
        brand: document.getElementById('c-brand-sel').value,
        type: document.getElementById('c-type-sel').value
    };
    await fetch(`${firebaseURL}movies.json`, { method: 'POST', body: JSON.stringify(data) });
    alert("¡Publicado!");
    cargarDesdeFirebase();
}

function renderTablas() {
    const table = document.getElementById('movie-table');
    table.innerHTML = movies.map(m => `
        <div class="table-item">
            <span>${m.title} (${m.brand})</span>
            <button class="btn-del" onclick="borrarContenido('${m.id}')">Eliminar</button>
        </div>
    `).join('');
}

async function borrarContenido(id) {
    if(confirm("¿Seguro que quieres eliminar este contenido?")) {
        await fetch(`${firebaseURL}movies/${id}.json`, { method: 'DELETE' });
        cargarDesdeFirebase();
    }
}

function cerrarSesion() { location.reload(); }
