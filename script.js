import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, push, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = { databaseURL: "https://nebula-plus-app-default-rtdb.firebaseio.com/" };
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let movies = [];
let currentBrand = 'disney';
let currentType = 'pelicula';
let datosSerie = [];

// BOTÓN SECRETO ADMIN
window.abrirAdmin = function() {
    if(prompt("CLAVE ADMIN:") === "2026") switchScreen('sc-admin');
};

window.cerrarReproductor = function() {
    document.getElementById('main-iframe').src = "";
    document.getElementById('video-player').classList.add('hidden');
    document.body.style.overflow = 'auto';
};

window.reproducir = function(id) {
    const m = movies.find(x => x.id === id);
    document.getElementById('player-title').innerText = m.title;
    document.body.style.overflow = 'hidden'; 

    if(m.type === "serie") {
        document.getElementById('serie-controls').classList.remove('hidden');
        datosSerie = m.video.split('|').map(t => t.split(','));
        const sel = document.getElementById('season-selector');
        sel.innerHTML = datosSerie.map((_, i) => `<option value="${i}">Temporada ${i+1}</option>`).join('');
        cargarTemporada(0);
    } else {
        document.getElementById('serie-controls').classList.add('hidden');
        document.getElementById('main-iframe').src = m.video;
    }
    document.getElementById('video-player').classList.remove('hidden');
};

window.cargarTemporada = function(idx) {
    const eps = datosSerie[idx];
    document.getElementById('episodes-grid').innerHTML = eps.map((link, i) => 
        `<button class="btn-ep" onclick="document.getElementById('main-iframe').src='${link.trim()}'">EP. ${i+1}</button>`
    ).join('');
    document.getElementById('main-iframe').src = eps[0].trim();
};

// --- RESTO DE FUNCIONES (LOGIC) ---
onValue(ref(db, 'movies'), (s) => {
    const d = s.val();
    movies = d ? Object.keys(d).map(k => ({...d[k], id: k})) : [];
    actualizarGrid();
});

window.entrar = () => switchScreen('sc-main');
window.switchScreen = (id) => {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
};
window.seleccionarMarca = (m) => { currentBrand = m; actualizarGrid(); };
window.cambiarTipo = (t) => { currentType = t; actualizarGrid(); };

function actualizarGrid() {
    const g = document.getElementById('grid');
    const f = movies.filter(m => m.brand === currentBrand && m.type === currentType);
    g.innerHTML = f.map(m => `<div class="poster" style="background-image:url('${m.poster}')" onclick="reproducir('${m.id}')"></div>`).join('');
}
