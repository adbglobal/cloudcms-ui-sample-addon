define(function(require, exports, module) {

    var UI = require("ui");
    var Alpaca = require("alpaca");

    var layout11 = '<script type="text/x-handlebars-template">\
    <div>\
        <div class="row">\
            <div class="col-md-6" id="left">\
                {{#each items}}\
                    {{#compare options.column "left"}} \
                        {{#item}}{{/item}}\
                    {{/compare}}\
                {{/each}}\
            </div>\
            <div class="col-md-6" id="right">\
                {{#each items}} \
                    {{#compare options.column "right"}} \
                        {{#item}}{{/item}} \
                    {{/compare}} \
                {{/each}} \
            </div>\
        </div>\
    </div>\
</script>'

    var layout112 = '<script type="text/x-handlebars-template">\
    <div>\
        <div class="row"> \
            <div class="col-md-3" id="left"> \
                {{#each items}} \
                    {{#compare options.column "left"}} \
                        {{#item}}{{/item}} \
                    {{/compare}} \
                {{/each}}\
            </div>\
            <div class="col-md-3" id="mid">\
                {{#each items}} \
                    {{#compare options.column "mid"}} \
                        {{#item}}{{/item}} \
                    {{/compare}} \
                {{/each}}\
            </div>\
            <div class="col-md-6" id="right">\
                {{#each items}} \
                    {{#compare options.column "right"}} \
                        {{#item}}{{/item}} \
                    {{/compare}} \
                {{/each}}\
            </div>\
        </div>\
    </div>\
</script>'

    var layout111 = '<script type="text/x-handlebars-template">\
    <div>\
        <div class="row"> \
            <div class="col-md-4" id="left"> \
                {{#each items}} \
                    {{#compare options.column "left"}} \
                        {{#item}}{{/item}} \
                    {{/compare}} \
                {{/each}}\
            </div>\
            <div class="col-md-4" id="mid">\
                {{#each items}} \
                    {{#compare options.column "mid"}} \
                        {{#item}}{{/item}} \
                    {{/compare}} \
                {{/each}}\
            </div>\
            <div class="col-md-4" id="right">\
                {{#each items}} \
                    {{#compare options.column "right"}} \
                        {{#item}}{{/item}} \
                    {{/compare}} \
                {{/each}}\
            </div>\
        </div>\
    </div>\
</script>'

    Alpaca.registerTemplate("layout-1-1", layout11);
    Alpaca.registerTemplate("layout-1-1-2", layout112);
    Alpaca.registerTemplate("layout-1-1-1", layout111);

    Alpaca.registerDefaultFormatFieldMapping("layout-object", "layout-object");

    return UI.registerField("layout-object", Alpaca.Fields.ObjectField.extend({

        setup: function() {
            var self = this;
            this.base();
            if (this.options.layout)
                this.containerDescriptor = this.view.getTemplateDescriptor(this.options.layout, self);
        },

        /**
         * @see Alpaca.ControlField#getFieldType
         */
        getFieldType: function() {
            return "layout-object";
        },

        /**
         * @see Alpaca.ControlField#getType
         */
        getType: function() {
            return "object";
        }

        /* builder_helpers */
        ,

        /**
         * @see Alpaca.ControlField#getTitle
         */
        getTitle: function() {
            return "Layout object Field";
        },

        /**
         * @see Alpaca.ControlField#getDescription
         */
        getDescription: function() {
            return "Renders object items into a layout";
        },

        autoWizard: function() {
            var self = this;
            var stepBindings = this.wizardConfigs.bindings;
            var layoutBindings = this.view.getLayout().bindings;

            if (!stepBindings) {
                stepBindings = {};
            }

            for (var propertyId in this.childrenByPropertyId) {
                if (!stepBindings.hasOwnProperty(propertyId)) {
                    stepBindings[propertyId] = 1;
                }
            }

            // should we create steps?
            var createSteps = true;
            if ($(this.field).find("[data-alpaca-wizard-role='step']").length > 0) {
                // already there
                createSteps = false;
            }

            var step = 1;
            var stepFields = [];
            do {
                // collect fields in this step
                stepFields = [];
                for (var propertyId in stepBindings) {
                    if (stepBindings[propertyId] === step) {
                        if (this.childrenByPropertyId && this.childrenByPropertyId[propertyId]) {
                            //col.push(this.childrenByPropertyId[propertyId].field);
                            //col.push(this.childrenByPropertyId[propertyId].containerItemEl);
                            stepFields.push(this.childrenByPropertyId[propertyId]);
                        }
                    }
                }

                if (stepFields.length > 0) {
                    var stepEl = null;
                    if (createSteps) {
                        stepEl = $('<div data-alpaca-wizard-role="step"></div>');
                        $(this.field).append(stepEl);
                    } else {
                        stepEl = $($(this.field).find("[data-alpaca-wizard-role='step']")[step - 1]);
                    }

                    // is there any order information in the items?
                    var hasOrderInformation = false;
                    for (var i = 0; i < stepFields.length; i++) {
                        if (typeof(stepFields[i].options.order) !== "undefined") {
                            hasOrderInformation = true;
                            break;
                        }
                    }

                    if (hasOrderInformation) {
                        // sort by order?
                        stepFields.sort(function(a, b) {

                            var orderA = a.options.order;
                            if (!orderA) {
                                orderA = 0;
                            }
                            var orderB = b.options.order;
                            if (!orderB) {
                                orderB = 0;
                            }

                            return (orderA - orderB);
                        });
                    }

                    var renderedDomElement = self.renderFieldDomElement(this.data);
                    $(stepEl).append(renderedDomElement);

                    // move elements in
                    for (var i = 0; i < stepFields.length; i++) {
                        //$(stepEl).append(stepFields[i].containerItemEl);

                        // use a layout
                        var item = {};
                        var bindingId = layoutBindings[stepFields[i].name];
                        if (bindingId) {
                            var holder = $(bindingId, stepEl);
                            if (holder.length == 0) {
                                // legacy support, fallback to ID based
                                try {
                                    holder = $('#' + bindingId, stepEl);
                                } catch (e) {}
                            }
                            if (holder.length > 0) {
                                // create a wrapper (which will serve as the domEl)
                                item.domEl = $("<div></div>");
                                $(item.domEl).addClass("alpaca-layout-binding-holder");
                                $(item.domEl).attr("alpaca-layout-binding-field-name", item.name);
                                holder.append(item.domEl);
                                item.domEl.append(stepFields[i].containerItemEl);
                            }
                        }
                    }

                    step++;
                }
            }
            while (stepFields.length > 0);

            // now run the normal wizard
            this.wizard();

            // if the container element doesn't have any children left, hide it
            if ($(this.container).children().length === 0) {
                $(this.container).css("display", "none");
            }
        }

        /* end_builder_helpers */
    }));

});