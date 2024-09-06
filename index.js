import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { CameraRig, ScrollControls, ThreeDOFControls } from 'three-story-controls'
import {N8AOPass} from "n8ao"
import cameraData from './lib/camera-data.js'
import {GLTFLoaderWithMaterial, GLTFLoaderWithAnimation} from './lib/utils.js';

let camera, scene, renderer, controls, composer, rig;
let depthTexture, depthTexture2, opaqueDepthTexture, smaaPass, n8aopass, outlinePass;
let renderTarget, compositeTarget;
let transparentGroup, opaqueGroup;
let copyQuad;
let ground;
let infoContainer;
const clearColor = new THREE.Color();
const layers = [];
const animationControllerList = []

const canvasParent = document.querySelector('.canvas-parent')
const scrollElement = document.querySelector('.scroller')

let frameTime = 0;
let frameSamples = 0;
let lastFrameStart = - 1;

const SAMPLES = 0;
const DEPTH_BUFFER = true;
const COLOR_SPACE = THREE.SRGBColorSpace;
const params = {

    useDepthPeeling: true,
    layers: 8,
    opacity: 0.5,
    doubleSided: true,

};

const DepthPeelMaterial = DepthPeelMaterialMixin( THREE.MeshBasicMaterial );



// const facadeGlassAnimation = [
//     {
//         startPosition: 700,
//         endPosition: 1100,
//         startOpacity: .6,
//         endOpacity: 0,
//         drawRange: false,
//     },
//     {
//       startPosition: 8900,
//       endPosition: 9500,
//       startOpacity: 0,
//       endOpacity: .6,
//       drawRange: false,
//   }]

// const facadeFrameAnimation = [
//     {
//         startPosition: 5500,
//         endPosition: 6000,
//         startOpacity: 1,
//         endOpacity: 0,
//         drawRange: false,
//     },
//     {
//         startPosition: 9200,
//         endPosition: 9400,
//         startOpacity: 0,
//         endOpacity: 1,
//         drawRange: false,
//     }
// ]
// const sunHoursFrameAnimation = [
//     {
//         startPosition: 5500,
//         endPosition: 6000,
//         startOpacity: 0,
//         endOpacity: 1,
//         drawRange: false,
//     },
//     {
//     startPosition: 8900,
//     endPosition: 9200,
//     startOpacity: 1,
//     endOpacity: 0,
//     drawRange: false,
// }
// ]

// const sunVectorAnimation = [
    
//     {
//         startPosition: 1600,
//         endPosition: 2400,
//         startOpacity: 0,
//         endOpacity: 1,
//         drawRange: true,
//     },
//     {
//       startPosition: 5500,
//       endPosition: 5900,
//       startOpacity: 1,
//       endOpacity: 0,
//       drawRange: false,
//   }]

// const oneSensorAnimation = [
//     {
//         startPosition: 1100,
//         endPosition: 1400,
//         startOpacity: 0,
//         endOpacity: 1,
//         drawRange: false,
//     },
//     {
//       startPosition: 5500,
//       endPosition: 5900,
//       startOpacity: 1,
//       endOpacity: 0,
//       drawRange: false,
//   }]

//   const sensorsAnimation = [
//     {
//         startPosition: 2800,
//         endPosition: 3000,
//         startOpacity: 0,
//         endOpacity: 1,
//         drawRange: false,
//     },
//     {
//       startPosition: 5500,
//       endPosition: 5900,
//       startOpacity: 1,
//       endOpacity: 0,
//       drawRange: false,
//   }]

//   const annualSunVectorsAnimation = [

//     {
//         startPosition: 3200,
//         endPosition: 4500,
//         startOpacity: 0,
//         endOpacity: .3,
//         drawRange: true,
//     },

//     {
//       startPosition: 5500,
//       endPosition: 5900,
//       startOpacity: .3,
//       endOpacity: 0,
//       drawRange: false,
//     },
//     {
//         startPosition: 9600,
//         endPosition: 9900,
//         startOpacity: 0,
//         endOpacity: .3,
//     },
//     {
//         startPosition: 10200,
//         endPosition: 10500,
//         startOpacity: .3,
//         endOpacity: 0,
//     },
// ]

//   const facadeIntersectionsAnimation = [

//     {
//         startPosition: 9700,
//         endPosition: 10000,
//         startOpacity: 0,
//         endOpacity: 1,
//         drawRange: false,
//     },
//     {
//       startPosition: 10600,
//       endPosition: 10900,
//       startOpacity: 1,
//       endOpacity: 0,
//       drawRange: false,
//   }]
//   const facadeVectorsAnimation = [

//     {
//         startPosition: 11000,
//         endPosition: 11500,
//         startOpacity: 0,
//         endOpacity: 1,
//         drawRange: false,
//     },
//     {
//       startPosition: 12000,
//       endPosition: 12500,
//       startOpacity: 1,
//       endOpacity: 0,
//       drawRange: false,
//   }]
  
  const facadeGlassAnimation = [
    {
        startPosition: 0.0197,
        endPosition: 0.0447,
        startOpacity: .6,
        endOpacity: 0,
        drawRange: false,
    },
    {
      startPosition: 0.5325,
      endPosition: 0.5670,
      startOpacity: 0,
      endOpacity: .6,
      drawRange: false,
  },
  {
    startPosition: 0.6579,
    endPosition: 0.6666,
    startOpacity: 0.6,
    endOpacity: 0,
    drawRange: false,
  },
  {
    startPosition: 0.7874,
    endPosition: 0.8062,
    startOpacity: 0,
    endOpacity: 0.6,
    drawRange: false,
  },
]

const facadeFrameAnimation = [
    {
        startPosition: 0.3199,
        endPosition: 0.3511,
        startOpacity: 1,
        endOpacity: 0,
        drawRange: false,
    },
    {
        startPosition: 0.5512,
        endPosition: 0.5637,
        startOpacity: 0,
        endOpacity: 1,
        drawRange: false,
    }
]
const sunHoursFrameAnimation = [
    {
        startPosition: 0.3199,
        endPosition: 0.3511,
        startOpacity: 0,
        endOpacity: 1,
        drawRange: false,
    },
    {
    startPosition: 0.5325,
    endPosition: 0.5512,
    startOpacity: 1,
    endOpacity: 0,
    drawRange: false,
}
]

const sunVectorAnimation = [
    
    {
        startPosition: 0.07580,
        endPosition: 0.1260,
        startOpacity: 0,
        endOpacity: 1,
        drawRange: true,
    },
//     {
//       startPosition: 0.3199,
//       endPosition: 0.3449,
//       startOpacity: 1,
//       endOpacity: 0,
//       drawRange: false,
//   }
    {
        startPosition: 0.1510,
        endPosition: 0.1635,
        startOpacity: 1,
        endOpacity: 0,
        drawRange: false,
    }
]

const oneSensorAnimation = [
    {
        startPosition: 0.0447,
        endPosition: 0.06347,
        startOpacity: 0,
        endOpacity: 1,
        drawRange: false,
    },
    {
      startPosition: 0.3199,
      endPosition: 0.3449,
      startOpacity: 1,
      endOpacity: 0,
      drawRange: false,
  }]

  const sensorsAnimation = [
    {
        startPosition: 0.1510,
        endPosition: 0.1635,
        startOpacity: 0,
        endOpacity: 1,
        drawRange: false,
    },
    {
      startPosition: 0.3199,
      endPosition: 0.3449,
      startOpacity: 1,
      endOpacity: 0,
      drawRange: false,
  }]

  const annualSunVectorsAnimation = [

    {
        startPosition: 0.1760,
        endPosition: 0.2573,
        startOpacity: 0,
        endOpacity: .3,
        drawRange: true,
    },

    {
      startPosition: 0.3199,
      endPosition: 0.3449,
      startOpacity: .3,
      endOpacity: 0,
      drawRange: false,
    },
    {
        startPosition: 0.5762,
        endPosition: 0.5950,
        startOpacity: 0,
        endOpacity: .3,
    },
    {
        startPosition: 0.6138,
        endPosition: 0.6325,
        startOpacity: .3,
        endOpacity: 0,
    },
]

//
  const facadeIntersectionsAnimation = [

    {
        startPosition: 0.5825,
        endPosition: 0.6013,
        startOpacity: 0,
        endOpacity: 1,
        drawRange: false,
    },
    {
      startPosition: 0.6388,
      endPosition: 0.6575,
      startOpacity: 1,
      endOpacity: 0,
      drawRange: false,
  }]


  const facadeVectorsAnimation = [

    {
        startPosition: 0.5953,
        endPosition: 0.6329,
        startOpacity: 0,
        endOpacity: 1,
        drawRange: false,
    },
    {
      startPosition: 0.6388,
      endPosition: 0.6575,
      startOpacity: 1,
      endOpacity: 0,
      drawRange: false,
  }]

  const optimalShadingAnimation = [

    {
        startPosition: 0.8081,
        endPosition: 0.8331,
        startOpacity: 0,
        endOpacity: 1,
        drawRange: false,
    },
//     {
//       startPosition: 0.9175,
//       endPosition: 0.9438,
//       startOpacity: 1,
//       endOpacity: 0,
//       drawRange: false,
//   }
]

  const shadingEffectivenessAnimation = [

    {
        startPosition: 0.6579,
        endPosition: 0.6766,
        startOpacity: 0,
        endOpacity: 1,
        drawRange: false,
    },
    {
      startPosition: 0.7688,
      endPosition: 0.7874,
      startOpacity: 1,
      endOpacity: 0,
      drawRange: false,
  }]

  const optimalShadingVectorAnimation = [

    {
        startPosition: 0.7061,
        endPosition: 0.7374,
        startOpacity: 0,
        endOpacity: 1,
        drawRange: false,
    },
    {
      startPosition: 0.7688,
      endPosition: 0.7874,
      startOpacity: 1,
      endOpacity: 0,
      drawRange: false,
  }]


var interiorMaterial = new DepthPeelMaterial({
    color: new THREE.Color(0xfafafa).multiplyScalar(1), 
    //alphaTest : true,
    side: THREE.DoubleSide
  });

var frameMaterial = new DepthPeelMaterial({
    color: new THREE.Color(0xdedede).multiplyScalar(1), 
    transparent: true,
    opacity: 1,
    //alphaTest : true,
    side: THREE.DoubleSide
});

var sunHoursMaterial = new DepthPeelMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 1,
});

var sunVectorMaterial = new DepthPeelMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 1,
});

const glassMaterial = new DepthPeelMaterial({  
    color: 0x9dabc2, 
    transparent: true,
    opacity: .6,
  });

const oneSensorMaterial = new DepthPeelMaterial({  
    color: 0xFDB813, 
    transparent: true,
    opacity: 1,
  });

const sensorMaterial = new DepthPeelMaterial({  
    color: 0xFDB813, 
    transparent: true,
    opacity: 1,
  });

const annualSunVectorsMaterial = new DepthPeelMaterial({  
    vertexColors: true,
    transparent: true,
    opacity: 1,
  });

const facadeIntersectionsMaterial = new DepthPeelMaterial({  
    color: 0xFDB813,
    transparent: true,
    opacity: 1,
  });

const FacadeVectorsMaterial = new DepthPeelMaterial({  
    color: 0xFDB813,
    transparent: true,
    opacity: 1,
  });

var optimalShadingMaterial = new DepthPeelMaterial({
    color: new THREE.Color(0xfafafa).multiplyScalar(1), 
    //alphaTest : true,
    side: THREE.DoubleSide
  });

var shadingEffectivenessMaterial = new DepthPeelMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 1,
});

const OptimalShadingVectorMaterial = new DepthPeelMaterial({  
    color: 0x4d8dd1,
    transparent: true,
    opacity: 1,
  });



var facadeMaterialList = {
    "Other": interiorMaterial,
    "Furniture":interiorMaterial,
  }

  var sunHoursMateriallList = {
    "AnnualSunHours":sunHoursMaterial
  }

  var sunVectorMateriallList = {
    "SunVectors":sunVectorMaterial
  }

  var glassMaterialList = {
    "Glass":glassMaterial,
  }

  var frameMaterialList = {
    "Frame": frameMaterial,
  }

  var sensorSphereMaterialList = {
    "SensorSphere": sensorMaterial,
  }

  var oneSensorSphereMaterialList = {
    "SensorSphere": oneSensorMaterial,
  }

  var annualSunVectorsMaterialList = {
    "AnnualSunVectors": annualSunVectorsMaterial,
  }

  var facadeIntersectionsMaterialList = {
    "FacadeIntersections": facadeIntersectionsMaterial,
  }

  var facadeVectorsMaterialList = {
    "FacadeVectors": FacadeVectorsMaterial,
  }

  var optimalShadingMaterialList = {
    "OptimalShading" : optimalShadingMaterial,
    "Awning" :optimalShadingMaterial
  }

  var shadingEffectivenessMaterialList = {
    "ShadingEffectiveness" : shadingEffectivenessMaterial
  }

  var optimalShadingVectorMaterialList = {
    "OptimalShadingVector" : OptimalShadingVectorMaterial
  }
async function init() {

    infoContainer = document.getElementById( 'info' );

    camera = new THREE.PerspectiveCamera( 45, canvasParent.clientWidth / canvasParent.clientHeight, 0.1, 10000 );
    camera.position.set( 3, 2, 3 );

    scene = new THREE.Scene();

    const light = new THREE.HemisphereLight(0xffffff, 0x080820, 1)
    scene.add(light)
    // const ambientLight = new THREE.AmbientLight(0xffffff, 1.0); // White light, full intensity
    // scene.add(ambientLight);
    // const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Brightness of the light
    // directionalLight.position.set(5, 10, 7.5); // Position to create shadows and highlights
    // scene.add(directionalLight);
    // directionalLight.castShadow = false;
    


    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( canvasParent.clientWidth, canvasParent.clientHeight );
    //renderer.setClearColor( 0x171717, 1 );
    renderer.setClearColor( 0xffffff, 1 );
    //renderer.shadowMap.enabled = true;
    canvasParent.appendChild(renderer.domElement)
    composer = new EffectComposer(renderer);

    //N8AOPass replaces RenderPass
    n8aopass = new N8AOPass(
        scene,
        camera,
        canvasParent.clientWidth,
        canvasParent.clientHeight,
    );
    // n8aopass.configuration.aoRadius = 5.0;
    // n8aopass.configuration.distanceFalloff = 1.0;
    // n8aopass.configuration.intensity = 5.0;
    n8aopass.setQualityMode("High");
    //n8aopass.configuration.transparencyAware = true;
    n8aopass.configuration.color = new THREE.Color(0, 0, 0);
    //n8aopass.setDisplayMode("AO");
    smaaPass = new SMAAPass(canvasParent.clientWidth, canvasParent.clientHeight);
    //outlinePass = new OutlinePass( new THREE.Vector2(canvasParent.clientWidth, canvasParent.clientHeight), scene, camera );
	//composer.addPass(outlinePass);
    composer.addPass(n8aopass);
    composer.addPass(smaaPass);

    rig = new CameraRig(camera, scene)
    rig.setAnimationClip(THREE.AnimationClip.parse(cameraData.animationClip))
    rig.setAnimationTime(0)
    controls = new ScrollControls(rig, {
        scrollElement,
        dampingFactor: 0.1,
        //startOffset: '-50vh',
        endOffset: '-50vh',
        scrollActions: [
          // {
          //   start: '0%',
          //   end: '15%',
          //   callback: transitionTop,
          // },
          {
            start: '85%',
            end: '100%',
            callback: transitionBottom,
          },
        ],
      })
      
      function transitionTop(progress) {
        renderer.domElement.style.opacity = progress
      }
      
      function transitionBottom(progress) {
        renderer.domElement.style.opacity = 1 - progress
      }
      controls.enable()

    // set up textures
    depthTexture = new THREE.DepthTexture( 1, 1, THREE.FloatType );
    depthTexture2 = new THREE.DepthTexture( 1, 1, THREE.FloatType );
    opaqueDepthTexture = new THREE.DepthTexture( 1, 1, THREE.FloatType );

    renderTarget = new THREE.WebGLRenderTarget( 1, 1, {
        colorSpace: COLOR_SPACE,
        depthBuffer: DEPTH_BUFFER,
        samples: SAMPLES,
    } );
    compositeTarget = new THREE.WebGLRenderTarget( 1, 1, {
        colorSpace: COLOR_SPACE,
        depthBuffer: DEPTH_BUFFER,
        samples: SAMPLES,
    } );

    // set up quad
    copyQuad = new FullScreenQuad( new THREE.MeshBasicMaterial() );

    transparentGroup = new THREE.Group();
    transparentGroup.name = "transparentGroup"
    opaqueGroup = new THREE.Group();
    opaqueGroup.name = "opaqueGroup"
    scene.add( transparentGroup, opaqueGroup );

    ground = new THREE.Mesh(new THREE.PlaneGeometry(120, 30).rotateX(-Math.PI * 0.5), new THREE.MeshBasicMaterial({color: new THREE.Color(0xfafafa).multiplyScalar(1)}));
    ground.receiveShadow = true;
    opaqueGroup.add(ground);

    window.addEventListener( 'resize', onWindowResize );
    onWindowResize();
    animate();
    controls.update(t)
    updateMeshAnimation(window.scrollY)

}
async function loadModel() {
    try {
        const furniturePromise = GLTFLoaderWithMaterial('models/furniture.gltf', facadeMaterialList, opaqueGroup);
        //const framePromise = GLTFLoaderWithMaterial('models/frame.gltf', frameMaterialList, opaqueGroup);
        const framePromise = GLTFLoaderWithAnimation('models/frame.gltf', frameMaterialList, opaqueGroup, facadeFrameAnimation, animationControllerList);
        const sunHoursPromise = GLTFLoaderWithAnimation('models/sunHours.gltf', sunHoursMateriallList, transparentGroup, sunHoursFrameAnimation, animationControllerList);
        const glassPromise = GLTFLoaderWithAnimation('models/glass.gltf', glassMaterialList, transparentGroup, facadeGlassAnimation, animationControllerList);
        const sunVectorPromise = GLTFLoaderWithAnimation('models/sunVectors.gltf', sunVectorMateriallList, transparentGroup, sunVectorAnimation, animationControllerList);
        const oneSensorPromise = GLTFLoaderWithAnimation('models/OneSensorSphere.gltf', oneSensorSphereMaterialList, transparentGroup, oneSensorAnimation, animationControllerList);
        const sensorSpherePromise = GLTFLoaderWithAnimation('models/SensorSphere.gltf', sensorSphereMaterialList, transparentGroup, sensorsAnimation, animationControllerList);
        const annualVectorsPromise = GLTFLoaderWithAnimation('models/AnnualSunVectors.gltf', annualSunVectorsMaterialList, transparentGroup, annualSunVectorsAnimation, animationControllerList);
        const facadeIntersectionsPromise = GLTFLoaderWithAnimation('models/FacadeIntersections.gltf', facadeIntersectionsMaterialList, transparentGroup, facadeIntersectionsAnimation, animationControllerList);
        const facadeVectorsPromise = GLTFLoaderWithAnimation('models/FacadeVectors.gltf', facadeVectorsMaterialList, transparentGroup, facadeVectorsAnimation, animationControllerList);
        const optimalShadingPromise = GLTFLoaderWithAnimation('models/OptimalShading_Awing.gltf', optimalShadingMaterialList, opaqueGroup, optimalShadingAnimation, animationControllerList);
        const shadingEffectivenessPromise = GLTFLoaderWithAnimation('models/ShadingEffectiveness.gltf', shadingEffectivenessMaterialList, transparentGroup, shadingEffectivenessAnimation, animationControllerList);
        const optimalShadingVectorPromise = GLTFLoaderWithAnimation('models/OptimalShadingVector.gltf', optimalShadingVectorMaterialList, transparentGroup, optimalShadingVectorAnimation, animationControllerList);

        await Promise.all([furniturePromise, sunHoursPromise, glassPromise, framePromise, sunVectorPromise, oneSensorPromise, sensorSpherePromise, annualVectorsPromise, facadeIntersectionsPromise, facadeVectorsPromise, optimalShadingPromise, shadingEffectivenessPromise, optimalShadingVectorPromise]);
        console.log('Model loaded and added to group');
    } catch (error) {
        console.error('Error loading model:', error);
    }
}

init();
loadModel();

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = window.devicePixelRatio;

    renderer.setSize( w, h );
    renderer.setPixelRatio( dpr );

    compositeTarget.setSize( dpr * w, dpr * h );
    renderTarget.setSize( dpr * w, dpr * h );

    layers.forEach( rt => rt.dispose() );
    layers.length = 0;

    depthTexture.image.width = dpr * w;
    depthTexture.image.height = dpr * h;
    depthTexture.dispose();

    depthTexture2.image.width = dpr * w;
    depthTexture2.image.height = dpr * h;
    depthTexture2.dispose();

    opaqueDepthTexture.image.width = dpr * w;
    opaqueDepthTexture.image.height = dpr * h;
    opaqueDepthTexture.dispose();

}

animate()

function updateMeshAnimation(scrollPosition){
    animationControllerList.forEach((animationController) => {
      //console.log(animationController.opacity)
      if(animationController != null){
        animationController.updateModelStatus(scrollPosition);
        //console.log(animationController.model.parent.parent.parent.name);
        //tried to move the objects to opaqueGroup and transparentGroup but there is error when moving transparent group back to opaqueGroup
        //GL_INVALID_OPERATION: Feedback loop formed between Framebuffer and active Texture
        // if(animationController.opacity <= 0.5){
        //     if(animationController.model.parent.parent.parent.name == "opaqueGroup")
        //     {
        //         animationController.model.parent.parent.removeFromParent()
        //         transparentGroup.add(animationController.model.parent.parent)
        //         console.log("change "+animationController.name+" to transparentGroup")
        //     }  //"opaqueGroup")
        // }
        // if(animationController.opacity > .9){
        //     if(animationController.model.parent.parent.parent.name == "transparentGroup")
        //     {

        //         animationController.model.parent.parent.removeFromParent()
        //         opaqueGroup.add(animationController.model.parent.parent)
        //         console.log("change "+animationController.name+" to opaqueGroup")

        //     }  //"opaqueGroup")
        // }

      }
    });

  }
//
function animate(t) {
    window.requestAnimationFrame(animate)
    let frameDelta;
    if ( lastFrameStart === - 1 ) {

        lastFrameStart = window.performance.now();

    } else {

        frameDelta = window.performance.now() - lastFrameStart;
        frameTime += ( frameDelta - frameTime ) / ( frameSamples + 1 );
        if ( frameSamples < 60 ) {
        
            frameSamples ++

        }

        lastFrameStart = window.performance.now();

    }

    // renderer.info.autoReset = false;
    if (rig.hasAnimation) {
        controls.update(t)
        var scrollPercent = 0
        //use controls.scrollAdaptor property to consider offset and window height
        if(controls.scrollAdaptor.values['scrollPercent']!= null)
        {
            scrollPercent = controls.scrollAdaptor.values['scrollPercent']
        }
        updateMeshAnimation(scrollPercent)

        console.log(scrollPercent)
        //console.log(window.scrollY)
      }

    if ( params.useDepthPeeling ) {

        depthPeelRender();

    } else {

        render();

    }

    //For debugging
    // infoContainer.innerText = 
    //     `Draw Calls: ${ renderer.info.render.calls }\n` +
    //     `Frame Time: ${ frameTime.toFixed( 2 ) }ms\n` +
    //     `FPS       : ${ ( 1000 / frameTime ).toFixed( 2 ) }`;
    // renderer.info.reset();

}



function render() {

    transparentGroup.traverse( ( { material } ) => {

        if ( material ) {

            material.enableDepthPeeling = false;
            material.opaqueDepth = null;
            material.nearDepth = null;
            material.blending = THREE.NormalBlending;
            material.depthWrite = false;
            material.opacity = params.opacity;
            material.side = params.doubleSided ? THREE.DoubleSide : THREE.FrontSide,
            material.forceSinglePass = false;

        }

    } );

    opaqueGroup.visible = true;
    transparentGroup.visible = true;
    renderer.render( scene, camera );

}

function depthPeelRender() {
    // const composer = new EffectComposer(renderer);
    


    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = window.devicePixelRatio;
    while ( layers.length < params.layers ) {

        layers.push( new THREE.WebGLRenderTarget( w * dpr, h * dpr, {
            colorSpace: COLOR_SPACE,
            depthBuffer: DEPTH_BUFFER,
            samples: SAMPLES,
        } ) );

    }

    while ( layers.length > params.layers ) {

        layers.pop().dispose();

    }

    opaqueGroup.visible = true;
    transparentGroup.visible = false;
    renderTarget.depthTexture = opaqueDepthTexture;
    //console.log(opaqueDepthTexture)
    renderer.setRenderTarget( renderTarget );
    renderer.render( scene, camera );
    renderer.setRenderTarget( null );

    // render opaque layer
    copyQuad.material.map = renderTarget.texture;
    copyQuad.material.blending = THREE.NoBlending;
    copyQuad.material.transparent = false;
    copyQuad.material.depthTest = false;
    copyQuad.material.depthWrite = false;
    //copyQuad.render( renderer );
    composer.render();
    //////////////////To use composer
    // const renderPass = new RenderPass(scene, camera);
    // composer.addPass(renderPass);
    //const copyQuadPass = new CopyQuadPass(copyQuad);
    //another way to add the pass to composer
    //const copyQuadPass = new CustomShaderPass(renderer, copyQuad);
    //composer.addPass(copyQuadPass);
    //composer.render();
    /////////////////

    renderTarget.depthTexture = null;

    const clearAlpha = renderer.getClearAlpha();
    renderer.getClearColor( clearColor );

    // perform depth peeling
    for ( let i = 0; i < params.layers; i ++ ) {

        opaqueGroup.visible = false;
        transparentGroup.visible = true;

        const depthTextures = [ depthTexture, depthTexture2 ];
        const writeDepthTexture = depthTextures[ ( i + 1 ) % 2 ];
        const nearDepthTexture = depthTextures[ i % 2 ];

        // update the materials, skipping the near check
        transparentGroup.traverse( ( { material } ) => {

            if ( material ) {

                material.enableDepthPeeling = true;
                material.opaqueDepth = opaqueDepthTexture;
                material.nearDepth = i === 0 ? null : nearDepthTexture;
                material.blending = THREE.CustomBlending;
                material.blendDst = THREE.ZeroFactor;
                material.blendSrc = THREE.OneFactor;
                material.depthWrite = true;
                //material.opacity = params.opacity;
                material.side = params.doubleSided ? THREE.DoubleSide : THREE.FrontSide,
                material.forceSinglePass = true;

                renderer.getDrawingBufferSize( material.resolution );

            }

        } );

        // perform rendering
        let currTarget = i === 0 ? compositeTarget : renderTarget;
        currTarget = layers[ i ];
        currTarget.depthTexture = writeDepthTexture;

        renderer.setRenderTarget( currTarget );
        renderer.setClearColor( 0, 0 );
        renderer.render( scene, camera );
        renderer.setRenderTarget( null );

    }

    renderer.setClearColor( clearColor, clearAlpha );

    // render transparent layers
    for ( let i = params.layers - 1; i >= 0; i -- ) {

        renderer.autoClear = false;
        layers[ i ].depthTexture = null;
        copyQuad.material.map = layers[ i ].texture;
        copyQuad.material.blending = THREE.NormalBlending;
        copyQuad.material.transparent = true;
        copyQuad.material.depthTest = false;
        copyQuad.material.depthWrite = false;
        copyQuad.render( renderer );

    }

    renderer.autoClear = true;
    

}

function DepthPeelMaterialMixin( baseMaterial ) {

    return class extends baseMaterial {

        get nearDepth() {

            return this._uniforms.nearDepth.value;

        }

        set nearDepth( v ) {

            this._uniforms.nearDepth.value = v;
            this.needsUpdate = true;

        }

        get opaqueDepth() {

            return this._uniforms.opaqueDepth.value;

        }

        set opaqueDepth( v ) {

            this._uniforms.opaqueDepth.value = v;

        }

        get enableDepthPeeling() {

            return this._enableDepthPeeling;

        }

        set enableDepthPeeling( v ) {

            if ( this._enableDepthPeeling !== v ) {

                this._enableDepthPeeling = v;
                this.needsUpdate = true;

            }

        }

        get resolution() {

            return this._uniforms.resolution.value;

        }

        constructor( ...args ) {

            super( ...args );

            this._firstPass = false;
            this._enableDepthPeeling = false;

            this._uniforms = {

                nearDepth: { value: null },
                opaqueDepth: { value: null },
                resolution: { value: new THREE.Vector2() },

            };

        }

        customProgramCacheKey() {

            return `${ Number( this.enableDepthPeeling ) }|${ Number( this.nearDepth ) }`;

        }

        onBeforeCompile( shader ) {

            shader.uniforms = {
                ...shader.uniforms,
                ...this._uniforms,
            };

            shader.fragmentShader =
                /* glsl */`
                    #define DEPTH_PEELING ${ Number( this.enableDepthPeeling ) }
                    #define FIRST_PASS ${ Number( ! this.nearDepth ) }
                    
                    #if DEPTH_PEELING
                    
                    uniform sampler2D nearDepth;
                    uniform sampler2D opaqueDepth;
                    uniform vec2 resolution;

                    #endif

                    ${ shader.fragmentShader }
                `.replace( 'void main() {', /* glsl */`
                
                    void main() {

                        #if DEPTH_PEELING

                        vec2 screenUV = gl_FragCoord.xy / resolution;

                        if ( texture2D( opaqueDepth, screenUV ).r < gl_FragCoord.z ) {

                            discard;

                        }

                        #if ! FIRST_PASS

                        if ( texture2D( nearDepth, screenUV ).r >= gl_FragCoord.z - 1e-6 ) {

                            discard;

                        }
                        
                        #endif

                        #endif

                ` );

        }

    };

}


