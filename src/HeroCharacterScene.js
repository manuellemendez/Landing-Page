import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const mix = (from, to, amount) => from + (to - from) * amount;
// Smoothstep: gestures that hold a pose need to arrive and leave without the
// linear ramp showing at either end.
const easeInOut = (t) => {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
};
const damp = (current, target, speed, delta) =>
  THREE.MathUtils.lerp(current, target, 1 - Math.exp(-speed * delta));

/* ------------------------------------------------------------------ *
 * Geometry helpers
 * ------------------------------------------------------------------ */

// Geometry is shared across mounts, so it is only freed once the last scene
// tears down — otherwise a remount would dispose the live instance's buffers.
const geometryCache = new Map();
let activeMounts = 0;

function cached(key, build) {
  let geometry = geometryCache.get(key);
  if (!geometry) {
    geometry = build();
    geometryCache.set(key, geometry);
  }
  return geometry;
}

/** Machined slab: octagonal chamfer on the face, soft bevel on the extrusion. */
function slab(width, height, depth, corner = 0.12, bevel = 0.03) {
  return cached(`slab:${width}:${height}:${depth}:${corner}:${bevel}`, () => {
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const cut = Math.min(corner, halfWidth * 0.45, halfHeight * 0.45);
    const shape = new THREE.Shape();

    shape.moveTo(-halfWidth + cut, -halfHeight);
    shape.lineTo(halfWidth - cut, -halfHeight);
    shape.lineTo(halfWidth, -halfHeight + cut);
    shape.lineTo(halfWidth, halfHeight - cut);
    shape.lineTo(halfWidth - cut, halfHeight);
    shape.lineTo(-halfWidth + cut, halfHeight);
    shape.lineTo(-halfWidth, halfHeight - cut);
    shape.lineTo(-halfWidth, -halfHeight + cut);
    shape.closePath();

    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: Math.max(0.01, depth - bevel * 2),
      steps: 1,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: bevel,
      bevelThickness: bevel,
    });
    geometry.center();
    geometry.computeVertexNormals();
    return geometry;
  });
}

/** Tapered hull: a slab whose top face is narrower than its bottom (or vice versa). */
function taperedSlab(topWidth, bottomWidth, height, depth, bevel = 0.045) {
  return cached(`taper:${topWidth}:${bottomWidth}:${height}:${depth}`, () => {
    const halfTop = topWidth / 2;
    const halfBottom = bottomWidth / 2;
    const halfHeight = height / 2;
    const cut = Math.min(0.16, halfTop * 0.4);
    const shape = new THREE.Shape();

    shape.moveTo(-halfBottom + cut, -halfHeight);
    shape.lineTo(halfBottom - cut, -halfHeight);
    shape.lineTo(halfBottom, -halfHeight + cut);
    shape.lineTo(halfTop, halfHeight - cut);
    shape.lineTo(halfTop - cut, halfHeight);
    shape.lineTo(-halfTop + cut, halfHeight);
    shape.lineTo(-halfTop, halfHeight - cut);
    shape.lineTo(-halfBottom, -halfHeight + cut);
    shape.closePath();

    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: Math.max(0.01, depth - bevel * 2),
      steps: 1,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: bevel,
      bevelThickness: bevel,
    });
    geometry.center();
    geometry.computeVertexNormals();
    return geometry;
  });
}

const capsule = (radius, length, key) =>
  cached(`capsule:${key}`, () => new THREE.CapsuleGeometry(radius, length, 4, 12));

const joint = (radius, key) =>
  cached(`joint:${key}`, () => new THREE.IcosahedronGeometry(radius, 1));

const disc = (radius, thickness, key) =>
  cached(`disc:${key}`, () => new THREE.CylinderGeometry(radius, radius, thickness, 12));

const rod = (radius, height, key) =>
  cached(`rod:${key}`, () => new THREE.CylinderGeometry(radius, radius * 0.7, height, 8));

/** Soft radial falloff used for the contact shadow and the emissive halos. */
function radialTexture(inner, outer, stops) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(
    size / 2,
    size / 2,
    size * inner,
    size / 2,
    size / 2,
    size * outer,
  );
  stops.forEach(([offset, color]) => gradient.addColorStop(offset, color));
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function addPart(parent, geometry, material, position, rotation, scale) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  if (rotation) mesh.rotation.set(...rotation);
  if (scale) mesh.scale.set(...scale);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

/* ------------------------------------------------------------------ *
 * Materials — three value tiers so the silhouette separates:
 * deep hull (shadow), mid plate (form), machined trim (highlight),
 * plus a single emissive accent reserved for the face.
 * ------------------------------------------------------------------ */

function createMaterials() {
  return {
    hull: new THREE.MeshPhysicalMaterial({
      color: 0x2b4247,
      metalness: 0.85,
      roughness: 0.38,
      clearcoat: 0.35,
      clearcoatRoughness: 0.45,
      envMapIntensity: 1.1,
    }),
    hullDeep: new THREE.MeshPhysicalMaterial({
      color: 0x15282b,
      metalness: 0.82,
      roughness: 0.5,
      envMapIntensity: 0.8,
    }),
    plate: new THREE.MeshPhysicalMaterial({
      color: 0x40615f,
      metalness: 0.8,
      roughness: 0.26,
      clearcoat: 0.6,
      clearcoatRoughness: 0.25,
      envMapIntensity: 1.3,
    }),
    trim: new THREE.MeshPhysicalMaterial({
      color: 0x86a7a4,
      metalness: 1,
      roughness: 0.24,
      envMapIntensity: 1.25,
    }),
    // Joints are brushed, not polished — mirror-finish balls read as beads.
    joint: new THREE.MeshPhysicalMaterial({
      color: 0x5c7a78,
      metalness: 0.95,
      roughness: 0.42,
      envMapIntensity: 0.9,
    }),
    accent: new THREE.MeshPhysicalMaterial({
      color: 0x2c9d95,
      emissive: 0x0c4a46,
      emissiveIntensity: 0.5,
      metalness: 0.9,
      roughness: 0.24,
      envMapIntensity: 1.15,
    }),
    glass: new THREE.MeshPhysicalMaterial({
      color: 0x030c0d,
      metalness: 0.35,
      roughness: 0.05,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      envMapIntensity: 1.6,
    }),
    // Emissives stay well under the tone-mapping knee so they read as
    // saturated teal light instead of clipping to featureless white.
    lit: new THREE.MeshStandardMaterial({
      color: 0x1c8f88,
      emissive: 0x33d9c6,
      emissiveIntensity: 1.02,
      metalness: 0,
      roughness: 0.4,
    }),
    litSoft: new THREE.MeshStandardMaterial({
      color: 0x1a6f6b,
      emissive: 0x229c93,
      emissiveIntensity: 0.85,
      metalness: 0.2,
      roughness: 0.45,
    }),
  };
}

/* ------------------------------------------------------------------ *
 * Limbs
 * ------------------------------------------------------------------ */

function createArm(side, materials) {
  const shoulder = new THREE.Group();
  shoulder.position.set(side * 1.12, 0.74, 0);

  // Pauldron sits proud of the torso so the shoulder line reads at any scale.
  addPart(shoulder, joint(0.24, "shoulder"), materials.joint, [0, 0, 0]);
  addPart(
    shoulder,
    taperedSlab(0.72, 0.58, 0.7, 0.82),
    materials.plate,
    [side * 0.12, 0.02, 0],
    [0, 0, side * -0.14],
  );
  addPart(
    shoulder,
    slab(0.09, 0.4, 0.66, 0.03),
    materials.accent,
    [side * 0.38, 0.04, 0],
    [0, 0, side * -0.14],
  );

  const upper = new THREE.Group();
  upper.position.set(side * 0.04, -0.12, 0);
  shoulder.add(upper);
  addPart(upper, capsule(0.17, 0.5, "upperarm"), materials.hull, [0, -0.36, 0]);
  addPart(upper, slab(0.34, 0.46, 0.36, 0.08), materials.plate, [0, -0.36, 0.03]);

  const elbow = new THREE.Group();
  elbow.position.set(0, -0.74, 0);
  upper.add(elbow);
  addPart(elbow, joint(0.19, "elbow"), materials.joint, [0, 0, 0]);

  const forearm = new THREE.Group();
  forearm.position.set(0, -0.06, 0);
  elbow.add(forearm);
  addPart(forearm, capsule(0.15, 0.44, "forearm"), materials.hullDeep, [0, -0.34, 0]);
  addPart(forearm, taperedSlab(0.44, 0.34, 0.54, 0.42), materials.hull, [0, -0.34, 0.02]);
  addPart(forearm, slab(0.16, 0.06, 0.05, 0.02), materials.litSoft, [0, -0.18, 0.22]);

  // Hand: palm block with two prongs — reads as a tool, not a mitten.
  const hand = new THREE.Group();
  hand.position.set(0, -0.7, 0.01);
  forearm.add(hand);
  addPart(hand, slab(0.38, 0.3, 0.4, 0.09), materials.plate, [0, -0.12, 0]);
  addPart(hand, slab(0.12, 0.3, 0.18, 0.04), materials.hull, [-0.11, -0.38, 0.06], [0, 0, 0.14]);
  addPart(hand, slab(0.12, 0.3, 0.18, 0.04), materials.hull, [0.11, -0.38, 0.06], [0, 0, -0.14]);

  return { shoulder, upper, elbow, forearm, hand };
}

function createLeg(side, materials) {
  const hip = new THREE.Group();
  hip.position.set(side * 0.5, -1.12, 0);

  addPart(hip, joint(0.24, "hip"), materials.joint, [0, 0, 0]);
  addPart(hip, taperedSlab(0.56, 0.46, 0.72, 0.6), materials.hull, [0, -0.44, 0]);
  addPart(hip, slab(0.08, 0.4, 0.5, 0.03), materials.accent, [side * 0.27, -0.44, 0]);

  const knee = new THREE.Group();
  knee.position.set(0, -0.88, 0);
  hip.add(knee);
  addPart(knee, joint(0.2, "knee"), materials.joint, [0, 0, 0]);
  addPart(knee, slab(0.36, 0.2, 0.16, 0.05), materials.accent, [0, 0.02, 0.24]);

  const shin = new THREE.Group();
  shin.position.set(0, -0.06, 0);
  knee.add(shin);
  addPart(shin, taperedSlab(0.44, 0.5, 0.72, 0.52), materials.hullDeep, [0, -0.4, 0]);
  addPart(shin, slab(0.3, 0.5, 0.1, 0.06), materials.plate, [0, -0.4, 0.26]);

  // Foot pushed forward so the stance has weight instead of floating.
  addPart(shin, taperedSlab(0.6, 0.68, 0.24, 0.92), materials.plate, [0, -0.86, 0.14]);
  addPart(shin, slab(0.5, 0.1, 0.2, 0.04), materials.trim, [0, -0.95, 0.55]);

  // Hip and knee are returned separately so the zen pose can fold the leg.
  return { hip, knee };
}

/* ------------------------------------------------------------------ *
 * Character
 * ------------------------------------------------------------------ */

function buildCompanion(scene, materials, textures) {
  const rig = new THREE.Group();
  scene.add(rig);

  /* ---- torso: wide chest tapering to a narrow waist ---- */
  const body = new THREE.Group();
  rig.add(body);

  addPart(body, taperedSlab(1.92, 1.5, 1.42, 1.02), materials.hull, [0, 0.32, 0]);
  addPart(body, slab(2.34, 0.26, 0.78, 0.1), materials.hullDeep, [0, 1.0, -0.02]);
  addPart(body, taperedSlab(1.16, 1.32, 0.6, 0.86), materials.hullDeep, [0, -0.6, 0]);
  // Pelvis: a block, not a bar — a thin chrome strip here reads as a floating belt.
  addPart(body, taperedSlab(1.2, 1.06, 0.34, 0.9), materials.hull, [0, -1.02, 0]);
  addPart(body, slab(0.42, 0.06, 0.06, 0.02), materials.accent, [0, -1.02, 0.48]);

  // Recessed chest bay — dark glass with instrument bars, deliberately dimmer
  // than the face so the eye lands on the head first.
  addPart(body, slab(1.34, 1.0, 0.1, 0.14), materials.glass, [0, 0.36, 0.53]);
  addPart(body, slab(1.42, 1.08, 0.06, 0.16), materials.trim, [0, 0.36, 0.5]);
  addPart(body, slab(0.86, 0.08, 0.05, 0.03), materials.accent, [-0.18, 0.66, 0.59]);
  addPart(body, slab(0.4, 0.08, 0.05, 0.03), materials.litSoft, [-0.43, 0.45, 0.59]);
  addPart(body, slab(0.22, 0.08, 0.05, 0.03), materials.hull, [0.05, 0.45, 0.59]);

  // Own material instance: these pulse independently of the eyes.
  const core = addPart(body, disc(0.11, 0.08, "core"), materials.lit.clone(), [0.34, 0.08, 0.6], [
    Math.PI / 2,
    0,
    0,
  ]);
  addPart(body, disc(0.19, 0.05, "corering"), materials.trim, [0.34, 0.08, 0.57], [
    Math.PI / 2,
    0,
    0,
  ]);
  addPart(body, slab(0.66, 0.06, 0.05, 0.02), materials.hullDeep, [-0.28, 0.08, 0.59]);
  addPart(body, slab(0.66, 0.06, 0.05, 0.02), materials.hullDeep, [-0.28, -0.06, 0.59]);

  // Back-pack vent: gives the profile depth from any camera angle.
  addPart(body, taperedSlab(1.1, 0.94, 0.9, 0.3), materials.hullDeep, [0, 0.44, -0.62]);
  [0.22, 0, -0.22].forEach((y) => {
    addPart(body, slab(0.86, 0.06, 0.06, 0.02), materials.accent, [0, 0.44 + y, -0.79]);
  });

  const leftArm = createArm(-1, materials);
  const rightArm = createArm(1, materials);
  body.add(leftArm.shoulder, rightArm.shoulder);
  const leftLeg = createLeg(-1, materials);
  const rightLeg = createLeg(1, materials);
  body.add(leftLeg.hip, rightLeg.hip);

  /* ---- neck ---- */
  addPart(body, disc(0.38, 0.36, "neck"), materials.hullDeep, [0, 1.12, 0]);
  addPart(body, disc(0.52, 0.1, "collar"), materials.plate, [0, 1.22, 0]);
  addPart(body, disc(0.42, 0.06, "collarring"), materials.accent, [0, 1.3, 0]);

  /* ---- head: wider than tall, dominated by one visor ---- */
  const head = new THREE.Group();
  head.position.set(0, 1.32, 0);
  rig.add(head);

  addPart(head, taperedSlab(1.78, 1.98, 1.26, 1.16), materials.hull, [0, 0.62, 0]);
  addPart(head, slab(2.06, 0.2, 0.86, 0.06), materials.plate, [0, 1.2, -0.04]);
  addPart(head, slab(1.5, 0.14, 0.1, 0.04), materials.trim, [0, 1.28, 0.42]);

  // Visor: one dark glass band, the single brightest element in the frame.
  addPart(head, taperedSlab(1.5, 1.62, 0.74, 0.12), materials.glass, [0, 0.6, 0.6]);
  addPart(head, taperedSlab(1.62, 1.74, 0.86, 0.06), materials.hullDeep, [0, 0.6, 0.56]);

  const eyes = [-0.34, 0.34].map((x) => ({
    mesh: addPart(head, slab(0.42, 0.2, 0.08, 0.075), materials.lit, [x, 0.64, 0.68]),
    baseX: x,
  }));

  const halo = new THREE.Mesh(
    cached("halo", () => new THREE.PlaneGeometry(1.9, 1.05)),
    new THREE.MeshBasicMaterial({
      map: textures.glow,
      transparent: true,
      opacity: 0.34,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  halo.position.set(0, 0.64, 0.74);
  head.add(halo);

  // Mouth reduced to a status readout — expression lives in the eyes.
  addPart(head, slab(0.5, 0.07, 0.06, 0.02), materials.litSoft, [0, 0.12, 0.66]);
  addPart(head, slab(0.16, 0.07, 0.06, 0.02), materials.accent, [-0.4, 0.12, 0.64]);
  addPart(head, slab(0.16, 0.07, 0.06, 0.02), materials.accent, [0.4, 0.12, 0.64]);

  // Ear pods break the box outline at the widest point of the head. Their
  // status light is angled forward — a disc facing sideways is invisible
  // from the camera's three-quarter position.
  const earLights = [-1, 1].map((side) => {
    addPart(head, disc(0.3, 0.26, "earpod"), materials.plate, [side * 1.0, 0.62, 0], [
      0,
      0,
      Math.PI / 2,
    ]);
    addPart(head, disc(0.21, 0.3, "earinner"), materials.hullDeep, [side * 1.07, 0.62, 0], [
      0,
      0,
      Math.PI / 2,
    ]);
    return addPart(
      head,
      slab(0.09, 0.34, 0.08, 0.03),
      materials.litSoft.clone(),
      [side * 0.86, 0.62, 0.63],
      [0, side * -0.42, 0],
    );
  });

  /* ---- sensor mast: off-centre, so the silhouette isn't mirror-symmetric ---- */
  const mast = new THREE.Group();
  mast.position.set(-0.52, 1.24, -0.04);
  head.add(mast);
  addPart(mast, rod(0.058, 0.46, "mast"), materials.trim, [0, 0.23, 0]);
  addPart(mast, slab(0.16, 0.2, 0.14, 0.04), materials.hull, [0, 0.5, 0]);
  const beacon = addPart(mast, joint(0.09, "beacon"), materials.lit.clone(), [0, 0.62, 0]);
  addPart(mast, disc(0.16, 0.08, "mastbase"), materials.plate, [0, 0.02, 0]);

  /* ---- ground: contact shadow + scan ring ---- */
  const groundY = -3.16;

  const contact = new THREE.Mesh(
    cached("contact", () => new THREE.PlaneGeometry(4.6, 4.6)),
    new THREE.MeshBasicMaterial({
      map: textures.contact,
      transparent: true,
      opacity: 0.62,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  contact.rotation.x = -Math.PI / 2;
  contact.position.set(0, groundY + 0.01, 0.1);
  scene.add(contact);

  const scanRing = new THREE.Mesh(
    cached("scanring", () => new THREE.RingGeometry(1.55, 1.62, 64)),
    new THREE.MeshBasicMaterial({
      color: 0x3fd6c8,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  scanRing.rotation.x = -Math.PI / 2;
  scanRing.position.set(0, groundY + 0.02, 0.1);
  scene.add(scanRing);

  const pulseRing = new THREE.Mesh(
    cached("pulsering", () => new THREE.RingGeometry(1.55, 1.6, 64)),
    new THREE.MeshBasicMaterial({
      color: 0x8ff0e4,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  pulseRing.rotation.x = -Math.PI / 2;
  pulseRing.position.set(0, groundY + 0.03, 0.1);
  scene.add(pulseRing);

  const shadowCatcher = new THREE.Mesh(
    cached("shadowcatcher", () => new THREE.PlaneGeometry(9, 9)),
    new THREE.ShadowMaterial({ color: 0x040c0d, opacity: 0.3 }),
  );
  shadowCatcher.rotation.x = -Math.PI / 2;
  shadowCatcher.position.y = groundY;
  shadowCatcher.receiveShadow = true;
  scene.add(shadowCatcher);

  return {
    rig,
    body,
    head,
    eyes,
    halo,
    core,
    beacon,
    earLights,
    mast,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    scanRing,
    pulseRing,
  };
}

/* ------------------------------------------------------------------ *
 * Scene
 * ------------------------------------------------------------------ */

export function mountCompanionScene({ canvas, container, motionQuery }) {
  activeMounts += 1;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();

  // Image-based lighting does most of the material work: without it the
  // metals read as flat plastic no matter how many lamps are added.
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = new RoomEnvironment();
  const envTarget = pmrem.fromScene(environment, 0.04);
  scene.environment = envTarget.texture;
  scene.environmentIntensity = 0.34;
  environment.traverse((object) => object.geometry?.dispose?.());
  pmrem.dispose();

  const textures = {
    glow: radialTexture(0, 0.5, [
      [0, "rgba(150,255,244,0.95)"],
      [0.35, "rgba(80,220,206,0.32)"],
      [1, "rgba(0,0,0,0)"],
    ]),
    contact: radialTexture(0, 0.5, [
      [0, "rgba(2,10,11,0.95)"],
      [0.45, "rgba(2,10,11,0.4)"],
      [1, "rgba(0,0,0,0)"],
    ]),
  };

  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 60);

  scene.add(new THREE.HemisphereLight(0xcfe9e5, 0x050d0e, 0.85));

  const keyLight = new THREE.DirectionalLight(0xe8fbf6, 3.1);
  keyLight.position.set(-3.1, 8.2, 4.6);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.bias = -0.0012;
  keyLight.shadow.normalBias = 0.02;
  keyLight.shadow.camera.left = -4.5;
  keyLight.shadow.camera.right = 4.5;
  keyLight.shadow.camera.top = 5.5;
  keyLight.shadow.camera.bottom = -5;
  scene.add(keyLight);

  // Two opposed rims carve the edges away from the near-black background —
  // this is what stops the model reading as a silhouette blob.
  const rimTeal = new THREE.DirectionalLight(0x5df0de, 5.2);
  rimTeal.position.set(6.4, 2.2, -3.2);
  scene.add(rimTeal);

  const rimCool = new THREE.DirectionalLight(0xa8cadd, 3.2);
  rimCool.position.set(-6.2, 1.4, -3);
  scene.add(rimCool);

  const bounce = new THREE.PointLight(0x1f6f72, 6, 14, 2);
  bounce.position.set(0.6, -2.2, 3.4);
  scene.add(bounce);

  const materials = createMaterials();
  const companion = buildCompanion(scene, materials, textures);

  const clock = new THREE.Clock();
  const lookTarget = { x: 0, y: 0 };

  /* ---- gestures ----
   * Idle gestures run off `elapsed`, which only advances on frames that
   * actually rendered. Wall-clock timing would let a gesture "run" while the
   * hero is scrolled out of view and then snap mid-pose when it returns. */
  const GESTURES = { wave: 1.25, zen: 9 };
  let elapsed = 0;
  let gesture = null;
  let nextGestureAt = 6 + Math.random() * 6;
  let animationFrame = 0;

  const startGesture = (name) => {
    gesture = { name, at: elapsed, duration: GESTURES[name] };
  };
  let isVisible = true;
  let isDisposed = false;
  let mastAngle = 0;
  let mastVelocity = 0;

  const bounds = new THREE.Box3().setFromObject(companion.rig);
  const focus = new THREE.Vector3();
  bounds.getCenter(focus);
  const size = new THREE.Vector3();
  bounds.getSize(size);

  const fitCamera = (aspect) => {
    const fovRadians = (camera.fov * Math.PI) / 180;
    const margin = 1.1;
    const fitHeight = (size.y * margin) / (2 * Math.tan(fovRadians / 2));
    const fitWidth =
      (size.x * margin) / (2 * Math.tan(fovRadians / 2) * Math.max(aspect, 0.35));
    camera.position.set(0.35, focus.y + 0.35, Math.max(fitHeight, fitWidth) + size.z * 0.5);
    camera.lookAt(0, focus.y, 0);
  };

  const resize = () => {
    const width = Math.max(1, container.clientWidth);
    const height = Math.max(1, container.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    fitCamera(camera.aspect);
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  };

  const render = (time) => {
    if (isDisposed) return;
    const delta = Math.min(clock.getDelta(), 0.05);
    const seconds = time * 0.001;
    elapsed += delta;

    /* ---- gesture scheduling ---- */
    if (!motionQuery.matches) {
      if (gesture && elapsed - gesture.at >= gesture.duration) {
        gesture = null;
        nextGestureAt = elapsed + 7 + Math.random() * 8;
      }
      // Zen is the rarer of the two, so it stays an event rather than a habit.
      if (!gesture && elapsed >= nextGestureAt) {
        startGesture(Math.random() < 0.35 ? "zen" : "wave");
      }
    }

    const gestureTime = gesture ? elapsed - gesture.at : 0;
    const isWaving = gesture?.name === "wave";
    const waveProgress = isWaving ? clamp(gestureTime / gesture.duration, 0, 1) : 1;
    const waveEnvelope = isWaving ? Math.sin(waveProgress * Math.PI) : 0;
    const flick = Math.sin(waveProgress * Math.PI * 6);
    // The wave rides a sine; zen holds, so it ramps in, sits, and ramps out.
    const zen =
      gesture?.name === "zen"
        ? easeInOut(Math.min(gestureTime / 1.4, (gesture.duration - gestureTime) / 1.4))
        : 0;

    /* ---- look: a meditating robot stops tracking the cursor ---- */
    const lookX = lookTarget.x * (1 - zen);
    const lookY = lookTarget.y * (1 - zen);
    companion.head.rotation.y = damp(companion.head.rotation.y, lookX * 0.42, 7, delta);
    companion.head.rotation.x = damp(
      companion.head.rotation.x,
      -lookY * 0.2 + zen * 0.24,
      7,
      delta,
    );
    companion.body.rotation.y = damp(companion.body.rotation.y, lookX * 0.09, 4, delta);
    companion.body.rotation.x = damp(companion.body.rotation.x, -lookY * 0.03, 4, delta);

    companion.eyes.forEach(({ mesh, baseX }) => {
      mesh.position.x = damp(mesh.position.x, baseX + lookX * 0.075, 10, delta);
      mesh.position.y = damp(mesh.position.y, 0.64 - lookY * 0.045, 10, delta);
    });

    /* ---- blink ---- */
    const blinkPhase = seconds % 5.4;
    const blinkScale =
      blinkPhase > 5.02 && blinkPhase < 5.18
        ? Math.max(0.1, Math.abs((blinkPhase - 5.1) / 0.08))
        : 1;
    // Eyes fall to a slit while meditating.
    const eyeOpen = Math.min(blinkScale, 1 - zen * 0.84);
    companion.eyes.forEach(({ mesh }) => {
      mesh.scale.y = damp(mesh.scale.y, eyeOpen, 32, delta);
    });
    companion.halo.material.opacity = damp(
      companion.halo.material.opacity,
      (0.16 + eyeOpen * 0.16) * (1 - zen * 0.5),
      18,
      delta,
    );

    /* ---- instrument pulses ---- */
    const beat = (Math.sin(seconds * 2.1) + 1) * 0.5;
    companion.core.material.emissiveIntensity = 0.8 + beat * 0.6;
    companion.earLights.forEach((light, index) => {
      light.material.emissiveIntensity = 0.7 + Math.sin(seconds * 1.7 + index * 1.9) * 0.35;
    });
    companion.beacon.material.emissiveIntensity = 1.2 + Math.sin(seconds * 4.4) * 0.8;

    /* ---- arms: rest pose, wave swing, then the zen fold blended over both ---- */
    // Rest pose angles the hands slightly inward; splayed arms read as a
    // scarecrow. Sign is mirrored per side so both swing toward the torso.
    const restLeftShoulderZ = 0.045 - waveEnvelope * 2.45;
    const restRightShoulderZ =
      -0.045 + Math.sin(seconds * 1.15) * 0.03 - waveEnvelope * 0.12;

    // Hands settle onto the knees rather than folding up at the chest.
    companion.leftArm.shoulder.rotation.z = mix(restLeftShoulderZ, 0.44, zen);
    companion.leftArm.shoulder.rotation.x = mix(-waveEnvelope * 0.22, -0.34, zen);
    companion.leftArm.elbow.rotation.z = mix(
      0.03 + waveEnvelope * (0.5 + flick * 0.34),
      0.2,
      zen,
    );
    companion.leftArm.elbow.rotation.x = mix(0, -0.46, zen);
    companion.leftArm.hand.rotation.z = waveEnvelope * flick * 0.3 * (1 - zen);

    companion.rightArm.shoulder.rotation.z = mix(restRightShoulderZ, -0.44, zen);
    companion.rightArm.shoulder.rotation.x = mix(0, -0.34, zen);
    companion.rightArm.elbow.rotation.z = mix(
      -0.03 - Math.sin(seconds * 1.15 + 0.6) * 0.03,
      -0.2,
      zen,
    );
    companion.rightArm.elbow.rotation.x = mix(0, -0.46, zen);

    /* ---- legs: thighs up and out, shins folded back across each other ---- */
    // Euler XYZ applies Z first, so the hip rolls the leg outward and then
    // lifts it. That leaves the knee's own frame tilted, so the shin needs a
    // counter-roll on Z or it folds down-and-out into a squat.
    [companion.leftLeg, companion.rightLeg].forEach((leg, index) => {
      const side = index === 0 ? -1 : 1;
      leg.hip.rotation.x = mix(0, -1.46, zen);
      leg.hip.rotation.z = mix(0, side * 0.52, zen);
      leg.knee.rotation.x = mix(0, 2.05, zen);
      leg.knee.rotation.z = mix(0, side * -0.72, zen);
    });

    companion.rig.rotation.y = damp(companion.rig.rotation.y, waveEnvelope * -0.09, 6, delta);

    /* ---- ground rings ---- */
    companion.scanRing.material.opacity = 0.18 + beat * 0.12 + zen * 0.14;
    companion.scanRing.rotation.z += delta * 0.25 * (1 - zen * 0.7);
    if (waveProgress < 1) {
      const spread = 1 + waveProgress * 1.5;
      companion.pulseRing.scale.set(spread, spread, 1);
      companion.pulseRing.material.opacity = (1 - waveProgress) * 0.45;
    } else {
      companion.pulseRing.material.opacity = 0;
    }

    /* ---- idle: breathing plus a mast that lags behind the head ---- */
    if (!motionQuery.matches) {
      // Folding the legs raises the figure's lowest point, so the rig drops to
      // stay framed, and the breath slows and deepens — that sells the pose
      // more than the limbs do.
      const bob = Math.sin(seconds * mix(1.3, 0.62, zen));
      companion.rig.position.y = bob * mix(0.05, 0.085, zen) - zen * 0.52;
      companion.rig.rotation.z = Math.sin(seconds * 0.7) * 0.008 * (1 - zen);
      companion.body.scale.set(1, 1 + bob * mix(0.012, 0.03, zen), 1);

      const mastTarget = -companion.head.rotation.y * 0.55;
      mastVelocity += (mastTarget - mastAngle) * 42 * delta;
      mastVelocity *= Math.exp(-7 * delta);
      mastAngle += mastVelocity * delta;
      companion.mast.rotation.z = clamp(mastAngle, -0.5, 0.5);
      companion.mast.rotation.x = mix(Math.sin(seconds * 1.9) * 0.04, 0.16, zen);
    }

    renderer.render(scene, camera);
    if (isVisible && !motionQuery.matches) {
      animationFrame = window.requestAnimationFrame(render);
    }
  };

  const resizeObserver = "ResizeObserver" in window ? new ResizeObserver(resize) : null;
  resizeObserver?.observe(container);
  if (!resizeObserver) window.addEventListener("resize", resize);

  const intersectionObserver =
    "IntersectionObserver" in window
      ? new IntersectionObserver(([entry]) => {
        const wasVisible = isVisible;
        isVisible = entry.isIntersecting;
        if (isVisible && !wasVisible && !motionQuery.matches) {
          clock.getDelta();
          animationFrame = window.requestAnimationFrame(render);
        }
      })
      : null;
  intersectionObserver?.observe(container);

  resize();
  if (motionQuery.matches) renderer.render(scene, camera);
  else animationFrame = window.requestAnimationFrame(render);

  return {
    setLook(x, y) {
      lookTarget.x = x;
      lookTarget.y = y;
    },
    wave() {
      // A click interrupts whatever idle gesture is running.
      startGesture("wave");
    },
    dispose() {
      if (isDisposed) return;
      isDisposed = true;
      activeMounts -= 1;
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      if (!resizeObserver) window.removeEventListener("resize", resize);

      const disposables = new Set();
      scene.traverse((object) => {
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => disposables.add(material));
        } else if (object.material) {
          disposables.add(object.material);
        }
      });
      disposables.forEach((material) => material.dispose());
      Object.values(textures).forEach((texture) => texture.dispose());
      if (activeMounts <= 0) {
        geometryCache.forEach((geometry) => geometry.dispose());
        geometryCache.clear();
      }
      envTarget.dispose();
      scene.environment = null;
      renderer.dispose();
    },
  };
}
