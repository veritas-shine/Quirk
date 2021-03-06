import {Config} from "src/Config.js"
import {GateBuilder} from "src/circuit/Gate.js"
import {GatePainting} from "src/draw/GatePainting.js"

let MeasurementGate = new GateBuilder().
    setSerializedIdAndSymbol("Measure").
    setTitle("Measurement Gate").
    setBlurb("Measures a wire's qubit along the Z axis.").
    promiseHasNoNetEffectOnStateVector().  // Because in the simulation we defer measurement by preventing operations.
    setDrawer(args => {
        let backColor = Config.GATE_FILL_COLOR;
        if (args.isHighlighted) {
            backColor = Config.HIGHLIGHTED_GATE_FILL_COLOR;
        }
        args.painter.fillRect(args.rect, backColor);
        GatePainting.paintOutline(args);

        const τ = Math.PI * 2;
        let r = args.rect.w*0.4;
        let {x, y} = args.rect.center();
        y += r*0.6;
        let a = -τ/6;
        let [c, s] = [Math.cos(a)*r*1.5, Math.sin(a)*r*1.5];
        let [p, q] = [x + c, y + s];

        // Draw the dial and shaft.
        args.painter.trace(trace => {
            trace.ctx.arc(x, y, r, τ/2, τ);
            trace.line(x, y, p, q);
        }).thenStroke('black');
        // Draw the indicator head.
        args.painter.trace(trace => trace.arrowHead(p, q, r*0.3, a, τ/4)).thenFill('black');
    }).
    setExtraDisableReasonFinder(args => {
        if (args.isNested) {
            return "can't\nnest\nmeasure\n(sorry)";
        }
        let isMeasured = (args.measuredMask & (1<<args.outerRow)) !== 0;
        if (args.innerColumn.hasControl() && !isMeasured) {
            return "can't\ncontrol\n(sorry)";
        }
        return undefined;
    }).
    gate;

export {MeasurementGate}
