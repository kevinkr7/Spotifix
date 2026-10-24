// AudioContextManager.js
export class AudioContextManager {
    static instance = null;

    constructor() {
        if (AudioContextManager.instance) {
            return AudioContextManager.instance;
        }

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.context = new AudioContext();
        this.sourceNode = null;
        this.mediaElement = null;

        AudioContextManager.instance = this;
    }

    static getInstance() {
        if (!AudioContextManager.instance) {
            AudioContextManager.instance = new AudioContextManager();
        }
        return AudioContextManager.instance;
    }

    attach(mediaElement) {
        // Bug fix: return existing sourceNode when already attached, instead of undefined
        if (this.mediaElement === mediaElement) return this.sourceNode;

        // Disconnect old source if exists
        if (this.sourceNode) {
            this.sourceNode.disconnect();
        }

        this.mediaElement = mediaElement;
        // Make sure audio tag has crossOrigin="anonymous" or this throws!
        this.sourceNode = this.context.createMediaElementSource(this.mediaElement);
        return this.sourceNode;
    }

    getContext() {
        return this.context;
    }

    resume() {
        if (this.context.state === 'suspended') {
            this.context.resume();
        }
    }
}
