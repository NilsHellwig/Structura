import { useState, useEffect } from 'react';
import { Plus, Trash, Table, Info, FloppyDisk, FolderOpen } from 'phosphor-react';
import { useChatStore } from '../../store/chatStore';
import { useUIStore } from '../../store/uiStore';
import type { CSVPreset } from '../../types';
import api from '../../lib/api';

export default function CSVEditor() {
  const darkMode = useUIStore((state) => state.darkMode);
  const { formatSpec, setFormatSpec } = useChatStore();
  
  const [columns, setColumns] = useState<string[]>(() => {
    if (!formatSpec) return [];
    return formatSpec.split(',').filter(c => c.trim() !== '');
  });

  const [savedPresets, setSavedPresets] = useState<CSVPreset[]>([]);
  const [saveName, setSaveName] = useState('');
  const [activePresetId, setActivePresetId] = useState<number | null>(null);

  useEffect(() => {
    loadSavedPresets();
    // Special case: if formatSpec has content but columns don't, it might be the initial mount
    if (formatSpec && columns.length === 0) {
      setColumns(formatSpec.split(',').filter(c => c.trim() !== ''));
    }
  }, []);

  useEffect(() => {
    const newSpec = columns.join(',');
    setFormatSpec(newSpec);
  }, [columns]);

  const loadSavedPresets = async () => {
    try {
      const response = await api.get('/formats/csv');
      setSavedPresets(response.data);
    } catch (error) {
      console.error('Failed to load CSV presets:', error);
    }
  };

  const savePreset = async () => {
    if (!saveName.trim()) return;
    try {
      const payload = {
        name: saveName,
        columns: columns.join(',')
      };

      if (activePresetId) {
        await api.patch(`/formats/csv/${activePresetId}`, payload);
      } else {
        await api.post('/formats/csv', payload);
      }
      
      setSaveName('');
      setActivePresetId(null);
      loadSavedPresets();
    } catch (error) {
      console.error('Failed to save CSV preset:', error);
    }
  };

  const deletePreset = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm('Delete preset?')) return;
    try {
      await api.delete(`/formats/csv/${id}`);
      if (activePresetId === id) setActivePresetId(null);
      loadSavedPresets();
    } catch (error) {
      console.error('Failed to delete CSV preset:', error);
    }
  };

  const applyPreset = (preset: CSVPreset) => {
    setActivePresetId(preset.id);
    setSaveName(preset.name);
    setColumns(preset.columns.split(',').filter(c => c.trim() !== ''));
  };

  const resetEditor = () => {
    setColumns([]);
    setSaveName('');
    setActivePresetId(null);
  };

  const addColumn = () => {
    setColumns([...columns, `Column ${columns.length + 1}`]);
  };

  const removeColumn = (index: number) => {
    setColumns(columns.filter((_, i) => i !== index));
  };

  const updateColumn = (index: number, name: string) => {
    const newCols = [...columns];
    newCols[index] = name;
    setColumns(newCols);
  };

  return (
    <div className="p-8 space-y-10">
      {/* Column Configuration */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <label className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] ${
              darkMode ? 'text-zinc-500' : 'text-zinc-400'
            }`}>
              <Table size={16} weight="bold" />
              CSV Definition
            </label>
          </div>
          <button
            onClick={addColumn}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
              darkMode ? 'bg-white text-zinc-950 hover:bg-zinc-200 shadow-xl shadow-white/5' : 'bg-zinc-950 text-white hover:bg-zinc-800 shadow-lg'
            }`}
          >
            <Plus size={14} weight="bold" />
            Add Column
          </button>
        </div>

        <div className="grid gap-3">
          {columns.length > 0 ? (
            columns.map((col, index) => (
              <div key={index} className="flex items-center gap-3 group animate-in fade-in slide-in-from-left-2 transition-all">
                <div className={`flex-1 flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all ${
                  darkMode ? 'bg-zinc-900/40 border-zinc-800 focus-within:border-zinc-700 focus-within:bg-zinc-900' : 'bg-white border-zinc-100 focus-within:border-zinc-200 focus-within:shadow-xl shadow-sm'
                }`}>
                  <input
                    type="text"
                    value={col}
                    onChange={(e) => updateColumn(index, e.target.value)}
                    placeholder="COLUMN NAME..."
                    className={`w-full bg-transparent border-none outline-none text-[12px] font-bold tracking-widest placeholder:opacity-20 ${darkMode ? 'text-zinc-100' : 'text-zinc-900'}`}
                  />
                </div>
                <button
                  onClick={() => removeColumn(index)}
                  className={`p-3 rounded-xl transition-all opacity-0 group-hover:opacity-100 ${
                    darkMode ? 'text-zinc-500 hover:text-red-400 hover:bg-zinc-900' : 'text-zinc-400 hover:text-red-500 hover:bg-zinc-100'
                  }`}
                >
                  <Trash size={18} weight="bold" />
                </button>
              </div>
            ))
          ) : (
            <div className={`p-12 rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center text-center gap-6 ${
              darkMode ? 'border-zinc-900 bg-zinc-950/50' : 'border-zinc-100 bg-zinc-50/30'
            }`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                darkMode ? 'bg-zinc-900 text-yellow-500' : 'bg-white text-yellow-600 shadow-sm'
              }`}>
                <Table size={24} weight="bold" />
              </div>
              <div className="space-y-2">
                <p className={`text-[10px] font-black uppercase tracking-widest leading-relaxed ${darkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>
                  No columns defined
                </p>
                <p className={`text-[9px] font-black uppercase tracking-widest opacity-40 leading-relaxed max-w-xs ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  The model will generate a free CSV structure. Add columns to enforce a specific schema.
                </p>
              </div>
            </div>
          )}
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
              placeholder="PRESET IDENTITY NAME..."
              className={`w-full h-11 px-5 text-[11px] font-black uppercase tracking-[0.1em] rounded-xl border transition-all outline-none ${
                darkMode
                  ? 'bg-zinc-950 border-zinc-800 focus:border-zinc-600 focus:bg-zinc-900/50 text-zinc-300'
                  : 'bg-zinc-50 border-zinc-200 focus:border-zinc-300 focus:bg-white text-zinc-700'
              }`}
            />
          </div>
          <button
            onClick={savePreset}
            disabled={!saveName.trim()}
            className={`h-11 px-6 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 transition-all active:scale-[0.98] disabled:opacity-30 disabled:grayscale ${
              darkMode 
                ? 'bg-white text-zinc-950 hover:bg-zinc-200 shadow-xl' 
                : 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-xl shadow-zinc-900/10'
            }`}
          >
            <FloppyDisk size={18} weight="bold" />
            {activePresetId ? 'Update' : 'Save'}
          </button>
        </div>
      </div>

      {/* Library Section */}
      <div className="space-y-6 border-t pt-10 border-white/5">
        <label className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] ${
          darkMode ? 'text-zinc-600' : 'text-zinc-400'
        }`}>
          <FolderOpen size={16} weight="bold" />
          CSV Artifact Library
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedPresets.length > 0 ? (
            savedPresets.map((p) => (
              <div
                key={p.id}
                onClick={() => applyPreset(p)}
                className={`group flex items-center justify-between p-5 rounded-2xl border transition-all cursor-pointer ${
                  darkMode
                    ? 'bg-zinc-950 border-zinc-900 hover:border-zinc-700 hover:bg-zinc-900/50'
                    : 'bg-white border-zinc-100 hover:border-zinc-200 hover:shadow-xl shadow-sm shadow-zinc-200/20'
                } ${activePresetId === p.id ? 'ring-2 ring-yellow-500/50' : ''}`}
              >
                <div className="flex-1 min-w-0 pr-6">
                  <div className={`text-[11px] font-black uppercase tracking-widest truncate ${darkMode ? 'text-zinc-200' : 'text-zinc-900'}`}>
                    {p.name}
                  </div>
                  <div className={`text-[9px] font-mono truncate mt-1.5 opacity-40 ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    {p.columns}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => deletePreset(e, p.id)}
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
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">No presets available in local core.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


