import React from 'react';
import { useNavigate } from 'react-router-dom';

const links = {
  Product: ['Features', 'Pricing', 'Integrations', 'Changelog', 'Roadmap'],
  Company: ['About', 'Blog', 'Careers', 'Press'],
  Resources: ['Documentation', 'API Reference', 'Status', 'Support'],
  Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'],
};

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer style={{ background: '#05020F', color: 'white', padding: '72px 24px 36px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Top section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr repeat(4, 1fr)', gap: '32px', marginBottom: '60px' }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #774CFF, #a78bfa)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '15px',
                }}
              >
                A
              </div>
              <span style={{ fontWeight: 700, fontSize: '18px' }}>AuraOS</span>
            </div>
            <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.65, margin: '0 0 22px', maxWidth: '220px' }}>
              Your AI-powered personal operating system for finance, health, knowledge, and productivity.
            </p>
            <button
              onClick={() => navigate('/overview')}
              style={{
                padding: '10px 22px',
                borderRadius: '50px',
                border: 'none',
                background: 'linear-gradient(135deg, #774CFF, #9b6fff)',
                color: 'white',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(119,76,255,0.4)',
              }}
            >
              Get Started Free →
            </button>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px', margin: '0 0 16px' }}>
                {section}
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        textDecoration: 'none',
                        transition: 'color 0.2s',
                      }}
                      onMouseEnter={(e) => (e.target.style.color = 'white')}
                      onMouseLeave={(e) => (e.target.style.color = '#6b7280')}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid #1f2937',
            paddingTop: '28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <p style={{ fontSize: '13px', color: '#4b5563', margin: 0 }}>
            © 2026 AuraOS. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '20px' }}>
            {['Twitter', 'GitHub', 'LinkedIn', 'Discord'].map((social) => (
              <a
                key={social}
                href="#"
                style={{ fontSize: '13px', color: '#4b5563', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.target.style.color = '#a78bfa')}
                onMouseLeave={(e) => (e.target.style.color = '#4b5563')}
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
