import { Shader } from "./gl-utils/shader";
import { VBO } from "./gl-utils/vbo";
import * as ShaderManager from "./gl-utils/shader-manager";
import { OrbitalCamera } from "./orbital-camera";
import { getTime } from "./time";

declare const mat4: any;

import "./page-interface-generated";
import { ENoiseDimension, ENoiseType, Parameters } from "./parameters";

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

interface IShaderPrecisions {
    [stepsCount: number]: Shader | null;
}

interface IShaderVariations {
    threeDimensions?: IShaderPrecisions;
    fourDimensions?: IShaderPrecisions;
}

interface IShadersCollection {
    valueNoise?: IShaderVariations;
    gradientNoise?: IShaderVariations;
    simplexNoise?: IShaderVariations;
}

class Drawer {
    private readonly gl: WebGLRenderingContext
    private readonly VBO: VBO;
    private readonly pMatrix: number[];
    private readonly mvpMatrix: number[];

    private readonly camera: OrbitalCamera;

    private shaders: IShadersCollection = undefined;

    public constructor(gl: WebGLRenderingContext) {
        this.gl = gl;
        this.VBO = new VBO(gl, UNIT_CUBE, 3, gl.FLOAT, true);

        this.pMatrix = mat4.create();
        this.mvpMatrix = mat4.create();
        this.camera = new OrbitalCamera([0, 0, 0], 1);
        this.camera.phi = 1.1;
        this.camera.theta = 2;

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

        gl.enable(gl.CULL_FACE);
        gl.frontFace(gl.CCW);
        gl.cullFace(gl.FRONT);
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.BLEND);

        function updateBackgroundColor(): void {
            const backgroundColor = Parameters.backgroundColor;
            gl.clearColor(backgroundColor.r / 255, backgroundColor.g / 255, backgroundColor.b / 255, 1);
        }
        Parameters.addBackgroundColorObserver(updateBackgroundColor);
        updateBackgroundColor();
    }

    public draw(): void {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        const shader = this.chooseShader();
        if (shader !== null) {
            Page.Canvas.showLoader(false);
            shader.a["aPosition"].VBO = this.VBO;
            shader.u["uMVPMatrix"].value = this.mvpMatrix;
            shader.u["uEyePosition"].value = this.camera.eyePos;
            shader.u["uScaling"].value = Parameters.scaling;
            shader.u["uThreshold"].value = Parameters.threshold;
            shader.u["uShape"].value = Parameters.shape;
            shader.u["uTime"].value = getTime();
            shader.u["uAvoidClipping"].value = +Parameters.avoidClipping;

            shader.use();
            shader.bindUniformsAndAttributes();
            this.gl.drawArrays(this.gl.TRIANGLES, 0, 3 * 2 * 6);
        }
    }

    private updateMVPMatrix(): void {
        mat4.perspective(this.pMatrix, 45, Page.Canvas.getAspectRatio(), 0.1, 100.0);
        mat4.multiply(this.mvpMatrix, this.pMatrix, this.camera.viewMatrix);
    }

    private chooseShader(): Shader | null {
        function buildShader(fragmentFilename: string, nbSteps: number, callback: (shader: Shader) => unknown): void {
            ShaderManager.buildShader(
                {
                    fragmentFilename,
                    vertexFilename: "shader.vert",
                    injected: {
                        "STEPS_COUNT": nbSteps.toString(),
                    },
                }, (builtShader: Shader | null) => {
                    if (builtShader !== null) {
                        callback(builtShader);
                    } else {
                        Page.Demopage.setErrorMessage(`shader_load_fail_${fragmentFilename}`, `Failed to load/build the shader '${fragmentFilename}'.`);
                    }
                }
            );
        }

        function chooseVariation(name: string, baseGroup: IShaderVariations): Shader | null {
            function choosePrecision(dimension: string, group: IShaderPrecisions): Shader | null {
                const precision = Parameters.rayMarchingPrecision;

                if (typeof group[precision] === "undefined") {
                    Page.Canvas.showLoader(true);
                    group[precision] = null;
                    buildShader(`shader-${name}-${dimension}.frag`, precision, (shader: Shader) => {
                        group[precision] = shader;
                    });
                }
                return group[precision];
            }

            if (Parameters.noiseDimension === ENoiseDimension.THREE_D) {
                baseGroup.threeDimensions = baseGroup.threeDimensions || {};
                return choosePrecision(Parameters.noiseDimension, baseGroup.threeDimensions);
            } else {
                baseGroup.fourDimensions = baseGroup.fourDimensions || {};
                return choosePrecision(Parameters.noiseDimension, baseGroup.fourDimensions);
            }
        }

        this.shaders = this.shaders || {};

        if (Parameters.noiseType === ENoiseType.VALUE) {
            this.shaders.valueNoise = this.shaders.valueNoise || {};
            return chooseVariation(Parameters.noiseType, this.shaders.valueNoise);
        } else if (Parameters.noiseType === ENoiseType.GRADIENT) {
            this.shaders.gradientNoise = this.shaders.gradientNoise || {};
            return chooseVariation(Parameters.noiseType, this.shaders.gradientNoise);
        } else {
            this.shaders.simplexNoise = this.shaders.simplexNoise || {};
            return chooseVariation(Parameters.noiseType, this.shaders.simplexNoise);
        }
    }
}

export { Drawer };
