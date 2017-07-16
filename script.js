let container = document.getElementById('container');
let inTextarea = document.getElementById('in');
let outTextarea = document.getElementById('out');

// Converts base64 string to a either space-separated string of bytes, or to text, depending on `mode`
function base64ToString(str, mode) {
    if (mode === 'text') {
        return window.atob(str);
    }

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

// Converts either ASCII string or space-separated string of bytes, depending on `mode`, to base64
function stringToBase64(str, mode) {
    if (!str) {
        return '';
    }

    if (mode === 'text') {
        const result = window.btoa(str);
        
        if (result.length < 1) {
            throw new Errow('Cannot decode this to ASCII string. Try decimal or hex.');
        }

        return result;
    }

    const bytes = str.split(' ').map(part => {
        const byte = parseInt(part);

        if (isNaN(byte)) {
            throw new Error(
                `Input string contains invalid characters: "${part}". Use space-separated bytes in decimal or hex form.`
            );
        }

        return byte;
    });

    return window.btoa(String.fromCharCode.apply(null, new Uint8Array(bytes)));
}

// Performs encoding or decoding of user input
function processInput() {
    let result;
    const value = inTextarea.value.trim();

    try {
        if (getAction() === 'decode') {
            result = base64ToString(value, getMode());
        } else {
            result = stringToBase64(value, getMode());
        }

        container.classList.remove('has-error');
    } catch (e) {
        container.classList.add('has-error');
        result = e;
    }

    outTextarea.value = result;
}

// Returns current decoding mode - dec, hex, or text
function getMode() {
    return container.getAttribute('data-current-mode');
}

// Sets decoding mode - dec, hex, or text
function setMode(mode) {
    container.setAttribute('data-current-mode', mode);
    processInput();
}

// Returns current action - decode or encode
function getAction() {
    return container.getAttribute('data-current-action');
}

// Sets action - decode or encode
function setAction(action) {
    container.setAttribute('data-current-action', action);

    let inPlaceholder, outPlaceholder;

    if (action === 'decode') {
        inPlaceholder = 'in: base64 string';
        outPlaceholder = 'out: decoded bytes';
    } else {
        inPlaceholder = 'in: space-separated bytes, or just an ASCII string';
        outPlaceholder = 'out: base64 string';
    }

    inTextarea.setAttribute('placeholder', inPlaceholder);
    inTextarea.setAttribute('title', inPlaceholder);
    outTextarea.setAttribute('placeholder', outPlaceholder);
    outTextarea.setAttribute('title', outPlaceholder);

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