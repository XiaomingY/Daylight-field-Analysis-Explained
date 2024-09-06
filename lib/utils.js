import * as THREE from 'three';
import GLTFModelController from './GLTFModelController.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function GLTFLoaderWithMaterial(filePath, materialList, opaqueTransparentGroup) {
    return new Promise((resolve, reject) => {
      const GLTFloader = new GLTFLoader();
      GLTFloader.load(
        filePath,
        function (gltf) {
            console.log(filePath+" loaded")
          const topLevelObjects = gltf.scene.getObjectByName("TransformZUpToYUp");
          topLevelObjects.children.forEach((object) => {
            if (object.name in materialList) {
              object.material = materialList[object.name];
              if (object.children.length==0 && object.material.vertexColors == true )
              {
                object = object.toNonIndexed ()
                //modifyVertexColors(object.geometry, object.material.opacity)
              }

              
              object.children.forEach((objectChild) => {
                objectChild.material = materialList[object.name];
                if (objectChild.material.vertexColors == true )
                {
                    objectChild = objectChild.toNonIndexed ()
                    //modifyVertexColors(objectChild.geometry, objectChild.material.opacity)
                }
              });
            }
          });
  
          opaqueTransparentGroup.add(gltf.scene)

          resolve(gltf.scene);  // Resolve the Promise with the loaded scene
        },
        function (xhr) {
          console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
        },
        function (error) {
          console.log('An error happened');
          reject(error);  // Reject the Promise if there’s an error
        }
      );
    });
  }

  export function GLTFLoaderWithAnimation(filePath, materialList, opaqueTransparentGroup, animationList, animationControllerList) {
    return new Promise((resolve, reject) => {
      const GLTFloader = new GLTFLoader();
      GLTFloader.load(
        filePath,
        function (gltf) {
            console.log(filePath+" loaded")
            const topLevelObjects = gltf.scene.getObjectByName("TransformZUpToYUp");
            topLevelObjects.children.forEach((object) => {
                if (object.name in materialList) {
                console.log("Found object "+object.name)
                object.material = materialList[object.name];
                if (object.children.length==0 && object.material.vertexColors == true )
                {
                    object.geometry = object.geometry.toNonIndexed ()
                    //modifyVertexColors(object.geometry, object.material.opacity)
                }
                var animationController = new GLTFModelController(object.name+"AnimationController", object, object.material.opacity, animationList)
                animationControllerList.push(animationController);

                object.children.forEach((objectChild) => {
                    objectChild.material = materialList[object.name];
                    if (objectChild.material.vertexColors == true )
                    {
                        objectChild.geometry = objectChild.geometry.toNonIndexed()
                        //modifyVertexColors(objectChild.geometry, objectChild.material.opacity)
                    }
                });
                }
            });
  
            opaqueTransparentGroup.add(gltf.scene)

            resolve(gltf.scene);  // Resolve the Promise with the loaded scene
        },
        function (xhr) {
          console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
        },
        function (error) {
          console.log('An error happened');
          reject(error);  // Reject the Promise if there’s an error
        }
      );
    });
  }

  function modifyVertexColors(geometry, opacity) {
    if (geometry.hasAttribute('color')) {
        // Get the existing color attribute
        const colors = geometry.getAttribute('color');
        const vertexCount = colors.count;
        
        // Create a new array for RGBA colors
        const newColors = new Float32Array(vertexCount * 4);

        // Iterate over the vertices and add the alpha channel
        for (let i = 0; i < vertexCount; i++) {
            newColors[i * 4] = colors.getX(i);     // R
            newColors[i * 4 + 1] = colors.getY(i); // G
            newColors[i * 4 + 2] = colors.getZ(i); // B
            newColors[i * 4 + 3] = opacity;            // A (fully opaque)
        }

        // Replace the old color attribute with the new one
        geometry.setAttribute('color', new THREE.BufferAttribute(newColors, 4));
    } else {
        console.warn('No vertex colors found on this geometry.');
    }
}

