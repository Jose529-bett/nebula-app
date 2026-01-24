let marcaActual = "";
let tipoActual = "";

// FILTRADO POR MARCA
function seleccionarMarca(marca) {
    marcaActual = marca;
    document.querySelector('.brand-grid').classList.add('hidden');
    document.getElementById('type-selector').classList.remove('hidden');
    document.getElementById('grid').innerHTML = "<p class='info-msg'>Selecciona Películas o Series</p>";
}

function filtrarTipo(tipo) {
    tipoActual = tipo;
    const filtrados = movies.filter(m => m.brand === marcaActual && m.type === tipoActual);
    renderGrid(filtrados);
}

function volverAMarcas() {
    document.querySelector('.brand-grid').classList.remove('hidden');
    document.getElementById('type-selector').classList.add('hidden');
    document.getElementById('grid').innerHTML = "";
}

// BUSCADOR
function filtrarContenido() {
    const busqueda = document.getElementById('search-bar').value.toLowerCase();
    const filtrados = movies.filter(m => m.title.toLowerCase().includes(busqueda));
    
    if(busqueda !== "") {
        document.querySelector('.brand-grid').classList.add('hidden');
        renderGrid(filtrados);
    } else {
        volverAMarcas();
    }
}

function renderGrid(lista) {
    const grid = document.getElementById('grid');
    grid.innerHTML = lista.map(m => `
        <div class="movie-card" onclick="verVideo('${m.video}', '${m.title}')">
            <img src="${m.poster}">
        </div>
    `).join('');
}

// CERRAR SESIÓN
function cerrarSesion() {
    if(confirm("¿Deseas salir de Nebula+?")) {
        location.reload(); // Recarga y vuelve al Login inicial
    }
}

// REPRODUCTOR FULLSCREEN
function verVideo(url, titulo) {
    const player = document.getElementById('video-player');
    const iframe = document.getElementById('main-iframe');
    document.getElementById('now-playing').innerText = titulo;
    
    // Convertir link normal a link incrustable si es necesario
    iframe.src = url; 
    player.classList.remove('hidden');
}

function cerrarPlayer() {
    document.getElementById('main-iframe').src = "";
    document.getElementById('video-player').classList.add('hidden');
}
