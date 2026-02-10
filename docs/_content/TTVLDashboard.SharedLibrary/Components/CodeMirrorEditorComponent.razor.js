export let CodeMirrorEditor = function () {
    window._codeMirrorInstances = window._codeMirrorInstances || {};

    const preload = async () => {
        // Nếu đã có Promise đang chạy hoặc đã load xong thì dùng lại
        if (typeof window.CodeMirror === "function") return;

        // Tạo Promise duy nhất để mọi component đều chờ vào đây
         let codemirror_loaderPromise = (async () => {
            // Bước 1: Core
             await loadAsset({ type: "js", url: "_content/TTVLDashboard.SharedLibrary/plugins/codemirror/codemirror.min.js", location: "body" });

            // 🆕 Bước 2: Mode con (cần thiết cho htmlmixed)
             await loadAsset({ type: "js", url: "_content/TTVLDashboard.SharedLibrary/plugins/codemirror/xml.min.js", location: "body" });
             await loadAsset({ type: "js", url: "_content/TTVLDashboard.SharedLibrary/plugins/codemirror/javascript.min.js", location: "body" });
             await loadAsset({ type: "js", url: "_content/TTVLDashboard.SharedLibrary/plugins/codemirror/css.min.js", location: "body" });

            // Bước 3: htmlmixed (phải sau khi xml/js/css)
             await loadAsset({ type: "js", url: "_content/TTVLDashboard.SharedLibrary/plugins/codemirror/htmlmixed.min.js", location: "body" });
             await loadAsset({ type: "js", url: "_content/TTVLDashboard.SharedLibrary/plugins/codemirror/clike.js", location: "body" });

            // Bước 4: CSS
             await loadAsset({ type: "css", url: "_content/TTVLDashboard.SharedLibrary/plugins/codemirror/codemirror.min.css", location: "before" });
             await loadAsset({ type: "css", url: "_content/TTVLDashboard.SharedLibrary/plugins/codemirror/dracula.min.css", location: "before" });
        })();

        return codemirror_loaderPromise;
    };

    const init = async (textareaElement, dotNetHelper, mode) => {

        while (typeof window.CodeMirror !== "function") {
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        const editorInstance = window.CodeMirror.fromTextArea(textareaElement, {
            lineNumbers: true,
            viewportMargin: Infinity,
            mode: mode,
            theme: "dracula"
        });

        if (!editorInstance) return;

        const elementId = textareaElement.id || (textareaElement.id = `codemirror-${Date.now()}`);
        window._codeMirrorInstances[elementId] = editorInstance;

        editorInstance.on("change", () => {
            try {
                const code = editorInstance.getValue();
                dotNetHelper.invokeMethodAsync("OnJsCodeChanged", code);
            } catch (e) {
                console.log(e)
            }
        });
    };

    const setValue = async (elementId, newValue) => {
        while (typeof window.CodeMirror !== "function") {
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        const editor = window._codeMirrorInstances[elementId];
        if (editor && editor.getValue() !== newValue) {
            editor.setValue(newValue);
        }
    };

    return {
        preload,
        init,
        setValue
    };
}();