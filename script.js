const firebaseURL = "https://nebula-plus-default-rtdb.firebaseio.com/";

let users = [];
let movies = [];

// --- 1. CARGAR TODO AL INICIAR ---
async function cargarDatos() {
    try {
        // Cargar Usuarios
        const resUsers = await fetch(`${firebaseURL}users.json`);
        const dataUsers = await resUsers.json();
        users = dataUsers ? Object.keys(dataUsers).map(id => ({
            id: id, u: dataUsers[id].u, p: dataUsers[id].p 
        })) : [{u:'admin', p:'2026'}];

        // Cargar Películas/Series
        const resMovies = await fetch(`${firebaseURL}movies.json`);
        const dataMovies = await resMovies.json();
        movies = dataMovies ? Object.values(dataMovies) : [];

        actualizarVista();
    } catch (e) { console.error("Error al sincronizar:", e); }
}

// --- 2. SUBIR CONTENIDO (Películas, Disney, Netflix, etc.) ---
async function guardarContenido() {
    // Tomamos los datos de tus inputs (Asegúrate que los ID coincidan con tu HTML)
    const nuevaPeli = {
        title: document.getElementById('c-title').value,
        poster: document.getElementById('c-post').value,
        video: document.getElementById('c-video').value,
        brand: document.getElementById('c-brand').value, // Para Disney, Netflix, etc.
        type: document.getElementById('c-type').value    // Para Película o Serie
    };

    if(nuevaPeli.title && nuevaPeli.poster && nuevaPeli.video) {
        await fetch(`${firebaseURL}movies.json`, {
            method: 'POST',
            body: JSON.stringify(nuevaPeli)
        });
        alert("¡" + nuevaPeli.title + " subida a la nube!");
        location.reload(); 
    } else {
        alert("Faltan datos importantes");
    }
}

// --- 3. REGISTRAR Y ELIMINAR USUARIOS ---
async function registrarNuevoUsuario() {
    const u = document.getElementById('reg-user').value;
    const p = document.getElementById('reg-pass').value;
    if(u && p) {
        await fetch(`${firebaseURL}users.json`, {
            method: 'POST',
            body: JSON.stringify({ u: u, p: p })
        });
        alert("Usuario creado");
        cargarDatos();
    }
}

async function eliminarUsuario() {
    const u = document.getElementById('reg-user').value;
    const encontrado = users.find(user => user.u === u);
    if (encontrado && encontrado.id) {
        await fetch(`${firebaseURL}users/${encontrado.id}.json`, { method: 'DELETE' });
        alert("Usuario borrado");
        cargarDatos();
    }
}

// --- 4. LOGIN ---
function login() {
    const u = document.getElementById('user').value;
    const p = document.getElementById('pass').value;
    const ok = users.find(user => user.u === u && user.p === p);
    if (ok) {
        document.getElementById('login-screen').style.display = 'none';
    } else {
        alert("Error de acceso");
    }
}

// --- 5. MOSTRAR EN PANTALLA ---
function actualizarVista() {
    const container = document.getElementById('movies-container');
    if(!container) return;
    container.innerHTML = '';

    movies.forEach(m => {
        const card = document.createElement('div');
        card.className = 'movie-card';
        // Aquí puedes usar m.brand o m.type si quieres poner un icono de Netflix o Disney
        card.innerHTML = `
            <img src="${m.poster}" onclick="window.location.href='${m.video}'">
            <div class="info">
                <h4>${m.title}</h4>
                <span>${m.brand}</span>
            </div>
        `;
        container.appendChild(card);
    });
}

cargarDatos();
// --- LÓGICA DEL BOTÓN SECRETO REUPERADA ---
let toques = 0;

// Si usabas toques en un área invisible:
function activarBotonSecreto() {
    toques++;
    if (toques >= 5) { // Si eran 5 toques por ejemplo
        const pass = prompt("Introduce el código de acceso:");
        if (pass === "2026") {
            document.getElementById('admin-panel').style.display = 'block';
        } else {
            alert("Código incorrecto");
            toques = 0;
        }
    }
}

// O si usabas un código directo en el login:
function accesoDirectoAdmin(codigo) {
    if(codigo === "2026") {
        document.getElementById('admin-panel').style.display = 'block';
    }
}

