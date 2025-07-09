import * as BABYLON from "@babylonjs/core"; // Babylon.js 코어 라이브러리 임포트
import "@babylonjs/loaders"; // GLB 등 3D 모델 로더를 위한 확장 기능 임포트

/**
 * 의사 사무실 구성 요소를 Babylon.js 씬에 추가합니다.
 * 이 함수는 비동기적으로 3D 모델을 로드하고, 위치를 설정하며, 상호작용 로직을 정의합니다.
 *
 * @param {BABYLON.Scene} scene - 현재 Babylon.js 씬 인스턴스. 모든 3D 오브젝트가 추가될 공간입니다.
 * @param {BABYLON.AbstractMesh} parentMesh - 이 사무실 구성 요소들이 종속될 부모 메시입니다.
 * 예를 들어, 병원 건물 전체를 나타내는 메시가 될 수 있습니다.
 * 부모 메시의 변환(위치, 회전, 스케일)에 따라 자식 메시들도 함께 움직입니다.
 * @param {Function} onCupboardClickForQuiz - 찬장 클릭 시 퀴즈 팝업을 띄우기 위해 React 컴포넌트로 전달될 콜백 함수입니다.
 * 이 함수는 찬장이 잠겨 있을 때 호출됩니다.
 * @param {Function} onIdCardAcquired - (이제 사용하지 않음) ID 카드를 플레이어가 획득했을 때 React 컴포넌트로 전달될 콜백 함수입니다.
 * 주로 React 상태(예: `hasIdCardItem`)를 업데이트하는 데 사용됩니다.
 * @param {Function} getIsCupboardUnlocked - React 컴포넌트에서 관리하는 찬장의 잠금 해제 상태(isOfficeCupboardUnlocked)를
 * 실시간으로 가져오는 콜백 함수입니다. 이 함수를 호출하여 현재 잠금 상태를 확인합니다.
 * @param {object} idCardOptions - ID 카드 모델의 초기 위치, 스케일, 회전 등을 재정의할 수 있는 옵션 객체입니다.
 * @param {object} metalCupboardOptions - 메탈 찬장 모델의 스케일, 회전 등을 재정의할 수 있는 옵션 객체입니다.
 */
export async function addDoctorOffice(
    scene,
    parentMesh,
    onCupboardClickForQuiz,
    onIdCardAcquired, // ⭐ 이 인자는 더 이상 office.js에서 직접 사용되지 않습니다.
    getIsCupboardUnlocked,
    idCardOptions = {},
    metalCupboardOptions = {}
) {

    if (!parentMesh) {
        console.warn("❗ parentMesh가 없습니다.");
        return;
    }

    // --- 📚 책장 (wooden_book.glb) 로드 및 설정 ---
    const desiredBookcaseWorldPos = new BABYLON.Vector3(-24.05, 6.45, 11.85);
    try {
        const bookCaseResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "wooden_book.glb", scene);
        if (bookCaseResult && bookCaseResult.meshes && bookCaseResult.meshes.length > 0) {
            const rootBookcaseMesh = bookCaseResult.meshes[0];
            rootBookcaseMesh.parent = parentMesh;
            rootBookcaseMesh.position = BABYLON.Vector3.TransformCoordinates(
                desiredBookcaseWorldPos,
                BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
            );
            rootBookcaseMesh.scaling = new BABYLON.Vector3(100, 100, 100);
            rootBookcaseMesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
                .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2));
            bookCaseResult.meshes.forEach(mesh => {
                mesh.checkCollisions = true;
                mesh.isVisible = true;
            });
        }
    } catch (error) {
        console.error("wooden_book.glb 로드 오류: ", error);
    }

    // --- 🪑 테이블 (long_table.glb) 로드 및 설정 ---
    const desiredTableWorldPos = new BABYLON.Vector3(-20.05, 6.37, 4.55);
    try {
        const tableResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "long_table.glb", scene);
        if (tableResult && tableResult.meshes && tableResult.meshes.length > 0) {
            const rootTableMesh = tableResult.meshes[0];
            rootTableMesh.parent = parentMesh;
            rootTableMesh.position = BABYLON.Vector3.TransformCoordinates(
                desiredTableWorldPos,
                BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
            );
            rootTableMesh.scaling = new BABYLON.Vector3(20, 20, 20);
            rootTableMesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
                .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, 0));
            tableResult.meshes.forEach(mesh => {
                mesh.checkCollisions = true;
                mesh.isVisible = true;
            });
        }
    } catch (error) {
        console.error("long_table.glb 로드 오류: ", error);
    }

    // --- 🪑 의자 (antique_chair.glb) 로더 함수 및 배치 ---
    const chairWorldPos = [
        new BABYLON.Vector3(-20.05, 6.50, 2.85), // 테이블 앞 중앙
        new BABYLON.Vector3(-19.95, 6.50, 6.95), // 테이블 앞 오른쪽
        new BABYLON.Vector3(-19.55, 6.50, 3.15), // 테이블 앞 왼쪽
        new BABYLON.Vector3(-20.55, 6.50, 5.55), // 테이블 뒤 중앙
        new BABYLON.Vector3(-20.55, 6.50, 6.15), // 테이블 뒤 오른쪽
        new BABYLON.Vector3(-20.55, 6.50, 3.55)  // 테이블 뒤 왼쪽
    ];

    // 의자 모델을 로드하고 설정하는 비동기 헬퍼 함수
    async function loadAntiqueChair(worldPosition, parentMesh, scene, options = {}) {
        try {
            const chairResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "antique_chair.glb", scene);
            if (!chairResult || !chairResult.meshes || chairResult.meshes.length === 0) {
                return null;
            }

            const rootChairMesh = chairResult.meshes[0];
            rootChairMesh.parent = parentMesh;
            rootChairMesh.position = BABYLON.Vector3.TransformCoordinates(
                worldPosition,
                BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
            );
            rootChairMesh.scaling = options.scaling || new BABYLON.Vector3(10, 10, 10);
            rootChairMesh.rotationQuaternion = options.rotation || BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
                .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI));
            chairResult.meshes.forEach(mesh => {
                mesh.checkCollisions = true;
                mesh.isVisible = true;
            });
            return rootChairMesh;
        } catch (error) {
            console.error("antique_chair.glb 로드 오류: ", error);
            return null;
        }
    }

    // 정의된 위치에 의자들을 로드하고 배치합니다.
    await loadAntiqueChair(chairWorldPos[0], parentMesh, scene);
    await loadAntiqueChair(chairWorldPos[1], parentMesh, scene, { rotation: BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2).multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, -Math.PI / 10)) });
    await loadAntiqueChair(chairWorldPos[2], parentMesh, scene, { rotation: BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2).multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2)) });
    await loadAntiqueChair(chairWorldPos[3], parentMesh, scene, { rotation: BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2).multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2)) });
    await loadAntiqueChair(chairWorldPos[4], parentMesh, scene, { rotation: BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2).multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, -Math.PI / 2)) });
    await loadAntiqueChair(chairWorldPos[5], parentMesh, scene, { rotation: BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2).multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, -Math.PI / 2)) });

    // --- 메탈 캐비닛 (metal_cabinet.glb) 로더 함수 및 배치 ---
    const metalCabinetWorldPos = [
        new BABYLON.Vector3(-21.85, 7.40, -2.15),
        new BABYLON.Vector3(-23.25, 7.40, -2.15)
    ];

    // 메탈 캐비닛 모델을 로드하고 설정하는 비동기 헬퍼 함수
    async function loadMetalCabinet(worldPosition, parentMesh, scene, options = {}) {
        try {
            const metalCabinetResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "metal_cabinet.glb", scene);
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
        } catch (error) {
            console.error("metal_cabinet.glb 로드 오류: ", error);
            return null;
        }
    }

    // 정의된 위치에 메탈 캐비닛들을 로드하고 배치합니다.
    await loadMetalCabinet(metalCabinetWorldPos[0], parentMesh, scene);
    await loadMetalCabinet(metalCabinetWorldPos[1], parentMesh, scene);

    // --- 🆔 ID 카드 (id_card.glb) 로드 및 초기 설정 ---
    // ID 카드는 찬장 안에 있다고 가정하고, 초기에는 숨김 처리됩니다.
    const defaultIdCardWorldPos = new BABYLON.Vector3(-17.85, 6.60, 11.20); // 찬장 내부로 예상되는 월드 위치
    const finalIdCardWorldPos = idCardOptions.position || defaultIdCardWorldPos;

    let rootIdCardMesh = null; // ID 카드 메시의 루트를 저장할 변수 초기화
    try {
        const idCardResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "id_card.glb", scene);
        if (idCardResult && idCardResult.meshes && idCardResult.meshes.length > 0) {
            rootIdCardMesh = idCardResult.meshes[0];
            rootIdCardMesh.parent = parentMesh;
            rootIdCardMesh.position = BABYLON.Vector3.TransformCoordinates(
                finalIdCardWorldPos,
                BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
            );
            rootIdCardMesh.scaling = idCardOptions.scaling || new BABYLON.Vector3(7, 7, 7);
            rootIdCardMesh.rotationQuaternion = idCardOptions.rotation || BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, -Math.PI)
                .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI));

            // ⭐ ID 카드 초기 숨김 및 픽 비활성화 (찬장 안에 있으므로)
            // 초기 로드 시에는 항상 숨겨야 함 (획득 전이므로)
            idCardResult.meshes.forEach(mesh => {
                mesh.checkCollisions = true;
                mesh.isPickable = false; // 초기에는 클릭하여 주울 수 없게 설정
                mesh.setEnabled(false); // 초기에는 씬에서 비활성화 (숨김)
            });
        }
    } catch (error) {
        console.error("id_card.glb 로드 오류: ", error);
    }

    // --- ID 카드 획득 로직 설정 (클릭 시) ---
    if (rootIdCardMesh) {
        rootIdCardMesh.actionManager = new BABYLON.ActionManager(scene);
        rootIdCardMesh.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                BABYLON.ActionManager.OnPickTrigger,
                function() {
                    console.log("🎉 ID 카드 획득!");
                    if (onIdCardAcquired) {
                        onIdCardAcquired(true); // React의 setHasIdCardItem(true) 콜백 호출
                        rootIdCardMesh.setEnabled(false); // 아이템 획득 후 씬에서 완전히 숨김 (재활성화되지 않음)
                        rootIdCardMesh.isPickable = false; // 획득 후 다시 픽 불가능하게 설정
                    }
                }
            )
        );
    }

    // --- 메탈 찬장 (metal_cupboard.glb) 추가 및 상호작용 로직 ---
    const metalCupboardWorldPos = new BABYLON.Vector3(-17.95, 6.40, 11.42);

    try {
        const metalCupboardResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "metal_cupboard.glb", scene);
        if (metalCupboardResult && metalCupboardResult.meshes && metalCupboardResult.meshes.length > 0) {
            const rootMetalCupboardMesh = metalCupboardResult.meshes[0];

            rootMetalCupboardMesh.parent = parentMesh;
            rootMetalCupboardMesh.position = BABYLON.Vector3.TransformCoordinates(
                metalCupboardWorldPos,
                BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
            );
            rootMetalCupboardMesh.scaling = metalCupboardOptions.scaling || new BABYLON.Vector3(0.4, 0.4, 0.4);
            rootMetalCupboardMesh.rotationQuaternion = metalCupboardOptions.rotation || BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
                .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2));

            // 모델 로드 후, 모든 기본 애니메이션 그룹 정지
            if (metalCupboardResult.animationGroups && metalCupboardResult.animationGroups.length > 0) {
                metalCupboardResult.animationGroups.forEach(group => {
                    group.stop();
                });
            }

            const doorMeshNames = ["cupbord_1.001_Material.001_0", "cupbord_1.002_Material.001_0"];
            const doorMeshes = doorMeshNames
                .map(name => metalCupboardResult.meshes.find(mesh => mesh.name === name))
                .filter(mesh => mesh !== undefined);

            if (doorMeshes.length === 0) {
                console.warn("경고: 찬장 문 메시를 찾을 수 없습니다.");
            }

            const initialRotations = new Map();
            doorMeshes.forEach(mesh => {
                mesh.rotationQuaternion = mesh.rotationQuaternion || BABYLON.Quaternion.Identity();
                initialRotations.set(mesh.name, mesh.rotationQuaternion.clone());
            });

            let isDoorOpen = false; // 찬장 문이 현재 열려있는지 닫혀있는지 상태

            // 모든 찬장 관련 메시에 클릭 액션 등록
            metalCupboardResult.meshes.forEach(mesh => {
                mesh.checkCollisions = true;
                mesh.isVisible = true;
                mesh.isPickable = true;

                if (!mesh.actionManager) {
                    mesh.actionManager = new BABYLON.ActionManager(scene);

                    mesh.actionManager.registerAction(
                        new BABYLON.ExecuteCodeAction(
                            BABYLON.ActionManager.OnPickTrigger,
                            function () {
                                console.log("🔍 찬장 메쉬 클릭됨. 현재 찬장 잠금 해제 상태:", getIsCupboardUnlocked());

                                // 찬장이 잠금 해제되었는지 React 함수를 호출하여 확인합니다.
                                if (!getIsCupboardUnlocked()) {
                                    console.log("🔒 찬장 잠겨있음. 퀴즈 팝업 호출.");
                                    if (onCupboardClickForQuiz) {
                                        onCupboardClickForQuiz(); // 퀴즈 팝업 띄우는 함수 호출
                                    }
                                    return; // 잠겨있으면 문 열기 로직 실행하지 않음
                                }

                                // 애니메이션 재생 중이면 클릭 무시
                                const activeDoorAnimationGroup = scene.getAnimationGroupByName("metalCupboardDoorAnimationGroup");
                                if (activeDoorAnimationGroup && activeDoorAnimationGroup.isPlaying) {
                                    console.log("⏳ 애니메이션 재생 중, 클릭 무시.");
                                    return;
                                }

                                const animationGroup = new BABYLON.AnimationGroup("metalCupboardDoorAnimationGroup");

                                doorMeshes.forEach(currentDoorMesh => {
                                    const startRotation = currentDoorMesh.rotationQuaternion.clone();
                                    let targetRotation;

                                    if (isDoorOpen) {
                                        // 문 닫기
                                        targetRotation = initialRotations.get(currentDoorMesh.name).clone();
                                    } else {
                                        // 문 열기
                                        if (currentDoorMesh.name === "cupbord_1.001_Material.001_0") {
                                            targetRotation = initialRotations.get(currentDoorMesh.name)
                                                .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, -Math.PI / 2));
                                        } else if (currentDoorMesh.name === "cupbord_1.002_Material.001_0") {
                                            targetRotation = initialRotations.get(currentDoorMesh.name)
                                                .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, Math.PI / 2));
                                        } else {
                                            targetRotation = startRotation; // 그 외 메시는 회전 안함
                                        }
                                    }

                                    const doorAnimation = new BABYLON.Animation(
                                        `doorRotation_${currentDoorMesh.name}`,
                                        "rotationQuaternion",
                                        30, // FPS
                                        BABYLON.Animation.ANIMATIONTYPE_QUATERNION,
                                        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
                                    );

                                    const keys = [];
                                    keys.push({ frame: 0, value: startRotation });
                                    keys.push({ frame: 60, value: targetRotation }); // 2초 (60프레임 / 30FPS)
                                    doorAnimation.setKeys(keys);
                                    animationGroup.addTargetedAnimation(doorAnimation, currentDoorMesh);
                                });

                                animationGroup.onAnimationGroupEndObservable.addOnce(() => {
                                    isDoorOpen = !isDoorOpen; // 문 상태 토글

                                    // ⭐ ID 카드 활성화/비활성화 로직 (문이 열린 후에만 ID 카드가 보이도록)
                                    // isDoorOpen이 true이고, 찬장이 잠금 해제된 상태일 때만 ID 카드 활성화
                                    if (rootIdCardMesh) {
                                        if (isDoorOpen && getIsCupboardUnlocked()) {
                                            // 찬장이 열리고 잠금 해제된 경우에만 ID 카드 활성화 (아직 획득 안 했다면)
                                            // onIdCardAcquired(true)가 호출되면 ID 카드가 setEnabled(false)되므로 중복 활성화 방지
                                            rootIdCardMesh.setEnabled(true);
                                            rootIdCardMesh.isPickable = true;
                                            console.log("✅ ID 카드 활성화됨: 찬장이 열렸고 잠금 해제되었습니다.");
                                        } else { // 문이 닫히거나, 찬장이 잠금 해제되지 않은 경우
                                            // ID 카드가 획득되지 않은 상태에서 문이 닫히거나, 찬장이 잠금 해제되지 않았다면 숨김
                                            // onIdCardAcquired(true)가 호출되어 이미 ID 카드가 비활성화되었다면, 이 로직은 영향을 주지 않음
                                            rootIdCardMesh.setEnabled(false);
                                            rootIdCardMesh.isPickable = false;
                                            console.log("⛔️ ID 카드 비활성화됨: 찬장이 닫혔거나 잠금 해제되지 않았습니다.");
                                        }
                                    }
                                    animationGroup.dispose(); // 애니메이션 그룹 사용 완료 후 해제
                                });

                                animationGroup.play(false); // 애니메이션 재생 (반복 안함)
                            }
                        )
                    );
                }
            });

        } else {
            console.warn("metal_cupboard.glb 로드 실패 또는 메쉬가 없습니다.");
        }
    } catch (error) {
        console.error("metal_cupboard.glb 로드 중 오류: ", error);
        return;
    }
}