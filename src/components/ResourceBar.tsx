import { Resource } from '../types/game';
import { MATERIALS } from '../data/materials';

interface ResourceBarProps {
  resources: Resource[];
  discoveredMaterials: Set<string>;
}

export function ResourceBar({ resources, discoveredMaterials }: ResourceBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-gray-800 border-t-2 border-gray-700 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {MATERIALS.map((material) => {
            const resource = resources.find((r) => r.materialId === material.id);
            const amount = resource ? resource.amount : 0;
            const discovered = discoveredMaterials.has(material.id);

            if (!discovered && amount === 0) {
              return (
                <div
                  key={material.id}
                  className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg opacity-50"
                >
                  <div className="w-8 h-8 rounded bg-gray-700 flex items-center justify-center text-gray-500">
                    ?
                  </div>
                  <span className="text-gray-500 text-sm font-medium">???</span>
                </div>
              );
            }

            return (
              <div
                key={material.id}
                className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg hover:bg-gray-750 transition-all transform hover:scale-105"
              >
                <div
                  className="w-8 h-8 rounded shadow-lg"
                  style={{
                    backgroundColor: material.color,
                    boxShadow: `0 0 10px ${material.color}40`,
                  }}
                />
                <div className="flex flex-col">
                  <span className="text-white text-sm font-medium">{material.name}</span>
                  <span className="text-gray-400 text-xs">{amount}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
