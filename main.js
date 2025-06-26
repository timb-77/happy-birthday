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
    camera.position.z = 3;  // Näher ran für größeren Blumenstrauß
    camera.position.y = 0.5;  // Etwas höher
    camera.lookAt(0, 0, 0);
    
    const renderer = new THREE.WebGLRenderer({ 
        canvas: canvas,
        antialias: true,
        powerPreference: "low-power"
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Optimierte Beleuchtung für das 3D-Modell
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-5, 3, -5);
    scene.add(directionalLight2);

    let bouquet = null;
    let animationFrameId = null;

    // Warte kurz und prüfe dann ob GLTFLoader verfügbar ist
    function checkAndLoadGLTF() {
        if (typeof THREE.GLTFLoader === 'undefined') {
            console.log('GLTFLoader noch nicht verfügbar, warte...');
            // Versuche es nach 500ms nochmal
            setTimeout(checkAndLoadGLTF, 500);
            return;
        }

        console.log('GLTFLoader ist verfügbar, lade Modell...');
        loadGLTFModel();
    }

    function loadGLTFModel() {
        // GLTF-Loader erstellen
        const loader = new THREE.GLTFLoader();

        console.log('Versuche GLTF-Modell zu laden:', 'res/flower_bouquet/scene.gltf');

        // 3D-Modell laden
        loader.load(
            'res/flower_bouquet/scene.gltf',
            function (gltf) {
                console.log('GLTF-Modell erfolgreich geladen:', gltf);
                bouquet = gltf.scene;
                
                // Modell viel größer skalieren und besser positionieren
                bouquet.scale.set(10, 10, 10);  // Viel größer machen (war 2,2,2)
                bouquet.position.set(0, -2.0, 0);  // Weniger nach unten verschieben
                bouquet.rotation.x = -0.1;  // Leichte Neigung
                
                // Schatten aktivieren für alle Meshes im Modell
                bouquet.traverse(function (child) {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        
                        // Material-Optimierungen für bessere Darstellung
                        if (child.material) {
                            child.material.needsUpdate = true;
                        }
                    }
                });
                
                scene.add(bouquet);
                console.log('GLTF-Modell zur Szene hinzugefügt');
                
                // Animation starten
                animate();
            },
            function (progress) {
                console.log('Loading progress: ', (progress.loaded / progress.total * 100) + '%');
            },
            function (error) {
                console.error('Fehler beim Laden des GLTF-Modells:', error);
                console.log('Versuche Fallback-Blumenstrauß zu erstellen...');
                createFallbackBouquet();
            }
        );
    }

    function createFallbackBouquet() {
        console.log('Erstelle Fallback-Blumenstrauß...');
        
        // Erstelle einen einfachen, aber schönen Blumenstrauß als Fallback
        const fallbackBouquet = new THREE.Group();
        
        // Mehrere Blumen in verschiedenen Farben
        const colors = [0xFF69B4, 0xFF1493, 0xFFA500, 0xFFD700, 0x9400D3];
        const positions = [
            [0, 0, 0],
            [-0.5, 0.2, 0.3],
            [0.5, 0.1, 0.2],
            [-0.3, -0.2, -0.2],
            [0.3, -0.1, -0.3]
        ];
        
        colors.forEach((color, i) => {
            // Blüte
            const petalGeometry = new THREE.SphereGeometry(0.3, 8, 6);
            const petalMaterial = new THREE.MeshPhongMaterial({ color: color });
            const petal = new THREE.Mesh(petalGeometry, petalMaterial);
            petal.position.set(...positions[i]);
            petal.position.y += 0.5;
            fallbackBouquet.add(petal);
            
            // Stiel
            const stemGeometry = new THREE.CylinderGeometry(0.02, 0.02, 1);
            const stemMaterial = new THREE.MeshPhongMaterial({ color: 0x228B22 });
            const stem = new THREE.Mesh(stemGeometry, stemMaterial);
            stem.position.set(...positions[i]);
            fallbackBouquet.add(stem);
        });
        
        bouquet = fallbackBouquet;
        scene.add(bouquet);
        animate();
    }

    function animate() {
        animationFrameId = requestAnimationFrame(animate);
        
        if (bouquet) {
            // Sanfte Rotation
            bouquet.rotation.y += 0.005;
            // Leichte Auf-und-Ab-Bewegung
            bouquet.position.y = (bouquet.position.y || 0) + Math.sin(Date.now() * 0.001) * 0.001;
        }
        
        renderer.render(scene, camera);
    }

    const resizeObserver = new ResizeObserver(() => {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    });
    resizeObserver.observe(canvas);

    // Starte die Überprüfung
    checkAndLoadGLTF();

    return () => {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
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

// Funktion zum Anzeigen der Lizenzinformationen
function showLicense() {
    const licenseText = `Model Information:
• title: Flower Bouquet
• source: https://sketchfab.com/3d-models/flower-bouquet-48e92013548247a9ad486dc13110c9b4
• author: icecool (https://sketchfab.com/icecool)

Model License:
• license type: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
• requirements: Author must be credited. Commercial use is allowed.

If you use this 3D model in your project be sure to copy paste this credit wherever you share it:
This work is based on "Flower Bouquet" (https://sketchfab.com/3d-models/flower-bouquet-48e92013548247a9ad486dc13110c9b4) by icecool (https://sketchfab.com/icecool) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)`;

    // Erstelle eine mobile-freundliche Modal-Box
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        padding: 20px;
        box-sizing: border-box;
    `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: white;
        padding: 20px;
        border-radius: 15px;
        max-width: 90%;
        max-height: 80%;
        overflow-y: auto;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        font-family: Arial, sans-serif;
        line-height: 1.4;
    `;

    const title = document.createElement('h3');
    title.textContent = 'License Information';
    title.style.cssText = `
        margin: 0 0 15px 0;
        color: #FF1493;
        text-align: center;
        font-size: 1.2em;
    `;

    const content = document.createElement('pre');
    content.textContent = licenseText;
    content.style.cssText = `
        white-space: pre-wrap;
        word-wrap: break-word;
        font-family: Arial, sans-serif;
        font-size: 14px;
        margin: 0 0 20px 0;
        color: #333;
    `;

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Schließen';
    closeButton.style.cssText = `
        background: linear-gradient(45deg, #FF69B4, #FF1493);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 20px;
        cursor: pointer;
        font-size: 16px;
        width: 100%;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    `;

    closeButton.onclick = function() {
        document.body.removeChild(modal);
    };

    // Touch-Event für mobile Geräte
    closeButton.ontouchstart = function() {
        this.style.transform = 'scale(0.95)';
    };
    closeButton.ontouchend = function() {
        this.style.transform = 'scale(1)';
    };

    // Modal schließen beim Klick auf den Hintergrund
    modal.onclick = function(e) {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    };

    modalContent.appendChild(title);
    modalContent.appendChild(content);
    modalContent.appendChild(closeButton);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Verhindere Scrollen im Hintergrund
    document.body.style.overflow = 'hidden';
    
    // Stelle Scrollen wieder her, wenn Modal geschlossen wird
    const originalClose = closeButton.onclick;
    closeButton.onclick = function() {
        document.body.style.overflow = '';
        originalClose();
    };
    
    const originalModalClick = modal.onclick;
    modal.onclick = function(e) {
        if (e.target === modal) {
            document.body.style.overflow = '';
            originalModalClick(e);
        }
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
