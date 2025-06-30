import React, { useEffect, useRef, useState } from "react";
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";
import "@babylonjs/inspector";
import { GLTF2Export } from "@babylonjs/serializers";

const BabylonScene = () => {
  const canvasRef = useRef(null);

  // 플레이어 위치 상태 관리
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0, z: 0 });
  // 달리기 상태 관리
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new BABYLON.Engine(canvasRef.current, true);
    const scene = new BABYLON.Scene(engine);
    scene.collisionsEnabled = true;

    // 카메라 생성 및 설정
    const camera = new BABYLON.UniversalCamera(
      "camera",
      new BABYLON.Vector3(-21, 15.5, 12),
      scene
    );
    camera.rotation.y = Math.PI + Math.PI / 2;
    camera.attachControl(canvasRef.current, true);

    camera.checkCollisions = true;
    camera.applyGravity = true;
    camera.ellipsoid = new BABYLON.Vector3(0.1, 0.7, 0.1);

    const MAX_CAMERA_HEIGHT = 50;
    const MIN_CAMERA_HEIGHT = 0;
    const maxPitch = BABYLON.Tools.ToRadians(180);
    const minPitch = BABYLON.Tools.ToRadians(-60);

    // 기본 속도와 달리기 속도 설정
    const WALK_SPEED = 0.1;
    const RUN_SPEED = 0.3;
    camera.speed = WALK_SPEED;

    // 사다리 위치 저장용 배열
    let ladderPositions = [];

    // 특수 위치 및 반경: 중력 해제 및 자유 상승 가능 위치들 (여러개 가능하도록 배열로)
    const specialPositions = [
      new BABYLON.Vector3(-33.54, 2.26, -0.35), //사다리
      new BABYLON.Vector3(-13.72, 2.73, 2.31), //계단
    ];
    const specialRadius = 12; // 3미터 이내hh

    // 모델 로드
    BABYLON.SceneLoader.ImportMeshAsync(
      "",
      "/models/",
      "abandoned_hospital_part_two.glb",
      scene
    ).then((result) => {
      console.log("✅ Loaded hospital meshes");

      result.meshes.forEach((mesh) => {
        if (mesh.name.startsWith("Hospital_02_")) {
          mesh.checkCollisions = true;
          mesh.isPickable = true;
        }

        if (mesh.name === "Hospital_02_36m_0" || mesh.name === "Hospital_02_105m_0") {
          mesh.checkCollisions = false;
          mesh.isPickable = false;
          mesh.computeWorldMatrix(true);
          const worldPos = mesh.getAbsolutePosition();
          ladderPositions.push(worldPos);
          console.log(`📌 Ladder position (${mesh.name}):`, worldPos);
        }

        if (mesh.name.startsWith("door")) {
          mesh.dispose();
          console.log(`🗑️ Removed mesh: ${mesh.name}`);
        }
      });
    });

    // 매 프레임 중력 제어 및 위치 제한, 플레이어 위치 상태 업데이트
    scene.registerBeforeRender(() => {
      // 사다리 근처 체크
      const nearLadder =
        ladderPositions.length > 0 &&
        ladderPositions.some((pos) => BABYLON.Vector3.Distance(camera.position, pos) < 3);

      // 특수 위치 중 하나라도 가까운지 체크
      const nearSpecialPos = specialPositions.some(
        (pos) => BABYLON.Vector3.Distance(camera.position, pos) < specialRadius
      );

      if (nearSpecialPos) {
        // 특수 위치 근처: 중력 해제, 자유롭게 위로 이동 가능
        camera.applyGravity = false;

        // 높이 제한 해제: 필요하면 주석 처리한 상태 유지
      } else if (nearLadder) {
        // 사다리 근처: 중력 해제
        camera.applyGravity = false;

        // 높이 제한 적용
        if (camera.position.y > MAX_CAMERA_HEIGHT) camera.position.y = MAX_CAMERA_HEIGHT;
        if (camera.position.y < MIN_CAMERA_HEIGHT) camera.position.y = MIN_CAMERA_HEIGHT;
      } else {
        // 그 외 일반 상태: 중력 적용, 높이 제한 적용
        camera.applyGravity = true;

        if (camera.position.y > MAX_CAMERA_HEIGHT) camera.position.y = MAX_CAMERA_HEIGHT;
        if (camera.position.y < MIN_CAMERA_HEIGHT) camera.position.y = MIN_CAMERA_HEIGHT;
      }

      // 시야 각도 제한
      // if (camera.rotation && camera.rotation.x !== undefined) {
      //   if (camera.rotation.x > maxPitch) camera.rotation.x = maxPitch;
      //   if (camera.rotation.x < minPitch) camera.rotation.x = minPitch;
      // }


      // 플레이어 위치 상태 업데이트 (소수점 둘째 자리까지)
      setPlayerPos({
        x: camera.position.x.toFixed(2),
        y: camera.position.y.toFixed(2),
        z: camera.position.z.toFixed(2),
      });
    });

    // 키보드 이동 설정
    camera.keysUp.push(87); // W
    camera.keysDown.push(83); // S
    camera.keysLeft.push(65); // A
    camera.keysRight.push(68); // D
    camera.minZ = 0.1;
    camera.angularSensibility = 6000;

    // Shift 키 이벤트 리스너 추가
    const handleKeyDown = (evt) => {
      if (evt.key === "Shift" || evt.keyCode === 16) {
        setIsRunning(true);
        camera.speed = RUN_SPEED;
      }
    };

    const handleKeyUp = (evt) => {
      if (evt.key === "Shift" || evt.keyCode === 16) {
        setIsRunning(false);
        camera.speed = WALK_SPEED;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // 마우스 휠로 전후 이동
    canvasRef.current.addEventListener("wheel", (evt) => {
      evt.preventDefault();
      const delta = evt.deltaY < 0 ? 1 : -1;
      const forward = camera.getDirection(BABYLON.Axis.Z);
      camera.position.addInPlace(forward.scale(delta));
    });

    // 기본 조명 생성
    new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), scene);

    // 메시 클릭 시 이름 콘솔 및 알림
    scene.onPointerObservable.add((pointerInfo) => {
      if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERPICK) {
        const mesh = pointerInfo.pickInfo?.pickedMesh;
        if (mesh) {
          console.log("🖱️ Clicked mesh name:", mesh.name);
          alert(`Clicked mesh name: ${mesh.name}`);
        }
      }
    });

    // P 키 누르면 GLB 파일로 씬 저장
    const onKeyDown = (evt) => {
      if (evt.key === "p" || evt.key === "P") {
        GLTF2Export.GLBAsync(scene, "saved_scene").then((glb) => {
          glb.downloadFiles();
          console.log("💾 Scene exported to GLB");
        });
      }
    };
    window.addEventListener("keydown", onKeyDown);

    // 렌더 루프 시작
    engine.runRenderLoop(() => {
      scene.render();
    });

    // 창 크기 변경 시 캔버스 크기 조절
    const onResize = () => engine.resize();
    window.addEventListener("resize", onResize);

    // 컴포넌트 언마운트 시 정리
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("resize", onResize);
      scene.dispose();
      engine.dispose();
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{ width: "100vw", height: "100vh", display: "block" }}
      />
      {/* 화면 좌측 상단에 플레이어 좌표 표시 */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          padding: "8px 12px",
          backgroundColor: "rgba(0,0,0,0.6)",
          color: "white",
          fontFamily: "monospace",
          fontSize: "14px",
          borderRadius: "4px",
          userSelect: "none",
          zIndex: 1000,
        }}
      >
        <div>내 위치:</div>
        <div>X: {playerPos.x}</div>
        <div>Y: {playerPos.y}</div>
        <div>Z: {playerPos.z}</div>
      </div>
    </>
  );
};

export default BabylonScene;
