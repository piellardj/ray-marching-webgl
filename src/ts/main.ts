import * as GLCanvas from "./gl-utils/gl-canvas";
import { gl } from "./gl-utils/gl-canvas";
import { Viewport } from "./gl-utils/viewport";

import { Drawer } from "./drawer";

import { updateFpsIndicator } from "./indicators";

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


    let lastFrameTime = 0;
    function mainLoop(time: number): void {
        updateFpsIndicator(1000 / (time - lastFrameTime));
        lastFrameTime = time;

        adjustCanvasSize();
        drawer.draw();
        requestAnimationFrame(mainLoop);
    }
    mainLoop(1);
}

main();
