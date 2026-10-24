// ReverseEngine.js
import { AudioContextManager } from "./AudioContextManager";

export class ReverseEngine {
    constructor() {
        this.acm = AudioContextManager.getInstance();
        this.ctx = this.acm.getContext();
        
        this.bufferSource = null;
        this.reversedBuffer = null;
        
        this.outputNode = this.ctx.createGain();
        this.isPlaying = false;
    }

    async loadAndReverseTrack(url, onProgress) {
        if (onProgress) onProgress(0);
        
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        
        if (onProgress) onProgress(50);
        
        const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
        
        // Reverse channels
        for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
            Array.prototype.reverse.call(audioBuffer.getChannelData(i));
        }

        this.reversedBuffer = audioBuffer;
        if (onProgress) onProgress(100);
        return true;
    }

    play(startTime = 0, playbackRate = 1.0) {
        if (!this.reversedBuffer) return;

        if (this.bufferSource) {
            this.bufferSource.stop();
            this.bufferSource.disconnect();
        }

        this.bufferSource = this.ctx.createBufferSource();
        this.bufferSource.buffer = this.reversedBuffer;
        this.bufferSource.playbackRate.value = playbackRate;
        
        this.bufferSource.connect(this.outputNode);
        this.bufferSource.start(0, startTime);
        this.isPlaying = true;
    }

    stop() {
        if (this.bufferSource && this.isPlaying) {
            this.bufferSource.stop();
            this.isPlaying = false;
        }
    }

    getOutputNode() { return this.outputNode; }
}
