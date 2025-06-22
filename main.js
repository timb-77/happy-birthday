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
    
    // Mehr Blütenblätter
    const petalCount = 12;
    const petalGeometry = new THREE.ConeGeometry(size * 0.2, size * 0.5, 8);
    const petalMaterial = new THREE.MeshPhongMaterial({
        color: color,
        shininess: 100,
        side: THREE.DoubleSide
    });

    // Innere und äußere Blütenblätter
    for (let i = 0; i < petalCount; i++) {
        // Äußere Blütenblätter
        const petal = new THREE.Mesh(petalGeometry, petalMaterial);
        petal.position.y = size * 0.25;
        petal.rotation.z = (Math.PI * 2 / petalCount) * i;
        petal.rotation.x = Math.PI / 3;
        group.add(petal);

        // Innere Blütenblätter, etwas kleiner und versetzt
        if (i % 2 === 0) {
            const innerPetal = new THREE.Mesh(petalGeometry, petalMaterial);
            innerPetal.scale.set(0.7, 0.7, 0.7);
            innerPetal.position.y = size * 0.2;
            innerPetal.rotation.z = (Math.PI * 2 / petalCount) * i + Math.PI / petalCount;
            innerPetal.rotation.x = Math.PI / 3;
            group.add(innerPetal);
        }
    }

    // Blütenmitte mit mehr Details
    const centerGeometry = new THREE.SphereGeometry(size * 0.18, 16, 16);
    const centerMaterial = new THREE.MeshPhongMaterial({
        color: 0xffd700,
        shininess: 80
    });
    const center = new THREE.Mesh(centerGeometry, centerMaterial);
    center.position.y = size * 0.25;
    group.add(center);

    // Stängel mit Verdickung am oberen Ende
    const stemGeometry = new THREE.CylinderGeometry(
        size * 0.04, // Oben dicker
        size * 0.02, // Unten dünner
        size * 1.2   // Etwas länger
    );
    const stemMaterial = new THREE.MeshPhongMaterial({
        color: 0x228B22,
        shininess: 30
    });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.y = -size * 0.35;
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
    camera.position.z = 6;  // Etwas weiter weg für bessere Übersicht
    camera.position.y = 1;  // Nicht mehr so weit oben
    camera.lookAt(0, 0, 0);
    
    const renderer = new THREE.WebGLRenderer({ 
        canvas: canvas,
        antialias: true,
        powerPreference: "low-power"
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Verbesserte Beleuchtung
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-5, 3, -5);
    scene.add(directionalLight2);

    // Blumenstrauß erstellen
    const bouquet = new THREE.Group();
    
    // Mehr Farben für einen prächtigeren Strauß
    const flowerColors = [
        0x8B0000,  // Dunkelrot
        0xFFA500,  // Orange
        0xFFD700,  // Gold/Gelb
        0x800080,  // Lila
        0x9400D3,  // Violett
        0xFF1493,  // Pink
        0xFF69B4,  // Rosa
        0x8B0000,  // Dunkelrot
        0xFFA500,  // Orange
        0x800080,  // Lila
        0xFF1493,  // Pink
        0xFFD700   // Gold/Gelb
    ];

    // Mehr Positionen für die Blumen, in einer natürlicheren Anordnung
    const flowerPositions = [
        // Zentrale Blumen
        [0, 0.5, 0],      // Mittlere Hauptblume
        [-0.4, 0.3, 0.2], // Links oben
        [0.4, 0.4, 0.1],  // Rechts oben
        [0, 0.6, -0.3],   // Hinten mitte
        
        // Äußere Blumen
        [-0.8, -0.2, 0.4],  // Links außen
        [0.8, -0.1, 0.3],   // Rechts außen
        [0.5, 0.2, -0.5],   // Hinten rechts
        [-0.5, 0.1, -0.4],  // Hinten links
        
        // Füllblumen
        [-0.3, -0.3, 0.2],  // Unten links
        [0.3, -0.2, 0.1],   // Unten rechts
        [0, -0.4, -0.2],    // Unten mitte
        [0.2, 0.3, -0.3]    // Oben mitte
    ];

    // Verschiedene Größen für mehr Dynamik
    const flowerSizes = [
        1.2, // Hauptblume
        1.0, 1.0, 1.0,  // Obere Blumen
        0.9, 0.9, 0.9, 0.9,  // Äußere Blumen
        0.8, 0.8, 0.8, 0.8   // Füllblumen
    ];

    // Erstelle alle Blumen
    flowerColors.forEach((color, i) => {
        const flower = createFlower(color, flowerSizes[i]);
        flower.position.set(...flowerPositions[i]);
        
        // Zufällige Rotation für natürlicheres Aussehen
        flower.rotation.x = Math.random() * 0.4 - 0.2;
        flower.rotation.z = Math.random() * 0.4 - 0.2;
        flower.rotation.y = Math.random() * Math.PI * 2; // Volle Rotation um Y-Achse möglich
        
        bouquet.add(flower);
    });

    // Füge einige Blätter hinzu
    const leafColor = 0x228B22; // Waldgrün
    for (let i = 0; i < 8; i++) {
        const leaf = createLeaf(leafColor, 1.2);
        leaf.position.set(
            Math.random() * 2 - 1,  // X: -1 bis 1
            Math.random() * -0.5,    // Y: Unterer Bereich
            Math.random() * 2 - 1   // Z: -1 bis 1
        );
        leaf.rotation.x = Math.random() * 0.5 - 0.25;
        leaf.rotation.y = Math.random() * Math.PI * 2;
        leaf.rotation.z = Math.random() * 0.5 - 0.25;
        bouquet.add(leaf);
    }

    scene.add(bouquet);
    bouquet.rotation.x = -0.2;  // Leichte Neigung nach vorne

    let animationFrameId;
    function animate() {
        animationFrameId = requestAnimationFrame(animate);
        bouquet.rotation.y += 0.003; // Langsamere Rotation
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

// Neue Funktion für Blätter
function createLeaf(color, size) {
    const group = new THREE.Group();
    
    // Blattform als abgeflachter, gebogener Kegel
    const leafGeometry = new THREE.ConeGeometry(size * 0.15, size * 0.6, 8, 1, true);
    leafGeometry.scale(1, 1, 0.2); // Abflachen
    
    // Materialien mit verschiedenen Grüntönen
    const leafMaterial = new THREE.MeshPhongMaterial({
        color: color,
        shininess: 30,
        side: THREE.DoubleSide
    });

    const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
    leaf.rotation.x = Math.PI / 2; // Horizontal ausrichten
    group.add(leaf);

    return group;
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
