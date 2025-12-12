import React, { useRef, useEffect, useState } from 'react';
// @ts-ignore
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { SpotLight, Stars, Text, useTexture, Stats, Billboard, Image } from '@react-three/drei';
import * as THREE from 'three';
import { useStore, TRANSLATIONS } from '../store';
import { GameState, LevelState, ItemType } from '../types';
import { Flashlight, Menu, ArrowDownFromLine, Hand, Backpack } from 'lucide-react';

// --- Constants ---
const MOVEMENT_SPEED = 0.08;
const LOOK_SENSITIVITY = 0.005;
const PLAYER_HEIGHT_STANDING = 1.7;
const PLAYER_HEIGHT_CROUCHING = 0.9;
const INTERACTION_DISTANCE = 4.0;
const MONSTER_SPAWN_TIME = 120000; // 2 Minutes
const MONSTER_SPEED = 0.13; 

// --- Input State ---
const inputState = {
  move: { x: 0, y: 0 },
  look: { x: 0, y: 0 },
  crouch: false,
  interactPressed: false
};

// --- Helper Components ---
const Box = ({ position, args, color, ...props }: any) => (
  <mesh position={position} {...props}>
    <boxGeometry args={args} />
    <meshStandardMaterial color={color} roughness={0.8} />
  </mesh>
);

const playScream = () => {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
};

// --- Game Logic Components ---

const InteractionController = () => {
  const { camera, scene } = useThree();
  const { addItem, hasItem, removeItem, showNotification, setLevelState, nextFloor, floor, cablesFixed, fixCable, t } = useStore();
  const raycaster = useRef(new THREE.Raycaster());

  useFrame(() => {
    // Check for Stairs
    const levelState = useStore.getState().levelState;
    if (levelState === LevelState.APARTMENT) {
        if (camera.position.z > 14 && camera.position.x > -2 && camera.position.x < 2) {
             showNotification(`${t('floor_descended')}: ${t('floor')} ${floor + 1}`);
             nextFloor();
             return;
        }
    }

    if (inputState.interactPressed) {
      inputState.interactPressed = false; 

      raycaster.current.setFromCamera(new THREE.Vector2(0, 0), camera);
      const intersects = raycaster.current.intersectObjects(scene.children, true);
      const hit = intersects.find(i => i.distance < INTERACTION_DISTANCE && i.object.userData.interactable);

      if (hit) {
        const type = hit.object.userData.type;
        const data = hit.object.userData;

        if (type === 'KEY_ROOF') {
          addItem('KEY_ROOF');
          showNotification(t('found_roof_key'));
          hit.object.visible = false;
          hit.object.userData.interactable = false;
        }
        else if (type === 'DOOR_ROOF') {
          if (hasItem('KEY_ROOF')) {
            showNotification(t('door_opening'));
            setTimeout(() => {
                removeItem('KEY_ROOF');
                setLevelState(LevelState.APARTMENT);
            }, 1000);
          } else {
            showNotification(t('locked_need_key'));
          }
        }
        else if (type === 'DOOR_ROOM') {
          if (!data.isOpen) {
             const needsKey = Math.random() > 0.7; 
             if (!needsKey || hasItem('KEY_ROOM')) {
                 if (needsKey) removeItem('KEY_ROOM');
                 hit.object.rotation.y += Math.PI / 2;
                 hit.object.position.x += (hit.object.position.x > 0 ? -0.5 : 0.5);
                 hit.object.userData.isOpen = true;
                 showNotification(t('room_opened'));
             } else {
                 showNotification(t('room_locked'));
             }
          }
        }
        else if (type === 'DRAWER') {
           if (data.searched) {
               showNotification(t('drawer_searched'));
               return;
           }
           data.searched = true;
           const rng = Math.random() * 100;
           if (rng < 30) {
               addItem('KEY_ROOM');
               showNotification(t('found_room_key'));
           } else {
               showNotification(t('drawer_empty'));
           }
        }
        // Electrical Room Tasks
        else if (type === 'CABLE_BOX') {
            if (!data.fixed) {
                fixCable();
                hit.object.userData.fixed = true;
                (hit.object as THREE.Mesh).material = new THREE.MeshStandardMaterial({ color: 'green' });
                showNotification(`${t('cable_fixed')} (${cablesFixed + 1}/4)`);
            }
        }
        else if (type === 'EXIT_DOOR_ELEC') {
            if (cablesFixed >= 4) {
                showNotification(t('escape_success'));
                setTimeout(() => {
                   useStore.getState().resetGame();
                }, 2000);
            } else {
                showNotification(t('fix_first'));
            }
        }
      }
    }
  });

  return null;
};

// --- Monster: ZILLI MAYMUN ---
const ZilliMaymun = () => {
    const { camera } = useThree();
    const { setGameState, t } = useStore();
    const monsterRef = useRef<THREE.Group>(null);
    const [active, setActive] = useState(false);
    const [spawned, setSpawned] = useState(false);
    const [jumpscareTriggered, setJumpscareTriggered] = useState(false);
    const MONKEY_IMG = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/56.png"; 

    useEffect(() => {
        const timer = setTimeout(() => setActive(true), MONSTER_SPAWN_TIME);
        return () => clearTimeout(timer);
    }, []);

    useFrame((state, delta) => {
        if (!active || !monsterRef.current || jumpscareTriggered) return;
        if (!spawned) {
             const angle = Math.random() * Math.PI * 2;
             const dist = 12;
             monsterRef.current.position.set(
                 camera.position.x + Math.sin(angle) * dist,
                 1.2,
                 camera.position.z + Math.cos(angle) * dist
             );
             setSpawned(true);
        }
        const playerPos = camera.position;
        const monsterPos = monsterRef.current.position;
        const dir = new THREE.Vector3().subVectors(playerPos, monsterPos);
        dir.y = 0; 
        const distToPlayer = dir.length();
        dir.normalize();

        if (distToPlayer > 1.0) {
            monsterRef.current.position.add(dir.multiplyScalar(MONSTER_SPEED));
            monsterRef.current.lookAt(playerPos.x, 1.2, playerPos.z);
        } else {
            setJumpscareTriggered(true);
            setGameState(GameState.JUMPSCARE);
            playScream();
            setTimeout(() => {
                setGameState(GameState.GAME_OVER);
            }, 1500);
        }
    });

    if (jumpscareTriggered) return null;
    if (!active) return null;

    return (
        <group ref={monsterRef}>
             <Billboard position={[0, 0.2, 0]} follow={true} lockX={false} lockY={false} lockZ={false}>
                <Image url={MONKEY_IMG} transparent scale={[1.5, 1.5]} opacity={1} />
                <mesh position={[0.15, 0.2, 0.1]}><sphereGeometry args={[0.05]} /><meshBasicMaterial color="red" toneMapped={false} /></mesh>
                <mesh position={[-0.15, 0.2, 0.1]}><sphereGeometry args={[0.05]} /><meshBasicMaterial color="red" toneMapped={false} /></mesh>
            </Billboard>
            <pointLight color="red" distance={4} intensity={2} castShadow={false} />
            <Text position={[0, 1.2, 0]} fontSize={0.2} color="red" anchorY="bottom">{t('monkey_name')}</Text>
        </group>
    );
};

// --- Ghost ---
const Ghost = () => {
    const { camera } = useThree();
    const { setGameState, t } = useStore();
    const ghostRef = useRef<THREE.Group>(null);
    
    useFrame(({ clock }) => {
        if (!ghostRef.current) return;
        const tt = clock.getElapsedTime() * 0.5;
        const r = 8;
        ghostRef.current.position.x = Math.sin(tt) * r;
        ghostRef.current.position.z = Math.cos(tt) * r;
        ghostRef.current.lookAt(camera.position);
        if (ghostRef.current.position.distanceTo(camera.position) < 1.5) {
             setGameState(GameState.GAME_OVER);
        }
    });

    return (
        <group ref={ghostRef} position={[0, 1.5, 0]}>
            <mesh>
                <capsuleGeometry args={[0.4, 1.2, 4, 8]} />
                <meshStandardMaterial color="#88aaff" transparent opacity={0.4} />
            </mesh>
            <pointLight color="#88aaff" distance={5} intensity={1} castShadow={false} />
            <Text position={[0, 1.2, 0]} fontSize={0.3} color="#88aaff">{t('ghost_name')}</Text>
        </group>
    );
};

// --- Levels ---

const RooftopLevel = () => {
  const t = useStore(state => state.t);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
      </mesh>
      <Box position={[0, 0.5, -10]} args={[20, 1, 0.5]} color="#111" />
      <Box position={[0, 0.5, 10]} args={[20, 1, 0.5]} color="#111" />
      <Box position={[-10, 0.5, 0]} args={[0.5, 1, 20]} color="#111" />
      <Box position={[10, 0.5, 0]} args={[0.5, 1, 20]} color="#111" />

      <group position={[5, 1.5, 5]}>
         <Box position={[0, 0, 0]} args={[4, 3, 4]} color="#333" />
         <mesh position={[-2.1, -0.5, 0]} userData={{ type: 'DOOR_ROOF', interactable: true }}>
            <boxGeometry args={[0.2, 2, 1.5]} />
            <meshStandardMaterial color="#8B0000" />
         </mesh>
         <Text position={[-2.2, 0.2, 0]} rotation={[0, -Math.PI/2, 0]} fontSize={0.2} color="white">{t('exit')}</Text>
      </group>

      <mesh position={[2, 0.2, 2]} userData={{ type: 'KEY_ROOF', interactable: true }}>
        <boxGeometry args={[0.2, 0.2, 0.4]} />
        <meshStandardMaterial color="gold" emissive="yellow" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
};

const ApartmentFloorLevel = () => {
    const { floor, t } = useStore();
    const doors