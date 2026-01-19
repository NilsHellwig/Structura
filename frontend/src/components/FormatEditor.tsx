import { BracketsCurly, TextAa, Textbox, Code, Table } from 'phosphor-react';
import { useChatStore } from '../store/chatStore';
import { useUIStore } from '../store/uiStore';
import JSONSchemaEditor from './editors/JSONSchemaEditor';
import TemplateEditor from './editors/TemplateEditor';
import RegexEditor from './editors/RegexEditor';
import HTMLEditor from './editors/HTMLEditor';
import CSVEditor from './editors/CSVEditor';

export default function FormatEditor() {
  const darkMode = useUIStore((state) => state.darkMode);
  const outputFormat = useChatStore((state) => state.outputFormat);

  const getFormatIcon = () => {
    const iconClass = darkMode ? 'text-gray-400' : 'text-gray-600';
    switch (outputFormat) {
      case 'json':
        return <BracketsCurly size={16} className={iconClass} />;
      case 'template':
        return <Textbox size={16} className={iconClass} />;
      case 'regex':
        return <TextAa size={16} className={iconClass} />;
      case 'html':
        return <Code size={16} className={iconClass} />;
      case 'csv':
        return <Table size={16} className={iconClass} />;
      default:
        return null;
    }
  };

  const getFormatDescription = () => {
    switch (outputFormat) {
      case 'json':
        return 'Define JSON schema';
      case 'template':
        return 'Configure template';
      case 'regex':
        return 'Set regex pattern';
      case 'html':
        return 'HTML document';
      case 'csv':
        return 'CSV spreadsheet';
      case 'default':
        return 'Default mode - no configuration required';
      default:
        return '';
    }
  };

  if (outputFormat === 'default') {
    return (
      <div
        className={`w-[320px] border-l flex items-center justify-center p-8 ${
          darkMode
            ? 'bg-zinc-950 border-zinc-900'
            : 'bg-zinc-50 border-zinc-200 shadow-[inset_1px_0_0_0_rgba(0,0,0,0.05)]'
        }`}
      >
        <div className="text-center relative">
          <div className="absolute inset-0 bg-yellow-500/5 blur-[40px] rounded-full" />
          <p className={`relative z-10 text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed opacity-40 ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
            {getFormatDescription()}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-[320px] border-l flex flex-col ${
        darkMode
          ? 'bg-zinc-950 border-zinc-900'
          : 'bg-white border-zinc-200 shadow-[inset_1px_0_0_0_rgba(0,0,0,0.05)]'
      }`}
    >
      <div className={`px-6 py-8 border-b ${
        darkMode ? 'border-zinc-900' : 'border-zinc-100'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${
            darkMode ? 'bg-zinc-900 text-yellow-500 border border-zinc-800' : 'bg-zinc-50 text-yellow-600 border border-zinc-100'
          }`}>
            {getFormatIcon()}
          </div>
          <div>
            <h3 className={`text-[11px] font-black uppercase tracking-widest mb-1 ${
              darkMode ? 'text-white' : 'text-zinc-900'
            }`}>
              Format Editor
            </h3>
            <p className={`text-[9px] font-black uppercase tracking-widest opacity-40 ${
              darkMode ? 'text-zinc-500' : 'text-zinc-400'
            }`}>
              {getFormatDescription()}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {outputFormat === 'json' && <JSONSchemaEditor />}
        {outputFormat === 'template' && <TemplateEditor />}
        {outputFormat === 'regex' && <RegexEditor />}
        {outputFormat === 'html' && <HTMLEditor />}
        {outputFormat === 'csv' && <CSVEditor />}
      </div>
    </div>
  );
}
