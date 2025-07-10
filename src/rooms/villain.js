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

    // --- 1. horror_xqc.glb (빌런) 모델 배치 ---
    const villainWorldPos = new BABYLON.Vector3(0.02, 7.35, -13.60); // 예시 위치, 필요에 따라 조정하세요.
    let rootVillainMesh = null;

    try {
        console.log("🛠️ Villain 모델 (horror_xqc.glb) 로드 시작...");
        const villainResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "horror_xqc.glb", scene);

        if (villainResult && villainResult.meshes && villainResult.meshes.length > 0) {
            rootVillainMesh = villainResult.meshes[0];
            
            rootVillainMesh.parent = parentMesh;
            rootVillainMesh.position = BABYLON.Vector3.TransformCoordinates(
                villainWorldPos,
                BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
            );
            rootVillainMesh.scaling = new BABYLON.Vector3(30, 30, 30);
            rootVillainMesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, Math.PI)
                .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)); 

            // for...of 루프를 사용하여 모든 자식 메쉬에 대해 설정
            for (const mesh of villainResult.meshes) {
                mesh.checkCollisions = true; // 빌런과의 충돌 감지 여부
                mesh.isVisible = true;      // 모델이 보이도록 설정
                mesh.isPickable = false;    // 빌런은 클릭 대상이 아니라고 가정 (필요시 true로 변경)
            }

            if (villainResult.animationGroups && villainResult.animationGroups.length > 0) {
                for (const ag of villainResult.animationGroups) {
                    ag.stop(); // 모든 애니메이션 멈춤 (기본)
                }
            }
        } else {
            console.warn("❗️ horror_xqc.glb에서 유효한 메쉬를 찾을 수 없습니다.");
        }
    } catch (error) {
        console.error("❌ horror_xqc.glb 로드 오류: ", error);
    }

    // --- 2. old_board.glb (오래된 판자) 모델 배치 ---
    const oldBoardWorldPos = new BABYLON.Vector3(2.55, 8.10, -10.99); // 예시 위치, 필요에 따라 조정하세요.
    try {
        console.log("🛠️ Old Board 모델 (old_board.glb) 로드 시작...");
        const boardResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "wooden_panel_board.glb", scene);

        if (boardResult && boardResult.meshes && boardResult.meshes.length > 0) {
            const rootBoardMesh = boardResult.meshes[0];

            rootBoardMesh.parent = parentMesh;
            rootBoardMesh.position = BABYLON.Vector3.TransformCoordinates(
                oldBoardWorldPos,
                BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
            );
            rootBoardMesh.scaling = new BABYLON.Vector3(30, 30, 30); // 크기 조절
            // 모델의 초기 회전 조절 (필요에 따라 조정)
            rootBoardMesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI)
                .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2));

            for (const mesh of boardResult.meshes) {
                mesh.checkCollisions = true;
                mesh.isVisible = true;
                mesh.isPickable = true; // 판자는 상호작용 가능하게 할 수도 있음
            }
        } else {
            console.warn("❗️ old_board.glb에서 유효한 메쉬를 찾을 수 없습니다.");
        }
    } catch (error) {
        console.error("❌ old_board.glb 로드 오류: ", error);
    }

    // --- 3. weapons_pack.glb (무기 팩) 모델 배치 ---
    const weaponsPackWorldPos = new BABYLON.Vector3(2.52, 8.10, -10.35); // 예시 위치, 필요에 따라 조정하세요.
    try {
        console.log("🛠️ Weapons Pack 모델 (weapons_pack.glb) 로드 시작...");
        const weaponResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "weapons_pack.glb", scene);

        if (weaponResult && weaponResult.meshes && weaponResult.meshes.length > 0) {
            const rootWeaponPackMesh = weaponResult.meshes[0];

            rootWeaponPackMesh.parent = parentMesh;
            rootWeaponPackMesh.position = BABYLON.Vector3.TransformCoordinates(
                weaponsPackWorldPos,
                BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
            );
            rootWeaponPackMesh.scaling = new BABYLON.Vector3(70, 70, 50); // 크기 조절
            // 모델의 초기 회전 조절 (필요에 따라 조정)
            rootWeaponPackMesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, -Math.PI / 2)
                .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, -Math.PI)); // 예시 회전

            for (const mesh of weaponResult.meshes) {
                mesh.checkCollisions = true;
                mesh.isVisible = true;
                mesh.isPickable = true; // 무기는 획득 가능하게 할 수도 있음
            }
        } else {
            console.warn("❗️ weapons_pack.glb에서 유효한 메쉬를 찾을 수 없습니다.");
        }
    } catch (error) {
        console.error("❌ weapons_pack.glb 로드 오류: ", error);
    }

    return rootVillainMesh; // 빌런의 루트 메쉬 반환 (필요에 따라 다른 메쉬를 반환하거나 배열로 반환할 수 있음)
}
// 잘하자