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

  const updatePreferences = useCallback((newPrefs) => {
    setPreferences(prev => ({ ...prev, ...newPrefs }));
  }, []);

  const value = useMemo(() => ({
    preferences,
    updatePreferences
  }), [preferences, updatePreferences]);

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
};
