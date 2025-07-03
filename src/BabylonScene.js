import React, { useEffect, useRef, useState } from "react";
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";
import "@babylonjs/inspector";
import { GLTF2Export } from "@babylonjs/serializers";
import { addDoorAndChair } from "./rooms/looptop";
import { addOperatingRoom } from "./rooms/op_room";
import { addDoctorOffice } from "./rooms/office";
import { handleLadderMovement } from "./ladder";

const BabylonScene = () => {
  const canvasRef = useRef(null);
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0, z: 0 });
  const [isOnLadder, setIsOnLadder] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  const flashlightSpotLightRef = useRef(null);
  const rootFlashlightMeshRef = useRef(null);
  const flashlightHolderRef = useRef(null);
  const isFlashlightHeldRef = useRef(false);

  // ⭐ 추가: 손전등 UI 상태를 위한 useState
  const [flashlightStatus, setFlashlightStatus] = useState(" 없음"); // "손전등 없음", "손전등 있음 (꺼짐)", "손전등 있음 (켜짐)"

  // ⭐ 새로 추가된 퀴즈 및 아이템 관련 상태 ⭐
  const [answerInput, setAnswerInput] = useState(''); // 사용자가 입력할 정답
  const [quizMessage, setQuizMessage] = useState(''); // 퀴즈 결과 메시지
  const [hasKeyItem, setHasKeyItem] = useState(false); // 키 아이템 획득 여부

  // 퀴즈 정답 정의 (컴포넌트 내부에 상수로 선언)
  const correctAnswer = "410";

  // ⭐ 퀴즈 정답 제출 핸들러 함수 ⭐
  const handleAnswerSubmit = () => {
    if (answerInput === correctAnswer) {
      setQuizMessage("정답입니다! 키 아이템을 획득했습니다.");
      setHasKeyItem(true); // 키 아이템 획득 상태로 변경
      // 정답을 맞췄으므로 퀴즈 창을 바로 닫지 않고 메시지를 보여준 후,
      // 사용자가 '닫기' 버튼을 눌러 퀴즈를 종료하도록 유도합니다.
    } else {
      setQuizMessage("오답입니다. 다시 시도해 보세요.");
      setAnswerInput(''); // 오답일 경우 입력 필드 초기화
    }
  };

  // ⭐ renderKeyItem 함수는 더 이상 사용하지 않으므로 제거합니다. ⭐


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
        // setShowQuiz(true)는 이 함수가 호출될 때 퀴즈를 띄웁니다.
        await addDoorAndChair(scene, parentMesh, () => setShowQuiz(true), () => hasKeyItem);
        await addOperatingRoom(scene, parentMesh);
        await addDoctorOffice(scene, parentMesh);
      }

      // 수술실 조명
      const lampMesh1 = scene.getMeshByName("LAMP_LP:LAMP_03_lowLAMP_03polySurface14_LAmp_0");
      if (lampMesh1 && lampMesh1.material) {
        const material = lampMesh1.material;
        if (material instanceof BABYLON.PBRMaterial) {
          material.emissiveIntensity = 0.01;
        } else if (material instanceof BABYLON.StandardMaterial) {
          material.emissiveColor = material.emissiveColor.scale(0.01);
        }
      } else {
        console.warn("LAMP_LP:LAMP_03_lowLAMP_03polySurface14_LAmp_0 메쉬 또는 재질을 찾을 수 없습니다.");
      }

      const lampMesh2 = scene.getMeshByName("LAMP_LP:LAMP_03_lowLAMP_03polySurface14_I_0");
      if (lampMesh2 && lampMesh2.material) {
        const material = lampMesh2.material;
        if (material instanceof BABYLON.PBRMaterial) {
          material.emissiveIntensity = 0.01;
          material.emissiveColor = material.emissiveColor.scale(0.1);
        } else if (material instanceof BABYLON.StandardMaterial) {
          material.emissiveColor = material.emissiveColor.scale(0.01);
        }
      } else {
        console.warn("LAMP_LP:LAMP_03_lowLAMP_03polySurface14_I_0 메쉬 또는 재질을 찾을 수 없습니다.");
      }

      const keysPressed = {};

      //전체 씬조명
      hemiLight = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(0, 1, 0), scene);
      originalHemiLightIntensity = 0.7; // 전체씬 0.2
      hemiLight.intensity = originalHemiLightIntensity;

      //수술실 조명 끔
      const darkZoneCenter = new BABYLON.Vector3(6.8, 7.85, 12.85); //어둡게 할 영역 중심
      const darkZoneRadius = 5; //반경

      originalSceneClearColor = new BABYLON.Color4(0.0001, 0.0001, 0.0001, 1);

      const flashResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "flashlight.glb", scene);

      rootFlashlightMeshRef.current = flashResult.meshes.find(mesh => mesh.name === "__root__");
      if (!rootFlashlightMeshRef.current) {
          rootFlashlightMeshRef.current = flashResult.meshes[0];
          console.warn("flashlight.glb에서 '__root__' 메쉬를 찾을 수 없습니다. 첫 번째 로드된 메쉬를 루트로 사용합니다.");
      }

      flashResult.animationGroups.forEach(ag => {
          ag.stop();
      });

      if (rootFlashlightMeshRef.current) {
          flashlightHolderRef.current = new BABYLON.TransformNode("flashlightHolder", scene);
          
          flashlightHolderRef.current.position = new BABYLON.Vector3(-0.4, 7.5, 11.0);
          flashlightHolderRef.current.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
          flashlightHolderRef.current.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI)
              .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2));

          rootFlashlightMeshRef.current.parent = flashlightHolderRef.current;
          rootFlashlightMeshRef.current.position = BABYLON.Vector3.Zero();
          rootFlashlightMeshRef.current.scaling = BABYLON.Vector3.One();
          rootFlashlightMeshRef.current.rotationQuaternion = BABYLON.Quaternion.Identity();

          flashResult.meshes.forEach((mesh) => {
              mesh.isPickable = true;
          });

          // ⭐ 이곳에 더미 충돌체 생성 코드를 삽입합니다. ⭐
          const flashlightCollisionBox = BABYLON.MeshBuilder.CreateBox("flashlightCollisionBox", { size: 0.3 }, scene);
          flashlightCollisionBox.parent = flashlightHolderRef.current;
          flashlightCollisionBox.position = new BABYLON.Vector3(2, 2, 2);
          flashlightCollisionBox.visibility = 0;
          flashlightCollisionBox.checkCollisions = true;

          flashlightSpotLightRef.current = new BABYLON.SpotLight(
              "flashlightSpotLight",
              new BABYLON.Vector3(0, 0, -20),
              new BABYLON.Vector3(0, 0, 1),
              BABYLON.Tools.ToRadians(5), //손전등 반경
              2,
              scene
          );
          flashlightSpotLightRef.current.diffuse = new BABYLON.Color3(1, 1, 0.8);
          flashlightSpotLightRef.current.specular = new BABYLON.Color3(1, 1, 1);
          flashlightSpotLightRef.current.intensity = 0;
          flashlightSpotLightRef.current.parent = flashlightHolderRef.current;
          flashlightSpotLightRef.current.setEnabled(false);
      }

      // =======================

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

        const distanceToDarkZone = BABYLON.Vector3.Distance(camera.position, darkZoneCenter);

        // 수술실 조명 정도
        if (distanceToDarkZone < darkZoneRadius) {
          hemiLight.intensity = 0.0001;
          scene.clearColor = new BABYLON.Color4(0.0001, 0.0001, 0.0001, 1);
        } else {
          hemiLight.intensity = originalHemiLightIntensity;
          scene.clearColor = originalSceneClearColor;
        }
      });

      camera.keysUp.push(87);
      camera.keysDown.push(83);
      camera.keysLeft.push(65);
      camera.keysRight.push(68);
      camera.minZ = 0.1;
      camera.angularSensibility = 6000;

      const handleKeyDown = (evt) => {
        keysPressed[evt.key.toLowerCase()] = true;

        if (evt.key.toLowerCase() === "f" && isFlashlightHeldRef.current) {
            if (flashlightSpotLightRef.current) {
                if (flashlightSpotLightRef.current.isEnabled()) {
                    flashlightSpotLightRef.current.setEnabled(false);
                    setFlashlightStatus("손전등 OFF");
                } else {
                    flashlightSpotLightRef.current.setEnabled(true);
                    flashlightSpotLightRef.current.intensity = 100; //높을수록밝음
                    flashlightSpotLightRef.current.exponent = 10; //높을수록 가장자리 선명
                    setFlashlightStatus("손전등 ON");
                }
            }
        }
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

     scene.onPointerObservable.add((pointerInfo) => {
    if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOWN) {
        const pickResult = scene.pick(scene.pointerX, scene.pointerY);

        if (pickResult.hit) {
            if (rootFlashlightMeshRef.current && pickResult.pickedMesh.isDescendantOf(flashlightHolderRef.current)) {
                if (isFlashlightHeldRef.current) {
                   console.log("손전등은 이미 손에 있습니다.");
                } else {
                    
                    flashlightHolderRef.current.parent = camera;
                    flashlightHolderRef.current.position = new BABYLON.Vector3(0.1, -0.5, 1.5);
                    flashlightHolderRef.current.scaling = new BABYLON.Vector3(1.5, 1.5, 1.5);
                    flashlightHolderRef.current.rotationQuaternion = BABYLON.Quaternion.Identity();
                    
                    isFlashlightHeldRef.current = true;
                    setFlashlightStatus("손전등 OFF");
                }
            } else if (pickResult.pickedMesh && pickResult.pickedMesh.name !== "__root__" && !pickResult.pickedMesh.actionManager) {
                // 다른 클릭 가능한 메쉬 처리 (기존 로직 유지)
            }
        }
    }
});


      scene.onPointerObservable.add((pointerInfo) => {
        if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERPICK) {
          const mesh = pointerInfo.pickInfo?.pickedMesh;
          // ActionManager가 있는 메쉬 (두루마리, 서랍, 문 등)는 각자 클릭 이벤트가 있으므로 여기서 일반적인 alert는 방지합니다.
          // 또한 __root__ 메쉬는 일반적으로 클릭할 필요가 없습니다.
          if (mesh && mesh.name !== "__root__" && !mesh.actionManager) {
           alert(`Clicked mesh name: ${mesh.name}`); 
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

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
        window.removeEventListener("resize", onResize);
        scene.dispose();
        engine.dispose();
      };
    };

    initScene();

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

      {/* ⭐ 새로 추가된 손전등 상태 UI ⭐ */}
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10, // 오른쪽 상단으로 위치 변경
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
        <div>{hasKeyItem ? "아이템" : "아이템 없음"}</div>
        <span>{flashlightStatus}</span>
        {hasKeyItem && (
          <div style={{ marginTop: 5, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img
              src="/key_with_tag.png"
              alt="열쇠 아이템"
              style={{ width: 50, height: 50, objectFit: 'contain' }}
              onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/50x50/000000/FFFFFF?text=KEY'; }}
            />
          </div>
        )}
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
            {/* 퀴즈 문제 이미지 경로 확인 (스크린샷 2025-07-03 09.34.28.png 또는 다른 이미지 사용 여부) */}
            <img src="/스크린샷 2025-07-03 09.34.28.png" alt="문제 이미지" style={{ maxWidth: 400, marginBottom: 16 }} />
            <br />
            {/* 정답 입력 필드 */}
            <input
              type="text"
              value={answerInput}
              onChange={(e) => setAnswerInput(e.target.value)}
              placeholder="정답을 입력하세요"
              style={{ padding: "8px 12px", fontSize: 16, borderRadius: 6, border: "1px solid #ccc", marginBottom: 12, width: "calc(100% - 24px)" }}
            />
            {/* 정답 확인 버튼 */}
            <button
              onClick={handleAnswerSubmit}
              style={{ padding: "8px 20px", fontSize: 16, borderRadius: 6, background: "#007bff", color: "white", border: "none", cursor: "pointer", marginRight: 8 }}
            >
              정답 확인
            </button>
            <button
              onClick={() => {
                setShowQuiz(false); // 퀴즈 창 닫기
                setQuizMessage(''); // 메시지 초기화
                setAnswerInput(''); // 입력 초기화
              }}
              style={{ padding: "8px 20px", fontSize: 16, borderRadius: 6, background: "#333", color: "white", border: "none", cursor: "pointer" }}
            >
              닫기
            </button>
            {quizMessage && (
              <div style={{ marginTop: 16, fontSize: 16, color: quizMessage.includes("정답입니다") ? "green" : "red" }}>
                {quizMessage}
              </div>
            )}
          </div>
        </div>
      )}

      {/* renderKeyItem 함수는 더 이상 사용하지 않으므로 제거하거나 null 반환 */}
      {/* {renderKeyItem()} */}
    </>
  );
};

export default BabylonScene;
