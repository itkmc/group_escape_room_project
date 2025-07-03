// office.js
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";

/**
 * 의사 사무실 구성 요소를 씬에 추가
 * @param {BABYLON.Scene} scene - Babylon.js Scene
 * @param {BABYLON.AbstractMesh} parentMesh - 병원 건물 메시 등
 * @param {object} [idCardOptions] - ID 카드의 위치, 스케일, 회전 설정을 위한 객체 (선택 사항)
 * @param {BABYLON.Vector3} [idCardOptions.position] - ID 카드의 월드 위치
 * @param {BABYLON.Vector3} [idCardOptions.scaling] - ID 카드의 스케일
 * @param {BABYLON.Quaternion} [idCardOptions.rotation] - ID 카드의 회전 쿼터니언
 */
export async function addDoctorOffice(scene, parentMesh, idCardOptions = {}) {
    if (!parentMesh) {
        console.warn("❗ parentMesh가 없습니다.");
        return;
    }

    // ===========================================
    // === 📚 책 서랍장 (wooden_book.glb) 설정 시작 ===
    // ===========================================

    const desiredBookcaseWorldPos = new BABYLON.Vector3(-24.05, 6.45, 11.85); // 현재 설정된 위치
    let bookCaseResult;
    try {
        bookCaseResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "wooden_book.glb", scene);
        console.log("✔️ 'wooden_book.glb' 모델 로드 성공.");
    } catch (error) {
        console.error("❌ 'wooden_book.glb' 모델 로드 실패:", error);
        console.error("오류 상세: ", error);
        return;
    }

    if (!bookCaseResult || !bookCaseResult.meshes || bookCaseResult.meshes.length === 0) {
        console.warn("❗ 'wooden_book.glb'에서 유효한 메쉬를 찾을 수 없습니다.");
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

    console.log("✔️ 책 서랍장 구성 요소가 씬에 추가되었습니다.");
    console.log("책 서랍장 루트 메쉬의 현재 스케일:", rootBookcaseMesh.scaling);
    console.log("책 서랍장 루트 메쉬의 현재 위치:", rootBookcaseMesh.position);

    // ===========================================
    // === 📚 책 서랍장 (wooden_book.glb) 설정 끝 ===
    // ===========================================

    // ===========================================
    // === 🪑 긴 테이블 (long_table.glb) 설정 시작 ===
    // ===========================================

    const desiredTableWorldPos = new BABYLON.Vector3(-20.05, 6.37, 6.30); // 사용자님이 설정하신 위치 유지
    let tableResult;
    try {
        tableResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "long_table.glb", scene);
        console.log("✔️ 'long_table.glb' 모델 로드 성공.");
    } catch (error) {
        console.error("❌ 'long_table.glb' 모델 로드 실패:", error);
        console.error("오류 상세: ", error);
        console.error("모델 경로 '/models/long_table.glb' 및 파일명 확인. CORS 문제일 수도 있습니다.");
        return;
    }

    if (!tableResult || !tableResult.meshes || tableResult.meshes.length === 0) {
        console.warn("❗ 'long_table.glb'에서 유효한 메쉬를 찾을 수 없습니다.");
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

    console.log("✔️ 긴 테이블 구성 요소가 씬에 추가되었습니다.");
    console.log("로드된 테이블 메쉬 목록:", tableResult.meshes.map(m => m.name));
    console.log("테이블 루트 메쉬의 현재 스케일:", rootTableMesh.scaling);
    console.log("테이블 루트 메쉬의 현재 위치:", rootTableMesh.position);

    // ===========================================
    // === 🪑 긴 테이블 (long_table.glb) 설정 끝 ===
    // ===========================================

    // ===========================================
    // === 🪑 앤티크 의자 (antique_chair.glb) 설정 시작 ===
    // ===========================================

    // 💡 첫 번째 의자의 월드 위치 (기준이 될 의자) - 테이블 앞 중앙
    const desiredChair1WorldPos = new BABYLON.Vector3(-20.05, 6.50, 4.5);

    let chairResult;
    try {
        chairResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "antique_chair.glb", scene);
        console.log("✔️ 'antique_chair.glb' 모델 로드 성공.");
    } catch (error) {
        console.error("❌ 'antique_chair.glb' 모델 로드 실패:", error);
        console.error("오류 상세: ", error);
        console.error("모델 경로 '/models/antique_chair.glb' 및 파일명 확인. CORS 문제일 수도 있습니다.");
        return;
    }

    if (!chairResult || !chairResult.meshes || chairResult.meshes.length === 0) {
        console.warn("❗ 'antique_chair.glb'에서 유효한 메쉬를 찾을 수 없습니다.");
        return;
    }

    // 원본 의자 메쉬 (인스턴스 생성의 기준이 됩니다)
    const rootChairMesh = chairResult.meshes[0];

    // 모든 자식 메시를 포함하여 isVisible과 checkCollisions 설정
    chairResult.meshes.forEach(mesh => {
        mesh.checkCollisions = true;
        mesh.isVisible = true; // 모든 자식 메시를 강제로 보이게 함
    });

    // ✅ 첫 번째 의자 (원본) - 테이블 앞 중앙
    rootChairMesh.parent = parentMesh;
    rootChairMesh.position = BABYLON.Vector3.TransformCoordinates(
        desiredChair1WorldPos,
        BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
    );
    rootChairMesh.scaling = new BABYLON.Vector3(10, 10, 10);
    rootChairMesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
        .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI)); // 테이블을 바라보도록 180도 회전
    console.log("✔️ 첫 번째 앤티크 의자 배치 완료:", rootChairMesh.name);
    console.log("첫 번째 의자 루트 메쉬의 현재 스케일:", rootChairMesh.scaling);
    console.log("첫 번째 의자 루트 메쉬의 현재 위치:", rootChairMesh.position);

    // ===========================================
    // === 🪑 앤티크 의자 (antique_chair.glb) 설정 끝 ===
    // ===========================================

    // ===========================================
    // === 🆔 ID 카드 (id_card.glb) 설정 시작 ===
    // ===========================================

    // ID 카드를 배치할 월드 위치 결정 (옵션이 제공되면 사용, 아니면 기본값 사용)
    const defaultIdCardWorldPos = new BABYLON.Vector3(-20.50, 7.75, 5.21); // 사용자님이 설정하신 기본 위치 유지
    const finalIdCardWorldPos = idCardOptions.position || defaultIdCardWorldPos;

    let idCardResult;
    try {
        idCardResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "id_card.glb", scene);
        console.log("✔️ 'id_card.glb' 모델 로드 성공.");
    } catch (error) {
        console.error("❌ 'id_card.glb' 모델 로드 실패:", error);
        console.error("오류 상세: ", error);
        console.error("모델 경로 '/models/id_card.glb' 및 파일명 확인. CORS 문제일 수도 있습니다.");
        return;
    }

    if (!idCardResult || !idCardResult.meshes || idCardResult.meshes.length === 0) {
        console.warn("❗ 'id_card.glb'에서 유효한 메쉬를 찾을 수 없습니다.");
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
    // 기존: .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI));
    // 변경: Y축 회전을 Math.PI / 2 (90도)로 조정하여 'R' 글자가 천장을 바라보게 시도
    // 만약 여전히 옆으로 누워 있다면, Math.PI * 1.5 (270도) 또는 -Math.PI / 2 등으로 변경해가며 실험이 필요합니다.
    rootIdCardMesh.rotationQuaternion = idCardOptions.rotation || BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2) // 평평하게 눕힘
        .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2)); // 'R' 글자 방향 조정 (90도 회전)

    idCardResult.meshes.forEach(mesh => {
        mesh.checkCollisions = true;
        mesh.isVisible = true; // 강제로 보이게 함
        // ID 카드에 클릭 이벤트를 추가할 수도 있습니다 (예: 정보 표시)
        // if (!mesh.actionManager) {
        //     mesh.actionManager = new BABYLON.ActionManager(scene);
        // }
        // mesh.actionManager.registerAction(
        //     new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function () {
        //         console.log("ID 카드가 클릭되었습니다!");
        //         // 여기에 ID 카드 정보 표시 등의 로직 추가
        //     })
        // );
    });

    console.log("✔️ ID 카드 구성 요소가 씬에 추가되었습니다.");
    console.log("ID 카드 루트 메쉬의 현재 스케일:", rootIdCardMesh.scaling);
    console.log("ID 카드 루트 메쉬의 현재 위치:", rootIdCardMesh.position);
    console.log("ID 카드 루트 메쉬의 현재 회전 (쿼터니언):", rootIdCardMesh.rotationQuaternion);


    // ===========================================
    // === 🆔 ID 카드 (id_card.glb) 설정 끝 ===
    // ===========================================
  }