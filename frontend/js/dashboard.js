async function init() {
    await cargarSidebar();
    cargarBalance();
}

async function cargarBalance() {
    const res  = await fetch('/balance', { credentials: 'include' });
    const data = await res.json();
    if (!data.ok || !data.data) return;
    
    const b = data.data;
    const fmt = n => '$' + parseFloat(n).toLocaleString('es-CO', { minimumFractionDigits: 2 });
    
    document.getElementById('totalIngresos').textContent = fmt(b.total_ingresos);
    document.getElementById('totalGastos').textContent   = fmt(b.total_gastos);
    
    const balEl = document.getElementById('balanceActual');
    balEl.textContent = fmt(b.balance_actual);
    balEl.style.color = parseFloat(b.balance_actual) >= 0 ? 'var(--success)' : 'var(--danger)';
}

init();