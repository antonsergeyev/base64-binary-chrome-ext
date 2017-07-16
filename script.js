let container = document.getElementById('container');
let inTextarea = document.getElementById('in');
let outTextarea = document.getElementById('out');

// Converts base64 string to a space-separated string of bytes in dec or hex, depending on `mode`
function base64ToByteString(str, mode) {
    const binaryStr = window.atob(str);
    const len = binaryStr.length;
    let bytes = new Uint8Array(len);
    let result;

    for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
    }

    if (mode === 'hex') {
        result = [];
        bytes.forEach(b => result.push('0x' + b.toString(16)));
    } else {
        result = bytes;
    }

    return result.join(' ');
}

// Converts space-separated string of bytes to base64
function byteStringToBase64(str) {
    if (!str) {
        return '';
    }

    let bytes = str.split(' ').map(b => {
        const byte = parseInt(b);

        if (isNaN(byte)) {
            throw new Error(`Input string contains invalid characters: "${b}". Use space-separated bytes in decimal or hex form.`);
        }

        return byte;
    });

    return window.btoa(String.fromCharCode.apply(null, new Uint8Array(bytes)));
}

// Performs encoding or decoding of user input
function processInput() {
    let result;
    let value = inTextarea.value.trim();

    try {
        if (container.getAttribute('data-current-action') === 'decode') {
            result = base64ToByteString(value, container.getAttribute('data-current-mode'));
        } else {
            result = byteStringToBase64(value);
        }

        container.classList.remove('has-error');
    } catch (e) {
        container.classList.add('has-error');
        result = e;
    }

    outTextarea.value = result;
}

function setMode(mode) {
    container.setAttribute('data-current-mode', mode);
    processInput();
}

function setAction(action) {
    container.setAttribute('data-current-action', action);

    let inPlaceholder, outPlaceholder;

    if (action === 'decode') {
        inPlaceholder = 'in: base64 string';
        outPlaceholder = 'out: decoded bytes';
    } else {
        inPlaceholder = 'in: space-separated bytes, decimal or hex';
        outPlaceholder = 'out: base64 string';
    }

    inTextarea.setAttribute('placeholder', inPlaceholder);
    outTextarea.setAttribute('placeholder', outPlaceholder);

    processInput();
}

// default mode: decoding base64 as decimal bytes
setMode('dec');
setAction('decode');

inTextarea.addEventListener('keyup', processInput, false);
inTextarea.addEventListener('change', processInput, false);

// process clicks on 'encode'/'decode' links
document.querySelectorAll('.link[data-action]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        setAction(e.target.getAttribute('data-action'));
    }, false);
});

// process clicks on 'dec'/'hex' links
document.querySelectorAll('.link[data-mode]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        setMode(e.target.getAttribute('data-mode'));
    }, false);
});