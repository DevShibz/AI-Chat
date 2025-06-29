import React, { useState, useCallback, useMemo, useContext } from 'react';

const SettingsContext = React.createContext(null);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    ollamaUrl: 'http://localhost:4000',
    defaultModel: 'gemma3:4b',
    maxTokens: 2048,
    temperature: 0.7
  });

  const updateSettings = useCallback((newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const value = useMemo(() => ({
    settings,
    updateSettings
  }), [settings, updateSettings]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};