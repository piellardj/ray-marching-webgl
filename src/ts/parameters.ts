import "./page-interface-generated";

/* === IDs ============================================================ */
const controlId = {
    NOISE_TYPE: "noise-type",
    NOISE_SCALING: "noise-scaling-range-id",
    NOISE_THRESHOLD: "noise-threshold-range-id",
    NOISE_SHAPE: "noise-shape-range-id",
    AVOID_CLIPPING: "avoid-clipping-checkbox-id",
    SPEED: "speed-range-id",
};

type Observer = () => unknown;
const speedChangeObservers: Observer[] = [];
Page.Range.addObserver(controlId.SPEED, () => {
    for (const observer of speedChangeObservers) {
        observer();
    }
});

enum ENoiseType {
    VALUE = "value",
    GRADIENT = "gradient",
    SIMPLEX = "simplex",
}

abstract class Parameters {
    public static get noiseType(): ENoiseType {
        return Page.Tabs.getValues(controlId.NOISE_TYPE)[0] as ENoiseType;
    }

    public static get scaling(): number {
        return Page.Range.getValue(controlId.NOISE_SCALING);
    }

    public static get threshold(): number {
        return Page.Range.getValue(controlId.NOISE_THRESHOLD);
    }

    public static get avoidClipping(): boolean {
        return Page.Checkbox.isChecked(controlId.AVOID_CLIPPING);
    }

    public static get shape(): number {
        return Page.Range.getValue(controlId.NOISE_SHAPE);
    }

    public static get speed(): number {
        return Page.Range.getValue(controlId.SPEED);
    }
    public static addSpeedChangeObserver(observer: Observer): void {
        speedChangeObservers.push(observer);
    }
}

export {
    ENoiseType,
    Parameters,
}
