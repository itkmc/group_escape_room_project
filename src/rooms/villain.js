// villain.js
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";

/**
 * @param {BABYLON.Scene} scene
 * @param {BABYLON.AbstractMesh} parentMesh
 * @param {function(): boolean} hasKeyItemFn - (사용되지 않음) 플레이어가 열쇠 아이템을 가지고 있는지 확인하는 함수
 * @returns {Promise<BABYLON.AbstractMesh | undefined>} 빌런의 루트 메쉬를 반환 (또는 다른 중요한 메쉬)
 */
export async function addVillain(scene, parentMesh, hasKeyItemFn) {
    if (!parentMesh) {
        console.warn("❗ parentMesh가 없습니다. 오브젝트를 로드할 수 없습니다.");
        return;
    }

    //보드 위치
//     const boardWorldPos = new BABYLON.Vector3(-2.435, 7.85, -11);
//     const board = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "ssss.glb", scene);

//     for (const mesh of board.meshes) {
//         if (mesh.name !== "__root__") {
//             mesh.parent = parentMesh;
//             mesh.position = BABYLON.Vector3.TransformCoordinates(
//                 boardWorldPos,
//                 BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
//             );
//             mesh.scaling = new BABYLON.Vector3(2, 2, 2);
//             mesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
//                 .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, -Math.PI / 2.1));
//             mesh.checkCollisions = true;
//         }
//     }


//     // --- 1. horror_xqc.glb (빌런) 모델 배치 ---
//     const villainWorldPos = new BABYLON.Vector3(0.02, 7.35, -13.60); // 예시 위치, 필요에 따라 조정하세요.
//     let rootVillainMesh = null;

//     try {
//         const villainResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "horror_xqc.glb", scene);

//         if (villainResult && villainResult.meshes && villainResult.meshes.length > 0) {
//             rootVillainMesh = villainResult.meshes[0];

//             rootVillainMesh.parent = parentMesh;
//             rootVillainMesh.position = BABYLON.Vector3.TransformCoordinates(
//                 villainWorldPos,
//                 BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
//             );
//             rootVillainMesh.scaling = new BABYLON.Vector3(30, 30, 30);
//             rootVillainMesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, Math.PI)
//                 .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2));

//             // for...of 루프를 사용하여 모든 자식 메쉬에 대해 설정
//             for (const mesh of villainResult.meshes) {
//                 mesh.checkCollisions = true; // 빌런과의 충돌 감지 여부
//                 mesh.isVisible = true;      // 모델이 보이도록 설정
//                 mesh.isPickable = false;    // 빌런은 클릭 대상이 아니라고 가정 (필요시 true로 변경)
//             }

//             if (villainResult.animationGroups && villainResult.animationGroups.length > 0) {
//                 for (const ag of villainResult.animationGroups) {
//                     ag.stop(); // 모든 애니메이션 멈춤 (기본)
//                 }
//             }
//         }
//     } catch (error) {
//         console.error("❌ horror_xqc.glb 로드 오류: ", error);
//     }

//     // --- NEW ADDITION: walk.glb (캐릭터) 모델 배치 ---
//     const walkCharWorldPos = new BABYLON.Vector3(1.0, 7.35, -12.0); // 원하는 위치로 조정하세요.
//     let rootWalkCharMesh = null; // walk.glb의 루트 메쉬를 저장할 변수

//     try {
//         // walk.glb 파일을 로드합니다.
//         const walkCharResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "walk.glb", scene);

//         if (walkCharResult && walkCharResult.meshes && walkCharResult.meshes.length > 0) {
//             // walk.glb의 첫 번째 메쉬를 루트 메쉬로 가정합니다.
//             rootWalkCharMesh = walkCharResult.meshes[0];

//             // 부모 설정 및 위치 변환 (villain과 유사하게)
//             rootWalkCharMesh.parent = parentMesh;
//             rootWalkCharMesh.position = BABYLON.Vector3.TransformCoordinates(
//                 walkCharWorldPos,
//                 BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
//             );

//             // 스케일 조정 (필요에 따라 조절하세요. horror_xqc가 30이었으니 비슷하게 시작해볼 수 있습니다.)
//             rootWalkCharMesh.scaling = new BABYLON.Vector3(100, 100, 100);

//             // 회전 조정 (필요에 따라 조절하세요. 캐릭터가 올바른 방향을 바라보도록)
//             // 예를 들어, Mixamo에서 가져온 모델은 X축으로 90도 회전이 필요할 수 있습니다.
//             // 그리고 Y축으로 회전하여 원하는 방향을 보게 할 수 있습니다.
//             rootWalkCharMesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2);
//             // .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI)); // 필요하다면 Y축 180도 회전 예시

//             // 모든 자식 메쉬에 대해 속성 설정
//             for (const mesh of walkCharResult.meshes) {
//                 mesh.checkCollisions = true;
//                 mesh.isVisible = true;
//                 mesh.isPickable = true; // 이 캐릭터는 상호작용 가능하게 할 수도 있습니다.
//             }

//             // walk.glb에 애니메이션 그룹이 있다면 재생 또는 멈춤 설정
//             if (walkCharResult.animationGroups && walkCharResult.animationGroups.length > 0) {
//                 // 첫 번째 애니메이션 그룹 재생 (예시)
//                 walkCharResult.animationGroups[1].start(true); // true는 반복 재생 (loop)
//                 console.log("walk.glb 애니메이션 시작: ", walkCharResult.animationGroups[0].name);

//                 // 만약 모든 애니메이션을 멈추고 싶다면 (horror_xqc.glb처럼)
//                 // for (const ag of walkCharResult.animationGroups) {
//                 //     ag.stop();
//                 // }
//             }
//         }
//     } catch (error) {
//         console.error("❌ walk.glb 로드 오류: ", error);
//     }

//     // 문
//     const door2Result = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "door_wood.glb", scene);

//     let frame2Mesh = null;
//     let door2Mesh = null;
//     let handle2Mesh = null;

//     door2Result.meshes.forEach((mesh) => {
//         if (mesh.name === "DoorFrame_MAT_Door_0") {
//             frame2Mesh = mesh;
//         }
//         if (mesh.name === "Door_MAT_Door_0") {
//             door2Mesh = mesh;
//         }
//         if (mesh.name === "Handle_Back_MAT_Handle_0") {
//             handle2Mesh = mesh;
//         }
//     });

//     if (frame2Mesh && door2Mesh) {
//         // 전체 문 어셈블리의 부모 역할을 할 TransformNode 생성
//         const door2Group = new BABYLON.TransformNode("doorGroup", scene);
//         door2Group.parent = parentMesh;
//         door2Group.position = BABYLON.Vector3.TransformCoordinates(
//             new BABYLON.Vector3(-2.5, 8, -10.27),

//             BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
//         );
//         door2Group.scaling = new BABYLON.Vector3(178, 140, 150);
//         door2Group.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, Math.PI)
//             .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, Math.PI / 2));

//         // 문짝을 doorGroup에 직접 붙임
//         door2Mesh.parent = door2Group;
//         door2Mesh.position = BABYLON.Vector3.Zero();
//         door2Mesh.scaling = new BABYLON.Vector3(1, 1, 1);
//         door2Mesh.rotationQuaternion = null;
//         door2Mesh.isPickable = true;
//         door2Mesh.checkCollisions = true;
//         // 피벗을 z축 한쪽 끝으로 미세 조정 (닫힐 때 항상 같은 자리)
//         door2Mesh.setPivotPoint(new BABYLON.Vector3(0, 0, -1.05));

//         if (handle2Mesh) {
//             handle2Mesh.parent = door2Mesh;
//             handle2Mesh.position = BABYLON.Vector3.Zero();
//             handle2Mesh.scaling = new BABYLON.Vector3(0, 0, 1);
//             handle2Mesh.rotationQuaternion = BABYLON.Quaternion.Identity();
//             handle2Mesh.checkCollisions = true;
//         }

//         // 쿼터니언 회전 애니메이션(열림/닫힘)
//         const startRotation = BABYLON.Quaternion.Identity();
//         const openAngle = Math.PI / 2;
//         const endRotation = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, openAngle).multiply(startRotation);

//         const openAnim = new BABYLON.Animation(
//             "doorOpen",
//             "rotationQuaternion",
//             30,
//             BABYLON.Animation.ANIMATIONTYPE_QUATERNION,
//             BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
//         );
//         openAnim.setKeys([
//             { frame: 0, value: startRotation },
//             { frame: 30, value: endRotation },
//         ]);

//         const closeAnim = new BABYLON.Animation(
//             "doorClose",
//             "rotationQuaternion",
//             30,
//             BABYLON.Animation.ANIMATIONTYPE_QUATERNION,
//             BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
//         );
//         closeAnim.setKeys([
//             { frame: 0, value: endRotation },
//             { frame: 30, value: startRotation },
//         ]);

//         let isDoorOpen = false;
//         let isAnimating = false;

//         door2Mesh.actionManager = new BABYLON.ActionManager(scene);
//         door2Mesh.actionManager.registerAction(
//             new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function () {
//                 if (isAnimating) return;
//                 isAnimating = true;
//                 if (!isDoorOpen) {
//                     scene.beginDirectAnimation(door2Mesh, [openAnim], 0, 30, false, 1.0, () => {
//                         isDoorOpen = true;
//                         isAnimating = false;
//                     });
//                 } else {
//                     scene.beginDirectAnimation(door2Mesh, [closeAnim], 0, 30, false, 1.0, () => {
//                         isDoorOpen = false;
//                         isAnimating = false;
//                     });
//                 }
//             })
//         );

//     }

//     // --- 3. old_board.glb (오래된 판자) 모델 배치 (첫 번째 인스턴스) ---
//     const oldBoardWorldPos = new BABYLON.Vector3(2.55, 8.10, -10.35); // 예시 위치, 필요에 따라 조정하세요.
//     try {
//         const boardResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "wooden_panel_board.glb", scene);

//         if (boardResult && boardResult.meshes && boardResult.meshes.length > 0) {
//             const rootBoardMesh = boardResult.meshes[0];

//             rootBoardMesh.parent = parentMesh;
//             rootBoardMesh.position = BABYLON.Vector3.TransformCoordinates(
//                 oldBoardWorldPos,
//                 BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
//             );
//             rootBoardMesh.scaling = new BABYLON.Vector3(30, 30, 30); // 크기 조절
//             // 모델의 초기 회전 조절 (필요에 따라 조정)
//             rootBoardMesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI)
//                 .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2));

//             for (const mesh of boardResult.meshes) {
//                 mesh.checkCollisions = true;
//                 mesh.isVisible = true;
//                 mesh.isPickable = true; // 판자는 상호작용 가능하게 할 수도 있음
//             }
//         }
//     } catch (error) {
//         console.error("❌ wooden_panel_board.glb 로드 오류: ", error);
//     }

//     // --- 4. old_board.glb (오래된 판자) 모델 배치 (두 번째 인스턴스) ---
//     const oldBoardWorldPos2 = new BABYLON.Vector3(2.55, 8.10, -12.55); // 두 번째 판자의 예시 위치, 필요에 따라 조정하세요.
//     try {
//         const boardResult2 = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "wooden_panel_board.glb", scene);

//         if (boardResult2 && boardResult2.meshes && boardResult2.meshes.length > 0) {
//             const rootBoardMesh2 = boardResult2.meshes[0];

//             rootBoardMesh2.parent = parentMesh;
//             rootBoardMesh2.position = BABYLON.Vector3.TransformCoordinates(
//                 oldBoardWorldPos2,
//                 BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
//             );
//             rootBoardMesh2.scaling = new BABYLON.Vector3(30, 30, 30); // 크기 조절
//             // 모델의 초기 회전 조절 (필요에 따라 조정)
//             rootBoardMesh2.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI)
//                 .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2));

//             for (const mesh of boardResult2.meshes) {
//                 mesh.checkCollisions = true;
//                 mesh.isVisible = true;
//                 mesh.isPickable = true;
//             }
//         }
//     } catch (error) {
//         console.error("❌ wooden_panel_board.glb 두 번째 인스턴스 로드 오류: ", error);
//     }

//     // --- 5. old_board.glb (오래된 판자) 모델 배치 (세 번째 인스턴스) ---
//     const oldBoardWorldPos3 = new BABYLON.Vector3(2.55, 8.10, -14.75); // 세 번째 판자의 예시 위치, 필요에 따라 조정하세요.
//     try {
//         const boardResult3 = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "wooden_panel_board.glb", scene);

//         if (boardResult3 && boardResult3.meshes && boardResult3.meshes.length > 0) {
//             const rootBoardMesh3 = boardResult3.meshes[0];

//             rootBoardMesh3.parent = parentMesh;
//             rootBoardMesh3.position = BABYLON.Vector3.TransformCoordinates(
//                 oldBoardWorldPos3,
//                 BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
//             );
//             rootBoardMesh3.scaling = new BABYLON.Vector3(30, 30, 30); // 크기 조절
//             // 모델의 초기 회전 조절 (필요에 따라 조정)
//             rootBoardMesh3.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI)
//                 .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2));

//             for (const mesh of boardResult3.meshes) {
//                 mesh.checkCollisions = true;
//                 mesh.isVisible = true;
//                 mesh.isPickable = true;
//             }
//         }
//     } catch (error) {
//         console.error("❌ wooden_panel_board.glb 세 번째 인스턴스 로드 오류: ", error);
//     }

//     // --- 6. chainsaw.glb (전기톱) 모델 배치 ---
//     const chainsawWorldPos = new BABYLON.Vector3(2.35, 8.35, -9.85); // 예시 위치, 필요에 따라 조정하세요.
//     try {
//         const chainsawResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "chainsaw.glb", scene);

//         if (chainsawResult && chainsawResult.meshes && chainsawResult.meshes.length > 0) {
//             const rootChainsawMesh = chainsawResult.meshes[0];

//             rootChainsawMesh.parent = parentMesh;
//             rootChainsawMesh.position = BABYLON.Vector3.TransformCoordinates(
//                 chainsawWorldPos,
//                 BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
//             );
//             rootChainsawMesh.scaling = new BABYLON.Vector3(5, 5, 5); // 크기 조절
//             // 모델의 초기 회전 조절 (필요에 따라 조정)
//             rootChainsawMesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2);

//             for (const mesh of chainsawResult.meshes) {
//                 mesh.checkCollisions = true;
//                 mesh.isVisible = true;
//                 mesh.isPickable = true; // 무기는 획득 가능하게 할 수도 있음
//             }
//         }
//     } catch (error) {
//         console.error("❌ chainsaw.glb 로드 오류: ", error); // 콘솔 메시지 수정
//     }

//     // --- 7. baseball_bat.glb (야구 방망이) 모델 배치 ---
//     const baseballBatWorldPos = new BABYLON.Vector3(2.45, 8.10, -12.00); // 예시 위치, 필요에 따라 조정하세요.
//     try {
//         const baseballBatResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "baseball_bat.glb", scene);

//         if (baseballBatResult && baseballBatResult.meshes && baseballBatResult.meshes.length > 0) {
//             const rootBaseballBatMesh = baseballBatResult.meshes[0];

//             rootBaseballBatMesh.parent = parentMesh;
//             rootBaseballBatMesh.position = BABYLON.Vector3.TransformCoordinates(
//                 baseballBatWorldPos,
//                 BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
//             );
//             rootBaseballBatMesh.scaling = new BABYLON.Vector3(150, 150, 150); // 크기 조절
//             // 모델의 초기 회전 조절 (필요에 따라 조정)
//             rootBaseballBatMesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI)
//                 .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, -Math.PI / 4));

//             for (const mesh of baseballBatResult.meshes) {
//                 mesh.checkCollisions = true;
//                 mesh.isVisible = true;
//                 mesh.isPickable = true; // 무기는 획득 가능하게 할 수도 있음
//             }
//         }
//     } catch (error) {
//         console.error("❌ baseball_bat.glb 로드 오류: ", error);
//     }

//     // --- 8. procedural_eye.glb (눈) 모델 배치 ---
//     const eyeResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "procedural_eye.glb", scene);
//     const eyeMeshes = eyeResult.meshes.filter(mesh => mesh.name !== "__root__");

//     // 1. 이름에서 그룹 키 추출 (예: Eye_A.001)
//     function getGroupKey(name) {
//         // Eye_A.001 → Eye_A.001, Eye_Eye_0/Iris_0 → Eye_0
//         const match = name.match(/^Eye_A\.\d+/);
//         if (match) return match[0];
//         const match2 = name.match(/^Eye_(Eye|Iris)_0/);
//         if (match2) return "Eye_0";
//         return name;
//     }

//     // 2. 그룹핑
//     const eyeGroups = {};
//     for (const mesh of eyeMeshes) {
//         const key = getGroupKey(mesh.name);
//         if (!eyeGroups[key]) eyeGroups[key] = [];
//         eyeGroups[key].push(mesh);
//     }

//     // 3. 각 그룹별 TransformNode 생성 및 위치/회전/스케일 적용
//     const basePos = new BABYLON.Vector3(2.45, 8.10, -14.15);
//     const sphereRadius = 0.3;
//     const count = Object.keys(eyeGroups).length;
//     const rotationMatrix = BABYLON.Matrix.RotationX(Math.PI / 2);

//     let i = 0; // 인덱스를 수동으로 관리
//     for (const [groupKey, group] of Object.entries(eyeGroups)) {
//         const node = new BABYLON.TransformNode(`eyeGroup_${i}`, scene);

//         for (const mesh of group) {
//             mesh.parent = node;
//         }

//         // 골든 섹션 스파이럴(구 표면에 고르게 분포)
//         const phi = Math.acos(-1 + (2 * i) / (count - 1));
//         const theta = Math.PI * (1 + Math.sqrt(5)) * i;
//         let x = sphereRadius * Math.cos(theta) * Math.sin(phi);
//         let y = sphereRadius * Math.sin(theta) * Math.sin(phi);
//         let z = sphereRadius * Math.cos(phi);
//         const rotated = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(x, y, z), rotationMatrix);
//         x = basePos.x + rotated.x;
//         y = basePos.y + rotated.y;
//         z = basePos.z + rotated.z;
//         node.position = new BABYLON.Vector3(x, y, z);
//         node.scaling = new BABYLON.Vector3(0.08, 0.08, 0.08);
//         node.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, -Math.PI / 2)
//             .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 40));

//         i++; // 인덱스 증가
//     }

//     return rootVillainMesh; // 빌런의 루트 메쉬 반환 (필요에 따라 다른 메쉬를 반환하거나 배열로 반환할 수 있음)
}

