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
  const desiredDoor1WorldPos = new BABYLON.Vector3(-25.10, 14.80, 10.57);
  const door1 = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "door.glb", scene);
  door1.meshes.forEach((mesh) => {
    if (mesh.name !== "__root__") {
      mesh.parent = parentMesh;
      mesh.position = BABYLON.Vector3.TransformCoordinates(
        desiredDoor1WorldPos,
        BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
      );
      mesh.scaling = new BABYLON.Vector3(31.8, 31.8, 31.8);
      mesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
        .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, -Math.PI));
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
