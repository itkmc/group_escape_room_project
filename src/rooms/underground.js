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
  
  // 지연 로딩을 위한 변수들
  let modelsLoaded = false;
  let loadingInProgress = false;
  const loadDistance = 25;   // 이 거리 이내면 로드
  const disposeDistance = 40; // 이 거리 이상이면 dispose
  const undergroundCenter = new BABYLON.Vector3(20, 6, 5); // underground 방의 중심점
  let loadedMeshes = [];

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

  // underground 모델 로드 함수
  const loadUndergroundModelsIfNeeded = async () => {
    if (modelsLoaded || loadingInProgress) return;
    loadingInProgress = true;
    try {
      // --- 예시: 시신 모델 ---
      const bodyBagPositions = [new BABYLON.Vector3(14.5, 6.03, 2)];
      for (const pos of bodyBagPositions) {
        const result = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "smartinius_body_bag_3d_asset.glb", scene);
        result.meshes.forEach(m => {
          if (m.name !== "__root__") {
            m.parent = parentMesh;
            m.position = BABYLON.Vector3.TransformCoordinates(pos, BABYLON.Matrix.Invert(parentMesh.getWorldMatrix()));
            m.scaling = new BABYLON.Vector3(0.8, 0.8, 0.8);
            m.checkCollisions = true;
            loadedMeshes.push(m);
          }
        });
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
          loadedMeshes.push(root);
        }
      }

      // 미라
      const mummyBodyPositions = [
        new BABYLON.Vector3(15.55, 6, 5.08)
      ];
      for (const pos of mummyBodyPositions) {
        const result = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "zombie_smoke_mummy_character_12_mb.glb", scene);
        console.log("zombie_smoke_mummy_character_12_mb.glb 로드됨:", result.meshes.map(m => m.name));
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
          console.log("zombie_smoke_mummy_character __root__ 배치:", {
            position: root.position,
            scaling: root.scaling
          });
          loadedMeshes.push(root);
        }
      }


   
      // 시체 서랍
      const morgueBodyPositions = [
        new BABYLON.Vector3(16.3, 6.4, 8.1)
      ];
      for (const pos of morgueBodyPositions) {
        const result = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "morgue_refrigerator-12mb.glb", scene);
        console.log("시체서랍 로드됨:", result.meshes.map(m => m.name));
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
          console.log("morgue_refrigerator __root__ 배치:", {
            position: root.position,
            scaling: root.scaling
          });
          loadedMeshes.push(root);
        }
      }
      
      // 시체 table
      const tableBodyPositions = [
        new BABYLON.Vector3(16.3, 6, 3.9)
      ];
      for (const pos of tableBodyPositions) {
        const result = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "autopsy_table.glb", scene);
        console.log("시체테이블 로드됨:", result.meshes.map(m => m.name));
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
          console.log("autopsy_table __root__ 배치:", {
            position: root.position,
            scaling: root.scaling
          });
          loadedMeshes.push(root);
        }
      }

      // EXIT
      const exitBodyPositions = [
        new BABYLON.Vector3(36.67, 8, 6.2)
      ];
      for (const pos of exitBodyPositions) {
        const result = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "exit_sign.glb", scene);
        console.log("exit_sign.glb 로드됨:", result.meshes.map(m => m.name));
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
          console.log("exit_sign __root__ 배치:", {
            position: root.position,
            scaling: root.scaling
          });
          loadedMeshes.push(root);
        }
      }

      // 해골
      const skullBodyPositions = [
        new BABYLON.Vector3(17.68, 7, 1.6)
      ];
      for (const pos of skullBodyPositions) {
        const result = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "skull_sculpture_two.glb", scene);
        console.log("skull_sculpture_two.glb 로드됨:", result.meshes.map(m => m.name));
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
          console.log("skull_sculpture_two __root__ 배치:", {
            position: root.position,
            scaling: root.scaling
          });
          loadedMeshes.push(root);
        }
      }

      modelsLoaded = true;
      console.log("underground 모델 로드 완료");
    } catch (error) {
      console.error("지연 로딩 중 오류 발생:", error);
    } finally {
      loadingInProgress = false;
    }
  };

  // underground 모델 dispose 함수
  const disposeUndergroundModelsIfLoaded = () => {
    if (!modelsLoaded) return;
    loadedMeshes.forEach(m => m.dispose());
    loadedMeshes = [];
    modelsLoaded = false;
    console.log("underground 모델 dispose 완료");
  };

  // 카메라 거리 체크 및 동적 로드/언로드
  scene.registerBeforeRender(() => {
    const camera = scene.activeCamera;
    if (!camera) return;
    const distance = BABYLON.Vector3.Distance(camera.position, undergroundCenter);
    if (distance <= loadDistance) {
      loadUndergroundModelsIfNeeded();
    } else if (distance > disposeDistance) {
      disposeUndergroundModelsIfLoaded();
    }
  });

  // 문 열기/닫기 애니메이션 함수
  const toggleDoor = () => {
    // 한 번이라도 열렸으면 isUnlocked = true
    if (!isUnlocked) {
      if (!getHasIdCardItem || !getHasIdCardItem()) {
        if (onDoorInteraction) onDoorInteraction("문이 잠겨있습니다!");
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

  // 클릭으로 문 열기/닫기 함수 (한 번 열린 후에만 사용 가능)
  const handleDoorClick = () => {
    if (!isUnlocked) {
      if (onDoorInteraction) onDoorInteraction("문이 잠겨있습니다!");
      return;
    }
    toggleDoor();
  };

  // 모든 doorMeshes에 클릭 이벤트 등록
  doorMeshes.forEach((mesh) => {
    mesh.isPickable = true;
    mesh.actionManager = new BABYLON.ActionManager(scene);
    mesh.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnPickTrigger,
        () => handleDoorClick()
      )
    );
  });

  // toggleDoor를 외부에서 쓸 수 있게 반환 (E키용)
  return { toggleDoor };
}