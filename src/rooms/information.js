// information.js
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";

/**
 * @param {BABYLON.Scene} scene
 * @param {BABYLON.AbstractMesh} parentMesh
 * @param {Function} onDoorInteraction
 */
export async function addInformation(scene, parentMesh, onDoorInteraction) {
  const batStartPos = new BABYLON.Vector3(-11.85, 7.85, -12.01);
  const batEndPos = new BABYLON.Vector3(-9, 7.7, -12.5); // 입원실 문 위치
  const desiredDoor3WorldPos = new BABYLON.Vector3(-0, 6.3, 2);
  let doorMeshes = [];
  let isDoorOpen = false;
  let initialDoorRotations = new Map();
  let isUnlocked = false; // 한 번 열리면 true
 let onPaperClickForContent = false;
  // 문 추가 전에 씬 전체에서 같은 이름의 mesh를 모두 삭제
  ["Object_4", "Object_8"].forEach(name => {
    scene.meshes.filter(m => m.name === name).forEach(m => m.dispose());
  });

  const door3 = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "low_poly_door_-_game_ready.glb", scene);
  door3.meshes.forEach((mesh) => {
    if (mesh.name === "Object_4" || mesh.name === "Object_8") { // Object_4, Object_8만 남김
      mesh.parent = parentMesh;
      mesh.position = BABYLON.Vector3.TransformCoordinates(
        desiredDoor3WorldPos,
        BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
      );
      mesh.scaling = new BABYLON.Vector3(25, 58, 40);
      mesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
        .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI));
      mesh.checkCollisions = true;
      doorMeshes.push(mesh);
      initialDoorRotations.set(mesh.name, mesh.rotationQuaternion.clone());
    } else if (mesh.name !== "__root__") {
      mesh.setEnabled(false); // 필요 없는 부품 숨기기
    }
  });
    
  // 문 열기/닫기 애니메이션 함수
    const toggleDoor1 = () => {
      // 한 번이라도 열렸으면 isUnlocked = true
      if (!isUnlocked) {
        isUnlocked = true; // E키로 한 번 열면 해제
      }
      const animationGroup = new BABYLON.AnimationGroup("undergroundDoorAnimationGroup");
      doorMeshes.forEach((doorMesh) => {
        const startRotation = doorMesh.rotationQuaternion.clone();
        let targetRotation;
        if (isDoorOpen) {
          targetRotation = initialDoorRotations.get(doorMesh.name).clone();
        } else {
          targetRotation = initialDoorRotations.get(doorMesh.name)
            .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2));
        }
        const doorAnimation = new BABYLON.Animation(
          `doorRotation_${doorMesh.name}`,
          "rotationQuaternion",
          30,
          BABYLON.Animation.ANIMATIONTYPE_QUATERNION,
          BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        doorAnimation.setKeys([
          { frame: 0, value: startRotation },
          { frame: 60, value: targetRotation }
        ]);
        animationGroup.addTargetedAnimation(doorAnimation, doorMesh);
      });
      animationGroup.onAnimationGroupEndObservable.addOnce(() => {
        isDoorOpen = !isDoorOpen;
        animationGroup.dispose();
      });
      animationGroup.play(false);
    };
  
    // 모든 doorMeshes에 클릭 이벤트 등록
    doorMeshes.forEach((mesh) => {
      mesh.isPickable = true;
      mesh.actionManager = new BABYLON.ActionManager(scene);
      mesh.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
          BABYLON.ActionManager.OnPickTrigger,
          () => toggleDoor1()
        )
      );
    });
  
 

    // 벽 위치 정의
    const wallWorldPos1 = new BABYLON.Vector3(-14.1, 8, -8.70);
    const wallWorldPos2 = new BABYLON.Vector3(-0, 7, -8.70);
    const wallWorldPos3 = new BABYLON.Vector3(-2.42, 8, -13.5);
    const wallWorldPos4 = new BABYLON.Vector3(-9, 7, -14.2);
    const wallWorldPos5 = new BABYLON.Vector3(-9, 8.4, -9.85); // 입원실 문 벽
    const wallWorldPos6 = new BABYLON.Vector3(-9, 10, -11.7);
    const wallWorldPos7 = new BABYLON.Vector3(-2.5, 10, -9.55);


    async function wall(worldPosition, parentMesh, scene, rotationQuaternion = null, scalingVector = null) {
        const wall = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "gallery_bare_concrete_wall.glb", scene);
        const rootMesh = wall.meshes[0];
        rootMesh.parent = parentMesh;
        wall.meshes.forEach(mesh => {
            if (mesh !== rootMesh && mesh.getTotalVertices && mesh.getTotalVertices() > 0) {
                mesh.checkCollisions = true;
            }
            // 벽 밝기 조정 부분
            const gray = new BABYLON.Color3(0.2, 0.2, 0.2); // 중간 회색
            if (mesh.material) {
                if (mesh.material instanceof BABYLON.PBRMaterial) {
                    mesh.material.emissiveIntensity = 0;
                    mesh.material.albedoColor = gray;
                    mesh.material.reflectivityColor = gray;
                } else if (mesh.material instanceof BABYLON.StandardMaterial) {
                    mesh.material.emissiveColor = new BABYLON.Color3(0, 0, 0);
                    mesh.material.diffuseColor = gray;
                    mesh.material.specularColor = gray;
                    mesh.material.ambientColor = gray;
                }
            }
        });

        rootMesh.position = BABYLON.Vector3.TransformCoordinates(
            worldPosition,
            BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
        );

        if (scalingVector) {
            rootMesh.scaling = scalingVector;
        } else {
            rootMesh.scaling = new BABYLON.Vector3(50, 125.7, 50); // 높이 길이 기울기?
        }

        if (rotationQuaternion) {
            rootMesh.rotationQuaternion = rotationQuaternion;
        } else {
            rootMesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI/2)
                .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, Math.PI/2));
        }
    }
   
    await wall(wallWorldPos1, parentMesh, scene);

    const wallWorldPos2CustomScaling = new BABYLON.Vector3(100, 61, 70); 
    await wall(wallWorldPos2, parentMesh, scene, null, wallWorldPos2CustomScaling);
    const wallWorldPos3CustomRotation = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI)
        .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI /2));
    const wallWorldPos3CustomScaling = new BABYLON.Vector3(100, 80, 80);
    
    await wall(wallWorldPos3, parentMesh, scene, wallWorldPos3CustomRotation, wallWorldPos3CustomScaling);

    const wallWorldPos4CustomRotation = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI)
        .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI /2));
    const wallWorldPos4CustomScaling = new BABYLON.Vector3(100, 41.7, 50);
    
    await wall(wallWorldPos4, parentMesh, scene, wallWorldPos4CustomRotation, wallWorldPos4CustomScaling);
    
    const wallWorldPos5CustomRotation = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI)
        .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI /2));
    const wallWorldPos5CustomScaling = new BABYLON.Vector3(45, 30, 50); //높이, 길이, ?
    
    await wall(wallWorldPos5, parentMesh, scene, wallWorldPos5CustomRotation, wallWorldPos5CustomScaling);

    const wallWorldPos6CustomRotation = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI)
        .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI /2));
    const wallWorldPos6CustomScaling = new BABYLON.Vector3(20, 20, 10); //높이, 길이, ?
    
    await wall(wallWorldPos6, parentMesh, scene, wallWorldPos6CustomRotation, wallWorldPos6CustomScaling);
    
    const wallWorldPos7CustomRotation = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI)
        .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI /2));
    const wallWorldPos7CustomScaling = new BABYLON.Vector3(13.5, 18.8, 10); //높이, 길이, ?
    
    await wall(wallWorldPos7, parentMesh, scene, wallWorldPos7CustomRotation, wallWorldPos7CustomScaling);

     // 입원실 문
    const doorResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "door_wood.glb", scene);
    
    // 문 밝기 조정 부분
    doorResult.meshes.forEach(mesh => {
      const gray = new BABYLON.Color3(0.2, 0.2, 0.2); // 중간 회색
      if (mesh.material) {
        if (mesh.material instanceof BABYLON.PBRMaterial) {
          mesh.material.emissiveIntensity = 0;
          mesh.material.albedoColor = gray;
          mesh.material.reflectivityColor = gray;
        } else if (mesh.material instanceof BABYLON.StandardMaterial) {
          mesh.material.emissiveColor = new BABYLON.Color3(0, 0, 0);
          mesh.material.diffuseColor = gray;
          mesh.material.specularColor = gray;
          mesh.material.ambientColor = gray;
        }
      }
    });
    
    let frameMesh = null;
    let doorMesh = null;
    let handleMesh = null;
    
    doorResult.meshes.forEach((mesh) => {
      if (mesh.name === "DoorFrame_MAT_Door_0") {
        frameMesh = mesh;
      }
      if (mesh.name === "Door_MAT_Door_0") {
        doorMesh = mesh;
      }
      if (mesh.name === "Handle_Back_MAT_Handle_0") {
        handleMesh = mesh;
      }
    });
    
    if (frameMesh && doorMesh) {
      // 전체 문 어셈블리의 부모 역할을 할 TransformNode 생성
      const doorGroup = new BABYLON.TransformNode("doorGroup", scene);
      doorGroup.parent = parentMesh;
      doorGroup.position = BABYLON.Vector3.TransformCoordinates(
        new BABYLON.Vector3(-9, 7.7, -12.5),
        
        BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
      );
      doorGroup.scaling = new BABYLON.Vector3(170.2, 140, 150);
      doorGroup.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, Math.PI)
      .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, Math.PI / 2));
    
      // 문짝을 doorGroup에 직접 붙임
      doorMesh.parent = doorGroup;
      doorMesh.position = BABYLON.Vector3.Zero();
      doorMesh.scaling = new BABYLON.Vector3(1, 1, 1);
      doorMesh.rotationQuaternion = null;
      doorMesh.isPickable = true;
      doorMesh.checkCollisions = true;
      // 피벗을 z축 한쪽 끝으로 미세 조정 (닫힐 때 항상 같은 자리)
      doorMesh.setPivotPoint(new BABYLON.Vector3(0, 0, -1.05));
    
      if (handleMesh) {
        handleMesh.parent = doorMesh;
        handleMesh.position = BABYLON.Vector3.Zero();
        handleMesh.scaling = new BABYLON.Vector3(0, 0, 1);
        handleMesh.rotationQuaternion = BABYLON.Quaternion.Identity();
        handleMesh.checkCollisions = true;
      }
    
      // 쿼터니언 회전 애니메이션(열림/닫힘)
      const startRotation = BABYLON.Quaternion.Identity();
      const openAngle = Math.PI / 2;
      const endRotation = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, openAngle).multiply(startRotation);
    
      const openAnim = new BABYLON.Animation(
        "doorOpen",
        "rotationQuaternion",
        30,
        BABYLON.Animation.ANIMATIONTYPE_QUATERNION,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
      );
      openAnim.setKeys([
        { frame: 0, value: startRotation },
        { frame: 30, value: endRotation },
      ]);
    
      const closeAnim = new BABYLON.Animation(
        "doorClose",
        "rotationQuaternion",
        30,
        BABYLON.Animation.ANIMATIONTYPE_QUATERNION,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
      );
      closeAnim.setKeys([
        { frame: 0, value: endRotation },
        { frame: 30, value: startRotation },
      ]);
    
      let isDoorOpen = false;
      let isAnimating = false;
    
      doorMesh.actionManager = new BABYLON.ActionManager(scene);
      doorMesh.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function () {
          if (isAnimating) return;
          isAnimating = true;
          if (!isDoorOpen) {
            // 문이 열리기 시작할 때 박쥐도 동시에 날아오기
            if (batGroup && batGroup.isEnabled()) {
              // 박쥐 효과음 재생
              const audio = new Audio('/bat-sound.mp3');
              audio.play();
              const batAnim = new BABYLON.Animation(
                "batFly",
                "position",
                30,
                BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
                BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
              );
              batAnim.setKeys([
                { frame: 0, value: batGroup.position.clone() },
                { frame: 45, value: BABYLON.Vector3.TransformCoordinates(batEndPos, BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())) }
              ]);
              batGroup.animations = [batAnim];
              scene.beginAnimation(batGroup, 0, 45, false, 1, () => {
                batGroup.setEnabled(false); // 애니메이션 끝나면 사라짐
              });
            }
            scene.beginDirectAnimation(doorMesh, [openAnim], 0, 30, false, 1.0, () => {
              isDoorOpen = true;
              isAnimating = false;
            });
          } else {
            scene.beginDirectAnimation(doorMesh, [closeAnim], 0, 30, false, 1.0, () => {
              isDoorOpen = false;
              isAnimating = false;
            });
          }
        })
      );
    
    }
    
const loadPaper = async () => {
    const paperWorldPos = new BABYLON.Vector3(-17, 7.85, -8.8);
    const paper = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "paper_tablet.glb", scene);

    const textureUrl = `${process.env.PUBLIC_URL}/짱구문제4.png`;
    const paperMaterial = new BABYLON.StandardMaterial("paperMat", scene);
    paperMaterial.diffuseTexture = new BABYLON.Texture(textureUrl, scene);

    // --- 여기는 텍스처 크기(스케일) 및 반복 설정 (기존 코드) ---
    paperMaterial.diffuseTexture.hasAlpha = true;
    paperMaterial.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
    paperMaterial.backFaceCulling = false;
    paperMaterial.diffuseTexture.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
    paperMaterial.diffuseTexture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;

    paperMaterial.diffuseTexture.uScale = 0.92; // U 방향 (가로) 스케일
    paperMaterial.diffuseTexture.vScale = 0.85; // V 방향 (세로) 스케일

    // --- 여기부터 텍스처 위치(오프셋) 조절 ---
    // 이 값들을 조절하면서 텍스처가 메쉬 위에서 어떻게 이동하는지 확인해야 합니다.
    // 양수 값은 텍스처를 오른쪽/위쪽으로 이동시키고 (텍스처의 내용은 왼쪽/아래로 이동하는 것처럼 보임),
    // 음수 값은 텍스처를 왼쪽/아래쪽으로 이동시킵니다.
    paperMaterial.diffuseTexture.uOffset = 0.045; // U 방향 (가로) 오프셋
    paperMaterial.diffuseTexture.vOffset = 0.065; // V 방향 (세로) 오프셋
    // --- 여기까지 텍스처 위치(오프셋) 조절 ---

    for (const mesh of paper.meshes) {
        if (mesh.name === "Plane_Material_0") {
            mesh.dispose();
            continue;
        }

        if (mesh.name === "Plane.005_Material.002_0") {
            mesh.material = paperMaterial;
        }

        if (mesh.name !== "__root__") {
            mesh.parent = parentMesh;
            mesh.position = BABYLON.Vector3.TransformCoordinates(
                paperWorldPos,
                BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
            );
            mesh.scaling = new BABYLON.Vector3(200, 200, 200);
            mesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI)
                .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI));
            mesh.checkCollisions = true;
        }
    }
};

loadPaper();
  

//     // paper 위치 (모델의 원하는 월드 위치)
// const desiredPaperModelWorldPos = new BABYLON.Vector3(-17, 7.85, -8.8);

// try {
//     // 'paper_tablet.glb' 파일을 비동기적으로 로드합니다.
//     const paperModelResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "paper_tablet.glb", scene);

//     if (paperModelResult && paperModelResult.meshes && paperModelResult.meshes.length > 0) {
//         // 로드된 모델의 루트 메시 (가장 상위의 부모 메시)를 가져옵니다.
//         const rootPaperModelMesh = paperModelResult.meshes[0];

//         // 1. **모델의 부모 설정:** (루트 메쉬에만 적용)
//         rootPaperModelMesh.parent = parentMesh;

//         // 2. **모델의 위치 설정:** (루트 메쉬에만 적용)
//         rootPaperModelMesh.position = BABYLON.Vector3.TransformCoordinates(
//             desiredPaperModelWorldPos,
//             BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
//         );

//         // 3. **모델의 스케일 설정:** (루트 메쉬에만 적용)
//         // 전체 모델의 크기를 조절합니다. Z축 스케일은 0이 아니어야 합니다.
//         rootPaperModelMesh.scaling = new BABYLON.Vector3(130, 130, 130);

//         // 4. **모델의 회전 설정:** (루트 메쉬에만 적용)
//         // 원하는 전체 모델의 회전을 여기에 적용합니다.
//         // X축 90도 회전 후 Y축 180도 회전
//         rootPaperModelMesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
//             .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI));

//         // 5. **모든 하위 메쉬에 대한 개별 설정 (가시성, 충돌, 텍스처 등):**
//         paperModelResult.meshes.forEach(mesh => {
//             // 개발자 도구 콘솔에 모든 메시의 이름을 출력합니다. (디버깅용)
//             console.log(`[paper_tablet.glb] 메시 이름: ${mesh.name}`);

//             // 루트 메쉬가 아닌 하위 메쉬에만 특정 설정을 적용합니다.
//             if (mesh.name !== "__root__") {
//                 mesh.checkCollisions = true; // 충돌 감지 활성화 (기본)
//                 // mesh.isVisible = true; // 개별 메쉬의 가시성은 아래 조건문에서 명확히 설정합니다.
//                 mesh.isPickable = false;    // 기본적으로 클릭되지 않도록 설정 (필요한 메쉬만 true)

//                 // ⭐⭐ 여기에서 'Model_material1_0' 메쉬를 숨깁니다. ⭐⭐
//                 if (mesh.name === "Model_material1_0") {
//                     mesh.isVisible = false; // 이 메쉬를 씬에서 보이지 않게 합니다.
//                     console.log(`[paper_tablet.glb] 메시 '${mesh.name}'를 숨깁니다.`);
//                 }
//                 // ⭐⭐ 'Plane.005_Material.002_0' 메쉬에 텍스처를 적용하고 보이게 합니다. ⭐⭐
//                 else if (mesh.name === "Plane.005_Material.002_0") {
//                     mesh.isVisible = true; // 이 메쉬가 확실히 보이도록 설정
//                     const paperContentMaterial = new BABYLON.StandardMaterial("paperContentMat", scene);

//                     // 텍스처 경로에 process.env.PUBLIC_URL을 추가하여 안전하게 로드
//                     paperContentMaterial.diffuseTexture = new BABYLON.Texture(`${process.env.PUBLIC_URL}/짱구문제.png`, scene);
//                     paperContentMaterial.diffuseTexture.hasAlpha = true;
//                     paperContentMaterial.specularColor = new BABYLON.Color3(0.05, 0.05, 0.05);
//                     paperContentMaterial.roughness = 1.0;

//                     mesh.material = paperContentMaterial; // 해당 메시에 커스텀 재질 적용
//                     mesh.isPickable = true; // 이 메시가 클릭 가능하게 설정

//                     // 클릭 이벤트 리스너 추가
//                     if (!mesh.actionManager) {
//                         mesh.actionManager = new BABYLON.ActionManager(scene);
//                     }
//                     mesh.actionManager.registerAction(
//                         new BABYLON.ExecuteCodeAction(
//                             BABYLON.ActionManager.OnPickTrigger,
//                             function() {
//                                 console.log("✅ 흰 종이 클릭됨!");
//                                 if (window.onPaperClickForContent) {
//                                     // 팝업으로 보여줄 이미지 경로 (public 폴더 기준)
//                                     const popupImageUrl = `${process.env.PUBLIC_URL}/짱구문제.png`;
//                                     window.onPaperClickForContent(popupImageUrl);
//                                 }
//                             }
//                         )
//                     );
//                     console.log(`[paper_tablet.glb] 메시 '${mesh.name}'에 텍스처 적용 및 클릭 이벤트 설정 완료.`);
//                 }
//                 // 다른 메쉬들은 isPickable = false 상태 유지
//             }
//         });
//         console.log("✅ 종이 모델 'paper_tablet.glb' 로드 및 배치 완료.");
//     }
// } catch (error) {
//     console.error("❗ 'paper_tablet.glb' 로드 중 오류 발생: ", error);
// }


    // 책상 위치
    const deskWorldPos = new BABYLON.Vector3(-6, 7, -12);
    const desk = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "secretary_desk_-_20mb (1).glb", scene);

    for (const mesh of desk.meshes) { 
        if (mesh.name !== "__root__") {
            mesh.parent = parentMesh;
            mesh.position = BABYLON.Vector3.TransformCoordinates(
                deskWorldPos,
                BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
            );
            mesh.scaling = new BABYLON.Vector3(0.6, 0.8, 0.6);
            mesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI)
                .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI))
                .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI))
                .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI));
            mesh.checkCollisions = true;
        }
    }


// 철문 위치
const garageWorldPos = new BABYLON.Vector3(0, 6.7, 2.15);
const garage = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "garage_door_01.glb", scene);

// 정확한 문 메쉬 찾기
let garageDoorMesh = null;
for (const mesh of garage.meshes) {
    if (mesh.name === "Door.001_rolling-gate-g7c3d87256_1920_0") {
        garageDoorMesh = mesh;
        break; // 찾았으면 루프 종료
    }
}

if (garageDoorMesh) {
    // 부모 메쉬 설정 및 초기 위치/스케일/회전 설정 (기존 로직 유지)
    garageDoorMesh.parent = parentMesh;
    garageDoorMesh.position = BABYLON.Vector3.TransformCoordinates(
        garageWorldPos,
        BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
    );
    garageDoorMesh.scaling = new BABYLON.Vector3(45, 100, 50)
    garageDoorMesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI)
        .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI));
    garageDoorMesh.checkCollisions = true;
    garageDoorMesh.isPickable = true; // 명시적으로 클릭 가능하게 설정

    // 문 열림/닫힘 애니메이션 정의
    // 이전에 설정된 위치를 기반으로 시작 위치를 가져옵니다.
    const startPosition = garageDoorMesh.position.clone();
    // 문이 위로 5단위 올라간 위치 (필요에 따라 조절)
    const openPosition = startPosition.add(new BABYLON.Vector3(0, 0, 150));

    const openAnim = new BABYLON.Animation(
        "garageDoorOpenAnim",
        "position.z", // Y 앞으로 튀어나옴  x는 옆으로
        30, // FPS
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    openAnim.setKeys([
        { frame: 0, value: startPosition.z },
        { frame: 60, value: openPosition.z },
    ]);

    const closeAnim = new BABYLON.Animation(
        "garageDoorCloseAnim",
        "position.z",
        30,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    closeAnim.setKeys([
        { frame: 0, value: openPosition.z },
        { frame: 60, value: startPosition.z },
    ]);

    let isGarageDoorOpen = false;
    let isGarageAnimating = false;

    // 마우스 클릭 시 문 열고 닫는 로직
    garageDoorMesh.actionManager = new BABYLON.ActionManager(scene);
    garageDoorMesh.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function () {
            if (isGarageAnimating) return;
            isGarageAnimating = true;

            if (!isGarageDoorOpen) {
                // 문 닫힘 -> 열기
                garageDoorMesh.checkCollisions = false;
                scene.beginDirectAnimation(garageDoorMesh, [openAnim], 0, 60, false, 1.0, () => {
                    isGarageDoorOpen = true;
                    isGarageAnimating = false;
                });
            } else {
                // 문 열림 -> 닫기
                scene.beginDirectAnimation(garageDoorMesh, [closeAnim], 0, 60, false, 1.0, () => {
                    garageDoorMesh.checkCollisions = true;
                    isGarageDoorOpen = false;
                    isGarageAnimating = false;
                });
            }
        })
    );
} 



//알람 위치
  const alarmWorldPos = new BABYLON.Vector3(-9.145, 7.65, -13);
  const alarm = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "fire_alarm.glb", scene);

  for (const mesh of alarm.meshes) { 
      if (mesh.name !== "__root__") {
          mesh.parent = parentMesh;
          mesh.position = BABYLON.Vector3.TransformCoordinates(
              alarmWorldPos,
              BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
          );
          mesh.scaling = new BABYLON.Vector3(4,4,4)
          mesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, Math.PI)
              .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, -Math.PI/2));
          mesh.checkCollisions = true;
      }
  }

  // 커튼 관련 전역 변수들 (기존 코드와 동일)
  const curtainWorldPos1 = new BABYLON.Vector3(-18.5, 6.2, -8.7);
  const curtainWorldPos2 = new BABYLON.Vector3(-14.5, 6.2, -8.7);
  const curtainWorldPos3 = new BABYLON.Vector3(-18, 6.2, -15.7);
  // const curtainWorldPos4 = new BABYLON.Vector3(-9, 6.2, -15);

  /**
   * 커튼 모델을 로드하고 설정합니다.
   * @param worldPosition - 커튼이 배치될 월드 좌표계 위치.
   * @param parentMesh - 커튼이 연결될 부모 메쉬.
   * @param scene - 현재 Babylon.js 씬.
   * @param rotationQuaternion - 커튼의 회전 쿼터니언 (선택 사항).
   * @param scaling - 커튼의 스케일 (선택 사항).
   * @param texturePath - 커튼에 적용할 새로운 텍스처 이미지의 경로 (선택 사항, 추가된 부분).
   */
  async function curtain(
      worldPosition,
      parentMesh,
      scene,
      rotationQuaternion = null,
      scaling = null,
      texturePath = null // <-- 여기에 texturePath 매개변수 추가
  ) {
      const curtainResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "curtain_kp_closing.glb", scene);

      const rootMesh = curtainResult.meshes[0];
      rootMesh.parent = parentMesh;

      let interactiveMesh = curtainResult.meshes.find(mesh => mesh.name === "Object_9");

      if (!interactiveMesh) {
         interactiveMesh = rootMesh;
      }

      rootMesh.position = BABYLON.Vector3.TransformCoordinates(
          worldPosition,
          BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
      );

      rootMesh.scaling = scaling || new BABYLON.Vector3(65, 55, 35);
      rootMesh.rotationQuaternion = rotationQuaternion || BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
          .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI));

      // --- 텍스처 변경 로직 시작 ---
      if (texturePath) {
          // 로드된 모든 메쉬를 순회하며 재질을 찾고 텍스처를 변경합니다.
          for (const mesh of curtainResult.meshes) {
              if (mesh.material) {
                  if (mesh.material instanceof BABYLON.PBRMaterial) {
                      mesh.material.albedoTexture = new BABYLON.Texture(texturePath, scene);
                  }
                  else if (mesh.material instanceof BABYLON.StandardMaterial) {
                      mesh.material.diffuseTexture = new BABYLON.Texture(texturePath, scene);
                  }
              }
          }
      }
      // --- 텍스처 변경 로직 끝 ---

      for (const mesh of curtainResult.meshes) {
          mesh.checkCollisions = true;
          if (mesh.isReady()) {
              if (!mesh.physicsImpostor) {
                  mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.BoxImpostor, {
                      mass: 0,
                      restitution: 0.1,
                      friction: 0.5
                  }, scene);
              }
          } else {
              mesh.onReadyObservable.addOnce(() => {
                  if (!mesh.physicsImpostor) { 
                      mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.BoxImpostor, {
                          mass: 0,
                          restitution: 0.1,
                          friction: 0.5
                      }, scene);
                  }
              });
          }
      }

      const animGroups = curtainResult.animationGroups;
      if (animGroups.length > 0) {
          const curtainAnim = animGroups[0];

          curtainAnim.goToFrame(curtainAnim.to);
          curtainAnim.stop();

          let isOpen = false;

          if (!interactiveMesh.actionManager) { 
              interactiveMesh.actionManager = new BABYLON.ActionManager(scene);
          }
          interactiveMesh.isPickable = true;

          interactiveMesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
              BABYLON.ActionManager.OnPickTrigger,
              () => {
                  if (!isOpen) {
                      curtainAnim.start(false, 5, curtainAnim.to, curtainAnim.from, false);
                      isOpen = true;
                  } else {
                      curtainAnim.start(false, 5, curtainAnim.from, curtainAnim.to, false);
                      isOpen = false;
                  }
              }
          ));
      } 
  }

  const commonRotation3 = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
      .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2))
      .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI));

  // const customRotation4 = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
  //     .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI))
  //     .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI));

  const myCurtainTexture1 = "/asdfasdf.jpg"; 
  const myCurtainTexture2 = "/asdfasdf.jpg"; 
  const myCurtainTexture3 = "/asdfasdf.jpg"; 
  // const myCurtainTexture4 = "/asdfasdf.jpg"; 

  (async () => {
      await curtain(curtainWorldPos1, parentMesh, scene, null, null, myCurtainTexture1);
      await curtain(curtainWorldPos2, parentMesh, scene, null, null, myCurtainTexture2);
      await curtain(curtainWorldPos3, parentMesh, scene, commonRotation3, new BABYLON.Vector3(55, 55, 40), myCurtainTexture3);
      // await curtain(curtainWorldPos4, parentMesh, scene, customRotation4, new BABYLON.Vector3(80, 55, 40), myCurtainTexture4);
  })();

  // 의자
      const chairWorldPos = [
          new BABYLON.Vector3(-7.16, 6.50, -11.5), 
          new BABYLON.Vector3(-4.14, 7, -13.5), 
          new BABYLON.Vector3(-6.13, 6.50, -11.45)
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
              rootChairMesh.scaling = options.scaling || new BABYLON.Vector3(8,8,8);
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
      await loadAntiqueChair(chairWorldPos[1], parentMesh, scene, { rotation: BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, -Math.PI).multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2)) });
      await loadAntiqueChair(chairWorldPos[2], parentMesh, scene, { rotation: BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2).multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI)) });

// 침대 
    const bedWorldPos1 = new BABYLON.Vector3(-16.7, 6.5, -9.4);
    const bedWorldPos2 = new BABYLON.Vector3(-12.6, 6.5, -9.5);
    const bedWorldPos3 = new BABYLON.Vector3(-17, 6.5, -14); 
    const bedWorldPos4 = new BABYLON.Vector3(-11.5, 6.5, -14.7);

    async function bed(worldPosition, parentMesh, scene, rotationQuaternion = null) {
        const bed = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "horror_bed.glb", scene);
        const rootMesh = bed.meshes[0]; 

        rootMesh.parent = parentMesh;

        rootMesh.position = BABYLON.Vector3.TransformCoordinates(
            worldPosition,
            BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
        );

        rootMesh.scaling = new BABYLON.Vector3(100, 100, 100);

        if (rotationQuaternion) {
            rootMesh.rotationQuaternion = rotationQuaternion;
        } else {
            rootMesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
                .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI));
        }

        for (const mesh of bed.meshes) {
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

    // 각 침대 모델을 로드하여 장면에 추가합니다.
    await bed(bedWorldPos1, parentMesh, scene);
    await bed(bedWorldPos2, parentMesh, scene);

    const oppositeRotation = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
        .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI));

    await bed(bedWorldPos3, parentMesh, scene, oppositeRotation);
    await bed(bedWorldPos4, parentMesh, scene, oppositeRotation);
   
    
  // 냉장고
  const old_fridgeWorldPos = new BABYLON.Vector3(-18.5, 6.5, -11.94);
  const old_fridgeResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "low_poly_old_rusty_fridge_-_game_ready.glb", scene);

  // information에서만 사용하는 prefix 추가
  const roomPrefix = "information_";
  
  // 모든 mesh 이름에 prefix 추가
  old_fridgeResult.meshes.forEach(mesh => {
    mesh.name = roomPrefix + mesh.name;
  });

  let rootFridgeMesh = null;
  rootFridgeMesh = old_fridgeResult.meshes.find(mesh => mesh.name === roomPrefix + "__root__");

  if (!rootFridgeMesh) {
      rootFridgeMesh = old_fridgeResult.meshes[0];
  }

  for (const ag of old_fridgeResult.animationGroups) {
      ag.stop();
  }

  if (rootFridgeMesh) {
      rootFridgeMesh.parent = parentMesh;
      rootFridgeMesh.position = BABYLON.Vector3.TransformCoordinates(
          old_fridgeWorldPos,
          BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
      );

      rootFridgeMesh.scaling = new BABYLON.Vector3(14, 14, 14);

      rootFridgeMesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
          .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, -Math.PI / 2))
          .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI)); // Y축 180도 추가

      
      // 모든 mesh 정보 출력
    //   old_fridgeResult.meshes.forEach((mesh, index) => {
    //     console.log(`Mesh ${index}:`, {
    //       name: mesh.name,
    //       isEnabled: mesh.isEnabled,
    //       visibility: mesh.visibility,
    //       hasGeometry: mesh.geometry !== null,
    //       material: mesh.material
    //     });
    //   });

      for (const mesh of old_fridgeResult.meshes) { // forEach를 for...of로 변경
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

      const openAnim6 = new BABYLON.Animation("fridgeDoorOpen_Object6_information", "rotationQuaternion", 30, BABYLON.Animation.ANIMATIONTYPE_QUATERNION, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
      openAnim6.setKeys([
          { frame: 0, value: closedRotation6 },
          { frame: 30, value: openRotation6 }
      ]);

      const closeAnim6 = new BABYLON.Animation("fridgeDoorClose_Object6_information", "rotationQuaternion", 30, BABYLON.Animation.ANIMATIONTYPE_QUATERNION, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
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

      const openAnim8 = new BABYLON.Animation("fridgeDoorOpen_Object8_information", "rotationQuaternion", 30, BABYLON.Animation.ANIMATIONTYPE_QUATERNION, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
      openAnim8.setKeys([
          { frame: 0, value: closedRotation8 },
          { frame: 30, value: openRotation8 }
      ]);

      const closeAnim8 = new BABYLON.Animation("fridgeDoorClose_Object8_information", "rotationQuaternion", 30, BABYLON.Animation.ANIMATIONTYPE_QUATERNION, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
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
  // 얼굴
  const faceResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "face_f2.glb", scene);
  for (const mesh of faceResult.meshes) { 
      if (mesh.name !== "__root__") {
          mesh.parent = parentMesh;
          mesh.position = BABYLON.Vector3.TransformCoordinates(
              new BABYLON.Vector3(-18.49, 8.4, -11.95),
              BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
          );
          mesh.scaling = new BABYLON.Vector3(15, 15, 15);
          mesh.checkCollisions = true;
          mesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, Math.PI / 2)
              .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, Math.PI));
      }
  }

  // 팔
  const body = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "halloween_rubber_arm.glb", scene);
  for (const mesh of body.meshes) { 
      if (mesh.name !== "__root__") {
          mesh.parent = parentMesh;
          mesh.position = BABYLON.Vector3.TransformCoordinates(
              new BABYLON.Vector3(-18.49, 7.2, -11.95),
              BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
          );
          mesh.scaling = new BABYLON.Vector3(80,80,80);
          mesh.checkCollisions = true;
          mesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI)
              .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI));
      }
  }

  // 뱀파이어 박쥐
  let batGroup = new BABYLON.TransformNode("batGroup", scene);
  batGroup.parent = parentMesh;
  batGroup.position = BABYLON.Vector3.TransformCoordinates(
      batStartPos,
      BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
  );
  const vampireBatResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "vampire_bat.glb", scene);
  for (const mesh of vampireBatResult.meshes) {
      if (mesh.name !== "__root__") {
          mesh.parent = batGroup;
          mesh.scaling = new BABYLON.Vector3(15, 15, 15);
          mesh.checkCollisions = true;
          // 문 쪽을 바라보게 회전
          const direction = batEndPos.subtract(batStartPos).normalize();
          const up = BABYLON.Vector3.Up();
          const lookQ = BABYLON.Quaternion.FromLookDirectionLH(direction, up);
          const fixQ = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, -Math.PI)
              .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2));
          mesh.rotationQuaternion = fixQ.multiply(lookQ);
      }
  }
}