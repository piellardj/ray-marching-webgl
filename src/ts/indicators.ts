import "./page-interface-generated";

interface IIndicator {
    name: string,
    updateEveryXSeconds: number;
    lastUpdateTime: number,
    cumulatedValue: number;
    nbSamples: number;
    toString: (value: number) => string;
}

const fpsIndicator: IIndicator = {
    name: "fps-indicator",
    toString: (time: number) => Math.round(time).toString(),
    cumulatedValue: 0,
    nbSamples: 0,
    updateEveryXSeconds: 0.5,
    lastUpdateTime: performance.now(),
}

function updateIndicator(indicator: IIndicator, value: number): void {
    indicator.cumulatedValue += value;
    indicator.nbSamples++;

    const now = performance.now();
    if (now - indicator.lastUpdateTime > 1000 * indicator.updateEveryXSeconds) {
        const averageValue = indicator.cumulatedValue / indicator.nbSamples;
        Page.Canvas.setIndicatorText(indicator.name, indicator.toString(averageValue));
        indicator.cumulatedValue = 0;
        indicator.nbSamples = 0;
        indicator.lastUpdateTime = now;
    }
}

function updateFpsIndicator(fps: number): void {
    updateIndicator(fpsIndicator, fps);
}

export {
    updateFpsIndicator,
};
