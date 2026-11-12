import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Wallet, Users, MapPin, CalendarDays, Plus, Trash2, Plane, Settings, X, ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import './style.css'

const money = (value, currency = 'GBP') => new Intl.NumberFormat('es-ES', {
  style: 'currency', currency, maximumFractionDigits: 2
}).format(Number(value || 0))

function App() {
  const [tab, setTab] = useState('home')
  const [expenses, setExpenses] = useState(() => {
    try { return JSON.parse(localStorage.getItem('th-expenses') || '[]') } catch { return [] }
  })
  const [budget, setBudget] = useState(() => Number(localStorage.getItem('th-budget') || 1000))
  const [currency, setCurrency] = useState(() => localStorage.getItem('th-currency') || 'GBP')
  const [rate, setRate] = useState(() => Number(localStorage.getItem('th-rate') || 1.17))
  const [showForm, setShowForm] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [sharedMode, setSharedMode] = useState(false)
  const [form, setForm] = useState({ title: '', amount: '', category: 'Comida', date: new Date().toISOString().slice(0,10), shared: false, paidBy: 'Yo', people: '2' })

  const total = useMemo(() => expenses.reduce((sum, item) => sum + Number(item.amount), 0), [expenses])
  const remaining = budget - total
  const percent = budget > 0 ? Math.min(100, total / budget * 100) : 0

  function persist(next) {
    setExpenses(next)
    localStorage.setItem('th-expenses', JSON.stringify(next))
  }
  function addExpense(e) {
    e.preventDefault()
    if (!form.title.trim() || !Number(form.amount) || Number(form.amount) <= 0) return
    const item = { ...form, id: crypto.randomUUID(), amount: Number(form.amount), shared: sharedMode && form.shared, people: Math.max(1, Number(form.people) || 1) }
    persist([item, ...expenses])
    setForm({ title: '', amount: '', category: 'Comida', date: new Date().toISOString().slice(0,10), shared: false, paidBy: 'Yo', people: '2' })
    setShowForm(false)
  }
  function removeExpense(id) {
    if (confirm('¿Eliminar este gasto?')) persist(expenses.filter(x => x.id !== id))
  }
  const categories = ['Comida', 'Transporte', 'Alojamiento', 'Entradas', 'Compras', 'Otros']

  return <div className="app-shell">
    <header className="topbar">
      <div className="brand"><div className="brand-icon"><Plane size={19}/></div><div><strong>TRAVEL HUB</strong><small>Tu viaje, bajo control</small></div></div>
      <button className="icon-btn" onClick={() => setShowSettings(true)} aria-label="Ajustes"><Settings size={20}/></button>
    </header>

    <main>
      {tab === 'home' && <>
        <section className="hero">
          <div className="eyebrow">PRESUPUESTO DEL VIAJE</div>
          <div className="hero-amount">{money(budget, currency)}</div>
          <div className="hero-row"><span>Gastado: {money(total, currency)}</span><span>{percent.toFixed(0)}%</span></div>
          <div className="progress"><span style={{width: `${percent}%`}}/></div>
          <div className="hero-row remaining"><span>Disponible</span><strong>{money(remaining, currency)}</strong></div>
        </section>
        <div className="section-heading"><div><span className="eyebrow dark">RESUMEN</span><h2>Tu viaje</h2></div><button className="text-btn" onClick={() => setShowSettings(true)}>Configurar</button></div>
        <div className="quick-grid">
          <button className="quick-card" onClick={() => setTab('expenses')}><Wallet/><b>Mis gastos</b><small>Registro y estadísticas</small></button>
          <button className="quick-card" onClick={() => {setSharedMode(true);setTab('expenses')}}><Users/><b>Compartidos</b><small>Repartir gastos</small></button>
          <button className="quick-card" onClick={() => setTab('explore')}><MapPin/><b>Explorar</b><small>Qué ver cerca</small></button>
          <button className="quick-card" onClick={() => setTab('plan')}><CalendarDays/><b>Itinerario</b><small>Organizar visitas</small></button>
        </div>
        <div className="section-heading"><div><span className="eyebrow dark">MOVIMIENTOS</span><h2>Últimos gastos</h2></div><button className="text-btn" onClick={() => setTab('expenses')}>Ver todos</button></div>
        {expenses.length ? <ExpenseList items={expenses.slice(0,4)} currency={currency} onDelete={removeExpense}/> : <Empty text="Todavía no has añadido gastos."/>}
        <button className="primary wide" onClick={() => setShowForm(true)}><Plus size={18}/> Añadir gasto</button>
      </>}

      {tab === 'expenses' && <>
        <div className="page-title"><span className="eyebrow dark">CONTROL DE DINERO</span><h1>{sharedMode ? 'Gastos compartidos' : 'Mis gastos'}</h1><p>Registra lo que gastas durante el viaje.</p></div>
        <div className="toggle-row"><button className={!sharedMode?'selected':''} onClick={()=>setSharedMode(false)}>Personales</button><button className={sharedMode?'selected':''} onClick={()=>setSharedMode(true)}>Compartidos</button></div>
        <div className="stat-card"><small>Total registrado</small><strong>{money(expenses.filter(x => sharedMode ? x.shared : !x.shared).reduce((s,x)=>s+x.amount,0),currency)}</strong><span>{expenses.filter(x => sharedMode ? x.shared : !x.shared).length} movimientos</span></div>
        <ExpenseList items={expenses.filter(x => sharedMode ? x.shared : !x.shared)} currency={currency} onDelete={removeExpense}/>
        <button className="primary wide" onClick={() => {setForm(f=>({...f,shared:sharedMode}));setShowForm(true)}}><Plus size={18}/> Añadir gasto</button>
      </>}

      {tab === 'explore' && <Placeholder icon={<MapPin/>} title="Explorar lugares" text="Aquí añadiremos el mapa, tu ubicación y recomendaciones de sitios cercanos." />}
      {tab === 'plan' && <Placeholder icon={<CalendarDays/>} title="Tu itinerario" text="Aquí organizaremos los días, visitas y lugares que quieras guardar." />}
    </main>

    <nav className="bottom-nav">
      <button className={tab==='home'?'active':''} onClick={()=>setTab('home')}><Wallet/><span>Inicio</span></button>
      <button className={tab==='expenses'?'active':''} onClick={()=>setTab('expenses')}><ArrowUpRight/><span>Gastos</span></button>
      <button className={tab==='explore'?'active':''} onClick={()=>setTab('explore')}><MapPin/><span>Explorar</span></button>
      <button className={tab==='plan'?'active':''} onClick={()=>setTab('plan')}><CalendarDays/><span>Plan</span></button>
    </nav>

    {showForm && <div className="overlay" onClick={()=>setShowForm(false)}><form className="sheet" onClick={e=>e.stopPropagation()} onSubmit={addExpense}>
      <div className="sheet-head"><div><span className="eyebrow dark">NUEVO MOVIMIENTO</span><h2>Añadir gasto</h2></div><button type="button" className="icon-btn" onClick={()=>setShowForm(false)}><X/></button></div>
      <label>Concepto<input autoFocus placeholder="Ej. Cena, metro, museo..." value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required/></label>
      <label>Importe ({currency === 'GBP' ? '£' : '€'})<input type="number" inputMode="decimal" min="0.01" step="0.01" placeholder="0,00" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} required/></label>
      <div className="form-grid"><label>Categoría<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{categories.map(c=><option key={c}>{c}</option>)}</select></label><label>Fecha<input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></label></div>
      {sharedMode && <div className="shared-fields"><label>Quién ha pagado<input value={form.paidBy} onChange={e=>setForm({...form,paidBy:e.target.value})}/></label><label>Personas entre las que repartir<input type="number" min="1" value={form.people} onChange={e=>setForm({...form,people:e.target.value})}/></label></div>}
      <button className="primary wide" type="submit">Guardar gasto</button>
    </form></div>}

    {showSettings && <div className="overlay" onClick={()=>setShowSettings(false)}><div className="sheet" onClick={e=>e.stopPropagation()}>
      <div className="sheet-head"><div><span className="eyebrow dark">PREFERENCIAS</span><h2>Configuración</h2></div><button className="icon-btn" onClick={()=>setShowSettings(false)}><X/></button></div>
      <label>Presupuesto total<input type="number" min="0" value={budget} onChange={e=>{setBudget(Number(e.target.value));localStorage.setItem('th-budget',e.target.value)}}/></label>
      <label>Moneda principal<select value={currency} onChange={e=>{setCurrency(e.target.value);localStorage.setItem('th-currency',e.target.value)}}><option value="GBP">Libra esterlina (£)</option><option value="EUR">Euro (€)</option></select></label>
      <label>Cambio orientativo: 1 £ = X €<input type="number" step="0.001" value={rate} onChange={e=>{setRate(Number(e.target.value));localStorage.setItem('th-rate',e.target.value)}}/></label>
      <p className="hint">El cambio es editable y manual en esta primera versión. No se consulta ninguna API de pago.</p>
      <button className="primary wide" onClick={()=>setShowSettings(false)}>Listo</button>
    </div></div>}
  </div>
}

function ExpenseList({items,currency,onDelete}) {
  if (!items.length) return <Empty text="No hay gastos en esta sección todavía."/>
  return <div className="expense-list">{items.map(item=><div className="expense" key={item.id}>
    <div className="expense-symbol"><ArrowDownLeft size={18}/></div><div className="expense-info"><b>{item.title}</b><small>{item.category} · {item.date}{item.shared?' · Compartido':''}</small></div><strong>{money(item.amount,currency)}</strong><button className="delete-btn" onClick={()=>onDelete(item.id)} aria-label="Eliminar"><Trash2 size={16}/></button>
  </div>)}</div>
}
function Empty({text}) { return <div className="empty">{text}</div> }
function Placeholder({icon,title,text}) { return <div className="placeholder"><div className="placeholder-icon">{icon}</div><h1>{title}</h1><p>{text}</p><span>Próximamente</span></div> }

createRoot(document.getElementById('root')).render(<App/>)
