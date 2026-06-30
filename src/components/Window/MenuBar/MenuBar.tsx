import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export function MenuBar({ children }: Props) {
  return <div className="tq-menubar os-menubar">{children}</div>;
}
