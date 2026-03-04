import React from 'react';
import { PreferencesProvider } from './contexts/preferences';
import { ChatProvider } from './contexts/chat';
import ChatContainer from './components/chatcontainer';
import { SettingsProvider } from './contexts/settings';
import './index.css';

import { BrowserRouter } from 'react-router-dom';

const App = () => (
  <BrowserRouter>
    <PreferencesProvider>
      <SettingsProvider>
        <ChatProvider>
          <ChatContainer />
        </ChatProvider>
      </SettingsProvider>
    </PreferencesProvider>
  </BrowserRouter>
);

export default App;
