"use client";

/**
 * Interactive WebGL background: a dotted "holographic" Earth that spins as
 * you scroll.
 *
 * Always load this through next/dynamic with `ssr: false` (see
 * HeroBackground.tsx). three.js can't run on the server.
 *
 * How the scroll-driven rotation works:
 *   1. Every frame we read window.scrollY and turn it into a target angle
 *      (RADIANS_PER_PX), plus a very slow idle spin so the globe never
 *      looks frozen.
 *   2. The globe's actual angle eases toward that target instead of jumping
 *      to it. A fast flick of the scroll wheel gives a smooth spin with some
 *      inertia, and it settles gently when you stop.
 *
 * How the globe is drawn (no textures or images):
 *   - Land: ~18k points spread evenly over the sphere (a Fibonacci lattice),
 *     kept only where lib/land-mask.ts says there's land.
 *   - Ocean: a dark sphere with a fresnel rim, i.e. brighter toward the edges,
 *     like an atmosphere seen from space.
 *   - Glow: an additive radial-gradient sprite behind the globe. It's cheaper
 *     than a bloom pass and works on a transparent canvas.
 */
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { LAND_MASK_BASE64, LAND_MASK_HEIGHT, LAND_MASK_WIDTH } from "@/lib/land-mask";

const CYAN = new THREE.Color("#2DE2C1");
const VIOLET = new THREE.Color("#8B5CF6");
const OCEAN = new THREE.Color("#0B1119");

/** How far the globe turns per pixel scrolled (≈ 86° per 1000px). */
const RADIANS_PER_PX = 0.0015;
/** Fraction of the remaining angle covered per frame (at 60fps). Lower = more inertia. */
const SCROLL_EASE = 0.06;
/** Slow idle spin in radians/second, so the globe is alive even at rest. */
const IDLE_SPIN = 0.03;
/** Longitude (degrees east) that faces the viewer before any scrolling. */
const START_LONGITUDE = 10;
/** Earth's real axial tilt. */
const AXIAL_TILT = THREE.MathUtils.degToRad(23.4);

type SceneProps = {
  /** Lighter scene for touch/small screens: fewer dots, lower pixel ratio. */
  lite?: boolean;
};

export default function EarthScene({ lite = false }: SceneProps) {
  return (
    <Canvas
      // Cap the pixel ratio: retina at most, and lower on small/touch screens.
      dpr={lite ? [1, 1.5] : [1, 2]}
      camera={{ position: [0, 0, 7], fov: 45 }}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      style={{ pointerEvents: "none" }}
    >
      <Globe lite={lite} />
    </Canvas>
  );
}

/* ------------------------------------------------------------------ */

function Globe({ lite }: { lite: boolean }) {
  const placement = useRef<THREE.Group>(null); // position + size for the viewport
  const spin = useRef<THREE.Group>(null); // the scroll-driven Y rotation
  const satellite = useRef<THREE.Group>(null);

  const dotCount = lite ? 10000 : 18000;
  const land = useMemo(() => buildLandDots(dotCount), [dotCount]);
  const glow = useGlowTexture();

  // A point at longitude L faces the camera when the globe is rotated by
  // -(90° + L) around Y, so that's where the rotation starts.
  const startAngle = THREE.MathUtils.degToRad(-90 - START_LONGITUDE);
  const angle = useRef(startAngle);

  // Shader uniforms. The dot uniforms are updated every frame through the
  // material ref, and the ocean ones never change.
  const dotMaterial = useRef<THREE.ShaderMaterial>(null);
  const dotUniforms = useMemo(() => ({ uSize: { value: 3 }, uTime: { value: 0 } }), []);
  const oceanUniforms = useMemo(
    () => ({ uBase: { value: OCEAN }, uRimTop: { value: CYAN }, uRimBottom: { value: VIOLET } }),
    [],
  );
  const graticule = useMemo(() => buildGraticule(), []);

  // Geometries built by hand aren't owned by R3F, so free them ourselves.
  useEffect(
    () => () => {
      land.dispose();
      graticule.dispose();
    },
    [land, graticule],
  );

  useFrame((state, delta) => {
    const p = placement.current;
    const s = spin.current;
    const dots = dotMaterial.current;
    if (!p || !s || !dots) return;
    const { width, height } = state.viewport; // world units visible at z = 0
    const t = state.clock.elapsedTime;

    // Layout: to the right of the hero copy on landscape screens, and tucked
    // into the top-right corner on portrait (mobile) screens.
    let radius: number;
    if (width >= height) {
      radius = Math.min(height * 0.36, width * 0.21);
      p.position.set(width * 0.25, height * 0.07, 0);
    } else {
      radius = width * 0.42;
      p.position.set(width * 0.3, height * 0.3, 0);
    }
    p.scale.setScalar(radius);

    // Scroll to target angle, then ease toward it. Scaling the ease by delta
    // keeps the inertia identical at 60, 120 or 144Hz.
    const target = startAngle + window.scrollY * RADIANS_PER_PX + t * IDLE_SPIN;
    const ease = 1 - Math.pow(1 - SCROLL_EASE, delta * 60);
    angle.current += (target - angle.current) * ease;
    s.rotation.y = angle.current;

    // Dot size tracks the globe's on-screen size so the dot pattern stays
    // consistent from phone to 4K.
    const radiusPx = (radius / height) * state.size.height * state.viewport.dpr;
    const spacing = Math.sqrt((4 * Math.PI) / dotCount); // angular gap between dots
    dots.uniforms.uSize.value = radiusPx * spacing * 0.45;
    dots.uniforms.uTime.value = t;

    // A little satellite on a tilted orbit.
    satellite.current?.position.set(Math.cos(t * 0.35) * 1.45, 0, Math.sin(t * 0.35) * 1.45);
  });

  return (
    <group ref={placement}>
      {/* Soft outer halo; the opaque ocean hides its centre, leaving a glow ring */}
      <sprite scale={[3.3, 3.3, 1]}>
        <spriteMaterial
          map={glow}
          color={VIOLET}
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </sprite>
      <sprite scale={[2.6, 2.6, 1]}>
        <spriteMaterial
          map={glow}
          color={CYAN}
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </sprite>

      {/* Tilt: real axial tilt, plus a slight lean toward the viewer */}
      <group rotation={[0.28, 0, AXIAL_TILT]}>
        <group ref={spin}>
          <mesh>
            <sphereGeometry args={[0.985, 64, 64]} />
            <shaderMaterial
              uniforms={oceanUniforms}
              vertexShader={OCEAN_VERTEX}
              fragmentShader={OCEAN_FRAGMENT}
            />
          </mesh>
          <lineSegments geometry={graticule}>
            <lineBasicMaterial color={VIOLET} transparent opacity={0.14} depthWrite={false} />
          </lineSegments>
          <points geometry={land}>
            <shaderMaterial
              ref={dotMaterial}
              uniforms={dotUniforms}
              vertexShader={DOT_VERTEX}
              fragmentShader={DOT_FRAGMENT}
              transparent
              depthWrite={false}
            />
          </points>
        </group>
      </group>

      {/* Orbit ring + satellite */}
      <group rotation={[0.3, 0, -0.35]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.45, 0.0035, 6, 160]} />
          <meshBasicMaterial color={CYAN} transparent opacity={0.3} toneMapped={false} />
        </mesh>
        <group ref={satellite}>
          <mesh>
            <sphereGeometry args={[0.022, 12, 12]} />
            <meshBasicMaterial color={CYAN} toneMapped={false} />
          </mesh>
          <sprite scale={[0.3, 0.3, 1]}>
            <spriteMaterial
              map={glow}
              color={CYAN}
              transparent
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              toneMapped={false}
            />
          </sprite>
        </group>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Geometry                                                            */
/* ------------------------------------------------------------------ */

/** Decode the base64 land bitmask once. */
function decodeLandMask() {
  const binary = atob(LAND_MASK_BASE64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return (latDeg: number, lonDeg: number) => {
    const row = Math.min(LAND_MASK_HEIGHT - 1, Math.max(0, Math.floor(90 - latDeg)));
    const col = Math.min(LAND_MASK_WIDTH - 1, Math.max(0, Math.floor(lonDeg + 180)));
    const bit = row * LAND_MASK_WIDTH + col;
    return ((bytes[bit >> 3] >> (bit & 7)) & 1) === 1;
  };
}

/**
 * Evenly distribute `count` points on a unit sphere (Fibonacci lattice) and
 * keep the ones that land on land. Each dot gets a cyan to violet colour by
 * latitude, with a little random brightness for texture.
 */
function buildLandDots(count: number) {
  const isLand = decodeLandMask();
  const positions: number[] = [];
  const colors: number[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  const color = new THREE.Color();

  for (let i = 0; i < count; i++) {
    const y = 1 - (2 * (i + 0.5)) / count; // 1 → -1
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;

    // Convention used throughout: x = cos(lat)cos(lon), y = sin(lat),
    // z = -cos(lat)sin(lon). East is to the right when viewed from outside.
    const lat = THREE.MathUtils.radToDeg(Math.asin(y));
    const lon = THREE.MathUtils.radToDeg(Math.atan2(-z, x));
    if (!isLand(lat, lon)) continue;

    positions.push(x, y, z);
    color.copy(CYAN).lerp(VIOLET, THREE.MathUtils.clamp((0.6 - y) / 1.4, 0, 1));
    color.multiplyScalar(0.75 + Math.random() * 0.35);
    colors.push(color.r, color.g, color.b);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("aColor", new THREE.Float32BufferAttribute(colors, 3));
  return geometry;
}

/** Latitude/longitude grid lines every 30°, drawn just above the surface. */
function buildGraticule() {
  const points: number[] = [];
  const r = 1.002;
  const step = THREE.MathUtils.degToRad(3);
  const toXYZ = (lat: number, lon: number) => [
    r * Math.cos(lat) * Math.cos(lon),
    r * Math.sin(lat),
    -r * Math.cos(lat) * Math.sin(lon),
  ];

  // Parallels
  for (let latDeg = -60; latDeg <= 60; latDeg += 30) {
    const lat = THREE.MathUtils.degToRad(latDeg);
    for (let lon = 0; lon < Math.PI * 2; lon += step) {
      points.push(...toXYZ(lat, lon), ...toXYZ(lat, lon + step));
    }
  }
  // Meridians
  for (let lonDeg = 0; lonDeg < 360; lonDeg += 30) {
    const lon = THREE.MathUtils.degToRad(lonDeg);
    for (let lat = -Math.PI / 2; lat < Math.PI / 2; lat += step) {
      points.push(...toXYZ(lat, lon), ...toXYZ(lat + step, lon));
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
  return geometry;
}

/** A soft radial-gradient texture used for every glow sprite. Made once. */
function useGlowTexture() {
  const texture = useMemo(() => {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.3, "rgba(255,255,255,0.45)");
    gradient.addColorStop(0.65, "rgba(255,255,255,0.08)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

/* ------------------------------------------------------------------ */
/* Shaders                                                             */
/* ------------------------------------------------------------------ */

// Land dots: round, dimmer toward the limb, with a slow scan band sweeping
// up and down the globe for a "holographic" feel.
const DOT_VERTEX = /* glsl */ `
  uniform float uSize;
  uniform float uTime;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vec3 normal = normalize(normalMatrix * position);
    float facing = dot(normal, normalize(-mvPosition.xyz));

    float band = exp(-pow((position.y - sin(uTime * 0.35) * 0.9) * 7.0, 2.0));
    vColor = aColor + band * 0.45;
    vAlpha = smoothstep(0.0, 0.45, facing);

    gl_PointSize = uSize * (0.7 + 0.3 * facing);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const DOT_FRAGMENT = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    gl_FragColor = vec4(vColor, vAlpha * smoothstep(0.5, 0.25, d));
  }
`;

// Ocean: near-black sphere with a cyan (north) to violet (south) fresnel rim.
const OCEAN_VERTEX = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  varying float vY;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mvPosition.xyz);
    vY = normal.y;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const OCEAN_FRAGMENT = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uRimTop;
  uniform vec3 uRimBottom;
  varying vec3 vNormal;
  varying vec3 vView;
  varying float vY;

  void main() {
    float fresnel = pow(1.0 - max(dot(vNormal, vView), 0.0), 3.0);
    vec3 rim = mix(uRimBottom, uRimTop, vY * 0.5 + 0.5);
    gl_FragColor = vec4(uBase + rim * fresnel * 0.85, 1.0);
  }
`;
