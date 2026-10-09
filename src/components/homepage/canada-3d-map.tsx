"use client";

import { useEffect, useRef, useState } from "react";
import { CanadaFlatMap } from "@/components/homepage/canada-flat-map";
import type { CanadaMapCategory } from "@/components/homepage/canada-flat-map";
import canadaMap from "@svg-maps/canada";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

type ProvinceMesh = THREE.Mesh<THREE.ExtrudeGeometry, THREE.MeshStandardMaterial>;

export function Canada3DMap({
  category,
  selectedProvince,
  onSelect,
  onHover,
}: {
  category: CanadaMapCategory;
  selectedProvince: string;
  onSelect: (provinceSlug: string) => void;
  onHover: (provinceSlug: string | null) => void;
}) {
  const [vectorFallback, setVectorFallback] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onSelectRef = useRef(onSelect);
  const onHoverRef = useRef(onHover);
  const selectedProvinceRef = useRef(selectedProvince);

  useEffect(() => {
    onSelectRef.current = onSelect;
    onHoverRef.current = onHover;
  }, [onHover, onSelect]);

  useEffect(() => {
    selectedProvinceRef.current = selectedProvince;
  }, [selectedProvince]);

  useEffect(() => {
    const canvasElement = canvasRef.current;
    if (!canvasElement) return;
    const canvas: HTMLCanvasElement = canvasElement;

    const scene = new THREE.Scene();
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true }); } catch { const fallbackFrame = window.requestAnimationFrame(() => setVectorFallback(true)); return () => window.cancelAnimationFrame(fallbackFrame); }
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);

    const camera = new THREE.OrthographicCamera(-500, 500, 590, -590, 0.1, 3000);
    camera.position.set(0, -410, 1180);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.HemisphereLight(0xdff9ff, 0x071014, 2.2));
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.8);
    keyLight.position.set(-260, -240, 780);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0xff3b4f, 2.2);
    rimLight.position.set(430, 380, 420);
    scene.add(rimLight);

    const mapGroup = new THREE.Group();
    mapGroup.rotation.x = -0.08;
    mapGroup.rotation.z = -0.025;
    scene.add(mapGroup);

    const lowColor = new THREE.Color(category.lowColor);
    const highColor = new THREE.Color(category.highColor);
    const valueByProvince = new Map(category.values.map((value) => [value.slug, value]));
    const meshes: ProvinceMesh[] = [];
    const labelAnchors = new Map<string, { area: number; center: THREE.Vector3 }>();
    const labels: THREE.Sprite[] = [];
    const loader = new SVGLoader();

    for (const location of canadaMap.locations) {
      const provinceSlug = category.values.find((value) => value.abbr.toLowerCase() === location.id)?.slug;
      const value = provinceSlug ? valueByProvince.get(provinceSlug) : undefined;
      const fill = value
        ? lowColor.clone().lerp(highColor, value.intensity)
        : new THREE.Color(0x243238);
      const parsed = loader.parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${location.path}" /></svg>`);

      for (const path of parsed.paths) {
        for (const shape of path.toShapes()) {
          const geometry = new THREE.ExtrudeGeometry(shape, {
            depth: 16,
            bevelEnabled: true,
            bevelSegments: 2,
            bevelSize: 0.65,
            bevelThickness: 1.2,
          });
          geometry.translate(-396.5, -516, 0);
          geometry.computeBoundingBox();
          if (provinceSlug && geometry.boundingBox) {
            const size = geometry.boundingBox.getSize(new THREE.Vector3());
            const area = size.x * size.y;
            if (area > (labelAnchors.get(provinceSlug)?.area ?? 0)) labelAnchors.set(provinceSlug, { area, center: geometry.boundingBox.getCenter(new THREE.Vector3()) });
          }
          const material = new THREE.MeshStandardMaterial({
            color: fill,
            emissive: new THREE.Color(0x000000),
            emissiveIntensity: 0,
            metalness: 0.24,
            roughness: 0.58,
          });
          const mesh = new THREE.Mesh(geometry, material);
          mesh.userData.provinceSlug = provinceSlug ?? "";
          mesh.userData.provinceName = location.name;
          mapGroup.add(mesh);
          meshes.push(mesh);

          const edges = new THREE.LineSegments(
            new THREE.EdgesGeometry(geometry, 28),
            new THREE.LineBasicMaterial({ color: 0xd9f7f7, transparent: true, opacity: 0.22 }),
          );
          edges.userData.provinceSlug = provinceSlug ?? "";
          mapGroup.add(edges);
        }
      }
    }

    mapGroup.scale.set(0.88, -0.88, 0.88);
    for (const value of category.values) {
      const anchor = labelAnchors.get(value.slug);
      if (!anchor) continue;
      const labelCanvas = document.createElement("canvas");
      labelCanvas.width = 320;
      labelCanvas.height = 128;
      const context = labelCanvas.getContext("2d");
      if (!context) continue;
      context.fillStyle = "rgba(5, 20, 24, 0.90)";
      context.fillRect(0, 0, 320, 128);
      context.textAlign = "center";
      context.fillStyle = "#b8f6ed";
      context.font = "bold 30px system-ui";
      context.fillText(value.abbr, 160, 42);
      context.fillStyle = "#ffffff";
      context.font = "bold 40px system-ui";
      context.fillText(value.display, 160, 98);
      const texture = new THREE.CanvasTexture(labelCanvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: false, depthWrite: false }));
      sprite.scale.set(105, 42, 1);
      sprite.userData.provinceSlug = value.slug;
      sprite.userData.alwaysVisible = !["NB", "NS", "PE"].includes(value.abbr);
      sprite.renderOrder = 2;
      scene.add(sprite);
      labels.push(sprite);
    }
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let hoveredSlug: string | null = null;
    let pointerX = 0;
    let pointerY = 0;
    let frame = 0;

    function updatePointer(event: PointerEvent | MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      pointerX = pointer.x;
      pointerY = pointer.y;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(meshes, false).find((item) => item.object.userData.provinceSlug);
      const nextSlug = hit?.object.userData.provinceSlug || null;
      if (nextSlug !== hoveredSlug) {
        hoveredSlug = nextSlug;
        canvas.style.cursor = nextSlug ? "pointer" : "default";
        onHoverRef.current(nextSlug);
      }
    }

    function handlePointerLeave() {
      hoveredSlug = null;
      pointerX = 0;
      pointerY = 0;
      canvas.style.cursor = "default";
      onHoverRef.current(null);
    }

    function handleClick(event: MouseEvent) {
      updatePointer(event);
      if (hoveredSlug) onSelectRef.current(hoveredSlug);
    }

    function resize() {
      const { width, height } = canvas.getBoundingClientRect();
      renderer.setSize(Math.max(width, 1), Math.max(height, 1), false);
      const aspect = width / Math.max(height, 1);
      const viewHeight = width < 640 ? 1180 : 1080;
      camera.left = -(viewHeight * aspect) / 2;
      camera.right = (viewHeight * aspect) / 2;
      camera.top = viewHeight / 2;
      camera.bottom = -viewHeight / 2;
      camera.updateProjectionMatrix();
    }

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    canvas.addEventListener("pointermove", updatePointer);
    canvas.addEventListener("pointerleave", handlePointerLeave);
    canvas.addEventListener("click", handleClick);
    resize();

    function animate() {
      if (!reducedMotion) mapGroup.rotation.x += ((-0.08 + pointerY * 0.018) - mapGroup.rotation.x) * 0.045;
      if (!reducedMotion) mapGroup.rotation.z += ((-0.025 - pointerX * 0.018) - mapGroup.rotation.z) * 0.045;
      for (const mesh of meshes) {
        const provinceSlug = mesh.userData.provinceSlug as string;
        const selected = provinceSlug === selectedProvinceRef.current;
        const hovered = provinceSlug === hoveredSlug;
        const targetIntensity = selected ? 0.72 : hovered ? 0.42 : 0;
        mesh.material.emissive.setHex(selected ? 0x5f161d : hovered ? 0x075966 : 0x000000);
        mesh.material.emissiveIntensity += (targetIntensity - mesh.material.emissiveIntensity) * 0.14;
      }
      mapGroup.updateMatrixWorld(true);
      for (const label of labels) {
        const slug = label.userData.provinceSlug as string;
        label.visible = label.userData.alwaysVisible || slug === selectedProvinceRef.current || slug === hoveredSlug;
        const anchor = labelAnchors.get(slug)!;
        label.position.copy(anchor.center).setZ(55).applyMatrix4(mapGroup.matrixWorld);
      }
      renderer.render(scene, camera);
      frame = window.requestAnimationFrame(animate);
    }
    animate();

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener("pointermove", updatePointer);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
      canvas.removeEventListener("click", handleClick);
      for (const object of mapGroup.children) {
        if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          for (const material of materials) material.dispose();
        }
      }
      renderer.dispose();
      for (const label of labels) {
        label.material.map?.dispose();
        label.material.dispose();
      }
    };
  }, [category]);

  if (vectorFallback) return <CanadaFlatMap category={category} selectedProvince={selectedProvince} onSelect={onSelect} raised />;

  return (
    <canvas
      ref={canvasRef}
      className="block h-full w-full touch-manipulation"
      data-testid="canada-3d-map"
      role="img"
      aria-label={`Interactive 3D map of Canada showing ${category.label.toLowerCase()} by province`}
    />
  );
}
