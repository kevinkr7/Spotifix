// KaraokeEngine.js
import { AudioContextManager } from "./AudioContextManager";

export class KaraokeEngine {
    constructor() {
        this.acm = AudioContextManager.getInstance();
        this.ctx = this.acm.getContext();

        this.inputNode = this.ctx.createGain();
        this.outputNode = this.ctx.createGain();

        // Node for stereo phase cancellation (Oooaaah magic trick)
        this.splitter = this.ctx.createChannelSplitter(2);
        this.merger = this.ctx.createChannelMerger(2);
        
        // We invert the right channel
        this.inverter = this.ctx.createGain();
        this.inverter.gain.value = -1;

        // And sum it with the left
        this.summer = this.ctx.createGain();

        // Standard passthrough bypass
        this.bypassNode = this.ctx.createGain();

        // Connect standard passthrough
        this.inputNode.connect(this.bypassNode);
        this.bypassNode.connect(this.outputNode);

        // Connect karaoke chain
        this.inputNode.connect(this.splitter);
        
        // Left channel goes directly to summer
        this.splitter.connect(this.summer, 0);
        
        // Right channel goes through inverter then to summer
        this.splitter.connect(this.inverter, 1);
        this.inverter.connect(this.summer);

        // The summer now contains (Left - Right), which cancels center-panned vocals.
        // Route it to both L and R of the merger to make it pseudo-stereo
        this.summer.connect(this.merger, 0, 0);
        this.summer.connect(this.merger, 0, 1);
        
        this.karaokeGain = this.ctx.createGain();
        this.karaokeGain.gain.value = 0; // Off by default

        this.merger.connect(this.karaokeGain);
        this.karaokeGain.connect(this.outputNode);

        this.enabled = false;
    }

    setKaraokeMode(enabled) {
        this.enabled = enabled;
        // Crossfade between bypass and karaoke
        const t = this.ctx.currentTime;
        if (enabled) {
            this.bypassNode.gain.setTargetAtTime(0.0, t, 0.1);
            this.karaokeGain.gain.setTargetAtTime(1.0, t, 0.1);
        } else {
            this.bypassNode.gain.setTargetAtTime(1.0, t, 0.1);
            this.karaokeGain.gain.setTargetAtTime(0.0, t, 0.1);
        }
    }

    getInputNode() { return this.inputNode; }
    getOutputNode() { return this.outputNode; }
}
