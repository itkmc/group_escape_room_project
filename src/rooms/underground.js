// underground.js
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";

/**
 * @param {BABYLON.Scene} scene 
 * @param {BABYLON.AbstractMesh} parentMesh 
 * @param {Function} onDoorInteraction - 문 상호작용 시 호출될 콜백 함수
 * @param {Function} getHasOpKeyItem - ID 카드 보유 상태를 확인하는 함수
 * @param {Function} onProblemOpen - 문제 모달을 열기 위한 콜백 함수
 */
export async function addUnderground(scene, parentMesh, onDoorInteraction, getHasOpKeyItem, onProblemOpen) {
  const desiredDoor2WorldPos = new BABYLON.Vector3(7, 6.4, 5.1);
  let doorMeshes = [];
  let isDoorOpen = false;
  let initialDoorRotations = new Map();
  let isUnlocked = false; // 한 번 열리면 true
  
  // 지연 로딩을 위한 변수들
  let modelsLoaded = false;
  let loadingInProgress = false;
  const loadDistance = 25;   // 이 거리 이내면 로드
  const disposeDistance = 40; // 이 거리 이상이면 dispose
  const undergroundCenter = new BABYLON.Vector3(20, 6, 5); // underground 방의 중심점
  let loadedMeshes = [];
  
  // 문제 문 애니메이션 제어를 위한 변수들
  let problemDoorAnimationGroups = [];
  let isProblemDoorOpen = false;
  let isProblemSolved = false; // 문제가 해결되었는지 추적
  let problemDoorRoot = null; // 문제 문의 루트 메시

  // 문 추가 전에 씬 전체에서 같은 이름의 mesh를 모두 삭제
  ["Object_4", "Object_8"].forEach(name => {
    scene.meshes.filter(m => m.name === name).forEach(m => m.dispose());
  });

  const door2 = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "low_poly_door_-_game_ready.glb", scene);
  console.log("[DEBUG] door2.meshes:", door2.meshes.map(m => m.name)); // 추가: 문 모델의 mesh 이름 전체 출력
  door2.meshes.forEach((mesh) => {
    if (mesh.name === "Object_4" || mesh.name === "Object_8") { // Object_4, Object_8만 남김
      mesh.parent = parentMesh;
      mesh.position = BABYLON.Vector3.TransformCoordinates(
        desiredDoor2WorldPos,
        BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
      );
      mesh.scaling = new BABYLON.Vector3(50, 60, 55);
      mesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
        .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI));
      mesh.checkCollisions = true;
      doorMeshes.push(mesh);
      initialDoorRotations.set(mesh.name, mesh.rotationQuaternion.clone());
    } else if (mesh.name !== "__root__") {
      mesh.setEnabled(false); // 필요 없는 부품 숨기기
    }
  });

  // underground 모델 로드 함수
  const loadUndergroundModelsIfNeeded = async () => {
    if (modelsLoaded || loadingInProgress) return;
    loadingInProgress = true;
    try {
      // --- 예시: 시신 모델 ---
      const bodyBagPositions = [new BABYLON.Vector3(14.5, 6.03, 2)];
      for (const pos of bodyBagPositions) {
        const result = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "smartinius_body_bag_3d_asset.glb", scene);
        result.meshes.forEach(m => {
          if (m.name !== "__root__") {
            m.parent = parentMesh;
            m.position = BABYLON.Vector3.TransformCoordinates(pos, BABYLON.Matrix.Invert(parentMesh.getWorldMatrix()));
            m.scaling = new BABYLON.Vector3(0.8, 0.8, 0.8);
            m.checkCollisions = true;
            loadedMeshes.push(m);
          }
        });
      }

      // 사슴 시체(deer_dead_body) 배치
      const deerDeadBodyPositions = [
        new BABYLON.Vector3(16.3, 6.8, 3.9)
      ];
      for (const pos of deerDeadBodyPositions) {
        const result = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "deer_dead_body.glb", scene);
        console.log("deer_dead_body.glb 로드됨:", result.meshes.map(m => m.name));
        const root = result.meshes.find(m => m.name === "__root__");
        if (root) {
          root.parent = parentMesh;
          root.position = BABYLON.Vector3.TransformCoordinates(
            pos,
            BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
          );
          root.scaling = new BABYLON.Vector3(100, 100, 100);
          root.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI/2); // X축으로 눕힘
          root.checkCollisions = true; // 충돌 감지 활성화
          
          // 모든 하위 메시들에도 충돌 감지 설정
          result.meshes.forEach(mesh => {
            if (mesh.name !== "__root__") {
              mesh.checkCollisions = true;
            }
          });
          
          console.log("deer_dead_body __root__ 배치:", {
            position: root.position,
            scaling: root.scaling
          });
          loadedMeshes.push(root);
        }
      }

      // 미라
      const mummyBodyPositions = [
        new BABYLON.Vector3(15.55, 6, 5.08)
      ];
      for (const pos of mummyBodyPositions) {
        const result = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "zombie_smoke_mummy_character_12_mb.glb", scene);
        console.log("zombie_smoke_mummy_character_12_mb.glb 로드됨:", result.meshes.map(m => m.name));
        const root = result.meshes.find(m => m.name === "__root__");
        if (root) {
          root.parent = parentMesh;
          root.position = BABYLON.Vector3.TransformCoordinates(
            pos,
            BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
          );
          root.scaling = new BABYLON.Vector3(100, 100, 100);
          root.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
            .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, -Math.PI)); // X축 90도, Y축 90도 순서로 회전
          root.checkCollisions = true; // 충돌 감지 활성화
          
          // 모든 하위 메시들에도 충돌 감지 설정
          result.meshes.forEach(mesh => {
            if (mesh.name !== "__root__") {
              mesh.checkCollisions = true;
            }
          });
          
          console.log("zombie_smoke_mummy_character __root__ 배치:", {
            position: root.position,
            scaling: root.scaling
          });
          loadedMeshes.push(root);
        }
      }


   
      // 시체 서랍
      const morgueBodyPositions = [
        new BABYLON.Vector3(16.3, 6.4, 8.1)
      ];
      for (const pos of morgueBodyPositions) {
        const result = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "morgue_refrigerator-12mb.glb", scene);
        console.log("시체서랍 로드됨:", result.meshes.map(m => m.name));
        const root = result.meshes.find(m => m.name === "__root__");
        if (root) {
          root.parent = parentMesh;
          root.position = BABYLON.Vector3.TransformCoordinates(
            pos,
            BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
          );
          root.scaling = new BABYLON.Vector3(70, 90, 70);
          root.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, Math.PI)
            .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)); // X축 90도, Y축 90도 순서로 회전
          root.checkCollisions = true; // 충돌 감지 활성화
          
          // 모든 하위 메시들에도 충돌 감지 설정
          result.meshes.forEach(mesh => {
            if (mesh.name !== "__root__") {
              mesh.checkCollisions = true;
            }
          });
          
          console.log("morgue_refrigerator __root__ 배치:", {
            position: root.position,
            scaling: root.scaling
          });
          loadedMeshes.push(root);
        }
      }
      
      // 시체 table
      const tableBodyPositions = [
        new BABYLON.Vector3(16.3, 6, 3.9)
      ];
      for (const pos of tableBodyPositions) {
        const result = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "autopsy_table.glb", scene);
        console.log("시체테이블 로드됨:", result.meshes.map(m => m.name));
        const root = result.meshes.find(m => m.name === "__root__");
        if (root) {
          root.parent = parentMesh;
          root.position = BABYLON.Vector3.TransformCoordinates(
            pos,
            BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
          );
          root.scaling = new BABYLON.Vector3(5, 5, 5);
          root.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, Math.PI)
            .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)); // X축 90도, Y축 90도 순서로 회전
          root.checkCollisions = true; // 충돌 감지 활성화
          
          // 모든 하위 메시들에도 충돌 감지 설정
          result.meshes.forEach(mesh => {
            if (mesh.name !== "__root__") {
              mesh.checkCollisions = true;
            }
          });
          
          console.log("autopsy_table __root__ 배치:", {
            position: root.position,
            scaling: root.scaling
          });
          loadedMeshes.push(root);
        }
      }

      // EXIT
      const exitBodyPositions = [
        new BABYLON.Vector3(36.67, 8, 6.2)
      ];
      for (const pos of exitBodyPositions) {
        const result = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "exit_sign.glb", scene);
        console.log("exit_sign.glb 로드됨:", result.meshes.map(m => m.name));
        const root = result.meshes.find(m => m.name === "__root__");
        if (root) {
          root.parent = parentMesh;
          root.position = BABYLON.Vector3.TransformCoordinates(
            pos,
            BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
          );
          root.scaling = new BABYLON.Vector3(10, 10, 10);
          root.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI)
            .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, -Math.PI / 2)); // X축 90도, Y축 90도 순서로 회전
          console.log("exit_sign __root__ 배치:", {
            position: root.position,
            scaling: root.scaling
          });
          loadedMeshes.push(root);
        }
      }

      // 해골
      const skullBodyPositions = [
        new BABYLON.Vector3(17.68, 7, 1.6)
      ];
      for (const pos of skullBodyPositions) {
        const result = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "skull_sculpture_two.glb", scene);
        console.log("skull_sculpture_two.glb 로드됨:", result.meshes.map(m => m.name));
        const root = result.meshes.find(m => m.name === "__root__");
        if (root) {
          root.parent = parentMesh;
          root.position = BABYLON.Vector3.TransformCoordinates(
            pos,
            BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
          );
          root.scaling = new BABYLON.Vector3(1.2, 1.2, 1.2);
          root.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI/2)
            .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, -Math.PI/2)); // X축 90도, Y축 90도 순서로 회전
          console.log("skull_sculpture_two __root__ 배치:", {
            position: root.position,
            scaling: root.scaling
          });
          loadedMeshes.push(root);
        }
      }

      // 문제 넣을 문
      const massiveDoorPositions = [
        new BABYLON.Vector3(20.65, 7.2, 6.51)
      ];
      for (const pos of massiveDoorPositions) {
        console.log("massive_door_with_animation.glb 로딩 시작...");
        const result = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "massive_door_with_animation.glb", scene);
        console.log("massive_door_with_animation.glb 로드됨:", result.meshes.map(m => m.name));
        console.log("애니메이션 그룹:", result.animationGroups.map(ag => ag.name));
        console.log("로드된 메시 개수:", result.meshes.length);
        
        const root = result.meshes.find(m => m.name === "__root__");
        if (root) {
          root.parent = parentMesh;
          root.position = BABYLON.Vector3.TransformCoordinates(
            pos,
            BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
          );
          root.scaling = new BABYLON.Vector3(65, 130, 30);
          root.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI/2)
            .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, -Math.PI/2));
          root.checkCollisions = true; // 충돌 감지 활성화
          
          // 문제 문 루트 메시 저장
          problemDoorRoot = root;
          
          // 모든 하위 메시들에도 충돌 감지 설정
          result.meshes.forEach(mesh => {
            if (mesh.name !== "__root__") {
              mesh.checkCollisions = true;
            }
          });
          
          // 애니메이션 그룹 저장 및 초기 상태 설정 (모든 애니메이션 정지)
          result.animationGroups.forEach(animationGroup => {
            animationGroup.stop();
            animationGroup.loopAnimation = false; // 반복 애니메이션 비활성화
            
            // enableBlending 함수가 있는지 확인 후 호출
            if (typeof animationGroup.enableBlending === 'function') {
              animationGroup.enableBlending(0); // 블렌딩 비활성화
            }
            
            // 애니메이션 완료 후 자동으로 닫기 (문제 해결 후에만)
            animationGroup.onAnimationGroupEndObservable.add(() => {
              console.log("애니메이션 완료:", animationGroup.name);
              // 문제가 해결된 후에만 자동으로 닫기
              if (isProblemSolved && isProblemDoorOpen) {
                setTimeout(() => {
                  console.log("자동으로 문 닫기");
                  problemDoorAnimationGroups.forEach(ag => {
                    ag.stop();
                    ag.reset();
                    ag.loopAnimation = false;
                  });
                  isProblemDoorOpen = false;
                }, 3000); // 3초 후 자동 닫기
              }
            });
            
            problemDoorAnimationGroups.push(animationGroup);
            console.log("애니메이션 그룹 저장:", animationGroup.name, "반복:", animationGroup.loopAnimation);
          });
          
          // 모든 애니메이션을 완전히 비활성화 (필요시 주석 해제)
          // result.animationGroups.forEach(animationGroup => {
          //   animationGroup.setEnabled(false);
          // });
          
          // 문제 문 클릭 이벤트 추가
          console.log("클릭 이벤트 등록 시작...");
          let clickEventCount = 0;
          result.meshes.forEach(mesh => {
            if (mesh.name !== "__root__") {
              console.log("메시에 클릭 이벤트 추가:", mesh.name);
              mesh.isPickable = true;
              mesh.actionManager = new BABYLON.ActionManager(scene);
              mesh.actionManager.registerAction(
                new BABYLON.ExecuteCodeAction(
                  BABYLON.ActionManager.OnPickTrigger,
                  () => {
                    console.log("문제 문이 클릭되었습니다! 메시:", mesh.name);
                    toggleProblemDoor();
                  }
                )
              );
              clickEventCount++;
            }
          });
          console.log("총", clickEventCount, "개의 메시에 클릭 이벤트 등록됨");
          
          console.log("massive_door_with_animation __root__ 배치:", {
            position: root.position,
            scaling: root.scaling
          });
          loadedMeshes.push(root);
        }
      }

      // cifr_12345678910.glb 추가
      const cifrPositions = [
        new BABYLON.Vector3(20.09, 8.36, 3.43)
      ];
      for (const pos of cifrPositions) {
        const result = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "cifr_12345678910.glb", scene);
        console.log("cifr_12345678910.glb 로드됨:", result.meshes.map(m => m.name));
        const root = result.meshes.find(m => m.name === "__root__");
        if (root) {
          root.parent = parentMesh;
          root.position = BABYLON.Vector3.TransformCoordinates(
            pos,
            BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
          );
          root.scaling = new BABYLON.Vector3(0.01, 0.01, 0.01);
          root.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, -Math.PI)
          .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, -Math.PI / 2));
          root.checkCollisions = true;
          // 필요시 회전 추가: root.rotationQuaternion = ...;
          loadedMeshes.push(root);
        }
      }

      modelsLoaded = true;
      console.log("underground 모델 로드 완료");
    } catch (error) {
      console.error("지연 로딩 중 오류 발생:", error);
    } finally {
      loadingInProgress = false;
    }
  };

  // underground 모델 dispose 함수
  const disposeUndergroundModelsIfLoaded = () => {
    if (!modelsLoaded) return;
    loadedMeshes.forEach(m => m.dispose());
    loadedMeshes = [];
    modelsLoaded = false;
    console.log("underground 모델 dispose 완료");
  };

  // 카메라 거리 체크 및 동적 로드/언로드
  scene.registerBeforeRender(() => {
    const camera = scene.activeCamera;
    if (!camera) return;
    const distance = BABYLON.Vector3.Distance(camera.position, undergroundCenter);
    if (distance <= loadDistance) {
      loadUndergroundModelsIfNeeded();
    } else if (distance > disposeDistance) {
      disposeUndergroundModelsIfLoaded();
    }
  });

   // 문 열기/닫기 애니메이션 함수
const toggleDoor = () => {
    // 문이 잠금 해제되지 않은 상태에서만 열쇠 검사를 수행합니다.
    if (!isUnlocked) {
        const hasOpKey = getHasOpKeyItem ? getHasOpKeyItem() : false;

        if (!hasOpKey) {
            if (onDoorInteraction) onDoorInteraction("ID카드로 문을 열었습니다!");
            return; // 키가 없으면 함수 종료
        }

        isUnlocked = true; // 키가 있으면 잠금 해제 상태로 변경
        if (onDoorInteraction) onDoorInteraction("열쇠로 문을 열었습니다!");
    }

    if (doorMeshes.length === 0) {
        if (onDoorInteraction) onDoorInteraction("문을 찾을 수 없습니다!");
        return;
    }

    const animationGroup = new BABYLON.AnimationGroup("undergroundDoorAnimationGroup");

    doorMeshes.forEach((doorMesh) => {
        const startRotation = doorMesh.rotationQuaternion.clone();
        let targetRotation;

        const initialRot = initialDoorRotations.get(doorMesh.name);
        if (!initialRot) {
            return;
        }

        if (isDoorOpen) {
            targetRotation = initialRot.clone();
        } else {
            targetRotation = initialRot.multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2));
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

    if (animationGroup.targetedAnimations.length === 0) {
        return;
    }

    animationGroup.onAnimationGroupEndObservable.addOnce(() => {
        isDoorOpen = !isDoorOpen;
        animationGroup.dispose();
    });

    animationGroup.play(false);
};

// 클릭으로 문 열기/닫기 함수
const handleDoorClick = () => {
    if (!isUnlocked) {
      // if (onDoorInteraction) onDoorInteraction("문이 잠겨있습니다!");
      return;
    }
    toggleDoor();
};

// 모든 doorMeshes에 클릭 이벤트 등록
doorMeshes.forEach((mesh) => {
    mesh.isPickable = true;
    mesh.actionManager = new BABYLON.ActionManager(scene);
    mesh.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnPickTrigger,
            () => handleDoorClick()
        )
    );
});

  // 문제 문 열기 함수
  const openProblemDoor = () => {
    console.log("openProblemDoor 함수 호출됨");
    if (isProblemDoorOpen) return;
    
    console.log("문제 문을 엽니다...");
    
    // 정답을 맞추고 문이 열릴 때 효과음 재생
    const audio = new Audio('/metal-door-creaking-closing-47323.mp3');
    audio.play();
    
    problemDoorAnimationGroups.forEach(animationGroup => {
      console.log("애니메이션 재생:", animationGroup.name);
      animationGroup.loopAnimation = false; // 반복 비활성화
      animationGroup.play();
    });
    isProblemDoorOpen = true;
    isProblemSolved = true; // 문제 해결됨
    
    // 문제 문이 열릴 때 ID 카드가 있다면 사라지도록 콜백 호출
    if (onProblemOpen) {
      console.log("문제 문 열림 - ID 카드 사라짐 콜백 호출");
    }
    
    // 탈출 성공 모달 표시 (15초 후)
    setTimeout(() => {
      console.log("15초 후 탈출 성공 모달 표시 시도");
      if (onProblemOpen) {
        console.log("탈출 성공 모달 표시 요청");
        // onProblemOpen을 통해 탈출 성공 콜백 호출
        onProblemOpen('escape_success');
      } else {
        console.log("onProblemOpen 콜백이 없습니다");
      }
    }, 14000);
  };

  // 문제 문 토글 함수 (열기/닫기)
  const toggleProblemDoor = () => {
    console.log("toggleProblemDoor 호출됨, isProblemSolved:", isProblemSolved);
    
    if (!isProblemSolved) {
      // 문제가 해결되지 않았으면 문제 모달 열기
      console.log("문제가 해결되지 않음, 모달 열기 시도");
      
      // 종이 효과음 재생
      const audio = new Audio('/paper-rustle-81855.mp3');
      audio.play();
      
      if (onProblemOpen) {
        console.log("onProblemOpen 콜백 호출");
        onProblemOpen();
      } else {
        console.log("onProblemOpen 콜백이 없음");
      }
      return;
    }

    // 문제가 해결된 후에는 문만 열고 닫기 (문틀은 회전하지 않음)
    if (isProblemDoorOpen) {
      // 문이 열려있으면 닫기
      console.log("문제 문을 닫습니다...");
      
      // 애니메이션만 사용 (문틀 회전 방지)
      problemDoorAnimationGroups.forEach(animationGroup => {
        animationGroup.stop();
        animationGroup.reset();
        animationGroup.loopAnimation = false;
      });
      
      isProblemDoorOpen = false;
    } else {
      // 문이 닫혀있으면 열기
      console.log("문제 문을 엽니다...");
      
      // 애니메이션만 사용 (문틀 회전 방지)
      problemDoorAnimationGroups.forEach(animationGroup => {
        animationGroup.loopAnimation = false;
        animationGroup.play();
      });
      
      isProblemDoorOpen = true;
    }
  };

  // toggleDoor를 외부에서 쓸 수 있게 반환 (E키용)
  return { toggleDoor, openProblemDoor, toggleProblemDoor };
}