import React, { useState } from 'react';

const faqs = [
  {
    q: 'Is my data private and secure?',
    a: 'Absolutely. AuraOS uses end-to-end encryption for all your data. We never sell or share your information. Your data is stored securely and only you can access it.',
  },
  {
    q: 'Can I connect my bank and financial accounts?',
    a: 'Yes! AuraOS integrates with major financial services and allows you to manually track expenses across any account. AI automatically categorizes and analyzes your spending patterns.',
  },
  {
    q: 'How does the AI learn about me?',
    a: 'AuraOS AI builds a personal context from your usage — finances, health logs, notes, and preferences. The more you use it, the more personalized and accurate its insights become.',
  },
  {
    q: 'What happens after the free trial?',
    a: 'After 14 days, you can continue on the free Starter plan (limited queries) or upgrade to Premium or Plutonium for full AI capabilities. No credit card is required for the trial.',
  },
  {
    q: 'Is AuraOS available on mobile?',
    a: 'AuraOS is a web-first platform optimized for all screen sizes. Native mobile apps are on our roadmap for Q3 2026.',
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <section style={{ padding: '100px 24px', background: '#F8F9FA' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
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
              marginBottom: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            FAQ
          </div>
          <h2
            style={{
              fontSize: 'clamp(26px, 4vw, 44px)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: '#05020F',
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            Common Questions
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {faqs.map((faq, i) => (
            <div
              key={i}
              style={{
                background: 'white',
                borderRadius: '14px',
                border: '1px solid',
                borderColor: open === i ? '#774CFF40' : '#e5e7eb',
                overflow: 'hidden',
                boxShadow: open === i ? '0 4px 16px rgba(119,76,255,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'all 0.2s',
              }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '20px 22px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  gap: '12px',
                }}
              >
                <span style={{ fontSize: '15px', fontWeight: 600, color: '#05020F' }}>{faq.q}</span>
                <span
                  style={{
                    fontSize: '18px',
                    color: '#774CFF',
                    transition: 'transform 0.25s',
                    transform: open === i ? 'rotate(45deg)' : 'rotate(0)',
                    flexShrink: 0,
                  }}
                >
                  +
                </span>
              </button>
              {open === i && (
                <div
                  style={{
                    padding: '0 22px 20px',
                    fontSize: '14.5px',
                    color: '#6b7280',
                    lineHeight: 1.7,
                    borderTop: '1px solid #f3f4f6',
                    paddingTop: '16px',
                  }}
                >
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
