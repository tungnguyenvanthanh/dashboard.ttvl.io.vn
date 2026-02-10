/**
 * Device Fingerprint Helper
 * Tạo fingerprint duy nhất cho mỗi thiết bị dựa trên browser metadata
 * Fingerprint này sẽ được bind với JWT token để ngăn chặn token bị đánh cắp sử dụng trên thiết bị khác
 */
window.deviceFingerprintHelper = {
    /**
     * Lấy fingerprint của thiết bị
     * @returns {Object} Object chứa các metadata của browser
     */
    getFingerprint: function() {
        return {
            // User Agent - Browser và OS info
            userAgent: navigator.userAgent || '',
            
            // Screen resolution (including available dimensions)
            screenResolution: `${screen.width}x${screen.height}`,
            availScreenResolution: `${screen.availWidth}x${screen.availHeight}`,
            screenColorDepth: screen.colorDepth || 0,
            pixelRatio: window.devicePixelRatio || 1,
            
            // Timezone offset (phút)
            timezoneOffset: new Date().getTimezoneOffset(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
            
            // Language
            language: navigator.language || navigator.userLanguage || '',
            languages: navigator.languages ? navigator.languages.join(',') : '',
            
            // Platform
            platform: navigator.platform || '',
            
            // Hardware concurrency (số CPU cores)
            hardwareConcurrency: navigator.hardwareConcurrency || 0,
            
            // Device memory (GB)
            deviceMemory: navigator.deviceMemory || 0,
            
            // Canvas fingerprint (phát hiện khác biệt về rendering engine)
            canvas: this.getCanvasFingerprint(),
            
            // WebGL fingerprint
            webgl: this.getWebGLFingerprint(),
            
            // Touch support
            touchSupport: this.getTouchSupport(),
            
            // Audio context fingerprint
            audio: this.getAudioFingerprint(),
            
            // Additional entropy sources
            plugins: this.getPluginsHash(),
            fonts: this.getFontsHash()
            
            // ⚠️ REMOVED: sessionEntropy
            // Session-specific data CAN BE COPIED with LocalStorage!
            // We rely ONLY on browser/hardware metadata that differs between browsers
        };
    },

    /**
     * Hash của plugins (tăng entropy)
     */
    getPluginsHash: function() {
        try {
            const plugins = Array.from(navigator.plugins || [])
                .map(p => `${p.name}:${p.filename}`)
                .sort()
                .join('|');
            return this.simpleHash(plugins).toString(16);
        } catch (e) {
            return 'error';
        }
    },

    /**
     * Detect fonts (tăng entropy đáng kể)
     */
    getFontsHash: function() {
        try {
            const baseFonts = ['monospace', 'sans-serif', 'serif'];
            const testFonts = [
                'Arial', 'Verdana', 'Times New Roman', 'Courier New',
                'Georgia', 'Palatino', 'Garamond', 'Bookman',
                'Comic Sans MS', 'Trebuchet MS', 'Impact'
            ];
            
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const detected = [];
            
            const getWidth = (font) => {
                ctx.font = '72px ' + font;
                return ctx.measureText('mmmmmmmmmmlli').width;
            };
            
            const baselines = baseFonts.map(font => getWidth(font));
            
            testFonts.forEach(font => {
                const widths = baseFonts.map((base, i) => 
                    getWidth(`${font},${base}`) !== baselines[i]
                );
                if (widths.some(w => w)) {
                    detected.push(font);
                }
            });
            
            return this.simpleHash(detected.join('|')).toString(16);
        } catch (e) {
            return 'error';
        }
    },

    /**
     * Simple hash function
     */
    simpleHash: function(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    },

    /**
     * Tạo Canvas fingerprint
     */
    getCanvasFingerprint: function() {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const text = 'DeviceFingerprint';
            
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.textBaseline = 'alphabetic';
            ctx.fillStyle = '#f60';
            ctx.fillRect(125, 1, 62, 20);
            ctx.fillStyle = '#069';
            ctx.fillText(text, 2, 15);
            ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
            ctx.fillText(text, 4, 17);
            
            return canvas.toDataURL().substring(0, 50);
        } catch (e) {
            return 'error';
        }
    },

    /**
     * Lấy WebGL fingerprint
     */
    getWebGLFingerprint: function() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            
            if (!gl) return 'not-supported';
            
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                // ✅ Return as string để tránh object serialization không deterministic
                const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || '';
                const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
                return `${vendor}|${renderer}`;
            }
            return 'no-debug-info';
        } catch (e) {
            return 'error';
        }
    },

    /**
     * Kiểm tra touch support
     */
    getTouchSupport: function() {
        // ✅ Return as string để tránh object serialization không deterministic
        const maxTouchPoints = navigator.maxTouchPoints || 0;
        const touchEvent = 'ontouchstart' in window;
        const touchPoints = 'TouchEvent' in window;
        return `${maxTouchPoints}|${touchEvent}|${touchPoints}`;
    },

    /**
     * Tạo Audio context fingerprint
     */
    getAudioFingerprint: function() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return 'not-supported';
            
            const context = new AudioContext();
            const oscillator = context.createOscillator();
            const analyser = context.createAnalyser();
            const gainNode = context.createGain();
            const scriptProcessor = context.createScriptProcessor(4096, 1, 1);
            
            gainNode.gain.value = 0; // Mute
            oscillator.connect(analyser);
            analyser.connect(scriptProcessor);
            scriptProcessor.connect(gainNode);
            gainNode.connect(context.destination);
            
            // ✅ Return as string để tránh object serialization không deterministic
            const sampleRate = context.sampleRate || 0;
            const channelCount = context.destination.channelCount || 0;
            const channelCountMode = context.destination.channelCountMode || '';
            const numberOfInputs = scriptProcessor.numberOfInputs || 0;
            const numberOfOutputs = scriptProcessor.numberOfOutputs || 0;
            
            const result = `${sampleRate}|${channelCount}|${channelCountMode}|${numberOfInputs}|${numberOfOutputs}`;
            
            // Cleanup
            oscillator.disconnect();
            analyser.disconnect();
            scriptProcessor.disconnect();
            gainNode.disconnect();
            context.close();
            
            return result;
        } catch (e) {
            return 'error';
        }
    }
};
