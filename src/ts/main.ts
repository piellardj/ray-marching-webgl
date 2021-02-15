import * as GLCanvas from "./gl-utils/gl-canvas";
import { gl } from "./gl-utils/gl-canvas";
import { Viewport } from "./gl-utils/viewport";
// import * as ShaderPicker from "./shader-picker";

import { Drawer } from "./drawer";

import "./page-interface-generated";

function main(): void {
    if (!GLCanvas.initGL()) {
        return;
    }
    gl.clearColor(0.282, 0.439, 0.702, 1); // same color as the SVG background

    function adjustCanvasSize(): void {
        GLCanvas.adjustSize(false);
        Viewport.setFullCanvas(gl);
    }

    const drawer = new Drawer(gl);

    function mainLoop(): void {
        adjustCanvasSize();

        drawer.draw();
        requestAnimationFrame(mainLoop);
    }
    mainLoop();
    // Page.Canvas.showLoader(true);
    // ShaderPicker.loadShaders((success: boolean) => {
    //     if (success) {
    //         Page.Canvas.showLoader(false);
    //         requestAnimationFrame(mainLoop);
    //     } else {
    //         Page.Demopage.setErrorMessage("shaders-loading", "Failed to load shaders.");
    //     }
    // });
}

main();
