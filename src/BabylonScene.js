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
import ProblemModal from "./components/ProblemModal";
import RooftopProblemModal from "./components/RooftopProblemModal";
import OperatingRoomProblemModal from "./components/OperatingRoomProblemModal";
import OfficeProblemModal from "./components/OfficeProblemModal";
import OfficeDoorProblemModal from "./components/OfficeDoorProblemModal";
import EscapeSuccessPage from "./components/EscapeSuccessPage";

const BabylonScene = ({ onGameLoaded, onGameRestart, bgmRef }) => {
  const canvasRef = useRef(null);
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0, z: 0 });
  const [isOnLadder, setIsOnLadder] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false); // 옥상 퀴즈용
  const flashlightSpotLightRef = useRef(null);
  const rootFlashlightMeshRef = useRef(null);
  const flashlightHolderRef = useRef(null);
  const [flashlightStatus, setFlashlightStatus] = useState(null);
  const [hasFlashlightItem, setHasFlashlightItem] = useState(false);
  const [hasOpKeyItem, setHasOpKeyItem] = useState(false); // 수술실 열쇠 아이템 상태
  const [hasIdCardItem, setHasIdCardItem] = useState(false);
  const [isOfficeCupboardUnlocked, setIsOfficeCupboardUnlocked] = useState(false);
  const isOfficeCupboardUnlockedRef = useRef(isOfficeCupboardUnlocked);
  const [isOfficeDoorUnlocked, setIsOfficeDoorUnlocked] = useState(false);
  const isOfficeDoorUnlockedRef = useRef(isOfficeDoorUnlocked);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("게임 로딩 중...");
  const [errorMessage, setErrorMessage] = useState(null);

  //옥상문제코드
  const [answerInput, setAnswerInput] = useState('');
  const [quizMessage, setQuizMessage] = useState('');
  const [hasKeyItem, setHasKeyItem] = useState(false);
  const hasKeyItemRef = useRef(false);
  
  // underground 문제 모달 관련 상태
  const [undergroundDoorMessage, setUndergroundDoorMessage] = useState('');
  const [showUndergroundDoorMessage, setShowUndergroundDoorMessage] = useState(false);
  const undergroundDoorRef = useRef(null);

  // 지하실 문제 모달 관련 상태
  const [showProblemModal, setShowProblemModal] = useState(false);
  const problemDoorRef = useRef(null);
  const problemDoorToggleRef = useRef(null);

  // 탈출 성공 모달 관련 상태
  const [showEscapeSuccessModal, setShowEscapeSuccessModal] = useState(false);

  
  // showProblemModal 상태 변화 추적
  useEffect(() => {
    console.log("showProblemModal 상태 변경:", showProblemModal);
  }, [showProblemModal]);

  // 앉기 기능 제거됨

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

  const hasOpKeyItemRef = useRef(hasOpKeyItem);
  useEffect(() => {
    hasOpKeyItemRef.current = hasOpKeyItem;
  }, [hasOpKeyItem]);

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

  // --- ⭐ 종이 이미지 팝업 관련 상태 (이전 답변에서 추가한 내용) ⭐ ---
    const [isPaperImagePopupVisible, setIsPaperImagePopupVisible] = useState(false);
    const [paperImagePopupContentUrl, setPaperImagePopupContentUrl] = useState("");

    const handlePaperClickForImage = (imageUrl) => {
        console.log("handlePaperClickForImage 호출됨. 이미지 URL:", imageUrl);
        setPaperImagePopupContentUrl(imageUrl);
        setIsPaperImagePopupVisible(true);
    };

    const closePaperImagePopup = () => {
        setIsPaperImagePopupVisible(false);
        setPaperImagePopupContentUrl("");
    };

    // --- 💡 수정된 부분: 사무실 문 퀴즈 코드 전용 상태 추가 ---
const [showOfficeDoorQuiz, setShowOfficeDoorQuiz] = useState(false); // 사무실 문 퀴즈 팝업 표시 상태
const [answerInput4, setAnswerInput4] = useState(''); // 사무실 문 퀴즈 입력값 (기존 answerInput3 대신 4로 통일)
const [quizMessage4, setQuizMessage4] = useState(''); // 사무실 문 퀴즈 메시지 (기존 quizMessage3 대신 4로 통일)

// hasOpKeyItemRef와 hasIdCardItemRef는 이 퀴즈와 직접적인 관련이 없으므로 제거합니다.
// (만약 다른 곳에서 사용된다면 해당 위치에서 유지되어야 합니다.)

const correctAnswer4 = "1346"; // 사무실 문 퀴즈 정답 (예시 값, 필요에 따라 변경 가능)

const handleAnswerSubmit4 = () => {
  // 정답 비교 시 대소문자 무시 (현재는 숫자이므로 큰 의미 없음)
  if (answerInput4 === correctAnswer4) {
    setQuizMessage4("정답입니다! 이제 문을 열 수 있습니다.");
    // 이 퀴즈는 문을 여는 것이 목적이므로, 사무실 문 잠금 해제 상태를 변경합니다.
    setIsOfficeDoorUnlocked(true);
  } else {
    setQuizMessage4("오답입니다. 다시 시도해 보세요.");
    setAnswerInput4('');
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

  const handleOfficeDoorClick = useCallback(() => {
    console.log("handleOfficeDoorClick 호출됨. 사무실 문 퀴즈 팝업 표시.");
    setShowOfficeDoorQuiz(true); // 사무실 문 퀴즈 팝업 표시
    setQuizMessage4(''); // 퀴즈 열릴 때 메시지 초기화
    setAnswerInput4(''); // 퀴즈 열릴 때 입력값 초기화
  }, []);

  // --- ⭐ 새로 추가된 부분: 찬장 클릭 시 사무실 퀴즈 팝업을 띄우는 콜백 함수 ⭐ ---
const handleCupboardClickToTriggerOfficeQuiz = useCallback(() => {
    console.log("handleCupboardClickToTriggerOfficeQuiz 호출됨: 사무실 퀴즈 팝업 표시 시도");
    setShowOfficeQuiz(true); // 사무실 퀴즈 팝업 표시 상태를 true로 변경
    setQuizMessage3(''); // 퀴즈 열릴 때 메시지 초기화 (OfficeProblemModal이 사용하는 메시지)
    setAnswerInput3(''); // 퀴즈 열릴 때 입력값 초기화 (OfficeProblemModal이 사용하는 입력값)
}, []);
// --- ⭐ 새로 추가된 부분 끝 ⭐ ---s

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
    isOfficeDoorUnlockedRef.current = isOfficeDoorUnlocked;
  }, [isOfficeDoorUnlocked]);

  // 앉기 기능 관련 useEffect 제거됨

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

    let hemiLight;
    let originalHemiLightIntensity;

    const initScene = async () => {
      let crouchOffsetY = 0;

      const camera = new BABYLON.UniversalCamera(
        "camera",
        //첫시작
        new BABYLON.Vector3(15.10, 7.85, 6.02),
        scene
      );
      camera.rotation.y = Math.PI + Math.PI / 2;
      camera.attachControl(canvasRef.current, true);
      camera.inputs.addMouse();
      camera.checkCollisions = true;
      camera.applyGravity = true;
      camera.ellipsoid = new BABYLON.Vector3(0.1, 0.7, 0.1);

      // 앉기 기능 관련 변수 제거됨

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

               const onDoorInteraction = (message) => { 
         // "문이 잠겨있습니다" 메시지는 표시하지 않음
        if (message.includes("문이 잠겨있습니다")) {
          console.log("문이 잠겨있습니다 메시지 차단됨");
          return;
        }
        
        // 문 열기 메시지는 표시하지 않음

        if (message.includes("열쇠로 문을 열었습니다!")) {
            setHasOpKeyItem(false); // 여기서 열쇠 소모 처리
        }
        // if (message.includes("OP_KEY_USED")) {
        //     setHasOpKeyItem(false); // 여기서 열쇠 소모 처리
        // }
        // if (message.includes("ID_CARD_USED")) {
        //     setHasIdCardItem(false); // 여기서 ID 카드 소모 처리
        // }
    };

    // ... (이전 코드 생략) ...

    if (parentMesh) {
        await addOperatingRoom(
            scene,
            parentMesh,
            handleOperatingRoomScrollClick,
            () => {
                setHasOpKeyItem(true); // 수술실 열쇠 획득
            },
            handleSurgeryBoxClick,
            onDoorInteraction,
            () => hasIdCardItemRef.current,
            bgmRef
        );

        await addDoorAndChair(scene, parentMesh, () => setShowQuiz(true), () => hasKeyItemRef.current, showMessage, showMessage2);
        await addDoctorOffice(
            scene,
            parentMesh,
            handleCupboardClickToTriggerOfficeQuiz, // onCupboardClickForQuiz (찬장 클릭 시 퀴즈 대신 바로 잠금 해제)
            (status) => {
                console.log("setHasIdCardItem 호출됨:", status);
                setHasIdCardItem(status);
            }, // onIdCardAcquired
            () => isOfficeCupboardUnlockedRef.current, // getIsCupboardUnlocked
            handlePaperClickForImage, // onPaperClickForContent
            handleOfficeDoorClick, // onOfficeDoorClick
            () => isOfficeDoorUnlockedRef.current // getIsOfficeDoorUnlocked
        );

        await addRestroomObject(scene, parentMesh, showMessage);
        await addInformation(scene, parentMesh);
        await addVillain(scene, parentMesh);

        // underground 문 추가 및 상호작용 설정
        const undergroundResult = await addUnderground(
            scene,
            parentMesh,
            (message) => { // onDoorInteraction 대신 메시지를 직접 처리하는 콜백
                setUndergroundDoorMessage(message);
                setShowUndergroundDoorMessage(true);
                setTimeout(() => setShowUndergroundDoorMessage(false), 3000);
            },
            () => hasOpKeyItemRef.current, // 지하 문은 수술실 열쇠 상태를 확인
            (action) => {
                console.log("underground 콜백 호출됨, action:", action);
                if (action === 'escape_success') {
                    console.log("탈출 성공 모달 표시");
                    // 탈출 성공 모달 표시
                    setShowEscapeSuccessModal(true);
                } else {
                    console.log("일반적인 문제 모달 열기");
                    // 일반적인 문제 모달 열기 요청
                    setShowProblemModal(true);
                }
            },
            bgmRef
        );
        undergroundDoorRef.current = undergroundResult.toggleDoor;
        problemDoorRef.current = undergroundResult.openProblemDoor;
        problemDoorToggleRef.current = undergroundResult.toggleProblemDoor;
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
      const darkZoneCenter = new BABYLON.Vector3(7, 7, 12);
      const darkZoneRadius = 14;


      // 손전등 모델 및 스팟 라이트 초기화 (한 번만 실행)
      if (!rootFlashlightMeshRef.current) {
        const flashResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "flash_light_6_mb.glb", scene);
        console.log("손전등 아이템을 불러오기");
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
          flashlightHolderRef.current.position = new BABYLON.Vector3(-9.18, 8.25, -13.25);
          flashlightHolderRef.current.scaling = new BABYLON.Vector3(1.5,1.5,1.5);
          flashlightHolderRef.current.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI/2)
            .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI));

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

       const meshToDelete = scene.getMeshByName("op_room_door_Cube.002_Cube.001_My_Ui_0"); // "삭제할_메시_이름"을 실제 메시 이름으로 변경하세요.

        if (meshToDelete) {
            meshToDelete.dispose();
            console.log("메시가 성공적으로 삭제되었습니다.");
        } else {
            console.log("해당 이름의 메시를 찾을 수 없습니다.");
        }
        

          const meshToDelete1 = scene.getMeshByName("Cube.002_Cube.001_My_Ui_0"); // "삭제할_메시_이름"을 실제 메시 이름으로 변경하세요.

        if (meshToDelete1) {
            meshToDelete1.dispose();
            console.log("메시가 성공적으로 삭제되었습니다.");
        } else {
            console.log("해당 이름의 메시를 찾을 수 없습니다.");
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

        // 시체 근처에서 비명 소리 체크 (매 키 입력마다)
        if (window.corpsePosition && !window.hasPlayedCorpseSound) {
          const playerPos = new BABYLON.Vector3(camera.position.x, camera.position.y, camera.position.z);
          const distance = BABYLON.Vector3.Distance(playerPos, window.corpsePosition);
          
          if (distance < 3) { // 시체에서 3미터 이내에 있으면
            console.log("시체 근처에서 비명 소리와 물 소리 동시 재생:", distance);
            const screamAudio = new Audio('/scary-scream-3-81274.mp3');
            const waterAudio = new Audio('/water-flowing-sound-327661.mp3');
            
            // 비명 소리와 물 흐르는 소리를 동시에 재생
            screamAudio.play();
            waterAudio.play();
            
            window.hasPlayedCorpseSound = true; // 한 번만 재생되도록 설정
          }
        }
      if (evt.key === "f") {
          if (!hasFlashlightItemRef.current) {
              // 손전등 아이템이 없으면 경고 메시지를 표시할 수 있습니다.
              return;
          }

          if (flashlightSpotLightRef.current) {
              if (flashlightSpotLightRef.current.isEnabled()) {
                  flashlightSpotLightRef.current.setEnabled(false);
                  setFlashlightStatus("OFF");
              } else {
                  flashlightSpotLightRef.current.setEnabled(true);
                  flashlightSpotLightRef.current.intensity = 100; // 손전등 밝기 조절 (값 높을수록 밝아짐)
                  flashlightSpotLightRef.current.exponent = 10; // 손전등 빛의 중앙 집중도 조절 (값 높을수록 중앙에 집중)
                  setFlashlightStatus("ON");
              }
          }
      }

      // C키 앉기 기능 제거됨

      // 열쇠를 획득한 후 E키를 누르면 문이 열리게
      if (evt.key === 'e') {
          // 플레이어와 각 문 위치의 거리 계산
          const playerPosVec = new BABYLON.Vector3(camera.position.x, camera.position.y, camera.position.z);
          const mainDoorPos = new BABYLON.Vector3(-25.10, 14.80, 10.57);
          const restroomDoorPos = new BABYLON.Vector3(-18.95, 2.5, -6.95);
          const undergroundDoorPos = new BABYLON.Vector3(7, 6.4, 5.1);

          let interacted = false;

          // 수평(XZ) 거리 계산 함수
          function horizontalDistance(a, b) {
              return Math.sqrt(
                  Math.pow(a.x - b.x, 2) +
                  Math.pow(a.z - b.z, 2)
              );
          }
          const THRESHOLD = 10; // 거리 임계값(수평거리)

          // 기존 문들 (열쇠 필요)
          if (hasKeyItemRef.current) {
              if (horizontalDistance(playerPosVec, mainDoorPos) < THRESHOLD && window.openMainDoor) {
                  window.openMainDoor();
                  setHasKeyItem(false);
                  interacted = true;
              } else if (horizontalDistance(playerPosVec, restroomDoorPos) < THRESHOLD && window.openRestroomDoor) {
                  window.openRestroomDoor();
                  setHasKeyItem(false);
                  interacted = true;
              }
          }

          // underground 문 상호작용 (hasOpKeyItemRef를 사용하는 경우)
          if (horizontalDistance(playerPosVec, undergroundDoorPos) < THRESHOLD && undergroundDoorRef.current) {
              undergroundDoorRef.current(); // 직접 toggleDoor 함수 호출
              setHasOpKeyItem(false); // 언더그라운드 문을 열면 키 아이템 소모
              interacted = true;
          }

          // 만약 어떤 문과도 상호작용하지 않았다면 메시지 표시
          if (!interacted) {
              // alert('문 가까이에서 E키를 눌러주세요!'); // 필요한 경우 주석 해제
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

      // 모든 모델 로딩이 완료된 후 게임 로딩 완료 알림
      const checkAllModelsLoaded = () => {
        console.log("모델 로딩 상태 확인 중...");
        // 모든 주요 모델이 로드되었는지 확인
        const allModelsLoaded = true; // 실제로는 각 모델의 로딩 상태를 확인해야 함
        
        if (allModelsLoaded && onGameLoaded) {
          console.log("게임 로딩 완료 - onGameLoaded 콜백 호출 예정");
          // 약간의 지연을 두어 렌더링이 안정화된 후 콜백 호출
          setTimeout(() => {
            console.log("onGameLoaded 콜백 실행");
            onGameLoaded();
          }, 1000);
        } else {
          console.log("onGameLoaded 콜백이 없거나 모델 로딩이 완료되지 않음");
        }
      };

      // 초기 로딩 완료 체크
      checkAllModelsLoaded();

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
        window.removeEventListener("resize", onResize);
        scene.dispose();
        engine.dispose();
      };
    };

    initScene();

  }, [handleOperatingRoomScrollClick, handleSurgeryBoxClick, handleCupboardClickToTriggerOfficeQuiz]);

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
        {hasOpKeyItem && (
          <div style={{ marginTop: 5, display: 'flex', alignItems: 'center' }}>
            <img
              src="/key.png"
              alt="수술실 열쇠 아이템"
              style={{ width: 30, height: 30, objectFit: 'contain', marginRight: 8 }}
              onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/50x50/000000/FFFFFF?text=KEY'; }}
            />
            <span>열쇠</span>
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
      <OperatingRoomProblemModal
        isOpen={showQuiz2}
        onClose={() => {
          setShowQuiz2(false);
          setQuizMessage2('');
          setAnswerInput2('');
        }}
        onCorrectAnswer={() => {
          setQuizMessage2("정답입니다! 키 아이템을 획득했습니다. 👉 이제 E키를 눌러 문을 여세요!");
          setHasKeyItem(true);
        }}
      />

      {/* 사무실 퀴즈 팝업 */}
      <OfficeProblemModal
        isOpen={showOfficeQuiz}
        onClose={() => {
          setShowOfficeQuiz(false);
          setQuizMessage3('');
          setAnswerInput3('');
        }}
        onCorrectAnswer={() => {
          setQuizMessage3("정답입니다! 이제 찬장을 열 수 있습니다.");
          setIsOfficeCupboardUnlocked(true);
        }}
      />
      {/* -------------------------------------------------- */}

{/* ⭐ 사무실 문 퀴즈 모달 (간소화된 방식) ⭐ */}
      <OfficeDoorProblemModal
        isOpen={showOfficeDoorQuiz}
        onClose={() => {
          setShowOfficeDoorQuiz(false);
          // OfficeDoorProblemModal 내부에서 answerInput4, quizMessage4를 초기화한다고 가정
        }}
        onCorrectAnswer={() => {
          setIsOfficeDoorUnlocked(true); // 사무실 문 잠금 해제
          setShowOfficeDoorQuiz(false); // 정답 후 퀴즈 닫기
          // OfficeDoorProblemModal 내부에서 quizMessage4를 설정한다고 가정
        }}
      />

       {/* --- ⭐ 종이 이미지 팝업 UI (핵심 부분) ⭐ --- */}
            {isPaperImagePopupVisible && (
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
                    zIndex: 2001 // 높은 z-index
                }}>
                    <div style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        padding: '25px',
                        border: '3px solid #6c757d',
                        borderRadius: '10px',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
                        maxWidth: '85%', // 이미지 크기에 맞게 조절
                        maxHeight: '90%', // 이미지 크기에 맞게 조절
                        overflow: 'auto', // 이미지가 팝업보다 크면 스크롤
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2002, // 오버레이보다 높게
                        position: 'relative', // 자식 요소의 absolute 포지셔닝을 위해 필요할 수 있음
                    }}>
                      <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#0056b3' }}>내가 좋아하는 계란 나오는 날은 체크 해놔야지~!!</h3>
                        {paperImagePopupContentUrl && (
                            <img
                                src={paperImagePopupContentUrl} // 상태에 저장된 이미지 URL 사용
                                alt="식단표"
                                style={{
                                    maxWidth: '100%', // 팝업 너비에 맞게 조절
                                    maxHeight: '100%', // 팝업 높이에 맞게 조절
                                    display: 'block',
                                    borderRadius: '5px',
                                    border: '1px solid #e9ecef'
                                }}
                                onError={(e) => {
                                    e.target.onerror = null; // 중복 에러 방지
                                    console.error("이미지 로드 실패:", paperImagePopupContentUrl);
                                }}
                            />
                        )}
                        <button onClick={closePaperImagePopup} style={{
                            marginTop: '20px',
                            padding: '12px 25px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '1em',
                            fontWeight: 'bold',
                            transition: 'background-color 0.2s ease'
                        }}>닫기</button>
                    </div>
                </div>
            )}
      
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

      {/* 지하실 문제 모달 */}
      <ProblemModal
        isOpen={showProblemModal}
        onClose={() => setShowProblemModal(false)}
        onCorrectAnswer={() => {
          console.log("ProblemModal onCorrectAnswer 호출됨");
          // 문제 문 열기
          if (problemDoorRef.current) {
            console.log("problemDoorRef.current 호출");
            problemDoorRef.current();
          } else {
            console.log("problemDoorRef.current가 null입니다");
          }
          // ID 카드가 있다면 사라지도록 설정
          if (hasOpKeyItem) {
            setHasOpKeyItem(false);
          }
        }}
      />

      {/* 옥상 퀴즈 팝업 */}
      <RooftopProblemModal
        isOpen={showQuiz}
        onClose={() => {
          setShowQuiz(false);
          setQuizMessage('');
          setAnswerInput('');
        }}
        onCorrectAnswer={() => {
          setQuizMessage("정답입니다! 키 아이템을 획득했습니다. 👉 이제 E키를 눌러 문을 여세요!");
          setHasKeyItem(true);
        }}
      />

      {/* 탈출 성공 페이지 */}
      {showEscapeSuccessModal && (
        <>
          {console.log("탈출 성공 페이지 렌더링 시도, showEscapeSuccessModal:", showEscapeSuccessModal)}
          <EscapeSuccessPage
            onRestart={() => {
              setShowEscapeSuccessModal(false);
              // 게임 재시작
              if (onGameRestart) {
                onGameRestart();
              }
            }}
            onClose={() => setShowEscapeSuccessModal(false)}
            bgmRef={bgmRef}
          />
        </>
      )}

      <CenterMessage message={centerMessage} visible={showCenterMessage} />
      <ScenarioMessage message={scenarioMessage} visible={showScenarioMessage} onClose={() => setShowScenarioMessage(false)}/>
    </>
  );
};

export default BabylonScene;