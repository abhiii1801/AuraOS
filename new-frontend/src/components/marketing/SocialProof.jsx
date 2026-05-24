import React, { useState } from 'react';
import { Cloud, BookOpen, CreditCard, MessageSquare } from 'lucide-react';

const companies = [
  { name: 'Google', icon: <Cloud size={20} color="#4285F4" />, bg: '#e8f0fe', color: '#4285F4' },
  { name: 'Notion', icon: <BookOpen size={20} color="#000" />, bg: '#f3f4f6', color: '#000' },
  { name: 'Stripe', icon: <CreditCard size={20} color="#635bff" />, bg: '#f0f4ff', color: '#635bff' },
  { name: 'Slack', icon: <MessageSquare size={20} color="#4A154B" />, bg: '#f5eef8', color: '#4A154B' },
];

const testimonials = [
  {
    quote:
      '"AuraOS completely changed how I manage my finances and knowledge. The AI flagged a subscription I forgot about, saving me hundreds. I\'ve reclaimed hours every week that used to go into spreadsheets."',
    name: 'Rahul Mehta',
    title: 'Founder, IndieHacker Labs',
    metric1: { value: '–35%', label: 'Monthly expenses' },
    metric2: { value: '10+ hrs', label: 'Saved per week' },
    company: 'Google',
  },
  {
    quote:
      '"The Second Brain vault alone is worth it. I ask Aura questions about notes I wrote months ago and it surfaces exactly what I need. Combined with health tracking, it feels like having a personal coach."',
    name: 'Priya Sharma',
    title: 'Product Lead, Notion',
    metric1: { value: '3x', label: 'Productivity boost' },
    metric2: { value: '∞', label: 'AI queries/day' },
    company: 'Notion',
  },
  {
    quote:
      '"We deployed AuraOS across our finance team and the ROI was immediate. Real-time expense alerts and AI forecasting helped us cut operating costs and plan with much more confidence."',
    name: 'David Lin',
    title: 'CFO, Stripe',
    metric1: { value: '–28%', label: 'Operating costs' },
    metric2: { value: '15+ hrs', label: 'Saved per week' },
    company: 'Stripe',
  },
];

export default function SocialProof() {
  const [activeIdx, setActiveIdx] = useState(0);
  const t = testimonials[activeIdx];

  return (
    <section id="testimonials" style={{ padding: '100px 24px', background: 'white' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
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
            Real teams
          </div>
          <h2
            style={{
              fontSize: 'clamp(26px, 4vw, 46px)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: '#05020F',
              margin: '0 0 14px',
              lineHeight: 1.12,
            }}
          >
            Trusted By Teams Worldwide
          </h2>
          <p style={{ fontSize: '16px', color: '#6b7280', maxWidth: '440px', margin: '0 auto' }}>
            See how individuals and businesses use AuraOS to save time, cut costs, and grow smarter.
          </p>
        </div>

        {/* Company Tabs */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '36px', flexWrap: 'wrap' }}>
          {companies.map((c, i) => (
            <button
              key={c.name}
              onClick={() => setActiveIdx(Math.min(i, testimonials.length - 1))}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 20px',
                borderRadius: '10px',
                border: '1.5px solid',
                borderColor: activeIdx === i ? '#05020F' : '#e5e7eb',
                background: activeIdx === i ? '#05020F' : 'white',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ display: 'flex' }}>{React.cloneElement(c.icon, { color: activeIdx === i ? 'white' : c.icon.props.color })}</span>
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: activeIdx === i ? 'white' : '#374151',
                }}
              >
                {c.name}
              </span>
            </button>
          ))}
        </div>

        {/* Testimonial Card */}
        <div
          key={activeIdx}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: '24px',
            background: 'white',
            borderRadius: '20px',
            padding: '36px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            alignItems: 'stretch',
            animation: 'fadeIn 0.3s ease',
          }}
        >
          <div>
            <p
              style={{
                fontSize: '16px',
                color: '#374151',
                lineHeight: 1.75,
                margin: '0 0 28px',
                fontStyle: 'italic',
              }}
            >
              {t.quote}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #774CFF, #c4b5fd)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '17px',
                  flexShrink: 0,
                }}
              >
                {t.name[0]}
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#05020F' }}>{t.name}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>{t.title}</div>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex' }}>{companies.find(c => c.name === t.company)?.icon}</div>
            </div>
          </div>

          {/* Metrics */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              minWidth: '160px',
            }}
          >
            {[t.metric1, t.metric2].map((m) => (
              <div
                key={m.label}
                style={{
                  background: '#f9fafb',
                  borderRadius: '14px',
                  padding: '18px 20px',
                  border: '1px solid #e5e7eb',
                  textAlign: 'center',
                  flex: 1,
                }}
              >
                <div
                  style={{
                    fontSize: '30px',
                    fontWeight: 800,
                    color: '#05020F',
                    letterSpacing: '-0.03em',
                    lineHeight: 1,
                    marginBottom: '4px',
                  }}
                >
                  {m.value}
                </div>
                <div style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 500 }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
