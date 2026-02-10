// Use centralized logger from site.js
const log = window.TTVLLogger || {
    info: () => { },
    success: () => { },
    warn: () => { },
    error: () => { }
};

const COMPONENT_NAME = 'QuillEditor';

export function init(editorId, placeholder, valueContent, dotNetHelper) {
    // Check if DOM element exists
    const element = document.getElementById(editorId);
    if (!element) {
        log.error(`Container #${editorId} not found in DOM`, COMPONENT_NAME);
        return null;
    }

    // Check if already initialized (avoid double init)
    if (window._quillEditors?.[editorId]) {
        log.warn(`Editor #${editorId} already exists, disposing old instance`, COMPONENT_NAME);
        dispose(editorId);
    }

    const toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block', 'link'],
        [{ 'header': 1 }, { 'header': 2 }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
        [{ 'script': 'sub' }, { 'script': 'super' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'font': [] }],
        [{ 'align': [] }]
    ];

    try {
        const quill = new Quill(`#${editorId}`, {
            modules: { toolbar: toolbarOptions },
            placeholder: placeholder,
            theme: "snow"
        });

        if (valueContent) {
            quill.root.innerHTML = valueContent;
        }

        quill.on("text-change", function () {
            const html = quill.root.innerHTML;
            dotNetHelper.invokeMethodAsync("OnContentChanged", html);
        });

        // ✅ LƯU CẢ QUILL INSTANCE VÀ CONTAINER REFERENCE
        if (!window._quillEditors) window._quillEditors = {};
        window._quillEditors[editorId] = {
            instance: quill,
            container: element
        };

        log.success(`Editor #${editorId} initialized successfully`, COMPONENT_NAME);
        return { success: true };
    } catch (error) {
        log.error(`Error initializing editor #${editorId}`, COMPONENT_NAME, error);
        throw error;
    }
}

export function checkContentText(editorId) {
    const editor = window._quillEditors?.[editorId];
    if (!editor?.instance) return "";
    return editor.instance.getText().trim();
}

export function setValueContent(editorId, valueContent) {
    const editor = window._quillEditors?.[editorId];
    if (!editor?.instance) {
        log.warn(`Cannot set value: Editor #${editorId} not found`, COMPONENT_NAME);
        return;
    }

    editor.instance.root.innerHTML = valueContent || "";
}

export function getHtml(editorId) {
    const editor = window._quillEditors?.[editorId];
    if (!editor?.instance) return "";

    return editor.instance.root.innerHTML ?? "";
}

export function getSemanticHtml(editorId) {
    const editor = window._quillEditors?.[editorId];
    if (!editor?.instance) return "";

    return editor.instance.getSemanticHTML() ?? "";
}

/**
 * ✅ FIXED: Proper Quill disposal - XÓA HOÀN TOÀN TOOLBAR + CONTAINER
 */
export function dispose(editorId) {
    const editor = window._quillEditors?.[editorId];

    if (!editor) {
        log.info(`Editor #${editorId} not found for disposal (already cleaned up)`, COMPONENT_NAME);
        return;
    }

    try {
        log.info(`Disposing editor #${editorId}...`, COMPONENT_NAME);

        const quill = editor.instance;
        const container = editor.container;

        // 1. Remove all event listeners
        if (quill) {
            quill.off("text-change");

            // 2. Clear content
            quill.setText("");

            // 3. Disable editor
            quill.disable();
        }

        // 4. ✅ QUAN TRỌNG: Quill tạo 2 elements:
        //    - Toolbar (sibling element với class .ql-toolbar)
        //    - Container (thay thế element gốc với class .ql-container)

        if (container) {
            // 4a. Tìm toolbar (thường là previous sibling)
            const toolbar = container.previousElementSibling;
            if (toolbar && toolbar.classList.contains('ql-toolbar')) {
                log.info(`Removing toolbar for #${editorId}`, COMPONENT_NAME);
                toolbar.remove();
            }

            // 4b. Tìm tất cả child elements có class ql-* (Quill tạo ra)
            const quillElements = container.querySelectorAll('[class*="ql-"]');
            quillElements.forEach(el => el.remove());

            // 4c. Clear toàn bộ innerHTML của container
            container.innerHTML = '';

            // 4d. Remove tất cả Quill classes
            container.className = container.className
                .split(' ')
                .filter(cls => !cls.startsWith('ql-'))
                .join(' ');

            // 4e. Reset inline styles
            container.style.cssText = '';

            log.info(`DOM cleaned for #${editorId}`, COMPONENT_NAME);
        }

        // 5. Remove from global storage
        delete window._quillEditors[editorId];

        log.success(`Editor #${editorId} disposed successfully ✅`, COMPONENT_NAME);
    } catch (error) {
        log.error(`Error disposing editor #${editorId}`, COMPONENT_NAME, error);
    }
}