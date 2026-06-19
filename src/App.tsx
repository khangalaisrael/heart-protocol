import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock } from 'lucide-react';
import TextHeart from './components/TextHeart';

const BOOT_LINES = [
  { tag: '[system]', text: 'Initializing heart.PROTOCOL_v2.0...', delay: 30 },
  { tag: '[scan]',   text: 'Locating encrypted payload...', delay: 25 },
  { tag: '[auth]',   text: 'Verifying sender signature... OK', delay: 22 },
  { tag: '[crypto]', text: 'Decryption key loaded. Standing by.', delay: 20 },
];

function Typewriter({ text, delay = 50, onComplete }: { text: string; delay?: number; onComplete?: () => void }) {
  const [currentText, setCurrentText] = React.useState('');
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    if (index < text.length) {
      const t = setTimeout(() => {
        setCurrentText(prev => prev + text[index]);
        setIndex(prev => prev + 1);
      }, delay);
      return () => clearTimeout(t);
    } else if (onComplete) {
      onComplete();
    }
  }, [index, text, delay, onComplete]);

  return <span className="font-mono">{currentText}</span>;
}

function ConsoleLine({ tag, text, delay, active, onComplete }: {
  tag: string; text: string; delay: number; active: boolean; onComplete?: () => void;
}) {
  return (
    <div className="flex gap-2 text-pink-soft/60 min-h-6">
      <span className="shrink-0">{tag}</span>
      {active && <Typewriter text={text} delay={delay} onComplete={onComplete} />}
    </div>
  );
}

export default function App() {
  const [stage, setStage] = useState<'console' | 'reveal'>('console');
  const [lineIndex, setLineIndex] = useState(0);

  const allLinesFinished = lineIndex >= BOOT_LINES.length;

  const handleReveal = useCallback(() => {
    if (stage === 'console' && allLinesFinished) setStage('reveal');
  }, [stage, allLinesFinished]);

  return (
    <div
      onClick={handleReveal}
      className={`relative min-h-screen w-full flex items-center justify-center bg-[#050505] selection:bg-pink-deep/30 ${stage === 'console' && allLinesFinished ? 'cursor-pointer' : ''}`}
    >
      <div className="scanline" />

      <AnimatePresence mode="wait">
        {stage === 'console' ? (
          <motion.div
            key="console"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full max-w-2xl p-8 font-mono text-sm md:text-base text-white/80"
          >
            <div className="space-y-2">
              {BOOT_LINES.map((line, i) => (
                <ConsoleLine
                  key={i}
                  tag={line.tag}
                  text={line.text}
                  delay={line.delay}
                  active={lineIndex >= i}
                  onComplete={() => setLineIndex(i + 1)}
                />
              ))}

              <div className="flex gap-2 min-h-6">
                <span>[status]</span>
                {allLinesFinished && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-green-400"
                  >
                    READY
                  </motion.span>
                )}
              </div>

              {allLinesFinished && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pt-8 flex flex-col items-start gap-6"
                >
                  <p className="text-white/40 italic">
                    {'>'} One encrypted package found for you.
                  </p>

                  <button
                    id="decrypt-button"
                    onClick={(e) => { e.stopPropagation(); setStage('reveal'); }}
                    className="group flex items-center gap-3 px-6 py-3 border border-pink-deep/30 bg-pink-deep/5 hover:bg-pink-deep/10 text-pink-soft transition-all duration-300 pointer-events-auto"
                  >
                    <Lock size={16} className="group-hover:rotate-12 transition-transform" />
                    <span className="font-mono tracking-widest uppercase text-xs">Decrypt Message</span>
                    <span className="terminal-cursor" />
                  </button>

                  <p className="text-[10px] text-white/20 animate-pulse">(or just click anywhere)</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative w-full h-screen flex items-center justify-center overflow-hidden"
          >
            <TextHeart />

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 3, duration: 1.5 }}
              className="z-20 text-center pointer-events-none"
            >
              <h2 className="text-pink-deep font-mono text-xl tracking-[0.3em] uppercase glow-text mb-2">
                Decrypted
              </h2>
              <div className="w-12 h-px bg-pink-deep/30 mx-auto" />
            </motion.div>

            {/* Restart button — fixed bottom-center, always visible */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              onClick={(e) => {
                e.stopPropagation();
                setLineIndex(0);
                setStage('console');
              }}
              className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 group flex items-center gap-2 px-5 py-2.5 border border-pink-deep/40 bg-black/60 hover:bg-pink-deep/15 text-pink-soft/70 hover:text-pink-soft transition-all duration-300 font-mono uppercase text-xs tracking-widest backdrop-blur-sm"
            >
              <span className="group-hover:rotate-180 transition-transform duration-500 inline-block">↺</span>
              Restart
            </motion.button>

            <div className="absolute top-8 left-8 text-[10px] font-mono text-white/10 uppercase tracking-widest space-y-1">
              <div>ln: 420</div>
              <div>id: 0xDEADBEEF</div>
              <div>type: organic_emotion</div>
            </div>

            <div className="absolute bottom-8 right-8 text-[10px] font-mono text-white/10 uppercase tracking-widest">
              heart_reveal // success
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
