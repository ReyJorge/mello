import React, { useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Html } from "@react-three/drei";

function RotatingModel({ object, ...props }) {
  const group = useRef();

  const rotationState = useRef({ angleY: 0, directionY: 1 });
  const rotationX = useRef(0);
  const directionX = useRef(1);

  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    if (!group.current) return;

    // Posun celé skupiny dolů a vystředění na střed osy X a Z
    group.current.position.set(0, -1.0, 0);

    if (!hovered) {
      const speedY = 0.2 * (Math.PI / 180);
      let { angleY, directionY } = rotationState.current;
      angleY += directionY * speedY;

      const minAngleY = -10 * (Math.PI / 180);
      const maxAngleY = 15 * (Math.PI / 180);

      if (angleY >= maxAngleY) {
        angleY = maxAngleY;
        directionY = -1;
      } else if (angleY <= minAngleY) {
        angleY = minAngleY;
        directionY = 1;
      }
      rotationState.current = { angleY, directionY };

      const speedX = 0.1 * (Math.PI / 180);
      rotationX.current += directionX.current * speedX;

      if (rotationX.current > 3 * (Math.PI / 180)) {
        rotationX.current = 3 * (Math.PI / 180);
        directionX.current = -1;
      } else if (rotationX.current < -3 * (Math.PI / 180)) {
        rotationX.current = -3 * (Math.PI / 180);
        directionX.current = 1;
      }

      group.current.rotation.y = angleY;
      group.current.rotation.x = rotationX.current;

      // Pohyb rtů (škálování)
      if (!group.current.userData.lipMoveTime) {
        group.current.userData.lipMoveTime = 0;
      }
      group.current.userData.lipMoveTime += delta * 3;
      group.current.scale.y =
        1 + 0.03 * Math.sin(group.current.userData.lipMoveTime);
    } else {
      const lerpSpeed = 0.025;
      group.current.rotation.y += (0 - group.current.rotation.y) * lerpSpeed;
      group.current.rotation.x += (0 - group.current.rotation.x) * lerpSpeed;
      group.current.scale.y += (1 - group.current.scale.y) * lerpSpeed;
    }
  });

  return (
    <group
      ref={group}
      {...props}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <primitive
        object={object}
        scale={[1.7, 1.7, 1.7]} // škálování modelu, můžeš upravit
      />
    </group>
  );
}

export default function AvatarMello3D({ className }) {
  const gltf = useGLTF("/models/pointing_forward.glb"); // cesta k tvému modelu

  return (
    <div
      className={`${className} overflow-visible`}
      style={{ width: "100%", height: "100%", minHeight: "70rem" }}
    >
      <Canvas
        style={{ width: "100%", height: "100%" }}
        camera={{ position: [0, 1, 5], fov: 50 }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} />
        <Suspense fallback={<Html>Loading...</Html>}>
          <RotatingModel object={gltf.scene} />
        </Suspense>
      </Canvas>
    </div>
  );
}
