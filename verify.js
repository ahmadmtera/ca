// Initializing the verdict header, verdict status icon, and the verdict text element
var verdictHeader = document.querySelector('h2#verdictHeader');
var verdictStatusIcon = document.querySelector('img#verdictStatusIcon');
var verdictText = document.querySelector('td#verdictText');
var verdictFileName;
var informativeMessageHeader = document.querySelector('h3#informativeMessageHeader');
var informativeMessageContent = document.querySelector('p#informativeMessageContent');

// Initializing the input elements for hiding later
var attachFile = document.querySelector('h2#attachFile');
var verifyBtn = document.querySelector('button#verifyBtn');
var inputForm = document.querySelector('form#inputForm');

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
 
    reader.readAsText(file);
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

// Verifying the claimed file signature against the public key
async function runVerification() {
    const signatureBase64 = claimedSignature;
    data = claimedFile;
    console.log(signatureBase64);
    // Convert the base64 signature to an ArrayBuffer
    const signature = Uint8Array.from(atob(signatureBase64), c => c.charCodeAt(0));

    // Import the public key
    const publicKey = await importPublicKey(pemPublicKey);

    // Verify the signature
    const isValid = await verifySignature(publicKey, signature, data);
    verdictHeader.setAttribute("style", "display: block;");
    verdictStatusIcon.setAttribute("style", "display: inline;");
    verdictText.setAttribute("style", "display: inline;");
    informativeMessageHeader.setAttribute("style", "display: block;");
    informativeMessageContent.setAttribute("style", "display: inline;");
    attachFile.setAttribute("style", "display: none;");
    verifyBtn.setAttribute("style", "display: none;");
    inputForm.setAttribute("style", "display: none;");
    if (isValid == true) {
        verdictText.setAttribute("style", "color: green;");
        verdictText.innerHTML = 'The signature is valid for "' + verdictFileName + '".';
        verdictStatusIcon.setAttribute("src", "images/green_circle.svg");
        informativeMessageContent.innerHTML = "The file's authenticity has been cryptographically verified. It was created by me and no third party changed it along the way.";
        verifyBtn.setAttribute("style", "display: none;");
    }
    else if (isValid == false) {
        verdictText.setAttribute("style", "color: red;");
        verdictText.innerHTML = 'The signature is invalid for "' + verdictFileName + '".';
        verdictStatusIcon.setAttribute("src", "images/red_circle.svg");
        informativeMessageContent.innerHTML = "The file's authenticity could not be verified. It has been modified by a third party in between the time I created it and before it reached you.";
        verifyBtn.setAttribute("style", "display: none;");
    }
}

async function verifySignature(publicKey, signature, data) {
    const enc = new TextEncoder();
    const isValid = await window.crypto.subtle.verify(
    {
        name: 'RSASSA-PKCS1-v1_5',
    },
        publicKey,
        signature,
        enc.encode(data)
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