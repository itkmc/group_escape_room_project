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
}
