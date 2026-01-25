import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = { databaseURL: "https://nebula-plus-app-default-rtdb.firebaseio.com/" };
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let users = [];
let movies = [];
let currentBrand = 'disney';
let currentType = 'pelicula';

// --- SINCRONIZACIÓN EN TIEMPO REAL ---
onValue(ref(db, 'users'), (s) => {
    const d = s.val();
    users = d ? Object.keys(d).map(k => ({...d[k], id: k})) : [];
    renderUserTable();
});

onValue(ref(db, 'movies'), (s) => {
    const d = s.val();
    movies = d ? Object.keys(d).map(k => ({...d[k], id: k})) : [];
    actualizarVista();
    renderMovieTable();
});

// --- GESTIÓN DE USUARIOS (CORREGIDO Y EXPUESTO AL WINDOW) ---
window.guardarUser = function() {
    console.log("Intentando guardar usuario..."); // Esto aparecerá en la consola para saber si funciona
    const u = document.getElementById('adm-un').value;
    const p = document.getElementById('adm-up').value;
    const d = document.getElementById('adm-ud').value;

    if(u && p && d) {
        push(ref(db, 'users'), { u, p, d })
        .then(() => {
            alert("Usuario guardado correctamente");
            document.getElementById('adm-un').value = "";
            document.getElementById('adm-up').value = "";
            document.getElementById('adm-ud').value = "";
        })
        .catch((error) => {
            alert("Error de Firebase: " + error.message);
        });
    } else {
        alert("Por favor, completa todos los campos del usuario (Nombre, PIN y Fecha)");
    }
};

window.borrarUser = function(id) { 
    if(confirm("¿Eliminar usuario?")) remove(ref(db, `users/${id}`)); 
};

function renderUserTable() {
    let h = `<tr><th>Usuario</th><th>Vence</th><th>X</th></tr>`;
    users.forEach(u => {
        h += `<tr><td>${u.u}</td><td>${u.d}</td><td><button onclick="borrarUser('${u.id}')">✖</button></td></tr>`;
    });
    const table = document.getElementById('user-list');
    if(table) table.innerHTML = h;
}

// --- SISTEMA DE ACCESO ---
window.entrar = function() {
    const u = document.getElementById('log-u').value;
    const p = document.getElementById('log-p').value;
    if(u === "admin" && p === "2026") { switchScreen('sc-main'); return; }
    const user = users.find(x => x.u === u && x.p === p);
    if(user) {
        if(new Date().toISOString().split('T')[0] > user.d) return alert("Cuenta expirada");
        switchScreen('sc-main');
    } else { alert("Acceso denegado"); }
};

window.abrirAdmin = function() {
    if(prompt("CLAVE MAESTRA:") === "2026") switchScreen('sc-admin');
};

function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

// --- GESTIÓN CONTENIDO ---
window.guardarContenido = function() {
    const title = document.getElementById('c-title').value;
    const poster = document.getElementById('c-post').value;
    const video = document.getElementById('c-video').value;
    const brand = document.getElementById('c-brand').value;
    const type = document.getElementById('c-type').value;

    if(title && poster && video) {
        push(ref(db, 'movies'), {title, poster, video, brand, type});
        document.getElementById('c-title').value = "";
        document.getElementById('c-post').value = "";
        document.getElementById('c-video').value = "";
    }
};

window.borrarMovie = function(id) { if(confirm("¿Eliminar?")) remove(ref(db, `movies/${id}`)); };

function renderMovieTable() {
    let h = `<tr><th>Título</th><th>X</th></tr>`;
    movies.forEach(m => h += `<tr><td>${m.title}</td><td><button onclick="borrarMovie('${m.id}')">✖</button></td></tr>`);
    const table = document.getElementById('movie-list');
    if(table) table.innerHTML = h;
}

// --- MOTOR DE VISTA ---
window.seleccionarMarca = function(b) { currentBrand = b; actualizarVista(); };
window.cambiarTipo = function(t) {
    currentType = t;
    document.getElementById('t-peli').className = t === 'pelicula' ? 'active' : '';
    document.getElementById('t-serie').className = t === 'serie' ? 'active' : '';
    actualizarVista();
};

function actualizarVista() {
    const grid = document.getElementById('grid');
    if(!grid) return;
    document.getElementById('cat-title').innerText = `${currentBrand.toUpperCase()} > ${currentType.toUpperCase()}`;
    const fil = movies.filter(m => m.brand === currentBrand && m.type === currentType);
    grid.innerHTML = fil.map(m => `<div class="poster" style="background-image:url('${m.poster}')" onclick="reproducir('${m.video}', '${m.title}')"></div>`).join('');
}

// --- REPRODUCTOR ---
window.reproducir = function(url, titulo) {
    const frame = document.getElementById('main-iframe');
    const playerTitle = document.getElementById('player-title');
    if (url.includes(',')) {
        const caps = url.split(',');
        playerTitle.innerHTML = `${titulo} <div class="lista-episodios">` + 
            caps.map((l, i) => `<button class="btn-ep" onclick="cargarVideo('${l.trim()}', ${i+1})">▶ EP. ${i+1}</button>`).join('') + `</div>`;
        frame.src = "";
    } else {
        frame.src = url;
        playerTitle.innerText = titulo;
    }
    document.getElementById('video-player').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
};

window.cargarVideo = function(l, n) {
    document.getElementById('main-iframe').src = l;
    document.getElementById('player-status').innerText = "Episodio " + n;
};

window.cerrarReproductor = function() {
    document.getElementById('main-iframe').src = "";
    document.getElementById('video-player').classList.add('hidden');
    document.body.style.overflow = 'auto';
};

window.cerrarSesion = function() { location.reload(); };
window.toggleMenu = function() { document.getElementById('drop-menu').classList.toggle('hidden'); };
