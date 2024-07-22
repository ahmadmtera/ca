const urlParams = new URLSearchParams(window.location.search);
var claimedSignature = urlParams.get('signature');
console.log(claimedSignature);