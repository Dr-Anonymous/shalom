/*var i = 0;

function timedCount() {
    i = i + 1;
    postMessage(i);
    setTimeout("timedCount()",500);
}

timedCount();
*/
var myArray= [];
function loadXMLDoc() {
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
            myArray= JSON.parse(this.responseText);
            postMessage(myArray);
        }
    };

}
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", "https://script.google.com/macros/s/AKfycbwX-bdUXwFHyej-VLVdxQc9v5izgvXJUKiKcWWHVYhnlp1B2Np9/exec?callback= ", true);
    xmlhttp.send();
 
loadXMLDoc();
