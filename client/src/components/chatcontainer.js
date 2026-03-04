import { Routes, Route } from 'react-router-dom';
import SettingsPage from './settings/SettingsPage';
import Sidebar from './sidebar';
import ModelSelector from './modelselector';
import MessageList from './messagelist';
import InputArea from './inputArea';
import ArtifactPanel from './ArtifactPanel';

const ChatContainer = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Sidebar />

      <main className="flex flex-col flex-1 relative min-w-0">
        <Routes>
          <Route path="/" element={
            <div className="flex h-full overflow-hidden">
              <div className="flex flex-col flex-1 min-w-0 relative h-full">
                <ModelSelector />
                <MessageList />
                <InputArea />
              </div>
              <ArtifactPanel />
            </div>
          } />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
};

export default ChatContainer;
