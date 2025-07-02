// BabylonScene.js
import React, { useEffect, useRef, useState } from "react";
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";
import "@babylonjs/inspector";
import { GLTF2Export } from "@babylonjs/serializers";
import { addDoorAndChair } from "./rooms/looptop"; // looptop 임포트
import { addOperatingRoom } from "./rooms/op_room";
import { handleLadderMovement } from "./ladder";

const BabylonScene = () => {
  const canvasRef = useRef(null);
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0, z: 0 });
  const [isOnLadder, setIsOnLadder] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  // showQuizRef는 더 이상 필요 없으니 제거했습니다.

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new BABYLON.Engine(canvasRef.current, true);
    const scene = new BABYLON.Scene(engine);
    scene.collisionsEnabled = true;

    let hemiLight;
    let originalHemiLightIntensity;
    let originalSceneClearColor;

    const initScene = async () => {
      const camera = new BABYLON.UniversalCamera(
        "camera",
        new BABYLON.Vector3(-0.51, 7.85, 11.90),
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
      // bedsideTable은 이제 addDoorAndChair 함수 내부에서 관리됩니다.

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
        // ✨ 중요: setShowQuiz 상태 업데이트 함수를 콜백으로 전달 ✨
        // 이 함수가 looptop.js의 addDoorAndChair에서 두루마리 클릭 시 호출됩니다.
        await addDoorAndChair(scene, parentMesh, () => setShowQuiz(true));
        await addOperatingRoom(scene, parentMesh);
      }
      
      // --- 특정 모델 밝기 조절 (LAMP_LP:LAMP_03_lowLAMP_03polySurface14_LAmp_0) ---
      const lampMesh1 = scene.getMeshByName("LAMP_LP:LAMP_03_lowLAMP_03polySurface14_LAmp_0");
      if (lampMesh1 && lampMesh1.material) {
        const material = lampMesh1.material;
        if (material instanceof BABYLON.PBRMaterial) {
          material.emissiveIntensity = 0.01; // 원하는 밝기 값으로 조절 (0.01 ~ 1.0)
        } else if (material instanceof BABYLON.StandardMaterial) {
          material.emissiveColor = material.emissiveColor.scale(0.01); // StandardMaterial인 경우
        }
      } else {
        console.warn("LAMP_LP:LAMP_03_lowLAMP_03polySurface14_LAmp_0 메쉬 또는 재질을 찾을 수 없습니다.");
      }
      // --- 특정 모델 밝기 조절 끝 ---
      
      // --- 특정 모델 밝기 조절 (LAMP_LP:LAMP_03_lowLAMP_03polySurface14_I_0) ---
      const lampMesh2 = scene.getMeshByName("LAMP_LP:LAMP_03_lowLAMP_03polySurface14_I_0");
      if (lampMesh2 && lampMesh2.material) {
        const material = lampMesh2.material;
        if (material instanceof BABYLON.PBRMaterial) {
          material.emissiveIntensity = 0.01; // 원하는 밝기 값으로 조절 (0.01 ~ 1.0)
          material.emissiveColor = material.emissiveColor.scale(0.1); // 필요하다면 발광 색상도 조절 (0.0 ~ 1.0)
        } else if (material instanceof BABYLON.StandardMaterial) {
          material.emissiveColor = material.emissiveColor.scale(0.01); // StandardMaterial인 경우
        }
      } else {
        console.warn("LAMP_LP:LAMP_03_lowLAMP_03polySurface14_I_0 메쉬 또는 재질을 찾을 수 없습니다.");
      }
      // --- 특정 모델 밝기 조절 끝 ---

      const keysPressed = {};

      // --- 조명 제어 코드 (평소 밝게, 영역 진입 시 어둡게) ---
      hemiLight = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(0, 1, 0), scene);
      originalHemiLightIntensity = 0.7; // 씬의 기본 (평소) 밝기 강도 (0.0 ~ 1.0)
      hemiLight.intensity = originalHemiLightIntensity;

      const darkZoneCenter = new BABYLON.Vector3(4.91, 7.85, 12.85); // 어둡게 할 영역의 중심 좌표 (X, Y, Z)
      const darkZoneRadius = 4.8; // 어둡게 할 영역의 반경 (미터)

      originalSceneClearColor = scene.clearColor.clone(); 
      originalSceneClearColor = new BABYLON.Color4(0.1, 0.1, 0.1, 1); // 씬의 평소 배경색 (R, G, B, Alpha)

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

        // --- 특정 영역 밝게/어둡게 로직 (원하는 방향으로 수정) ---
        const distanceToDarkZone = BABYLON.Vector3.Distance(camera.position, darkZoneCenter);

        if (distanceToDarkZone < darkZoneRadius) {
          // **어두워지는 영역 진입 시**
          hemiLight.intensity = 0.5; // 영역 진입 시 씬의 밝기 강도 (수정 후 0.005로 맞추기)
          // scene.clearColor = new BABYLON.Color4(0.005, 0.005, 0.005, 1); // 영역 진입 시 배경색 (R, G, B, Alpha)
        } else {
          // **영역 벗어날 시 (평소 밝기로 복구)**
          hemiLight.intensity = originalHemiLightIntensity;
          scene.clearColor = originalSceneClearColor;
        }
        // --- 조명 로직 끝 ---
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

      scene.onPointerObservable.add((pointerInfo) => {
        if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERPICK) {
          const mesh = pointerInfo.pickInfo?.pickedMesh;
          // ActionManager가 있는 메쉬 (두루마리, 서랍, 문 등)는 각자 클릭 이벤트가 있으므로 여기서 일반적인 alert는 방지합니다.
          // 또한 __root__ 메쉬는 일반적으로 클릭할 필요가 없습니다.
          if (mesh && mesh.name !== "__root__" && !mesh.actionManager) {
            // alert(`Clicked mesh name: ${mesh.name}`); // 필요시 주석 해제하여 사
          }
        }
      });

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

      // 클린업 함수는 useEffect에서 반환됩니다.
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
        window.removeEventListener("resize", onResize);
        // 엔진과 씬은 컴포넌트 언마운트 시 자동으로 정리됩니다.
        // 하지만 명시적으로 dispose하는 것이 좋습니다.
        scene.dispose();
        engine.dispose();
      };
    };

    initScene();

  }, []); // 빈 배열은 컴포넌트가 마운트될 때 한 번만 실행되도록 합니다.

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
      {showQuiz && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.7)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2000
        }}>
          <div style={{ background: "white", padding: 24, borderRadius: 12, textAlign: "center", minWidth: 320 }}>
            <div style={{ fontSize: 20, marginBottom: 16, color: "#222" }}>[문제] 다음을 보기를 보고 [7+3 = ?]를 구하시오</div>
            <img src="/problem1.png" alt="문제 이미지" style={{ maxWidth: 400, marginBottom: 16 }} />
            <br />
            <button onClick={() => setShowQuiz(false)} style={{ padding: "8px 20px", fontSize: 16, borderRadius: 6, background: "#333", color: "white", border: "none", cursor: "pointer" }}>닫기</button>
          </div>
        </div>
      )}
    </>
  );
};

export default BabylonScene;