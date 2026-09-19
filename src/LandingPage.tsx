import React, { useState, useEffect, useRef } from 'react';

interface LandingPageProps {
  onLaunchCommandCenter: () => void;
}

const NAV_ITEMS = [
  {
    label: 'Overview',
    href: '#hero',
    dropdown: [
      { icon: 'emergency_share', label: 'What is Phoenix Grid?', desc: 'Decentralized emergency response platform', href: '#hero' },
      { icon: 'public', label: 'Global Coverage', desc: '142,000+ active nodes worldwide', href: '#hero' },
      { icon: 'history', label: 'System Status', desc: 'Live operational health — V2.4.1', href: '#hero' },
    ],
  },
  {
    label: 'Features',
    href: '#features',
    dropdown: [
      { icon: 'analytics', label: 'AI Risk Prediction', desc: 'Predictive threat modeling & early warnings', href: '#features' },
      { icon: 'enhanced_encryption', label: 'Quantum Encryption', desc: 'Lattice-based zero-knowledge crypto', href: '#features' },
      { icon: 'hub', label: 'Mesh Networking', desc: 'P2P ad-hoc network without towers', href: '#how-it-works' },
      { icon: 'memory', label: 'AI Triage & Routing', desc: 'Edge-AI dispatch for fastest response', href: '#how-it-works' },
      { icon: 'admin_panel_settings', label: 'Command Oversight', desc: 'Real-time tactical ops view', href: '#how-it-works' },
    ],
  },
  {
    label: 'Simulations',
    href: '#protocols',
    dropdown: [
      { icon: 'crisis_alert', label: 'Disaster Simulator', desc: 'Run mock flood, earthquake scenarios', href: '#protocols' },
      { icon: 'route', label: 'Evacuation Planner', desc: 'AI-optimized route generation', href: '#protocols' },
      { icon: 'sensors', label: 'Network Stress Test', desc: 'Test mesh resilience under load', href: '#protocols' },
      { icon: 'integration_instructions', label: 'API Playground', desc: 'Live PHOENIX_CORE API sandbox', href: '#protocols' },
    ],
  },
];

export default function LandingPage({ onLaunchCommandCenter }: LandingPageProps) {
  // ── All state declarations first ─────────────────────────
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [activePanel, setActivePanel] = useState<'mesh' | 'security' | 'region' | null>(null);
  const [meshPing, setMeshPing] = useState(14);
  const [nodeCount, setNodeCount] = useState(142021);
  const [selectedRegion, setSelectedRegion] = useState('Global — All Regions');

  const dropdownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const REGIONS = [
    { code: '🌐', label: 'Global — All Regions' },
    { code: '🇵🇰', label: 'Pakistan' },
    { code: '🇮🇳', label: 'India' },
    { code: '🇺🇸', label: 'United States' },
    { code: '🇬🇧', label: 'United Kingdom' },
    { code: '🇹🇷', label: 'Turkey' },
    { code: '🇸🇦', label: 'Saudi Arabia' },
    { code: '🇧🇩', label: 'Bangladesh' },
    { code: '🇲🇾', label: 'Malaysia' },
    { code: '🇮🇩', label: 'Indonesia' },
  ];

  // ── Effects ───────────────────────────────────────────────
  const handleMouseMove = (e: React.MouseEvent) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    setMousePos({ x, y });
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleScroll = () => setScrolled(el.scrollTop > 20);
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  // Live mesh data ticker
  useEffect(() => {
    const t = setInterval(() => {
      setMeshPing(Math.floor(Math.random() * 8) + 10);
      setNodeCount(prev => prev + Math.floor(Math.random() * 6) - 2);
    }, 2000);
    return () => clearInterval(t);
  }, []);

  // Close panel on outside click
  useEffect(() => {
    if (!activePanel) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-panel-root]')) setActivePanel(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [activePanel]);

  // ── Helpers ───────────────────────────────────────────────
  const smoothScrollTo = (href: string) => {
    const id = href.replace('#', '');
    const el = containerRef.current?.querySelector(`#${id}`) as HTMLElement | null;
    if (el && containerRef.current) {
      const offset = el.offsetTop - 0;
      containerRef.current.scrollTo({ top: offset, behavior: 'smooth' });
    }
    setActiveDropdown(null);
  };

  const openDropdown = (label: string) => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setActiveDropdown(label);
  };

  const closeDropdown = () => {
    dropdownTimeout.current = setTimeout(() => setActiveDropdown(null), 120);
  };

  const keepDropdown = () => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
  };

  const togglePanel = (p: 'mesh' | 'security' | 'region') =>
    setActivePanel(prev => (prev === p ? null : p));

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="w-screen bg-[#090e1b] text-white font-sans selection:bg-[#00e5ff]/30"
      style={{ height: '100vh', overflowY: 'auto', overflowX: 'hidden', scrollBehavior: 'smooth' }}>
      
      {/* ── 1. Header ── */}
      <header className={`sticky top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#090e1b]/95 shadow-[0_4px_30px_rgba(0,0,0,0.4)]' : 'bg-[#090e1b]/80'} backdrop-blur-md border-b border-[#3b494c]/30`}>
        <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => smoothScrollTo('#hero')} className="flex items-center gap-4 group">
            <div className="w-10 h-10 rounded-lg bg-[#00e5ff]/10 border border-[#00e5ff]/30 shadow-[0_0_15px_rgba(0,229,255,0.2)] flex items-center justify-center group-hover:bg-[#00e5ff]/20 group-hover:shadow-[0_0_25px_rgba(0,229,255,0.35)] transition-all duration-300">
              <span className="material-symbols-outlined text-[#00e5ff]" style={{ fontVariationSettings: "'FILL' 1" }}>emergency_share</span>
            </div>
            <span className="text-xl font-black tracking-widest text-[#00e5ff] drop-shadow-[0_0_10px_rgba(0,229,255,0.5)] group-hover:drop-shadow-[0_0_18px_rgba(0,229,255,0.8)] transition-all duration-300">PHOENIX GRID</span>
          </button>

          {/* Nav with Dropdowns */}
          <nav className="hidden md:flex gap-2 text-[11px] font-mono font-bold uppercase tracking-widest text-[#849396]">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => openDropdown(item.label)}
                onMouseLeave={closeDropdown}
              >
                <button
                  onClick={() => smoothScrollTo(item.href)}
                  className={`flex items-center gap-1 px-4 py-2 rounded-md transition-all duration-200 ${
                    activeDropdown === item.label
                      ? 'text-white bg-[#00e5ff]/10'
                      : 'hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                  <span
                    className={`material-symbols-outlined transition-transform duration-200 ${activeDropdown === item.label ? 'rotate-180 text-[#00e5ff]' : ''}`}
                    style={{ fontSize: '14px' }}
                  >
                    expand_more
                  </span>
                </button>

                {/* Dropdown Panel */}
                <div
                  onMouseEnter={keepDropdown}
                  onMouseLeave={closeDropdown}
                  className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 transition-all duration-200 origin-top ${
                    activeDropdown === item.label
                      ? 'opacity-100 scale-100 pointer-events-auto'
                      : 'opacity-0 scale-95 pointer-events-none'
                  }`}
                >
                  {/* Arrow tip */}
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#0d1526] border-l border-t border-[#00e5ff]/20 rotate-45"></div>
                  <div className="bg-[#0d1526]/95 backdrop-blur-xl border border-[#00e5ff]/20 rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_40px_rgba(0,229,255,0.08)] overflow-hidden mt-1.5">
                    <div className="p-1.5">
                      {item.dropdown.map((d) => (
                        <button
                          key={d.label}
                          onClick={() => smoothScrollTo(d.href)}
                          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-[#00e5ff]/10 transition-all duration-150 group/item text-left"
                        >
                          <div className="w-8 h-8 rounded-md bg-[#00e5ff]/10 border border-[#00e5ff]/20 flex items-center justify-center flex-shrink-0 group-hover/item:bg-[#00e5ff]/20 group-hover/item:border-[#00e5ff]/40 transition-all duration-150">
                            <span className="material-symbols-outlined text-[#00e5ff]" style={{ fontSize: '16px' }}>{d.icon}</span>
                          </div>
                          <div>
                            <div className="text-[11px] font-bold text-white uppercase tracking-wider group-hover/item:text-[#00e5ff] transition-colors duration-150">{d.label}</div>
                            <div className="text-[10px] text-[#849396] normal-case font-normal tracking-normal mt-0.5">{d.desc}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-[#3b494c]/40 px-4 py-2.5 flex items-center justify-between">
                      <span className="text-[9px] font-mono text-[#849396] uppercase tracking-widest">Phoenix Grid</span>
                      <span className="flex items-center gap-1 text-[9px] font-mono text-[#3ce36a]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#3ce36a] animate-pulse"></span>
                        ONLINE
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-6">
            <button onClick={onLaunchCommandCenter} className="hidden sm:block px-6 py-2.5 bg-[#00e5ff]/10 border border-[#00e5ff]/50 text-[#00e5ff] text-[11px] font-mono font-bold uppercase tracking-wider rounded-md hover:bg-[#00e5ff]/20 hover:shadow-[0_0_25px_rgba(0,229,255,0.3)] hover:scale-105 shadow-[0_0_20px_rgba(0,229,255,0.15)] transition-all duration-200 active:scale-95">
              Sign In / Launch
            </button>
            <div className="flex gap-2 text-[#849396]" data-panel-root>

              {/* ── Mesh Status Icon ── */}
              <div className="relative">
                <button
                  onClick={() => togglePanel('mesh')}
                  title="Mesh Network Status"
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 ${activePanel === 'mesh' ? 'bg-[#00e5ff]/15 text-[#00e5ff] shadow-[0_0_12px_rgba(0,229,255,0.3)]' : 'hover:bg-white/5 hover:text-[#00e5ff]'}`}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>wifi_tethering</span>
                </button>
                {/* Mesh Panel */}
                {activePanel === 'mesh' && (
                  <div className="absolute top-full right-0 mt-3 w-80 bg-[#0d1526]/98 backdrop-blur-xl border border-[#00e5ff]/25 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_40px_rgba(0,229,255,0.1)] overflow-hidden z-50 animate-fade-in">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#3b494c]/40 bg-[#00e5ff]/5">
                      <div className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest text-[#00e5ff]">
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>wifi_tethering</span>
                        Mesh Network
                      </div>
                      <span className="flex items-center gap-1 text-[9px] font-mono text-[#3ce36a]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#3ce36a] animate-pulse"></span>LIVE
                      </span>
                    </div>
                    <div className="p-4 space-y-3">
                      {/* Live stats */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[#161b29] rounded-xl p-3 border border-[#3b494c]/30">
                          <div className="text-[9px] font-mono text-[#849396] uppercase tracking-wider mb-1">Latency</div>
                          <div className="text-xl font-black font-mono text-white">{meshPing}<span className="text-xs text-[#3ce36a] ml-1">ms</span></div>
                          <div className="text-[9px] text-[#3ce36a] font-mono mt-0.5">● Optimal</div>
                        </div>
                        <div className="bg-[#161b29] rounded-xl p-3 border border-[#3b494c]/30">
                          <div className="text-[9px] font-mono text-[#849396] uppercase tracking-wider mb-1">Active Nodes</div>
                          <div className="text-xl font-black font-mono text-white">{nodeCount.toLocaleString()}</div>
                          <div className="text-[9px] text-[#00e5ff] font-mono mt-0.5">+4K this hour</div>
                        </div>
                      </div>
                      {/* Node list */}
                      <div className="space-y-2">
                        {[
                          { name: 'NODE ALPHA', coord: '24°51\'N 67°00\'E', status: 'ACTIVE', ping: '12ms' },
                          { name: 'NODE BRAVO', coord: '31°32\'N 74°20\'E', status: 'ACTIVE', ping: '18ms' },
                          { name: 'NODE CHARLIE', coord: '33°43\'N 73°02\'E', status: 'STANDBY', ping: '—' },
                          { name: 'NODE DELTA',  coord: '25°11\'N 55°10\'E', status: 'ACTIVE', ping: '24ms' },
                        ].map(n => (
                          <div key={n.name} className="flex items-center justify-between bg-[#161b29]/60 rounded-lg px-3 py-2 border border-[#3b494c]/20">
                            <div>
                              <div className="text-[10px] font-mono font-bold text-white">{n.name}</div>
                              <div className="text-[9px] font-mono text-[#849396]">{n.coord}</div>
                            </div>
                            <div className="text-right">
                              <div className={`text-[9px] font-mono font-bold ${n.status === 'ACTIVE' ? 'text-[#3ce36a]' : 'text-[#FF9F00]'}`}>● {n.status}</div>
                              <div className="text-[9px] font-mono text-[#849396]">{n.ping}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button onClick={onLaunchCommandCenter} className="w-full py-2 bg-[#00e5ff]/10 border border-[#00e5ff]/30 text-[#00e5ff] text-[10px] font-mono font-bold uppercase tracking-wider rounded-lg hover:bg-[#00e5ff]/20 transition-all">
                        Open Full Network Map →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Security Icon ── */}
              <div className="relative">
                <button
                  onClick={() => togglePanel('security')}
                  title="Security Status"
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 ${activePanel === 'security' ? 'bg-[#00e5ff]/15 text-[#00e5ff] shadow-[0_0_12px_rgba(0,229,255,0.3)]' : 'hover:bg-white/5 hover:text-[#00e5ff]'}`}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>security</span>
                </button>
                {/* Security Panel */}
                {activePanel === 'security' && (
                  <div className="absolute top-full right-0 mt-3 w-80 bg-[#0d1526]/98 backdrop-blur-xl border border-[#00e5ff]/25 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_40px_rgba(0,229,255,0.1)] overflow-hidden z-50 animate-fade-in">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#3b494c]/40 bg-[#3ce36a]/5">
                      <div className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest text-[#3ce36a]">
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>security</span>
                        Security Status
                      </div>
                      <span className="flex items-center gap-1 text-[9px] font-mono text-[#3ce36a]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#3ce36a] animate-pulse"></span>SECURED
                      </span>
                    </div>
                    <div className="p-4 space-y-3">
                      {/* Encryption badge */}
                      <div className="bg-[#3ce36a]/5 border border-[#3ce36a]/20 rounded-xl px-4 py-3 flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#3ce36a] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                        <div>
                          <div className="text-[11px] font-bold text-white font-mono">CRYPTO-KEX ACTIVE</div>
                          <div className="text-[9px] text-[#3ce36a] font-mono uppercase tracking-wider">256-bit Lattice Encryption</div>
                        </div>
                      </div>
                      {/* Security checks */}
                      {[
                        { label: 'P2P Channel Integrity', status: 'PASS', ok: true },
                        { label: 'Zero-Knowledge Proof', status: 'VERIFIED', ok: true },
                        { label: 'Anti-Tamper Seal', status: 'INTACT', ok: true },
                        { label: 'Rogue Node Detection', status: 'SCANNING', ok: null },
                        { label: 'DDoS Shield', status: 'ACTIVE', ok: true },
                        { label: 'Intrusion Attempts (24h)', status: '0 DETECTED', ok: true },
                      ].map(c => (
                        <div key={c.label} className="flex items-center justify-between py-1.5 border-b border-[#3b494c]/20 last:border-0">
                          <span className="text-[10px] font-mono text-[#849396]">{c.label}</span>
                          <span className={`text-[9px] font-mono font-bold ${c.ok === true ? 'text-[#3ce36a]' : c.ok === null ? 'text-[#FF9F00] animate-pulse' : 'text-[#FF4444]'}`}>
                            {c.ok === true ? '✓' : c.ok === null ? '⟳' : '✗'} {c.status}
                          </span>
                        </div>
                      ))}
                      <div className="bg-[#161b29] rounded-lg p-2 text-center">
                        <span className="text-[9px] font-mono text-[#849396]">Last security audit: </span>
                        <span className="text-[9px] font-mono text-white">2 mins ago</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Region / Language Icon ── */}
              <div className="relative">
                <button
                  onClick={() => togglePanel('region')}
                  title="Region Selector"
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 ${activePanel === 'region' ? 'bg-[#00e5ff]/15 text-[#00e5ff] shadow-[0_0_12px_rgba(0,229,255,0.3)]' : 'hover:bg-white/5 hover:text-[#00e5ff]'}`}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>language</span>
                </button>
                {/* Region Panel */}
                {activePanel === 'region' && (
                  <div className="absolute top-full right-0 mt-3 w-72 bg-[#0d1526]/98 backdrop-blur-xl border border-[#00e5ff]/25 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_40px_rgba(0,229,255,0.1)] overflow-hidden z-50 animate-fade-in">
                    <div className="px-4 py-3 border-b border-[#3b494c]/40 bg-[#00e5ff]/5">
                      <div className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest text-[#00e5ff]">
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>language</span>
                        Select Region
                      </div>
                      <div className="text-[9px] text-[#849396] font-mono mt-0.5">Active: {selectedRegion}</div>
                    </div>
                    <div className="p-2 max-h-72 overflow-y-auto">
                      {REGIONS.map(r => (
                        <button
                          key={r.label}
                          onClick={() => { setSelectedRegion(r.label); setActivePanel(null); }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-left ${
                            selectedRegion === r.label
                              ? 'bg-[#00e5ff]/15 border border-[#00e5ff]/30'
                              : 'hover:bg-white/5 border border-transparent'
                          }`}>
                          <span className="text-lg">{r.code}</span>
                          <span className={`text-[11px] font-mono font-bold ${selectedRegion === r.label ? 'text-[#00e5ff]' : 'text-[#dee2f5]'}`}>{r.label}</span>
                          {selectedRegion === r.label && (
                            <span className="material-symbols-outlined text-[#00e5ff] ml-auto" style={{ fontSize: '14px' }}>check</span>
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-[#3b494c]/40 px-4 py-2.5 text-[9px] font-mono text-[#849396]">
                      Region affects node priority & alert routing
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </header>

      {/* ── 2. Hero Section ── */}
      <section id="hero" className="relative pt-12 pb-24 min-h-[90vh] flex flex-col items-center justify-center border-b border-[#3b494c]/30 overflow-hidden">
        
        {/* Background Map Overlay (3D Parallax) */}
        <div className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none transition-transform duration-300 ease-out" 
          style={{
            backgroundImage: "url('/world_map_bg.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
            transform: `scale(1.05) translate(${mousePos.x}px, ${mousePos.y}px) rotateX(${-mousePos.y * 0.5}deg) rotateY(${mousePos.x * 0.5}deg)`
          }} />
        
        {/* Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
          backgroundImage: 'linear-gradient(#00e5ff 1px,transparent 1px),linear-gradient(90deg,#00e5ff 1px,transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        <div className="relative z-10 text-center max-w-[1000px] px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full bg-[#00e5ff]/10 border border-[#00e5ff]/30 text-[#00e5ff] text-[10px] font-mono uppercase tracking-widest shadow-[0_0_15px_rgba(0,229,255,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] animate-pulse"></span>
            System Online - V2.4.1
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 text-white drop-shadow-xl leading-[1.1]">
            When Connectivity Fails,<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#849396]">Coordination Survives.</span>
          </h1>
          
          <p className="text-[#849396] text-sm md:text-lg mb-10 max-w-2xl mx-auto font-mono tracking-wide leading-relaxed">
            The ultimate decentralized emergency response system. P2P Mesh networking, AI-driven dispatch, and quantum-secured communications for when the grid goes dark.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={onLaunchCommandCenter} className="px-8 py-4 bg-[#00e5ff] text-[#001f24] font-mono font-bold text-sm uppercase tracking-widest rounded shadow-[0_0_30px_rgba(0,229,255,0.4)] hover:bg-white transition-all hover:scale-105 active:scale-95">
              Launch Command Center
            </button>
            <button className="px-8 py-4 bg-[#161b29]/80 border border-[#3b494c]/60 text-white font-mono font-bold text-sm uppercase tracking-widest rounded hover:bg-[#3b494c]/30 hover:border-[#00e5ff]/50 transition-all hover:shadow-[0_0_20px_rgba(0,229,255,0.1)]">
              View Disaster Simulation
            </button>
          </div>
        </div>

        {/* Floating Metrics */}
        <div className="absolute bottom-10 left-10 hidden lg:block glass-card border border-[#00e5ff]/20 rounded-lg p-4 shadow-[0_0_20px_rgba(0,229,255,0.1)]">
          <div className="text-[9px] text-[#849396] font-mono uppercase tracking-widest mb-1">Network Latency</div>
          <div className="text-2xl font-bold font-mono text-white flex items-center gap-2">
            14ms <span className="text-[#3ce36a] text-sm">Optimal</span>
          </div>
        </div>

        <div className="absolute bottom-10 right-10 hidden lg:block glass-card border border-[#00e5ff]/20 rounded-lg p-4 shadow-[0_0_20px_rgba(0,229,255,0.1)]">
          <div className="text-[9px] text-[#849396] font-mono uppercase tracking-widest mb-1">Global Nodes Active</div>
          <div className="text-2xl font-bold font-mono text-white flex items-center gap-2">
            142,021 <span className="text-[#00e5ff] text-sm">+4K</span>
          </div>
        </div>
      </section>

      {/* ── 3. Features Dashboard Layout ── */}
      <section id="features" className="py-24 relative max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* AI Risk Prediction */}
          <div className="col-span-1 md:col-span-2 glass-card border border-[#3b494c]/40 rounded-2xl p-8 hover:border-[#00e5ff]/40 transition-colors group shadow-lg">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <span className="material-symbols-outlined text-[#00e5ff]">analytics</span>
                AI Risk Prediction
              </h3>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-[#FF4444]/10 border border-[#FF4444]/30 text-[#FF4444] text-[9px] font-mono rounded">CRITICAL ALERT</span>
                <span className="px-2 py-1 bg-[#3b494c]/30 text-[#849396] text-[9px] font-mono rounded">SECTOR 7G</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div>
                <div className="text-[9px] text-[#849396] font-mono uppercase tracking-wider mb-1">Probability</div>
                <div className="text-2xl font-bold font-mono">83.4%</div>
              </div>
              <div>
                <div className="text-[9px] text-[#849396] font-mono uppercase tracking-wider mb-1">Population At Risk</div>
                <div className="text-2xl font-bold font-mono">2.4M</div>
              </div>
              <div>
                <div className="text-[9px] text-[#849396] font-mono uppercase tracking-wider mb-1">Primary Threat</div>
                <div className="text-lg font-bold font-mono text-[#FF9F00] pt-1">FLOOD</div>
              </div>
              <div>
                <div className="text-[9px] text-[#849396] font-mono uppercase tracking-wider mb-1">Network Health</div>
                <div className="text-lg font-bold font-mono text-[#3ce36a] pt-1">STABLE</div>
              </div>
            </div>

            <div className="h-32 rounded-xl overflow-hidden relative border border-[#3b494c]/30 group-hover:border-[#00e5ff]/20 transition-all duration-300 ease-out"
              style={{ transform: `translate(${-mousePos.x * 0.3}px, ${-mousePos.y * 0.3}px)` }}>
              <div className="absolute inset-0 bg-gradient-to-r from-[#00e5ff]/10 to-transparent"></div>
              {/* Fake waveform / visualization */}
              <div className="absolute bottom-0 left-0 w-full h-1/2 flex items-end gap-1 px-4">
                {[...Array(40)].map((_, i) => (
                  <div key={i} className="flex-1 bg-[#00e5ff]/30 rounded-t-sm transition-all duration-700" style={{ height: `${Math.random() * 100}%` }}></div>
                ))}
              </div>
            </div>
          </div>

          {/* Response Metrics */}
          <div className="col-span-1 glass-card border border-[#3b494c]/40 rounded-2xl p-8 hover:border-[#00e5ff]/40 transition-colors shadow-lg">
            <h3 className="text-xl font-bold mb-8">Response Metrics</h3>
            <div className="space-y-8">
              <div className="flex items-center justify-between border-b border-[#3b494c]/30 pb-4">
                <div>
                  <div className="text-[10px] text-[#849396] font-mono uppercase tracking-wider mb-1">Avg. Dispatch Time</div>
                  <div className="text-3xl font-bold font-mono">242s</div>
                </div>
                <span className="material-symbols-outlined text-[#00e5ff] text-3xl opacity-50">timer</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#3b494c]/30 pb-4">
                <div>
                  <div className="text-[10px] text-[#849396] font-mono uppercase tracking-wider mb-1">Lives Safeguarded</div>
                  <div className="text-3xl font-bold font-mono">12.8M</div>
                </div>
                <span className="material-symbols-outlined text-[#3ce36a] text-3xl opacity-50">health_and_safety</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-[#849396] font-mono uppercase tracking-wider mb-1">Command Centers</div>
                  <div className="text-3xl font-bold font-mono">86k</div>
                </div>
                <span className="material-symbols-outlined text-[#FF9F00] text-3xl opacity-50">hub</span>
              </div>
            </div>
          </div>

          {/* Quantum Encryption */}
          <div className="col-span-1 glass-card border border-[#3b494c]/40 rounded-2xl p-8 hover:border-[#00e5ff]/40 transition-colors shadow-lg relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-5">
              <span className="material-symbols-outlined" style={{ fontSize: '200px' }}>lock</span>
            </div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-[#00e5ff]">enhanced_encryption</span>
              Quantum Encryption
            </h3>
            <p className="text-[#849396] text-sm mb-6 leading-relaxed">
              P2P communications are hardened with lattice-based cryptography, ensuring zero-knowledge privacy in compromised zones.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-[#161b29] border border-[#3b494c]/50 text-[#00e5ff] text-[10px] font-mono uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] animate-pulse"></span>
              CRYPTO-KEX ACTIVE: 256-bit
            </div>
          </div>

          {/* Sector Deployment Image & Info */}
          <div className="col-span-1 md:col-span-2 glass-card border border-[#3b494c]/40 rounded-2xl overflow-hidden hover:border-[#00e5ff]/40 transition-colors shadow-lg flex flex-col md:flex-row relative">
            <div className="md:w-1/2 h-64 md:h-auto bg-[#000] relative overflow-hidden">
              <img src="/3d_grid.png" alt="3D Tactical Grid" 
                className="w-full h-full object-cover opacity-80 mix-blend-screen transition-transform duration-300 ease-out" 
                style={{ transform: `scale(1.1) translate(${mousePos.x * 0.8}px, ${mousePos.y * 0.8}px)` }} />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#090e1b]"></div>
            </div>
            <div className="md:w-1/2 p-8 flex flex-col justify-center">
              <h3 className="text-xl font-bold mb-4">Sector Deployment</h3>
              <p className="text-[#849396] text-sm mb-6 leading-relaxed">
                Seamlessly scale out to 15,000+ local regions. Mesh networking automatically reconnects in Dropout Zones.
              </p>
              <div className="space-y-3 font-mono text-[10px]">
                <div className="flex gap-4">
                  <span className="text-[#3ce36a]">● ACTIVE</span>
                  <span className="text-white">NODE ALPHA - 24°51'36"N 67°00'36"E</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-[#3ce36a]">● ACTIVE</span>
                  <span className="text-white">NODE BRAVO - 31°32'59"N 74°20'37"E</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-[#FF9F00]">● STANDBY</span>
                  <span className="text-[#849396]">NODE CHARLIE - 33°43'04"N 73°02'31"E</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── 3.5. How It Works Section ── */}
      <section id="how-it-works" className="py-24 relative max-w-[1400px] mx-auto px-6 border-t border-[#3b494c]/30">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black mb-4">How Phoenix Grid Works</h2>
          <p className="text-[#849396] font-mono text-sm max-w-2xl mx-auto">
            A resilient multi-layered approach to disaster management. When primary communications fail, the grid self-heals.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 glass-card rounded-2xl border border-[#3b494c]/40 hover:border-[#00e5ff]/40 hover:shadow-[0_0_30px_rgba(0,229,255,0.15)] transition-all duration-300 ease-out"
            style={{ transform: `translate(${mousePos.x * 0.2}px, ${mousePos.y * 0.2}px)` }}>
            <div className="w-16 h-16 mx-auto bg-[#00e5ff]/10 rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(0,229,255,0.2)]">
              <span className="material-symbols-outlined text-[#00e5ff] text-3xl">hub</span>
            </div>
            <h4 className="text-lg font-bold mb-3">1. Mesh Networking</h4>
            <p className="text-sm text-[#849396] leading-relaxed">
              Smartphones and responder devices act as independent nodes, creating an ad-hoc local network that doesn't rely on cellular towers.
            </p>
          </div>
          <div className="text-center p-6 glass-card rounded-2xl border border-[#3b494c]/40 hover:border-[#00e5ff]/40 hover:shadow-[0_0_30px_rgba(0,229,255,0.15)] transition-all duration-300 ease-out"
            style={{ transform: `translate(${mousePos.x * -0.1}px, ${mousePos.y * 0.3}px)` }}>
            <div className="w-16 h-16 mx-auto bg-[#00e5ff]/10 rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(0,229,255,0.2)]">
              <span className="material-symbols-outlined text-[#00e5ff] text-3xl">memory</span>
            </div>
            <h4 className="text-lg font-bold mb-3">2. AI Triage & Routing</h4>
            <p className="text-sm text-[#849396] leading-relaxed">
              SOS requests are automatically processed by an edge-AI model that determines severity and routes the closest available units geographically.
            </p>
          </div>
          <div className="text-center p-6 glass-card rounded-2xl border border-[#3b494c]/40 hover:border-[#00e5ff]/40 hover:shadow-[0_0_30px_rgba(0,229,255,0.15)] transition-all duration-300 ease-out"
            style={{ transform: `translate(${mousePos.x * 0.3}px, ${mousePos.y * -0.2}px)` }}>
            <div className="w-16 h-16 mx-auto bg-[#00e5ff]/10 rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(0,229,255,0.2)]">
              <span className="material-symbols-outlined text-[#00e5ff] text-3xl">admin_panel_settings</span>
            </div>
            <h4 className="text-lg font-bold mb-3">3. Command Oversight</h4>
            <p className="text-sm text-[#849396] leading-relaxed">
              Admins gain a real-time tactical overview of all dispatched units, hospital capacities, and safe zones across the city.
            </p>
          </div>
        </div>
      </section>

      {/* ── 3.8. Emergency Protocols Section ── */}
      <section id="protocols" className="py-24 relative max-w-[1400px] mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="lg:w-1/2">
            <h2 className="text-3xl font-black mb-6">Global Integration Protocols</h2>
            <p className="text-[#849396] font-mono text-sm leading-relaxed mb-6">
              Phoenix Grid isn't just a dashboard—it's a massive, multi-layered protocol designed to tie together disparate emergency services into a single, cohesive unit.
            </p>
            <ul className="space-y-4 font-mono text-[11px] text-[#849396] uppercase tracking-wider mb-8">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#00e5ff]">check_circle</span>
                Cross-Agency Radio Integration (CARI)
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#00e5ff]">check_circle</span>
                Automated Drone Dispatch via API
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#00e5ff]">check_circle</span>
                Decentralized Blockchain Audit Logs
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#00e5ff]">check_circle</span>
                Offline Satellite Fallback Net
              </li>
            </ul>
            <button className="px-6 py-3 border border-[#00e5ff]/50 text-[#00e5ff] font-mono font-bold text-[11px] uppercase tracking-widest rounded hover:bg-[#00e5ff]/10 transition-all">
              View Architecture Docs
            </button>
          </div>
          <div className="lg:w-1/2 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#00e5ff]/20 to-transparent blur-3xl opacity-50 rounded-full"></div>
            <div className="glass-card border border-[#00e5ff]/30 p-8 rounded-2xl relative z-10 transition-transform duration-300 ease-out"
              style={{ transform: `rotateX(${-mousePos.y * 0.3}deg) rotateY(${mousePos.x * 0.3}deg)` }}>
              <div className="flex justify-between items-center border-b border-[#3b494c]/50 pb-4 mb-4">
                <span className="font-mono text-xs text-[#00e5ff]">API_REQUEST // PHOENIX_CORE</span>
                <span className="w-2 h-2 rounded-full bg-[#3ce36a] animate-pulse"></span>
              </div>
              <pre className="text-[10px] sm:text-xs font-mono text-[#dee2f5] overflow-x-auto whitespace-pre-wrap">
{`{
  "protocol": "X-PHOENIX-MESH-V2",
  "auth": "quantum_lattice_key_7A",
  "payload": {
    "agency": "RESCUE_1122",
    "status": "READY",
    "fleet_size": 420,
    "lat": 31.5204,
    "lon": 74.3587
  },
  "signature": "0x3f8a9e...1b"
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Final CTA & Footer ── */}
      <footer className="relative bg-[#060a12] border-t border-[#3b494c]/30 text-center pt-24 pb-12 overflow-hidden">
        {/* Glow behind footer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#00e5ff]/5 blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <div className="mb-16">
            <h2 className="text-4xl font-black mb-6 drop-shadow-lg">Ready to Coordinate?</h2>
            <p className="text-[#849396] mb-10 max-w-xl mx-auto leading-relaxed">
              Join the Phoenix Grid infrastructure. Whether you are an NGO, a government agency, or a volunteer responder, your decentralized node empowers your city.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={onLaunchCommandCenter} className="px-8 py-4 bg-[#00e5ff] text-[#001f24] font-mono font-bold text-sm uppercase tracking-widest rounded shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:bg-white transition-all">
                Integrate System
              </button>
              <button className="px-8 py-4 bg-[#090e1b] border border-[#3b494c] text-white font-mono font-bold text-sm uppercase tracking-widest rounded hover:bg-[#3b494c]/30 transition-all">
                Read Protocols
              </button>
            </div>
          </div>
          
          <div className="border-t border-[#3b494c]/30 pt-12 pb-6 grid grid-cols-1 md:grid-cols-4 gap-8 text-left text-[11px] font-mono text-[#849396] uppercase tracking-wider">
            <div className="col-span-1 md:col-span-1">
              <div className="text-white font-black text-lg mb-4 flex items-center gap-2 tracking-widest">
                <span className="material-symbols-outlined text-[#00e5ff]">emergency_share</span>
                PHOENIX
              </div>
              <p className="normal-case leading-relaxed opacity-70">
                Tactical Emergency Response System. Decentralized, Encrypted, Unstoppable.
              </p>
            </div>
            <div>
              <h5 className="text-white font-bold mb-4">Operations</h5>
              <ul className="space-y-2 opacity-80">
                <li><a href="#" className="hover:text-[#00e5ff] transition-colors">Command Center</a></li>
                <li><a href="#" className="hover:text-[#00e5ff] transition-colors">Fleet Tracking</a></li>
                <li><a href="#" className="hover:text-[#00e5ff] transition-colors">SOS Dispatch</a></li>
                <li><a href="#" className="hover:text-[#00e5ff] transition-colors">Resource Allocation</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-bold mb-4">Developers</h5>
              <ul className="space-y-2 opacity-80">
                <li><a href="#" className="hover:text-[#00e5ff] transition-colors">API Documentation</a></li>
                <li><a href="#" className="hover:text-[#00e5ff] transition-colors">Mesh Protocol</a></li>
                <li><a href="#" className="hover:text-[#00e5ff] transition-colors">Open Source</a></li>
                <li><a href="#" className="hover:text-[#00e5ff] transition-colors">Status: <span className="text-[#3ce36a]">Operational</span></a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-bold mb-4">Legal</h5>
              <ul className="space-y-2 opacity-80">
                <li><a href="#" className="hover:text-[#00e5ff] transition-colors">Privacy Protocol</a></li>
                <li><a href="#" className="hover:text-[#00e5ff] transition-colors">Terms of Deployment</a></li>
                <li><a href="#" className="hover:text-[#00e5ff] transition-colors">Service Level Agreement</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#3b494c]/20 pt-6 flex flex-col md:flex-row items-center justify-between text-[10px] font-mono text-[#849396] uppercase tracking-widest">
            <div>© 2026 Phoenix Grid Systems. All rights reserved.</div>
            <div className="flex gap-4 mt-4 md:mt-0">
              <span className="material-symbols-outlined hover:text-white cursor-pointer transition-colors" style={{ fontSize: '16px' }}>wifi_tethering</span>
              <span className="material-symbols-outlined hover:text-white cursor-pointer transition-colors" style={{ fontSize: '16px' }}>security</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
