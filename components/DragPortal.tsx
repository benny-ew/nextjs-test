'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface DragPortalProps {
  children: React.ReactNode;
}

export const DragPortal = ({ children }: DragPortalProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(children, document.body);
};
