import { Shader } from "./gl-utils/shader";
import { VBO } from "./gl-utils/vbo";
import * as ShaderManager from "./gl-utils/shader-manager";

const UNIT_CUBE = new Float32Array([
    0, 0, 0,
    1, 0, 0,
    0, 1, 0,
    1, 0, 0,
    1, 1, 0,
    0, 1, 0,
]);

class Drawer {
    private readonly gl: WebGLRenderingContext
    private readonly VBO: VBO;
    private shader: Shader = null

    public constructor(gl: WebGLRenderingContext) {
        this.gl = gl;
        this.VBO = new VBO(gl, UNIT_CUBE, 3, gl.FLOAT, true);

        ShaderManager.buildShader(
            {
                fragmentFilename: "shader.frag",
                vertexFilename: "shader.vert",
                injected: {},
            }, (builtShader: Shader | null) => {
                if (builtShader !== null) {
                    this.shader = builtShader;

                    builtShader.a["aCoords"].VBO = this.VBO;
                } else {
                    Page.Demopage.setErrorMessage("shader_load_fail", "Failed to load/build the shader.");
                }
            }
        );
    }

    public draw(): void {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        if (this.shader !== null) {
            this.gl.disable(this.gl.CULL_FACE);
            this.gl.disable(this.gl.DEPTH_TEST);

            this.shader.use();
            this.shader.bindUniformsAndAttributes();
            this.gl.drawArrays(this.gl.TRIANGLES, 0, 3 * 2);
        }
    }
}

export { Drawer };
