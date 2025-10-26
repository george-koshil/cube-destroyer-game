import * as THREE from 'three';
import { CoreCube } from './CoreCube';

export class GameScene {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private coreCube: CoreCube;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private particles: THREE.Points[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(15, 15, 15);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.setupLights();

    this.coreCube = new CoreCube();
    this.scene.add(this.coreCube.getGroup());

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  private setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(10, 10, 10);
    this.scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-10, -10, -10);
    this.scene.add(directionalLight2);
  }

  private onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  public updateMousePosition(x: number, y: number) {
    this.mouse.x = (x / window.innerWidth) * 2 - 1;
    this.mouse.y = -(y / window.innerHeight) * 2 + 1;
  }

  public mine(damage: number) {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const material = this.coreCube.mineCube(this.raycaster, damage);

    if (material) {
      this.createParticles(material.color);
      return material;
    }

    return null;
  }

  private createParticles(color: string) {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const velocities = [];

    for (let i = 0; i < 20; i++) {
      positions.push(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      );
      velocities.push(
        (Math.random() - 0.5) * 0.1,
        Math.random() * 0.1,
        (Math.random() - 0.5) * 0.1
      );
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));

    const material = new THREE.PointsMaterial({
      color: color,
      size: 0.2,
      transparent: true,
      opacity: 1,
    });

    const points = new THREE.Points(geometry, material);

    const intersects = this.raycaster.intersectObjects(this.coreCube.getGroup().children);
    if (intersects.length > 0) {
      points.position.copy(intersects[0].point);
    }

    this.scene.add(points);
    this.particles.push(points);
  }

  public rotateCube(deltaX: number) {
    this.coreCube.getGroup().rotation.y += deltaX * 0.01;
  }

  public animate() {
    this.coreCube.getGroup().rotation.y += 0.001;

    this.particles = this.particles.filter((particle) => {
      const positions = particle.geometry.attributes.position;
      const velocities = particle.geometry.attributes.velocity;
      let removeParticle = false;

      for (let i = 0; i < positions.count; i++) {
        positions.setY(i, positions.getY(i) + velocities.getY(i));
        positions.setX(i, positions.getX(i) + velocities.getX(i));
        positions.setZ(i, positions.getZ(i) + velocities.getZ(i));
      }

      positions.needsUpdate = true;

      (particle.material as THREE.PointsMaterial).opacity -= 0.02;

      if ((particle.material as THREE.PointsMaterial).opacity <= 0) {
        this.scene.remove(particle);
        removeParticle = true;
      }

      return !removeParticle;
    });

    this.renderer.render(this.scene, this.camera);
  }

  public getRemainingCubes(): number {
    return this.coreCube.getRemainingCubes();
  }

  public cleanup() {
    window.removeEventListener('resize', this.onWindowResize.bind(this));
    this.renderer.dispose();
  }
}
