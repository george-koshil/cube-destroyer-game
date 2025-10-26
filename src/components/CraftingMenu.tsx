import { useState } from 'react';
import { Hammer, Bomb, Cog, X } from 'lucide-react';
import { RECIPES, MATERIALS } from '../data/materials';
import { Recipe } from '../types/game';

interface CraftingMenuProps {
  isOpen: boolean;
  onClose: () => void;
  getResourceAmount: (materialId: string) => number;
  onCraft: (recipe: Recipe) => void;
}

export function CraftingMenu({ isOpen, onClose, getResourceAmount, onCraft }: CraftingMenuProps) {
  const [selectedCategory, setSelectedCategory] = useState<'tool' | 'bomb' | 'upgrade'>('tool');

  if (!isOpen) return null;

  const filteredRecipes = RECIPES.filter((r) => r.category === selectedCategory);

  const canCraft = (recipe: Recipe): boolean => {
    return recipe.ingredients.every(
      (ing) => getResourceAmount(ing.materialId) >= ing.amount
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'tool':
        return <Hammer className="w-5 h-5" />;
      case 'bomb':
        return <Bomb className="w-5 h-5" />;
      case 'upgrade':
        return <Cog className="w-5 h-5" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Крафтінг</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex border-b border-gray-700">
          {(['tool', 'bomb', 'upgrade'] as const).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`flex-1 py-4 px-6 font-medium transition-colors flex items-center justify-center gap-2 ${
                selectedCategory === category
                  ? 'bg-gray-700 text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white hover:bg-gray-750'
              }`}
            >
              {getCategoryIcon(category)}
              {category === 'tool' && 'Інструменти'}
              {category === 'bomb' && 'Бомби'}
              {category === 'upgrade' && 'Покращення'}
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRecipes.map((recipe) => {
              const craftable = canCraft(recipe);

              return (
                <div
                  key={recipe.id}
                  className={`bg-gray-900 rounded-lg p-4 border-2 transition-all ${
                    craftable
                      ? 'border-green-500 hover:shadow-lg hover:shadow-green-500/20'
                      : 'border-gray-700 opacity-60'
                  }`}
                >
                  <h3 className="text-lg font-bold text-white mb-2">{recipe.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{recipe.description}</p>

                  <div className="space-y-2 mb-4">
                    <p className="text-xs text-gray-500 uppercase">Потрібно:</p>
                    {recipe.ingredients.map((ing) => {
                      const material = MATERIALS.find((m) => m.id === ing.materialId);
                      const hasEnough = getResourceAmount(ing.materialId) >= ing.amount;

                      return (
                        <div key={ing.materialId} className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded"
                            style={{ backgroundColor: material?.color }}
                          />
                          <span
                            className={`text-sm ${
                              hasEnough ? 'text-green-400' : 'text-red-400'
                            }`}
                          >
                            {material?.name}: {getResourceAmount(ing.materialId)}/{ing.amount}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => craftable && onCraft(recipe)}
                    disabled={!craftable}
                    className={`w-full py-2 rounded font-medium transition-all ${
                      craftable
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {craftable ? 'Створити' : 'Недостатньо ресурсів'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
