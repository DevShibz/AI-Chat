import React from 'react';
import { usePreferences } from '../../contexts/preferences';
import { useSettings } from '../../contexts/settings';
import { Moon, Sun, Monitor, Volume2, VolumeX, Type, Server } from 'lucide-react';

const SettingsPage = () => {
    const { preferences, toggleTheme, updatePreferences } = usePreferences();
    const { settings, updateSettings } = useSettings();

    const handleFontSizeChange = (size) => {
        updatePreferences({ fontSize: size });
    };

    return (
        <div className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-y-auto p-8 transition-colors duration-300">
            <div className="max-w-2xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Settings</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage your preferences and application settings.</p>
                </div>

                {/* Appearance Section */}
                <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
                        <Monitor className="w-5 h-5 text-blue-500" />
                        Appearance
                    </h2>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-700 dark:text-gray-300">Theme</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Select your preferred interface theme</p>
                            </div>
                            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                                <button
                                    onClick={() => preferences.theme !== 'light' && toggleTheme()}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${preferences.theme === 'light'
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                        }`}
                                >
                                    <Sun className="w-4 h-4" /> Light
                                </button>
                                <button
                                    onClick={() => preferences.theme !== 'dark' && toggleTheme()}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${preferences.theme === 'dark'
                                            ? 'bg-gray-600 text-white shadow-sm'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                        }`}
                                >
                                    <Moon className="w-4 h-4" /> Dark
                                </button>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 dark:border-gray-700 pt-6 flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-700 dark:text-gray-300">Font Size</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Adjust the text size of messages</p>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg p-1">
                                <button
                                    onClick={() => handleFontSizeChange('small')}
                                    className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600 ${preferences.fontSize === 'small' ? 'bg-gray-100 dark:bg-gray-600' : ''}`}
                                    title="Small"
                                >
                                    <Type className="w-3 h-3" />
                                </button>
                                <button
                                    onClick={() => handleFontSizeChange('medium')}
                                    className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600 ${preferences.fontSize === 'medium' ? 'bg-gray-100 dark:bg-gray-600' : ''}`}
                                    title="Medium"
                                >
                                    <Type className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleFontSizeChange('large')}
                                    className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600 ${preferences.fontSize === 'large' ? 'bg-gray-100 dark:bg-gray-600' : ''}`}
                                    title="Large"
                                >
                                    <Type className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Backend & AI Section */}
                <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
                        <Server className="w-5 h-5 text-purple-500" />
                        Backend Connection
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Ollama Server URL
                            </label>
                            <input
                                type="text"
                                value={settings.ollamaUrl}
                                onChange={(e) => updateSettings({ ollamaUrl: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                            />
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Default: http://localhost:4000 (Proxy)</p>
                        </div>
                    </div>
                </section>

                {/* Behavior Section */}
                <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Sound Effects</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Play sounds when receiving messages</p>
                        </div>
                        <button
                            onClick={() => updatePreferences({ soundEnabled: !preferences.soundEnabled })}
                            className={`p-2 rounded-lg transition-colors ${preferences.soundEnabled
                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                                }`}
                        >
                            {preferences.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                        </button>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default SettingsPage;
