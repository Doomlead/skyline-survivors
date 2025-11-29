// ------------------------
// Audio System for Skyline Survivors
// ------------------------

class AudioManager {
    constructor(scene) {
        this.scene = scene;
        this.sounds = {};
        this.musicVolume = 0.6;
        this.sfxVolume = 0.7;
        this.isMuted = false;
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.initSounds();
    }

    initSounds() {
        this.sounds.bgMusic = { type: 'synth', play: () => this.playAmbientMusic() };

        // Player
        this.sounds.playerFire = { type: 'synth', freq: 800, duration: 0.1, waveform: 'sine' };
        this.sounds.playerFireSpread = { type: 'synth', freq: 600, duration: 0.15, waveform: 'sine' };
        this.sounds.playerMissile = { type: 'synth', freq: 1200, duration: 0.2, waveform: 'square' };
        this.sounds.powerUpCollect = { type: 'synth', frequencies: [800, 1200, 1600], duration: 0.3, waveform: 'sine' };

        // Enemies
        this.sounds.enemyShoot = { type: 'synth', freq: 400, duration: 0.08, waveform: 'square' };
        this.sounds.enemySpawn = { type: 'synth', frequencies: [500, 700, 900], duration: 0.4, waveform: 'sawtooth' };

        // Impacts
        this.sounds.explosion = { type: 'noise', duration: 0.5 };
        this.sounds.hitEnemy = { type: 'synth', freq: 1000, duration: 0.12, waveform: 'sine', decay: true };
        this.sounds.hitPlayer = { type: 'synth', freq: 200, duration: 0.3, waveform: 'sine' };

        // UI
        this.sounds.uiSelect = { type: 'synth', freq: 1200, duration: 0.1, waveform: 'sine' };
        this.sounds.uiConfirm = { type: 'synth', frequencies: [1000, 1400], duration: 0.2, waveform: 'sine' };

        // Specials
        this.sounds.smartBomb = { type: 'synth', freq: 2000, duration: 0.5, waveform: 'square', modulate: true };
        this.sounds.hyperspace = { type: 'synth', frequencies: [600, 1000, 1400], duration: 0.4, waveform: 'sine', pitch: 'up' };

        // Humans
        this.sounds.humanRescued = { type: 'synth', frequencies: [1200, 1400, 1600], duration: 0.4, waveform: 'sine', pitch: 'up' };
        this.sounds.humanAbducted = { type: 'synth', freq: 600, duration: 0.3, waveform: 'sine', pitch: 'down' };

        // Game state
        this.sounds.waveComplete = { type: 'synth', frequencies: [800, 1000, 1200, 1400], duration: 0.6, waveform: 'sine' };
        this.sounds.gameOver = { type: 'synth', frequencies: [1200, 800, 400], duration: 0.8, waveform: 'sine', pitch: 'down' };
    }

    playSound(soundName, options = {}) {
        if (this.isMuted || !this.sounds[soundName]) return;
        const sound = this.sounds[soundName];
        const volume = options.volume !== undefined ? options.volume : this.sfxVolume;
        try {
            if (sound.type === 'synth') this.playSynthSound(sound, volume, options);
            else if (sound.type === 'noise') this.playNoiseSound(sound, volume, options);
        } catch (e) {
            console.warn('Audio playback failed:', e);
        }
    }

    playSynthSound(sound, volume, options = {}) {
        const now = this.audioContext.currentTime;
        const duration = sound.duration || 0.2;
        const waveform = sound.waveform || 'sine';

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.type = waveform;
        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        gain.gain.setValueAtTime(volume, now);
        if (sound.decay) {
            gain.gain.exponentialRampToValueAtTime(0.01, now + duration * 0.7);
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        } else {
            gain.gain.linearRampToValueAtTime(0, now + duration);
        }

        if (sound.frequencies) {
            const freqs = sound.frequencies;
            const stepTime = duration / (freqs.length - 1 || 1);
            freqs.forEach((freq, i) => {
                osc.frequency.setValueAtTime(freq, now + i * stepTime);
            });
        } else {
            osc.frequency.setValueAtTime(sound.freq, now);
            if (sound.pitch === 'up') {
                osc.frequency.exponentialRampToValueAtTime(sound.freq * 1.5, now + duration * 0.5);
                osc.frequency.exponentialRampToValueAtTime(sound.freq, now + duration);
            } else if (sound.pitch === 'down') {
                osc.frequency.exponentialRampToValueAtTime(sound.freq * 0.5, now + duration * 0.5);
                osc.frequency.exponentialRampToValueAtTime(sound.freq * 0.2, now + duration);
            }
        }

        if (sound.modulate) {
            const lfo = this.audioContext.createOscillator();
            const lfoGain = this.audioContext.createGain();
            lfo.frequency.value = 8;
            lfoGain.gain.value = (sound.freq || 440) * 0.2;
            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);
            osc.start(now);
            osc.stop(now + duration);
            lfo.start(now);
            lfo.stop(now + duration);
        } else {
            osc.start(now);
            osc.stop(now + duration);
        }
    }

    playNoiseSound(sound, volume, options = {}) {
        const now = this.audioContext.currentTime;
        const duration = sound.duration || 0.3;

        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;

        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 2000;

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioContext.destination);

        source.start(now);
        source.stop(now + duration);
    }

    playAmbientMusic() {
        if (this.isMuted) return;
        const now = this.audioContext.currentTime;
        const tempo = 0.5;
        const beatDuration = 1 / tempo;
        const notes = [
            { freq: 440, start: 0, duration: beatDuration * 2 },
            { freq: 550, start: beatDuration * 2, duration: beatDuration },
            { freq: 660, start: beatDuration * 3, duration: beatDuration },
            { freq: 550, start: beatDuration * 4, duration: beatDuration * 2 },
            { freq: 440, start: beatDuration * 6, duration: beatDuration * 2 }
        ];

        notes.forEach(note => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            osc.type = 'sine';
            osc.frequency.value = note.freq;
            gain.gain.setValueAtTime(this.musicVolume * 0.3, now + note.start);
            gain.gain.linearRampToValueAtTime(0, now + note.start + note.duration);
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            osc.start(now + note.start);
            osc.stop(now + note.start + note.duration);
        });

        if (!this.musicLoopId) {
            this.musicLoopId = setInterval(() => {
                if (!this.isMuted && !gameState.gameOver) {
                    this.playAmbientMusic();
                }
            }, beatDuration * 8 * 1000);
        }
    }

    stopMusic() {
        if (this.musicLoopId) {
            clearInterval(this.musicLoopId);
            this.musicLoopId = null;
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) this.stopMusic();
        else this.playAmbientMusic();
        return this.isMuted;
    }

    setMusicVolume(value) {
        this.musicVolume = Math.max(0, Math.min(1, value));
    }

    setSFXVolume(value) {
        this.sfxVolume = Math.max(0, Math.min(1, value));
    }

    dispose() {
        this.stopMusic();
    }
}
