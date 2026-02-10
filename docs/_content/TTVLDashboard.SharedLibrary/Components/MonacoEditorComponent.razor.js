// Sử dụng logger tập trung từ site.js
const log = window.TTVLLogger || {
    info: () => { },
    success: () => { },
    warn: () => { },
    error: () => { }
};

const COMPONENT_NAME = 'MonacoEditor';

/**
 * Module Monaco Editor
 * Cách dùng: await module.InvokeVoidAsync("MonacoEditor.init", ...)
 */
export const MonacoEditor = (function () {
    // Lưu trữ private
    const editors = {};
    const ready = {};
    const debounceTimers = {};

    /**
     * Khởi tạo Monaco Editor
     * @param {string} divId - ID của container
     * @param {string} value - Giá trị khởi tạo
     * @param {string} language - Ngôn ngữ (csharp, javascript, html, json, ...)
     * @param {string} theme - Theme (vs, vs-dark, hc-black)
     * @param {boolean} readOnly - Chế độ chỉ đọc
     * @param {object} dotNetHelper - DotNetObjectReference để callback
     * @returns {Promise} Promise khi editor sẵn sàng
     */
    const init = function (divId, value, language, theme, readOnly, dotNetHelper) {
        if (typeof require === 'undefined') {
            log.error('Monaco loader.js chưa được tải', COMPONENT_NAME);
            return Promise.reject('Monaco loader not found');
        }

        // Cho phép override version qua window.MonacoConfig
        const MONACO_VERSION = window.MonacoConfig?.version || '0.52.2';
        const MONACO_CDN = window.MonacoConfig?.cdn ||
            `https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/${MONACO_VERSION}/min`;

        require.config({
            paths: {
                vs: `${MONACO_CDN}/vs`
            }
        });

        self.MonacoEnvironment = {
            baseUrl: `${MONACO_CDN}/`
        };

        ready[divId] = new Promise((resolve, reject) => {
            require(['vs/editor/editor.main'], function () {
                try {
                    const editorElement = document.getElementById(divId);

                    if (!editorElement) {
                        throw new Error(`Không tìm thấy element với id '${divId}'`);
                    }

                    const editor = monaco.editor.create(editorElement, {
                        value: value,
                        language: language,
                        theme: theme,
                        automaticLayout: true,
                        readOnly: readOnly
                    });

                    // Xử lý thay đổi nội dung với debounce
                    editor.onDidChangeModelContent(() => {
                        // Xóa timer cũ
                        if (debounceTimers[divId]) {
                            clearTimeout(debounceTimers[divId]);
                        }

                        // Đặt timer mới (debounce 300ms)
                        debounceTimers[divId] = setTimeout(() => {
                            const content = editor.getValue();
                            dotNetHelper.invokeMethodAsync('OnContentChangedFromJs', content)
                                .catch(err => {
                                    log.error(`Lỗi khi gọi OnContentChangedFromJs cho #${divId}`, COMPONENT_NAME, err);
                                });
                        }, 300);
                    });

                    editors[divId] = editor;
                    log.success(`Khởi tạo editor #${divId} thành công`, COMPONENT_NAME);
                    resolve();

                } catch (error) {
                    log.error(`Lỗi khi tạo Monaco Editor #${divId}`, COMPONENT_NAME, error);
                    reject(error);
                }
            }, function (err) {
                log.error(`Lỗi khi load Monaco Editor modules cho #${divId}`, COMPONENT_NAME, err);
                reject(err);
            });
        });

        return ready[divId];
    };

    /**
     * Cập nhật giá trị cho Monaco Editor
     * @param {string} divId - ID của editor
     * @param {string} newValue - Giá trị mới
     */
    const setValue = async function (divId, newValue) {
        try {
            await ready[divId]; // Chờ editor sẵn sàng
            const editor = editors[divId];

            if (!editor) {
                log.warn(`Không thể cập nhật: Editor #${divId} không tồn tại`, COMPONENT_NAME);
                return;
            }

            const currentValue = editor.getValue();
            if (currentValue !== newValue) {
                editor.setValue(newValue);
            }
        } catch (error) {
            log.error(`Lỗi khi cập nhật giá trị cho #${divId}`, COMPONENT_NAME, error);
        }
    };

    /**
     * Dispose Monaco Editor và giải phóng tài nguyên
     * @param {string} divId - ID của editor
     */
    const dispose = function (divId) {
        try {
            const editor = editors[divId];

            if (!editor) {
                log.info(`Editor #${divId} không tồn tại khi dispose (đã được dọn dẹp)`, COMPONENT_NAME);
                return;
            }

            log.info(`Đang dispose editor #${divId}...`, COMPONENT_NAME);

            // Xóa debounce timer
            if (debounceTimers[divId]) {
                clearTimeout(debounceTimers[divId]);
                delete debounceTimers[divId];
            }

            // Dispose editor
            editor.dispose();
            delete editors[divId];

            // Dọn dẹp ready promise
            if (ready[divId]) {
                delete ready[divId];
            }

            log.success(`Dispose editor #${divId} thành công`, COMPONENT_NAME);
        } catch (error) {
            log.error(`Lỗi khi dispose Monaco Editor #${divId}`, COMPONENT_NAME, error);
        }
    };

    // Public API
    return {
        init,
        setValue,
        dispose
    };
})();
