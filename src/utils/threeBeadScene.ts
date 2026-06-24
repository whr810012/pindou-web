import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { MappedGrid } from '@pindou/bead-core'

export interface BeadSceneHandle {
  resize: () => void
  dispose: () => void
}

export function createBeadScene(container: HTMLElement, grid: MappedGrid): BeadSceneHandle {
  const beads: { row: number; col: number; hex: string }[] = []
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      const cell = grid[row][col]
      if (!cell.isExternal) beads.push({ row, col, hex: cell.hex })
    }
  }

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf5f6fa)

  const width = container.clientWidth || 360
  const height = container.clientHeight || 360
  const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 2000)
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setSize(width, height)
  renderer.shadowMap.enabled = true
  container.appendChild(renderer.domElement)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.06
  controls.maxPolarAngle = Math.PI / 2.1

  scene.add(new THREE.AmbientLight(0xffffff, 0.55))
  const keyLight = new THREE.DirectionalLight(0xffffff, 0.85)
  keyLight.position.set(12, 24, 16)
  keyLight.castShadow = true
  scene.add(keyLight)
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.25)
  fillLight.position.set(-10, 8, 8)
  scene.add(fillLight)

  const rows = grid.length
  const cols = grid[0]?.length ?? 0
  const beadSize = 1
  const beadHeight = 0.45
  const geometry = new THREE.BoxGeometry(beadSize * 0.92, beadHeight, beadSize * 0.92)
  const material = new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.05 })
  const mesh = new THREE.InstancedMesh(geometry, material, Math.max(beads.length, 1))
  mesh.castShadow = true
  mesh.receiveShadow = true

  const dummy = new THREE.Object3D()
  const color = new THREE.Color()
  beads.forEach((bead, index) => {
    dummy.position.set(bead.col * beadSize, beadHeight / 2, bead.row * beadSize)
    dummy.updateMatrix()
    mesh.setMatrixAt(index, dummy.matrix)
    color.set(bead.hex)
    mesh.setColorAt(index, color)
  })
  mesh.instanceMatrix.needsUpdate = true
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  scene.add(mesh)

  const centerX = ((cols - 1) * beadSize) / 2
  const centerZ = ((rows - 1) * beadSize) / 2
  mesh.position.set(-centerX, 0, -centerZ)

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(Math.max(cols, rows) * beadSize + 4, Math.max(cols, rows) * beadSize + 4),
    new THREE.MeshStandardMaterial({ color: 0xeceff4, roughness: 0.9 }),
  )
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.01
  ground.receiveShadow = true
  scene.add(ground)

  const span = Math.max(cols, rows) * beadSize
  camera.position.set(span * 0.85, span * 0.75, span * 0.85)
  controls.target.set(0, beadHeight / 2, 0)
  controls.update()

  let frameId = 0
  const animate = () => {
    frameId = requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
  }
  animate()

  const resize = () => {
    const w = container.clientWidth || width
    const h = container.clientHeight || height
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  }

  const dispose = () => {
    cancelAnimationFrame(frameId)
    controls.dispose()
    geometry.dispose()
    material.dispose()
    renderer.dispose()
    if (renderer.domElement.parentNode === container) {
      container.removeChild(renderer.domElement)
    }
  }

  return { resize, dispose }
}
