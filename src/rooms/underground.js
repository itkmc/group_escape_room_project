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
    new BABYLON.Vector3(16.3, 6.4, 7.8)
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

  // toggleDoor를 외부에서 쓸 수 있게 반환
  return { toggleDoor };
}