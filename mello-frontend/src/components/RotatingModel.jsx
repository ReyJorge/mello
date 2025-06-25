import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";

export default function RotatingModel({ object, ...props }) {
  const group = useRef();

  const rotationState = useRef({ angleY: 0, directionY: 1 });
  const rotationX = useRef(0);
  const directionX = useRef(1);

  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    if (!group.current) return;

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

      // Pohyb rtů
      if (!group.current.userData.lipMoveTime) {
        group.current.userData.lipMoveTime = 0;
      }
      group.current.userData.lipMoveTime += delta * 3;
      const lipScale = 1 + 0.03 * Math.sin(group.current.userData.lipMoveTime);

      group.current.rotation.y = angleY;
      group.current.rotation.x = rotationX.current;
      group.current.scale.y = lipScale;
    } else {
      const lerpSpeed = 0.025;
      group.current.rotation.y += (0 - group.current.rotation.y) * lerpSpeed;
      group.current.rotation.x += (0 - group.current.rotation.x) * lerpSpeed;
      group.current.scale.y += (1 - group.current.scale.y) * lerpSpeed;
    }
  });

  return (
    <primitive
      ref={group}
      object={object}
      position={[0, -2.5, 0]} // posun dolů, uprav podle potřeby
      scale={[1.5, 1.5, 1.5]} // zvětšení, uprav podle potřeby
      {...props}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    />
  );
}
