// information.js
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";

/**
 * @param {BABYLON.Scene} scene 
 * @param {BABYLON.AbstractMesh} parentMesh 
 */
export async function addInformation(scene, parentMesh) {



    // 벽 위치 정의
    const wallWorldPos1 = new BABYLON.Vector3(-14.42, 7, -8.70);
    const wallWorldPos2 = new BABYLON.Vector3(-0, 7, -8.70);
    const wallWorldPos3 = new BABYLON.Vector3(-2.42, 7, -13.5);
    const wallWorldPos4 = new BABYLON.Vector3(-10.42, 7, -13.5);

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
    const deskWorldPos = new BABYLON.Vector3(-6.5,7,-12);
    const desk = await BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "secretary_desk_-_20mb (1).glb", scene);
    desk.meshes.forEach((mesh) => {
        if (mesh.name !== "__root__") {
        mesh.parent = parentMesh;
        mesh.position = BABYLON.Vector3.TransformCoordinates(
            deskWorldPos,
            BABYLON.Matrix.Invert(parentMesh.getWorldMatrix())
        );
        mesh.scaling = new BABYLON.Vector3(0.8,0.8,0.8);
        mesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI)
            .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI))
            .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI))
            .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI));
        mesh.checkCollisions = true;
        }
    });

   // 침대 위치 정의
    const bedWorldPos1 = new BABYLON.Vector3(-17.3, 6.5, -9.9);
    const bedWorldPos2 = new BABYLON.Vector3(-13.3, 6.5, -9.8);
    const bedWorldPos3 = new BABYLON.Vector3(-17.3, 6.5, -14.0); 
    const bedWorldPos4 = new BABYLON.Vector3(-13.3, 6.5, -14.0);

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
                .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2));
        }

        bed.meshes.forEach(mesh => {
            mesh.checkCollisions = true;
            if (mesh.isReady()) {
                mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.1, friction: 0.5 }, scene);
            } else {
                mesh.onReadyObservable.addOnce(() => {
                    mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.1, friction: 0.5 }, scene);
                });
            }
        });
    }

    // 각 침대 모델을 로드하여 장면에 추가합니다.
    await bed(bedWorldPos1, parentMesh, scene);
    await bed(bedWorldPos2, parentMesh, scene);

    // 침대 3번과 4번을 위한 회전 정의 (기존 침대와 마주보도록 180도 회전)
    const oppositeRotation = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2)
        .multiply(BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI / 2 + Math.PI));

    await bed(bedWorldPos3, parentMesh, scene, oppositeRotation);
    await bed(bedWorldPos4, parentMesh, scene, oppositeRotation);
   


}