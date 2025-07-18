// import * as BABYLON from "@babylonjs/core";

// /**
//  * 카메라와 계단 메쉬의 상호작용을 처리하는 함수
//  * @param {BABYLON.UniversalCamera} camera - 플레이어 카메라
//  * @param {BABYLON.AbstractMesh} stairsMesh - 계단 메쉬
//  * @param {Object} keysPressed - 현재 눌린 키 상태 (예: { "w": true, "s": false })
//  * @param {boolean} isOnStairs - 현재 카메라가 계단 위에 있는지 여부
//  * @param {Function} setIsOnStairs - isOnStairs 상태를 업데이트하는 함수 (예: React의 useState 셋터 함수)
//  */
// export function handleStairsMovement(camera, stairsMesh, keysPressed, isOnStairs, setIsOnStairs) {
//   // 계단 메쉬가 없으면 함수를 즉시 종료합니다.
//   if (!stairsMesh) return;

//   // 계단 상단과 하단의 월드 좌표를 정의합니다.
//   // 이 좌표는 카메라가 계단 끝에 도달했을 때 위치를 조정하는 데 사용됩니다.
//   const stairsTop = new BABYLON.Vector3(-33.49, 14.13, -0.02);
//   const stairsBottom = new BABYLON.Vector3(-33.49, 2.32, -0.02);

//   // 계단 메쉬의 바운딩 박스(Bounding Box) 정보를 가져옵니다.
//   // 바운딩 박스는 3D 객체를 감싸는 가상의 직육면체로, 충돌 감지나 영역 판단에 사용됩니다.
//   const boundingInfo = stairsMesh.getBoundingInfo(); // ladderMesh 대신 stairsMesh로 올바르게 참조
//   const boundingBox = boundingInfo.boundingBox;
//   const min = boundingBox.minimumWorld; // 바운딩 박스의 최소 월드 좌표
//   const max = boundingBox.maximumWorld; // 바운딩 박스의 최대 월드 좌표

//   // 카메라의 현재 위치가 계단 정의된 영역 안에 있는지 확인합니다.
//   // X, Y, Z 축에 대해 특정 범위 내에 있는지 검사합니다.
//   const isInside =
//     camera.position.x >= min.x && camera.position.x <= max.x && // 계단 X축 범위 내
//     camera.position.y >= 2.25 && camera.position.y <= 15.22 && // 계단 Y축 (높이) 범위 내
//     camera.position.z >= -0.35 && camera.position.z <= 0.7;    // 계단 Z축 범위 내

//   // 카메라가 계단 영역 안에 있을 경우
//   if (isInside) {
//     // 계단 처음 진입하는 경우
//     if (!isOnStairs) {
//       setIsOnStairs(true); // 계단 위에 있음을 상태로 설정
//       camera.applyGravity = false; // 중력 적용을 비활성화하여 카메라가 떨어지지 않도록 함
//       camera.position.x = -33.49; // 계단 위에서 X 좌표 고정
//       camera.position.z = -0.02; // 계단 위에서 Z 좌표 고정
//     }

//     // 'W' 키가 눌렸을 때 (계단 위로 올라가기)
//     if (keysPressed["w"]) {
//       camera.rotation.x = -1.21; // 카메라 회전 (위로 올려다보는 듯한 시점)
//       camera.rotation.y = -0.11; // 카메라 회전 (약간의 좌우 조정)
//       camera.position.y += 0.05; // 카메라 Y 좌표를 증가시켜 위로 이동

//       // 카메라가 계단 상단에 도달했을 때
//       if (camera.position.y >= 14.13) {
//         const offset = new BABYLON.Vector3(0, 0, 0.5); // 계단 상단에서 벗어날 Z축 오프셋
//         const adjustedPos = stairsTop.add(offset); // 상단 좌표에 오프셋을 더하여 조정된 위치 계산
//         camera.position.x = adjustedPos.x; // 조정된 X 좌표로 이동
//         camera.position.z = adjustedPos.z; // 조정된 Z 좌표로 이동
//         camera.rotation.x = -0.024; // 카메라 회전을 일반적인 평면 시점으로 재설정
//         camera.rotation.y = -0.003; // 카메라 회전을 일반적인 평면 시점으로 재설정
//       }
//     } 
//     // 'S' 키가 눌렸을 때 (계단 아래로 내려가기)
//     else if (keysPressed["s"]) {
//       camera.rotation.x = 1.48; // 카메라 회전 (아래로 내려다보는 듯한 시점)
//       camera.rotation.y = 0.26; // 카메라 회전 (약간의 좌우 조정)
//       camera.position.y -= 0.15; // 카메라 Y 좌표를 감소시켜 아래로 이동

//       // 카메라가 계단 하단에 도달했을 때
//       if (camera.position.y <= 2.32) {
//         const offset = new BABYLON.Vector3(0, 0, -0.5); // 계단 하단에서 벗어날 Z축 오프셋
//         const adjustedPos = stairsBottom.add(offset); // 하단 좌표에 오프셋을 더하여 조정된 위치 계산
//         camera.position.x = adjustedPos.x; // 조정된 X 좌표로 이동
//         camera.position.z = adjustedPos.z; // 조정된 Z 좌표로 이동
//         camera.rotation.x = -0.024; // 카메라 회전을 일반적인 평면 시점으로 재설정
//         camera.rotation.y = -0.003; // 카메라 회전을 일반적인 평면 시점으로 재설정
//       }
//     }
//   } 
//   // 카메라가 계단 영역 밖에 있을 경우
//   else {
//     // 계단 위에 있다가 방금 벗어난 경우
//     if (isOnStairs) {
//       setIsOnStairs(false); // 계단 위에 있지 않음을 상태로 설정
//       camera.applyGravity = true; // 중력 적용을 다시 활성화하여 정상적인 물리적 움직임을 허용
//     }
//   }
// }