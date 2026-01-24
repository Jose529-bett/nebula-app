const firebaseURL = "https://nebula-plus-default-rtdb.firebaseio.com/";
let users = [];
let movies = [];
let currentBrand = 'disney';
let currentType = 'pelicula';

// --- 1. CICLO DE VIDA (INTRO Y CARGA) ---
window.addEventListener('DOMContentLoaded', () => {
    // La intro dura 3.8 segundos
    setTimeout(() => {
        document.getElementById('intro-screen').classList.add('fade-out');
        cargarDatos();
    }, 3800);
});

async function cargarDatos() {
    try {
        const resU = await fetch(`${firebaseURL}users.json`);
        const dataU = await resU.json();
        users = dataU ? Object.keys(dataU).map(id => ({ id, ...dataU[id] })) : [{u:'admin', p:'2026'}];

        const resM = await fetch(`${firebaseURL}movies.json`);
        const dataM = await resM.json();
        movies = dataM ? Object.keys(dataM).map(id => ({ id, ...dataM[id] })) : [];

        const yo = localStorage.getItem('usuario_actual');
        
        // SEGURIDAD: Expulsar si el usuario ya no existe en la nube
        if (yo && yo !== "admin") {
            const todaviaExiste = users.find(x => x.u === yo);
            if (!todaviaExiste) {
                localStorage.removeItem('usuario_actual');
                window.location.reload();
                return;
            }
        }

        // AUTO-LOGIN: Si ya tiene sesión, entrar directo al catálogo
        if (yo && !document.getElementById('sc-login').classList.contains('hidden')) {
            document.getElementById('u-name').innerText = "Perfil: " + yo;
            switchScreen('sc-main');
        }

        actualizarVista();
        
        if(!document.getElementById('sc-admin').classList.contains('hidden')) {
            renderUserTable(); renderMovieTable();
        }
    } catch (e) { console.error("Error en conexión:", e); }
}

// Revisar la nube cada 6 segundos para control de usuarios
setInterval(cargarDatos, 6000);

// --- 2. MANEJO DE CONTROL REMOTO (SMART TV) ---
document.addEventListener('keydown', (e) => {
    const focusable = document.querySelectorAll('button:not(.hidden), input:not(.hidden), .poster, select');
    let index = Array.from(focusable).indexOf(document.activeElement);

    if (e.key === "ArrowRight") { index = (index + 1) % focusable.length; focusable[index].focus(); }
    if (e.key === "ArrowLeft") { index = (index - 1 + focusable.length) % focusable.length; focusable[index].focus(); }
    if (e.key === "ArrowDown") { index = (index + 5) % focusable.length; focusable[index].focus(); }
    if (e.key === "ArrowUp") { index = (index - 5 + focusable.length) % focusable.length; focusable[index].focus(); }
    
    // Al pulsar Enter en un poster, reproducir
    if (e.key === "Enter" && document.activeElement.classList.contains('poster')) {
        document.activeElement.click();
    }
    
    // Volver atrás con Backspace (común en controles remotos)
    if (e.key === "Backspace" || e.key === "Escape") { 
        cerrarReproductor(); 
    }
});

// --- 3. BOTÓN SECRETO ADMIN ---
function abrirAdmin() {
    const pass = prompt("PASSWORD ADMIN:");
    if(pass === "2026") {
        switchScreen('sc-admin');
        renderUserTable();
        renderMovieTable();
    }
}

// --- 4. LÓGICA DE NAVEGACIÓN ---
function entrar() {
    const u = document.getElementById('log-u').value;
    const p = document.getElementById('log-p').value;
    const user = users.find(x => x.u === u && x.p === p);
    if(user) {
        localStorage.setItem('usuario_actual', u);
        window.location.reload();
    } else { alert("Usuario o PIN incorrecto"); }
}

function actualizarVista() {
    const grid = document.getElementById('grid');
    if(!grid) return;
    document.getElementById('cat-title').innerText = currentBrand.toUpperCase() + " > " + currentType.toUpperCase();
    const filtrados = movies.filter(m => m.brand === currentBrand && m.type === currentType);
    
    // Tabindex="0" permite que el control remoto "vea" los posters
    grid.innerHTML = filtrados.map(m => `
        <div class="poster" tabindex="0" style="background-image:url('${m.poster}')" 
             onclick="reproducir('${m.video}', '${m.title}')"></div>
    `).join('');
}

// --- 5. FUNCIONES ADMIN ---
async function guardarContenido() {
    const title = document.getElementById('c-title').value;
    const poster = document.getElementById('c-post').value;
    const video = document.getElementById('c-video').value;
    const brand = document.getElementById('c-brand').value;
    const type = document.getElementById('c-type').value;
    if(title && poster && video) {
        await fetch(`${firebaseURL}movies.json`, { method: 'POST', body: JSON.stringify({title, poster, video, brand, type}) });
        alert("Publicado!"); cargarDatos();
    }
}

async function guardarUser() {
    const u = document.getElementById('adm-un').value;
    const p = document.getElementById('adm-up').value;
    const d = document.getElementById('adm-ud').value;
    if(u && p && d) {
        await fetch(`${firebaseURL}users.json`, { method: 'POST', body: JSON.stringify({u, p, d}) });
        alert("Usuario Creado"); cargarDatos();
    }
}

async function borrarUser(id) {
    if(confirm("¿Eliminar usuario?")) {
        await fetch(`${firebaseURL}users/${id}.json`, { method: 'DELETE' });
        cargarDatos();
    }
}

async function borrarMovie(id) {
    if(confirm("¿Eliminar contenido?")) {
        await fetch(`${firebaseURL}movies/${id}.json`, { method: 'DELETE' });
        cargarDatos();
    }
}

// --- 6. UTILIDADES ---
function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

function cerrarSesion() { localStorage.removeItem('usuario_actual'); window.location.reload(); }
function toggleMenu() { document.getElementById('drop-menu').classList.toggle('hidden'); }
function seleccionarMarca(b) { currentBrand = b; actualizarVista(); }
function cambiarTipo(t) { 
    currentType = t; 
    document.getElementById('t-peli').classList.toggle('active', t==='pelicula');
    document.getElementById('t-serie').classList.toggle('active', t==='serie');
    actualizarVista(); 
}

function reproducir(u, t) {
    const player = document.getElementById('video-player');
    document.getElementById('main-iframe').src = u;
    document.getElementById('player-title').innerText = t;
    player.classList.remove('hidden');
    // Dar foco al botón cerrar para control remoto
    setTimeout(() => { document.querySelector('.close-player').focus(); }, 500);
}

function cerrarReproductor() { 
    document.getElementById('main-iframe').src = ""; 
    document.getElementById('video-player').classList.add('hidden'); 
}
