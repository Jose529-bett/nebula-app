import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = { databaseURL: "https://nebula-plus-app-default-rtdb.firebaseio.com/" };
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let users = [];
let movies = [];
let currentBrand = 'disney';
let currentType = 'pelicula';

// --- SYNC FIREBASE ---
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

// --- SISTEMA DE ACCESO ---
window.entrar = function() {
    const u = document.getElementById('log-u').value;
    const p = document.getElementById('log-p').value;
    
    if(u === "admin" && p === "2026") {
        document.getElementById('u-name').innerText = "Admin Nebula+";
        switchScreen('sc-main');
        return;
    }

    const user = users.find(x => x.u === u && x.p === p);
    if(user) {
        const hoy = new Date().toISOString().split('T')[0];
        if(hoy > user.d) return alert("Cuenta expirada. Contacte soporte.");
        document.getElementById('u-name').innerText = "Hola, " + u;
        switchScreen('sc-main');
    } else { alert("Usuario o PIN incorrectos"); }
};

window.abrirAdmin = function() {
    if(prompt("CLAVE MAESTRA:") === "2026") switchScreen('sc-admin');
};

function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

window.cerrarSesion = function() { location.reload(); };

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

window.guardarUser = function() {
    const u = document.getElementById('adm-un').value;
    const p = document.getElementById('adm-up').value;
    const d = document.getElementById('adm-ud').value;
    if(u && p && d) push(ref(db, 'users'), {u, p, d});
};

window.borrarUser = function(id) { remove(ref(db, `users/${id}`)); };

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

window.buscar = function() {
    const q = document.getElementById('search-box').value.toLowerCase();
    const fil = movies.filter(m => m.title.toLowerCase().includes(q));
    document.getElementById('grid').innerHTML = fil.map(m => `<div class="poster" style="background-image:url('${m.poster}')" onclick="reproducir('${m.video}', '${m.title}')"></div>`).join('');
};

// --- REPRODUCTOR PRO ---
window.reproducir = function(url, titulo) {
    const frame = document.getElementById('main-iframe');
    frame.src = url;
    document.getElementById('player-title').innerText = titulo;
    document.getElementById('video-player').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
};

window.cerrarReproductor = function() {
    document.getElementById('main-iframe').src = "";
    document.getElementById('video-player').classList.add('hidden');
    document.body.style.overflow = 'auto';
};

// --- TABLES ---
function renderMovieTable() {
    let h = `<tr><th>Título</th><th>X</th></tr>`;
    movies.forEach(m => h += `<tr><td>${m.title}</td><td><button onclick="borrarMovie('${m.id}')">✖</button></td></tr>`);
    document.getElementById('movie-list').innerHTML = h;
}
function renderUserTable() {
    let h = `<tr><th>Usuario</th><th>Vence</th><th>X</th></tr>`;
    users.forEach(u => h += `<tr><td>${u.u}</td><td>${u.d}</td><td><button onclick="borrarUser('${u.id}')">✖</button></td></tr>`);
    document.getElementById('user-list').innerHTML = h;
}
window.toggleMenu = function() { document.getElementById('drop-menu').classList.toggle('hidden'); };
