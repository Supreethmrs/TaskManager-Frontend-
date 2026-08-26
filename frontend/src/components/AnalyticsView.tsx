import React, { useState, useEffect } from 'react';
import './AnalyticsView.css';

interface AnalyticsData {
  total: number;
  completed: number;
  active: number;
  onTimeRate: number;
  xp: number;
  level: number;
  streakCount: number;
  velocityData: { day: string; count: number }[];
  categoryCounts: Record<string, number>;
  priorityCounts: Record<string, number>;
}

interface AnalyticsViewProps {
  token?: string | null;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ token: propToken }) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const token = propToken || localStorage.getItem('token');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/analytics', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (res.ok) {
          setData(json);
        }
      } catch (err) {
        console.error('Failed to fetch analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [token]);

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner" />
        <span>CALCULATING TELEMETRY & PRODUCTIVITY DATA...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="analytics-empty">
        <p>No telemetry data available yet. Complete quests to populate your Command Center.</p>
      </div>
    );
  }

  // Max count for velocity bar chart
  const maxVelocity = Math.max(1, ...data.velocityData.map((d) => d.count));
  const completionRate = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;

  return (
    <div className="analytics-container">
      {/* Overview Cards */}
      <div className="analytics-metrics-grid">
        <div className="metric-card">
          <span className="metric-label">TOTAL MISSIONS</span>
          <span className="metric-value">{data.total}</span>
          <span className="metric-sub">{data.completed} Cleared · {data.active} In Flight</span>
        </div>

        <div className="metric-card">
          <span className="metric-label">COMPLETION RATE</span>
          <span className="metric-value accent">{completionRate}%</span>
          <div className="mini-progress-bar">
            <div className="mini-progress-fill" style={{ width: `${completionRate}%` }} />
          </div>
        </div>

        <div className="metric-card">
          <span className="metric-label">ON-TIME EFFICIENCY</span>
          <span className="metric-value success">{data.onTimeRate}%</span>
          <span className="metric-sub">Punctual Deadline Clearances</span>
        </div>

        <div className="metric-card">
          <span className="metric-label">COMMANDER RANK</span>
          <span className="metric-value">LVL {data.level}</span>
          <span className="metric-sub">{data.xp} Total XP · 🔥 {data.streakCount}d Streak</span>
        </div>
      </div>

      {/* 7-Day Completion Velocity Chart */}
      <div className="analytics-chart-card">
        <div className="chart-header">
          <span className="chart-title">7-DAY MISSION COMPLETION VELOCITY</span>
          <span className="chart-subtitle">Daily cleared quests</span>
        </div>

        <div className="velocity-bars-container">
          {data.velocityData.map((item, idx) => {
            const heightPercent = Math.max(8, (item.count / maxVelocity) * 100);
            return (
              <div key={idx} className="velocity-bar-col">
                <div className="velocity-bar-track">
                  <div
                    className="velocity-bar-fill"
                    style={{ height: `${heightPercent}%` }}
                    title={`${item.count} quests completed on ${item.day}`}
                  >
                    <span className="bar-count-tag">{item.count}</span>
                  </div>
                </div>
                <span className="velocity-day-label">{item.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Breakdown Grid: Categories & Priority Distribution */}
      <div className="breakdown-grid">
        {/* Category Breakdown */}
        <div className="breakdown-card">
          <div className="chart-header">
            <span className="chart-title">CATEGORY ALLOCATION</span>
          </div>
          <div className="category-bars-list">
            {Object.entries(data.categoryCounts).map(([cat, count]) => {
              const percent = data.total > 0 ? Math.round((count / data.total) * 100) : 0;
              return (
                <div key={cat} className="category-stat-row">
                  <div className="cat-stat-info">
                    <span className="cat-stat-name">{cat}</span>
                    <span className="cat-stat-count">{count} ({percent}%)</span>
                  </div>
                  <div className="cat-track">
                    <div
                      className={`cat-fill ${cat.toLowerCase()}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="breakdown-card">
          <div className="chart-header">
            <span className="chart-title">PRIORITY SPECTRUM</span>
          </div>
          <div className="priority-spectrum-list">
            {Object.entries(data.priorityCounts).map(([prio, count]) => {
              return (
                <div key={prio} className="priority-stat-pill">
                  <span className={`prio-dot ${prio.toLowerCase()}`} />
                  <span className="prio-name">{prio}</span>
                  <span className="prio-count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
