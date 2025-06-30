import React, { useEffect, useRef, useState } from "react";
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";
import "@babylonjs/inspector";
import { GLTF2Export } from "@babylonjs/serializers";

const BabylonScene = () => {
  const canvasRef = useRef(null);

  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0, z: 0 });
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new BABYLON.Engine(canvasRef.current, true);
    const scene = new BABYLON.Scene(engine);
    scene.collisionsEnabled = true;

    // 카메라 설정
    const camera = new BABYLON.UniversalCamera(
      "camera",
      new BABYLON.Vector3(-21, 15.5, 12),
      scene
    );
    camera.rotation.y = Math.PI + Math.PI / 2;
    camera.attachControl(canvasRef.current, true);

    camera.checkCollisions = true;
    camera.applyGravity = true;
    camera.ellipsoid = new BABYLON.Vector3(0.1, 0.7, 0.1);

    const MAX_CAMERA_HEIGHT = 50;
    const MIN_CAMERA_HEIGHT = 0;
    const maxPitch = BABYLON.Tools.ToRadians(180);
    const minPitch = BABYLON.Tools.ToRadians(-60);

    const WALK_SPEED = 0.1;
    const RUN_SPEED = 0.3;
    camera.speed = WALK_SPEED;

    let ladderPositions = [];

    const specialPositions = [
      new BABYLON.Vector3(-33.39, 3.38, -0.39),
      new BABYLON.Vector3(-13.72, 2.73, 2.31),
    ];
    const specialRadius = 12;

    BABYLON.SceneLoader.ImportMeshAsync(
      "",
      "/models/",
      "abandoned_hospital_part_two.glb",
      scene
    ).then((result) => {
      console.log("✅ Loaded hospital meshes");

      let parentMesh = null;

      result.meshes.forEach((mesh) => {
        if (mesh.name.startsWith("Hospital_02_")) {
          mesh.checkCollisions = true;
          mesh.isPickable = true;
        }

        if (
          mesh.name === "Hospital_02_36m_0" ||
          mesh.name === "Hospital_02_105m_0"
        ) {
          mesh.checkCollisions = false;
          mesh.isPickable = false;
          mesh.computeWorldMatrix(true);
          const worldPos = mesh.getAbsolutePosition();
          ladderPositions.push(worldPos);
          console.log(`📌 Ladder position (${mesh.name}):`, worldPos);

          if (mesh.name === "Hospital_02_36m_0") {
            parentMesh = mesh;
          }
        }

        if (mesh.name.startsWith("door")) {
          mesh.dispose();
          console.log(`🗑️ Removed mesh: ${mesh.name}`);
        }
      });

      // 🚪 도어 모델을 부모 메시에 자식으로 추가
      if (parentMesh) {
        BABYLON.SceneLoader.ImportMeshAsync(
          "",
          "/models/",
          "low_poly_door_-_game_ready.glb",
          scene
        ).then((doorResult) => {
          const doorMeshes = doorResult.meshes;

          // 도어의 월드 위치 설정
          const desiredWorldPos = new BABYLON.Vector3(-28.25, 14.4, 14.2);

          doorMeshes.forEach((doorMesh) => {
            if (doorMesh !== scene.meshes[0]) {
              // 부모 메시에 자식으로 추가
              doorMesh.parent = parentMesh;

              // 부모 메시의 월드 매트릭스를 반영하여 도어의 위치를 계산
              const parentWorldMatrix = parentMesh.getWorldMatrix();
              const invParentWorldMatrix = BABYLON.Matrix.Invert(parentWorldMatrix);

              // 월드 좌표 → 로컬 좌표 변환
              doorMesh.position = BABYLON.Vector3.TransformCoordinates(
                desiredWorldPos,
                invParentWorldMatrix
              );

              // 스케일 설정
              doorMesh.scaling = new BABYLON.Vector3(50, 50, 50);

              // 회전 설정: Quaternion을 사용하여 회전 적용
              const rotationQuaternion = BABYLON.Quaternion.RotationAxis(
                BABYLON.Axis.X, // X축 기준으로 회전
                Math.PI / 2       // 90도 회전
              ).multiply(
                BABYLON.Quaternion.RotationAxis(
                  BABYLON.Axis.Y, // Y축 기준으로 회전
                  Math.PI / 2      // 90도 회전
                )
              );
              doorMesh.rotationQuaternion = rotationQuaternion;

              console.log("🚪 Door attached at local position:", doorMesh.position);
            }
          });
        });
      }
    });

    scene.registerBeforeRender(() => {
      // 사다리 근처 체크
      const nearLadder =
        ladderPositions.length > 0 &&
        ladderPositions.some(
          (pos) => BABYLON.Vector3.Distance(camera.position, pos) < 3
        );

      const ladderDownStart = new BABYLON.Vector3(-33.44, 14.13, -0.29);
      const isLadderDown =
        Math.abs(camera.position.x - ladderDownStart.x) < 0.25 &&
        camera.position.y <= 14.13 &&
        camera.position.y >= 2.74 &&
        Math.abs(camera.position.z - ladderDownStart.z) < 1;

      if (isLadderDown) {
        camera.rotation.x = 1.4;
        camera.rotation.y = Math.PI / 30;
        const offset = new BABYLON.Vector3(0, 0, 0.5);
        const adjustedPos = ladderDownStart.add(offset);
        camera.position.x = adjustedPos.x;
        camera.position.z = adjustedPos.z;
      } else {
        if (camera.rotation && camera.rotation.x !== undefined) {
          if (camera.rotation.x > maxPitch) camera.rotation.x = maxPitch;
          if (camera.rotation.x < minPitch) camera.rotation.x = minPitch;
        }
      }

      const nearSpecialPos = specialPositions.some(
        (pos) => BABYLON.Vector3.Distance(camera.position, pos) < specialRadius
      );

      if (nearSpecialPos || nearLadder) {
        camera.applyGravity = false;
        if (camera.position.y > MAX_CAMERA_HEIGHT)
          camera.position.y = MAX_CAMERA_HEIGHT;
        if (camera.position.y < MIN_CAMERA_HEIGHT)
          camera.position.y = MIN_CAMERA_HEIGHT;
      } else {
        camera.applyGravity = true;
        if (camera.position.y > MAX_CAMERA_HEIGHT)
          camera.position.y = MAX_CAMERA_HEIGHT;
        if (camera.position.y < MIN_CAMERA_HEIGHT)
          camera.position.y = MIN_CAMERA_HEIGHT;
      }

      // 위치 상태 업데이트
      setPlayerPos({
        x: camera.position.x.toFixed(2),
        y: camera.position.y.toFixed(2),
        z: camera.position.z.toFixed(2),
      });
    });

    // 키보드 이동 설정
    camera.keysUp.push(87); // W
    camera.keysDown.push(83); // S
    camera.keysLeft.push(65); // A
    camera.keysRight.push(68); // D
    camera.minZ = 0.1;
    camera.speed = 0.1;
    camera.angularSensibility = 6000;

    const handleKeyDown = (evt) => {
      if (evt.key === "Shift" || evt.keyCode === 16) {
        setIsRunning(true);
        camera.speed = RUN_SPEED;
      }
    };

    const handleKeyUp = (evt) => {
      if (evt.key === "Shift" || evt.keyCode === 16) {
        setIsRunning(false);
        camera.speed = WALK_SPEED;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // 마우스 휠로 전후 이동
    canvasRef.current.addEventListener("wheel", (evt) => {
      evt.preventDefault();
      const delta = evt.deltaY < 0 ? 1 : -1;
      const forward = camera.getDirection(BABYLON.Axis.Z);
      camera.position.addInPlace(forward.scale(delta));
    });

    // 기본 조명 생성
    new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), scene);

    scene.onPointerObservable.add((pointerInfo) => {
      if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERPICK) {
        const mesh = pointerInfo.pickInfo?.pickedMesh;
        if (mesh) {
          console.log("🖱️ Clicked mesh name:", mesh.name);
          alert(`Clicked mesh name: ${mesh.name}`);
        }
      }
    });

    const onKeyDown = (evt) => {
      if (evt.key === "p" || evt.key === "P") {
        GLTF2Export.GLBAsync(scene, "saved_scene").then((glb) => {
          glb.downloadFiles();
          console.log("💾 Scene exported to GLB");
        });
      }
    };
    window.addEventListener("keydown", onKeyDown);

    engine.runRenderLoop(() => {
      scene.render();
    });

    const onResize = () => engine.resize();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("resize", onResize);
      scene.dispose();
      engine.dispose();
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{ width: "100vw", height: "100vh", display: "block" }}
      />
      {/* 화면 좌측 상단에 플레이어 좌표 표시 */}
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
