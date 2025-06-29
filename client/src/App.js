import React from 'react';
import { PreferencesProvider } from './contexts/preferences';
import { ChatProvider } from './contexts/chat';
import ChatContainer from './components/chatcontainer';
import { SettingsProvider } from './contexts/settings';
import './index.css';

const App = () => (
  <PreferencesProvider>
    <SettingsProvider>
    <ChatProvider>
      <ChatContainer />
    </ChatProvider>
    </SettingsProvider>
  </PreferencesProvider>
);

export default App;
