// ... (mantenemos las variables de FirebaseURL) ...

function renderTablas() {
    // Tabla de Usuarios
    const userCont = document.getElementById('user-table');
    userCont.innerHTML = users.map(u => `
        <div class="table-row">
            <span>${u.u}</span>
            <span style="color:#888">${u.d || '---'}</span>
            <button class="btn-del-pro" onclick="borrar('users','${u.id}')">ELIMINAR</button>
        </div>
    `).join('');

    // Tabla de Películas
    const movieCont = document.getElementById('movie-table');
    movieCont.innerHTML = movies.map(m => `
        <div class="table-row">
            <span>${m.title}</span>
            <span style="color:#888; text-transform:capitalize;">${m.brand}</span>
            <button class="btn-del-pro" onclick="borrar('movies','${m.id}')">ELIMINAR</button>
        </div>
    `).join('');
}

// ... (funciones de guardar y borrar se mantienen igual) ...
