import { useState } from 'react';
import { X, Home, Wrench, Sparkles } from 'lucide-react';
import { BUILDINGS, MATERIALS } from '../data/materials';
import { Building } from '../types/game';

interface BuildingViewProps {
  isOpen: boolean;
  onClose: () => void;
  getResourceAmount: (materialId: string) => number;
  onBuild: (building: Building) => void;
  placedBuildings: { buildingId: string; x: number; z: number }[];
}

export function BuildingView({
  isOpen,
  onClose,
  getResourceAmount,
  onBuild,
  placedBuildings,
}: BuildingViewProps) {
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);

  if (!isOpen) return null;

  const canBuild = (building: Building): boolean => {
    return building.cost.every((cost) => getResourceAmount(cost.materialId) >= cost.amount);
  };

  const getBuildingIcon = (buildingId: string) => {
    switch (buildingId) {
      case 'house':
        return <Home className="w-8 h-8" />;
      case 'workshop':
        return <Wrench className="w-8 h-8" />;
      case 'shrine':
        return <Sparkles className="w-8 h-8" />;
      default:
        return <Home className="w-8 h-8" />;
    }
  };

  const getBonusText = (building: Building): string => {
    switch (building.bonus.type) {
      case 'mineSpeed':
        return `+${building.bonus.value * 100}% швидкість`;
      case 'autoMine':
        return `+${building.bonus.value} авто-копач`;
      case 'doubleLoot':
        return `+${building.bonus.value * 100}% шанс х2`;
      default:
        return '';
    }
  };

  const getBuildingCount = (buildingId: string): number => {
    return placedBuildings.filter((b) => b.buildingId === buildingId).length;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-2xl max-w-5xl w-full mx-4 max-h-[85vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Будівництво міста</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Доступні будівлі</h3>
            <div className="space-y-3">
              {BUILDINGS.map((building) => {
                const buildable = canBuild(building);
                const count = getBuildingCount(building.id);

                return (
                  <div
                    key={building.id}
                    onClick={() => setSelectedBuilding(building)}
                    className={`bg-gray-900 rounded-lg p-4 border-2 cursor-pointer transition-all ${
                      selectedBuilding?.id === building.id
                        ? 'border-blue-500'
                        : buildable
                        ? 'border-green-500 hover:border-green-400'
                        : 'border-gray-700 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-blue-400">{getBuildingIcon(building.id)}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white font-bold">{building.name}</h4>
                          {count > 0 && (
                            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                              x{count}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{building.description}</p>
                        <p className="text-green-400 text-sm font-medium mb-3">
                          {getBonusText(building)}
                        </p>
                        <div className="space-y-1">
                          {building.cost.map((cost) => {
                            const material = MATERIALS.find((m) => m.id === cost.materialId);
                            const hasEnough = getResourceAmount(cost.materialId) >= cost.amount;

                            return (
                              <div key={cost.materialId} className="flex items-center gap-2">
                                <div
                                  className="w-4 h-4 rounded"
                                  style={{ backgroundColor: material?.color }}
                                />
                                <span
                                  className={`text-xs ${
                                    hasEnough ? 'text-green-400' : 'text-red-400'
                                  }`}
                                >
                                  {getResourceAmount(cost.materialId)}/{cost.amount}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Місто</h3>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700 min-h-[400px]">
              <div className="grid grid-cols-8 gap-1">
                {Array.from({ length: 64 }, (_, i) => {
                  const x = i % 8;
                  const z = Math.floor(i / 8);
                  const building = placedBuildings.find((b) => b.x === x && b.z === z);

                  return (
                    <div
                      key={i}
                      className={`aspect-square rounded border transition-all ${
                        building
                          ? 'bg-blue-600 border-blue-400'
                          : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                      }`}
                      title={building ? BUILDINGS.find((b) => b.id === building.buildingId)?.name : ''}
                    >
                      {building && (
                        <div className="w-full h-full flex items-center justify-center text-white text-xs">
                          {getBuildingIcon(building.buildingId)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {selectedBuilding && canBuild(selectedBuilding) && (
                <button
                  onClick={() => {
                    onBuild(selectedBuilding);
                    setSelectedBuilding(null);
                  }}
                  className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-3 rounded font-medium transition-colors"
                >
                  Побудувати {selectedBuilding.name}
                </button>
              )}
            </div>

            <div className="mt-4 bg-gray-900 rounded-lg p-4 border border-gray-700">
              <h4 className="text-white font-semibold mb-2">Активні бонуси:</h4>
              <div className="space-y-1 text-sm">
                {BUILDINGS.map((building) => {
                  const count = getBuildingCount(building.id);
                  if (count === 0) return null;

                  return (
                    <div key={building.id} className="text-green-400">
                      {building.name} x{count}: {getBonusText(building)}
                    </div>
                  );
                })}
                {placedBuildings.length === 0 && (
                  <p className="text-gray-500">Поки що немає будівель</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
