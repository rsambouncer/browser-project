This browser is inspired by leaf browser, but there is some functionality that I feel is sorely needed:

1) A proxy, using the WebRequestEventInterface (basically chrome.webRequest in a webview). This is the ultimate proxy, because now neither iboss nor the school's wifi can interfere.

2) A psuedo-devconsole. Using the executeScript method to inject code, and consolemessage events, a few features of the javascript console can be replicated. The network console could probably be replicated with webrequests, but it isn't as important. The html console could just be printed. It would be pretty much impossible to do the html highlighting thingy that the real html console does, though.

