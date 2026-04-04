import React, { useEffect, useState } from 'react';
import { Flame, Settings, X, Timer, Activity, Search, LayoutDashboard, ArrowLeft, Plus } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

function formatTime(ms) {
  if (!ms) return "0h 0m";
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

function getDateString(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const QUOTES = {
  lateNight: [
    "The world is quiet. Your mind doesn't have to be.",
    "Sleep is overrated. Learning isn't.",
    "Legends aren't made in the daylight.",
    "3 AM thoughts hit different when you're actually productive.",
    "While they sleep, you build.",
    "The night is young. So is your potential.",
    "Silence is the best classroom.",
    "Even the moon is watching you grind.",
    "Fun fact: Newton discovered gravity at night. Probably.",
    "Tomorrow's you will thank tonight's you.",
    "Caffeine + curiosity = unstoppable.",
    "Plot twist: you're actually a night owl genius.",
    "The stars can't shine without darkness. Neither can you.",
    "This is your villain origin story. Study arc.",
  ],
  morning: [
    "Fresh coffee, fresh start, fresh knowledge.",
    "The early bird catches the algorithm.",
    "Your brain is at 100% battery. Use it wisely.",
    "Today's a good day to learn something dangerous.",
    "Morning pages, morning progress.",
    "Rise and grind — literally.",
    "Somewhere, someone less talented is outworking you. Not today.",
    "First tab of the day? Make it count.",
    "Neurons are firing. Let's make them count.",
    "Good morning. Time to be smarter than yesterday.",
    "The best time to learn was yesterday. The next best is now.",
    "Coffee in hand, world in reach.",
    "Start before you're ready.",
    "Small steps every morning. Mountains by the end of the year.",
  ],
  afternoon: [
    "Afternoon slump? Knowledge is the antidote.",
    "You're halfway through the day. Make the other half legendary.",
    "Lunch is over. Greatness resumes.",
    "Your future self is watching. Don't disappoint them.",
    "Push through. The dopamine of learning awaits.",
    "Discipline is choosing between what you want now and what you want most.",
    "One more chapter. One more lesson. One step closer.",
    "Consistency beats intensity. Keep going.",
    "Think of this as training. Your mind is the muscle.",
    "Bored? Great. That's your brain begging to learn.",
    "The middle of the day is the middle of your story. Write it well.",
    "Procrastination is the thief of time. Don't get robbed.",
    "Somewhere in the world, a 12-year-old just shipped an app. Your move.",
    "Focus is a superpower. Activate it.",
  ],
  evening: [
    "Wind down with wisdom.",
    "Evening study sessions build tomorrow's breakthroughs.",
    "The sunset is beautiful. So is a completed todo list.",
    "End the day 1% smarter. Compound interest does the rest.",
    "Reflect, review, repeat.",
    "Not every hero wears a cape. Some open textbooks at 8 PM.",
    "The day isn't over until you've learned something new.",
    "Evening mode: activated. Distraction mode: deactivated.",
    "A quiet evening and an open mind — perfect combo.",
    "They're watching Netflix. You're building a future.",
    "Golden hour for the mind.",
    "Today was good. Tomorrow will be better. Because of tonight.",
    "Your brain doesn't have business hours. Keep learning.",
    "Plot twist: the best part of today hasn't happened yet.",
  ],
};

function getRandomQuote() {
  const h = new Date().getHours();
  let pool;
  if (h < 5) pool = QUOTES.lateNight;
  else if (h < 12) pool = QUOTES.morning;
  else if (h < 17) pool = QUOTES.afternoon;
  else if (h < 22) pool = QUOTES.evening;
  else pool = QUOTES.lateNight;
  return pool[Math.floor(Math.random() * pool.length)];
}


export default function App() {
  const [trackingData, setTrackingData] = useState({});
  const [trackedSites, setTrackedSites] = useState({});
  const [newSite, setNewSite] = useState('');
  const [newGoal, setNewGoal] = useState('60');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [timeRange, setTimeRange] = useState(7);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [topSites, setTopSites] = useState([]);
  const [quote] = useState(() => getRandomQuote());

  // Custom shortcuts
  const [customShortcuts, setCustomShortcuts] = useState([]);
  const [showAddShortcut, setShowAddShortcut] = useState(false);
  const [scName, setScName] = useState('');
  const [scUrl, setScUrl] = useState('');

  useEffect(() => {
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);

    const loadData = () => {
      if (chrome && chrome.storage) {
        chrome.storage.local.get(['trackingData', 'trackedSites', 'customShortcuts'], (res) => {
          setTrackingData(res.trackingData || {});
          let sites = res.trackedSites || {};
          if (Array.isArray(sites)) {
            const newSites = {};
            sites.forEach(s => newSites[s] = 60);
            sites = newSites;
            chrome.storage.local.set({ trackedSites: sites });
          }
          setTrackedSites(sites);
          setCustomShortcuts(res.customShortcuts || []);
        });
      }
    };

    if (chrome && chrome.topSites) {
      chrome.topSites.get((sites) => {
        setTopSites(sites ? sites.slice(0, 6) : []);
      });
    }

    loadData();
    const dataInterval = setInterval(loadData, 60000);

    return () => {
      clearInterval(clockInterval);
      clearInterval(dataInterval);
    };
  }, []);

  const handleAddSite = () => {
    const site = newSite.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    const goalMins = parseInt(newGoal, 10);
    if (site && !isNaN(goalMins) && goalMins > 0) {
      const updatedSites = { ...trackedSites, [site]: goalMins };
      setTrackedSites(updatedSites);
      if (chrome && chrome.storage) chrome.storage.local.set({ trackedSites: updatedSites });
    }
    setNewSite('');
  };

  const handleRemoveSite = (siteToRemove) => {
    const updatedSites = { ...trackedSites };
    delete updatedSites[siteToRemove];
    setTrackedSites(updatedSites);
    if (selectedDomain === siteToRemove) setSelectedDomain(null);
    if (chrome && chrome.storage) chrome.storage.local.set({ trackedSites: updatedSites });
  };

  const handleAddShortcut = () => {
    let url = scUrl.trim();
    const name = scName.trim();
    if (!url || !name) return;
    if (!url.startsWith('http')) url = 'https://' + url;
    const updated = [...customShortcuts, { name, url }];
    setCustomShortcuts(updated);
    if (chrome && chrome.storage) chrome.storage.local.set({ customShortcuts: updated });
    setScName('');
    setScUrl('');
    setShowAddShortcut(false);
  };

  const removeCustomShortcut = (index) => {
    const updated = customShortcuts.filter((_, i) => i !== index);
    setCustomShortcuts(updated);
    if (chrome && chrome.storage) chrome.storage.local.set({ customShortcuts: updated });
  };

  const calculateStreak = (domain, goalMins) => {
    let streak = 0;
    const goalMs = goalMins * 60000;
    for (let i = 0; i < 365; i++) {
      const dateStr = getDateString(i);
      const timeMs = trackingData[dateStr]?.[domain] || 0;
      if (i === 0 && timeMs < goalMs) continue;
      if (timeMs >= goalMs) streak++;
      else break;
    }
    return streak;
  };

  const generateChartData = (domain) => {
    const data = [];
    for (let i = timeRange - 1; i >= 0; i--) {
      const dateStr = getDateString(i);
      const dateObj = new Date();
      dateObj.setDate(dateObj.getDate() - i);
      let label = '';
      if (timeRange === 7) label = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
      else if (timeRange === 30) label = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      else label = dateObj.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      const timeMs = trackingData[dateStr]?.[domain] || 0;
      data.push({ date: label, minutes: Math.round(timeMs / 60000) });
    }
    if (timeRange === 365) {
      const grouped = {};
      data.forEach(d => { grouped[d.date] = (grouped[d.date] || 0) + d.minutes; });
      return Object.keys(grouped).map(k => ({ date: k, minutes: grouped[k] }));
    }
    return data;
  };

  const todayStr = getDateString(0);
  const todayData = trackingData[todayStr] || {};
  const totalTodayMs = Object.values(todayData).reduce((a, b) => a + b, 0);
  const timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateString = currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

  // Build merged shortcuts: custom first, then fill with topSites up to ~8
  const allShortcuts = [];
  customShortcuts.forEach((sc, i) => {
    let hostname = '';
    try { hostname = new URL(sc.url).hostname.replace(/^www\./, ''); } catch { hostname = sc.url; }
    allShortcuts.push({ url: sc.url, label: sc.name, hostname, isCustom: true, customIndex: i });
  });
  const usedHosts = new Set(allShortcuts.map(s => s.hostname));
  topSites.forEach(site => {
    if (allShortcuts.length >= 8) return;
    let hostname = '';
    try { hostname = new URL(site.url).hostname.replace(/^www\./, ''); } catch { hostname = site.url; }
    if (!usedHosts.has(hostname)) {
      allShortcuts.push({ url: site.url, label: hostname, hostname, isCustom: false });
      usedHosts.add(hostname);
    }
  });

  return (
    <div className="app-container">

      {/* Ambient Background */}
      <div className="ambient-bg">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      {/* VIEW 1: SEARCH ENGINE */}
      {!isTrackerOpen && (
        <div className="search-view">
          <button className="apps-button" onClick={() => setIsTrackerOpen(true)}>
            <LayoutDashboard size={18} /> Tracker
          </button>

          <div className="greeting-text">{quote}</div>
          <h1 className="clock-display">{timeString}</h1>
          <div className="date-display">{dateString}</div>

          <form className="search-form" action="https://www.google.com/search" method="GET">
            <Search size={20} className="google-logo" color="#6366f1" />
            <input
              className="search-input"
              type="text"
              name="q"
              placeholder="Search Google..."
              autoFocus
              autoComplete="off"
            />
            <button type="submit" className="search-btn">
              <ArrowLeft size={18} style={{ transform: 'rotate(180deg)' }} />
            </button>
          </form>

          {/* Shortcuts Row */}
          <div className="shortcuts-grid">
            {allShortcuts.map((sc, idx) => {
              const favicon = `https://www.google.com/s2/favicons?sz=64&domain=${sc.hostname}`;
              return (
                <a key={sc.url + idx} href={sc.url} className="shortcut-bubble" title={sc.label}>
                  <div className="shortcut-icon-wrap">
                    <img
                      src={favicon}
                      alt={sc.hostname}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const span = document.createElement('span');
                        span.className = 'fallback-letter';
                        span.textContent = (sc.label || '?')[0].toUpperCase();
                        e.target.parentNode.appendChild(span);
                      }}
                    />
                  </div>
                  <span className="shortcut-label">{sc.label}</span>
                </a>
              );
            })}

            {/* Add Shortcut (+) */}
            <button className="shortcut-add" onClick={() => setShowAddShortcut(true)} title="Add shortcut">
              <div className="shortcut-icon-wrap">
                <Plus size={20} color="#71717a" />
              </div>
              <span className="shortcut-label">Add</span>
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2: TRACKER DASHBOARD */}
      {isTrackerOpen && (
        <div className="tracker-view">
          <nav className="top-nav">
            <div className="nav-left">
              <button className="back-to-search" onClick={() => setIsTrackerOpen(false)} title="Back to Search">
                <ArrowLeft size={20} />
              </button>
              <div className="brand">LearningTracker</div>
            </div>
            <button className="settings-btn" onClick={() => setIsSettingsOpen(true)}>
              <Settings size={20} />
            </button>
          </nav>

          <div className="split-view">
            <div className="sidebar">
              <div className="sidebar-header">Tracked Websites</div>
              <div className="sidebar-list">
                {Object.entries(trackedSites).map(([domain, goalMins]) => {
                  const timeMs = todayData[domain] || 0;
                  const streak = calculateStreak(domain, goalMins);
                  const isActive = selectedDomain === domain;
                  return (
                    <div
                      key={domain}
                      className={`sidebar-item ${isActive ? 'active' : ''}`}
                      onClick={() => setSelectedDomain(domain)}
                    >
                      <div>
                        <div className="domain-name" style={{ color: isActive ? '#6366f1' : 'var(--text-primary)' }}>{domain}</div>
                        <div className="domain-time">{formatTime(timeMs)} today</div>
                      </div>
                      {streak > 0 && (
                        <div className="streak-pill"><Flame size={14} /> {streak}</div>
                      )}
                    </div>
                  );
                })}
                {Object.keys(trackedSites).length === 0 && (
                  <div style={{ color: 'var(--text-secondary)', padding: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>
                    No sites tracked yet. Use settings to add sites!
                  </div>
                )}
              </div>
            </div>

            <div className="main-content">
              {!selectedDomain ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  <Activity size={48} color="#6366f1" style={{ marginBottom: '1.5rem', opacity: 0.6 }} />
                  <div style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem' }}>Overall Study Time Today</div>
                  <h1 style={{ fontSize: '5rem', margin: 0, fontWeight: 800, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{formatTime(totalTodayMs)}</h1>
                  <p style={{ marginTop: '2rem', color: 'var(--text-secondary)' }}>Select a website from the sidebar to view detailed analytics.</p>
                </div>
              ) : (
                <>
                  <div className="detail-header">
                    <div>
                      <h1 className="detail-title">{selectedDomain}</h1>
                      <div className="detail-subtitle">In-depth analytics and usage over time</div>
                    </div>
                    <div className="time-toggles">
                      <button className={`toggle-btn ${timeRange === 7 ? 'active' : ''}`} onClick={() => setTimeRange(7)}>7 Days</button>
                      <button className={`toggle-btn ${timeRange === 30 ? 'active' : ''}`} onClick={() => setTimeRange(30)}>30 Days</button>
                      <button className={`toggle-btn ${timeRange === 365 ? 'active' : ''}`} onClick={() => setTimeRange(365)}>Overall</button>
                    </div>
                  </div>

                  <div className="progress-banner">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
                      <div>
                        <div className="pb-label">Today's Session</div>
                        <div style={{ fontSize: '2rem', fontWeight: 700 }}>{formatTime(todayData[selectedDomain] || 0)}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="pb-label">Daily Goal</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{trackedSites[selectedDomain]} mins</div>
                      </div>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${Math.min(((todayData[selectedDomain] || 0) / (trackedSites[selectedDomain] * 60000)) * 100, 100)}%`,
                          background: ((todayData[selectedDomain] || 0) / (trackedSites[selectedDomain] * 60000)) >= 1 ? 'var(--success-color)' : 'var(--accent-gradient)',
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="graph-container">
                    <div style={{ marginBottom: '1rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Time spent (Minutes)</div>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={generateChartData(selectedDomain)} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="detailGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" stroke="#3f3f46" fontSize={11} tickLine={false} axisLine={false} dy={10} minTickGap={20} />
                        <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', color: '#f4f4f5', boxShadow: '0 10px 30px rgba(0,0,0,0.6)' }} itemStyle={{ color: '#6366f1', fontWeight: 700 }} />
                        <Area type="monotone" dataKey="minutes" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#detailGradient)" activeDot={{ r: 6, fill: '#6366f1', stroke: '#0a0a0f', strokeWidth: 3 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Shortcut Modal */}
      {showAddShortcut && (
        <div className="add-shortcut-modal" onClick={() => setShowAddShortcut(false)}>
          <div className="add-shortcut-card" onClick={e => e.stopPropagation()}>
            <h3>Add Shortcut</h3>
            <input
              type="text"
              placeholder="Name"
              value={scName}
              onChange={e => setScName(e.target.value)}
              autoFocus
            />
            <input
              type="text"
              placeholder="URL (e.g. github.com)"
              value={scUrl}
              onChange={e => setScUrl(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddShortcut(); }}
            />
            <div className="add-shortcut-actions">
              <button className="btn-cancel" onClick={() => setShowAddShortcut(false)}>Cancel</button>
              <button className="btn-save" onClick={handleAddShortcut}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="modal-overlay" onClick={() => setIsSettingsOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2><Settings size={22} className="lucide" style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} /> Tracker Settings</h2>
              <button className="close-btn" onClick={() => setIsSettingsOpen(false)}><X size={24} /></button>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              Add platforms you want to track time for. Set a daily minimum studying duration (goal) to keep your streak alive.
            </p>
            <div className="site-input-container">
              <input type="text" className="site-input" placeholder="Domain (e.g. coursera.org)" value={newSite} onChange={(e) => setNewSite(e.target.value)} />
              <input type="number" className="site-input" style={{ flex: '0 0 100px' }} placeholder="Mins" value={newGoal} onChange={(e) => setNewGoal(e.target.value)} />
              <button className="site-btn" onClick={handleAddSite}>Add</button>
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', marginTop: '2rem' }}>Currently Tracking</h3>
            <ul className="site-list">
              {Object.entries(trackedSites).map(([site, goal]) => (
                <li className="site-item" key={site}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '10px' }}>
                      <Timer size={18} className="lucide" />
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{site}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Goal: {goal} mins/day</div>
                    </div>
                  </div>
                  <button className="site-remove-btn" onClick={() => handleRemoveSite(site)} title="Stop tracking this site"><X size={16} /></button>
                </li>
              ))}
              {Object.keys(trackedSites).length === 0 && (
                <li style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem 0' }}>No websites tracked.</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
