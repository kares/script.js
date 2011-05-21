/**
 * a (rhino) build script - compiles the .js file into a minified version
 * using (google's) closure compiler REST API.
 *
 * `rhino -f build.js`
 */
if (typeof java === "undefined") {
    throw "this script requires rhino/ringo (java) to run !";
}
importPackage(java.lang);

function println(msg) {
    System.out.println(msg);
}
/**
 * Read a file.
 * @param path
 * @returns content
 */
function readFile(path) {
    importPackage(java.io);
    var file = new File(path);
    var reader = new BufferedReader(new FileReader(file));
    var line, content = [];
    while ((line = reader.readLine()) != null) {
        content.push(line);
    }
    reader.close();
    return content.join('\n');
}
/**
 * POST data to an url.
 * @param url
 * @param data
 * @returns response
 */
var responseHeaders = null;
function postData(url, data) {
    importPackage(java.io, java.net);
    var connection = new URL(url).openConnection();
    connection.setRequestMethod('POST');
    connection.addRequestProperty('Content-type', 'application/x-www-form-urlencoded');
    
    connection.setDoOutput(true);
    var outStream = connection.getOutputStream();
    var dataBuffer = new java.lang.String(data).getBytes('UTF-8');
    outStream.write(dataBuffer, 0, dataBuffer.length);
    outStream.close();

    var c = connection;
    responseHeaders = {};
    for ( var i=1; i<c.getHeaderFields().size(); i++ ) {
        responseHeaders[c.getHeaderFieldKey(i)] = c.getHeaderField(i);
    }

    var reader = new BufferedReader( 
        new InputStreamReader( connection.getInputStream() ) );
    var line, response = [];
    while ((line = reader.readLine()) != null) {
        response.push(line);
    }
    response = response.join('\n');

    println('HTTP response: ' + connection.getResponseCode() + 
            ' ' + connection.getResponseMessage() +
            ' (size = ' + response.length + ')');

    return response;
}
function printResponseHeaders() {
    for (var prop in responseHeaders) {
        println(prop + ' = ' + responseHeaders[prop]);
    }
}
/**
 * Encode the given content.
 * @returns encoded content
 */
function encodeContent(content) {
    if (typeof content === 'string') {
        return encodeURI(content);
    }
    if (typeof content !== 'object') {
        throw 'could not encode content of type: ' + (typeof content);
    }
    var prop, contentMap = [];
    for ( prop in content ) {
        contentMap.push( encodeURIComponent(prop) + '=' + encodeURIComponent(content[prop]) );
    }
    return contentMap.join('&');
}
/**
 * Validate the received response from the compiler.
 */
function validateResponse(response) {
    var jResponse = new java.lang.String(response).trim();
    if ( jResponse.length() == 0 ) {
        printResponseHeaders();
        throw 'the HTTP response was empty !';
    }
    if ( jResponse.startsWith('Error(') ) {
        println(response);
        throw 'compiler returned an error ...';
    }
}

var SCRIPT_NAME = 'script';
var SCRIPT_FILE = SCRIPT_NAME + '.js';
var SCRIPT_MIN_FILE = SCRIPT_NAME + '.min.js';

var COMPILER_URL = 'http://closure-compiler.appspot.com/compile';

var jsContent = readFile(SCRIPT_FILE);

var COMPILER_DATA = {
    js_code: jsContent,
    output_info: 'compiled_code',
    output_format: 'text',
    compilation_level: 'SIMPLE_OPTIMIZATIONS' // 'ADVANCED_OPTIMIZATIONS'
};

var jsMinified = postData( COMPILER_URL, encodeContent(COMPILER_DATA) );
validateResponse( jsMinified );
var minFile = new File(SCRIPT_MIN_FILE);
var minFileWriter = new FileWriter(minFile, false);
minFileWriter.write(jsMinified, 0, jsMinified.length);
minFileWriter.close();

println("js output written to: '" + minFile + "'" +
        ' (size reduced from ' + jsContent.length +
        ' bytes to ' + jsMinified.length + ' bytes)');
