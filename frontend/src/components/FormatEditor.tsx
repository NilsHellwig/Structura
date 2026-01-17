import { BracketsCurly, TextAa, Textbox } from 'phosphor-react';
import { useChatStore } from '../store/chatStore';
import { useUIStore } from '../store/uiStore';
import { OutputFormat } from '../types';
import JSONSchemaEditor from './editors/JSONSchemaEditor';
import TemplateEditor from './editors/TemplateEditor';
import RegexEditor from './editors/RegexEditor';

export default function FormatEditor() {
  const darkMode = useUIStore((state) => state.darkMode);
  const outputFormat = useChatStore((state) => state.outputFormat);

  const getFormatIcon = () => {
    const iconClass = darkMode ? 'text-gray-400' : 'text-gray-600';
    switch (outputFormat) {
      case OutputFormat.JSON:
        return <BracketsCurly size={16} className={iconClass} />;
      case OutputFormat.TEMPLATE:
        return <Textbox size={16} className={iconClass} />;
      case OutputFormat.REGEX:
        return <TextAa size={16} className={iconClass} />;
      default:
        return null;
    }
  };

  const getFormatDescription = () => {
    switch (outputFormat) {
      case OutputFormat.JSON:
        return 'Define JSON schema';
      case OutputFormat.TEMPLATE:
        return 'Configure template';
      case OutputFormat.REGEX:
        return 'Set regex pattern';
      case OutputFormat.FREETEXT:
        return 'No configuration required';
      default:
        return '';
    }
  };

  if (outputFormat === OutputFormat.FREETEXT) {
    return (
      <div
        className={`w-80 border-l flex items-center justify-center ${
          darkMode
            ? 'bg-[#0d0d0d] border-gray-800'
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
          ? 'bg-[#0d0d0d] border-gray-800'
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
        {outputFormat === OutputFormat.JSON && <JSONSchemaEditor />}
        {outputFormat === OutputFormat.TEMPLATE && <TemplateEditor />}
        {outputFormat === OutputFormat.REGEX && <RegexEditor />}
      </div>
    </div>
  );
}
