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

// ACCESO
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
    } else { alert("Error"); }
};

window.abrirAdmin = function() { if(prompt("CLAVE:") === "2026") switchScreen('sc-admin'); };

window.switchScreen = function(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
};

// GESTIÓN
window.guardarContenido = function() {
    const title = document.getElementById('c-title').value;
    const poster = document.getElementById('c-post').value;
    const video = document.getElementById('c-video').value;
    const brand = document.getElementById('c-brand').value;
    const type = document.getElementById('c-type').value;
    if(title && poster && video) {
        push(ref(db, 'movies'), {title, poster, video, brand, type});
        alert("Publicado");
    }
};

window.borrarMovie = function(id) { if(confirm("¿Borrar?")) remove(ref(db, `movies/${id}`)); };

window.guardarUser = function() {
    const u = document.getElementById('adm-un').value;
    const p = document.getElementById('adm-up').value;
    const d = document.getElementById('adm-ud').value;
    if(u && p && d) push(ref(db, 'users'), {u, p, d});
};

window.borrarUser = function(id) { remove(ref(db, `users/${id}`)); };

// REPRODUCTOR INTELIGENTE
window.reproducir = function(id) {
    const item = movies.find(m => m.id === id);
    if(!item) return;

    const frame = document.getElementById('main-iframe');
    const serieControls = document.getElementById('serie-controls');
    document.getElementById('player-title').innerText = item.title;

    if(item.type === "serie") {
        serieControls.classList.remove('hidden');
        document.getElementById('player-status').innerText = "Viendo Serie";
        const temporadas = item.video.split('|');
        datosSerieActual = temporadas.map(t => t.split(','));
        const selector = document.getElementById('season-selector');
        selector.innerHTML = datosSerieActual.map((_, i) => `<option value="${i}">Temporada ${i+1}</option>`).join('');
        cargarTemporada(0);
    } else {
        serieControls.classList.add('hidden');
        document.getElementById('player-status').innerText = "Viendo Película";
        frame.src = item.video;
    }
    document.getElementById('video-player').classList.remove('hidden');
};

window.cargarTemporada = function(idx) {
    const capitulos = datosSerieActual[idx];
    document.getElementById('episodes-grid').innerHTML = capitulos.map((link, i) => 
        `<button class="btn-ep" onclick="cambiarLink('${link.trim()}')">EP. ${i+1}</button>`
    ).join('');
    cambiarLink(capitulos[0].trim());
};

window.cambiarLink = function(url) { document.getElementById('main-iframe').src = url; };

window.cerrarReproductor = function() {
    document.getElementById('main-iframe').src = "";
    document.getElementById('video-player').classList.add('hidden');
};

// TABLAS ESTILO IMAGEN 1
function renderMovieTable() {
    let h = `<tr><th>Título</th><th>Identificador</th><th>X</th></tr>`;
    movies.forEach(m => {
        h += `<tr>
            <td>${m.title}</td>
            <td><span class="badge-peli">${m.type}</span></td>
            <td><button class="btn-del" onclick="borrarMovie('${m.id}')">✖</button></td>
        </tr>`;
    });
    document.getElementById('movie-list').innerHTML = h;
}

function renderUserTable() {
    let h = `<tr><th>Usuario</th><th>PIN</th><th>X</th></tr>`;
    users.forEach(u => {
        h += `<tr>
            <td>${u.u}</td>
            <td>${u.p}</td>
            <td><button class="btn-del" onclick="borrarUser('${u.id}')">✖</button></td>
        </tr>`;
    });
    document.getElementById('user-list').innerHTML = h;
}

// VISTA
window.seleccionarMarca = function(b) { currentBrand = b; actualizarVista(); };
window.cambiarTipo = function(t) {
    currentType = t;
    document.getElementById('t-peli').classList.toggle('active', t === 'pelicula');
    document.getElementById('t-serie').classList.toggle('active', t === 'serie');
    actualizarVista();
};

function actualizarVista() {
    const grid = document.getElementById('grid');
    if(!grid) return;
    document.getElementById('cat-title').innerText = `${currentBrand.toUpperCase()} > ${currentType.toUpperCase()}`;
    const fil = movies.filter(m => m.brand === currentBrand && m.type === currentType);
    grid.innerHTML = fil.map(m => `<div class="poster" style="background-image:url('${m.poster}')" onclick="reproducir('${m.id}')"></div>`).join('');
}

window.buscar = function() {
    const q = document.getElementById('search-box').value.toLowerCase();
    const fil = movies.filter(m => m.title.toLowerCase().includes(q));
    document.getElementById('grid').innerHTML = fil.map(m => `<div class="poster" style="background-image:url('${m.poster}')" onclick="reproducir('${m.id}')"></div>`).join('');
};

window.cerrarSesion = function() { location.reload(); };
window.toggleMenu = function() { document.getElementById('drop-menu').classList.toggle('hidden'); };
