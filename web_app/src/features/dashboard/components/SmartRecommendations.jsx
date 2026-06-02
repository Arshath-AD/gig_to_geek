import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Lightbulb, ArrowRight } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

/** Extract up to `max` bullet-worthy sentences from a markdown AI reply */
function extractBullets(raw, max = 4) {
  if (!raw) return [];

  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);

  const bullets = [];
  for (const line of lines) {
    // Strip markdown list prefixes and bold markers
    const clean = line
      .replace(/^[-*\d.]+\s*/, '')   // list prefix
      .replace(/\*\*/g, '')           // bold
      .replace(/^#+\s*/, '')          // headings
      .trim();

    // Skip very short, empty, or heading-only lines
    if (clean.length < 15) continue;

    bullets.push(clean);
    if (bullets.length >= max) break;
  }
  return bullets;
}

export function SmartRecommendations({ insights, loadingInsights }) {
  const { user } = useAuth();
  const [lastReply, setLastReply] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('gg_last_ai_reply');
    if (stored) setLastReply(stored);
  }, []);

  const bullets = extractBullets(lastReply);
  const hasAiAccess = user?.has_ai_access;

  return (
    <div>
      <h2 className="section-title">Smart Recommendations</h2>

      {loadingInsights ? (
        <div className="empty-state"><span className="spinner" /></div>

      ) : lastReply && bullets.length > 0 ? (
        /* ── Last AI reply as concise bullet list ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {bullets.map((b, i) => (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '10px',
                padding: '12px 14px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                lineHeight: '1.5',
              }}
            >
              <Lightbulb size={14} style={{ flexShrink: 0, marginTop: '2px', color: '#a78bfa' }} />
              <span>{b}</span>
            </div>
          ))}

          {/* Link back to chat */}
          {hasAiAccess && (
            <Link
              to="/ai-advisor"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                fontSize: '12px', color: '#a78bfa', marginTop: '4px',
                textDecoration: 'none', fontWeight: 500,
              }}
            >
              <Sparkles size={12} /> Continue conversation <ArrowRight size={12} />
            </Link>
          )}
        </div>

      ) : insights.length > 0 ? (
        /* ── Fallback: static insights ── */
        <div className="insights-list">
          {insights.map(i => (
            <div key={i.id} className="insight-item">
              <div className="insight-icon-wrap">
                <Lightbulb size={18} />
              </div>
              <div className="insight-content">
                <h4>{i.title}</h4>
                <p>{i.body}</p>
              </div>
            </div>
          ))}
        </div>

      ) : (
        /* ── Empty state ── */
        <div className="empty-state">
          <Lightbulb size={24} style={{ marginBottom: '8px' }} />
          {hasAiAccess
            ? <p>No recent AI insights. <Link to="/ai-advisor" style={{ color: '#a78bfa' }}>Ask your AI Advisor →</Link></p>
            : <p>No new insights. Log more transactions to get personalized advice.</p>
          }
        </div>
      )}
    </div>
  );
}
