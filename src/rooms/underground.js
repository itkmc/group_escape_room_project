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

  const door2 = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "low_poly_door_-_game_ready.glb", scene);
  door2.meshes.forEach((mesh) => {
    if (mesh.name !== "__root__") {
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
    }
  });

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