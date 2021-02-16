import * as fs from "fs";
import * as fse from "fs-extra";
import * as path from "path";
import { Demopage } from "webpage-templates";

const data = {
    title: "TITLE",
    description: "DESCRIPTION",
    introduction: [
        "INTRO"
    ],
    githubProjectName: "ray-marching-webgl",
    additionalLinks: [],
    styleFiles: [],
    scriptFiles: [
        "script/gl-matrix-2.5.1-min.js",
        "script/main.min.js"
    ],
    indicators: [],
    canvas: {
        width: 512,
        height: 512,
        enableFullscreen: true
    },
    controlsSections: [
        {
            title: "Noise",
            controls: [
                {
                    type: Demopage.supportedControls.Range,
                    title: "Scale",
                    id: "noise-scaling-range-id",
                    min: 1,
                    max: 50,
                    value: 10,
                    step: 0.1
                },
                {
                    type: Demopage.supportedControls.Range,
                    title: "Density",
                    id: "noise-threshold-range-id",
                    min: 0,
                    max: 1,
                    value: 0.5,
                    step: 0.025
                },
                {
                    type: Demopage.supportedControls.Checkbox,
                    title: "Avoid clipping",
                    id: "avoid-clipping-checkbox-id",
                    checked: true,
                },
                {
                    type: Demopage.supportedControls.Range,
                    title: "Shape",
                    id: "noise-shape-range-id",
                    min: -1,
                    max: 4,
                    value: 0,
                    step: 0.1
                },
                {
                    type: Demopage.supportedControls.Range,
                    title: "Speed",
                    id: "speed-range-id",
                    min: 0,
                    max: 1,
                    value: 0.5,
                    step: 0.01
                },
            ],
        }
    ]
};

const SRC_DIR = path.resolve(__dirname);
const DEST_DIR = path.resolve(__dirname, "..", "docs");
const minified = true;

const buildResult = Demopage.build(data, DEST_DIR, {
    debug: !minified,
});

// disable linting on this file because it is generated
buildResult.pageScriptDeclaration = "/* tslint:disable */\n" + buildResult.pageScriptDeclaration;

const SCRIPT_DECLARATION_FILEPATH = path.join(SRC_DIR, "ts", "page-interface-generated.ts");
fs.writeFileSync(SCRIPT_DECLARATION_FILEPATH, buildResult.pageScriptDeclaration);

fse.copySync(path.join(SRC_DIR, "shaders"), path.join(DEST_DIR, "shaders"));
fse.copySync(path.join(SRC_DIR, "resources", "script"), path.join(DEST_DIR, "script"));
