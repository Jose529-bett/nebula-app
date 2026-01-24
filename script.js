const firebaseURL = "https://nebula-plus-default-rtdb.firebaseio.com/";

// Base de datos local temporal (se sincroniza con la nube)
let movies = [];
let users = [];

// 1. CARGAR DATOS AL INICIAR
async function cargarDatos() {
    try {
        // Cargar Películas
        const resMovies = await fetch(`${firebaseURL}movies.json`);
        const dataMovies = await resMovies.json();
        movies = dataMovies ? Object.values(dataMovies) : [];

        // Cargar Usuarios
        const resUsers = await fetch(`${firebaseURL}users.json`);
        const dataUsers = await resUsers.json();
        users = dataUsers ? Object.values(dataUsers) : [{u:'admin', p:'2026'}];

        actualizarVista();
    } catch (error) {
        console.error("Error cargando datos:", error);
    }
}

// 2. GUARDAR PELÍCULA EN LA NUBE
async function guardarContenido() {
    const nuevaPelicula = {
        title: document.getElementById('c-title').value,
        poster: document.getElementById('c-post').value,
        video: document.getElementById('c-video').value,
        brand: document.getElementById('c-brand').value,
        type: document.getElementById('c-type').value
    };

    if(nuevaPelicula.title && nuevaPelicula.poster && nuevaPelicula.video) {
        await fetch(`${firebaseURL}movies.json`, {
            method: 'POST',
            body: JSON.stringify(nuevaPelicula)
        });
        alert("¡Película publicada para todos los usuarios!");
        location.reload(); // Recarga para ver los cambios
    } else {
        alert("Por favor rellena los campos principales");
    }
}

// 3. CREAR USUARIO EN LA NUBE (Desde el Panel Admin)
async function crearUsuarioNuevo(usuario, clave) {
    const nuevoUsuario = { u: usuario, p: clave };
    await fetch(`${firebaseURL}users.json`, {
        method: 'POST',
        body: JSON.stringify(nuevoUsuario)
    });
    alert("Usuario creado con éxito. Ya puede iniciar sesión en cualquier APK.");
}

// 4. LOGIN (Verifica contra la nube)
function login() {
    const userVal = document.getElementById('user').value;
    const passVal = document.getElementById('pass').value;

    const coincidencia = users.find(user => user.u === userVal && user.p === passVal);

    if (coincidencia) {
        document.getElementById('login-screen').style.display = 'none';
    } else {
        alert("Usuario o contraseña incorrectos");
    }
}

// 5. ACTUALIZAR LA PANTALLA
function actualizarVista() {
    const container = document.getElementById('movies-container');
    if(!container) return;
    container.innerHTML = '';

    movies.forEach(m => {
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.innerHTML = `
            <img src="${m.poster}" onclick="verVideo('${m.video}')">
            <h4>${m.title}</h4>
        `;
        container.appendChild(card);
    });
}

function verVideo(url) {
    window.location.href = url;
}

// Iniciar la app cargando la nube
cargarDatos();
