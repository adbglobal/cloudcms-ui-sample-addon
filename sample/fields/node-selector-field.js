define(function(require, exports, module) {

    var UI = require("ui");
    var Alpaca = require("alpaca");

    var $ = require("jquery");

    /**
     * Defines a City Picker field that can be used within a form.  The City Picker makes an AJAX call over to a remote data
     * source which is modeled here using a static JSON file that is publicly hosted.  The JSON file provides array of
     * city text/value pairs.  These are loaded and then passed to the callback to populate the select field.
     *
     * To use this in a form, simply set the form options type to "sample-city-picker".
     */

    return UI.registerField("node-selector", Alpaca.Fields.SelectField.extend({

        dataStringToObject: function(text) {
            return {
                "id": text
            };
        },

        convertToScalarValue: function(data) {
            return data ? data.id : null;
        },

        convertToDataValue: function(scalarValue, callback) {
            var value = this.selectOptions.find(x => x.value == scalarValue);
            callback(null, value ? value.picked : null);
        },

        setupField: function(callback) {
            var self = this;

            this.base(function() {
                self.connector.branch.queryNodes({ _type: self.schema._relator.nodeType }).each(function() {
                    self.selectOptions.push({
                        "value": this._doc,
                        "text": this.title,
                        "picked": {
                            "id": this._doc,
                            "ref": this.ref(this),
                            "title": this.title,
                            "qname": this.getQName(),
                            "typeQName": this.getTypeQName(),
                        }
                    });
                }).then(function() {
                    callback();
                });
            });
        }

    }));

});