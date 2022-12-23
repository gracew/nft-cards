import { ReactNode } from 'react';

interface MintPanelContentsProps {
  text: string;
  children: ReactNode;
}

export default function MintPanelContents({ text, children }: MintPanelContentsProps) {
  return <div className="flex flex-col pb-3">
    <div className="mb-4">
      {text}
    </div>
    {children}
  </div>
}
