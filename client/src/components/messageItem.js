import React, { useState } from 'react';
import { User, Bot, Loader2, AlertCircle, Copy, Check, Terminal, Eye } from 'lucide-react';
import { formatTime } from '../utils/helper';
import { useChat } from '../contexts/chat';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Extracted CodeBlock component to prevent re-creation on every render
const CodeBlock = ({ node, inline, className, children, ...props }) => {
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : 'text';
  const code = String(children).replace(/\n$/, '');
  const [codeCopied, setCodeCopied] = useState(false);
  const { setArtifact } = useChat();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handlePreview = (e) => {
    e.stopPropagation(); // Prevent any parent click handlers

    // Determine type
    const isSvg = language === 'svg' || code.trim().startsWith('<svg');
    const type = isSvg ? 'svg' : 'html';

    console.log('Preview clicked:', { type, codeLength: code.length });
    setArtifact({ type, content: code, title: 'Preview' });
  };

  if (inline) {
    return (
      <code className="bg-gray-100 dark:bg-gray-800 text-red-500 dark:text-red-400 rounded px-1.5 py-0.5 text-sm font-mono" {...props}>
        {children}
      </code>
    );
  }

  return (
    <div className="markdown-code-block relative group my-4 rounded-lg overflow-hidden border border-gray-700/50 shadow-sm">
      <div className="code-block-header flex items-center justify-between px-4 py-2 bg-[#1e1e1e] border-b border-gray-700/50">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{language}</span>
        </div>
        <div className="flex items-center gap-2">
          {((language === 'html' || language === 'svg' || language === 'xml') ||
            (code.trim().startsWith('<svg')) ||
            (code.trim().includes('<!DOCTYPE html') || code.trim().startsWith('<html'))) && (
              <button
                onClick={handlePreview}
                className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors mr-2 cursor-pointer z-10"
                title="Open Preview"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
            )}
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer z-10"
          >
            {codeCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-400" />
                <span className="text-green-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy code</span>
              </>
            )}
          </button>
        </div>
      </div>
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={language}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: 0,
          padding: '1.5rem',
          backgroundColor: '#1e1e1e',
          fontSize: '0.9rem',
          lineHeight: '1.5',
        }}
        {...props}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

const MessageItem = React.memo(({ message }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const { setArtifact } = useChat();

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const preprocessContent = (content) => {
    if (!content) return '';

    // Check if the content has raw svg/html tags that aren't wrapped in code blocks
    // This is a simple heuristic to fix common issues where models output raw code
    const lines = content.split('\n');
    let inCodeBlock = false;
    let processedLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.trim().startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        processedLines.push(line);
        continue;
      }

      if (!inCodeBlock) {
        // Check for start of SVG/HTML without code block
        if ((line.trim().startsWith('<svg') || line.trim().startsWith('<!DOCTYPE html') || line.trim().startsWith('<html')) &&
          !line.includes('`')) {
          processedLines.push('```xml');
          processedLines.push(line);
          // We optimistically start a code block, we need to find where to end it
          // For now, let's just let the next real code block or end of string close it?
          // Actually, let's just wrap the whole "block" of likely code
          // A better strategy might be replacing specifically identified blocks

          // Simpler approach for this specific issue:
          // If we see a raw tag start, and we are not in a code block, check if it looks like a block of code
          continue;
        }
      }
      processedLines.push(line);
    }

    // Better Regex approach to find orphan tags
    return content.replace(
      /(^|\n)(<svg[\s\S]*?<\/svg>|<html[\s\S]*?<\/html>|<!DOCTYPE html>[\s\S]*?<\/html>)/g,
      (match, prefix, code) => {
        // Check if already wrapped (simple check)
        if (content.includes('```' + code) || content.includes(code + '```')) return match;
        return `${prefix}\`\`\`xml\n${code}\n\`\`\``;
      }
    );
  };

  const processedContent = React.useMemo(() => preprocessContent(message.content), [message.content]);

  const MarkdownComponents = React.useMemo(() => ({
    code: CodeBlock,
    p: ({ children }) => <p className="mb-4 last:mb-0 leading-relaxed text-gray-800 dark:text-gray-200">{children}</p>,
    ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-800 dark:text-gray-200">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-2 text-gray-800 dark:text-gray-200">{children}</ol>,
    li: ({ children }) => <li className="pl-1">{children}</li>,
    h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 mt-6 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">{children}</h1>,
    h2: ({ children }) => <h2 className="text-xl font-bold mb-3 mt-5 text-gray-900 dark:text-white">{children}</h2>,
    h3: ({ children }) => <h3 className="text-lg font-bold mb-2 mt-4 text-gray-900 dark:text-white">{children}</h3>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-blue-500 pl-4 py-1 my-4 bg-blue-50 dark:bg-blue-900/20 text-gray-700 dark:text-gray-300 italic rounded-r">
        {children}
      </blockquote>
    ),
    table: ({ children }) => (
      <div className="markdown-table overflow-x-auto my-6 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-gray-50 dark:bg-gray-800/50">{children}</thead>,
    th: ({ children }) => (
      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
        {children}
      </th>
    ),
    tbody: ({ children }) => <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">{children}</tbody>,
    td: ({ children }) => <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed min-w-[120px]">{children}</td>,
    a: ({ href, children }) => (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
        {children}
      </a>
    ),
  }), []); // Empty dependency array as these components don't depend on props

  return (
    <div className={`group flex gap-4 p-6 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors`}>
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${isUser ? 'bg-blue-600 bg-gradient-to-br from-blue-500 to-blue-700' : 'bg-emerald-600 bg-gradient-to-br from-emerald-500 to-emerald-700'
          }`}
      >
        {isUser ? <User className="h-5 w-5 text-white" /> : <Bot className="h-5 w-5 text-white" />}
      </div>

      <div className="flex-1 min-w-0 max-w-4xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 dark:text-white">{isUser ? 'You' : 'Assistant'}</span>
            <span className="text-xs text-gray-400">{formatTime(new Date(message.timestamp))}</span>
          </div>
          {!isUser && !message.error && (
            <button
              onClick={handleCopyMessage}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-gray-500 dark:text-gray-400"
              title="Copy full response"
            >
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </button>
          )}
        </div>

        {message.images?.length > 0 && (
          <div className="flex gap-4 mb-4 flex-wrap">
            {message.images.map((image, index) => (
              <div key={index} className="relative group/image cursor-pointer" onClick={() => setArtifact({ type: 'image', content: image, title: 'Image Preview' })}>
                <img
                  src={image}
                  alt={`Uploaded ${index + 1}`}
                  className="max-h-64 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:opacity-95 transition-opacity"
                />
              </div>
            ))}
          </div>
        )}

        {message.error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg p-4 text-red-700 dark:text-red-400 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Error generation response</p>
              <p className="text-sm mt-1 opacity-90">{message.error}</p>
            </div>
          </div>
        ) : (
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={MarkdownComponents}
            >
              {processedContent + (message.isStreaming ? ' \u2588' : '')}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
});

export default MessageItem;