import * as THREE from 'three';

class GLTFModelController {
    constructor(name, model, startOpacity, transitionArray) {
        //console.log("in the controller")
        this.name = name;
        //this.scene = scene;
        this.model = model;
        this.startOpacity = startOpacity;
        this.transitionArray = transitionArray;
        this.mixer = null;
        this.animations = model.animations || [];
        this.opacity = startOpacity;
        this.notUseAO = false;
        this.materialDepthWrite = false;
        this.nMax = [];

        this.initializeModel();
    }

    initializeModel() {
        //console.log("initial")
        // Set initial opacity for all meshes in the model
        // this.model.traverse((child) => {
        //     if (child.isMesh) {
        //         child.material = new THREE.MeshStandardMaterial({
        //             ...child.material,
        //             transparent: true,
        //             opacity: this.startOpacity,
        //         });
        //     }
        // });
        //console.log(this.model.children.length)
        if (this.model.children.length==0){
            this.model.material.transparent = true;
            this.model.material.opacity = this.startOpacity;
            this.opacity = this.startOpacity;
            //this.notUseAO = model.userData.cannotReceiveAO;
            //this.materialDepthWrite  = this.model.material.depthWrite;
            this.nMax.push( this.getNmax(this.model));
        }
        else{
            //console.log(this.model.children.name)
            this.nMax = []
            //this.materialDepthWrite  = this.model.material.depthWrite;
            //this.notUseAO = this.model.children[0].userData.cannotReceiveAO;
            this.model.children.forEach((object) => {
                
                object.material.transparent = true
                
                this.nMax.push( this.getNmax(object));
            });
        }
        //this.materialDepthWrite  = this.model.material.depthWrite;
        //console.log(this.nMax)


        // Add the model to the scene
        //this.scene.add(this.model);

        // Setup animation mixer if there are animations
        // if (this.animations.length > 0) {
        //     this.mixer = new THREE.AnimationMixer(this.model);
        //     this.animations.forEach((clip) => {
        //         this.mixer.clipAction(clip).play();
        //     });
        // }
    }

    getNmax(model){
        var nMax = 0;
        if (model.geometry.index !== null) {
            nMax = model.geometry.index.count;
            //console.log(`Mesh "${model.name}" is indexed.`);
            //console.log(`Index count: ${model.geometry.index.count}`);
        } else {
            nMax = model.geometry.attributes.position.count;
            //console.log(`Mesh "${model.name}" is non-indexed.`);
        }
        return nMax
    }
    updateModelStatus(position) {
        if (!this.model) return;

        // Determine the current transition based on the input position
        let currentTransition = null;
        let beforeTransectionIndex = 0;
        let afterTransectionIndex = -1;
        for (const [i,transition] of this.transitionArray.entries()) {
            //console.log(this.name+" check transition index "+i)
            //console.log(beforeTransectionIndex+" "+ afterTransectionIndex)
            if (position >= transition.startPosition && position <= transition.endPosition) {
                currentTransition = transition;
                //break;
            }
            else if((beforeTransectionIndex==afterTransectionIndex) && (position<transition.startPosition)){
                beforeTransectionIndex = i;
                //console.log(position+" before transition index changed "+i)
            }
            else if(position>transition.endPosition){
                afterTransectionIndex = i;
                beforeTransectionIndex = i;
                //console.log(position+" after transition index changed "+i)
            }
        }

        //console.log(this.name)
        //console.log("Position"+position)

        if (currentTransition) {
            //console.log(this.name+"in transection ")
            // Calculate the interpolation factor (t) between 0 and 1
            var t = (position - currentTransition.startPosition) / (currentTransition.endPosition - currentTransition.startPosition);
            
            // Interpolate opacity
            var newOpacity = THREE.MathUtils.lerp(currentTransition.startOpacity, currentTransition.endOpacity, t);
            if (newOpacity>0.9){
                newOpacity = 1;
            }
            else if (newOpacity<0.1)
            {
                newOpacity = 0;
            }
            //bound t to avoid half drawn geometry with drawRange
            if(t<0.05)
            {
                t=0
            }
            if(t>0.95)
            {
                t=1
            }
            this.opacity = newOpacity;
            //console.log(this.name+" Opacity "+newOpacity)
            if (this.model.children.length==0){

                this.model.visible = true

                if (!currentTransition.drawRange) {
                    this.model.material.opacity = newOpacity;              
                }
                else{
                    const vertexCount = this.nMax[0]
                    
                    const drawCount = Math.floor(THREE.MathUtils.lerp(0, vertexCount, t));
                    //if(t>0){
                    if(t==0){
                        this.model.material.opacity = currentTransition.startOpacity
                    }
                    else if (t>0 && t<1) {
                        this.model.material.opacity = currentTransition.endOpacity
                        modifyVertexColorsGradientOpacity(this.model.geometry, vertexCount, drawCount, 0.05*vertexCount)
                    }
                    else if(t==1){
                        this.model.material.opacity = currentTransition.endOpacity
                    }
                        
                        
                    //}
                    //this.model.geometry.setDrawRange(0, drawCount);
                }
            }
            else{

                if (!currentTransition.drawRange) {
                    this.model.children.forEach((object) => {
                        object.visible = true
                        object.material.opacity = newOpacity
                    });             
                }
                else{
                    this.model.opacity = 1
                    this.model.children.forEach((object,i) => {
                        
                        // Optionally apply draw range
                        
                        object.visible = true
                        const vertexCount = this.nMax[i]
                        //console.log(this.name+" vertext count "+vertexCount + " "+t)
                        const drawCount = Math.floor(THREE.MathUtils.lerp(0, vertexCount, t));
                        //object.geometry.setDrawRange(0, drawCount);
                        //if(t>0){
                        if(t==0){
                            this.model.material.opacity = currentTransition.startOpacity
                        }
                        else if (t>0 && t<1) {
                            this.model.material.opacity = currentTransition.endOpacity
                            modifyVertexColorsGradientOpacity(object.geometry, vertexCount, drawCount, 0.05*vertexCount)
                        }
                        else if(t==1){
                            this.model.material.opacity = currentTransition.endOpacity
                        }
                        //}
                    });
                }
            }
            
        }
        //not in a transection, turn off visibility
        else{
            
            let currentVisibility = false;
            //in case of before first animation, or in between animations beforeTransectionIndex should be larger than afterTransectionIndex
            if(beforeTransectionIndex>afterTransectionIndex){
                if(this.transitionArray[beforeTransectionIndex].startOpacity>0)
                {
                    currentVisibility = true;
                }
                else{
                    currentVisibility = false;
                }
                //console.log(this.name+" Not in transection "+" use before transectionindex "+beforeTransectionIndex)
            }
            else //after last animation
            {
                //console.log(this.name+" Not in transection "+" use after transectionindex "+beforeTransectionIndex)
                if(this.transitionArray[beforeTransectionIndex].endOpacity>0)
                {
                    currentVisibility = true;
                }
                else{
                    currentVisibility = false;
                }

            }
            if (this.model.children.length==0){
                this.model.visible = currentVisibility
            }
            else{
                this.model.children.forEach((object,i) => {
                    object.visible = currentVisibility
                });

            }
        }
    }

    update(deltaTime) {
        if (this.mixer) {
            this.mixer.update(deltaTime);
        }
    }
}
//module.exports = GLTFModelController

export default GLTFModelController;

function modifyVertexColorsGradientOpacity(geometry, vertexCount, solidVertexCount, gradientVertexCount) {
    if (geometry.hasAttribute('color')) {
        // Get the existing color attribute
        const colors = geometry.getAttribute('color');
        //console.log("color count" + colors.count)
        //const vertexCount = colors.count;
        
        // Create a new array for RGBA colors
        const newColors = new Float32Array(vertexCount * 4);
        if(solidVertexCount >vertexCount)
        {
            solidVertexCount = vertexCount
        }
        if(solidVertexCount + gradientVertexCount> vertexCount)
        {
            gradientVertexCount = vertexCount - solidVertexCount
        }
        //console.log("vertex count "+ vertexCount+" solidVertexCount "+solidVertexCount + " gradientVertexCount "+gradientVertexCount)
        // Iterate over the vertices and add the alpha channel
        for (let i = 0; i < vertexCount; i++) {
            newColors[i * 4] = colors.getX(i);     // R
            newColors[i * 4 + 1] = colors.getY(i); // G
            newColors[i * 4 + 2] = colors.getZ(i); // B
            if(i<solidVertexCount){
                newColors[i * 4 + 3] = 1;   
            }
            else if((i>=solidVertexCount) &&( i<solidVertexCount + gradientVertexCount))
            {
                var t = (i-solidVertexCount)/gradientVertexCount
                newColors[i * 4 + 3]  = THREE.MathUtils.lerp(1, 0, t);
            }
            else{
                newColors[i * 4 + 3] = 0;
            }
                     // A (fully opaque)
        }

        // Replace the old color attribute with the new one
        geometry.setAttribute('color', new THREE.BufferAttribute(newColors, 4));
    } else {
        console.warn('No vertex colors found on this geometry.');
    }
}