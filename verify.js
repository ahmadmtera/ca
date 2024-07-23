// Automatically loading public key from file on server
var pemPublicKey;
fetch("./key.pub")
  .then((res) => res.text())
  .then((text) => {
    pemPublicKey = text;
   })
  .catch((e) => console.error(e));

// Loading claimed file from user when claimed file is attached as input
var claimedFile;
let claimedFileInput = document.querySelector('input#claimedFile') 
// This event listener has been implemented to identify a
// Change in the input section of the html code
// It will be triggered when a file is chosen.
claimedFileInput.addEventListener('change', () => {
    let files = claimedFileInput.files;
 
    if (files.length == 0) return;
 
    /* If any further modifications have to be made on the
       Extracted text. The text can be accessed using the 
       file variable. But since this is const, it is a read 
       only variable, hence immutable. To make any changes, 
       changing const to var, here and In the reader.onload 
       function would be advisible */
    const file = files[0];

    verdictFileName = file.name;
 
    let reader = new FileReader();
 
    reader.onload = (e) => {
        const file = e.target.result;
 
        // This is a regular expression to identify carriage 
        // Returns and line breaks
        claimedFile = file;
    };
 
    reader.onerror = (e) => alert(e.target.error.name);
 
    reader.readAsArrayBuffer(file);
});

// For converting binary signature array to a base64 string
function _arrayBufferToBase64( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
}

var utf8ArrayToStr = (function () {
    var charCache = new Array(128);  // Preallocate the cache for the common single byte chars
    var charFromCodePt = String.fromCodePoint || String.fromCharCode;
    var result = [];

    return function (array) {
        var codePt, byte1;
        var buffLen = array.length;

        result.length = 0;

        for (var i = 0; i < buffLen;) {
            byte1 = array[i++];

            if (byte1 <= 0x7F) {
                codePt = byte1;
            } else if (byte1 <= 0xDF) {
                codePt = ((byte1 & 0x1F) << 6) | (array[i++] & 0x3F);
            } else if (byte1 <= 0xEF) {
                codePt = ((byte1 & 0x0F) << 12) | ((array[i++] & 0x3F) << 6) | (array[i++] & 0x3F);
            } else if (String.fromCodePoint) {
                codePt = ((byte1 & 0x07) << 18) | ((array[i++] & 0x3F) << 12) | ((array[i++] & 0x3F) << 6) | (array[i++] & 0x3F);
            } else {
                codePt = 63;    // Cannot convert four byte code points, so use "?" instead
                i += 3;
            }

            result.push(charCache[codePt] || (charCache[codePt] = charFromCodePt(codePt)));
        }

        return result.join('');
    };
})();

// Verifying the claimed file signature against the public key
async function runVerification() {
    const signatureBase64 = claimedSignature;
    data = new Uint8Array(claimedFile);
    // Convert the base64 signature to an ArrayBuffer
    const signature = Uint8Array.from(atob(signatureBase64), c => c.charCodeAt(0));

    // Import the public key
    const publicKey = await importPublicKey(pemPublicKey);

    // Verify the signature
    const isValid = await verifySignature(publicKey, signature, data);
    if (isValid == true)
        window.sharedData = {"fileName": verdictFileName, "isValid": true};
    else if (isValid == false) 
        window.sharedData = {"fileName": verdictFileName, "isValid": false};
    populateVerdict();
}

async function verifySignature(publicKey, signature, data) {
    const enc = new TextEncoder();
    const isValid = await window.crypto.subtle.verify(
    {
        name: 'RSASSA-PKCS1-v1_5',
    },
        publicKey,
        signature,
        data
    );
    return isValid;
}

async function importPublicKey(pemKey) {
    const binaryDer = pemToArrayBuffer(pemKey);
    return await window.crypto.subtle.importKey(
        'spki',
        binaryDer,
        {
            name: 'RSASSA-PKCS1-v1_5',
            hash: { name: 'SHA-256' },
        },
        true,
        ['verify']
    );
}

function pemToArrayBuffer(pem) {
    const b64Lines = pem.replace(/(-----(BEGIN|END) PUBLIC KEY-----|\n)/g, '');
    const b64 = window.atob(b64Lines);
    const binary = new Uint8Array(b64.length);
    for (let i = 0; i < b64.length; i++) {
        binary[i] = b64.charCodeAt(i);
    }
    return binary.buffer;
}