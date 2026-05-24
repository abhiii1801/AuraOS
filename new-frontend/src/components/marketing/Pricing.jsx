import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Starter — Free',
    tagline: 'Perfect to explore AuraOS with no commitment.',
    monthly: 0,
    yearly: 0,
    cta: 'Start Free Trial',
    ctaStyle: 'outline',
    features: [
      'Basic dashboard overview',
      'Manual expense tracking',
      'Health log (manual entry)',
      'Limited AI queries (10/day)',
    ],
  },
  {
    name: 'Premium',
    recommended: true,
    tagline: 'Full AI power for individuals who want more.',
    monthly: 19.99,
    yearly: 15.99,
    cta: 'Get Started',
    ctaStyle: 'filled',
    features: [
      'Everything in Starter',
      'Advanced AI analytics',
      'Unlimited AI conversations',
      'Smart financial forecasting',
      'Priority customer support',
    ],
  },
  {
    name: 'Plutonium',
    tagline: 'Enterprise-grade for power users and teams.',
    monthly: 54.99,
    yearly: 43.99,
    cta: 'Get Started',
    ctaStyle: 'outline',
    features: [
      'Full access to all Premium features',
      'Unlimited usage, no daily limits',
      'Advanced analytics & detailed insights',
      'AI-powered tools & smart recommendations',
      'Priority customer support',
    ],
  },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(false);
  const navigate = useNavigate();

  return (
    <section id="pricing" style={{ padding: '100px 24px', background: '#F8F9FA' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
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
            Pricing Plan
          </div>
          <h2
            style={{
              fontSize: 'clamp(28px, 4vw, 52px)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: '#05020F',
              margin: '0 0 14px',
              lineHeight: 1.08,
            }}
          >
            Start Free. Upgrade When Ready.
          </h2>
          <p style={{ fontSize: '16px', color: '#6b7280', margin: '0 0 28px' }}>
            Try it out for 14 days, totally free — no credit card needed!
          </p>

          {/* Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: yearly ? 400 : 600, color: yearly ? '#9ca3af' : '#05020F' }}>Monthly</span>
            <button
              onClick={() => setYearly(!yearly)}
              style={{
                width: '48px',
                height: '26px',
                borderRadius: '13px',
                border: 'none',
                background: yearly ? 'linear-gradient(135deg, #774CFF, #9b6fff)' : '#d1d5db',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background 0.3s',
                padding: 0,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '3px',
                  left: yearly ? '25px' : '3px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'white',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                  transition: 'left 0.3s',
                }}
              />
            </button>
            <span style={{ fontSize: '14px', fontWeight: yearly ? 600 : 400, color: yearly ? '#05020F' : '#9ca3af' }}>
              Yearly <span style={{ color: '#22c55e', fontWeight: 700 }}>(Save 20%)</span>
            </span>
          </div>
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {plans.map((plan) => (
            <div
              key={plan.name}
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '32px',
                border: plan.recommended ? '2px solid #774CFF' : '1px solid #e5e7eb',
                boxShadow: plan.recommended
                  ? '0 8px 32px rgba(119,76,255,0.16)'
                  : '0 2px 8px rgba(0,0,0,0.05)',
                position: 'relative',
                transition: 'box-shadow 0.2s',
              }}
            >
              {plan.recommended && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-1px',
                    right: '24px',
                    background: 'linear-gradient(135deg, #774CFF, #9b6fff)',
                    color: 'white',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '4px 12px',
                    borderRadius: '0 0 8px 8px',
                    letterSpacing: '0.04em',
                  }}
                >
                  RECOMMENDED
                </div>
              )}

              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#05020F', margin: '0 0 6px' }}>{plan.name}</h3>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 22px', lineHeight: 1.5 }}>{plan.tagline}</p>

              <div style={{ marginBottom: '22px' }}>
                <span style={{ fontSize: '46px', fontWeight: 800, color: '#05020F', letterSpacing: '-0.03em' }}>
                  ${yearly ? plan.yearly : plan.monthly}
                </span>
                <span style={{ fontSize: '14px', color: '#9ca3af', marginLeft: '4px' }}>/Month</span>
              </div>

              <button
                onClick={() => navigate('/overview')}
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: '50px',
                  border: plan.ctaStyle === 'filled' ? 'none' : '1.5px solid #d1d5db',
                  background: plan.ctaStyle === 'filled'
                    ? 'linear-gradient(135deg, #774CFF, #9b6fff)'
                    : 'white',
                  color: plan.ctaStyle === 'filled' ? 'white' : '#374151',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: plan.ctaStyle === 'filled' ? '0 4px 14px rgba(119,76,255,0.35)' : 'none',
                  transition: 'all 0.2s',
                  marginBottom: '24px',
                }}
                onMouseEnter={(e) => {
                  if (plan.ctaStyle === 'filled') e.currentTarget.style.boxShadow = '0 8px 24px rgba(119,76,255,0.5)';
                  else { e.currentTarget.style.borderColor = '#774CFF'; e.currentTarget.style.color = '#774CFF'; }
                }}
                onMouseLeave={(e) => {
                  if (plan.ctaStyle === 'filled') e.currentTarget.style.boxShadow = '0 4px 14px rgba(119,76,255,0.35)';
                  else { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.color = '#374151'; }
                }}
              >
                {plan.cta}
              </button>

              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>Includes:</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  {plan.features.map((f) => (
                     <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13.5px', color: '#374151' }}>
                      <span style={{ display: 'flex', marginTop: '2px' }}><Check size={14} color="#22c55e" strokeWidth={3} /></span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
