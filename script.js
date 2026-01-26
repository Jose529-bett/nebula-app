import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = { databaseURL: "https://nebula-plus-app-default-rtdb.firebaseio.com/" };
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let users = [];
let movies = [];
let currentBrand = 'disney';
let currentType = 'pelicula';

// --- TIEMPO REAL ---
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

// --- USUARIOS ---
window.guardarUser = function() {
    const u = document.getElementById('adm-un').value;
    const p = document.getElementById('adm-up').value;
    const d = document.getElementById('adm-ud').value;
    if(u && p && d) {
        push(ref(db, 'users'), { u, p, d }).then(() => {
            alert("Usuario Guardado");
            document.getElementById('adm-un').value = "";
            document.getElementById('adm-up').value = "";
        });
    }
};

window.borrarUser = function(id) { if(confirm("¿Eliminar?")) remove(ref(db, `users/${id}`)); };

function renderUserTable() {
    const table = document.getElementById('user-list');
    if(!table) return;
    let h = `<tr><th>Usuario</th><th>Vence</th><th>X</th></tr>`;
    users.forEach(u => {
        h += `<tr><td>${u.u}</td><td>${u.d}</td><td><button onclick="borrarUser('${u.id}')">✖</button></td></tr>`;
    });
    table.innerHTML = h;
}

// --- ACCESO ---
window.entrar = function() {
    const u = document.getElementById('log-u').value;
    const p = document.getElementById('log-p').value;
    if(u === "admin" && p === "2026") { switchScreen('sc-main'); return; }
    const user = users.find(x => x.u === u && x.p === p);
    if(user) {
        if(new Date().toISOString().split('T')[0] > user.d) return alert("Cuenta expirada");
        document.getElementById('u-name').innerText = "Hola, " + u;
        switchScreen('sc-main');
    } else { alert("Denegado"); }
};

window.abrirAdmin = function() {
    if(prompt("CLAVE:") === "2026") switchScreen('sc-admin');
};

function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

// --- CONTENIDO (CON CUADROS IDENTIFICADORES) ---
window.guardarContenido = function() {
    const title = document.getElementById('c-title').value;
    const poster = document.getElementById('c-post').value;
    const video = document.getElementById('c-video').value;
    const brand = document.getElementById('c-brand').value;
    const type = document.getElementById('c-type').value;

    if(title && poster && video) {
        push(ref(db, 'movies'), {title, poster, video, brand, type})
        .then(() => {
            alert("Publicado como: " + type.toUpperCase());
            document.getElementById('c-title').value = "";
            document.getElementById('c-post').value = "";
            document.getElementById('c-video').value = "";
        });
    }
};

window.borrarMovie = function(id) { if(confirm("¿Eliminar?")) remove(ref(db, `movies/${id}`)); };

function renderMovieTable() {
    const table = document.getElementById('movie-list');
    if(!table) return;
    let h = `<tr><th>Título</th><th>Identificador</th><th>X</th></tr>`;
    movies.forEach(m => {
        const badge = m.type === 'pelicula' ? '<span class="badge-peli">PELÍCULA</span>' : '<span class="badge-serie">SERIE</span>';
        h += `<tr><td>${m.title}</td><td>${badge}</td><td><button onclick="borrarMovie('${m.id}')">✖</button></td></tr>`;
    });
    table.innerHTML = h;
}

// --- VISTA Y FILTROS ---
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

// --- REPRODUCTOR (EL CEREBRO QUE SEPARA) ---
window.reproducir = function(url, titulo) {
    const frame = document.getElementById('main-iframe');
    const playerTitle = document.getElementById('player-title');
    const status = document.getElementById('player-status');
    
    frame.src = ""; 
    playerTitle.innerHTML = titulo; 

    // Si tiene comas o barras, genera episodios. Si no, carga directo.
    if (url.includes(',') || url.includes('|')) {
        const temporadas = url.split('|');
        status.innerText = "Selecciona Episodio";
        let htmlSeries = `<div style="max-height: 250px; overflow-y: auto; margin-top: 15px;">`;
        temporadas.forEach((temp, tIndex) => {
            const capitulos = temp.split(',');
            htmlSeries += `<h4 style="color:var(--blue); margin: 15px 0 5px 0;">Temporada ${tIndex + 1}</h4><div class="lista-episodios">`;
            capitulos.forEach((link, eIndex) => {
                htmlSeries += `<button class="btn-ep" onclick="cargarVideo('${link.trim()}', 'T${tIndex + 1}-E${eIndex + 1}')">▶ EP. ${eIndex + 1}</button>`;
            });
            htmlSeries += `</div>`;
        });
        playerTitle.innerHTML = titulo + htmlSeries + `</div>`;
    } else {
        frame.src = url;
        status.innerText = "Reproduciendo Película";
    }
    document.getElementById('video-player').classList.remove('hidden');
};

window.cargarVideo = function(link, info) {
    document.getElementById('main-iframe').src = link;
    document.getElementById('player-status').innerText = "Viendo: " + info;
};

window.cerrarReproductor = function() {
    document.getElementById('main-iframe').src = "";
    document.getElementById('video-player').classList.add('hidden');
    document.body.style.overflow = 'auto';
};

window.cerrarSesion = function() { location.reload(); };
window.toggleMenu = function() { document.getElementById('drop-menu').classList.toggle('hidden'); };
