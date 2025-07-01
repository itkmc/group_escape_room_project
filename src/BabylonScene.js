import React, { useEffect, useRef, useState } from "react";
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";
import "@babylonjs/inspector";
import { GLTF2Export } from "@babylonjs/serializers";

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
        new BABYLON.Vector3(-21, 15.5, 11.5),
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
        // 첫 번째 문 위치
        // const desiredDoor1WorldPos = new BABYLON.Vector3(-25.10, 14.80, 10.57);
        const door1 = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "door.glb", scene);
        door1.meshes.forEach((doorMesh) => {
          console.log("도어 메시 이름:", doorMesh.name);
          if (doorMesh.name === "Cube.002_Cube.000_My_Ui_0") { // 문짝만!
            // 1. 피벗 이동 (스케일 적용 전에!)
            // const boundingBox = doorMesh.getBoundingInfo().boundingBox;
            // const min = boundingBox.minimum;
            // const center = boundingBox.center;
            const pivot = new BABYLON.Vector3(-0.6, -6.3, 0);
          doorMesh.setPivotPoint(pivot);

            // 2. 위치, 회전, 스케일 적용
            doorMesh.parent = parentMesh;
            doorMesh.position = BABYLON.Vector3.TransformCoordinates(
              new BABYLON.Vector3(-25.10, 14.80, 10.57),
              BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
            );
            doorMesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
              .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, -Math.PI));
            doorMesh.scaling = new BABYLON.Vector3(31.8, 31.8, 31.8);
            doorMesh.checkCollisions = true;

            let isDoorOpen = false;
            const startRotation = doorMesh.rotationQuaternion.clone();

            // X축을 기준으로 90도 회전
            const endRotation = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2);

            // 열기 애니메이션
            const openAnim = new BABYLON.Animation(
              "doorOpen",
              "rotationQuaternion",
              30,
              BABYLON.Animation.ANIMATIONTYPE_QUATERNION,
              BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
            );
            openAnim.setKeys([
              { frame: 0, value: startRotation },
              { frame: 30, value: endRotation },
            ]);

            // 닫기 애니메이션
            const closeAnim = new BABYLON.Animation(
              "doorClose",
              "rotationQuaternion",
              30,
              BABYLON.Animation.ANIMATIONTYPE_QUATERNION,
              BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
            );
            closeAnim.setKeys([
              { frame: 0, value: endRotation },
              { frame: 30, value: startRotation },
            ]);

            doorMesh.actionManager = new BABYLON.ActionManager(scene);
            doorMesh.actionManager.registerAction(
              new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function () {
                if (!isDoorOpen) {
                  doorMesh.checkCollisions = false;
                  scene.beginDirectAnimation(doorMesh, [openAnim], 0, 30, false);
                } else {
                  doorMesh.checkCollisions = true;
                  scene.beginDirectAnimation(doorMesh, [closeAnim], 0, 30, false);
                }
                isDoorOpen = !isDoorOpen;
              })
            );

          }
        });

        // 두 번째 문 위치
        const desiredDoor2WorldPos = new BABYLON.Vector3(-28.28, 14.2, 14.1); // 원하는 다른 위치로 지정
        const door2 = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "low_poly_door_-_game_ready.glb", scene);
        door2.meshes.forEach((doorMesh) => {
          if (doorMesh.name !== "__root__") {
            doorMesh.parent = parentMesh;
            doorMesh.position = BABYLON.Vector3.TransformCoordinates(
              desiredDoor2WorldPos,
              BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
            );
            doorMesh.scaling = new BABYLON.Vector3(90, 70, 50);
            doorMesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
              .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2));
            doorMesh.checkCollisions = true;
          }
        });

        // 의자 위치
        const desiredChairWorldPos = new BABYLON.Vector3(-21, 14.2, 11.5);
        const chair = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "wooden_chair.glb", scene);
        chair.meshes.forEach((chairMesh) => {
          if (chairMesh.name !== "__root__") {
            chairMesh.parent = parentMesh;
            chairMesh.position = BABYLON.Vector3.TransformCoordinates(
              desiredChairWorldPos,
              BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
            );
            chairMesh.scaling = new BABYLON.Vector3(1.5, 1.5, 1.5);
            chairMesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
              .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2));
            chairMesh.checkCollisions = true;
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

        // 사다리 기능
        if (ladderMesh) {
          const ladderTop = new BABYLON.Vector3(-33.49, 14.13, -0.02);
          const ladderBottom = new BABYLON.Vector3(-33.49, 2.32, -0.02);

          const boundingInfo = ladderMesh.getBoundingInfo();
          const boundingBox = boundingInfo.boundingBox;
          const min = boundingBox.minimumWorld;
          const max = boundingBox.maximumWorld;

          const isInside =
            camera.position.x >= min.x && camera.position.x <= max.x &&
            camera.position.y >= 2.25 && camera.position.y <= 15.22 &&
            camera.position.z >= -0.35 && camera.position.z <= 0.7;

          if (isInside) {
            if (!isOnLadder) {
              setIsOnLadder(true);
              camera.applyGravity = false;
              camera.position.x = -33.49;
              camera.position.z = -0.02;
            }

            if (keysPressed["w"]) {
              camera.rotation.x = -1.21;
              camera.rotation.y = -0.11;
              camera.position.y += 0.05;

              if (camera.position.y >= 14.13) {
                const offset = new BABYLON.Vector3(0, 0, 0.5);
                const adjustedPos = ladderTop.add(offset);
                camera.position.x = adjustedPos.x;
                camera.position.z = adjustedPos.z;
                camera.rotation.x = -0.024;
                camera.rotation.y = -0.003;
              }
            } else if (keysPressed["s"]) {
              camera.rotation.x = 1.48;
              camera.rotation.y = 0.26;
              camera.position.y -= 0.15;

              if (camera.position.y <= 2.32) {
                const offset = new BABYLON.Vector3(0, 0, -0.5);
                const adjustedPos = ladderBottom.add(offset);
                camera.position.x = adjustedPos.x;
                camera.position.z = adjustedPos.z;
                camera.rotation.x = -0.024;
                camera.rotation.y = -0.003;
              }
            }
          } else {
            if (isOnLadder) {
              setIsOnLadder(false);
              camera.applyGravity = true;
            }
          }
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
