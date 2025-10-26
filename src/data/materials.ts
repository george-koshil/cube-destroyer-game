import { Material, Recipe, Building } from '../types/game';

export const MATERIALS: Material[] = [
  { id: 'stone', name: 'Камінь', color: '#808080', rarity: 1, durability: 10 },
  { id: 'iron', name: 'Залізо', color: '#C0C0C0', rarity: 2, durability: 20 },
  { id: 'gold', name: 'Золото', color: '#FFD700', rarity: 3, durability: 30 },
  { id: 'crystal', name: 'Кристал', color: '#00CED1', rarity: 4, durability: 40 },
  { id: 'mithril', name: 'Міфріл', color: '#E0B0FF', rarity: 5, durability: 50 },
  { id: 'diamond', name: 'Алмаз', color: '#B9F2FF', rarity: 6, durability: 60 },
];

export const RECIPES: Recipe[] = [
  {
    id: 'iron_hammer',
    name: 'Залізний молот',
    description: 'Підвищує силу удару',
    ingredients: [
      { materialId: 'stone', amount: 10 },
      { materialId: 'iron', amount: 5 },
    ],
    result: 'hammer_upgrade',
    category: 'tool',
  },
  {
    id: 'gold_hammer',
    name: 'Золотий молот',
    description: 'Значно підвищує силу удару',
    ingredients: [
      { materialId: 'iron', amount: 20 },
      { materialId: 'gold', amount: 10 },
    ],
    result: 'hammer_upgrade',
    category: 'tool',
  },
  {
    id: 'small_bomb',
    name: 'Мала бомба',
    description: 'Миттєво руйнує частину куба',
    ingredients: [
      { materialId: 'stone', amount: 5 },
      { materialId: 'iron', amount: 3 },
    ],
    result: 'bomb',
    category: 'bomb',
  },
  {
    id: 'auto_miner',
    name: 'Авто-копач',
    description: 'Автоматично видобуває ресурси',
    ingredients: [
      { materialId: 'iron', amount: 15 },
      { materialId: 'crystal', amount: 5 },
    ],
    result: 'auto_miner',
    category: 'upgrade',
  },
];

export const BUILDINGS: Building[] = [
  {
    id: 'house',
    name: 'Будинок',
    description: '+10% швидкість видобутку',
    cost: [
      { materialId: 'stone', amount: 20 },
      { materialId: 'iron', amount: 5 },
    ],
    bonus: { type: 'mineSpeed', value: 0.1 },
  },
  {
    id: 'workshop',
    name: 'Майстерня',
    description: '+1 автоматичний копач',
    cost: [
      { materialId: 'iron', amount: 30 },
      { materialId: 'gold', amount: 10 },
    ],
    bonus: { type: 'autoMine', value: 1 },
  },
  {
    id: 'shrine',
    name: 'Святиня',
    description: '+5% шанс подвійного луту',
    cost: [
      { materialId: 'gold', amount: 20 },
      { materialId: 'crystal', amount: 10 },
    ],
    bonus: { type: 'doubleLoot', value: 0.05 },
  },
];
