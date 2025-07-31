// information.js
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";

/**
 * @param {BABYLON.Scene} scene
 * @param {BABYLON.AbstractMesh} parentMesh
 * @param {Function} onDoorInteraction
 */
export async function addInformation(scene, parentMesh, onDoorInteraction) {

    
// 입원실 문 위치 (이것은 door_old 모델 전체의 초기 위치 설정입니다.)
const door_oldWorldPos = new BABYLON.Vector3(-13.09, 7.7, -6.27);
const door_old = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "hospital_door_old_free.glb", scene);

// 문이 열렸는지 닫혔는지 상태를 추적하는 변수
let isDoorOpen = false;
// Glass_Material.001_0 메쉬의 초기 X 위치를 저장할 변수
let initialGlassDoorXPosition = 0;

for (const mesh of door_old.meshes) {
    if (mesh.name.startsWith("Cube_Material.001_0")) {
        mesh.dispose(); // 불필요한 메쉬 삭제
    }
    if (mesh.name !== "__root__") {
        mesh.parent = parentMesh;
        mesh.position = BABYLON.Vector3.TransformCoordinates(
            door_oldWorldPos,
            BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
        );
        mesh.scaling = new BABYLON.Vector3(130, 50, 75); // 넓이,두께, 높이
        mesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI)
            .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI));
        mesh.checkCollisions = true; // 충돌 검사 활성화
    }
}

// Glass_Material.001_0 메쉬 찾기
const glassMesh = scene.getMeshByName("Glass_Material.001_0");

if (glassMesh) {
    // Glass_Material.001_0 메쉬의 초기 X 위치를 저장합니다.
    // 이 위치가 문이 '닫힌' 상태의 기준점이 됩니다.
    initialGlassDoorXPosition = glassMesh.position.x;

    // Glass 메쉬에 액션 매니저를 추가하여 클릭 이벤트 감지
    glassMesh.actionManager = new BABYLON.ActionManager(scene);

    // 클릭 시 문 열림/닫힘 애니메이션 토글
    glassMesh.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnPickTrigger,
            function () {
                const doorToAnimate = glassMesh; // 애니메이션 대상은 Glass_Material.001_0 메쉬 자체입니다.

                // 문이 옆으로 이동할 거리 (양수 값). 이 값을 조절하여 문이 열리는 거리를 설정하세요.
                const slideDistance = 195; // 예: 5 단위 이동

                let targetX;
                if (isDoorOpen) {
                    // 문이 현재 열려있으면 -> 닫는 위치(초기 위치)로 이동
                    targetX = initialGlassDoorXPosition;
                } else {
                    targetX = initialGlassDoorXPosition - slideDistance; // 여기서는 왼쪽으로 열리는 것으로 가정
                }

                // 애니메이션 생성
                const animation = new BABYLON.Animation(
                    "glassDoorSlideAnimation",
                    "position.x", 
                    30, 
                    BABYLON.Animation.ANIMATIONTYPE_FLOAT,
                    BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
                );

                const keys = [
                    { frame: 0, value: doorToAnimate.position.x }, // 애니메이션 시작점: 현재 X 위치
                    { frame: 30, value: targetX } // 애니메이션 끝점: 계산된 목표 X 위치 (0.5초 동안 이동)
                ];

                animation.setKeys(keys);

                // 기존 애니메이션을 모두 중지하고 새로운 애니메이션 실행
                scene.stopAnimation(doorToAnimate);
                scene.beginDirectAnimation(doorToAnimate, [animation], 0, 30, false, 1); // false: 한 번만 실행, 1: 재생 속도

                isDoorOpen = !isDoorOpen; // 문 상태 토글
            }
        )
    );
    console.log("Glass_Material.001_0에 클릭 이벤트와 슬라이드 애니메이션이 추가되었습니다.");
} else {
    console.warn("Glass_Material.001_0 메쉬를 찾을 수 없습니다. 이름이 정확한지 확인해주세요.");
}
  
// 책상 위치
// const deskWorldPos = new BABYLON.Vector3(-7, 7, -8);
// const desk = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "secretary_desk_-_20mb (1).glb", scene);

// for (const mesh of desk.meshes) { 
//     if (mesh.name !== "__root__") {
//         mesh.parent = parentMesh;
//         mesh.position = BABYLON.Vector3.TransformCoordinates(
//             deskWorldPos,
//             BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
//         );
//         mesh.scaling = new BABYLON.Vector3(0.6, 0.8, 0.6);
//         mesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI)
//             .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI));
//         mesh.checkCollisions = true;
//     }
// }


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
  const alarmWorldPos = new BABYLON.Vector3(2.5, 7.65, -13);
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
  const curtainWorldPos1 = new BABYLON.Vector3(-18.9, 6.2, -15.7);
  const curtainWorldPos2 = new BABYLON.Vector3(-18.9, 6.2, -10.7);
  const curtainWorldPos4 = new BABYLON.Vector3(-9, 6.2, -15.5);
  const curtainWorldPos7 = new BABYLON.Vector3(-4, 6.2, -15.5);
  const curtainWorldPos5 = new BABYLON.Vector3(3, 6.2, -5);
  const curtainWorldPos6 = new BABYLON.Vector3(3, 6.2, -10);


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

      rootMesh.scaling = scaling || new BABYLON.Vector3(80, 55, 50);
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

 const commonRotation1 = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
      .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2))
      .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI));

  const commonRotation2 = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
      .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2))
      .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI));

  const customRotation4 = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
      .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI))
      .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI));

  const commonRotation5 = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
      .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, -Math.PI / 2))
      .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, -Math.PI));

  const commonRotation6 = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
      .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, -Math.PI / 2))
      .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, -Math.PI));

 const customRotation7 = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
      .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI))
      .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI));

  const myCurtainTexture = "/cc.jpg"; 

  (async () => {
      await curtain(curtainWorldPos1, parentMesh, scene, commonRotation1, new BABYLON.Vector3(70, 55, 50), myCurtainTexture);
      await curtain(curtainWorldPos2, parentMesh, scene, commonRotation2, new BABYLON.Vector3(70, 55, 50), myCurtainTexture);
      await curtain(curtainWorldPos4, parentMesh, scene, customRotation4, new BABYLON.Vector3(70, 55, 50), myCurtainTexture);
      await curtain(curtainWorldPos5, parentMesh, scene, commonRotation5, new BABYLON.Vector3(70, 55, 50), myCurtainTexture);
      await curtain(curtainWorldPos6, parentMesh, scene, commonRotation6, new BABYLON.Vector3(70, 55, 50), myCurtainTexture);
 await curtain(curtainWorldPos7, parentMesh, scene, customRotation7, new BABYLON.Vector3(70, 55, 50), myCurtainTexture); 
})();


// 천장 사람 위치
  const kpWorldPos = new BABYLON.Vector3(-16.1, 9.05, -13.4);
  const kp = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "kim.glb", scene);

  for (const mesh of kp.meshes) { 
      if (mesh.name !== "__root__") {
          mesh.parent = parentMesh;
          mesh.position = BABYLON.Vector3.TransformCoordinates(
              kpWorldPos,
              BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
          );
          mesh.scaling = new BABYLON.Vector3(37,42,37)
          mesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI)
              .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI/1.1))
              .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI))
              .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI))
              .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, -Math.PI / 2));
          mesh.checkCollisions = true;
      }
  }

// 침대 
    const bedWorldPos1 = new BABYLON.Vector3(-17.7, 6.5, -8.6);
    const bedWorldPos2 = new BABYLON.Vector3(-17.7, 6.5, -13.5);
    const bedWorldPos3 = new BABYLON.Vector3(-6.2, 6.5, -14.6); 
    const bedWorldPos4 = new BABYLON.Vector3(-11.2, 6.5, -14.6);
    const bedWorldPos5 = new BABYLON.Vector3(2, 6.5, -12); 
    const bedWorldPos6 = new BABYLON.Vector3(2, 6.5, -6.9);

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
                .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI/2));
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
    await bed(bedWorldPos5, parentMesh, scene);
    await bed(bedWorldPos6, parentMesh, scene);

    const oppositeRotation = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
        .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI));


    await bed(bedWorldPos3, parentMesh, scene, oppositeRotation);
    await bed(bedWorldPos4, parentMesh, scene, oppositeRotation);
    
    
  // 냉장고
  const old_fridgeWorldPos = new BABYLON.Vector3(-7.80, 6.5, -6.80);
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
          .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, -Math.PI))
          .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, -Math.PI)); // Y축 180도 추가

      
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
              new BABYLON.Vector3(-7.80, 8.4, -6.80),
              BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
          );
          mesh.scaling = new BABYLON.Vector3(15, 15, 15);
          mesh.checkCollisions = true;
          mesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, Math.PI / 2)
              .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, Math.PI/2));
      }
  }
//팔
  const body = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "halloween_rubber_arm.glb", scene);
  for (const mesh of body.meshes) { 
      if (mesh.name !== "__root__") {
          mesh.parent = parentMesh;
          mesh.position = BABYLON.Vector3.TransformCoordinates(
              new BABYLON.Vector3(-7.80, 7.35, -6.90),
              BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
          );
          mesh.scaling = new BABYLON.Vector3(80,80,80);
          mesh.checkCollisions = true;
          mesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI)
              .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, -Math.PI / 6));
      }
  }


//   // 뱀파이어 박쥐
//   let batGroup = new BABYLON.TransformNode("batGroup", scene);
//   batGroup.parent = parentMesh;
//   batGroup.position = BABYLON.Vector3.TransformCoordinates(
//       batStartPos,
//       BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
//   );
//   const vampireBatResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "vampire_bat.glb", scene);
//   for (const mesh of vampireBatResult.meshes) {
//       if (mesh.name !== "__root__") {
//           mesh.parent = batGroup;
//           mesh.scaling = new BABYLON.Vector3(15, 15, 15);
//           mesh.checkCollisions = true;
//           // 문 쪽을 바라보게 회전
//           const direction = batEndPos.subtract(batStartPos).normalize();
//           const up = BABYLON.Vector3.Up();
//           const lookQ = BABYLON.Quaternion.FromLookDirectionLH(direction, up);
//           const fixQ = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, -Math.PI)
//               .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2));
//           mesh.rotationQuaternion = fixQ.multiply(lookQ);
//       }
//   }
}