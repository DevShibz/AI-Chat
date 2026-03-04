import React, { useEffect, useRef } from 'react';
import { X, Code, Maximize2 } from 'lucide-react';
import { useChat } from '../contexts/chat';

const ArtifactPanel = () => {
    const { artifact, setArtifact } = useChat();

    if (!artifact) return null;

    const { type, content, title } = artifact;

    const handleClose = () => setArtifact(null);

    return (
        <div className="w-1/2 min-w-[300px] max-w-[800px] border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col h-full transition-all duration-300 shadow-xl z-10" style={{ animation: 'slideIn 0.3s ease-out' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center gap-2">
                    <Code className="h-4 w-4 text-blue-500" />
                    <span className="font-semibold text-gray-700 dark:text-gray-200 text-sm truncate max-w-[200px]">{title || 'Preview'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleClose} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg text-gray-500 transition-colors">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
            <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-950 p-4 flex items-center justify-center relative">
                {type === 'html' && (
                    <div className="w-full h-full bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-800">
                        <iframe
                            title="preview"
                            srcDoc={content}
                            className="w-full h-full"
                            sandbox="allow-scripts"
                        />
                    </div>
                )}
                {type === 'svg' && (
                    <div className="w-full h-full flex items-center justify-center p-4 bg-[url('https://svgedit.netlify.app/images/grid.png')] bg-white rounded-lg shadow-sm overflow-auto border border-gray-200 dark:border-gray-800">
                        <div dangerouslySetInnerHTML={{ __html: content }} className="w-full h-full flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:w-auto [&>svg]:h-auto" />
                    </div>
                )}
                {type === 'image' && (
                    <div className="flex items-center justify-center w-full h-full">
                        <img src={content} alt="Artifact" className="max-w-full max-h-full object-contain rounded-lg shadow-sm" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArtifactPanel;
