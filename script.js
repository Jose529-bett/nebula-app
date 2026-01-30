// CONFIGURACIÓN DE TU FIREBASE
const firebaseConfig = { databaseURL: "https://nebula-plus-app-default-rtdb.firebaseio.com/" };
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let users = []; let movies = []; let currentBrand = 'disney'; let currentType = 'pelicula';
let datosSerieActual = []; let primeraCarga = true; let hlsInstance = null;

// ESCUCHADORES FIREBASE
db.ref('users').on('value', snap => {
    const data = snap.val();
    users = data ? Object.values(data) : [{u:'admin', p:'1234', d:'2026-12-31'}];
    renderUserTable();
});

db.ref('movies').on('value', snap => {
    const data = snap.val();
    movies = [];
    if(data) { for(let id in data) { movies.push({ ...data[id], firebaseId: id }); } }
    if(primeraCarga || document.getElementById('video-player').classList.contains('hidden')) {
        actualizarVista(); renderMovieTable(); primeraCarga = false;
    }
});

// SESIÓN
function entrar() {
    const u = document.getElementById('log-u').value;
    const p = document.getElementById('log-p').value;
    const user = users.find(x => x.u === u && x.p === p);
    if(user) {
        document.getElementById('u-name').innerText = "Perfil: " + u;
        switchScreen('sc-main'); actualizarVista();
    } else { alert("Acceso denegado"); }
}

function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

function cerrarSesion() { document.getElementById('drop-menu').classList.add('hidden'); switchScreen('sc-login'); }
function toggleMenu() { document.getElementById('drop-menu').classList.toggle('hidden'); }

// REPRODUCTOR ESTILO GOOGLE (Sin botón de descarga)
function reproducir(cadenaVideo, titulo) {
    const player = document.getElementById('video-player');
    document.getElementById('player-title').innerText = titulo;
    player.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    const item = movies.find(m => m.title === titulo && m.video === cadenaVideo);
    if(item && item.type === 'serie') {
        document.getElementById('serie-controls').classList.remove('hidden');
        const temporadas = item.video.split('|');
        datosSerieActual = temporadas.map(t => t.split(','));
        document.getElementById('season-selector').innerHTML = datosSerieActual.map((_, i) => `<option value="${i}">Temporada ${i+1}</option>`).join('');
        cargarTemporada(0);
    } else {
        document.getElementById('serie-controls').classList.add('hidden');
        gestionarFuenteVideo(cadenaVideo);
    }
}

function gestionarFuenteVideo(url) {
    const videoFrame = document.querySelector('.video-frame');
    if(hlsInstance) { hlsInstance.destroy(); hlsInstance = null; }
    videoFrame.innerHTML = ''; 
    const urlLimpia = url.trim();
    const esVideoDirecto = urlLimpia.toLowerCase().includes('.m3u8') || urlLimpia.toLowerCase().includes('.mp4');

    if (esVideoDirecto) {
        // Estructura idéntica al reproductor de Google pero con bloqueo de descarga
        // Usamos preload="metadata" para que el botón de Play sea el que mande la orden de carga
        videoFrame.innerHTML = `<video id="main-v" controls playsinline preload="metadata" 
                                controlsList="nodownload" oncontextmenu="return false;"
                                style="width:100%; height:100%; background:#000;"></video>`;
        const video = document.getElementById('main-v');
        
        if (urlLimpia.toLowerCase().includes('.m3u8') && Hls.isSupported()) {
            hlsInstance = new Hls({ capLevelToPlayerSize: true, autoStartLoad: true });
            hlsInstance.loadSource(urlLimpia);
            hlsInstance.attachMedia(video);
        } else { 
            video.src = urlLimpia; 
        }
        
        // Al usar preload="metadata", el botón de Play funcionará de forma nativa y rápida
    } else {
        videoFrame.innerHTML = `<iframe src="${urlLimpia}" frameborder="0" allowfullscreen 
                                oncontextmenu="return false;"
                                style="width:100%; height:100%;"></iframe>`;
    }
}

function cargarTemporada(idx) {
    const grid = document.getElementById('episodes-grid');
    const capitulos = datosSerieActual[idx];
    grid.innerHTML = capitulos.map((link, i) => `<button class="btn-ep" onclick="gestionarFuenteVideo('${link.trim()}')">EP. ${i+1}</button>`).join('');
    gestionarFuenteVideo(capitulos[0].trim());
}

function cerrarReproductor() {
    if(hlsInstance) { hlsInstance.destroy(); hlsInstance = null; }
    document.querySelector('.video-frame').innerHTML = '';
    document.getElementById('video-player').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// ADMINISTRACIÓN Y VISTAS
function abrirAdmin() { if(prompt("CÓDIGO:") === "2026") { switchScreen('sc-admin'); renderUserTable(); renderMovieTable(); } }
function guardarContenido() {
    const title = document.getElementById('c-title').value;
    const poster = document.getElementById('c-post').value;
    const video = document.getElementById('c-video').value;
    const brand = document.getElementById('c-brand').value;
    const type = document.getElementById('c-type').value;
    if(title && poster && video) {
        db.ref('movies').push({title, poster, video, brand, type});
        alert("Publicado");
    }
}

function borrarMovie(id) { if(confirm("¿Borrar?")) db.ref('movies/' + id).remove(); }
function seleccionarMarca(b) { currentBrand = b; actualizarVista(); }
function cambiarTipo(t) { currentType = t; actualizarVista(); }

function actualizarVista() {
    const grid = document.getElementById('grid');
    if(!grid) return;
    document.getElementById('cat-title').innerText = currentBrand.toUpperCase() + " > " + currentType.toUpperCase();
    const filtrados = movies.filter(m => m.brand === currentBrand && m.type === currentType);
    grid.innerHTML = filtrados.map(m => `<div class="poster" style="background-image:url('${m.poster}')" onclick="reproducir('${m.video}', '${m.title}')"></div>`).join('');
}

function renderMovieTable() {
    const table = document.getElementById('movie-list');
    let html = `<tr><th>Título</th><th>Acción</th></tr>`;
    movies.forEach(m => { html += `<tr><td>${m.title}</td><td><button onclick="borrarMovie('${m.firebaseId}')" style="color:red">Borrar</button></td></tr>`; });
    table.innerHTML = html;
}

function renderUserTable() {
    const table = document.getElementById('user-list');
    let html = `<tr><th>Usuario</th><th>Acción</th></tr>`;
    users.forEach(u => { html += `<tr><td>${u.u}</td><td><button onclick="borrarUser('${u.u}')" style="color:red">Eliminar</button></td></tr>`; });
    table.innerHTML = html;
}
function buscar() {
    const q = document.getElementById('search-box').value.toLowerCase();
    const filtered = movies.filter(m => m.title.toLowerCase().includes(q));
    document.getElementById('grid').innerHTML = filtered.map(m => `<div class="poster" style="background-image:url('${m.poster}')" onclick="reproducir('${m.video}', '${m.title}')"></div>`).join('');
}
