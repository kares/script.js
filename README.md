Script.JS
=========

A helper for loading (remote) javascript using the "script tag hack".

The `<script>` tags might fetch any (remote) javascript by specifying a `src`
attribute - they are not constrained by the same origin policy as AJAX requests.
However as those load document building is blocked and the page feels slow.
This script enables loading of such scripts even after the document is built.
There's special support for scripts that write directly to the DOM using
`document.write()` (e.g. gist / pastie embedding or google map loading). 
One might even modify the "written" content before it gets into the DOM.

Examples
========

    // setup defaults - wait for DOM + a src (URL) base :
    script.defaults.defer = true;
    script.defaults.base = 'http://gist.github.com';

    // the script will get embedded "in place" where this code occured in the
    // HTML document :
    script('319433.js');

    // until the script is not loaded a 'loading' HTML might be shown if
    // specified as a parameter :
    script({ src: '319433.js', loadingHTML: '<h2>loading</h2>' });

    // this one will get embedded into an element with 'div-1' id :
    script({ src: '319433.js', append: 'div-1' });

    // if a function is specified it is expected to add the <script> element
    // into the DOM :
    script({ src: '319433.js', append: function($script) {
        var $body = document.getElementsByTagName('body')[0];
        $body.appendChild($script);
    }});

    // there's a loaded callback available - it gets called just after
    // the script loaded and passes the script element as a parameter :
    script({ src: '319433.js', loaded: function() {
        var parentNode = this.parentNode; // this is the loaded <script>
        parentNode.removeChild( this.nextSibling );
    }});

    // document.write() calls from remote scripts are detected when loading
    // after DOM is ready and are handled correctly - the HTML gets inserted
    // just after where the script node is inserted, if desired the written
    // content might be modified during the loaded callback
    script({ src: '319433.js', defer: true,
        loaded: function(writes) {
            // writes contains the string arguments that were
            // passed during remote script document.write() calls
            var startsWithStyleLinkRE = /^\s*?<(style)|(link)/i;
            for ( var i = 0, len = writes.length; i < len; i++ ) {
                if ( startsWithStyleLinkRE.test(writes[i]) ) {
                    // "remove" all <style> and <link> write lines
                    writes[i] = '';
                }
            }
        }
    });

[gistsAndPasties.html](/kares/script.js/blob/master/examples/gistsAndPasties.html) 
contains a loaded callback that removes style links from 
[pasties](http://pastie.org) and [gists](http://gist.github.com).

[googleMaps.html](/kares/script.js/blob/master/examples/googleMaps.html) 
demonstrates a (completely) dynamic loading of google maps.

See [scripts.js](/kares/script.js/blob/master/script.js) for all supported options.


If `script()` is called after the DOM has loaded - the script loading gets
executed immediately and if `append:` option is not present scripts are appended
to the end of the `<body>` tag.

**NOTE:** that script referring to a remote URL run with the same authority as
scripts from Your page and have access to Your cookies. 
Thus only load remote scripts from servers that You trust !
