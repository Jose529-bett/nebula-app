let users = JSON.parse(localStorage.getItem('neb_u')) || [{u:'admin', p:'2026', d:'2026-12-31'}];
let movies = JSON.parse(localStorage.getItem('neb_m')) || [];
let currentBrand = 'disney';
let currentType = 'pelicula';

// INTRO CONTROL
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const intro = document.getElementById('intro-screen');
        if(intro) intro.classList.add('fade-out');
    }, 3500);
});

// LOGIN
function entrar() {
    const u = document.getElementById('log-u').value;
    const p = document.getElementById('log-p').value;
    const user = users.find(x => x.u === u && x.p === p);
    if(user) {
        document.getElementById('u-name').innerText = "Perfil: " + u;
        switchScreen('sc-main');
        actualizarVista();
    } else { alert("PIN Incorrecto"); }
}

function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

function cerrarSesion() { window.location.reload(); }

// ADMIN
function abrirAdmin() {
    if(prompt("PASSWORD ADMIN:") === "2026") {
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
        movies.push({title, poster, video, brand, type});
        localStorage.setItem('neb_m', JSON.stringify(movies));
        renderMovieTable();
        actualizarVista();
        alert("¡Publicado con éxito!");
    }
}

function renderMovieTable() {
    const table = document.getElementById('movie-list');
    table.innerHTML = movies.map((m, i) => `
        <tr><td>${m.title}</td><td><button onclick="borrarMovie(${i})" style="color:red; background:none; border:none; cursor:pointer">X</button></td></tr>
    `).join('');
}

function borrarMovie(i) {
    movies.splice(i, 1);
    localStorage.setItem('neb_m', JSON.stringify(movies));
    renderMovieTable();
    actualizarVista();
}

function guardarUser() {
    const u = document.getElementById('adm-un').value;
    const p = document.getElementById('adm-up').value;
    const d = document.getElementById('adm-ud').value;
    if(u && p) {
        users.push({u, p, d});
        localStorage.setItem('neb_u', JSON.stringify(users));
        renderUserTable();
        alert("Usuario Creado");
    }
}

function renderUserTable() {
    const table = document.getElementById('user-list');
    table.innerHTML = users.map((u, i) => `
        <tr><td>${u.u}</td><td><button onclick="users.splice(${i},1);localStorage.setItem('neb_u',JSON.stringify(users));renderUserTable()" style="color:red; background:none; border:none; cursor:pointer">X</button></td></tr>
    `).join('');
}

// VISTA
function seleccionarMarca(brand) { currentBrand = brand; actualizarVista(); }
function cambiarTipo(type) {
    currentType = type;
    document.getElementById('t-peli').classList.toggle('active', type === 'pelicula');
    document.getElementById('t-serie').classList.toggle('active', type === 'serie');
    actualizarVista();
}

function actualizarVista() {
    const grid = document.getElementById('grid');
    if(!grid) return;
    const filtrados = movies.filter(m => m.brand === currentBrand && m.type === currentType);
    grid.innerHTML = filtrados.map(m => `
        <div class="poster" style="background-image:url('${m.poster}')" onclick="reproducir('${m.video}', '${m.title}')"></div>
    `).join('');
}

function reproducir(url, titulo) {
    document.getElementById('main-iframe').src = url;
    document.getElementById('player-title').innerText = titulo;
    document.getElementById('video-player').classList.remove('hidden');
}

function cerrarReproductor() {
    document.getElementById('main-iframe').src = "";
    document.getElementById('video-player').classList.add('hidden');
}

function toggleMenu() { document.getElementById('drop-menu').classList.toggle('hidden'); }
