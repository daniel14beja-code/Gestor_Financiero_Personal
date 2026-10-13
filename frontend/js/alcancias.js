let alcanciaActual = null;

async function init() {
    await cargarSidebar();
    cargarAlcancias();
}

async function cargarAlcancias() {
    const res  = await fetch('/alcancias', { credentials: 'include' });
    const data = await res.json();
    const grid = document.getElementById('gridAlcancias');

    if (!data.ok || data.data.length === 0) {
        grid.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:60px 0;color:var(--muted);">
                <div style="font-size:3rem;margin-bottom:16px;">🐷</div>
                <p>No tienes alcancías todavía.</p>
                <p style="font-size:0.85rem;">Crea una para empezar a ahorrar.</p>
            </div>`;
        return;
    }

    grid.innerHTML = data.data.map(a => {
        const fmt = n => '$' + parseFloat(n || 0).toLocaleString('es-CO', { minimumFractionDigits: 2 });
        const hoy = new Date();
        const bloqueada = a.fecha_retiro && new Date(a.fecha_retiro) > hoy;
        const diasRestantes = a.fecha_retiro
            ? Math.ceil((new Date(a.fecha_retiro) - hoy) / (1000 * 60 * 60 * 24))
            : null;
        const progreso = a.meta ? Math.min((parseFloat(a.saldo) / parseFloat(a.meta)) * 100, 100).toFixed(1) : null;

        return `
        <div class="alcancia-card">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                <div>
                    <div class="alcancia-nombre">🐷 ${a.nombre}</div>
                    ${a.descripcion ? `<div class="alcancia-desc">${a.descripcion}</div>` : ''}
                </div>
                <span class="${bloqueada ? 'badge-bloqueada' : 'badge-disponible'}">
                    ${bloqueada ? `🔒 ${diasRestantes}d` : '🔓 Disponible'}
                </span>
            </div>

            <div class="alcancia-saldo">${fmt(a.saldo)}</div>

            ${a.meta ? `
            <div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width:${progreso}%"></div>
                </div>
                <div class="alcancia-info">
                    <span>${progreso}% completado</span>
                    <span>Meta: ${fmt(a.meta)}</span>
                </div>
            </div>` : ''}

            ${a.fecha_retiro ? `
            <div style="font-size:0.8rem;color:var(--muted);">
                📅 Retiro disponible: ${new Date(a.fecha_retiro).toLocaleDateString('es-CO')}
            </div>` : ''}

            <div class="alcancia-acciones">
                <button onclick="abrirDepositar(${a.id_alcancia}, '${a.nombre}')"
                    class="btn btn-primary" style="flex:1;padding:8px;">
                    ➕ Depositar
                </button>
                <button onclick="abrirRetirar(${a.id_alcancia}, '${a.nombre}', ${a.saldo}, ${bloqueada})"
                    class="btn btn-secondary" style="flex:1;padding:8px;"
                    ${bloqueada ? 'disabled title="No disponible hasta ' + new Date(a.fecha_retiro).toLocaleDateString('es-CO') + '"' : ''}>
                    💰 Retirar
                </button>
                <button onclick="eliminarAlcancia(${a.id_alcancia})"
                    class="btn btn-danger" style="padding:8px 12px;">
                    🗑
                </button>
            </div>
        </div>`;
    }).join('');
}

// ─── Crear ────────────────────────────────────────────────
function abrirModalCrear() {
    document.getElementById('modalCrear').classList.add('active');
}

async function crearAlcancia() {
    const nombre      = document.getElementById('crearNombre').value.trim();
    const descripcion = document.getElementById('crearDesc').value.trim();
    const meta        = document.getElementById('crearMeta').value;
    const fecha_retiro = document.getElementById('crearFecha').value;
    const errorDiv    = document.getElementById('errorCrear');

    if (!nombre) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = 'El nombre es obligatorio';
        return;
    }

    const res  = await fetch('/alcancias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ nombre, descripcion, meta: meta || null, fecha_retiro: fecha_retiro || null })
    });
    const data = await res.json();

    if (data.ok) {
        cerrarModales();
        limpiarFormCrear();
        cargarAlcancias();
        mostrarMensaje('Alcancía creada correctamente.', true);
    } else {
        errorDiv.style.display = 'block';
        errorDiv.textContent = data.mensaje;
    }
}

// ─── Depositar ────────────────────────────────────────────
async function abrirDepositar(id, nombre) {
    alcanciaActual = id;
    document.getElementById('nombreDepAlcancia').textContent = nombre;
    document.getElementById('errorDep').style.display = 'none';
    document.getElementById('depMonto').value = '';
    document.getElementById('depDesc').value = '';

    // Mostrar balance disponible
    const res  = await fetch('/balance', { credentials: 'include' });
    const data = await res.json();
    const fmt  = n => '$' + parseFloat(n || 0).toLocaleString('es-CO', { minimumFractionDigits: 2 });
    document.getElementById('balanceDisponible').textContent = data.ok ? fmt(data.data.balance_actual) : '$0.00';

    document.getElementById('modalDepositar').classList.add('active');
}

async function depositar() {
    const monto    = document.getElementById('depMonto').value;
    const desc     = document.getElementById('depDesc').value;
    const errorDiv = document.getElementById('errorDep');

    if (!monto || monto <= 0) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = 'Ingresa un monto válido';
        return;
    }

    const res  = await fetch(`/alcancias/${alcanciaActual}/depositar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ monto, descripcion: desc })
    });
    const data = await res.json();

    if (data.ok) {
        cerrarModales();
        cargarAlcancias();
        mostrarMensaje('Depósito realizado correctamente.', true);
    } else {
        errorDiv.style.display = 'block';
        errorDiv.textContent = data.mensaje;
    }
}

// ─── Retirar ──────────────────────────────────────────────
function abrirRetirar(id, nombre, saldo, bloqueada) {
    if (bloqueada) return;
    alcanciaActual = id;
    document.getElementById('nombreRetAlcancia').textContent = nombre;
    document.getElementById('errorRet').style.display = 'none';
    document.getElementById('retMonto').value = '';
    document.getElementById('retDesc').value = '';
    const fmt = n => '$' + parseFloat(n || 0).toLocaleString('es-CO', { minimumFractionDigits: 2 });
    document.getElementById('saldoDisponible').textContent = fmt(saldo);
    document.getElementById('modalRetirar').classList.add('active');
}

async function retirar() {
    const monto    = document.getElementById('retMonto').value;
    const desc     = document.getElementById('retDesc').value;
    const errorDiv = document.getElementById('errorRet');

    if (!monto || monto <= 0) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = 'Ingresa un monto válido';
        return;
    }

    const res  = await fetch(`/alcancias/${alcanciaActual}/retirar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ monto, descripcion: desc })
    });
    const data = await res.json();

    if (data.ok) {
        cerrarModales();
        cargarAlcancias();
        mostrarMensaje('Retiro realizado correctamente.', true);
    } else {
        errorDiv.style.display = 'block';
        errorDiv.textContent = data.mensaje;
    }
}

// ─── Eliminar ─────────────────────────────────────────────
async function eliminarAlcancia(id) {
    if (!confirm('¿Eliminar esta alcancía? Si tiene saldo, se devolverá a tu balance.')) return;
    const res  = await fetch(`/alcancias/${id}`, { method: 'DELETE', credentials: 'include' });
    const data = await res.json();
    if (data.ok) {
        cargarAlcancias();
        mostrarMensaje('Alcancía eliminada. El saldo fue devuelto a tu balance.', true);
    } else {
        mostrarMensaje(data.mensaje, false);
    }
}

// ─── Utilidades ───────────────────────────────────────────
function cerrarModales() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    alcanciaActual = null;
}

function limpiarFormCrear() {
    document.getElementById('crearNombre').value = '';
    document.getElementById('crearDesc').value = '';
    document.getElementById('crearMeta').value = '';
    document.getElementById('crearFecha').value = '';
    document.getElementById('errorCrear').style.display = 'none';
}

function mostrarMensaje(texto, exito) {
    const div = document.getElementById('mensajeGlobal');
    div.textContent = texto;
    div.style.display = 'block';
    div.style.background = exito ? 'rgba(74,222,128,0.1)' : 'rgba(255,92,92,0.1)';
    div.style.borderColor = exito ? 'var(--success)' : 'var(--danger)';
    div.style.color       = exito ? 'var(--success)' : 'var(--danger)';
    setTimeout(() => div.style.display = 'none', 4000);
}

// Cerrar modal al hacer clic fuera
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
        if (e.target === overlay) cerrarModales();
    });
});

init();