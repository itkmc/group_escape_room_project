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
import { addInformation } from "./rooms/information";
import { addUnderground } from "./rooms/underground";
import { addVillain } from "./rooms/villain";
import CenterMessage from "./components/CenterMessage";
import ScenarioMessage from "./components/ScenarioMessage";

const BabylonScene = () => {
  const canvasRef = useRef(null);
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0, z: 0 });
  const [isOnLadder, setIsOnLadder] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false); // 옥상 퀴즈용
  const flashlightSpotLightRef = useRef(null);
  const rootFlashlightMeshRef = useRef(null);
  const flashlightHolderRef = useRef(null);
  const [flashlightStatus, setFlashlightStatus] = useState(null);
  const [hasFlashlightItem, setHasFlashlightItem] = useState(false);
  const [isFlashlightToggling, setIsFlashlightToggling] = useState(false); // F키 중복 방지용
  const [flashlightOn, setFlashlightOn] = useState(false); // 손전등 켜짐/꺼짐 상태
  const flashlightOnRef = useRef(false); // 손전등 상태를 ref로도 관리
  const [hasCardItem, setHasCardItem] = useState(false);
  const [hasIdCardItem, setHasIdCardItem] = useState(false);
  const [isOfficeCupboardUnlocked, setIsOfficeCupboardUnlocked] = useState(false);
  const isOfficeCupboardUnlockedRef = useRef(isOfficeCupboardUnlocked);

  //옥상문제코드
  const [answerInput, setAnswerInput] = useState('');
  const [quizMessage, setQuizMessage] = useState('');
  const [hasKeyItem, setHasKeyItem] = useState(false);
  const hasKeyItemRef = useRef(false);
  
  // underground 문 상호작용 관련 상태
  const [undergroundDoorMessage, setUndergroundDoorMessage] = useState('');
  const [showUndergroundDoorMessage, setShowUndergroundDoorMessage] = useState(false);
  const undergroundDoorRef = useRef(null);

  // 앉기 기능 관련 상태
  const [isCrouching, setIsCrouching] = useState(false);
  const isCrouchingRef = useRef(false);

  const correctAnswer = "72";

  const handleAnswerSubmit = () => {
    if (answerInput === correctAnswer) {
      setQuizMessage("정답입니다! 키 아이템을 획득했습니다. 👉 이제 E키를 눌러 문을 여세요!");
      setHasKeyItem(true);
    } else {
      setQuizMessage("오답입니다. 다시 시도해 보세요.");
      setAnswerInput('');
    }
  };

  // --- 💡 수정된 부분: 사무실 문제 코드 전용 상태 추가 ---
  const [showOfficeQuiz, setShowOfficeQuiz] = useState(false); // 사무실 퀴즈 팝업 표시 상태
  const [answerInput3, setAnswerInput3] = useState('');
  const [quizMessage3, setQuizMessage3] = useState('');

  // hasIdCardItem 상태를 Babylon.js에 전달하기 위한 Ref
  const hasIdCardItemRef = useRef(hasIdCardItem);
  useEffect(() => {
    hasIdCardItemRef.current = hasIdCardItem;
  }, [hasIdCardItem]);

  const correctAnswer3 = "school";

  const handleAnswerSubmit3 = () => {
    // 정답 비교 시 대소문자 무시
    if (answerInput3.toLowerCase() === correctAnswer3) {
      setQuizMessage3("정답입니다! 이제 찬장을 열 수 있습니다.");
      setIsOfficeCupboardUnlocked(true); // ID카드 획득이 아니라 찬장만 열림
    } else {
      setQuizMessage3("오답입니다. 다시 시도해 보세요.");
      setAnswerInput3('');
    }
  };

  //수술실 문제 코드
  const [showQuiz2, setShowQuiz2] = useState(false);
  const [answerInput2, setAnswerInput2] = useState('');
  const [quizMessage2, setQuizMessage2] = useState('');
  const correctAnswer2 = "410";

  const handleAnswerSubmit2 = () => {
    if (answerInput2 === correctAnswer2) {
      setQuizMessage2("정답입니다! 방 안의 자물쇠를 풀어주세요!");
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
  // --- 상자 비밀번호 관련 상태 추가 ---
  const [showBoxPasswordInput, setShowBoxPasswordInput] = useState(false);
  const [boxPasswordInput, setBoxPasswordInput] = useState('');
  const [boxPasswordMessage, setBoxPasswordMessage] = useState('');
  const boxCorrectPassword = "410"; // 상자 비밀번호

  // Promise를 해결할 함수를 저장할 useRef
  const resolveBoxPasswordPromiseRef = useRef(null);

  // 상자 클릭 시 op_room.js에서 호출될 콜백 함수
  const handleSurgeryBoxClick = useCallback(() => {
    console.log("handleSurgeryBoxClick 호출됨: 비밀번호 입력 UI 띄울 준비");
    return new Promise(resolve => {
      setShowBoxPasswordInput(true); // 비밀번호 입력 UI를 띄움
      setBoxPasswordInput(''); // 입력 필드 초기화
      setBoxPasswordMessage("자물쇠 비밀번호를 입력하세요!"); // 메시지 설정

      // Promise resolve 함수를 useRef에 저장
      resolveBoxPasswordPromiseRef.current = resolve;
      console.log("resolveBoxPasswordPromiseRef.current 저장됨:", resolveBoxPasswordPromiseRef.current);
    });
  }, []); // 의존성 배열 비워둠: 이 함수 자체는 변하지 않음

  // 비밀번호 입력 팝업에서 "확인" 버튼 클릭 시
  const handleBoxPasswordSubmit = () => {
    console.log("handleBoxPasswordSubmit 호출됨. 입력된 비밀번호:", boxPasswordInput);
    if (boxPasswordInput === boxCorrectPassword) {
      setBoxPasswordMessage("정답입니다! 상자 문이 열립니다.");
      setShowBoxPasswordInput(false); // 팝업 닫기
      if (resolveBoxPasswordPromiseRef.current) {
        console.log("Promise 해결 시도: true");
        resolveBoxPasswordPromiseRef.current(true); // op_room.js로 true 반환
        resolveBoxPasswordPromiseRef.current = null; // 사용 후 초기화
      }
    } else {
      setBoxPasswordMessage("비밀번호가 틀렸습니다!");
      setBoxPasswordInput(''); // 입력 필드 초기화
      if (resolveBoxPasswordPromiseRef.current) {
        console.log("Promise 해결 시도: false (비밀번호 틀림)");
        resolveBoxPasswordPromiseRef.current(false); // op_room.js로 false 반환
      
      }
    }
  };

  // 비밀번호 입력 팝업에서 "닫기" 버튼 클릭 시
  const handleCloseBoxPasswordInput = () => {
    console.log("handleCloseBoxPasswordInput 호출됨.");
    setShowBoxPasswordInput(false);
    setBoxPasswordInput('');
    setBoxPasswordMessage('');
    if (resolveBoxPasswordPromiseRef.current) {
      console.log("Promise 해결 시도: false (닫기 버튼)");
      resolveBoxPasswordPromiseRef.current(false); // 닫기 버튼 눌러도 실패로 간주하여 op_room에 false 반환
      resolveBoxPasswordPromiseRef.current = null; // 사용 후 초기화
    }
  };

  useEffect(() => {
    hasFlashlightItemRef.current = hasFlashlightItem;
  }, [hasFlashlightItem]);

  useEffect(() => {
    hasKeyItemRef.current = hasKeyItem;
  }, [hasKeyItem]);

  useEffect(() => {
    isOfficeCupboardUnlockedRef.current = isOfficeCupboardUnlocked;
  }, [isOfficeCupboardUnlocked]);

  useEffect(() => {
    isCrouchingRef.current = isCrouching;
  }, [isCrouching]);

  // flashlightOn 상태와 ref 동기화
  useEffect(() => {
    flashlightOnRef.current = flashlightOn;
  }, [flashlightOn]);

  const [centerMessage, setCenterMessage] = useState("");
  const [showCenterMessage, setShowCenterMessage] = useState(false);

  function showMessage(msg) {
    setCenterMessage(msg);
    setShowCenterMessage(true);
    setTimeout(() => setShowCenterMessage(false), 2000);
  }

  const [scenarioMessage, setScenarioMessage] = useState("");
  const [showScenarioMessage, setShowScenarioMessage] = useState(false);

  function showMessage2(msg) {
    setScenarioMessage(msg);
    setShowScenarioMessage(true);
    // setTimeout(() => setShowCenterMessage(false), 2000);
  }

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new BABYLON.Engine(canvasRef.current, true);
    const scene = new BABYLON.Scene(engine);
    scene.collisionsEnabled = true;
    
    // 물리 시스템 활성화 (PhysicsImpostor 에러 해결)
    try {
      scene.enablePhysics();
      console.log("물리 시스템 활성화 완료");
    } catch (error) {
      console.warn("물리 시스템 활성화 실패:", error.message);
      // 물리 시스템이 없어도 게임은 정상 작동
    }

    let hemiLight;
    let originalHemiLightIntensity;

    const initScene = async () => {
      let crouchOffsetY = 0;

      const camera = new BABYLON.UniversalCamera(
        "camera",
        //첫시작
        new BABYLON.Vector3(-8.5, 7.86, -10.62),
        scene
      );
      camera.rotation.y = Math.PI + Math.PI / 2;
      camera.attachControl(canvasRef.current, true);
      camera.inputs.addMouse();
      camera.checkCollisions = true;
      camera.applyGravity = true;
      camera.ellipsoid = new BABYLON.Vector3(0.1, 0.7, 0.1);

      // 앉기 기능 관련 변수
      const standingHeight = 1.8; // 기본 카메라 높이
      const crouchingHeight = 1.0; // 앉았을 때 카메라 높이
      const standingEllipsoid = new BABYLON.Vector3(0.1, 0.7, 0.1); // 기본 충돌 박스
      const crouchingEllipsoid = new BABYLON.Vector3(0.1, 0.4, 0.1); // 앉았을 때 충돌 박스

      const MAX_CAMERA_HEIGHT = 50;
      const MIN_CAMERA_HEIGHT = 0;

      // 플레이어 이동 속도 조절
      const WALK_SPEED = 0.1;
      const RUN_SPEED = 0.3;
      camera.speed = WALK_SPEED;

      const specialPositions = [
        new BABYLON.Vector3(-15.2, 3.5, 5.35),
      ];
      const specialRadius = 0;
      let ladderMesh = null; // 이 변수는 현재 중력 범위 표시와 직접적인 관련이 없습니다.

      // 중력 범위 시각화를 위한 빨간색 네모 생성
      // const redMaterial = new BABYLON.StandardMaterial("redMaterial", scene);
      // redMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0); // 빨간색
      // redMaterial.alpha = 0.5; // 반투명하게 만들어 내부를 볼 수 있도록 합니다.

      // specialPositions.forEach((position, index) => {
      //     const gravityBox = BABYLON.MeshBuilder.CreateBox(
      //         `gravityRangeBox_${index}`,
      //         { width: specialRadius * 2, height: specialRadius * 2, depth: specialRadius * 2 }, // 네모의 각 변 길이
      //         scene
      //     );
      //     gravityBox.position = position;
      //     gravityBox.material = redMaterial;
      //     gravityBox.isPickable = false; // 클릭되지 않도록 설정
      //     gravityBox.checkCollisions = false; // 충돌 감지에서 제외
      // });

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
        await addOperatingRoom(
          scene,
          parentMesh,
          handleOperatingRoomScrollClick, // 수술실 두루마리 클릭 핸들러
          () => { // 카드 클릭 시 호출될 콜백 함수
            setHasCardItem(true);
            console.log("scene.js: 카드 아이템을 획득했습니다!");
          },
          handleSurgeryBoxClick
        );
        await addDoorAndChair(scene, parentMesh, () => setShowQuiz(true), () => hasKeyItemRef.current, showMessage, showMessage2);
        await addDoctorOffice(
          scene,
          parentMesh,
          () => setShowOfficeQuiz(true), // 찬장 클릭 시 퀴즈
          (status) => {
            console.log("setHasIdCardItem 호출됨:", status);
            setHasIdCardItem(status);
          }, // ID카드 획득 시
          () => isOfficeCupboardUnlockedRef.current // 항상 최신값 반환
        );

        await addRestroomObject(scene, parentMesh, showMessage);
        await addInformation(scene, parentMesh);
        await addVillain(scene, parentMesh);
        await addUnderground(scene, parentMesh);

        // underground 문 추가 및 상호작용 설정
        const undergroundDoor = await addUnderground(
          scene, 
          parentMesh,
          (message) => {
            setUndergroundDoorMessage(message);
            setShowUndergroundDoorMessage(true);
            // 3초 후 메시지 숨기기
            setTimeout(() => setShowUndergroundDoorMessage(false), 3000);
          },
          () => hasIdCardItemRef.current
        );
        undergroundDoorRef.current = undergroundDoor;
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
      originalHemiLightIntensity = 0.2; // 씬의 기본 밝기 조절
      hemiLight.intensity = originalHemiLightIntensity;

      // 어두운 구역 설정
      const darkZoneCenter = new BABYLON.Vector3(7, 7, 12);
      const darkZoneRadius = 14;


      // 손전등 모델 및 스팟 라이트 초기화 (한 번만 실행)
      console.log("손전등 초기화 시작 - rootFlashlightMeshRef.current:", rootFlashlightMeshRef.current);
              // 강제로 손전등 모델 로딩 실행 (디버깅용)
        {
          try {
            console.log("손전등 모델 로드 시작");
            
            const flashResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "flash_light_6_mb.glb", scene);
            console.log("손전등 모델 로드 완료:", flashResult.meshes.length, "개 메쉬");
            console.log("손전등 메쉬 이름들:", flashResult.meshes.map(m => m.name));
            
            rootFlashlightMeshRef.current = flashResult.meshes.find(mesh => mesh.name === "__root__");
            if (!rootFlashlightMeshRef.current) {
              rootFlashlightMeshRef.current = flashResult.meshes[0];
              console.warn("flash.glb에서 '__root__' 메쉬를 찾을 수 없습니다. 첫 번째 로드된 메쉬를 루트로 사용합니다.");
            }

            flashResult.animationGroups.forEach(ag => {
              ag.stop();
            });

            if (rootFlashlightMeshRef.current) {
              flashlightHolderRef.current = new BABYLON.TransformNode("flashlightHolder", scene);
              flashlightHolderRef.current.position = new BABYLON.Vector3(-8.5, 7.86, -8.0);
              flashlightHolderRef.current.scaling = new BABYLON.Vector3(2, 2, 2); // 적당한 크기로 조절
              flashlightHolderRef.current.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI)
                .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI));

              rootFlashlightMeshRef.current.parent = flashlightHolderRef.current;
              rootFlashlightMeshRef.current.position = BABYLON.Vector3.Zero();
              rootFlashlightMeshRef.current.scaling = BABYLON.Vector3.One();
              rootFlashlightMeshRef.current.rotationQuaternion = BABYLON.Quaternion.Identity();

              flashResult.meshes.forEach((mesh) => {
                mesh.isPickable = true;
                mesh.isVisible = true;
                console.log("손전등 메쉬 설정:", mesh.name, "isVisible:", mesh.isVisible);
              });

              const flashlightCollisionBox = BABYLON.MeshBuilder.CreateBox("flashlightCollisionBox", { size: 0.5 }, scene);
              flashlightCollisionBox.parent = flashlightHolderRef.current;
              flashlightCollisionBox.position = new BABYLON.Vector3(0, 0, 0);
              flashlightCollisionBox.visibility = 0;
              flashlightCollisionBox.checkCollisions = true;
              
              console.log("손전등 모델 초기화 완료 - 위치:", flashlightHolderRef.current.position);
              console.log("손전등 모델 초기화 완료 - 스케일:", flashlightHolderRef.current.scaling);
            }
          } catch (error) {
            console.error("손전등 모델 로드 실패:", error);
            
            // 모델 로드 실패 시 큐브로 대체
            console.log("손전등 큐브 생성 시작 (대체)");
            
            const flashlightCube = BABYLON.MeshBuilder.CreateBox("flashlightCube", { size: 1.0 }, scene);
            const flashlightMaterial = new BABYLON.StandardMaterial("flashlightMaterial", scene);
            flashlightMaterial.diffuseColor = new BABYLON.Color3(1, 1, 0); // 노란색
            flashlightCube.material = flashlightMaterial;
            
            flashlightHolderRef.current = new BABYLON.TransformNode("flashlightHolder", scene);
            flashlightHolderRef.current.position = new BABYLON.Vector3(-8.5, 7.86, -8.0);
            
            flashlightCube.parent = flashlightHolderRef.current;
            rootFlashlightMeshRef.current = flashlightCube;
            
            flashlightCube.isPickable = true;
            flashlightCube.isVisible = true;
            
            const flashlightCollisionBox = BABYLON.MeshBuilder.CreateBox("flashlightCollisionBox", { size: 0.5 }, scene);
            flashlightCollisionBox.parent = flashlightHolderRef.current;
            flashlightCollisionBox.position = new BABYLON.Vector3(0, 0, 0);
            flashlightCollisionBox.visibility = 0;
            flashlightCollisionBox.checkCollisions = true;
            
            console.log("손전등 큐브 생성 완료 - 위치:", flashlightHolderRef.current.position);
          }

        // 손전등 조명 생성 (항상 생성되도록 조건문 밖으로 이동)
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
        flashlightSpotLightRef.current.intensity = 100; // 기본 밝기 설정
        flashlightSpotLightRef.current.parent = camera; // 손전등 조명을 카메라에 종속시킵니다.

        // 카메라에 부착된 손전등 조명의 상대적 위치 및 방향 조절
        flashlightSpotLightRef.current.position = new BABYLON.Vector3(0.2, -0.2, 0.5);
        flashlightSpotLightRef.current.direction = new BABYLON.Vector3(0, -0.1, 1);
        flashlightSpotLightRef.current.setEnabled(false); // 초기에는 비활성화 (꺼진 상태)
        
        console.log("손전등 조명 생성 완료 - intensity:", flashlightSpotLightRef.current.intensity, "enabled:", flashlightSpotLightRef.current.isEnabled());
      }

      let cameraForward = new BABYLON.Vector3(0, 0, 1);

      scene.registerBeforeRender(() => {
        cameraForward = camera.getDirection(BABYLON.Axis.Z);
      });

      let gravityTimeout = null;
      scene.registerBeforeRender(() => {
        const nearSpecialPos = specialPositions.some((pos) => BABYLON.Vector3.Distance(camera.position, pos) < specialRadius);

        // 계단 위에 있을 때 y좌표 보정
        const stairMesh = scene.getMeshByName("Hospital_02_40m_0");
        if (
          stairMesh &&
          stairMesh.getBoundingInfo &&
          stairMesh.getBoundingInfo().minimumWorld &&
          stairMesh.getBoundingInfo().maximumWorld
        ) {
          const min = stairMesh.getBoundingInfo().minimumWorld;
          const max = stairMesh.getBoundingInfo().maximumWorld;
          if (
            camera.position.x > min.x && camera.position.x < max.x &&
            camera.position.z > min.z && camera.position.z < max.z
          ) {
            // x축을 따라 오르는 계단이라고 가정
            const stairStartZ = min.z;
            const stairEndZ = max.z;
            const stairStartY = min.y;
            const stairEndY = max.y;
            const ratio = (camera.position.z - stairStartZ) / (stairEndZ - stairStartZ);
            const stairY = stairStartY + (stairEndY - stairStartY) * ratio;
            camera.position.y = stairY; // 계단 표면에 맞게 y좌표를 항상 맞춤
          }
        }

        // 중력 범위에 들어가면 2초간만 중력 off, 이후 자동 on
        if (nearSpecialPos) {
          camera.applyGravity = false;
          if (gravityTimeout) clearTimeout(gravityTimeout);
          gravityTimeout = setTimeout(() => {
            camera.applyGravity = true;
            gravityTimeout = null;
          }, 2000); // 2초 뒤 중력 다시 켜기
        } else {
          camera.applyGravity = true;
          if (gravityTimeout) {
            clearTimeout(gravityTimeout);
            gravityTimeout = null;
          }
        }

        
       // ladder 상태값을 더 신뢰할 수 있게 prop으로 넘기든지,
      if (!isOnLadder) {
        if (keysPressed["shift"]) {
          camera.speed = RUN_SPEED;
        } else {
          camera.speed = WALK_SPEED;
        }
      } else {
        camera.speed = 0;
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
          // scene.clearColor = originalSceneClearColor;
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
          // F키 중복 방지 (더 강력한 방지)
          if (isFlashlightToggling) {
            console.log("F키 중복 방지 - 이미 처리 중");
            evt.preventDefault();
            evt.stopPropagation();
            return;
          }
          
          console.log("=== F키 눌림 ===");
          console.log("F키 눌림 - hasFlashlightItem:", hasFlashlightItemRef.current);
          console.log("F키 눌림 - flashlightSpotLightRef:", flashlightSpotLightRef.current);
          console.log("F키 눌림 - flashlightOn:", flashlightOn);
          console.log("F키 눌림 - flashlightOnRef:", flashlightOnRef.current);
          
          if (!hasFlashlightItemRef.current) {
            console.log("손전등 아이템을 획득해야 손전등을 켤 수 있습니다.");
            return;
          }

          // 이벤트 전파 중단
          evt.preventDefault();
          evt.stopPropagation();
          
          setIsFlashlightToggling(true);
          
          if (flashlightSpotLightRef.current) {
            console.log("손전등 조명 상태:", flashlightSpotLightRef.current.isEnabled());
            console.log("flashlightOn 상태:", flashlightOn);
            console.log("flashlightOnRef 상태:", flashlightOnRef.current);
            
            // 손전등이 꺼져있을 때만 켜기
            if (!flashlightOnRef.current) {
              // 손전등 켜기
              console.log("손전등 켜기 시도");
              flashlightSpotLightRef.current.setEnabled(true);
              flashlightOnRef.current = true;
              setFlashlightOn(true);
              setFlashlightStatus("ON");
              console.log("손전등 ON 완료 - enabled:", flashlightSpotLightRef.current.isEnabled());
            } else {
              // 이미 켜져있으면 아무것도 하지 않음
              console.log("손전등이 이미 켜져있습니다.");
            }
          } else {
            console.log("손전등 조명이 생성되지 않았습니다!");
          }
          
          // 1초 후 중복 방지 해제 (더 길게 설정)
          setTimeout(() => {
            setIsFlashlightToggling(false);
            console.log("F키 중복 방지 해제됨");
          }, 1000);
        }

        // 앉기 기능 (C키)
        if (evt.key.toLowerCase() === "c") {
          if (!isCrouchingRef.current) {
            camera.ellipsoid = crouchingEllipsoid;
            setIsCrouching(true);
            console.log("앉기");
          } else {
            camera.ellipsoid = standingEllipsoid;
            setIsCrouching(false);
            console.log("일어서기");
          }
        }
        // 열쇠를 획득한 후 E키를 누르면 문이 열리게
        if (evt.key === 'e' || evt.key === 'E') {
          // 플레이어와 각 문 위치의 거리 계산
          const playerPosVec = new BABYLON.Vector3(camera.position.x, camera.position.y, camera.position.z);
          const mainDoorPos = new BABYLON.Vector3(-25.10, 14.80, 10.57);
          const restroomDoorPos = new BABYLON.Vector3(-18.95, 2.5, -6.95);
          const undergroundDoorPos = new BABYLON.Vector3(7, 6.4, 5.1);
          
          // 수평(XZ) 거리 계산 함수
          function horizontalDistance(a, b) {
            return Math.sqrt(
              Math.pow(a.x - b.x, 2) +
              Math.pow(a.z - b.z, 2)
            );
          }
          const distToMain = horizontalDistance(playerPosVec, mainDoorPos);
          const distToRest = horizontalDistance(playerPosVec, restroomDoorPos);
          const distToUnderground = horizontalDistance(playerPosVec, undergroundDoorPos);
          const THRESHOLD = 10; // 거리 임계값(수평거리)

          let opened = false;
          
          // 기존 문들 (열쇠 필요)
          if (hasKeyItemRef.current) {
            if (distToMain < THRESHOLD && window.openMainDoor) {
              window.openMainDoor();
              setHasKeyItem(false);
              opened = true;
            } else if (distToRest < THRESHOLD && window.openRestroomDoor) {
              window.openRestroomDoor();
              setHasKeyItem(false);
              opened = true;
            }
          }
          
          // underground 문 (ID 카드 필요)
          if (distToUnderground < THRESHOLD && undergroundDoorRef.current && undergroundDoorRef.current.toggleDoor) {
            undergroundDoorRef.current.toggleDoor();
            setHasIdCardItem(false); // E키로 문을 열면 ID카드 아이템을 UI에서 제거
            opened = true;
          }
          
          // if (!opened) {
          //   alert('문 가까이에서 E키를 눌러주세요!');
          // }
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
                
                // 손전등 상태 초기화
                setFlashlightOn(false);
                flashlightOnRef.current = false;
                setFlashlightStatus("OFF");

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
        //  Babylon.js 씬 내에서 메쉬 클릭 시 이름 출력
      // scene.onPointerObservable.add((pointerInfo) => {
      //   if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERPICK) {
      //     const mesh = pointerInfo.pickInfo?.pickedMesh;
      //     if (mesh) {
      //       console.log("🖱️ Clicked mesh name:", mesh.name);
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

  }, [handleOperatingRoomScrollClick, handleSurgeryBoxClick]);

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

      {/* 우측 상단 컨트롤 안내 UI 전체 삭제 */}

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
          <div style={{ marginTop: 5, display: 'flex', alignItems: 'center' }}>
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
              src="망치.png"
              alt="망치 아이템"
              style={{ width: 30, height: 30, objectFit: 'contain', marginRight: 8 }}
              onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/30x30/000000/FFFFFF?text=FL'; }}
            />
            <span>망치</span>
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
        {hasIdCardItem && ( // ID 카드 아이템 표시 (추가됨)
          <div style={{ marginTop: 5, display: 'flex', alignItems: 'center' }}>
            <img
              src="/아이디카드.png" // 실제 ID 카드 이미지 경로
              alt="ID 카드 아이템"
              style={{ width: 30, height: 30, objectFit: 'contain', marginRight: 8 }}
              onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/30x30/000000/FFFFFF?text=ID'; }}
            />
            <span>ID 카드</span>
          </div>
        )}
      </div>

      {/* --- 상자 비밀번호 입력 팝업 --- */}
      {showBoxPasswordInput && (
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
          zIndex: 2002 // 다른 팝업보다 높은 z-index
        }}>
          <div style={{ background: "white", padding: 24, borderRadius: 12, textAlign: "center", minWidth: 320 }}>
            <div style={{ fontSize: 20, marginBottom: 16, color: "#222" }}>{boxPasswordMessage}</div>
            <input
              type="password" // 비밀번호 필드로 설정하여 입력 내용이 *로 표시되게 할 수 있습니다.
              value={boxPasswordInput}
              onChange={(e) => setBoxPasswordInput(e.target.value)}
              placeholder="비밀번호 입력"
              style={{ padding: "8px 12px", fontSize: 16, borderRadius: 6, border: "1px solid #ccc", marginBottom: 12, width: "calc(100% - 24px)" }}
            />
            <button
              onClick={handleBoxPasswordSubmit}
              style={{ padding: "8px 20px", fontSize: 16, borderRadius: 6, background: "#007bff", color: "white", border: "none", cursor: "pointer", marginRight: 8 }}
            >
              확인
            </button>
            <button
              onClick={handleCloseBoxPasswordInput}
              style={{ padding: "8px 20px", fontSize: 16, borderRadius: 6, background: "#333", color: "white", border: "none", cursor: "pointer" }}
            >
              닫기
            </button>
          </div>
        </div>
      )}
      {/* ----------------------------- */}

      {/* 손전등 사용법 메시지 팝업 */}
      {showFlashlightTip && (
        <div
          style={{
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
            zIndex: 2000 // 퀴즈보다 낮은 z-index
          }}
        >
          <div style={{
            background: "rgba(0,0,0,0.6)",
            padding: 24,
            borderRadius: 12,
            textAlign: "center",
            minWidth: 320,
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)"
          }}>
            <div style={{
              fontSize: 20,
              marginBottom: 16,
              color: "white"
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
            <div style={{ fontSize: 20, marginBottom: 16, color: "#222" }}>[문제] 다음을 보기를 보고 [7+3 = ?]를 구하시오</div>
            <img src="/수술실문제410.png" alt="문제 이미지" style={{ maxWidth: 400, marginBottom: 16 }} />
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
            <div style={{ fontSize: 20, marginBottom: 16, color: "#222" }}>[문제] 물음표에 들어갈 숫자를 구하시오</div>
            <img src="/시계문제.png" alt="문제 이미지" style={{ maxWidth: 400, marginBottom: 16 }} />
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

      {/* --- 💡 수정된 부분: 사무실 퀴즈 팝업 조건문 변경 --- */}
      {showOfficeQuiz && ( // showQuiz 대신 showOfficeQuiz 사용
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
            <div style={{ fontSize: 20, marginBottom: 16, color: "#222" }}>[문제]건물의 1층은 커피숍, 2층은 회사다. 3층은 무엇일까?</div>
            <img src="/영재 문제.png" alt="문제 이미지" style={{ maxWidth: 400, marginBottom: 16 }} />
            <br />
            <input
              type="text"
              value={answerInput3}
              onChange={(e) => setAnswerInput3(e.target.value)}
              placeholder="정답을 입력하세요"
              style={{ padding: "8px 12px", fontSize: 16, borderRadius: 6, border: "1px solid #ccc", marginBottom: 12, width: "calc(100% - 24px)" }}
            />
            <button
              onClick={handleAnswerSubmit3}
              style={{ padding: "8px 20px", fontSize: 16, borderRadius: 6, background: "#007bff", color: "white", border: "none", cursor: "pointer", marginRight: 8 }}
            >
              정답 확인
            </button>
            <button
              onClick={() => {
                setShowOfficeQuiz(false); // showQuiz 대신 showOfficeQuiz 사용
                setQuizMessage3('');
                setAnswerInput3('');
              }}
              style={{ padding: "8px 20px", fontSize: 16, borderRadius: 6, background: "#333", color: "white", border: "none", cursor: "pointer" }}
            >
              닫기
            </button>
            {quizMessage3 && (
              <div style={{ marginTop: 16, fontSize: 16, color: quizMessage3.includes("정답입니다") ? "green" : "red" }}>
                {quizMessage3}
              </div>
            )}
          </div>
        </div>
      )}
      {/* -------------------------------------------------- */}
      
      {/* Underground 문 상호작용 메시지 */}
      {showUndergroundDoorMessage && (
        <div style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "rgba(0,0,0,0.8)",
          color: "white",
          padding: "16px 24px",
          borderRadius: "8px",
          fontSize: "18px",
          fontWeight: "bold",
          zIndex: 1500,
          textAlign: "center",
          minWidth: "300px"
        }}>
          {undergroundDoorMessage}
        </div>
      )}
      <CenterMessage message={centerMessage} visible={showCenterMessage}/>
      <ScenarioMessage message={scenarioMessage} visible={showScenarioMessage} onClose={() => setShowScenarioMessage(false)}/>
    </>
  );
};

export default BabylonScene;