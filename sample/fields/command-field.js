define(function(require, exports, module) {

    var UI = require("ui");
    var Alpaca = require("alpaca");

    return UI.registerField("appliance-command", Alpaca.Fields.ObjectField.extend({

        getFieldType: function() {
            return "appliance-command";
        },

        updateSchemaOptions: function(nodeId, callback) {
            function loadCacheAttachment(field, node, attachmentName) {
                var cachedDocument = null;
                var cachedDocument = self.connector.cache(nodeId + '/' + attachmentName);
                if (cachedDocument) {
                    Object.assign(field, cachedDocument)
                } else {
                    node.attachment(attachmentName).download(function(data) {
                        var parsedData = JSON.parse(data);
                        self.connector.cache(nodeId + '/' + attachmentName, parsedData);
                        Object.assign(field, parsedData)
                    })
                }
            }
            var self = this;

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
                self.top().on("ready", function(e) {
                    var dep = self.top().getControlByPath(self.options.dependentField);
                    if (dep) {
                        self.subscribe(dep, function(value) {
                            if (value)
                                self.updateSchemaOptions(value.id, function() {
                                    self.refresh();
                                })
                        });
                        if (dep.data) {
                            self.updateSchemaOptions(dep.data.id, function() {
                                self.refresh();
                            })
                        }
                    }
                });
                this.base(callback);
            }
        }

    }));

});