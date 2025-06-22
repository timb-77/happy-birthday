"use strict";

// Überprüfen der WebGL-Unterstützung und Geräteperformance
function checkWebGLSupport() {
    try {
        const canvas = document.createElement('canvas');
        const hasWebGL = !!(window.WebGLRenderingContext && 
            (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        if (!hasWebGL) {
            document.body.classList.add('no-webgl');
        }
        return hasWebGL;
    } catch(e) {
        document.body.classList.add('no-webgl');
        return false;
    }
}

// Überprüfen der Geräteperformance
function isHighPerformanceDevice() {
    return !(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) ||
           window.devicePixelRatio >= 2;
}

// Funktion zum Erstellen einer Blume
function createFlower(color, size) {
    const group = new THREE.Group();
    
    // Blütenblätter
    const petalGeometry = new THREE.ConeGeometry(size * 0.2, size * 0.5, 4);
    const petalMaterial = new THREE.MeshPhongMaterial({
        color: color,
        shininess: 100,
        side: THREE.DoubleSide
    });

    for (let i = 0; i < 8; i++) {
        const petal = new THREE.Mesh(petalGeometry, petalMaterial);
        petal.position.y = size * 0.25;
        petal.rotation.z = (Math.PI / 4) * i;
        petal.rotation.x = Math.PI / 3;
        group.add(petal);
    }

    // Blütenmitte
    const centerGeometry = new THREE.SphereGeometry(size * 0.15, 8, 8);
    const centerMaterial = new THREE.MeshPhongMaterial({
        color: 0xffff00,
        shininess: 80
    });
    const center = new THREE.Mesh(centerGeometry, centerMaterial);
    center.position.y = size * 0.25;
    group.add(center);

    // Stiel
    const stemGeometry = new THREE.CylinderGeometry(size * 0.02, size * 0.02, size);
    const stemMaterial = new THREE.MeshPhongMaterial({
        color: 0x00aa00,
        shininess: 30
    });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.y = -size * 0.25;
    group.add(stem);

    return group;
}

// Funktion für Hintergrund-Partikel
function initBackgroundParticles() {
    const canvas = document.getElementById('background-canvas');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    const renderer = new THREE.WebGLRenderer({ 
        canvas: canvas,
        alpha: true,
        antialias: false,
        powerPreference: "low-power"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const particles = isHighPerformanceDevice() ? 1000 : 500;
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array(particles * 3);
    const colors = new Float32Array(particles * 3);

    for (let i = 0; i < particles; i++) {
        const i3 = i * 3;
        vertices[i3] = (Math.random() * 2 - 1) * 10;
        vertices[i3 + 1] = (Math.random() * 2 - 1) * 10;
        vertices[i3 + 2] = (Math.random() * 2 - 1) * 10;

        const color = new THREE.Color();
        color.setHSL(Math.random() * 0.1 + 0.9, 0.5, Math.random() * 0.5 + 0.5);
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: isHighPerformanceDevice() ? 0.05 : 0.08,
        vertexColors: true,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);
    camera.position.z = 5;

    let animationFrameId;
    function animate() {
        animationFrameId = requestAnimationFrame(animate);
        points.rotation.x += 0.0005;
        points.rotation.y += 0.0008;
        renderer.render(scene, camera);
    }

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    animate();
    return () => {
        cancelAnimationFrame(animationFrameId);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
    };
}

// Funktion für 3D-Blumenstrauß
function initBouquet() {
    const canvas = document.getElementById('bouquet-canvas');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.z = 5;
    camera.position.y = 2;
    camera.lookAt(0, 0, 0);
    
    const renderer = new THREE.WebGLRenderer({ 
        canvas: canvas,
        antialias: true,
        powerPreference: "low-power"
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Beleuchtung
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Blumenstrauß erstellen
    const bouquet = new THREE.Group();
    const flowerColors = [0xff69b4, 0xff1493, 0xff69b4, 0xffc0cb, 0xff69b4];
    const flowerPositions = [
        [0, 0, 0],
        [-0.5, -0.3, 0.3],
        [0.5, -0.2, 0.2],
        [0.3, 0.2, -0.3],
        [-0.3, 0.1, -0.2]
    ];

    flowerColors.forEach((color, i) => {
        const flower = createFlower(color, 1);
        flower.position.set(...flowerPositions[i]);
        flower.rotation.x = Math.random() * 0.3;
        flower.rotation.z = Math.random() * 0.3;
        bouquet.add(flower);
    });

    scene.add(bouquet);
    bouquet.rotation.x = -0.2;

    let animationFrameId;
    function animate() {
        animationFrameId = requestAnimationFrame(animate);
        bouquet.rotation.y += 0.005;
        bouquet.position.y = Math.sin(Date.now() * 0.001) * 0.1;
        renderer.render(scene, camera);
    }

    const resizeObserver = new ResizeObserver(() => {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    });
    resizeObserver.observe(canvas);

    animate();
    return () => {
        cancelAnimationFrame(animationFrameId);
        resizeObserver.disconnect();
        scene.traverse(object => {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
        renderer.dispose();
    };
}

// Hauptinitialisierung
window.addEventListener('load', () => {
    if (!checkWebGLSupport()) {
        console.log('WebGL nicht verfügbar - Fallback auf statisches Bild');
        return;
    }

    let cleanupBackground = null;
    let cleanupBouquet = null;

    // Starte beide Effekte
    cleanupBackground = initBackgroundParticles();
    cleanupBouquet = initBouquet();

    // Cleanup bei Page Visibility Change
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            if (cleanupBackground) cleanupBackground();
            if (cleanupBouquet) cleanupBouquet();
            cleanupBackground = null;
            cleanupBouquet = null;
        } else {
            if (!cleanupBackground) cleanupBackground = initBackgroundParticles();
            if (!cleanupBouquet) cleanupBouquet = initBouquet();
        }
    });
});

// Optimierte Link-Kopier-Funktion mit Feedback
function copyLink() {
    try {
        navigator.clipboard.writeText(window.location.href).then(() => {
            const feedback = document.createElement('div');
            feedback.textContent = 'Link kopiert!';
            feedback.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 10px 20px;
                border-radius: 20px;
                font-size: 14px;
                z-index: 1000;
                pointer-events: none;
            `;
            document.body.appendChild(feedback);
            setTimeout(() => feedback.remove(), 2000);
        });
    } catch (err) {
        console.warn('Clipboard API nicht verfügbar:', err);
    }
}
