import { useState, useEffect } from 'react';
import { Resource, PlayerProgress } from '../types/game';
import { MATERIALS } from '../data/materials';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export function useGameState() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [hammer, setHammer] = useState({ level: 3, power: 100, speed: 10 });
  const [autoMiners, setAutoMiners] = useState(0);
  const [discoveredMaterials, setDiscoveredMaterials] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadProgress();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (autoMiners > 0) {
        autoMine();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [autoMiners, resources]);

  const loadProgress = async () => {
    try {
      const { data, error } = await supabase
        .from('player_progress')
        .select('*')
        .eq('player_id', 'default')
        .maybeSingle();

      if (!error && data) {
        setResources(data.resources || []);
        setHammer(data.hammer || { level: 1, power: 10, speed: 1 });
        setAutoMiners(data.auto_miners || 0);
        setDiscoveredMaterials(new Set(data.discovered_materials || []));
      }
    } catch (err) {
      console.error('Error loading progress:', err);
    }
  };

  const saveProgress = async (progress: Partial<PlayerProgress>) => {
    try {
      const saveData = {
        player_id: 'default',
        resources: progress.resources || resources,
        hammer: progress.hammer || hammer,
        auto_miners: autoMiners,
        discovered_materials: Array.from(discoveredMaterials),
        updated_at: new Date().toISOString(),
      };

      await supabase
        .from('player_progress')
        .upsert(saveData, { onConflict: 'player_id' });
    } catch (err) {
      console.error('Error saving progress:', err);
    }
  };

  const addResource = (materialId: string, amount: number = 1) => {
    setResources((prev) => {
      const existing = prev.find((r) => r.materialId === materialId);
      const newResources = existing
        ? prev.map((r) =>
            r.materialId === materialId ? { ...r, amount: r.amount + amount } : r
          )
        : [...prev, { materialId, amount }];

      saveProgress({ resources: newResources });
      return newResources;
    });

    if (!discoveredMaterials.has(materialId)) {
      setDiscoveredMaterials((prev) => {
        const newSet = new Set(prev);
        newSet.add(materialId);
        return newSet;
      });
    }
  };

  const removeResource = (materialId: string, amount: number): boolean => {
    const resource = resources.find((r) => r.materialId === materialId);
    if (!resource || resource.amount < amount) {
      return false;
    }

    setResources((prev) => {
      const newResources = prev.map((r) =>
        r.materialId === materialId ? { ...r, amount: r.amount - amount } : r
      );
      saveProgress({ resources: newResources });
      return newResources;
    });

    return true;
  };

  const upgradeHammer = () => {
    setHammer((prev) => {
      const newHammer = {
        level: prev.level + 1,
        power: prev.power * 1.5,
        speed: prev.speed * 1.2,
      };
      saveProgress({ hammer: newHammer });
      return newHammer;
    });
  };

  const addAutoMiner = () => {
    setAutoMiners((prev) => prev + 1);
  };

  const autoMine = () => {
    const randomMaterial = MATERIALS[Math.floor(Math.random() * MATERIALS.length)];
    addResource(randomMaterial.id, autoMiners);
  };

  const getResourceAmount = (materialId: string): number => {
    const resource = resources.find((r) => r.materialId === materialId);
    return resource ? resource.amount : 0;
  };

  return {
    resources,
    hammer,
    autoMiners,
    discoveredMaterials,
    addResource,
    removeResource,
    upgradeHammer,
    addAutoMiner,
    getResourceAmount,
  };
}
