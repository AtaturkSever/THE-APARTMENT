import { create } from 'zustand';
import { GameState, GameSettings, LevelState, InventoryItem, ItemType, Language } from './types';

// --- TRANSLATIONS ---
export const TRANSLATIONS = {
  tr: {
    // Menu
    menu_play: "OYNA",
    menu_settings: "AYARLAR",
    menu_credits: "YAPIMCILAR",
    menu_exit: "OYUNDAN ÇIK",
    chapter_select: "BÖLÜM SEÇ",
    chapter_1_title: "BÖLÜM 1",
    chapter_1_sub: "SONSUZ DÖNGÜ",
    chapter_2_title: "BÖLÜM 2",
    chapter_2_sub: "BODRUM (KİLİTLİ)",
    chapter_3_title: "BÖLÜM 3",
    chapter_3_sub: "ÇATI KATI (KİLİTLİ)",
    back: "GERİ DÖN",
    settings_title: "AYARLAR",
    sensitivity: "HASSASİYET",
    volume: "SES",
    language: "DİL / LANGUAGE",
    credits_title: "YAPIMCILAR",
    exit_screen_msg: "ARKANA BAKMA...",
    return_menu: "MENÜYE DÖN",
    game_over_title: "GEBERDİN",
    game_over_sub: "AĞLA😂🫵",
    try_again: "TEKRAR DENE",
    
    // Game UI
    rooftop: "ÇATI KATI",
    floor: "KAT",
    electrical_room: "ELEKTRİK DAİRESİ",
    task_cable: "Görev: Kabloları Tamir Et",
    inventory: "Envanter:",
    inventory_empty: "Boş",
    interact: "ETKİLEŞİM",
    exit: "ÇIKIŞ",
    stairs_down: "MERDİVENLER (ALT KAT)",
    ghost_name: "HAYALET",
    monkey_name: "ZİLLİ MAYMUN",
    cable_box: "KABLO KUTUSU",
    
    // Notifications & Interactions
    found_roof_key: "ANAHTAR BULUNDU: ÇATI KAPISI",
    door_opening: "KAPI AÇILIYOR...",
    locked_need_key: "KİLİTLİ! Anahtarı bulmalısın.",
    room_opened: "DAİRE AÇILDI.",
    room_locked: "KİLİTLİ. Anahtar lazım.",
    drawer_searched: "Buraya zaten baktın.",
    drawer_empty: "Boş...",
    found_room_key: "Daire Anahtarı Buldun.",
    cable_fixed: "KABLO TAMİR EDİLDİ",
    escape_success: "KAÇIŞ BAŞARILI!",
    fix_first: "ÖNCE ELEKTRİKLERİ TAMİR ET!",
    floor_descended: "ALT KATA İNDİN",

    // Items
    item_KEY_ROOF: "Çatı Anahtarı",
    item_KEY_ROOM: "Daire Anahtarı",
    item_KEY_NEXT_FLOOR: "Alt Kat Anahtarı",
    item_MONEY: "Para",
    item_WEAPON_CROWBAR: "Levye",
    item_WEAPON_GUN: "Tabanca"
  },
  en: {
    // Menu
    menu_play: "PLAY",
    menu_settings: "SETTINGS",
    menu_credits: "CREDITS",
    menu_exit: "EXIT GAME",
    chapter_select: "SELECT CHAPTER",
    chapter_1_title: "CHAPTER 1",
    chapter_1_sub: "INFINITE LOOP",
    chapter_2_title: "CHAPTER 2",
    chapter_2_sub: "BASEMENT (LOCKED)",
    chapter_3_title: "CHAPTER 3",
    chapter_3_sub: "ROOFTOP (LOCKED)",
    back: "GO BACK",
    settings_title: "SETTINGS",
    sensitivity: "SENSITIVITY",
    volume: "VOLUME",
    language: "LANGUAGE / DİL",
    credits_title: "CREDITS",
    exit_screen_msg: "DON'T LOOK BEHIND YOU...",
    return_menu: "RETURN TO MENU",
    game_over_title: "YOU DIED",
    game_over_sub: "CRY ABOUT IT😂🫵",
    try_again: "TRY AGAIN",

    // Game UI
    rooftop: "ROOFTOP",
    floor: "FLOOR",
    electrical_room: "ELECTRICAL ROOM",
    task_cable: "Task: Fix Cables",
    inventory: "Inventory:",
    inventory_empty: "Empty",
    interact: "INTERACT",
    exit: "EXIT",
    stairs_down: "STAIRS (DOWN)",
    ghost_name: "GHOST",
    monkey_name: "CYMBAL MONKEY",
    cable_box: "CABLE BOX",

    // Notifications & Interactions
    found_roof_key: "KEY FOUND: ROOF DOOR",
    door_opening: "DOOR OPENING...",
    locked_need_key: "LOCKED! You need the key.",
    room_opened: "ROOM OPENED.",
    room_locked: "LOCKED. Need key.",
    drawer_searched: "Already searched here.",
    drawer_empty: "Empty...",
    found_room_key: "Found Room Key.",
    cable_fixed: "CABLE FIXED",
    escape_success: "ESCAPE SUCCESSFUL!",
    fix_first: "FIX ELECTRICITY FIRST!",
    floor_descended: "DESCENDED TO FLOOR",

    // Items
    item_KEY_ROOF: "Roof Key",
    item_KEY_ROOM: "Room Key",
    item_KEY_NEXT_FLOOR: "Next Floor Key",
    item_MONEY: "Money",
    item_WEAPON_CROWBAR: "Crowbar",
    item_WEAPON_GUN: "Gun"
  }
};

interface StoreState {
  gameState: GameState;
  levelState: LevelState;
  floor: number;
  settings: GameSettings;
  inventory: InventoryItem[];
  notification: string | null;
  cablesFixed: number;
  
  // Actions
  setGameState: (state: GameState) => void;
  setLevelState: (level: LevelState) => void;
  nextFloor: () => void;
  resetGame: () => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  addItem: (type: ItemType) => void; // Removed name param, strictly type based
  hasItem: (type: ItemType) => boolean;
  removeItem: (type: ItemType) => void;
  showNotification: (msg: string) => void;
  fixCable: () => void;
  
  // Helper
  t: (key: keyof typeof TRANSLATIONS.tr) => string;
}

export const useStore = create<StoreState>((set, get) => ({
  gameState: GameState.MENU,
  levelState: LevelState.ROOFTOP,
  floor: 1,
  settings: {
    sensitivity: 1.0,
    volume: 0.8,
    language: 'tr', // Default
  },
  inventory: [],
  notification: null,
  cablesFixed: 0,

  setGameState: (state) => set({ gameState: state }),
  setLevelState: (level) => set({ levelState: level }),
  
  nextFloor: () => set((state) => {
    const nextF = state.floor + 1;
    const nextLevel = nextF === 20 ? LevelState.ELECTRICAL : LevelState.APARTMENT;
    return { floor: nextF, levelState: nextLevel };
  }),

  resetGame: () => set({ 
    gameState: GameState.MENU, 
    levelState: LevelState.ROOFTOP, 
    floor: 1, 
    inventory: [], 
    cablesFixed: 0 
  }),
  
  updateSettings: (newSettings) => 
    set((state) => ({ settings: { ...state.settings, ...newSettings } })),

  addItem: (type) => set((state) => {
    const existing = state.inventory.find(i => i.type === type);
    if (existing) {
      return {
        inventory: state.inventory.map(i => 
          i.type === type ? { ...i, count: i.count + 1 } : i
        )
      };
    }
    return { inventory: [...state.inventory, { type, count: 1 }] };
  }),

  hasItem: (type) => {
    return get().inventory.some(i => i.type === type && i.count > 0);
  },

  removeItem: (type) => set((state) => ({
    inventory: state.inventory.map(i => 
      i.type === type ? { ...i, count: i.count - 1 } : i
    ).filter(i => i.count > 0)
  })),

  showNotification: (msg) => {
    set({ notification: msg });
    setTimeout(() => set({ notification: null }), 3000);
  },

  fixCable: () => set((state) => ({ cablesFixed: state.cablesFixed + 1 })),

  t: (key) => {
    const lang = get().settings.language;
    return TRANSLATIONS[lang][key] || key;
  }
}));