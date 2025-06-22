"use strict";

// JavaScript für optionale WebGL-Effekte
// Diese Funktion wird nur ausgeführt, wenn WebGL-Effekte aktiviert sind.
function initWebGL() {
    const canvas = document.getElementById('webgl-canvas');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true }); // Alpha true für transparenten Hintergrund
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Eine einfache Partikelwolke erstellen
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];
    const particles = 1000;

    for (let i = 0; i < particles; i++) {
        // Zufällige Positionen für Partikel
        const x = (Math.random() * 2 - 1) * 10;
        const y = (Math.random() * 2 - 1) * 10;
        const z = (Math.random() * 2 - 1) * 10;
        vertices.push(x, y, z);

        // Zufällige Farben (z.B. Rosatöne und Weiß)
        const color = new THREE.Color();
        color.setHSL(Math.random() * 0.1 + 0.9, 0.5, Math.random() * 0.5 + 0.5); // Rosatöne
        colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    camera.position.z = 5;

    // Animations-Loop
    function animate() {
        requestAnimationFrame(animate);

        // Partikel sanft rotieren lassen
        points.rotation.x += 0.0005;
        points.rotation.y += 0.0008;

        renderer.render(scene, camera);
    }

    // Responsivität: Renderer-Größe anpassen, wenn das Fenster geändert wird
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    animate();
}

// Starte die WebGL-Initialisierung, sobald das Fenster geladen ist
window.onload = function() {
    initWebGL();
};

// Funktion zum Kopieren des Links (Beispiel für eine mögliche Interaktion)
function copyLink() {
    const el = document.createElement('textarea');
    el.value = window.location.href; // Der aktuelle Link der Seite
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    // Hier könnte man ein temporäres "Link kopiert!" anzeigen, anstelle von alert()
    console.log('Link copied to clipboard!'); // Nur für Debugging
}
