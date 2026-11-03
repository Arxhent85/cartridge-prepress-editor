import React from 'react';
import { LayoutElement } from '../../types';
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  ChevronUp,
  ChevronDown,
  Layers,
  Type,
  ImageIcon,
  Square,
  FileCode,
} from 'lucide-react';

interface LayersPanelProps {
  elements: LayoutElement[];
  onElementsChange: (elements: LayoutElement[]) => void;
  selectedElementId: string | null;
  onSelectElement: (id: string) => void;
}

export const LayersPanel: React.FC<LayersPanelProps> = ({
  elements,
  onElementsChange,
  selectedElementId,
  onSelectElement,
}) => {
  // Elements rendered from top-most (end of array) to bottom
  const reversedElements = [...elements].reverse();

  const toggleVisibility = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onElementsChange(
      elements.map((el) => (el.id === id ? { ...el, isHidden: !el.isHidden } : el))
    );
  };

  const toggleLock = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onElementsChange(
      elements.map((el) => (el.id === id ? { ...el, isLocked: !el.isLocked } : el))
    );
  };

  const deleteElement = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onElementsChange(elements.filter((el) => el.id !== id));
  };

  const moveElement = (id: string, direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation();
    const index = elements.findIndex((el) => el.id === id);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index + 1 : index - 1;
    if (newIndex < 0 || newIndex >= elements.length) return;

    const copy = [...elements];
    const [moved] = copy.splice(index, 1);
    copy.splice(newIndex, 0, moved);
    onElementsChange(copy);
  };

  const getElementIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <Type className="w-3.5 h-3.5 text-blue-400" />;
      case 'image':
        return <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />;
      case 'svg':
        return <FileCode className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Square className="w-3.5 h-3.5 text-orange-400" />;
    }
  };

  return (
    <div className="flex flex-col gap-2 text-xs text-zinc-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#2a2d34]">
        <div className="flex items-center gap-1.5 font-semibold text-zinc-100 uppercase tracking-wide">
          <Layers className="w-4 h-4 text-orange-500" />
          <span>Ebenen-Hierarchie ({elements.length})</span>
        </div>
        <span className="text-[10px] text-zinc-500 font-mono">Druckreihenfolge</span>
      </div>

      {/* Layer List */}
      <div className="flex flex-col gap-1 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
        {reversedElements.map((el) => {
          const isSelected = el.id === selectedElementId;
          return (
            <div
              key={el.id}
              onClick={() => onSelectElement(el.id)}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded border transition cursor-pointer ${
                isSelected
                  ? 'bg-orange-500/15 border-orange-500 text-white'
                  : 'bg-[#1b1c21] border-[#292c34] text-zinc-300 hover:bg-[#23252d]'
              }`}
            >
              {/* Left: Icon & Name */}
              <div className="flex items-center gap-2 truncate">
                {getElementIcon(el.type)}
                <span className="truncate font-medium text-[11px] max-w-[130px]">
                  {el.name}
                </span>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-1 shrink-0">
                {/* Reorder Up / Down */}
                <button
                  onClick={(e) => moveElement(el.id, 'up', e)}
                  className="p-0.5 text-zinc-500 hover:text-white"
                  title="Nach vorne bringen"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => moveElement(el.id, 'down', e)}
                  className="p-0.5 text-zinc-500 hover:text-white"
                  title="Nach hinten bringen"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>

                {/* Lock */}
                <button
                  onClick={(e) => toggleLock(el.id, e)}
                  className={`p-0.5 ${el.isLocked ? 'text-amber-400' : 'text-zinc-600 hover:text-white'}`}
                  title={el.isLocked ? 'Entsperren' : 'Sperren'}
                >
                  {el.isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                </button>

                {/* Visibility */}
                <button
                  onClick={(e) => toggleVisibility(el.id, e)}
                  className={`p-0.5 ${el.isHidden ? 'text-red-400' : 'text-zinc-500 hover:text-white'}`}
                  title={el.isHidden ? 'Einblenden' : 'Ausblenden'}
                >
                  {el.isHidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>

                {/* Delete */}
                <button
                  onClick={(e) => deleteElement(el.id, e)}
                  className="p-0.5 text-zinc-600 hover:text-red-400"
                  title="Ebene löschen"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
