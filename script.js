const firebaseURL = "https://nebula-plus-app-default-rtdb.firebaseio.com/";

let users = [];
let movies = [];

// 1. CARGA INICIAL
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

        renderTablas();
    } catch (e) { console.error("Error Firebase:", e); }
}

// 2. NAVEGACIÓN
function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

function abrirAdmin() {
    const p = prompt("PIN ADMIN:");
    if(p === "2026") {
        switchScreen('sc-admin');
        renderTablas();
    }
}

function cerrarPanel() { switchScreen('sc-login'); }
function cerrarSesion() { location.reload(); }

// 3. LOGIN
function entrar() {
    const u = document.getElementById('log-u').value;
    const p = document.getElementById('log-p').value;
    const found = users.find(x => x.u === u && x.p === p);
    if(found) switchScreen('sc-main');
    else alert("Datos incorrectos");
}

// 4. GUARDAR DATOS (BOTONES CORREGIDOS)
async function guardarUser() {
    const u = document.getElementById('adm-un').value;
    const p = document.getElementById('adm-up').value;
    const d = document.getElementById('adm-ud').value;

    if(u && p) {
        await fetch(`${firebaseURL}users.json`, { 
            method: 'POST', 
            body: JSON.stringify({u, p, d}) 
        });
        alert("Usuario Creado");
        document.getElementById('adm-un').value = "";
        document.getElementById('adm-up').value = "";
        cargarDesdeFirebase();
    } else { alert("Faltan datos"); }
}

async function guardarContenido() {
    const title = document.getElementById('c-title').value;
    const poster = document.getElementById('c-post').value;
    const video = document.getElementById('c-video').value;
    const brand = document.getElementById('c-brand').value;
    const type = document.getElementById('c-type').value;

    if(title && video) {
        await fetch(`${firebaseURL}movies.json`, { 
            method: 'POST', 
            body: JSON.stringify({title, poster, video, brand, type}) 
        });
        alert("Publicado");
        document.getElementById('c-title').value = "";
        document.getElementById('c-video').value = "";
        cargarDesdeFirebase();
    } else { alert("Faltan datos"); }
}

// 5. TABLAS
function renderTablas() {
    document.getElementById('user-table').innerHTML = users.map(u => `
        <div class="table-row">
            <span>${u.u}</span>
            <span>${u.d || '--'}</span>
            <button onclick="borrar('users','${u.id}')" style="color:red; background:none; border:none;">X</button>
        </div>
    `).join('');

    document.getElementById('movie-table').innerHTML = movies.map(m => `
        <div class="table-row">
            <span>${m.title}</span>
            <span>${m.brand}</span>
            <button onclick="borrar('movies','${m.id}')" style="color:red; background:none; border:none;">X</button>
        </div>
    `).join('');
}

async function borrar(path, id) {
    if(confirm("¿Eliminar?")) {
        await fetch(`${firebaseURL}${path}/${id}.json`, { method: 'DELETE' });
        cargarDesdeFirebase();
    }
}
