


  
function webviews(){
  return document.getElementsByTagName("webview");
}
let consoleinput = document.getElementById("consoleinput");
let consolemessages = document.getElementById("consolemessages");
let omnibox = document.getElementById("omnibox");
let backbutton = document.getElementById("backbutton");
let forwardbutton = document.getElementById("forwardbutton");
let reloadbutton = document.getElementById("reloadbutton");

var index = 0;

makepage(webviews()[0],document.getElementsByClassName("pagetab")[0]);
makepage(webviews()[1],document.getElementsByClassName("pagetab")[1]);

document.getElementById("newtabbutton").addEventListener("click",function(){
  makeTab();
});

function makeTab(src){
  let newel = document.createElement("DIV");
  newel.classList.add("pagetab");
  newel.classList.add("tab");
  newel.innerHTML = "Tab "+(webviews().length+1)+" ";
  newel.addEventListener("click",function(){
    let x = 0;
    let tablist = newel.parentNode.children;
    for(let a=0;a<tablist.length;a++)
      if(newel===tablist[a]){x=a;break;}
    
    console.log("switched to "+x);
    switchTab(x);
  });
  var x = webviews().length;
  var addB = document.getElementById("newtabbutton");
  addB.parentElement.insertBefore(newel,addB);
  
  let newW = document.createElement("WEBVIEW");
  document.getElementById("webview-wrapper").appendChild(newW);
  makeCloseButton(newW,newel);
  makepage(newW,newel);
  if(src) newW.src = src;
  console.log("made "+x);
  switchTab(x);
}

function makeCloseButton(webview,tabEl){
  var closebutton = document.createElement("A");
  closebutton.innerHTML = "&times;";
  closebutton.classList.add("closebutton");
  closebutton.onclick = function(e){
    if(webviews().length===1){
      webview.src = "about:blank";
      tabEl.innerText = "about:blank ";
      tabEl.title = "about:blank ";
      makeCloseButton(webview,tabEl);
    }else{
      if(webview.isVisible) {
        if(index===0) switchTab(1);
        else switchTab(0);
      }
      let webviewstemp = webviews();
      let c = 0;
      for(var a=0;a<webviewstemp.length;a++)
        if(webview===webviewstemp[a]){ c=a;break;}
      if(c<index) index--;
      
      tabEl.parentNode.removeChild(tabEl);
      webview.parentNode.removeChild(webview);
    }
    e.stopPropagation();
    e.preventDefault();
  };
  tabEl.appendChild(closebutton);
}


document.getElementsByClassName("pagetab")[0].addEventListener("click",function(){
  console.log("switched to 0");
  switchTab(0);
});

document.getElementsByClassName("pagetab")[1].addEventListener("click",function(){
  console.log("switched to 1");
  switchTab(1);
});

function switchTab(newid){
  document.getElementsByClassName("pagetab")[index].classList.toggle("selected");
  document.getElementsByClassName("pagetab")[newid].classList.toggle("selected");
  
  if(webviews()[newid].loading)
    reloadbutton.innerHTML = "&times;";
  else
    reloadbutton.innerHTML = "&#x27F3";
  
  omnibox.value = webviews()[newid].src;
  
  consolemessages.innerHTML = "";
  for(let a in webviews()[newid].consolemessagelist)
    displayConsoleMessage(webviews()[newid].consolemessagelist[a]);
    
  document.getElementById("sourcecode").innerText = webviews()[newid].sourcecodetext;
  
  document.getElementById("networkspan").innerHTML = 
    webviews()[newid].proxying?"on: ":"off";
  
  webviews()[index].isVisible = false;
  webviews()[newid].isVisible = true;
  
  webviews()[index].style.display = 'none';
  webviews()[newid].style.display = 'block';
  
  index = newid;
}

let developertab = "console";
document.getElementById("sourcecodetab").addEventListener("click",function(e){
  switchconsoletabs("sourcecode");
});
document.getElementById("consoletab").addEventListener("click",function(e){
  switchconsoletabs("console");
});
document.getElementById("networktab").addEventListener("click",function(e){
  switchconsoletabs("network");
});

document.getElementById("networkbutton").addEventListener("click",function(e){
  var current = webviews()[index];
  if(current.proxying){
    current.proxying = false;
    document.getElementById("networkbutton").innerHTML = "Turn on!";
    document.getElementById("networkspan").innerHTML = "off:";
  }else if(!current.everproxied){
    current.request.onBeforeRequest.addListener(
      function(details){
        if(current.proxying) 
          return {redirectUrl: "https://redirect-cheese.herokuapp.com/"+details.url};
      },
      {urls: ["http://*/*","https://*/*"]},
      ["blocking"]
    );
    current.proxying = true;
    current.everproxied = true;
    document.getElementById("networkbutton").innerHTML = "Turn off";
    document.getElementById("networkspan").innerHTML = "on: ";    
  }else{
    current.proxying = true;
    document.getElementById("networkbutton").innerHTML = "Turn off";
    document.getElementById("networkspan").innerHTML = "on: ";
  }
  
});


function switchconsoletabs(newtab){
  document.getElementById(developertab+"tab").classList.toggle("selected");
  document.getElementById(newtab+      "tab").classList.toggle("selected");
  document.getElementById(developertab).style.display = 'none';
  document.getElementById(newtab      ).style.display = 'block';
  developertab = newtab;
}

function displayConsoleMessage(e){
  var messagestring = "";
  var tmp = document.createElement("DIV");
  
  switch(e.level){
    case -1: tmp.style.backgroundColor = "rgb(255,251,229)"; 
             messagestring = "Verbose - "; break;
    case  0: tmp.style.backgroundColor = "rgb(255,255,255)";
             messagestring = "Info - "; break;
    case  1: tmp.style.backgroundColor = "rgb(255,251,229)";
             messagestring = "Warning: -  "; break;
    case  2: tmp.style.backgroundColor = "rgb(255,240,240)";
             messagestring = "Error - "; break;
  }
  tmp.style.border = "1px solid rgb(240,240,240)";
  tmp.style.padding = "2px";
  if(e.sourceId){
    messagestring+= e.sourceId; if(e.line) messagestring+=": "+e.line;
  }
  if(messagestring==="Info - ") messagestring = "";
  if(messagestring!=="") messagestring+="\n";
  
  tmp.innerText = messagestring+e.message;
  consolemessages.appendChild(tmp);
}

consoleinput.addEventListener('keypress',function(e){
  if(e.keyCode===13&&!e.shiftKey){
    var txt = consoleinput.value;
    webviews()[index].addConsoleMessage({message:txt});
    webviews()[index].executeScript({code:txt});
    console.log("execution now: "+txt);
    
    
    consoleinput.value = "";
    e.preventDefault();
  }
});

omnibox.addEventListener('keypress',function(e){
  if(e.keyCode===13){
    var txt = omnibox.value;
    if(txt.split(" ")[0].indexOf(".")===-1) 
      txt = "https://www.google.com/search?q="+encodeURIComponent(txt);
    else if(!txt.startsWith("http"))
      txt = "https://"+txt;
    webviews()[index].src = txt;
    omnibox.value = txt;
    e.preventDefault();
  }
});

backbutton.addEventListener('click',function(e){webviews()[index].back();});
forwardbutton.addEventListener('click',function(e){webviews()[index].forward();});
reloadbutton.addEventListener('click',function(e){
  if(!webviews()[index].loading) webviews()[index].reload();
  else webviews()[index].stop();
});


function makepage(webview,tabEl){
  
  webview.isVisible = true; 
  webview.consolemessagelist = [];
  webview.sourcecodetext;
  webview.loading = false;
  webview.proxying = false;
  webview.everproxied = false;
  
  webview.addEventListener('consolemessage', function(e){
    webview.addConsoleMessage(e);
  });
  
  webview.addEventListener("dialog",function(e){
    webview.addConsoleMessage({
      level:2,sourceId:"System",
      message:"A dialogue of type \""+e.messageType+"\" was blocked. "
      +"Dialogues are not supported in chrome apps. Dialogue message: "
      +e.messageText}
    );
  });
  
  
  webview.addConsoleMessage = function(e){
    webview.consolemessagelist.push({
      level:e.level,
      sourceId:e.sourceId,
      line:e.line,
      message:e.message
    });
    
    console.log(webview.isVisible);
    console.log(e);
    if(webview.isVisible) displayConsoleMessage(e);
  };
  
  function restartConsole(){
    webview.consolemessagelist = [];
    if(webview.isVisible){ 
      consolemessages.innerHTML = "";
      webview.addConsoleMessage({level:0,message:"Welcome! This is the javascript console."});
    }

  }
  
  function restartOther(){
    var txt = "document.getElementsByTagName('HTML')[0].innerHTML";
    webview.executeScript({code:txt},function(a){
      if(a[0]){
        webview.sourcecodetext = a[0];
        if(webview.isVisible)
          document.getElementById("sourcecode").innerText = a[0];
      }
    });
    webview.executeScript({code:"document.title"},function(a){
      if(a[0]){
        tabEl.title = a[0];
        if(a[0].length>15) a[0] = a[0].substring(0,15)+"...";
        tabEl.innerText = a[0]+" ";
        makeCloseButton(webview,tabEl);
      }
    });    
  }
  
  webview.addEventListener('loadstart',function(e){
    if(e.isTopLevel){ 
      if(webview.isVisible){
        omnibox.value = e.url;
        reloadbutton.innerHTML = "&times;";
      }
      webview.loading = true;
      restartConsole();
    }
  });
  
  webview.addEventListener('contentload',function(e){
    webview.loading = false;
    if(webview.isVisible) reloadbutton.innerHTML = "&#x27F3";
    restartOther();
  });
  
  webview.addEventListener('newwindow',function(e){
    makeTab(e.targetUrl);
  });
}






