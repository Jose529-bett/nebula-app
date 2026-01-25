let currentBrand = '';
let currentType = 'pelicula';

function seleccionarMarca(marca) {
    currentBrand = marca;
    // Mostrar selector de categorías
    document.getElementById('category-selector').classList.remove('hidden');
    document.getElementById('view-title').innerText = `${marca.toUpperCase()}`;
    actualizarVista();
}

function cambiarTipo(tipo) {
    currentType = tipo;
    // Estilo visual de botones activos
    document.getElementById('btn-peli').className = tipo === 'pelicula' ? 'active' : '';
    document.getElementById('btn-serie').className = tipo === 'serie' ? 'active' : '';
    actualizarVista();
}

function actualizarVista() {
    const grid = document.getElementById('grid');
    // Filtramos el contenido por MARCA y TIPO
    const filtrados = movies.filter(m => m.brand === currentBrand && m.type === currentType);
    
    if (filtrados.length === 0) {
        grid.innerHTML = `<p style="text-align:center; width:100%">Próximamente más contenido de ${currentBrand}...</p>`;
    } else {
        grid.innerHTML = filtrados.map(m => `
            <div class="poster" 
                 style="background-image: url('${m.poster}')" 
                 onclick="reproducir('${m.video}', '${m.title}')">
            </div>
        `).join('');
    }
}

// El resto de tus funciones (entrar, cargarDatos, reproducir, cerrarSesion)
// se mantienen igual, solo asegúrate de que movies[] tenga los datos de Firebase.
