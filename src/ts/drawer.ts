import { Shader } from "./gl-utils/shader";
import { VBO } from "./gl-utils/vbo";
import * as ShaderManager from "./gl-utils/shader-manager";
import { OrbitalCamera } from "./orbital-camera";
import { getTime } from "./time";

declare const mat4: any;

import "./page-interface-generated";
import { Parameters } from "./parameters";

const UNIT_CUBE = new Float32Array([
    -.5, -.5, -.5,
    +.5, -.5, -.5,
    -.5, -.5, +.5,
    +.5, -.5, -.5,
    +.5, -.5, +.5,
    -.5, -.5, +.5,

    +.5, -.5, -.5,
    +.5, +.5, -.5,
    +.5, -.5, +.5,
    +.5, +.5, -.5,
    +.5, +.5, +.5,
    +.5, -.5, +.5,

    -.5, -.5, +.5,
    +.5, -.5, +.5,
    -.5, +.5, +.5,
    +.5, -.5, +.5,
    +.5, +.5, +.5,
    -.5, +.5, +.5,

    -.5, +.5, -.5,
    -.5, +.5, +.5,
    +.5, +.5, -.5,
    +.5, +.5, -.5,
    -.5, +.5, +.5,
    +.5, +.5, +.5,

    -.5, -.5, -.5,
    -.5, -.5, +.5,
    -.5, +.5, -.5,
    -.5, +.5, -.5,
    -.5, -.5, +.5,
    -.5, +.5, +.5,

    -.5, -.5, -.5,
    -.5, +.5, -.5,
    +.5, -.5, -.5,
    +.5, -.5, -.5,
    -.5, +.5, -.5,
    +.5, +.5, -.5,
]);

class Drawer {
    private readonly gl: WebGLRenderingContext
    private readonly VBO: VBO;
    private readonly pMatrix: number[];
    private readonly mvpMatrix: number[];

    private readonly camera: OrbitalCamera;

    private shader: Shader = null

    public constructor(gl: WebGLRenderingContext) {
        this.gl = gl;
        this.VBO = new VBO(gl, UNIT_CUBE, 3, gl.FLOAT, true);

        this.pMatrix = mat4.create();
        this.mvpMatrix = mat4.create();
        this.camera = new OrbitalCamera([0, 0, 0], 2);
        this.camera.phi = 1.1;
        this.camera.theta = 0.5;

        const EPSILON = 1.0;
        const minPhi = EPSILON;
        const maxPhi = Math.PI - EPSILON;
        Page.Canvas.Observers.mouseDrag.push((dX: number, dY: number) => {
            this.camera.theta -= 0.5 * 2 * 3.14159 * dX;
            this.camera.phi -= 0.5 * 2 * 3 * dY;
            this.camera.phi = Math.min(maxPhi, Math.max(minPhi, this.camera.phi));
            this.updateMVPMatrix();
        });

        const minDist = 0.52;
        const maxDist = 3;
        Page.Canvas.Observers.mouseWheel.push((delta: number) => {
            let d = this.camera.distance + 0.2 * delta;
            d = Math.min(maxDist, Math.max(minDist, d));
            this.camera.distance = d;
            this.updateMVPMatrix();
        });
        this.updateMVPMatrix();

        Page.Canvas.Observers.canvasResize.push(() => {
            this.updateMVPMatrix();
        });

        ShaderManager.buildShader(
            {
                fragmentFilename: "shader.frag",
                vertexFilename: "shader.vert",
                injected: {},
            }, (builtShader: Shader | null) => {
                if (builtShader !== null) {
                    this.shader = builtShader;

                    this.shader.a["aPosition"].VBO = this.VBO;
                    this.shader.use();
                    this.shader.bindAttributes();

                    this.shader.u["uMVPMatrix"].value = this.mvpMatrix;
                } else {
                    Page.Demopage.setErrorMessage("shader_load_fail", "Failed to load/build the shader.");
                }
            }
        );

        gl.enable(gl.CULL_FACE);
        gl.frontFace(gl.CCW);
        gl.cullFace(gl.FRONT);
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.BLEND);
        gl.clearColor(0.282, 0.439, 0.702, 1);
    }

    public draw(): void {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        if (this.shader !== null) {
            this.shader.u["uEyePosition"].value = this.camera.eyePos;
            this.shader.u["uScaling"].value = Parameters.scaling;
            this.shader.u["uThreshold"].value = Parameters.threshold;
            this.shader.u["uShape"].value = Parameters.shape;
            this.shader.u["uTime"].value = 0.1 * getTime();
            this.shader.u["uAvoidClipping"].value = +Parameters.avoidClipping;
            this.shader.bindUniforms();
            this.gl.drawArrays(this.gl.TRIANGLES, 0, 3 * 2 * 6);
        }
    }

    private updateMVPMatrix(): void {
        mat4.perspective(this.pMatrix, 45, Page.Canvas.getAspectRatio(), 0.1, 100.0);
        mat4.multiply(this.mvpMatrix, this.pMatrix, this.camera.viewMatrix);
    }
}

export { Drawer };
