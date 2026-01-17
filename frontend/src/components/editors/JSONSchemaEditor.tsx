import { useState, useEffect } from 'react';
import { FloppyDisk, Trash, FolderOpen } from 'phosphor-react';
import { useChatStore } from '../../store/chatStore';
import type { JSONSchema } from '../../types';
import api from '../../lib/api';

export default function JSONSchemaEditor() {
  const { formatSpec, setFormatSpec } = useChatStore();
  const [schema, setSchema] = useState(formatSpec || '{\n  "type": "object",\n  "properties": {}\n}');
  const [savedSchemas, setSavedSchemas] = useState<JSONSchema[]>([]);
  const [saveName, setSaveName] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSavedSchemas();
  }, []);

  useEffect(() => {
    validateSchema(schema);
  }, [schema]);

  const validateSchema = (value: string) => {
    try {
      JSON.parse(value);
      setIsValid(true);
      setError('');
      setFormatSpec(value);
    } catch (e: any) {
      setIsValid(false);
      setError(e.message);
    }
  };

  const loadSavedSchemas = async () => {
    try {
      const response = await api.get('/formats/schemas');
      setSavedSchemas(response.data);
    } catch (error) {
      console.error('Error loading schemas:', error);
    }
  };

  const saveSchema = async () => {
    if (!saveName.trim() || !isValid) return;

    try {
      await api.post('/formats/schemas', {
        name: saveName,
        schema_content: schema,
      });
      setSaveName('');
      loadSavedSchemas();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Fehler beim Speichern');
    }
  };

  const loadSchema = (s: JSONSchema) => {
    setSchema(s.schema);
  };

  const deleteSchema = async (id: number) => {
    if (!confirm('Schema löschen?')) return;

    try {
      await api.delete(`/formats/schemas/${id}`);
      loadSavedSchemas();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Fehler beim Löschen');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">JSON Schema</label>
        <textarea
          value={schema}
          onChange={(e) => setSchema(e.target.value)}
          className={`input-field font-mono text-sm ${!isValid ? 'border-red-500' : ''}`}
          rows={15}
          placeholder='{"type": "object", "properties": {...}}'
        />
        {!isValid && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
        )}
        {isValid && (
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ Gültiges JSON Schema</p>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={saveName}
          onChange={(e) => setSaveName(e.target.value)}
          placeholder="Schema Name..."
          className="input-field text-sm flex-1"
        />
        <button
          onClick={saveSchema}
          disabled={!isValid || !saveName.trim()}
          className="btn-primary px-3"
          title="Speichern"
        >
          <FloppyDisk size={18} weight="bold" />
        </button>
      </div>

      {savedSchemas.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <FolderOpen size={16} weight="bold" />
            Gespeicherte Schemata
          </h4>
          <div className="space-y-1">
            {savedSchemas.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-2 p-2 hover:bg-light-border dark:hover:bg-dark-border rounded"
              >
                <button
                  onClick={() => loadSchema(s)}
                  className="flex-1 text-left text-sm truncate"
                >
                  {s.name}
                </button>
                <button
                  onClick={() => deleteSchema(s.id)}
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
