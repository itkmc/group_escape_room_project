// // stairs.js (개선 제안)
// import * as BABYLON from "@babylonjs/core";

// /**
//  * 카메라와 계단 메쉬의 상호작용을 처리하는 함수
//  * @param {BABYLON.UniversalCamera} camera - 플레이어 카메라
//  * @param {BABYLON.AbstractMesh} stairsMesh - 계단 메쉬
//  * @param {Object} keysPressed - 현재 눌린 키 상태 (예: { "w": true, "s": false })
//  * @param {boolean} isOnStairs - 현재 카메라가 계단 위에 있는지 여부
//  * @param {Function} setIsOnStairs - isOnStairs 상태를 업데이트하는 함수 (예: React의 useState 셋터 함수)
//  * @param {BABYLON.Scene} scene - Babylon.js Scene 객체 (델타 타임 사용을 위해 추가)
//  */
// export function handleStairsMovement(camera, stairsMesh, keysPressed, isOnStairs, setIsOnStairs, scene) {
//     if (!stairsMesh || !scene) return;

//     // 계단 상단과 하단의 월드 좌표 (이 값들은 실제 계단 모델의 정확한 시작점/끝점을 나타내야 합니다)
//     // 계단 모델의 월드 좌표를 다시 한번 확인하여 정확하게 설정하는 것이 중요합니다.
//     // 예를 들어, 계단 메쉬의 바운딩 박스 하단 중심과 상단 중심을 활용할 수도 있습니다.
//     // 임의의 값:
//     const stairsTopY = 7.85; // 계단 맨 위 평평한 부분의 Y 좌표
//     const stairsBottomY = 2.73; // 계단 맨 아래 평평한 부분의 Y 좌표

//     // 계단 폭과 깊이 (대략적인 값, 카메라가 계단 옆으로 벗어나지 않도록 고정할 X, Z 범위)
//     // 이미지상 계단 폭이 좁은 편이므로 X와 Z는 일정 범위로 유지하는 것이 좋습니다.
//     const fixedStairsX = -33.49; // 계단 중앙 X 좌표
//     const fixedStairsZ = -0.02; // 계단 중앙 Z 좌표

//     // 카메라가 계단 영역 안에 있는지 확인하는 조건 개선
//     // 카메라의 X, Z 위치가 계단 폭/깊이 범위 내에 있고, Y 위치가 계단 높이 범위 내에 있는지 확인
//     const isInsideStairsArea =
//         camera.position.x > (fixedStairsX - 1.0) && camera.position.x < (fixedStairsX + 1.0) && // 계단 폭 (X) 범위
//         camera.position.z > (fixedStairsZ - 1.0) && camera.position.z < (fixedStairsZ + 1.0) && // 계단 깊이 (Z) 범위
//         camera.position.y >= (stairsBottomY - 0.5) && camera.position.y <= (stairsTopY + 0.5); // 계단 전체 높이 범위 (여유값 추가)

//     const deltaTime = scene.getEngine().getDeltaTime() / 1000; // 초 단위 델타 타임
//     const moveSpeed = 1.5; // 계단을 오르내리는 속도 (조절 필요)

//     if (isInsideStairsArea) {
//         if (!isOnStairs) {
//             setIsOnStairs(true);
//             camera.applyGravity = false; // 중력 비활성화
//             // 계단 진입 시 카메라 X, Z 고정 (플레이어가 계단에서 벗어나지 않도록)
//             camera.position.x = fixedStairsX;
//             camera.position.z = fixedStairsZ;
//         }

//         if (keysPressed["w"]) {
//             // 위로 올라갈 때
//             camera.position.y += moveSpeed * deltaTime; // Y좌표를 델타 타임 기반으로 증가
//             // 계단 상단에 도달하면 Y 좌표 고정 및 계단에서 벗어날 준비
//             if (camera.position.y >= stairsTopY) {
//                 camera.position.y = stairsTopY; // 상단 Y 좌표 고정
//                 // 계단 상단에서 약간 벗어나 다음 영역으로 진입하도록 Z 좌표 조정
//                 if (camera.position.z < fixedStairsZ + 1.0) { // Z가 너무 많이 벗어나지 않도록
//                      camera.position.z += moveSpeed * deltaTime; // 앞으로 조금 더 이동
//                 }
//             }
//         } else if (keysPressed["s"]) {
//             // 아래로 내려갈 때
//             camera.position.y -= moveSpeed * deltaTime; // Y좌표를 델타 타임 기반으로 감소
//             // 계단 하단에 도달하면 Y 좌표 고정 및 계단에서 벗어날 준비
//             if (camera.position.y <= stairsBottomY) {
//                 camera.position.y = stairsBottomY; // 하단 Y 좌표 고정
//                 // 계단 하단에서 약간 벗어나 다음 영역으로 진입하도록 Z 좌표 조정
//                 if (camera.position.z > fixedStairsZ - 1.0) { // Z가 너무 많이 벗어나지 않도록
//                      camera.position.z -= moveSpeed * deltaTime; // 뒤로 조금 더 이동
//                 }
//             }
//         }
        
//         // 계단 위에서는 X, Z 축을 고정 (좌우, 앞뒤 움직임 제한)
//         camera.position.x = fixedStairsX;
//         camera.position.z = fixedStairsZ;

//         // 계단을 오르내리는 동안 카메라 시야 강제 고정/변경 제거:
//         // camera.rotation.x = ...;
//         // camera.rotation.y = ...;
//         // 이 부분은 플레이어의 마우스/입력에 따라 자유롭게 유지하는 것이 좋습니다.
//         // 필요하다면, 현재 플레이어가 바라보는 방향으로 시야를 살짝 조정하는 정도로만 사용하세요.
//         // 예를 들어:
//         // camera.rotation.x = BABYLON.Scalar.Lerp(camera.rotation.x, -0.024, 0.1); // 부드럽게 복귀
//         // camera.rotation.y = BABYLON.Scalar.Lerp(camera.rotation.y, -0.003, 0.1); // 부드럽게 복귀

//     } else {
//         // 카메라가 계단 영역 밖에 있을 경우
//         if (isOnStairs) {
//             setIsOnStairs(false); // 계단 위에 있지 않음 상태로 설정
//             camera.applyGravity = true; // 중력 다시 활성화
//             // 계단 이탈 시 카메라 위치를 계단 끝 좌표 근처로 재설정하여 다음 이동에 자연스럽게 연결
//             // 어떤 방향으로 나가는지에 따라 다르게 적용할 수 있습니다.
//             // 여기서는 임시로 계단 상단 또는 하단에 따라 위치를 조정합니다.
//             if (camera.position.y > (stairsTopY - 1.0)) { // 계단 상단에 가까웠다면
//                 camera.position.y = stairsTopY;
//                 camera.position.z = fixedStairsZ + 1.5; // 계단 위 평지로 약간 더 이동
//             } else if (camera.position.y < (stairsBottomY + 1.0)) { // 계단 하단에 가까웠다면
//                 camera.position.y = stairsBottomY;
//                 camera.position.z = fixedStairsZ - 1.5; // 계단 아래 평지로 약간 더 이동
//             }
//         }
//     }
// }