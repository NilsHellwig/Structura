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
      setError('Regex darf nicht leer sein');
      return;
    }
    try {
      new RegExp(value);
      
      if (value.includes('(?<') || value.includes('(?!') || value.includes('(?=')) {
        setIsValid(false);
        setError('Lookbehind und Lookahead sind nicht erlaubt');
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
      if (activePatternId) {
        await api.patch(`/formats/regex/${activePatternId}`, {
          name: saveName,
          pattern: regex,
        });
      } else {
        await api.post('/formats/regex', {
          name: saveName,
          pattern: regex,
        });
      }
      setSaveName('');
      setActivePatternId(null);
      loadSavedPatterns();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Fehler beim Speichern');
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

  const deletePattern = async (id: number) => {
    if (!confirm('Pattern löschen?')) return;

    try {
      await api.delete(`/formats/regex/${id}`);
      loadSavedPatterns();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Fehler beim Löschen');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <div>
          <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
            darkMode ? 'text-zinc-500' : 'text-zinc-400'
          }`}>
            Regex Pattern
          </label>
          <div className="relative">
            <input
              type="text"
              value={regex}
              onChange={(e) => setRegex(e.target.value)}
              className={`w-full px-4 py-3 font-mono text-sm rounded-xl border transition-all outline-none ${
                darkMode
                  ? `bg-zinc-950 border-zinc-800 focus:border-zinc-600 ${!isValid ? 'border-red-900 focus:border-red-800' : ''}`
                  : `bg-zinc-50 border-zinc-200 focus:border-zinc-400 ${!isValid ? 'border-red-300 focus:border-red-400' : ''}`
              }`}
              placeholder="[A-Za-z0-9]+"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isValid ? (
                <CheckCircle size={18} weight="fill" className="text-green-500" />
              ) : (
                <Warning size={18} weight="fill" className="text-red-500" />
              )}
            </div>
          </div>
          {error && (
            <p className="text-[11px] font-bold text-red-500 mt-1.5 ml-1 uppercase tracking-tight">
              {error}
            </p>
          )}
        </div>

        <div>
          <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
            darkMode ? 'text-zinc-500' : 'text-zinc-400'
          }`}>
            Test String
          </label>
          <input
            type="text"
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            className={`w-full px-4 py-3 text-sm rounded-xl border transition-all outline-none ${
              darkMode
                ? `bg-zinc-950 border-zinc-800 focus:border-zinc-600 ${testString && isValid ? (matches ? 'border-green-900' : 'border-red-900') : ''}`
                : `bg-zinc-50 border-zinc-200 focus:border-zinc-400 ${testString && isValid ? (matches ? 'border-green-200' : 'border-red-200') : ''}`
            }`}
            placeholder="Kompilierten Regex testen..."
          />
          {testString && isValid && (
            <div className={`flex items-center gap-1.5 mt-2 ml-1 ${
              matches ? 'text-green-500' : 'text-red-500'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${matches ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-[11px] font-bold uppercase tracking-tight">
                {matches ? 'Matcht successfully' : 'Kein Match'}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className={`p-4 rounded-xl border flex gap-3 ${
        darkMode ? 'bg-zinc-900/50 border-zinc-800 text-zinc-400' : 'bg-zinc-50 border-zinc-200 text-zinc-500'
      }`}>
        <Info size={20} className="flex-shrink-0 opacity-50" />
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-100 italic">Hinweis</p>
          <p className="text-xs leading-relaxed">
            Lookbehind <code className="font-mono text-[10px] bg-black/20 px-1 rounded">(?&lt;...)</code> und Lookahead <code className="font-mono text-[10px] bg-black/20 px-1 rounded">(?=...)</code> werden von vLLM nicht unterstützt.
          </p>
        </div>
      </div>

      <div className="space-y-3 pt-2 border-t dark:border-zinc-800">
        <label className={`block text-xs font-bold uppercase tracking-wider ${
          darkMode ? 'text-zinc-500' : 'text-zinc-400'
        }`}>
          Pattern speichern
        </label>
        <div className="flex gap-2">
          <button
            onClick={resetEditor}
            className={`px-3 rounded-xl font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              darkMode 
                ? 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700' 
                : 'bg-zinc-100 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            <Plus size={14} weight="bold" />
            Neu
          </button>
          <input
            type="text"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            placeholder="Name vergeben..."
            className={`flex-1 px-4 py-3 text-sm rounded-xl border transition-all outline-none ${
              darkMode
                ? 'bg-zinc-950 border-zinc-800 focus:border-zinc-600'
                : 'bg-zinc-50 border-zinc-200 focus:border-zinc-400'
            }`}
          />
          <button
            onClick={savePattern}
            disabled={!isValid || !saveName.trim()}
            className={`px-5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98] disabled:opacity-30 disabled:grayscale ${
              darkMode 
                ? 'bg-zinc-100 text-zinc-900 hover:bg-white' 
                : 'bg-zinc-900 text-white hover:bg-zinc-800'
            }`}
          >
            <FloppyDisk size={18} weight="bold" />
            {activePatternId ? 'Update' : 'Save'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <label className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${
          darkMode ? 'text-zinc-600' : 'text-zinc-400'
        }`}>
          <FolderOpen size={14} weight="bold" />
          Pattern Library
        </label>
        
        <div className="grid grid-cols-1 gap-2">
          {savedPatterns.map((p) => (
            <div
              key={p.id}
              className={`group flex items-center justify-between p-4 rounded-xl border transition-all ${
                darkMode
                  ? 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                  : 'bg-white border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <div className="flex-1 min-w-0 pr-4">
                <div className={`text-sm font-bold truncate ${darkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>
                  {p.name}
                </div>
                <div className={`text-[11px] truncate mt-1 font-mono ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  {p.pattern}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => loadPattern(p)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                    darkMode
                      ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  Load
                </button>
                <button
                  onClick={() => deletePattern(p.id)}
                  className={`p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${
                    darkMode ? 'hover:bg-red-900/40 text-red-400' : 'hover:bg-red-50 text-red-600'
                  }`}
                >
                  <Trash size={16} weight="bold" />
                </button>
              </div>
            </div>
          ))}
          {savedPatterns.length === 0 && (
            <div className={`text-center p-8 rounded-2xl border-2 border-dashed ${
              darkMode ? 'border-zinc-800 text-zinc-600' : 'border-zinc-100 text-zinc-400'
            }`}>
              <p className="text-sm">Keine Patterns gespeichert.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
