// op_room.js
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";

/**
 * 수술실 내 오브젝트들 (모니터, 수술대, 사물함 등)을 Babylon.js 씬에 추가
 * @param {BABYLON.Scene} scene - Babylon.js Scene
 * @param {BABYLON.AbstractMesh} parentMesh - 건물 메시에 붙일 부모
 */
export async function addOperatingRoom(scene, parentMesh) {
  if (!parentMesh) {
    console.warn("parentMesh가 없습니다.");
    return;
  }

  // --- 의료용 테이블 배치 ---
  const desiredMedicalTableWorldPos = new BABYLON.Vector3(6.10, 6.47, 15.97);
  const medicalTableResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "medical_table_-_17mb.glb", scene);

  let rootMedicalTableMesh = medicalTableResult.meshes.find(mesh => mesh.name === "__root__");

  if (!rootMedicalTableMesh) {
    rootMedicalTableMesh = medicalTableResult.meshes[0];
    console.warn("medical_table_-_17mb.glb에서 '__root__' 메쉬를 찾을 수 없습니다. 첫 번째 로드된 메쉬를 전체 모델의 루트로 사용합니다.");
  }

  if (rootMedicalTableMesh) {
    rootMedicalTableMesh.parent = parentMesh;
    rootMedicalTableMesh.position = BABYLON.Vector3.TransformCoordinates(
      desiredMedicalTableWorldPos,
      BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
    );
    rootMedicalTableMesh.scaling = new BABYLON.Vector3(92, 92, 92);
    rootMedicalTableMesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
      .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2));

    medicalTableResult.meshes.forEach((mesh) => {
      if (mesh.name !== "__root__") {
        mesh.checkCollisions = true;
      } else {
        mesh.checkCollisions = true;
      }
    });

    console.log("medical_table_-_17mb.glb 모델 전체가 성공적으로 배치되었습니다.");
  } else {
    console.error("medical_table_-_17mb.glb의 모델 루트 메쉬를 찾을 수 없습니다. 모델 구조를 확인하세요.");
  }

  // 도구 위치
  const surgery_toolsWorldPos = new BABYLON.Vector3(6.10, 7.15, 15.78);
  const surgery_tools = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "medical_supplies_collection.glb", scene);
  surgery_tools.meshes.forEach((surgery_toolsMesh) => {
    if (surgery_toolsMesh.name !== "__root__") {
      surgery_toolsMesh.parent = parentMesh;
      surgery_toolsMesh.position = BABYLON.Vector3.TransformCoordinates(
        surgery_toolsWorldPos,
        BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
      );
      surgery_toolsMesh.scaling = new BABYLON.Vector3(3.5, 3.5, 3.5);
      surgery_toolsMesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
        .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, -Math.PI / 2));
      surgery_toolsMesh.checkCollisions = true;
    }
  });

  // 수술대 위치
  const desiredOperatingWorldPos = new BABYLON.Vector3(6.8, 6.43, 12.67);
  const operating = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "operating_table.glb", scene);
  operating.meshes.forEach((operatingMesh) => {
    if (operatingMesh.name !== "__root__") {
      operatingMesh.parent = parentMesh;
      operatingMesh.position = BABYLON.Vector3.TransformCoordinates(
        desiredOperatingWorldPos,
        BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
      );
      operatingMesh.scaling = new BABYLON.Vector3(20, 20, 20);
      operatingMesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
        .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, -Math.PI / 2));
      operatingMesh.checkCollisions = true;
    }
  });

  // --- 냉장고 위치 및 배치 ---
  const old_fridgeWorldPos = new BABYLON.Vector3(11.20, 6.15, 14.5);
  const old_fridgeResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "low_poly_old_rusty_fridge_-_game_ready.glb", scene);

  let rootFridgeMesh = null;
  rootFridgeMesh = old_fridgeResult.meshes.find(mesh => mesh.name === "__root__");

  if (!rootFridgeMesh) {
    rootFridgeMesh = old_fridgeResult.meshes[0];
  }

  old_fridgeResult.animationGroups.forEach(ag => {
    ag.stop();
  });

  if (rootFridgeMesh) {
    rootFridgeMesh.parent = parentMesh;
    rootFridgeMesh.position = BABYLON.Vector3.TransformCoordinates(
      old_fridgeWorldPos,
      BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
    );

    rootFridgeMesh.scaling = new BABYLON.Vector3(17, 17, 17);

    rootFridgeMesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
      .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, -Math.PI / 2));

    old_fridgeResult.meshes.forEach((mesh) => {
      if (mesh !== rootFridgeMesh) {
        mesh.checkCollisions = true;
        mesh.isPickable = true;
      }
    });
    rootFridgeMesh.checkCollisions = true;
  }

  let door6Mesh = old_fridgeResult.meshes.find(mesh => mesh.name === "Object_6");
  let isDoor6Open = false;

  let door8Mesh = old_fridgeResult.meshes.find(mesh => mesh.name === "Object_8");
  let isDoor8Open = false;

  const closedRotation6 = door6Mesh ? door6Mesh.rotationQuaternion.clone() : BABYLON.Quaternion.Identity();
  const openRotation6 = closedRotation6.multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2));

  const closedRotation8 = door8Mesh ? door8Mesh.rotationQuaternion.clone() : BABYLON.Quaternion.Identity();
  const openRotation8 = closedRotation8.multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2));

  if (door6Mesh) {
    door6Mesh.rotationQuaternion = closedRotation6.clone();

    const openAnim6 = new BABYLON.Animation("fridgeDoorOpen_Object6", "rotationQuaternion", 30, BABYLON.Animation.ANIMATIONTYPE_QUATERNION, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    openAnim6.setKeys([
      { frame: 0, value: closedRotation6 },
      { frame: 30, value: openRotation6 }
    ]);

    const closeAnim6 = new BABYLON.Animation("fridgeDoorClose_Object6", "rotationQuaternion", 30, BABYLON.Animation.ANIMATIONTYPE_QUATERNION, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    closeAnim6.setKeys([
      { frame: 0, value: openRotation6 },
      { frame: 30, value: closedRotation6 }
    ]);

    door6Mesh.actionManager = new BABYLON.ActionManager(scene);
    door6Mesh.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function () {
        scene.stopAnimation(door6Mesh);

        if (!isDoor6Open) {
          scene.beginDirectAnimation(door6Mesh, [openAnim6], 0, 30, false);
        } else {
          scene.beginDirectAnimation(door6Mesh, [closeAnim6], 0, 30, false);
        }
        isDoor6Open = !isDoor6Open;
      })
    );
  }

  if (door8Mesh) {
    door8Mesh.rotationQuaternion = closedRotation8.clone();

    const openAnim8 = new BABYLON.Animation("fridgeDoorOpen_Object8", "rotationQuaternion", 30, BABYLON.Animation.ANIMATIONTYPE_QUATERNION, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    openAnim8.setKeys([
      { frame: 0, value: closedRotation8 },
      { frame: 30, value: openRotation8 }
    ]);

    const closeAnim8 = new BABYLON.Animation("fridgeDoorClose_Object8", "rotationQuaternion", 30, BABYLON.Animation.ANIMATIONTYPE_QUATERNION, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    closeAnim8.setKeys([
      { frame: 0, value: openRotation8 },
      { frame: 30, value: closedRotation8 }
    ]);

    door8Mesh.actionManager = new BABYLON.ActionManager(scene);
    door8Mesh.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function () {
        scene.stopAnimation(door8Mesh);

        if (!isDoor8Open) {
          scene.beginDirectAnimation(door8Mesh, [openAnim8], 0, 30, false);
        } else {
          scene.beginDirectAnimation(door8Mesh, [closeAnim8], 0, 30, false);
        }
        isDoor8Open = !isDoor8Open;
      })
    );
  }
  // --- 냉장고 위치 및 배치 끝 ---
}