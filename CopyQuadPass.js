import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { Pass } from 'three/examples/jsm/postprocessing/Pass.js';
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';

export class CopyQuadPass extends Pass {
    // constructor(copyQuad) {
    //   super();
    //   this.copyQuad = copyQuad;
    //   this.needsSwap = true;
    // }
  
    // render(renderer, writeBuffer, readBuffer /*, deltaTime, maskActive */) {
    //   // Use the readBuffer as the texture for the copyQuad
    //   this.copyQuad.material.map = readBuffer.texture;
      
    //   // Render the copyQuad to the writeBuffer
    //   if (this.renderToScreen) {
    //     renderer.setRenderTarget(null);
    //     this.copyQuad.render(renderer);
    //   } else {
    //     renderer.setRenderTarget(writeBuffer);
    //     if (this.clear) renderer.clear();
    //     this.copyQuad.render(renderer);
    //   }
    // }
    constructor(copyQuad) {
        super();
        this.material = copyQuad.material;
        this.fsQuad = new FullScreenQuad(this.material);
    }

    render(renderer, writeBuffer, readBuffer) {
        this.material.map = readBuffer.texture;
        renderer.setRenderTarget(this.renderToScreen ? null : writeBuffer);
        this.fsQuad.render(renderer);
    }
  }