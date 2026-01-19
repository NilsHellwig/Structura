import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { useUIStore } from '../store/uiStore';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const darkMode = useUIStore((state) => state.darkMode);

  return (
    <div className={`markdown-content text-sm leading-relaxed ${
      darkMode ? 'text-gray-100' : 'text-gray-900'
    }`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Headings
          h1: ({ children }) => (
            <h1 className={`text-2xl font-bold mt-6 mb-3 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className={`text-xl font-bold mt-5 mb-2.5 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className={`text-lg font-semibold mt-4 mb-2 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {children}
            </h3>
          ),
          // Paragraphs
          p: ({ children }) => (
            <p className="mb-4 last:mb-0">{children}</p>
          ),
          // Lists
          ul: ({ children }) => (
            <ul className={`list-disc list-inside mb-4 space-y-1 ${
              darkMode ? 'text-gray-200' : 'text-gray-800'
            }`}>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className={`list-decimal list-inside mb-4 space-y-1 ${
              darkMode ? 'text-gray-200' : 'text-gray-800'
            }`}>
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="ml-4">{children}</li>
          ),
          // Code blocks
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            return isInline ? (
              <code
                className={`px-1.5 py-0.5 rounded font-mono text-xs ${
                  darkMode
                    ? 'bg-[#0d1117] text-pink-400'
                    : 'bg-[#0d1117] text-pink-600'
                }`}
                {...props}
              >
                {children}
              </code>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => {
            const [copied, setCopied] = useState(false);
            const codeContent = (children as any)?.props?.children?.[0] || '';
            
            const handleCopy = () => {
              navigator.clipboard.writeText(codeContent);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            };
            
            return (
              <div className="relative group mb-4">
                <button
                  onClick={handleCopy}
                  className={`absolute top-3 right-3 px-2.5 py-1.5 text-xs font-medium rounded-md transition-all opacity-0 group-hover:opacity-100 ${
                    darkMode
                      ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                      : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-700'
                  }`}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <pre className={`p-4 rounded-xl overflow-x-auto ${
                  darkMode ? 'bg-[#0d1117]' : 'bg-[#0d1117] text-gray-100'
                }`}>
                  {children}
                </pre>
              </div>
            );
          },
          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className={`border-l-4 pl-4 py-2 mb-4 italic ${
              darkMode
                ? 'border-gray-700 bg-gray-800/30 text-gray-300'
                : 'border-gray-300 bg-gray-50 text-gray-700'
            }`}>
              {children}
            </blockquote>
          ),
          // Links
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={`underline underline-offset-2 hover:no-underline transition-colors ${
                darkMode
                  ? 'text-yellow-500 hover:text-yellow-400'
                  : 'text-yellow-600 hover:text-yellow-500'
              }`}
            >
              {children}
            </a>
          ),
          // Tables
          table: ({ children }) => (
            <div className="mb-4 overflow-x-auto">
              <table className={`min-w-full border ${
                darkMode ? 'border-gray-700' : 'border-gray-300'
              }`}>
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className={darkMode ? 'bg-gray-800' : 'bg-gray-100'}>
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className={`px-4 py-2 text-left font-semibold border ${
              darkMode ? 'border-gray-700' : 'border-gray-300'
            }`}>
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className={`px-4 py-2 border ${
              darkMode ? 'border-gray-700' : 'border-gray-300'
            }`}>
              {children}
            </td>
          ),
          // Horizontal rule
          hr: () => (
            <hr className={`my-6 border-t ${
              darkMode ? 'border-gray-800' : 'border-gray-200'
            }`} />
          ),
          // Strong/Bold
          strong: ({ children }) => (
            <strong className="font-semibold">{children}</strong>
          ),
          // Emphasis/Italic
          em: ({ children }) => (
            <em className="italic">{children}</em>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
