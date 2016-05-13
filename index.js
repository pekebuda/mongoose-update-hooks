var async       = require('async')
;



function plugin(schema) {
    /****************************************************************
     * wasNew
     * Campo cuyo examen permite determinar si los metodos definidos
     * mediante schema#preUpdate() deben ser ejecutados (documentos 
     * actualizados) o no (de nueva creacion)
     */
    schema.add({"_wasNew": Boolean});
    
    
    
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
    schema.methods.runPreUpdateMethods = runPreUpdateMethods;
    
    
    
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
    schema.methods.runPostUpdateMethods = runPostUpdateMethods;
    
    
    
    /****************************************************************
     * HOOKS TRIGGERING SETUP 
     * Puesto que no existe ninguna funcion 'update' que pueda ser 
     * 'escuchada' al estilo de `init`, `save`... la forma de provocar 
     * el desencadenamiento de los hooks asociados al evento `create` 
     * es evaluar si se trata de un documento de nueva creacion, y si 
     * lo es, ejecutar los hooks `pre-` en el seno a su vez de un hook 
     * `pre-validate` y los `post-` de un hook `post-save`
     * 
     * En el seno de las funciones definidas, `DOC` se refiere al 
     * documento mismo sobre el cual operan los `hooks`. 
     */
    schema.pre('validate', function(next){
            const DOC = this;
            DOC._wasNew = DOC.isNew;
            if (!DOC.isNew) return runPreUpdateMethods(schema.preUpdateMethods, DOC, next );
            else return next();
        }
    );
    schema.post('save', function(doc){
            if (!doc._wasNew) return runPostUpdateMethods(schema.postUpdateMethods, doc);
            else return;
        }
    );
}



function runPreUpdateMethods(methods, doc, callback){
    async.eachSeries(
        methods,
        function(method, signal){ method.bind(doc)(signal) }, 
        callback
    );
}



function runPostUpdateMethods(methods, doc){
    methods.forEach(function(method){ 
            method(doc, function(){return});
        }
    );
}



module.exports = plugin;