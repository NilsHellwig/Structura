import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import type { ReactNode } from 'react';
import { useUIStore } from '../store/uiStore';

interface TooltipProps {
  content: string;
  children: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export default function Tooltip({ content, children, side = 'top' }: TooltipProps) {
  const darkMode = useUIStore((state) => state.darkMode);

  return (
    <TooltipPrimitive.Provider delayDuration={300}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            sideOffset={8}
            className={`z-[200] px-3 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-2xl animate-in fade-in zoom-in duration-200 backdrop-blur-xl ${
              darkMode
                ? 'bg-zinc-950/90 text-zinc-100 border border-white/10'
                : 'bg-white/95 text-black border border-zinc-200 shadow-zinc-200/50'
            }`}
          >
            {content}
            <TooltipPrimitive.Arrow
              className={darkMode ? 'fill-white/10' : 'fill-zinc-200'}
            />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
