import * as THREE from 'three';
import { GLTFLoader } from '/node_modules/three/examples/jsm/loaders/GLTFLoader.js';

document.addEventListener('DOMContentLoaded', () => {
    // The check for THREE might still be useful, but is less critical with direct imports.
    // If the import fails, the script likely won't execute this far anyway.
    if (typeof THREE === 'undefined' || typeof THREE !== 'object') {
        console.error('CRITICAL: THREE.js library not loaded or not an object. Ensure the CDN link in index.html is correct and accessible.');
        // Display a message to the user on the page itself
        const container = document.getElementById('container') || document.body;
        container.innerHTML = '<div style="padding: 20px; text-align: center; font-family: sans-serif; font-size: 18px; color: red;">Error: THREE.js library failed to load. Please check your internet connection and the browser console for more details.</div>';
        return; // Stop further execution
    }

    try {
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

// Artwork 2: A Green Sphere (REMOVED)
// const sphereGeometry = new THREE.SphereGeometry(1.5, 32, 32);
// const sphereArtwork = new THREE.Mesh(sphereGeometry, artworkMaterial2);
// sphereArtwork.position.set(6, 1.5, -8); // Adjusted position
// scene.add(sphereArtwork);

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

// Player Collision Constants
const playerCollisionRadius = 0.25;
const playerCollisionHeight = 1.6; // Total height of player's collision box
const playerCollisionBoxCenterY = playerCollisionHeight / 2; // Center Y for a box standing on y=0

// Artwork Bounding Boxes Array
const artworkBoundingBoxes = [];
const artworksToCollide = [cubeArtwork, cylinderArtwork, smallCubeArtwork, pedestal]; // Removed sphereArtwork

artworksToCollide.forEach(artworkMesh => {
    artworkMesh.updateMatrixWorld(true); // Ensure matrix is current
    const box = new THREE.Box3().setFromObject(artworkMesh);
    artworkBoundingBoxes.push(box);
});

// Load GLTF Dinosaur Model
const loader = new GLTFLoader();
loader.load(
    'dino/scene.gltf', // Path to your GLTF file
    function (gltf) {
        // Called when the resource is loaded
        const dinoModel = gltf.scene;

        // --- Positioning and Scaling ---
        // The old sphere was at x=6, y=1.5 (center), z=-8.
        // We want the base of the dino to be on the ground (y=0).
        dinoModel.position.set(6, 2, -8);

        // --- Initial Scaling (NEEDS ADJUSTMENT BY USER LATER) ---
        // Calculate current bounding box to make an informed guess for scale.
        const initialBox = new THREE.Box3().setFromObject(dinoModel);
        const initialSize = new THREE.Vector3();
        initialBox.getSize(initialSize);

        // Let's aim for a height of around 1.5 to 2 units for now.
        const targetHeight = 1.5;
        let scaleFactor = 1;
        if (initialSize.y > 0) { // Avoid division by zero or very small numbers
            scaleFactor = targetHeight / initialSize.y;
        } else if (initialSize.x > 0) { // Fallback to x or z if y is 0
             scaleFactor = targetHeight / initialSize.x;
        } else if (initialSize.z > 0) {
             scaleFactor = targetHeight / initialSize.z;
        }
        
        // If initialSize is tiny or zero, scaleFactor could become huge or NaN. Cap it.
        if (!isFinite(scaleFactor) || scaleFactor > 1000 || scaleFactor < 0.001) {
            scaleFactor = 1; // Default to 1 if calculation is off
        }

        dinoModel.scale.set(scaleFactor, scaleFactor, scaleFactor);
        
        // Re-center after scaling if model's origin isn't at its base.
        // For now, we assume origin is at the base for y=0 positioning.
        // If the model appears half-buried or floating, its internal origin is different.
        // A common adjustment after scaling, if origin is centered:
        // const scaledBox = new THREE.Box3().setFromObject(dinoModel);
        // dinoModel.position.y -= (scaledBox.min.y - dinoModel.position.y); // Aligns bottom of scaled box with current y position

        scene.add(dinoModel);

        // --- Collision Setup for the Loaded Model ---
        dinoModel.updateMatrixWorld(true); // Ensure transformations are applied
        const dinoBoundingBox = new THREE.Box3().setFromObject(dinoModel);
        artworkBoundingBoxes.push(dinoBoundingBox); // Add to existing array

        console.log('Dinosaur model loaded and added to scene.');
        // If artworkBoundingBoxes was fully populated before, this new box is simply added.
        // If it's populated *after* this async load, then this model needs to be included there.
        // The current setup adds static artwork boxes first, then this one. This is fine.

    },
    function (xhr) {
        // Called while loading is progressing
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
        // Called when loading has errors
        console.error('An error happened while loading the GLTF model:', error);
        const container = document.getElementById('container') || document.body;
        container.innerHTML += '<div style="padding: 5px; text-align: center; font-family: sans-serif; font-size: 16px; color: orange;">Warning: Could not load the dinosaur model. See console for details.</div>';
    }
);

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

    // --- Start of New Artwork Collision Logic ---

    const eulerForMovement = new THREE.Euler(0, euler.y, 0, 'YXZ'); // Use only camera's yaw for FPS movement

    // Store current position before artwork collision checks (not strictly needed here as we apply valid moves directly)
    // let preArtworkCollisionPosX = playerPosition.x;
    // let preArtworkCollisionPosZ = playerPosition.z;

    // Proposed X-axis movement
    let localDeltaX = velocity.x * delta; // CORRECTED: Removed negation
    let worldDeltaXVec = new THREE.Vector3(localDeltaX, 0, 0).applyEuler(eulerForMovement);
    let potentialPosX = playerPosition.x + worldDeltaXVec.x;

    let tempPlayerBoxX = new THREE.Box3();
    tempPlayerBoxX.setFromCenterAndSize(
        new THREE.Vector3(potentialPosX, playerCollisionBoxCenterY, playerPosition.z),
        new THREE.Vector3(playerCollisionRadius * 2, playerCollisionHeight, playerCollisionRadius * 2)
    );

    let collisionX = false;
    for (const artBox of artworkBoundingBoxes) {
        if (tempPlayerBoxX.intersectsBox(artBox)) {
            collisionX = true;
            // velocity.x = 0; // Optional: Stop further pushing if input is held
            break;
        }
    }

    if (!collisionX) {
        playerPosition.x = potentialPosX;
    }
    // else playerPosition.x remains at its current value for this frame's X-movement part


    // Proposed Z-axis movement (using the potentially updated playerPosition.x from X-check)
    let localDeltaZ = velocity.z * delta; // CORRECTED: Removed negation
    let worldDeltaZVec = new THREE.Vector3(0, 0, localDeltaZ).applyEuler(eulerForMovement);
    let potentialPosZ = playerPosition.z + worldDeltaZVec.z;

    let tempPlayerBoxZ = new THREE.Box3();
    tempPlayerBoxZ.setFromCenterAndSize(
        new THREE.Vector3(playerPosition.x, playerCollisionBoxCenterY, potentialPosZ), // Use current/updated playerPosition.x
        new THREE.Vector3(playerCollisionRadius * 2, playerCollisionHeight, playerCollisionRadius * 2)
    );

    let collisionZ = false;
    for (const artBox of artworkBoundingBoxes) {
        if (tempPlayerBoxZ.intersectsBox(artBox)) {
            collisionZ = true;
            // velocity.z = 0; // Optional: Stop further pushing
            break;
        }
    }

    if (!collisionZ) {
        playerPosition.z = potentialPosZ;
    }
    // else playerPosition.z remains at its current value for this frame's Z-movement part

    // --- End of New Artwork Collision Logic ---
    
    // playerPosition.y += velocity.y * delta; // For jumping/gravity

    // Basic ground collision
    // This sets camera height. The collision box for artworks is relative to y=0 ground.
    if (playerPosition.y < 1.6) {
        // velocity.y = 0;
        playerPosition.y = 1.6;
        // canJump = true;
    }

    // Basic wall collision (uses playerPosition updated by artwork collision)
    // Room boundaries (adjust based on your wall positions and thickness)
    // Walls are at +/-10 for X and +/-15 for Z, thickness 0.5
    // Player radius/size estimate
    const playerRadius = 0.25; // Make sure this is defined

    // Wall boundaries (inner surfaces)
    // wallThickness is 0.5
    // Front wall: position z = -15
    // Back wall: position z = 15
    // Left wall: position x = -10
    // Right wall: position x = 10
    const frontWallZ = -15 + (wallThickness / 2);
    const backWallZ  =  15 - (wallThickness / 2);
    const leftWallX  = -10 + (wallThickness / 2);
    const rightWallX =  10 - (wallThickness / 2);

    // Calculate potential new positions (using playerPosition already updated by artwork collision)
    // The wall collision logic operates on the already (potentially) modified playerPosition.x and playerPosition.z
    // from the artwork collision step.
    // We are now checking if this new position (after artwork handling) collides with walls.
    
    // X-axis wall collision (uses playerRadius for wall collision, distinct from playerCollisionRadius for artworks if needed)
    if (worldDeltaXVec.x > 0) { // Attempting to move right relative to world
        if (playerPosition.x + playerRadius > rightWallX) { // playerPosition.x is now potentialPosX if no art collision
            playerPosition.x = rightWallX - playerRadius;
            // velocity.x = 0; // Velocity already reflects input, stopping here might feel abrupt if sliding
        }
    } else if (worldDeltaXVec.x < 0) { // Attempting to move left
        if (playerPosition.x - playerRadius < leftWallX) {
            playerPosition.x = leftWallX + playerRadius;
            // velocity.x = 0;
        }
    }

    // Z-axis wall collision
    if (worldDeltaZVec.z > 0) { // Attempting to move towards +Z world
        if (playerPosition.z + playerRadius > backWallZ) {
            playerPosition.z = backWallZ - playerRadius;
            // velocity.z = 0;
        }
    } else if (worldDeltaZVec.z < 0) { // Attempting to move towards -Z world
        if (playerPosition.z - playerRadius < frontWallZ) {
            playerPosition.z = frontWallZ + playerRadius;
            // velocity.z = 0;
        }
    }
    // Note: The velocity.z logic might seem inverted here compared to direction.z.
    // This is because moveDirection.z is -velocity.z.
    // So if velocity.z is negative (moveForward), moveDirection.z is positive.
    // And if velocity.z is positive (moveBackward), moveDirection.z is negative.
    // The conditions "moveDirection.z > 0" means player is trying to move towards +Z world axis.
    // The conditions "moveDirection.z < 0" means player is trying to move towards -Z world axis.

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

    } catch (error) {
        console.error("An error occurred during Three.js setup or runtime:", error);
        const container = document.getElementById('container') || document.body;
        container.innerHTML = `<div style="padding: 20px; text-align: center; font-family: sans-serif; font-size: 18px; color: red;">An error occurred: ${error.message}. Please check the browser console for more details.</div>`;
    }
});
