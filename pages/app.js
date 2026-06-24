import Head from 'next/head'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Spinner, TierTag, ScoreRing, CopyBtn, Modal, Toast, EmptyState,
  CATEGORIES, STAGES, useToast, parseEmails, callAI
} from '../components/shared'

// Recharts must be loaded client-side only (no SSR)


// ─── Storage helpers ───
const load = (key, def) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def } catch { return def } }
const save = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)) } catch {} }

// ─── Sidebar nav items ───
const NAV = [
  { id: 'dashboard', icon: '⊞', label: 'Dashboard' },
  { id: 'finder', icon: '🔍', label: 'Lead Finder' },
  { id: 'workspace', icon: '◈', label: 'Preview Workspace' },
  { id: 'pipeline', icon: '◫', label: 'Pipeline' },
  { id: 'analytics', icon: '◑', label: 'Analytics' },
  { id: 'outreach', icon: '✉', label: 'Outreach & Email' },
  { id: 'followup', icon: '↻', label: 'Follow-Up' },
  { id: 'appointments', icon: '◷', label: 'Appointments' },
  { id: 'callqueue', icon: '☏', label: 'Call Queue' },
  { id: 'scoring', icon: '◈', label: 'Lead Scoring' },
  { id: 'performance', icon: '◈', label: 'Sales Performance' },
  { id: 'training', icon: '◎', label: 'Sales Training' },
  { id: 'payments', icon: '$', label: 'Payments' },
]

export default function AppV2() {
  const [tab, setTab] = useState('dashboard')
  const [pipeline, setPipeline] = useState([])
  const [searchHistory, setSearchHistory] = useState([])
  const [appointments, setAppointments] = useState([])
  const [performance, setPerformance] = useState({ calls: 0, emails: 0, meetings: 0, closed: 0, revenue: 0 })
  const [quote, setQuote] = useState('')
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [showQuote, setShowQuote] = useState(false)
  const [toast, showToast] = useToast()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    setPipeline(load('rmv2_pipeline', []))
    setSearchHistory(load('rmv2_searches', []))
    setAppointments(load('rmv2_appointments', []))
    setPerformance(load('rmv2_performance', { calls: 0, emails: 0, meetings: 0, closed: 0, revenue: 0 }))
  }, [])

  const savePipeline = (p) => { setPipeline(p); save('rmv2_pipeline', p) }
  const saveAppointments = (a) => { setAppointments(a); save('rmv2_appointments', a) }
  const savePerformance = (p) => { setPerformance(p); save('rmv2_performance', p) }

  const addToPipeline = (lead) => {
    if (pipeline.find(p => p.id === lead.id)) { showToast('Already in pipeline'); return }
    const updated = [...pipeline, { ...lead, stage: 'New', notes: '', followUpDate: '', addedAt: new Date().toISOString() }]
    savePipeline(updated)
    showToast(`${lead.name} added to pipeline ✓`)
  }

  const getQuote = async () => {
    setQuoteLoading(true); setShowQuote(true)
    const data = await callAI('quote', {})
    setQuote(data.result || 'Keep pushing. Every no gets you closer to yes.')
    setQuoteLoading(false)
  }

  const tabProps = { pipeline, savePipeline, addToPipeline, searchHistory, setSearchHistory, appointments, saveAppointments, performance, savePerformance, showToast, setTab }

  return (
    <>
      <Head>
        <title>Robertson Marketing — CRM</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{ display: 'flex', minHeight: '100vh' }}>
        {/* SIDEBAR */}
        <aside style={{ width: 'var(--sidebar-w)', background: 'rgba(10,15,10,0.98)', borderRight: '1px solid var(--border)', position: 'fixed', top: 0, left: 0, bottom: 0, overflowY: 'auto', zIndex: 100, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid var(--border)' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg,#6d8a40,#afc28a)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, color: '#0a0f0a', flexShrink: 0 }}>R</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>Robertson</div>
                <div style={{ fontSize: 10, color: 'var(--olive)', fontWeight: 500 }}>Marketing CRM</div>
              </div>
            </Link>
          </div>
          <nav style={{ flex: 1, padding: '8px 0' }}>
            {NAV.map(n => (
              <button key={n.id} onClick={() => setTab(n.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', background: tab === n.id ? 'rgba(109,138,64,0.15)' : 'transparent', border: 'none', borderLeft: `3px solid ${tab === n.id ? 'var(--olive)' : 'transparent'}`, color: tab === n.id ? 'var(--olive2)' : 'var(--text3)', cursor: 'pointer', fontSize: 13, fontWeight: tab === n.id ? 600 : 400, textAlign: 'left', transition: 'all 0.15s' }}>
                <span style={{ fontSize: 14, opacity: tab === n.id ? 1 : 0.7 }}>{n.icon}</span>
                {n.label}
                {n.id === 'pipeline' && pipeline.length > 0 && <span style={{ marginLeft: 'auto', background: 'var(--olive)', color: '#fff', borderRadius: 100, fontSize: 10, padding: '1px 6px', fontWeight: 700 }}>{pipeline.length}</span>}
              </button>
            ))}
          </nav>
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text3)', lineHeight: 1.5 }}>
            <div style={{ fontWeight: 500, color: 'var(--text2)', marginBottom: 2 }}>Callum Robertson</div>
            <div>robertsonmarketingofficial</div>
            <div>@gmail.com</div>
          </div>
        </aside>

        {/* MAIN */}
        <main style={{ marginLeft: 'var(--sidebar-w)', flex: 1, minHeight: '100vh', padding: '28px 28px 80px' }}>
          {tab === 'dashboard' && <DashboardTab {...tabProps} />}
          {tab === 'finder' && <FinderTab {...tabProps} />}
          {tab === 'workspace' && <WorkspaceTab {...tabProps} />}
          {tab === 'pipeline' && <PipelineTab {...tabProps} />}
          {tab === 'analytics' && <AnalyticsTab {...tabProps} />}
          {tab === 'outreach' && <OutreachTab {...tabProps} />}
          {tab === 'followup' && <FollowUpTab {...tabProps} />}
          {tab === 'appointments' && <AppointmentsTab {...tabProps} />}
          {tab === 'callqueue' && <CallQueueTab {...tabProps} />}
          {tab === 'scoring' && <ScoringTab {...tabProps} />}
          {tab === 'performance' && <PerformanceTab {...tabProps} />}
          {tab === 'training' && <TrainingTab />}
          {tab === 'payments' && <PaymentsTab />}
        </main>
      </div>

      {/* QUOTE BUTTON */}
      <button className="quote-btn" onClick={getQuote} title="Get a motivational quote">💬</button>
      {showQuote && (
        <div className="quote-toast" onClick={() => setShowQuote(false)}>
          {quoteLoading ? <Spinner /> : <>"{quote}"<div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8, fontStyle: 'normal' }}>Click to dismiss</div></>}
        </div>
      )}
      <Toast msg={toast} />
    </>
  )
}

// ═══════════════════════════════════════════
// DASHBOARD TAB
// ═══════════════════════════════════════════
function DashboardTab({ pipeline, setTab, performance }) {
  const hot = pipeline.filter(l => l.tier === 'Hot').length
  const contacted = pipeline.filter(l => l.stage !== 'New').length
  const closed = pipeline.filter(l => l.stage === 'Closed').length
  const overdue = pipeline.filter(l => l.followUpDate && new Date(l.followUpDate) < new Date()).length

  const recentLeads = [...pipeline].sort((a,b) => new Date(b.addedAt) - new Date(a.addedAt)).slice(0, 5)

  return (
    <div>
      <PageHeader title="Dashboard" sub="Welcome back, Callum. Here's your overview." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Total Leads', val: pipeline.length, sub: 'in pipeline' },
          { label: 'Hot Leads', val: hot, sub: 'score 75+' },
          { label: 'Contacted', val: contacted, sub: 'outreach started' },
          { label: 'Closed', val: closed, sub: 'won deals' },
          { label: 'Overdue Follow-Ups', val: overdue, sub: 'need attention' },
          { label: 'Revenue (est.)', val: `$${(closed * 1500).toLocaleString()}`, sub: 'based on closed' },
        ].map(s => <div key={s.label} className="stat-card"><div className="stat-label">{s.label}</div><div className="stat-val">{s.val}</div><div className="stat-sub">{s.sub}</div></div>)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div className="card card-p">
          <div className="section-header">Recent Pipeline Leads</div>
          {recentLeads.length === 0 ? <p style={{ color: 'var(--text3)', fontSize: 13 }}>No leads yet — go find some!</p> : recentLeads.map(l => (
            <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 32, height: 32, borderRadius: 7, background: 'rgba(109,138,64,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--olive)', flexShrink: 0 }}>{l.name[0]}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{l.stage} · {l.category}</div>
              </div>
              <TierTag tier={l.tier} />
            </div>
          ))}
          {recentLeads.length > 0 && <button onClick={() => setTab('pipeline')} className="btn btn-ghost btn-sm" style={{ marginTop: 12 }}>View all →</button>}
        </div>

        <div className="card card-p">
          <div className="section-header">Quick Actions</div>
          {[
            { label: '🔍 Find new leads', tab: 'finder' },
            { label: '◈ Browse workspace', tab: 'workspace' },
            { label: '✉ Draft outreach emails', tab: 'outreach' },
            { label: '↻ Check follow-ups', tab: 'followup' },
            { label: '◷ Log an appointment', tab: 'appointments' },
            { label: '◎ Study sales training', tab: 'training' },
          ].map(a => (
            <button key={a.tab} onClick={() => setTab(a.tab)} style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '10px 0', background: 'none', border: 'none', borderBottom: '1px solid var(--border)', color: 'var(--text2)', cursor: 'pointer', fontSize: 13, fontWeight: 500, textAlign: 'left', gap: 8 }}>
              {a.label}
              <span style={{ marginLeft: 'auto', color: 'var(--text3)', fontSize: 11 }}>→</span>
            </button>
          ))}
        </div>
      </div>

      {overdue > 0 && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#ef4444' }}>⚠ {overdue} overdue follow-up{overdue > 1 ? 's' : ''}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>Don't let leads go cold — check your follow-up list</div>
          </div>
          <button onClick={() => setTab('followup')} className="btn btn-danger btn-sm">View Follow-Ups →</button>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════
// LEAD FINDER TAB
// ═══════════════════════════════════════════
function FinderTab({ addToPipeline, searchHistory, setSearchHistory, showToast }) {
  const [category, setCategory] = useState('Dentist')
  const [location, setLocation] = useState('')
  const [leads, setLeads] = useState([])
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null)
  const [selectedLead, setSelectedLead] = useState(null)
  const [emails, setEmails] = useState({ email1: { subject: '', body: '' }, email2: { subject: '', body: '' } })
  const [aiResult, setAiResult] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [researchQ, setResearchQ] = useState('')
  const [lovablePrompt, setLovablePrompt] = useState('')

  const search = async () => {
    if (!location.trim()) { setError('Enter a location'); return }
    setSearching(true); setError(''); setLeads([])
    try {
      const res = await fetch('/api/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: category, location }) })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      const tagged = (data.leads || []).map(l => ({ ...l, category }))
      setLeads(tagged)
      const entry = { category, location, count: tagged.length, date: new Date().toISOString() }
      const hist = [entry, ...searchHistory].slice(0, 50)
      setSearchHistory(hist); save('rmv2_searches', hist)
      tagged.forEach(async lead => {
        if (lead.website && !lead.website.includes('facebook')) {
          try {
            const r = await fetch('/api/scrape-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ website: lead.website }) })
            const d = await r.json()
            if (d.email) setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, email: d.email } : l))
          } catch {}
        }
      })
    } catch { setError('Search failed') }
    setSearching(false)
  }

  const openEmails = async (lead) => {
    setSelectedLead(lead); setModal('emails'); setAiLoading(true)
    setEmails({ email1: { subject: '', body: '' }, email2: { subject: '', body: '' } })
    const data = await callAI('emails', { lead })
    if (data.result) setEmails(parseEmails(data.result))
    setAiLoading(false)
  }

  const openResearch = (lead) => { setSelectedLead(lead); setResearchQ(''); setAiResult(''); setModal('research') }
  const doResearch = async () => {
    if (!researchQ.trim()) return
    setAiLoading(true); setAiResult('')
    const data = await callAI('research', { lead: selectedLead, question: researchQ })
    setAiResult(data.result || ''); setAiLoading(false)
  }
  const openLovable = async (lead) => {
    setSelectedLead(lead); setLovablePrompt(''); setModal('lovable'); setAiLoading(true)
    const data = await callAI('lovable', { lead })
    setLovablePrompt(data.result || ''); setAiLoading(false)
  }

  return (
    <div>
      <PageHeader title="Lead Finder" sub="Search local businesses across 50+ categories" />
      <div className="card card-p" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 180px' }}>
            <label style={{ fontSize: 11, color: 'var(--text3)', display: 'block', marginBottom: 5 }}>CATEGORY</label>
            <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: 8, fontSize: 13 }}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ flex: '2 1 240px' }}>
            <label style={{ fontSize: 11, color: 'var(--text3)', display: 'block', marginBottom: 5 }}>LOCATION</label>
            <input value={location} onChange={e => setLocation(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} placeholder="e.g. Adelaide SA, Melbourne CBD" style={{ width: '100%', padding: '9px 12px', borderRadius: 8, fontSize: 13 }} />
          </div>
          <button onClick={search} disabled={searching} className="btn btn-primary" style={{ height: 38 }}>
            {searching ? <Spinner size={14} /> : '🔍 Search'}
          </button>
        </div>
        {error && <div style={{ color: '#ef4444', fontSize: 12, marginTop: 8 }}>{error}</div>}
      </div>

      {leads.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 10, marginBottom: 20 }}>
          {[
            { l: 'Found', v: leads.length },
            { l: 'Hot', v: leads.filter(l => l.tier === 'Hot').length },
            { l: 'With Phone', v: leads.filter(l => l.phone).length },
            { l: 'No Website', v: leads.filter(l => l.websiteSignal === 'No website').length },
            { l: 'With Email', v: leads.filter(l => l.email).length },
          ].map(s => <div key={s.l} className="stat-card"><div className="stat-label">{s.l}</div><div className="stat-val">{s.v}</div></div>)}
        </div>
      )}

      {searching && <div style={{ textAlign: 'center', padding: '60px 0' }}><Spinner size={32} /><p style={{ color: 'var(--text3)', fontSize: 13, marginTop: 12 }}>Searching for {category}s in {location}...</p></div>}

      {!searching && leads.map(lead => (
        <div key={lead.id} className="card fade-up" style={{ padding: '14px 18px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ width: 40, height: 40, borderRadius: 9, background: 'rgba(109,138,64,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color: 'var(--olive)', flexShrink: 0 }}>{lead.name[0]}</div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{lead.name}</span>
              <TierTag tier={lead.tier} />
              {lead.websiteSignal === 'No website' && <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 100, background: 'rgba(239,68,68,0.15)', color: '#ef4444', fontWeight: 700 }}>NO SITE</span>}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {lead.phone && <span>📞 {lead.phone}</span>}
              {lead.email && <span>✉ {lead.email}</span>}
              {lead.rating && <span>⭐ {lead.rating}</span>}
              <span style={{ color: lead.websiteSignal === 'No website' ? '#ef4444' : 'var(--text3)' }}>{lead.websiteSignal}</span>
            </div>
          </div>
          <ScoreRing score={lead.score} />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button onClick={() => openEmails(lead)} className="btn btn-ghost btn-sm">✉ Emails</button>
            <button onClick={() => openResearch(lead)} className="btn btn-ghost btn-sm">🤖 Research</button>
            <button onClick={() => openLovable(lead)} className="btn btn-ghost btn-sm">⚡ Lovable</button>
            <button onClick={() => addToPipeline(lead)} className="btn btn-primary btn-sm">+ Pipeline</button>
          </div>
        </div>
      ))}

      {!searching && leads.length === 0 && <EmptyState icon="🔍" title="Search for leads above" sub="Choose a category and location to find scored local businesses." />}

      {modal === 'emails' && <EmailModal lead={selectedLead} emails={emails} loading={aiLoading} onClose={() => setModal(null)} />}
      {modal === 'research' && <ResearchModal lead={selectedLead} result={aiResult} loading={aiLoading} question={researchQ} setQuestion={setResearchQ} onAsk={doResearch} onClose={() => setModal(null)} />}
      {modal === 'lovable' && <LovableModal lead={selectedLead} prompt={lovablePrompt} loading={aiLoading} onClose={() => setModal(null)} />}
    </div>
  )
}

// ═══════════════════════════════════════════
// PREVIEW WORKSPACE TAB
// ═══════════════════════════════════════════
function WorkspaceTab({ pipeline, addToPipeline }) {
  const [selectedLead, setSelectedLead] = useState(null)
  const [autoResearch, setAutoResearch] = useState('')
  const [autoLoading, setAutoLoading] = useState(false)
  const [modal, setModal] = useState(null)
  const [emails, setEmails] = useState({ email1: { subject: '', body: '' }, email2: { subject: '', body: '' } })
  const [aiLoading, setAiLoading] = useState(false)
  const [researchQ, setResearchQ] = useState('')
  const [aiResult, setAiResult] = useState('')
  const [lovablePrompt, setLovablePrompt] = useState('')

  const openLead = async (lead) => {
    setSelectedLead(lead); setAutoResearch(''); setAutoLoading(true)
    const data = await callAI('auto_research', { lead })
    setAutoResearch(data.result || ''); setAutoLoading(false)
  }

  const openEmails = async (lead) => {
    setModal('emails'); setAiLoading(true)
    setEmails({ email1: { subject: '', body: '' }, email2: { subject: '', body: '' } })
    const data = await callAI('emails', { lead })
    if (data.result) setEmails(parseEmails(data.result))
    setAiLoading(false)
  }
  const openResearch = (lead) => { setResearchQ(''); setAiResult(''); setModal('research') }
  const doResearch = async () => {
    if (!researchQ.trim()) return
    setAiLoading(true); setAiResult('')
    const data = await callAI('research', { lead: selectedLead, question: researchQ })
    setAiResult(data.result || ''); setAiLoading(false)
  }
  const openLovable = async (lead) => {
    setLovablePrompt(''); setModal('lovable'); setAiLoading(true)
    const data = await callAI('lovable', { lead })
    setLovablePrompt(data.result || ''); setAiLoading(false)
  }

  if (pipeline.length === 0) return (
    <div><PageHeader title="Preview Workspace" sub="Visual overview of all your pipeline leads" />
      <EmptyState icon="◈" title="No leads in pipeline yet" sub="Add leads from the Lead Finder to see them here." />
    </div>
  )

  return (
    <div>
      <PageHeader title="Preview Workspace" sub={`${pipeline.length} leads in your pipeline`} />
      <div style={{ display: 'grid', gridTemplateColumns: selectedLead ? '1fr 1fr' : 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
        {/* Lead cards */}
        <div style={{ display: selectedLead ? 'flex' : 'contents', flexDirection: 'column', gap: 14 }}>
          {pipeline.map(lead => {
            const isSelected = selectedLead?.id === lead.id
            return (
              <div key={lead.id} onClick={() => openLead(lead)} style={{ background: isSelected ? 'rgba(109,138,64,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isSelected ? 'rgba(109,138,64,0.4)' : 'var(--border)'}`, borderRadius: 14, padding: 16, cursor: 'pointer', transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(109,138,64,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: 'var(--olive)' }}>{lead.name[0]}</div>
                  <div style={{ textAlign: 'right' }}>
                    <ScoreRing score={lead.score} />
                    <TierTag tier={lead.tier} />
                  </div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4, lineHeight: 1.3 }}>{lead.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8 }}>{lead.category} · {lead.address?.split(',').slice(0,2).join(',')}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <WebsiteStrengthBar signal={lead.websiteSignal} />
                </div>
                <div style={{ marginTop: 8, display: 'flex', gap: 8, fontSize: 11, color: 'var(--text3)' }}>
                  {lead.phone && <span>📞 {lead.phone}</span>}
                  {lead.rating && <span>⭐ {lead.rating}</span>}
                </div>
                <div style={{ marginTop: 6, fontSize: 11, fontWeight: 500, color: 'var(--text3)', background: 'rgba(255,255,255,0.03)', borderRadius: 6, padding: '3px 8px', display: 'inline-block' }}>{lead.stage}</div>
              </div>
            )
          })}
        </div>

        {/* Expanded lead detail */}
        {selectedLead && (
          <div className="card card-p fade-up" style={{ position: 'sticky', top: 20, maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <h2 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>{selectedLead.name}</h2>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>{selectedLead.category} · {selectedLead.address?.split(',').slice(0,2).join(',')}</div>
              </div>
              <button onClick={() => setSelectedLead(null)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 20, padding: 4 }}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
              <InfoItem label="Score" val={selectedLead.score + '/99'} />
              <InfoItem label="Tier" val={selectedLead.tier} />
              <InfoItem label="Phone" val={selectedLead.phone || '—'} />
              <InfoItem label="Email" val={selectedLead.email || '—'} />
              <InfoItem label="Website" val={selectedLead.websiteSignal} />
              <InfoItem label="Rating" val={selectedLead.rating ? `${selectedLead.rating} ⭐` : '—'} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div className="section-header">AI Sales Brief</div>
              {autoLoading ? <div style={{ textAlign: 'center', padding: '20px 0' }}><Spinner /><div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8 }}>Generating brief...</div></div>
                : <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{autoResearch}</div>}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={() => openEmails(selectedLead)} className="btn btn-primary btn-sm">✉ Emails</button>
              <button onClick={() => openResearch(selectedLead)} className="btn btn-ghost btn-sm">🤖 Research</button>
              <button onClick={() => openLovable(selectedLead)} className="btn btn-ghost btn-sm">⚡ Lovable</button>
              {selectedLead.website && <a href={selectedLead.website} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">🌐 Website</a>}
            </div>
          </div>
        )}
      </div>

      {modal === 'emails' && <EmailModal lead={selectedLead} emails={emails} loading={aiLoading} onClose={() => setModal(null)} />}
      {modal === 'research' && <ResearchModal lead={selectedLead} result={aiResult} loading={aiLoading} question={researchQ} setQuestion={setResearchQ} onAsk={doResearch} onClose={() => setModal(null)} />}
      {modal === 'lovable' && <LovableModal lead={selectedLead} prompt={lovablePrompt} loading={aiLoading} onClose={() => setModal(null)} />}
    </div>
  )
}

// ═══════════════════════════════════════════
// PIPELINE TAB
// ═══════════════════════════════════════════
function PipelineTab({ pipeline, savePipeline, showToast }) {
  const [stageFilter, setStageFilter] = useState('All')
  const [modal, setModal] = useState(null)
  const [selectedLead, setSelectedLead] = useState(null)
  const [emails, setEmails] = useState({ email1: { subject: '', body: '' }, email2: { subject: '', body: '' } })
  const [aiLoading, setAiLoading] = useState(false)
  const [bulkEmail, setBulkEmail] = useState({ subject: '', body: '' })
  const [researchQ, setResearchQ] = useState('')
  const [aiResult, setAiResult] = useState('')
  const [lovablePrompt, setLovablePrompt] = useState('')

  const filtered = stageFilter === 'All' ? pipeline : pipeline.filter(p => p.stage === stageFilter)
  const updateStage = (id, stage) => savePipeline(pipeline.map(p => p.id === id ? { ...p, stage } : p))
  const updateNotes = (id, notes) => savePipeline(pipeline.map(p => p.id === id ? { ...p, notes } : p))
  const updateFollowUp = (id, followUpDate) => savePipeline(pipeline.map(p => p.id === id ? { ...p, followUpDate } : p))
  const remove = (id) => { savePipeline(pipeline.filter(p => p.id !== id)); showToast('Lead removed') }

  const openEmails = async (lead) => {
    setSelectedLead(lead); setModal('emails'); setAiLoading(true)
    setEmails({ email1: { subject: '', body: '' }, email2: { subject: '', body: '' } })
    const data = await callAI('emails', { lead })
    if (data.result) setEmails(parseEmails(data.result))
    setAiLoading(false)
  }
  const openResearch = (lead) => { setSelectedLead(lead); setResearchQ(''); setAiResult(''); setModal('research') }
  const doResearch = async () => {
    if (!researchQ.trim()) return
    setAiLoading(true); setAiResult('')
    const data = await callAI('research', { lead: selectedLead, question: researchQ })
    setAiResult(data.result || ''); setAiLoading(false)
  }
  const openLovable = async (lead) => {
    setSelectedLead(lead); setLovablePrompt(''); setModal('lovable'); setAiLoading(true)
    const data = await callAI('lovable', { lead })
    setLovablePrompt(data.result || ''); setAiLoading(false)
  }
  const openBulk = async () => {
    setModal('bulk'); setAiLoading(true); setBulkEmail({ subject: '', body: '' })
    const data = await callAI('bulk_emails', { leads: pipeline })
    if (data.result) {
      const m = data.result.match(/---EMAIL---([\s\S]*?)---END---/)
      if (m) {
        const lines = m[1].trim().split('\n')
        const si = lines.findIndex(l => l.startsWith('Subject:'))
        setBulkEmail({ subject: lines[si]?.replace('Subject:','').trim() || '', body: lines.slice(si+1).join('\n').trim() })
      }
    }
    setAiLoading(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <PageHeader title="Pipeline" sub={`${pipeline.length} leads tracked`} noMargin />
        {pipeline.length > 0 && <button onClick={openBulk} className="btn btn-ghost btn-sm">✉ Bulk Email</button>}
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {['All', ...STAGES].map(s => (
          <button key={s} onClick={() => setStageFilter(s)} style={{ padding: '4px 11px', borderRadius: 7, border: `1px solid ${stageFilter === s ? 'rgba(109,138,64,0.5)' : 'var(--border)'}`, background: stageFilter === s ? 'rgba(109,138,64,0.12)' : 'transparent', color: stageFilter === s ? 'var(--olive2)' : 'var(--text3)', cursor: 'pointer', fontSize: 12, fontWeight: stageFilter === s ? 600 : 400 }}>{s}</button>
        ))}
      </div>
      {filtered.length === 0 && <EmptyState icon="◫" title="No leads here" sub={stageFilter === 'All' ? 'Add leads from the Lead Finder' : `No leads in "${stageFilter}" stage`} />}
      {filtered.map(lead => (
        <div key={lead.id} className="card" style={{ padding: '14px 18px', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ width: 38, height: 38, borderRadius: 8, background: 'rgba(109,138,64,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: 'var(--olive)', flexShrink: 0 }}>{lead.name[0]}</div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{lead.name}</span>
                <TierTag tier={lead.tier} />
                <ScoreRing score={lead.score} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)', display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                {lead.phone && <span>📞 {lead.phone}</span>}
                {lead.email && <span>✉ {lead.email}</span>}
                <span>{lead.websiteSignal}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <select value={lead.stage} onChange={e => updateStage(lead.id, e.target.value)} style={{ padding: '4px 8px', borderRadius: 7, fontSize: 12, minWidth: 140 }}>
                  {STAGES.map(s => <option key={s}>{s}</option>)}
                </select>
                <input value={lead.notes || ''} onChange={e => updateNotes(lead.id, e.target.value)} placeholder="Notes..." style={{ flex: 1, minWidth: 120, padding: '4px 8px', borderRadius: 7, fontSize: 12 }} />
                <input type="date" value={lead.followUpDate || ''} onChange={e => updateFollowUp(lead.id, e.target.value)} style={{ padding: '4px 8px', borderRadius: 7, fontSize: 12 }} title="Follow-up date" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button onClick={() => openEmails(lead)} className="btn btn-ghost btn-sm">✉</button>
              <button onClick={() => openResearch(lead)} className="btn btn-ghost btn-sm">🤖</button>
              <button onClick={() => openLovable(lead)} className="btn btn-ghost btn-sm">⚡</button>
              <button onClick={() => remove(lead.id)} className="btn btn-danger btn-sm">×</button>
            </div>
          </div>
        </div>
      ))}
      {modal === 'emails' && <EmailModal lead={selectedLead} emails={emails} loading={aiLoading} onClose={() => setModal(null)} />}
      {modal === 'research' && <ResearchModal lead={selectedLead} result={aiResult} loading={aiLoading} question={researchQ} setQuestion={setResearchQ} onAsk={doResearch} onClose={() => setModal(null)} />}
      {modal === 'lovable' && <LovableModal lead={selectedLead} prompt={lovablePrompt} loading={aiLoading} onClose={() => setModal(null)} />}
      {modal === 'bulk' && (
        <Modal title={`Bulk email — ${pipeline.length} leads`} onClose={() => setModal(null)}>
          {aiLoading ? <div style={{ textAlign: 'center', padding: '30px 0' }}><Spinner size={28} /></div> : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text3)' }}>Replace <strong style={{ color: 'var(--olive2)' }}>[BUSINESS_NAME]</strong> for each send.</p>
                <CopyBtn text={`Subject: ${bulkEmail.subject}\n\n${bulkEmail.body}`} label="Copy" />
              </div>
              {bulkEmail.subject && <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '8px 12px', marginBottom: 8, fontSize: 13 }}><strong style={{ color: 'var(--text3)' }}>Subject:</strong> {bulkEmail.subject}</div>}
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '14px', fontSize: 13, color: 'var(--text)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{bulkEmail.body}</div>
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════
// ANALYTICS TAB
// ═══════════════════════════════════════════

// Lazy chart loader - renders each chart type from the dynamic charts bundle
function ChartsLoader({ type, data }) {
  const [Mod, setMod] = useState(null)
  useEffect(() => {
    import('../components/charts').then(m => setMod(m))
  }, [])
  if (!Mod) return <div style={{height:180,display:'flex',alignItems:'center',justifyContent:'center',color:'#6b7280',fontSize:12}}>Loading chart...</div>
  if (type === 'stage') return <Mod.StageBarChart data={data} />
  if (type === 'tier') return <Mod.TierPieChart data={data} />
  if (type === 'website') return <Mod.WebsitePieChart data={data} />
  if (type === 'score') return <Mod.ScoreBarChart data={data} />
  if (type === 'activity') return <Mod.ActivityBarChart data={data} />
  return null
}

function AnalyticsTab({ pipeline, searchHistory }) {
  const stageData = STAGES.map(s => ({ name: s, value: pipeline.filter(p => p.stage === s).length })).filter(d => d.value > 0)
  const tierData = [
    { name: 'Hot', value: pipeline.filter(l => l.tier === 'Hot').length, color: '#ef4444' },
    { name: 'Warm', value: pipeline.filter(l => l.tier === 'Warm').length, color: '#f97316' },
    { name: 'Cold', value: pipeline.filter(l => l.tier === 'Cold').length, color: '#6b7280' },
  ].filter(d => d.value > 0)
  const websiteData = [
    { name: 'No website', value: pipeline.filter(l => l.websiteSignal === 'No website').length },
    { name: 'Social only', value: pipeline.filter(l => l.websiteSignal === 'Social only').length },
    { name: 'Basic builder', value: pipeline.filter(l => l.websiteSignal === 'Basic builder').length },
    { name: 'Has website', value: pipeline.filter(l => l.websiteSignal === 'Has website').length },
  ].filter(d => d.value > 0)
  const scoreRanges = [
    { name: '90-99', value: pipeline.filter(l => l.score >= 90).length },
    { name: '75-89', value: pipeline.filter(l => l.score >= 75 && l.score < 90).length },
    { name: '50-74', value: pipeline.filter(l => l.score >= 50 && l.score < 75).length },
    { name: '0-49', value: pipeline.filter(l => l.score < 50).length },
  ]
  const CHART_COLORS = ['#6d8a40','#afc28a','#ef4444','#f97316','#3b82f6','#a855f7']
  const topCategories = Object.entries(
    pipeline.reduce((acc, l) => { acc[l.category || 'Unknown'] = (acc[l.category || 'Unknown'] || 0) + 1; return acc }, {})
  ).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 6)
  const convRate = pipeline.length > 0 ? ((pipeline.filter(p => p.stage === 'Closed').length / pipeline.length) * 100).toFixed(1) : 0

  return (
    <div>
      <PageHeader title="Analytics" sub="Real data from your pipeline and search activity" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 10, marginBottom: 24 }}>
        {[
          { l: 'Total in Pipeline', v: pipeline.length },
          { l: 'Avg Score', v: pipeline.length ? Math.round(pipeline.reduce((s,l) => s+l.score,0)/pipeline.length) : 0 },
          { l: 'Conversion Rate', v: convRate + '%' },
          { l: 'Total Searches', v: searchHistory.length },
          { l: 'Phone Numbers', v: pipeline.filter(l=>l.phone).length },
          { l: 'Emails Found', v: pipeline.filter(l=>l.email).length },
        ].map(s => <div key={s.l} className="stat-card"><div className="stat-label">{s.l}</div><div className="stat-val">{s.v}</div></div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="card card-p">
          <div className="section-header">Pipeline Stage Breakdown</div>
          <ChartsLoader type="stage" data={stageData} />
        </div>
        <div className="card card-p">
          <div className="section-header">Lead Tier Distribution</div>
          <ChartsLoader type="tier" data={tierData} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="card card-p">
          <div className="section-header">Website Strength Breakdown</div>
          <ChartsLoader type="website" data={websiteData} />
        </div>
        <div className="card card-p">
          <div className="section-header">Score Distribution</div>
          <ChartsLoader type="score" data={scoreRanges} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card card-p">
          <div className="section-header">Top Categories in Pipeline</div>
          {topCategories.length === 0 ? <p style={{ color: 'var(--text3)', fontSize: 13 }}>No data yet</p> :
            topCategories.map((c, i) => (
              <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ flex: 1, fontSize: 13, color: 'var(--text)' }}>{c.name}</div>
                <div style={{ height: 8, width: `${Math.max(8,(c.value / topCategories[0].value) * 120)}px`, background: CHART_COLORS[i % CHART_COLORS.length], borderRadius: 4 }} />
                <div style={{ fontSize: 12, color: 'var(--text3)', minWidth: 20, textAlign: 'right' }}>{c.value}</div>
              </div>
            ))
          }
        </div>
        <div className="card card-p">
          <div className="section-header">Recent Search History</div>
          {searchHistory.length === 0 ? <p style={{ color: 'var(--text3)', fontSize: 13 }}>No searches yet</p> :
            searchHistory.slice(0,10).map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                <span style={{ color: 'var(--text)' }}>{s.category} in {s.location}</span>
                <span style={{ color: 'var(--olive)' }}>{s.count} leads</span>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════
// OUTREACH & EMAIL TAB
// ═══════════════════════════════════════════
function OutreachTab({ pipeline, showToast }) {
  const [selectedLead, setSelectedLead] = useState(null)
  const [emails, setEmails] = useState({ email1: { subject: '', body: '' }, email2: { subject: '', body: '' } })
  const [loading, setLoading] = useState(false)
  const [bulkEmail, setBulkEmail] = useState(null)
  const [bulkLoading, setBulkLoading] = useState(false)

  const genEmails = async (lead) => {
    setSelectedLead(lead); setLoading(true)
    setEmails({ email1: { subject: '', body: '' }, email2: { subject: '', body: '' } })
    const data = await callAI('emails', { lead })
    if (data.result) setEmails(parseEmails(data.result))
    setLoading(false)
  }

  const genBulk = async () => {
    setBulkLoading(true); setBulkEmail(null)
    const data = await callAI('bulk_emails', { leads: pipeline })
    if (data.result) {
      const m = data.result.match(/---EMAIL---([\s\S]*?)---END---/)
      if (m) {
        const lines = m[1].trim().split('\n')
        const si = lines.findIndex(l => l.startsWith('Subject:'))
        setBulkEmail({ subject: lines[si]?.replace('Subject:','').trim() || '', body: lines.slice(si+1).join('\n').trim() })
      }
    }
    setBulkLoading(false)
  }

  return (
    <div>
      <PageHeader title="Outreach & Email" sub="AI-powered personalised email drafts for every lead" />
      <div style={{ display: 'grid', gridTemplateColumns: selectedLead ? '1fr 1fr' : '1fr', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div className="section-header" style={{ margin: 0 }}>Select a lead to draft emails</div>
            <button onClick={genBulk} disabled={bulkLoading || pipeline.length === 0} className="btn btn-ghost btn-sm">{bulkLoading ? <Spinner size={12} /> : '✉ Bulk Email Template'}</button>
          </div>
          {pipeline.length === 0 && <EmptyState icon="✉" title="No leads in pipeline" sub="Add leads from the Lead Finder first." />}
          {pipeline.map(lead => (
            <div key={lead.id} onClick={() => genEmails(lead)} style={{ padding: '12px 16px', marginBottom: 6, background: selectedLead?.id === lead.id ? 'rgba(109,138,64,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${selectedLead?.id === lead.id ? 'rgba(109,138,64,0.35)' : 'var(--border)'}`, borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 7, background: 'rgba(109,138,64,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--olive)' }}>{lead.name[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{lead.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{lead.category} · {lead.websiteSignal}</div>
              </div>
              <TierTag tier={lead.tier} />
            </div>
          ))}
        </div>
        {selectedLead && (
          <div>
            <div className="section-header">Emails for {selectedLead.name}</div>
            {loading ? <div style={{ textAlign: 'center', padding: '40px 0' }}><Spinner size={28} /><p style={{ color: 'var(--text3)', fontSize: 13, marginTop: 10 }}>Generating personalised emails...</p></div> : (
              [{ key: 'email1', label: 'Email 1 — Website / Marketing pitch' }, { key: 'email2', label: 'Email 2 — General intro pitch' }].map(({ key, label }) => {
                const email = emails[key]
                return (
                  <div key={key} className="card card-p" style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--olive2)' }}>{label}</div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <CopyBtn text={`Subject: ${email.subject}\n\n${email.body}`} label="Copy" />
                        {selectedLead.email && <a href={`mailto:${selectedLead.email}?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.body)}`} className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>Send →</a>}
                      </div>
                    </div>
                    {email.subject && <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 7, padding: '7px 10px', marginBottom: 8, fontSize: 12, color: 'var(--text2)' }}><strong style={{ color: 'var(--text3)' }}>Subject:</strong> {email.subject}</div>}
                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '12px', fontSize: 13, color: 'var(--text)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{email.body}</div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
      {bulkEmail && (
        <div className="card card-p" style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Bulk Email Template — {pipeline.length} leads</div>
            <CopyBtn text={`Subject: ${bulkEmail.subject}\n\n${bulkEmail.body}`} label="Copy template" />
          </div>
          {bulkEmail.subject && <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 7, padding: '7px 10px', marginBottom: 8, fontSize: 12 }}><strong style={{ color: 'var(--text3)' }}>Subject:</strong> {bulkEmail.subject}</div>}
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '12px', fontSize: 13, color: 'var(--text)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{bulkEmail.body}</div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════
// FOLLOW-UP TAB
// ═══════════════════════════════════════════
function FollowUpTab({ pipeline, savePipeline }) {
  const today = new Date(); today.setHours(0,0,0,0)
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1)
  const nextWeek = new Date(today); nextWeek.setDate(nextWeek.getDate()+7)

  const withDates = pipeline.filter(l => l.followUpDate)
  const overdue = withDates.filter(l => new Date(l.followUpDate) < today)
  const dueToday = withDates.filter(l => { const d = new Date(l.followUpDate); return d >= today && d < tomorrow })
  const upcoming = withDates.filter(l => { const d = new Date(l.followUpDate); return d >= tomorrow && d <= nextWeek })
  const later = withDates.filter(l => new Date(l.followUpDate) > nextWeek)
  const none = pipeline.filter(l => !l.followUpDate)

  const updateFollowUp = (id, followUpDate) => savePipeline(pipeline.map(p => p.id === id ? { ...p, followUpDate } : p))

  const Section = ({ title, leads, color }) => leads.length === 0 ? null : (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10 }}>{title} ({leads.length})</div>
      {leads.map(lead => (
        <div key={lead.id} className="card" style={{ padding: '12px 16px', marginBottom: 6, borderLeft: `3px solid ${color}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{lead.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>{lead.stage} · {lead.phone || 'No phone'}</div>
            </div>
            <input type="date" value={lead.followUpDate || ''} onChange={e => updateFollowUp(lead.id, e.target.value)} style={{ padding: '4px 8px', borderRadius: 7, fontSize: 12 }} />
            <TierTag tier={lead.tier} />
          </div>
          {lead.notes && <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6, fontStyle: 'italic' }}>"{lead.notes}"</div>}
        </div>
      ))}
    </div>
  )

  return (
    <div>
      <PageHeader title="Follow-Up Tracker" sub="Never let a lead go cold" />
      {pipeline.length === 0 ? <EmptyState icon="↻" title="No leads yet" sub="Add leads to your pipeline and set follow-up dates." /> : (
        <>
          <Section title="⚠ Overdue" leads={overdue} color="#ef4444" />
          <Section title="📅 Due Today" leads={dueToday} color="#f97316" />
          <Section title="🔜 This Week" leads={upcoming} color="#6d8a40" />
          <Section title="📆 Later" leads={later} color="#6b7280" />
          {none.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10 }}>No follow-up set ({none.length})</div>
              {none.map(lead => (
                <div key={lead.id} className="card" style={{ padding: '12px 16px', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1, fontSize: 13, color: 'var(--text)' }}>{lead.name} <span style={{ color: 'var(--text3)', fontSize: 11 }}>— {lead.stage}</span></div>
                    <input type="date" value="" onChange={e => updateFollowUp(lead.id, e.target.value)} style={{ padding: '4px 8px', borderRadius: 7, fontSize: 12 }} placeholder="Set date" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {withDates.length === 0 && none.length > 0 && <div style={{ background: 'rgba(109,138,64,0.08)', border: '1px solid rgba(109,138,64,0.2)', borderRadius: 10, padding: '14px 16px', fontSize: 13, color: 'var(--text2)', marginTop: 8 }}>💡 Set follow-up dates on leads above to track them here</div>}
        </>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════
// APPOINTMENTS TAB
// ═══════════════════════════════════════════
function AppointmentsTab({ pipeline, appointments, saveAppointments, showToast }) {
  const [form, setForm] = useState({ leadId: '', date: '', time: '', type: 'Call', notes: '', outcome: '' })
  const [showForm, setShowForm] = useState(false)

  const addAppt = () => {
    if (!form.leadId || !form.date) { showToast('Select a lead and date'); return }
    const lead = pipeline.find(p => p.id === form.leadId)
    const appt = { ...form, id: Date.now().toString(), leadName: lead?.name || '', createdAt: new Date().toISOString() }
    saveAppointments([...appointments, appt])
    setForm({ leadId: '', date: '', time: '', type: 'Call', notes: '', outcome: '' })
    setShowForm(false)
    showToast('Appointment logged ✓')
  }

  const updateOutcome = (id, outcome) => saveAppointments(appointments.map(a => a.id === id ? { ...a, outcome } : a))
  const remove = (id) => { saveAppointments(appointments.filter(a => a.id !== id)); showToast('Removed') }

  const upcoming = appointments.filter(a => !a.outcome && new Date(`${a.date}T${a.time||'00:00'}`) >= new Date())
  const past = appointments.filter(a => a.outcome || new Date(`${a.date}T${a.time||'00:00'}`) < new Date())

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <PageHeader title="Appointments" sub="Log calls, meetings and track outcomes" noMargin />
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary btn-sm">+ Log Appointment</button>
      </div>
      {showForm && (
        <div className="card card-p" style={{ marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 10, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text3)', display: 'block', marginBottom: 4 }}>LEAD</label>
              <select value={form.leadId} onChange={e => setForm({...form, leadId: e.target.value})} style={{ width: '100%', padding: '8px 10px', borderRadius: 7, fontSize: 13 }}>
                <option value="">Select lead...</option>
                {pipeline.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text3)', display: 'block', marginBottom: 4 }}>DATE</label>
              <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} style={{ width: '100%', padding: '8px 10px', borderRadius: 7, fontSize: 13 }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text3)', display: 'block', marginBottom: 4 }}>TIME</label>
              <input type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} style={{ width: '100%', padding: '8px 10px', borderRadius: 7, fontSize: 13 }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text3)', display: 'block', marginBottom: 4 }}>TYPE</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} style={{ width: '100%', padding: '8px 10px', borderRadius: 7, fontSize: 13 }}>
                {['Call','In-person meeting','Video call','Demo','Follow-up call'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 11, color: 'var(--text3)', display: 'block', marginBottom: 4 }}>NOTES</label>
            <input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="What's the agenda / what happened..." style={{ width: '100%', padding: '8px 10px', borderRadius: 7, fontSize: 13 }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={addAppt} className="btn btn-primary btn-sm">Save Appointment</button>
            <button onClick={() => setShowForm(false)} className="btn btn-ghost btn-sm">Cancel</button>
          </div>
        </div>
      )}
      {appointments.length === 0 && !showForm && <EmptyState icon="◷" title="No appointments yet" sub="Log calls and meetings to track your outreach activity." action="Log First Appointment" onAction={() => setShowForm(true)} />}
      {upcoming.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div className="section-header">Upcoming ({upcoming.length})</div>
          {upcoming.map(a => <AppointmentCard key={a.id} appt={a} onOutcome={updateOutcome} onRemove={remove} />)}
        </div>
      )}
      {past.length > 0 && (
        <div>
          <div className="section-header">Past ({past.length})</div>
          {past.map(a => <AppointmentCard key={a.id} appt={a} onOutcome={updateOutcome} onRemove={remove} past />)}
        </div>
      )}
    </div>
  )
}

function AppointmentCard({ appt, onOutcome, onRemove, past }) {
  const outcomeColors = { 'Won': '#6d8a40', 'No show': '#ef4444', 'Follow-up needed': '#f97316', 'Not interested': '#6b7280', 'Meeting booked': '#3b82f6' }
  return (
    <div className="card" style={{ padding: '14px 18px', marginBottom: 8, borderLeft: `3px solid ${appt.outcome ? (outcomeColors[appt.outcome] || '#6b7280') : '#6d8a40'}` }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>{appt.leadName}</div>
          <div style={{ fontSize: 12, color: 'var(--text3)' }}>{appt.type} · {appt.date}{appt.time ? ` at ${appt.time}` : ''}</div>
          {appt.notes && <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4, fontStyle: 'italic' }}>"{appt.notes}"</div>}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={appt.outcome || ''} onChange={e => onOutcome(appt.id, e.target.value)} style={{ padding: '4px 8px', borderRadius: 7, fontSize: 12 }}>
            <option value="">Set outcome...</option>
            {Object.keys(outcomeColors).map(o => <option key={o}>{o}</option>)}
          </select>
          <button onClick={() => onRemove(appt.id)} className="btn btn-danger btn-sm">×</button>
        </div>
      </div>
      {appt.outcome && <div style={{ marginTop: 8, display: 'inline-block', padding: '2px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, background: `${outcomeColors[appt.outcome]}22`, color: outcomeColors[appt.outcome] }}>{appt.outcome}</div>}
    </div>
  )
}

// ═══════════════════════════════════════════
// CALL QUEUE TAB
// ═══════════════════════════════════════════
function CallQueueTab({ pipeline, savePipeline }) {
  const callableLeads = pipeline.filter(l => l.phone).sort((a,b) => b.score - a.score)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [callNotes, setCallNotes] = useState({})
  const [called, setCalled] = useState([])

  const current = callableLeads[currentIdx]
  const markCalled = (id, outcome) => {
    setCalled(prev => [...prev, id])
    savePipeline(pipeline.map(p => p.id === id ? { ...p, stage: outcome === 'Answered' ? 'Contacted' : p.stage, notes: (p.notes ? p.notes + ' | ' : '') + `Called: ${outcome}` } : p))
    if (currentIdx < callableLeads.length - 1) setCurrentIdx(prev => prev + 1)
  }

  return (
    <div>
      <PageHeader title="Call Queue" sub="Work through your leads by phone, highest score first" />
      {callableLeads.length === 0 ? <EmptyState icon="☏" title="No leads with phone numbers" sub="Add leads from the Lead Finder — most include phone numbers." /> : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <div className="section-header">Queue ({callableLeads.length} leads with phones)</div>
            {callableLeads.map((lead, i) => (
              <div key={lead.id} onClick={() => setCurrentIdx(i)} style={{ padding: '10px 14px', marginBottom: 6, background: i === currentIdx ? 'rgba(109,138,64,0.1)' : called.includes(lead.id) ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.03)', border: `1px solid ${i === currentIdx ? 'rgba(109,138,64,0.35)' : 'var(--border)'}`, borderRadius: 9, cursor: 'pointer', opacity: called.includes(lead.id) ? 0.45 : 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--text3)', minWidth: 22 }}>#{i+1}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{lead.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{lead.phone}</div>
                  </div>
                  <ScoreRing score={lead.score} />
                  <TierTag tier={lead.tier} />
                  {called.includes(lead.id) && <span style={{ fontSize: 10, color: '#6d8a40' }}>✓</span>}
                </div>
              </div>
            ))}
          </div>
          {current && (
            <div className="card card-p fade-up">
              <div className="section-header">Now Calling</div>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(109,138,64,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: 'var(--olive)', margin: '0 auto 12px' }}>{current.name[0]}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{current.name}</div>
                <a href={`tel:${current.phone}`} style={{ fontSize: 22, fontWeight: 800, color: 'var(--olive2)', textDecoration: 'none', display: 'block', marginBottom: 6 }}>{current.phone}</a>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>{current.address?.split(',').slice(0,2).join(',')}</div>
                <div style={{ marginTop: 8 }}><TierTag tier={current.tier} /> <span style={{ fontSize: 12, color: 'var(--text3)', marginLeft: 6 }}>{current.websiteSignal}</span></div>
              </div>
              <textarea value={callNotes[current.id] || ''} onChange={e => setCallNotes({...callNotes, [current.id]: e.target.value})} placeholder="Call notes..." style={{ width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 13, minHeight: 80, resize: 'vertical', marginBottom: 12 }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {['Answered','No answer','Voicemail','Wrong number'].map(o => (
                  <button key={o} onClick={() => markCalled(current.id, o)} className={`btn ${o === 'Answered' ? 'btn-primary' : 'btn-ghost'} btn-sm`}>{o}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════
// LEAD SCORING TAB
// ═══════════════════════════════════════════
function ScoringTab({ pipeline, showToast }) {
  const [selectedLead, setSelectedLead] = useState(null)
  const [explanation, setExplanation] = useState('')
  const [loading, setLoading] = useState(false)

  const explainScore = async (lead) => {
    setSelectedLead(lead); setLoading(true); setExplanation('')
    const data = await callAI('score_explanation', { lead })
    setExplanation(data.result || ''); setLoading(false)
  }

  const sorted = [...pipeline].sort((a,b) => b.score - a.score)

  return (
    <div>
      <PageHeader title="Lead Scoring" sub="Understand why each lead is scored the way it is" />
      <div className="card card-p" style={{ marginBottom: 20, fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>
        <strong style={{ color: 'var(--olive2)' }}>How scoring works:</strong> Leads start at 50. No website adds 40 points (biggest opportunity). Social-only presence adds 25. Basic builder site (Wix/Squarespace) adds 15. Low reviews or low ratings add small bonuses. Maximum score is 99.
        <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, background: '#ef4444', color: '#fff' }}>Hot = 75+</span>
          <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, background: '#f97316', color: '#fff' }}>Warm = 50–74</span>
          <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, background: '#6b7280', color: '#fff' }}>Cold = under 50</span>
        </div>
      </div>
      {pipeline.length === 0 ? <EmptyState icon="◈" title="No leads to score" sub="Add leads from the Lead Finder to see scoring breakdowns." /> : (
        <div style={{ display: 'grid', gridTemplateColumns: selectedLead ? '1fr 1fr' : '1fr', gap: 16 }}>
          <div>
            {sorted.map(lead => (
              <div key={lead.id} onClick={() => explainScore(lead)} style={{ padding: '14px 18px', marginBottom: 8, background: selectedLead?.id === lead.id ? 'rgba(109,138,64,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${selectedLead?.id === lead.id ? 'rgba(109,138,64,0.3)' : 'var(--border)'}`, borderRadius: 10, cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <ScoreRing score={lead.score} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{lead.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{lead.websiteSignal} · {lead.category}</div>
                  </div>
                  <TierTag tier={lead.tier} />
                </div>
                <div style={{ marginTop: 10 }}>
                  <ScoreBar score={lead.score} />
                </div>
              </div>
            ))}
          </div>
          {selectedLead && (
            <div className="card card-p fade-up">
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{selectedLead.name}</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
                <ScoreRing score={selectedLead.score} /><TierTag tier={selectedLead.tier} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                <InfoItem label="Website" val={selectedLead.websiteSignal} />
                <InfoItem label="Rating" val={selectedLead.rating ? `${selectedLead.rating}/5` : 'None'} />
                <InfoItem label="Reviews" val={selectedLead.reviewCount || 0} />
                <InfoItem label="Phone" val={selectedLead.phone ? 'Listed' : 'None'} />
              </div>
              <div className="section-header">AI Score Explanation</div>
              {loading ? <div style={{ textAlign: 'center', padding: '20px 0' }}><Spinner /></div>
                : <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{explanation}</div>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════
// SALES PERFORMANCE TAB
// ═══════════════════════════════════════════
function PerformanceTab({ pipeline, appointments, performance, savePerformance }) {
  const closed = pipeline.filter(p => p.stage === 'Closed').length
  const contacted = pipeline.filter(p => p.stage !== 'New').length
  const meetings = appointments.filter(a => a.type === 'In-person meeting' || a.type === 'Video call' || a.type === 'Demo').length
  const wonAppts = appointments.filter(a => a.outcome === 'Won').length

  const update = (field, val) => savePerformance({ ...performance, [field]: Number(val) || 0 })

  const convRate = pipeline.length > 0 ? ((closed / pipeline.length) * 100).toFixed(1) : 0
  const meetingRate = contacted > 0 ? ((meetings / contacted) * 100).toFixed(1) : 0
  const estRevenue = closed * 1500

  const weeklyData = [
    { day: 'Mon', calls: Math.floor(Math.random() * 8 + 2), emails: Math.floor(Math.random() * 10 + 3) },
    { day: 'Tue', calls: Math.floor(Math.random() * 8 + 2), emails: Math.floor(Math.random() * 10 + 3) },
    { day: 'Wed', calls: Math.floor(Math.random() * 8 + 2), emails: Math.floor(Math.random() * 10 + 3) },
    { day: 'Thu', calls: Math.floor(Math.random() * 8 + 2), emails: Math.floor(Math.random() * 10 + 3) },
    { day: 'Fri', calls: Math.floor(Math.random() * 8 + 2), emails: Math.floor(Math.random() * 10 + 3) },
  ]

  return (
    <div>
      <PageHeader title="Sales Performance" sub="Your personal sales metrics and projections" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 10, marginBottom: 24 }}>
        {[
          { l: 'Leads in Pipeline', v: pipeline.length },
          { l: 'Contacted', v: contacted },
          { l: 'Meetings Held', v: meetings },
          { l: 'Deals Closed', v: closed },
          { l: 'Conversion Rate', v: convRate + '%' },
          { l: 'Est. Revenue', v: `$${estRevenue.toLocaleString()}` },
        ].map(s => <div key={s.l} className="stat-card"><div className="stat-label">{s.l}</div><div className="stat-val">{s.v}</div></div>)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="card card-p">
          <div className="section-header">Manual Activity Tracker</div>
          <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 14 }}>Log your daily activity to track progress over time.</p>
          {[
            { label: 'Cold calls made', field: 'calls' },
            { label: 'Emails sent', field: 'emails' },
            { label: 'Meetings booked', field: 'meetings' },
            { label: 'Deals closed', field: 'closed' },
          ].map(({ label, field }) => (
            <div key={field} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <label style={{ fontSize: 13, color: 'var(--text2)' }}>{label}</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button onClick={() => update(field, (performance[field] || 0) - 1)} style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text)', cursor: 'pointer', fontSize: 16 }}>−</button>
                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--olive2)', minWidth: 32, textAlign: 'center' }}>{performance[field] || 0}</span>
                <button onClick={() => update(field, (performance[field] || 0) + 1)} style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(109,138,64,0.15)', border: '1px solid rgba(109,138,64,0.3)', color: 'var(--olive2)', cursor: 'pointer', fontSize: 16 }}>+</button>
              </div>
            </div>
          ))}
        </div>
        <div className="card card-p">
          <div className="section-header">Revenue Projection</div>
          <div style={{ marginBottom: 12 }}>
            {[
              { service: 'Website build ($1,500)', monthly: closed * 1500 },
              { service: 'Hosting ($100/mo × clients)', monthly: closed * 100 },
              { service: 'Local SEO ($250/mo)', monthly: closed * 250 },
              { service: 'Meta Ads ($400/mo)', monthly: closed * 400 },
            ].map(r => (
              <div key={r.service} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                <span style={{ color: 'var(--text2)' }}>{r.service}</span>
                <span style={{ color: 'var(--olive2)', fontWeight: 600 }}>${r.monthly.toLocaleString()}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: 14, fontWeight: 700 }}>
              <span style={{ color: 'var(--text)' }}>Total (if all upsold)</span>
              <span style={{ color: 'var(--olive)' }}>${(closed * 2250).toLocaleString()}/mo</span>
            </div>
          </div>
          <div style={{ background: 'rgba(109,138,64,0.08)', border: '1px solid rgba(109,138,64,0.15)', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: 'var(--olive2)' }}>
            🎯 Goal: 5 full retainer clients = $52,500/year recurring
          </div>
        </div>
      </div>

      <div className="card card-p">
        <div className="section-header">Simulated Weekly Activity</div>
        <ChartsLoader type="activity" data={weeklyData} />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════
// SALES TRAINING TAB
// ═══════════════════════════════════════════
const MODULES = [
  { num: 1, title: 'Sales Mindset', content: `The foundation of everything. Before you make a single call or send a single email, your mindset needs to be right.\n\nKey principles:\n• Rejection is data, not failure. Every "no" tells you something.\n• You are solving a real problem. Most local businesses genuinely need better marketing.\n• Confidence comes from preparation, not personality.\n• Sales is a skill that is learned, not a talent you're born with.\n\nMindset reframe: You're not "selling" — you're offering a business a genuine opportunity to get more customers. If they say no, that's their loss.\n\nDaily habit: Before any outreach session, remind yourself: "I'm here to help businesses grow. Some will see it, some won't. That's fine."` },
  { num: 2, title: 'Understanding Tradies & Local Business', content: `Who you're selling to matters more than what you're selling.\n\nLocal business owners (especially tradies) are:\n• Time-poor — they're on tools, not on screens\n• Skeptical of salespeople — they've been burned before\n• Results-focused — they want more calls, more jobs\n• Relationship-driven — they buy from people they trust\n\nWhat they actually want:\n• More enquiries (not "a website")\n• To look professional to new customers\n• To beat the competitor down the road\n• To stop relying only on word-of-mouth\n\nSell the outcome, not the product. Don't say "I'll build you a website." Say "I'll help you show up when someone in [suburb] searches for [trade]."` },
  { num: 3, title: 'Building Your Offer', content: `Your core offer needs to be simple, clear, and compelling.\n\nStarter offer (easy yes):\n• Professional website for $1,500 one-off\n• Hosting + maintenance for $100/month\n• Guarantee: live within 2 weeks\n\nWhy this works:\n• Low risk for the business owner\n• Fast delivery builds trust\n• Monthly retainer opens the door to upsells\n\nUpsell path:\nWebsite → Local SEO ($250/mo) → Meta Ads ($400/mo) → Full retainer\n\nDemo sites: Build 2-3 fake demo sites for different trades before you start outreach. When you find a lead, you can say "I actually built a demo for a plumber last week — want to see it?" This is incredibly powerful.` },
  { num: 4, title: 'Prospecting & Lead Generation', content: `Use Robertson Marketing to find leads automatically. But here's how to think about prospecting strategically.\n\nBest categories to start with:\n• Tradies (plumbers, electricians, roofers, painters) — high value, low digital sophistication\n• Health (dentists, physios, chiros) — high income, care about reputation\n• Hospitality (cafes, restaurants) — visible, easy to research\n\nScoring your leads:\n• No website = 🔥 hottest opportunity\n• Social-only (Facebook page) = very strong lead\n• Wix/Squarespace = solid opportunity\n• Custom website = harder pitch, focus elsewhere\n\nTarget volume: Find 30 new leads per week minimum. You need volume for the numbers to work.` },
  { num: 5, title: 'Pre-Approach Research', content: `Before you contact any lead, spend 3-5 minutes researching them.\n\nCheck:\n1. Google their business name — what comes up?\n2. Do they have a website? What does it look like on mobile?\n3. How are their Google reviews? How many?\n4. Are they on Facebook/Instagram? When did they last post?\n5. Who is the owner? (Often on their website or LinkedIn)\n\nUse Robertson Marketing's AI Researcher to speed this up.\n\nWhat you're looking for:\n• Pain points (bad reviews about not being able to contact them, website looks old)\n• Opportunities (competitor in same suburb with a great site)\n• Conversation openers ("I noticed you've got 47 great reviews but no website — that's a lot of social proof going to waste")\n\nThe more specific you can be in your outreach, the better your response rate.` },
  { num: 6, title: 'Cold Calling', content: `The fastest way to get results. Most people avoid it, which means less competition for you.\n\nThe framework:\n1. Introduction (5 seconds)\n2. Reason for call (10 seconds)\n3. Curiosity hook (10 seconds)\n4. Permission to continue\n\nScript:\n"Hey [Name], my name's Callum, I'm a web designer based in Adelaide. I was looking at your Google listing and noticed you've got [X reviews / no website / a Facebook page but no site] — I've been helping tradies in the area get a proper online presence. Is that something you've thought about at all?"\n\nHandle the first objection:\n"Not interested" → "No worries at all. Can I ask — is it because timing isn't right, or you're happy with where things are online?"\n\nKey: Your goal on a cold call is NOT to sell. It's to book a conversation.` },
  { num: 7, title: 'Walk-In Approach', content: `Walking into a business is one of the most underrated tactics. Almost no one does it.\n\nWhen to use it:\n• Local tradies with a physical shopfront or yard\n• Cafes, restaurants, retail shops\n• Any business you drive past regularly\n\nApproach:\n• Go in-person during quiet hours (10am-12pm or 2pm-4pm)\n• Be casual, not salesy\n• Don't carry brochures or folders — just your phone\n\nScript:\n"Hey, is the owner around? ... Hi [Name], I'm Callum, I do web design for local businesses around here. I was driving past and noticed you didn't have a website listed on Google — I thought I'd pop in since I'm in the area. Do you have 2 minutes?"\n\nPro tip: Show them their Google listing on your phone. Then show them a competitor's website. The contrast does the selling for you.` },
  { num: 8, title: 'Cold Email & DM', content: `Email and DMs work best as a follow-up to cold calling, or for businesses you can't reach by phone.\n\nEmail principles:\n• Subject line is everything — get curious, be specific\n• First line should reference something about THEIR business\n• Keep it under 150 words\n• One clear call to action\n• Don't attach anything in the first email\n\nDM (Instagram/Facebook):\n• Works well for cafes, salons, lifestyle businesses\n• Start by engaging with their content genuinely\n• Then DM: "Hey [Name] — love what you're doing with [X]. I noticed you don't have a website though — I build sites for local businesses and thought I'd reach out. Would you be open to a quick chat?"\n\nUse Robertson Marketing to generate personalised email drafts automatically.` },
  { num: 9, title: 'The Discovery Meeting', content: `When you get a meeting, your job is to listen, not pitch.\n\n5-phase structure:\n1. Build rapport (5 min) — ask about their business, how long they've been operating, what's going well\n2. Identify pain (10 min) — "Where do most of your customers come from right now?" "Have you ever had a website?" "What would it mean for the business if you were showing up on Google?"\n3. Vision (5 min) — "If we could get you showing up when someone in [suburb] searches for [trade], what would that be worth to you?"\n4. Present (10 min) — show your demo, explain what you'd build for them\n5. Close (5 min) — ask for the sale\n\nGolden rule: Let them talk 70% of the time. The more they talk, the more they sell themselves.` },
  { num: 10, title: 'Presenting the Demo', content: `The demo is your most powerful sales tool. Done right, it closes deals on the spot.\n\nHow to build a demo:\n• Use Lovable.dev to build a real website for their business type\n• Personalise it with their business name, location, and trade\n• Make it mobile-first (show it on your phone first)\n• Include: hero section with their trade + suburb, services, about, reviews section, contact form\n\nHow to present it:\n1. Hand them your phone\n2. Let them scroll in silence for 30 seconds\n3. Ask: "What do you think?"\n4. Then: "Imagine your customers seeing this when they search for [trade] in [suburb]"\n\nUse Robertson Marketing's Lovable prompt generator to build these demos faster.` },
  { num: 11, title: 'Objection Handling', content: `Every objection is a question in disguise.\n\nCommon objections:\n\n"I'll think about it"\n→ "Totally fair. What specifically would you need to feel confident moving forward?"\n\n"It's too expensive"\n→ "I get that. Can I ask — if this brought you even 2 extra jobs a month, would that cover it?"\n\n"I already have someone doing my marketing"\n→ "Great — are you happy with the results you're getting from them?"\n\n"I don't need a website, I get all my work through referrals"\n→ "That's amazing — and it tells me your reputation is strong. The website just makes sure that reputation is working for you 24/7, even when you're on a job."\n\n"Let me talk to my partner"\n→ "Of course. Would it help if I put together a quick summary you could show them?"` },
  { num: 12, title: 'Closing Techniques', content: `Closing is just asking clearly and confidently.\n\nThe Assumptive Close:\n"So shall we get started this week? I can have a draft ready in 5 days."\n\nThe Choice Close:\n"Would you prefer to do the full package today, or start with just the website and add hosting later?"\n\nThe Urgency Close (use sparingly):\n"I've actually got another [plumber/dentist/etc] in your area I'm speaking to this week — I wanted to come to you first since you've got stronger reviews."\n\nThe Summary Close:\n"So we've agreed on [X, Y, Z], the investment is $1,500 for the build and $100/month after that, and you'd have it live within 2 weeks. Are you happy to get started?"\n\nRule: After you ask the closing question, stop talking. The first person to speak loses.` },
  { num: 13, title: 'Pricing & Negotiation', content: `Don't apologise for your prices. Confidence in pricing = confidence in your value.\n\nPricing anchoring:\nAlways present your highest package first. Then come down to the starter offer. It feels like a discount even when it isn't.\n\nWhen they push back on price:\n• Ask "What were you thinking?" — sometimes they'll name a number higher than your discount\n• Offer to remove something rather than discount: "I could do the site without the contact form for $1,200 — but honestly I wouldn't recommend it"\n• Offer a payment split: "$750 now, $750 on delivery"\n\nNever go below your floor price. If they can't afford you, they're not your client — yet.` },
  { num: 14, title: 'Follow-Up & Referrals', content: `Most sales happen on follow-up. Most salespeople give up after one contact.\n\nFollow-up timeline:\n• Day 0 (within 1 hour): Thank you + demo link\n• Day 4: Check in — did they get a chance to look?\n• Day 9: Value add — share a relevant stat or competitor insight\n• Day 18: Break-up message — take the pressure off completely\n\nThe break-up message often generates a reply. It removes all pressure and people re-engage.\n\nReferrals:\nAsk at the moment of highest satisfaction — when they see their finished website live for the first time.\n\n"Do you know any other tradies who might want something like this? I'm building my client base and the best way I grow is through people like you."\n\nRevenue goal: 5 full retainer clients = $52,500/year recurring.` },
]

function TrainingTab() {
  const [activeModule, setActiveModule] = useState(0)
  const [completed, setCompleted] = useState([])
  const mod = MODULES[activeModule]

  const markDone = () => {
    if (!completed.includes(activeModule)) setCompleted([...completed, activeModule])
    if (activeModule < MODULES.length - 1) setActiveModule(activeModule + 1)
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 20, minHeight: '80vh' }}>
      <div className="card" style={{ padding: '16px 0', position: 'sticky', top: 20, maxHeight: '80vh', overflowY: 'auto' }}>
        <div style={{ padding: '0 16px 12px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--olive)', marginBottom: 4 }}>SALES TRAINING</div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'var(--olive)', borderRadius: 2, width: `${(completed.length / MODULES.length) * 100}%`, transition: 'width 0.4s' }} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{completed.length}/{MODULES.length} modules</div>
        </div>
        {MODULES.map((m, i) => (
          <button key={i} onClick={() => setActiveModule(i)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', background: activeModule === i ? 'rgba(109,138,64,0.12)' : 'transparent', border: 'none', borderLeft: `3px solid ${activeModule === i ? 'var(--olive)' : 'transparent'}`, color: activeModule === i ? 'var(--olive2)' : completed.includes(i) ? 'var(--text3)' : 'var(--text2)', cursor: 'pointer', textAlign: 'left', fontSize: 12, fontWeight: activeModule === i ? 600 : 400 }}>
            <span style={{ width: 20, height: 20, borderRadius: '50%', background: completed.includes(i) ? 'var(--olive)' : activeModule === i ? 'rgba(109,138,64,0.2)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: completed.includes(i) ? '#fff' : 'var(--text3)', flexShrink: 0 }}>
              {completed.includes(i) ? '✓' : m.num}
            </span>
            <span style={{ lineHeight: 1.3 }}>{m.title}</span>
          </button>
        ))}
      </div>
      <div className="card card-p fade-up">
        <div style={{ fontSize: 11, color: 'var(--olive)', fontWeight: 600, marginBottom: 6 }}>MODULE {mod.num} OF {MODULES.length}</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', margin: '0 0 20px', letterSpacing: '-0.02em' }}>{mod.title}</h1>
        <div style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.85, whiteSpace: 'pre-wrap', borderLeft: '3px solid rgba(109,138,64,0.25)', paddingLeft: 16 }}>
          {mod.content}
        </div>
        <div style={{ marginTop: 28, display: 'flex', gap: 10 }}>
          {activeModule > 0 && <button onClick={() => setActiveModule(activeModule - 1)} className="btn btn-ghost">← Previous</button>}
          <button onClick={markDone} className="btn btn-primary">{activeModule === MODULES.length - 1 ? '🏆 Complete Course' : 'Mark Done & Next →'}</button>
        </div>
        {completed.length === MODULES.length && (
          <div style={{ marginTop: 20, background: 'rgba(109,138,64,0.1)', border: '1px solid rgba(109,138,64,0.25)', borderRadius: 10, padding: '16px 18px', fontSize: 14, color: 'var(--olive2)', lineHeight: 1.6 }}>
            🏆 <strong>Course Complete!</strong> You've completed all 14 modules of the Robertson Marketing Sales Mastery course. Now execute: 20 new prospects per week, 10 cold contacts, 3+ meetings. Review your metrics every Sunday.
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════
// PAYMENTS TAB
// ═══════════════════════════════════════════
function PaymentsTab() {
  return (
    <div>
      <PageHeader title="Payments" sub="Manage invoices and Stripe payments" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { icon: '💳', title: 'Stripe Dashboard', desc: 'View payments, manage subscriptions, and process refunds in Stripe.', link: 'https://dashboard.stripe.com', label: 'Open Stripe →' },
          { icon: '📄', title: 'Create Invoice', desc: 'Send professional invoices directly through Stripe Invoicing.', link: 'https://dashboard.stripe.com/invoices/create', label: 'New Invoice →' },
          { icon: '🔗', title: 'Payment Links', desc: 'Create a no-code payment link to send to clients.', link: 'https://dashboard.stripe.com/payment-links', label: 'Create Link →' },
          { icon: '📊', title: 'Stripe Reports', desc: 'View revenue, payouts, and financial reports.', link: 'https://dashboard.stripe.com/reports', label: 'View Reports →' },
        ].map(c => (
          <div key={c.title} className="card card-p">
            <div style={{ fontSize: 28, marginBottom: 10 }}>{c.icon}</div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: '0 0 6px' }}>{c.title}</h3>
            <p style={{ fontSize: 13, color: 'var(--text3)', margin: '0 0 14px', lineHeight: 1.5 }}>{c.desc}</p>
            <a href={c.link} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>{c.label}</a>
          </div>
        ))}
      </div>
      <div className="card card-p">
        <div className="section-header">Pricing Reference</div>
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th>Service</th><th>Price</th><th>Type</th><th>Annual per client</th></tr></thead>
            <tbody>
              {[
                ['Website build', '$1,500', 'One-off', '$1,500'],
                ['Hosting & maintenance', '$100/mo', 'Monthly', '$1,200'],
                ['Local SEO', '$250/mo', 'Monthly', '$3,000'],
                ['Meta Ads management', '$400/mo', 'Monthly', '$4,800'],
                ['Full retainer (Year 1)', '—', '—', '$10,500+'],
              ].map(([s,p,t,a]) => (
                <tr key={s}><td>{s}</td><td style={{ color: 'var(--olive2)', fontWeight: 600 }}>{p}</td><td style={{ color: 'var(--text3)' }}>{t}</td><td style={{ color: 'var(--olive)', fontWeight: 700 }}>{a}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 14, background: 'rgba(109,138,64,0.08)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--olive2)' }}>
          🎯 5 clients on full retainers = $52,500/year recurring
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════
// REUSABLE MODAL COMPONENTS
// ═══════════════════════════════════════════
function EmailModal({ lead, emails, loading, onClose }) {
  return (
    <Modal title={`Outreach emails — ${lead?.name}`} onClose={onClose}>
      {loading ? <div style={{ textAlign: 'center', padding: '40px 0' }}><Spinner size={28} /><p style={{ color: 'var(--text3)', fontSize: 13, marginTop: 10 }}>Generating personalised emails...</p></div> : (
        [{ key: 'email1', label: 'Email 1 — Website / Marketing pitch' }, { key: 'email2', label: 'Email 2 — General intro pitch' }].map(({ key, label }) => {
          const email = emails[key]
          return (
            <div key={key} style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--olive2)' }}>{label}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <CopyBtn text={`Subject: ${email.subject}\n\n${email.body}`} label="Copy" />
                  {lead?.email && <a href={`mailto:${lead.email}?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.body)}`} className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>Send</a>}
                </div>
              </div>
              {email.subject && <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 7, padding: '7px 10px', marginBottom: 6, fontSize: 12 }}><strong style={{ color: 'var(--text3)' }}>Subject:</strong> {email.subject}</div>}
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '12px', fontSize: 13, color: 'var(--text)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{email.body || '—'}</div>
            </div>
          )
        })
      )}
    </Modal>
  )
}

function ResearchModal({ lead, result, loading, question, setQuestion, onAsk, onClose }) {
  return (
    <Modal title={`AI Researcher — ${lead?.name}`} onClose={onClose}>
      <div style={{ background: 'rgba(109,138,64,0.07)', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: 'var(--text2)', marginBottom: 14 }}>
        {lead?.name} · {lead?.address?.split(',').slice(0,2).join(',')} · {lead?.websiteSignal}
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => e.key === 'Enter' && onAsk()} placeholder="Ask anything about this business..." style={{ flex: 1, padding: '9px 12px', borderRadius: 8, fontSize: 13 }} />
        <button onClick={onAsk} disabled={loading || !question.trim()} className="btn btn-primary">{loading ? <Spinner size={14} /> : 'Ask'}</button>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
        {['Best pitch angle?', 'What do they need?', 'How to open the conversation?', 'Common objections?'].map(q => (
          <button key={q} onClick={() => setQuestion(q)} style={{ padding: '4px 10px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text3)', cursor: 'pointer', fontSize: 11 }}>{q}</button>
        ))}
      </div>
      {result && <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '14px', fontSize: 13, color: 'var(--text)', lineHeight: 1.75, whiteSpace: 'pre-wrap' }} className="fade-up">{result}</div>}
    </Modal>
  )
}

function LovableModal({ lead, prompt, loading, onClose }) {
  return (
    <Modal title={`Lovable.dev prompt — ${lead?.name}`} onClose={onClose}>
      {loading ? <div style={{ textAlign: 'center', padding: '40px 0' }}><Spinner size={28} /><p style={{ color: 'var(--text3)', fontSize: 13, marginTop: 10 }}>Generating website brief...</p></div> : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text3)' }}>Paste straight into <a href="https://lovable.dev" target="_blank" rel="noreferrer" style={{ color: 'var(--olive2)' }}>lovable.dev</a></p>
            <CopyBtn text={prompt} label="Copy prompt" />
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '14px', fontSize: 13, color: 'var(--text)', lineHeight: 1.7, whiteSpace: 'pre-wrap', maxHeight: 400, overflowY: 'auto' }}>{prompt}</div>
        </>
      )}
    </Modal>
  )
}

// ═══════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════
function PageHeader({ title, sub, noMargin }) {
  return (
    <div style={{ marginBottom: noMargin ? 0 : 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>{title}</h1>
      {sub && <p style={{ fontSize: 13, color: 'var(--text3)', margin: 0 }}>{sub}</p>}
    </div>
  )
}

function InfoItem({ label, val }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 7, padding: '8px 10px' }}>
      <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{val}</div>
    </div>
  )
}

function WebsiteStrengthBar({ signal }) {
  const map = { 'No website': { pct: 5, color: '#ef4444' }, 'Social only': { pct: 25, color: '#f97316' }, 'Basic builder': { pct: 50, color: '#f59e0b' }, 'Has website': { pct: 80, color: '#6d8a40' } }
  const { pct, color } = map[signal] || { pct: 50, color: '#6b7280' }
  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text3)', marginBottom: 3 }}>
        <span>Website strength</span><span style={{ color }}>{signal}</span>
      </div>
      <div style={{ height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 2 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2, transition: 'width 0.6s' }} />
      </div>
    </div>
  )
}

function ScoreBar({ score }) {
  const color = score >= 75 ? '#ef4444' : score >= 50 ? '#f97316' : '#6b7280'
  return (
    <div style={{ height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 3 }}>
      <div style={{ height: '100%', width: `${score}%`, background: color, borderRadius: 3, transition: 'width 0.6s' }} />
    </div>
  )
}

function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)) } catch {} }
