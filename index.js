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
    schema.methods.runPreUpdateMethods = function(methods, doc, callback){
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
    schema.methods.runPostUpdateMethods = function(methods, doc){
        methods.forEach(function(method){ 
                method(doc, function(){return});
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
            if (!DOC.isNew) return DOC.runPreUpdateMethods(schema.preUpdateMethods, DOC, next );
            else return next();
        }
    );
    schema.post('save', function(doc){
            const DOC = this;
            if (!DOC._wasNew) return DOC.runPostUpdateMethods(schema.postUpdateMethods, DOC);
            else return;
        }
    );
}



module.exports = plugin;