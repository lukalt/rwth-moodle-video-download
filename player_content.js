// Source: https://stackoverflow.com/a/20513730
function injectScript(file, node) {
    var th = document.getElementsByTagName(node)[0];
    var s = document.createElement('script');
    s.setAttribute('type', 'text/javascript');
    s.setAttribute('src', file);
    th.appendChild(s);
}
// inject our script so we can access the paella object
injectScript(chrome.runtime.getURL('paella_inject.js'), 'body');