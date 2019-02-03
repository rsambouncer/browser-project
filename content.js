const webview = document.getElementById("webview");


webview.addEventListener('consolemessage', function(e) {
    var tmp = document.createElement("P");
    tmp.innerText = e.message;
    document.getElementById("consolediv").appendChild(tmp);
});
