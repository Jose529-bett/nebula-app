const firebaseURL = "https://nebula-plus-app-default-rtdb.firebaseio.com/";

let users = [];
let movies = [];
let currentBrand = 'disney';
let currentType = 'pelicula';

// INICIO
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('intro-screen').classList.add('fade-out');
        cargarDesdeFirebase();
    }, 3000);
});

// CARGAR DATOS
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
    } catch (e) { console.error("Error conectando a Firebase"); }
}

// LOGIN
function entrar() {
    const u = document.getElementById('log-u').value;
    const p = document.getElementById('log-p').value;
    const encontrado = users.find(x => x.u === u && x.p === p);
    if(encontrado) {
        switchScreen('sc-main');
    } else { alert("PIN Incorrecto"); }
}

// GUARDAR EN FIREBASE
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

    if(title && poster && video) {
        await fetch(`${firebaseURL}movies.json`, { method: 'POST', body: JSON.stringify({title, poster, video, brand, type}) });
        cargarDesdeFirebase();
        alert("¡Contenido Subido!");
    }
}

// FUNCIONES DE VISTA
function seleccionarMarca(m) { currentBrand = m; actualizarVista(); }
function cambiarTipo(t) { currentType = t; actualizarVista(); }

function actualizarVista() {
    const grid = document.getElementById('grid');
    if(!grid) return;
    const filtrados = movies.filter(m => m.brand === currentBrand && m.type === currentType);
    grid.innerHTML = filtrados.map(m => `
        <div class="poster" style="background-image:url('${m.poster}')" onclick="reproducir('${m.video}')"></div>
    `).join('');
}

function reproducir(url) {
    document.getElementById('main-iframe').src = url;
    document.getElementById('video-player').classList.remove('hidden');
}

function cerrarReproductor() {
    document.getElementById('main-iframe').src = "";
    document.getElementById('video-player').classList.add('hidden');
}

function abrirAdmin() {
    if(prompt("CLAVE ADMIN:") === "2026") switchScreen('sc-admin');
}

function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

function renderTablas() {
    document.getElementById('user-list').innerHTML = users.map(u => `<tr><td>${u.u}</td></tr>`).join('');
    document.getElementById('movie-list').innerHTML = movies.map(m => `<tr><td>${m.title}</td></tr>`).join('');
}

function cerrarSesion() { window.location.reload(); }
