import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";

/**
 * 화장실 오브젝트(더러운 변기)를 Babylon.js 씬에 추가하는 함수
 * @param {BABYLON.Scene} scene - Babylon.js Scene 객체
 * @param {BABYLON.AbstractMesh} parentMesh - parent로 사용할 메시 (ex: 건물 메시)
 */
export async function addRestroomObject(scene, parentMesh) {
  const result = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "dirty_toilet.glb", scene);
  result.meshes.forEach((mesh) => {
    if (mesh.name !== "__root__") {
      mesh.parent = parentMesh;
      mesh.position = BABYLON.Vector3.TransformCoordinates(
        new BABYLON.Vector3(-31.26, 0.8, -3.88),
        BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
      );
      mesh.scaling = new BABYLON.Vector3(15, 15, 15);
      mesh.checkCollisions = true;
      mesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, -Math.PI / 2);

      const mesh2 = mesh.clone("toilet_clone");
      mesh2.parent = parentMesh;
      mesh2.position = BABYLON.Vector3.TransformCoordinates(
        new BABYLON.Vector3(-29.26, 0.8, -3.88),
        BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
      );
      mesh2.scaling = new BABYLON.Vector3(15, 15, 15);
      mesh2.checkCollisions = true;
      mesh2.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, -Math.PI / 2);

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
  });

  // 🔑 화장실에 door_key.glb 추가
  const keyResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "door_key.glb", scene);
  keyResult.meshes.forEach((mesh) => {
    if (mesh.name !== "__root__") {
      mesh.parent = parentMesh;
      mesh.position = BABYLON.Vector3.TransformCoordinates(
        new BABYLON.Vector3(-28.5, 1.16, -8.35),
        BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
      );
      mesh.scaling = new BABYLON.Vector3(6, 6, 6);
      mesh.checkCollisions = true;
      mesh.isPickable = true;
      // 열쇠를 X축으로 90도 눕혀서 배치
      mesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2);
      // 클릭 시 window.setHasKeyItem(true) 호출
      mesh.actionManager = new BABYLON.ActionManager(scene);
      mesh.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function () {
          console.log('열쇠 클릭됨!');
          if (window.setHasKeyItem) window.setHasKeyItem(true);
          alert('열쇠를 획득했습니다! E키를 눌러 문을 여세요.');
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
  let isFirstOpen = false; // 한 번이라도 열렸는지 여부

  doorMesh.actionManager = new BABYLON.ActionManager(scene);
  doorMesh.actionManager.registerAction(
    new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function () {
      // 🔑 한 번도 안 열렸으면 열쇠 필요, 한 번 열렸으면 자유롭게 열고 닫기
      if (!isFirstOpen) {
        if (!window.hasKeyItemRef || !window.hasKeyItemRef.current) {
          alert('열쇠를 먼저 찾으세요!');
          return;
        }
        isFirstOpen = true;
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
    // 🔑 한 번도 안 열렸으면 열쇠 필요, 한 번 열렸으면 자유롭게 열고 닫기
    if (!isFirstOpen) {
      if (!window.hasKeyItemRef || !window.hasKeyItemRef.current) {
        alert('열쇠를 먼저 찾으세요!');
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
}
