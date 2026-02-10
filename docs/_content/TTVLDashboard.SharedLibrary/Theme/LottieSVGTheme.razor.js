// Sử dụng logger tập trung từ site.js
const log = window.TTVLLogger || {
    info: () => { },
    success: () => { },
    warn: () => { },
    error: () => { }
};

const COMPONENT_NAME = 'LottieSVG';

/**
 * Module Lottie SVG Animation
 * Cách dùng: await module.InvokeVoidAsync("LottieSVG.preload", ...)
 */
export const LottieSVG = (function () {
    // Lưu trữ private
    const instances = {};

    /**
     * Preload Lottie library
     * Đảm bảo library chỉ load một lần dù có nhiều component
     * @returns {Promise} Promise khi library sẵn sàng
     */
    const preload = async function () {
        // Nếu đã có Promise đang chạy hoặc đã load xong thì dùng lại
        if (window.__LottieSVG_loaderPromise) {
            log.info('Lottie library đã được preload', COMPONENT_NAME);
            return window.__LottieSVG_loaderPromise;
        }

        log.info('Bắt đầu preload Lottie library...', COMPONENT_NAME);

        // Đánh dấu đã preload (library được load trong index.html)
        window.__LottieSVG_loaderPromise = true;

        log.success('Preload Lottie library thành công', COMPONENT_NAME);
        return window.__LottieSVG_loaderPromise;
    };

    /**
     * Chờ cho đến khi window.lottie có sẵn
     * @returns {Promise} Promise khi lottie library ready
     */
    const waitForLottie = async function () {
        let attempts = 0;
        const maxAttempts = 20; // 20 * 500ms = 10 seconds timeout

        while (typeof window.lottie === "undefined") {
            if (attempts >= maxAttempts) {
                const error = 'Timeout: Lottie library không load được sau 10 giây';
                log.error(error, COMPONENT_NAME);
                throw new Error(error);
            }

            await new Promise(resolve => setTimeout(resolve, 500));
            attempts++;

            if (attempts % 4 === 0) { // Log mỗi 2 giây
                log.info(`Đang chờ Lottie library... (${attempts * 0.5}s)`, COMPONENT_NAME);
            }
        }

        log.success('Lottie library đã sẵn sàng', COMPONENT_NAME);
    };

    /**
     * Khởi tạo Lottie animation
     * @param {HTMLElement} el - DOM element chứa animation
     * @param {string} jsonUrl - URL tới file JSON animation
     * @param {boolean} loop - Có lặp lại animation không
     * @param {number} speed - Tốc độ animation
     */
    const init = async function (el, jsonUrl, loop, speed) {
        try {
            if (!el) {
                log.warn('Element không tồn tại, bỏ qua init', COMPONENT_NAME);
                return;
            }

            if (!jsonUrl) {
                log.error('jsonUrl không được cung cấp', COMPONENT_NAME);
                return;
            }

            log.info(`Đang khởi tạo animation từ: ${jsonUrl}`, COMPONENT_NAME);

            // Chờ Lottie library
            await waitForLottie();

            // Xóa nội dung cũ
            el.innerHTML = "";

            // Tạo animation instance
            const animate = window.lottie.loadAnimation({
                container: el,
                renderer: 'svg',
                loop: loop,
                autoplay: true,
                path: jsonUrl
            });

            // Set tốc độ
            animate.setSpeed(speed);

            // Lưu instance để có thể dispose sau
            const instanceId = el.id || `lottie_${Date.now()}`;
            instances[instanceId] = animate;

            log.success(`Khởi tạo animation thành công (loop: ${loop}, speed: ${speed})`, COMPONENT_NAME);

            // Log khi animation load xong
            animate.addEventListener('DOMLoaded', function() {
                log.info('Animation data đã load xong', COMPONENT_NAME);
            });

            // Log nếu có lỗi
            animate.addEventListener('error', function(err) {
                log.error(`Lỗi khi load animation: ${jsonUrl}`, COMPONENT_NAME, err);
            });

        } catch (error) {
            log.error(`Lỗi khi khởi tạo Lottie animation`, COMPONENT_NAME, error);
            throw error;
        }
    };

    /**
     * Dispose animation instance
     * @param {string} instanceId - ID của animation instance
     */
    const dispose = function (instanceId) {
        try {
            const instance = instances[instanceId];

            if (!instance) {
                log.info(`Animation instance '${instanceId}' không tồn tại (đã được dọn dẹp)`, COMPONENT_NAME);
                return;
            }

            log.info(`Đang dispose animation instance: ${instanceId}`, COMPONENT_NAME);

            instance.destroy();
            delete instances[instanceId];

            log.success(`Dispose animation instance '${instanceId}' thành công`, COMPONENT_NAME);
        } catch (error) {
            log.error(`Lỗi khi dispose animation instance '${instanceId}'`, COMPONENT_NAME, error);
        }
    };

    // Public API
    return {
        preload,
        init,
        dispose
    };
})();