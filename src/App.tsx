import { useState, useRef, FormEvent, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  Sparkles, 
  Copy, 
  Check, 
  Loader2, 
  Aperture,
  Clock,
  Palette,
  Maximize2
} from 'lucide-react';
import { generateZionPrompt, ZionResponse } from './services/gemini';

export default function App() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ZionResponse | null>(null);
  const [history, setHistory] = useState<{ input: string; result: ZionResponse }[]>([]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const resultRef = useRef<HTMLDivElement>(null);

  const handleNewIdea = () => {
    setInput('');
    setResult(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    const currentInput = input.trim();
    if (!currentInput || loading) return;

    setLoading(true);
    setError(null);
    try {
      const data = await generateZionPrompt(currentInput);
      setResult(data);
      setHistory(prev => [{ input: currentInput, result: data }, ...prev]);
      // Scroll to result
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      console.error(err);
      setError('Ocorreu um erro ao gerar o prompt. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 md:py-20 font-sans">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#111] border border-white/5">
            <Aperture className="w-6 h-6 text-white" />
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-3 tracking-tight uppercase">
          Zion Assistant
        </h1>
        <p className="text-white/40 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
          Engenheiro de Prompts Master para Fotografia Cinematográfica. Descreva sua visão e deixe o Zion arquitetar os parâmetros visuais perfeitos.
        </p>
      </motion.header>

      {/* Input Section */}
      <motion.section 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-16"
      >
        <div className="input-container">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Descreva sua visão cinematográfica... (ex: Uma cidade cyberpunk na chuva, iluminação neon densa, lente 35mm)"
            className="w-full bg-transparent border-none text-white/80 placeholder:text-white/20 resize-none h-32 focus:outline-none text-base leading-relaxed"
            disabled={loading}
          />
          <div className="flex items-center justify-end gap-4 mt-4">
            <span className="text-[10px] text-white/20 uppercase tracking-widest hidden md:block">
              Pressione <span className="bg-white/5 px-1.5 py-0.5 rounded border border-white/10">Enter</span> para iniciar
            </span>
            <button
              onClick={() => handleSubmit()}
              disabled={loading || !input.trim()}
              className="btn-gold p-3"
              title="Arquitetar Visão"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
        {error && (
          <p className="text-red-400 text-xs mt-4 text-center">{error}</p>
        )}
      </motion.section>

      {/* Results Section */}
      <AnimatePresence>
        {result && (
          <motion.div
            ref={resultRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-6 mb-20"
          >
            <div className="h-px bg-white/5 w-full mb-12" />
            
            {/* Analysis Card */}
            <div className="glass-panel p-6 md:p-8">
              <div className="flex items-center gap-2 mb-4 text-white/30 uppercase tracking-[0.2em] text-[10px] font-bold">
                <Palette className="w-3 h-3" />
                <span>Passo 1: A Análise</span>
              </div>
              <p className="text-xs md:text-sm leading-relaxed text-white/80 font-light">
                {result.analysis}
              </p>
            </div>

            {/* Prompt Card */}
            <div className="glass-panel p-6 md:p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-white/30 uppercase tracking-[0.2em] text-[10px] font-bold">
                  <Camera className="w-3 h-3" />
                  <span>Passo 2: O Prompt Definitivo</span>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-[10px] font-bold uppercase tracking-wider"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-[#a3914d]" />
                      <span className="text-[#a3914d]">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copiar Prompt</span>
                    </>
                  )}
                </button>
              </div>
              
              <div className="bg-black/40 rounded-xl p-5 border border-white/5 font-mono text-xs md:text-sm leading-relaxed text-white/60 select-all">
                {result.prompt}
              </div>

              <div className="mt-6 flex items-center gap-3 text-white/20 text-[10px] uppercase tracking-widest font-medium">
                <Maximize2 className="w-3 h-3" />
                <span>Otimizado para Midjourney & Stable Diffusion</span>
              </div>
            </div>

            {/* New Idea Button */}
            <div className="flex justify-center pt-4">
              <button
                onClick={handleNewIdea}
                className="flex items-center gap-2 text-white/40 hover:text-white/60 transition-colors text-xs font-bold uppercase tracking-widest"
              >
                <span>← Nova visão</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent Creations Section */}
      <section className="mt-20">
        <div className="flex items-center gap-2 mb-12 text-white/80">
          <Clock className="w-4 h-4" />
          <h2 className="font-bold text-sm uppercase tracking-wider">Criações Recentes</h2>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/20 text-sm font-medium">Nenhuma visão arquitetada ainda. A tela está em branco.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {history.map((item, i) => (
              <div key={i} className="glass-panel p-5 border-white/5 flex flex-col justify-between group h-full">
                <div className="mb-4">
                  <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider mb-2 line-clamp-1">
                    {item.input}
                  </p>
                  <p className="text-[9px] text-white/20 font-mono line-clamp-3 leading-relaxed">
                    {item.result.prompt}
                  </p>
                </div>
                <div className="flex justify-end">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(item.result.prompt);
                    }}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    title="Copiar Prompt"
                  >
                    <Copy className="w-3 h-3 text-white/40 group-hover:text-white/60" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="mt-32 text-center pb-12">
        <p className="text-white/10 text-[10px] uppercase tracking-[0.5em] font-bold">
          Zion Assistant • Arquitetura Visual
        </p>
      </footer>
    </div>
  );
}
