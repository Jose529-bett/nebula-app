const firebaseConfig = { databaseURL: "https://nebula-plus-app-default-rtdb.firebaseio.com/" };
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let users = []; let movies = []; let currentBrand = 'disney'; let currentType = 'pelicula';
let datosSerieActual = []; let primeraCarga = true; let hls = null;

// SINCRONIZACIÓN FIREBASE
db.ref('users').on('value', snap => { users = snap.val() ? Object.values(snap.val()) : []; });
db.ref('movies').on('value', snap => {
    movies = []; const data = snap.val();
    if(data) { for(let id in data) { movies.push({ ...data[id], firebaseId: id }); } }
    if(primeraCarga || document.getElementById('video-player').classList.contains('hidden')) {
        actualizarVista(); primeraCarga = false;
    }
});

function entrar() {
    const u = document.getElementById('log-u').value;
    const p = document.getElementById('log-p').value;
    if(users.find(x => x.u === u && x.p === p)) { switchScreen('sc-main'); } else { alert("Error de acceso"); }
}

function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

// MOTOR HÍBRIDO (MP4 / M3U8)
function reproducir(url, titulo) {
    document.getElementById('player-title').innerText = titulo;
    document.getElementById('video-player').classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    const item = movies.find(m => m.title === titulo);
    if(item && item.type === 'serie') {
        document.getElementById('serie-controls').classList.remove('hidden');
        const temporadas = item.video.split('|');
        datosSerieActual = temporadas.map(t => t.split(','));
        document.getElementById('season-selector').innerHTML = datosSerieActual.map((_, i) => `<option value="${i}">Temp ${i+1}</option>`).join('');
        cargarTemporada(0);
    } else {
        document.getElementById('serie-controls').classList.add('hidden');
        gestionarFuenteVideo(url);
    }
}

function gestionarFuenteVideo(url) {
    const frame = document.querySelector('.video-frame');
    if(hls) { hls.destroy(); hls = null; } // Limpieza total
    frame.innerHTML = '';
    
    const u = url.trim();
    const esDirecto = u.toLowerCase().includes('.m3u8') || u.toLowerCase().includes('.mp4');

    if(esDirecto) {
        frame.innerHTML = `<video id="main-v" controls autoplay playsinline preload="auto" style="width:100%; height:100%;"></video>`;
        const video = document.getElementById('main-v');
        
        if(u.toLowerCase().includes('.m3u8') && Hls.isSupported()) {
            hls = new Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(u); hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
        } else {
            video.src = u;
            video.load(); // Acelera el inicio en MP4
        }
    } else {
        frame.innerHTML = `<iframe src="${u}" frameborder="0" allowfullscreen></iframe>`;
    }
}

function cerrarReproductor() {
    if(hls) { hls.destroy(); hls = null; }
    const frame = document.querySelector('.video-frame');
    frame.innerHTML = ''; // Esto detiene cualquier video o audio
    document.getElementById('video-player').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function cargarTemporada(i) {
    const caps = datosSerieActual[i];
    document.getElementById('episodes-grid').innerHTML = caps.map((l, n) => `<button class="btn-ep" onclick="gestionarFuenteVideo('${l.trim()}')">Cap ${n+1}</button>`).join('');
    gestionarFuenteVideo(caps[0]);
}

function actualizarVista() {
    const grid = document.getElementById('grid');
    if(!grid) return;
    const filtrados = movies.filter(m => m.brand === currentBrand && m.type === currentType);
    grid.innerHTML = filtrados.map(m => `<div class="poster" style="background-image:url('${m.poster}')" onclick="reproducir('${m.video}', '${m.title}')"></div>`).join('');
}

function seleccionarMarca(b) { currentBrand = b; actualizarVista(); }
function cambiarTipo(t) { currentType = t; actualizarVista(); }
function cerrarSesion() { switchScreen('sc-login'); }
function abrirAdmin() { if(prompt("Acceso:")==="2026") switchScreen('sc-admin'); }
