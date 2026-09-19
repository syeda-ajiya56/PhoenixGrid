import React, { useState, useEffect, useRef } from 'react';

interface OverviewPageProps {
  onBack: () => void;
  onLaunchCommandCenter: () => void;
}

const STATS = [
  { label: 'Active Nodes', value: '142,021', delta: '+4K', color: '#00e5ff' },
  { label: 'Lives Safeguarded', value: '12.8M', delta: '+2.3%', color: '#3ce36a' },
  { label: 'Network Uptime', value: '99.97%', delta: 'Optimal', color: '#3ce36a' },
  { label: 'Command Centers', value: '86K', delta: '+120', color: '#00e5ff' },
  { label: 'Avg. Latency', value: '14ms', delta: 'Low', color: '#3ce36a' },
  { label: 'Encrypted Comms', value: '100%', delta: 'AES-256', color: '#00e5ff' },
];

const TIMELINE = [
  { year: '2020', title: 'Project Genesis', desc: 'Phoenix Grid concept born from the 2020 Karachi floods — 3 engineers, 1 mission.' },
  { year: '2021', title: 'Mesh Protocol v1', desc: 'First P2P mesh network deployed across 200 devices in Lahore stress test.' },
  { year: '2022', title: 'AI Integration', desc: 'Causality engine introduced — AI-driven SOS triage with 94% routing accuracy.' },
  { year: '2023', title: 'National Rollout', desc: 'Deployed across 5 cities. 12,000+ responders onboarded. NDMA partnership signed.' },
  { year: '2024', title: 'Quantum Security', desc: 'Lattice-based crypto layer added. Zero data breach events since launch.' },
  { year: '2025', title: 'Global Expansion', desc: '42 countries online. 142K active nodes. V2.4.1 — most stable release yet.' },
];

export default function OverviewPage({ onBack, onLaunchCommandCenter }: OverviewPageProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.body.classList.add('landing-scroll');
    setTimeout(() => setVisible(true), 50);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => {
      document.body.classList.remove('landing-scroll');
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({
      x: (e.clientX / window.innerWidth - 0.5) * 16,
      y: (e.clientY / window.innerHeight - 0.5) * 16,
    });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`min-h-screen w-screen bg-[#090e1b] text-white font-sans overflow-x-hidden selection:bg-[#00e5ff]/30 transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* ── Header ── */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#090e1b]/95 shadow-[0_4px_30px_rgba(0,0,0,0.5)]' : 'bg-[#090e1b]/80'} backdrop-blur-md border-b border-[#3b494c]/30`}>
        <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-4 group">
            <div className="w-10 h-10 rounded-lg bg-[#00e5ff]/10 border border-[#00e5ff]/30 flex items-center justify-center group-hover:bg-[#00e5ff]/20 transition-all duration-300">
              <span className="material-symbols-outlined text-[#00e5ff]" style={{ fontVariationSettings: "'FILL' 1" }}>emergency_share</span>
            </div>
            <span className="text-xl font-black tracking-widest text-[#00e5ff] drop-shadow-[0_0_10px_rgba(0,229,255,0.5)]">PHOENIX GRID</span>
          </button>

          <div className="flex items-center gap-3">
            <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 text-[#849396] hover:text-white font-mono text-xs uppercase tracking-wider transition-colors">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
              Back to Home
            </button>
            <button onClick={onLaunchCommandCenter} className="px-6 py-2.5 bg-[#00e5ff]/10 border border-[#00e5ff]/50 text-[#00e5ff] text-[11px] font-mono font-bold uppercase tracking-wider rounded-md hover:bg-[#00e5ff]/20 hover:shadow-[0_0_25px_rgba(0,229,255,0.3)] transition-all duration-200">
              Launch System
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative pt-40 pb-24 min-h-[70vh] flex flex-col items-center justify-center overflow-hidden border-b border-[#3b494c]/30">
        <div className="absolute inset-0 opacity-30 mix-blend-screen pointer-events-none transition-transform duration-300"
          style={{
            backgroundImage: "url('/world_map_bg.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            maskImage: 'linear-gradient(to bottom, black 30%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 30%, transparent 100%)',
            transform: `scale(1.05) translate(${mousePos.x}px, ${mousePos.y}px)`,
          }} />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
          backgroundImage: 'linear-gradient(#00e5ff 1px,transparent 1px),linear-gradient(90deg,#00e5ff 1px,transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="relative z-10 text-center max-w-[900px] px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-[#00e5ff]/10 border border-[#00e5ff]/30 text-[#00e5ff] text-[10px] font-mono uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] animate-pulse"></span>
            System Overview
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 text-white leading-tight">
            What is <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00e5ff] to-[#0099aa]">Phoenix Grid?</span>
          </h1>
          <p className="text-[#849396] text-lg font-mono leading-relaxed max-w-2xl mx-auto">
            A fully decentralized, AI-powered emergency response platform designed to coordinate rescue operations when all conventional infrastructure collapses.
          </p>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="py-24 max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-[10px] font-mono text-[#00e5ff] uppercase tracking-[0.3em] mb-4">Our Mission</div>
            <h2 className="text-4xl font-black mb-6 leading-tight">
              When the Grid Goes Dark,<br />
              <span className="text-[#00e5ff]">We Stay Online.</span>
            </h2>
            <p className="text-[#849396] leading-relaxed mb-6">
              Phoenix Grid was built for the worst-case scenario. Earthquakes, floods, infrastructure attacks — events that knock out cellular towers, destroy fiber lines, and cut power to data centers. When all of that fails, Phoenix Grid's mesh network self-heals and keeps emergency coordinators connected.
            </p>
            <p className="text-[#849396] leading-relaxed mb-8">
              Every phone, tablet, and laptop becomes a mesh node. Every node relays data to every other. No central point of failure. No single kill-switch.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="px-3 py-1.5 bg-[#00e5ff]/10 border border-[#00e5ff]/30 text-[#00e5ff] text-[10px] font-mono uppercase tracking-wider rounded-full">P2P Mesh</span>
              <span className="px-3 py-1.5 bg-[#3ce36a]/10 border border-[#3ce36a]/30 text-[#3ce36a] text-[10px] font-mono uppercase tracking-wider rounded-full">Zero Single Point of Failure</span>
              <span className="px-3 py-1.5 bg-[#FF9F00]/10 border border-[#FF9F00]/30 text-[#FF9F00] text-[10px] font-mono uppercase tracking-wider rounded-full">Offline-First</span>
            </div>
          </div>
          <div className="glass-card border border-[#00e5ff]/20 rounded-2xl p-8 transition-transform duration-300 ease-out"
            style={{ transform: `rotateX(${-mousePos.y * 0.25}deg) rotateY(${mousePos.x * 0.25}deg)` }}>
            <div className="text-[10px] font-mono text-[#849396] uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3ce36a] animate-pulse"></span>
              Live System Health
            </div>
            <div className="space-y-5">
              {[
                { label: 'Mesh Network', pct: 99, color: '#3ce36a' },
                { label: 'AI Dispatch Engine', pct: 96, color: '#00e5ff' },
                { label: 'Quantum Crypto Layer', pct: 100, color: '#3ce36a' },
                { label: 'Satellite Fallback', pct: 88, color: '#FF9F00' },
                { label: 'Database Sync', pct: 94, color: '#00e5ff' },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between mb-1.5 text-[10px] font-mono">
                    <span className="text-[#849396] uppercase tracking-wider">{item.label}</span>
                    <span style={{ color: item.color }}>{item.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-[#1a1f2d] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${item.pct}%`, backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Live Stats ── */}
      <section className="py-16 border-t border-b border-[#3b494c]/30 bg-[#060a12]">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black mb-2">Global Coverage</h2>
            <p className="text-[#849396] font-mono text-sm">Real-time system metrics across 42 countries</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="glass-card border border-[#3b494c]/40 rounded-xl p-5 text-center hover:border-[#00e5ff]/40 hover:shadow-[0_0_25px_rgba(0,229,255,0.1)] transition-all duration-300 group">
                <div className="text-2xl font-black font-mono mb-1" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[9px] font-mono text-[#849396] uppercase tracking-wider mb-2">{s.label}</div>
                <div className="text-[9px] font-mono px-2 py-0.5 rounded-full inline-block" style={{ color: s.color, background: `${s.color}18`, border: `1px solid ${s.color}40` }}>{s.delta}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="py-24 max-w-[1400px] mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black mb-4">System History</h2>
          <p className="text-[#849396] font-mono text-sm">From a 3-person startup to a global emergency protocol</p>
        </div>
        <div className="relative">
          {/* Center line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#00e5ff]/40 via-[#00e5ff]/20 to-transparent hidden md:block" />
          <div className="space-y-10">
            {TIMELINE.map((item, i) => (
              <div key={item.year} className={`flex flex-col md:flex-row gap-6 items-start md:items-center ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                <div className="flex-1 glass-card border border-[#3b494c]/40 hover:border-[#00e5ff]/40 transition-all duration-300 rounded-xl p-6">
                  <div className="text-[10px] font-mono text-[#00e5ff] uppercase tracking-widest mb-2">{item.year}</div>
                  <div className="font-bold text-lg mb-2">{item.title}</div>
                  <div className="text-[#849396] text-sm leading-relaxed">{item.desc}</div>
                </div>
                <div className="hidden md:flex w-10 h-10 rounded-full bg-[#00e5ff]/10 border-2 border-[#00e5ff]/50 items-center justify-center flex-shrink-0 z-10 shadow-[0_0_20px_rgba(0,229,255,0.3)]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00e5ff]" />
                </div>
                <div className="flex-1 hidden md:block" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 border-t border-[#3b494c]/30 bg-[#060a12] text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-[#00e5ff]/5 blur-[80px] pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto px-6">
          <h2 className="text-4xl font-black mb-4">Ready to Connect?</h2>
          <p className="text-[#849396] mb-10 font-mono text-sm">Join 142,000+ active nodes. Your device becomes part of the grid.</p>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <button onClick={onLaunchCommandCenter} className="px-8 py-4 bg-[#00e5ff] text-[#001f24] font-mono font-bold text-sm uppercase tracking-widest rounded shadow-[0_0_30px_rgba(0,229,255,0.4)] hover:bg-white hover:scale-105 transition-all active:scale-95">
              Launch Command Center
            </button>
            <button onClick={onBack} className="px-8 py-4 border border-[#3b494c] text-[#849396] font-mono font-bold text-sm uppercase tracking-widest rounded hover:border-[#00e5ff]/50 hover:text-white transition-all">
              Back to Landing
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
