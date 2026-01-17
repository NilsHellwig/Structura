import { useState, useEffect } from 'react';
import { X, Sparkle, FileCode, Gear, Chat, ArrowRight } from 'phosphor-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../store/uiStore';

const INTRO_SHOWN_KEY = 'structura_intro_shown';

export default function IntroModal() {
  const darkMode = useUIStore((state) => state.darkMode);
  const isOpen = useUIStore((state) => state.showIntro);
  const setIsOpen = useUIStore((state) => state.setShowIntro);

  useEffect(() => {
    // Check if intro has been shown before
    const hasBeenShown = localStorage.getItem(INTRO_SHOWN_KEY);
    if (!hasBeenShown) {
      setIsOpen(true);
      localStorage.setItem(INTRO_SHOWN_KEY, 'true');
    }
  }, [setIsOpen]);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className={`relative w-full max-w-2xl rounded-lg shadow-2xl pointer-events-auto overflow-hidden ${
                darkMode ? 'bg-zinc-950 border border-zinc-800' : 'bg-white border border-zinc-200'
              }`}
            >
              {/* Header */}
              <div className="relative px-8 py-8">
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                      className={`w-14 h-14 rounded-lg flex items-center justify-center shadow-sm ${
                        darkMode ? 'bg-zinc-900 text-zinc-100 border border-zinc-800' : 'bg-zinc-100 text-zinc-900'
                      }`}
                    >
                      <Sparkle size={32} weight="fill" />
                    </motion.div>
                    <div>
                      <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-zinc-900'}`}>
                        Welcome to Structura
                      </h2>
                      <p className={`text-sm font-medium ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        Your AI assistant with structured outputs
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className={`p-2 rounded-lg transition-all ${
                      darkMode 
                        ? 'hover:bg-zinc-900 text-zinc-400' 
                        : 'hover:bg-zinc-100 text-zinc-400'
                    }`}
                  >
                    <X size={20} weight="bold" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className={`px-8 py-6 space-y-4 max-h-[60vh] overflow-y-auto ${
                darkMode ? 'text-zinc-200' : 'text-zinc-800'
              }`}>
                {/* Feature 1 */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex gap-4 p-4 rounded-lg"
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                    darkMode ? 'bg-zinc-900 text-zinc-100 border border-zinc-800' : 'bg-zinc-100 text-zinc-900'
                  }`}>
                    <Chat size={20} weight="fill" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1 tracking-tight">Multiple LLM Backends</h3>
                    <p className={`text-sm leading-relaxed ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      Choose between <strong>Ollama</strong>, <strong>OpenAI</strong>, or <strong>vLLM</strong>. 
                      Select your preferred model from the dropdowns at the top.
                    </p>
                  </div>
                </motion.div>

                {/* Feature 2 */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex gap-4 p-4 rounded-lg transition-colors hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50"
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                    darkMode ? 'bg-zinc-900 text-zinc-100 border border-zinc-800' : 'bg-zinc-100 text-zinc-900'
                  }`}>
                    <FileCode size={20} weight="fill" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1 tracking-tight">Structured Outputs</h3>
                    <p className={`text-sm leading-relaxed ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      Control output format: <strong>Default</strong>, <strong>JSON Schema</strong>, 
                      <strong>Template</strong>, or <strong>Regex</strong>. 
                      Define your format in the right panel.
                    </p>
                  </div>
                </motion.div>

                {/* Feature 3 */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex gap-4 p-4 rounded-lg"
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                    darkMode ? 'bg-zinc-900 text-zinc-100 border border-zinc-800' : 'bg-zinc-100 text-zinc-900'
                  }`}>
                    <Gear size={20} weight="fill" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1 tracking-tight">Fine-tune Parameters</h3>
                    <p className={`text-sm leading-relaxed ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      Adjust temperature, top-p, and other LLM parameters. 
                      Settings are accessible via the gear icon in the header.
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Footer */}
              <div className={`px-8 py-6 flex justify-end border-t ${
                darkMode ? 'border-zinc-800 bg-zinc-900/20' : 'bg-zinc-50 border-zinc-200'
              }`}>
                <button
                  onClick={handleClose}
                  className={`px-8 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                    darkMode
                      ? 'bg-zinc-100 text-zinc-900 hover:bg-white shadow-sm'
                      : 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm'
                  }`}
                >
                  Get Started
                  <ArrowRight size={18} weight="bold" />
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
