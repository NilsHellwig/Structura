import { useState, useEffect } from 'react';
import { FloppyDisk, Trash, FolderOpen } from 'phosphor-react';
import { useChatStore } from '../../store/chatStore';
import type { Template } from '../../types';
import api from '../../lib/api';

export default function TemplateEditor() {
  const { formatSpec, setFormatSpec } = useChatStore();
  const [template, setTemplate] = useState(formatSpec || 'Hallo, mein Name ist [GEN]');
  const [savedTemplates, setSavedTemplates] = useState<Template[]>([]);
  const [saveName, setSaveName] = useState('');

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
      await api.post('/formats/templates', {
        name: saveName,
        content: template,
      });
      setSaveName('');
      loadSavedTemplates();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Fehler beim Speichern');
    }
  };

  const loadTemplate = (t: Template) => {
    setTemplate(t.content);
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
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Template <span className="text-xs text-light-muted dark:text-dark-muted">
            (verwende [GEN] für Einfügungen)
          </span>
        </label>
        <textarea
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          className="input-field font-mono text-sm"
          rows={10}
          placeholder="Hallo, mein Name ist [GEN] und ich bin ein [GEN]."
        />
        <p className="text-xs text-light-muted dark:text-dark-muted mt-1">
          {genCount} Einfügestelle{genCount !== 1 ? 'n' : ''} gefunden
        </p>
      </div>

      <div className="p-3 bg-pastel-blue dark:bg-brand-primary/10 rounded-lg text-sm">
        <p className="font-medium mb-1">Vorschau:</p>
        <div className="whitespace-pre-wrap break-words">
          {template.split('[GEN]').map((part, i, arr) => (
            <span key={i}>
              {part}
              {i < arr.length - 1 && (
                <span className="bg-brand-accent px-1 rounded text-xs font-bold">
                  GEN
                </span>
              )}
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={saveName}
          onChange={(e) => setSaveName(e.target.value)}
          placeholder="Template Name..."
          className="input-field text-sm flex-1"
        />
        <button
          onClick={saveTemplate}
          disabled={!saveName.trim()}
          className="btn-primary px-3"
          title="Speichern"
        >
          <FloppyDisk size={18} weight="bold" />
        </button>
      </div>

      {savedTemplates.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <FolderOpen size={16} weight="bold" />
            Gespeicherte Templates
          </h4>
          <div className="space-y-1">
            {savedTemplates.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-2 p-2 hover:bg-light-border dark:hover:bg-dark-border rounded"
              >
                <button
                  onClick={() => loadTemplate(t)}
                  className="flex-1 text-left text-sm truncate"
                >
                  {t.name}
                </button>
                <button
                  onClick={() => deleteTemplate(t.id)}
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
