// Sử dụng logger tập trung từ site.js
const log = window.TTVLLogger || {
    info: () => { },
    success: () => { },
    warn: () => { },
    error: () => { }
};

const COMPONENT_NAME = 'Cropperjs';

export const Cropperjs = (function () {
    // Store cropper instances
    const croppers = {};

    /**
     * Khởi tạo Cropper.js instance
     * @param {HTMLElement} containerRef - Container element
     * @param {string} base64WithPrefix - Base64 image data with prefix
     * @param {object} options - Cropper options
     * @returns {string} Cropper instance ID
     */
    const init = async function (containerRef, base64WithPrefix, options) {
        try {
            log.info(`[${COMPONENT_NAME}] Init started`);

            // Check if Cropper is available (should be loaded from index.html)
            if (typeof window.Cropper === 'undefined') {
                // Wait a bit in case it's still loading
                log.warn(`[${COMPONENT_NAME}] Cropper not immediately available, waiting...`);
                let attempts = 0;
                const maxAttempts = 50; // 5 seconds max
                
                while (typeof window.Cropper === 'undefined' && attempts < maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    attempts++;
                }

                if (typeof window.Cropper === 'undefined') {
                    throw new Error('Cropper library is not loaded. Please ensure cropper.js is included in index.html');
                }
            }

            log.info(`[${COMPONENT_NAME}] Cropper library available (typeof: ${typeof window.Cropper})`);

            // Generate unique ID
            const cropperId = `cropper_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // Create image element
            const img = document.createElement('img');
            img.id = `${cropperId}_img`;
            img.src = base64WithPrefix;
            img.style.maxWidth = '100%';
            img.style.display = 'block';

            // Clear container and append image
            containerRef.innerHTML = '';
            containerRef.appendChild(img);

            // Wait for image to load
            await new Promise((resolve, reject) => {
                if (img.complete && img.naturalHeight !== 0) {
                    log.info(`[${COMPONENT_NAME}] Image already loaded`);
                    resolve();
                } else {
                    img.onload = () => {
                        log.info(`[${COMPONENT_NAME}] Image onload fired`);
                        resolve();
                    };
                    img.onerror = () => {
                        log.error(`[${COMPONENT_NAME}] Image failed to load`);
                        reject(new Error('Failed to load image'));
                    };
                }
            });

            log.info(`[${COMPONENT_NAME}] Image loaded successfully, creating Cropper instance...`);

            // Initialize Cropper
            const cropperOptions = {
                aspectRatio: options.aspectRatio || NaN,
                viewMode: options.viewMode || 1,
                dragMode: 'move',
                autoCropArea: 0.8,
                restore: false,
                guides: true,
                center: true,
                highlight: true,
                cropBoxMovable: true,
                cropBoxResizable: true,
                toggleDragModeOnDblclick: false,
                responsive: true,
                background: true,
                modal: true,
                scalable: true,
                zoomable: true,
                zoomOnTouch: true,
                zoomOnWheel: true,
                wheelZoomRatio: 0.1,
                minContainerWidth: 200,
                minContainerHeight: 200,
                ready: function () {
                    log.success(`[${COMPONENT_NAME}] Cropper ready event fired: ${cropperId}`);
                }
            };

            const cropper = new window.Cropper(img, cropperOptions);

            // Store instance
            croppers[cropperId] = {
                cropper: cropper,
                imageElement: img,
                containerElement: containerRef
            };

            log.success(`[${COMPONENT_NAME}] Init completed successfully: ${cropperId}`);
            return cropperId;
        } catch (error) {
            log.error(`[${COMPONENT_NAME}] Init error:`, error);
            throw error;
        }
    };

    /**
     * Get cropped canvas as base64
     * @param {string} cropperId - Cropper instance ID
     * @param {object} options - Canvas options (width, height, etc.)
     * @returns {string} Base64 image data with prefix
     */
    const getCroppedCanvas = function (cropperId, options) {
        try {
            const instance = croppers[cropperId];
            if (!instance || !instance.cropper) {
                throw new Error(`Cropper instance not found: ${cropperId}`);
            }

            const canvasOptions = {
                width: options.width,
                height: options.height,
                minWidth: options.minWidth || 0,
                minHeight: options.minHeight || 0,
                maxWidth: options.maxWidth || 4096,
                maxHeight: options.maxHeight || 4096,
                fillColor: options.fillColor || '#fff',
                imageSmoothingEnabled: options.imageSmoothingEnabled !== false,
                imageSmoothingQuality: options.imageSmoothingQuality || 'high'
            };

            const canvas = instance.cropper.getCroppedCanvas(canvasOptions);
            const base64 = canvas.toDataURL('image/png');

            log.info(`[${COMPONENT_NAME}] Canvas cropped successfully`);
            return base64;
        } catch (error) {
            log.error(`[${COMPONENT_NAME}] getCroppedCanvas error:`, error);
            throw error;
        }
    };

    /**
     * Rotate image
     * @param {string} cropperId - Cropper instance ID
     * @param {number} degree - Rotation degree
     */
    const rotate = function (cropperId, degree) {
        try {
            const instance = croppers[cropperId];
            if (!instance || !instance.cropper) {
                throw new Error(`Cropper instance not found: ${cropperId}`);
            }

            instance.cropper.rotate(degree);
            log.info(`[${COMPONENT_NAME}] Rotated ${degree}°`);
        } catch (error) {
            log.error(`[${COMPONENT_NAME}] Rotate error:`, error);
            throw error;
        }
    };

    /**
     * Scale image horizontally
     * @param {string} cropperId - Cropper instance ID
     * @param {number} scaleX - Scale value (-1 or 1)
     */
    const scaleX = function (cropperId, scaleX) {
        try {
            const instance = croppers[cropperId];
            if (!instance || !instance.cropper) {
                throw new Error(`Cropper instance not found: ${cropperId}`);
            }

            instance.cropper.scaleX(scaleX);
            log.info(`[${COMPONENT_NAME}] ScaleX: ${scaleX}`);
        } catch (error) {
            log.error(`[${COMPONENT_NAME}] ScaleX error:`, error);
            throw error;
        }
    };

    /**
     * Scale image vertically
     * @param {string} cropperId - Cropper instance ID
     * @param {number} scaleY - Scale value (-1 or 1)
     */
    const scaleY = function (cropperId, scaleY) {
        try {
            const instance = croppers[cropperId];
            if (!instance || !instance.cropper) {
                throw new Error(`Cropper instance not found: ${cropperId}`);
            }

            instance.cropper.scaleY(scaleY);
            log.info(`[${COMPONENT_NAME}] ScaleY: ${scaleY}`);
        } catch (error) {
            log.error(`[${COMPONENT_NAME}] ScaleY error:`, error);
            throw error;
        }
    };

    /**
     * Zoom image
     * @param {string} cropperId - Cropper instance ID
     * @param {number} ratio - Zoom ratio
     */
    const zoom = function (cropperId, ratio) {
        try {
            const instance = croppers[cropperId];
            if (!instance || !instance.cropper) {
                throw new Error(`Cropper instance not found: ${cropperId}`);
            }

            instance.cropper.zoom(ratio);
            log.info(`[${COMPONENT_NAME}] Zoom: ${ratio}`);
        } catch (error) {
            log.error(`[${COMPONENT_NAME}] Zoom error:`, error);
            throw error;
        }
    };

    /**
     * Reset cropper to initial state
     * @param {string} cropperId - Cropper instance ID
     */
    const reset = function (cropperId) {
        try {
            const instance = croppers[cropperId];
            if (!instance || !instance.cropper) {
                throw new Error(`Cropper instance not found: ${cropperId}`);
            }

            instance.cropper.reset();
            log.info(`[${COMPONENT_NAME}] Reset completed`);
        } catch (error) {
            log.error(`[${COMPONENT_NAME}] Reset error:`, error);
            throw error;
        }
    };

    /**
     * Set aspect ratio
     * @param {string} cropperId - Cropper instance ID
     * @param {number} aspectRatio - Aspect ratio value (NaN for free)
     */
    const setAspectRatio = function (cropperId, aspectRatio) {
        try {
            const instance = croppers[cropperId];
            if (!instance || !instance.cropper) {
                throw new Error(`Cropper instance not found: ${cropperId}`);
            }

            instance.cropper.setAspectRatio(aspectRatio);
            log.info(`[${COMPONENT_NAME}] Aspect ratio set to: ${aspectRatio}`);
        } catch (error) {
            log.error(`[${COMPONENT_NAME}] SetAspectRatio error:`, error);
            throw error;
        }
    };

    /**
     * Dispose cropper instance
     * @param {string} cropperId - Cropper instance ID
     */
    const dispose = function (cropperId) {
        try {
            const instance = croppers[cropperId];
            if (instance) {
                // Destroy cropper
                if (instance.cropper) {
                    instance.cropper.destroy();
                }

                // Clean up DOM
                if (instance.containerElement) {
                    instance.containerElement.innerHTML = '';
                }

                // Remove from storage
                delete croppers[cropperId];

                log.info(`[${COMPONENT_NAME}] Disposed: ${cropperId}`);
            }
        } catch (error) {
            log.warn(`[${COMPONENT_NAME}] Dispose error:`, error);
        }
    };

    // Public API
    return {
        init,
        getCroppedCanvas,
        rotate,
        scaleX,
        scaleY,
        zoom,
        reset,
        setAspectRatio,
        dispose
    };
})();