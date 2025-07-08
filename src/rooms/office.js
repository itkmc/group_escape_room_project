// office.js
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";

/**
 * 의사 사무실 구성 요소를 씬에 추가
 * @param {BABYLON.Scene} scene - Babylon.js Scene
 * @param {BABYLON.AbstractMesh} parentMesh - 병원 건물 메시 등
 */
export async function addDoctorOffice(scene, parentMesh, idCardOptions = {}, doctorOfficeOptions = {}, laboratoryCabinetOptions = {}, metalCabinetOptions = {}, metalCupboardOptions = {}) {
    if (!parentMesh) {
        console.warn("❗ parentMesh가 없습니다.");
        return;
    }

    const desiredBookcaseWorldPos = new BABYLON.Vector3(-24.05, 6.45, 11.85); // 현재 설정된 위치
    let bookCaseResult;
    try {
        bookCaseResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "wooden_book.glb", scene);
    } catch (error) {
        console.error("오류 상세: ", error);
        return;
    }

    if (!bookCaseResult || !bookCaseResult.meshes || bookCaseResult.meshes.length === 0) {
        return;
    }
    const rootBookcaseMesh = bookCaseResult.meshes[0];

    rootBookcaseMesh.parent = parentMesh;
    rootBookcaseMesh.position = BABYLON.Vector3.TransformCoordinates(
        desiredBookcaseWorldPos,
        BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
    );
    rootBookcaseMesh.scaling = new BABYLON.Vector3(100, 100, 100); // 사용자님이 설정하신 스케일 유지
    rootBookcaseMesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
        .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2));

    bookCaseResult.meshes.forEach(mesh => {
        mesh.checkCollisions = true;
        mesh.isVisible = true; // 강제로 보이게 함
    });

    const desiredTableWorldPos = new BABYLON.Vector3(-20.05, 6.37, 4.55); // 사용자님이 설정하신 위치 유지
    let tableResult;
    try {
        tableResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "long_table.glb", scene);
    } catch (error) {
        console.error("오류 상세: ", error);
        return;
    }

    if (!tableResult || !tableResult.meshes || tableResult.meshes.length === 0) {
        return;
    }

    const rootTableMesh = tableResult.meshes[0];

    rootTableMesh.parent = parentMesh;
    rootTableMesh.position = BABYLON.Vector3.TransformCoordinates(
        desiredTableWorldPos,
        BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
    );
    rootTableMesh.scaling = new BABYLON.Vector3(20, 20, 20); // 사용자님이 설정하신 스케일 유지
    rootTableMesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
        .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, 0));

    tableResult.meshes.forEach(mesh => {
        mesh.checkCollisions = true;
        mesh.isVisible = true; // 강제로 보이게 함
    });

    // --- 🪑 의자
    const chairWorldPos1 = new BABYLON.Vector3(-20.05, 6.50, 2.85); // 테이블 앞 중앙
    const chairWorldPos2 = new BABYLON.Vector3(-19.95, 6.50, 6.95); // 테이블 앞 오른쪽
    const chairWorldPos3 = new BABYLON.Vector3(-19.55, 6.50, 3.15); // 테이블 앞 왼쪽
    const chairWorldPos4 = new BABYLON.Vector3(-20.55, 6.50, 5.55); // 테이블 뒤 중앙
    const chairWorldPos5 = new BABYLON.Vector3(-20.55, 6.50, 6.15); // 테이블 뒤 오른쪽
    const chairWorldPos6 = new BABYLON.Vector3(-20.55, 6.50, 3.55); // 테이블 뒤 왼쪽

    async function loadAntiqueChair(worldPosition, parentMesh, scene, options = {}) {
        let chairResult;
        try {
            chairResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "antique_chair.glb", scene);
        } catch (error) {
            console.error("오류 상세: ", error);
            return null; // 로드 실패 시 null 반환
        }

        if (!chairResult || !chairResult.meshes || chairResult.meshes.length === 0) {
            return null;
        }

        const rootChairMesh = chairResult.meshes[0];

        rootChairMesh.parent = parentMesh;

        // 월드 위치를 부모 메쉬의 로컬 좌표로 변환하여 적용
        rootChairMesh.position = BABYLON.Vector3.TransformCoordinates(
            worldPosition,
            BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
        );

        // 스케일 적용 (옵션이 있으면 사용, 없으면 기본값)
        rootChairMesh.scaling = options.scaling || new BABYLON.Vector3(10, 10, 10);

        // 회전 적용 (옵션이 있으면 사용, 없으면 기본값)
        rootChairMesh.rotationQuaternion = options.rotation || BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
            .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI)); // 테이블을 바라보도록 180도 회전

        // 모든 자식 메쉬에 충돌 감지 및 가시성 설정
        chairResult.meshes.forEach(mesh => {
            mesh.checkCollisions = true;
            mesh.isVisible = true;
        });

        return rootChairMesh; // 생성된 루트 메쉬 반환 (필요시 추가 조작용)
    }

    // 각 의자를 로드하여 장면에 추가합니다.
    await loadAntiqueChair(chairWorldPos1, parentMesh, scene);
    await loadAntiqueChair(chairWorldPos2, parentMesh, scene, {
        rotation: BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
            .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, -Math.PI / 10))
    });
    await loadAntiqueChair(chairWorldPos3, parentMesh, scene, {
        rotation: BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
            .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2))
    });

    await loadAntiqueChair(chairWorldPos4, parentMesh, scene, {
        rotation: BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
            .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2))
    });
    
    await loadAntiqueChair(chairWorldPos5, parentMesh, scene, {
        rotation: BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
            .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, -Math.PI / 2))
    });
    
    await loadAntiqueChair(chairWorldPos6, parentMesh, scene, {
        rotation: BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
            .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, -Math.PI / 2))
    });

    // --- 🆔 ID 카드
    const defaultIdCardWorldPos = new BABYLON.Vector3(-20.50, 6.75, 5.21);
    const finalIdCardWorldPos = idCardOptions.position || defaultIdCardWorldPos;

    let idCardResult;
    try {
        idCardResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "id_card.glb", scene);
    } catch (error) {
        console.error("오류 상세: ", error);
        return;
    }

    if (!idCardResult || !idCardResult.meshes || idCardResult.meshes.length === 0) {
        return;
    }

    const rootIdCardMesh = idCardResult.meshes[0];

    rootIdCardMesh.parent = parentMesh;
    rootIdCardMesh.position = BABYLON.Vector3.TransformCoordinates(
        finalIdCardWorldPos,
        BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
    );
    rootIdCardMesh.scaling = idCardOptions.scaling || new BABYLON.Vector3(7, 7, 7);
    rootIdCardMesh.rotationQuaternion = idCardOptions.rotation || BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, -Math.PI)
        .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI));

    idCardResult.meshes.forEach(mesh => {
        mesh.checkCollisions = true;
        mesh.isVisible = true;
    });

    // --- 메탈 캐비닛
    const metalCabinetWorldPos1 = new BABYLON.Vector3(-21.85, 7.40, -2.15);
    const metalCabinetWorldPos2 = new BABYLON.Vector3(-23.25, 7.40, -2.15);

    async function loadMetalCabinet(worldPosition, parentMesh, scene, options = {}) {
        let metalCabinetResult;
        try {
            metalCabinetResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "metal_cabinet.glb", scene);
        } catch (error) {
            console.error("오류 상세: ", error);
            return null;
        }

        if (!metalCabinetResult || !metalCabinetResult.meshes || metalCabinetResult.meshes.length === 0) {
            return null;
        }

        const rootMetalCabinetMesh = metalCabinetResult.meshes[0];

        rootMetalCabinetMesh.parent = parentMesh;
        rootMetalCabinetMesh.position = BABYLON.Vector3.TransformCoordinates(
            worldPosition,
            BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
        );
        rootMetalCabinetMesh.scaling = options.scaling || new BABYLON.Vector3(130, 200, 100);
        rootMetalCabinetMesh.rotationQuaternion = options.rotation || BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
            .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 36));

        metalCabinetResult.meshes.forEach(mesh => {
            mesh.checkCollisions = true;
            mesh.isVisible = true;
        });

        return rootMetalCabinetMesh;
    }

    await loadMetalCabinet(metalCabinetWorldPos1, parentMesh, scene);
    await loadMetalCabinet(metalCabinetWorldPos2, parentMesh, scene);

    /// --- 메탈 찬장 (metal_cupboard.glb) 추가
    const metalCupboardWorldPos = new BABYLON.Vector3(-17.95, 6.40, 11.42); // 찬장의 원하는 월드 위치 설정

    async function loadMetalCupboard(worldPosition, parentMesh, scene, options = {}) {
        let metalCupboardResult;
        try {
            console.log("[Cupboard Debug] Attempting to load metal_cupboard.glb...");
            metalCupboardResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "metal_cupboard.glb", scene);
            console.log("[Cupboard Debug] metal_cupboard.glb loaded successfully.");
        } catch (error) {
            console.error("[Cupboard Debug] Error loading metal_cupboard.glb: ", error);
            return null;
        }

        if (!metalCupboardResult || !metalCupboardResult.meshes || metalCupboardResult.meshes.length === 0) {
            console.warn("[Cupboard Debug] No meshes found in metal_cupboard.glb.");
            return null;
        }

        const rootMetalCupboardMesh = metalCupboardResult.meshes[0];
        console.log(`[Cupboard Debug] Root Cupboard Mesh: ${rootMetalCupboardMesh.name}`);

        rootMetalCupboardMesh.parent = parentMesh;
        rootMetalCupboardMesh.position = BABYLON.Vector3.TransformCoordinates(
            worldPosition,
            BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
        );
        rootMetalCupboardMesh.scaling = options.scaling || new BABYLON.Vector3(0.4, 0.4, 0.4);
        rootMetalCupboardMesh.rotationQuaternion = options.rotation || BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
            .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2));

        metalCupboardResult.meshes.forEach(mesh => {
            mesh.checkCollisions = true;
            mesh.isVisible = true;
        });

        // --- 모델 로드 후, 모든 기본 애니메이션 그룹 정지 (추가된 부분!) ---
        if (metalCupboardResult.animationGroups && metalCupboardResult.animationGroups.length > 0) {
            console.log(`[Cupboard Debug] Found ${metalCupboardResult.animationGroups.length} existing animation groups. Stopping them.`);
            metalCupboardResult.animationGroups.forEach(group => {
                group.stop();
                console.log(`[Cupboard Debug] Stopped animation group: ${group.name}`);
            });
        }
        // -----------------------------------------------------------

        // --- 문 애니메이션 로직 시작 ---
        const doorMeshNames = ["cupbord_1.001_Material.001_0", "cupbord_1.002_Material.001_0"]; 
        const doorMeshes = doorMeshNames
            .map(name => metalCupboardResult.meshes.find(mesh => mesh.name === name))
            .filter(mesh => mesh !== undefined);

        if (doorMeshes.length > 0) {
            console.log(`[Cupboard Debug] Found ${doorMeshes.length} door meshes for animation.`);

            const initialRotations = new Map();
            doorMeshes.forEach(mesh => {
                // Ensure quaternion exists before cloning or setting Identity
                mesh.rotationQuaternion = mesh.rotationQuaternion || BABYLON.Quaternion.Identity();
                initialRotations.set(mesh.name, mesh.rotationQuaternion.clone());
                console.log(`[Cupboard Debug] Initial rotation for ${mesh.name}: ${initialRotations.get(mesh.name).toEulerAngles().y}`);
            });
            
            let isDoorOpen = false;

            doorMeshes.forEach(doorMesh => {
                if (!doorMesh.actionManager) {
                    doorMesh.actionManager = new BABYLON.ActionManager(scene);
                    console.log(`[Cupboard Debug] ActionManager created for ${doorMesh.name}.`);
                }

                doorMesh.actionManager.registerAction(
                    new BABYLON.ExecuteCodeAction(
                        BABYLON.ActionManager.OnPickTrigger,
                        function () {
                            console.log(`[Cupboard Debug] Click detected on ${doorMesh.name}. Current isDoorOpen: ${isDoorOpen}`);

                            const activeDoorAnimationGroup = scene.getAnimationGroupByName("cupboardDoorAnimationGroup");
                            if (activeDoorAnimationGroup && activeDoorAnimationGroup.isPlaying) {
                                console.log("[Cupboard Debug] Door animation already playing, ignoring new click.");
                                return;
                            }
                            
                            const animationGroup = new BABYLON.AnimationGroup("cupboardDoorAnimationGroup");

                            doorMeshes.forEach(currentDoorMesh => {
                                const startRotation = currentDoorMesh.rotationQuaternion.clone();
                                let targetRotation;

                                if (isDoorOpen) {
                                    targetRotation = initialRotations.get(currentDoorMesh.name).clone();
                                } else {
                                    // 이 부분은 모델의 실제 문 구조와 회전축에 맞춰 세밀하게 조정해야 합니다.
                                    // 001이 왼쪽 문, 002가 오른쪽 문이라고 가정합니다.
                                    if (currentDoorMesh.name === "cupbord_1.001_Material.001_0") {
                                        // 왼쪽 문: +Y (시계방향 또는 바깥쪽)으로 90도 회전
                                        targetRotation = initialRotations.get(currentDoorMesh.name).multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI))
                                        .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, Math.PI / 2)); 
                                    } else if (currentDoorMesh.name === "cupbord_1.002_Material.001_0") {
                                        // 오른쪽 문: -Y (반시계방향 또는 바깥쪽)으로 90도 회전
                                        targetRotation = initialRotations.get(currentDoorMesh.name).multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, -Math.PI))
                                        .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2)); 
                                    } else {
                                        // 만약을 위한 기본 동작
                                        targetRotation = initialRotations.get(currentDoorMesh.name).multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2));
                                    }
                                }
                                
                                const doorAnimation = new BABYLON.Animation(
                                    `doorRotation_${currentDoorMesh.name}`,
                                    "rotationQuaternion",
                                    30,
                                    BABYLON.Animation.ANIMATIONTYPE_QUATERNION,
                                    BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
                                );

                                const keys = [];
                                keys.push({
                                    frame: 0,
                                    value: startRotation
                                });
                                keys.push({
                                    frame: 60,
                                    value: targetRotation
                                });
                                doorAnimation.setKeys(keys);
                                animationGroup.addTargetedAnimation(doorAnimation, currentDoorMesh);
                                console.log(`[Cupboard Debug] Added animation for ${currentDoorMesh.name}.`);
                            }); // end of doorMeshes.forEach

                            animationGroup.onAnimationGroupEndObservable.addOnce(() => {
                                isDoorOpen = !isDoorOpen;
                                console.log(`[Cupboard Debug] Animation finished. Door is now ${isDoorOpen ? 'OPEN' : 'CLOSED'}.`);
                            });
                            
                            animationGroup.play(false);
                            console.log(`[Cupboard Debug] Starting animation group.`);
                        }
                    )
                ); // end of registerAction
            }); // end of doorMeshes.forEach
        } else {
            console.warn(`❗ Metal Cupboard: 지정된 문 메쉬들 (${doorMeshNames.join(', ')}) 중 하나라도 찾을 수 없습니다. 문 애니메이션을 적용할 수 없습니다.`);
            console.log("로드된 메쉬 목록:");
            metalCupboardResult.meshes.forEach(mesh => console.log(`- Mesh Name: ${mesh.name}`));
        }
        // --- 문 애니메이션 로직 끝 ---

        return rootMetalCupboardMesh;
    }

    await loadMetalCupboard(metalCupboardWorldPos, parentMesh, scene, metalCupboardOptions);
}