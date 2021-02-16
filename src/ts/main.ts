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

    let needToAdjustCanvasSize = true;
    function adjustCanvasSize(): void {
        if (needToAdjustCanvasSize) {
            GLCanvas.adjustSize(false);
            Viewport.setFullCanvas(gl);
            needToAdjustCanvasSize = false;
        }
    }
    Page.Canvas.Observers.canvasResize.push(() => { needToAdjustCanvasSize = true; });

    const drawer = new Drawer(gl);

    function mainLoop(): void {
        adjustCanvasSize();
        drawer.draw();
        requestAnimationFrame(mainLoop);
    }
    mainLoop();
}

main();
