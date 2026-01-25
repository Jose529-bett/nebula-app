import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, push, onValue, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Configuración de tu Firebase
const firebaseConfig = {
    databaseURL: "https://nebula-plus-app-default-rtdb.firebaseio.com/",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Variables de Estado
let users = [];
let movies = [];
let currentBrand = 'disney';
let currentType = 'pelicula';

// --- SINCRONIZACIÓN FIREBASE ---

onValue(ref(db, 'users'), (snapshot) => {
    const data = snapshot.val();
    users = data ? Object.keys(data).map(key => ({...data[key], id: key})) : [];
    renderUserTable();
});

onValue(ref(db, 'movies'), (snapshot) => {
    const data = snapshot.val();
    movies = data ? Object.keys(data).map(key => ({...data[key], id: key})) : [];
    actualizarVista();
    renderMovieTable();
});

// --- FUNCIONES DE ACCESO ---

window.entrar = function() {
    const u = document.getElementById('log-u').value;
    const p = document.getElementById('log-p').value;
    
    // El admin siempre puede entrar (Hardcoded) o buscamos en la DB
    if(u === "admin" && p === "2026") {
        document.getElementById('u-name').innerText = "Modo: Administrador";
        switchScreen('sc-main');
        return;
    }

    const user = users.find(x => x.u === u && x.p === p);
    if(user) {
        // Verificar si la fecha de acceso expiró
        const hoy = new Date().toISOString().split('T')[0];
        if(hoy > user.d) {
            alert("Tu suscripción ha vencido el: " + user.d);
        } else {
            document.getElementById('u-name').innerText = "Perfil: " + u;
            switchScreen('sc-main');
        }
    } else {
        alert("Credenciales incorrectas");
    }
};

window.abrirAdmin = function() {
    if(prompt("PASSWORD MAESTRA:") === "2026") {
        switchScreen('sc-admin');
    }
};

function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

window.cerrarSesion = function() {
    location.reload(); // Forma más limpia de resetear el estado
};

// --- GESTIÓN DE CONTENIDO (ADMIN) ---

window.guardarContenido = function() {
    const title = document.getElementById('c-title').value;
    const poster = document.getElementById('c-post').value;
    const video = document.getElementById('c-video').value;
    const brand = document.getElementById('c-brand').value;
    const type = document.getElementById('c-type').value;

    if(title && poster && video) {
        push(ref(db, 'movies'), { title, poster, video, brand, type });
        alert("Publicado con éxito");
        document.getElementById('c-title').value = "";
        document.getElementById('c-post').value = "";
        document.getElementById('c-video').value = "";
    } else {
        alert("Completa todos los campos");
    }
};

window.borrarMovie = function(id) {
    if(confirm("¿Eliminar este contenido permanentemente?")) {
        remove(ref(db, `movies/${id}`));
    }
};

window.guardarUser = function() {
    const u = document.getElementById('adm-un').value;
    const p = document.getElementById('adm-up').value;
    const d = document.getElementById('adm-ud').value;
    if(u && p && d) {
        push(ref(db, 'users'), { u, p, d });
        document.getElementById('adm-un').value = "";
        document.getElementById('adm-up').value = "";
        alert("Usuario creado");
    }
};

window.borrarUser = function(id) {
    remove(ref(db, `users/${id}`));
};

// --- MOTOR DE RENDERIZADO (CLIENTE) ---

window.seleccionarMarca = function(brand) {
    currentBrand = brand;
    actualizarVista();
};

window.cambiarTipo = function(type) {
    currentType = type;
    document.getElementById('t-peli').classList.toggle('active', type === 'pelicula');
    document.getElementById('t-serie').classList.toggle('active', type === 'serie');
    actualizarVista();
};

function actualizarVista() {
    const grid = document.getElementById('grid');
    if(!grid) return;
    document.getElementById('cat-title').innerText = `${currentBrand.toUpperCase()} > ${currentType.toUpperCase()}`;
    const filtrados = movies.filter(m => m.brand === currentBrand && m.type === currentType);
    
    grid.innerHTML = filtrados.map(m => `
        <div class="poster" style="background-image:url('${m.poster}')" 
             onclick="reproducir('${m.video}', '${m.title}')"></div>
    `).join('');
}

window.buscar = function() {
    const q = document.getElementById('search-box').value.toLowerCase();
    const grid = document.getElementById('grid');
    const filtered = movies.filter(m => m.title.toLowerCase().includes(q));
    grid.innerHTML = filtered.map(m => `
        <div class="poster" style="background-image:url('${m.poster}')" 
             onclick="reproducir('${m.video}', '${m.title}')"></div>
    `).join('');
};

// --- REPRODUCTOR ---

window.reproducir = function(url, titulo) {
    const player = document.getElementById('video-player');
    const iframe = document.getElementById('main-iframe');
    iframe.src = url;
    document.getElementById('player-title').innerText = titulo;
    player.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
};

window.cerrarReproductor = function() {
    document.getElementById('main-iframe').src = "";
    document.getElementById('video-player').classList.add('hidden');
    document.body.style.overflow = 'auto';
};

// --- TABLAS ADMIN ---

function renderMovieTable() {
    const table = document.getElementById('movie-list');
    let html = `<tr><th>Título</th><th>Marca</th><th>X</th></tr>`;
    movies.forEach((m) => {
        html += `<tr><td>${m.title}</td><td>${m.brand}</td><td><button onclick="borrarMovie('${m.id}')" style="color:red; background:none; border:none; cursor:pointer">✖</button></td></tr>`;
    });
    table.innerHTML = html;
}

function renderUserTable() {
    const table = document.getElementById('user-list');
    let html = `<tr><th>Usuario</th><th>Vence</th><th>X</th></tr>`;
    users.forEach((u) => {
        html += `<tr><td>${u.u}</td><td>${u.d}</td><td><button onclick="borrarUser('${u.id}')" style="color:red; background:none; border:none; cursor:pointer">✖</button></td></tr>`;
    });
    table.innerHTML = html;
}

window.toggleMenu = function() {
    document.getElementById('drop-menu').classList.toggle('hidden');
};
