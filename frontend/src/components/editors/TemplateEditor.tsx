import { useState, useEffect } from 'react';
import { FloppyDisk, Trash, FolderOpen, Info, TextT, Code, Plus } from 'phosphor-react';
import { useChatStore } from '../../store/chatStore';
import { useUIStore } from '../../store/uiStore';
import type { Template } from '../../types';
import api from '../../lib/api';

export default function TemplateEditor() {
  const darkMode = useUIStore((state) => state.darkMode);
  const { formatSpec, setFormatSpec } = useChatStore();
  const [template, setTemplate] = useState(formatSpec || 'Hello, my name is [GEN]');
  const [savedTemplates, setSavedTemplates] = useState<Template[]>([]);
  const [saveName, setSaveName] = useState('');
  const [activeTemplateId, setActiveTemplateId] = useState<number | null>(null);

  useEffect(() => {
    loadSavedTemplates();
  }, []);

  useEffect(() => {
    setFormatSpec(template);
  }, [template]);

  const loadSavedTemplates = async () => {
    try {
      const response = await api.get('/formats/templates');
      setSavedTemplates(response.data);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const saveTemplate = async () => {
    if (!saveName.trim()) return;

    try {
      const payload = {
        name: saveName,
        content: template,
      };

      if (activeTemplateId) {
        await api.patch(`/formats/templates/${activeTemplateId}`, payload);
      } else {
        await api.post('/formats/templates', payload);
      }
      setSaveName('');
      setActiveTemplateId(null);
      loadSavedTemplates();
    } catch (error: any) {
      console.error('Error saving template:', error);
    }
  };

  const loadTemplate = (t: Template) => {
    setTemplate(t.content);
    setSaveName(t.name);
    setActiveTemplateId(t.id);
  };

  const resetEditor = () => {
    setTemplate('Hello, my name is [GEN]');
    setSaveName('');
    setActiveTemplateId(null);
  };

  const deleteTemplate = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm('Delete template?')) return;

    try {
      await api.delete(`/formats/templates/${id}`);
      if (activeTemplateId === id) setActiveTemplateId(null);
      loadSavedTemplates();
    } catch (error: any) {
      console.error('Error deleting template:', error);
    }
  };

  const genCount = (template.match(/\[GEN\]/g) || []).length;

  return (
    <div className="p-8 space-y-10">
      {/* Input Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <label className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] ${
            darkMode ? 'text-zinc-500' : 'text-zinc-400'
          }`}>
            <TextT size={16} weight="bold" />
            Template Definition
          </label>
          <div className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
            genCount > 0 
              ? darkMode ? 'bg-zinc-900 border-zinc-800 text-blue-400' : 'bg-zinc-50 border-zinc-100 text-blue-600'
              : 'bg-red-500/10 text-red-500 border-red-500/20'
          }`}>
            {genCount} ACTIVE SLOTS
          </div>
        </div>
        
        <div className="relative group">
          <textarea
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            className={`w-full px-6 py-5 font-mono text-[13px] rounded-3xl border transition-all outline-none min-h-[180px] leading-relaxed resize-none ${
              darkMode
                ? 'bg-[#0d1117] border-zinc-800 focus:border-zinc-700 focus:bg-[#0d1117] text-zinc-300'
                : 'bg-zinc-50 border-zinc-200 focus:border-zinc-300 focus:bg-white text-zinc-700'
            }`}
            placeholder="Hello, my name is [GEN]..."
          />
        </div>
      </div>

      {/* Preview Section */}
      <div className="space-y-6">
        <label className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] ${
          darkMode ? 'text-zinc-500' : 'text-zinc-400'
        }`}>
          <Code size={16} weight="bold" />
          Artifact Rendering
        </label>
        
        <div className={`p-8 rounded-3xl border-2 border-dashed transition-all ${
          darkMode 
            ? 'bg-zinc-900/20 border-zinc-800 text-zinc-300 shadow-[inset_0_2px_20px_rgba(0,0,0,0.2)]' 
            : 'bg-zinc-50 border-zinc-200 text-zinc-600 shadow-[inset_0_2px_20px_rgba(0,0,0,0.03)]'
        }`}>
          <div className="text-[15px] leading-relaxed whitespace-pre-wrap font-bold">
            {template.split('[GEN]').map((part, i, arr) => (
              <span key={i}>
                {part}
                {i < arr.length - 1 && (
                  <span className={`inline-flex items-center px-3 py-1 mx-1 rounded-xl text-[9px] font-black tracking-widest shadow-lg transform -rotate-1 ${
                    darkMode ? 'bg-white text-zinc-950' : 'bg-zinc-900 text-white'
                  }`}>
                    SLOT_IDENTIFIER
                  </span>
                )}
              </span>
            ))}
          </div>
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
              placeholder="TEMPLATE IDENTITY NAME..."
              className={`w-full h-11 px-5 text-[11px] font-black uppercase tracking-[0.1em] rounded-xl border transition-all outline-none ${
                darkMode
                  ? 'bg-zinc-950 border-zinc-800 focus:border-zinc-600 focus:bg-zinc-900/50 text-zinc-300'
                  : 'bg-zinc-50 border-zinc-200 focus:border-zinc-300 focus:bg-white text-zinc-700'
              }`}
            />
          </div>
          <button
            onClick={saveTemplate}
            disabled={!saveName.trim()}
            className={`h-11 px-6 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 transition-all active:scale-[0.98] disabled:opacity-30 disabled:grayscale ${
              darkMode 
                ? 'bg-white text-zinc-950 hover:bg-zinc-200 shadow-xl' 
                : 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-xl shadow-zinc-900/10'
            }`}
          >
            <FloppyDisk size={18} weight="bold" />
            {activeTemplateId ? 'Update' : 'Commit'}
          </button>
        </div>
      </div>

      {/* Library Section */}
      <div className="space-y-6 border-t pt-10 border-white/5">
        <label className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] ${
          darkMode ? 'text-zinc-600' : 'text-zinc-400'
        }`}>
          <FolderOpen size={16} weight="bold" />
          Template Artifact Library
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedTemplates.length > 0 ? (
            savedTemplates.map((t) => (
              <div
                key={t.id}
                onClick={() => loadTemplate(t)}
                className={`group flex items-center justify-between p-5 rounded-2xl border transition-all cursor-pointer ${
                  darkMode
                    ? 'bg-zinc-950 border-zinc-900 hover:border-zinc-700 hover:bg-zinc-900/50'
                    : 'bg-white border-zinc-100 hover:border-zinc-200 hover:shadow-xl shadow-sm shadow-zinc-200/20'
                } ${activeTemplateId === t.id ? 'ring-2 ring-blue-500/50' : ''}`}
              >
                <div className="flex-1 min-w-0 pr-6">
                  <div className={`text-[11px] font-black uppercase tracking-widest truncate ${darkMode ? 'text-zinc-200' : 'text-zinc-900'}`}>
                    {t.name}
                  </div>
                  <div className={`text-[9px] font-mono truncate mt-1.5 opacity-40 ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    {t.content}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => deleteTemplate(e, t.id)}
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
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">No templates available in local core.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
