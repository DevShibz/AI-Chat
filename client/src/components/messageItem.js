import React from 'react';
import { User, Bot, Loader2, AlertCircle, Copy, Download } from 'lucide-react';
import { formatTime } from '../utils/helper';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const MessageItem = React.memo(({ message }) => {
  const isUser = message.role === 'user';

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
  };

  const handleDownloadCode = (code, language = 'txt') => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code-snippet.${language}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderCodeBlock = (code, language, showStreamingCursor = false) => {
    return (
      <div className="relative group">
        <SyntaxHighlighter
          language={language}
          style={oneDark}
          wrapLines={true}
          showLineNumbers={false}
          customStyle={{
            borderRadius: '0.5rem',
            fontSize: '0.85rem',
            padding: '1rem',
            backgroundColor: '#282c34',
          }}
        >
          {showStreamingCursor ? code + '█' : code}
        </SyntaxHighlighter>
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => handleCopyCode(code)}
            className="p-1 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
            title="Copy code"
          >
            <Copy className="h-3 w-3 text-white" />
          </button>
          <button
            onClick={() => handleDownloadCode(code, language)}
            className="p-1 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
            title="Download code"
          >
            <Download className="h-3 w-3 text-white" />
          </button>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (message.error) {
      return (
        <div className="text-red-600 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>{message.error}</span>
        </div>
      );
    }

    // 🔄 STREAMING MODE — check if it's code
    if (message.isStreaming) {
      const codeMatch = message.content.match(/^```(\w+)?\n([\s\S]*)$/); // Incomplete block
      if (codeMatch) {
        const lang = codeMatch[1] || 'javascript';
        const code = codeMatch[2];
        return renderCodeBlock(code, lang, true);
      }

      // Plain text streaming
      return (
        <p className="text-gray-900 whitespace-pre-wrap">
          {message.content}
          <span className="animate-pulse text-gray-500">█</span>
        </p>
      );
    }

    // ✅ FINALIZED MESSAGE — Mixed content: text + code blocks
    const segments = [];
    const regex = /```(\w+)?\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(message.content)) !== null) {
      const [fullMatch, lang, code] = match;

      if (match.index > lastIndex) {
        segments.push({
          type: 'text',
          content: message.content.slice(lastIndex, match.index),
        });
      }

      segments.push({
        type: 'code',
        lang: lang || 'javascript',
        content: code,
      });

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < message.content.length) {
      segments.push({
        type: 'text',
        content: message.content.slice(lastIndex),
      });
    }

    return (
      <div className="space-y-4">
        {segments.map((seg, i) =>
          seg.type === 'code' ? (
            renderCodeBlock(seg.content, seg.lang)
          ) : (
            <p key={i} className="text-gray-900 whitespace-pre-wrap">
              {seg.content}
            </p>
          )
        )}
      </div>
    );
  };

  return (
    <div className={`flex gap-3 p-4 ${isUser ? 'bg-gray-50' : 'bg-white'}`}>
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-blue-600' : 'bg-gray-600'
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4 text-white" />
        ) : (
          <Bot className="h-4 w-4 text-white" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm text-gray-900">
            {isUser ? 'You' : 'Assistant'}
          </span>
          <span className="text-xs text-gray-500">
            {formatTime(new Date(message.timestamp))}
          </span>
          {message.isStreaming && (
            <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
          )}
        </div>

        {message.images?.length > 0 && (
          <div className="flex gap-2 mb-3 flex-wrap">
            {message.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Uploaded ${index + 1}`}
                className="max-w-xs rounded-lg border border-gray-200"
              />
            ))}
          </div>
        )}

        <div className="prose prose-sm max-w-none">{renderContent()}</div>
      </div>
    </div>
  );
});

export default MessageItem;