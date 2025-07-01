import React, { useEffect, useRef, useState } from "react";
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";
import "@babylonjs/inspector";
import { GLTF2Export } from "@babylonjs/serializers";
import { addDoorAndChair } from "./door_chair";
import { handleLadderMovement } from "./ladder";

const BabylonScene = () => {
  const canvasRef = useRef(null);
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0, z: 0 });
  const [isOnLadder, setIsOnLadder] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new BABYLON.Engine(canvasRef.current, true);
    const scene = new BABYLON.Scene(engine);
    scene.collisionsEnabled = true;

    const initScene = async () => {
      const camera = new BABYLON.UniversalCamera(
        "camera",
        new BABYLON.Vector3(5.19, 8, 16.05),
        scene
      );
      camera.rotation.y = Math.PI + Math.PI / 2;
      camera.attachControl(canvasRef.current, true);
      camera.checkCollisions = true;
      camera.applyGravity = true;
      camera.ellipsoid = new BABYLON.Vector3(0.1, 0.7, 0.1);

      const MAX_CAMERA_HEIGHT = 50;
      const MIN_CAMERA_HEIGHT = 0;

      const WALK_SPEED = 0.1;
      const RUN_SPEED = 0.3;
      camera.speed = WALK_SPEED;

      const specialPositions = [
        new BABYLON.Vector3(-13.72, 2.73, 2.31),
      ];
      const specialRadius = 12;

      let ladderMesh = null;

      const result = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "abandoned_hospital_part_two.glb", scene);
      let parentMesh = null;
      result.meshes.forEach((mesh) => {
        if (mesh.name.startsWith("Hospital_02_")) {
          mesh.checkCollisions = true;
          mesh.isPickable = true;
        }
        
        if (mesh.name === "Hospital_02_36m_0") {
          parentMesh = mesh;
        }
        
        if (mesh.name.startsWith("door")) {
          mesh.dispose();
        }

        if (mesh.name === "Hospital_02_105m_0") {
          ladderMesh = mesh;
          ladderMesh.checkCollisions = false;
        }
      });

      if (parentMesh) {
        await addDoorAndChair(scene, parentMesh);
      
        // 모니터 위치 
        const desiredMonitorWorldPos = new BABYLON.Vector3(4.10, 7.85, 12.37);
        const monitor = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "monitor_with_heart_rate.glb", scene);
        monitor.meshes.forEach((monitorMesh) => {
          if (monitorMesh.name !== "__root__") {
            monitorMesh.parent = parentMesh;
            monitorMesh.position = BABYLON.Vector3.TransformCoordinates(
              desiredMonitorWorldPos,
              BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
            );
            monitorMesh.scaling = new BABYLON.Vector3(120,100,100);
            monitorMesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI)
              .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI));
            monitorMesh.checkCollisions = true;
          }
        });

        // 수술대 위치 
        const desiredOperatingWorldPos = new BABYLON.Vector3(6, 6.25, 12.37);
        const operating = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "operating_table.glb", scene);
        operating.meshes.forEach((operatingMesh) => {
          if (operatingMesh.name !== "__root__") {
            operatingMesh.parent = parentMesh;
            operatingMesh.position = BABYLON.Vector3.TransformCoordinates(
              desiredOperatingWorldPos,
              BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
            );
            operatingMesh.scaling = new BABYLON.Vector3(20,20,20);
            operatingMesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
              .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI));
            operatingMesh.checkCollisions = true;
          }
        });


        // 사물함 위치 
        const desiredlockerWorldPos = new BABYLON.Vector3(10.73, 7.15, 14.99);
        const locker = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "armored_cabinet (1).glb", scene);

        const clickableNames = ["Object_15", "Object_13", "Object_17", "Object_9", "Object_7"];
        let animationGroup = null;

        locker.meshes.forEach((lockerMesh) => {
          if (lockerMesh.name !== "__root__") {
            lockerMesh.parent = parentMesh;

            // 공통 위치 계산
            let localPos = BABYLON.Vector3.TransformCoordinates(
              desiredlockerWorldPos,
              BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
            );

            // 특정 메시들의 위치 조정
            if (clickableNames.includes(lockerMesh.name)) {
              localPos.z -= 100;
              console.log(`${lockerMesh.name} 위치 조정됨 (z -= 100):`, localPos);
            }

            lockerMesh.position = localPos;
            lockerMesh.scaling = new BABYLON.Vector3(110, 110, 110);
            lockerMesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
              .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2));
            lockerMesh.checkCollisions = true;
            lockerMesh.isPickable = true;
          }
        });

        // 애니메이션 그룹 찾기
        animationGroup = locker.animationGroups?.find(group => group.targetedAnimations.length > 0);

        if (animationGroup) {
          animationGroup.stop(); // 처음엔 멈춰둠
        } else {
          console.warn("애니메이션 그룹을 찾지 못했습니다.");
        }

        // 클릭 이벤트 처리
        scene.onPointerObservable.add((pointerInfo) => {
          if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERPICK) {
            const pickedMesh = pointerInfo.pickInfo?.pickedMesh;
            console.log("pickedMesh:", pickedMesh?.name);

            if (pickedMesh && clickableNames.includes(pickedMesh.name)) {
              console.log(`${pickedMesh.name} 클릭됨 - 애니메이션 재생`);
              animationGroup?.reset();
              animationGroup?.play(false); // 한 번만 재생
            }
          }
        });



      }

      const keysPressed = {};

      scene.registerBeforeRender(() => {
        const nearSpecialPos = specialPositions.some((pos) => BABYLON.Vector3.Distance(camera.position, pos) < specialRadius);

        if (nearSpecialPos || isOnLadder) {
          camera.applyGravity = false;
          camera.position.y = Math.min(MAX_CAMERA_HEIGHT, Math.max(MIN_CAMERA_HEIGHT, camera.position.y));
        } else {
          camera.applyGravity = true;
          camera.position.y = Math.min(MAX_CAMERA_HEIGHT, Math.max(MIN_CAMERA_HEIGHT, camera.position.y));
        }

        if (keysPressed["shift"]) {
          camera.speed = RUN_SPEED;
        } else {
          camera.speed = WALK_SPEED;
        }

        setPlayerPos({
          x: camera.position.x.toFixed(2),
          y: camera.position.y.toFixed(2),
          z: camera.position.z.toFixed(2),
        });
        handleLadderMovement(camera, ladderMesh, keysPressed, isOnLadder, setIsOnLadder);
      });

      camera.keysUp.push(87);
      camera.keysDown.push(83);
      camera.keysLeft.push(65);
      camera.keysRight.push(68);
      camera.minZ = 0.1;
      camera.angularSensibility = 6000;

      const handleKeyDown = (evt) => {
        keysPressed[evt.key.toLowerCase()] = true;
      };

      const handleKeyUp = (evt) => {
        keysPressed[evt.key.toLowerCase()] = false;
      };

      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);

      canvasRef.current.addEventListener("wheel", (evt) => {
        evt.preventDefault();
        const delta = evt.deltaY < 0 ? 1 : -1;
        const forward = camera.getDirection(BABYLON.Axis.Z);
        camera.position.addInPlace(forward.scale(delta));
      });

      new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), scene);

      // scene.onPointerObservable.add((pointerInfo) => {
      //   if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERPICK) {
      //     const mesh = pointerInfo.pickInfo?.pickedMesh;
      //     if (mesh) {
      //       alert(`Clicked mesh name: ${mesh.name}`);
      //     }
      //   }
      // });

      window.addEventListener("keydown", (evt) => {
        if (evt.key === "p" || evt.key === "P") {
          GLTF2Export.GLBAsync(scene, "saved_scene").then((glb) => {
            glb.downloadFiles();
          });
        }
      });

      engine.runRenderLoop(() => {
        scene.render();
      });

      const onResize = () => engine.resize();
      window.addEventListener("resize", onResize);

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
        window.removeEventListener("resize", onResize);
        scene.dispose();
        engine.dispose();
      };
    };

    initScene();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <canvas ref={canvasRef} style={{ width: "100vw", height: "100vh", display: "block" }} />
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          padding: "8px 12px",
          backgroundColor: "rgba(0,0,0,0.6)",
          color: "white",
          fontFamily: "monospace",
          fontSize: "14px",
          borderRadius: "4px",
          userSelect: "none",
          zIndex: 1000,
        }}
      >
        <div>내 위치:</div>
        <div>X: {playerPos.x}</div>
        <div>Y: {playerPos.y}</div>
        <div>Z: {playerPos.z}</div>
      </div>
    </>
  );
};

export default BabylonScene;