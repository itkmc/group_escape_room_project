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
    console.warn("❗ parentMesh가 없습니다.");
    return;
  }

  // 🖥️ 모니터 위치
  const desiredMonitorWorldPos = new BABYLON.Vector3(4.10, 7.85, 12.37);
  const monitor = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "monitor_with_heart_rate.glb", scene);
  monitor.meshes.forEach((monitorMesh) => {
    if (monitorMesh.name !== "__root__") {
      monitorMesh.parent = parentMesh;
      monitorMesh.position = BABYLON.Vector3.TransformCoordinates(
        desiredMonitorWorldPos,
        BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
      );
      monitorMesh.scaling = new BABYLON.Vector3(120, 100, 100);
      monitorMesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI)
        .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI));
      monitorMesh.checkCollisions = true;
    }
  });

  // 🛏️ 수술대 위치
  const desiredOperatingWorldPos = new BABYLON.Vector3(10, 6.25, 12.37);
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

  // 🔐 사물함 위치 및 클릭 애니메이션
  const desiredlockerWorldPos = new BABYLON.Vector3(11.33, 7.15, 14.99);
  const locker = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "armored_cabinet (1).glb", scene);
  const clickableNames = ["Object_15", "Object_13", "Object_17", "Object_9", "Object_7"];
  const animationGroup = locker.animationGroups?.find(group => group.targetedAnimations.length > 0);

  locker.meshes.forEach((lockerMesh) => {
    if (lockerMesh.name !== "__root__") {
      lockerMesh.parent = parentMesh;
      let localPos = BABYLON.Vector3.TransformCoordinates(
        desiredlockerWorldPos,
        BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
      );

      if (clickableNames.includes(lockerMesh.name)) {
        localPos.z -= 100;
        console.log(`${lockerMesh.name} 위치 조정됨 (z -= 100):`, localPos);
      }

      lockerMesh.position = localPos;
      lockerMesh.scaling = new BABYLON.Vector3(110, 110, 110);
      lockerMesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
        .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2));
      lockerMesh.checkCollisions = true;
      lockerMesh.isPickable = true;
    }
  });

  if (animationGroup) {
    animationGroup.stop(); // 초기엔 멈춤
  } else {
    console.warn("애니메이션 그룹을 찾지 못했습니다.");
  }

  // 클릭 이벤트 처리
  scene.onPointerObservable.add((pointerInfo) => {
    if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERPICK) {
      const pickedMesh = pointerInfo.pickInfo?.pickedMesh;
      console.log("pickedMesh:", pickedMesh?.name);
      if (pickedMesh && clickableNames.includes(pickedMesh.name)) {
        console.log(`${pickedMesh.name} 클릭됨 - 애니메이션 재생`);
        animationGroup?.reset();
        animationGroup?.play(false);
      }
    }
  });
}
