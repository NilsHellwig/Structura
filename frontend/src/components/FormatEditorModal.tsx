import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Sliders } from 'phosphor-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../store/uiStore';
import { useChatStore } from '../store/chatStore';
import JSONSchemaEditor from './editors/JSONSchemaEditor';
import TemplateEditor from './editors/TemplateEditor';
import RegexEditor from './editors/RegexEditor';

export default function FormatEditorModal() {
  const darkMode = useUIStore((state) => state.darkMode);
  const outputFormat = useChatStore((state) => state.outputFormat);
  const [open, setOpen] = useState(false);

  if (outputFormat === 'default') {
    return null; // No button for default mode
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          className={`p-2 w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
            darkMode
              ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-100 border'
              : 'bg-white border-zinc-200 text-zinc-500 hover:text-zinc-900 border shadow-sm'
          }`}
        >
          <Sliders size={18} weight="bold" />
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
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-lg shadow-2xl z-50 ${
                  darkMode
                    ? 'bg-zinc-950 border border-zinc-800'
                    : 'bg-white border border-zinc-200'
                }`}
              >
                <div className={`px-6 py-4 border-b flex items-center justify-between ${
                  darkMode ? 'border-zinc-800' : 'border-zinc-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <Sliders size={20} className={darkMode ? 'text-zinc-400' : 'text-zinc-500'} />
                    <Dialog.Title className={`text-lg font-bold ${
                      darkMode ? 'text-zinc-100' : 'text-zinc-900'
                    }`}>
                      {outputFormat === 'json' && 'JSON Schema Editor'}
                      {outputFormat === 'template' && 'Template Editor'}
                      {outputFormat === 'regex' && 'Regex Pattern Editor'}
                    </Dialog.Title>
                  </div>
                  <Dialog.Close asChild>
                    <button
                      className={`p-2 rounded-lg transition-colors ${
                        darkMode ? 'hover:bg-zinc-900 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-500'
                      }`}
                    >
                      <X size={20} />
                    </button>
                  </Dialog.Close>
                </div>

                <div className="overflow-y-auto max-h-[calc(80vh-80px)]">
                  {outputFormat === 'json' && <JSONSchemaEditor />}
                  {outputFormat === 'template' && <TemplateEditor />}
                  {outputFormat === 'regex' && <RegexEditor />}
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
