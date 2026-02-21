// ------------------------
// Audio System for Skyline Survivors
// ------------------------

class AudioManager {
    // Creates and configures the audio manager using persisted user settings.
    constructor(scene) {
        this.scene = scene;
        this.sounds = {};
        this.musicVolume = userSettings.musicVolume;
        this.sfxVolume = userSettings.sfxVolume;
        this.isMuted = userSettings.muted;
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.musicSource = null;
        this.musicGain = null;
        this.musicBufferPromise = null;
        this.setupUnlockHandlers();
        this.initSounds();
    }

    // Adds one-time input listeners so browsers allow Web Audio playback after user interaction.
    setupUnlockHandlers() {
        /**
         * Handles the unlock routine and encapsulates its core gameplay logic.
         * Parameters: none.
         * Returns: value defined by the surrounding game flow.
         */
        const unlock = async () => {
            if (this.audioContext && this.audioContext.state === 'suspended') {
                try {
                    await this.audioContext.resume();
                } catch (e) {
                    console.warn('AudioContext resume failed:', e);
                }
            }
            ['pointerdown', 'touchstart', 'keydown'].forEach(evt => {
                window.removeEventListener(evt, unlock);
            });
        };

        ['pointerdown', 'touchstart', 'keydown'].forEach(evt => {
            window.addEventListener(evt, unlock, { once: true });
        });
    }

    // Registers all sound definitions used by gameplay, UI, and music systems.
    initSounds() {
        this.sounds.bgMusic = {
            type: 'file',
            buffer: null,
            url: 'assets/sounds/music/Music.ogg',
            play: () => this.playAmbientMusic()
        };

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
        this.sounds.cargoDrop = { type: 'synth', frequencies: [500, 800, 1100], duration: 0.5, waveform: 'sine' };

        // Game state
        this.sounds.waveComplete = { type: 'synth', frequencies: [800, 1000, 1200, 1400], duration: 0.6, waveform: 'sine' };
        this.sounds.gameOver = { type: 'synth', frequencies: [1200, 800, 400], duration: 0.8, waveform: 'sine', pitch: 'down' };
    }

    // Plays a named sound effect if audio is enabled and the sound exists.
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

    // Generates and plays a tone-based (oscillator) sound with optional envelopes and pitch changes.
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

    // Generates and plays filtered white noise for impact-style effects.
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

    // Lazily fetches and decodes the background music file, caching the decoded buffer.
    async loadMusicBuffer() {
        if (this.sounds.bgMusic.buffer) return this.sounds.bgMusic.buffer;

        if (!this.musicBufferPromise) {
            this.musicBufferPromise = fetch(this.sounds.bgMusic.url)
                .then(response => response.arrayBuffer())
                .then(data => this.audioContext.decodeAudioData(data))
                .then(buffer => {
                    this.sounds.bgMusic.buffer = buffer;
                    return buffer;
                })
                .catch(error => {
                    console.warn('Failed to load background music:', error);
                    this.musicBufferPromise = null;
                    return null;
                });
        }

        return this.musicBufferPromise;
    }

    // Starts looping ambient background music if it is not muted and not already playing.
    async playAmbientMusic() {
        if (this.isMuted || this.musicSource) return;

        try {
            await this.audioContext.resume();
            const buffer = await this.loadMusicBuffer();
            if (!buffer) return;

            const source = this.audioContext.createBufferSource();
            const gain = this.audioContext.createGain();

            source.buffer = buffer;
            source.loop = true;
            gain.gain.value = this.musicVolume;

            source.connect(gain);
            gain.connect(this.audioContext.destination);

            source.start(0);

            this.musicSource = source;
            this.musicGain = gain;

            source.onended = () => {
                if (this.musicSource === source) this.musicSource = null;
            };
        } catch (e) {
            console.warn('Audio playback failed:', e);
        }
    }

    // Stops current music playback and disconnects any music audio nodes.
    stopMusic() {
        if (this.musicSource) {
            this.musicSource.stop();
            this.musicSource.disconnect();
            this.musicSource = null;
        }
        if (this.musicGain) {
            this.musicGain.disconnect();
            this.musicGain = null;
        }
    }

    // Toggles global mute state, persists the setting, and updates music playback.
    toggleMute() {
        this.isMuted = !this.isMuted;
        userSettings.muted = this.isMuted;
        persistUserSettings();
        if (this.isMuted) this.stopMusic();
        else this.playAmbientMusic();
        return this.isMuted;
    }

    // Sets and persists normalized music volume, updating active music gain immediately.
    setMusicVolume(value) {
        this.musicVolume = Math.max(0, Math.min(1, value));
        userSettings.musicVolume = this.musicVolume;
        persistUserSettings();
        if (this.musicGain) {
            this.musicGain.gain.value = this.musicVolume;
        }
    }

    // Sets and persists normalized sound-effects volume.
    setSFXVolume(value) {
        this.sfxVolume = Math.max(0, Math.min(1, value));
        userSettings.sfxVolume = this.sfxVolume;
        persistUserSettings();
    }

    // Releases active audio resources managed by this instance.
    dispose() {
        this.stopMusic();
    }
}
