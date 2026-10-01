async function verificarSesion() {
    const res = await fetch('/auth/sesion', { credentials: 'include' });
    const data = await res.json();
    if (!data.ok) { window.location.href = 'login.html'; return; }
    cargarBalance();
}

async function cargarBalance() {
    const res  = await fetch('/balance', { credentials: 'include' });
    const data = await res.json();
    if (!data.ok || !data.data) return;
    const b = data.data;
    const fmt = n => '$' + parseFloat(n).toLocaleString('es-CO', { minimumFractionDigits: 2 });
    document.getElementById('ingresos').textContent = fmt(b.total_ingresos);
    document.getElementById('gastos').textContent   = fmt(b.total_gastos);
    const balEl = document.getElementById('balance');
    balEl.textContent  = fmt(b.balance_actual);
    balEl.style.color  = parseFloat(b.balance_actual) >= 0 ? 'var(--success)' : 'var(--danger)';
}

verificarSesion();