/*
 * This file is not bundled through webpack, but loaded directly from the web page.
 */

var baseUrl = '/';
require.config({
    baseUrl: baseUrl,
    paths: {
        'jquery': 'webjars/jquery/2.2.4/jquery.min',
        'ace/ext/language_tools': 'webjars/ace/1.2.3/src/ext-language_tools',
        'xtext/xtext-ace': 'xtext/2.11.0/xtext-ace'
    }
});
require(['webjars/ace/1.2.3/src/ace'], function() {
    require(['xtext/xtext-ace', 'jquery'], function(xtext, jQuery) {
        var editor = xtext.createEditor({
            xtextLang: 'multicore',
            baseUrl: baseUrl,
            syntaxDefinition: 'xtext-resources/generated/mode-multicore'
        });
        window.xtextServices = editor.xtextServices;

        var examples = ["example01", "example02"];
        var exampleSelectionEl = jQuery("#exampleSelection");
        var exampleChangeHandler = function(choosenExample){
            jQuery.ajax('/examples/' + choosenExample + '.multicore').done(function(exampleCode) {
                editor.xtextServices.editorContext.setText(exampleCode);
            });
        };

        jQuery.each(examples, function(idx, val){
            exampleSelectionEl.append(jQuery("<option>", {"value":val, text:val}));
        });

        exampleSelectionEl.change(function(){
            exampleChangeHandler(exampleSelectionEl.val());
        });

        // load first example initially.
        exampleChangeHandler(examples[0]);
    });
});


