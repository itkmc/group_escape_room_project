// op_room.js
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";


/**
 * 수술실 내 오브젝트들 (모니터, 수술대, 사물함 등)을 Babylon.js 씬에 추가
 * @param {BABYLON.Scene} scene - Babylon.js Scene
 * @param {BABYLON.AbstractMesh} parentMesh - 건물 메시에 붙일 부모
 * @param {Function} [handleOperatingRoomScrollClick] - 두루마리 클릭 시 호출될 콜백 함수
 * @param {Function} [onCardPickedCallback] - 카드 클릭 함수
 * @param {Function} [onSurgeryBoxClick] - 상자가 클릭되었을 때 호출될 콜백 함수 
 */
export async function addOperatingRoom(scene, parentMesh, handleOperatingRoomScrollClick, onCardPickedCallback, onSurgeryBoxClick) {
  if (!parentMesh) {
    console.warn("parentMesh가 없습니다. 오브젝트들이 부모에 연결되지 않습니다.");
    return;
  }
  
// --- 상자 위치 ---
const surgery_toolsWorldPos = new BABYLON.Vector3(6.30, 7.19, 11.10);
const surgery_toolsResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "first_aid_box_19_mb.glb", scene);
const rootSurgeryToolsMesh = surgery_toolsResult.meshes[0]; 
rootSurgeryToolsMesh.parent = parentMesh;
rootSurgeryToolsMesh.position = BABYLON.Vector3.TransformCoordinates(
    surgery_toolsWorldPos,
    BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
);

rootSurgeryToolsMesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
    .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI));

rootSurgeryToolsMesh.scaling = new BABYLON.Vector3(11, 11, 11);
rootSurgeryToolsMesh.checkCollisions = true;
rootSurgeryToolsMesh.isPickable = true;

const lidMainMesh = surgery_toolsResult.meshes.find(mesh => mesh.name === "01_01_0");
const lidHandleMesh = surgery_toolsResult.meshes.find(mesh => mesh.name === "01_2_4_01_0");

if (lidMainMesh instanceof BABYLON.AbstractMesh && lidHandleMesh instanceof BABYLON.AbstractMesh) {
    const lidMainMeshReady = lidMainMesh.onReadyObservable ? new Promise(resolve => lidMainMesh.onReadyObservable.addOnce(resolve)) : Promise.resolve();
    const lidHandleMeshReady = lidHandleMesh.onReadyObservable ? new Promise(resolve => lidHandleMesh.onReadyObservable.addOnce(resolve)) : Promise.resolve();

    Promise.all([lidMainMeshReady, lidHandleMeshReady]).then(() => {
        const lidMainMeshBoundingBox = lidMainMesh.getBoundingInfo().boundingBox;
        
        const hingeWorldX = (lidMainMeshBoundingBox.minimumWorld.x + lidMainMeshBoundingBox.maximumWorld.x) / 2;
        const hingeWorldY = lidMainMeshBoundingBox.minimumWorld.y; 
        const hingeWorldZ = lidMainMeshBoundingBox.maximumWorld.z; 

        const lidGroupParent = new BABYLON.TransformNode("lidGroupParent", scene);
        lidGroupParent.parent = rootSurgeryToolsMesh;
        
        lidGroupParent.position = BABYLON.Vector3.TransformCoordinates(
            new BABYLON.Vector3(hingeWorldX, hingeWorldY, hingeWorldZ),
            BABYLON.Matrix.Invert(rootSurgeryToolsMesh.getWorldMatrix())
        );

        lidMainMesh.setParent(lidGroupParent);
        lidHandleMesh.setParent(lidGroupParent);

        lidMainMesh.position = BABYLON.Vector3.TransformCoordinates(
            lidMainMesh.absolutePosition, 
            BABYLON.Matrix.Invert(lidGroupParent.getWorldMatrix())
        );
        lidHandleMesh.position = BABYLON.Vector3.TransformCoordinates(
            lidHandleMesh.absolutePosition, 
            BABYLON.Matrix.Invert(lidGroupParent.getWorldMatrix())
        );

        const animatableLidGroup = lidGroupParent; 
        animatableLidGroup.rotationQuaternion = BABYLON.Quaternion.Identity();

        const initialRotationQuaternion = animatableLidGroup.rotationQuaternion.clone();
        // X축 회전이 올바른 축인지 확인. 필요시 Y나 Z로 변경
        const openRotationQuaternion = initialRotationQuaternion.multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)); 

        let lidIsOpen = false; 
        let isAnimating = false; 

        // 중요: lidMainMesh만 클릭 가능하게 하고 나머지는 false로 설정
        lidMainMesh.isPickable = true;
        lidHandleMesh.isPickable = false;
        animatableLidGroup.isPickable = false;

        lidMainMesh.actionManager = new BABYLON.ActionManager(scene);

        // 중요: 상자 클릭 시 비밀번호 UI를 띄우도록 콜백 함수를 호출
        lidMainMesh.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                BABYLON.ActionManager.OnPickTrigger,
                function () {
                    console.log("=== 상자 클릭 감지 ===");
                    console.log(`현재 lidIsOpen: ${lidIsOpen}, isAnimating: ${isAnimating}`);

                    // 애니메이션 중일 때는 추가 동작 방지
                    if (isAnimating) {
                        console.log("애니메이션이 진행 중입니다. 동작 중지.");
                        return;
                    }
                    
                    // onSurgeryBoxClick 콜백이 유효하면 호출
                    if (typeof onSurgeryBoxClick === 'function') {
                        // Promise를 반환하여, 비밀번호 입력 결과를 기다립니다.
                        onSurgeryBoxClick().then(isPasswordCorrect => {
                            console.log(`비밀번호 확인 결과: ${isPasswordCorrect}`);
                            if (isPasswordCorrect) {
                                console.log("비밀번호 정답! 애니메이션 시작 로직 진입.");
                                isAnimating = true; // 애니메이션 시작 플래그 설정
                                
                                // 현재 뚜껑 상태에 따라 목표 회전을 결정 (열려있으면 닫히고, 닫혀있으면 열림)
                                const targetRotation = lidIsOpen ? initialRotationQuaternion : openRotationQuaternion;

                                const animation = new BABYLON.Animation(
                                    "lidOpenCloseAnimation", 
                                    "rotationQuaternion", 
                                    60, // frames per second
                                    BABYLON.Animation.ANIMATIONTYPE_QUATERNION, 
                                    BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT 
                                );

                                animation.enableBlending = true;
                                animation.blendingSpeed = 0.05; 

                                const keys = [];
                                keys.push({ frame: 0, value: animatableLidGroup.rotationQuaternion.clone() });
                                keys.push({ frame: 30, value: targetRotation }); // 0.5초 동안 애니메이션 진행
                                
                                animation.setKeys(keys);

                                // 이전에 적용된 애니메이션을 지우고 새로 추가
                                animatableLidGroup.animations = []; 
                                animatableLidGroup.animations.push(animation);

                                console.log("Babylon.js 애니메이션 시작 호출.");
                                scene.beginAnimation(animatableLidGroup, 0, 30, false, 1, () => {
                                    console.log("Babylon.js 애니메이션 완료 콜백 실행.");
                                    lidIsOpen = !lidIsOpen; // 뚜껑 상태를 토글
                                    isAnimating = false;    // 애니메이션 종료 플래그 설정
                                    
                                    // 뚜껑이 열렸거나 닫혔을 때 다시 클릭 가능하도록 isPickable은 true 유지
                                    lidMainMesh.isPickable = true; 
                                    console.log(`애니메이션 완료 후 lidIsOpen: ${lidIsOpen}, isAnimating: ${isAnimating}`);
                                });
                            } else {
                                console.log("상자 비밀번호 틀림.");
                                // 비밀번호 틀렸다는 메시지는 scene.js에서 처리되므로, 여기서는 별다른 동작 없음
                            }
                        }).catch(error => {
                            console.error("onSurgeryBoxClick Promise 처리 중 오류 발생:", error); // 에러 로그 추가
                        });
                    } else {
                        console.warn("onSurgeryBoxClick 콜백이 제공되지 않았습니다. 상자 문을 열 수 없습니다.");
                    }
                }
            )
        );
    }).catch(error => { 
        console.error("Error during lid meshes onReadyObservable or setup:", error); // Promise.all catch 추가
    });
} else { 
    console.warn("Lid main mesh or handle mesh (01_01_0 or 01_2_4_01_0) not found for surgery tools box."); // 메시 누락 경고 추가
}

// 나머지 메시들에 대한 물리 Impostor 설정 (뚜껑 관련 메시 제외)
for (const mesh of surgery_toolsResult.meshes) {
    // 뚜껑 본체, 손잡이, 그리고 뚜껑 그룹 부모는 물리 Impostor에서 제외 (회전 애니메이션 위함)
    if (mesh.name === "01_01_0" || mesh.name === "01_2_4_01_0" || mesh.name === "lidGroupParent") {
        continue; 
    }

    if (mesh.isReady()) {
        mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.1, friction: 0.5 }, scene);
    } else {
        mesh.onReadyObservable?.addOnce(() => { 
            mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.1, friction: 0.5 }, scene);
        });
    }
}

  // --- 의료용 테이블 배치 ---
  const desiredMedicalTableWorldPos = new BABYLON.Vector3(6.10, 6.47, 11.37);
  const medicalTableResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "medical_table_-_17mb.glb", scene);

  let rootMedicalTableMesh = medicalTableResult.meshes.find(mesh => mesh.name === "__root__");

  if (!rootMedicalTableMesh) {
    rootMedicalTableMesh = medicalTableResult.meshes[0];
    console.warn("medical_table_-_17mb.glb에서 '__root__' 메쉬를 찾을 수 없습니다. 첫 번째 로드된 메쉬를 전체 모델의 루트로 사용합니다.");
  }

  if (rootMedicalTableMesh) {
    rootMedicalTableMesh.parent = parentMesh;
    rootMedicalTableMesh.position = BABYLON.Vector3.TransformCoordinates(
      desiredMedicalTableWorldPos,
      BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
    );
    rootMedicalTableMesh.scaling = new BABYLON.Vector3(92, 92, 92);
    rootMedicalTableMesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
      .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2));

    for (const mesh of medicalTableResult.meshes) {
    mesh.checkCollisions = true;
    if (mesh.isReady()) { 
        mesh.physicsImpostor = new BABYLON.PhysicsImpostor(
            mesh,
            BABYLON.PhysicsImpostor.BoxImpostor, 
            { mass: 0, restitution: 0.1, friction: 0.5 }, 
            scene
        );
    } else {
        mesh.onReadyObservable.addOnce(() => {
            mesh.physicsImpostor = new BABYLON.PhysicsImpostor(
                mesh,
                BABYLON.PhysicsImpostor.BoxImpostor,
                { mass: 0, restitution: 0.1, friction: 0.5 },
                scene
            );
        });
    }
};

    console.log("medical_table_-_17mb.glb 모델 전체가 성공적으로 배치되었습니다.");
  } else {
    console.error("medical_table_-_17mb.glb의 모델 루트 메쉬를 찾을 수 없습니다. 모델 구조를 확인하세요.");
  }
  
  // 자물쇠 위치
const combination_padlockWorldPos = new BABYLON.Vector3(6.95, 7.19, 11.21);
const combination_padlock = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "combination_padlock.glb", scene);

// 루프 변수 이름을 'mesh'로 변경하여 충돌 방지
for (const mesh of combination_padlock.meshes) {
    if (mesh.name !== "__root__") {
        mesh.parent = parentMesh;
        mesh.position = BABYLON.Vector3.TransformCoordinates(
            combination_padlockWorldPos,
            BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
        );
        mesh.scaling = new BABYLON.Vector3(1.5, 1.5, 1.5);
        mesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
            .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI));
        mesh.checkCollisions = true;
        if (mesh.isReady()) {
            mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.1, friction: 0.5 }, scene);
        } else {
            mesh.onReadyObservable.addOnce(() => {
                mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.1, friction: 0.5 }, scene);
            });
        }
    }
}

  // 벽안에 사람 월드 위치
  const dead_hazmat_femaleWorldPos1 = new BABYLON.Vector3(6.60, 6.55, 16.58);
  const dead_hazmat_femaleWorldPos2 = new BABYLON.Vector3(9.60, 6.55, 16.58);
  const dead_hazmat_femaleWorldPos3 = new BABYLON.Vector3(3.60, 6.55, 16.58);
    

  async function loadDeadHazmatFemale(worldPosition, parentMesh, scene) {
      const dead_hazmat_femaleResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "dead_hazmat_female.glb", scene);
      const rootMesh = dead_hazmat_femaleResult.meshes[0]; 

      rootMesh.parent = parentMesh;

      rootMesh.position = BABYLON.Vector3.TransformCoordinates(
          worldPosition,
          BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
      );

      rootMesh.scaling = new BABYLON.Vector3(130, 130, 130);

      rootMesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
          .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, -Math.PI));

      for (const mesh of dead_hazmat_femaleResult.meshes) {
    mesh.checkCollisions = true;
    if (mesh.isReady()) {
        mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.1, friction: 0.5 }, scene);
    } else {
        mesh.onReadyObservable.addOnce(() => {
            mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.1, friction: 0.5 }, scene);
        });
    }
};
  }

  // 각 모델을 로드하여 장면에 추가합니다.
  await loadDeadHazmatFemale(dead_hazmat_femaleWorldPos1, parentMesh, scene);
  await loadDeadHazmatFemale(dead_hazmat_femaleWorldPos2, parentMesh, scene);
  await loadDeadHazmatFemale(dead_hazmat_femaleWorldPos3, parentMesh, scene);
  
  // 문
const door1 = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "door.glb", scene);

// op_room에서만 사용하는 prefix 추가
const doorPrefix = "op_room_door_";

// 모든 mesh 이름에 prefix 추가
door1.meshes.forEach(mesh => {
  mesh.name = doorPrefix + mesh.name;
});

for (const doorMesh of door1.meshes) {
    // "Cube.002_Cube.000_My_Ui_0"은 문짝 메쉬의 실제 이름에 따라 다를 수 있습니다.
    if (doorMesh.name === doorPrefix + "Cube.002_Cube.000_My_Ui_0") {
        const pivot = new BABYLON.Vector3(0,-6.3,0); // 모델에 맞춰 수동 설정
        doorMesh.setPivotPoint(pivot);

        doorMesh.parent = parentMesh;
        doorMesh.position = BABYLON.Vector3.TransformCoordinates(
            new BABYLON.Vector3(2.1, 5, 12.58), // 문짝의 월드 위치
            BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
        );

        // 문의 초기 회전 설정
        const baseRotation = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI)
            .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, -Math.PI / 2))
            .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI));;

        doorMesh.rotationQuaternion = baseRotation.clone();
        doorMesh.scaling = new BABYLON.Vector3(31.8, 32.2, 31.8); // 문의 스케일
        doorMesh.checkCollisions = true; // 문에 대한 충돌 감지 활성화

        // 문 열림/닫힘 애니메이션 정의
        const startRotation = doorMesh.rotationQuaternion.clone();
        const openAngle = Math.PI / 2; // 문이 열리는 각도 (90도)
        const endRotation = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, openAngle).multiply(startRotation);

        const openAnim = new BABYLON.Animation(
            "doorOpen_op_room",
            "rotationQuaternion",
            30, // FPS
            BABYLON.Animation.ANIMATIONTYPE_QUATERNION,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        openAnim.setKeys([
            { frame: 0, value: startRotation },
            { frame: 30, value: endRotation },
        ]);

        const closeAnim = new BABYLON.Animation(
            "doorClose_op_room",
            "rotationQuaternion",
            30, // FPS
            BABYLON.Animation.ANIMATIONTYPE_QUATERNION,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        closeAnim.setKeys([
            { frame: 0, value: endRotation },
            { frame: 30, value: startRotation },
        ]);

        let isDoorOpen = false; // 문의 현재 상태 (열림/닫힘)
        let isAnimating = false; // 애니메이션 진행 여부

        // 마우스 클릭 시 문 열고 닫는 로직
        doorMesh.actionManager = new BABYLON.ActionManager(scene);
        doorMesh.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function () {
                if (isAnimating) return; // 애니메이션 중이면 중복 클릭 무시
                isAnimating = true;

                if (!isDoorOpen) {
                    // 문 닫힘 -> 열기
                    doorMesh.checkCollisions = false; // 문이 열릴 때 충돌 비활성화
                    scene.beginDirectAnimation(doorMesh, [openAnim], 0, 30, false, 1.0, () => {
                        isDoorOpen = true;
                        isAnimating = false;
                    });
                } else {
                    // 문 열림 -> 닫기
                    scene.beginDirectAnimation(doorMesh, [closeAnim], 0, 30, false, 1.0, () => {
                        doorMesh.checkCollisions = true; // 문이 완전히 닫히면 충돌 다시 활성화
                        isDoorOpen = false;
                        isAnimating = false;
                    });
                }
            })
        );
    }
}

  // 수술대 위치
  const desiredOperatingWorldPos = new BABYLON.Vector3(6.8, 6.43, 12.67);
  const operating = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "operating_table.glb", scene);
  for (const operatingMesh of operating.meshes) {
    if (operatingMesh.name !== "__root__") {
        operatingMesh.parent = parentMesh;
        operatingMesh.position = BABYLON.Vector3.TransformCoordinates(
            desiredOperatingWorldPos,
            BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
        );
        operatingMesh.scaling = new BABYLON.Vector3(20, 20, 20);
        operatingMesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
            .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, -Math.PI / 2));
        operatingMesh.checkCollisions = true;
        if (operatingMesh.isReady()) {
            operatingMesh.physicsImpostor = new BABYLON.PhysicsImpostor(operatingMesh, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.1, friction: 0.5 }, scene);
        } else {
            operatingMesh.onReadyObservable.addOnce(() => {
                operatingMesh.physicsImpostor = new BABYLON.PhysicsImpostor(operatingMesh, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.1, friction: 0.5 }, scene);
            });
        }
    }
};

  // 냉장고 안 애기 위치
  const alien_fetusWorldPos = new BABYLON.Vector3(11.20, 7.665, 14.00);
  const alien_fetus = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "alien_fetus.glb", scene);
  for (const alien_fetusMesh of alien_fetus.meshes) {
    if (alien_fetusMesh.name !== "__root__") {
        alien_fetusMesh.parent = parentMesh;
        alien_fetusMesh.position = BABYLON.Vector3.TransformCoordinates(
            alien_fetusWorldPos,
            BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
        );
        alien_fetusMesh.scaling = new BABYLON.Vector3(40, 40, 40);
        alien_fetusMesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, -Math.PI / 3)
            .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI));
        alien_fetusMesh.checkCollisions = true;
        if (alien_fetusMesh.isReady()) {
            alien_fetusMesh.physicsImpostor = new BABYLON.PhysicsImpostor(alien_fetusMesh, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.1, friction: 0.5 }, scene);
        } else {
            alien_fetusMesh.onReadyObservable.addOnce(() => {
                alien_fetusMesh.physicsImpostor = new BABYLON.PhysicsImpostor(alien_fetusMesh, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.1, friction: 0.5 }, scene);
            });
        }
    }
};


// 망치 위치
const dirty_tube__melee_weaponWorldPos = new BABYLON.Vector3(7.05, 7.22, 11.10);
const dirty_tube__melee_weaponResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "dirty_tube__melee_weapon.glb", scene);

for (const mesh of dirty_tube__melee_weaponResult.meshes) {
    if (mesh.name !== "__root__") {
        mesh.parent = parentMesh;
        mesh.position = BABYLON.Vector3.TransformCoordinates(
            dirty_tube__melee_weaponWorldPos,
            BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
        );

        if (mesh.name === "Object_2") {
            mesh.scaling = new BABYLON.Vector3(0.001, 0.001, 0.001); // Object_2의 스케일을 1로 설정 (예시 값)
            console.log(`Object_2 메시의 스케일이 ${mesh.scaling}으로 설정되었습니다.`);
        } else {
            // Object_2가 아닌 다른 메시들 (Object_3 포함)은 기존 스케일 적용
            mesh.scaling = new BABYLON.Vector3(2, 2, 2);
        }

        mesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI)
            .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, Math.PI / 2));
        mesh.checkCollisions = true;

        if (mesh.isReady()) {
            mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.1, friction: 0.5 }, scene);
        } else {
            mesh.onReadyObservable.addOnce(() => {
                mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.1, friction: 0.5 }, scene);
            });
        }
        // --- 망치 클릭 이벤트 리스너 추가 ---
        mesh.actionManager = new BABYLON.ActionManager(scene);
        mesh.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                BABYLON.ActionManager.OnPickTrigger,
                function (evt) {
                    const pickedMesh = evt.source;
                    if (pickedMesh === mesh) {
                        console.log("망치가 클릭되었습니다! (op_room에서)");

                        if (pickedMesh.physicsImpostor) {
                            pickedMesh.physicsImpostor.dispose();
                            pickedMesh.physicsImpostor = null;
                        }
                        pickedMesh.isPickable = false;
                        pickedMesh.setEnabled(false);

                        if (typeof onCardPickedCallback === 'function') {
                            onCardPickedCallback();
                        } else {
                            console.warn("onCardPickedCallback 함수가 제공되지 않았습니다. UI 상태가 업데이트되지 않을 수 있습니다.");
                        }
                    }
                }
            )
        );
    }
}

// 문제 위치 (두루마리)
const old__ancient_scrollWorldPos = new BABYLON.Vector3(11.2, 8.25, 14.5);
const old__ancient_scrollResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "old__ancient_scroll.glb", scene);

for (const mesh of old__ancient_scrollResult.meshes) {
    if (mesh.name !== "__root__") {
        mesh.parent = parentMesh;
        mesh.position = BABYLON.Vector3.TransformCoordinates(
            old__ancient_scrollWorldPos,
            BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
        );
        mesh.scaling = new BABYLON.Vector3(120, 120, 120);
        mesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI)
            .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI));

        mesh.checkCollisions = true;
        mesh.isPickable = true;
        if (mesh.isReady()) {
            mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.1, friction: 0.5 }, scene);
        } else {
            mesh.onReadyObservable.addOnce(() => {
                mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.1, friction: 0.5 }, scene);
            });
        }

        if (!mesh.actionManager) {
            mesh.actionManager = new BABYLON.ActionManager(scene);
        }
        mesh.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function () {
                console.log("두루마리가 클릭되었습니다! 퀴즈를 표시합니다.");

                if (handleOperatingRoomScrollClick) {
                    handleOperatingRoomScrollClick();
                }
            })
        );
    }
}

  
// 좀비 위치
const zombie_corpseWorldPos = new BABYLON.Vector3(5.8, 7.28, 13.37);
const zombie_corpse = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "zombie_corpse.glb", scene);

for (const zombie_corpseMesh of zombie_corpse.meshes) {
    if (zombie_corpseMesh.name !== "__root__") {
        zombie_corpseMesh.parent = parentMesh;
        zombie_corpseMesh.position = BABYLON.Vector3.TransformCoordinates(
            zombie_corpseWorldPos,
            BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
        );
        zombie_corpseMesh.scaling = new BABYLON.Vector3(12, 12, 12);
        zombie_corpseMesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, -Math.PI)
            .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, -Math.PI))
            .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, Math.PI / 3))
            .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, Math.PI));
        zombie_corpseMesh.checkCollisions = true;
        if (zombie_corpseMesh.isReady()) {
            zombie_corpseMesh.physicsImpostor = new BABYLON.PhysicsImpostor(zombie_corpseMesh, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.1, friction: 0.5 }, scene);
        } else {
            zombie_corpseMesh.onReadyObservable.addOnce(() => {
                zombie_corpseMesh.physicsImpostor = new BABYLON.PhysicsImpostor(zombie_corpseMesh, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.1, friction: 0.5 }, scene);
            });
        }
    }
}

 // --- 천장 사람 위치 ---
const kpWorldPos = new BABYLON.Vector3(3.3, 9.15, 12.15);
const kpResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "lady_of_the_asylum.glb", scene);

let rootKpMesh = null;

rootKpMesh = kpResult.meshes.find(mesh => mesh.name === "__root__");

if (!rootKpMesh) {
    rootKpMesh = kpResult.meshes[0];
}

kpResult.meshes.forEach(mesh => {
    if (mesh !== rootKpMesh && !mesh.parent) { 
        mesh.parent = rootKpMesh;
    }
});

kpResult.animationGroups.forEach(ag => {
    ag.stop();
});

if (rootKpMesh) {
    rootKpMesh.parent = parentMesh; 
    rootKpMesh.position = BABYLON.Vector3.TransformCoordinates(
        kpWorldPos,
        BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
    );

    rootKpMesh.scaling = new BABYLON.Vector3(80,80,80);

    rootKpMesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, -Math.PI/2)
        .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI/2));

    for (const mesh of kpResult.meshes) {
        mesh.checkCollisions = true;
        mesh.isPickable = true; 
        if (mesh.isReady()) {
            mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.1, friction: 0.5 }, scene);
        } else {
            mesh.onReadyObservable.addOnce(() => {
                mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.1, friction: 0.5 }, scene);
            });
        }
    }
}

  // --- 냉장고 위치 및 배치 ---
  const old_fridgeWorldPos = new BABYLON.Vector3(11.20, 6.65, 14.5);
  const old_fridgeResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "low_poly_old_rusty_fridge_-_game_ready.glb", scene);

  // op_room에서만 사용하는 prefix 추가
  const roomPrefix = "op_room_";
  
  // 모든 mesh 이름에 prefix 추가
  old_fridgeResult.meshes.forEach(mesh => {
    mesh.name = roomPrefix + mesh.name;
  });

  let rootFridgeMesh = null;
  rootFridgeMesh = old_fridgeResult.meshes.find(mesh => mesh.name === roomPrefix + "__root__");

  if (!rootFridgeMesh) {
    rootFridgeMesh = old_fridgeResult.meshes[0];
  }

  old_fridgeResult.animationGroups.forEach(ag => {
    ag.stop();
  });

  if (rootFridgeMesh) {
    rootFridgeMesh.parent = parentMesh;
    rootFridgeMesh.position = BABYLON.Vector3.TransformCoordinates(
      old_fridgeWorldPos,
      BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
    );

    rootFridgeMesh.scaling = new BABYLON.Vector3(14, 14, 14);

    rootFridgeMesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
      .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, -Math.PI / 2));

    // 냉장고 본체 디버깅을 위한 콘솔 출력
    console.log("=== op_room 냉장고 디버깅 ===");
    console.log("rootFridgeMesh:", rootFridgeMesh);
    console.log("rootFridgeMesh.isEnabled:", rootFridgeMesh.isEnabled);
    console.log("rootFridgeMesh.visibility:", rootFridgeMesh.visibility);
    console.log("rootFridgeMesh.position:", rootFridgeMesh.position);
    console.log("rootFridgeMesh.scaling:", rootFridgeMesh.scaling);
    console.log("rootFridgeMesh.material:", rootFridgeMesh.material);
    
    // 모든 mesh 정보 출력
    old_fridgeResult.meshes.forEach((mesh, index) => {
      console.log(`Mesh ${index}:`, {
        name: mesh.name,
        isEnabled: mesh.isEnabled,
        visibility: mesh.visibility,
        hasGeometry: mesh.geometry !== null,
        material: mesh.material
      });
    });

    for (const mesh of old_fridgeResult.meshes) {
    mesh.checkCollisions = true;
    mesh.isPickable = true;
    if (mesh.isReady()) {
        mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.1, friction: 0.5 }, scene);
    } else {
        mesh.onReadyObservable.addOnce(() => {
            mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.1, friction: 0.5 }, scene);
        });
    }
};
  }

  let door6Mesh = old_fridgeResult.meshes.find(mesh => mesh.name === roomPrefix + "Object_6");
  let isDoor6Open = false;

  let door8Mesh = old_fridgeResult.meshes.find(mesh => mesh.name === roomPrefix + "Object_8");
  let isDoor8Open = false;

  const closedRotation6 = door6Mesh ? door6Mesh.rotationQuaternion.clone() : BABYLON.Quaternion.Identity();
  const openRotation6 = closedRotation6.multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2));

  const closedRotation8 = door8Mesh ? door8Mesh.rotationQuaternion.clone() : BABYLON.Quaternion.Identity();
  const openRotation8 = closedRotation8.multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2));

  if (door6Mesh) {
    door6Mesh.rotationQuaternion = closedRotation6.clone();

    const openAnim6 = new BABYLON.Animation("fridgeDoorOpen_Object6_op_room", "rotationQuaternion", 30, BABYLON.Animation.ANIMATIONTYPE_QUATERNION, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    openAnim6.setKeys([
      { frame: 0, value: closedRotation6 },
      { frame: 30, value: openRotation6 }
    ]);

    const closeAnim6 = new BABYLON.Animation("fridgeDoorClose_Object6_op_room", "rotationQuaternion", 30, BABYLON.Animation.ANIMATIONTYPE_QUATERNION, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    closeAnim6.setKeys([
      { frame: 0, value: openRotation6 },
      { frame: 30, value: closedRotation6 }
    ]);

    door6Mesh.actionManager = new BABYLON.ActionManager(scene);
    door6Mesh.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function () {
        scene.stopAnimation(door6Mesh);

        if (!isDoor6Open) {
          scene.beginDirectAnimation(door6Mesh, [openAnim6], 0, 30, false);
        } else {
          scene.beginDirectAnimation(door6Mesh, [closeAnim6], 0, 30, false);
        }
        isDoor6Open = !isDoor6Open;
      })
    );
  }

  if (door8Mesh) {
    door8Mesh.rotationQuaternion = closedRotation8.clone();

    const openAnim8 = new BABYLON.Animation("fridgeDoorOpen_Object8_op_room", "rotationQuaternion", 30, BABYLON.Animation.ANIMATIONTYPE_QUATERNION, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    openAnim8.setKeys([
      { frame: 0, value: closedRotation8 },
      { frame: 30, value: openRotation8 }
    ]);

    const closeAnim8 = new BABYLON.Animation("fridgeDoorClose_Object8_op_room", "rotationQuaternion", 30, BABYLON.Animation.ANIMATIONTYPE_QUATERNION, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    closeAnim8.setKeys([
      { frame: 0, value: openRotation8 },
      { frame: 30, value: closedRotation8 }
    ]);

    door8Mesh.actionManager = new BABYLON.ActionManager(scene);
    door8Mesh.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function () {
        scene.stopAnimation(door8Mesh);

        if (!isDoor8Open) {
          scene.beginDirectAnimation(door8Mesh, [openAnim8], 0, 30, false);
        } else {
          scene.beginDirectAnimation(door8Mesh, [closeAnim8], 0, 30, false);
        }
        isDoor8Open = !isDoor8Open;
      })
    );
  }
}