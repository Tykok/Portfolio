import { useEffect, useRef, useState } from 'react';

import { useLang } from 'context/LangContext';
import { identity } from 'data/identity';
import { socials } from 'data/socials';

interface Message {
  from: string;
  text: string;
  ts: number;
}

const CONTACTS = socials.filter((s) => s.primary);

export function Contact() {
  const { lang, t } = useLang();
  const [active, setActive] = useState(CONTACTS[0]);
  const [messages, setMessages] = useState<Message[]>([
    { from: 'them', text: String(t('c_greet')), ts: Date.now() - 60000 },
  ]);
  const [input, setInput] = useState('');
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messages]);

  const send = () => {
    const msg = input.trim();
    if (!msg) return;
    const now = Date.now();
    setMessages((prev) => [
      ...prev,
      { from: 'me', text: msg, ts: now },
      { from: 'them', text: String(t('c_auto')), ts: now + 1000 },
    ]);
    setInput('');
  };

  const fmt = (ts: number) =>
    new Intl.DateTimeFormat(lang === 'fr' ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit' }).format(new Date(ts));

  return (
    <div className="msn" style={{ height: '100%' }}>
      {/* Contacts sidebar */}
      <div className="msn-side">
        <div className="msn-me">
          <div style={{ width: 32, height: 32, borderRadius: 6, background: 'linear-gradient(150deg,#ff9d57,#b83d12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: 13, flexShrink: 0 }}>
            T
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 12 }}>{identity.alias}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div className="msn-status" />
              <span style={{ fontSize: 11 }}>{String(t('c_online'))}</span>
            </div>
          </div>
        </div>

        {CONTACTS.map((s) => (
          <div
            key={s.key}
            className="msn-contact"
            style={{ background: active.key === s.key ? 'rgba(255,255,255,.85)' : undefined }}
            onClick={() => setActive(s)}
          >
            <div style={{ width: 28, height: 28, borderRadius: 50, background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: 10, flexShrink: 0 }}>
              {s.monogram}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 12 }}>{s.label}</div>
              <div style={{ fontSize: 10, color: 'var(--ink-dim)' }}>{s.desc[lang]}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Chat */}
      <div className="msn-chat">
        {/* Chat header */}
        <div style={{ padding: '8px 12px', background: 'linear-gradient(180deg,#eaf2ff,#dbe7ff)', borderBottom: '1px solid #b9cdf0', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, borderRadius: 50, background: active.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: 11, flexShrink: 0 }}>
            {active.monogram}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{active.label}</div>
            <a href={active.href} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: 'var(--blue-600)' }}>
              {active.value}
            </a>
          </div>
        </div>

        {/* Messages */}
        <div className="msn-log" ref={logRef}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.from === 'me' ? 'flex-end' : 'flex-start' }}>
              <div className={`bubble ${msg.from === 'me' ? 'me' : 'them'}`}>{msg.text}</div>
              <div style={{ fontSize: 10, color: 'var(--ink-dim)', marginTop: 2 }}>{fmt(msg.ts)}</div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="msn-input">
          <input
            className="tq-input"
            value={input}
            placeholder={String(t('c_ph'))}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
          />
          <button className="tq-btn is-default" onClick={send}>{String(t('c_send'))}</button>
        </div>
      </div>
    </div>
  );
}
