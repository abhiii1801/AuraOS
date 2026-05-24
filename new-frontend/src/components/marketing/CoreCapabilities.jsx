import React from 'react';
import { Wallet, Brain, HeartPulse, Sparkles } from 'lucide-react';

// CoreCapabilities maps to the screenshot showing 4 feature icons/cards
// This section isn't in the screenshots but needed by Homepage.jsx — we'll keep it minimal and tasteful.

const features = [
  {
    icon: <Wallet size={24} color="#774CFF" />,
    title: 'Financial Intelligence',
    desc: 'Track income, expenses, and investments. Get AI predictions and smart budgeting across all your accounts.',
    color: '#774CFF',
    bg: '#f5f0ff',
  },
  {
    icon: <Brain size={24} color="#3b82f6" />,
    title: 'Second Brain Vault',
    desc: 'Capture notes, ideas, and documents. Ask your AI anything about your stored knowledge instantly.',
    color: '#3b82f6',
    bg: '#eff6ff',
  },
  {
    icon: <HeartPulse size={24} color="#ef4444" />,
    title: 'Health & Wellness',
    desc: 'Log workouts, sleep, and biometrics. AI surfaces trends and nudges you toward your health goals.',
    color: '#ef4444',
    bg: '#fff1f2',
  },
  {
    icon: <Sparkles size={24} color="#f59e0b" />,
    title: 'Ask Aura AI',
    desc: 'Your personal AI that understands your context. Ask anything across finance, health, tasks, and knowledge.',
    color: '#f59e0b',
    bg: '#fffbeb',
  },
];

export default function CoreCapabilities() {
  return (
    <section style={{ padding: '80px 24px', background: 'white' }}>
      <div style={{ width: '100%', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div
            style={{
              display: 'inline-block',
              padding: '5px 16px',
              background: '#f9fafb',
              border: '1.5px solid #e5e7eb',
              borderRadius: '50px',
              fontSize: '13px',
              fontWeight: 500,
              color: '#6b7280',
              marginBottom: '18px',
            }}
          >
            Core Capabilities
          </div>
          <h2
            style={{
              fontSize: 'clamp(28px, 4vw, 46px)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: '#05020F',
              margin: '0 0 16px',
              lineHeight: 1.1,
            }}
          >
            Everything You Need, In One OS
          </h2>
          <p style={{ fontSize: '16px', color: '#6b7280', maxWidth: '480px', margin: '0 auto', lineHeight: 1.6 }}>
            AuraOS brings finance, knowledge, health, and AI into a unified, intelligent workspace tailored to you.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px',
          }}
        >
          {features.map((f) => (
            <div
              key={f.title}
              style={{
                background: 'white',
                borderRadius: '18px',
                padding: '28px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                transition: 'all 0.25s',
                cursor: 'default',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 10px 30px ${f.color}20`;
                e.currentTarget.style.borderColor = f.color + '40';
                e.currentTarget.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: f.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '18px',
                }}
              >
                {f.icon}
              </div>
              <h3
                style={{
                  fontSize: '17px',
                  fontWeight: 700,
                  color: '#05020F',
                  margin: '0 0 10px',
                  lineHeight: 1.3,
                }}
              >
                {f.title}
              </h3>
              <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6, margin: 0 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
