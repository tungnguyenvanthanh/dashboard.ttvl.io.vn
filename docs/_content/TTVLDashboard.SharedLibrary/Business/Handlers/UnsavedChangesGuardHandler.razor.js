export const UnsavedChangesGuard = function () {
    let shouldWarn = false;

    const enableLeaveWarning = () => {
        shouldWarn = true;
        window.addEventListener('beforeunload', beforeUnloadHandler);
    };

    const disableLeaveWarning = () => {
        shouldWarn = false;
        window.removeEventListener('beforeunload', beforeUnloadHandler);
    };

    const beforeUnloadHandler = (e) => {
        if (shouldWarn) {
            e.preventDefault();
            e.returnValue = '';
            return '';
        }
    };

    return {
        enableLeaveWarning,
        disableLeaveWarning
    };
}();