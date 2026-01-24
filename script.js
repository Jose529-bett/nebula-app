const firebaseURL = "https://nebula-plus-default-rtdb.firebaseio.com/";
let users = [];
let movies = [];
let currentBrand = 'disney';
let currentType = 'pelicula';

// --- 1. CARGA E INTELIGENCIA DE SESIÓN ---
async function cargarDatos() {
    try {
        const resU = await fetch(`${firebaseURL}users.json`);
        const dataU = await resU.json();
        users = dataU ? Object.keys(dataU).map(id => ({ id, ...dataU[id] })) : [{u:'admin', p:'1234', d:'2026-12-31'}];

        const resM = await fetch(`${firebaseURL}movies.json`);
        const dataM = await resM.json();
        movies = dataM ? Object.keys(dataM).map(id => ({ id, ...dataM[id] })) : [];

        const usuarioActual = localStorage.getItem('usuario_actual');
        
        // Expulsión automática si el usuario fue borrado
        if (usuarioActual && usuarioActual !== "admin") {
            const todaviaExiste = users.find(x => x.u === usuarioActual);
            if (!todaviaExiste) {
                localStorage.removeItem('usuario_actual');
                alert("Sesión expirada.");
                window.location.reload();
                return;
            }
        }

        // Auto-login
        if (usuarioActual && !document.getElementById('sc-login').classList.contains('hidden')) {
            document.getElementById('u-name').innerText = "Perfil: " + usuarioActual;
            switchScreen('sc-main');
        }

        actualizarVista();
    } catch (e) { console.error(e); }
}

setInterval(cargarDatos, 7000); // Revisa la nube cada 7 segundos

// --- 2. NAVEGACIÓN POR CONTROL REMOTO (PARA SMART TV) ---
document.addEventListener('keydown', (e) => {
    // Lista de elementos que pueden recibir el foco
    const menuItems = document.querySelectorAll('button, input, .poster, select');
    let currentIndex = Array.from(menuItems).indexOf(document.activeElement);

    switch(e.key) {
        case "ArrowRight":
            currentIndex = (currentIndex + 1) % menuItems.length;
            menuItems[currentIndex].focus();
            break;
        case "ArrowLeft":
            currentIndex = (currentIndex - 1 + menuItems.length) % menuItems.length;
            menuItems[currentIndex].focus();
            break;
        case "ArrowDown":
            // Salto aproximado de fila en el grid
            currentIndex = (currentIndex + 4) % menuItems.length;
            menuItems[currentIndex].focus();
            break;
        case "ArrowUp":
            currentIndex = (currentIndex - 4 + menuItems.length) % menuItems.length;
            menuItems[currentIndex].focus();
            break;
        case "Enter":
            // Si el foco está en un poster, reproducir al dar OK
            if (document.activeElement.classList.contains('poster')) {
                document.activeElement.click();
            }
            break;
        case "Escape":
        case "Backspace":
            cerrarReproductor();
            break;
    }
});

// --- 3. FUNCIONES DE SIEMPRE (ADAPTADAS) ---
function entrar() {
    const u = document.getElementById('log-u').value;
    const p = document.getElementById('log-p').value;
    const user = users.find(x => x.u === u && x.p === p);
    if(user) {
        localStorage.setItem('usuario_actual', u);
        window.location.reload();
    } else { alert("Datos incorrectos"); }
}

function actualizarVista() {
    const grid = document.getElementById('grid');
    if(!grid) return;
    
    document.getElementById('cat-title').innerText = currentBrand.toUpperCase() + " > " + currentType.toUpperCase();
    const filtrados = movies.filter(m => m.brand === currentBrand && m.type === currentType);
    
    // IMPORTANTE: Añadimos tabindex="0" para que el control remoto vea los posters
    grid.innerHTML = filtrados.map(m => `
        <div class="poster" 
             tabindex="0" 
             style="background-image:url('${m.poster}')" 
             onclick="reproducir('${m.video}', '${m.title}')">
        </div>
    `).join('');
}

// ... (Aquí mantienes tus funciones de abrirAdmin, guardarUser, borrarMovie, etc.)
// Asegúrate de incluir las funciones de soporte que ya tenías abajo.

function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

function reproducir(url, titulo) {
    const player = document.getElementById('video-player');
    const iframe = document.getElementById('main-iframe');
    iframe.src = url;
    document.getElementById('player-title').innerText = titulo;
    player.classList.remove('hidden');
    // Al abrir el video, darle el foco al botón de cerrar para que el control pueda salir
    setTimeout(() => { document.querySelector('.close-player').focus(); }, 500);
}

function cerrarReproductor() {
    document.getElementById('main-iframe').src = "";
    document.getElementById('video-player').classList.add('hidden');
}

function seleccionarMarca(b) { currentBrand = b; actualizarVista(); }
function cambiarTipo(t) { currentType = t; actualizarVista(); }

cargarDatos();
