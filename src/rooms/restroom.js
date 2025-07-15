import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";

/**
 * 화장실 오브젝트(더러운 변기)를 Babylon.js 씬에 추가하는 함수
 * @param {BABYLON.Scene} scene - Babylon.js Scene 객체
 * @param {BABYLON.AbstractMesh} parentMesh - parent로 사용할 메시 (ex: 건물 메시)
 */
export async function addRestroomObject(scene, parentMesh, showMessage) {
  const result = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "dirty_toilet.glb", scene);
  for (const mesh of result.meshes) {
    if (mesh.name !== "__root__") {
      mesh.parent = parentMesh;
      mesh.position = BABYLON.Vector3.TransformCoordinates(
        new BABYLON.Vector3(-30.71, 0.8, -3.88),
        BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
      );
      mesh.scaling = new BABYLON.Vector3(15, 15, 15);
      mesh.checkCollisions = true;
      mesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, -Math.PI / 2);

      // 두 번째 변기 - giant_skibidi_toilet_rigged.glb 사용
      const skibidiResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "giant_skibidi_toilet_rigged.glb", scene);
      skibidiResult.meshes.forEach((skibidiMesh) => {
        if (skibidiMesh.name !== "__root__") {
          skibidiMesh.parent = parentMesh;
          skibidiMesh.position = BABYLON.Vector3.TransformCoordinates(
            new BABYLON.Vector3(-28.56, 1.0, -3.88),
            BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
          );
          skibidiMesh.scaling = new BABYLON.Vector3(45, 45, 45);
          skibidiMesh.checkCollisions = true;
          skibidiMesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, -Math.PI / 2)
            .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, Math.PI));
        }
      });

      const mesh3 = mesh.clone("toilet_clone2");
      mesh3.parent = parentMesh;
      mesh3.position = BABYLON.Vector3.TransformCoordinates(
        new BABYLON.Vector3(-27.26, 0.8, -3.88),
        BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
      );
      mesh3.scaling = new BABYLON.Vector3(15, 15, 15);
      mesh3.checkCollisions = true;
      mesh3.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, -Math.PI / 2);
    }
  }

  // 🔑 화장실에 door_key.glb 추가
  const keyResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "door_key.glb", scene);
  keyResult.meshes.forEach((mesh) => {
    if (mesh.name !== "__root__") {
      mesh.parent = parentMesh;
      mesh.position = BABYLON.Vector3.TransformCoordinates(
        new BABYLON.Vector3(-36, 2.08, -3.50),
        // -28.5, 1.16, -8.35
        BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
      );
      mesh.scaling = new BABYLON.Vector3(10, 10, 10);
      mesh.checkCollisions = true;
      mesh.isPickable = true;
      // 열쇠를 Z축 -90도, Y축 180도 회전시켜 이미지처럼 배치
      mesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, -Math.PI / 2)
        .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI/2));
      // 클릭 시 window.setHasKeyItem(true) 호출
      mesh.actionManager = new BABYLON.ActionManager(scene);
      mesh.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function () {
          console.log('열쇠 클릭됨!');
          if (window.setHasKeyItem) window.setHasKeyItem(true);
          showMessage('열쇠를 획득했습니다! E키를 눌러 문을 여세요.');
          // 열쇠를 획득하면 mesh를 씬에서 제거
          mesh.dispose();
        })
      );
    }
  });

  // 🚪 화장실에 door_wood.glb 추가 (프레임과 문짝을 부모-자식으로 연결)
const doorResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "door_wood.glb", scene);

let frameMesh = null;
let doorMesh = null;
let handleMesh = null;

doorResult.meshes.forEach((mesh) => {
  if (mesh.name === "DoorFrame_MAT_Door_0") {
    frameMesh = mesh;
  }
  if (mesh.name === "Door_MAT_Door_0") {
    doorMesh = mesh;
  }
  if (mesh.name === "Handle_Back_MAT_Handle_0") {
    handleMesh = mesh;
  }
});

if (frameMesh && doorMesh) {
  // 전체 문 어셈블리의 부모 역할을 할 TransformNode 생성
  const doorGroup = new BABYLON.TransformNode("doorGroup", scene);
  doorGroup.parent = parentMesh;
  doorGroup.position = BABYLON.Vector3.TransformCoordinates(
    new BABYLON.Vector3(-18.95, 2.5, -6.95),
    BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
  );
  doorGroup.scaling = new BABYLON.Vector3(140, 130, 140);
  doorGroup.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, Math.PI / 2);

  // 문짝을 doorGroup에 직접 붙임
  doorMesh.parent = doorGroup;
  doorMesh.position = BABYLON.Vector3.Zero();
  doorMesh.scaling = new BABYLON.Vector3(1, 1, 1);
  doorMesh.rotationQuaternion = null;
  doorMesh.isPickable = true;
  doorMesh.checkCollisions = true;
  // 피벗을 z축 한쪽 끝으로 미세 조정 (닫힐 때 항상 같은 자리)
  doorMesh.setPivotPoint(new BABYLON.Vector3(0, 0, -1.05));

  if (handleMesh) {
    handleMesh.parent = doorMesh;
    handleMesh.position = BABYLON.Vector3.Zero();
    handleMesh.scaling = new BABYLON.Vector3(0, 0, 1);
    handleMesh.rotationQuaternion = BABYLON.Quaternion.Identity();
    handleMesh.checkCollisions = true;
  }

  // 쿼터니언 회전 애니메이션(열림/닫힘)
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
  let isFirstOpen = false; // 한 번이라도 E키로 열렸는지 여부(문 클릭 이벤트와 공유)

  doorMesh.actionManager = new BABYLON.ActionManager(scene);
  doorMesh.actionManager.registerAction(
    new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function () {
      if (!isFirstOpen) {
        showMessage('열쇠를 먼저 획득하세요');
        return;
      }
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

  // E키로 문 열기용 함수 등록
  window.openRestroomDoor = function() {
    if (!isFirstOpen) {
      if (!window.hasKeyItemRef || !window.hasKeyItemRef.current) {
        showMessage('열쇠를 먼저 찾으세요!');
        return;
      }
      isFirstOpen = true;
    }
    if (isAnimating || isDoorOpen) return;
    isAnimating = true;
    scene.beginDirectAnimation(doorMesh, [openAnim], 0, 30, false, 1.0, () => {
      isDoorOpen = true;
      isAnimating = false;
    });
  };
}

  // 🚧 화장실 칸막이 추가
  const partitionResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "toilet_partition.glb", scene);
  partitionResult.meshes.forEach((mesh) => {
    if (mesh.name !== "__root__") {
      mesh.parent = parentMesh;
      mesh.position = BABYLON.Vector3.TransformCoordinates(
        new BABYLON.Vector3(-26.85, 0.8, -4.62),
        BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
      );
      mesh.scaling = new BABYLON.Vector3(80, 80, 80);
      mesh.checkCollisions = true;
      mesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, -Math.PI / 2)
        .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI))
        .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI));
    }
  });

  // 🩸 잘린 손가락(severed_fingers_-_horror_game_asset.glb) 원래대로 추가
  const fingersResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "severed_fingers_-_horror_game_asset.glb", scene);

  // 손가락 각각 원하는 위치에 배치
  const fingerPositions = {
    "Object001_M_BrokenFingers_0": new BABYLON.Vector3(-30.2, 1.2, -4.55),
    "Object002_M_BrokenFingers_0": new BABYLON.Vector3(-24.40, 1.63, -5.3),
    "Object003_M_BrokenFingers_0": new BABYLON.Vector3(-22.74, 1.63, -5.3),
    "finger_low_M_BrokenFingers_0": new BABYLON.Vector3(-21.35, 1.63, -5.3)
  };
  fingersResult.meshes.forEach((mesh) => {
    if (mesh.name !== "__root__" && fingerPositions[mesh.name]) {
      mesh.parent = parentMesh;
      mesh.position = BABYLON.Vector3.TransformCoordinates(
        fingerPositions[mesh.name],
        BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
      );
      mesh.scaling = new BABYLON.Vector3(3, 3, 3);
      mesh.checkCollisions = true;
    }
  });

  // 💧 물 애니메이션(water_animation.glb) 추가
  const waterResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "water_animation.glb", scene);
  waterResult.meshes.forEach((mesh) => {
    if (mesh.name !== "__root__") {
      mesh.parent = parentMesh;
      mesh.position = BABYLON.Vector3.TransformCoordinates(
        new BABYLON.Vector3(-30.2, 1.2, -4.55),
        BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
      );
      mesh.scaling = new BABYLON.Vector3(30, 30, 30);
      mesh.checkCollisions = false;
    }
  });

  // 🧟 시체(death_forest_-_stranger.glb) 추가
  const corpseResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "death_forest_-_stranger.glb", scene);
  corpseResult.meshes.forEach((mesh) => {
    if (mesh.name !== "__root__") {
      mesh.parent = parentMesh;
      mesh.position = BABYLON.Vector3.TransformCoordinates(
        new BABYLON.Vector3(-31.87, 2.0, -3.68),
        BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
      );
      mesh.scaling = new BABYLON.Vector3(11, 11, 11);
      mesh.checkCollisions = true;
      mesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, Math.PI/2);
    }
  });
}