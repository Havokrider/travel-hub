import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Wallet, Users, MapPin, CalendarDays, Plus, Trash2, Plane, Settings, X, ArrowDownLeft, Search, Pencil, Filter, PieChart, ChevronDown, Check, Download } from 'lucide-react'
import './style.css'

const money = (value, currency = 'GBP') => new Intl.NumberFormat('es-ES', { style: 'currency', currency, maximumFractionDigits: 2 }).format(Number(value || 0))
const today = () => new Date().toISOString().slice(0, 10)
const blankForm = () => ({ title: '', amount: '', category: 'Comida', date: today(), shared: false, paidBy: 'Yo', people: '2' })
const categories = ['Comida', 'Transporte', 'Alojamiento', 'Entradas', 'Compras', 'Otros']

function App() {
  const [tab, setTab] = useState('home')
  const [expenses, setExpenses] = useState(() => { try { return JSON.parse(localStorage.getItem('th-expenses') || '[]') } catch { return [] } })
  const [currency, setCurrency] = useState(() => localStorage.getItem('th-currency') || 'GBP')
  const [rate, setRate] = useState(() => Number(localStorage.getItem('th-rate') || 1.17))
  const [showForm, setShowForm] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [sharedMode, setSharedMode] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(blankForm)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('Todas')
  const [monthFilter, setMonthFilter] = useState('Todos')

  const total = useMemo(() => expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0), [expenses])
  const personalTotal = expenses.filter(x => !x.shared).reduce((s, x) => s + Number(x.amount || 0), 0)
  const sharedTotal = expenses.filter(x => x.shared).reduce((s, x) => s + Number(x.amount || 0), 0)
  const visibleExpenses = useMemo(() => expenses.filter(x => sharedMode ? !!x.shared : !x.shared)
    .filter(x => categoryFilter === 'Todas' || x.category === categoryFilter)
    .filter(x => monthFilter === 'Todos' || (x.date || '').slice(0, 7) === monthFilter)
    .filter(x => !search || `${x.title} ${x.category} ${x.paidBy || ''}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (b.date || '').localeCompare(a.date || '')), [expenses, sharedMode, categoryFilter, monthFilter, search])
  const months = [...new Set(expenses.map(x => (x.date || '').slice(0, 7)).filter(Boolean))].sort().reverse()

  function persist(next) { setExpenses(next); localStorage.setItem('th-expenses', JSON.stringify(next)) }
  function openNew(shared = sharedMode) { setEditingId(null); setForm({ ...blankForm(), shared }); setShowForm(true) }
  function openEdit(item) { setEditingId(item.id); setForm({ ...blankForm(), ...item, amount: String(item.amount), people: String(item.people || 2) }); setSharedMode(!!item.shared); setShowForm(true) }
  function saveExpense(e) {
    e.preventDefault()
    const amount = Number(String(form.amount).replace(',', '.'))
    if (!form.title.trim() || !Number.isFinite(amount) || amount <= 0) return
    const item = { ...form, id: editingId || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())), amount, people: Math.max(1, Number(form.people) || 1), shared: !!form.shared }
    persist(editingId ? expenses.map(x => x.id === editingId ? item : x) : [item, ...expenses])
    setShowForm(false); setEditingId(null); setForm(blankForm())
  }
  function removeExpense(id) { if (confirm('¿Eliminar este gasto?')) persist(expenses.filter(x => x.id !== id)) }
  function exportCSV() {
    const rows = [['Fecha', 'Concepto', 'Categoría', 'Importe', 'Moneda', 'Tipo', 'Pagado por', 'Personas'], ...expenses.map(x => [x.date, x.title, x.category, x.amount, currency, x.shared ? 'Compartido' : 'Personal', x.paidBy || 'Yo', x.people || 1])]
    const csv = rows.map(row => row.map(v => `"${String(v ?? '').replaceAll('"', '""')}"`).join(';')).join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }); const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'travel-hub-gastos.csv'; a.click(); URL.revokeObjectURL(url)
  }
  const categoryTotals = categories.map(category => ({ category, amount: visibleExpenses.filter(x => x.category === category).reduce((s, x) => s + Number(x.amount || 0), 0) })).filter(x => x.amount > 0).sort((a, b) => b.amount - a.amount)
  const displayCurrency = currency === 'GBP' ? 'GBP' : 'EUR'

  return <div className="app-shell">
    <header className="topbar"><div className="brand"><div className="brand-icon"><Plane size={19}/></div><div><strong>TRAVEL HUB</strong><small>Tu viaje, bajo control</small></div></div><button className="icon-btn" onClick={() => setShowSettings(true)} aria-label="Ajustes"><Settings size={20}/></button></header>
    <main>
      {tab === 'home' && <>
        <section className="hero"><div className="eyebrow">GASTOS DEL VIAJE</div><div className="hero-amount">{money(total, currency)}</div><div className="hero-row"><span>{expenses.length} movimientos registrados</span><span>Personal + compartido</span></div></section>
        <div className="section-heading"><div><span className="eyebrow dark">RESUMEN</span><h2>Tu viaje</h2></div><button className="text-btn" onClick={() => setShowSettings(true)}>Configurar</button></div>
        <div className="quick-grid"><button className="quick-card" onClick={() => {setSharedMode(false);setTab('expenses')}}><Wallet/><b>Mis gastos</b><small>{money(personalTotal,currency)} registrados</small></button><button className="quick-card" onClick={() => {setSharedMode(true);setTab('shared')}}><Users/><b>Compartidos</b><small>{money(sharedTotal,currency)} registrados</small></button><button className="quick-card" onClick={() => setTab('explore')}><MapPin/><b>Explorar</b><small>Qué ver cerca</small></button><button className="quick-card" onClick={() => setTab('plan')}><CalendarDays/><b>Itinerario</b><small>Organizar visitas</small></button></div>
        <div className="section-heading"><div><span className="eyebrow dark">MOVIMIENTOS</span><h2>Últimos gastos</h2></div><button className="text-btn" onClick={() => setTab('expenses')}>Ver todos</button></div>
        {expenses.length ? <ExpenseList items={[...expenses].sort((a,b)=>(b.date||'').localeCompare(a.date||'')).slice(0,4)} currency={currency} onDelete={removeExpense} onEdit={openEdit}/> : <Empty text="Todavía no has añadido gastos."/>}
        <button className="primary wide" onClick={() => openNew(false)}><Plus size={18}/> Añadir gasto</button>
      </>}
      {(tab === 'expenses' || tab === 'shared') && <>
        <div className="page-title"><span className="eyebrow dark">CONTROL DE DINERO</span><h1>{sharedMode ? 'Gastos compartidos' : 'Mis gastos'}</h1><p>Registra y controla cada movimiento del viaje.</p></div>
        <div className="stat-card"><small>Total {sharedMode ? 'compartido' : 'personal'} registrado</small><strong>{money(visibleExpenses.reduce((s,x)=>s+Number(x.amount||0),0),currency)}</strong><span>{visibleExpenses.length} movimientos {sharedMode ? 'compartidos' : 'personales'}</span>{sharedMode && <small className="per-person">Tu parte estimada: {money(visibleExpenses.reduce((s,x)=>s+Number(x.amount||0)/Math.max(1,Number(x.people||1)),0),currency)}</small>}</div>
        <div className="filter-tools"><div className="searchbox"><Search size={17}/><input placeholder="Buscar gastos..." value={search} onChange={e=>setSearch(e.target.value)}/></div><button className="export-btn" onClick={exportCSV} title="Exportar gastos CSV"><Download size={17}/></button></div>
        <div className="filter-row"><label><Filter size={14}/><select value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)}><option>Todas</option>{categories.map(c=><option key={c}>{c}</option>)}</select></label><label><CalendarDays size={14}/><select value={monthFilter} onChange={e=>setMonthFilter(e.target.value)}><option value="Todos">Todos los meses</option>{months.map(m=><option key={m} value={m}>{new Intl.DateTimeFormat('es-ES',{month:'long',year:'numeric'}).format(new Date(`${m}-02T12:00:00`))}</option>)}</select></label></div>
        {categoryTotals.length > 0 && <div className="category-summary"><div className="mini-heading"><PieChart size={15}/> Gastos por categoría</div>{categoryTotals.slice(0,4).map(x=><div className="category-line" key={x.category}><span>{x.category}</span><div className="category-track"><i style={{width:`${Math.max(3,x.amount/Math.max(...categoryTotals.map(y=>y.amount))*100)}%`}}/></div><b>{money(x.amount,currency)}</b></div>)}</div>}
        <div className="list-heading"><b>Movimientos</b><span>{visibleExpenses.length} resultados</span></div>
        <ExpenseList items={visibleExpenses} currency={currency} onDelete={removeExpense} onEdit={openEdit}/>
        <button className="primary wide" onClick={() => openNew(sharedMode)}><Plus size={18}/> Añadir {sharedMode ? 'gasto compartido' : 'gasto personal'}</button>
      </>}
      {tab === 'explore' && <Placeholder icon={<MapPin/>} title="Explorar lugares" text="Aquí añadiremos el mapa, tu ubicación y recomendaciones de sitios cercanos."/>}
      {tab === 'plan' && <Placeholder icon={<CalendarDays/>} title="Tu itinerario" text="Aquí organizaremos los días, visitas y lugares que quieras guardar."/>}
    </main>
    <nav className="bottom-nav"><button className={tab==='home'?'active':''} onClick={()=>setTab('home')}><Wallet/><span>Inicio</span></button><button className={tab==='expenses'?'active':''} onClick={()=>{setSharedMode(false);setCategoryFilter('Todas');setTab('expenses')}}><ArrowDownLeftIcon/><span>Gastos</span></button><button className={tab==='shared'?'active':''} onClick={()=>{setSharedMode(true);setCategoryFilter('Todas');setTab('shared')}}><Users/><span>Compartidos</span></button><button className={tab==='explore'?'active':''} onClick={()=>setTab('explore')}><MapPin/><span>Explorar</span></button><button className={tab==='plan'?'active':''} onClick={()=>setTab('plan')}><CalendarDays/><span>Plan</span></button></nav>
    {showForm && <div className="overlay" onClick={()=>setShowForm(false)}><form className="sheet" onClick={e=>e.stopPropagation()} onSubmit={saveExpense}>
      <div className="sheet-head"><div><span className="eyebrow dark">{editingId ? 'MODIFICAR MOVIMIENTO' : 'NUEVO MOVIMIENTO'}</span><h2>{editingId ? 'Editar gasto' : 'Añadir gasto'}</h2></div><button type="button" className="icon-btn" onClick={()=>setShowForm(false)}><X/></button></div>
      <label>Concepto<input autoFocus placeholder="Ej. Cena, metro, museo..." value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required/></label>
      <label>Importe ({currency === 'GBP' ? '£' : '€'})<input type="number" inputMode="decimal" min="0.01" step="0.01" placeholder="0,00" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} required/></label>
      <div className="form-grid"><label>Categoría<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{categories.map(c=><option key={c}>{c}</option>)}</select></label><label>Fecha<input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></label></div>
      <label className="switch-label"><input type="checkbox" checked={!!form.shared} onChange={e=>setForm({...form,shared:e.target.checked})}/> Este gasto es compartido</label>
      {form.shared && <div className="shared-fields"><label>Quién ha pagado<input value={form.paidBy || ''} onChange={e=>setForm({...form,paidBy:e.target.value})} placeholder="Ej. Yo"/></label><label>Personas entre las que repartir<input type="number" min="1" max="30" value={form.people} onChange={e=>setForm({...form,people:e.target.value})}/></label><p className="hint">Parte estimada por persona: {money((Number(String(form.amount).replace(',','.'))||0)/Math.max(1,Number(form.people)||1),currency)}</p></div>}
      <button className="primary wide" type="submit"><Check size={17}/>{editingId ? 'Guardar cambios' : 'Guardar gasto'}</button>
    </form></div>}
    {showSettings && <div className="overlay" onClick={()=>setShowSettings(false)}><div className="sheet" onClick={e=>e.stopPropagation()}><div className="sheet-head"><div><span className="eyebrow dark">PREFERENCIAS</span><h2>Configuración</h2></div><button className="icon-btn" onClick={()=>setShowSettings(false)}><X/></button></div>
      <label>Moneda principal<select value={currency} onChange={e=>{setCurrency(e.target.value);localStorage.setItem('th-currency',e.target.value)}}><option value="GBP">Libra esterlina (£)</option><option value="EUR">Euro (€)</option></select></label>
      <label>Cambio orientativo: 1 £ = X €<input type="number" step="0.001" value={rate} onChange={e=>{setRate(Number(e.target.value));localStorage.setItem('th-rate',e.target.value)}}/></label>
      <p className="hint">El cambio es editable y manual. Los importes históricos se conservan en la moneda elegida al registrarlos; cambia la moneda principal antes de empezar a registrar gastos.</p>
      <button className="primary wide" onClick={()=>setShowSettings(false)}>Listo</button></div></div>}
  </div>
}
function ArrowDownLeftIcon(){ return <ArrowDownLeft/> }
function ExpenseList({items,currency,onDelete,onEdit}) {
  if (!items.length) return <Empty text="No hay gastos que coincidan con estos filtros."/>
  return <div className="expense-list">{items.map(item=><div className="expense" key={item.id}><div className="expense-symbol"><ArrowDownLeft size={18}/></div><div className="expense-info"><b>{item.title}</b><small>{item.category} · {item.date}{item.shared?` · Compartido (${item.people || 1})`:''}</small></div><strong>{money(item.amount,currency)}</strong><button className="edit-btn" onClick={()=>onEdit(item)} aria-label="Editar gasto"><Pencil size={15}/></button><button className="delete-btn" onClick={()=>onDelete(item.id)} aria-label="Eliminar"><Trash2 size={16}/></button></div>)}</div>
}
function Empty({text}) { return <div className="empty">{text}</div> }
function Placeholder({icon,title,text}) { return <div className="placeholder"><div className="placeholder-icon">{icon}</div><h1>{title}</h1><p>{text}</p><span>Próximamente</span></div> }

createRoot(document.getElementById('root')).render(<App/> )
