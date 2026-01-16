
import React, { useState, useRef, useEffect } from 'react';
import { Layer } from '../types';
import { ICONS } from '../constants';

interface DraggableLayerProps {
  layer: Layer;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<Layer>) => void;
  onDelete: () => void;
}

const DraggableLayer: React.FC<DraggableLayerProps> = ({ layer, isSelected, onSelect, onUpdate, onDelete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const layerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - layer.x,
      y: e.clientY - layer.y
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        onUpdate({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, onUpdate]);

  return (
    <div
      ref={layerRef}
      onMouseDown={handleMouseDown}
      className={`absolute cursor-move select-none group ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        left: layer.x,
        top: layer.y,
        transform: `rotate(${layer.rotation}deg)`,
        width: layer.width,
        height: layer.height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: isSelected ? 50 : 10
      }}
    >
      {layer.type === 'text' && (
        <span style={{ fontSize: layer.fontSize, fontWeight: 'bold' }}>{layer.content}</span>
      )}
      {layer.type === 'emoji' && (
        <span style={{ fontSize: layer.width * 0.8 }}>{layer.content}</span>
      )}
      {layer.type === 'image' && (
        <img src={layer.content} alt="custom" className="w-full h-full object-contain pointer-events-none" />
      )}

      {isSelected && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex bg-white shadow-lg rounded-full px-2 py-1 gap-2 border border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => { e.stopPropagation(); onUpdate({ rotation: layer.rotation + 15 }); }}
            className="p-1 hover:bg-slate-100 rounded-full"
          >
            <ICONS.Rotate className="w-4 h-4 text-slate-600" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1 hover:bg-red-50 rounded-full"
          >
            <ICONS.Delete className="w-4 h-4 text-red-500" />
          </button>
        </div>
      )}
    </div>
  );
};

export default DraggableLayer;
