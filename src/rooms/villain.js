// villain.js
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";

/**
 * @param {BABYLON.Scene} scene 
 * @param {BABYLON.AbstractMesh} parentMesh 
 */

export async function addVillain(scene, parentMesh) {
    if (!parentMesh) {
        console.warn("❗ parentMesh가 없습니다. Villain 오브젝트를 로드할 수 없습니다.");
        return;
    }

    // 빌런 모델을 배치할 월드 좌표
    const villainWorldPos = new BABYLON.Vector3(0.02, 7.35, -13.60); // 예시 위치, 필요에 따라 조정하세요.

    try {
        console.log("🛠️ Villain 모델 (horror_xqc.glb) 로드 시작...");
        const villainResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "horror_xqc.glb", scene);

        if (villainResult && villainResult.meshes && villainResult.meshes.length > 0) {
            const rootVillainMesh = villainResult.meshes[0]; // 보통 __root__ 또는 첫 번째 메쉬가 전체 모델의 부모
            
            // parentMesh의 로컬 공간으로 변환하여 배치
            rootVillainMesh.parent = parentMesh;
            rootVillainMesh.position = BABYLON.Vector3.TransformCoordinates(
                villainWorldPos,
                BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
            );

            // 모델의 크기 조절 (필요에 따라 조절)
            rootVillainMesh.scaling = new BABYLON.Vector3(30, 30, 30); // 예시 스케일, 모델에 따라 크게 또는 작게 조절

            // 모델의 초기 회전 조절 (필요에 따라 조절)
            // 예를 들어, Y축으로 180도 회전하여 플레이어를 바라보게 할 수 있습니다.
            rootVillainMesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, Math.PI)
            .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI /2)); 

            // 모든 자식 메쉬에 대해 충돌 감지 및 가시성 설정
            villainResult.meshes.forEach(mesh => {
                mesh.checkCollisions = true; // 빌런과의 충돌 감지 여부
                mesh.isVisible = true; // 모델이 보이도록 설정
                mesh.isPickable = false; // 빌런은 클릭 대상이 아니라고 가정 (필요시 true로 변경)
                // console.log(`Villain Mesh: ${mesh.name}, isVisible: ${mesh.isVisible}, isPickable: ${mesh.isPickable}`);
            });

            // 모델에 애니메이션이 있다면, 필요한 애니메이션을 재생하거나 멈출 수 있습니다.
            if (villainResult.animationGroups && villainResult.animationGroups.length > 0) {
                console.log(`Villain 모델에 ${villainResult.animationGroups.length}개의 애니메이션 그룹이 있습니다.`);
                // 기본적으로 첫 번째 애니메이션 그룹을 재생하거나 모두 멈출 수 있습니다.
                // villainResult.animationGroups[0].play(true); // 반복 재생
                villainResult.animationGroups.forEach(ag => ag.stop()); // 모든 애니메이션 멈춤 (기본)
            }

            return rootVillainMesh; // 로드된 빌런의 루트 메쉬 반환
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
}