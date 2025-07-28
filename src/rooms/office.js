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
 * @param {Function} onDoorClickForQuiz
 * @param {Function} onIdCardAcquired - (이제 사용하지 않음) ID 카드를 플레이어가 획득했을 때 React 컴포넌트로 전달될 콜백 함수입니다.
 * 주로 React 상태(예: `hasIdCardItem`)를 업데이트하는 데 사용됩니다.
 * @param {Function} getIsCupboardUnlocked - React 컴포넌트에서 관리하는 찬장의 잠금 해제 상태(isOfficeCupboardUnlocked)를
 * 실시간으로 가져오는 콜백 함수입니다. 이 함수를 호출하여 현재 잠금 상태를 확인합니다.
 * @param {Function} getIsDoorUnlocked 
 * @param {object} idCardOptions - ID 카드 모델의 초기 위치, 스케일, 회전 등을 재정의할 수 있는 옵션 객체입니다.
 * @param {object} metalCupboardOptions - 메탈 찬장 모델의 스케일, 회전 등을 재정의할 수 있는 옵션 객체입니다.
 */

export async function addDoctorOffice(
    scene,
    parentMesh,
    onCupboardClickForQuiz,
    onIdCardAcquired,
    getIsCupboardUnlocked,
    onPaperClickForContent,
    onOfficeDoorClick, // 추가됨: 사무실 문 클릭 시 호출될 함수
    getIsOfficeDoorUnlocked, // 추가됨: 사무실 문 잠금 해제 상태를 가져오는 함수
    idCardOptions = {},
    metalCupboardOptions = {}
) {

    if (!parentMesh) {
        console.warn("❗ parentMesh가 없습니다.");
        return;
    }


// --- 2. door.glb (문) 모델 배치 및 로직 ---
    // 변수 이름을 'door2'에서 'doorResult'로 통일하여 혼동을 줄였습니다.
    const doorResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "door.glb", scene);
    doorResult.meshes.forEach((doorMesh) => {
        if (doorMesh.name === "Cube.002_Cube.000_My_Ui_0") { // 문짝만!
            const pivot = new BABYLON.Vector3(0, -6.3, 0); // 문을 회전시킬 축의 피벗 포인트 설정
            doorMesh.setPivotPoint(pivot);

            doorMesh.parent = parentMesh;
            // 문 메시의 월드 위치를 부모 메시의 로컬 좌표계로 변환하여 설정
            doorMesh.position = BABYLON.Vector3.TransformCoordinates(
                new BABYLON.Vector3(-19.55, 4.95, -2.15),
                BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
            );

            // 초기 회전 설정 (X축 90도, Y축 90도 회전)
            const baseRotation = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
                .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2));

            doorMesh.rotationQuaternion = baseRotation.clone(); // 문 메시의 초기 회전 쿼터니언 설정
            doorMesh.scaling = new BABYLON.Vector3(31.8, 32.5, 31.8); // 문 메시의 스케일 설정
            doorMesh.checkCollisions = true; // 충돌 감지 활성화

            const startRotation = doorMesh.rotationQuaternion.clone(); // 문이 닫힌 상태의 회전 값
            const openAngle = Math.PI / 2; // 문이 열릴 각도 (90도)
            // 문이 열린 상태의 회전 값 (Z축 기준으로 회전)
            const endRotation = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, openAngle).multiply(startRotation);

            // 문 열림 애니메이션 정의
            const openAnim = new BABYLON.Animation(
                "doorOpen", // 애니메이션 이름
                "rotationQuaternion", // 애니메이션 적용할 속성
                30, // 초당 프레임 수 (FPS)
                BABYLON.Animation.ANIMATIONTYPE_QUATERNION, // 애니메이션 타입 (쿼터니언)
                BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT // 애니메이션 반복 모드 (한 번만 실행)
            );
            openAnim.setKeys([
                { frame: 0, value: startRotation }, // 0프레임: 시작 회전
                { frame: 30, value: endRotation }, // 30프레임: 종료 회전
            ]);

            // 문 닫힘 애니메이션 정의
            const closeAnim = new BABYLON.Animation(
                "doorClose", // 애니메이션 이름
                "rotationQuaternion", // 애니메이션 적용할 속성
                30, // 초당 프레임 수 (FPS)
                BABYLON.Animation.ANIMATIONTYPE_QUATERNION, // 애니메이션 타입 (쿼터니언)
                BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT // 애니메이션 반복 모드 (한 번만 실행)
            );
            closeAnim.setKeys([
                { frame: 0, value: endRotation }, // 0프레임: 시작 회전 (열린 상태)
                { frame: 30, value: startRotation }, // 30프레임: 종료 회전 (닫힌 상태)
            ]);

            let isDoorOpen = false; // 문이 현재 열려있는지 닫혀있는지 상태
            let isAnimating = false; // 문 애니메이션이 현재 실행 중인지 상태

            // --- 문 상호작용 로직 ---
            doorMesh.actionManager = new BABYLON.ActionManager(scene);
            doorMesh.actionManager.registerAction(
                new BABYLON.ExecuteCodeAction(
                    BABYLON.ActionManager.OnPickTrigger, // 메쉬를 클릭했을 때 트리거
                    function () {
                        // 애니메이션이 이미 진행 중이라면, 추가 클릭을 무시합니다.
                        if (isAnimating) return;

                        // React로부터 문 잠금 해제 상태를 가져옴
                        // `getIsOfficeDoorUnlocked` 함수를 직접 호출합니다.
                        const unlocked = getIsOfficeDoorUnlocked();

                        // 문이 잠금 해제되지 않았다면 (잠겨 있다면)
                        if (!unlocked) {
                            // `onOfficeDoorClick` 함수가 유효한지 확인하고 호출합니다.
                            if (onOfficeDoorClick) {
                                onOfficeDoorClick(); // React 퀴즈를 트리거합니다.
                            }
                            // 잠겨 있을 때는 문을 열거나 닫는 애니메이션을 실행하지 않고 즉시 종료합니다.
                            return;
                        }
                        // 문이 잠금 해제되었다면 (문이 열리거나 닫힐 수 있는 상태)
                        else {
                            // 이제 문 애니메이션을 시작할 수 있습니다.
                            isAnimating = true; // 애니메이션 시작을 알림

                            if (!isDoorOpen) {
                                // 문을 엽니다. 문이 열리는 동안 충돌을 비활성화합니다.
                                doorMesh.checkCollisions = false;
                                scene.beginDirectAnimation(doorMesh, [openAnim], 0, 30, false, 1.0, () => {
                                    isDoorOpen = true;    // 문 열림 상태로 변경
                                    isAnimating = false;  // 애니메이션 종료 알림
                                });
                            } else {
                                // 문을 닫습니다. 애니메이션 완료 후 충돌을 다시 활성화합니다.
                                scene.beginDirectAnimation(doorMesh, [closeAnim], 0, 30, false, 1.0, () => {
                                    doorMesh.checkCollisions = true; // 문 닫힘 후 충돌 감지 다시 활성화
                                    isDoorOpen = false;   // 문 닫힘 상태로 변경
                                    isAnimating = false;  // 애니메이션 종료 알림
                                });
                            }
                        }
                    }
                )
            );
        }
    });

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
                new BABYLON.Vector3(-17.85, 6.60, 11.20),
                BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
            );
            rootIdCardMesh.scaling = idCardOptions.scaling || new BABYLON.Vector3(7,7,7);
            rootIdCardMesh.rotationQuaternion = idCardOptions.rotation || BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, -Math.PI)
                .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI));

            // 모든 mesh에 대해 pickable/actionManager 등록
            idCardResult.meshes.forEach(mesh => {
                if (mesh && mesh.name !== "__root__") {
                    mesh.checkCollisions = true;
                    mesh.isPickable = true;
                    mesh.setEnabled(true);
                    mesh.actionManager = new BABYLON.ActionManager(scene);
                    mesh.actionManager.registerAction(
                      new BABYLON.ExecuteCodeAction(
                        BABYLON.ActionManager.OnPickTrigger,
                        function() {
                          if (onIdCardAcquired) {
                            onIdCardAcquired(true);
                            mesh.setEnabled(false);
                            mesh.isPickable = false;
                          }
                          // ID 카드 획득 후 즉시 사라지도록 설정
                          console.log("ID 카드가 즉시 사라집니다.");
                        }
                      )
                    );
                }
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
                    if (onIdCardAcquired) {
                        onIdCardAcquired(true); // React의 setHasIdCardItem(true) 콜백 호출
                        rootIdCardMesh.setEnabled(false); // 아이템 획득 후 씬에서 완전히 숨김 (재활성화되지 않음)
                        rootIdCardMesh.isPickable = false; // 획득 후 다시 픽 불가능하게 설정
                    }
                    // ID 카드 획득 후 즉시 사라지도록 설정
                    console.log("ID 카드가 즉시 사라집니다.");
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
                                // 찬장이 잠금 해제되었는지 React 함수를 호출하여 확인합니다.
                                if (!getIsCupboardUnlocked()) {
                                    if (onCupboardClickForQuiz) {
                                        onCupboardClickForQuiz(); // 퀴즈 팝업 띄우는 함수 호출
                                        return; // 잠겨있으면 문 열기 로직 실행하지 않음
                                    }
                                    return;
                                }

                                // 애니메이션 재생 중이면 클릭 무시
                                const activeDoorAnimationGroup = scene.getAnimationGroupByName("metalCupboardDoorAnimationGroup");
                                if (activeDoorAnimationGroup && activeDoorAnimationGroup.isPlaying) {
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
                                    // onIdCardAcquired(true)가 호출되면 ID 카드가 setEnabled(false)되므로 중복 활성화 방지
                                    if (rootIdCardMesh) {
                                        if (isDoorOpen && getIsCupboardUnlocked()) {
                                            // 찬장이 열리고 잠금 해제된 경우에만 ID 카드 활성화 (아직 획득 안 했다면)
                                            // onIdCardAcquired(true)가 호출되어 이미 ID 카드가 비활성화되었다면, 이 로직은 영향을 주지 않음
                                            rootIdCardMesh.setEnabled(true);
                                            rootIdCardMesh.isPickable = true;
                                            console.log("✅ ID 카드 활성화됨: 찬장이 열렸고 잠금 해제되었습니다.", {
                                                enabled: rootIdCardMesh.isEnabled(),
                                                pickable: rootIdCardMesh.isPickable,
                                                actionManager: !!rootIdCardMesh.actionManager
                                            });
                                        } else { // 문이 닫히거나, 찬장이 잠금 해제되지 않은 경우
                                            // ID 카드가 획득되지 않은 상태에서 문이 닫히거나, 찬장이 잠금 해제되지 않았다면 숨김
                                            // onIdCardAcquired(true)가 호출되어 이미 ID 카드가 비활성화되었다면, 이 로직은 영향을 주지 않음
                                            rootIdCardMesh.setEnabled(false);
                                            rootIdCardMesh.isPickable = false;
                                            console.log("⛔️ ID 카드 비활성화됨: 찬장이 닫혔거나 잠금 해제되지 않았습니다.", {
                                                enabled: rootIdCardMesh.isEnabled(),
                                                pickable: rootIdCardMesh.isPickable,
                                                actionManager: !!rootIdCardMesh.actionManager
                                            });
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

        } 
    } catch (error) {
        console.error("metal_cupboard.glb 로드 중 오류: ", error);
        return;
    }

    // --- ♿ 휠체어 (wheelchair.glb) 로더 함수 및 배치 ---
    const wheelchairWorldPos = [
        new BABYLON.Vector3(-7.89, 6.90, 6.67), // 첫 번째 휠체어 위치
        new BABYLON.Vector3(-6.89, 6.90, 6.67), // 두 번째 휠체어 위치
        new BABYLON.Vector3(-5.89, 6.90, 6.67), // 세 번째 휠체어 위치
        new BABYLON.Vector3(-7.89, 6.90, 5.67), // ⭐ 네 번째 휠체어 위치 (새로 추가)
        new BABYLON.Vector3(-6.89, 6.90, 5.67), // ⭐ 다섯 번째 휠체어 위치 (새로 추가)
        new BABYLON.Vector3(-5.89, 6.90, 5.67)  // ⭐ 여섯 번째 휠체어 위치 (새로 추가)
    ];

    // 휠체어 모델을 로드하고 설정하는 비동기 헬퍼 함수
    async function loadWheelchair(worldPosition, parentMesh, scene, options = {}) {
        try {
            const wheelchairResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "wheelchair.glb", scene);
            if (!wheelchairResult || !wheelchairResult.meshes || wheelchairResult.meshes.length === 0) {
                return null;
            }

            const rootWheelchairMesh = wheelchairResult.meshes[0];
            rootWheelchairMesh.parent = parentMesh;
            rootWheelchairMesh.position = BABYLON.Vector3.TransformCoordinates(
                worldPosition,
                BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
            );
            // 기본 스케일은 모델에 따라 다를 수 있으므로 조절 필요
            rootWheelchairMesh.scaling = options.scaling || new BABYLON.Vector3(1, 1, 1); // 적절한 스케일로 조절하세요.
            // 기본 회전도 모델에 따라 다를 수 있으므로 조절 필요
            rootWheelchairMesh.rotationQuaternion = options.rotation || BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI); // 예를 들어, Y축으로 180도 회전
            wheelchairResult.meshes.forEach(mesh => {
                mesh.checkCollisions = true;
                mesh.isVisible = true;
            });
            return rootWheelchairMesh;
        } catch (error) {
            console.error("wheelchair.glb 로드 오류: ", error);
            return null;
        }
    }

    // 정의된 위치에 휠체어 6개를 로드하고 배치합니다.
    await loadWheelchair(wheelchairWorldPos[0], parentMesh, scene, { scaling: new BABYLON.Vector3(50, 50, 50), rotation: BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2).multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2)) }); // 첫 번째
    await loadWheelchair(wheelchairWorldPos[1], parentMesh, scene, { scaling: new BABYLON.Vector3(50, 50, 50), rotation: BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2).multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 10)) }); // 두 번째
    await loadWheelchair(wheelchairWorldPos[2], parentMesh, scene, { scaling: new BABYLON.Vector3(50, 50, 50), rotation: BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2).multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI)) }); // 세 번째
    await loadWheelchair(wheelchairWorldPos[3], parentMesh, scene, { scaling: new BABYLON.Vector3(50, 50, 50), rotation: BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2).multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 3)) }); // ⭐ 네 번째 (새로 추가)
    await loadWheelchair(wheelchairWorldPos[4], parentMesh, scene, { scaling: new BABYLON.Vector3(50, 50, 50), rotation: BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2).multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI * 0.75)) }); // ⭐ 다섯 번째 (새로 추가)
    await loadWheelchair(wheelchairWorldPos[5], parentMesh, scene, { scaling: new BABYLON.Vector3(50, 50, 50), rotation: BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2).multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI * 1.5)) }); // ⭐ 여섯 번째 (새로 추가)

    // --- 🛏️ 병원 침대 (hospital_bed.glb) 로더 함수 및 배치 ---
    const hospitalBedWorldPos = [
        new BABYLON.Vector3(-5.79, 6.45, 3.65), // 첫 번째 병원 침대 위치 (예시)
        new BABYLON.Vector3(-7.15, 6.45, 2.15)  // 두 번째 병원 침대 위치 (예시, 약간 옆으로)
    ];

    // 병원 침대 모델을 로드하고 설정하는 비동기 헬퍼 함수
    async function loadHospitalBed(worldPosition, parentMesh, scene, options = {}) {
        try {
            const hospitalBedResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "hospital_bed.glb", scene);
            if (!hospitalBedResult || !hospitalBedResult.meshes || hospitalBedResult.meshes.length === 0) {
                return null;
            }

            const rootHospitalBedMesh = hospitalBedResult.meshes[0];
            rootHospitalBedMesh.parent = parentMesh;
            rootHospitalBedMesh.position = BABYLON.Vector3.TransformCoordinates(
                worldPosition,
                BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
            );
            // 기본 스케일과 회전은 모델에 따라 다를 수 있으므로 조절 필요
            rootHospitalBedMesh.scaling = options.scaling || new BABYLON.Vector3(1, 1, 1); // 적절한 스케일로 조절하세요. (예: 50, 50, 50)
            rootHospitalBedMesh.rotationQuaternion = options.rotation || BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI); // 예를 들어, Y축으로 180도 회전

            hospitalBedResult.meshes.forEach(mesh => {
                mesh.checkCollisions = true;
                mesh.isVisible = true;
            });
            return rootHospitalBedMesh;
        } catch (error) {
            console.error("hospital_bed.glb 로드 오류: ", error);
            return null;
        }
    }

    // 정의된 위치에 병원 침대 2개를 로드하고 배치합니다.
    await loadHospitalBed(hospitalBedWorldPos[0], parentMesh, scene, {
        scaling: new BABYLON.Vector3(100, 100, 100), // 이 값은 모델 크기에 따라 조절하세요.
        rotation: BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2).multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, -Math.PI / 6))
    });
    await loadHospitalBed(hospitalBedWorldPos[1], parentMesh, scene, {
        scaling: new BABYLON.Vector3(100, 100, 100), // 이 값은 모델 크기에 따라 조절하세요.
        rotation: BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2).multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 6)) // 다른 방향으로 배치
    });

    // --- 🪑 대기 의자 (waiting_chair.glb) 로더 함수 및 배치 ---
    const waitingChairWorldPos = [
        new BABYLON.Vector3(-8.57, 6.48, -5.25), // 첫 번째 대기 의자 위치
        new BABYLON.Vector3(-5.95, 6.48, -4.75), // 두 번째 대기 의자 위치
        new BABYLON.Vector3(-11.57, 6.48, -5.25), // ⭐ 세 번째 대기 의자 위치 (새로 추가)
        new BABYLON.Vector3(-6.45, 6.48, -1.11)  // ⭐ 네 번째 대기 의자 위치 (새로 추가)
    ];

    // 대기 의자 모델을 로드하고 설정하는 비동기 헬퍼 함수
    async function loadWaitingChair(worldPosition, parentMesh, scene, options = {}) {
        try {
            const waitingChairResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "waiting_chair.glb", scene);
            if (!waitingChairResult || !waitingChairResult.meshes || waitingChairResult.meshes.length === 0) {
                return null;
            }

            const rootWaitingChairMesh = waitingChairResult.meshes[0];
            rootWaitingChairMesh.parent = parentMesh;
            rootWaitingChairMesh.position = BABYLON.Vector3.TransformCoordinates(
                worldPosition,
                BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
            );
            // 기본 스케일과 회전은 모델에 따라 다를 수 있으므로 조절 필요
            rootWaitingChairMesh.scaling = options.scaling || new BABYLON.Vector3(1, 1, 1); // 적절한 스케일로 조절하세요. (예: 20, 20, 20)
            rootWaitingChairMesh.rotationQuaternion = options.rotation || BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2); // 예를 들어, Y축으로 90도 회전

            const targetMeshName = "Waiting Bench (3 Seats)_Waiting Bench_0"; // 텍스처를 적용할 메쉬의 이름

            for (const mesh of waitingChairResult.meshes) {
                mesh.checkCollisions = true;
                mesh.isVisible = true;

                // 클릭한 메쉬 이름을 기반으로 텍스처 적용
                if (mesh.name === targetMeshName) {
                    // 새 StandardMaterial 생성
                    const customMaterial = new BABYLON.StandardMaterial("waitingChairTextureMat_" + mesh.uniqueId, scene); // uniqueId를 추가하여 고유한 재질 이름 생성
                    
                    // 텍스처 이미지 경로를 지정합니다.
                    // 실제 텍스처 파일이 있는 경로와 파일명으로 변경해야 합니다.
                    customMaterial.diffuseTexture = new BABYLON.Texture("/Metal055C.png", scene); // 텍스처 경로에 /textures/ 추가
                    customMaterial.diffuseTexture.hasAlpha = false; // 텍스처에 투명도(알파 채널)가 있다면 true로 설정

                    mesh.material = customMaterial; // 해당 메쉬에 재질 적용
                    break;
                } 
            }
            return rootWaitingChairMesh;
        } catch (error) {
            return null;
        }
    }

    // 정의된 위치에 대기 의자 4개를 로드하고 배치합니다.
    await loadWaitingChair(waitingChairWorldPos[0], parentMesh, scene, {
        scaling: new BABYLON.Vector3(80, 80, 80), // 이 값은 모델 크기에 따라 조절하세요.
        rotation: BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2).multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, -Math.PI / 10))
    });
    await loadWaitingChair(waitingChairWorldPos[1], parentMesh, scene, {
        scaling: new BABYLON.Vector3(80, 80, 80), // 이 값은 모델 크기에 따라 조절하세요.
        rotation: BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2).multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2))
    });
    // ⭐ 새로 추가된 대기 의자 2개 ⭐
    await loadWaitingChair(waitingChairWorldPos[2], parentMesh, scene, {
        scaling: new BABYLON.Vector3(80, 80, 80), // 스케일 조정
        rotation: BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2).multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI)) // 회전 조정
    });
    await loadWaitingChair(waitingChairWorldPos[3], parentMesh, scene, {
        scaling: new BABYLON.Vector3(80, 80, 80), // 스케일 조정
        rotation: BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2).multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 3)) // 회전 조정
    });

    // --- 📄 종이 모델 (paper_tablet.glb) 로드 및 설정 ---
    // 종이 모델을 배치하고 싶은 월드 위치를 정의합니다.
    const desiredPaperModelWorldPos = new BABYLON.Vector3(-17.05, 7.85, -5.85); // 원하는 위치로 조절하세요.

    try {
        // 'paper_tablet.glb' 파일을 비동기적으로 로드합니다.
        const paperModelResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "paper_tablet.glb", scene);

        if (paperModelResult && paperModelResult.meshes && paperModelResult.meshes.length > 0) {
            // 로드된 모델의 루트 메시 (가장 상위의 부모 메시)를 가져옵니다.
            const rootPaperModelMesh = paperModelResult.meshes[0];

            // 이 모델의 부모 메시를 설정합니다.
            rootPaperModelMesh.parent = parentMesh;

            // 종이 모델의 위치를 설정합니다.
            rootPaperModelMesh.position = BABYLON.Vector3.TransformCoordinates(
                desiredPaperModelWorldPos,
                BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
            );

            // 종이 모델의 크기를 조절합니다.
            rootPaperModelMesh.scaling = new BABYLON.Vector3(100, 100, 100); // 필요에 따라 조절하세요

            // 종이 모델의 회전을 조절합니다.
            rootPaperModelMesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
                .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, -Math.PI / 32)); // 필요에 따라 조절하세요

            // 로드된 모델의 모든 하위 메시에 대해 설정을 적용합니다.
            paperModelResult.meshes.forEach(mesh => {
                // 개발자 도구 콘솔에 모든 메시의 이름을 출력하여 흰 종이 메시를 식별합니다.
                // ⭐ 이 로그를 보고 정확한 메시 이름을 찾으세요! (예: "Tablet_Paper")
                console.log(`[paper_tablet.glb] 메시 이름: ${mesh.name}`);

                mesh.checkCollisions = true; // 충돌 감지 활성화
                mesh.isVisible = true;      // 메시 가시성 설정

                // ⭐⭐⭐ 핵심: "흰 종이 부분" 메시를 이름으로 식별하여 텍스처 적용 및 클릭 이벤트 추가 ⭐⭐⭐
                if (mesh.name === "Plane.005_Material.002_0") { 
                    const paperContentMaterial = new BABYLON.StandardMaterial("paperContentMat", scene);

                    // 3D 모델 표면에 입힐 이미지 텍스처 로드
                    // 이 이미지는 모델 자체에 보여질 내용입니다. (예: 미리보기, 제목 등)
                    paperContentMaterial.diffuseTexture = new BABYLON.Texture("/식단표.png", scene); // 3D 모델에 보일 이미지 경로
                    paperContentMaterial.diffuseTexture.hasAlpha = true; // 텍스처에 투명도가 있다면 활성화

                    // (선택 사항) 종이처럼 보이도록 설정 (광택 없음, 거칠게)
                    paperContentMaterial.specularColor = new BABYLON.Color3(0.05, 0.05, 0.05);
                    paperContentMaterial.roughness = 1.0;

                    mesh.material = paperContentMaterial; // 해당 메시에 커스텀 재질 적용
                    mesh.isPickable = true; // 이 메시가 클릭 가능하게 설정

                    // ⭐ 흰 종이 메시 클릭 이벤트 리스너 추가
                    if (!mesh.actionManager) {
                        mesh.actionManager = new BABYLON.ActionManager(scene);
                    }

                    mesh.actionManager.registerAction(
                        new BABYLON.ExecuteCodeAction(
                            BABYLON.ActionManager.OnPickTrigger,
                            function() {
                                console.log("✅ 흰 종이 클릭됨!");
                                // onPaperClickForContent 콜백 함수가 유효하면 호출
                                if (onPaperClickForContent) {
                                    // ⭐ 텍스트 대신 팝업으로 보여줄 이미지 파일의 경로를 전달 ⭐
                                    // 이 이미지는 클릭했을 때 팝업창에 크게 나타날 고해상도 이미지입니다.
                                    const popupImageUrl = "/식단표.png"; // 팝업으로 보여줄 이미지 경로
                                    onPaperClickForContent(popupImageUrl);
                                }
                            }
                        )
                    );
                } else {
                    // 종이 부분이 아닌 다른 메쉬 (예: 클립보드 판, 클립)
                    // 이 메시들은 클릭되지 않도록 설정할 수 있습니다.
                    mesh.isPickable = false;
                }
            });
            console.log("✅ 종이 모델 'paper_tablet.glb' 로드 및 배치 완료.");
        }
    } catch (error) {
        console.error("❗ 'paper_tablet.glb' 로드 중 오류 발생: ", error);
    }
}