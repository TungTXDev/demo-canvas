
import React, { useState, useCallback, useRef } from 'react';
import { Layer, GeneratedDesign } from './types';
import { ICONS, BASE_BAG_IMAGE, EMOJI_LIST, DEFAULT_LAYER_SIZE } from './constants';
import Canvas from './components/Canvas';
import { geminiService } from './services/geminiService';
import html2canvas from 'html2canvas';

const App: React.FC = () => {
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiDesigns, setAiDesigns] = useState<GeneratedDesign[]>([]);
  const [viewMode, setViewMode] = useState<'editor' | 'gallery'>('editor');
  const [activeTab, setActiveTab] = useState<'elements' | 'text' | 'ai'>('elements');
  const [promptText, setPromptText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addLayer = useCallback((type: Layer['type'], content: string) => {
    const newLayer: Layer = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content,
      x: 250,
      y: 250,
      width: type === 'emoji' ? 80 : DEFAULT_LAYER_SIZE,
      height: type === 'emoji' ? 80 : DEFAULT_LAYER_SIZE,
      rotation: 0,
      fontSize: type === 'text' ? 24 : undefined
    };
    setLayers(prev => [...prev, newLayer]);
    setSelectedId(newLayer.id);
  }, []);

  const updateLayer = useCallback((id: string, updates: Partial<Layer>) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  }, []);

  const deleteLayer = useCallback((id: string) => {
    setLayers(prev => prev.filter(l => l.id !== id));
    setSelectedId(null);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          addLayer('image', event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const generateFromMockup = async () => {
    const canvasElement = document.getElementById('design-canvas');
    if (!canvasElement) return;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(canvasElement);
      const base64 = canvas.toDataURL('image/png');
      const result = await geminiService.generateDesignFromMockup(base64, promptText);
      
      const newDesign: GeneratedDesign = {
        id: Date.now().toString(),
        imageUrl: result,
        prompt: promptText || "Custom designer tote"
      };
      
      setAiDesigns(prev => [newDesign, ...prev]);
      setViewMode('gallery');
    } catch (error) {
      alert("Error generating AI design. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePureAI = async () => {
    if (!promptText) {
      alert("Please enter a prompt for the AI!");
      return;
    }
    setIsGenerating(true);
    try {
      const result = await geminiService.generatePureAIModel(promptText);
      const newDesign: GeneratedDesign = {
        id: Date.now().toString(),
        imageUrl: result,
        prompt: promptText
      };
      setAiDesigns(prev => [newDesign, ...prev]);
      setViewMode('gallery');
    } catch (error) {
      alert("Error generating AI design.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar Controls */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col z-50">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-200">
            <ICONS.Bag className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">AIGen Studio</h1>
        </div>

        <nav className="flex border-b border-slate-100">
          <button 
            onClick={() => setActiveTab('elements')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'elements' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Elements
          </button>
          <button 
            onClick={() => setActiveTab('text')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'text' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Text
          </button>
          <button 
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'ai' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            AI Gen
          </button>
        </nav>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          {activeTab === 'elements' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-600 mb-4 uppercase tracking-wider">Upload Image</h3>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50 transition-all group"
                >
                  <ICONS.Image className="w-8 h-8 text-slate-400 group-hover:text-blue-500" />
                  <span className="text-sm text-slate-500 group-hover:text-blue-600">Click to upload</span>
                </button>
                <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-600 mb-4 uppercase tracking-wider">Emojis</h3>
                <div className="grid grid-cols-4 gap-3">
                  {EMOJI_LIST.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => addLayer('emoji', emoji)}
                      className="text-2xl p-2 hover:bg-slate-100 rounded-lg transition-transform hover:scale-110 active:scale-95"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'text' && (
            <div className="space-y-6">
               <button 
                  onClick={() => addLayer('text', 'Your Text')}
                  className="w-full py-4 px-6 bg-slate-800 text-white rounded-xl flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors shadow-lg"
                >
                  <ICONS.Plus className="w-5 h-5" />
                  Add Text Layer
                </button>

                {selectedId && layers.find(l => l.id === selectedId)?.type === 'text' && (
                  <div className="mt-8 p-4 bg-slate-50 rounded-xl space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase">Edit Text</h4>
                    <input 
                      type="text" 
                      value={layers.find(l => l.id === selectedId)?.content}
                      onChange={(e) => updateLayer(selectedId, { content: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div>
                      <label className="text-xs text-slate-500">Size</label>
                      <input 
                        type="range" min="10" max="120"
                        value={layers.find(l => l.id === selectedId)?.fontSize}
                        onChange={(e) => updateLayer(selectedId, { fontSize: parseInt(e.target.value) })}
                        className="w-full accent-blue-600"
                      />
                    </div>
                  </div>
                )}
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100">
                <div className="flex items-center gap-2 text-blue-700 font-bold mb-2">
                  <ICONS.AI className="w-4 h-4" />
                  AI Designer
                </div>
                <p className="text-xs text-blue-600 leading-relaxed">
                  Turn your manual mockup into a professional design or generate a new concept from scratch.
                </p>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-semibold text-slate-700 block">AI Prompt</label>
                <textarea 
                  placeholder="E.g., A minimalist Japanese wave design with gold accents..."
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  className="w-full h-32 p-4 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="space-y-3">
                <button 
                  onClick={generateFromMockup}
                  disabled={isGenerating}
                  className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-all shadow-xl shadow-blue-100"
                >
                  {isGenerating ? 'Designing...' : 'Transform Mockup'}
                </button>
                <button 
                  onClick={generatePureAI}
                  disabled={isGenerating}
                  className="w-full py-4 bg-white border-2 border-slate-800 text-slate-800 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 disabled:opacity-50 transition-all"
                >
                  New Pure AI Concept
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          <button 
            onClick={() => setViewMode(viewMode === 'editor' ? 'gallery' : 'editor')}
            className="w-full py-3 px-4 rounded-xl text-slate-600 font-semibold flex items-center justify-center gap-2 border border-slate-200 hover:bg-white transition-all"
          >
            {viewMode === 'editor' ? 'View Gallery' : 'Back to Editor'}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 z-40">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-slate-700">
              {viewMode === 'editor' ? 'Design Studio' : 'Generated Designs'}
            </h2>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-full border border-green-100 uppercase tracking-tighter">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Live Canvas
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {viewMode === 'editor' && (
              <button 
                className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 text-white font-bold rounded-full hover:bg-slate-700 transition-all shadow-lg shadow-slate-200"
                onClick={() => alert("Ready to order! This feature is coming soon.")}
              >
                <ICONS.Download className="w-4 h-4" />
                Export Design
              </button>
            )}
          </div>
        </header>

        {/* View Switcher */}
        <div className="flex-1 relative">
          {viewMode === 'editor' ? (
            <Canvas 
              baseImage={BASE_BAG_IMAGE}
              layers={layers}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onUpdateLayer={updateLayer}
              onDeleteLayer={deleteLayer}
            />
          ) : (
            <div className="p-10 h-full overflow-y-auto bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                {aiDesigns.length === 0 ? (
                  <div className="col-span-full h-96 flex flex-col items-center justify-center text-slate-400 gap-4">
                    <ICONS.AI className="w-16 h-16 opacity-20" />
                    <p className="text-lg">No AI designs yet. Create one in the AI Gen tab!</p>
                  </div>
                ) : (
                  aiDesigns.map((design) => (
                    <div key={design.id} className="group relative bg-slate-50 rounded-2xl p-4 transition-all hover:shadow-2xl hover:-translate-y-1">
                      <div className="aspect-square rounded-xl overflow-hidden mb-4 shadow-sm">
                        <img src={design.imageUrl} alt="AI Design" className="w-full h-full object-cover" />
                      </div>
                      <p className="text-xs font-medium text-slate-500 line-clamp-2">{design.prompt}</p>
                      <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <button 
                          onClick={() => window.open(design.imageUrl)}
                          className="bg-white/90 backdrop-blur p-2 rounded-full shadow-lg hover:bg-white text-blue-600"
                        >
                          <ICONS.Download className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {isGenerating && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center z-[100]">
              <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <ICONS.AI className="absolute inset-0 m-auto w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Gemini is designing...</h2>
              <p className="text-slate-500 animate-pulse">Crafting a professional render of your vision</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
