# React Three Fiber Documentation Guide

## Introduction to React Three Fiber
React Three Fiber (R3F) is a React renderer for Three.js, a popular JavaScript 3D library. It allows you to create and manipulate 3D graphics in a React application using familiar React patterns and paradigms. This guide will walk you through the core concepts, installation, basic usage, and advanced features of React Three Fiber.

## Table of Contents
1. [Getting Started](#getting-started)
2. [Core Concepts](#core-concepts)
3. [Basic Components](#basic-components)
4. [Hooks](#hooks)
5. [Performance Optimization](#performance-optimization)
6. [Event Handling](#event-handling)
7. [Animation](#animation)
8. [Integration with Physics](#integration-with-physics)
9. [Post-Processing](#post-processing)
10. [Loading 3D Models](#loading-3d-models)
11. [Debugging](#debugging)
12. [Examples](#examples)
13. [Troubleshooting](#troubleshooting)

## Getting Started

### Installation

First, install the required packages:

```bash
npm install three @react-three/fiber @react-three/drei
# or
yarn add three @react-three/fiber @react-three/drei
```

You need to install:
- `three`: The core Three.js library
- `@react-three/fiber`: The React renderer for Three.js
- `@react-three/drei`: A collection of useful helpers for React Three Fiber

### Basic Setup

Here's a minimal example to create a scene with a rotating cube:

```jsx
import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

function Box(props) {
  // This reference will give us direct access to the mesh
  const meshRef = useRef()
  
  // Rotate mesh every frame, this is outside of React's render-loop
  useFrame((state, delta) => {
    meshRef.current.rotation.x += delta
    meshRef.current.rotation.y += delta * 0.5
  })
  
  return (
    <mesh
      {...props}
      ref={meshRef}
      scale={1}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={'orange'} />
    </mesh>
  )
}

export default function App() {
  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <Box position={[0, 0, 0]} />
      <OrbitControls />
    </Canvas>
  )
}
```

This will render a 3D scene with a rotating orange cube that you can interact with using OrbitControls.

## Core Concepts

### Canvas

The `Canvas` component is the entry point for a React Three Fiber scene. It creates a Three.js renderer, scene, and camera for you.

```jsx
<Canvas
  camera={{ position: [0, 0, 5], fov: 75 }}
  shadows
  dpr={[1, 2]}
  gl={{ preserveDrawingBuffer: true }}
>
  {/* Your 3D objects go here */}
</Canvas>
```

Common properties:
- `camera`: Camera settings (position, field of view, etc.)
- `shadows`: Enable shadow rendering
- `dpr`: Device pixel ratio (for performance/quality trade-off)
- `gl`: WebGL renderer settings
- `onCreated`: Callback when the canvas is created

### Automatic Object Creation

React Three Fiber automatically creates Three.js objects from JSX elements:

```jsx
// This JSX
<mesh>
  <boxGeometry args={[1, 2, 3]} />
  <meshStandardMaterial color="red" />
</mesh>

// Creates this Three.js code
const mesh = new THREE.Mesh()
const geometry = new THREE.BoxGeometry(1, 2, 3)
const material = new THREE.MeshStandardMaterial({ color: 'red' })
mesh.geometry = geometry
mesh.material = material
scene.add(mesh)
```

### Props and Shorthand

React Three Fiber uses a simple prop system to set properties on Three.js objects:

```jsx
// Regular props
<mesh position={[0, 0, 0]} rotation={[0, 0, 0]} scale={1} />

// Shorthand
<mesh position-x={1} rotation-y={Math.PI} scale-z={2} />
```

### Object References

You can access the underlying Three.js objects using refs:

```jsx
function MyComponent() {
  const meshRef = useRef()
  
  useEffect(() => {
    // Access the Three.js mesh object
    console.log(meshRef.current)
    
    // Manipulate it directly if needed
    meshRef.current.geometry.center()
  }, [])
  
  return <mesh ref={meshRef} />
}
```

## Basic Components

### Geometries

React Three Fiber includes all geometries from Three.js as components:

```jsx
<boxGeometry args={[width, height, depth]} />
<sphereGeometry args={[radius, widthSegments, heightSegments]} />
<planeGeometry args={[width, height]} />
<cylinderGeometry args={[radiusTop, radiusBottom, height]} />
<torusGeometry args={[radius, tube, radialSegments]} />
```

### Materials

Similarly, all Three.js materials are available:

```jsx
<meshBasicMaterial color="red" wireframe />
<meshStandardMaterial 
  color="blue" 
  metalness={0.5} 
  roughness={0.7} 
/>
<meshPhysicalMaterial 
  color="#ff0000"
  clearcoat={1}
  clearcoatRoughness={0.1}
/>
```

### Lights

Various light types for illuminating your scene:

```jsx
<ambientLight intensity={0.5} />
<pointLight position={[10, 10, 10]} intensity={1.5} />
<spotLight 
  position={[10, 10, 10]} 
  angle={0.15} 
  penumbra={1} 
  castShadow 
/>
<directionalLight position={[5, 5, 5]} castShadow />
<hemisphereLight skyColor="white" groundColor="black" />
```

### Groups

Group components to organize your scene:

```jsx
<group position={[0, 1, 0]} rotation={[0, Math.PI, 0]}>
  <mesh position={[1, 0, 0]}>
    <boxGeometry />
    <meshStandardMaterial color="hotpink" />
  </mesh>
  <mesh position={[-1, 0, 0]}>
    <sphereGeometry />
    <meshStandardMaterial color="aquamarine" />
  </mesh>
</group>
```

## Hooks

React Three Fiber provides several hooks for interacting with the scene:

### useFrame

Execute code on every animation frame:

```jsx
import { useFrame } from '@react-three/fiber'

function RotatingCube() {
  const cubeRef = useRef()
  
  useFrame((state, delta) => {
    // state contains things like clock, camera, scene, etc.
    // delta is the time difference from the last frame
    
    cubeRef.current.rotation.x += delta
    
    // Access other elements from state
    const time = state.clock.getElapsedTime()
    cubeRef.current.position.y = Math.sin(time) * 0.5
  })
  
  return (
    <mesh ref={cubeRef}>
      <boxGeometry />
      <meshStandardMaterial color="royalblue" />
    </mesh>
  )
}
```

### useThree

Access the Three.js render state:

```jsx
import { useThree } from '@react-three/fiber'

function CameraController() {
  const { camera, scene, size } = useThree()
  
  useEffect(() => {
    console.log('Scene:', scene)
    console.log('Camera position:', camera.position)
    console.log('Canvas size:', size)
    
    // Adjust camera or scene based on size
    camera.lookAt(scene.position)
  }, [camera, scene, size])
  
  return null
}
```

### useLoader

Load external assets like textures and 3D models:

```jsx
import { useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'

function TexturedSphere() {
  const texture = useLoader(TextureLoader, '/texture.jpg')
  
  return (
    <mesh>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  )
}
```

## Performance Optimization

### Instance Meshes

Create thousands of objects efficiently using instanced meshes:

```jsx
import { useRef } from 'react'

function Instances({ count = 1000 }) {
  const meshRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  
  useEffect(() => {
    // Set position and rotation for each instance
    for (let i = 0; i < count; i++) {
      const id = i
      
      // Position in a spherical pattern
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const radius = 5 + Math.random() * 5
      
      dummy.position.x = radius * Math.sin(phi) * Math.cos(theta)
      dummy.position.y = radius * Math.sin(phi) * Math.sin(theta)
      dummy.position.z = radius * Math.cos(phi)
      
      // Random rotation
      dummy.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      )
      
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(id, dummy.matrix)
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [count, dummy])
  
  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <boxGeometry args={[0.1, 0.1, 0.1]} />
      <meshStandardMaterial color="aquamarine" />
    </instancedMesh>
  )
}
```

### useMemo for Geometries and Materials

Memoize geometries and materials to prevent unnecessary recreations:

```jsx
function OptimizedCube() {
  // Memoize geometry and material
  const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), [])
  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: 'orange'
  }), [])
  
  return (
    <mesh geometry={geometry} material={material} />
  )
}
```

### Offscreen Rendering with R3F

Reduce rendering when objects are not visible:

```jsx
import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'

function OffscreenOptimization({ threshold = 10 }) {
  const meshRef = useRef()
  const [visible, setVisible] = useState(true)
  
  useFrame(({ camera }) => {
    if (!meshRef.current) return
    
    // Calculate distance to camera
    const distance = meshRef.current.position.distanceTo(camera.position)
    
    // Toggle visibility based on distance
    if (distance > threshold && visible) setVisible(false)
    if (distance <= threshold && !visible) setVisible(true)
  })
  
  return (
    <mesh ref={meshRef} visible={visible}>
      <boxGeometry />
      <meshStandardMaterial color="limegreen" />
    </mesh>
  )
}
```

## Event Handling

React Three Fiber provides pointer events similar to React's DOM events:

```jsx
function InteractiveCube() {
  const [hovered, setHovered] = useState(false)
  const [active, setActive] = useState(false)
  
  return (
    <mesh
      onClick={(event) => setActive(!active)}
      onPointerOver={(event) => setHovered(true)}
      onPointerOut={(event) => setHovered(false)}
      scale={active ? 1.5 : 1}
    >
      <boxGeometry />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'royalblue'} />
    </mesh>
  )
}
```

Available events include:
- `onClick`
- `onContextMenu`
- `onDoubleClick`
- `onPointerUp`
- `onPointerDown`
- `onPointerOver`
- `onPointerOut`
- `onPointerEnter`
- `onPointerLeave`
- `onPointerMove`
- `onPointerMissed` (when clicking on empty space)

## Animation

### Using useFrame

For simple animations, `useFrame` provides frame-by-frame control:

```jsx
function AnimatedBox() {
  const meshRef = useRef()
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    
    meshRef.current.rotation.x = Math.sin(t / 2)
    meshRef.current.rotation.y = Math.cos(t / 2)
    meshRef.current.position.y = Math.sin(t) * 0.5
  })
  
  return (
    <mesh ref={meshRef}>
      <boxGeometry />
      <meshNormalMaterial />
    </mesh>
  )
}
```

### Using @react-spring/three

For spring-based animations, use @react-spring/three:

```jsx
import { useSpring, animated } from '@react-spring/three'

function SpringAnimatedBox() {
  const [active, setActive] = useState(false)
  
  // Create spring animation
  const { scale, rotation, color } = useSpring({
    scale: active ? 1.5 : 1,
    rotation: active ? [0, Math.PI, 0] : [0, 0, 0],
    color: active ? 'hotpink' : 'royalblue',
    config: { mass: 1, tension: 170, friction: 26 }
  })
  
  return (
    <animated.mesh
      onClick={() => setActive(!active)}
      scale={scale}
      rotation={rotation}
    >
      <boxGeometry />
      <animated.meshStandardMaterial color={color} />
    </animated.mesh>
  )
}
```

### Using @react-three/drei's Animation Helpers

The `drei` library provides animation utilities:

```jsx
import { useAnimations, useGLTF } from '@react-three/drei'

function AnimatedModel({ url }) {
  const { scene, animations } = useGLTF(url)
  const { ref, actions, names } = useAnimations(animations)
  
  useEffect(() => {
    // Play the first animation
    actions[names[0]]?.play()
  }, [actions, names])
  
  return <primitive ref={ref} object={scene} />
}
```

## Integration with Physics

### Using @react-three/cannon

Add physics to your 3D objects using @react-three/cannon:

```jsx
import { Physics, usePlane, useBox } from '@react-three/cannon'

function PhysicsScene() {
  return (
    <Physics>
      <Floor />
      <Box position={[0, 5, 0]} />
      <Box position={[0.5, 8, -1]} />
      <Box position={[-0.5, 10, 1]} />
    </Physics>
  )
}

function Floor() {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -2, 0]
  }))
  
  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial color="#303030" />
    </mesh>
  )
}

function Box(props) {
  const [ref] = useBox(() => ({
    mass: 1,
    ...props
  }))
  
  return (
    <mesh ref={ref} castShadow>
      <boxGeometry />
      <meshStandardMaterial color="orange" />
    </mesh>
  )
}
```

## Post-Processing

Using @react-three/postprocessing for visual effects:

```jsx
import { Canvas } from '@react-three/fiber'
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Noise
} from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'

function Scene() {
  return (
    <Canvas>
      {/* Your scene contents */}
      <mesh>
        <boxGeometry />
        <meshStandardMaterial emissive="hotpink" emissiveIntensity={2} />
      </mesh>
      
      {/* Post-processing effects */}
      <EffectComposer>
        <Bloom
          intensity={1.0}
          luminanceThreshold={0.5}
          luminanceSmoothing={0.9}
        />
        <ChromaticAberration
          offset={[0.005, 0.005]}
          blendFunction={BlendFunction.NORMAL}
        />
        <Noise opacity={0.15} />
      </EffectComposer>
    </Canvas>
  )
}
```

## Loading 3D Models

### Using useLoader with GLTFLoader

Load GLTF models with the built-in loader:

```jsx
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

function Model({ url }) {
  const gltf = useLoader(GLTFLoader, url)
  
  return <primitive object={gltf.scene} />
}

// Usage
<Model url="/model.gltf" />
```

### Using @react-three/drei's useGLTF

A more convenient way to load models with drei:

```jsx
import { useGLTF } from '@react-three/drei'

function Model({ url }) {
  const { scene, nodes, materials, animations } = useGLTF(url)
  
  return <primitive object={scene} />
}

// Optionally preload the model
useGLTF.preload('/model.gltf')
```

### Complex Model Loading with Suspense

Handle loading states properly:

```jsx
import { Suspense } from 'react'
import { useGLTF, OrbitControls, Environment } from '@react-three/drei'

function ModelViewer() {
  return (
    <Canvas>
      <OrbitControls />
      <Environment preset="sunset" background />
      
      <Suspense fallback={<LoadingIndicator />}>
        <Model url="/complex-model.gltf" />
      </Suspense>
    </Canvas>
  )
}

function LoadingIndicator() {
  return (
    <mesh>
      <sphereGeometry args={[1, 16, 16]} />
      <meshBasicMaterial color="white" wireframe />
    </mesh>
  )
}
```

## Debugging

### Using Drei's Helpers

@react-three/drei provides several helpers for debugging:

```jsx
import {
  Stats,
  OrbitControls,
  Grid,
  useHelper
} from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'

function DebugScene() {
  const directionalLightRef = useRef()
  
  // Add a helper to visualize the light
  useHelper(directionalLightRef, THREE.DirectionalLightHelper, 0.5, 'red')
  
  return (
    <Canvas>
      <Stats /> {/* FPS counter */}
      <axesHelper args={[5]} /> {/* XYZ axes */}
      <Grid
        cellColor="white"
        args={[10, 10]}
        cellSize={1}
        cellThickness={1}
      /> {/* Grid on the ground */}
      
      <directionalLight ref={directionalLightRef} position={[1, 1, 1]} />
      <OrbitControls />
      
      <mesh>
        <boxGeometry />
        <meshNormalMaterial />
      </mesh>
    </Canvas>
  )
}
```

### Using Three.js Leva Controls

Add interactive controls with leva:

```jsx
import { useControls } from 'leva'

function ControlledScene() {
  const { position, color, intensity } = useControls({
    position: {
      value: { x: 1, y: 1, z: 1 },
      step: 0.1
    },
    color: '#ff0000',
    intensity: { value: 1, min: 0, max: 10, step: 0.1 }
  })
  
  return (
    <Canvas>
      <pointLight
        position={[position.x, position.y, position.z]}
        color={color}
        intensity={intensity}
      />
      
      <mesh>
        <boxGeometry />
        <meshStandardMaterial />
      </mesh>
    </Canvas>
  )
}
```

## Examples

### Basic Scene with Lighting and Controls

```jsx
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'

function Scene() {
  return (
    <Canvas shadows camera={{ position: [0, 2, 5], fov: 50 }}>
      {/* Environment and lighting */}
      <Environment preset="city" />
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      
      {/* Ground */}
      <mesh rotation-x={-Math.PI / 2} position-y={-1} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#303030" />
      </mesh>
      
      {/* Objects */}
      <mesh castShadow>
        <boxGeometry />
        <meshStandardMaterial color="orange" />
      </mesh>
      
      {/* Contact shadows */}
      <ContactShadows
        position={[0, -0.99, 0]}
        opacity={0.7}
        blur={2.5}
        far={4}
      />
      
      {/* Controls */}
      <OrbitControls />
    </Canvas>
  )
}
```

### Interactive Gallery

```jsx
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import { Text, Image, OrbitControls } from '@react-three/drei'

function Gallery() {
  const images = [
    { url: '/img1.jpg', position: [-2, 0, 0], title: 'Image 1' },
    { url: '/img2.jpg', position: [0, 0, 0], title: 'Image 2' },
    { url: '/img3.jpg', position: [2, 0, 0], title: 'Image 3' }
  ]
  
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
      <ambientLight intensity={0.8} />
      <pointLight position={[10, 10, 10]} />
      
      {images.map((img, index) => (
        <GalleryItem 
          key={index} 
          url={img.url} 
          position={img.position} 
          title={img.title} 
        />
      ))}
      
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 2 - 0.5}
        maxPolarAngle={Math.PI / 2 + 0.5}
      />
    </Canvas>
  )
}

function GalleryItem({ url, position, title }) {
  const [hovered, setHovered] = useState(false)
  const [active, setActive] = useState(false)
  const groupRef = useRef()
  
  useFrame(() => {
    // Gentle floating animation
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(Date.now() * 0.001) * 0.1
    }
  })
  
  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => setActive(!active)}
      scale={hovered ? 1.1 : 1}
    >
      <Image
        url={url}
        transparent
        opacity={active ? 1 : 0.8}
        scale={active ? [2, 2, 1] : [1.5, 1, 1]}
      />
      
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {title}
      </Text>
    </group>
  )
}
```

## Troubleshooting

### Common Issues

1. **Performance Problems**
   - Use `instancedMesh` for many similar objects
   - Memoize geometries and materials
   - Enable frustum culling for objects
   - Simplify geometries where possible
   - Use `dreiGLTF` for efficient model loading

2. **Objects Not Showing**
   - Ensure your camera is positioned to see the objects
   - Add lights to your scene
   - Check your object's position, scale, and rotation
   - Make sure materials have proper colors or textures
   - Verify that objects aren't inside each other

3. **Strange Behavior with useFrame**
   - Ensure your component is inside the Canvas
   - Check if you have unintended rerenders affecting your refs
   - Use cleanup functions to prevent memory leaks

4. **Loading Problems**
   - Use `<Suspense>` around components that load assets
   - Provide fallback components for loading states
   - Check file paths and ensure assets are accessible
   - Use asset preloading where appropriate

5. **Shader Errors**
   - Check browser console for specific shader errors
   - Ensure your shader code is compatible with WebGL
   - Test on multiple browsers and devices for compatibility

### Debug Tips

1. Use `<Stats />` from drei to monitor performance
2. Add helpers like `<axesHelper />` and `<gridHelper />` to visualize space
3. Use `useHelper` to visualize lights and cameras
4. Enable the Three.js Inspector devtools extension
5. Add debug controls with leva to interactively test parameters

---

This guide covers the core aspects of React Three Fiber. For more detailed information, visit the official documentation and examples:

- [React Three Fiber Documentation](https://docs.pmnd.rs/react-three-fiber)
- [Three.js Documentation](https://threejs.org/docs/)
- [React Three Drei](https://github.com/pmndrs/drei)
- [Example Projects](https://docs.pmnd.rs/react-three-fiber/getting-started/examples)
