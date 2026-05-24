import React from 'react';
import { Link as LinkIcon, Lock, AlertTriangle, ArrowUpRight } from 'lucide-react';

const steps = [
  {
    tag: 'Unified Setup',
    title: 'Connect Your Accounts',
    visual: (
      <div style={{ marginTop: '16px' }}>
        <div
          style={{
            background: '#f9fafb',
            borderRadius: '10px',
            padding: '14px',
            border: '1px solid #e5e7eb',
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <LinkIcon size={14} /> Connect Services
            <span style={{ marginLeft: 'auto', display: 'flex' }}><Lock size={14} /></span>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {['Google', 'Notion', 'GitHub'].map(s => (
              <div key={s} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: 600, color: '#374151' }}>
                {s}
              </div>
            ))}
          </div>
          <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Syncing...</div>
          <div style={{ height: '6px', background: '#e5e7eb', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{ width: '72%', height: '100%', background: 'linear-gradient(90deg, #774CFF, #a78bfa)', borderRadius: '99px' }} />
          </div>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px', textAlign: 'right' }}>72%</div>
        </div>
      </div>
    ),
  },
  {
    tag: 'Instant Visibility',
    title: 'Track Every Activity',
    visual: (
      <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
        {[
          { cat: 'Finance', label: 'Salary Credited', val: '+₹85,000', color: '#774CFF', valColor: '#22c55e' },
          { cat: 'Health', label: 'Morning Run', val: '5.2km', color: '#f59e0b', valColor: '#374151' },
          { cat: 'Vault', label: 'Note Saved', val: 'Ideas.md', color: '#3b82f6', valColor: '#374151' },
        ].map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f9fafb', borderRadius: '8px', padding: '8px 10px', border: '1px solid #e5e7eb' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: item.color, background: item.color + '15', padding: '2px 7px', borderRadius: '4px' }}>{item.cat}</span>
            <span style={{ fontSize: '12px', color: '#374151', flex: 1 }}>{item.label}</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: item.valColor }}>{item.val}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    tag: 'Smart Insights',
    title: 'AI Analyzes Everything',
    visual: (
      <div style={{ marginTop: '16px' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: '#ef4444', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <AlertTriangle size={12} /> Unusual spending detected in Oct
        </div>
        <svg viewBox="0 0 160 60" style={{ width: '100%' }}>
          <polyline
            points="0,50 25,40 45,45 65,20 85,30 110,15 140,25 160,10"
            fill="none"
            stroke="#774CFF"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <polyline
            points="0,50 25,40 45,45 65,20 85,30 110,15 140,25 160,10"
            fill="url(#heroGrad)"
            opacity="0.18"
          />
          <defs>
            <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#774CFF" />
              <stop offset="100%" stopColor="#774CFF" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    ),
  },
  {
    tag: 'Smarter Decisions',
    title: 'Optimize & Grow',
    visual: (
      <div style={{ marginTop: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: '#374151', marginBottom: '10px' }}>
          Reduce screen time by 22% <ArrowUpRight size={14} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '10px' }}>
          <div style={{ fontSize: '11px', color: '#9ca3af' }}>Monthly goal: <span style={{ color: '#774CFF', fontWeight: 600 }}>+2.1 productive hrs/day</span></div>
        </div>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: '48px' }}>
          {[24, 36, 28, 42, 34, 48, 38].map((h, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${h}px`,
                borderRadius: '4px 4px 0 0',
                background: i === 5 ? 'linear-gradient(180deg, #774CFF, #a78bfa)' : '#e5e7eb',
              }}
            />
          ))}
        </div>
      </div>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="features" style={{ padding: '100px 24px', background: '#F8F9FA' }}>
      <div style={{ width: '100%', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div
            style={{
              display: 'inline-block',
              padding: '5px 16px',
              background: 'white',
              border: '1.5px solid #e5e7eb',
              borderRadius: '50px',
              fontSize: '13px',
              fontWeight: 500,
              color: '#6b7280',
              marginBottom: '18px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            How AuraOS Works
          </div>
          <h2
            style={{
              fontSize: 'clamp(28px, 4vw, 48px)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: '#05020F',
              margin: '0 0 16px',
              lineHeight: 1.1,
            }}
          >
            Run Your Life On Autopilot
          </h2>
          <p style={{ fontSize: '16px', color: '#6b7280', maxWidth: '500px', margin: '0 auto', lineHeight: 1.6 }}>
            Connect your apps, track your activity, and let AI guide every decision — all in one place.
          </p>
        </div>

        {/* Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '18px',
          }}
        >
          {steps.map((step) => (
            <div
              key={step.tag}
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '22px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                transition: 'box-shadow 0.2s, transform 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(119,76,255,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#9ca3af',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '8px',
                }}
              >
                {step.tag}
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#05020F', margin: 0, lineHeight: 1.3 }}>
                {step.title}
              </h3>
              {step.visual}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
