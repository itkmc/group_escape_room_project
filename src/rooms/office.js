// rooms/office.js
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
 * @param {Function} onIdCardAcquired - ID 카드를 플레이어가 획득했을 때 React 컴포넌트로 전달될 콜백 함수입니다.
 * 주로 React 상태(예: `hasIdCardItem`)를 업데이트하는 데 사용됩니다.
 * @param {boolean} isCupboardUnlockedFromReact - React 컴포넌트에서 관리하는 찬장의 잠금 해제 상태를 나타내는 불리언 값입니다.
 * 이 값에 따라 찬장이 열릴지 퀴즈가 나올지 결정됩니다.
 * @param {object} idCardOptions - ID 카드 모델의 초기 위치, 스케일, 회전 등을 재정의할 수 있는 옵션 객체입니다.
 * @param {object} doctorOfficeOptions - 의사 사무실 모델 자체에 대한 옵션 (현재 코드에서는 사용되지 않음).
 * @param {object} laboratoryCabinetOptions - 연구실 캐비닛 모델에 대한 옵션 (현재 코드에서는 사용되지 않음).
 * @param {object} metalCabinetOptions - 메탈 캐비닛 모델에 대한 옵션 (현재 코드에서는 사용되지 않음).
 * @param {object} metalCupboardOptions - 메탈 찬장 모델의 스케일, 회전 등을 재정의할 수 있는 옵션 객체입니다.
 */
export async function addDoctorOffice(scene, parentMesh, onCupboardClickForQuiz, onIdCardAcquired, isCupboardUnlockedFromReact, idCardOptions = {}, doctorOfficeOptions = {}, laboratoryCabinetOptions = {}, metalCabinetOptions = {}, metalCupboardOptions = {}) {
    // 부모 메시가 유효한지 확인합니다. 없으면 경고를 출력하고 함수를 종료합니다.
    if (!parentMesh) {
        console.warn("❗ parentMesh가 없습니다.");
        return;
    }

    // --- 📚 책장 (wooden_book.glb) 로드 및 설정 ---
    const desiredBookcaseWorldPos = new BABYLON.Vector3(-24.05, 6.45, 11.85); // 책장의 월드 좌표
    let bookCaseResult;
    try {
        // GLB 모델을 비동기적으로 로드합니다.
        bookCaseResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "wooden_book.glb", scene);
        if (bookCaseResult && bookCaseResult.meshes && bookCaseResult.meshes.length > 0) {
            const rootBookcaseMesh = bookCaseResult.meshes[0]; // 로드된 모델의 루트 메시를 가져옵니다.
            rootBookcaseMesh.parent = parentMesh; // 부모 메시의 자식으로 설정합니다.
            // 월드 좌표를 부모 메시의 로컬 좌표로 변환하여 설정합니다.
            rootBookcaseMesh.position = BABYLON.Vector3.TransformCoordinates(
                desiredBookcaseWorldPos,
                BABYLON.Matrix.Invert(parentMesh.getWorldMatrix()) // 부모 메시의 역 월드 행렬을 사용
            );
            rootBookcaseMesh.scaling = new BABYLON.Vector3(100, 100, 100); // 스케일 설정
            // 회전 설정 (X축 90도 + Y축 90도)
            rootBookcaseMesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
                .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2));
            // 로드된 모든 메시에 대해 충돌 감지 및 가시성을 활성화합니다.
            bookCaseResult.meshes.forEach(mesh => {
                mesh.checkCollisions = true;
                mesh.isVisible = true;
            });
        }
    } catch (error) {
        console.error("wooden_book.glb 로드 오류: ", error); // 로드 실패 시 에러 로그
    }

    // --- 🪑 테이블 (long_table.glb) 로드 및 설정 ---
    const desiredTableWorldPos = new BABYLON.Vector3(-20.05, 6.37, 4.55); // 테이블의 월드 좌표
    let tableResult;
    try {
        tableResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "long_table.glb", scene);
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
    // 여러 개의 의자를 배치하기 위한 월드 좌표를 정의합니다.
    const chairWorldPos1 = new BABYLON.Vector3(-20.05, 6.50, 2.85); // 테이블 앞 중앙
    const chairWorldPos2 = new BABYLON.Vector3(-19.95, 6.50, 6.95); // 테이블 앞 오른쪽
    const chairWorldPos3 = new BABYLON.Vector3(-19.55, 6.50, 3.15); // 테이블 앞 왼쪽
    const chairWorldPos4 = new BABYLON.Vector3(-20.55, 6.50, 5.55); // 테이블 뒤 중앙
    const chairWorldPos5 = new BABYLON.Vector3(-20.55, 6.50, 6.15); // 테이블 뒤 오른쪽
    const chairWorldPos6 = new BABYLON.Vector3(-20.55, 6.50, 3.55); // 테이블 뒤 왼쪽

    // 의자 모델을 로드하고 설정하는 비동기 헬퍼 함수
    async function loadAntiqueChair(worldPosition, parentMesh, scene, options = {}) {
        let chairResult;
        try {
            chairResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "antique_chair.glb", scene);
        } catch (error) {
            console.error("antique_chair.glb 로드 오류: ", error);
            return null; // 로드 실패 시 null 반환
        }

        if (!chairResult || !chairResult.meshes || chairResult.meshes.length === 0) {
            return null; // 메쉬가 없으면 null 반환
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
    }

    // 정의된 위치에 의자들을 로드하고 배치합니다.
    await loadAntiqueChair(chairWorldPos1, parentMesh, scene);
    await loadAntiqueChair(chairWorldPos2, parentMesh, scene, { rotation: BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2).multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, -Math.PI / 10)) });
    await loadAntiqueChair(chairWorldPos3, parentMesh, scene, { rotation: BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2).multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2)) });
    await loadAntiqueChair(chairWorldPos4, parentMesh, scene, { rotation: BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2).multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2)) });
    await loadAntiqueChair(chairWorldPos5, parentMesh, scene, { rotation: BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2).multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, -Math.PI / 2)) });
    await loadAntiqueChair(chairWorldPos6, parentMesh, scene, { rotation: BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2).multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, -Math.PI / 2)) });

    // --- 메탈 캐비닛 (metal_cabinet.glb) 로더 함수 및 배치 ---
    const metalCabinetWorldPos1 = new BABYLON.Vector3(-21.85, 7.40, -2.15);
    const metalCabinetWorldPos2 = new BABYLON.Vector3(-23.25, 7.40, -2.15);

    // 메탈 캐비닛 모델을 로드하고 설정하는 비동기 헬퍼 함수
    async function loadMetalCabinet(worldPosition, parentMesh, scene, options = {}) {
        let metalCabinetResult;
        try {
            metalCabinetResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "metal_cabinet.glb", scene);
        } catch (error) {
            console.error("metal_cabinet.glb 로드 오류: ", error);
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

    // 정의된 위치에 메탈 캐비닛들을 로드하고 배치합니다.
    await loadMetalCabinet(metalCabinetWorldPos1, parentMesh, scene);
    await loadMetalCabinet(metalCabinetWorldPos2, parentMesh, scene);


    // --- 🆔 ID 카드 (id_card.glb) 로드 및 초기 설정 ---
    // ID 카드는 찬장 안에 있다고 가정하고, 초기에는 숨김 처리됩니다.
    const defaultIdCardWorldPos = new BABYLON.Vector3(-17.85, 6.60, 11.20); // 찬장 내부로 예상되는 월드 위치
    const finalIdCardWorldPos = idCardOptions.position || defaultIdCardWorldPos; // 옵션이 있으면 사용, 없으면 기본값

    let idCardResult;
    let rootIdCardMesh = null; // ID 카드 메시의 루트를 저장할 변수 초기화
    try {
        idCardResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "id_card.glb", scene);
        if (idCardResult && idCardResult.meshes && idCardResult.meshes.length > 0) {
            rootIdCardMesh = idCardResult.meshes[0]; // 로드된 모델의 루트 메시
            rootIdCardMesh.parent = parentMesh; // 부모 메시의 자식으로 설정
            rootIdCardMesh.position = BABYLON.Vector3.TransformCoordinates(
                finalIdCardWorldPos,
                BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
            );
            rootIdCardMesh.scaling = idCardOptions.scaling || new BABYLON.Vector3(7, 7, 7);
            rootIdCardMesh.rotationQuaternion = idCardOptions.rotation || BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, -Math.PI)
                .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI));

            // 로드된 모든 ID 카드 메시에 대해 초기 상태를 설정합니다.
            idCardResult.meshes.forEach(mesh => {
                mesh.checkCollisions = true; // 충돌 감지 활성화
                mesh.isPickable = false; // 초기에는 클릭하여 주울 수 없게 설정
                mesh.setEnabled(false); // 초기에는 씬에서 비활성화 (숨김)
            });
            console.log("ID 카드 메시 로드 및 초기 숨김/픽 비활성화 완료.");
        }
    } catch (error) {
        console.error("id_card.glb 로드 오류: ", error); // 로드 실패 시 에러 로그
    }

    // --- ID 카드 획득 로직 설정 ---
    // rootIdCardMesh가 성공적으로 로드된 경우에만 액션 매니저를 설정합니다.
    if (rootIdCardMesh) {
        rootIdCardMesh.actionManager = new BABYLON.ActionManager(scene); // 액션 매니저 생성
        rootIdCardMesh.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                BABYLON.ActionManager.OnPickTrigger, // 메시 클릭 시 트리거
                function() {
                    console.log("ID 카드 획득!");
                    if (onIdCardAcquired) {
                        onIdCardAcquired(true); // React의 setHasIdCardItem(true) 콜백 호출
                        rootIdCardMesh.setEnabled(false); // 아이템 획득 후 씬에서 숨김
                        rootIdCardMesh.isPickable = false; // 획득 후 다시 픽 불가능하게 설정
                    }
                }
            )
        );
    }


    /// --- 메탈 찬장 (metal_cupboard.glb) 추가 및 상호작용 로직 ---
    const metalCupboardWorldPos = new BABYLON.Vector3(-17.95, 6.40, 11.42); // 찬장의 원하는 월드 위치 설정

    let rootMetalCupboardMesh = null; // 찬장 메시의 루트를 저장할 변수 초기화
    // isCupboardUnlocked 지역 변수는 더 이상 사용되지 않습니다.
    // 대신 React로부터 전달받는 isCupboardUnlockedFromReact prop을 사용합니다.

    try {
        const metalCupboardResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "metal_cupboard.glb", scene);
        if (metalCupboardResult && metalCupboardResult.meshes && metalCupboardResult.meshes.length > 0) {
            rootMetalCupboardMesh = metalCupboardResult.meshes[0]; // 로드된 찬장 모델의 루트 메시

            rootMetalCupboardMesh.parent = parentMesh; // 부모 메시의 자식으로 설정
            rootMetalCupboardMesh.position = BABYLON.Vector3.TransformCoordinates(
                metalCupboardWorldPos,
                BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
            );
            rootMetalCupboardMesh.scaling = metalCupboardOptions.scaling || new BABYLON.Vector3(0.4, 0.4, 0.4);
            rootMetalCupboardMesh.rotationQuaternion = metalCupboardOptions.rotation || BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
                .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2));

            // --- 모델 로드 후, 모든 기본 애니메이션 그룹 정지 ---
            // GLB 모델에 포함된 기본 애니메이션이 자동으로 재생되는 것을 방지합니다.
            if (metalCupboardResult.animationGroups && metalCupboardResult.animationGroups.length > 0) {
                metalCupboardResult.animationGroups.forEach(group => {
                    group.stop();
                });
            }
            // -----------------------------------------------------------

            // 찬장 문 메쉬의 정확한 이름을 확인하고 저장합니다.
            // 001이 오른쪽 문, 002가 왼쪽 문이라고 가정합니다.
            const doorMeshNames = ["cupbord_1.001_Material.001_0", "cupbord_1.002_Material.001_0"];
            const doorMeshes = doorMeshNames
                .map(name => metalCupboardResult.meshes.find(mesh => mesh.name === name))
                .filter(mesh => mesh !== undefined); // 유효한 메시만 필터링

            // 문 메쉬를 찾지 못했을 경우 디버깅을 위해 모든 로드된 찬장 메시 이름을 출력합니다.
            if (doorMeshes.length === 0) {
                metalCupboardResult.meshes.forEach(mesh => console.log(`- Loaded Cupboard Mesh: ${mesh.name}`));
            }

            // 각 문 메시의 초기 회전 상태를 저장합니다. 문을 닫을 때 이 값으로 돌아갑니다.
            const initialRotations = new Map();
            doorMeshes.forEach(mesh => {
                // 메시의 rotationQuaternion이 없으면 항등 쿼터니언(Identity)으로 초기화합니다.
                mesh.rotationQuaternion = mesh.rotationQuaternion || BABYLON.Quaternion.Identity();
                initialRotations.set(mesh.name, mesh.rotationQuaternion.clone());
            });

            let isDoorOpen = false; // 찬장 문이 현재 열려있는지 닫혀있는지 상태를 추적하는 지역 변수

            // 모든 찬장 관련 메시에 클릭 액션 등록
            // 이렇게 하면 찬장 모델의 어떤 부분(루트 또는 자식 문 메쉬)을 클릭해도 반응합니다.
            metalCupboardResult.meshes.forEach(mesh => {
                mesh.checkCollisions = true; // 충돌 감지 활성화
                mesh.isVisible = true; // 가시성 활성화
                mesh.isPickable = true; // 클릭 가능하게 설정

                // **중요 수정 부분:**
                // 이 메시에 액션 매니저가 아직 할당되지 않았을 때만 새로 생성합니다.
                // 이는 addDoctorOffice 함수가 여러 번 호출될 때 액션 매니저가 중복으로 생성되거나
                // 이전 액션 매니저가 dispose되어 클릭 이벤트가 사라지는 문제를 방지합니다.
                if (!mesh.actionManager) {
                    mesh.actionManager = new BABYLON.ActionManager(scene); // 새 액션 매니저 생성

                    mesh.actionManager.registerAction(
                        new BABYLON.ExecuteCodeAction(
                            BABYLON.ActionManager.OnPickTrigger, // 메시 클릭 이벤트 트리거
                            function () {
                                console.log("찬장 메쉬 클릭됨:", this.name); // 어떤 메시가 클릭되었는지 콘솔에 기록

                                // React에서 전달받은 isCupboardUnlockedFromReact 상태를 확인합니다.
                                if (!isCupboardUnlockedFromReact) {
                                    // 찬장이 잠겨있다면 (false), 퀴즈 팝업을 호출하고 함수를 종료합니다.
                                    console.log("찬장 잠겨있음. 퀴즈 팝업 호출.");
                                    if (onCupboardClickForQuiz) {
                                        onCupboardClickForQuiz(); // React의 퀴즈 팝업 콜백 호출
                                    }
                                    return; // 잠겨있으면 문 열림 로직을 실행하지 않고 여기서 종료
                                }

                                // 찬장이 잠금 해제된 경우에만 문 열림/닫힘 로직을 실행합니다.
                                // 현재 찬장 문 애니메이션이 재생 중인지 확인합니다.
                                const activeDoorAnimationGroup = scene.getAnimationGroupByName("metalCupboardDoorAnimationGroup");
                                if (activeDoorAnimationGroup && activeDoorAnimationGroup.isPlaying) {
                                    console.log("애니메이션 재생 중, 클릭 무시.");
                                    return; // 애니메이션 재생 중이면 중복 클릭을 무시합니다.
                                }

                                // 새로운 애니메이션 그룹을 생성합니다.
                                const animationGroup = new BABYLON.AnimationGroup("metalCupboardDoorAnimationGroup");

                                // 각 문 메시에 대한 애니메이션을 정의하고 애니메이션 그룹에 추가합니다.
                                doorMeshes.forEach(currentDoorMesh => {
                                    const startRotation = currentDoorMesh.rotationQuaternion.clone(); // 현재 회전 상태를 시작점으로
                                    let targetRotation; // 목표 회전 상태

                                    if (isDoorOpen) {
                                        // 문이 열려있다면 닫는 애니메이션 (초기 회전으로 돌아감)
                                        targetRotation = initialRotations.get(currentDoorMesh.name).clone();
                                    } else {
                                        // 문이 닫혀있다면 여는 애니메이션
                                        if (currentDoorMesh.name === "cupbord_1.001_Material.001_0") {
                                            // 001 (오른쪽 문): Z축을 중심으로 시계 반대 방향(바깥쪽)으로 90도 회전
                                            targetRotation = initialRotations.get(currentDoorMesh.name)
                                                                        .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, -Math.PI / 2));
                                        } else if (currentDoorMesh.name === "cupbord_1.002_Material.001_0") {
                                            // 002 (왼쪽 문): Z축을 중심으로 시계 방향(바깥쪽)으로 90도 회전
                                            targetRotation = initialRotations.get(currentDoorMesh.name)
                                                                        .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, Math.PI / 2));
                                        } else {
                                            // 다른 문 메쉬의 경우 기본 회전 (예외 처리)
                                            targetRotation = startRotation;
                                        }
                                    }

                                    // 회전 애니메이션을 생성합니다.
                                    const doorAnimation = new BABYLON.Animation(
                                        `doorRotation_${currentDoorMesh.name}`, // 애니메이션 이름
                                        "rotationQuaternion", // 애니메이션할 속성
                                        30, // FPS (초당 프레임)
                                        BABYLON.Animation.ANIMATIONTYPE_QUATERNION, // 애니메이션 타입 (쿼터니언 회전)
                                        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT // 한 번만 재생하고 멈춤
                                    );

                                    // 애니메이션 키프레임을 설정합니다. (0프레임: 시작 회전, 60프레임: 목표 회전)
                                    // 30FPS * 2초 = 60프레임
                                    const keys = [];
                                    keys.push({ frame: 0, value: startRotation });
                                    keys.push({ frame: 60, value: targetRotation });
                                    doorAnimation.setKeys(keys);
                                    // 생성된 애니메이션을 현재 문 메시에 연결하고 애니메이션 그룹에 추가합니다.
                                    animationGroup.addTargetedAnimation(doorAnimation, currentDoorMesh);
                                }); // end of doorMeshes.forEach

                                // 애니메이션 그룹이 종료될 때 실행될 콜백을 등록합니다.
                                animationGroup.onAnimationGroupEndObservable.addOnce(() => {
                                    isDoorOpen = !isDoorOpen; // 애니메이션 완료 후 문 상태를 토글합니다 (열림 <-> 닫힘).

                                    // ID 카드 활성화/비활성화 로직
                                    if (rootIdCardMesh) {
                                        if (isDoorOpen) {
                                            // 문이 열리면 ID 카드를 보이게 하고 픽 가능하게 합니다.
                                            rootIdCardMesh.setEnabled(true);
                                            rootIdCardMesh.isPickable = true;
                                            console.log("ID 카드 활성화됨.");
                                        } else {
                                            // 문이 닫히면 ID 카드를 숨기고 픽 불가능하게 합니다.
                                            // (단, 이미 획득된 상태라면 이전에 숨겨져 있을 것입니다.)
                                            rootIdCardMesh.setEnabled(false);
                                            rootIdCardMesh.isPickable = false;
                                            console.log("ID 카드 비활성화됨.");
                                        }
                                    }
                                    // **중요 수정 부분:**
                                    // 애니메이션 그룹 사용이 완료된 후 dispose()하여 메모리에서 해제합니다.
                                    // 이는 불필요한 리소스 낭비를 줄이고, 다음 애니메이션 재생 시 충돌을 방지합니다.
                                    animationGroup.dispose();
                                });

                                animationGroup.play(false); // 애니메이션 그룹을 한 번만 재생합니다.
                            }
                        )
                    );
                } // end of if (!mesh.actionManager)
            }); // end of metalCupboardResult.meshes.forEach

        } else {
            console.warn("metal_cupboard.glb 로드 실패 또는 메쉬가 없습니다."); // 찬장 모델 로드 실패 시 경고
        }
    } catch (error) {
        console.error("metal_cupboard.glb 로드 중 오류: ", error); // 찬장 모델 로드 중 예외 발생 시 에러
        return; // 오류 발생 시 함수 종료
    }
}
