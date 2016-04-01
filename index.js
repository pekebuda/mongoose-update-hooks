var async       = require('async')
;



function plugin(schema) {
    /****************************************************************
     * Setup
     * En el seno de las funciones definidas, `self` se refiere al 
     * documento mismo sobre el cual se opera las `hooks`. 
     * 
     */
    schema.pre('validate', function(next){
            var self = this;
            this._wasNew = this.isNew;
            if (!this.isNew) this.runPreMethods(schema.preUpdateMethods, self, ()=>next() );
            return;
        }
    );
    schema.post('save', function(){
            var self = this;
            if (!this._wasNew) this.runPostMethods(schema.postUpdateMethods, self);
            return;
        }
    );
    
    
    
    /****************************************************************
     * Pre-Hooks
     * These hooks run before an instance has been updated
     * Puesto que el `iteree` consiste meramente en la ejecucion del 
     * metodo pertinente en cada una de las iteraciones, los hooks 
     * agregados a la coleccion de `pre-create` deben adecuarse a la 
     * signatura `function(doc, cb)`
     * 
     */
    schema.preUpdateMethods = [];
    schema.preUpdate = function(fn){ schema.preUpdateMethods.push(fn) };
    schema.methods.runPreMethods = function(methods, doc, callback){
        async.eachSeries(
            methods,
            function(method, signal){ method(doc, signal) }, 
            function(err){
                if (err){ throw err; }
                callback();
            }
        );
    };
    
    
    
    /****************************************************************
     * Post-Hooks
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
}



module.exports = plugin;