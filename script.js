// ... Variables de Firebase ...

function switchScreen(screenId) {
    // Ocultar todas las pantallas
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    // Mostrar solo la elegida
    document.getElementById(screenId).classList.remove('hidden');
}

function abrirAdmin() {
    const pass = prompt("PIN DE ADMINISTRADOR:");
    if (pass === "2026") {
        switchScreen('sc-admin');
        renderTablas();
    }
}

function cerrarPanel() {
    // Al cerrar el panel, volvemos al login o al catálogo según prefieras
    switchScreen('sc-login'); 
}

function entrar() {
    const u = document.getElementById('log-u').value;
    const p = document.getElementById('log-p').value;
    const user = users.find(x => x.u === u && x.p === p);
    
    if (user) {
        switchScreen('sc-main');
    } else {
        alert("Usuario o PIN incorrecto");
    }
}

// Función para renderizar tablas ajustada al nuevo CSS
function renderTablas() {
    document.getElementById('user-table').innerHTML = users.map(u => `
        <div class="table-row">
            <span>${u.u}</span>
            <span>${u.d || '--'}</span>
            <button onclick="borrar('users','${u.id}')" style="color:#ff4d4d; background:none; border:none; cursor:pointer">X</button>
        </div>
    `).join('');

    document.getElementById('movie-table').innerHTML = movies.map(m => `
        <div class="table-row">
            <span>${m.title}</span>
            <span style="text-transform:capitalize">${m.brand}</span>
            <button onclick="borrar('movies','${m.id}')" style="color:#ff4d4d; background:none; border:none; cursor:pointer">X</button>
        </div>
    `).join('');
}
