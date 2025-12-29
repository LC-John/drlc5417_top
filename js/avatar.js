import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';

class AvatarController {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.vrm = null;
        this.clock = new THREE.Clock();
        this.videoElement = null;
        this.faceLandmarker = null;
        this.poseLandmarker = null;
        this.isRunning = false;
        this.animationFrameId = null;
        this.lastResults = null;
        this.lastPoseResults = null;
        this.smoothedBones = {};
    }

    async init() {
        const canvas = document.getElementById('avatar-canvas');
        const container = canvas.parentElement;
        
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x2a2a2a);
        
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        this.camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
        this.camera.position.set(0, 1.45, 1.2);
        this.camera.lookAt(0, 1.35, 0);
        
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);
        
        const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
        backLight.position.set(-1, 1, -1);
        this.scene.add(backLight);

        await this.loadVRM();
        this.setupResizeObserver(container);
        this.animate();
    }

    async loadVRM() {
        const loadingElement = document.getElementById('avatar-loading');
        
        const loader = new GLTFLoader();
        loader.register((parser) => new VRMLoaderPlugin(parser));
        
        try {
            const gltf = await loader.loadAsync('models/avatar.vrm');
            this.vrm = gltf.userData.vrm;
            
            VRMUtils.removeUnnecessaryJoints(this.vrm.scene);
            VRMUtils.removeUnnecessaryVertices(this.vrm.scene);
            
            this.setNaturalPose();
            this.scene.add(this.vrm.scene);
            
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
        } catch (error) {
            console.error('Error loading VRM:', error);
            if (loadingElement) {
                loadingElement.textContent = 'Failed to load VRM model';
            }
        }
    }

    setupResizeObserver(container) {
        const resizeObserver = new ResizeObserver(() => {
            const width = container.clientWidth;
            const height = container.clientHeight;
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        });
        resizeObserver.observe(container);
    }

    setNaturalPose() {
        if (!this.vrm || !this.vrm.humanoid) return;
        
        const leftUpperArm = this.vrm.humanoid.getNormalizedBoneNode('leftUpperArm');
        const rightUpperArm = this.vrm.humanoid.getNormalizedBoneNode('rightUpperArm');
        const leftLowerArm = this.vrm.humanoid.getNormalizedBoneNode('leftLowerArm');
        const rightLowerArm = this.vrm.humanoid.getNormalizedBoneNode('rightLowerArm');
        
        if (leftUpperArm) {
            leftUpperArm.rotation.z = -Math.PI * 0.4;
        }
        if (rightUpperArm) {
            rightUpperArm.rotation.z = Math.PI * 0.4;
        }
        if (leftLowerArm) {
            leftLowerArm.rotation.z = -Math.PI * 0.05;
        }
        if (rightLowerArm) {
            rightLowerArm.rotation.z = Math.PI * 0.05;
        }
    }

    async startCamera() {
        const statusElement = document.getElementById('avatar-status');
        const startButton = document.getElementById('avatar-start-btn');
        
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Camera access requires HTTPS. Please visit https://drlc5417.top');
            }
            
            statusElement.textContent = 'Requesting camera...';
            
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: 640, height: 480 }
            });
            
            this.videoElement = document.getElementById('avatar-video');
            this.videoElement.srcObject = stream;
            
            await new Promise((resolve) => {
                this.videoElement.onloadedmetadata = resolve;
            });
            
            statusElement.textContent = 'Loading face + body detection...';
            await Promise.all([
                this.initFaceLandmarker(),
                this.initPoseLandmarker()
            ]);
            
            this.isRunning = true;
            startButton.textContent = 'Stop Camera';
            statusElement.textContent = 'Tracking: Face + Body';
            
            this.detect();
        } catch (error) {
            console.error('Camera error:', error);
            statusElement.textContent = 'Camera: Error - ' + error.message;
        }
    }

    async initFaceLandmarker() {
        const { FaceLandmarker, FilesetResolver } = await import(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/vision_bundle.mjs'
        );
        
        const filesetResolver = await FilesetResolver.forVisionTasks(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm'
        );
        
        this.faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
            baseOptions: {
                modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
                delegate: 'GPU'
            },
            runningMode: 'VIDEO',
            numFaces: 1,
            outputFaceBlendshapes: true,
            outputFacialTransformationMatrixes: true
        });
    }

    async initPoseLandmarker() {
        const { PoseLandmarker, FilesetResolver } = await import(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/vision_bundle.mjs'
        );
        
        const filesetResolver = await FilesetResolver.forVisionTasks(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm'
        );
        
        this.poseLandmarker = await PoseLandmarker.createFromOptions(filesetResolver, {
            baseOptions: {
                modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
                delegate: 'GPU'
            },
            runningMode: 'VIDEO',
            numPoses: 1
        });
    }

    detect() {
        if (!this.isRunning || !this.videoElement) return;
        
        const timestamp = performance.now();
        
        if (this.faceLandmarker) {
            const faceResults = this.faceLandmarker.detectForVideo(this.videoElement, timestamp);
            this.lastResults = faceResults;
            if (this.vrm && faceResults.faceBlendshapes && faceResults.faceBlendshapes.length > 0) {
                this.applyFaceToVRM(faceResults);
            }
        }
        
        if (this.poseLandmarker) {
            const poseResults = this.poseLandmarker.detectForVideo(this.videoElement, timestamp);
            this.lastPoseResults = poseResults;
            if (this.vrm && poseResults.landmarks && poseResults.landmarks.length > 0) {
                this.applyPoseToVRM(poseResults);
            }
        }
        
        requestAnimationFrame(() => this.detect());
    }

    applyFaceToVRM(results) {
        const blendshapes = results.faceBlendshapes[0].categories;
        const blendshapeMap = {};
        blendshapes.forEach(b => { blendshapeMap[b.categoryName] = b.score; });
        
        if (this.vrm.expressionManager) {
            const leftBlink = Math.min((blendshapeMap['eyeBlinkLeft'] || 0) * 1.5, 1);
            const rightBlink = Math.min((blendshapeMap['eyeBlinkRight'] || 0) * 1.5, 1);
            this.vrm.expressionManager.setValue('blinkLeft', rightBlink);
            this.vrm.expressionManager.setValue('blinkRight', leftBlink);
            
            const jawOpen = blendshapeMap['jawOpen'] || 0;
            this.vrm.expressionManager.setValue('aa', jawOpen * 0.8);
            
            const mouthSmileLeft = blendshapeMap['mouthSmileLeft'] || 0;
            const mouthSmileRight = blendshapeMap['mouthSmileRight'] || 0;
            const smileAmount = (mouthSmileLeft + mouthSmileRight) / 2;
            this.vrm.expressionManager.setValue('happy', smileAmount * 0.6);
        }
        
        if (results.facialTransformationMatrixes && results.facialTransformationMatrixes.length > 0) {
            const matrix = results.facialTransformationMatrixes[0].data;
            
            const m = new THREE.Matrix4();
            m.fromArray(matrix);
            
            const euler = new THREE.Euler();
            euler.setFromRotationMatrix(m, 'XYZ');
            
            if (this.vrm.humanoid) {
                const head = this.vrm.humanoid.getNormalizedBoneNode('head');
                if (head) {
                    head.rotation.x = THREE.MathUtils.clamp(euler.x * 0.7, -0.6, 0.6);
                    head.rotation.y = THREE.MathUtils.clamp(-euler.y * 0.8, -1.0, 1.0);
                    head.rotation.z = THREE.MathUtils.clamp(-euler.z * 0.5, -0.5, 0.5);
                }
            }
        }
        
        if (this.vrm.lookAt) {
            const eyeLookInLeft = blendshapeMap['eyeLookInLeft'] || 0;
            const eyeLookOutLeft = blendshapeMap['eyeLookOutLeft'] || 0;
            const eyeLookUpLeft = blendshapeMap['eyeLookUpLeft'] || 0;
            const eyeLookDownLeft = blendshapeMap['eyeLookDownLeft'] || 0;
            
            const lookX = (eyeLookOutLeft - eyeLookInLeft) * 30;
            const lookY = (eyeLookUpLeft - eyeLookDownLeft) * 30;
            
            this.vrm.lookAt.target = new THREE.Object3D();
            this.vrm.lookAt.target.position.set(lookX * 0.01, 1.4 + lookY * 0.01, 2);
        }
    }

    applyPoseToVRM(results) {
        if (!this.vrm || !this.vrm.humanoid) return;
        
        const landmarks = results.landmarks[0];
        const SMOOTHING = 0.15;
        
        const lm = landmarks;
        
        const shoulderDeltaY = lm[11].y - lm[12].y;
        const shoulderDeltaZ = lm[11].z - lm[12].z;
        const spineRotZ = THREE.MathUtils.clamp(shoulderDeltaY * 2, -0.4, 0.4);
        const spineRotY = THREE.MathUtils.clamp(-shoulderDeltaZ * 3, -0.5, 0.5);
        
        const spine = this.vrm.humanoid.getNormalizedBoneNode('spine');
        const chest = this.vrm.humanoid.getNormalizedBoneNode('chest');
        
        if (spine) {
            this.smoothedBones.spineZ = this.lerp(this.smoothedBones.spineZ ?? 0, spineRotZ, SMOOTHING);
            this.smoothedBones.spineY = this.lerp(this.smoothedBones.spineY ?? 0, spineRotY, SMOOTHING);
            spine.rotation.z = this.smoothedBones.spineZ * 0.5;
            spine.rotation.y = this.smoothedBones.spineY * 0.5;
        }
        if (chest) {
            chest.rotation.z = (this.smoothedBones.spineZ ?? 0) * 0.5;
            chest.rotation.y = (this.smoothedBones.spineY ?? 0) * 0.5;
        }
    }

    lerp(a, b, t) {
        return a + (b - a) * t;
    }

    stopCamera() {
        this.isRunning = false;
        
        if (this.videoElement && this.videoElement.srcObject) {
            const tracks = this.videoElement.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            this.videoElement.srcObject = null;
        }
        
        const statusElement = document.getElementById('avatar-status');
        const startButton = document.getElementById('avatar-start-btn');
        
        if (statusElement) statusElement.textContent = 'Camera: Stopped';
        if (startButton) startButton.textContent = 'Start Camera';
    }

    toggleCamera() {
        if (this.isRunning) {
            this.stopCamera();
        } else {
            this.startCamera();
        }
    }

    animate() {
        this.animationFrameId = requestAnimationFrame(() => this.animate());
        
        const delta = this.clock.getDelta();
        
        if (this.vrm) {
            this.vrm.update(delta);
        }
        
        this.renderer.render(this.scene, this.camera);
    }

    dispose() {
        this.stopCamera();
        
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        if (this.vrm) {
            VRMUtils.deepDispose(this.vrm.scene);
        }
    }
}

let avatarController = null;

export function initAvatar() {
    if (avatarController) return;
    
    avatarController = new AvatarController();
    avatarController.init();
    
    const startButton = document.getElementById('avatar-start-btn');
    if (startButton) {
        startButton.addEventListener('click', () => {
            avatarController.toggleCamera();
        });
    }
}

export function disposeAvatar() {
    if (avatarController) {
        avatarController.dispose();
        avatarController = null;
    }
}

window.AvatarModule = { initAvatar, disposeAvatar };
