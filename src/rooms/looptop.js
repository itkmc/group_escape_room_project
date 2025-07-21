// door_chair.js
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";

/**
 * 도어 및 의자를 Babylon.js 씬에 추가하는 함수
 * @param {BABYLON.Scene} scene - Babylon.js Scene 객체
 * @param {BABYLON.AbstractMesh} parentMesh - parent로 사용할 메시 (ex: 건물 메시)
 * @param {Function} [onScrollClick] - 두루마리 클릭 시 호출될 콜백 함수 (선택 사항)
 * @param {Function} [hasKeyItemFn] - 키 아이템이 있는지 확인할 함수 (선택 사항)
 */
export async function addDoorAndChair(scene, parentMesh, showQuiz, hasKeyItemFn, showMessage, showMessage2) {
  if (!parentMesh) {
    console.warn("❗ parentMesh가 없습니다.");
    return;
  }

  // 🚪 첫 번째 문 위치
  const door1 = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "door.glb", scene);
  door1.meshes.forEach((doorMesh) => {
    if (doorMesh.name === "Cube.002_Cube.000_My_Ui_0") { // 문짝만!
      const pivot = new BABYLON.Vector3(0, -6.3, 0); // 모델에 맞춰 수동 설정 (이 값이 가장 중요!)
      doorMesh.setPivotPoint(pivot);

      doorMesh.parent = parentMesh;
      doorMesh.position = BABYLON.Vector3.TransformCoordinates(
        new BABYLON.Vector3(-25.05, 12.85, 10.46), // 이 월드 위치는 유지
        BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
      );

      const baseRotation = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
        .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, -Math.PI));

      doorMesh.rotationQuaternion = baseRotation.clone(); // 원본 그대로 유지
      doorMesh.scaling = new BABYLON.Vector3(31.8, 31.8, 31.8); // 원본 스케일 유지
      doorMesh.checkCollisions = true;

      const startRotation = doorMesh.rotationQuaternion.clone();
      const openAngle = Math.PI / 2;
      const endRotation = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, openAngle).multiply(startRotation);

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

      let isDoorOpen = false;
      let isAnimating = false;
      let isFirstOpen = false; // 첫 개방 여부
      doorMesh.actionManager = new BABYLON.ActionManager(scene);
      doorMesh.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function () {
          if (!isFirstOpen) {
            // 클릭으로는 절대 처음 문을 열 수 없음
            showMessage("E키로만 문을 열 수 있습니다!");
            return;
          }
          if (isAnimating) return; // 애니메이션 중이면 무시
          isAnimating = true;
          if (!isDoorOpen) {
            doorMesh.checkCollisions = false;
            scene.beginDirectAnimation(doorMesh, [openAnim], 0, 30, false, 1.0, () => {
              isDoorOpen = true;
              isAnimating = false;
            });
          } else {
            scene.beginDirectAnimation(doorMesh, [closeAnim], 0, 30, false, 1.0, () => {
              doorMesh.checkCollisions = true;
              isDoorOpen = false;
              isAnimating = false;
            });
          }
        })
      );
      // 🔑 E키로 문 열기용 함수 등록!
      window.openMainDoor = function() {
        if (!isFirstOpen) isFirstOpen = true;
        if (isAnimating || isDoorOpen) return;
        isAnimating = true;
        doorMesh.checkCollisions = false;
        scene.beginDirectAnimation(doorMesh, [openAnim], 0, 30, false, 1.0, () => {
          isDoorOpen = true;
          isAnimating = false;
        });
      };
    }
  });

  // 🚪 두 번째 문 위치 (이전과 동일, 변동 없음) 
  const desiredDoor2WorldPos = new BABYLON.Vector3(-28.28, 14.2, 14.1);
  const door2 = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "low_poly_door_-_game_ready.glb", scene);
  door2.meshes.forEach((mesh) => {
    if (mesh.name !== "__root__") {
      mesh.name = "looptop_" + mesh.name; // 이름 유니크하게 변경
      mesh.parent = parentMesh;
      mesh.position = BABYLON.Vector3.TransformCoordinates(
        desiredDoor2WorldPos,
        BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
      );
      mesh.scaling = new BABYLON.Vector3(90, 70, 50);
      mesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
        .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2));
      mesh.checkCollisions = true;
    }
  });

  // 🪑 의자 위치 (이전과 동일, 변동 없음)
  const desiredChairWorldPos = new BABYLON.Vector3(-21, 14.2, 11.5);
  const chair = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "wooden_chair.glb", scene);
  chair.meshes.forEach((mesh) => {
    if (mesh.name !== "__root__") {
      mesh.parent = parentMesh;
      mesh.position = BABYLON.Vector3.TransformCoordinates(
        desiredChairWorldPos,
        BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
      );
      mesh.scaling = new BABYLON.Vector3(1.5, 1.5, 1.5);
      mesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
        .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2));
      mesh.checkCollisions = true;
    }
  });

  // 🛏️ 침대 옆 테이블 추가
  const desiredBedsideTableWorldPos = new BABYLON.Vector3(-24.87, 13.9, 11.3);
  const bedsideTable = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "bedside_table.glb", scene);
  console.log("로드된 책 서랍장 메쉬 목록:", bedsideTable.meshes.map(m => m.name));

  const rootBedsideTableMesh = bedsideTable.meshes[0];

  // 애니메이션 자동 재생 방지: 모든 animationGroup을 stop/reset
  if (bedsideTable.animationGroups && bedsideTable.animationGroups.length > 0) {
    bedsideTable.animationGroups.forEach(group => {
      group.stop();
      group.reset();
    });
  }

  // __root__ 메쉬가 실제로 루트 메쉬인지 확인하는 것이 좋습니다.
  if (rootBedsideTableMesh.name === "__root__") {
    rootBedsideTableMesh.parent = parentMesh;
    rootBedsideTableMesh.position = BABYLON.Vector3.TransformCoordinates(
      desiredBedsideTableWorldPos,
      BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
    );
    rootBedsideTableMesh.scaling = new BABYLON.Vector3(130, 130, 130);
    rootBedsideTableMesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
      .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI));
    rootBedsideTableMesh.checkCollisions = true;

  } else {
    console.warn("Bedside table __root__ mesh not found at expected index. Applying transformations to all meshes.");
    bedsideTable.meshes.forEach((mesh) => {
      if (mesh.name !== "__root__") { // __root__가 아닌 모든 메쉬에 적용
        mesh.parent = parentMesh;
        mesh.position = BABYLON.Vector3.TransformCoordinates(
          desiredBedsideTableWorldPos,
          BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
        );
        mesh.scaling = new BABYLON.Vector3(50, 50, 50);
        mesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
          .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI));
        mesh.checkCollisions = true;
      }
    });
  }

  // bedside_table.glb 클릭 애니메이션 (3개 메시 동시)
  const targetDrawerNames = [
    "polySurface541_bedside_wood2_0",
    "polySurface541_side_rail_0",
    "polySurface553_cupboard_wood1_0"
  ];

  // animationGroups가 있다면, 클릭 시 모든 그룹을 play
  if (bedsideTable.animationGroups && bedsideTable.animationGroups.length > 0) {
    const group = bedsideTable.animationGroups[0];
    bedsideTable.meshes.forEach(mesh => {
      if (targetDrawerNames.includes(mesh.name)) {
        if (!mesh.actionManager) {
          mesh.actionManager = new BABYLON.ActionManager(scene);
        }
        mesh.actionManager.registerAction(
          new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function () {
            group.reset();
            group.play(false);
          })
        );
      }
    });
  }

  // --- 서랍장 그룹별(본체+손잡이) 애니메이션 및 상태 관리 ---
  const drawerGroups = [
    [2, 3], // 1번 서랍: 본체+손잡이
    [4, 6], // 2번 서랍: 본체+손잡이
    [7],    // 3번 서랍: 본체만
  ];
  // 각 서랍 그룹의 열림/닫힘 상태를 관리합니다.
  const drawerStates = [false, false, false];

  // 모든 메시의 actionManager를 완전히 제거 (중복 등록 방지)
  bedsideTable.meshes.forEach(mesh => mesh.actionManager = null);

  // 서랍의 초기 Z 위치를 저장할 객체. 메시의 이름을 키로 사용합니다.
  if (!window.drawerInitialPositionsMap) {
    window.drawerInitialPositionsMap = new Map();
  }

  function animateDrawer(meshesToAnimate, open) {
    meshesToAnimate.forEach(mesh => {
      // 해당 메시의 초기 위치를 맵에서 가져오거나, 없으면 현재 위치를 저장합니다.
      if (!window.drawerInitialPositionsMap.has(mesh.name)) {
        window.drawerInitialPositionsMap.set(mesh.name, mesh.position.z);
      }
      const initialZ = window.drawerInitialPositionsMap.get(mesh.name);

      const start = mesh.position.z;
      // 열 때는 초기 위치에서 -0.8만큼 이동, 닫을 때는 초기 위치로 돌아옵니다.
      const end = open ? initialZ - 0.8 : initialZ;

      const anim = new BABYLON.Animation(
        "drawerMove",
        "position.z",
        30, // FPS
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
      );
      anim.setKeys([
        { frame: 0, value: start },
        { frame: 30, value: end }
      ]);
      mesh.getScene().beginDirectAnimation(mesh, [anim], 0, 30, false, 1.0, () => {
        // 애니메이션 완료 후 최종 위치를 정확히 설정합니다.
        mesh.position.z = end;
      });
    });
  }

  // --- 첫 번째 서랍(2, 3번 인덱스) 클릭 이벤트 등록 ---
  const firstDrawerMeshes = drawerGroups[0].map(i => bedsideTable.meshes[i]).filter(Boolean);

  firstDrawerMeshes.forEach(mesh => {
    // 각 메시의 초기 위치를 미리 저장합니다.
    if (!window.drawerInitialPositionsMap.has(mesh.name)) {
      window.drawerInitialPositionsMap.set(mesh.name, mesh.position.z);
    }

    if (!mesh.actionManager) { // ensure actionManager exists
      mesh.actionManager = new BABYLON.ActionManager(scene);
    }
    mesh.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function () {
        // 첫 번째 서랍의 상태를 토글합니다.
        drawerStates[0] = !drawerStates[0];
        animateDrawer(firstDrawerMeshes, drawerStates[0]);
      })
    );
  });

  // --- 두 번째/세 번째 서랍 동시 애니메이션 (이름으로 메시 찾기) ---
  const doubleDrawerMeshNames = [
    "polySurface541_bedside_wood2_0", // 2번 서랍 본체 이름 예시
    "polySurface553_cupboard_wood1_0"  // 3번 서랍 본체 이름 예시
  ];

  // 해당하는 메시들을 찾습니다.
  const doubleDrawerMeshes = doubleDrawerMeshNames
    .map(name => bedsideTable.meshes.find(m => m.name === name))
    .filter(Boolean); // 유효한 메시만 필터링

  doubleDrawerMeshes.forEach(mesh => {
    // 각 메시의 초기 위치를 미리 저장합니다.
    if (!window.drawerInitialPositionsMap.has(mesh.name)) {
      window.drawerInitialPositionsMap.set(mesh.name, mesh.position.z);
    }

    if (mesh) {
      if (!mesh.actionManager) { // ensure actionManager exists
        mesh.actionManager = new BABYLON.ActionManager(scene);
      }
      mesh.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function () {
          // 두 번째 서랍 그룹의 상태를 토글 (drawerStates[1]을 사용)
          drawerStates[1] = !drawerStates[1];
          animateDrawer(doubleDrawerMeshes, drawerStates[1]);
        })
      );
    }
  });

  // 모든 서랍의 초기 위치 로깅 (디버깅용)
  console.log("모든 서랍의 초기 위치:", window.drawerInitialPositionsMap);

  // 🗞️ 고대 두루마리 추가 (첫 번째 서랍 안에 넣기)
  const scrollResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "old__ancient_scroll.glb", scene);
  scrollResult.meshes.forEach((mesh) => {
    if (mesh.name !== "__root__") {
      // 첫 번째 서랍 본체(2번 인덱스)의 자식으로 설정
      mesh.parent = bedsideTable.meshes[2];
      // 서랍 내부의 로컬 좌표 (조금 앞으로)
      mesh.position = new BABYLON.Vector3(0, 0, -0.4);
      mesh.scaling = new BABYLON.Vector3(8, 8, 8);
      mesh.checkCollisions = true;

      // 두루마리 클릭 이벤트 처리 추가
      // BabylonScene.js에서 전달받은 onScrollClick 콜백 함수를 호출합니다.
      if (!mesh.actionManager) {
        mesh.actionManager = new BABYLON.ActionManager(scene);
      }
      mesh.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function () {
          console.log("두루마리가 클릭되었습니다! 퀴즈를 표시합니다.");
          if (showQuiz) { // 콜백 함수가 있는지 확인 후 호출
            showQuiz();
          }
        })
      );
    }
  });

  // 🕒 시계(clock-2.glb) __root__만 parentMesh에 붙임
  const clockResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "clock-2.glb", scene);
  const clockRoot = clockResult.meshes.find(m => m.name === "__root__");
  if (clockRoot) {
    clockRoot.parent = parentMesh;
    clockRoot.position = BABYLON.Vector3.TransformCoordinates(
      new BABYLON.Vector3(-23.53, 15.4, 9.5),
      BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
    );
    clockRoot.scaling = new BABYLON.Vector3(200, 200, 200);
    clockRoot.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2);
  }
// 📂 파일 폴더 추가
    const desiredFileFolderWorldPos = new BABYLON.Vector3(-23.7, 14.3, 11.5); // 테이블 위 적절한 위치
    const fileFolderResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "file_folder.glb", scene);

    // --- 애니메이션 자동 재생 방지 ---
    if (fileFolderResult.animationGroups && fileFolderResult.animationGroups.length > 0) {
        fileFolderResult.animationGroups.forEach(group => {
            group.stop(); // 모든 애니메이션 그룹 정지
            group.reset(); // 애니메이션을 초기 상태로 리셋
        });
    }

    // 파일 폴더의 모든 메쉬에 설정 적용
    // __root__ 메쉬 또는 모든 하위 메쉬에 설정 적용하여 클릭 가능성 높이기
    fileFolderResult.meshes.forEach(mesh => {
        // __root__ 메쉬는 다른 메쉬들의 부모 역할을 하므로, 시각적 설정은 하위 메쉬에 집중
        // 하지만 부모-자식 관계를 유지하며 월드 위치를 설정하기 위해선 루트 메쉬에 부모를 지정
        // 여기서는 모든 메쉬를 부모에 연결하고 개별적으로 위치, 스케일, 회전을 설정합니다.
        // 또는, 가장 상위의 `__root__` 메쉬에 모든 변환을 적용하고, 클릭은 하위 메쉬에서 감지하는 방식을 사용합니다.
        
        // 특정 메쉬만 클릭 가능하게 하거나, 모든 메쉬를 클릭 가능하게 할 수 있습니다.
        // 여기서는 모든 메쉬에 actionManager를 등록하여 클릭 가능성을 높입니다.
        if (mesh.name === "__root__" || mesh.isDescendantOf(fileFolderResult.meshes[0])) { // 루트 또는 루트의 자손 메쉬에만 적용
            mesh.parent = parentMesh;
            mesh.position = BABYLON.Vector3.TransformCoordinates(
                desiredFileFolderWorldPos,
                BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
            );
            mesh.scaling = new BABYLON.Vector3(20, 20, 20); // 적절한 스케일 조정
            // 모델의 원래 방향을 유지하면서 Y축으로 -90도 회전하여 정면을 향하게 함
            mesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
                .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, -Math.PI / 2));
            
            mesh.checkCollisions = true; // 충돌 가능하게 설정
            mesh.isPickable = true; // 클릭 가능하게 설정

            // 파일 폴더 클릭 이벤트 처리
            if (!mesh.actionManager) {
                mesh.actionManager = new BABYLON.ActionManager(scene);
            }
            mesh.actionManager.registerAction(
                new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function () {
                    if (showMessage2) {
                        const scenarioText = `
"코드 블랙: 탈출자는 없다"

2025년 8월 11일, 새벽 2시 30분.
불 꺼진 병원 옥상, 차가운 의자에 묶인 채 깨어난 당신.
눈앞에는 범인이 흘리고 간 섬뜩한 파일 하나가 놓여 있다.

KI 병원 - 장기 적출 기록
...
심서진 (2024.10.10 / 23:10 / 옥상) - 장기 적출 완료 (간)
강민창 (2025.02.19 / 01:45 / 지하 1층 수술실) - 장기 적출 완료 (콩팥)
김소령 (2025.07.15 / 17:20 / 지하 1층 영안실) - 장기 적출 완료 (심장)
...
2025.08.11 / 02:30 / 옥상 - 대기 중

목록의 마지막 줄은 비어 있었다.
하지만, 그곳에 새겨질 이름이 누구인지는 분명했다.
정확히 2시 30분. 지금 당신이 있는, 이 옥상.

옥상 문은 굳게 잠겨 있고, 멈춘 시계만이 새벽을 비웃는다.
병원 아래선 끊임없이 기계 소리가 울리고, 수술실의 냉혹한 시간이 흐른다.

사라진 환자들... 출구는 단 하나.

움직이지 않으면, 당신의 차례가 시작된다.
`;
                        showMessage2(scenarioText); // 시나리오 텍스트를 중앙 메시지로 표시
                    }
                })
            );
        }
    });
}