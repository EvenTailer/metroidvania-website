import React, { useState } from 'react';
import { MicButton } from '../shared/ui/MicButton';
import { useSpeechInput } from '../shared/lib/useSpeechInput';

interface Message {
  role: 'bot' | 'user';
  text: string;
}

interface AiChatPageProps {
  onShowToast: (msg: string) => void;
}

export const AiChatPage: React.FC<AiChatPageProps> = ({ onShowToast }) => {
  const [provider, setProvider] = useState<'deepseek' | 'groq' | 'openrouter' | 'offline'>('deepseek');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('mv_key_deepseek') || '');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      text: 'Привет! Я твой ИИ-ассистент по разработке игры про Кибер-Утку. Можешь надиктовать вопрос через микрофон или написать текстом. На чем сейчас сфокусируемся: на коде Coyote Time, логике босса или нарезке костей Skeleton2D?'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [interim, setInterim] = useState('');
  const [loading, setLoading] = useState(false);
  const speech = useSpeechInput(onShowToast);

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const p = e.target.value as any;
    setProvider(p);
    const saved = localStorage.getItem(`mv_key_${p}`) || '';
    setApiKey(saved);
  };

  const handleSaveKey = () => {
    localStorage.setItem(`mv_key_${provider}`, apiKey.trim());
    onShowToast(`Ключ для ${provider.toUpperCase()} сохранен!`);
  };

  const startVoice = () => {
    if (speech.recording) return;
    speech.start({
      onInterim: setInterim,
      onFinal: (transcript) => {
        setInterim('');
        setInputValue(prev => (prev ? prev + ' ' : '') + transcript);
        onShowToast('Голос распознан');
      },
      onEnd: () => setInterim('')
    });
  };

  const stopVoice = () => {
    speech.stop();
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || loading) return;

    setMessages(prev => [...prev, { role: 'user', text }]);
    setInputValue('');

    const key = apiKey.trim() || localStorage.getItem(`mv_key_${provider}`) || '';

    if (provider === 'offline' || !key) {
      setTimeout(() => {
        let reply = '';
        if (text.toLowerCase().includes('coyote') || text.toLowerCase().includes('прыжок')) {
          reply = '💡 Паттерн Coyote Time в Godot 4: используйте таймер coyote_timer = 0.12. Когда персонаж на полу (is_on_floor()) — таймер сбрасывается в 0.12. В воздухе таймер тикает вниз delta. Если нажата кнопка прыжка и coyote_timer > 0 — разрешаем прыжок. Это дает 100% отзывчивость!';
        } else if (text.toLowerCase().includes('босс')) {
          reply = '👾 Паттерн босса: Фаза 1 — телеграфирование красным перед тяжелым ударом молота (окно для парирования 0.15с). Фаза 2 — удар по земле с ударной волной. Фаза 3 — пулеметные очереди, где идеальное парирование рикошетит пули обратно в босса.';
        } else {
          reply = `💡 (Локальный режим): Введите бесплатный API ключ (${provider.toUpperCase()}) в левой панели для полноценных живых ответов нейросети. Стек: Godot 4.3 + GDScript.`;
        }
        setMessages(prev => [...prev, { role: 'bot', text: reply }]);
      }, 350);
      return;
    }

    setLoading(true);

    try {
      let endpoint = 'https://api.deepseek.com/chat/completions';
      let model = 'deepseek-chat';

      if (provider === 'groq') {
        endpoint = 'https://api.groq.com/openai/v1/chat/completions';
        model = 'llama-3.3-70b-versatile';
      } else if (provider === 'openrouter') {
        endpoint = 'https://openrouter.ai/api/v1/chat/completions';
        model = 'deepseek/deepseek-r1:free';
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + key
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: 'Ты ведущий геймдизайнер и техлид игры Кибер-Утка (2D метроидвания на Godot 4.3, вдохновленная Nine Sols и Hollow Knight). Отвечай технически точно, с фрагментами GDScript кода когда уместно, на русском языке.'
            },
            { role: 'user', content: text }
          ]
        })
      });

      const data = await res.json();
      const botReply = data.choices?.[0]?.message?.content || 'Нет ответа от API';
      setMessages(prev => [...prev, { role: 'bot', text: botReply }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'bot', text: `Ошибка вызова API: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="view-content">
      <div className="ai-chat-layout">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="panel">
            <h4 style={{ fontSize: '13px', color: '#fff', marginBottom: '6px' }}>Провайдер ИИ</h4>
            <select
              className="btn btn-secondary"
              style={{ width: '100%', fontSize: '12px', marginBottom: '10px' }}
              value={provider}
              onChange={handleProviderChange}
            >
              <option value="deepseek">DeepSeek (Бесплатный/дешевый)</option>
              <option value="groq">Groq (Llama 3.3 / Ultra-Fast)</option>
              <option value="openrouter">OpenRouter (Free tier)</option>
              <option value="offline">Оффлайн Режим (База знаний)</option>
            </select>

            <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              API Ключ:
            </label>
            <input
              type="password"
              className="btn btn-secondary"
              style={{ width: '100%', textAlign: 'left', fontSize: '12px', marginBottom: '10px' }}
              placeholder={provider === 'offline' ? 'Ключ не требуется' : `Вставьте ключ для ${provider.toUpperCase()}...`}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={provider === 'offline'}
            />
            <button className="btn btn-primary" style={{ width: '100%', fontSize: '11px' }} onClick={handleSaveKey}>
              Сохранить ключ
            </button>
          </div>

          <div className="panel">
            <h4 style={{ fontSize: '13px', color: '#fff', marginBottom: '6px' }}>Режим диалога</h4>
            <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: 1.45 }}>
              Встроенный агент держит в голове: физику Godot 4, Coyote Time, тайминги парирования, нарезку спрайтов для Skeleton2D и структуру метроидвании.
            </p>
          </div>
        </div>

        <div className="chat-box">
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>ИИ-Партнер по разработке</span>
            <span style={{ fontSize: '11px', color: 'var(--accent-emerald)' }}>● Активен</span>
          </div>

          <div className="chat-messages">
            {messages.map((m, idx) => (
              <div key={idx} className={`chat-bubble ${m.role}`}>
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="chat-bubble bot" style={{ color: 'var(--accent-cyan)' }}>
                Генерация ответа...
              </div>
            )}
          </div>

          <div className="chat-prompt-chips">
            <button
              className="chip-btn"
              onClick={() => handleSendMessage('Напиши точный скрипт движения CharacterBody2D с Coyote Time (0.12s) и Jump Buffer (0.10s) на GDScript Godot 4')}
            >
              Код Coyote Time
            </button>
            <button
              className="chip-btn"
              onClick={() => handleSendMessage('Как нарезать A-позу утки на слои и привязать к Skeleton2D в Godot 4?')}
            >
              Пайплайн Skeleton2D
            </button>
            <button
              className="chip-btn"
              onClick={() => handleSendMessage('Придумай 3 фазы для первого босса Страж Сектора с телеграфированием атак')}
            >
              Фазы Босса
            </button>
            <button
              className="chip-btn"
              onClick={() => handleSendMessage('Как сделать шейдер Hitstop (0.08с замирания) и вспышку белым при ударе?')}
            >
              Шейдер Hitstop
            </button>
          </div>

          <div className="chat-input-bar">
            <input
              type="text"
              className="btn btn-secondary"
              style={{ flex: 1, textAlign: 'left', background: 'var(--bg-surface)' }}
              placeholder="Спросить о коде, дизайне, балансе..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
            />
            <MicButton recording={speech.recording} onStart={startVoice} onStop={stopVoice} />
            {interim && <p className="live-line chat-live" aria-live="polite">{interim}</p>}
            <button className="btn btn-primary" onClick={() => handleSendMessage()}>
              Отправить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
