Remote Script
=============

A helper for loading remote javascript using the "script tag hack".

The <script> tags might fetch any (remote) javascript by specifying a 'src'
attribute - they are not constrained by the same origin policy as AJAX requests.
However as those load document building is blocked and the page feels slow.
This script enables loading of such remote scripts after the document is built.
There's special support for scripts that write directly to the DOM using
`document.write()` (e.g. gist / pastie embedding. You might even modify the
"written" HTML content before it gets inserted into the DOM.

Examples
========

    // setup defaults - wait for DOM + a src (URL) base :
    remoteScript.defaults.onLoad = true;
    remoteScript.defaults.base = 'http://gist.github.com';

    // the script will get embedded "in place" where this code occured in the
    // HTML document :
    remoteScript('319433.js');

    // until the script is not loaded a 'loading' HTML might be shown if
    // specified as a parameter :
    remoteScript({ src: '319433.js', loadingHTML: '<h2>loading</h2>' });

    // this one will get embedded into an element with 'div-1' id :
    remoteScript({ src: '319433.js', appendScript: 'div-1' });

    // if a function is specified it is expected to add the <script> element
    // into the DOM :
    remoteScript({ src: '319433.js', appendScript: function($script) {
        var $body = document.getElementsByTagName('body')[0];
        $body.appendChild($script);
    }});

    // there's a scriptLoaded callback available - it gets called just after
    // the script has loaded and passes the script element as a parameter :
    remoteScript({ src: '319433.js', scriptLoaded: function($script) {
        var parentNode = $script.parentNode;
        parentNode.removeChild($script.nextSibling);
    }});

    // document.write() calls from remote scripts are detected when loading
    // after DOM is ready and are handled correctly - the HTML gets inserted
    // just after where the script node is inserted, the written HTML content 
    // might be modified during the scriptLoaded callback
    remoteScript({ src: '319433.js', onLoad: true,
        scriptLoaded: function($script, writeArray) {
            // writeArray contains the string arguments that were
            // passed during remote script document.write() calls
            for (var i=0; i<writeArray.length; i++) {
                var str = writeArray[i].replace(/^\s*/, ""); // L trim
                if (str.substring(0, 5).toLowerCase() == '<link') {
                    writeArray[i] = ''; // "remove" style <link>
                }
            }
        }
    });

    // @see the demo.html for a scriptLoaded callback that removes style links
    // from pasties (http://pastie.org) and gists (http://gist.github.com)

If *remoteScript* is called after the DOM has loaded - the script loading gets
executed immediately, if *appendScript* is not present scripts are appended
to the end of the <body> tag.

NOTE: that script referring to a remote URL run with the same authority as
scripts from Your page and have access to Your cookies. Thus only load remote
scripts from servers that You trust !

Copyright (c) 2010 Karol Bucek,
released under the [Apache License](http://www.apache.org/licenses/LICENSE-2.0.html)
