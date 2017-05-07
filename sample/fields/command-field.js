define(function(require, exports, module) {

    var UI = require("ui");
    var Alpaca = require("alpaca");
    var _ = require('./lodash.js');

    Alpaca.Extend(Alpaca, {
        rules: [
            [_.isNull, () => ({ type: 'null' })],
            [_.isNumber, (field, key) => ({ type: 'number', format: "independent-slave-field" })],
            [_.isBoolean, () => ({ type: 'boolean' })],
            [_.isString, (field, key) => ({ type: 'string', readonly: true })],
            [_.isRegExp, pattern => ({ type: 'string', pattern })],

            // Empty array -> array of any items
            [(example) => _.isArray(example) && !example.length, () => ({ type: 'array' })],

            [_.isArray, items => ({ type: 'array', items: Alpaca.schemaByExample(items[0]) })],
            [_.isPlainObject, (object, key) => ({
                type: 'object',
                properties: _.mapValues(object, Alpaca.schemaByExample),
            })],
        ],

        schemaByExample: function(example, key) {
            for (const [isMatch, makeSchema] of Alpaca.rules) {
                if (isMatch(example)) {
                    var schema = makeSchema(example, key);
                    return schema
                }
            }

            throw new TypeError(example);
        },
    })

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
                //console.log("update " + attachmentName + ' ' + self.name)
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
            //console.log("setup field " + self.name)

            if (self.options.dependentField) {
                // find the field and register a callback
                self.top().on("ready", function(e) {
                    var dep = self.top().getControlByPath(self.options.dependentField);
                    //console.log(self.name, dep)
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
                var dep = self.top().getControlByPath(self.options.dependentField);
                if (dep && dep.data)
                    this.base(function() {
                        self.updateSchemaOptions(dep.data.id, callback)
                    })
                else {
                    this.base(callback)
                }
            } else {
                this.base(callback)
            }
        },

        setValue: function(value) {
            //console.log("update value " + this.name + ' ' + value);
            if (this.options.isSlave && !this.refreshing) {
                //console.log("update value " + this.name + ' ' + JSON.stringify(value));
                //if (Alpaca.isEmpty(this.schema.properties)) {
                this.schema = Alpaca.schemaByExample(value)
                    //console.log("new schema: " + JSON.stringify(this.schema, null, 2))
                    //}
                this.refreshing = true;
                var self = this;
                Alpaca.nextTick(function() {
                    self.refresh.apply(self, [function() {
                        self.setValue(value);
                        self.refreshing = false;
                    }])
                })
            } else
                this.base(value)
        }

    }));

});

define(function(require, exports, module) {
    var UI = require("ui");
    var Alpaca = require("alpaca");

    Alpaca.registerDefaultFormatFieldMapping("independent-slave-field", "independent-slave-field");

    return UI.registerField("independent-slave-field", Alpaca.Fields.NumberField.extend({
        setValue: function(value) {
            //console.log(this.name + ' ' + this.data + " : " + value)
            if (Alpaca.isEmpty(this.data))
                this.base(value)
            else
                this.base(this.data)
        }
    }));
});