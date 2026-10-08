import { createContext, use, useMemo, useState, type ReactNode } from 'react';

interface MenuContextValue {
  open: boolean;
  openMenu: () => void;
  closeMenu: () => void;
}

const MenuContext = createContext<MenuContextValue | null>(null);

export function MenuProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const value = useMemo(() => ({ open, openMenu: () => setOpen(true), closeMenu: () => setOpen(false) }), [open]);
  return <MenuContext value={value}>{children}</MenuContext>;
}

export function useMenu(): MenuContextValue {
  const context = use(MenuContext);
  if (!context) throw new Error('useMenu вне MenuProvider');
  return context;
}
