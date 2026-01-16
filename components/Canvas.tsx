
import React, { useRef } from 'react';
import { Layer } from '../types';
import DraggableLayer from './DraggableLayer';

interface CanvasProps {
  baseImage: string;
  layers: Layer[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
  onDeleteLayer: (id: string) => void;
}

const Canvas: React.FC<CanvasProps> = ({ 
  baseImage, 
  layers, 
  selectedId, 
  onSelect, 
  onUpdateLayer, 
  onDeleteLayer 
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleClickAway = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onSelect(null);
    }
  };

  return (
    <div 
      className="flex-1 bg-slate-100 flex items-center justify-center p-8 overflow-hidden relative"
      onClick={handleClickAway}
    >
      <div 
        ref={canvasRef}
        id="design-canvas"
        className="relative shadow-2xl bg-white aspect-square w-full max-w-[600px] overflow-hidden rounded-lg canvas-grid border border-slate-200"
      >
        {/* Base Product Image */}
        <img 
          src={baseImage} 
          alt="Tote Bag Base" 
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* Overlay Layers */}
        {layers.map((layer) => (
          <DraggableLayer
            key={layer.id}
            layer={layer}
            isSelected={selectedId === layer.id}
            onSelect={() => onSelect(layer.id)}
            onUpdate={(updates) => onUpdateLayer(layer.id, updates)}
            onDelete={() => onDeleteLayer(layer.id)}
          />
        ))}
      </div>

      <div className="absolute bottom-6 right-6 flex flex-col gap-2 text-xs text-slate-400 bg-white/50 backdrop-blur px-3 py-2 rounded-lg">
        <p>• Click to select elements</p>
        <p>• Drag to move</p>
        <p>• Click canvas to deselect</p>
      </div>
    </div>
  );
};

export default Canvas;
