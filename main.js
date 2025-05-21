// 1. Import Three.js (access THREE globally)

// Movement and camera control variables
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
// let canJump = false; // Optional: for jumping later

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
let playerPosition = new THREE.Vector3(0, 1.6, 0); // Initial player position

let euler = new THREE.Euler(0, 0, 0, 'YXZ'); // To control camera orientation
const PI_2 = Math.PI / 2;

// 2. Scene, Camera, Renderer
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const container = document.getElementById('container');
if (container) {
    container.appendChild(renderer.domElement);
} else {
    console.error("Container element not found!");
    document.body.appendChild(renderer.domElement); // Fallback to body
}

// 3. Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// 4. Museum Structure
// Ground
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x808080, side: THREE.DoubleSide });
const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
groundMesh.rotation.x = -Math.PI / 2;
scene.add(groundMesh);

// Walls
const wallHeight = 10;
const wallThickness = 0.5;
const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc });

// Front wall
const frontWallGeometry = new THREE.BoxGeometry(20, wallHeight, wallThickness);
const frontWallMesh = new THREE.Mesh(frontWallGeometry, wallMaterial);
frontWallMesh.position.set(0, wallHeight / 2, -15);
scene.add(frontWallMesh);

// Back wall
const backWallGeometry = new THREE.BoxGeometry(20, wallHeight, wallThickness);
const backWallMesh = new THREE.Mesh(backWallGeometry, wallMaterial);
backWallMesh.position.set(0, wallHeight / 2, 15);
scene.add(backWallMesh);

// Left wall
const leftWallGeometry = new THREE.BoxGeometry(30, wallHeight, wallThickness);
const leftWallMesh = new THREE.Mesh(leftWallGeometry, wallMaterial);
leftWallMesh.position.set(-10, wallHeight / 2, 0);
leftWallMesh.rotation.y = Math.PI / 2;
scene.add(leftWallMesh);

// Right wall
const rightWallGeometry = new THREE.BoxGeometry(30, wallHeight, wallThickness);
const rightWallMesh = new THREE.Mesh(rightWallGeometry, wallMaterial);
rightWallMesh.position.set(10, wallHeight / 2, 0);
rightWallMesh.rotation.y = Math.PI / 2;
scene.add(rightWallMesh);

// Placeholder Artworks
const artworkMaterial1 = new THREE.MeshStandardMaterial({ color: 0xff0000 }); // Red
const artworkMaterial2 = new THREE.MeshStandardMaterial({ color: 0x00ff00 }); // Green
const artworkMaterial3 = new THREE.MeshStandardMaterial({ color: 0x0000ff }); // Blue

// Artwork 1: A Red Cube
const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
const cubeArtwork = new THREE.Mesh(cubeGeometry, artworkMaterial1);
cubeArtwork.position.set(-6, 1, -10); // Adjusted position
scene.add(cubeArtwork);

// Artwork 2: A Green Sphere
const sphereGeometry = new THREE.SphereGeometry(1.5, 32, 32);
const sphereArtwork = new THREE.Mesh(sphereGeometry, artworkMaterial2);
sphereArtwork.position.set(6, 1.5, -8); // Adjusted position
scene.add(sphereArtwork);

// Artwork 3: A Blue Cylinder "Statue"
const cylinderGeometry = new THREE.CylinderGeometry(0.5, 0.5, 3, 32);
const cylinderArtwork = new THREE.Mesh(cylinderGeometry, artworkMaterial3);
cylinderArtwork.position.set(0, 1.5, 12); // Adjusted position, centered towards the back wall
scene.add(cylinderArtwork);

// Artwork 4: A smaller, different colored cube on a "pedestal"
const smallCubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const smallCubeMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 }); // Yellow
const smallCubeArtwork = new THREE.Mesh(smallCubeGeometry, smallCubeMaterial);
smallCubeArtwork.position.set(7, 2.5, 8); // Adjusted position, positioned higher
scene.add(smallCubeArtwork);

// Pedestal for the small cube
const pedestalGeometry = new THREE.BoxGeometry(1.2, 2, 1.2); // Slightly wider and taller base
const pedestalMaterial = new THREE.MeshStandardMaterial({ color: 0x505050 }); // Dark grey
const pedestal = new THREE.Mesh(pedestalGeometry, pedestalMaterial);
pedestal.position.set(7, 1, 8); // Adjusted position, y position is half its height
scene.add(pedestal);

// (Old initial camera position removed, now handled by playerPosition)

// Pointer Lock and Mouse Controls
document.body.addEventListener('click', function () {
    document.body.requestPointerLock();
});

document.body.addEventListener('mousemove', (event) => {
    if (document.pointerLockElement === document.body) {
        euler.y -= event.movementX * 0.002; // Yaw
        euler.x -= event.movementY * 0.002; // Pitch
        euler.x = Math.max(-PI_2, Math.min(PI_2, euler.x)); // Clamp pitch
    }
});

// Keyboard Controls
document.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'KeyW': moveForward = true; break;
        case 'KeyA': moveLeft = true; break;
        case 'KeyS': moveBackward = true; break;
        case 'KeyD': moveRight = true; break;
        // case 'Space': if (canJump) velocity.y += 10; canJump = false; break; // Optional Jump
    }
});

document.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'KeyW': moveForward = false; break;
        case 'KeyA': moveLeft = false; break;
        case 'KeyS': moveBackward = false; break;
        case 'KeyD': moveRight = false; break;
    }
});

// 6. Render Loop
let prevTime = performance.now();

function animate() {
    requestAnimationFrame(animate);

    const time = performance.now();
    const delta = (time - prevTime) / 1000;

    // Stop decay of velocity from friction
    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;
    // velocity.y -= 9.8 * 10.0 * delta; // Gravity

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveLeft) - Number(moveRight);
    direction.normalize(); // Ensure consistent movement speed

    if (moveForward || moveBackward) velocity.z -= direction.z * 40.0 * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * 40.0 * delta;

    // Apply movement relative to camera direction
    const moveDirection = new THREE.Vector3(-velocity.x, 0, -velocity.z).applyEuler(euler);
    playerPosition.x += moveDirection.x * delta;
    playerPosition.z += moveDirection.z * delta;
    // playerPosition.y += velocity.y * delta; // For jumping/gravity

    // Basic ground collision
    if (playerPosition.y < 1.6) {
        // velocity.y = 0;
        playerPosition.y = 1.6;
        // canJump = true;
    }

    // Basic wall collision
    // Room boundaries (adjust based on your wall positions and thickness)
    // Walls are at +/-10 for X and +/-15 for Z, thickness 0.5
    // Player radius/size estimate (e.g., 0.25)
    const playerRadius = 0.25; 
    const roomMinX = -10 + wallThickness / 2 + playerRadius; // Left wall: x = -10
    const roomMaxX = 10 - wallThickness / 2 - playerRadius;  // Right wall: x = 10
    const roomMinZ = -15 + wallThickness / 2 + playerRadius; // Front wall: z = -15
    const roomMaxZ = 15 - wallThickness / 2 - playerRadius;  // Back wall: z = 15

    playerPosition.x = Math.max(roomMinX, Math.min(roomMaxX, playerPosition.x));
    playerPosition.z = Math.max(roomMinZ, Math.min(roomMaxZ, playerPosition.z));

    // Update camera
    camera.quaternion.setFromEuler(euler);
    camera.position.copy(playerPosition);

    renderer.render(scene, camera);
    prevTime = time;
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}, false);

animate();
