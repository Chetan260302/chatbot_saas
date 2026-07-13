// frontend/public/widget.js
// This is served as a static file — NOT part of the React build
// Any website includes it via <script src="...widget.js">

(function () {
  const config = window.BOTIFY_CONFIG || {}
  const { apiKey, chatbotId, apiUrl } = config

  if (!apiKey || !chatbotId) {
    console.error('Botify widget: missing apiKey or chatbotId')
    return
  }

  const sessionId = 'widget-' + Math.random().toString(36).slice(2)

  // ── Inject styles ──
  const style = document.createElement('style')
  style.textContent = `
    #botify-bubble {
      position: fixed; bottom: 24px; right: 24px;
      width: 60px; height: 60px; border-radius: 50%;
      background: linear-gradient(135deg, #ea580c, #fb923c);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; box-shadow: 0 8px 24px rgba(234,88,12,0.4);
      z-index: 999999; font-size: 26px; border: none;
      transition: transform 0.2s ease;
    }
    #botify-bubble:hover { transform: scale(1.08); }
    #botify-window {
      position: fixed; bottom: 96px; right: 24px;
      width: 360px; height: 500px; max-width: 90vw; max-height: 70vh;
      background: #0c0a09; border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.4);
      display: none; flex-direction: column; overflow: hidden;
      z-index: 999999; font-family: system-ui, sans-serif;
      border: 1px solid rgba(234,88,12,0.2);
    }
    #botify-window.open { display: flex; }
    #botify-header {
      padding: 16px; background: rgba(234,88,12,0.1);
      border-bottom: 1px solid rgba(234,88,12,0.15);
      color: #fff7ed; font-weight: 700; font-size: 14px;
    }
    #botify-messages {
      flex: 1; overflow-y: auto; padding: 16px;
      display: flex; flex-direction: column; gap: 10px;
    }
    .botify-msg {
      max-width: 80%; padding: 10px 14px; border-radius: 14px;
      font-size: 13px; line-height: 1.5; color: #fff7ed;
    }
    .botify-msg.user { align-self: flex-end; background: #ea580c; }
    .botify-msg.bot  { align-self: flex-start; background: rgba(255,255,255,0.06); }
    #botify-input-row {
      display: flex; gap: 8px; padding: 12px;
      border-top: 1px solid rgba(234,88,12,0.15);
    }
    #botify-input {
      flex: 1; background: rgba(255,255,255,0.05);
      border: 1px solid rgba(234,88,12,0.2); border-radius: 10px;
      padding: 10px 12px; color: #fff7ed; font-size: 13px; outline: none;
    }
    #botify-send {
      background: #ea580c; border: none; border-radius: 10px;
      color: white; padding: 0 14px; cursor: pointer;
    }
  `
  document.head.appendChild(style)

  // ── Build DOM ──
  const bubble = document.createElement('button')
  bubble.id = 'botify-bubble'
  bubble.innerHTML = '💬'

  const win = document.createElement('div')
  win.id = 'botify-window'
  win.innerHTML = `
    <div id="botify-header">Chat with us</div>
    <div id="botify-messages"></div>
    <div id="botify-input-row">
      <input id="botify-input" placeholder="Type a message..." />
      <button id="botify-send">→</button>
    </div>
  `

  document.body.appendChild(bubble)
  document.body.appendChild(win)

  bubble.onclick = () => win.classList.toggle('open')

  const messagesEl = win.querySelector('#botify-messages')
  const inputEl     = win.querySelector('#botify-input')
  const sendBtn     = win.querySelector('#botify-send')

  function addMessage(role, text) {
    const div = document.createElement('div')
    div.className = `botify-msg ${role}`
    div.textContent = text
    messagesEl.appendChild(div)
    messagesEl.scrollTop = messagesEl.scrollHeight
    return div
  }

  async function send() {
    const msg = inputEl.value.trim()
    if (!msg) return
    inputEl.value = ''
    addMessage('user', msg)
    const botDiv = addMessage('bot', '')

    const res = await fetch(`${apiUrl}/api/v1/public/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({
        message: msg,
        session_id: sessionId,
        chatbot_id: chatbotId,
      }),
    })

    if (!res.ok) {
      botDiv.remove()
      addMessage('bot', 'This assistant is temporarily unavailable. Please contact the business directly.')
      return
    }

    const reader  = res.body.getReader()
    const decoder = new TextDecoder()
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      botDiv.textContent += decoder.decode(value, { stream: true })
      messagesEl.scrollTop = messagesEl.scrollHeight
    }
  }

  sendBtn.onclick = send
  inputEl.onkeydown = (e) => { if (e.key === 'Enter') send() }
})()