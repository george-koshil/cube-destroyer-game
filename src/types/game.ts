export interface Material {
  id: string;
  name: string;
  color: string;
  rarity: number;
  durability: number;
}

export interface Resource {
  materialId: string;
  amount: number;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: { materialId: string; amount: number }[];
  result: string;
  category: 'tool' | 'bomb' | 'upgrade';
}

export interface Building {
  id: string;
  name: string;
  description: string;
  cost: { materialId: string; amount: number }[];
  bonus: {
    type: 'autoMine' | 'mineSpeed' | 'doubleLoot';
    value: number;
  };
}

export interface PlayerProgress {
  resources: Resource[];
  hammer: {
    level: number;
    power: number;
    speed: number;
  };
  autoMiners: number;
  buildings: { buildingId: string; x: number; z: number }[];
  cubeHealth: number;
}
