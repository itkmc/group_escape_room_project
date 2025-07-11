// information.js
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";

/**
 * @param {BABYLON.Scene} scene 
 * @param {BABYLON.AbstractMesh} parentMesh 
 */
export async function addInformation(scene, parentMesh) {



    // 벽 위치 정의
    const wallWorldPos1 = new BABYLON.Vector3(-14.1, 7, -8.70);
    const wallWorldPos2 = new BABYLON.Vector3(-0, 7, -8.70);
    const wallWorldPos3 = new BABYLON.Vector3(-2.42, 7, -13.5);
    const wallWorldPos4 = new BABYLON.Vector3(-9, 7, -14.2);
    const wallWorldPos5 = new BABYLON.Vector3(-9, 7, -9.85);
    const wallWorldPos6 = new BABYLON.Vector3(-9, 10, -11.7);

    async function wall(worldPosition, parentMesh, scene, rotationQuaternion = null, scalingVector = null) {
        const wall = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "gallery_bare_concrete_wall.glb", scene);
        const rootMesh = wall.meshes[0];
        rootMesh.checkCollisions = true;
        rootMesh.parent = parentMesh;

        rootMesh.position = BABYLON.Vector3.TransformCoordinates(
            worldPosition,
            BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
        );

        if (scalingVector) {
            rootMesh.scaling = scalingVector;
        } else {
            rootMesh.scaling = new BABYLON.Vector3(80, 125.7, 50); // 높이 길이 기울기?
        }

        if (rotationQuaternion) {
            rootMesh.rotationQuaternion = rotationQuaternion;
        } else {
            rootMesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI/2)
                .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, Math.PI/2));
        }
    }
   
    await wall(wallWorldPos1, parentMesh, scene);

    const wallWorldPos2CustomScaling = new BABYLON.Vector3(100, 100, 70); 
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
    const wallWorldPos5CustomScaling = new BABYLON.Vector3(100, 30, 50); //높이, 길이, ?
    
    await wall(wallWorldPos5, parentMesh, scene, wallWorldPos5CustomRotation, wallWorldPos5CustomScaling);

    const wallWorldPos6CustomRotation = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI)
        .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI /2));
    const wallWorldPos6CustomScaling = new BABYLON.Vector3(20, 20, -10); //높이, 길이, ?
    
    await wall(wallWorldPos6, parentMesh, scene, wallWorldPos6CustomRotation, wallWorldPos6CustomScaling);


     // 문
    const doorResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "door_wood.glb", scene);
    
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

// 커튼 관련 전역 변수들 (기존 코드와 동일)
// const curtainWorldPos1 = new BABYLON.Vector3(-19.2, 6.2, -8.7);
const curtainWorldPos2 = new BABYLON.Vector3(-14.5, 6.2, -8.7);
const curtainWorldPos3 = new BABYLON.Vector3(-18, 6.2, -17);
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
        console.error("오류: 'Object_9' 메시를 GLB 파일에서 찾을 수 없습니다. 클릭 이벤트가 작동하지 않을 수 있습니다.");
        interactiveMesh = rootMesh;
    }

    rootMesh.position = BABYLON.Vector3.TransformCoordinates(
        worldPosition,
        BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
    );

    rootMesh.scaling = scaling || new BABYLON.Vector3(70.5, 70, 35.5);
    rootMesh.rotationQuaternion = rotationQuaternion || BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
        .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI));

    // --- 텍스처 변경 로직 시작 ---
    if (texturePath) {
        // 로드된 모든 메쉬를 순회하며 재질을 찾고 텍스처를 변경합니다.
        for (const mesh of curtainResult.meshes) {
            if (mesh.material) {
                // 재질이 PBRMaterial인 경우 albedoTexture를 설정합니다.
                if (mesh.material instanceof BABYLON.PBRMaterial) {
                    mesh.material.albedoTexture = new BABYLON.Texture(texturePath, scene);
                    console.log(`메쉬 '${mesh.name}'의 텍스처를 '${texturePath}'로 변경했습니다.`);
                }
                // 만약 StandardMaterial을 사용한다면 diffuseTexture를 설정합니다.
                else if (mesh.material instanceof BABYLON.StandardMaterial) {
                    mesh.material.diffuseTexture = new BABYLON.Texture(texturePath, scene);
                    console.log(`메쉬 '${mesh.name}'의 텍스처를 (StandardMaterial) '${texturePath}'로 변경했습니다.`);
                }
                // 다른 종류의 재질이거나 특정 메쉬만 변경하고 싶다면 여기에 추가 로직을 넣습니다.
            }
        }
    }
    // --- 텍스처 변경 로직 끝 ---

    for (const mesh of curtainResult.meshes) {
        mesh.checkCollisions = true;
        // physicsImpostor는 메쉬가 준비된 후에 설정하는 것이 안전합니다.
        if (mesh.isReady()) {
            if (!mesh.physicsImpostor) { // 중복 생성 방지
                mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.BoxImpostor, {
                    mass: 0,
                    restitution: 0.1,
                    friction: 0.5
                }, scene);
            }
        } else {
            mesh.onReadyObservable.addOnce(() => {
                if (!mesh.physicsImpostor) { // 중복 생성 방지
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

        if (!interactiveMesh.actionManager) { // ActionManager가 없으면 생성
            interactiveMesh.actionManager = new BABYLON.ActionManager(scene);
        }
        interactiveMesh.isPickable = true;

        interactiveMesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnPickTrigger,
            () => {
                console.log(`커튼 (${interactiveMesh.name})이 클릭되었습니다! 현재 열림 상태: ${isOpen}`);

                if (!isOpen) {
                    curtainAnim.start(false, 5, curtainAnim.to, curtainAnim.from, false);
                    isOpen = true;
                } else {
                    curtainAnim.start(false, 5, curtainAnim.from, curtainAnim.to, false);
                    isOpen = false;
                }
            }
        ));
    } else {
        console.warn("경고: 로드된 커튼 모델에 애니메이션 그룹이 없습니다.");
    }
}

// --- 정의된 회전값 (기존과 동일) ---
const commonRotation3 = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
    .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2))
    .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI));

// const customRotation4 = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
//     .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI))
//     .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI));

// --- 새로운 텍스처 경로 예시 (실제 이미지 파일 경로로 변경해야 합니다!) ---
// const myCurtainTexture1 = "/asdfasdf.jpg"; 
const myCurtainTexture2 = "/asdfasdf.jpg"; 
const myCurtainTexture3 = "/asdfasdf.jpg"; 
// const myCurtainTexture4 = "/asdfasdf.jpg"; 

(async () => {
    // curtainWorldPos1 위치에 빨간색 텍스처 커튼
    // await curtain(curtainWorldPos1, parentMesh, scene, null, null, myCurtainTexture1);

    // curtainWorldPos2 위치에 파란색 텍스처 커튼
    await curtain(curtainWorldPos2, parentMesh, scene, null, null, myCurtainTexture2);

    // curtainWorldPos3 위치에 특정 회전, 스케일, 패턴 텍스처 커튼
    await curtain(curtainWorldPos3, parentMesh, scene, commonRotation3, new BABYLON.Vector3(80, 70, 60), myCurtainTexture3);

    // curtainWorldPos4 위치에 사용자 정의 회전, 스케일, 초록색 텍스처 커튼
    // await curtain(curtainWorldPos4, parentMesh, scene, customRotation4, new BABYLON.Vector3(80, 55, 40), myCurtainTexture4);
})();

// 침대 
    const bedWorldPos1 = new BABYLON.Vector3(-17, 6.5, -9.4);
    const bedWorldPos2 = new BABYLON.Vector3(-12.5, 6.5, -9.5);
    const bedWorldPos3 = new BABYLON.Vector3(-17, 6.5, -14.7); 
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

  let rootFridgeMesh = null;
  rootFridgeMesh = old_fridgeResult.meshes.find(mesh => mesh.name === "__root__");

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

  let door6Mesh = old_fridgeResult.meshes.find(mesh => mesh.name === "Object_6");
  let isDoor6Open = false;

  let door8Mesh = old_fridgeResult.meshes.find(mesh => mesh.name === "Object_8");
  let isDoor8Open = false;

  const closedRotation6 = door6Mesh ? door6Mesh.rotationQuaternion.clone() : BABYLON.Quaternion.Identity();
  const openRotation6 = closedRotation6.multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2));

  const closedRotation8 = door8Mesh ? door8Mesh.rotationQuaternion.clone() : BABYLON.Quaternion.Identity();
  const openRotation8 = closedRotation8.multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2));

  if (door6Mesh) {
      door6Mesh.rotationQuaternion = closedRotation6.clone();

      const openAnim6 = new BABYLON.Animation("fridgeDoorOpen_Object6", "rotationQuaternion", 30, BABYLON.Animation.ANIMATIONTYPE_QUATERNION, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
      openAnim6.setKeys([
          { frame: 0, value: closedRotation6 },
          { frame: 30, value: openRotation6 }
      ]);

      const closeAnim6 = new BABYLON.Animation("fridgeDoorClose_Object6", "rotationQuaternion", 30, BABYLON.Animation.ANIMATIONTYPE_QUATERNION, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
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

      const openAnim8 = new BABYLON.Animation("fridgeDoorOpen_Object8", "rotationQuaternion", 30, BABYLON.Animation.ANIMATIONTYPE_QUATERNION, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
      openAnim8.setKeys([
          { frame: 0, value: closedRotation8 },
          { frame: 30, value: openRotation8 }
      ]);

      const closeAnim8 = new BABYLON.Animation("fridgeDoorClose_Object8", "rotationQuaternion", 30, BABYLON.Animation.ANIMATIONTYPE_QUATERNION, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
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

  // 몸
  const body = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "day9_body_male.glb", scene);
  for (const mesh of body.meshes) { // forEach를 for...of로 변경
      if (mesh.name !== "__root__") {
          mesh.parent = parentMesh;
          mesh.position = BABYLON.Vector3.TransformCoordinates(
              new BABYLON.Vector3(-18.51, 7.74, -11.95),
              BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
          );
          mesh.scaling = new BABYLON.Vector3(15, 15, 15);
          mesh.checkCollisions = true;
          mesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
              .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI));
      }
  }
}