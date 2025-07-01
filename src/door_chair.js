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

  // 첫 번째 문 위치
  // const desiredDoor1WorldPos = new BABYLON.Vector3(-25.10, 14.80, 10.57);
  const door1 = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "door.glb", scene);
  door1.meshes.forEach((doorMesh) => {
    console.log("도어 메시 이름:", doorMesh.name);
    if (doorMesh.name === "Cube.002_Cube.000_My_Ui_0") { // 문짝만!
      // 1. 피벗 이동 (스케일 적용 전에!)
      // const boundingBox = doorMesh.getBoundingInfo().boundingBox;
      // const min = boundingBox.minimum;
      // const center = boundingBox.center;
      const pivot = new BABYLON.Vector3(-0.6, -6.3, 0);
    doorMesh.setPivotPoint(pivot);

      // 2. 위치, 회전, 스케일 적용
      doorMesh.parent = parentMesh;
      doorMesh.position = BABYLON.Vector3.TransformCoordinates(
        new BABYLON.Vector3(-25.10, 14.80, 10.57),
        BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
      );
      doorMesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
        .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, -Math.PI));
      doorMesh.scaling = new BABYLON.Vector3(31.8, 31.8, 31.8);
      doorMesh.checkCollisions = true;

      let isDoorOpen = false;
      const startRotation = doorMesh.rotationQuaternion.clone();

      // X축을 기준으로 90도 회전
      const endRotation = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2);

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

      doorMesh.actionManager = new BABYLON.ActionManager(scene);
      doorMesh.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function () {
          if (!isDoorOpen) {
            doorMesh.checkCollisions = false;
            scene.beginDirectAnimation(doorMesh, [openAnim], 0, 30, false);
          } else {
            doorMesh.checkCollisions = true;
            scene.beginDirectAnimation(doorMesh, [closeAnim], 0, 30, false);
          }
          isDoorOpen = !isDoorOpen;
        })
      );

    }
  });

  // 🚪 두 번째 문 위치
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

  // 🪑 의자 위치
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
