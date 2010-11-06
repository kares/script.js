Script.JS
=========

A helper for loading (remote) javascript using the "script tag hack".

The `<script>` tags might fetch any (remote) javascript by specifying a `src`
attribute - they are not constrained by the same origin policy as AJAX requests.
However as those load document building is blocked and the page feels slow.
This script enables loading of such scripts even after the document is built.
There's special support for scripts that write directly to the DOM using
`document.write()` (e.g. gist / pastie embedding). Thus one might even modify
the "written" HTML content before it gets inserted into the DOM.

Examples
========

    // setup defaults - wait for DOM + a src (URL) base :
    script.defaults.onLoad = true;
    script.defaults.base = 'http://gist.github.com';

    // the script will get embedded "in place" where this code occured in the
    // HTML document :
    script('319433.js');

    // until the script is not loaded a 'loading' HTML might be shown if
    // specified as a parameter :
    script({ src: '319433.js', loadingHTML: '<h2>loading</h2>' });

    // this one will get embedded into an element with 'div-1' id :
    script({ src: '319433.js', appendScript: 'div-1' });

    // if a function is specified it is expected to add the <script> element
    // into the DOM :
    script({ src: '319433.js', append: function($script) {
        var $body = document.getElementsByTagName('body')[0];
        $body.appendChild($script);
    }});

    // there's a loaded callback available - it gets called just after
    // the script loaded and passes the script element as a parameter :
    script({ src: '319433.js', loaded: function($script) {
        var parentNode = $script.parentNode;
        parentNode.removeChild($script.nextSibling);
    }});

    // document.write() calls from remote scripts are detected when loading
    // after DOM is ready and are handled correctly - the HTML gets inserted
    // just after where the script node is inserted, if desired the written
    // content might be modified during the loaded callback
    script({ src: '319433.js', onLoad: true,
        loaded: function($script, writes) {
            // writes contains the string arguments that were
            // passed during remote script document.write() calls
            for ( var i = 0; i < writes.length; i++ ) {
                var str = writes[i].replace(/^\s*/, ""); // L trim
                if ( str.substring(0, 5).toLowerCase() == '<link' ) {
                    writes[i] = ''; // "remove" style <link>s
                }
            }
        }
    });

    // @see demo.html for a loaded callback that removes style links
    // from pasties (http://pastie.org) and gists (http://gist.github.com)

If `script()` is called after the DOM has loaded - the script loading gets
executed immediately and if `append:` option is not present scripts are appended
to the end of the `<body>` tag.

NOTE: that script referring to a remote URL run with the same authority as
scripts from Your page and have access to Your cookies.
Thus only load remote scripts from servers that You trust !
