
export type LayerType = 'text' | 'emoji' | 'image';

export interface Layer {
  id: string;
  type: LayerType;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fontSize?: number;
}

export interface DesignState {
  baseImage: string;
  layers: Layer[];
}

export interface GeneratedDesign {
  id: string;
  imageUrl: string;
  prompt: string;
}
