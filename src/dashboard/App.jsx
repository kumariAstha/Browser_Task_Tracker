import React, { useEffect, useState } from 'react';
import { Flame, Settings, X, Timer, Activity, Search, LayoutDashboard, ArrowLeft } from 'lucide-react';
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

export default function App() {
  const [trackingData, setTrackingData] = useState({});
  const [trackedSites, setTrackedSites] = useState({});
  const [newSite, setNewSite] = useState('');
  const [newGoal, setNewGoal] = useState('60');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // UI States
  const [isTrackerOpen, setIsTrackerOpen] = useState(false); // Toggle Search Engine vs Tracker
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [timeRange, setTimeRange] = useState(7); // 7, 30, 365
  const [currentTime, setCurrentTime] = useState(new Date());
  const [topSites, setTopSites] = useState([]);

  useEffect(() => {
    // Clock interval
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Data loader
    const loadData = () => {
      if (chrome && chrome.storage) {
        chrome.storage.local.get(['trackingData', 'trackedSites'], (res) => {
          setTrackingData(res.trackingData || {});
          let sites = res.trackedSites || {};
          if (Array.isArray(sites)) {
            const newSites = {};
            sites.forEach(s => newSites[s] = 60);
            sites = newSites;
            chrome.storage.local.set({ trackedSites: sites });
          }
          setTrackedSites(sites);
        });
      }
    };

    loadData();
    const dataInterval = setInterval(loadData, 60000);

    // Fetch top sites for shortcuts
    if (chrome && chrome.topSites) {
      chrome.topSites.get((sites) => {
        setTopSites(sites ? sites.slice(0, 8) : []);
      });
    }

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
      
      let label = "";
      if (timeRange === 7) {
        label = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
      } else if (timeRange === 30) {
        label = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else {
        label = dateObj.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      }
      
      const timeMs = trackingData[dateStr]?.[domain] || 0;
      data.push({ date: label, minutes: Math.round(timeMs / 60000) });
    }
    
    if (timeRange === 365) {
      const groupedData = {};
      data.forEach(d => {
        if (!groupedData[d.date]) groupedData[d.date] = 0;
        groupedData[d.date] += d.minutes;
      });
      return Object.keys(groupedData).map(k => ({ date: k, minutes: groupedData[k] }));
    }
    
    return data;
  };

  const todayStr = getDateString(0);
  const todayData = trackingData[todayStr] || {};
  const totalTodayMs = Object.values(todayData).reduce((a, b) => a + b, 0);

  // Time rendering helpers
  const timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateString = currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="app-container">
      
      {/* =========================================================
          VIEW 1: SEARCH ENGINE HOMEPAGE
          ========================================================= */}
      {!isTrackerOpen && (
        <div className="search-view">
          <button className="apps-button" onClick={() => setIsTrackerOpen(true)}>
            <LayoutDashboard size={20} /> Tracker
          </button>
          
          <h1 className="clock-display">{timeString}</h1>
          <div className="date-display">{dateString}</div>
          
          <form className="search-form" action="https://www.google.com/search" method="GET">
            <Search size={22} className="google-logo" color="#94a3b8" />
            <input 
              className="search-input" 
              type="text" 
              name="q" 
              placeholder="Search the web..." 
              autoFocus 
              autoComplete="off"
            />
            <button type="submit" className="search-btn">
              <ArrowLeft size={20} style={{ transform: 'rotate(180deg)' }} />
            </button>
          </form>

          {/* Top Sites Shortcuts */}
          {topSites.length > 0 && (
            <div className="shortcuts-grid">
              {topSites.map((site) => {
                let hostname = '';
                try { hostname = new URL(site.url).hostname.replace(/^www\./, ''); } catch { hostname = site.url; }
                const favicon = `https://www.google.com/s2/favicons?sz=64&domain=${hostname}`;
                return (
                  <a key={site.url} href={site.url} className="shortcut-bubble" title={site.title}>
                    <div className="shortcut-icon-wrap">
                      <img
                        src={favicon}
                        alt={hostname}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const span = document.createElement('span');
                          span.className = 'fallback-letter';
                          span.textContent = (hostname || '?')[0].toUpperCase();
                          e.target.parentNode.appendChild(span);
                        }}
                      />
                    </div>
                    <span className="shortcut-label">{hostname}</span>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          VIEW 2: TRACKER SPLIT-PANE DASHBOARD
          ========================================================= */}
      {isTrackerOpen && (
        <div className="tracker-view">
          {/* Top Navbar */}
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
            {/* LEFT PANE: Sidebar List */}
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
                        <div className="domain-name" style={{ color: isActive ? '#3b82f6' : 'var(--text-primary)' }}>{domain}</div>
                        <div className="domain-time">{formatTime(timeMs)} today</div>
                      </div>
                      {streak > 0 && (
                        <div className="streak-pill">
                          <Flame size={14} /> {streak}
                        </div>
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

            {/* RIGHT PANE: Detail / Global View */}
            <div className="main-content">
              {!selectedDomain ? (
                // Global Overview
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  <Activity size={48} color="#3b82f6" style={{ marginBottom: '1.5rem', opacity: 0.8 }} />
                  <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem' }}>Overall Study Time Today</div>
                  <h1 style={{ fontSize: '6rem', margin: 0, fontWeight: 800, textShadow: '0 0 50px rgba(59, 130, 246, 0.4)' }}>{formatTime(totalTodayMs)}</h1>
                  <p style={{ marginTop: '2rem', color: 'var(--text-secondary)' }}>Select a website from the sidebar to view detailed analytics.</p>
                </div>
              ) : (
                // Selected Domain View
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

                  {/* Progress Summary Banner */}
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
                          background: ((todayData[selectedDomain] || 0) / (trackedSites[selectedDomain] * 60000)) >= 1 ? 'var(--success-color)' : 'var(--accent-gradient)' 
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Big Chart Area */}
                  <div className="graph-container">
                    <div style={{ marginBottom: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Time spent (Minutes)</div>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={generateChartData(selectedDomain)} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="detailGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} dy={10} minTickGap={20} />
                        <Tooltip 
                          contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', color: '#f4f4f5', boxShadow: '0 10px 30px rgba(0,0,0,0.6)' }}
                          itemStyle={{ color: '#3b82f6', fontWeight: 700 }}
                        />
                        <Area type="monotone" dataKey="minutes" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#detailGradient)" activeDot={{ r: 8, fill: '#3b82f6', stroke: '#09090b', strokeWidth: 3 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal Setup */}
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
              <input 
                type="text" 
                className="site-input" 
                placeholder="Domain (e.g. coursera.org)" 
                value={newSite}
                onChange={(e) => setNewSite(e.target.value)}
              />
              <input 
                type="number"
                className="site-input"
                style={{ flex: '0 0 100px' }}
                placeholder="Mins"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
              />
              <button className="site-btn" onClick={handleAddSite}>Add</button>
            </div>

            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', marginTop: '2rem' }}>Currently Tracking</h3>
            <ul className="site-list">
              {Object.entries(trackedSites).map(([site, goal]) => (
                <li className="site-item" key={site}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '10px' }}>
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
