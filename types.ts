export enum GameState {
  MENU = 'MENU',
  CHAPTER_SELECT = 'CHAPTER_SELECT',
  PLAYING = 'PLAYING',
  SETTINGS = 'SETTINGS',
  CREDITS = 'CREDITS',
  EXIT = 'EXIT',
  GAME_OVER = 'GAME_OVER',
  JUMPSCARE = 'JUMPSCARE'
}

export enum LevelState {
  ROOFTOP = 'ROOFTOP',
  APARTMENT = 'APARTMENT',
  ELECTRICAL = 'ELECTRICAL'
}

export type Language = 'tr' | 'en';

export interface GameSettings {
  sensitivity: number;
  volume: number;
  language: Language;
}

export type ItemType = 'KEY_ROOF' | 'KEY_ROOM' | 'KEY_NEXT_FLOOR' | 'MONEY' | 'WEAPON_CROWBAR' | 'WEAPON_GUN';

export interface InventoryItem {
  type: ItemType;
  // name is now derived from translation, count remains
  count: number;
}