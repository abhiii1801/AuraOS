import React from 'react';
import { Cloud, BookOpen, GitBranch, MessageSquare } from 'lucide-react';

const integrations = [
  { name: 'Google', icon: <Cloud size={32} color="white" strokeWidth={1.5} />, bg: '#0ea5e9', left: '15%', top: '25%' },
  { name: 'Notion', icon: <BookOpen size={32} color="white" strokeWidth={1.5} />, bg: '#3b82f6', left: '33%', top: '15%' },
  { name: 'GitHub', icon: <GitBranch size={32} color="white" strokeWidth={1.5} />, bg: '#1e3a8a', left: '60%', top: '15%' },
  { name: 'Slack', icon: <MessageSquare size={32} color="white" strokeWidth={1.5} />, bg: '#22c55e', left: '78%', top: '25%' },
];

export default function Integrations() {
  return (
    <section id="integrations" style={{ paddingTop: '100px', background: 'white', overflow: 'hidden' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', textAlign: 'center' }}>

        {/* Integration icons row & connecting lines */}
        <div style={{ position: 'relative', height: '240px', width: '100%', maxWidth: '900px', margin: '0 auto' }}>
          
          {/* SVG Connecting Lines */}
          <svg
            viewBox="0 0 900 240"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          >
            {/* Lines from each icon converging to the center pill */}
            {[
              { x1: 135, y1: 120, x2: 450, y2: 240 },
              { x1: 297, y1: 96, x2: 450, y2: 240 },
              { x1: 540, y1: 96, x2: 450, y2: 240 },
              { x1: 702, y1: 120, x2: 450, y2: 240 },
            ].map((line, i) => (
              <path
                key={i}
                d={`M ${line.x1} ${line.y1} C ${line.x1} 190 ${line.x2} 170 ${line.x2} ${line.y2}`}
                fill="none"
                stroke="#d8b4fe"
                strokeWidth="2"
              />
            ))}
          </svg>

          {/* Icons */}
          {integrations.map((item) => (
            <div
              key={item.name}
              style={{
                position: 'absolute',
                left: item.left,
                top: item.top,
                transform: 'translateX(-50%)',
                zIndex: 10,
              }}
            >
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '18px',
                  background: item.bg,
                  border: '4px solid white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.02)',
                }}
              >
                {item.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Central pill */}
        <div style={{ position: 'relative', zIndex: 20, marginTop: '-18px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '10px 24px',
              background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
              borderRadius: '50px',
              color: 'white',
              fontSize: '13px',
              fontWeight: 600,
              boxShadow: '0 4px 16px rgba(139,92,246,0.3), inset 0 1px 1px rgba(255,255,255,0.2)',
              border: '2px solid white',
            }}
          >
            Ask Aura
          </div>
        </div>

      </div>

      {/* Large Curved Bottom Section */}
      <div
        style={{
          marginTop: '-30px',
          paddingTop: '120px',
          paddingBottom: '100px',
          background: 'linear-gradient(180deg, #f3f0ff 0%, #ffffff 100%)',
          borderTopLeftRadius: '50% 120px',
          borderTopRightRadius: '50% 120px',
          position: 'relative',
          textAlign: 'center',
          boxShadow: 'inset 0 2px 4px rgba(139,92,246,0.05)'
        }}
      >
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 24px' }}>
          <h2
            style={{
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: '#05020F',
              margin: '0 0 16px',
              lineHeight: 1.1,
            }}
          >
            Works Seamlessly With Your Tools
          </h2>
          <p style={{ fontSize: '16px', color: '#6b7280', margin: '0 auto 32px', lineHeight: 1.6 }}>
            Sync banks, accounting tools, payroll systems, and SaaS apps in minutes.
          </p>
          <button
            style={{
              padding: '14px 32px',
              borderRadius: '50px',
              border: '1px solid #e5e7eb',
              background: 'white',
              fontSize: '14px',
              fontWeight: 600,
              color: '#374151',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            Book a Demo
          </button>
        </div>
      </div>
    </section>
  );
}
