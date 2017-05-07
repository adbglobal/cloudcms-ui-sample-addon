define(function(require, exports, module) {

    var UI = require("ui");
    var Alpaca = require("alpaca");

    return UI.registerField("slave-array", Alpaca.Fields.ArrayField.extend({

        setup: function() {
            var self = this;
            this.base();
            this.actionbar = {};
            this.toolbar = {};
            this.on("ready", function() {
                self.fireCallback("arrayToolbar", true);
                self.fireCallback("arrayActionbars", true);
            })
            if (self.options.dependentField) {
                function debounce(func, wait, immediate) {
                    var timeout;
                    return function() {
                        var context = this,
                            args = arguments;
                        var later = function() {
                            timeout = null;
                            if (!immediate) {
                                //console.log("debounce called timeout")
                                func.apply(context, args);
                            }
                        };
                        var callNow = immediate && !timeout;
                        clearTimeout(timeout);
                        timeout = setTimeout(later, wait);
                        if (callNow) {
                            //console.log("debounce called direct")
                            func.apply(context, args);
                        } else {
                            //console.log("debounce skipped")
                        }
                    };
                };

                var debouceUpdateField = debounce(function() {
                    var dep = self.top().getControlByPath(self.options.dependentField);
                    var dependentData = dep.getValue();
                    var myData = self.getValue()
                    if (!Alpaca.compareObject(dependentData, myData)) {
                        for (var i = 0; i < dependentData.length; i++) {
                            if (myData[i])
                                for (var key of Object.keys(myData[i])) {
                                    if ((self.options.dependentChilds.indexOf(key) == -1) &&
                                        !Alpaca.isEmpty(myData[i][key])) {
                                        dependentData[i][key] = myData[i][key]
                                    }
                                }
                        }
                        self.setValue(dependentData);
                    }
                }, 300, false);

                self.top().on("ready", function(e) {
                    var dep = self.top().getControlByPath(self.options.dependentField);
                    if (dep) {
                        dep.getFieldEl().bind("fieldupdate", debouceUpdateField)
                    }
                });
            }
        },

        setValue: function(value) {
            //console.log("update array value " + this.name + ' value ' + JSON.stringify(value));
            this.base(value);
        }

    }))
});