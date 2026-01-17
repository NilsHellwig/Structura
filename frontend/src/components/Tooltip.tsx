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
            sideOffset={5}
            className={`z-50 px-3 py-1.5 text-xs font-medium rounded-md shadow-lg animate-in fade-in-0 zoom-in-95 ${
              darkMode
                ? 'bg-gray-800 text-gray-100 border border-gray-700'
                : 'bg-gray-900 text-white'
            }`}
          >
            {content}
            <TooltipPrimitive.Arrow
              className={darkMode ? 'fill-gray-800' : 'fill-gray-900'}
            />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
