define(function(require, exports, module) {

    var UI = require("ui");
    var Alpaca = require("alpaca");

    return UI.registerField("recipeVariant", Alpaca.Fields.ObjectField.extend({

        setup: function() {
            var self = this;
            this.base();
            self.dependentFields = {
                "recipeInstructions": ["title", "connectedInstructions", "description", "image", "accessories", "applianceCommand"],
                "recipeIngredient": ["unit", "ingredient"]
            }
            self.top().on("ready", function(e) {
                Object.keys(self.dependentFields).map(x => self.subscribeField("/" + x));
                Object.keys(self.dependentFields).map(function(x) {
                    self.childrenByPropertyId[x].actionbar = {};
                    self.childrenByPropertyId[x].toolbar = {};
                    self.childrenByPropertyId[x].fireCallback("arrayToolbar", true);
                    self.childrenByPropertyId[x].fireCallback("arrayActionbars", true);
                })
            })
        },

        subscribeField: function(path) {
            var self = this;
            var dep = self.top().getControlByPath(path)
            if (dep) {
                dep.getFieldEl().bind("fieldupdate", function(value) {
                    self.updateFields(self, function() {
                        self.refresh();
                    })
                });
            }
        },

        updateFields: function(self, callback) {
            Object.keys(self.dependentFields).map(x => self.updateField(self, x))
        },

        updateField: function(self, fieldName) {
            var dep = self.top().getControlByPath("/" + fieldName);
            var dependentData = dep.getValue();
            var myData = self.childrenByPropertyId[fieldName].getValue();
            for (var i = 0; i < dependentData.length; i++) {
                if (myData[i])
                    for (key of Object.keys(myData[i])) {
                        if ((self.dependentFields[fieldName].indexOf(key) == -1) && myData[i][key])
                            dependentData[i][key] = myData[i][key]
                    }
            }
            self.childrenByPropertyId[fieldName].setValue(dependentData)
        },

        /**
         * @see Alpaca.ControlField#getFieldType
         */
        getFieldType: function() {
            return "recipeVariant";
        },

        /**
         * @see Alpaca.ControlField#getType
         */
        getType: function() {
            return "object";
        },

        /**
         * @see Alpaca.ControlField#getTitle
         */
        getTitle: function() {
            return "Recipe varaint Field";
        },

        /* end_builder_helpers */

    }));

});