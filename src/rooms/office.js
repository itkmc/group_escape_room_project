// office.js
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";

/**
 * 의사 사무실 구성 요소를 씬에 추가
 * @param {BABYLON.Scene} scene - Babylon.js Scene
 * @param {BABYLON.AbstractMesh} parentMesh - 병원 건물 메시 등
 */
export async function addDoctorOffice(scene, parentMesh, idCardOptions = {}, doctorOfficeOptions = {}, laboratoryCabinetOptions = {}, metalCabinetOptions = {}) {
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

    // ===========================================
    // === 🪑 antique_chair.glb 설정 시작 ===
    // ===========================================

    // 의자의 월드 위치 정의
    // 각 의자의 위치를 조정하여 원하는 배열을 만드세요.
    const chairWorldPos1 = new BABYLON.Vector3(-20.05, 6.50, 2.85); // 테이블 앞 중앙
    const chairWorldPos2 = new BABYLON.Vector3(-19.95, 6.50, 6.95); // 테이블 앞 오른쪽
    const chairWorldPos3 = new BABYLON.Vector3(-19.55, 6.50, 3.15); // 테이블 앞 왼쪽
    const chairWorldPos4 = new BABYLON.Vector3(-21.55, 6.50, 6.55); // 테이블 뒤 중앙
    // const chairWorldPos5 = new BABYLON.Vector3(-22.55, 6.50, 3.7); // 테이블 뒤 오른쪽
    // const chairWorldPos6 = new BABYLON.Vector3(-23.55, 6.50, 3.5); // 테이블 뒤 왼쪽

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
    // 필요한 경우, 각 의자에 대해 개별 스케일이나 회전 옵션을 `options` 객체로 전달할 수 있습니다.
    const chair1 = await loadAntiqueChair(chairWorldPos1, parentMesh, scene);
    const chair2 = await loadAntiqueChair(chairWorldPos2, parentMesh, scene, {
        rotation: BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
            .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, -Math.PI / 10)) // 0도로 설정하여 반대 방향을 보게 함
    });
    const chair3 = await loadAntiqueChair(chairWorldPos3, parentMesh, scene, {
        rotation: BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
            .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2))
    });

    const chair4 = await loadAntiqueChair(chairWorldPos4, parentMesh, scene, {
        rotation: BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
            .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2)) // 0도로 설정하여 반대 방향을 보게 함
    });
    // const chair5 = await loadAntiqueChair(chairWorldPos5, parentMesh, scene, {
    //     rotation: BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
    //         .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, 0))
    // });
    // const chair6 = await loadAntiqueChair(chairWorldPos6, parentMesh, scene, {
    //     rotation: BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
    //         .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, 0))
    // });

    // 🆔 ID 카드
    const defaultIdCardWorldPos = new BABYLON.Vector3(-20.50, 6.75, 5.21); // 사용자님이 설정하신 기본 위치 유지
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

    const rootIdCardMesh = idCardResult.meshes[0]; // ID 카드의 루트 메쉬

    rootIdCardMesh.parent = parentMesh;
    rootIdCardMesh.position = BABYLON.Vector3.TransformCoordinates(
        finalIdCardWorldPos,
        BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
    );
    // 스케일 및 회전도 옵션이 제공되면 사용, 아니면 기본값 사용
    rootIdCardMesh.scaling = idCardOptions.scaling || new BABYLON.Vector3(7, 7, 7);

    // ID 카드가 테이블 위에 평평하게 놓이고 'R' 글자가 천장을 바라보도록 회전 조정
    rootIdCardMesh.rotationQuaternion = idCardOptions.rotation || BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, -Math.PI) // X축으로 -90도 회전하여 눕힘
        .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI)); // Y축 회전은 0으로 시작 (필요시 조정)

    idCardResult.meshes.forEach(mesh => {
        mesh.checkCollisions = true;
        mesh.isVisible = true; // 강제로 보이게 함
    });

    // ===========================================
    // === 🧪 laboratory_cabinet.glb 설정 시작 ===
    // ===========================================

    const defaultLaboratoryCabinetWorldPos = new BABYLON.Vector3(-18.16, 6.48, 11.55); // 예시 위치, 필요에 따라 조정
    const finalLaboratoryCabinetWorldPos = laboratoryCabinetOptions.position || defaultLaboratoryCabinetWorldPos;

    let laboratoryCabinetResult;
    try {
        laboratoryCabinetResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "laboratory_cabinet.glb", scene);
    } catch (error) {
        console.error("오류 상세: ", error);
        return;
    }

    if (!laboratoryCabinetResult || !laboratoryCabinetResult.meshes || laboratoryCabinetResult.meshes.length === 0) {
        return;
    }

    const rootLaboratoryCabinetMesh = laboratoryCabinetResult.meshes[0];

    rootLaboratoryCabinetMesh.parent = parentMesh;
    rootLaboratoryCabinetMesh.position = BABYLON.Vector3.TransformCoordinates(
        finalLaboratoryCabinetWorldPos,
        BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
    );
    rootLaboratoryCabinetMesh.scaling = laboratoryCabinetOptions.scaling || new BABYLON.Vector3(130, 150, 100); // 스케일 조정 (기존 모델과 비슷하게)

    // X축으로 90도 회전하여 세우고, Y축 회전은 필요에 따라 조정
    rootLaboratoryCabinetMesh.rotationQuaternion = laboratoryCabinetOptions.rotation || BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
        .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, -Math.PI)); // 예시: 90도 회전 (문 방향 확인 후 조정)

    laboratoryCabinetResult.meshes.forEach(mesh => {
        mesh.checkCollisions = true;
        mesh.isVisible = true; // 강제로 보이게 함
    });

    // ===========================================
    // === 🧪 laboratory_cabinet.glb 설정 끝 ===
    // ===========================================

    // 캐비닛의 월드 위치 정의
    const metalCabinetWorldPos1 = new BABYLON.Vector3(-21.85, 7.40, -2.15);
    const metalCabinetWorldPos2 = new BABYLON.Vector3(-23.25, 7.40, -2.15); // 두 번째 캐비닛의 위치 (조정됨)

    async function loadMetalCabinet(worldPosition, parentMesh, scene, options = {}) {
        let metalCabinetResult;
        try {
            metalCabinetResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "metal_cabinet.glb", scene);
        } catch (error) {
            console.error("오류 상세: ", error);
            return null; // 로드 실패 시 null 반환
        }

        if (!metalCabinetResult || !metalCabinetResult.meshes || metalCabinetResult.meshes.length === 0) {
            return null;
        }

        const rootMetalCabinetMesh = metalCabinetResult.meshes[0];

        rootMetalCabinetMesh.parent = parentMesh;

        // 월드 위치를 부모 메쉬의 로컬 좌표로 변환하여 적용
        rootMetalCabinetMesh.position = BABYLON.Vector3.TransformCoordinates(
            worldPosition,
            BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
        );

        // 스케일 적용 (옵션이 있으면 사용, 없으면 기본값)
        rootMetalCabinetMesh.scaling = options.scaling || new BABYLON.Vector3(130, 200, 100);

        // 회전 적용 (옵션이 있으면 사용, 없으면 기본값)
        rootMetalCabinetMesh.rotationQuaternion = options.rotation || BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
            .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 36));

        // 모든 메쉬에 충돌 감지 및 가시성 설정
        metalCabinetResult.meshes.forEach(mesh => {
            mesh.checkCollisions = true;
            mesh.isVisible = true;
        });

        return rootMetalCabinetMesh; // 생성된 루트 메쉬 반환 (필요시 추가 조작용)
    }

    // 각 캐비닛을 로드하여 장면에 추가합니다.
    // 개별 옵션이 필요하다면 세 번째 인자에 객체로 전달할 수 있습니다.
    const cabinet1 = await loadMetalCabinet(metalCabinetWorldPos1, parentMesh, scene, {
        // scaling: new BABYLON.Vector3(100, 200, 100), // 필요에 따라 개별 스케일 지정
        // rotation: BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2) // 필요에 따라 개별 회전 지정
    });
    const cabinet2 = await loadMetalCabinet(metalCabinetWorldPos2, parentMesh, scene);

}