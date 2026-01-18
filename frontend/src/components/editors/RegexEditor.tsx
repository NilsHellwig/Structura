import { useState, useEffect } from 'react';
import { FloppyDisk, Trash, FolderOpen, Info, CheckCircle, Warning, Plus } from 'phosphor-react';
import { useChatStore } from '../../store/chatStore';
import { useUIStore } from '../../store/uiStore';
import type { RegexPattern } from '../../types';
import api from '../../lib/api';

export default function RegexEditor() {
  const darkMode = useUIStore((state) => state.darkMode);
  const { formatSpec, setFormatSpec } = useChatStore();
  const [regex, setRegex] = useState(formatSpec || '[A-Za-z0-9]+');
  const [savedPatterns, setSavedPatterns] = useState<RegexPattern[]>([]);
  const [saveName, setSaveName] = useState('');
  const [activePatternId, setActivePatternId] = useState<number | null>(null);
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState('');
  const [testString, setTestString] = useState('');
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    loadSavedPatterns();
  }, []);

  useEffect(() => {
    validateRegex(regex);
  }, [regex]);

  useEffect(() => {
    if (isValid && testString) {
      try {
        const re = new RegExp(`^${regex}$`);
        setMatches(re.test(testString));
      } catch {
        setMatches(false);
      }
    } else {
      setMatches(false);
    }
  }, [regex, testString, isValid]);

  const validateRegex = (value: string) => {
    if (!value) {
      setIsValid(false);
      setError('Regex pattern cannot be empty');
      return;
    }
    try {
      new RegExp(value);
      
      if (value.includes('(?<') || value.includes('(?!') || value.includes('(?=')) {
        setIsValid(false);
        setError('Lookbehind and Lookahead are not permitted');
        return;
      }
      
      setIsValid(true);
      setError('');
      setFormatSpec(value);
    } catch (e: any) {
      setIsValid(false);
      setError(e.message);
    }
  };

  const loadSavedPatterns = async () => {
    try {
      const response = await api.get('/formats/regex');
      setSavedPatterns(response.data);
    } catch (error) {
      console.error('Error loading patterns:', error);
    }
  };

  const savePattern = async () => {
    if (!saveName.trim() || !isValid) return;

    try {
      const payload = {
        name: saveName,
        pattern: regex,
      };

      if (activePatternId) {
        await api.patch(`/formats/regex/${activePatternId}`, payload);
      } else {
        await api.post('/formats/regex', payload);
      }
      setSaveName('');
      setActivePatternId(null);
      loadSavedPatterns();
    } catch (error: any) {
      console.error('Error saving pattern:', error);
    }
  };

  const loadPattern = (p: RegexPattern) => {
    setRegex(p.pattern);
    setSaveName(p.name);
    setActivePatternId(p.id);
  };

  const resetEditor = () => {
    setRegex('[A-Za-z0-9]+');
    setSaveName('');
    setActivePatternId(null);
  };

  const deletePattern = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm('Delete pattern?')) return;

    try {
      await api.delete(`/formats/regex/${id}`);
      if (activePatternId === id) setActivePatternId(null);
      loadSavedPatterns();
    } catch (error: any) {
      console.error('Error deleting pattern:', error);
    }
  };

  return (
    <div className="p-8 space-y-10">
      <div className="space-y-6">
        <div>
          <label className={`block text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${
            darkMode ? 'text-zinc-500' : 'text-zinc-400'
          }`}>
            Regex Pattern Definition
          </label>
          <div className="relative group">
            <input
              type="text"
              value={regex}
              onChange={(e) => setRegex(e.target.value)}
              className={`w-full h-14 px-6 font-mono text-sm rounded-2xl border transition-all outline-none ${
                darkMode
                  ? `bg-[#0d1117] border-zinc-800 focus:border-zinc-700 focus:bg-[#0d1117] text-zinc-300`
                  : `bg-zinc-50 border-zinc-200 focus:border-zinc-300 focus:bg-white text-zinc-900`
              } ${!isValid ? 'border-red-500/50 focus:border-red-500' : ''}`}
              placeholder="[A-Za-z0-9]+"
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2">
              {isValid ? (
                <CheckCircle size={20} weight="fill" className="text-green-500 shadow-lg shadow-green-500/20" />
              ) : (
                <Warning size={20} weight="fill" className="text-red-500 shadow-lg shadow-red-500/20" />
              )}
            </div>
          </div>
          {error && (
            <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mt-3 ml-2">
              {error}
            </p>
          )}
        </div>

        <div>
          <label className={`block text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${
            darkMode ? 'text-zinc-500' : 'text-zinc-400'
          }`}>
            Logic Validation
          </label>
          <input
            type="text"
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            className={`w-full h-14 px-6 text-[11px] font-black uppercase tracking-widest rounded-2xl border transition-all outline-none ${
              darkMode
                ? `bg-zinc-950 border-zinc-800 focus:border-zinc-700 focus:bg-zinc-900/50 ${testString && isValid ? (matches ? 'border-green-800' : 'border-red-800') : ''}`
                : `bg-zinc-50 border-zinc-200 focus:border-zinc-300 focus:bg-white ${testString && isValid ? (matches ? 'border-green-200' : 'border-red-200') : ''}`
            }`}
            placeholder="TEST STRING CORE..."
          />
          {testString && isValid && (
            <div className={`flex items-center gap-2.5 mt-4 ml-2 animate-in fade-in slide-in-from-left-2 duration-300`}>
              <div className={`w-2 h-2 rounded-full ${matches ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`} />
              <span className={`text-[10px] font-black uppercase tracking-widest ${matches ? 'text-green-500' : 'text-red-500'}`}>
                {matches ? 'Validation Successful' : 'Core Mismatch'}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className={`p-6 rounded-3xl border flex gap-4 backdrop-blur-xl ${
        darkMode ? 'bg-zinc-900/40 border-zinc-800 text-zinc-400' : 'bg-zinc-50 border-zinc-200 text-zinc-500 shadow-sm shadow-zinc-200/50'
      }`}>
        <Info size={24} weight="fill" className="flex-shrink-0 opacity-40 text-blue-500" />
        <div className="space-y-1">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-500">Core Architecture Warning</p>
          <p className="text-[10px] font-bold leading-relaxed opacity-70">
            Lookbehind <code className="font-mono bg-black/20 px-1.5 py-0.5 rounded-lg text-white">(?&lt;...)</code> and Lookahead <code className="font-mono bg-black/20 px-1.5 py-0.5 rounded-lg text-white">(?=...)</code> are not supported by the vLLM structured engine.
          </p>
        </div>
      </div>

      {/* Persistence Controls */}
      <div className="space-y-6 pt-4">
        <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] ${darkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>
          Artifact Management
        </h3>
        <div className="flex gap-3">
          <button
            onClick={resetEditor}
            className={`h-11 px-5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 transition-all ${
              darkMode 
                ? 'bg-zinc-800 text-zinc-400 border border-zinc-800 hover:text-white hover:border-zinc-700 hover:bg-zinc-700' 
                : 'bg-zinc-100 text-zinc-500 border border-zinc-200 hover:text-zinc-900 hover:border-zinc-300 hover:bg-zinc-200'
            }`}
          >
            <Plus size={16} weight="bold" />
            New
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="REGEX IDENTITY NAME..."
              className={`w-full h-11 px-5 text-[11px] font-black uppercase tracking-[0.1em] rounded-xl border transition-all outline-none ${
                darkMode
                  ? 'bg-zinc-950 border-zinc-800 focus:border-zinc-600 focus:bg-zinc-900/50 text-zinc-300'
                  : 'bg-zinc-50 border-zinc-200 focus:border-zinc-300 focus:bg-white text-zinc-700'
              }`}
            />
          </div>
          <button
            onClick={savePattern}
            disabled={!saveName.trim() || !isValid}
            className={`h-11 px-6 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 transition-all active:scale-[0.98] disabled:opacity-30 disabled:grayscale ${
              darkMode 
                ? 'bg-white text-zinc-950 hover:bg-zinc-200 shadow-xl' 
                : 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-xl shadow-zinc-900/10'
            }`}
          >
            <FloppyDisk size={18} weight="bold" />
            {activePatternId ? 'Update' : 'Save'}
          </button>
        </div>
      </div>

      {/* Library Section */}
      <div className="space-y-6 border-t pt-10 border-white/5">
        <label className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] ${
          darkMode ? 'text-zinc-600' : 'text-zinc-400'
        }`}>
          <FolderOpen size={16} weight="bold" />
          Regex Artifact Library
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedPatterns.length > 0 ? (
            savedPatterns.map((p) => (
              <div
                key={p.id}
                onClick={() => loadPattern(p)}
                className={`group flex items-center justify-between p-5 rounded-2xl border transition-all cursor-pointer ${
                  darkMode
                    ? 'bg-zinc-950 border-zinc-900 hover:border-zinc-700 hover:bg-zinc-900/50'
                    : 'bg-white border-zinc-100 hover:border-zinc-200 hover:shadow-xl shadow-sm shadow-zinc-200/20'
                } ${activePatternId === p.id ? 'ring-2 ring-blue-500/50' : ''}`}
              >
                <div className="flex-1 min-w-0 pr-6">
                  <div className={`text-[11px] font-black uppercase tracking-widest truncate ${darkMode ? 'text-zinc-200' : 'text-zinc-900'}`}>
                    {p.name}
                  </div>
                  <div className={`text-[9px] font-mono truncate mt-1.5 opacity-40 ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    {p.pattern}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => deletePattern(e, p.id)}
                    className={`p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all ${
                      darkMode ? 'hover:bg-red-900/40 text-red-400' : 'hover:bg-red-50 text-red-600 shadow-sm border border-red-50'
                    }`}
                  >
                    <Trash size={16} weight="bold" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className={`col-span-full p-12 text-center rounded-3xl border-2 border-dashed ${
              darkMode ? 'border-zinc-900 text-zinc-700' : 'border-zinc-100 text-zinc-300'
            }`}>
              <Info size={32} weight="light" className="mx-auto mb-4 opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">No patterns available in local core.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
