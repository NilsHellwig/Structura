import { useState, useEffect } from 'react';
import { FloppyDisk, Trash, FolderOpen, Info, TextT, Code, Plus } from 'phosphor-react';
import { useChatStore } from '../../store/chatStore';
import { useUIStore } from '../../store/uiStore';
import type { Template } from '../../types';
import api from '../../lib/api';

export default function TemplateEditor() {
  const darkMode = useUIStore((state) => state.darkMode);
  const { formatSpec, setFormatSpec } = useChatStore();
  const [template, setTemplate] = useState(formatSpec || 'Hallo, mein Name ist [GEN]');
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
      if (activeTemplateId) {
        await api.patch(`/formats/templates/${activeTemplateId}`, {
          name: saveName,
          content: template,
        });
      } else {
        await api.post('/formats/templates', {
          name: saveName,
          content: template,
        });
      }
      loadSavedTemplates();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Fehler beim Speichern');
    }
  };

  const loadTemplate = (t: Template) => {
    setTemplate(t.content);
    setSaveName(t.name);
    setActiveTemplateId(t.id);
  };

  const resetEditor = () => {
    setTemplate('Hallo, mein Name ist [GEN]');
    setSaveName('');
    setActiveTemplateId(null);
  };

  const deleteTemplate = async (id: number) => {
    if (!confirm('Template löschen?')) return;

    try {
      await api.delete(`/formats/templates/${id}`);
      loadSavedTemplates();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Fehler beim Löschen');
    }
  };

  const genCount = (template.match(/\[GEN\]/g) || []).length;

  return (
    <div className="p-6 space-y-8">
      {/* Input Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${
            darkMode ? 'text-zinc-500' : 'text-zinc-400'
          }`}>
            <TextT size={14} weight="bold" />
            Template Definition
          </label>
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tight ${
            genCount > 0 
              ? darkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-500'
              : 'bg-red-500/10 text-red-500'
          }`}>
            {genCount} Slots
          </div>
        </div>
        
        <div className="relative group">
          <textarea
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            className={`w-full px-5 py-4 font-mono text-[13px] rounded-2xl border transition-all outline-none min-h-[160px] leading-relaxed resize-none ${
              darkMode
                ? 'bg-zinc-950 border-zinc-800 focus:border-zinc-600 focus:bg-zinc-900/50'
                : 'bg-zinc-50 border-zinc-200 focus:border-zinc-400 focus:bg-white focus:shadow-sm'
            }`}
            placeholder="Hallo, mein Name ist [GEN]..."
          />
          <div className={`absolute bottom-3 right-4 flex items-center gap-2 pointer-events-none transition-opacity duration-300 ${
            template.includes('[GEN]') ? 'opacity-40' : 'opacity-100'
          }`}>
            <Info size={14} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">
              Use [GEN] as placeholder
            </span>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="space-y-4">
        <label className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${
          darkMode ? 'text-zinc-500' : 'text-zinc-400'
        }`}>
          <Code size={14} weight="bold" />
          Live Preview
        </label>
        
        <div className={`p-6 rounded-2xl border-2 border-dashed transition-all ${
          darkMode 
            ? 'bg-zinc-900/20 border-zinc-800 text-zinc-300' 
            : 'bg-zinc-50/50 border-zinc-200 text-zinc-600'
        }`}>
          <div className="text-[15px] leading-relaxed whitespace-pre-wrap font-medium">
            {template.split('[GEN]').map((part, i, arr) => (
              <span key={i}>
                {part}
                {i < arr.length - 1 && (
                  <span className={`inline-flex items-center px-2 py-0.5 mx-0.5 rounded-md text-[10px] font-black tracking-tighter shadow-sm transform -rotate-1 ${
                    darkMode ? 'bg-zinc-100 text-zinc-950' : 'bg-zinc-900 text-white'
                  }`}>
                    SLOT
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Save Section */}
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
              placeholder="Name for this template..."
              className={`w-full h-11 px-4 text-sm rounded-xl border transition-all outline-none ${
                darkMode
                  ? 'bg-zinc-950 border-zinc-800 focus:border-zinc-600'
                  : 'bg-zinc-50 border-zinc-200 focus:border-zinc-400'
              }`}
            />
          </div>
          <button
            onClick={saveTemplate}
            disabled={!saveName.trim() || genCount === 0}
            className={`h-11 px-6 rounded-xl font-bold text-sm flex items-center gap-2 transition-all disabled:opacity-30 disabled:grayscale ${
              darkMode 
                ? 'bg-zinc-100 text-zinc-900 hover:bg-white' 
                : 'bg-zinc-900 text-white hover:bg-zinc-800'
            }`}
          >
            <FloppyDisk size={18} weight="bold" />
            {activeTemplateId ? 'Update Preset' : 'Save Preset'}
          </button>
        </div>
      </div>

      {/* Library Section */}
      {savedTemplates.length > 0 && (
        <div className="space-y-4">
          <label className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${
            darkMode ? 'text-zinc-600' : 'text-zinc-400'
          }`}>
            <FolderOpen size={14} weight="bold" />
            Template Library
          </label>
          <div className="grid grid-cols-1 gap-2">
            {savedTemplates.map((t) => (
              <div
                key={t.id}
                className={`group flex items-center justify-between p-4 rounded-xl border transition-all ${
                  darkMode
                    ? 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                    : 'bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-sm'
                }`}
              >
                <button
                  onClick={() => loadTemplate(t)}
                  className={`flex-1 text-left px-1 py-1 rounded-lg transition-colors ${
                    darkMode ? 'hover:bg-zinc-900' : 'hover:bg-zinc-50'
                  }`}
                >
                  <div className={`text-sm font-bold ${darkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>
                    {t.name}
                  </div>
                  <div className={`text-[11px] truncate mt-0.5 max-w-[200px] ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    {t.content}
                  </div>
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => loadTemplate(t)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                      darkMode
                        ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                    }`}
                  >
                    Load
                  </button>
                  <button
                    onClick={() => deleteTemplate(t.id)}
                    className={`p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${
                      darkMode ? 'hover:bg-red-900/40 text-red-400' : 'hover:bg-red-50 text-red-600'
                    }`}
                  >
                    <Trash size={16} weight="bold" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
