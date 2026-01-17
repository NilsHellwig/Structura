import { useState, useEffect } from 'react';
import { FloppyDisk, Trash, FolderOpen, Code, Warning, CheckCircle, Info, SquaresFour, FileCode, Plus } from 'phosphor-react';
import { useChatStore } from '../../store/chatStore';
import { useUIStore } from '../../store/uiStore';
import type { JSONSchema } from '../../types';
import api from '../../lib/api';
import SchemaNode from './json-gui/SchemaNode';

const EXAMPLES = [
  {
    name: "Sentiment Analysis",
    schema: JSON.stringify({
      type: "object",
      properties: {
        sentiment: { type: "string", enum: ["positive", "negative", "neutral"] },
        confidence: { type: "number" },
        reasoning: { type: "string" }
      },
      required: ["sentiment", "confidence"]
    }, null, 2)
  },
  {
    name: "Entity Extraction",
    schema: JSON.stringify({
      type: "object",
      properties: {
        entities: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              type: { type: "string", enum: ["person", "location", "organization", "other"] }
            }
          }
        }
      }
    }, null, 2)
  },
  {
    name: "Simple To-Do",
    schema: JSON.stringify({
      type: "object",
      properties: {
        tasks: {
          type: "array",
          items: { type: "string" }
        },
        priority: { type: "string", enum: ["low", "medium", "high"] }
      }
    }, null, 2)
  }
];

export default function JSONSchemaEditor() {
  const darkMode = useUIStore((state) => state.darkMode);
  const { formatSpec, setFormatSpec } = useChatStore();
  const [schemaJson, setSchemaJson] = useState(formatSpec || '{}');
  const [schemaObj, setSchemaObj] = useState<any>({ type: 'object', properties: {} });
  const [savedSchemas, setSavedSchemas] = useState<JSONSchema[]>([]);
  const [saveName, setSaveName] = useState('');
  const [activeSchemaId, setActiveSchemaId] = useState<number | null>(null);
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'gui' | 'code'>('gui');

  useEffect(() => {
    loadSavedSchemas();
    try {
      const parsed = JSON.parse(formatSpec || '{}');
      if (Object.keys(parsed).length === 0 || !parsed.type) {
        const defaultObj = { type: 'object', properties: {} };
        setSchemaObj(defaultObj);
        setSchemaJson(JSON.stringify(defaultObj, null, 2));
        setFormatSpec(JSON.stringify(defaultObj, null, 2));
      } else {
        setSchemaObj(parsed);
        setSchemaJson(JSON.stringify(parsed, null, 2));
      }
    } catch (e) {
      const defaultObj = { type: 'object', properties: {} };
      setSchemaObj(defaultObj);
      setSchemaJson(JSON.stringify(defaultObj, null, 2));
      setFormatSpec(JSON.stringify(defaultObj, null, 2));
    }
  }, []);

  useEffect(() => {
    if (viewMode === 'gui') {
      const json = JSON.stringify(schemaObj, null, 2);
      setSchemaJson(json);
      setFormatSpec(json);
      setIsValid(true);
      setError('');
    }
  }, [schemaObj, viewMode]);

  useEffect(() => {
    if (viewMode === 'code') {
      validateSchema(schemaJson);
    }
  }, [schemaJson, viewMode]);

  const validateSchema = (value: string) => {
    try {
      if (value.trim()) {
        const parsed = JSON.parse(value);
        setIsValid(true);
        setError('');
        setFormatSpec(value);
        setSchemaObj(parsed);
      }
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

  const seedExamples = async () => {
    for (const example of EXAMPLES) {
      try {
        await api.post('/formats/schemas', example);
      } catch (e) {
        console.error("Failed to seed example", e);
      }
    }
    loadSavedSchemas();
  };

  const saveSchema = async () => {
    if (!saveName.trim() || !isValid) return;

    try {
      if (activeSchemaId) {
        await api.patch(`/formats/schemas/${activeSchemaId}`, {
          name: saveName,
          schema: schemaJson,
        });
      } else {
        await api.post('/formats/schemas', {
          name: saveName,
          schema: schemaJson,
        });
      }
      loadSavedSchemas();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Fehler beim Speichern');
    }
  };

  const loadSchema = (s: JSONSchema) => {
    setSchemaJson(s.schema);
    setSaveName(s.name);
    setActiveSchemaId(s.id);
    try {
      const parsed = JSON.parse(s.schema);
      setSchemaObj(parsed);
      setFormatSpec(s.schema);
    } catch (e) {
      console.error("Invalid schema in DB", e);
    }
  };

  const resetEditor = () => {
    const defaultObj = { type: 'object', properties: {} };
    setSchemaObj(defaultObj);
    setSchemaJson(JSON.stringify(defaultObj, null, 2));
    setFormatSpec(JSON.stringify(defaultObj, null, 2));
    setSaveName('');
    setActiveSchemaId(null);
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
    <div className="p-6 space-y-8">
      {/* View Switcher */}
      <div className="flex items-center justify-between border-b pb-4 dark:border-zinc-800">
        <label className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${
          darkMode ? 'text-zinc-500' : 'text-zinc-400'
        }`}>
          <SquaresFour size={14} weight="bold" />
          JSON Schema Designer
        </label>
        
        <div className={`flex p-1 rounded-lg ${darkMode ? 'bg-zinc-900' : 'bg-zinc-100'}`}>
          <button
            onClick={() => setViewMode('gui')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
              viewMode === 'gui'
                ? (darkMode ? 'bg-zinc-800 text-zinc-100' : 'bg-white text-zinc-900 shadow-sm')
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <SquaresFour size={14} />
            Visual
          </button>
          <button
            onClick={() => setViewMode('code')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
              viewMode === 'code'
                ? (darkMode ? 'bg-zinc-800 text-zinc-100' : 'bg-white text-zinc-900 shadow-sm')
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <FileCode size={14} />
            Code
          </button>
        </div>
      </div>

      {/* Editor Section */}
      <div className="space-y-4">
        {viewMode === 'gui' ? (
          <div className={`p-4 rounded-xl border ${
            darkMode ? 'bg-zinc-900/30 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
          }`}>
            <SchemaNode
              name="root"
              schema={schemaObj}
              onChange={setSchemaObj}
              isRoot={true}
            />
          </div>
        ) : (
          <div className="relative group">
            <textarea
              value={schemaJson}
              onChange={(e) => setSchemaJson(e.target.value)}
              className={`w-full px-5 py-4 font-mono text-[13px] rounded-2xl border transition-all outline-none min-h-[300px] leading-relaxed resize-none ${
                darkMode
                  ? 'bg-zinc-950 border-zinc-800 focus:border-zinc-600 focus:bg-zinc-900/50 text-zinc-300'
                  : 'bg-zinc-50 border-zinc-200 focus:border-zinc-400 focus:bg-white focus:shadow-sm text-zinc-700'
              } ${!isValid ? 'border-red-500/50 focus:border-red-500' : ''}`}
              placeholder='{ "type": "object", ... }'
            />
            {!isValid && (
              <div className="absolute top-4 right-4 group relative">
                <Warning size={16} weight="fill" className="text-red-500 cursor-help" />
                <div className="absolute bottom-full mb-2 right-0 w-48 p-2 bg-red-500 text-white text-[10px] rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {error}
                </div>
              </div>
            )}
            <div className={`mt-2 flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tight self-start w-fit ${
              isValid 
                ? darkMode ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-600'
                : darkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600'
            }`}>
              {isValid ? <><CheckCircle size={12} weight="fill" /> Valid Schema</> : 'Invalid JSON'}
            </div>
          </div>
        )}
      </div>

      <div className={`pt-8 border-t ${darkMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
        <div className="flex gap-3">
          <button
            onClick={resetEditor}
            className={`h-11 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${
              darkMode 
                ? 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700' 
                : 'bg-zinc-100 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200'
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
              placeholder="Name for this schema..."
              className={`w-full h-11 px-4 text-sm rounded-xl border transition-all outline-none ${
                darkMode
                  ? 'bg-zinc-950 border-zinc-800 focus:border-zinc-600 focus:bg-zinc-900/50 text-zinc-300'
                  : 'bg-zinc-50 border-zinc-200 focus:border-zinc-400 focus:bg-white text-zinc-700'
              }`}
            />
          </div>
          <button
            onClick={saveSchema}
            disabled={!saveName.trim() || !isValid}
            className={`h-11 px-6 rounded-xl font-bold text-sm flex items-center gap-2 transition-all disabled:opacity-30 disabled:grayscale ${
              darkMode 
                ? 'bg-zinc-100 text-zinc-900 hover:bg-white' 
                : 'bg-zinc-900 text-white hover:bg-zinc-800'
            }`}
          >
            <FloppyDisk size={18} weight="bold" />
            {activeSchemaId ? 'Update Schema' : 'Save Schema'}
          </button>
        </div>
      </div>

      {/* Library Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${
            darkMode ? 'text-zinc-600' : 'text-zinc-400'
          }`}>
            <FolderOpen size={14} weight="bold" />
            Schema Library
          </label>
          <button
            onClick={seedExamples}
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border transition-all ${
              darkMode ? 'border-zinc-800 text-zinc-500 hover:text-zinc-300' : 'border-zinc-200 text-zinc-400 hover:text-zinc-600'
            }`}
          >
            Add Examples
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {savedSchemas.length > 0 ? (
            savedSchemas.map((s) => (
              <div
                key={s.id}
                className={`group flex items-center justify-between p-4 rounded-xl border transition-all ${
                  darkMode
                    ? 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                    : 'bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-sm'
                }`}
              >
                <div className="flex-1 min-w-0 pr-4">
                  <div className={`text-sm font-bold truncate ${darkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>
                    {s.name}
                  </div>
                  <div className={`text-[11px] truncate mt-1 font-mono max-w-[200px] ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    {s.schema}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => loadSchema(s)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                      darkMode
                        ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                    }`}
                  >
                    Load
                  </button>
                  <button
                    onClick={() => deleteSchema(s.id)}
                    className={`p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${
                      darkMode ? 'hover:bg-red-900/40 text-red-400' : 'hover:bg-red-50 text-red-600'
                    }`}
                  >
                    <Trash size={16} weight="bold" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className={`col-span-full p-8 text-center rounded-2xl border-2 border-dashed ${
              darkMode ? 'border-zinc-800 text-zinc-600' : 'border-zinc-100 text-zinc-400'
            }`}>
              <Info size={24} className="mx-auto mb-2 opacity-20" />
              <p className="text-sm font-medium">No schemas saved yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
