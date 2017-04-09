define(function(require, exports, module) {

    var UI = require("ui");
    var Alpaca = require("alpaca");

    return UI.registerField("command", ObjectField.extend({

    getFieldType: function() {
        return "command";
    },

    updateSchemaOptions: function(nodeId, callback) {
        function loadCacheAttachment(field, node, attachmentName) {
            var cachedDocument = null;
            //var cachedDocument = self.connector.cache(nodeId + '/' + fieldName);
            if (cachedDocument) {
                Object.assign(field, cachedDocument)
            } else {
                node.attachment(attachmentName).download(function(data) {
                    var parsedData = JSON.parse(data);
                    //self.connector.cache(nodeId + '/' + fieldName, parsedData);
                    Object.assign(field, parsedData)
                })
            }
        }

        self.connector.branch.queryOne({ "_doc": nodeId }).then(function() {
            loadCacheAttachment(self.schema, this, 'schema');
            loadCacheAttachment(self.options, this, 'options');
        }).then(function() {
            if (callback)
                callback();
        })
    },

    setupField: function(callback) {
        var self = this;

        if (self.options.dependentField) {
            // find the field and register a callback
            var dep = self.top().getControlByPath(self.options.dependentField);
            if (dep) {
                var nodeId = dep.getValue.id;
                this.base(function() {
                    self.updateSchemaOptions(nodeId, callback)
                })
            } else {
                this.base(callback)
            }
        } else {
            this.base(callback)
        }
    },

    afterRenderControl: function(model, callback) {
        var self = this;

        this.base(model, function() {
            self.on("ready", function(e) {
                // screen draw is done
                if (self.options.dependentField) {
                    // find the field and register a callback
                    var dep = self.top().getControlByPath(self.options.dependentField);
                    if (dep) {
                        self.subscribe(dep, function(value) {
                            self.updateSchemaOptions(value.id, function() {
                                self.triggerUpdate();
                            })
                        });
                    }
                }
            });
            callback();
        });
    }

}));
})
