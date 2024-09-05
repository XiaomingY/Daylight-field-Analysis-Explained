import * as THREE from 'three';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { Pass, FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js';

export class CustomShaderPass extends Pass {
    /**
     * Constructs the CustomShaderPass.
     * @param {THREE.WebGLRenderer} renderer - The WebGL renderer.
     * @param {FullScreenQuad} copyQuad - The FullScreenQuad to be used as input.
     */
    constructor(copyQuad) {
        super();

        this.copyQuad = copyQuad;

        this.textureID = 'tDiffuse';
        this.uniforms = {
            'tDiffuse': { value: null },
            'opacity': { value: 1.0 }
        };

        this.material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
            fragmentShader: `
            uniform sampler2D tDiffuse;
            uniform sampler2D tCopyQuad;
            varying vec2 vUv;

            void main() {
                vec4 baseColor = texture2D(tDiffuse, vUv);
                vec4 quadColor = texture2D(tCopyQuad, vUv);
                // Mix the colors or do any operation
                gl_FragColor = mix(baseColor, quadColor, 0.5); // Example blend
            }
        `
        });

        this.fsQuad = new FullScreenQuad(this.material);
    }

    render(renderer, writeBuffer, readBuffer, deltaTime, maskActive) {
        // Pass input texture to the shader
        this.uniforms[this.textureID].value = readBuffer.texture;

        // Render using the full screen quad
        if (this.renderToScreen) {
            renderer.setRenderTarget(null);
            this.fsQuad.render(renderer);
        } else {
            renderer.setRenderTarget(writeBuffer);
            if (this.clear) renderer.clear();
            this.fsQuad.render(renderer);
        }
    }

    dispose() {
        this.material.dispose();
        this.fsQuad.dispose();
    }
}