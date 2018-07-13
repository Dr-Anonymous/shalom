/*var i = 0;

function timedCount() {
    i = i + 1;
    postMessage(i);
    setTimeout("timedCount()",500);
}

timedCount();
*/
function loadXMLDoc() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", "https://script.google.com/macros/s/AKfycbwX-bdUXwFHyej-VLVdxQc9v5izgvXJUKiKcWWHVYhnlp1B2Np9/exec", true);
    xmlhttp.send();
}
loadXMLDoc();

function loadData(e) {	  
    postMessage(e.result1);
}
