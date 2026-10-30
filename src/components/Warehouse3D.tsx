import {useEffect,useRef} from "react"; import * as THREE from "three"; import {warehouseNodes} from "../services/data";
export default function Warehouse3D(){const host=useRef<HTMLDivElement>(null);
 useEffect(()=>{const el=host.current;if(!el)return;const scene=new THREE.Scene();scene.background=new THREE.Color("#080e14");scene.fog=new THREE.Fog("#080e14",45,110);
 const camera=new THREE.PerspectiveCamera(48,el.clientWidth/430,0.1,200);camera.position.set(25,28,35);camera.lookAt(20,0,12);
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));renderer.setSize(el.clientWidth,430);renderer.shadowMap.enabled=true;el.appendChild(renderer.domElement);
 scene.add(new THREE.AmbientLight(0x9bbbc5,1.5));const light=new THREE.DirectionalLight(0x7fffe1,2.5);light.position.set(15,35,15);scene.add(light);
 const grid=new THREE.GridHelper(55,30,0x164b56,0x132a34);grid.position.set(20,-.04,12);scene.add(grid);
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(48,32),new THREE.MeshStandardMaterial({color:0x0a141b,roughness:.9,metalness:.2}));floor.rotation.x=-Math.PI/2;floor.position.set(20,-.1,12);scene.add(floor);
 const rackMat=new THREE.MeshStandardMaterial({color:0x123642,emissive:0x071e27,metalness:.65,roughness:.35});const edgeMat=new THREE.MeshStandardMaterial({color:0x20d9e7,emissive:0x063e48,metalness:.5});
// INDUSTRIAL WAREHOUSE RACKS
const rackFrameMat = new THREE.MeshStandardMaterial({
  color: 0x16758a,
  metalness: 0.75,
  roughness: 0.3,
});

const beamMat = new THREE.MeshStandardMaterial({
  color: 0x28c8d8,
  emissive: 0x07313a,
  metalness: 0.65,
  roughness: 0.3,
});

const boxMaterials = [
  new THREE.MeshStandardMaterial({ color: 0x13c9c2, metalness: 0.25 }),
  new THREE.MeshStandardMaterial({ color: 0x2679e8, metalness: 0.25 }),
  new THREE.MeshStandardMaterial({ color: 0xf0a33a, metalness: 0.2 }),
  new THREE.MeshStandardMaterial({ color: 0x8c65e8, metalness: 0.2 }),
];

for (let row = 0; row < 7; row++) {
  for (let col = 0; col < 11; col++) {
    const x = 2 + col * 3.6;
    const z = 2 + row * 3.5;

    // Four vertical metal support posts
    for (const dx of [-0.65, 0.65]) {
      for (const dz of [-0.55, 0.55]) {
        const post = new THREE.Mesh(
          new THREE.BoxGeometry(0.09, 4.2, 0.09),
          rackFrameMat
        );

        post.position.set(x + dx, 2.1, z + dz);
        scene.add(post);
      }
    }

    // Four shelf levels
    for (let level = 0; level < 4; level++) {
      const y = 0.55 + level * 1.05;

      const shelf = new THREE.Mesh(
        new THREE.BoxGeometry(1.45, 0.1, 1.3),
        beamMat
      );

      shelf.position.set(x, y, z);
      scene.add(shelf);

      // Front and rear horizontal support beams
      for (const dz of [-0.55, 0.55]) {
        const beam = new THREE.Mesh(
          new THREE.BoxGeometry(1.35, 0.1, 0.08),
          rackFrameMat
        );

        beam.position.set(x, y - 0.12, z + dz);
        scene.add(beam);
      }

      // Storage cartons on the shelves
      const boxCount = 2 + ((row + col + level) % 2);

      for (let b = 0; b < boxCount; b++) {
        const boxWidth = 0.3;
        const boxHeight = 0.48;
        const boxDepth = 0.38;

        const carton = new THREE.Mesh(
          new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth),
          boxMaterials[(row + col + level + b) % boxMaterials.length]
        );

        carton.position.set(
          x - 0.45 + b * 0.42,
          y + 0.05 + boxHeight / 2,
          z
        );

        scene.add(carton);
      }
    }

    // Diagonal-free rear bracing for a clean industrial look
    const brace = new THREE.Mesh(
      new THREE.BoxGeometry(1.25, 0.06, 0.06),
      rackFrameMat
    );

    brace.position.set(x, 2.1, z - 0.55);
    scene.add(brace);
  }
} // A small procedural robot: chassis, sensor mast, cyan optics and wheels.
 const robot=new THREE.Group();const chassis=new THREE.Mesh(new THREE.BoxGeometry(1.6,.65,1.15),new THREE.MeshStandardMaterial({color:0x15252d,metalness:.8,roughness:.25}));chassis.position.y=.7;robot.add(chassis);
 const dome=new THREE.Mesh(new THREE.CylinderGeometry(.24,.32,.42,16),new THREE.MeshStandardMaterial({color:0x0ff0dd,emissive:0x00665e,metalness:.4}));dome.position.y=1.25;robot.add(dome);
 const eye=new THREE.Mesh(new THREE.SphereGeometry(.12,12,8),new THREE.MeshBasicMaterial({color:0x8afff3}));eye.position.set(0,1.25,.29);robot.add(eye);
 const wheelMat=new THREE.MeshStandardMaterial({color:0x030609,roughness:.9});for(const x of [-.7,.7])for(const z of [-.43,.43]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.22,.22,.15,16),wheelMat);w.rotation.z=Math.PI/2;w.position.set(x,.35,z);robot.add(w)}
 robot.position.set(9,0,10);scene.add(robot);
 let frame=0,drag=false,lastX=0,lastY=0,rotY=0,rotX=0;const animate=()=>{frame=requestAnimationFrame(animate);robot.position.x=9+Math.sin(Date.now()*.0006)*4;robot.rotation.y=Math.sin(Date.now()*.0005)*.3;if(!drag){camera.position.x=25+Math.sin(Date.now()*.00008)*3;camera.lookAt(20,0,12)}renderer.render(scene,camera)};animate();
 const down=(e:PointerEvent)=>{drag=true;lastX=e.clientX;lastY=e.clientY};const move=(e:PointerEvent)=>{if(!drag)return;rotY+=(e.clientX-lastX)*.008;rotX+=(e.clientY-lastY)*.004;lastX=e.clientX;lastY=e.clientY;camera.position.set(20+Math.sin(rotY)*38,Math.max(8,25+rotX*10),12+Math.cos(rotY)*38);camera.lookAt(20,0,12)};const up=()=>drag=false;renderer.domElement.addEventListener("pointerdown",down);window.addEventListener("pointermove",move);window.addEventListener("pointerup",up);
 const resize=()=>{if(!el.clientWidth)return;camera.aspect=el.clientWidth/430;camera.updateProjectionMatrix();renderer.setSize(el.clientWidth,430)};window.addEventListener("resize",resize);
 return()=>{cancelAnimationFrame(frame);window.removeEventListener("resize",resize);window.removeEventListener("pointermove",move);window.removeEventListener("pointerup",up);renderer.dispose();el.removeChild(renderer.domElement);scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();const m=o.material;if(Array.isArray(m))m.forEach(x=>x.dispose());else m.dispose()}})}
 },[]);return <div className="warehouse3d" ref={host}><div className="view-hud"><span>3D ORTHOGRAPHIC // DRAG TO ORBIT</span><span>NODE ARRAY: {warehouseNodes.length}</span></div></div>
}