import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Sliders, BracketsCurly, Selection, Code, FileHtml, Table } from 'phosphor-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../store/uiStore';
import { useChatStore } from '../store/chatStore';
import JSONSchemaEditor from './editors/JSONSchemaEditor';
import TemplateEditor from './editors/TemplateEditor';
import RegexEditor from './editors/RegexEditor';
import HTMLEditor from './editors/HTMLEditor';
import CSVEditor from './editors/CSVEditor';

export default function FormatEditorModal() {
  const darkMode = useUIStore((state) => state.darkMode);
  const outputFormat = useChatStore((state) => state.outputFormat);
  const [open, setOpen] = useState(false);

  if (outputFormat === 'default') {
    return null; // No button for default mode
  }

  const getFormatIcon = () => {
    switch (outputFormat) {
      case 'json': return <BracketsCurly size={24} weight="fill" className="text-yellow-500" />;
      case 'template': return <Selection size={24} weight="fill" className="text-yellow-500" />;
      case 'regex': return <Code size={24} weight="fill" className="text-yellow-500" />;
      case 'html': return <FileHtml size={24} weight="fill" className="text-yellow-500" />;
      case 'csv': return <Table size={24} weight="fill" className="text-yellow-500" />;
      default: return <Sliders size={24} weight="fill" className="text-yellow-500" />;
    }
  };

  const getFormatTitle = () => {
    switch (outputFormat) {
      case 'json': return 'JSON Artifact';
      case 'template': return 'Template Artifact';
      case 'regex': return 'Regex Artifact';
      case 'html': return 'HTML Artifact';
      case 'csv': return 'CSV Artifact';
      default: return 'Format Artifact';
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          className={`p-2 w-10 h-10 flex items-center justify-center rounded-2xl transition-all ${
            darkMode
              ? 'bg-white/5 border border-white/5 text-zinc-400 hover:text-yellow-500 hover:bg-white/10'
              : 'bg-zinc-100 border border-zinc-200/50 text-zinc-500 hover:text-yellow-600 hover:bg-zinc-200'
          }`}
          title="Configure Format"
        >
          <Sliders size={20} weight="fill" />
        </button>
      </Dialog.Trigger>

      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xl z-[100]"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[85vh] flex flex-col overflow-hidden rounded-[2.5rem] shadow-2xl z-[101] ${
                  darkMode
                    ? 'bg-zinc-950 border border-white/10'
                    : 'bg-white border border-zinc-200 shadow-zinc-200/50'
                }`}
              >
                <div className="px-10 pt-10 pb-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      darkMode ? 'bg-zinc-900 border border-white/5' : 'bg-zinc-100 border border-zinc-200/50 shadow-sm'
                    }`}>
                      {getFormatIcon()}
                    </div>
                    <div>
                      <Dialog.Title className={`text-lg font-black uppercase tracking-[-0.02em] ${
                        darkMode ? 'text-white' : 'text-black'
                      }`}>
                        {getFormatTitle()}
                      </Dialog.Title>
                      <Dialog.Description className="sr-only">
                        Configure the settings and structure for the selected output format.
                      </Dialog.Description>
                      <p className={`text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ${
                        darkMode ? 'text-zinc-400' : 'text-zinc-500'
                      }`}>Format Library Editor</p>
                    </div>
                  </div>
                  <Dialog.Close asChild>
                    <button
                      className={`p-3 rounded-2xl transition-all ${
                        darkMode ? 'hover:bg-white/5 text-zinc-500 hover:text-white' : 'hover:bg-zinc-100 text-zinc-400 hover:text-black'
                      }`}
                    >
                      <X size={20} weight="bold" />
                    </button>
                  </Dialog.Close>
                </div>

                <div className="flex-1 overflow-y-auto px-6 pb-10 custom-scrollbar">
                  {outputFormat === 'json' && <JSONSchemaEditor />}
                  {outputFormat === 'template' && <TemplateEditor />}
                  {outputFormat === 'regex' && <RegexEditor />}
                  {outputFormat === 'html' && <HTMLEditor />}
                  {outputFormat === 'csv' && <CSVEditor />}
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
