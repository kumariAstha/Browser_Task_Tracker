let widgetHost = null;
let domainElement = null;
let timeElement = null;

function renderWidget() {
  if (widgetHost) return;
  widgetHost = document.createElement('div');
  widgetHost.id = "learning-tracker-widget";
  widgetHost.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: rgba(30, 41, 59, 0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 16px;
    padding: 12px 20px;
    color: #f8fafc;
    font-family: system-ui, sans-serif;
    box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    z-index: 2147483647;
    display: flex;
    align-items: center;
    gap: 12px;
    animation: lt-slideUp 0.3s ease-out;
  `;

  if (!document.getElementById("lt-styles")) {
    const style = document.createElement('style');
    style.id = "lt-styles";
    style.textContent = `
      @keyframes lt-slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `;
    if (document.head) document.head.appendChild(style);
  }

  const dot = document.createElement('div');
  dot.style.cssText = `
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #10b981;
    box-shadow: 0 0 8px #10b981;
  `;

  const textContainer = document.createElement('div');
  
  domainElement = document.createElement('div');
  domainElement.style.cssText = `
    font-size: 11px;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  `;

  timeElement = document.createElement('div');
  timeElement.style.cssText = `
    font-size: 18px;
    font-weight: bold;
    font-family: monospace;
  `;

  textContainer.appendChild(domainElement);
  textContainer.appendChild(timeElement);

  const closeBtn = document.createElement('button');
  closeBtn.textContent = "×";
  closeBtn.style.cssText = `
    background: none;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    padding: 4px;
    margin-left: 8px;
    font-size: 16px;
  `;
  closeBtn.onclick = () => {
    widgetHost.style.display = 'none';
  };

  widgetHost.appendChild(dot);
  widgetHost.appendChild(textContainer);
  widgetHost.appendChild(closeBtn);

  if (document.body) document.body.appendChild(widgetHost);
}

function updateWidget(domain, duration) {
  if (!widgetHost) renderWidget();
  if (widgetHost) widgetHost.style.display = 'flex';
  
  if (domainElement) domainElement.textContent = domain;
  
  const totalSeconds = Math.floor(duration / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  if (timeElement) timeElement.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function removeWidget() {
  if (widgetHost) {
    widgetHost.style.display = 'none';
  }
}

function checkActive() {
  if (chrome && chrome.runtime && chrome.runtime.id) {
    try {
      chrome.runtime.sendMessage({ type: "GET_ACTIVE_SESSION" }, (response) => {
        if (chrome.runtime.lastError) {
          // Message dropped or SW not ready, ignore quietly
          return;
        }
        
        if (response && response.domain) {
          updateWidget(response.domain, response.activeDuration);
        } else {
          removeWidget();
        }
      });
    } catch (e) {
      // Ignore extension context destroyed errors
    }
  }
}

setInterval(checkActive, 1000);
