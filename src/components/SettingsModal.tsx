import React, { useState } from 'react';
import { AIDifficulty } from '../engine/ai';

export interface GameSettings {
  mode: 'pvp' | 'ai';
  aiColor: 'white' | 'black';
  difficulty: AIDifficulty;
  timeControl: number; // seconds per player
  soundEnabled: boolean;
  boardTheme: BoardTheme;
  showCoordinates: boolean;
  showAnalysis: boolean;
}

export type BoardTheme = 'classic' | 'green' | 'blue' | 'purple' | 'dark';

interface SettingsModalProps {
  settings: GameSettings;
  onSave: (settings: GameSettings) => void;
  onClose: () => void;
}

export const BOARD_THEMES: Record<BoardTheme, { light: string; dark: string; label: string }> = {
  classic: { light: '#f0d9b5', dark: '#b58863', label: 'Classic' },
  green:   { light: '#eeeed2', dark: '#769656', label: 'Green' },
  blue:    { light: '#dee3e6', dark: '#8ca2ad', label: 'Blue' },
  purple:  { light: '#f0e5f5', dark: '#9b72cf', label: 'Purple' },
  dark:    { light: '#4a4a5a', dark: '#2a2a3e', label: 'Dark' },
};

export const TIME_CONTROLS = [
  { label: '1 min', value: 60 },
  { label: '3 min', value: 180 },
  { label: '5 min', value: 300 },
  { label: '10 min', value: 600 },
  { label: '15 min', value: 900 },
  { label: '30 min', value: 1800 },
  { label: 'No limit', value: 0 },
];

export const DEFAULT_SETTINGS: GameSettings = {
  mode: 'pvp',
  aiColor: 'black',
  difficulty: 'medium',
  timeControl: 600,
  soundEnabled: true,
  boardTheme: 'classic',
  showCoordinates: true,
  showAnalysis: false,
};

const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onSave, onClose }) => {
  const [local, setLocal] = useState<GameSettings>({ ...settings });

  const update = <K extends keyof GameSettings>(key: K, val: GameSettings[K]) => {
    setLocal(prev => ({ ...prev, [key]: val }));
  };

  const btnStyle = (active: boolean): React.CSSProperties => ({
    padding: '7px 14px',
    borderRadius: '6px',
    border: `1px solid ${active ? '#e94560' : '#333'}`,
    background: active ? 'rgba(233,69,96,0.15)' : 'rgba(255,255,255,0.04)',
    color: active ? '#e94560' : '#aaa',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: active ? 700 : 400,
    transition: 'all 0.15s',
  });

  const sectionLabel: React.CSSProperties = {
    fontSize: '11px',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '8px',
    marginTop: '16px',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 999,
    }}>
      <div style={{
        background: '#16213e',
        borderRadius: '16px',
        padding: '28px',
        width: '400px',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h2 style={{ color: '#eaeaea', fontSize: '20px', fontWeight: 700 }}>⚙ Settings</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#666', fontSize: '20px', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Game mode */}
        <div style={sectionLabel}>Game Mode</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={btnStyle(local.mode === 'pvp')} onClick={() => update('mode', 'pvp')}>👥 vs Player</button>
          <button style={btnStyle(local.mode === 'ai')} onClick={() => update('mode', 'ai')}>🤖 vs AI</button>
        </div>

        {/* AI settings */}
        {local.mode === 'ai' && (
          <>
            <div style={sectionLabel}>AI Difficulty</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['easy', 'medium', 'hard'] as AIDifficulty[]).map(d => (
                <button key={d} style={btnStyle(local.difficulty === d)} onClick={() => update('difficulty', d)}>
                  {d === 'easy' ? '🟢' : d === 'medium' ? '🟡' : '🔴'} {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>

            <div style={sectionLabel}>You Play As</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={btnStyle(local.aiColor === 'black')} onClick={() => update('aiColor', 'black')}>⬜ White</button>
              <button style={btnStyle(local.aiColor === 'white')} onClick={() => update('aiColor', 'white')}>⬛ Black</button>
            </div>
          </>
        )}

        {/* Time control */}
        <div style={sectionLabel}>Time Control</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {TIME_CONTROLS.map(tc => (
            <button key={tc.value} style={btnStyle(local.timeControl === tc.value)} onClick={() => update('timeControl', tc.value)}>
              {tc.label}
            </button>
          ))}
        </div>

        {/* Board theme */}
        <div style={sectionLabel}>Board Theme</div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {(Object.entries(BOARD_THEMES) as [BoardTheme, typeof BOARD_THEMES[BoardTheme]][]).map(([key, theme]) => (
            <div
              key={key}
              onClick={() => update('boardTheme', key)}
              style={{
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              <div style={{
                width: '40px', height: '40px',
                borderRadius: '6px',
                border: local.boardTheme === key ? '2px solid #e94560' : '2px solid #333',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                overflow: 'hidden',
              }}>
                <div style={{ background: theme.light }} />
                <div style={{ background: theme.dark }} />
                <div style={{ background: theme.dark }} />
                <div style={{ background: theme.light }} />
              </div>
              <div style={{ fontSize: '10px', color: '#666', marginTop: '3px' }}>{theme.label}</div>
            </div>
          ))}
        </div>

        {/* Toggles */}
        <div style={sectionLabel}>Options</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { key: 'soundEnabled', label: '🔊 Sound effects' },
            { key: 'showCoordinates', label: '📍 Show coordinates' },
            { key: 'showAnalysis', label: '📊 Show position analysis' },
          ].map(({ key, label }) => (
            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#aaa', fontSize: '14px' }}>
              <input
                type="checkbox"
                checked={local[key as keyof GameSettings] as boolean}
                onChange={e => update(key as keyof GameSettings, e.target.checked as any)}
                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#e94560' }}
              />
              {label}
            </label>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: '11px', borderRadius: '8px', background: 'transparent', border: '1px solid #333', color: '#888', cursor: 'pointer', fontSize: '14px' }}
          >
            Cancel
          </button>
          <button
            onClick={() => { onSave(local); onClose(); }}
            style={{ flex: 1, padding: '11px', borderRadius: '8px', background: 'linear-gradient(135deg, #e94560, #c73652)', border: 'none', color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: 700 }}
          >
            Apply & New Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
