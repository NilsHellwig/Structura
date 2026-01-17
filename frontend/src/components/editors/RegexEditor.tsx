import { useState, useEffect } from 'react';
import { FloppyDisk, Trash, FolderOpen } from 'phosphor-react';
import { useChatStore } from '../../store/chatStore';
import type { RegexPattern } from '../../types';
import api from '../../lib/api';

export default function RegexEditor() {
  const { formatSpec, setFormatSpec } = useChatStore();
  const [regex, setRegex] = useState(formatSpec || '[A-Za-z0-9]+');
  const [savedPatterns, setSavedPatterns] = useState<RegexPattern[]>([]);
  const [saveName, setSaveName] = useState('');
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
    }
  }, [regex, testString, isValid]);

  const validateRegex = (value: string) => {
    try {
      new RegExp(value);
      
      // Check for lookbehind/lookahead
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
      await api.post('/formats/regex', {
        name: saveName,
        pattern: regex,
      });
      setSaveName('');
      loadSavedPatterns();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Fehler beim Speichern');
    }
  };

  const loadPattern = (p: RegexPattern) => {
    setRegex(p.pattern);
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
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Regulärer Ausdruck</label>
        <input
          type="text"
          value={regex}
          onChange={(e) => setRegex(e.target.value)}
          className={`input-field font-mono text-sm ${!isValid ? 'border-red-500' : ''}`}
          placeholder="[A-Za-z0-9]+"
        />
        {!isValid && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
        )}
        {isValid && (
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ Gültiger Regex</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Test String</label>
        <input
          type="text"
          value={testString}
          onChange={(e) => setTestString(e.target.value)}
          className={`input-field text-sm ${
            testString && isValid
              ? matches
                ? 'border-green-500'
                : 'border-red-500'
              : ''
          }`}
          placeholder="Test..."
        />
        {testString && isValid && (
          <p className={`text-xs mt-1 ${matches ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {matches ? '✓ Passt zum Pattern' : '✗ Passt nicht zum Pattern'}
          </p>
        )}
      </div>

      <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg text-sm text-yellow-800 dark:text-yellow-400">
        <p className="font-medium">⚠️ Hinweis:</p>
        <p>Lookbehind (?&lt;...) und Lookahead (?=..., ?!...) sind nicht erlaubt</p>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={saveName}
          onChange={(e) => setSaveName(e.target.value)}
          placeholder="Pattern Name..."
          className="input-field text-sm flex-1"
        />
        <button
          onClick={savePattern}
          disabled={!isValid || !saveName.trim()}
          className="btn-primary px-3"
          title="Speichern"
        >
          <FloppyDisk size={18} weight="bold" />
        </button>
      </div>

      {savedPatterns.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <FolderOpen size={16} weight="bold" />
            Gespeicherte Patterns
          </h4>
          <div className="space-y-1">
            {savedPatterns.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2 p-2 hover:bg-light-border dark:hover:bg-dark-border rounded"
              >
                <button
                  onClick={() => loadPattern(p)}
                  className="flex-1 text-left text-sm truncate font-mono"
                >
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-light-muted dark:text-dark-muted">{p.pattern}</div>
                </button>
                <button
                  onClick={() => deletePattern(p.id)}
                  className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                >
                  <Trash size={14} weight="bold" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
