var async       = require('async')
;



function plugin(schema) {
    //Pre-Save Setup
    schema.pre('validate', function (next) {
            var self = this;
            this._wasNew = this.isNew;
            if (!this.isNew) {
                this.runPreMethods(schema.preUpdateMethods, self, function(){
                        next();
                    }
                );
            }
        }
    );
    
    // Post-Save Setup
    schema.post('save', function () {
            var self = this;
            if (!this._wasNew) {
                this.runPostMethods(schema.postUpdateMethods, self);
            }
        }
    );
    
    
    
    /****************************************************************
     * Pre-Hooks
     * These hooks run before an instance has been updated
     */
    schema.methods.runPreMethods = function(methods, self, callback){
        async.eachSeries(
            methods,
            function(fn, cb) {
                fn(self, cb);
            }, 
            function(err){
                if (err){ throw err; }
                callback();
            }
        );
    };
    
    //Pre-Update Methods
    schema.preUpdateMethods = [];
    //
    schema.preUpdate = function(fn){
        schema.preUpdateMethods.push(fn);
    };
    
    
    
    
    /****************************************************************
     * Post-Hooks
     * These hooks run after an instance has been  updated
     */
    schema.methods.runPostMethods = function(methods, self){
        async.eachSeries(
            methods,
            function(fn, cb) {
                fn(self, cb);
            }, 
            function(err){
                if (err){ throw err; }
            }
        );
    };
    
    //Post-Update Methods
    schema.postUpdateMethods = [];
    //
    schema.postUpdate = function(fn){
        schema.postUpdateMethods.push(fn);
    };
}



module.exports = plugin;