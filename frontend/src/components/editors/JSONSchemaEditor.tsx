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
      alert(error.response?.data?.detail || 'Error saving schema');
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
    if (!confirm('Delete schema?')) return;

    try {
      await api.delete(`/formats/schemas/${id}`);
      loadSavedSchemas();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Error deleting schema');
    }
  };

  return (
    <div className="p-8 space-y-10">
      {/* View Switcher */}
      <div className="flex items-center justify-between">
        <label className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] ${
          darkMode ? 'text-zinc-500' : 'text-zinc-400'
        }`}>
          <SquaresFour size={16} weight="bold" />
          JSON Schema Designer
        </label>
        
        <div className={`flex p-1 rounded-2xl border backdrop-blur-xl ${darkMode ? 'bg-zinc-900/50 border-zinc-800' : 'bg-zinc-100 border-zinc-200 shadow-sm'}`}>
          <button
            onClick={() => setViewMode('gui')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              viewMode === 'gui'
                ? (darkMode ? 'bg-white text-zinc-950 shadow-xl' : 'bg-zinc-900 text-white shadow-xl')
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <SquaresFour size={14} weight="bold" />
            Visual
          </button>
          <button
            onClick={() => setViewMode('code')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              viewMode === 'code'
                ? (darkMode ? 'bg-white text-zinc-950 shadow-xl' : 'bg-zinc-900 text-white shadow-xl')
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <FileCode size={14} weight="bold" />
            Code
          </button>
        </div>
      </div>

      {/* Editor Section */}
      <div className="space-y-6">
        {viewMode === 'gui' ? (
          <div className={`p-6 rounded-3xl border shadow-xl ${
            darkMode ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-zinc-100 shadow-zinc-200/50'
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
              className={`w-full px-6 py-5 font-mono text-[13px] rounded-3xl border transition-all outline-none min-h-[350px] leading-relaxed resize-none ${
                darkMode
                  ? 'bg-[#0d1117] border-zinc-800 focus:border-zinc-700 focus:bg-[#0d1117] text-zinc-300'
                  : 'bg-zinc-50 border-zinc-200 focus:border-zinc-300 focus:bg-white text-zinc-800'
              } ${!isValid ? 'border-red-500/50 focus:border-red-500' : ''}`}
              placeholder='{ "type": "object", ... }'
            />
            {!isValid && (
              <div className="absolute top-6 right-6 group relative">
                <Warning size={18} weight="fill" className="text-red-500 cursor-help" />
                <div className="absolute bottom-full mb-3 right-0 w-56 p-3 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 pointer-events-none z-10 leading-relaxed">
                  {error}
                </div>
              </div>
            )}
            <div className={`mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] self-start w-fit border shadow-sm ${
              isValid 
                ? darkMode ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-green-50 text-green-600 border-green-100'
                : darkMode ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-600 border-red-100'
            }`}>
              {isValid ? <><CheckCircle size={12} weight="fill" /> Schema Validated</> : <><Warning size={12} weight="fill" /> Syntax Error</>}
            </div>
          </div>
        )}
      </div>

      <div className={`pt-10 border-t ${darkMode ? 'border-zinc-900' : 'border-zinc-100'}`}>
        <div className="flex gap-4">
          <button
            onClick={resetEditor}
            className={`h-11 px-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 cursor-pointer ${
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
              placeholder="SCHEMA IDENTITY NAME..."
              className={`w-full h-11 px-5 text-[11px] font-black uppercase tracking-[0.1em] rounded-xl border transition-all outline-none ${
                darkMode
                  ? 'bg-zinc-950 border-zinc-800 focus:border-zinc-600 focus:bg-zinc-900/50 text-zinc-300'
                  : 'bg-zinc-50 border-zinc-200 focus:border-zinc-300 focus:bg-white text-zinc-700'
              }`}
            />
          </div>
          <button
            onClick={saveSchema}
            disabled={!saveName.trim() || !isValid}
            className={`h-11 px-6 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 transition-all active:scale-[0.98] disabled:opacity-30 disabled:grayscale ${
              !saveName.trim() || !isValid ? '' : 'cursor-pointer'
            } ${
              darkMode 
                ? 'bg-white text-zinc-950 hover:bg-zinc-200 shadow-xl' 
                : 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-xl shadow-zinc-900/10'
            }`}
          >
            <FloppyDisk size={18} weight="bold" />
            {activeSchemaId ? 'Update' : 'Save'}
          </button>
        </div>
      </div>

      {/* Library Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <label className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] ${
            darkMode ? 'text-zinc-600' : 'text-zinc-400'
          }`}>
            <FolderOpen size={16} weight="bold" />
            Artifact Library
          </label>
          <button
            onClick={seedExamples}
            className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              darkMode ? 'border-zinc-900 text-zinc-600 hover:text-zinc-300 hover:border-zinc-700' : 'border-zinc-200 text-zinc-400 hover:text-zinc-600 hover:border-zinc-300 shadow-sm shadow-zinc-200/10'
            }`}
          >
            Load Core Examples
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedSchemas.length > 0 ? (
            savedSchemas.map((s) => (
              <div
                key={s.id}
                onClick={() => loadSchema(s)}
                className={`group flex items-center justify-between p-5 rounded-2xl border transition-all cursor-pointer ${
                  darkMode
                    ? 'bg-zinc-950 border-zinc-900 hover:border-zinc-700 hover:bg-zinc-900/50'
                    : 'bg-white border-zinc-100 hover:border-zinc-200 hover:shadow-xl shadow-sm shadow-zinc-200/20'
                } ${activeSchemaId === s.id ? 'ring-2 ring-yellow-500/50' : ''}`}
              >
                <div className="flex-1 min-w-0 pr-6">
                  <div className={`text-[11px] font-black uppercase tracking-widest truncate ${darkMode ? 'text-zinc-200' : 'text-zinc-900'}`}>
                    {s.name}
                  </div>
                  <div className={`text-[9px] font-mono truncate mt-1.5 opacity-40 ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    {s.schema}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteSchema(s.id); }}
                    className={`p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all cursor-pointer ${
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
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">No schemas available in local core.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
