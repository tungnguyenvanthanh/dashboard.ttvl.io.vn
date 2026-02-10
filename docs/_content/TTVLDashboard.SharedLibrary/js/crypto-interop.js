export let CryptoInterop = function () {
    let encrypt = async (plainText, key) => {
        const encoder = new TextEncoder();
        const encodedKey = encoder.encode(key.padEnd(32).slice(0, 32));
        const cryptoKey = await crypto.subtle.importKey(
            "raw",
            encodedKey,
            { name: "AES-CBC" },
            false,
            ["encrypt"]
        );

        const iv = new Uint8Array(16); // Zero IV for simplicity
        const encrypted = await crypto.subtle.encrypt(
            { name: "AES-CBC", iv },
            cryptoKey,
            encoder.encode(plainText)
        );

        return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
    }

    let decrypt = async (cipherText, key) => {
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        const encodedKey = encoder.encode(key.padEnd(32).slice(0, 32));
        const cryptoKey = await crypto.subtle.importKey(
            "raw",
            encodedKey,
            { name: "AES-CBC" },
            false,
            ["decrypt"]
        );

        const iv = new Uint8Array(16); // Zero IV
        const encryptedData = Uint8Array.from(atob(cipherText), c => c.charCodeAt(0));
        const decrypted = await crypto.subtle.decrypt(
            { name: "AES-CBC", iv },
            cryptoKey,
            encryptedData
        );

        return decoder.decode(decrypted);
    }

    return {
        encrypt,
        decrypt
    };
}();