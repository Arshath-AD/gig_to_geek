import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { chatService } from '../../services/chatService';
import logoImage from '../../assets/logo.png';
import { Sparkles, Send, Bot, User as UserIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import '../dashboard/Home.css';
import './AiAdvisor.css';

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  content: "Hello! I'm your AI Advisor. I have access to your transaction history, income, and fixed expenses. Ask me anything — whether it's how to cut costs, how much you've spent this month, or how to hit your savings goal faster.",
};

export default function AiAdvisorPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { id: Date.now(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const data = await chatService.sendMessage(text);
      const assistantMsg = { id: Date.now() + 1, role: 'assistant', content: data.reply };
      setMessages(prev => [...prev, assistantMsg]);
      // Persist last AI reply so the dashboard can show a quick summary
      localStorage.setItem('gg_last_ai_reply', data.reply);
    } catch (err) {
      const errMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: err?.response?.data?.detail || 'Something went wrong. Please try again.',
        isError: true,
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="home-layout">
      <header className="home-nav" role="banner">
        <div className="nav-container">
          <Link to="/home" className="auth-brand" aria-label="GigToGeek home">
            <img src={logoImage} alt="GigToGeek Logo" className="brand-logo-img" />
            <span className="brand-name">GigToGeek</span>
          </Link>

          <nav className="nav-links" aria-label="Main navigation">
            <Link to="/home"         className="nav-link">Overview</Link>
            <Link to="/transactions" className="nav-link">Transactions</Link>
            <Link to="/income"       className="nav-link">Income</Link>
            <Link to="/ai-advisor"   className="nav-link nav-link--active">AI Advisor</Link>
            <Link to="/profile"      className="nav-link">Settings</Link>
          </nav>

          <div className="nav-actions">
            <Link to="/profile" className="nav-avatar" aria-label={`Logged in as ${user?.full_name}`}>
              {(user?.full_name?.charAt(0) ?? 'U').toUpperCase()}
            </Link>
          </div>
        </div>
      </header>

      <main className="home-main">
        <section className="home-header-section" style={{ marginBottom: '24px' }}>
          <div>
            <h1 className="greeting-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={24} style={{ color: '#a78bfa' }} />
              AI Advisor
            </h1>
            <p className="greeting-sub">Your personal financial coach, powered by your real data.</p>
          </div>
        </section>

        <div className="ai-chat-container">
          {/* Messages */}
          <div className="ai-chat-messages" id="chat-messages-box">
            {messages.map(msg => (
              <div key={msg.id} className={`ai-message ai-message--${msg.role}`}>
                <div className="ai-message__avatar">
                  {msg.role === 'assistant'
                    ? <Bot size={16} />
                    : <UserIcon size={16} />
                  }
                </div>
                <div className={`ai-message__bubble ${msg.isError ? 'ai-message__bubble--error' : ''}`}>
                  {msg.role === 'assistant' && !msg.isError
                    ? <ReactMarkdown>{msg.content}</ReactMarkdown>
                    : msg.content
                  }
                </div>
              </div>
            ))}

            {loading && (
              <div className="ai-message ai-message--assistant">
                <div className="ai-message__avatar"><Bot size={16} /></div>
                <div className="ai-message__bubble ai-message__bubble--typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="ai-chat-input-row">
            <textarea
              id="ai-advisor-input"
              className="ai-chat-input"
              rows={1}
              placeholder="Ask about your spending, savings, or budget…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              id="ai-advisor-send"
              className="ai-chat-send"
              onClick={handleSend}
              disabled={loading || !input.trim()}
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
