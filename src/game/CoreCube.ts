import * as THREE from 'three';
import { MATERIALS, Material } from '../data/materials';

export class CoreCube {
  private group: THREE.Group;
  private cubes: Map<string, { mesh: THREE.Mesh; material: Material; health: number }>;
  private gridSize = 10;

  constructor() {
    this.group = new THREE.Group();
    this.cubes = new Map();
    this.generateCube();
  }

  private generateCube() {
    const cubeSize = 1;
    const spacing = 0.05;
    const totalSize = cubeSize + spacing;
    const offset = ((this.gridSize - 1) * totalSize) / 2;

    for (let x = 0; x < this.gridSize; x++) {
      for (let y = 0; y < this.gridSize; y++) {
        for (let z = 0; z < this.gridSize; z++) {
          const material = this.getRandomMaterial();
          const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
          const materialThree = new THREE.MeshStandardMaterial({
            color: material.color,
            roughness: 0.7,
            metalness: 0.3,
          });

          const mesh = new THREE.Mesh(geometry, materialThree);
          mesh.position.set(
            x * totalSize - offset,
            y * totalSize - offset,
            z * totalSize - offset
          );

          const key = `${x}-${y}-${z}`;
          this.cubes.set(key, { mesh, material, health: material.durability });
          this.group.add(mesh);
        }
      }
    }
  }

  private getRandomMaterial(): Material {
    const rand = Math.random() * 100;
    let cumulative = 0;
    const totalRarity = MATERIALS.reduce((sum, m) => sum + (10 - m.rarity), 0);

    for (const material of MATERIALS) {
      cumulative += ((10 - material.rarity) / totalRarity) * 100;
      if (rand <= cumulative) {
        return material;
      }
    }

    return MATERIALS[0];
  }

  public mineCube(raycaster: THREE.Raycaster, damage: number): Material | null {
    const intersects = raycaster.intersectObjects(this.group.children);

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object as THREE.Mesh;

      for (const [key, cube] of this.cubes.entries()) {
        if (cube.mesh === hitMesh) {
          cube.health -= damage;

          if (cube.health <= 0) {
            this.group.remove(cube.mesh);
            const material = cube.material;
            this.cubes.delete(key);
            return material;
          }

          const healthPercent = cube.health / cube.material.durability;
          (cube.mesh.material as THREE.MeshStandardMaterial).opacity = 0.3 + healthPercent * 0.7;
          (cube.mesh.material as THREE.MeshStandardMaterial).transparent = healthPercent < 1;

          return null;
        }
      }
    }

    return null;
  }

  public getGroup(): THREE.Group {
    return this.group;
  }

  public getRemainingCubes(): number {
    return this.cubes.size;
  }
}
