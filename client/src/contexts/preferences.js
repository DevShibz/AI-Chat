import React, { useState, useCallback, useMemo, useContext } from 'react';

const PreferencesContext = React.createContext(null);

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error('usePreferences must be used within PreferencesProvider');
  return context;
};

export const PreferencesProvider = ({ children }) => {
  const [preferences, setPreferences] = useState({
    theme: 'light',
    fontSize: 'medium',
    streamingEnabled: true,
    soundEnabled: false
  });

  React.useEffect(() => {
    if (preferences.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [preferences.theme]);

  const updatePreferences = useCallback((newPrefs) => {
    setPreferences(prev => ({ ...prev, ...newPrefs }));
  }, []);

  const toggleTheme = useCallback(() => {
    setPreferences(prev => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light'
    }));
  }, []);

  const value = useMemo(() => ({
    preferences,
    updatePreferences,
    toggleTheme
  }), [preferences, updatePreferences, toggleTheme]);

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
};
