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
            className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xl z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`relative w-full max-w-2xl rounded-[2.5rem] shadow-2xl pointer-events-auto overflow-hidden ${
                darkMode 
                  ? 'bg-zinc-950 border border-white/10' 
                  : 'bg-white border border-zinc-200 shadow-zinc-200/50'
              }`}
            >
              {/* Header */}
              <div className="relative px-10 pt-12 pb-8">
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div>
                      <h2 className={`text-4xl font-black tracking-[-0.05em] ${darkMode ? 'text-white' : 'text-zinc-900'}`}>
                        Structura
                      </h2>
                      <p className={`text-[10px] font-black uppercase tracking-[0.3em] opacity-40 ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        V1.0
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className={`p-3 rounded-2xl transition-all ${
                      darkMode 
                        ? 'hover:bg-white/5 text-zinc-500 hover:text-white' 
                        : 'hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900'
                    }`}
                  >
                    <X size={24} weight="bold" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className={`px-10 py-6 space-y-4 max-h-[60vh] overflow-y-auto ${
                darkMode ? 'text-zinc-400' : 'text-zinc-600'
              }`}>
                {/* Feature 1 */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className={`flex gap-6 p-6 rounded-[2rem] transition-all border ${
                    darkMode ? 'bg-white/[0.02] border-transparent hover:bg-white/[0.04] hover:border-white/5' : 'bg-white border-zinc-100 hover:border-zinc-200 shadow-sm'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center ${
                    darkMode ? 'bg-zinc-900 border border-white/5' : 'bg-white border border-zinc-200/50 shadow-sm'
                  }`}>
                    <FileCode size={24} weight="fill" className="text-yellow-500" />
                  </div>
                  <div className="space-y-1">
                    <h3 className={`text-sm font-black uppercase tracking-wider ${darkMode ? 'text-zinc-200' : 'text-zinc-900'}`}>Structured Outputs</h3>
                    <p className="text-xs leading-relaxed opacity-70">
                      Design precise <strong>JSON Schemas</strong>, <strong>Regex Patterns</strong> or 
                      <strong>Templates</strong> for structured responses.
                    </p>
                  </div>
                </motion.div>

                {/* Feature 2 */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className={`flex gap-6 p-6 rounded-[2rem] transition-all border ${
                    darkMode ? 'bg-white/[0.02] border-transparent hover:bg-white/[0.04] hover:border-white/5' : 'bg-white border-zinc-100 hover:border-zinc-200 shadow-sm'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center ${
                    darkMode ? 'bg-zinc-900 border border-white/5' : 'bg-white border border-zinc-200/50 shadow-sm'
                  }`}>
                    <Chat size={24} weight="fill" className="text-purple-500" />
                  </div>
                  <div className="space-y-1">
                    <h3 className={`text-sm font-black uppercase tracking-wider ${darkMode ? 'text-zinc-200' : 'text-zinc-900'}`}>Advanced Workflows</h3>
                    <p className="text-xs leading-relaxed opacity-70">
                      Choose between <strong>vLLM</strong>, <strong>Ollama</strong> or <strong>OpenAI</strong> backends 
                      tailored for your project.
                    </p>
                  </div>
                </motion.div>

                {/* Feature 3 */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className={`flex gap-6 p-6 rounded-[2rem] transition-all border ${
                    darkMode ? 'bg-white/[0.02] border-transparent hover:bg-white/[0.04] hover:border-white/5' : 'bg-white border-zinc-100 hover:border-zinc-200 shadow-sm'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center ${
                    darkMode ? 'bg-zinc-900 border border-white/5' : 'bg-white border border-zinc-200/50 shadow-sm'
                  }`}>
                    <Gear size={24} weight="fill" className="text-orange-500" />
                  </div>
                  <div className="space-y-1">
                    <h3 className={`text-sm font-black uppercase tracking-wider ${darkMode ? 'text-zinc-200' : 'text-zinc-900'}`}>Fine-tuning</h3>
                    <p className="text-xs leading-relaxed opacity-70">
                      Configure temperature and Top-P for maximum control over the creativity 
                      of your model.
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Footer */}
              <div className="p-10">
                <button
                  onClick={handleClose}
                  className={`group w-full h-16 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${
                    darkMode 
                      ? 'bg-white text-black hover:bg-zinc-200 shadow-xl shadow-white/5' 
                      : 'bg-zinc-950 text-white hover:bg-zinc-800 shadow-xl shadow-black/10'
                  }`}
                >
                  <span className="text-sm font-black uppercase tracking-[0.2em]">Start Orchestrating</span>
                  <ArrowRight size={20} weight="bold" className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
