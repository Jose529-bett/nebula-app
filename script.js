// CONFIGURACIÓN DE TU FIREBASE (Nebula+)
const firebaseConfig = {
    databaseURL: "https://nebula-plus-app-default-rtdb.firebaseio.com/"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Variables Globales de Estado
let users = [];
let movies = [];
let currentBrand = 'disney';
let currentType = 'pelicula';
let datosSerieActual = [];
let primeraCarga = true;

// --- ESCUCHADORES EN TIEMPO REAL (FIREBASE) ---

// Sincronizar Usuarios
db.ref('users').on('value', snapshot => {
    const data = snapshot.val();
    users = data ? Object.values(data) : [{u:'admin', p:'1234', d:'2026-12-31'}];
    renderUserTable();
});

// Sincronizar Contenido (Optimizado)
db.ref('movies').on('value', snapshot => {
    const data = snapshot.val();
    movies = [];
    if(data) {
        for(let id in data) {
            movies.push({ ...data[id], firebaseId: id });
        }
    }
    
    // Solo refresca la vista si no estamos dentro del reproductor para evitar cortes
    if(primeraCarga || document.getElementById('video-player').classList.contains('hidden')) {
        actualizarVista();
        renderMovieTable();
        primeraCarga = false;
    }
});

// --- SISTEMA DE SESIÓN ---

function entrar() {
    const u = document.getElementById('log-u').value;
    const p = document.getElementById('log-p').value;
    const user = users.find(x => x.u === u && x.p === p);
    
    if(user) {
        document.getElementById('u-name').innerText = "Perfil: " + u;
        switchScreen('sc-main');
        actualizarVista();
    } else { 
        alert("Acceso denegado: Usuario o PIN incorrectos"); 
    }
}

function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

function cerrarSesion() {
    document.getElementById('drop-menu').classList.add('hidden');
    switchScreen('sc-login');
}

function toggleMenu() { 
    document.getElementById('drop-menu').classList.toggle('hidden'); 
}

// --- MOTOR DE REPRODUCCIÓN Y SERIES ---

function reproducir(cadenaVideo, titulo) {
    const player = document.getElementById('video-player');
    const titleDisp = document.getElementById('player-title');
    const serieControls = document.getElementById('serie-controls');
    
    titleDisp.innerText = titulo;
    player.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Buscamos si el item es serie o película
    const item = movies.find(m => m.title === titulo && m.video === cadenaVideo);

    if(item && item.type === 'serie') {
        serieControls.classList.remove('hidden');
        // El formato esperado es: link1, link2 | link_t2_cap1, link_t2_cap2
        const temporadas = item.video.split('|');
        datosSerieActual = temporadas.map(t => t.split(','));
        
        const selector = document.getElementById('season-selector');
        selector.innerHTML = datosSerieActual.map((_, i) => `<option value="${i}">Temporada ${i+1}</option>`).join('');
        
        cargarTemporada(0); // Cargar temporada 1 por defecto
    } else {
        serieControls.classList.add('hidden');
        gestionarFuenteVideo(cadenaVideo);
    }
}

function gestionarFuenteVideo(url) {
    const videoFrame = document.querySelector('.video-frame');
    videoFrame.innerHTML = ''; // Limpiar reproductor previo
    const urlLimpia = url.trim();
    
    // Detectar si es un archivo directo (.m3u8 o .mp4)
    const esVideoDirecto = urlLimpia.toLowerCase().includes('.m3u8') || urlLimpia.toLowerCase().includes('.mp4');

    if (esVideoDirecto) {
        videoFrame.innerHTML = `<video id="main-v" controls autoplay style="width:100%; height:100%; background:#000;"></video>`;
        const video = document.getElementById('main-v');
        
        if (Hls.isSupported() && urlLimpia.includes('.m3u8')) {
            const hls = new Hls();
            hls.loadSource(urlLimpia);
            hls.attachMedia(video);
        } else { 
            video.src = urlLimpia; 
        }
    } else {
        // Si es un embed (YouTube, Fembed, etc)
        videoFrame.innerHTML = `<iframe src="${urlLimpia}" frameborder="0" allowfullscreen style="width:100%; height:100%;"></iframe>`;
    }
}

function cargarTemporada(idx) {
    const grid = document.getElementById('episodes-grid');
    const capitulos = datosSerieActual[idx];
    
    grid.innerHTML = capitulos.map((link, i) => `
        <button class="btn-ep" onclick="gestionarFuenteVideo('${link.trim()}')">EP. ${i+1}</button>
    `).join('');
    
    // Auto-reproducir el primer capítulo de la temporada
    gestionarFuenteVideo(capitulos[0].trim());
}

function cerrarReproductor() {
    document.querySelector('.video-frame').innerHTML = '';
    document.getElementById('video-player').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// --- PANEL DE ADMINISTRACIÓN ---

function abrirAdmin() {
    if(prompt("CÓDIGO DE ACCESO:") === "2026") {
        switchScreen('sc-admin');
        renderUserTable();
        renderMovieTable();
    }
}

function guardarContenido() {
    const title = document.getElementById('c-title').value;
    const poster = document.getElementById('c-post').value;
    const video = document.getElementById('c-video').value;
    const brand = document.getElementById('c-brand').value;
    const type = document.getElementById('c-type').value;

    if(title && poster && video) {
        db.ref('movies').push({title, poster, video, brand, type});
        // Limpiar campos
        document.getElementById('c-title').value = "";
        document.getElementById('c-post').value = "";
        document.getElementById('c-video').value = "";
        alert("¡Contenido subido a la nube con éxito!");
    } else {
        alert("Por favor rellena todos los campos");
    }
}

function borrarMovie(id) {
    if(confirm("¿Seguro que quieres eliminar este contenido?")) {
        db.ref('movies/' + id).remove();
    }
}

function guardarUser() {
    const u = document.getElementById('adm-un').value;
    const p = document.getElementById('adm-up').value;
    const d = document.getElementById('adm-ud').value;
    if(u && p && d) {
        db.ref('users').push({u, p, d});
        alert("Usuario creado exitosamente");
    }
}

function borrarUser(uNombre) {
    db.ref('users').once('value', snapshot => {
        snapshot.forEach(child => {
            if(child.val().u === uNombre) db.ref('users/' + child.key).remove();
        });
    });
}

// --- GESTIÓN DE INTERFAZ Y FILTROS ---

function seleccionarMarca(brand) { 
    currentBrand = brand; 
    actualizarVista(); 
}

function cambiarTipo(type) {
    currentType = type;
    document.getElementById('t-peli').classList.toggle('active', type === 'pelicula');
    document.getElementById('t-serie').classList.toggle('active', type === 'serie');
    actualizarVista();
}

function actualizarVista() {
    const grid = document.getElementById('grid');
    if(!grid) return;
    
    document.getElementById('cat-title').innerText = currentBrand.toUpperCase() + " > " + currentType.toUpperCase();
    
    const filtrados = movies.filter(m => m.brand === currentBrand && m.type === currentType);
    
    grid.innerHTML = filtrados.map(m => `
        <div class="poster" style="background-image:url('${m.poster}')" onclick="reproducir('${m.video}', '${m.title}')"></div>
    `).join('');
}

function renderMovieTable() {
    const table = document.getElementById('movie-list');
    let html = `<tr><th>Título</th><th>Acción</th></tr>`;
    movies.forEach(m => {
        html += `<tr><td>${m.title}</td><td><button onclick="borrarMovie('${m.firebaseId}')" style="color:#ff4d4d; border:none; background:none; cursor:pointer;">Borrar</button></td></tr>`;
    });
    table.innerHTML = html;
}

function renderUserTable() {
    const table = document.getElementById('user-list');
    let html = `<tr><th>Usuario</th><th>Acción</th></tr>`;
    users.forEach(u => {
        html += `<tr><td>${u.u}</td><td><button onclick="borrarUser('${u.u}')" style="color:#ff4d4d; border:none; background:none; cursor:pointer;">Eliminar</button></td></tr>`;
    });
    table.innerHTML = html;
}

function buscar() {
    const q = document.getElementById('search-box').value.toLowerCase();
    const filtered = movies.filter(m => m.title.toLowerCase().includes(q));
    document.getElementById('grid').innerHTML = filtered.map(m => `
        <div class="poster" style="background-image:url('${m.poster}')" onclick="reproducir('${m.video}', '${m.title}')"></div>
    `).join('');
}
