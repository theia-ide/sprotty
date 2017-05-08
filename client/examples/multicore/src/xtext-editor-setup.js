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
        var services = editor.xtextServices;
        var editorAccess = services.editorContext;
        window.xtextServices = services;

        // Handling example files --------

        var examples = ['example01', 'example02'];
        var exampleSelectionEl = jQuery('#exampleSelection');
        var exampleChangeHandler = function(choosenExample){
            jQuery.ajax('/examples/' + choosenExample + '.multicore').done(function(exampleCode) {
                editorAccess.setText(exampleCode);
            });
        };

        jQuery.each(examples, function(idx, val){
            exampleSelectionEl.append(jQuery('<option>', {'value':val, text:val}));
        });

        exampleSelectionEl.change(function(){
            exampleChangeHandler(exampleSelectionEl.val());
        });

        // Load first example initially.
        exampleChangeHandler(examples[0]);


        // Create custom services --------

        require(['xtext/services/XtextService', 'xtext/ServiceBuilder'], function(XtextService, ServiceBuilder) {
            services.selectionService = new XtextService();
            services.selectionService.initialize(services, 'select');
            services.selectionService._initServerData = function(serverData, editorContext, params) {
                serverData.elementId = params.elementId;
                serverData.modelType = params.modelType;
                serverData.caretOffset = editorContext.getCaretOffset();
            }

            services.select = function(addParams) {
                var params = ServiceBuilder.mergeOptions(addParams, services.options);
                return services.selectionService.invoke(editorAccess, params).done(function(result) {
                    if (result.offset >= 0) {
                        var pos = editor.getSession().getDocument().indexToPosition(result.offset);
                        editor.scrollToLine(pos.row, true, true);
                        editor.moveCursorTo(pos.row, pos.column);
                    }
                });
            }
        });
    });
});


