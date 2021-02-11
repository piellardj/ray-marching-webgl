import "./page-interface-generated";

/* === IDs ============================================================ */
const controlId = {
    NOISE_SCALING: "noise-scaling-range-id",
    NOISE_THRESHOLD: "noise-threshold-range-id",
};


abstract class Parameters {
    public static get scaling(): number {
        return Page.Range.getValue(controlId.NOISE_SCALING);
    }

    public static get threshold(): number {
        return Page.Range.getValue(controlId.NOISE_THRESHOLD);
    }
}

export {
    Parameters,
}
