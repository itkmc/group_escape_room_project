// door_chair.js
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";

/**
 * 도어 및 의자를 Babylon.js 씬에 추가하는 함수
 * @param {BABYLON.Scene} scene - Babylon.js Scene 객체
 * @param {BABYLON.AbstractMesh} parentMesh - parent로 사용할 메시 (ex: 건물 메시)
 */
export async function addDoorAndChair(scene, parentMesh) {
  if (!parentMesh) {
    console.warn("❗ parentMesh가 없습니다.");
    return;
  }

  // 🚪 첫 번째 문 위치
  const door1 = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "door.glb", scene);
  // door1.meshes[0]는 rootMesh일 가능성이 높지만, 여기서는 doorMesh에 직접 접근합니다.
  // 이전 코드 상태로 되돌리기 위해 rootDoorMesh 변수를 직접 사용하지 않습니다.

  door1.meshes.forEach((doorMesh) => {
    if (doorMesh.name === "Cube.002_Cube.000_My_Ui_0") { // 문짝만!

      // 1. 피벗 이동 (왼쪽 끝 경첩 기준)
      // 이 피벗은 문 모델의 로컬 좌표계에서 '경첩'이 될 지점입니다.
      // 이 값은 문이 '세워진' 상태가 아니라, '원본 GLB 파일에 정의된' 문 모델의 로컬 좌표를 기준으로 합니다.
      // -0.6 (X축): 문의 한쪽 끝 (너비 방향)
      // -6.3 (Y축): 문의 바닥에서 위로 (높이 방향) - 이 값이 문제의 원인일 수 있습니다.
      //             만약 문이 바닥에 파묻힌다면, -6.3을 0에 가깝게 조절하거나 (예: -2.0, -1.0, 0.0)
      //             혹은 양수 값(0.1, 0.5 등)을 시도해봐야 합니다.
      // 0 (Z축): 문의 두께 중앙
      // 가장 중요한 점은 이 피벗이 **애니메이션 회전이 발생할 실제 경첩의 위치**여야 한다는 것입니다.
      // **이전 상황을 복구하기 위해 -0.6, -6.3, 0으로 다시 설정합니다.**
      const pivot = new BABYLON.Vector3(-0.6, -6.3, 0); // 모델에 맞춰 수동 설정 (이 값이 가장 중요!)
      doorMesh.setPivotPoint(pivot);

      // 2. 위치, 회전, 스케일 (절대 건드리지 말라고 하셨으므로, 원본 그대로 유지)
      doorMesh.parent = parentMesh;
      doorMesh.position = BABYLON.Vector3.TransformCoordinates(
        new BABYLON.Vector3(-25.10, 14.80, 10.57), // 이 월드 위치는 유지
        BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
      );

      // 📌 기본 회전 (문을 세워주는 역할)
      // 이 회전이 문의 초기 방향을 결정합니다.
      // Math.PI / 2 (X축)은 문을 세우고, -Math.PI (Y축)은 문을 180도 돌리는 역할입니다.
      // 이 값은 `doorMesh` 자체에 적용됩니다.
      const baseRotation = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
        .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, -Math.PI));

      doorMesh.rotationQuaternion = baseRotation.clone(); // 원본 그대로 유지
      doorMesh.scaling = new BABYLON.Vector3(31.8, 31.8, 31.8); // 원본 스케일 유지 (너무 크다면 이 값을 조절해야 함!)
      doorMesh.checkCollisions = true;

      // 애니메이션 회전값
      const startRotation = doorMesh.rotationQuaternion.clone();

      // 문이 열릴 때의 회전 축을 변경해봅니다.
      // 1. Math.PI / 2 (X축으로 90도 회전) -> 이미 baseRotation에 X축 회전이 있으므로, 이 경우 문이 눕거나 뒤집힐 가능성이 높음.
      // 2. Math.PI / 2 (Z축으로 90도 회전) -> 이 축이 문을 옆으로 열리게 할 가능성이 높습니다.
      const openAngle = Math.PI / 2; // 또는 -Math.PI / 2 로 문 여는 방향 조절

      // **여기서 BABYLON.Axis.Y를 BABYLON.Axis.X 또는 BABYLON.Axis.Z로 변경하여 시도해보세요.**
      // 가장 유력한 후보는 BABYLON.Axis.Z 입니다.
      const endRotation = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, openAngle).multiply(startRotation);
      // 또는
      // const endRotation = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, openAngle).multiply(startRotation);

      // 열기 애니메이션
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

      // 닫기 애니메이션
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

      // 클릭 시 문 열기/닫기
      let isDoorOpen = false;
      doorMesh.actionManager = new BABYLON.ActionManager(scene);
      doorMesh.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function () {
          if (!isDoorOpen) {
            doorMesh.checkCollisions = false;
            scene.beginDirectAnimation(doorMesh, [openAnim], 0, 30, false);
          } else {
            scene.beginDirectAnimation(doorMesh, [closeAnim], 0, 30, false, () => {
              doorMesh.checkCollisions = true;
            }); // 닫힐 때만 애니메이션 완료 후 충돌 켬
          }
          isDoorOpen = !isDoorOpen;
        })
      );
    }
  });

  // 🚪 두 번째 문 위치 (이전과 동일, 변동 없음)
  const desiredDoor2WorldPos = new BABYLON.Vector3(-28.28, 14.2, 14.1);
  const door2 = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "low_poly_door_-_game_ready.glb", scene);
  door2.meshes.forEach((mesh) => {
    if (mesh.name !== "__root__") {
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
}