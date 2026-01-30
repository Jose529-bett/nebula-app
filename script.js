// CONFIGURACIÓN DE TU FIREBASE
const firebaseConfig = { databaseURL: "https://nebula-plus-app-default-rtdb.firebaseio.com/" };
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let users = []; let movies = []; let currentBrand = 'disney'; let currentType = 'pelicula';
let datosSerieActual = []; let primeraCarga = true; let hlsInstance = null;

// ESCUCHADORES FIREBASE (Actualizados para capturar IDs correctamente)
db.ref('users').on('value', snap => {
    const data = snap.val();
    users = [];
    if(data) { 
        for(let id in data) { 
            // Guardamos el ID de Firebase para poder borrar después
            users.push({ ...data[id], firebaseId: id }); 
        } 
    } else {
        // Usuario local por defecto
        users = [{u:'admin', p:'1234', d:'2026-12-31'}];
    }
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

// MOTOR DE REPRODUCCIÓN
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
        videoFrame.innerHTML = `<video id="main-v" controls autoplay playsinline preload="metadata" controlsList="nodownload" oncontextmenu="return false;" style="width:100%; height:100%; background:#000;"></video>`;
        const video = document.getElementById('main-v');
        if (urlLimpia.toLowerCase().includes('.m3u8') && Hls.isSupported()) {
            hlsInstance = new Hls({ capLevelToPlayerSize: true, autoStartLoad: true });
            hlsInstance.loadSource(urlLimpia);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => { video.play().catch(e => {}); });
        } else { video.src = urlLimpia; video.play().catch(e => {}); }
    } else {
        videoFrame.innerHTML = `<iframe src="${urlLimpia}" frameborder="0" allowfullscreen style="width:100%; height:100%;"></iframe>`;
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

// ADMINISTRACIÓN - CORREGIDO (Guardar y Eliminar)
function abrirAdmin() { if(prompt("CÓDIGO:") === "2026") { switchScreen('sc-admin'); } }

function guardarUser() {
    const u = document.getElementById('adm-un').value;
    const p = document.getElementById('adm-up').value;
    const d = document.getElementById('adm-ud').value;
    
    if(u && p && d) {
        // Guardamos en Firebase con los nombres de campos que espera tu sistema
        db.ref('users').push({
            u: u,
            p: p,
            d: d
        }).then(() => {
            alert("¡Usuario '" + u + "' guardado correctamente!");
            // Limpiamos los campos después de guardar
            document.getElementById('adm-un').value = '';
            document.getElementById('adm-up').value = '';
            document.getElementById('adm-ud').value = '';
        }).catch((err) => {
            alert("Error al guardar: " + err.message);
        });
    } else { 
        alert("Por favor rellena el nombre, la clave y la fecha"); 
    }
}

function borrarUser(id) { 
    if(!id) return; // Si es el usuario por defecto, no se puede borrar
    if(confirm("¿Eliminar este usuario de la base de datos?")) {
        db.ref('users/' + id).remove()
        .then(() => {
            alert("Usuario eliminado con éxito");
        })
        .catch((err) => {
            alert("Error al eliminar: " + err.message);
        });
    }
}

function guardarContenido() {
    const title = document.getElementById('c-title').value;
    const poster = document.getElementById('c-post').value;
    const video = document.getElementById('c-video').value;
    const brand = document.getElementById('c-brand').value;
    const type = document.getElementById('c-type').value;
    if(title && poster && video) {
        db.ref('movies').push({title, poster, video, brand, type}).then(() => {
            alert("Contenido Publicado");
            document.getElementById('c-title').value = '';
            document.getElementById('c-post').value = '';
            document.getElementById('c-video').value = '';
        });
    } else { alert("Completa los campos de contenido"); }
}

function borrarMovie(id) { if(confirm("¿Borrar contenido?")) db.ref('movies/' + id).remove(); }

// VISTAS Y TABLAS
function seleccionarMarca(b) { currentBrand = b; actualizarVista(); }
function cambiarTipo(t) { 
    currentType = t; 
    document.getElementById('t-peli').classList.toggle('active', t === 'pelicula');
    document.getElementById('t-serie').classList.toggle('active', t === 'serie');
    actualizarVista(); 
}

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
    movies.forEach(m => { html += `<tr><td>${m.title}</td><td><button onclick="borrarMovie('${m.firebaseId}')" style="color:red; cursor:pointer; background:none; border:1px solid red; padding:2px 5px; border-radius:3px;">Borrar</button></td></tr>`; });
    table.innerHTML = html;
}

function renderUserTable() {
    const table = document.getElementById('user-list');
    if(!table) return;
    let html = `<tr><th>Usuario</th><th>Acción</th></tr>`;
    users.forEach(u => { 
        // Solo ponemos el botón de eliminar si el usuario viene de la base de datos (tiene firebaseId)
        const botonAccion = u.firebaseId 
            ? `<button onclick="borrarUser('${u.firebaseId}')" style="color:red; cursor:pointer; background:none; border:1px solid red; padding:2px 5px; border-radius:3px;">Eliminar</button>`
            : `<span style="color:gray">Sistema</span>`;
            
        html += `<tr><td>${u.u}</td><td>${botonAccion}</td></tr>`; 
    });
    table.innerHTML = html;
}

function buscar() {
    const q = document.getElementById('search-box').value.toLowerCase();
    const filtered = movies.filter(m => m.title.toLowerCase().includes(q));
    document.getElementById('grid').innerHTML = filtered.map(m => `<div class="poster" style="background-image:url('${m.poster}')" onclick="reproducir('${m.video}', '${m.title}')"></div>`).join('');
}
