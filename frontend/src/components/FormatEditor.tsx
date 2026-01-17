import { BracketsCurly, TextAa, Textbox } from 'phosphor-react';
import { useChatStore } from '../store/chatStore';
import { useUIStore } from '../store/uiStore';
import JSONSchemaEditor from './editors/JSONSchemaEditor';
import TemplateEditor from './editors/TemplateEditor';
import RegexEditor from './editors/RegexEditor';

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
      case 'default':
        return 'Default mode - no configuration required';
      default:
        return '';
    }
  };

  if (outputFormat === 'default') {
    return (
      <div
        className={`w-80 border-l flex items-center justify-center ${
          darkMode
            ? 'bg-[#1a1a1a] border-gray-700'
            : 'bg-white border-gray-200'
        }`}
      >
        <div className="text-center px-6 py-4">
          <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
            {getFormatDescription()}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-80 border-l flex flex-col ${
        darkMode
          ? 'bg-[#1a1a1a] border-gray-700'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className={`px-4 py-3 border-b ${
        darkMode ? 'border-gray-800' : 'border-gray-200'
      }`}>
        <div className="flex items-center gap-2">
          {getFormatIcon()}
          <div>
            <h3 className={`font-medium text-sm ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Format Editor
            </h3>
            <p className={`text-xs ${
              darkMode ? 'text-gray-500' : 'text-gray-600'
            }`}>
              {getFormatDescription()}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {outputFormat === 'json' && <JSONSchemaEditor />}
        {outputFormat === 'template' && <TemplateEditor />}
        {outputFormat === 'regex' && <RegexEditor />}
      </div>
    </div>
  );
}
