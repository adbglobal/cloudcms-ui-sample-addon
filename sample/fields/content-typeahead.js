define(function (require, exports, module) {

    var UI = require("ui");
    var Alpaca = require("alpaca");

    /**
     * Defines a Content picker field that populates a select field with the results of a query into Cloud CMS
     * for content of a given type.  The type can be provided in the field options using the "contentType"
     * property.
     *
     * To use this field, set your field option "type" to "content-typeahead".  And then also set the field
     * option "contentType" to the definition QName that you want to query for.
     *
     * The select control will populate with all instances of the specified type.
     */
    return UI.registerField("content-typeahead", Alpaca.Fields.TextField.extend({

        getFieldType: function () {
            return "content-typeahead";
        },

        postRender: function(callback) {
            var self = this;

            this.base(function() {

                var outer = self.getControlEl();
                var item  = self.getValue();
                if (item) {
                    //outer.val(item.title ? item.title : item.id);
                    self.control.typeahead('val',item.title ? item.title : item.id);
                    self.setValue(self.generateItem(item));
                }
                callback();
            });
        },

        generateItem: function (picked) {
            var ref = picked.ref;

            if (!ref) {
                ref = picked.reference;
            }

            if (typeof (ref) === "function") {
                ref = ref.call(picked.object);
            }
            var id = picked._doc;
            if (!id) {
                id = picked.id;
            }

            return {
                "id": id,
                "ref": ref,
                "title": picked.title ? picked.title : id,
                "qname": picked.qname,
                "typeQName": picked.typeQName
            };
        },

        isString: function () {
            return this.schema.type === "string";
        },

        getValueToText: function () {
            return this.control.val();
        },

        getValue: function () {
            //console.log('called by : ' + arguments.callee.caller.name);
            var value = null;

            if (this.data) {
                value = this.data;

                if (this.isString()) {
                    value = this.dataObjectToString(this.data);
                }
            }

            return value;
        },

        setValue: function (value) {
            this.data = value;
            //debugger;
            if (Alpaca.isString(value)) {
                this.data = this.dataStringToObject(this.data);
            }
        },

        dataObjectToString: function (data) {
            return data.id;
        },

        dataStringToObject: function (text) {
            return {
                "id": text
            };
        },

        applyTypeAhead: function () {
            var self = this;
            this.base();
            self.control.on("typeahead:selected", function (event, datum) {
                console.log(datum);
                self.setValue(self.generateItem(datum));
                //debugger;
                //self.setValue(datum.value);
                //$(self.control).change();
            });

            self.control.on("typeahead:change", function (event, datum) {
                //console.log(datum);
                // investigare su modale per inserire nuovo elemento
            });
        },
        setup: function () {

            var self = this;
            this.base();

            this.options.typeahead = {
                "config": {
                    "autoselect": true,
                    "highlight": true,
                    "hint": true,
                    "minLength": 1,
                    "events": {
                        "ready": function () {
                            console.log(this.name + ": ready");
                        }
                    }
                },
                "datasets": {
                    "source": function (query, process) {
                        var array = [];

                        return self.connector.branch.find({ query: { _type: self.schema._relator.nodeType }, search: { query_string: { query: self.getValueToText() + "*" } } }).each(function () {
                            array.push({
                                "title": this.title,
                                "value": this.title,
                                "_doc": this._doc,
                                "ref": this.ref,
                                "qname": this.getQName(),
                                "typeQName": this.getTypeQName(),
                                "object": this
                            })
                        }).then(function () {
                            return process(array);
                            debugger;
                        })
                    },
                    "templates": {
                        "suggestion": Handlebars.compile("<div><p style='word-wrap:break-word; white-space: normal'>{{title}}</p></div>") // ({{value}})
                    },
                    "afterSelect": function (item) {
                        console.log(item);
                    }
                }
            };
        }

    }));

});
