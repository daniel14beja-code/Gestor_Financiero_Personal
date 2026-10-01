// Verificar sesión
async function verificarSesion() {
    const res = await fetch('/auth/sesion', { credentials: 'include' });
    const data = await res.json();
    if (!data.ok) {
        window.location.href = 'login.html';
        return;
    }
    const u = data.usuario;
    document.getElementById('nombreUsuario').textContent = u.nombre;
    document.getElementById('badgePerfil').textContent = u.perfil;
    document.getElementById('badgePerfil').className = 'badge ' + (u.idPerfil === 1 ? 'badge-admin' : 'badge-user');

    // Mostrar menú admin solo si es admin
    if (u.idPerfil === 1) {
        document.getElementById('menuAdmin').style.display = 'block';
    }

    cargarBalance();
}

async function cargarBalance() {
    const res = await fetch('/balance', { credentials: 'include' });
    const data = await res.json();
    if (data.ok && data.data) {
        const b = data.data;
        const fmt = n => '$' + parseFloat(n).toLocaleString('es-CO', { minimumFractionDigits: 2 });
        document.getElementById('totalIngresos').textContent = fmt(b.total_ingresos);
        document.getElementById('totalGastos').textContent   = fmt(b.total_gastos);
        const balEl = document.getElementById('balanceActual');
        balEl.textContent = fmt(b.balance_actual);
        balEl.style.color = parseFloat(b.balance_actual) >= 0 ? 'var(--success)' : 'var(--danger)';
    }
}

async function logout() {
    await fetch('/auth/logout', { credentials: 'include' });
    window.location.href = 'login.html';
}

verificarSesion();