import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { CAMERA_POSITION, CAMERA_TARGET, isCat, isRoof, isCutaway, isHeater } from './model-rules';
import type { SensorSource } from './sensors';

export type ViewMode = 'orbit' | 'interior';
type SceneOptions = {
  host: HTMLElement;
  source: SensorSource;
  onLoad: (count: number) => void;
  onError: (message: string) => void;
  onSelect: (name: string | null) => void;
};

export class HouseScene {
  private scene = new THREE.Scene();
  private renderer: THREE.WebGLRenderer;
  private camera = new THREE.PerspectiveCamera(42, 1, 0.005, 30);
  private controls: OrbitControls;
  private model: THREE.Group | null = null;
  private meshes: THREE.Mesh[] = [];
  private view: ViewMode = 'orbit';
  private physicalCamera: THREE.PerspectiveCamera | undefined;
  private roof = true;
  private cutaway = false;
  private exploded = false;
  private catVisible = true;
  private reading;
  private selected: THREE.Mesh | null = null;
  private highlight = new THREE.BoxHelper(new THREE.Object3D(), 0xb3d8ba);
  private unsubscribe: () => void;
  private resizeObserver: ResizeObserver;
  private frame = 0;
  private loadVersion = 0;
  private down = [0, 0];

  constructor(private options: SceneOptions) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.setClearColor(0x242a29);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.domElement.setAttribute('aria-label', 'Interactive Cat House 3D model. Drag to orbit, scroll to zoom.');
    this.renderer.domElement.setAttribute('role', 'img');
    options.host.appendChild(this.renderer.domElement);
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const environment = new RoomEnvironment();
    this.scene.environment = pmrem.fromScene(environment, 0.04).texture;
    environment.dispose(); pmrem.dispose();
    this.scene.add(new THREE.HemisphereLight(0xe5eee4, 0x4c4943, 2));
    const key = new THREE.DirectionalLight(0xffeed6, 4);
    key.position.set(1.4, 2.1, 1.5); key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048); key.shadow.camera.left = -1.4; key.shadow.camera.right = 1.4;
    key.shadow.camera.top = 1.4; key.shadow.camera.bottom = -1.4; key.shadow.bias = -0.0004;
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(0xd7e7ff, 1.2); fill.position.set(-1, 1, -1); this.scene.add(fill);
    const inside = new THREE.PointLight(0xffebcc, 0.6, 1.5, 1.5); inside.position.set(0, 0.35, 0); this.scene.add(inside);
    const ground = new THREE.Mesh(new THREE.CircleGeometry(3, 96), new THREE.MeshStandardMaterial({ color: 0x242a29, roughness: 1 }));
    ground.rotation.x = -Math.PI / 2; ground.position.y = -0.023; ground.receiveShadow = true; this.scene.add(ground);
    this.highlight.visible = false; this.scene.add(this.highlight);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true; this.controls.minDistance = 0.5; this.controls.maxDistance = 3.5;
    this.controls.maxPolarAngle = Math.PI * 0.49;
    this.resetView();
    this.reading = options.source.getSnapshot();
    this.unsubscribe = options.source.subscribe(reading => { this.reading = reading; this.catVisible = reading.catPresent; this.applyModelState(); });
    this.resizeObserver = new ResizeObserver(() => this.resize()); this.resizeObserver.observe(options.host); this.resize();
    this.renderer.domElement.addEventListener('pointerdown', event => { this.down = [event.clientX, event.clientY]; });
    this.renderer.domElement.addEventListener('pointerup', event => {
      if (Math.hypot(event.clientX - this.down[0], event.clientY - this.down[1]) > 5) return;
      const bounds = this.renderer.domElement.getBoundingClientRect();
      const ray = new THREE.Raycaster(); ray.setFromCamera(new THREE.Vector2((event.clientX - bounds.left) / bounds.width * 2 - 1, -(event.clientY - bounds.top) / bounds.height * 2 + 1), this.camera);
      const hit = ray.intersectObjects(this.meshes.filter(mesh => this.isVisible(mesh)), false)[0];
      this.select(hit?.object as THREE.Mesh ?? null);
    });
    this.animate();
    void this.load();
  }

  async load() {
    const version = ++this.loadVersion;
    try {
      const gltf = await new GLTFLoader().loadAsync(`${import.meta.env.BASE_URL}models/cat-house.glb`);
      if (version !== this.loadVersion) return;
      if (this.model) this.scene.remove(this.model);
      this.model = gltf.scene; this.meshes = [];
      this.model.updateMatrixWorld(true);
      this.physicalCamera = gltf.cameras.find(camera => camera.name === 'Sensor_Camera') as THREE.PerspectiveCamera | undefined;
      this.model.traverse(object => {
        if (!(object instanceof THREE.Mesh)) return;
        this.meshes.push(object); object.castShadow = true; object.receiveShadow = true;
        object.userData.originalPosition = object.position.clone();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        const clonedMaterials = materials.map(material => {
          const clone = material.clone();
          if (clone instanceof THREE.MeshStandardMaterial) { clone.envMapIntensity = 0.55; clone.side = THREE.DoubleSide; }
          return clone;
        });
        object.material = Array.isArray(object.material) ? clonedMaterials : clonedMaterials[0];
      });
      if (!this.meshes.length) throw new Error('The asset contains no visible mesh components.');
      this.scene.add(this.model); this.applyModelState(); this.resetView(); this.options.onLoad(this.meshes.length);
    } catch (error) { this.options.onError(error instanceof Error ? error.message : 'Unknown model loading error'); }
  }
  private semanticName(mesh: THREE.Object3D) {
    let object: THREE.Object3D | null = mesh; const parts = [];
    while (object && object !== this.model) { if (object.name) parts.push(object.name); object = object.parent; }
    return parts.join(' ');
  }
  private isVisible(object: THREE.Object3D) { let item: THREE.Object3D | null = object; while (item) { if (!item.visible) return false; item = item.parent; } return true; }
  private applyModelState() {
    this.meshes.forEach(mesh => {
      const name = this.semanticName(mesh);
      mesh.visible = (!isCat(name) || this.catVisible) && (!isRoof(name) || this.roof) && (!(isCutaway(name) && this.cutaway) || this.view === 'interior');
      const original = mesh.userData.originalPosition as THREE.Vector3;
      mesh.position.copy(original);
      if (this.exploded && this.view === 'orbit') {
        if (isRoof(name)) mesh.position.y += 0.24;
        else if (/right insulated wall/i.test(name.replaceAll('_', ' '))) mesh.position.x += 0.16;
        else if (/left insulated wall/i.test(name.replaceAll('_', ' '))) mesh.position.x -= 0.16;
        else if (/front insulated gable|entrance flap/i.test(name.replaceAll('_', ' '))) mesh.position.z += 0.18;
      }
      if (isHeater(name)) {
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach(material => { if (material instanceof THREE.MeshStandardMaterial) { material.emissive.setHex(this.reading.heaterOn ? 0x6a2009 : 0x000000); material.emissiveIntensity = this.reading.heaterOn ? 0.5 : 0; } });
      }
    });
    if (this.selected && !this.isVisible(this.selected)) this.select(null);
  }
  private select(mesh: THREE.Mesh | null) {
    this.selected = mesh; this.highlight.visible = !!mesh;
    if (mesh) this.highlight.setFromObject(mesh);
    this.options.onSelect(mesh ? this.semanticName(mesh).replaceAll('_', ' ').trim() : null);
  }
  setView(view: ViewMode) { this.view = view; this.resetView(); this.applyModelState(); this.select(null); }
  clearSelection() { this.select(null); }
  setRoof(value: boolean) { this.roof = value; this.applyModelState(); }
  setCutaway(value: boolean) { this.cutaway = value; this.applyModelState(); }
  setExploded(value: boolean) { this.exploded = value; this.applyModelState(); }
  resetView() {
    if (this.view === 'interior') {
      this.controls.enabled = false;
      if (this.physicalCamera) {
        this.physicalCamera.getWorldPosition(this.camera.position);
        this.physicalCamera.getWorldQuaternion(this.camera.quaternion);
        this.camera.fov = this.physicalCamera.fov;
        this.camera.near = this.physicalCamera.near;
      } else {
        this.camera.fov = 82;
        this.camera.position.set(...CAMERA_POSITION); this.camera.up.set(0, 1, 0); this.camera.lookAt(...CAMERA_TARGET);
      }
    } else {
      this.controls.enabled = true; this.camera.fov = 42;
      this.camera.position.set(1.05, 0.82, 1.4); this.controls.target.set(0, 0.24, 0); this.controls.update();
    }
    this.camera.updateProjectionMatrix();
  }
  private resize() {
    const { width, height } = this.options.host.getBoundingClientRect(); if (!width || !height) return;
    this.renderer.setSize(width, height); this.camera.aspect = width / height; this.camera.updateProjectionMatrix();
  }
  private animate = () => {
    this.frame = requestAnimationFrame(this.animate);
    if (this.controls.enabled) this.controls.update();
    if (this.selected) this.highlight.update();
    this.renderer.render(this.scene, this.camera);
  };
  dispose() { cancelAnimationFrame(this.frame); this.unsubscribe(); this.resizeObserver.disconnect(); this.controls.dispose(); this.renderer.dispose(); }
}
