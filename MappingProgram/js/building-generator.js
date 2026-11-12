/**
 * Campus 3D Procedural Building Generator
 * Generates an architectural 4-story campus complex with distinct rooms,
 * glass curtain walls, floor slabs, stairs, corridors, and interior cues.
 */

class BuildingGenerator {
  constructor(scene) {
    this.scene = scene;
    this.floorGroups = {}; // Floor number => THREE.Group
    this.roomMeshes = new Map(); // roomId => THREE.Mesh
    this.pinSprites = new Map(); // roomId => THREE.Sprite or Object3D
    this.pathLine = null; // glowing path for navigation
    this.buildingGroup = new THREE.Group();
    this.scene.add(this.buildingGroup);

    // Architectural dimensions
    this.floorHeight = 3.5;
    this.buildingWidth = 44;
    this.buildingDepth = 32;
    this.totalFloors = 4;
  }

  generateBuilding(roomsData) {
    // Clear any previous elements in building group
    while (this.buildingGroup.children.length > 0) {
      this.buildingGroup.remove(this.buildingGroup.children[0]);
    }
    this.floorGroups = {};
    this.roomMeshes.clear();
    this.pinSprites.clear();

    // Ensure building group is added back and visible if re-generating
    if (!this.scene.children.includes(this.buildingGroup)) {
      this.scene.add(this.buildingGroup);
    }
    this.buildingGroup.visible = true;

    // 1. Foundation & Campus Ground Plinth
    this.createCampusGround();

    // 2. Generate each floor slab & structure
    for (let f = 1; f <= this.totalFloors; f++) {
      const floorGroup = new THREE.Group();
      floorGroup.name = `Floor_${f}`;
      floorGroup.userData = { floor: f, baseElevation: (f - 1) * this.floorHeight };
      
      this.createFloorSlab(floorGroup, f);
      this.createCorridorsAndColumns(floorGroup, f);
      this.createGlassCurtainWalls(floorGroup, f);

      this.floorGroups[f] = floorGroup;
      this.buildingGroup.add(floorGroup);
    }

    // 3. Central Staircase & Elevator Core (visual cues across all floors)
    this.createStaircaseAndElevatorCore();

    // 4. Roof Deck & Solar Pergola
    this.createRoofDeck();

    // 5. Place interactive rooms based on JSON data
    this.placeRooms(roomsData);

    return this.buildingGroup;
  }

  createCampusGround() {
    // Base grass lawn
    const lawnGeo = new THREE.PlaneGeometry(120, 100);
    const lawnMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // Modern dark campus courtyard slate
      roughness: 0.9,
      metalness: 0.1
    });
    const lawn = new THREE.Mesh(lawnGeo, lawnMat);
    lawn.rotation.x = -Math.PI / 2;
    lawn.position.y = -0.1;
    lawn.receiveShadow = true;
    this.buildingGroup.add(lawn);

    // Concrete Plinth / Entry Plaza
    const plinthGeo = new THREE.BoxGeometry(54, 0.4, 42);
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.7,
      metalness: 0.2
    });
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.y = 0.2;
    plinth.receiveShadow = true;
    this.buildingGroup.add(plinth);

    // Architectural grid lines on plaza
    const gridHelper = new THREE.GridHelper(50, 25, 0x38bdf8, 0x1e293b);
    gridHelper.position.y = 0.41;
    this.buildingGroup.add(gridHelper);

    // Front Entrance Steps & Walkway
    const stepGeo = new THREE.BoxGeometry(16, 0.3, 10);
    const stepMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
    const steps = new THREE.Mesh(stepGeo, stepMat);
    steps.position.set(0, 0.15, 24);
    this.buildingGroup.add(steps);
  }

  createFloorSlab(floorGroup, floor) {
    const yPos = (floor - 1) * this.floorHeight;

    // Main floor concrete slab
    const slabGeo = new THREE.BoxGeometry(this.buildingWidth, 0.35, this.buildingDepth);
    const slabMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.5,
      metalness: 0.1
    });
    const slab = new THREE.Mesh(slabGeo, slabMat);
    slab.position.y = yPos;
    slab.receiveShadow = true;
    slab.userData = { isFloorSlab: true, floor: floor };
    floorGroup.add(slab);

    // Ceiling glow edge / perimeter accent band
    const edgeGeo = new THREE.BoxGeometry(this.buildingWidth + 0.2, 0.1, this.buildingDepth + 0.2);
    const edgeMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x0369a1,
      emissiveIntensity: 0.2
    });
    const edge = new THREE.Mesh(edgeGeo, edgeMat);
    edge.position.y = yPos + this.floorHeight - 0.05;
    floorGroup.add(edge);
  }

  createCorridorsAndColumns(floorGroup, floor) {
    const yBase = (floor - 1) * this.floorHeight;
    const colHeight = this.floorHeight - 0.35;
    const colGeo = new THREE.BoxGeometry(0.8, colHeight, 0.8);
    const colMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.4 });

    // Perimeter architectural pillars
    const colPositions = [
      [-20, yBase + colHeight / 2 + 0.2, -14],
      [-20, yBase + colHeight / 2 + 0.2, 0],
      [-20, yBase + colHeight / 2 + 0.2, 14],
      [20, yBase + colHeight / 2 + 0.2, -14],
      [20, yBase + colHeight / 2 + 0.2, 0],
      [20, yBase + colHeight / 2 + 0.2, 14],
      [0, yBase + colHeight / 2 + 0.2, -14],
      [0, yBase + colHeight / 2 + 0.2, 14]
    ];

    colPositions.forEach(pos => {
      const col = new THREE.Mesh(colGeo, colMat);
      col.position.set(pos[0], pos[1], pos[2]);
      floorGroup.add(col);
    });

    // Central Hallway Corridor Floor Strip
    const corridorGeo = new THREE.PlaneGeometry(6, this.buildingDepth - 4);
    const corridorMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.3
    });
    const corridor = new THREE.Mesh(corridorGeo, corridorMat);
    corridor.rotation.x = -Math.PI / 2;
    corridor.position.set(0, yBase + 0.19, 0);
    floorGroup.add(corridor);
  }

  createGlassCurtainWalls(floorGroup, floor) {
    const yBase = (floor - 1) * this.floorHeight;
    const wallHeight = this.floorHeight - 0.35;

    // Translucent architectural blue glass
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.18,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.85,
      ior: 1.5,
      depthWrite: false
    });

    // Outer perimeter glass facade
    const frontWallGeo = new THREE.BoxGeometry(this.buildingWidth - 1, wallHeight, 0.1);
    const frontWall = new THREE.Mesh(frontWallGeo, glassMat);
    frontWall.position.set(0, yBase + wallHeight / 2 + 0.2, this.buildingDepth / 2);
    floorGroup.add(frontWall);

    const backWall = frontWall.clone();
    backWall.position.z = -this.buildingDepth / 2;
    floorGroup.add(backWall);

    const sideWallGeo = new THREE.BoxGeometry(0.1, wallHeight, this.buildingDepth - 1);
    const leftWall = new THREE.Mesh(sideWallGeo, glassMat);
    leftWall.position.set(-this.buildingWidth / 2, yBase + wallHeight / 2 + 0.2, 0);
    floorGroup.add(leftWall);

    const rightWall = leftWall.clone();
    rightWall.position.x = this.buildingWidth / 2;
    floorGroup.add(rightWall);
  }

  createStaircaseAndElevatorCore() {
    // Central lift shaft and fire stair core
    const coreHeight = this.floorHeight * this.totalFloors;
    const coreGeo = new THREE.BoxGeometry(7, coreHeight, 8);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.7,
      metalness: 0.3
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.set(0, coreHeight / 2, -2);
    core.castShadow = true;
    core.receiveShadow = true;
    this.buildingGroup.add(core);

    // Elevator Door Accents
    for (let f = 1; f <= this.totalFloors; f++) {
      const yElev = (f - 1) * this.floorHeight + 1.2;
      const doorGeo = new THREE.PlaneGeometry(2.2, 2.2);
      const doorMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.3,
        metalness: 0.8
      });
      const door = new THREE.Mesh(doorGeo, doorMat);
      door.position.set(0, yElev, 2.05);
      this.buildingGroup.add(door);
    }
  }

  createRoofDeck() {
    const yRoof = this.totalFloors * this.floorHeight;

    // Roof Slab
    const roofGeo = new THREE.BoxGeometry(this.buildingWidth, 0.4, this.buildingDepth);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = yRoof;
    this.buildingGroup.add(roof);

    // Solar Pergola & HVAC units
    const hvacGeo = new THREE.BoxGeometry(6, 1.8, 8);
    const hvacMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
    const hvac = new THREE.Mesh(hvacGeo, hvacMat);
    hvac.position.set(-10, yRoof + 1, 0);
    this.buildingGroup.add(hvac);

    // Glass Skylight over central atrium
    const skylightGeo = new THREE.BoxGeometry(10, 0.8, 12);
    const skylightMat = new THREE.MeshPhysicalMaterial({
      color: 0x67e8f9,
      transparent: true,
      opacity: 0.4,
      transmission: 0.9
    });
    const skylight = new THREE.Mesh(skylightGeo, skylightMat);
    skylight.position.set(0, yRoof + 0.4, -2);
    this.buildingGroup.add(skylight);
  }

  placeRooms(roomsData) {
    if (!roomsData || !Array.isArray(roomsData)) return;

    roomsData.forEach(room => {
      const floor = room.floor || 1;
      const floorGroup = this.floorGroups[floor];
      if (!floorGroup) return;

      const yBase = (floor - 1) * this.floorHeight;
      const roomGroup = new THREE.Group();
      roomGroup.name = `Room_${room.id}`;

      // Calculate room dimensions based on category
      let width = 12, depth = 9, height = this.floorHeight - 0.5;
      if (room.id === 'lec-1') { width = 14; depth = 11; }
      else if (room.id === 'library-commons') { width = 18; depth = 11; }
      else if (room.id === 'cafeteria') { width = 14; depth = 11; }

      // Room Box Boundary (Frosted Glass Walls + Color Accent)
      const hexColor = parseInt((room.color || '#3b82f6').replace('#', '0x'), 16);
      
      const roomGeo = new THREE.BoxGeometry(width, height, depth);
      const roomMat = new THREE.MeshStandardMaterial({
        color: hexColor,
        transparent: true,
        opacity: 0.35,
        roughness: 0.3,
        metalness: 0.2
      });

      const roomMesh = new THREE.Mesh(roomGeo, roomMat);
      roomMesh.position.set(room.coordinates.x, yBase + height / 2 + 0.2, room.coordinates.z);
      roomMesh.castShadow = true;
      roomMesh.receiveShadow = true;
      roomMesh.userData = {
        roomId: room.id,
        roomData: room,
        isRoom: true,
        baseColor: hexColor
      };

      // Interior Floor Carpet / Color Tile
      const tileGeo = new THREE.PlaneGeometry(width - 0.4, depth - 0.4);
      const tileMat = new THREE.MeshStandardMaterial({
        color: hexColor,
        roughness: 0.6
      });
      const tile = new THREE.Mesh(tileGeo, tileMat);
      tile.rotation.x = -Math.PI / 2;
      tile.position.set(room.coordinates.x, yBase + 0.21, room.coordinates.z);
      roomGroup.add(tile);

      // Room outline wireframe edge
      const edges = new THREE.EdgesGeometry(roomGeo);
      const lineMat = new THREE.LineBasicMaterial({ color: hexColor, linewidth: 2 });
      const wireframe = new THREE.LineSegments(edges, lineMat);
      wireframe.position.copy(roomMesh.position);
      roomGroup.add(wireframe);

      // Interior furniture placeholders (Lectern, Desks, Screens)
      this.addInteriorDetails(roomGroup, room, width, depth, yBase);

      roomGroup.add(roomMesh);
      floorGroup.add(roomGroup);

      this.roomMeshes.set(room.id, roomMesh);

      // Create floating 3D Pin / Marker badge above room
      this.createRoomMarker(room, yBase + height + 0.8, floorGroup);
    });
  }

  addInteriorDetails(roomGroup, room, width, depth, yBase) {
    const rx = room.coordinates.x;
    const rz = room.coordinates.z;

    if (room.category === 'lecture') {
      // Presentation Screen
      const screenGeo = new THREE.BoxGeometry(width * 0.7, 1.8, 0.1);
      const screenMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const screen = new THREE.Mesh(screenGeo, screenMat);
      screen.position.set(rx, yBase + 1.8, rz - depth / 2 + 0.3);
      roomGroup.add(screen);

      // Teacher Lectern Pod
      const lecternGeo = new THREE.BoxGeometry(1.4, 1.1, 0.8);
      const lecternMat = new THREE.MeshStandardMaterial({ color: 0xd97706 });
      const lectern = new THREE.Mesh(lecternGeo, lecternMat);
      lectern.position.set(rx, yBase + 0.6, rz - depth / 2 + 1.8);
      roomGroup.add(lectern);

      // Student Seating Rows
      for (let r = 0; r < 3; r++) {
        const rowGeo = new THREE.BoxGeometry(width * 0.75, 0.7, 0.8);
        const rowMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
        const deskRow = new THREE.Mesh(rowGeo, rowMat);
        deskRow.position.set(rx, yBase + 0.45, rz - 0.5 + (r * 1.8));
        roomGroup.add(deskRow);
      }
    } else if (room.category === 'lab') {
      // Lab Computer Benches
      for (let b = -1; b <= 1; b++) {
        const benchGeo = new THREE.BoxGeometry(width * 0.7, 0.8, 1.2);
        const benchMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
        const bench = new THREE.Mesh(benchGeo, benchMat);
        bench.position.set(rx, yBase + 0.5, rz + (b * 2.2));
        roomGroup.add(bench);
      }
    } else if (room.category === 'office' || room.category === 'faculty') {
      // Executive Desks & Conference table
      const deskGeo = new THREE.BoxGeometry(4.5, 0.8, 2.5);
      const deskMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
      const desk = new THREE.Mesh(deskGeo, deskMat);
      desk.position.set(rx, yBase + 0.5, rz);
      roomGroup.add(desk);
    }
  }

  createRoomMarker(room, yPin, floorGroup, zOverride) {
    // High-resolution canvas for crisp 3D text and directional arrows
    const canvas = document.createElement('canvas');
    canvas.width = 440;
    canvas.height = 230;
    const ctx = canvas.getContext('2d');

    const roomColor = room.color || '#0284c7';
    const categoryName = (room.category || 'Room').toUpperCase();
    const floorLabel = room.floor === 1 ? 'L1' : room.floor === 2 ? 'L2' : `L${room.floor}`;
    const tagText = `${floorLabel} • ${categoryName}`;
    const mainTitle = room.code || room.name;

    // Card Dimensions
    const cardX = 16;
    const cardY = 12;
    const cardW = 408;
    const cardH = 130;
    const cardRadius = 22;

    // Drop shadow for maximum contrast against building geometry
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 6;

    // Badge Dark Glassmorphic Background
    const bgGrad = ctx.createLinearGradient(0, cardY, 0, cardY + cardH);
    bgGrad.addColorStop(0, '#090d16');
    bgGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = bgGrad;
    this.roundRect(ctx, cardX, cardY, cardW, cardH, cardRadius);
    ctx.fill();

    // Reset shadow for crisp inner elements
    ctx.shadowColor = 'transparent';

    // Accent Border
    ctx.lineWidth = 4;
    ctx.strokeStyle = roomColor;
    ctx.stroke();

    // Top Category & Floor Sub-badge
    ctx.fillStyle = roomColor;
    ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(tagText, 220, cardY + 18);

    // Main Room Title
    ctx.fillStyle = '#ffffff';
    const fontSize = mainTitle.length > 15 ? 26 : mainTitle.length > 11 ? 30 : 34;
    ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textBaseline = 'middle';
    ctx.fillText(mainTitle, 220, cardY + 74);

    // --- DIRECTED ARROW POINTING TO ROOM ---
    // Vertical Leader Stem from card to arrowhead
    ctx.beginPath();
    ctx.moveTo(220, cardY + cardH);
    ctx.lineTo(220, 192);
    ctx.lineWidth = 6;
    ctx.strokeStyle = roomColor;
    ctx.stroke();

    // Directed Arrowhead pointing directly down onto the room
    ctx.fillStyle = roomColor;
    ctx.beginPath();
    ctx.moveTo(202, 190);
    ctx.lineTo(238, 190);
    ctx.lineTo(220, 214);
    ctx.closePath();
    ctx.fill();

    // Crisp white outline on arrowhead
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Target Ground Pinpoint Dot at the very bottom tip
    ctx.beginPath();
    ctx.arc(220, 221, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(220, 221, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = roomColor;
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0.0, // Initial opacity 0; dynamically transitions based on zoom distance
      depthTest: false, // Ensures sprite text is ALWAYS crisp in front without clipping into walls or columns
      depthWrite: false
    });

    const sprite = new THREE.Sprite(spriteMat);
    sprite.renderOrder = 999; // Always render in front of building geometry
    // Anchor pin at bottom tip of arrow (0.5, 0.0)
    sprite.center.set(0.5, 0.0);
    const posZ = zOverride !== undefined ? zOverride : (room.coordinates ? room.coordinates.z - 2.0 : 0);
    sprite.position.set(room.coordinates.x, yPin, posZ);

    const baseW = 2.4;
    const baseH = 1.25;
    sprite.scale.set(baseW, baseH, 1);
    sprite.userData = { 
      roomId: room.id, 
      isMarker: true, 
      baseY: yPin,
      baseScaleX: baseW,
      baseScaleY: baseH,
      floor: room.floor
    };

    floorGroup.add(sprite);
    this.pinSprites.set(room.id, sprite);
  }

  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  // Exploded View Slider (0 = compact, 1 = fully separated)
  setExplodedView(factor) {
    const spacing = 12 * factor; // vertical separation distance
    for (let f = 1; f <= this.totalFloors; f++) {
      const group = this.floorGroups[f];
      if (group) {
        group.position.y = (f - 1) * spacing;
      }
    }
  }

  // Floor Isolation (filter by specific floor or 'all')
  isolateFloor(floorNumber) {
    for (let f = 1; f <= this.totalFloors; f++) {
      const group = this.floorGroups[f];
      if (!group) continue;

      if (floorNumber === 'all' || f === parseInt(floorNumber)) {
        group.visible = true;
        // Restore opacity
        group.traverse(child => {
          if (child.isMesh && child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(m => m.opacity = m.userData?.origOpacity ?? m.opacity);
            } else {
              child.material.opacity = child.material.userData?.origOpacity ?? child.material.opacity;
            }
          }
        });
      } else {
        // Either hide completely or make ghosted
        group.visible = false;
      }
    }
  }

  // Highlight a specific room
  highlightRoom(roomId) {
    // Reset any previous highlighted rooms
    this.resetHighlights();

    const mesh = this.roomMeshes.get(roomId);
    if (!mesh) return null;

    // Pulse / glow effect
    mesh.material.opacity = 0.85;
    mesh.material.emissive = new THREE.Color(mesh.userData.baseColor);
    mesh.material.emissiveIntensity = 0.8;

    // Pin subtle pulse scale
    const pin = this.pinSprites.get(roomId);
    if (pin) {
      const bx = pin.userData?.baseScaleX || 2.4;
      const by = pin.userData?.baseScaleY || 1.25;
      pin.scale.set(bx * 1.15, by * 1.15, 1);
    }

    return mesh;
  }

  resetHighlights() {
    this.roomMeshes.forEach(mesh => {
      mesh.material.opacity = 0.35;
      mesh.material.emissive = new THREE.Color(0x000000);
      mesh.material.emissiveIntensity = 0;
    });

    this.pinSprites.forEach(pin => {
      const bx = pin.userData?.baseScaleX || 2.4;
      const by = pin.userData?.baseScaleY || 1.25;
      pin.scale.set(bx, by, 1);
    });

    if (this.pathLine) {
      this.scene.remove(this.pathLine);
      this.pathLine = null;
    }
  }

  // Draw animated wayfinding line from Main Entrance to Room
  drawNavigationPath(room) {
    if (this.pathLine) {
      this.scene.remove(this.pathLine);
      this.pathLine = null;
    }

    const floor = room.floor || 1;
    const targetY = (floor - 1) * this.floorHeight + 0.3;

    // Generate path points: Entrance -> Lobby -> Stairs/Elevator -> Floor corridor -> Room entrance
    const points = [];
    // 1. Front Steps entrance
    points.push(new THREE.Vector3(0, 0.4, 24));
    // 2. Main Lobby
    points.push(new THREE.Vector3(0, 0.4, 10));
    // 3. Central elevator/stairs
    points.push(new THREE.Vector3(0, 0.4, 2));

    if (floor > 1) {
      // 4. Stairway ascent to designated floor
      points.push(new THREE.Vector3(0, targetY, 2));
    }

    // 5. Corridor junction towards room wing
    points.push(new THREE.Vector3(room.coordinates.x * 0.3, targetY, room.coordinates.z * 0.3));
    // 6. Direct doorway of room
    points.push(new THREE.Vector3(room.coordinates.x, targetY, room.coordinates.z));

    const curve = new THREE.CatmullRomCurve3(points);
    const pathGeo = new THREE.TubeGeometry(curve, 64, 0.25, 8, false);
    const pathMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: false,
      transparent: true,
      opacity: 0.9
    });

    this.pathLine = new THREE.Mesh(pathGeo, pathMat);
    this.pathLine.name = 'NavigationPath';
    this.scene.add(this.pathLine);
  }

  destroyBuilding() {
    if (this.buildingGroup) {
      this.buildingGroup.traverse(child => {
        if (child.isMesh) {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
            else child.material.dispose();
          }
        }
      });
      this.scene.remove(this.buildingGroup);
      this.buildingGroup.clear();
      this.buildingGroup.visible = false;
    }
    this.roomMeshes.clear();
    this.pinSprites.clear();
    this.floorGroups = {};

    if (this.pathLine) {
      this.scene.remove(this.pathLine);
      this.pathLine = null;
    }
  }
}

window.BuildingGenerator = BuildingGenerator;
