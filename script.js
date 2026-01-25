import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = { databaseURL: "https://nebula-plus-app-default-rtdb.firebaseio.com/" };
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let users = [];
let movies = [];
let currentBrand = 'disney';
let currentType = 'pelicula';

// --- SYNC EN TIEMPO REAL ---
onValue(ref(db, 'users'), (s) => {
    const d = s.val();
    users = d ? Object.keys(d).map(k => ({...d[k], id: k})) : [];
    if(document.getElementById('user-list')) renderUserTable();
});

onValue(ref(db, 'movies'), (s) => {
    const d = s.val();
    movies = d ? Object.keys(d).map(k => ({...d[k], id: k})) : [];
    actualizarVista(); // Esto hace que se refleje en todos los dispositivos al instante
    if(document.getElementById('movie-list')) renderMovieTable();
});

// --- ACCESO ---
window.entrar = function() {
    const u = document.getElementById('log-u').value;
    const p = document.getElementById('log-p').value;
    if(u === "admin" && p === "2026") { switchScreen('sc-main'); return; }
    const user = users.find(x => x.u === u && x.p === p);
    if(user) {
        if(new Date().toISOString().split('T')[0] > user.d) return alert("Expirado");
        switchScreen('sc-main');
    } else { alert("Error de acceso"); }
};

window.abrirAdmin = function() { if(prompt("CLAVE:") === "2026") switchScreen('sc-admin'); };

function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

// --- GESTIÓN ---
window.guardarContenido = function() {
    const title = document.getElementById('c-title').value;
    const poster = document.getElementById('c-post').value;
    const video = document.getElementById('c-video').value; // Aquí pones links separados por coma para series
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

// --- VISTA DINÁMICA ---
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

// --- REPRODUCTOR CON CAPÍTULOS ESTILO DISNEY+ ---
window.reproducir = function(url, titulo) {
    const frame = document.getElementById('main-iframe');
    const playerTitle = document.getElementById('player-title');
    const status = document.getElementById('player-status');
    
    // Si la URL tiene comas, es una serie
    if (url.includes(',')) {
        const capitulos = url.split(',');
        status.innerText = "Selecciona un episodio";
        playerTitle.innerHTML = `${titulo} <div class="lista-episodios">` + 
            capitulos.map((link, i) => `
                <button class="btn-ep" onclick="cargarVideo('${link.trim()}', ${i+1})">
                    <span>▶</span> EP. ${i+1}
                </button>
            `).join('') + `</div>`;
        frame.src = ""; // Espera a que elijan
    } else {
        frame.src = url;
        playerTitle.innerText = titulo;
        status.innerText = "Reproduciendo Película";
    }

    document.getElementById('video-player').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
};

window.cargarVideo = function(link, num) {
    document.getElementById('main-iframe').src = link;
    document.getElementById('player-status').innerText = "Viendo Episodio " + num;
};

window.cerrarReproductor = function() {
    document.getElementById('main-iframe').src = "";
    document.getElementById('video-player').classList.add('hidden');
    document.body.style.overflow = 'auto';
};

// --- TABLAS Y OTROS ---
function renderMovieTable() {
    let h = `<tr><th>Título</th><th>X</th></tr>`;
    movies.forEach(m => h += `<tr><td>${m.title}</td><td><button onclick="borrarMovie('${m.id}')">✖</button></td></tr>`);
    document.getElementById('movie-list').innerHTML = h;
}
window.cerrarSesion = function() { location.reload(); };
window.toggleMenu = function() { document.getElementById('drop-menu').classList.toggle('hidden'); };
