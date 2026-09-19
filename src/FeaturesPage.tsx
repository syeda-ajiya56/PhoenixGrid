import React, { useState, useEffect } from 'react';

interface FeaturesPageProps {
  onBack: () => void;
  onLaunchCommandCenter: () => void;
}

const FEATURES = [
  {
    icon: 'analytics',
    color: '#00e5ff',
    tag: 'AI Engine',
    title: 'AI Risk Prediction',
    desc: 'Real-time predictive modeling using satellite imagery, weather APIs, and historical disaster data. The AI scores threat probability per sector every 90 seconds.',
    stats: [
      { label: 'Accuracy', value: '94.2%' },
      { label: 'Prediction Window', value: '72 hrs' },
      { label: 'Data Sources', value: '38' },
    ],
    bullets: ['Flood probability heatmaps', 'Earthquake aftershock prediction', 'Population density weighting', 'Real-time PDMA feed integration'],
  },
  {
    icon: 'hub',
    color: '#3ce36a',
    tag: 'Core Network',
    title: 'P2P Mesh Networking',
    desc: 'Every device on Phoenix Grid is a relay node. When towers fall, the mesh self-heals by routing through surviving devices via Bluetooth, WiFi Direct, or LoRa radio.',
    stats: [
      { label: 'Max Hops', value: '128' },
      { label: 'Range per Node', value: '300m' },
      { label: 'Reconnect Time', value: '<2s' },
    ],
    bullets: ['Offline-first architecture', 'Automatic topology remapping', 'Priority packet routing for SOS', 'Supports WiFi, BT, LoRa, RF'],
  },
  {
    icon: 'enhanced_encryption',
    color: '#a78bfa',
    tag: 'Security',
    title: 'Quantum Encryption',
    desc: 'Lattice-based post-quantum cryptography (CRYSTALS-Kyber) ensures all communications remain private even against quantum computing attacks.',
    stats: [
      { label: 'Key Size', value: '256-bit' },
      { label: 'Breaches', value: '0 ever' },
      { label: 'Overhead', value: '<1ms' },
    ],
    bullets: ['CRYSTALS-Kyber KEM', 'Zero-knowledge proofs for auth', 'Perfect forward secrecy', 'Hardware security module support'],
  },
  {
    icon: 'memory',
    color: '#FF9F00',
    tag: 'Dispatch',
    title: 'AI Triage & Routing',
    desc: 'SOS requests are triaged by an on-device ML model in under 300ms. Severity scoring, type classification, and nearest-unit routing happen entirely on the edge.',
    stats: [
      { label: 'Triage Time', value: '<300ms' },
      { label: 'Routing Accuracy', value: '97%' },
      { label: 'Avg. Dispatch', value: '242s' },
    ],
    bullets: ['Edge-AI — no cloud required', 'Multi-unit parallel dispatch', 'Dynamic re-routing on blockage', 'Dijkstra + AI hybrid pathfinding'],
  },
  {
    icon: 'admin_panel_settings',
    color: '#00e5ff',
    tag: 'Command',
    title: 'Real-Time Command Oversight',
    desc: 'Admins see every unit, every SOS, every hospital capacity, and every danger zone on a live tactical map. One-click verification triggers a full automated response chain.',
    stats: [
      { label: 'Update Rate', value: '3s' },
      { label: 'Max Units Tracked', value: '10K' },
      { label: 'Map Coverage', value: 'Global' },
    ],
    bullets: ['Live unit GPS tracking', 'Hospital bed capacity monitoring', 'Danger zone heatmap overlay', 'Full audit log (blockchain-backed)'],
  },
  {
    icon: 'satellite_alt',
    color: '#3ce36a',
    tag: 'Fallback',
    title: 'Satellite Fallback Net',
    desc: 'When mesh coverage is insufficient, Phoenix Grid automatically routes critical SOS data through integrated LEO satellite APIs (Starlink / Iridium) as a last resort.',
    stats: [
      { label: 'Fallback Latency', value: '~400ms' },
      { label: 'Coverage', value: '100%' },
      { label: 'Activation', value: 'Auto' },
    ],
    bullets: ['Starlink API integration', 'Iridium SBD messaging', 'Auto-failover in <5s', 'Compressed SOS packet format'],
  },
];

export default function FeaturesPage({ onBack, onLaunchCommandCenter }: FeaturesPageProps) {
  const [visible, setVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

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

  const f = FEATURES[activeFeature];

  return (
    <div className={`min-h-screen w-screen bg-[#090e1b] text-white font-sans overflow-x-hidden selection:bg-[#00e5ff]/30 transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
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
            <button onClick={onLaunchCommandCenter} className="px-6 py-2.5 bg-[#00e5ff]/10 border border-[#00e5ff]/50 text-[#00e5ff] text-[11px] font-mono font-bold uppercase tracking-wider rounded-md hover:bg-[#00e5ff]/20 transition-all duration-200">
              Launch System
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative pt-40 pb-16 text-center border-b border-[#3b494c]/30 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
          backgroundImage: 'linear-gradient(#00e5ff 1px,transparent 1px),linear-gradient(90deg,#00e5ff 1px,transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="relative z-10 max-w-[800px] mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-[#00e5ff]/10 border border-[#00e5ff]/30 text-[#00e5ff] text-[10px] font-mono uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] animate-pulse"></span>
            Platform Features
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 text-white leading-tight">
            Built for the<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00e5ff] to-[#3ce36a]">Impossible.</span>
          </h1>
          <p className="text-[#849396] text-lg font-mono leading-relaxed">
            Six core systems engineered to keep emergency response running when everything else stops.
          </p>
        </div>
      </section>

      {/* ── Interactive Feature Explorer ── */}
      <section className="py-24 max-w-[1400px] mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Tab list */}
          <div className="lg:w-80 flex-shrink-0 space-y-2">
            <div className="text-[9px] font-mono text-[#849396] uppercase tracking-widest mb-4 px-2">Core Systems</div>
            {FEATURES.map((feat, i) => (
              <button
                key={feat.title}
                onClick={() => setActiveFeature(i)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-200 ${
                  activeFeature === i
                    ? 'bg-[#00e5ff]/10 border border-[#00e5ff]/30 shadow-[0_0_20px_rgba(0,229,255,0.1)]'
                    : 'border border-transparent hover:bg-white/5 hover:border-[#3b494c]/50'
                }`}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200"
                  style={{ background: activeFeature === i ? `${feat.color}20` : 'rgba(255,255,255,0.04)', border: `1px solid ${activeFeature === i ? feat.color + '50' : 'rgba(255,255,255,0.08)'}` }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: feat.color }}>{feat.icon}</span>
                </div>
                <div>
                  <div className={`text-xs font-bold uppercase tracking-wider transition-colors ${activeFeature === i ? 'text-white' : 'text-[#849396]'}`}>{feat.title}</div>
                  <div className="text-[9px] font-mono text-[#849396] mt-0.5">{feat.tag}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Right: Feature detail */}
          <div className="flex-1 glass-card border border-[#3b494c]/40 rounded-2xl p-8 lg:p-10" key={activeFeature}>
            {/* Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-mono uppercase tracking-widest mb-6"
              style={{ background: `${f.color}15`, border: `1px solid ${f.color}40`, color: f.color }}>
              <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>{f.icon}</span>
              {f.tag}
            </div>
            <h2 className="text-3xl font-black mb-4">{f.title}</h2>
            <p className="text-[#849396] leading-relaxed mb-8 font-mono text-sm">{f.desc}</p>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {f.stats.map(s => (
                <div key={s.label} className="rounded-xl p-4 text-center" style={{ background: `${f.color}08`, border: `1px solid ${f.color}25` }}>
                  <div className="text-xl font-black font-mono mb-1" style={{ color: f.color }}>{s.value}</div>
                  <div className="text-[9px] font-mono text-[#849396] uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {f.bullets.map(b => (
                <div key={b} className="flex items-center gap-2.5 text-sm text-[#849396]">
                  <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: '16px', color: f.color }}>check_circle</span>
                  {b}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Grid Cards ── */}
      <section className="py-16 border-t border-[#3b494c]/30 bg-[#060a12]">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black mb-2">All Features at a Glance</h2>
            <p className="text-[#849396] font-mono text-sm">Click any card for details</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((feat, i) => (
              <button key={feat.title} onClick={() => { setActiveFeature(i); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="glass-card border border-[#3b494c]/40 rounded-xl p-6 text-left hover:border-[#00e5ff]/40 hover:shadow-[0_0_25px_rgba(0,229,255,0.08)] transition-all duration-300 group">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                  style={{ background: `${feat.color}15`, border: `1px solid ${feat.color}40` }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', color: feat.color }}>{feat.icon}</span>
                </div>
                <div className="text-[9px] font-mono uppercase tracking-widest mb-1" style={{ color: feat.color }}>{feat.tag}</div>
                <div className="font-bold text-sm mb-2">{feat.title}</div>
                <div className="text-[#849396] text-xs leading-relaxed line-clamp-2">{feat.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 border-t border-[#3b494c]/30 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-[#00e5ff]/5 blur-[80px] pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto px-6">
          <h2 className="text-4xl font-black mb-4">See It In Action</h2>
          <p className="text-[#849396] mb-10 font-mono text-sm">Launch the command center and explore every feature live.</p>
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
