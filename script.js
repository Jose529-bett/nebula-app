import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = { databaseURL: "https://nebula-plus-app-default-rtdb.firebaseio.com/" };
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let movies = [];
let users = [];
let currentBrand = 'disney';
let currentType = 'pelicula';
let datosSerieActual = [];

// SYNC FIREBASE
onValue(ref(db, 'movies'), (s) => {
    const d = s.val();
    movies = d ? Object.keys(d).map(k => ({...d[k], id: k})) : [];
    actualizarVista();
    renderMovieTable();
});

onValue(ref(db, 'users'), (s) => {
    const d = s.val();
    users = d ? Object.keys(d).map(k => ({...d[k], id: k})) : [];
    renderUserTable();
});

// NAVEGACIÓN Y LOGIN
window.entrar = function() {
    const u = document.getElementById('log-u').value;
    const p = document.getElementById('log-p').value;
    if(u === "admin" && p === "2026") return switchScreen('sc-main');
    const user = users.find(x => x.u === u && x.p === p);
    if(user) {
        const hoy = new Date().toISOString().split('T')[0];
        if(hoy > user.d) return alert("Cuenta vencida");
        document.getElementById('u-name').innerText = u;
        switchScreen('sc-main');
    } else { alert("Error de credenciales"); }
};

window.switchScreen = function(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
};

// CERRAR REPRODUCTOR (LIMPIA VIDEO Y ACTIVA SCROLL)
window.cerrarReproductor = function() {
    document.getElementById('main-iframe').src = "";
    document.getElementById('video-player').classList.add('hidden');
    document.body.style.overflow = 'auto'; 
};

// ABRIR REPRODUCTOR
window.reproducir = function(id) {
    const item = movies.find(m => m.id === id);
    if(!item) return;

    document.getElementById('player-title').innerText = item.title;
    document.body.style.overflow = 'hidden'; 

    if(item.type === "serie") {
        document.getElementById('serie-controls').classList.remove('hidden');
        const temporadas = item.video.split('|');
        datosSerieActual = temporadas.map(t => t.split(','));
        const selector = document.getElementById('season-selector');
        selector.innerHTML = datosSerieActual.map((_, i) => `<option value="${i}">Temporada ${i+1}</option>`).join('');
        cargarTemporada(0);
    } else {
        document.getElementById('serie-controls').classList.add('hidden');
        document.getElementById('main-iframe').src = item.video;
    }
    document.getElementById('video-player').classList.remove('hidden');
};

window.cargarTemporada = function(idx) {
    const capitulos = datosSerieActual[idx];
    document.getElementById('episodes-grid').innerHTML = capitulos.map((link, i) => 
        `<button class="btn-ep" onclick="document.getElementById('main-iframe').src='${link.trim()}'">EP. ${i+1}</button>`
    ).join('');
    document.getElementById('main-iframe').src = capitulos[0].trim();
};

// GESTIÓN ADMIN
window.guardarContenido = function() {
    const title = document.getElementById('c-title').value;
    const poster = document.getElementById('c-post').value;
    const video = document.getElementById('c-video').value;
    const brand = document.getElementById('c-brand').value;
    const type = document.getElementById('c-type').value;
    if(title && poster && video) push(ref(db, 'movies'), {title, poster, video, brand, type});
};

function renderMovieTable() {
    let h = `<tr><th>Título</th><th>Tipo</th><th>X</th></tr>`;
    movies.forEach(m => {
        h += `<tr><td>${m.title}</td><td><span class="badge-peli">${m.type}</span></td><td><button onclick="remove(ref(db, 'movies/${m.id}'))">✖</button></td></tr>`;
    });
    document.getElementById('movie-list').innerHTML = h;
}

window.actualizarVista = function() {
    const grid = document.getElementById('grid');
    if(!grid) return;
    const fil = movies.filter(m => m.brand === currentBrand && m.type === currentType);
    grid.innerHTML = fil.map(m => `<div class="poster" style="background-image:url('${m.poster}')" onclick="reproducir('${m.id}')"></div>`).join('');
};

window.seleccionarMarca = (b) => { currentBrand = b; actualizarVista(); };
window.cambiarTipo = (t) => { currentType = t; actualizarVista(); };
window.abrirAdmin = () => { if(prompt("CLAVE:") === "2026") switchScreen('sc-admin'); };
window.cerrarSesion = () => location.reload();
