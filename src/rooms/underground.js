// information.js
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";

/**
 * @param {BABYLON.Scene} scene 
 * @param {BABYLON.AbstractMesh} parentMesh 
 * @param {Function} onDoorInteraction - 문 상호작용 시 호출될 콜백 함수
 * @param {Function} getHasIdCardItem - ID 카드 보유 상태를 확인하는 함수
 */
export async function addUnderground(scene, parentMesh, onDoorInteraction, getHasIdCardItem) {
  const desiredDoor2WorldPos = new BABYLON.Vector3(7, 6.4, 5.1);
  let doorMeshes = [];
  let isDoorOpen = false;
  let initialDoorRotations = new Map();
  let isUnlocked = false; // 한 번 열리면 true

  // 문 추가 전에 씬 전체에서 같은 이름의 mesh를 모두 삭제
  ["Object_4", "Object_8"].forEach(name => {
    scene.meshes.filter(m => m.name === name).forEach(m => m.dispose());
  });

  const door2 = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "low_poly_door_-_game_ready.glb", scene);
  console.log("[DEBUG] door2.meshes:", door2.meshes.map(m => m.name)); // 추가: 문 모델의 mesh 이름 전체 출력
  door2.meshes.forEach((mesh) => {
    if (mesh.name === "Object_4" || mesh.name === "Object_8") { // Object_4, Object_8만 남김
      mesh.parent = parentMesh;
      mesh.position = BABYLON.Vector3.TransformCoordinates(
        desiredDoor2WorldPos,
        BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
      );
      mesh.scaling = new BABYLON.Vector3(50, 60, 55);
      mesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
        .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI));
      mesh.checkCollisions = true;
      doorMeshes.push(mesh);
      initialDoorRotations.set(mesh.name, mesh.rotationQuaternion.clone());
    } else if (mesh.name !== "__root__") {
      mesh.setEnabled(false); // 필요 없는 부품 숨기기
    }
  });

  // 시신
  const bodyBagPositions = [
    new BABYLON.Vector3(14.5, 6.03, 2)
  ];
  for (const pos of bodyBagPositions) {
    const result = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "smartinius_body_bag_3d_asset.glb", scene);
    for (const mesh of result.meshes) {
      if (mesh.name !== "__root__") {
        mesh.parent = parentMesh;
        mesh.position = BABYLON.Vector3.TransformCoordinates(
          pos,
          BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
        );
        mesh.scaling = new BABYLON.Vector3(0.8, 0.8, 0.8);
        mesh.checkCollisions = true;
      }
    }
  }

  // 사슴 시체(deer_dead_body) 배치
  const deerDeadBodyPositions = [
    new BABYLON.Vector3(16.3, 6.8, 3.9)
  ];
  for (const pos of deerDeadBodyPositions) {
    const result = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "deer_dead_body.glb", scene);
    console.log("deer_dead_body.glb 로드됨:", result.meshes.map(m => m.name));
    const root = result.meshes.find(m => m.name === "__root__");
    if (root) {
      root.parent = parentMesh;
      root.position = BABYLON.Vector3.TransformCoordinates(
        pos,
        BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
      );
      root.scaling = new BABYLON.Vector3(100, 100, 100);
      root.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI/2); // X축으로 눕힘
      console.log("deer_dead_body __root__ 배치:", {
        position: root.position,
        scaling: root.scaling
      });
    }
  }

  
   // 미라
  const mummyBodyPositions = [
    new BABYLON.Vector3(15.55, 6, 5.08)
  ];
  for (const pos of mummyBodyPositions) {
    const result = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "zombie_smoke_mummy_character_12_mb.glb", scene);
    console.log("deer_dead_body.glb 로드됨:", result.meshes.map(m => m.name));
    const root = result.meshes.find(m => m.name === "__root__");
    if (root) {
      root.parent = parentMesh;
      root.position = BABYLON.Vector3.TransformCoordinates(
        pos,
        BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
      );
      root.scaling = new BABYLON.Vector3(100, 100, 100);
      root.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
        .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, -Math.PI)); // X축 90도, Y축 90도 순서로 회전
      console.log("deer_dead_body __root__ 배치:", {
        position: root.position,
        scaling: root.scaling
      });
    }
  }

  // 시체 서랍
  const morgueBodyPositions = [
    new BABYLON.Vector3(16.3, 6.4, 8.1)
  ];
  for (const pos of morgueBodyPositions) {
    const result = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "morgue_refrigerator-12mb.glb", scene);
    console.log("deer_dead_body.glb 로드됨:", result.meshes.map(m => m.name));
    const root = result.meshes.find(m => m.name === "__root__");
    if (root) {
      root.parent = parentMesh;
      root.position = BABYLON.Vector3.TransformCoordinates(
        pos,
        BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
      );
      root.scaling = new BABYLON.Vector3(70, 90, 70);
      root.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, Math.PI)
        .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)); // X축 90도, Y축 90도 순서로 회전
      console.log("deer_dead_body __root__ 배치:", {
        position: root.position,
        scaling: root.scaling
      });
    }
  }
  
// 시체 table
  const tableBodyPositions = [
    new BABYLON.Vector3(16.3, 6, 3.9)
  ];
  for (const pos of tableBodyPositions) {
    const result = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "autopsy_table.glb", scene);
    console.log("deer_dead_body.glb 로드됨:", result.meshes.map(m => m.name));
    const root = result.meshes.find(m => m.name === "__root__");
    if (root) {
      root.parent = parentMesh;
      root.position = BABYLON.Vector3.TransformCoordinates(
        pos,
        BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
      );
      root.scaling = new BABYLON.Vector3(5, 5, 5);
      root.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, Math.PI)
        .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)); // X축 90도, Y축 90도 순서로 회전
      console.log("deer_dead_body __root__ 배치:", {
        position: root.position,
        scaling: root.scaling
      });
    }
  }

  // EXIT
  const exitBodyPositions = [
    new BABYLON.Vector3(36.67, 8, 6.2)
  ];
  for (const pos of exitBodyPositions) {
    const result = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "exit_sign.glb", scene);
    console.log("deer_dead_body.glb 로드됨:", result.meshes.map(m => m.name));
    const root = result.meshes.find(m => m.name === "__root__");
    if (root) {
      root.parent = parentMesh;
      root.position = BABYLON.Vector3.TransformCoordinates(
        pos,
        BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
      );
      root.scaling = new BABYLON.Vector3(10, 10, 10);
      root.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI)
        .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, -Math.PI / 2)); // X축 90도, Y축 90도 순서로 회전
      console.log("deer_dead_body __root__ 배치:", {
        position: root.position,
        scaling: root.scaling
      });
    }
  }

   // 해골
  const skullBodyPositions = [
    new BABYLON.Vector3(17.68, 7, 1.6)
  ];
  for (const pos of skullBodyPositions) {
    const result = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "skull_sculpture_two.glb", scene);
    console.log("deer_dead_body.glb 로드됨:", result.meshes.map(m => m.name));
    const root = result.meshes.find(m => m.name === "__root__");
    if (root) {
      root.parent = parentMesh;
      root.position = BABYLON.Vector3.TransformCoordinates(
        pos,
        BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
      );
      root.scaling = new BABYLON.Vector3(1.2, 1.2, 1.2);
      root.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI/2)
        .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, -Math.PI/2)); // X축 90도, Y축 90도 순서로 회전
      console.log("deer_dead_body __root__ 배치:", {
        position: root.position,
        scaling: root.scaling
      });
    }
  }

  // 문 열기/닫기 애니메이션 함수
  const toggleDoor = () => {
    // 한 번이라도 열렸으면 isUnlocked = true
    if (!isUnlocked) {
      if (!getHasIdCardItem || !getHasIdCardItem()) {
        if (onDoorInteraction) onDoorInteraction("ID 카드가 필요합니다!");
        return;
      }
      isUnlocked = true; // E키로 한 번 열면 해제
    }
    const animationGroup = new BABYLON.AnimationGroup("undergroundDoorAnimationGroup");
    doorMeshes.forEach((doorMesh) => {
      const startRotation = doorMesh.rotationQuaternion.clone();
      let targetRotation;
      if (isDoorOpen) {
        targetRotation = initialDoorRotations.get(doorMesh.name).clone();
      } else {
        targetRotation = initialDoorRotations.get(doorMesh.name)
          .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2));
      }
      const doorAnimation = new BABYLON.Animation(
        `doorRotation_${doorMesh.name}`,
        "rotationQuaternion",
        30,
        BABYLON.Animation.ANIMATIONTYPE_QUATERNION,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
      );
      doorAnimation.setKeys([
        { frame: 0, value: startRotation },
        { frame: 60, value: targetRotation }
      ]);
      animationGroup.addTargetedAnimation(doorAnimation, doorMesh);
    });
    animationGroup.onAnimationGroupEndObservable.addOnce(() => {
      isDoorOpen = !isDoorOpen;
      animationGroup.dispose();
    });
    animationGroup.play(false);
  };

  // 모든 doorMeshes에 클릭 이벤트 등록
  doorMeshes.forEach((mesh) => {
    mesh.isPickable = true;
    mesh.actionManager = new BABYLON.ActionManager(scene);
    mesh.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnPickTrigger,
        () => toggleDoor()
      )
    );
  });

  // 문 추가 전에 씬에 남아있는 모든 문짝 메시를 완전히 삭제
  scene.meshes.filter(m => m.name === "door_door1_0").forEach(m => m.dispose());

  // underground 전용 door.glb 문 추가 (parent 안전하게, 메시 이름 명확히)
  const undergroundDoorWorldPos = new BABYLON.Vector3(20.3, 7.18, 5.84);
  const undergroundDoorScaling = new BABYLON.Vector3(1.15, 1.15, 1.15);
  const doorResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "door.glb", scene);
  console.log("door.glb 메시 이름 목록:", doorResult.meshes.map(m => m.name));
  const frameMesh = doorResult.meshes.find(m => m.name === "frame_door1_0");
  const doorMesh = doorResult.meshes.find(m => m.name === "door_door1_0");
  const handleMesh = doorResult.meshes.find(m => m.name === "handle_door1_0");
  // 모든 메시 parent 해제
  doorResult.meshes.forEach(mesh => { mesh.parent = null; });
  // TransformNode로 그룹핑
  const doorGroup = new BABYLON.TransformNode("undergroundDoorGroup", scene);
  doorGroup.parent = parentMesh;
  doorGroup.position = BABYLON.Vector3.TransformCoordinates(
    undergroundDoorWorldPos,
    BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
  );
  doorGroup.scaling = undergroundDoorScaling;
  // 문이 세워진 상태에서 Y축으로 90도 회전 적용
  doorGroup.rotationQuaternion =
    BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
      .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2));
  // frameMesh(문틀) 제거
  if (frameMesh) frameMesh.dispose();
  // doorMesh, handleMesh만 parent 등 기존대로 설정
  if (doorMesh) doorMesh.parent = doorGroup;
  if (handleMesh) handleMesh.parent = doorGroup;
  // doorMesh 설정
  if (doorMesh) {
    doorMesh.position = new BABYLON.Vector3(-8, 0, 0);
    doorMesh.scaling = new BABYLON.Vector3(1, 1, 1);
    doorMesh.rotationQuaternion = null;
    doorMesh.isPickable = true;
    doorMesh.checkCollisions = true;
    doorMesh.setPivotPoint(new BABYLON.Vector3(0, 0, -0.5));

    // 슬라이딩 애니메이션을 doorGroup.position에 적용 (x축 -1.2 방향)
    const closedPos = doorGroup.position.clone();
    const openPos = closedPos.add(new BABYLON.Vector3(-1.2, 0, 0)); // x축(왼쪽)으로 1.2만큼 이동

    const slideAnim = new BABYLON.Animation(
      "doorGroupSlide",
      "position",
      30,
      BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    slideAnim.setKeys([
      { frame: 0, value: closedPos },
      { frame: 30, value: openPos }
    ]);
    const slideBackAnim = new BABYLON.Animation(
      "doorGroupSlideBack",
      "position",
      30,
      BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    slideBackAnim.setKeys([
      { frame: 0, value: openPos },
      { frame: 30, value: closedPos }
    ]);

    let isDoorOpen = false;
    let isAnimating = false;
    doorMesh.actionManager = new BABYLON.ActionManager(scene);
    doorMesh.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function () {
        if (isAnimating) return;
        isAnimating = true;
        if (!isDoorOpen) {
          scene.beginDirectAnimation(doorGroup, [slideAnim], 0, 30, false, 1.0, () => {
            isDoorOpen = true;
            isAnimating = false;
          });
        } else {
          scene.beginDirectAnimation(doorGroup, [slideBackAnim], 0, 30, false, 1.0, () => {
            isDoorOpen = false;
            isAnimating = false;
          });
        }
      })
    );
  }

  // handleMesh 설정
  if (handleMesh) {
    handleMesh.position = BABYLON.Vector3.Zero();
    handleMesh.scaling = new BABYLON.Vector3(0, 0, 1);
    handleMesh.rotationQuaternion = BABYLON.Quaternion.Identity();
    handleMesh.checkCollisions = true;
  }
  // 문 열림/닫힘 애니메이션 등 기존 로직은 동일하게 유지
  if (doorMesh) {
    const startRotation = BABYLON.Quaternion.Identity();
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
    doorMesh.actionManager = new BABYLON.ActionManager(scene);
    doorMesh.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function () {
        if (isAnimating) return;
        isAnimating = true;
        if (!isDoorOpen) {
          scene.beginDirectAnimation(doorMesh, [openAnim], 0, 30, false, 1.0, () => {
            isDoorOpen = true;
            isAnimating = false;
          });
        } else {
          scene.beginDirectAnimation(doorMesh, [closeAnim], 0, 30, false, 1.0, () => {
            isDoorOpen = false;
            isAnimating = false;
          });
        }
      })
    );
  }

  // door_door1_0 메시가 여러 개면 첫 번째만 남기고 나머지는 완전히 삭제
  let firstDoor = true;
  doorResult.meshes.forEach(mesh => {
    if (mesh.name === "door_door1_0") {
      if (firstDoor) {
        firstDoor = false;
      } else {
        mesh.dispose(); // 완전히 삭제
      }
    } else if (mesh.name !== "handle_door1_0") {
      mesh.setEnabled(false);
    }
  });
  // 씬에 활성화된 door_door1_0 메시 개수 콘솔에 출력
  const allDoors = scene.meshes.filter(m => m.name === "door_door1_0" && m.isEnabled());
  console.log("씬에 활성화된 door_door1_0 개수:", allDoors.length);

  // toggleDoor를 외부에서 쓸 수 있게 반환
  return { toggleDoor };
}