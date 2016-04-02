var async       = require('async')
;



function plugin(schema) {
    /****************************************************************
     * PRE HOOKS
     * These hooks run before an instance has been updated
     * Puesto que el `iteree` consiste meramente en la ejecucion del 
     * metodo pertinente en cada una de las iteraciones, los hooks 
     * agregados a la coleccion de `pre-create` deben adecuarse a la 
     * signatura `function(doc, cb)`
     */
    schema.preUpdateMethods = [];
    schema.preUpdate = function(fn){ schema.preUpdateMethods.push(fn) };
    schema.methods.runPreMethods = function(methods, doc, callback){
        async.eachSeries(
            methods,
            function(method, signal){ method(doc, signal) }, 
            callback
        );
    };
    
    
    
    /****************************************************************
     * POST HOOKS
     * These hooks run after an instance has been updated
     * Puesto que el `iteree` consiste meramente en la ejecucion del 
     * metodo pertinente en cada una de las iteraciones, los hooks 
     * agregados a la coleccion de `pre-create` deben adecuarse a la 
     * signatura `function(doc, cb)`
     * 
     */
    schema.postUpdateMethods = [];
    schema.postUpdate = function(fn){ schema.postUpdateMethods.push(fn) };
    schema.methods.runPostMethods = function(methods, doc){
        async.eachSeries(
            methods,
            function(method, signal){ method(doc, signal) }, 
            function(err){
                if (err){ throw err; }
            }
        );
    };
    
    
    
    /****************************************************************
     * SETUP
     * En el seno de las funciones definidas, `DOC` se refiere al 
     * documento mismo sobre el cual operan los `hooks`. 
     */
    schema.pre('validate', function(next){
            const DOC = this;
            DOC._wasNew = DOC.isNew;
            if (!DOC.isNew) DOC.runPreMethods(schema.preUpdateMethods, DOC, next );
            return;
        }
    );
    schema.post('save', function(){
            const DOC = this;
            if (!DOC._wasNew) DOC.runPostMethods(schema.postUpdateMethods, DOC);
            return;
        }
    );
}



module.exports = plugin;