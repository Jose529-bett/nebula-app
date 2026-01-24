// CONFIGURACIÓN DE TU NUBE
const firebaseURL = "https://nebula-plus-default-rtdb.firebaseio.com/";

let users = [];
let movies = [];

// --- 1. CARGA INICIAL (Sincroniza con Firebase) ---
async function cargarDatos() {
    try {
        // Cargar Usuarios
        const resUsers = await fetch(`${firebaseURL}users.json`);
        const dataUsers = await resUsers.json();
        // Mapeamos para obtener el ID de Firebase (necesario para borrar)
        users = dataUsers ? Object.keys(dataUsers).map(id => ({
            id: id, u: dataUsers[id].u, p: dataUsers[id].p 
        })) : [{u:'admin', p:'2026'}];

        // Cargar Películas y Series
        const resMovies = await fetch(`${firebaseURL}movies.json`);
        const dataMovies = await resMovies.json();
        movies = dataMovies ? Object.values(dataMovies) : [];

        actualizarVista();
    } catch (error) {
        console.error("Error de conexión:", error);
    }
}

// --- 2. GESTIÓN DE CONTENIDO (SUBIR PELIS/SERIES) ---
async function guardarContenido() {
    const nuevaPeli = {
        title: document.getElementById('c-title').value,
        poster: document.getElementById('c-post').value,
        video: document.getElementById('c-video').value,
        brand: document.getElementById('c-brand').value, // Disney, Netflix, etc.
        type: document.getElementById('c-type').value    // Película o Serie
    };

    if(nuevaPeli.title && nuevaPeli.poster && nuevaPeli.video) {
        await fetch(`${firebaseURL}movies.json`, {
            method: 'POST',
            body: JSON.stringify(nuevaPeli)
        });
        alert("¡" + nuevaPeli.title + " publicada con éxito!");
        location.reload(); 
    } else {
        alert("Por favor, completa los campos obligatorios.");
    }
}

// --- 3. GESTIÓN DE USUARIOS (REGISTRAR/BORRAR) ---
async function registrarNuevoUsuario() {
    const u = document.getElementById('reg-user').value;
    const p = document.getElementById('reg-pass').value;
    
    if(u && p) {
        await fetch(`${firebaseURL}users.json`, {
            method: 'POST',
            body: JSON.stringify({ u: u, p: p })
        });
        alert("Usuario " + u + " registrado.");
        cargarDatos();
    }
}

async function eliminarUsuario() {
    const u = document.getElementById('reg-user').value;
    const encontrado = users.find(user => user.u === u);
    
    if (encontrado && encontrado.id) {
        if(confirm("¿Seguro que quieres eliminar a " + u + "?")) {
            await fetch(`${firebaseURL}users/${encontrado.id}.json`, { method: 'DELETE' });
            alert("Usuario eliminado.");
            cargarDatos();
        }
    } else {
        alert("Usuario no encontrado.");
    }
}

// --- 4. BOTÓN INVISIBLE Y ACCESO ADMIN ---
function activarBotonSecreto() {
    const pass = prompt("Acceso Restringido. Ingrese el PIN:");
    if (pass === "2026") {
        // Asegúrate que en tu HTML el panel tenga id="admin-panel"
        document.getElementById('admin-panel').style.display = 'block';
        alert("Panel de Control Abierto");
    } else {
        alert("PIN Incorrecto");
    }
}

// --- 5. LOGIN DE USUARIOS ---
function login() {
    const u = document.getElementById('user').value;
    const p = document.getElementById('pass').value;
    
    const coincidencia = users.find(user => user.u === u && user.p === p);
    
    if (coincidencia) {
        document.getElementById('login-screen').style.display = 'none';
    } else {
        alert("Usuario o contraseña no válidos");
    }
}

// --- 6. RENDERIZADO EN PANTALLA ---
function actualizarVista() {
    const container = document.getElementById('movies-container');
    if(!container) return;
    container.innerHTML = '';

    movies.forEach(m => {
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.innerHTML = `
            <img src="${m.poster}" onclick="window.location.href='${m.video}'">
            <div class="card-info">
                <h4>${m.title}</h4>
                <small>${m.brand} | ${m.type}</small>
            </div>
        `;
        container.appendChild(card);
    });
}

// INICIAR APP
cargarDatos();
