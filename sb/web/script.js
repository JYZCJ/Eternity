let analyzer;
let scene, camera, renderer, kaleidoscope, analyser, dataArray, bufferLength;
let audioContext;
let cubes = [];

const startButton = document.getElementById('startButton');
startButton.addEventListener('click', init);

async function init() {
    startButton.style.display = 'none';

    // Set up the scene
    setupScene();
    setupAudio();
    animate();
}

function setupScene() {
    scene = new THREE.Scene();

    // Set up the camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Set up the renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Create cubes for the background
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshPhongMaterial({ color: 0x333333, specular: 0x555555 });

    for (let i = 0; i < 1000; i++) {
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.position.set(Math.random() * 200 - 100, Math.random() * 200 - 100, Math.random() * 200 - 100);
        scene.add(cube);
        cubes.push(cube);
    }

    // Create the sphere with wireframe
    const sphereGeometry = new THREE.IcosahedronGeometry(2, 1);
    const wireframeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
    kaleidoscope = new THREE.Mesh(sphereGeometry, wireframeMaterial);
    scene.add(kaleidoscope);

    // Lighting
    const light = new THREE.PointLight(0xffffff, 1, 500);
    light.position.set(0, 0, 25);
    scene.add(light);

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
}

function setupAudio() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        const source = audioContext.createMediaStreamSource(stream);
        analyzer = audioContext.createAnalyser();
        source.connect(analyzer);
        analyzer.fftSize = 256;
    }).catch(error => {
        console.error('Error accessing audio stream:', error);
    });
}

// 调用 setupAudio 函数来初始化 audio 和 analyzer
setupAudio();


function animate() {
    requestAnimationFrame(animate);

    if (analyzer) {
        const dataArray = new Uint8Array(analyzer.frequencyBinCount);
        analyzer.getByteFrequencyData(dataArray);

        let average = dataArray.reduce((a, b) => a + b, 0) / dataArray.len  gth;
        let scale = Math.max(0.5, average / 128); // 最小值为 0.5
        kaleidoscope.scale.set(scale, scale, scale);
    }

    // 自动旋转球体
    kaleidoscope.rotation.x += 0.01;
    kaleidoscope.rotation.y += 0.01;

    renderer.render(scene, camera);
}








window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


// 鼠标拖动交互
let isDragging = false;
let previousMousePosition = {
    x: 0,
    y: 0
};

document.addEventListener('mousedown', function(e) {
    isDragging = true;
});

document.addEventListener('mousemove', function(e) {
    if (isDragging && kaleidoscope) { // 确保 kaleidoscope 已初始化
        let deltaMove = {
            x: e.offsetX - previousMousePosition.x,
            y: e.offsetY - previousMousePosition.y
        };

        let deltaRotationQuaternion = new THREE.Quaternion()
            .setFromEuler(new THREE.Euler(
                toRadians(deltaMove.y * 1),
                toRadians(deltaMove.x * 1),
                0,
                'XYZ'
            ));

        kaleidoscope.quaternion.multiplyQuaternions(deltaRotationQuaternion, kaleidoscope.quaternion);
    }

    previousMousePosition = {
        x: e.offsetX,
        y: e.offsetY
    };
});

document.addEventListener('mouseup', function(e) {
    isDragging = false;
});

function toRadians(angle) {
    return angle * (Math.PI / 180);
}

function onWindowResize() {
    if (camera) { // 确保 camera 已初始化
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
window.addEventListener('resize', onWindowResize);
