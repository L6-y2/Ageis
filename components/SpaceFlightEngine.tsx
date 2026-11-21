'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { SpaceStationWaypoint } from '@/lib/spaceWaypoints'

interface Props {
  running: boolean
  remaining: number
  totalSeconds: number
  waypoint: SpaceStationWaypoint
  cameraView: 'chase' | 'cockpit' | 'flyby'
  onTogglePlay?: () => void
}

export default function SpaceFlightEngine({
  running,
  remaining,
  totalSeconds,
  waypoint,
  cameraView,
  onTogglePlay,
}: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const shipGroupRef = useRef<THREE.Group | null>(null)
  const thrustersRef = useRef<THREE.Mesh[]>([])
  const starsRef = useRef<THREE.Points | null>(null)
  const planetGroupRef = useRef<THREE.Group | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const runningRef = useRef(running)
  const cameraViewRef = useRef(cameraView)
  const progressRef = useRef(0)

  runningRef.current = running
  cameraViewRef.current = cameraView
  progressRef.current = Math.min(1, Math.max(0, (totalSeconds - remaining) / totalSeconds))

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    // ─── 1. Scene, Camera, and Hardware-Accelerated Renderer ──────────────
    const scene = new THREE.Scene()
    sceneRef.current = scene
    scene.fog = new THREE.FogExp2(0x020510, 0.0018)

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      2500
    )
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    })
    rendererRef.current = renderer
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.25
    container.appendChild(renderer.domElement)

    // ─── 2. Starfield with 3,500 Realistic Stars ─────────────────────────
    const starCount = 3500
    const starGeo = new THREE.BufferGeometry()
    const starPositions = new Float32Array(starCount * 3)
    const starColors = new Float32Array(starCount * 3)

    const colorPalette = [
      new THREE.Color(0xa5f3fc), // Cyan
      new THREE.Color(0xffffff), // Pure Starlight White
      new THREE.Color(0xfde047), // Amber Dwarf
      new THREE.Color(0x93c5fd), // Blue Supergiant
      new THREE.Color(0xf472b6), // Soft Pink Nebula Star
    ]

    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 1600
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 1600
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 2000

      const c = colorPalette[Math.floor(Math.random() * colorPalette.length)]
      starColors[i * 3] = c.r
      starColors[i * 3 + 1] = c.g
      starColors[i * 3 + 2] = c.b
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3))

    const starMat = new THREE.PointsMaterial({
      size: 2.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
    })

    const starField = new THREE.Points(starGeo, starMat)
    scene.add(starField)
    starsRef.current = starField

    // ─── 3. Volumetric Nebula Particle Cloud (Sector Ambient Theme) ──────
    const nebulaCount = 450
    const nebulaGeo = new THREE.BufferGeometry()
    const nebulaPos = new Float32Array(nebulaCount * 3)
    const nebulaCols = new Float32Array(nebulaCount * 3)
    const [c1, c2, c3] = waypoint.nebulaPalette.map((hex) => new THREE.Color(hex))

    for (let i = 0; i < nebulaCount; i++) {
      nebulaPos[i * 3] = (Math.random() - 0.5) * 1200
      nebulaPos[i * 3 + 1] = (Math.random() - 0.5) * 700
      nebulaPos[i * 3 + 2] = -300 - Math.random() * 900

      const pick = i % 3 === 0 ? c1 : i % 3 === 1 ? c2 : c3
      nebulaCols[i * 3] = pick.r
      nebulaCols[i * 3 + 1] = pick.g
      nebulaCols[i * 3 + 2] = pick.b
    }

    nebulaGeo.setAttribute('position', new THREE.BufferAttribute(nebulaPos, 3))
    nebulaGeo.setAttribute('color', new THREE.BufferAttribute(nebulaCols, 3))

    const nebulaMat = new THREE.PointsMaterial({
      size: 45,
      vertexColors: true,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
    })
    const nebulaField = new THREE.Points(nebulaGeo, nebulaMat)
    scene.add(nebulaField)

    // ─── 4. The Spaceship (Aegis Interstellar Explorer) ──────────────────
    const ship = new THREE.Group()
    shipGroupRef.current = ship

    // Main Hull / Fuselage
    const hullMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.25,
    })
    const hullDetailMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.2,
    })
    const neonCyanMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
    })

    // Aerodynamic tapered fuselage
    const bodyGeo = new THREE.ConeGeometry(2.4, 11, 8)
    bodyGeo.rotateX(Math.PI / 2)
    const bodyMesh = new THREE.Mesh(bodyGeo, hullMat)
    ship.add(bodyMesh)

    // Cockpit Glass Canopy with luminous interior
    const cockpitGeo = new THREE.CapsuleGeometry(1.1, 3.2, 8, 12)
    cockpitGeo.rotateX(Math.PI / 2)
    const cockpitMat = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7,
      transmission: 0.6,
      opacity: 0.95,
      transparent: true,
      roughness: 0.1,
      metalness: 0.1,
      ior: 1.5,
    })
    const cockpit = new THREE.Mesh(cockpitGeo, cockpitMat)
    cockpit.position.set(0, 0.85, 0.5)
    ship.add(cockpit)

    // Swept Delta Wings
    const wingShape = new THREE.Shape()
    wingShape.moveTo(0, 0)
    wingShape.lineTo(6.8, -3.2)
    wingShape.lineTo(6.5, -5.2)
    wingShape.lineTo(1.8, -4.2)
    wingShape.lineTo(0, -4.5)
    wingShape.closePath()

    const wingGeo = new THREE.ExtrudeGeometry(wingShape, { depth: 0.25, bevelEnabled: false })
    wingGeo.rotateX(-Math.PI / 2)
    const leftWing = new THREE.Mesh(wingGeo, hullMat)
    leftWing.position.set(0.5, -0.2, 0)
    ship.add(leftWing)

    const rightWingGeo = wingGeo.clone()
    rightWingGeo.scale(-1, 1, 1)
    const rightWing = new THREE.Mesh(rightWingGeo, hullMat)
    rightWing.position.set(-0.5, -0.2, 0)
    ship.add(rightWing)

    // Wingtip Strobe LEDs
    const ledGeo = new THREE.SphereGeometry(0.12, 8, 8)
    const leftLed = new THREE.Mesh(ledGeo, new THREE.MeshBasicMaterial({ color: 0xef4444 }))
    leftLed.position.set(7.1, 0, -3.5)
    ship.add(leftLed)

    const rightLed = new THREE.Mesh(ledGeo, new THREE.MeshBasicMaterial({ color: 0x22c55e }))
    rightLed.position.set(-7.1, 0, -3.5)
    ship.add(rightLed)

    // Twin Warp Nacelles / Ion Thruster Bells
    const nacelleGeo = new THREE.CylinderGeometry(0.65, 0.75, 4.2, 12)
    nacelleGeo.rotateX(Math.PI / 2)

    const leftNacelle = new THREE.Mesh(nacelleGeo, hullDetailMat)
    leftNacelle.position.set(2.4, 0.2, -3.5)
    ship.add(leftNacelle)

    const rightNacelle = new THREE.Mesh(nacelleGeo, hullDetailMat)
    rightNacelle.position.set(-2.4, 0.2, -3.5)
    ship.add(rightNacelle)

    // Dual Plasma Thruster Exhaust Cones
    const thrusterGeo = new THREE.ConeGeometry(0.5, 3.2, 12)
    thrusterGeo.rotateX(-Math.PI / 2)
    const thrusterMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
    })

    const leftExhaust = new THREE.Mesh(thrusterGeo, thrusterMat)
    leftExhaust.position.set(2.4, 0.2, -6.0)
    ship.add(leftExhaust)

    const rightExhaust = new THREE.Mesh(thrusterGeo, thrusterMat)
    rightExhaust.position.set(-2.4, 0.2, -6.0)
    ship.add(rightExhaust)

    thrustersRef.current = [leftExhaust, rightExhaust]

    // Hull Neon Accent Ribbons
    const ribbonGeo = new THREE.BoxGeometry(0.12, 0.12, 5.5)
    const leftRibbon = new THREE.Mesh(ribbonGeo, neonCyanMat)
    leftRibbon.position.set(1.4, 0.5, -0.5)
    ship.add(leftRibbon)

    const rightRibbon = new THREE.Mesh(ribbonGeo, neonCyanMat)
    rightRibbon.position.set(-1.4, 0.5, -0.5)
    ship.add(rightRibbon)

    scene.add(ship)

    // ─── 5. The Primary Celestial Destination (Planet / Star / Worlds) ───
    const planetGroup = new THREE.Group()
    planetGroupRef.current = planetGroup
    planetGroup.position.set(45, 15, -420) // Deep along flight path
    scene.add(planetGroup)

    // Create high-detail canvas texture based on celestial type
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 256
    const pctx = canvas.getContext('2d')
    if (pctx) {
      const grad = pctx.createLinearGradient(0, 0, 0, 256)
      if (waypoint.celestialType === 'gas_giant') {
        grad.addColorStop(0, '#f97316')
        grad.addColorStop(0.25, '#fbbf24')
        grad.addColorStop(0.5, '#ea580c')
        grad.addColorStop(0.75, '#fed7aa')
        grad.addColorStop(1, '#c2410c')
      } else if (waypoint.celestialType === 'ice_world') {
        grad.addColorStop(0, '#e0f2fe')
        grad.addColorStop(0.3, '#38bdf8')
        grad.addColorStop(0.6, '#0284c7')
        grad.addColorStop(1, '#bae6fd')
      } else if (waypoint.celestialType === 'volcanic_lava') {
        grad.addColorStop(0, '#450a0a')
        grad.addColorStop(0.4, '#dc2626')
        grad.addColorStop(0.5, '#f59e0b')
        grad.addColorStop(0.7, '#7f1d1d')
        grad.addColorStop(1, '#1c1917')
      } else if (waypoint.celestialType === 'desert_dune') {
        grad.addColorStop(0, '#d97706')
        grad.addColorStop(0.3, '#f59e0b')
        grad.addColorStop(0.7, '#b45309')
        grad.addColorStop(1, '#78350f')
      } else {
        // Terrestrial / Default Earthlike
        grad.addColorStop(0, '#0284c7')
        grad.addColorStop(0.35, '#10b981')
        grad.addColorStop(0.55, '#0369a1')
        grad.addColorStop(0.7, '#047857')
        grad.addColorStop(1, '#0c4a6e')
      }
      pctx.fillStyle = grad
      pctx.fillRect(0, 0, 512, 256)

      // Add swirling noise/clouds
      pctx.fillStyle = 'rgba(255, 255, 255, 0.22)'
      for (let s = 0; s < 40; s++) {
        pctx.beginPath()
        pctx.ellipse(
          Math.random() * 512,
          Math.random() * 256,
          40 + Math.random() * 60,
          10 + Math.random() * 15,
          Math.PI / 12,
          0,
          Math.PI * 2
        )
        pctx.fill()
      }
    }

    const planetTex = new THREE.CanvasTexture(canvas)
    const planetGeo = new THREE.SphereGeometry(32, 48, 48)
    const planetMat = new THREE.MeshStandardMaterial({
      map: planetTex,
      roughness: 0.65,
      metalness: 0.1,
    })
    const planetMesh = new THREE.Mesh(planetGeo, planetMat)
    planetGroup.add(planetMesh)

    // Planetary Atmosphere Rim (Rayleigh Rim Scatter)
    const atmoGeo = new THREE.SphereGeometry(33.2, 32, 32)
    const atmoMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(waypoint.primaryColor),
      transparent: true,
      opacity: 0.25,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    })
    const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat)
    planetGroup.add(atmoMesh)

    // Optional Rings (for ringed planets)
    if (waypoint.hasRings) {
      const ringGeo = new THREE.RingGeometry(42, 68, 64)
      ringGeo.rotateX(Math.PI / 2.3)
      const ringMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(waypoint.ringColor || '#e2e8f0'),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75,
        roughness: 0.4,
      })
      const ringMesh = new THREE.Mesh(ringGeo, ringMat)
      planetGroup.add(ringMesh)
    }

    // Moons
    for (let m = 0; m < waypoint.moonsCount; m++) {
      const moonGeo = new THREE.SphereGeometry(4.5 + m * 1.5, 24, 24)
      const moonMat = new THREE.MeshStandardMaterial({
        color: m === 0 ? 0x94a3b8 : 0xd1d5db,
        roughness: 0.9,
      })
      const moonMesh = new THREE.Mesh(moonGeo, moonMat)
      const angle = (m * Math.PI) / 1.5
      const dist = 75 + m * 35
      moonMesh.position.set(Math.cos(angle) * dist, Math.sin(angle) * 15, Math.sin(angle) * dist)
      planetGroup.add(moonMesh)
    }

    // ─── 6. Lighting ────────────────────────────────────────────────────
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.4)
    sunLight.position.set(-150, 80, 100)
    scene.add(sunLight)

    const ambientLight = new THREE.AmbientLight(0x0a192f, 1.2)
    scene.add(ambientLight)

    // Engine glow point light attached to ship
    const engineGlow = new THREE.PointLight(0x38bdf8, 3.5, 35)
    engineGlow.position.set(0, 0, -4.5)
    ship.add(engineGlow)

    // ─── 7. Render Loop & Dynamic Aerodynamics ──────────────────────────
    let animId: number
    let clock = new THREE.Clock()

    const animate = () => {
      const delta = clock.getDelta()
      const time = clock.getElapsedTime()
      const isRunning = runningRef.current
      const progress = progressRef.current
      const view = cameraViewRef.current

      // Starfield forward warp movement
      if (starsRef.current) {
        const positions = starsRef.current.geometry.attributes.position.array as Float32Array
        const warpSpeed = isRunning ? 260 : 35
        for (let i = 2; i < starCount * 3; i += 3) {
          positions[i] += warpSpeed * delta
          if (positions[i] > 300) {
            positions[i] = -1700
          }
        }
        starsRef.current.geometry.attributes.position.needsUpdate = true
      }

      // Ship gentle hovering flight mechanics
      if (shipGroupRef.current) {
        if (isRunning) {
          // Warp flight: steady forward tilt and high-frequency micro-jitter
          shipGroupRef.current.position.y = Math.sin(time * 2.5) * 0.4
          shipGroupRef.current.rotation.x = 0.08
          shipGroupRef.current.rotation.z = Math.sin(time * 1.8) * 0.04
        } else {
          // Orbital stationkeeping: gentle idle sway
          shipGroupRef.current.position.y = Math.sin(time * 1.2) * 0.6
          shipGroupRef.current.rotation.x = Math.sin(time * 0.8) * 0.03
          shipGroupRef.current.rotation.z = Math.cos(time * 0.9) * 0.06
        }
      }

      // Dynamic Plasma Thrusters Pulse
      thrustersRef.current.forEach((t) => {
        if (isRunning) {
          const pulse = 1.0 + Math.sin(time * 25) * 0.25
          t.scale.set(pulse, pulse * 1.3, pulse * 1.6)
          ;(t.material as THREE.MeshBasicMaterial).opacity = 0.95
        } else {
          t.scale.set(0.6, 0.6, 0.5)
          ;(t.material as THREE.MeshBasicMaterial).opacity = 0.4
        }
      })

      // Planet rotation & flight approach based on session progress
      if (planetGroupRef.current) {
        planetGroupRef.current.rotation.y += 0.002
        // As progress approaches 1.0, planet approaches from distance -420 to -110
        const targetZ = -420 + progress * 300
        planetGroupRef.current.position.z = THREE.MathUtils.lerp(
          planetGroupRef.current.position.z,
          targetZ,
          0.02
        )
      }

      // Camera Perspective Management
      if (cameraRef.current) {
        if (view === 'chase') {
          // Cinematic Chase Cam (3rd person)
          cameraRef.current.position.set(0, 4.5, 16.5)
          cameraRef.current.lookAt(0, 1.2, -30)
        } else if (view === 'cockpit') {
          // First-person Cockpit View looking over nose cone
          cameraRef.current.position.set(0, 1.4, 1.8)
          cameraRef.current.lookAt(0, 1.2, -100)
        } else {
          // Flyby Dramatic Angle
          cameraRef.current.position.set(16, 6, 8)
          cameraRef.current.lookAt(shipGroupRef.current?.position || new THREE.Vector3())
        }
      }

      renderer.render(scene, camera)
      animId = requestAnimationFrame(animate)
    }

    animate()

    // ─── 8. Responsive Resize Handling ──────────────────────────────────
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return
      const w = container.clientWidth
      const h = container.clientHeight
      cameraRef.current.aspect = w / h
      cameraRef.current.updateProjectionMatrix()
      rendererRef.current.setSize(w, h)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
      if (rendererRef.current?.domElement && container) {
        container.removeChild(rendererRef.current.domElement)
      }
      rendererRef.current?.dispose()
      starGeo.dispose()
      starMat.dispose()
      nebulaGeo.dispose()
      nebulaMat.dispose()
    }
  }, [waypoint])

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full select-none overflow-hidden bg-black"
    />
  )
}
