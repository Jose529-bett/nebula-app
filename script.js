const firebaseURL = "TU_URL_DE_FIREBASE_AQUI/"; // <--- ¡IMPORTANTE!
let users = [], movies = [], marcaActual = "";

// 1. INICIO Y CARGA
window.onload = async () => {
    await cargarDesdeFirebase();
    // Forzar desaparición de intro tras 3 segundos
    setTimeout(() => {
        const intro = document.getElementById('intro-screen');
        if(intro) intro.style.display = 'none';
    }, 3000);
};

async function cargarDesdeFirebase() {
    try {
        const resU = await fetch(`${firebaseURL}users.json`);
        const resM = await fetch(`${firebaseURL}movies.json`);
        const dataU = await resU.json();
        const dataM = await resM.json();

        users = dataU ? Object.keys(dataU).map(id => ({ id, ...dataU[id] })) : [];
        movies = dataM ? Object.keys(dataM).map(id => ({ id, ...dataM[id] })) : [];
        renderTablas();
    } catch (e) { console.error("Error cargando datos"); }
}

// 2. NAVEGACIÓN ENTRE PANTALLAS
function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

function abrirAdmin() {
    if(prompt("PIN ADMIN:") === "2026") switchScreen('sc-admin');
}

function entrar() {
    const u = document.getElementById('log-u').value;
    const p = document.getElementById('log-p').value;
    const encontrado = users.find(x => x.u === u && x.p === p);
    if(encontrado) switchScreen('sc-main');
    else alert("Usuario o PIN incorrecto");
}

function cerrarSesion() { location.reload(); }

// 3. FILTRADO POR MARCA Y TIPO
function seleccionarMarca(marca) {
    marcaActual = marca;
    document.getElementById('brand-menu').classList.add('hidden');
    document.getElementById('type-selector').classList.remove('hidden');
    document.getElementById('grid').innerHTML = "";
}

function filtrarTipo(tipo) {
    const filtrados = movies.filter(m => m.brand === marcaActual && m.type === tipo);
    renderGrid(filtrados);
}

function volverAMarcas() {
    document.getElementById('brand-menu').classList.remove('hidden');
    document.getElementById('type-selector').classList.add('hidden');
    document.getElementById('grid').innerHTML = "";
}

function filtrarContenido() {
    const busq = document.getElementById('search-bar').value.toLowerCase();
    if(busq) {
        document.getElementById('brand-menu').classList.add('hidden');
        renderGrid(movies.filter(m => m.title.toLowerCase().includes(busq)));
    } else { volverAMarcas(); }
}

function renderGrid(lista) {
    const grid = document.getElementById('grid');
    grid.innerHTML = lista.map(m => `
        <div class="movie-card" onclick="verVideo('${m.video}', '${m.title}')">
            <img src="${m.poster}" onerror="this.src='https://via.placeholder.com/150x225?text=No+Image'">
        </div>
    `).join('');
}

// 4. REPRODUCTOR
function verVideo(url, titulo) {
    document.getElementById('now-playing').innerText = titulo;
    document.getElementById('main-iframe').src = url;
    document.getElementById('video-player').classList.remove('hidden');
}

function cerrarPlayer() {
    document.getElementById('main-iframe').src = "";
    document.getElementById('video-player').classList.add('hidden');
}

// 5. ADMIN ACTIONS (GUARDAR)
async function guardarUser() {
    const u = document.getElementById('adm-un').value;
    const p = document.getElementById('adm-up').value;
    const d = document.getElementById('adm-ud').value;
    await fetch(`${firebaseURL}users.json`, { method: 'POST', body: JSON.stringify({u,p,d}) });
    cargarDesdeFirebase();
}

async function guardarContenido() {
    const title = document.getElementById('c-title').value;
    const poster = document.getElementById('c-post').value;
    const video = document.getElementById('c-video').value;
    const brand = document.getElementById('c-brand-sel').value;
    const type = document.getElementById('c-type-sel').value;
    await fetch(`${firebaseURL}movies.json`, { method: 'POST', body: JSON.stringify({title, poster, video, brand, type}) });
    cargarDesdeFirebase();
}

function renderTablas() {
    // Aquí puedes poner el código de mapeo de tablas que teníamos antes
    // Para no saturar, simplifica el render de las listas aquí.
}
