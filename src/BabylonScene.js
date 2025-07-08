import React, { useEffect, useRef, useState, useCallback } from "react"; 
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";
import "@babylonjs/inspector";
import { GLTF2Export } from "@babylonjs/serializers";
import { addDoorAndChair } from "./rooms/looptop";
import { addOperatingRoom } from "./rooms/op_room";
import { addDoctorOffice } from "./rooms/office";
import { handleLadderMovement } from "./ladder";
import { addRestroomObject } from "./rooms/restroom";

const BabylonScene = () => {
  const canvasRef = useRef(null);
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0, z: 0 });
  const [isOnLadder, setIsOnLadder] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const flashlightSpotLightRef = useRef(null);
  const rootFlashlightMeshRef = useRef(null);
  const flashlightHolderRef = useRef(null);
  const [flashlightStatus, setFlashlightStatus] = useState(null);
  const [hasFlashlightItem, setHasFlashlightItem] = useState(false);

  

  //옥상문제코드
  const [answerInput, setAnswerInput] = useState('');
  const [quizMessage, setQuizMessage] = useState('');
  const [hasKeyItem, setHasKeyItem] = useState(false);
  const hasKeyItemRef = useRef(false);
  const [hasCardItem, setHasCardItem] = useState(false);
  const correctAnswer = "410";

  const handleAnswerSubmit = () => {
    if (answerInput === correctAnswer) {
      setQuizMessage("정답입니다! 키 아이템을 획득했습니다. 👉 이제 E키를 눌러 문을 여세요!");
      setHasKeyItem(true); 
    } else {
      setQuizMessage("오답입니다. 다시 시도해 보세요.");
      setAnswerInput('');
    }
  };


  //수술실 문제 코드
  const [showQuiz2, setShowQuiz2] = useState(false);
  const [answerInput2, setAnswerInput2] = useState('');
  const [quizMessage2, setQuizMessage2] = useState('');
  const correctAnswer2 = "72";

  const handleAnswerSubmit2 = () => {
    if (answerInput2 === correctAnswer2) {
      setQuizMessage2("정답입니다! 카드 아이템을 획득했습니다. 방 안에서 한개의 카드를 더 찾으세요!");
      setHasCardItem(true);
    } else {
      setQuizMessage2("오답입니다. 다시 시도해 보세요.");
      setAnswerInput2('');
    }
  };

  const handleOperatingRoomScrollClick = useCallback(() => {
  setShowQuiz2(true); // 수술실 퀴즈 팝업을 띄움
  setQuizMessage2(''); // 퀴즈 열릴 때 메시지 초기화
  setAnswerInput2(''); // 퀴즈 열릴 때 입력값 초기화
  console.log("React: 수술실 두루마리 클릭 감지, 퀴즈 팝업 표시.");
}, []);

  // 손전등 아이템
  const hasFlashlightItemRef = useRef(hasFlashlightItem);
  const [showFlashlightTip, setShowFlashlightTip] = useState(false);
  const [flashlightTipMessage, setFlashlightTipMessage] = useState("");

  

  useEffect(() => {
    hasFlashlightItemRef.current = hasFlashlightItem;
  }, [hasFlashlightItem]);

  useEffect(() => {
    hasKeyItemRef.current = hasKeyItem;
  }, [hasKeyItem]);

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
        //첫시작
        new BABYLON.Vector3(-18.05, 7.55, 3.44),
        scene
      );
      camera.rotation.y = Math.PI + Math.PI / 2;
      camera.attachControl(canvasRef.current, true);
      camera.inputs.addMouse();
      camera.checkCollisions = true;
      camera.applyGravity = true;
      camera.ellipsoid = new BABYLON.Vector3(0.1, 0.7, 0.1);

      const MAX_CAMERA_HEIGHT = 50;
      const MIN_CAMERA_HEIGHT = 0;

      // 플레이어 이동 속도 조절
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
        await addOperatingRoom(scene, parentMesh, handleOperatingRoomScrollClick);
        await addDoorAndChair(scene, parentMesh, () => setShowQuiz(true), () => hasKeyItem);
        await addDoctorOffice(scene, parentMesh);
        await addRestroomObject(scene, parentMesh);
      }

      // 램프 메쉬의 발광 강도 조절 (씬의 전체 밝기에 영향)
      const lampMesh1 = scene.getMeshByName("LAMP_LP:LAMP_03_lowLAMP_03polySurface14_LAmp_0");
      if (lampMesh1 && lampMesh1.material) {
        const material = lampMesh1.material;
        if (material instanceof BABYLON.PBRMaterial) {
          material.emissiveIntensity = 0.01; // PBR 재질의 발광 강도
        } else if (material instanceof BABYLON.StandardMaterial) {
          material.emissiveColor = material.emissiveColor.scale(0.01); // Standard 재질의 발광 색상
        }
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
      }

      const keysPressed = {};

      // 전역 배경 조명 설정
      hemiLight = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(0, 1, 0), scene);
      originalHemiLightIntensity = 0.7; // 씬의 기본 밝기 조절
      hemiLight.intensity = originalHemiLightIntensity;

      // 어두운 구역 설정
      const darkZoneCenter = new BABYLON.Vector3(7,7,12);
      const darkZoneRadius = 7;

      
      originalSceneClearColor = new BABYLON.Color4(0.7, 0.7, 0.7, 1); // 씬 배경색 초기값

      
      // 손전등 모델 및 스팟 라이트 초기화 (한 번만 실행)
      if (!rootFlashlightMeshRef.current) {
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
          // 씬 내에서 손전등 아이템의 초기 위치, 스케일, 회전 조절
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

          const flashlightCollisionBox = BABYLON.MeshBuilder.CreateBox("flashlightCollisionBox", { size: 0.3 }, scene);
          flashlightCollisionBox.parent = flashlightHolderRef.current;
          flashlightCollisionBox.position = new BABYLON.Vector3(0, 0, 0);
          flashlightCollisionBox.visibility = 0;
          flashlightCollisionBox.checkCollisions = true;

          flashlightSpotLightRef.current = new BABYLON.SpotLight(
            "flashlightSpotLight",
            new BABYLON.Vector3(0, 0, 0),
            new BABYLON.Vector3(0, 0, 1),
            BABYLON.Tools.ToRadians(35), // 손전등 빛의 원뿔 각도 (값 낮을수록 좁아짐)
            2, // 빛의 감쇠 속도 (값이 높을수록 빨리 어두워짐)
            scene
          );
          flashlightSpotLightRef.current.diffuse = new BABYLON.Color3(1, 1, 0.8); // 손전등 빛의 색상
          flashlightSpotLightRef.current.specular = new BABYLON.Color3(1, 1, 1); // 손전등 빛의 반사광 색상
          flashlightSpotLightRef.current.intensity = 0; // 초기에는 꺼진 상태 (F키 누르면 100으로 설정)
          flashlightSpotLightRef.current.parent = camera; // 손전등 조명을 카메라에 종속시킵니다.

          // 카메라에 부착된 손전등 조명의 상대적 위치 및 방향 조절
          flashlightSpotLightRef.current.position = new BABYLON.Vector3(0.2, -0.2, 0.5); 
          flashlightSpotLightRef.current.direction = new BABYLON.Vector3(0, -0.1, 1);
          flashlightSpotLightRef.current.setEnabled(false); // 초기에는 비활성화 (꺼진 상태)
        }
      }

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

        // 어두운 구역 진입 시 배경 조명 및 씬 색상 조절
        if (distanceToDarkZone < darkZoneRadius) {
          hemiLight.intensity = 0.5; // 어두운 구역에서는 배경 조명 어둡게
          scene.clearColor = new BABYLON.Color4(0.005, 0.005, 0.005, 1);
        } else {
          hemiLight.intensity = originalHemiLightIntensity; // 원래 밝기로
          scene.clearColor = originalSceneClearColor;
        }
      });

      camera.keysUp.push(87);
      camera.keysDown.push(83);
      camera.keysLeft.push(65);
      camera.keysRight.push(68);
      camera.minZ = 0.1;
      camera.angularSensibility = 6000; // 마우스 감도 조절

      const handleKeyDown = (evt) => {
        keysPressed[evt.key.toLowerCase()] = true;

        if (evt.key.toLowerCase() === "f") {
          if (!hasFlashlightItemRef.current) {
            console.log("손전등 아이템을 획득해야 손전등을 켤 수 있습니다.");
            return;
          }

          if (flashlightSpotLightRef.current) {
            if (flashlightSpotLightRef.current.isEnabled()) {
              flashlightSpotLightRef.current.setEnabled(false);
              setFlashlightStatus("OFF");
              console.log("손전등 OFF");
            } else {
              flashlightSpotLightRef.current.setEnabled(true);
              flashlightSpotLightRef.current.intensity = 100; // 손전등 밝기 조절 (값 높을수록 밝아짐)
              flashlightSpotLightRef.current.exponent = 10; // 손전등 빛의 중앙 집중도 조절 (값 높을수록 중앙에 집중)
              setFlashlightStatus("ON");
              console.log("손전등 ON");
            }
          }
        }
        // 열쇠를 획득한 후 E키를 누르면 문이 열리게
        if (evt.key === 'e' || evt.key === 'E') {
          if (!hasKeyItemRef.current) {
            return;
          }
          // 플레이어와 각 문 위치의 거리 계산
          const playerPosVec = new BABYLON.Vector3(camera.position.x, camera.position.y, camera.position.z);
          const mainDoorPos = new BABYLON.Vector3(-25.10, 14.80, 10.57);
          const restroomDoorPos = new BABYLON.Vector3(-18.95, 2.5, -6.95);
          // 수평(XZ) 거리 계산 함수
          function horizontalDistance(a, b) {
            return Math.sqrt(
              Math.pow(a.x - b.x, 2) +
              Math.pow(a.z - b.z, 2)
            );
          }
          const distToMain = horizontalDistance(playerPosVec, mainDoorPos);
          const distToRest = horizontalDistance(playerPosVec, restroomDoorPos);
          const THRESHOLD = 10; // 거리 임계값(수평거리)

          let opened = false;
          if (distToMain < THRESHOLD && window.openMainDoor) {
            window.openMainDoor();
            setHasKeyItem(false);
            opened = true;
          } else if (distToRest < THRESHOLD && window.openRestroomDoor) {
            window.openRestroomDoor();
            setHasKeyItem(false);
            opened = true;
          }
          if (!opened) {
            alert('문 가까이에서 E키를 눌러주세요!');
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
            // 손전등 아이템 획득 로직
            if (flashlightHolderRef.current && pickResult.pickedMesh.isDescendantOf(flashlightHolderRef.current)) {
              if (hasFlashlightItemRef.current) {
                console.log("손전등은 이미 아이템으로 가지고 있습니다.");
              } else {
                setHasFlashlightItem(true);
                
                flashlightHolderRef.current.setEnabled(false);
                console.log("손전등을 획득했습니다!");

                // 손전등 사용법 메시지 표시
                setFlashlightTipMessage("손전등을 획득했습니다! 'F' 키를 눌러 손전등을 켜고 끌 수 있습니다.");
                setShowFlashlightTip(true);

                
              }
            }
          }
        }
      });

      // Babylon.js 씬 내에서 메쉬 클릭 시 이름 출력
      // scene.onPointerObservable.add((pointerInfo) => {
      //   if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERPICK) {
      //     const mesh = pointerInfo.pickInfo?.pickedMesh;
      //     if (mesh) {
      //       console.log("🖱️ Clicked mesh name:", mesh.name);
      //       alert(`Clicked mesh name: ${mesh.name}`);
      //     }
      //   }
      // });

      // // Babylon.js Inspector 활성화 (개발 중 디버깅에 필수!)
      // // 게임 실행 후 F12 (개발자 도구)를 열어 "Inspector" 탭 또는 "Babylon.js" 탭을 확인하세요.
      // scene.debugLayer.show();

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
    
  }, [handleOperatingRoomScrollClick]);

  useEffect(() => {
    window.setHasKeyItem = setHasKeyItem;
    window.hasKeyItemRef = hasKeyItemRef;
  }, [setHasKeyItem]);

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

      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
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
        <div>아이템</div>
        {hasKeyItem && (
          <div style={{ marginTop: 5, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img
              src="/key.png"
              alt="열쇠 아이템"
              style={{ width: 30, height: 30, objectFit: 'contain' }}
              onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/50x50/000000/FFFFFF?text=KEY'; }}
            />
            <span>열쇠</span>
          </div>
        )}
        {hasCardItem && (
          <div style={{ marginTop: 5, display: 'flex', alignItems: 'center' }}>
            <img
              src="유희왕카드.png"
              alt="카드 아이템"
              style={{ width: 30, height: 30, objectFit: 'contain', marginRight: 8 }}
              onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/30x30/000000/FFFFFF?text=FL'; }}
            />
            <span>카드</span>
          </div>
        )}
        {hasFlashlightItem && (
          <div style={{ marginTop: 5, display: 'flex', alignItems: 'center' }}>
            <img
              src="flashLight.png"
              alt="손전등 아이템"
              style={{ width: 30, height: 30, objectFit: 'contain', marginRight: 8 }}
              onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/30x30/000000/FFFFFF?text=FL'; }}
            />
            <span>손전등 {flashlightStatus}</span>
          </div>
        )}
      </div>

      {/* 손전등 사용법 메시지 팝업 */}
      {showFlashlightTip && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.7)", // 전체 오버레이는 반투명 검은색 유지
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000 // 퀴즈보다 낮은 z-index
          }}
        >
          <div style={{
            background: "rgba(0,0,0,0.6)", // 박스 배경색을 반투명 검은색으로 변경
            padding: 24,
            borderRadius: 12,
            textAlign: "center",
            minWidth: 320,
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)"
          }}>
            <div style={{
              fontSize: 20,
              marginBottom: 16,
              color: "white" // 글씨 색깔을 하얀색으로 변경
            }}>
              {flashlightTipMessage}
            </div>
            <button
              onClick={() => {
                setShowFlashlightTip(false);
                setFlashlightTipMessage("");
              }}
              style={{ padding: "8px 20px", fontSize: 16, borderRadius: 6, background: "#333", color: "white", border: "none", cursor: "pointer" }}
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* 수술실 퀴즈 팝업 */}
      {showQuiz2 && (
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
          zIndex: 2001 
        }}>
          <div style={{ background: "white", padding: 24, borderRadius: 12, textAlign: "center", minWidth: 320 }}>
            <div style={{ fontSize: 20, marginBottom: 16, color: "#222" }}>[문제] 물음표에 들어갈 숫자를 구하시오</div>
            <img src="/시계문제.png" alt="문제 이미지" style={{ maxWidth: 400, marginBottom: 16 }} />
            <br />
            <input
              type="text"
              value={answerInput2}
              onChange={(e) => setAnswerInput2(e.target.value)}
              placeholder="정답을 입력하세요"
              style={{ padding: "8px 12px", fontSize: 16, borderRadius: 6, border: "1px solid #ccc", marginBottom: 12, width: "calc(100% - 24px)" }}
            />
            <button
              onClick={handleAnswerSubmit2}
              style={{ padding: "8px 20px", fontSize: 16, borderRadius: 6, background: "#007bff", color: "white", border: "none", cursor: "pointer", marginRight: 8 }}
            >
              정답 확인
            </button>
            <button
              onClick={() => {
                setShowQuiz2(false);
                setQuizMessage2('');
                setAnswerInput2('');
              }}
              style={{ padding: "8px 20px", fontSize: 16, borderRadius: 6, background: "#333", color: "white", border: "none", cursor: "pointer" }}
            >
              닫기
            </button>
            {quizMessage2 && (
              <div style={{ marginTop: 16, fontSize: 16, color: quizMessage2.includes("정답입니다") ? "green" : "red" }}>
                {quizMessage2}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 옥상 퀴즈 팝업 */}
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
          zIndex: 2001 
        }}>
          <div style={{ background: "white", padding: 24, borderRadius: 12, textAlign: "center", minWidth: 320 }}>
            <div style={{ fontSize: 20, marginBottom: 16, color: "#222" }}>[문제] 다음을 보기를 보고 [7+3 = ?]를 구하시오</div>
            <img src="/스크린샷 2025-07-03 09.34.28.png" alt="문제 이미지" style={{ maxWidth: 400, marginBottom: 16 }} />
            <br />
            <input
              type="text"
              value={answerInput}
              onChange={(e) => setAnswerInput(e.target.value)}
              placeholder="정답을 입력하세요"
              style={{ padding: "8px 12px", fontSize: 16, borderRadius: 6, border: "1px solid #ccc", marginBottom: 12, width: "calc(100% - 24px)" }}
            />
            <button
              onClick={handleAnswerSubmit}
              style={{ padding: "8px 20px", fontSize: 16, borderRadius: 6, background: "#007bff", color: "white", border: "none", cursor: "pointer", marginRight: 8 }}
            >
              정답 확인
            </button>
            <button
              onClick={() => {
                setShowQuiz(false);
                setQuizMessage('');
                setAnswerInput('');
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
    </>
  );
};

export default BabylonScene;