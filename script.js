
let users = JSON.parse(localStorage.getItem('neb_u')) || [{u:'admin', p:'1234', d:'2026-12-31'}];
let movies = JSON.parse(localStorage.getItem('neb_m')) || [];
let currentBrand = 'disney';
let currentType = 'pelicula';

// LOGIN Y NAVEGACIÓN
function entrar() {
    const u = document.getElementById('log-u').value;
    const p = document.getElementById('log-p').value;
    const user = users.find(x => x.u === u && x.p === p);
    if(user) {
        document.getElementById('u-name').innerText = "Perfil: " + u;
        switchScreen('sc-main');
        actualizarVista();
    } else { alert("Usuario no encontrado"); }
}

function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

function cerrarSesion() {
    document.getElementById('drop-menu').classList.add('hidden');
    switchScreen('sc-login');
}

function toggleMenu() { document.getElementById('drop-menu').classList.toggle('hidden'); }

// REPRODUCTOR
function reproducir(url, titulo) {
    const player = document.getElementById('video-player');
    const iframe = document.getElementById('main-iframe');
    const titleDisp = document.getElementById('player-title');
    iframe.src = url;
    titleDisp.innerText = titulo;
    player.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function cerrarReproductor() {
    const player = document.getElementById('video-player');
    const iframe = document.getElementById('main-iframe');
    iframe.src = "";
    player.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// PANEL ADMIN
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
        document.getElementById('c-title').value = "";
        document.getElementById('c-post').value = "";
        document.getElementById('c-video').value = "";
        renderMovieTable();
        actualizarVista();
        alert("Publicado!");
    }
}

function renderMovieTable() {
    const table = document.getElementById('movie-list');
    let html = `<tr><th>Título</th><th>Marca</th><th>X</th></tr>`;
    movies.forEach((m, i) => {
        html += `<tr><td>${m.title}</td><td>${m.brand}</td><td><button onclick="borrarMovie(${i})" style="color:red">X</button></td></tr>`;
    });
    table.innerHTML = html;
}

function borrarMovie(i) {
    movies.splice(i, 1);
    localStorage.setItem('neb_m', JSON.stringify(movies));
    renderMovieTable();
    actualizarVista();
}

function renderUserTable() {
    const table = document.getElementById('user-list');
    let html = `<tr><th>Usuario</th><th>X</th></tr>`;
    users.forEach((u, i) => {
        html += `<tr><td>${u.u}</td><td><button onclick="users.splice(${i},1);localStorage.setItem('neb_u',JSON.stringify(users));renderUserTable()" style="color:red">X</button></td></tr>`;
    });
    table.innerHTML = html;
}

function guardarUser() {
    const u = document.getElementById('adm-un').value;
    const p = document.getElementById('adm-up').value;
    const d = document.getElementById('adm-ud').value;
    if(u && p && d) {
        users.push({u, p, d});
        localStorage.setItem('neb_u', JSON.stringify(users));
        renderUserTable();
    }
}

// MOTOR DE VISTA
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

function buscar() {
    const q = document.getElementById('search-box').value.toLowerCase();
    const grid = document.getElementById('grid');
    const filtered = movies.filter(m => m.title.toLowerCase().includes(q));
    grid.innerHTML = filtered.map(m => `<div class="poster" style="background-image:url('${m.poster}')" onclick="reproducir('${m.video}', '${m.title}')"></div>`).join('');
}

