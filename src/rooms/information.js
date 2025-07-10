// information.js
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";

/**
 * @param {BABYLON.Scene} scene 
 * @param {BABYLON.AbstractMesh} parentMesh 
 */
export async function addInformation(scene, parentMesh) {



    // 벽 위치 정의
    const wallWorldPos1 = new BABYLON.Vector3(-14, 7, -8.70);
    const wallWorldPos2 = new BABYLON.Vector3(-0, 7, -8.70);
    const wallWorldPos3 = new BABYLON.Vector3(-2.42, 7, -13.5);
    const wallWorldPos4 = new BABYLON.Vector3(-9, 7, -13.5);

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
            rootMesh.scaling = new BABYLON.Vector3(100, 100, 100);
        }

        if (rotationQuaternion) {
            rootMesh.rotationQuaternion = rotationQuaternion;
        } else {
            rootMesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI/2)
                .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, Math.PI/2));
        }
    }
   
    await wall(wallWorldPos1, parentMesh, scene);

    const wallWorldPos2CustomScaling = new BABYLON.Vector3(100, 70, 70);
    await wall(wallWorldPos2, parentMesh, scene, null, wallWorldPos2CustomScaling);

    const wallWorldPos3CustomRotation = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI)
        .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI /2));
    const wallWorldPos3CustomScaling = new BABYLON.Vector3(100, 80, 80);
    
    await wall(wallWorldPos3, parentMesh, scene, wallWorldPos3CustomRotation, wallWorldPos3CustomScaling);

    const wallWorldPos4CustomRotation = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI)
        .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI /2));
    const wallWorldPos4CustomScaling = new BABYLON.Vector3(100, 30, 30);
    
    await wall(wallWorldPos4, parentMesh, scene, wallWorldPos4CustomRotation, wallWorldPos4CustomScaling);
    
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

// 커텐
const curtainWorldPos1 = new BABYLON.Vector3(-19.2, 6.2, -8.7);
const curtainWorldPos2 = new BABYLON.Vector3(-14.5, 6.2, -8.7);
const curtainWorldPos3 = new BABYLON.Vector3(-18, 6.2, -17);
const curtainWorldPos4 = new BABYLON.Vector3(-9, 6.2, -15);

async function curtain(worldPosition, parentMesh, scene, rotationQuaternion = null, scaling = null) {
    const curtainResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "curtain_kp_closing.glb", scene);

    const rootMesh = curtainResult.meshes[0];
    rootMesh.parent = parentMesh;

    const interactiveMesh = curtainResult.meshes.find(mesh => mesh.name === "Object_9");

    if (!interactiveMesh) {
        console.error("오류: 'Object_9' 메시를 GLB 파일에서 찾을 수 없습니다. 클릭 이벤트가 작동하지 않을 수 있습니다.");
        interactiveMesh = rootMesh; 
    }

    rootMesh.position = BABYLON.Vector3.TransformCoordinates(
        worldPosition,
        BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
    );

    rootMesh.scaling = scaling || new BABYLON.Vector3(70.5, 55, 35.5);
    rootMesh.rotationQuaternion = rotationQuaternion || BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
        .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI));

    for (const mesh of curtainResult.meshes) {
        mesh.checkCollisions = true;
        mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.BoxImpostor, {
            mass: 0,
            restitution: 0.1,
            friction: 0.5
        }, scene);
    }

    const animGroups = curtainResult.animationGroups;
    if (animGroups.length > 0) {
        const curtainAnim = animGroups[0];

        curtainAnim.goToFrame(curtainAnim.to); 
        curtainAnim.stop(); 

        let isOpen = false; 

        interactiveMesh.actionManager = new BABYLON.ActionManager(scene);
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


const commonRotation3 = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
    .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2))
    .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI));

const customRotation4 = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
    .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI))
    .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI));

await curtain(curtainWorldPos1, parentMesh, scene);
await curtain(curtainWorldPos2, parentMesh, scene);
await curtain(curtainWorldPos3, parentMesh, scene, commonRotation3, new BABYLON.Vector3(80, 55, 60));
await curtain(curtainWorldPos4, parentMesh, scene, customRotation4, new BABYLON.Vector3(80, 55, 40));

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

  for (const ag of old_fridgeResult.animationGroups) { // forEach를 for...of로 변경
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

// // 눈
// const eyeResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "procedural_eye.glb", scene);
// const eyeMeshes = eyeResult.meshes.filter(mesh => mesh.name !== "__root__");

// // 1. 이름에서 그룹 키 추출 (예: Eye_A.001)
// function getGroupKey(name) {
//     // Eye_A.001 → Eye_A.001, Eye_Eye_0/Iris_0 → Eye_0
//     const match = name.match(/^Eye_A\.\d+/);
//     if (match) return match[0];
//     const match2 = name.match(/^Eye_(Eye|Iris)_0/);
//     if (match2) return "Eye_0";
//     return name;
// }

// // 2. 그룹핑
// const eyeGroups = {};
// for (const mesh of eyeMeshes) { // forEach를 for...of로 변경
//     const key = getGroupKey(mesh.name);
//     if (!eyeGroups[key]) eyeGroups[key] = [];
//     eyeGroups[key].push(mesh);
// }

// // 3. 각 그룹별 TransformNode 생성 및 위치/회전/스케일 적용
// const basePos = new BABYLON.Vector3(-18.51, 7.74, -11.95);
// const sphereRadius = 0.1;
// const count = Object.keys(eyeGroups).length;
// const rotationMatrix = BABYLON.Matrix.RotationX(Math.PI / 2);

// // Object.entries를 사용하여 키(groupKey)와 값(group)을 동시에 가져옴
// let i = 0; // 인덱스를 수동으로 관리
// for (const [groupKey, group] of Object.entries(eyeGroups)) { // forEach를 for...of로 변경
//     const node = new BABYLON.TransformNode(`eyeGroup_${i}`, scene);
    
//     for (const mesh of group) { // 중첩 forEach를 for...of로 변경
//         mesh.parent = node;
//     }

//     // 골든 섹션 스파이럴(구 표면에 고르게 분포)
//     const phi = Math.acos(-1 + (2 * i) / (count - 1));
//     const theta = Math.PI * (1 + Math.sqrt(5)) * i;
//     let x = sphereRadius * Math.cos(theta) * Math.sin(phi);
//     let y = sphereRadius * Math.sin(theta) * Math.sin(phi);
//     let z = sphereRadius * Math.cos(phi);
//     const rotated = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(x, y, z), rotationMatrix);
//     x = basePos.x + rotated.x;
//     y = basePos.y + rotated.y;
//     z = basePos.z + rotated.z;
//     node.position = new BABYLON.Vector3(x, y, z);
//     node.scaling = new BABYLON.Vector3(0.04, 0.04, 0.04);
//     node.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, -Math.PI / 2)
//         .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, -Math.PI));

//     i++; // 인덱스 증가
// }

// // 간
// const liverResult = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "human_liver.glb", scene);
//   liverResult.meshes.forEach((mesh) => {
//     if (mesh.name !== "__root__") {
//       mesh.parent = parentMesh;
//       mesh.position = BABYLON.Vector3.TransformCoordinates(
//         new BABYLON.Vector3(-18.51, 7.2, -11.8),
//         BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
//       );
//       mesh.scaling = new BABYLON.Vector3(11, 11, 11);
//       mesh.checkCollisions = true;
//       mesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, -Math.PI / 2)
//         .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, Math.PI));
//     }
//   });

}