import React from 'react';
import { useStore } from './store';
import { GameState } from './types';
import { GameWorld } from './components/Game';
import { MainMenu, ChapterSelect, SettingsMenu, Credits, ExitScreen, GameOverScreen } from './components/UI';

const App = () => {
  const gameState = useStore((state) => state.gameState);

  const renderContent = () => {
    switch (gameState) {
      case GameState.PLAYING:
        return <GameWorld />;
      case GameState.CHAPTER_SELECT:
        return <ChapterSelect />;
      case GameState.SETTINGS:
        return <SettingsMenu />;
      case GameState.CREDITS:
        return <Credits />;
      case GameState.EXIT:
        return <ExitScreen />;
      case GameState.GAME_OVER:
        return <GameOverScreen />;
      case GameState.MENU:
      default:
        return <MainMenu />;
    }
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      {/* Background Ambience (Visible only in Menu/UI states, not Playing/GameOver) */}
      {gameState !== GameState.PLAYING && gameState !== GameState.GAME_OVER && (
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black opacity-80" />
           {/* Simple CSS animation for background smoke/fog effect could go here */}
           <div className="absolute inset-0 bg-black opacity-60"></div>
        </div>
      )}

      {/* Global Overlays */}
      <div className="scanlines pointer-events-none"></div>
      <div className="vignette pointer-events-none"></div>

      {/* Main Content Area */}
      <main className="relative z-10 w-full h-full">
        {renderContent()}
      </main>
      
      {/* Version/Footer */}
      {gameState !== GameState.PLAYING && gameState !== GameState.GAME_OVER && (
        <div className="absolute bottom-2 right-4 text-gray-800 font-mono text-xs z-20">
          v1.0.0 | BUILD 666
        </div>
      )}
    </div>
  );
};

export default App;