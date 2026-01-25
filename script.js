const firebaseURL = "https://nebula-plus-app-default-rtdb.firebaseio.com/";
let users = [], movies = [], marcaActual = "";

window.onload = async () => {
    await cargarDatos();
    setTimeout(() => {
        document.getElementById('intro-screen').classList.add('hidden');
        switchScreen('sc-login');
    }, 3000);
};

async function cargarDatos() {
    try {
        const [resU, resM] = await Promise.all([
            fetch(`${firebaseURL}users.json`),
            fetch(`${firebaseURL}movies.json`)
        ]);
        const dataU = await resU.json();
        const dataM = await resM.json();
        users = dataU ? Object.keys(dataU).map(id => ({ id, ...dataU[id] })) : [];
        movies = dataM ? Object.keys(dataM).map(id => ({ id, ...dataM[id] })) : [];
    } catch (e) { console.error("Error Firebase"); }
}

function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

function entrar() {
    const u = document.getElementById('log-u').value;
    const p = document.getElementById('log-p').value;
    if(users.find(x => x.u === u && x.p === p)) switchScreen('sc-main');
    else alert("PIN incorrecto");
}

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

function filtrarContenido() {
    const q = document.getElementById('search-bar').value.toLowerCase();
    if(q) {
        document.getElementById('brand-menu').classList.add('hidden');
        const filtrados = movies.filter(m => m.title.toLowerCase().includes(q));
        const grid = document.getElementById('grid');
        grid.innerHTML = filtrados.map(m => `
            <div class="movie-card" onclick="verVideo('${m.video}','${m.title}')">
                <img src="${m.poster}">
            </div>
        `).join('');
    } else { volverAMarcas(); }
}

function volverAMarcas() {
    document.getElementById('brand-menu').classList.remove('hidden');
    document.getElementById('type-selector').classList.add('hidden');
    document.getElementById('grid').innerHTML = "";
}

function verVideo(url, titulo) {
    document.getElementById('main-iframe').src = url;
    document.getElementById('now-playing').innerText = titulo;
    document.getElementById('video-player').classList.remove('hidden');
}

function cerrarPlayer() {
    document.getElementById('main-iframe').src = "";
    document.getElementById('video-player').classList.add('hidden');
}

function cerrarSesion() { location.reload(); }
function abrirAdmin() { if(prompt("PIN:") === "2026") switchScreen('sc-admin'); }

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
    cargarDatos();
}
