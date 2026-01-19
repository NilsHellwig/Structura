import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CaretRight, 
  CaretDown, 
  BookOpen, 
  ArrowLeft, 
  MagnifyingGlass,
  FileText,
  Folder,
  ChartBar,
  Code,
  ShieldCheck,
  Cpu,
  Layout,
  TreeStructure,
  Sparkle
} from 'phosphor-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUIStore } from '../store/uiStore';
import MarkdownRenderer from '../components/MarkdownRenderer';

// Mock structure for initialization
const DOCS_STRUCTURE = [
  {
    title: 'Getting Started',
    id: 'getting-started',
    icon: <Sparkle size={18} weight="bold" />,
    children: [
      { title: 'Introduction', id: 'intro' },
      { title: 'Installation', id: 'install' },
      { title: 'Core Concepts', id: 'concepts' },
    ]
  },
  {
    title: 'Backends',
    id: 'backends',
    icon: <Cpu size={18} weight="bold" />,
    children: [
      { title: 'Ollama Integration', id: 'ollama' },
      { title: 'vLLM Setup', id: 'vllm' },
      { title: 'OpenAI API', id: 'openai' },
    ]
  },
  {
    title: 'Output Formats',
    id: 'formats',
    icon: <Layout size={18} weight="bold" />,
    children: [
      { title: 'JSON Schemas', id: 'json' },
      { title: 'Regex Patterns', id: 'regex' },
      { title: 'Templates', id: 'templates' },
      { title: 'CSV & HTML', id: 'csv-html' },
    ]
  },
  {
    title: 'Advanced',
    id: 'advanced',
    icon: <TreeStructure size={18} weight="bold" />,
    children: [
      { title: 'Guided Generation', id: 'guided' },
      { title: 'Artifact Library', id: 'library' },
      { title: 'Security & Auth', id: 'security' },
    ]
  }
];

// Load all markdown files from the docs directory
const docsModules = import.meta.glob('../docs/**/*.md', { query: '?raw', eager: true }) as Record<string, { default: string }>;

// Helper to get content by ID
const getDocContent = (id: string) => {
  // Look for a file that ends with id.md
  const path = Object.keys(docsModules).find(p => p.endsWith(`/${id}.md`));
  return path ? docsModules[path].default : null;
};

export default function Docs() {
  const darkMode = useUIStore((state) => state.darkMode);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['getting-started']);

  // Current page ID from URL or default
  const currentPageId = location.pathname.split('/').pop() || 'intro';

  const toggleGroup = (id: string) => {
    setExpandedGroups(prev => 
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const filteredStructure = useMemo(() => {
    if (!searchQuery) return DOCS_STRUCTURE;
    return DOCS_STRUCTURE.map(group => ({
      ...group,
      children: group.children.filter(child => 
        child.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(group => group.children.length > 0);
  }, [searchQuery]);

  const content = getDocContent(currentPageId) || `# ${currentPageId.charAt(0).toUpperCase() + currentPageId.slice(1)}\n\nComing soon... This part of the documentation is currently being drafted.`;

  return (
    <div className={`flex h-screen overflow-hidden ${darkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-white text-zinc-900'}`}>
      
      {/* Sidebar */}
      <div className={`w-80 flex-shrink-0 border-r flex flex-col ${darkMode ? 'bg-zinc-900/30 border-zinc-800' : 'bg-zinc-50 border-zinc-100'}`}>
        
        {/* Sidebar Header */}
        <div className="p-8 border-b border-transparent">
          <button 
            onClick={() => navigate('/')}
            className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-8 cursor-pointer transition-colors ${
              darkMode ? 'text-zinc-500 hover:text-white' : 'text-zinc-400 hover:text-zinc-900'
            }`}
          >
            <ArrowLeft size={14} weight="bold" />
            Back to Chat
          </button>
          
          <div className="flex items-center gap-3 mb-8">
            <div className={`p-2 rounded-xl ${darkMode ? 'bg-yellow-500/10 text-yellow-500' : 'bg-yellow-500/10 text-yellow-600'}`}>
                <BookOpen size={24} weight="bold" />
            </div>
            <div>
                <h1 className="text-xl font-black tracking-tight leading-none">Docs</h1>
                <p className={`text-[9px] font-black uppercase tracking-widest mt-1 opacity-40 ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>Structura Core V1.0</p>
            </div>
          </div>

          <div className="relative group">
            <MagnifyingGlass 
              size={14} 
              className={`absolute left-4 top-1/2 -translate-y-1/2 ${darkMode ? 'text-zinc-600' : 'text-zinc-400'}`} 
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guide..."
              className={`w-full h-10 pl-10 pr-4 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none transition-all ${
                darkMode
                  ? 'bg-zinc-950 border border-zinc-800 focus:border-zinc-600 focus:bg-zinc-900/50 text-zinc-300'
                  : 'bg-white border border-zinc-200 focus:border-zinc-300 shadow-sm text-zinc-700'
              }`}
            />
          </div>
        </div>

        {/* Navigation Tree */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
          {filteredStructure.map(group => (
            <div key={group.id} className="space-y-1">
              <button
                onClick={() => toggleGroup(group.id)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                  darkMode ? 'hover:bg-white/5 text-zinc-500' : 'hover:bg-zinc-200/50 text-zinc-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  {group.icon}
                  {group.title}
                </div>
                {expandedGroups.includes(group.id) ? <CaretDown size={14} weight="bold" /> : <CaretRight size={14} weight="bold" />}
              </button>
              
              <AnimatePresence>
                {expandedGroups.includes(group.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden pl-4"
                  >
                    {group.children.map(child => (
                      <Link
                        key={child.id}
                        to={`/docs/${child.id}`}
                        className={`block px-7 py-2 text-xs font-bold transition-all relative ${
                          currentPageId === child.id
                            ? darkMode ? 'text-yellow-500' : 'text-yellow-600'
                            : darkMode ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-500 hover:text-zinc-900'
                        }`}
                      >
                        {currentPageId === child.id && (
                          <motion.div 
                            layoutId="active-doc-indicator"
                            className={`absolute left-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full ${
                              darkMode ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'bg-yellow-600'
                            }`}
                          />
                        )}
                        {child.title}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar flex justify-center">
        <div className="max-w-[800px] w-full px-12 py-20">
          <motion.div
            key={currentPageId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className={`text-[10px] font-black uppercase tracking-[0.3em] mb-12 flex items-center gap-4 ${
                darkMode ? 'text-zinc-600' : 'text-zinc-400'
            }`}>
                Documentation <CaretRight size={10} weight="bold" /> {currentPageId}
            </div>
            
            <MarkdownRenderer content={content} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
