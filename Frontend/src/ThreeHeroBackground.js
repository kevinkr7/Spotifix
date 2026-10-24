import { useEffect, useRef } from "react";

const THREE_CDN = "https://unpkg.com/three@0.160.0/build/three.min.js";

function loadThree() {
  return new Promise((resolve, reject) => {
    if (window.THREE) {
      resolve(window.THREE);
      return;
    }

    const existing = document.querySelector(`script[src="${THREE_CDN}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(window.THREE));
      existing.addEventListener("error", reject);
      return;
    }

    const script = document.createElement("script");
    script.src = THREE_CDN;
    script.async = true;
    script.onload = () => resolve(window.THREE);
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

export default function ThreeHeroBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    let cleanup = () => {};

    loadThree()
      .then((THREE) => {
        if (!mountRef.current) return;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
        camera.position.z = 40;

        const mount = mountRef.current;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mount.appendChild(renderer.domElement);

        const mainGroup = new THREE.Group();
        const miniGroup = new THREE.Group();
        scene.add(mainGroup);
        scene.add(miniGroup);

        const mainGeometry = new THREE.IcosahedronGeometry(11, 2);
        const mainMaterial = new THREE.MeshStandardMaterial({
          color: "#8b5cf6",
          wireframe: true,
          emissive: "#2563eb",
          emissiveIntensity: 0.35,
          metalness: 0.2,
          roughness: 0.35,
          transparent: true,
          opacity: 0.85,
        });
        const mainOrb = new THREE.Mesh(mainGeometry, mainMaterial);
        mainGroup.add(mainOrb);

        const miniGeometry = new THREE.IcosahedronGeometry(5.5, 2);
        const miniMaterial = new THREE.MeshStandardMaterial({
          color: "#22d3ee",
          wireframe: true,
          emissive: "#7c3aed",
          emissiveIntensity: 0.5,
          metalness: 0.25,
          roughness: 0.45,
          transparent: true,
          opacity: 0.75,
        });
        const miniOrb = new THREE.Mesh(miniGeometry, miniMaterial);
        miniGroup.add(miniOrb);

        const starGeometry = new THREE.BufferGeometry();
        const starCount = 900;
        const positions = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount * 3; i += 3) {
          positions[i] = (Math.random() - 0.5) * 180;
          positions[i + 1] = (Math.random() - 0.5) * 180;
          positions[i + 2] = (Math.random() - 0.5) * 180;
        }

        starGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        const starMaterial = new THREE.PointsMaterial({
          color: "#22d3ee",
          size: 0.18,
          transparent: true,
          opacity: 0.8,
        });

        const stars = new THREE.Points(starGeometry, starMaterial);
        scene.add(stars);

        const light = new THREE.DirectionalLight("#ffffff", 1.2);
        light.position.set(20, 20, 25);
        scene.add(light);

        const accentLight = new THREE.PointLight("#14b8a6", 2, 160);
        accentLight.position.set(-18, 10, 15);
        scene.add(accentLight);

        const miniLight = new THREE.PointLight("#a78bfa", 1.6, 120);
        miniLight.position.set(-30, -2, 18);
        scene.add(miniLight);

        const resize = () => {
          const { width, height } = mount.getBoundingClientRect();
          renderer.setSize(width, height);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();

          const isCompact = width < 900;
          mainGroup.position.set(isCompact ? 16 : 41, 1.4, 0);
          miniGroup.position.set(isCompact ? -10 : -36, -3.6, -2.5);
        };

        resize();
        window.addEventListener("resize", resize);

        let frame;
        const animate = () => {
          frame = requestAnimationFrame(animate);

          mainOrb.rotation.x += 0.003;
          mainOrb.rotation.y += 0.006;
          mainGroup.rotation.z += 0.001;

          miniOrb.rotation.x -= 0.004;
          miniOrb.rotation.y += 0.0045;
          miniGroup.rotation.z -= 0.0012;

          stars.rotation.y += 0.0009;

            // Existing rotation code...
            mainOrb.rotation.x += 0.003;

            // Add a subtle "floating" effect using Math.sin
            // This shifts the Y position slightly up and down over time
            mainGroup.position.y += Math.sin(Date.now() * 0.001) * 0.01;

            renderer.render(scene, camera);
        };

        animate();

        cleanup = () => {
          cancelAnimationFrame(frame);
          window.removeEventListener("resize", resize);
          mount.removeChild(renderer.domElement);
          mainGeometry.dispose();
          mainMaterial.dispose();
          miniGeometry.dispose();
          miniMaterial.dispose();
          starGeometry.dispose();
          starMaterial.dispose();
          renderer.dispose();
        };
      })
      .catch((error) => {
        console.error("Three.js failed to load", error);
      });

    return () => cleanup();
  }, []);

  return <div className="three-hero" ref={mountRef} aria-hidden="true" />;
}
