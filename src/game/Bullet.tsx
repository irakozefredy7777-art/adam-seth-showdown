import * as THREE from "three";

interface Props {
  position: [number, number, number];
}

export function Bullet({ position }: Props) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.08, 6, 6]} />
      <meshStandardMaterial color="#fff2a0" emissive="#ffcf3a" emissiveIntensity={4} />
    </mesh>
  );
}
