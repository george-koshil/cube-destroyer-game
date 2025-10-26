import { useEffect, useRef, useState } from 'react';
import { Hammer, Package, Building, Info } from 'lucide-react';
import { GameScene } from './game/GameScene';
import { useGameState } from './hooks/useGameState';
import { ResourceBar } from './components/ResourceBar';
import { CraftingMenu } from './components/CraftingMenu';
import { BuildingView } from './components/BuildingView';
import { Recipe, Building as BuildingType } from './types/game';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameSceneRef = useRef<GameScene | null>(null);
  const [isHolding, setIsHolding] = useState(false);
  const [isCraftingOpen, setIsCraftingOpen] = useState(false);
  const [isBuildingOpen, setIsBuildingOpen] = useState(false);
  const [placedBuildings, setPlacedBuildings] = useState<
    { buildingId: string; x: number; z: number }[]
  >([]);
  const [cubesRemaining, setCubesRemaining] = useState(1000);
  const [showNewMaterial, setShowNewMaterial] = useState<string | null>(null);

  const {
    resources,
    hammer,
    autoMiners,
    discoveredMaterials,
    addResource,
    removeResource,
    upgradeHammer,
    addAutoMiner,
    getResourceAmount,
  } = useGameState();

  useEffect(() => {
    if (!canvasRef.current) return;

    const gameScene = new GameScene(canvasRef.current);
    gameSceneRef.current = gameScene;

    const animate = () => {
      gameScene.animate();
      setCubesRemaining(gameScene.getRemainingCubes());
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      gameScene.cleanup();
    };
  }, []);

  useEffect(() => {
    if (!isHolding || !gameSceneRef.current) return;

    const interval = setInterval(() => {
      mine();
    }, 1000 / hammer.speed);

    return () => clearInterval(interval);
  }, [isHolding, hammer.speed]);

  const mine = () => {
    if (!gameSceneRef.current) return;

    const material = gameSceneRef.current.mine(hammer.power);
    if (material) {
      const wasDiscovered = discoveredMaterials.has(material.id);
      addResource(material.id);

      if (!wasDiscovered) {
        setShowNewMaterial(material.name);
        setTimeout(() => setShowNewMaterial(null), 3000);
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!gameSceneRef.current) return;
    gameSceneRef.current.updateMousePosition(e.clientX, e.clientY);
    setIsHolding(true);
    mine();
  };

  const handleMouseUp = () => {
    setIsHolding(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!gameSceneRef.current) return;
    gameSceneRef.current.updateMousePosition(e.clientX, e.clientY);
  };

  const handleCraft = (recipe: Recipe) => {
    const canCraft = recipe.ingredients.every(
      (ing) => getResourceAmount(ing.materialId) >= ing.amount
    );

    if (!canCraft) return;

    recipe.ingredients.forEach((ing) => {
      removeResource(ing.materialId, ing.amount);
    });

    if (recipe.result === 'hammer_upgrade') {
      upgradeHammer();
    } else if (recipe.result === 'auto_miner') {
      addAutoMiner();
    } else if (recipe.result === 'bomb') {
      for (let i = 0; i < 10; i++) {
        mine();
      }
    }
  };

  const handleBuild = (building: BuildingType) => {
    const canBuild = building.cost.every(
      (cost) => getResourceAmount(cost.materialId) >= cost.amount
    );

    if (!canBuild) return;

    building.cost.forEach((cost) => {
      removeResource(cost.materialId, cost.amount);
    });

    let x = Math.floor(Math.random() * 8);
    let z = Math.floor(Math.random() * 8);

    while (placedBuildings.some((b) => b.x === x && b.z === z)) {
      x = Math.floor(Math.random() * 8);
      z = Math.floor(Math.random() * 8);
    }

    setPlacedBuildings([...placedBuildings, { buildingId: building.id, x, z }]);

    if (building.bonus.type === 'autoMine') {
      addAutoMiner();
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-900">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseUp}
        className="absolute inset-0 cursor-crosshair"
      />

      <div className="absolute top-4 left-4 bg-gray-800 bg-opacity-90 rounded-lg p-4 shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
          <Hammer className="w-6 h-6 text-blue-400" />
          Core Builder
        </h1>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-gray-400">Рівень молота:</span>
            <span className="text-white font-bold">{hammer.level}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-gray-400">Сила удару:</span>
            <span className="text-white font-bold">{hammer.power.toFixed(1)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-gray-400">Авто-копачі:</span>
            <span className="text-white font-bold">{autoMiners}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-gray-400">Кубів залишилось:</span>
            <span className="text-white font-bold">{cubesRemaining}</span>
          </div>
        </div>
      </div>

      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={() => setIsCraftingOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg"
        >
          <Package className="w-5 h-5" />
          Крафтінг
        </button>
        <button
          onClick={() => setIsBuildingOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg"
        >
          <Building className="w-5 h-5" />
          Місто
        </button>
      </div>

      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="bg-blue-500 bg-opacity-20 rounded-full w-4 h-4 border-2 border-blue-400" />
      </div>

      <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-gray-800 bg-opacity-90 rounded-lg px-4 py-2 flex items-center gap-2">
        <Info className="w-4 h-4 text-blue-400" />
        <span className="text-white text-sm">
          Натискайте на куб, щоб видобувати ресурси
        </span>
      </div>

      {showNewMaterial && (
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-lg shadow-2xl animate-bounce">
          <p className="text-lg font-bold">Відкрито новий матеріал!</p>
          <p className="text-center text-sm">{showNewMaterial}</p>
        </div>
      )}

      <ResourceBar resources={resources} discoveredMaterials={discoveredMaterials} />

      <CraftingMenu
        isOpen={isCraftingOpen}
        onClose={() => setIsCraftingOpen(false)}
        getResourceAmount={getResourceAmount}
        onCraft={handleCraft}
      />

      <BuildingView
        isOpen={isBuildingOpen}
        onClose={() => setIsBuildingOpen(false)}
        getResourceAmount={getResourceAmount}
        onBuild={handleBuild}
        placedBuildings={placedBuildings}
      />
    </div>
  );
}

export default App;
