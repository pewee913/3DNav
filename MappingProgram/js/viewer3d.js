/**
 * 3D Campus Building Viewer
 * Built on Three.js with OrbitControls, Raycasting, Smooth Camera Tweening,
 * and Custom GLTF / GLB Model Loading capabilities.
 */

class BuildingViewer {
  constructor(containerId, roomsData) {
    this.container = document.getElementById(containerId);
    this.roomsData = roomsData || [];
    this.customModel = null;
    this.isCustomModelActive = false;
    this.currentFloor = 'all';
    this.isExploded = false;
    this.selectedRoomId = null;
    this.isInspectorMode = false;
    this.floorsData = [];
    this.buildingBounds = null;
    this.isGridVisible = true;

    // Raycasting, Touch & Hover
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.hoveredObject = null;
    this.lastTouchTime = 0;

    this.initScene();
    this.initLights();
    this.initControls();
    this.initBuilding();
    this.loadFloorsData();
    this.initEventListeners();
    this.animate();

    // Check if user has already placed a model in assets/models/building.glb
    this.checkDefaultModelPath();
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0f1d); // Sleek deep space campus backdrop
    this.scene.fog = new THREE.FogExp2(0x0a0f1d, 0.008);

    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    const aspect = width / height;

    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.5, 1000);
    // On mobile portrait screens (aspect < 1), position camera back so the full building fits comfortably
    const defaultZ = aspect < 1 ? Math.min(Math.max(48 / (0.828 * aspect), 75), 110) : 65;
    this.defaultCameraPos = new THREE.Vector3(0, 18, defaultZ); // Direct front POV
    this.defaultTargetPos = new THREE.Vector3(0, 7, 0);

    this.camera.position.copy(this.defaultCameraPos);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    this.container.appendChild(this.renderer.domElement);

    // Initial resize trigger to sync layout
    setTimeout(() => this.onWindowResize(), 150);
  }

  initLights() {
    // Ambient soft fill light
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    this.scene.add(this.ambientLight);

    // Main directional sunlight with soft shadows
    this.sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    this.sunLight.position.set(40, 60, 40);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 160;
    this.sunLight.shadow.camera.left = -40;
    this.sunLight.shadow.camera.right = 40;
    this.sunLight.shadow.camera.top = 40;
    this.sunLight.shadow.camera.bottom = -40;
    this.sunLight.shadow.bias = -0.0005;
    this.scene.add(this.sunLight);

    // Cyan / Indigo architectural accent backlight
    const backLight = new THREE.DirectionalLight(0x38bdf8, 0.6);
    backLight.position.set(-30, 20, -30);
    this.scene.add(backLight);

    // Warm entrance spotlight
    const spotLight = new THREE.SpotLight(0xf59e0b, 1.2, 50, Math.PI / 4, 0.5);
    spotLight.position.set(0, 15, 20);
    this.scene.add(spotLight);
  }

  setTheme(theme = 'dark') {
    this.currentTheme = theme;
    if (!this.scene) return;

    if (theme === 'light') {
      const lightBg = new THREE.Color(0xf1f5f9);
      this.scene.background = lightBg;
      if (this.scene.fog) {
        this.scene.fog.color = lightBg;
        this.scene.fog.density = 0.005;
      }
      if (this.ambientLight) this.ambientLight.intensity = 0.95;
      if (this.sunLight) this.sunLight.intensity = 1.35;
    } else {
      const darkBg = new THREE.Color(0x0a0f1d);
      this.scene.background = darkBg;
      if (this.scene.fog) {
        this.scene.fog.color = darkBg;
        this.scene.fog.density = 0.008;
      }
      if (this.ambientLight) this.ambientLight.intensity = 0.75;
      if (this.sunLight) this.sunLight.intensity = 1.2;
    }

    // Adapt ground grid lines to active theme
    if (this.gridGroup) {
      this.updateGridTheme(theme);
    }
  }

  initGridPlane() {
    if (this.gridGroup) {
      this.scene.remove(this.gridGroup);
    }

    this.gridGroup = new THREE.Group();
    this.gridGroup.name = 'CampusBackgroundGrid';

    const isLight = (this.currentTheme === 'light');
    const centerLineColor = isLight ? 0x0284c7 : 0x06b6d4; // Vibrant blueprint center accent
    const gridLineColor = isLight ? 0x94a3b8 : 0x1e293b;   // Architectural grid lines

    // High-tech blueprint grid (240x240 units, 96 cells)
    this.gridHelper = new THREE.GridHelper(240, 96, centerLineColor, gridLineColor);
    this.gridHelper.position.set(0, -0.02, 0);
    this.gridHelper.renderOrder = 0;
    this.gridGroup.add(this.gridHelper);

    // Subtle receiving ground plane
    const groundGeo = new THREE.PlaneGeometry(300, 300);
    const groundMat = new THREE.MeshStandardMaterial({
      color: isLight ? 0xe2e8f0 : 0x070c18,
      roughness: 0.9,
      metalness: 0.05,
      depthWrite: false
    });
    this.groundPlaneMesh = new THREE.Mesh(groundGeo, groundMat);
    this.groundPlaneMesh.rotation.x = -Math.PI / 2;
    this.groundPlaneMesh.position.set(0, -0.05, 0);
    this.groundPlaneMesh.receiveShadow = true;
    this.gridGroup.add(this.groundPlaneMesh);

    // Read stored user preference
    const savedOption = localStorage.getItem('app-grid-visible');
    this.isGridVisible = (savedOption !== 'false');
    this.gridGroup.visible = this.isGridVisible;

    if (this.buildingBounds) {
      const center = this.buildingBounds.getCenter(new THREE.Vector3());
      this.gridGroup.position.set(center.x, this.buildingBounds.min.y, center.z);
    } else {
      this.gridGroup.position.set(55, 0, 0);
    }

    this.scene.add(this.gridGroup);
  }

  updateGridTheme(theme = 'dark') {
    const isLight = (theme === 'light');
    if (this.gridGroup) {
      this.initGridPlane();
    }
  }

  toggleGrid() {
    return this.setGridVisible(!this.isGridVisible);
  }

  setGridVisible(visible) {
    this.isGridVisible = visible;
    if (this.gridGroup) {
      this.gridGroup.visible = visible;
    }
    localStorage.setItem('app-grid-visible', visible ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent('grid-visibility-changed', { detail: { visible } }));
    return this.isGridVisible;
  }

  initControls() {
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.target.copy(this.defaultTargetPos);

    // Zoom limits:
    // Max zoom in: 14.5 units distance (comfortably frames at least 2 adjacent rooms)
    this.controls.minDistance = 14.5;
    // Max zoom out: 48.0 units (entire building in full view)
    this.controls.maxDistance = 48.0;

    // Permanently lock to front view
    this.isRotationLocked = true;
    this.applyRotationLock(true);
  }

  applyRotationLock(isLocked = true) {
    this.isRotationLocked = true;
    if (this.controls) {
      // Permanent front elevation lock (no tumbling or twisting)
      this.controls.enableRotate = false;
      // Restrict viewing angle: never look from underneath the building or far into sky
      this.controls.minPolarAngle = Math.PI / 2 - 0.25;
      this.controls.maxPolarAngle = Math.PI / 2;
      this.controls.minAzimuthAngle = -Infinity;
      this.controls.maxAzimuthAngle = Infinity;

      // Enable screen-space panning to glide left/right and up/down across the front facade
      this.controls.enablePan = true;
      this.controls.screenSpacePanning = true;
      this.controls.mouseButtons = {
        LEFT: THREE.MOUSE.PAN,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN
      };
      this.controls.touches = {
        ONE: THREE.TOUCH.PAN,
        TWO: THREE.TOUCH.DOLLY_PAN
      };
    }
  }

  initBuilding() {
    this.generator = new BuildingGenerator(this.scene);
    this.buildingGroup = this.generator.generateBuilding(this.roomsData);
    this.buildingBounds = new THREE.Box3().setFromObject(this.buildingGroup);
    this.initGridPlane();
  }

  initEventListeners() {
    window.addEventListener('resize', () => this.onWindowResize());

    const canvas = this.renderer.domElement;
    canvas.addEventListener('mousemove', (e) => this.onPointerMove(e));
    
    // Mouse click handling
    canvas.addEventListener('click', (e) => {
      // Discard synthetic mouse click immediately following a touch tap
      if (Date.now() - this.lastTouchTime < 600) return;
      this.handleInteraction(e.clientX, e.clientY);
    });

    // Touch tap detection for mobile touchscreens (differentiates tap from pan/zoom)
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let isTouchDrag = false;

    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
        isTouchDrag = false;
      } else {
        isTouchDrag = true;
      }
    }, { passive: true });

    canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1 && !isTouchDrag) {
        const dx = e.touches[0].clientX - touchStartX;
        const dy = e.touches[0].clientY - touchStartY;
        if (Math.hypot(dx, dy) > 8) {
          isTouchDrag = true;
        }
      } else {
        isTouchDrag = true;
      }
    }, { passive: true });

    canvas.addEventListener('touchend', (e) => {
      if (!isTouchDrag && e.changedTouches.length === 1) {
        const duration = Date.now() - touchStartTime;
        if (duration < 350) {
          const touch = e.changedTouches[0];
          this.lastTouchTime = Date.now();
          this.handleInteraction(touch.clientX, touch.clientY);
        }
      }
    }, { passive: true });
  }

  onWindowResize() {
    if (!this.container) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    if (width === 0 || height === 0) return;
    const aspect = width / height;
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);

    // Update default camera Z for portrait vs landscape
    const defaultZ = aspect < 1 ? Math.min(Math.max(48 / (0.828 * aspect), 75), 110) : 65;
    this.defaultCameraPos.set(0, 18, defaultZ);
  }

  onPointerMove(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Raycast for hover
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const targets = this.isCustomModelActive && this.customModel 
      ? [this.customModel, this.scene] 
      : this.buildingGroup.children;
    const intersects = this.raycaster.intersectObjects(targets, true);

    const hit = intersects.find(item => {
      if (item.object.userData?.isMarker) {
        return item.object.visible && (!item.object.material || item.object.material.opacity > 0.15);
      }
      return item.object.userData?.isRoom;
    });

    if (hit) {
      document.body.style.cursor = 'pointer';
      const roomId = hit.object.userData.roomId;
      if (roomId && this.hoveredObject !== roomId) {
        this.hoveredObject = roomId;
        this.dispatchRoomHover(roomId);
      }
    } else {
      document.body.style.cursor = 'default';
      if (this.hoveredObject) {
        this.hoveredObject = null;
        this.dispatchRoomHover(null);
      }
    }
  }

  handleInteraction(clientX, clientY) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const targets = this.isCustomModelActive && this.customModel 
      ? [this.customModel, this.scene] 
      : this.buildingGroup.children;
    const intersects = this.raycaster.intersectObjects(targets, true);

    // If Inspector Mode is active, pick coordinates of clicked point
    if (this.isInspectorMode && intersects.length > 0) {
      const hitPoint = intersects[0].point;
      const meshName = intersects[0].object.name || 'Unnamed Mesh';
      const coords = {
        x: Math.round(hitPoint.x * 10) / 10,
        y: Math.round(hitPoint.y * 10) / 10,
        z: Math.round(hitPoint.z * 10) / 10
      };
      const event = new CustomEvent('inspector-coords-picked', {
        detail: { coords, meshName }
      });
      window.dispatchEvent(event);
      return;
    }

    const hit = intersects.find(item => {
      if (item.object.userData?.isMarker) {
        return item.object.visible && (!item.object.material || item.object.material.opacity > 0.15);
      }
      return item.object.userData?.isRoom;
    });

    if (hit && hit.object.userData?.roomId) {
      const roomId = hit.object.userData.roomId;
      this.focusRoom(roomId);
      this.dispatchRoomSelect(roomId);
    } else {
      window.dispatchEvent(new CustomEvent('canvas-empty-clicked'));
    }
  }

  onPointerClick(event) {
    if (Date.now() - this.lastTouchTime < 600) return;
    this.handleInteraction(event.clientX, event.clientY);
  }

  dispatchRoomSelect(roomId) {
    const event = new CustomEvent('room-selected', { detail: { roomId } });
    window.dispatchEvent(event);
  }

  dispatchRoomHover(roomId) {
    const event = new CustomEvent('room-hovered', { detail: { roomId } });
    window.dispatchEvent(event);
  }

  // Smooth camera zoom and focus on chosen room
  focusRoom(roomId, drawPath = true) {
    this.selectedRoomId = roomId;
    const room = this.roomsData.find(r => r.id === roomId);
    if (!room) return;

    // Highlight room in 3D
    this.generator.highlightRoom(roomId);

    // If floor is hidden, make sure room's floor is visible
    if (this.currentFloor !== 'all' && parseInt(this.currentFloor) !== room.floor) {
      this.isolateFloor(room.floor);
    }

    // If custom model is active and this room coordinates are still from the old placeholder, skip camera glide to empty space
    if (this.isCustomModelActive && room.coordinates && room.coordinates.x < 40) {
      return;
    }

    // Ensure no old placeholder pipe exists in the scene
    if (this.generator.pathLine) {
      this.scene.remove(this.generator.pathLine);
      this.generator.pathLine = null;
    }
    // Only draw procedural path if custom model is NOT active
    if (drawPath && !this.isCustomModelActive) {
      this.generator.drawNavigationPath(room);
    }

    // Animate camera to focus on room from straight in front of the building
    const targetY = (room.coordinates.y !== undefined && this.isCustomModelActive)
      ? room.coordinates.y + 0.4
      : (room.floor - 1) * this.generator.floorHeight + 1.2;
    const focusZ = (room.coordinates && room.coordinates.z !== undefined)
      ? room.coordinates.z
      : (this.isCustomModelActive ? -6.6 : 0);
    
    // Front POV: Elevate target lookAt so the room pin appears in the bottom middle below the floating card
    const targetLookAt = new THREE.Vector3(room.coordinates.x, targetY + 2.2, focusZ);
    
    // Stationed straight in front of the room pin on the X-axis (centered horizontally with zero skew)
    const isMobile = window.innerWidth < 640;
    const cameraDist = this.isCustomModelActive 
      ? (isMobile ? 22.0 : 18.0) 
      : (isMobile ? 38.0 : 32.0);
    const targetCameraPos = new THREE.Vector3(
      room.coordinates.x,
      targetY + 2.2,
      this.isCustomModelActive ? (focusZ - cameraDist) : (focusZ + cameraDist)
    );

    this.tweenCamera(targetCameraPos, targetLookAt, 1000);
  }

  tweenCamera(targetPos, targetLookAt, duration = 1000) {
    const startPos = this.camera.position.clone();
    const startTarget = this.controls.target.clone();
    const startTime = performance.now();

    const animateTransition = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Smooth cubic ease out
      const ease = 1 - Math.pow(1 - progress, 3);

      this.camera.position.lerpVectors(startPos, targetPos, ease);
      this.controls.target.lerpVectors(startTarget, targetLookAt, ease);
      this.controls.update();

      if (progress < 1) {
        requestAnimationFrame(animateTransition);
      }
    };

    requestAnimationFrame(animateTransition);
  }

  // Camera presets
  setPresetView(viewType) {
    switch (viewType) {
      case '3d': // Default perspective
        this.tweenCamera(this.defaultCameraPos, this.defaultTargetPos, 900);
        break;
      case 'top': // Top-down architectural plan
        this.tweenCamera(new THREE.Vector3(0, 75, 0.1), new THREE.Vector3(0, 7, 0), 900);
        break;
      case 'front': // Front elevation POV
        if (this.isCustomModelActive && this.customModel) {
          const box = new THREE.Box3().setFromObject(this.customModel);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          const aspect = this.camera.aspect || 1.6;
          const dist = Math.min(Math.max((size.x / 2) / (Math.tan((this.camera.fov * Math.PI / 180) / 2) * aspect) * 0.95, 22), 40);
          this.tweenCamera(new THREE.Vector3(center.x, center.y + 1.2, center.z - dist), center, 900);
        } else {
          this.tweenCamera(new THREE.Vector3(0, 15, 65), new THREE.Vector3(0, 8, 0), 900);
        }
        break;
      case 'iso': // True isometric
        this.tweenCamera(new THREE.Vector3(50, 45, 50), new THREE.Vector3(0, 7, 0), 900);
        break;
      case 'reset':
        this.generator.resetHighlights();
        this.selectedRoomId = null;
        if (this.isCustomModelActive && this.customModel) {
          this.fitCameraToObject(this.customModel);
        } else {
          this.tweenCamera(this.defaultCameraPos, this.defaultTargetPos, 900);
        }
        break;
    }
  }

  // Floor Isolation: High opacity for selected floor, low opacity (0.15) for other floors
  isolateFloor(floor) {
    this.currentFloor = floor;

    if (this.isCustomModelActive && this.customModel) {
      this.applyCustomModelFloorOpacity(floor);
    } else {
      this.generator.isolateFloor(floor);
      if (floor !== 'all') {
        const floorY = (parseInt(floor) - 1) * this.generator.floorHeight + 2;
        const lookAt = new THREE.Vector3(0, floorY, 0);
        const camPos = new THREE.Vector3(0, floorY + 6, 32);
        this.tweenCamera(camPos, lookAt, 800);
      }
    }
  }

  applyCustomModelFloorOpacity(floor) {
    if (!this.customModel) return;

    if (floor === 'all') {
      // Restore all floors to 100% solid opacity
      this.customModel.traverse(child => {
        if (child.isMesh && child.material) {
          child.visible = true;
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach(mat => {
            mat.transparent = false;
            mat.opacity = 1.0;
            mat.depthWrite = true;
          });
        }
      });

      // Restore camera overview
      this.fitCameraToObject(this.customModel);
      return;
    }

    const targetFloorNum = parseInt(floor);
    const floorDef = (this.floorsData || []).find(f => f.floor === targetFloorNum) || {
      floor: targetFloorNum,
      yMin: (targetFloorNum === 1 ? -5.0 : targetFloorNum === 2 ? 2.8 : 5.8),
      yMax: (targetFloorNum === 1 ? 2.8 : targetFloorNum === 2 ? 5.8 : 15.0),
      cameraY: (targetFloorNum === 1 ? 1.3 : targetFloorNum === 2 ? 4.3 : 7.5)
    };

    // Selected floor: HIGHEST opacity (1.0). Other floors: LOW opacity (0.15)
    this.customModel.traverse(child => {
      if (child.isMesh && child.material) {
        child.visible = true;

        const nameHierarchy = `${child.name || ''} ${child.parent?.name || ''}`.toLowerCase();
        const isRedPart = child.userData.isRedPart || 
          (child.name && child.name.includes('Floor 3 - Floor Slab.')) ||
          nameHierarchy.includes('floor 3 - floor slab.');

        let meshY = child.userData.meshCenterY;
        if (meshY === undefined) {
          const box = new THREE.Box3().setFromObject(child);
          meshY = box.getCenter(new THREE.Vector3()).y;
          child.userData.meshCenterY = meshY;
        }

        let isSelectedFloor = (meshY >= floorDef.yMin && meshY < floorDef.yMax);

        // Red parts should NEVER be highlighted, always kept in low opacity
        if (isRedPart) {
          isSelectedFloor = false;
        }

        // Check if mesh is a column or pillar (e.g. "Ground Floor - Column")
        const isColumn = nameHierarchy.includes('column') || nameHierarchy.includes('pillar');

        // Don't highlight columns when selecting the 2nd floor (or ground floor columns on upper floors)
        if (isColumn && targetFloorNum >= 2) {
          isSelectedFloor = false;
        } else if (nameHierarchy.includes('ground floor') && targetFloorNum > 1) {
          isSelectedFloor = false;
        }

        const mats = Array.isArray(child.material) ? child.material : [child.material];

        mats.forEach(mat => {
          if (isSelectedFloor) {
            mat.transparent = false;
            mat.opacity = 1.0;
            mat.depthWrite = true;
          } else {
            mat.transparent = true;
            mat.opacity = 0.15;
            mat.depthWrite = false;
          }
        });
      }
    });

    // Move camera elevation smoothly to match the selected floor height, nicely zoomed in
    const box = new THREE.Box3().setFromObject(this.customModel);
    const center = box.getCenter(new THREE.Vector3());
    const floorCamY = floorDef.cameraY !== undefined ? floorDef.cameraY : center.y;
    const floorDist = 22.0; // Comfortable zoomed-in distance to bring room pins into clear focus

    const targetLookAt = new THREE.Vector3(center.x, floorCamY, center.z);
    const targetCamPos = new THREE.Vector3(center.x, floorCamY + 0.8, center.z - floorDist);
    this.tweenCamera(targetCamPos, targetLookAt, 800);
  }

  async loadFloorsData() {
    try {
      const res = await fetch('data/floors.json');
      this.floorsData = await res.json();
    } catch (e) {
      this.floorsData = [
        { floor: 1, name: 'Ground Floor', code: 'L1', yMin: -5.0, yMax: 2.8, cameraY: 1.3 },
        { floor: 2, name: '2nd Floor', code: 'L2', yMin: 2.8, yMax: 5.8, cameraY: 4.3 },
        { floor: 3, name: '3rd Floor', code: 'L3', yMin: 5.8, yMax: 15.0, cameraY: 7.5 }
      ];
    }
  }

  // Exploded View Slider
  setExplodedView(factor) {
    this.generator.setExplodedView(factor);
  }

  // Custom 3D Model Loading (GLTF / GLB)
  checkDefaultModelPath() {
    const defaultPath = 'assets/models/building.glb';
    fetch(defaultPath, { method: 'HEAD' })
      .then(res => {
        if (res.ok) {
          console.log('Default building model detected. Loading...');
          this.loadCustomGLTF(defaultPath);
        }
      })
      .catch(() => {
        // Model not yet provided, using high-fidelity procedural campus
      });
  }

  loadCustomGLTF(url) {
    if (!window.THREE?.GLTFLoader) {
      console.warn('GLTFLoader not ready.');
      return;
    }

    const loader = new THREE.GLTFLoader();
    const loadingBadge = document.getElementById('model-loading-indicator');
    if (loadingBadge) loadingBadge.classList.remove('hidden');

    loader.load(
      url,
      (gltf) => {
        if (loadingBadge) loadingBadge.classList.add('hidden');
        if (this.customModel) {
          this.scene.remove(this.customModel);
        }

        this.customModel = gltf.scene;
        this.customModel.traverse((child) => {
          if (child.isMesh && child.material) {
            child.castShadow = true;
            child.receiveShadow = true;

            // Clone materials so opacity can be modified per floor independently
            if (Array.isArray(child.material)) {
              child.material = child.material.map(m => m.clone());
            } else {
              child.material = child.material.clone();
            }

            // Tag red slabs (e.g. Floor 3 - Floor Slab.001/002/003) so they stay low opacity when floor is selected
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            let isRed = false;
            mats.forEach(m => {
              if (m.color && (m.color.r > 0.6 && m.color.g < 0.2 && m.color.b < 0.2)) {
                isRed = true;
              }
            });
            if (isRed || (child.name && child.name.includes('Floor 3 - Floor Slab.'))) {
              child.userData.isRedPart = true;
            }

            // Precompute center Y for floor filtering
            const box = new THREE.Box3().setFromObject(child);
            child.userData.meshCenterY = box.getCenter(new THREE.Vector3()).y;

            // Auto-detect room names from mesh hierarchy (e.g. "lec-2", "Lec 2", "Dean")
            const childName = (child.name || '').toLowerCase();
            const matchedRoom = this.roomsData.find(r => 
              childName.includes(r.id.toLowerCase()) || 
              childName.includes((r.code || '').toLowerCase())
            );
            if (matchedRoom) {
              child.userData.isRoom = true;
              child.userData.roomId = matchedRoom.id;
              child.userData.baseColor = parseInt((matchedRoom.color || '#0284c7').replace('#', '0x'), 16);
            }
          }
        });

        // 1. Completely destroy and remove the placeholder building from the 3D scene
        this.generator.destroyBuilding();

        // 2. Add user's custom model
        this.scene.add(this.customModel);
        this.isCustomModelActive = true;

        // 3. Position 3D pin markers ONLY for rooms that belong to this custom building (x > 50)
        if (this.customPinsGroup) {
          this.scene.remove(this.customPinsGroup);
        }
        this.customPinsGroup = new THREE.Group();
        this.customPinsGroup.name = 'CustomModelPins';
        // Standardized baseline elevations per floor so all text bubbles on each floor align perfectly
        const floorBaseHeights = {
          1: 1.35,
          2: 4.35,
          3: 7.50
        };

        this.roomsData.forEach(room => {
          // Place pins for all rooms that belong to this custom building (x >= 40)
          if (room.coordinates && room.coordinates.x >= 40) {
            // Align all text bubbles on the same floor to the exact same level
            const pinY = floorBaseHeights[room.floor] || ((room.coordinates.y !== undefined ? room.coordinates.y : 1.0) + 0.15);
            // The front facade and columns extend to z ≈ -10.8.
            // Placing pinZ at -12.0 positions all text bubbles squarely in front of the building
            // in a perfectly parallel, uniform row with zero clipping into walls.
            const pinZ = -12.0;
            this.generator.createRoomMarker(room, pinY, this.customPinsGroup, pinZ);
          }
        });
        this.scene.add(this.customPinsGroup);

        this.fitCameraToObject(this.customModel);

        const event = new CustomEvent('custom-model-loaded', { detail: { success: true } });
        window.dispatchEvent(event);
      },
      (xhr) => {
        if (xhr.lengthComputable) {
          const percent = Math.round((xhr.loaded / xhr.total) * 100);
          const percentEl = document.getElementById('model-load-progress');
          if (percentEl) percentEl.textContent = `${percent}%`;
        }
      },
      (error) => {
        if (loadingBadge) loadingBadge.classList.add('hidden');
        console.error('Error loading custom GLTF model:', error);
      }
    );
  }

  loadLocalModelFile(file) {
    const url = URL.createObjectURL(file);
    this.loadCustomGLTF(url);
  }

  switchToProceduralBuilding() {
    if (this.customModel) {
      this.customModel.visible = false;
    }
    if (this.customPinsGroup) {
      this.customPinsGroup.visible = false;
    }
    this.generator.generateBuilding(this.roomsData);
    this.isCustomModelActive = false;
    this.tweenCamera(this.defaultCameraPos, this.defaultTargetPos, 700);
  }

  fitCameraToObject(object) {
    const box = new THREE.Box3().setFromObject(object);
    this.buildingBounds = box;
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    // Align background grid plane directly beneath the building base
    if (this.gridGroup) {
      this.gridGroup.position.set(center.x, box.min.y, center.z);
    }

    const fov = this.camera.fov * (Math.PI / 180);
    const aspect = this.camera.aspect || 1.6;

    // Calculate exact distance so the entire building cleanly fills the viewport
    const distForWidth = (size.x / 2) / (Math.tan(fov / 2) * aspect);
    const distForHeight = (size.y / 2) / Math.tan(fov / 2);
    const entireBuildingDistance = Math.max(distForWidth, distForHeight) * 1.05;

    // Zoom limits:
    // Max zoom in: 14.5 units distance (comfortably frames at least 2 adjacent rooms)
    // Max zoom out: entireBuildingDistance (shows the entire building, never excess void)
    this.controls.minDistance = 14.5;
    this.controls.maxDistance = entireBuildingDistance;

    // Direct front POV of the building: centered on X, eye level elevation on Y, stationed at front (-Z) looking forward
    const newPos = new THREE.Vector3(center.x, center.y + 1.2, center.z - entireBuildingDistance);
    this.tweenCamera(newPos, center, 1000);
  }

  // Enforce movement and angle limits so the user can NEVER see under or high above the building
  enforceViewBounds() {
    if (!this.buildingBounds) return;

    // 1. Vertical Pan Clamp:
    // Target focal height strictly kept between building ground level and roof
    const minY = this.buildingBounds.min.y + 1.2;
    const maxY = this.buildingBounds.max.y - 0.4;

    if (this.controls.target.y < minY) {
      const diff = minY - this.controls.target.y;
      this.controls.target.y = minY;
      this.camera.position.y += diff;
    } else if (this.controls.target.y > maxY) {
      const diff = this.controls.target.y - maxY;
      this.controls.target.y = maxY;
      this.camera.position.y -= diff;
    }

    // 2. Absolute Ground Camera Limit:
    // Camera can NEVER be lower than building ground level
    const minCameraY = this.buildingBounds.min.y + 0.8;
    if (this.camera.position.y < minCameraY) {
      this.camera.position.y = minCameraY;
    }

    // 3. Horizontal Pan Soft Limits:
    const minX = this.buildingBounds.min.x - 10;
    const maxX = this.buildingBounds.max.x + 10;
    if (this.controls.target.x < minX) {
      const diff = minX - this.controls.target.x;
      this.controls.target.x = minX;
      this.camera.position.x += diff;
    } else if (this.controls.target.x > maxX) {
      const diff = this.controls.target.x - maxX;
      this.controls.target.x = maxX;
      this.camera.position.x -= diff;
    }
  }

  // Animation Frame Loop
  animate() {
    requestAnimationFrame(() => this.animate());

    this.controls.update();

    // Restrict camera view boundaries
    this.enforceViewBounds();

    // Distance-dependent scaling:
    // When zooming out, texts get bigger popping above those rooms on the selected floor!
    const camDist = this.camera.position.distanceTo(this.controls.target);
    const zoomOutFactor = THREE.MathUtils.clamp((camDist - 18.0) / 28.0, 0, 1);
    const popScaleMultiplier = THREE.MathUtils.lerp(1.0, 2.35, zoomOutFactor);

    const time = performance.now() * 0.0025;
    if (this.generator && this.generator.pinSprites) {
      let i = 0;
      const isFloorActive = (this.currentFloor && this.currentFloor !== 'all');
      const targetFloorNum = isFloorActive ? parseInt(this.currentFloor) : null;

      this.generator.pinSprites.forEach(pin => {
        // Floor filter: if a specific floor is selected, only pins on that floor are shown
        const pinFloor = pin.userData?.floor;
        const matchesFloor = !isFloorActive || (pinFloor === targetFloorNum);
        const isSelectedRoom = (this.selectedRoomId && pin.userData?.roomId === this.selectedRoomId);

        let targetOpacity = 0.0;
        if (matchesFloor || isSelectedRoom) {
          targetOpacity = 1.0;
        }

        // Smooth transition for opacity
        const currentOpacity = pin.material.opacity;
        const newOpacity = THREE.MathUtils.lerp(currentOpacity, targetOpacity, 0.12);
        pin.material.opacity = newOpacity;
        pin.visible = newOpacity > 0.01;

        if (pin.visible) {
          // Dynamic scale: gets bigger popping above the rooms as camera zooms out
          const baseScaleX = pin.userData.baseScaleX || 2.4;
          const baseScaleY = pin.userData.baseScaleY || 1.25;
          const targetScaleX = baseScaleX * popScaleMultiplier * (isSelectedRoom ? 1.15 : 1.0);
          const targetScaleY = baseScaleY * popScaleMultiplier * (isSelectedRoom ? 1.15 : 1.0);

          pin.scale.x = THREE.MathUtils.lerp(pin.scale.x, targetScaleX, 0.12);
          pin.scale.y = THREE.MathUtils.lerp(pin.scale.y, targetScaleY, 0.12);

          // Synchronized subtle bobbing so all bubbles stay perfectly aligned to each other
          if (pin.userData && pin.userData.baseY !== undefined) {
            pin.position.y = pin.userData.baseY + Math.sin(time) * 0.04;
          }
        }
        i++;
      });
    }

    this.renderer.render(this.scene, this.camera);
  }
}

window.BuildingViewer = BuildingViewer;
