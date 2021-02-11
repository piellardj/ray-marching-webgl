declare const mat4: any;

class OrbitalCamera {
    private _focus: number[];
    private _distance: number;
    private _theta: number;
    private _phi: number;

    private _eyePos: number[];
    private _viewMatrix: number[];

    constructor(focusPoint: number[], distance: number) {
        this._focus = focusPoint;
        this._distance = distance;
        this._theta = 0;
        this._phi = 0.01;

        this._eyePos = [0, 0, 0];
        this._viewMatrix = mat4.create();
        this.recompute();
    }

    public get focusPoint(): number[] {
        return this._focus;
    }
    public set focusPoint(newFocus: number[]) {
        this._focus = newFocus;
        this.recompute();
    }

    public get distance(): number {
        return this._distance;
    }
    public set distance(newDistance: number) {
        this._distance = newDistance;
        this.recompute();
    }

    public get theta(): number {
        return this._theta;
    }
    public set theta(newTheta: number) {
        this._theta = newTheta;
        this.recompute();
    }

    public get phi(): number {
        return this._phi;
    }
    public set phi(newPhi: number) {
        this._phi = newPhi;
        this.recompute();
    }

    public get eyePos(): number[] {
        return this._eyePos;
    }

    public get viewMatrix(): number[] {
        return this._viewMatrix;
    }

    private recompute(): void {
        const sin = Math.sin;
        const cos = Math.cos;

        this._eyePos[0] = this.focusPoint[0] + this.distance * (sin(this.phi) * cos(this.theta));
        this._eyePos[1] = this.focusPoint[1] + this.distance * (sin(this.phi) * sin(this.theta));
        this._eyePos[2] = this.focusPoint[2] + this.distance * (cos(this.phi));

        this._viewMatrix = mat4.lookAt(this._viewMatrix, this.eyePos, this.focusPoint, [0, 0, 1]);
    }
}

export { OrbitalCamera };
