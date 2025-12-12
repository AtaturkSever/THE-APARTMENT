import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { GameState } from '../types';
import { Play, Settings, Users, LogOut, Lock, ChevronLeft, Volume2, MousePointer2, Globe } from 'lucide-react';

const Button = ({ onClick, children, className = '' }: { onClick: () => void, children?: React.ReactNode, className?: string }) => (
  <button 
    onClick={onClick}
    className={`
      group flex items-center gap-4 text-2xl md:text-4xl text-gray-400 hover:text-red-600 
      transition-all duration-300 font-horror tracking-widest uppercase
      hover:scale-105 hover:pl-4
      ${className}
    `}
  >
    {children}
  </button>
);

export const MainMenu = () => {
  const { setGameState, t } = useStore();

  return (
    <div className="flex flex-col items-center justify-center h-full w-full z-10 relative">
      <h1 className="text-6xl md:text-9xl text-red-700 font-creep mb-16 animate-pulse drop-shadow-[0_0_15px_rgba(255,0,0,0.5)]">
        THE APARTMENT
      </h1>
      
      <div className="flex flex-col gap-8 w-64 md:w-96">
        <Button onClick={() => setGameState(GameState.CHAPTER_SELECT)}>
          <Play className="w-8 h-8 group-hover:animate-bounce" /> {t('menu_play')}
        </Button>
        <Button onClick={() => setGameState(GameState.SETTINGS)}>
          <Settings className="w-8 h-8 group-hover:rotate-90 transition-transform" /> {t('menu_settings')}
        </Button>
        <Button onClick={() => setGameState(GameState.CREDITS)}>
          <Users className="w-8 h-8" /> {t('menu_credits')}
        </Button>
        <Button onClick={() => setGameState(GameState.EXIT)}>
          <LogOut className="w-8 h-8" /> {t('menu_exit')}
        </Button>
      </div>
    </div>
  );
};

export const ChapterSelect = () => {
  const { setGameState, resetGame, t } = useStore();

  const chapters = [
    { id: 1, title: t('chapter_1_title'), subtitle: t('chapter_1_sub'), locked: false },
    { id: 2, title: t('chapter_2_title'), subtitle: t('chapter_2_sub'), locked: true },
    { id: 3, title: t('chapter_3_title'), subtitle: t('chapter_3_sub'), locked: true },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative">
      <h2 className="text-5xl text-red-600 font-horror mb-12">{t('chapter_select')}</h2>
      
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        {chapters.map((chapter, index) => (
          <div 
            key={index}
            onClick={() => {
                if (!chapter.locked) {
                    resetGame();
                    setGameState(GameState.PLAYING);
                }
            }}
            className={`
              w-64 h-80 border-2 ${chapter.locked ? 'border-gray-800 bg-gray-950 opacity-50 cursor-not-allowed' : 'border-red-900 bg-black hover:bg-red-950 cursor-pointer hover:border-red-500'}
              flex flex-col items-center justify-center p-6 transition-all duration-300 relative overflow-hidden group
            `}
          >
            {chapter.locked && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
                <Lock className="w-16 h-16 text-gray-600" />
              </div>
            )}
            
            <span className="text-6xl font-creep text-gray-700 mb-4 group-hover:text-red-700 transition-colors">
              {index + 1}
            </span>
            <h3 className="text-2xl font-horror text-white mb-2">{chapter.title}</h3>
            <p className="font-mono text-gray-500">{chapter.subtitle}</p>
          </div>
        ))}
      </div>

      <button 
        onClick={() => setGameState(GameState.MENU)}
        className="flex items-center gap-2 text-gray-500 hover:text-white font-mono uppercase"
      >
        <ChevronLeft /> {t('back')}
      </button>
    </div>
  );
};

export const SettingsMenu = () => {
  const { settings, updateSettings, setGameState, t } = useStore();

  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative p-8">
      <h2 className="text-5xl text-red-600 font-horror mb-16">{t('settings_title')}</h2>

      <div className="w-full max-w-lg space-y-12">
        {/* Sensitivity */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-white font-mono text-xl">
            <div className="flex items-center gap-2">
              <MousePointer2 className="text-red-600" /> {t('sensitivity')}
            </div>
            <span>{settings.sensitivity.toFixed(1)}</span>
          </div>
          <input 
            type="range" 
            min="0.1" 
            max="3.0" 
            step="0.1"
            value={settings.sensitivity}
            onChange={(e) => updateSettings({ sensitivity: parseFloat(e.target.value) })}
            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-red-700"
          />
        </div>

        {/* Volume */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-white font-mono text-xl">
            <div className="flex items-center gap-2">
              <Volume2 className="text-red-600" /> {t('volume')}
            </div>
            <span>{Math.round(settings.volume * 100)}%</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.05"
            value={settings.volume}
            onChange={(e) => updateSettings({ volume: parseFloat(e.target.value) })}
            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-red-700"
          />
        </div>

        {/* Language */}
         <div className="space-y-4">
          <div className="flex items-center justify-between text-white font-mono text-xl">
            <div className="flex items-center gap-2">
              <Globe className="text-red-600" /> {t('language')}
            </div>
          </div>
          <div className="flex gap-4">
              <button 
                onClick={() => updateSettings({ language: 'tr' })}
                className={`flex-1 py-2 border font-mono ${settings.language === 'tr' ? 'bg-red-900 border-red-500 text-white' : 'bg-black border-gray-700 text-gray-500'}`}
              >
                  TÜRKÇE
              </button>
              <button 
                onClick={() => updateSettings({ language: 'en' })}
                className={`flex-1 py-2 border font-mono ${settings.language === 'en' ? 'bg-red-900 border-red-500 text-white' : 'bg-black border-gray-700 text-gray-500'}`}
              >
                  ENGLISH
              </button>
          </div>
        </div>

      </div>

      <button 
        onClick={() => setGameState(GameState.MENU)}
        className="mt-16 flex items-center gap-2 text-gray-500 hover:text-white font-mono uppercase"
      >
        <ChevronLeft /> {t('back')}
      </button>
    </div>
  );
};

export const Credits = () => {
  const { setGameState, t } = useStore();

  const makers = [
    "Abdullah Huzeyfe TANIR",
    "Arda Kaan Sonuvar",
    "Ataberk Karadaş"
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative">
      <h2 className="text-5xl text-red-600 font-horror mb-16">{t('credits_title')}</h2>
      
      <div className="flex flex-col gap-6 text-center">
        {makers.map((name, index) => (
          <div key={index} className="group">
             <p className="text-2xl md:text-3xl text-gray-300 font-mono tracking-widest group-hover:text-red-500 transition-colors cursor-default">
              {name}
            </p>
            <div className="h-px w-0 bg-red-800 mx-auto mt-2 transition-all duration-500 group-hover:w-full"></div>
          </div>
        ))}
      </div>

      <button 
        onClick={() => setGameState(GameState.MENU)}
        className="mt-16 flex items-center gap-2 text-gray-500 hover:text-white font-mono uppercase"
      >
        <ChevronLeft /> {t('back')}
      </button>
    </div>
  );
};

export const ExitScreen = () => {
  const { setGameState, t } = useStore();
  
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-black">
      <p className="text-red-800 font-horror text-4xl mb-8 animate-pulse">
        {t('exit_screen_msg')}
      </p>
      <button 
        onClick={() => setGameState(GameState.MENU)}
        className="text-gray-600 hover:text-white font-mono text-sm border border-gray-800 px-4 py-2"
      >
        {t('return_menu')}
      </button>
    </div>
  );
};

// --- GAME OVER SCREEN ---
export const GameOverScreen = () => {
  const { setGameState, resetGame, t } = useStore();
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    // Slight delay for impact
    const t = setTimeout(() => setShowText(true), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden">
        {/* Scary Face Flash (Simulated with CSS) */}
        <div className="absolute inset-0 bg-red-900 animate-ping opacity-20 pointer-events-none"></div>
        
        {showText && (
            <div className="text-center z-50 animate-bounce">
                <h1 className="text-6xl md:text-8xl text-red-600 font-creep mb-4 drop-shadow-[0_0_25px_rgba(255,0,0,1)]">
                    {t('game_over_title')}
                </h1>
                <h2 className="text-4xl md:text-6xl text-white font-horror mb-8">
                    {t('game_over_sub')}
                </h2>
                
                <button 
                    onClick={() => { resetGame(); setGameState(GameState.MENU); }}
                    className="mt-12 text-2xl text-gray-400 hover:text-white border-b-2 border-red-800 hover:border-red-500 transition-all"
                >
                    {t('try_again')}
                </button>
            </div>
        )}
    </div>
  );
};