// ladder.js
import * as BABYLON from "@babylonjs/core";

/**
 * 카메라와 사다리 메쉬의 상호작용을 처리하는 함수
 * @param {BABYLON.UniversalCamera} camera - 플레이어 카메라
 * @param {BABYLON.AbstractMesh} ladderMesh - 사다리 메쉬
 * @param {Object} keysPressed - 현재 눌린 키 상태
 * @param {boolean} isOnLadder - 현재 사다리 위에 있는지 여부
 * @param {Function} setIsOnLadder - 상태 업데이트 함수
 */
export function handleLadderMovement(camera, ladderMesh, keysPressed, isOnLadder, setIsOnLadder) {
  if (!ladderMesh) return;

  const ladderTop = new BABYLON.Vector3(-33.49, 14.13, -0.02);
  const ladderBottom = new BABYLON.Vector3(-33.49, 2.32, -0.02);

  const boundingInfo = ladderMesh.getBoundingInfo();
  const boundingBox = boundingInfo.boundingBox;
  const min = boundingBox.minimumWorld;
  const max = boundingBox.maximumWorld;

  const isInside =
    camera.position.x >= min.x && camera.position.x <= max.x &&
    camera.position.y >= 2.25 && camera.position.y <= 16.22 &&
    camera.position.z >= -0.35 && camera.position.z <= 0.7;

  if (isInside) {
    if (!isOnLadder) {
      setIsOnLadder(true);
      camera.applyGravity = false;
      camera.position.x = -33.49;
      camera.position.z = -0.02;
    }
 camera.speed = 0;
    if (keysPressed["w"]) {
      camera.rotation.x = -1.21;
      camera.rotation.y = -0.11;
      camera.position.y += 0.15;

      if (camera.position.y >= 14.13) {
        const offset = new BABYLON.Vector3(0, 0, 1.0);
        const adjustedPos = ladderTop.add(offset);
        camera.position.x = adjustedPos.x;
        camera.position.z = adjustedPos.z;
        camera.rotation.x = -0.024;
        camera.rotation.y = -0.003;
      }
    } else if (keysPressed["s"]) {
      camera.rotation.x = 1.48;
      camera.rotation.y = 0.26;
      camera.position.y -= 0.15;

      if (camera.position.y <= 2.32) {
        const offset = new BABYLON.Vector3(0, 0, -0.5);
        const adjustedPos = ladderBottom.add(offset);
        camera.position.x = adjustedPos.x;
        camera.position.z = adjustedPos.z;
        camera.rotation.x = -0.024;
        camera.rotation.y = -0.003;
      }
    }
  } else {
    if (isOnLadder) {
      setIsOnLadder(false);
      camera.applyGravity = true;
    }
  }
}