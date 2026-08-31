// EqualizerEngine.js
import { AudioContextManager } from "./AudioContextManager";

export class EqualizerEngine {
    constructor() {
        this.acm = AudioContextManager.getInstance();
        this.ctx = this.acm.getContext();
        
        // 10-band frequencies
        this.frequencies = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
        this.filters = [];

        this.inputNode = this.ctx.createGain();
        this.outputNode = this.ctx.createGain();

        // Build filter chain
        let prevNode = this.inputNode;

        this.frequencies.forEach((freq, index) => {
            const filter = this.ctx.createBiquadFilter();
            
            if (index === 0) filter.type = 'lowshelf';
            else if (index === this.frequencies.length - 1) filter.type = 'highshelf';
            else filter.type = 'peaking';

            filter.frequency.value = freq;
            filter.Q.value = 1;
            filter.gain.value = 0; // Flat by default

            this.filters.push(filter);
            prevNode.connect(filter);
            prevNode = filter;
        });

        // Add Bass Boost node at 60Hz
        this.bassBoostNode = this.ctx.createBiquadFilter();
        this.bassBoostNode.type = 'lowshelf';
        this.bassBoostNode.frequency.value = 60;
        this.bassBoostNode.gain.value = 0;
        prevNode.connect(this.bassBoostNode);
        
        this.bassBoostNode.connect(this.outputNode);
        
        this.enabled = true;
    }

    setBandGain(index, gainValue) {
        if (this.filters[index]) {
            this.filters[index].gain.setTargetAtTime(gainValue, this.ctx.currentTime, 0.1);
        }
    }

    setBassBoost(gainValue) {
        this.bassBoostNode.gain.setTargetAtTime(gainValue, this.ctx.currentTime, 0.1);
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        // In a real robust engine, we would route around the EQ nodes to fully bypass.
        // For simplicity, if disabled, we set all gains to 0 (flat).
        if (!enabled) {
            this.filters.forEach(f => f.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1));
            this.bassBoostNode.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
        }
    }

    getInputNode() { return this.inputNode; }
    getOutputNode() { return this.outputNode; }
}
