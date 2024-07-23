function populateVerdict() {

    // Initializing the main section's template
    var mainSection = document.querySelector("main");
    mainSection.innerHTML = `<h2 id="verdictHeader" class="center">Verdict</h2>
    <div>
        <table align="center">
            <tbody>
            <tr><td><img id="verdictStatusIcon" src="images/loading.gif" alt=" Awaiting for your input..." width="14" height="14"></td><td>&nbsp;</td><td id="verdictText" name="verdictText"></td></tr>
            </tbody>
        </table>
    </div>
    <br>
    <h3 id="informativeMessageHeader" class="center">What Does This Mean?</h3>
    <p id="informativeMessageContent" class="center"></p>`;

    // Initializing the verdict status icon, the verdict text, and... elements
    var verdictStatusIcon = document.querySelector('img#verdictStatusIcon');
    var verdictText = document.querySelector('td#verdictText');
    var informativeMessageContent = document.querySelector('p#informativeMessageContent');
    
    if (window.sharedData.isValid == true) {
        verdictText.setAttribute("style", "color: green;");
        verdictText.innerHTML = 'The signature is valid for "' + window.sharedData.fileName + '".';
        verdictStatusIcon.setAttribute("src", "images/green_circle.svg");
        informativeMessageContent.innerHTML = "The file's authenticity has been cryptographically verified. It was created by me and no third party changed it along the way.";
    }
    else if (window.sharedData.isValid == false) {
        verdictText.setAttribute("style", "color: red;");
        verdictText.innerHTML = 'The signature is invalid for "' + window.sharedData.fileName + '".';
        verdictStatusIcon.setAttribute("src", "images/red_circle.svg");
        informativeMessageContent.innerHTML = "The file's authenticity could not be verified. It has been modified by a third party in between the time I created it and before it reached you.";
}
}