
////////////////////////////////////////////////////////////////////////////////
// General Utility
////////////////////////////////////////////////////////////////////////////////

/**
 * Removes an element's parent element.
 * @param {Object} element Element in the Document Object Model.
 */
function removeParentElement(element) {
    element
        .parentElement
        .parentElement
        .removeChild(element.parentElement);
}

/**
 * Clones and replaces an element in the Document Object Model.
 * @param {Object} oldElement Element in the Document Object Model.
 * @returns {Object} Element in the Document Object Model.
 */
function cloneReplaceElement(oldElement) {
    var newElement = oldElement.cloneNode(true);
    oldElement.parentNode.replaceChild(newElement, oldElement);
    return newElement;
}


/**
 * Removes any selection of radio buttons in a group.
 * @param {Object} radios Live collection of radio buttons in the Document
 * Object Model (DOM).
 */
function removeRadioGroupSelection(radios) {
    return Array.from(radios).forEach(function (radio) {
        radio.checked = false;
    });
}

/**
 * Emphasizes or deemphasizes an element of class tab.
 * @param {Object} element Element of class tab in the Document Object Model.
 */
function emphasizeDeemphasizeTab(tab) {
    // Toggle display style of the tab.
    if (!tab.classList.contains("emphasis")) {
        tab.classList.add("emphasis");
    } else if (tab.classList.contains("emphasis")) {
        tab.classList.remove("emphasis");
    }
}

/**
 * Displays or hides the sibling element of class panel of a sibling element of
 * class tab.
 * @param {Object} element Element of class tab in the Document Object Model.
 */
function displayHideSiblingPanel(tab) {
    var panel = tab.parentElement.querySelector(".panel");
    // Toggle display style of the panel.
    if (panel.classList.contains("hide")) {
        panel.classList.remove("hide");
        panel.classList.add("show");
    } else if (panel.classList.contains("show")) {
        panel.classList.remove("show");
        panel.classList.add("hide");
    }
}

/**
 * Creates an input element with a label.
 * @param {Object} parameters Destructured object of parameters.
 * @param {string} parameters.className Name of the class.
 * @param {string} parameters.identifier Identifier of the input element.
 * @param {string} parameters.name Name of the group.
 * @param {string} parameters.value Value for the element.
 * @param {string} parameters.text Text for the label.
 * @param {string} parameters.type Type of the input element.
 * @returns {Object} Label element with an input element.
 */
function createLabelInputElement({
    className,
    identifier,
    name,
    value,
    text,
    type
} = {}) {
    var input = document.createElement("input");
    input.setAttribute("class", className);
    input.setAttribute("id", identifier);
    input.setAttribute("name", name);
    input.setAttribute("type", type);
    input.setAttribute("value", value);
    var label = document.createElement("label");
    label.setAttribute("for", identifier);
    label.appendChild(input);
    label.appendChild(
        document.createTextNode(text)
    );
    return label;
}

/**
 * Use D3 to create elements in DOM with associative data.
 * @param {d3 selection} selection D3 selection of HTML element within which to create elements with associative data.
 * @param {string} element Type of HTML element to create with associative data.
 * @param {array or accessor function} accessData Accessible data in array or accessor function for these values in
 * the selection.
 * @return {d3 selection} D3 selection of elements that the function created with associative data.
 */
function createDataElements(selection, element, accessData) {
    var elements = selection.selectAll(element)
        .data(accessData);
    elements
        .exit()
        .remove();
    var elementsEnter = elements
        .enter()
        .append(element);
    elements = elementsEnter
        .merge(elements);
    return elements;
}

////////////////////////////////////////////////////////////////////////////////
// General Interface
////////////////////////////////////////////////////////////////////////////////

// TODO: Restructure the hierarchy of the program.
// TODO: Initialize Attribute Interface, Set Interface, and Entity Interface, passing them access to Model and Attribute Index.
// TODO: User interaction with Attribute Interface (maybe also Set Interface) passes information and updates to other interfaces.

/**
 * Initializes the interface to support functionality that is independent of
 * data for the metabolic model.
 */
function initializeInterface() {
    // Initialize the model source interface.
    initializeSourceInterface();
}

/**
 * Initializes the interface to support functionality that is dependent on data
 * for the metabolic model.
 * @param {Object} model Information about entities and relations in a metabolic
 * model.
 */
function initializeInterfaceData(model) {
    // TODO: Maybe change classes and styles of elements once I activate them.
    // Assemble attribute index from metabolic model.
    // The attribute index will mediate information exchange between the
    // interfaces for attributes, sets, and entities.
    var attributeIndex = createAttributeIndex(
        model.entities.metabolites, model.entities.reactions
    );

    // Initialize attribute interface.
    initializeAttributeInterface(attributeIndex, model);
    // Initialize set interface.
    initializeSetInterface({attributeIndex: attributeIndex, model: model});
    // Initialize entity interface.
    initializeEntityInterface({attributeIndex: attributeIndex, model: model});
}

////////////////////////////////////////////////////////////////////////////////
// Model Source Interface
////////////////////////////////////////////////////////////////////////////////

/**
 * Initializes the model source interface.
 */
function initializeSourceInterface() {
    // TODO: This show/hide functionality doesn't work...
    // Activate behavior of accordion tab and panel for source menu.
    var sourceTab = document.getElementById("source").querySelector(".tab");
    sourceTab.addEventListener("click", function (event) {
        // Element on which the event originated is event.currentTarget.
        displayHideSiblingPanel(event.currentTarget);
    });

    // Activate button for assembly of metabolic model from data in file.
    document
        .getElementById("assemble-model")
        .addEventListener("click", controlModelAssembly);
    // Activate button for load of metabolic model from assembly in file.
    document
        .getElementById("load-model")
        .addEventListener("click", controlModelLoad);
    // Temporarily during development, assemble or load model by default.
    //assembleDefaultModel();
    loadDefaultModel();
}

/**
 * Controls model assembly in response to user interaction.
 * @param {Object} event Record of event from Document Object Model.
 */
function controlModelAssembly(event) {
    // Obtain a single file object from the file selector.
    var file = document.getElementById("file-selector").files[0];
    // Create a file reader object.
    var reader = new FileReader();
    // Specify operation to perform after file loads.
    reader.onload = function (event) {
        // Element on which the event originated is event.currentTarget.
        // After load, the file reader's result attribute contains the file's
        // contents, according to the read method.

        // Assemble metabolic model.
        var model = assembleModel(JSON.parse(event.currentTarget.result));
        summarizeModel(model);
        // Initialize interface for metabolic model.
        initializeInterfaceData(model);
    };
    // Read file as text.
    reader.readAsText(file);
}

/**
 * Controls model load in response to user interaction.
 * @param {Object} event Record of event from Document Object Model.
 */
function controlModelLoad(event) {
    // Obtain a single file object from the file selector.
    var file = document.getElementById("file-selector").files[0];
    // Create a file reader object.
    var reader = new FileReader();
    // Specify operation to perform after file loads.
    reader.onload = function (event) {
        // Element on which the event originated is event.currentTarget.
        // After load, the file reader's result attribute contains the file's
        // contents, according to the read method.

        // Load metabolic model.
        var model = JSON.parse(event.currentTarget.result);
        summarizeModel(model);
        // Initialize interface for metabolic model.
        initializeInterfaceData(model);
    };
    // Read file as text.
    reader.readAsText(file);
}

/**
 * Assemble model by default.
 */
function assembleDefaultModel() {
    // Load data from file in JSON format.
    d3.json(
        ("../model/homo-sapiens/model_h-sapiens_recon-2.json"),
        function (error, data) {
            if (error) {
                throw error;
            }
            // Call function to assemble model.
            var model = assembleModel(data);
            summarizeModel(model);
            initializeInterfaceData(model);
        }
    );
}

////////////////////////////////////////////////////////////////////////////////
// Attribute Menu Interface
////////////////////////////////////////////////////////////////////////////////

/**
 * Controls the process for selection of a value of an attribute in the
 * attribute menu.
 * @param {Object} parameters Destructured object of parameters.
 * @param {string} parameters.value The identifier of a value of an attribute of
 * the current selection.
 * @param {string} parameters.attribute The attribute of the current selection.
 * @param {string} parameters.entity The entity, metabolite or reaction, of the
 * current selection.
 * @param {boolean} parameters.filter Option to represent in attribute menu only
 * those entities that pass current filters on the attribute index.
 * @param {Array<Object<string>>} parameters.originalAttributeSummary Summary of
 * attribute index with counts of entities with each value of each attribute.
 * @param {Array<Object<string>>} parameters.originalAttributeIndex Index of
 * attributes of metabolites and reactions.
 * @param {Object<Object>>} parameters.model Information about entities and
 * relations in a metabolic model.
 */
function controlAttributeMenuSelection({
                                           value,
                                           attribute,
                                           entity,
                                           filter,
                                           originalAttributeSummary,
                                           originalAttributeIndex,
                                           model
} = {}) {
    // Record new selection in attribute summary.
    var attributeSummarySelection = recordAttributeMenuSelection({
        value: value,
        attribute: attribute,
        attributeSummary: originalAttributeSummary
    });
    // Extract filters from selection details in attribute summary.
    // TODO: I think it might make more sense to structure the filters as an array of objects... maybe, maybe not...
    var filters = extractFilterAttributesValues(
        attributeSummarySelection
    );
    // Filter the attribute index.
    // Always filter the original attribute index in order to
    // accommodate any changes to selections from the attribute menu.
    var currentAttributeIndex = filterAttributeIndex(
        filters, originalAttributeIndex
    );
    // Restore attribute menu with new versions of the original
    // attribute summary and the current attribute index.
    controlAttributeMenu({
        entity: entity,
        filter: filter,
        originalAttributeSummary: attributeSummarySelection,
        currentAttributeIndex: currentAttributeIndex,
        originalAttributeIndex: originalAttributeIndex,
        model: model
    });
}



/**
 * Extracts from the attribute summary the values of attributes to use to filter
 * the attribute index.
 * @param {Array<Object<string>>} attributeSummary Summary of attribute index
 * with counts of entities with each value of each attribute.
 * @returns {Object<Array<string>>} Values of attributes to apply as filters to
 * the attribute index.
 */
function extractFilterAttributesValues(attributeSummary) {
    return attributeSummary
        .reduce(function (attributeCollection, attributeRecord) {
        if (!attributeRecord.selection) {
            // The attribute has a selection status of false.
            // Ignore the attribute and proceed to the next attribute.
            return attributeCollection;
        } else {
            // The attribute has a selection status of true.
            // Collect the value or values of the attribute that have a
            // selection status of true.
            var attributeValues = attributeRecord
                .values
                .reduce(function (valueCollection, valueRecord) {
                    if (!valueRecord.selection) {
                        // The value has a selection status of false.
                        // Ignore the value and proceed to the next value.
                        return valueCollection;
                    } else {
                        // The value has a selection status of true.
                        // Create a filter for the value of the attribute.
                        var value = valueRecord.identifier;
                        return [].concat(valueCollection, value);
                    }
                }, []);
            var newAttributeRecord = {
                [attributeRecord.attribute]: attributeValues
            };
            // Copy existing values in the record and introduce new value.
            return Object.assign({}, attributeCollection, newAttributeRecord);
        }
    }, {});
}

/**
 * Records selection of a single value of an attribute and returns a copy of the
 * remainder of the attribute summary.
 * @param {Object} parameters Destructured object of parameters.
 * @param {string} parameters.value The identifier of a value of an attribute of
 * the current selection.
 * @param {string} parameters.attribute The attribute of the current selection.
 * @param {Array<Object<string>>} parameters.attributeSummary Summary of
 * attribute index with counts of entities with each value of each attribute.
 */
function recordAttributeMenuSelection(
    {value, attribute, attributeSummary} = {}
    ) {
    // Change the selection statuses of the attribute and the value in the
    // new version of the attribute summary to represent the current
    // selection.
    return attributeSummary.map(function (attributeRecord) {
        if (attributeRecord.attribute !== attribute) {
            // Current attribute record does not match the attribute of the
            // current selection.
            // Copy the record for the attribute with the records for all of its
            // values.
            var attributeValues = attributeRecord
                .values
                .map(function (valueRecord) {
                    // Copy existing values in the record.
                    return Object.assign({}, valueRecord);
                });
            var newValues = {
                values: attributeValues
            };
            // Copy existing values in the record and introduce new value.
            return Object.assign({}, attributeRecord, newValues);
        } else {
            // Current attribute record matches the attribute of the current
            // selection.
            // Copy the records for values of the attribute, changing the
            // selection status of the value that matches the current selection.
            var attributeValues = attributeRecord
                .values
                .map(function (valueRecord) {
                    // Change the selection status of the value of the current
                    // selection.
                    if (valueRecord.identifier !== value) {
                        // Current value record does not match the value of the
                        // current selection.
                        // Copy existing values in the record.
                        return Object.assign({}, valueRecord);
                    } else {
                        // Current value record matches the value of the current
                        // selection.
                        // Change the status of the value's selection.
                        if (!valueRecord.selection) {
                            // Status of value's old selection is false.
                            var selection = true;
                        } else {
                            // Status of value's old selection is true.
                            var selection = false;
                        }
                        var newSelection = {
                            selection: selection
                        };
                        // Copy existing values in the record and introduce new
                        // value.
                        return Object.assign({}, valueRecord, newSelection);
                    }
                });
            // Copy the attribute record, changing its selection status if
            // appropriate.
            // The selection status of the attribute record is true if any of
            // its values have a selection status of true.
            // Consider the new records of values in order to consider the
            // current selection.
            var anySelection = attributeValues.some(function (valueRecord) {
                return valueRecord.selection;
            });
            if (!anySelection) {
                var selection = false;
            } else {
                var selection = true;
            }
            var newRecord = {
                selection: selection,
                values: attributeValues
            };
            // Copy existing values in the record and introduce new value.
            return Object.assign({}, attributeRecord, newRecord);
        }
    });
}

/**
 * Controls the attribute menu with user interaction.
 * @param {Object} parameters Destructured object of parameters.
 * @param {string} parameters.entity The entity, metabolite or reaction, of the
 * current selection.
 * @param {boolean} parameters.filter Option to represent in attribute menu only
 * those entities that pass current filters on the attribute index.
 * @param {Array<Object<string>>} parameters.originalAttributeSummary Summary of
 * attribute index with counts of entities with each value of each attribute.
 * @param {Array<Object<string>>} parameters.currentAttributeIndex Index of
 * attributes of metabolites and reactions, including only those entities that
 * pass current filters on the attribute index.
 * @param {Array<Object<string>>} parameters.originalAttributeIndex Index of
 * attributes of metabolites and reactions.
 * @param {Object<Object>>} parameters.model Information about entities and
 * relations in a metabolic model.
 */
function controlAttributeMenu({
                                  entity,
                                  filter,
                                  originalAttributeSummary,
                                  currentAttributeIndex,
                                  originalAttributeIndex,
                                  model
} = {}) {
    // Execution
    // This function executes upon initialization of the program after assembly
    // or load of a metabolic model, upon change to entity selection, upon
    // change to filter selection, upon selection of a value from the attribute
    // menu, and upon reset of the attribute menu.
    // Parameters
    // The original attribute index specifies the attributes of all metabolites
    // and reactions in the metabolic model.
    // The original attribute summary is always a comprehensive summary of the
    // original attribute index.
    // The original attribute summary also stores information about all user
    // selections from the attribute menu.
    // The current attribute index includes only those records from the original
    // attribute index that pass filters of current selections.
    // The current attribute index passes information from selections in the
    // attribute menu to other views.
    // If the filter option is true, then the attribute menu only represents
    // entities from the current attribute index.
    // The current attribute summary is a summary of the current attribute
    // index.
    // Procedure
    // Prepare attribute summary according to selection of filter option.
    if (!filter) {
        // The filter selection is to represent in the attribute menu all
        // entities, regardless of whether or not they pass current filters on the
        // attribute index.
        var currentAttributeSummary = originalAttributeSummary;
    } else {
        // The filter selection is to represent in the attribute menu only those
        // entities that pass current filters on the attribute index.
        var currentAttributeSummary = createAttributeSummary(
            currentAttributeIndex, model
        );
    }
    // Prepare attribute summary for visualization according to the current
    // entity selection.
    var readyAttributeSummary = prepareAttributeSummary(
        entity, currentAttributeSummary
    );
    // Create visual representation of attribute summary.
    createActivateAttributeSummaryTable({
        entity: entity,
        filter: filter,
        currentAttributeSummary: readyAttributeSummary,
        originalAttributeSummary: originalAttributeSummary,
        currentAttributeIndex: currentAttributeIndex,
        originalAttributeIndex: originalAttributeIndex,
        model: model
    });
    // Activate entity selector.
    activateAttributeMenuEntitySelectors({
        filter: filter,
        originalAttributeSummary: originalAttributeSummary,
        currentAttributeIndex: currentAttributeIndex,
        originalAttributeIndex: originalAttributeIndex,
        model: model
    });
    // Activate filter selector.
    activateAttributeMenuFilterSelector({
        entity: entity,
        originalAttributeSummary: originalAttributeSummary,
        currentAttributeIndex: currentAttributeIndex,
        originalAttributeIndex: originalAttributeIndex,
        model: model
    });
    // Control set interface.
    controlSetInterface({
        entity: entity,
        attributeIndex: currentAttributeIndex,
        model: model
    });
    // Control entity interface.
    controlEntityInterface({
        attributeIndex: currentAttributeIndex,
        model: model
    });
}

////////////////////////////////////////////////////////////////////////////////
// Set Interface
////////////////////////////////////////////////////////////////////////////////

function initializeSetInterface({attributeIndex, model} = {}) {
    // Select set interface.
    var setInterface = document.getElementById("set");
    // Create container for graph.
    var setView = document.createElement("div");
    setView.setAttribute("id", "set-view");
    setInterface.appendChild(setView);
    // Create graphical container for graph.
    // Create graphical container with D3 so that styles in CSS will be able to
    // control dimensions.
    var networkGraph = d3.select("#set-view").append("svg");
    networkGraph.attr("id", "set-graph");

    // Determine the width of graphical container.
    var graphWidth = parseFloat(
        window.getComputedStyle(
            document
                .getElementById("set-graph")
        ).width.replace("px", "")
    );
    var graphHeight = parseFloat(
        window.getComputedStyle(
            document
                .getElementById("set-graph")
        ).height.replace("px", "")
    );
    //console.log("set interface graph dimensions");
    //console.log("width: " + graphWidth + "... " + "height: " + graphHeight);


}

/**
 * Extracts from the attribute index all values of attributes that entities in
 * the index possess.
 * @param {string} entity The entity, metabolite or reaction, of the current
 * selection.
 * @param {Array<Object<string>>} attributeIndex Index of attributes of
 * metabolites and reactions.
 * @returns {Object<Array<string>>} Values of attributes from entities in the
 * attribute index.
 */
function extractIndexAttributesValues(entity, attributeIndex) {
    // TODO: Perform this filter operation within the control function for the view so that I only have to do it once.
    // Filter attribute index to include only records for the entity of the
    // current selection.
    var entityIndex = attributeIndex.filter(function (record) {
        return record.entity === entity;
    });
    // Extract attribute values from entities within the attribute index in
    // order to know which attribute values actually have entities.
    // Iterate on entities with records in the attribute index.
    return entityIndex.reduce(function (entityCollection, entityRecord) {
        // Determine attributes in record.
        var attributes = Object.keys(entityRecord).filter(function (key) {
            return (key !== "identifier" && key !== "entity");
        });
        // Iterate on attributes in the entity's record.
        return attributes
            .reduce(function (attributeCollection, attribute) {
                if (attributeCollection.hasOwnProperty(attribute)) {
                    var initialValues = attributeCollection[attribute];
                } else {
                    var initialValues = [];
                }
                // Iterate on values of the attribute.
                var entityAttributeValues = entityRecord[attribute];
                var newAttributeValues = entityAttributeValues
                    .reduce(function (valueCollection, value) {
                        // Determine if the collection already includes the
                        // value.
                        if (valueCollection.includes(value)) {
                            return valueCollection;
                        } else {
                            return [].concat(valueCollection, value);
                        }
                    }, initialValues);
                var newAttributeRecord = {
                    [attribute]: newAttributeValues
                };
                return Object
                    .assign({}, attributeCollection, newAttributeRecord);
            }, entityCollection);
    }, {});
}

// TODO: I wonder if I should just filter the attributeValues before determining options.
// TODO: That option seems more straight-forward than having to pass around a whole other variable.
/**
 * Determines attributes that are suitable candidates to define sets.
 * @param {Object<Array<string>>} attributeValues Values of attributes from
 * entities in the attribute index.
 * @returns {Array<string>} Names of attributes that are suitable candidates to
 * define sets.
 */
function determineAttributeSetCandidates(attributeValues) {
    return Object.keys(attributeValues).filter(function (key) {
        return attributeValues[key].length > 1;
    });
}

/**
 * Computes the Cartesian product from a variable count of sets (arrays) with
 * variable cardinalities (counts of elements) in each set.
 * @param {Array<Array>} sets Variable count of sets with variable counts of
 * elements in each set.
 * @returns {Array<Array>} Cartesian product of original sets.
 */
function computeCartesianProduct(sets) {
    // An example of sets is
    // [["a", "b", "c"], ["1", "2", "3"], ["!", "#", "*"]].
    // This function returns an array of arrays.
    // Each of the subordinate arrays constitutes a product set.
    return sets.reduce(function (productSets, set) {
        return productSets.reduce(function (setCombinations, productSet) {
            var combination = set.map(function (element) {
                return productSet.concat(element);
            });
            return setCombinations.concat(combination);
        }, []);
    }, [[]]);
}

/**
 * Creates pairs of attributes and values to use to define sets to which an
 * entity belongs.
 * @param {Object<Array<string>>} entityRecord Record for a single entity from
 * the attribute index.
 * @param {Array<string>} setAttributes Names of attributes that define sets of
 * entities.
 * @returns {Array<Array<Object<string>>>} Collections of attribute values that
 * an entity possesses.
 */
function createEntityAttributeValuePairs(entityRecord, setAttributes) {
    // For each attribute that defines sets, create an array of objects with
    // information about both the attribute and its value.
    return setAttributes.map(function (attribute) {
        return entityRecord[attribute].map(function (value) {
            return {
                attribute: attribute,
                value: value
            };
        });
    });
}

/**
 * Creates and populates sets of entities and relations between these on the
 * basis of specific attributes.
 * @param {string} entity The entity, metabolite or reaction, of the current
 * selection.
 * @param {Array<string>} setAttributes Names of attributes that define sets of
 * entities.
 * @param {Array<Object<string>>} attributeIndex Index of attributes of
 * metabolites and reactions.
 * @returns {Object<Array<Object<string>>>} Criteria and cardinality of each set
 * and combination of pairs of sets.
 */
function createAttributeSetsRelations(entity, setAttributes, attributeIndex) {
    // TODO: Perform this filter operation within the control function for the view so that I only have to do it once.
    // Filter attribute index to include only records for the entity of the
    // current selection.
    var entityIndex = attributeIndex.filter(function (record) {
        return record.entity === entity;
    });
    // Determine sets from the records for entities in the attribute index.
    // Collect cardinalities or counts of entities that belong to each set.
    // Iterate on entities with records in the attribute index.
    return entityIndex.reduce(function (entityCollection, entityRecord) {
        // Determine sets to which the entity belongs.
        var sets = computeCartesianProduct(
            createEntityAttributeValuePairs(entityRecord, setAttributes)
        );
        // Each array within the array of sets contains objects with information
        // about the attributes and values that define a set.
        // Iterate on sets to which the entity belongs.
        return sets.reduce(function (setCollection, setCriteria) {
            // Collect criteria for the set.
            var criteria = setCriteria
                .reduce(function (collection, criterion) {
                    var newCriterionRecord = {
                        [criterion.attribute]: criterion.value
                    };
                    return Object
                        .assign({}, collection, newCriterionRecord);
                }, {});
            // Determine if the collection already has a record for the current
            // set to which the current entity belongs.
            // A match set has match values of all attributes that define sets.
            // Assume that sets and their records are unique in the collection.
            var matchIndex = setCollection.findIndex(function (setRecord) {
                return setCriteria.every(function (setCriterion) {
                    return setRecord.criteria[setCriterion.attribute] ===
                        setCriterion.value;
                });
            });
            if (matchIndex !== -1) {
                // A record for the set exists in the collection.
                // Increment the cardinality of the set.
                var cardinality = setCollection[matchIndex].cardinality + 1;
                // Replace the existing record for the set in the collection.
                var newSetCollection = [].concat(
                    setCollection.slice(0, matchIndex),
                    setCollection.slice(matchIndex + 1, setCollection.length)
                );
                var newSetRecord = {
                    cardinality: cardinality,
                    criteria: Object.assign({}, criteria)
                };
                return newSetCollection.concat(newSetRecord);
            } else {
                // A record for the set does not exist in the collection.
                // Initialize cardinality for the set.
                var cardinality = 1;
                var newSetRecord = {
                    cardinality: cardinality,
                    criteria: Object.assign({}, criteria)
                };
                return setCollection.concat(newSetRecord);
            }
        }, entityCollection);
        // Determine set pairs to represent common entities between pairs of
        // sets. // TODO: Worry about that later...
        // TODO: I need to determine pairs of sets... Not sure of best way? It'll be all pair permutations of the set array... basically...
        // TODO: I think that I'll eventually use an object for the setCollection.
        // TODO: This object will have keys for an array for "sets" and an array for "pairs".

    }, []);
}

/**
 * Determines the combinations of values of attributes that define sets and
 * relations between sets.
 * @param {<Array<string>>} attributes Attributes to use in defining sets and
 * relations.
 * @param {Object<Array<string>>} attributeValues Values of attributes from
 * entities in the attribute index.
 * @returns {Object<Array<Object>>} Names of attributes that are suitable candidates to
 * define sets.
 */
function determineSetRelationCombinations(attributes, attributeValues) {

    // TODO: I think the default (if user has not made any selection) should be to use the attribute with the fewest values that is still an option.
    // TODO: That strategy will simplify the count of sets.


    // TODO: If there is a single attribute to define sets, then define sets by all current values of that attribute.
    // TODO: If there are 2 (no more) attributes to define sets, then define sets by combining each value of first attribute with all values of second attribute.
    // TODO: Of course, check for redundancy.

    // TODO: Note that some relations will fill multiple roles.
    // TODO
}

function controlSetInterface(
    {entity, attributeIndex, model} = {}
    ) {
    // TODO: Filter the attribute index to include only records for the entity of the current selection.


    var attributeValues = extractIndexAttributesValues(entity, attributeIndex);
    //console.log("extracted attribute values");
    //console.log(attributeValues);
    //console.log("set candidates");
    //console.log(determineAttributeSetCandidates(attributeValues));

    //console.log("attributeIndex in controlSetRelationInterface");
    //console.log(attributeIndex);

    var testEntityRecord = {
        compartment: ["c", "m", "e"],
        process: ["process_1", "process_2", "process_3"],
        operation: ["c", "t"],
        reversibility: [true, false]
    };
    var testSetAttributes = ["compartment", "operation"];
    var inputSets = createEntityAttributeValuePairs(testEntityRecord, testSetAttributes);
    //console.log("test computeCartesianProduct");
    var products = computeCartesianProduct(inputSets);
    //console.log(products);

    //console.log("test createAttributeSetsRelations");
    var setCollection = createAttributeSetsRelations(entity, testSetAttributes, attributeIndex);
    //console.log(setCollection);
}

////////////////////////////////////////////////////////////////////////////////
// Entity Interface
////////////////////////////////////////////////////////////////////////////////

/**
 * Induces a subgraph for all nodes within a specific depth without weight of a
 * single focal node or ego.
 * @param {Object} parameters Destructured object of parameters.
 * @param {string} parameters.node Identifier for a single node in a network.
 * @param {number} parameters.depth Depth in count of links of traversal around
 * focal node.
 * @param {boolean} parameters.center Indicator of whether or not to include the
 * central focal node in the subgraph.
 * @param {string} parameters.direction Indicator (in, out, null) of whether or
 * not to follow link directionality in traversal and which direction to follow.
 * @param {Object} parameters.network Network in JSNetworkX.
 * @returns {Object} Induced subgraph network in JSNetworkX.
 */
function induceEgoNetwork({node, depth, center, direction, network} = {}) {
    // Collect nodes for the subgraph by traversal according to constraint of
    // link directionality.
    if (direction === "out") {
        // Traverse along links emanating out from focal node.
        // JSNetworkX's singleSourceShortestPathLength function accepts the
        // identifier for the focal node.
        // JSNetworkX's singleSourceShortestPathLength function traverses links
        // that lead out from the focal node in a network with directional links.
        var egoNodesMap = jsnx
            .singleSourceShortestPathLength(network, node, depth);
    } else if (direction === "in") {
        // Traverse along links converging in towards focal node.
        var egoNodesMap = jsnx
            .singleSourceShortestPathLength(
                network.reverse(optCopy=true), node, depth
            );

    } else if (!direction) {
        // Traverse along any links regardless of direction.
        var egoNodesMap = jsnx
            .singleSourceShortestPathLength(
                network.toUndirected(), node, depth
            );
    }
    var egoNodes = Array.from(egoNodesMap.keys());
    // At this point, egoNodes is an array of string identifiers for nodes.
    // There are not any missing identifiers in the array.
    // Nodes exist in the network for all identifiers in egoNodes.
    // Induce subgraph from nodes.
    // JSNetworkX's subgraph method accepts an array of identifiers for
    // nodes to include in the induced subgraph.
    //var egoNetwork = jsnx.MultiDiGraph(network.subgraph(egoNodes));
    var egoNetwork = network.subgraph(egoNodes);
    if (!center) {
        egoNetwork.removeNode(node);
    }
    return egoNetwork;
}

// TODO: Eventually I'll need to figure out how to initialize the network with an initial set of metabolites to replicate.


// TODO: Determine whether to consider general metabolites or compartmental metabolites.
// TODO: Determine metabolites to replicate in the network.
// TODO: Assemble network of nodes for metabolites and reactions.

// TODO: Create and activate interface components for specifying proximity and path queries.

/**
 * Draws a representation of a network in a node-link diagram.
 * @param {Object} network Network in JSNetworkX.
 */
function createActivateProximityMenu(network) {
    // TODO: I need...
    // access to the current assembly of the network
    // list of all nodes in the network (for selection of ego node)


    // Select entity interface.
    var entityInterface = document.getElementById("entity");
    // Create interface for network proximity search.
    var proximityMenu = document.createElement("div");
    proximityMenu.setAttribute("id", "proximity-menu");
    entityInterface.appendChild(proximityMenu);
    // Create search menu for selection of focal node.
    // Create data list of options for the search menu.
    // TODO: create options by data...
    // TODO: Display the name of each node...
    // TODO: Access identifier upon selection... I guess do that when you submit the actual query.

    var networkGraph = d3.select("#network-view").append("svg");


    // Extract nodes and links from the network to use in visualization.
    var nodeRecords = network.nodes(optData=true).map(function (node) {
        return node[1];
    });

    // Create and activate a search field.
    // Append a search menu to the attribute cell.
    var attributeSearch = attributeCell.append("div");
    attributeSearch.classed("search", true);
    // Append a data list to the search menu.
    var attributeValueList = attributeSearch.append("datalist");
    attributeValueList
        .attr("id", function (data, index) {
            return "attribute-" + data.attribute + "-values";
        });
    // Append options to the data list.
    var attributeValues = attributeValueList
        .selectAll("option")
        .data(function (element, index) {
            return element.values;
        });
    attributeValues.exit().remove();
    var newAttributeValues = attributeValues
        .enter()
        .append("option");
    attributeValues = newAttributeValues
        .merge(attributeValues);
    attributeValues.attr("value", function (data, index) {
        return data.name;
    });
    // Append search text field to the search menu.
    var attributeSearchField = attributeSearch.append("input");
    attributeSearchField
        .attr("autocomplete", "off")
        .attr("id", function (data, index) {
            return "attribute-" + data.attribute + "-search";
        })
        .attr("list", function (data, index) {
            return "attribute-" + data.attribute + "-values";
        })
        .attr("type", "search");
    // Assign event listeners and handlers to search menu.
    // Option elements from datalist element do not report events.
    // Respond to event on input search text field and then find
    // relevant information from the options in the datalist.
    attributeSearchField
        .on("change", function (data, index, nodes) {
            // TODO: Use the value of the input field and compare against the list options.
            // TODO: Only perform selection event if the value of the field matches an option from the datalist.
            // TODO: http://stackoverflow.com/questions/30022728/perform-action-when-clicking-html5-datalist-option
            // Assume that each attribute value has a unique name.
            var selection = nodes[index].value;
            var attributeValues = d3
                .select(nodes[index].list)
                .selectAll("option");
            var attributeValue = attributeValues
                .filter(function (data, index) {
                    return data.name === selection;
                });
            if (!attributeValue.empty()) {
                controlAttributeMenuSelection({
                    value: attributeValue.data()[0].identifier,
                    attribute: attributeValue.data()[0].attribute,
                    entity: entity,
                    filter: filter,
                    originalAttributeSummary:
                    originalAttributeSummary,
                    originalAttributeIndex: originalAttributeIndex,
                    model: model
                });
            }
        });
}

function createActivatePathMenu() {}

function initializeEntityInterface({attributeIndex, model} = {}) {

    // Create controls for compartmentalization (check box), and metabolite node replication.
    // Initialize these with default values.
    // Activate these controls so that user can change them and on change it reassembles the network.

    // Initialize entity interface.
    var entityInterface = document.getElementById("entity");
    // Create interface for network assembly.
    var networkAssemblyMenu = document.createElement("div");
    networkAssemblyMenu.setAttribute("id", "network-assembly-menu");
    entityInterface.appendChild(networkAssemblyMenu);
    // Create compartmentalization check box.
    var compartmentCheckLabel = createLabelInputElement({
        className: "compartmentalization",
        identifier: "network-assembly-menu-compartmentalization",
        name: "network-assembly-menu-compartmentalization",
        value: "compartmentalization",
        text: "Compartmentalization",
        type: "checkbox"
    });
    compartmentCheckLabel.setAttribute("checked", false);
    networkAssemblyMenu.appendChild(compartmentCheckLabel);
    // Create list of metabolites for which to replicate nodes.
    var replicationIdentifiers = [
        "ac", "accoa", "adp", "amp", "atp", "ca2", "camp", "cdp", "cl", "cmp",
        "co", "co2", "coa", "ctp", "datp", "dcmp", "dctp", "dna", "dtdp",
        "dtmp", "fe2", "fe3", "fmn", "gdp", "gmp", "gtp", "h", "h2", "h2o",
        "h2o2", "hco3", "i", "idp", "imp", "itp", "k", "na1", "nad", "nadh",
        "nadp", "nadph", "nh4", "no", "no2", "o2", "o2s", "oh1", "pi", "ppi",
        "pppi", "so3", "so4", "udp", "ump", "utp"
    ];
    var replicationMetabolites = replicationIdentifiers
        .map(function (identifier) {
            return {
                identifier: identifier,
                name: model.entities.metabolites[identifier].name
            }
        });
    // Create menu for modification of list for replication
    // TODO: Once user can interact with this list, control it in a separate function and execute function every time list changes.
    // TODO: The menu should give access to names of all metabolites in the replication list.
    // TODO: User should be able to remove a metabolite from the list.
    // TODO: User should also be able to add a metabolite to the list.
    // TODO: To add, a search menu should be available with access to all metabolites in the current collection.
    // TODO: I'm thinking a drop-down menu with a search field at the top and little "X's" next to each metabolite in the list.
    // TODO: For the network with nodes for compartmental metabolites, I need to display in the search list the name of the metabolite, and the compartment.
    // TODO: Maybe I should modify the metabolite names when I assemble the network for compartmentalization.
    networkAssemblyMenu
        .appendChild(createElementWithText({text: "...Replicates... eventually a list of metabolites", type: "span"}));


    // Create some sort of over-ride button that lets user force network assembly even if selection is large.
    // Maybe display this override button in center of view with some sort of warning message.

    // When network assembly completes, create buttons for "Ego" and "Path".
    // Activate these buttons so that they create menus to construct respective queries against the network.


    // Initiate control of entity interface.
    controlEntityInterface({
        attributeIndex: attributeIndex,
        model: model
    });

}


/**
 * Extracts from the attribute index identifiers of all entities of a specific
 * type.
 * @param {string} entity An entity, metabolite or reaction, in the attribute
 * index.
 * @param {Array<Object<string>>} attributeIndex Index of attributes of
 * metabolites and reactions.
 * @returns {<Array<string>} Identifiers of entities in the attribute index.
 */
function extractIndexEntityIdentifiers(entity, attributeIndex) {
    return attributeIndex.filter(function (record) {
        return record.entity === entity;
    }).map(function (record) {
        return record.identifier;
    });
}

/**
 * Checks object elements for replicates by identifier.
 * @param {Array<Object<string>>} elements Objects elements with identifiers.
 * @returns {Array<Object<string>>} Object elements that have replicates.
 */
function checkReplicateElements(elements) {
    // A more efficient algorithm would increment counts for each element and
    // then only return elements with counts greater than one.
    return elements.reduce(function (collection, element) {
        var matches = elements.filter(function (referenceElement) {
            return referenceElement.identifier === element.identifier;
        });
        if (
            (matches.length > 1) &&
            (!collection.includes(element.identifier))
        ) {
            return collection.concat(element.identifier);
        } else {
            return collection
        }
    }, []);
}

function controlEntityInterface({attributeIndex, model} = {}) {
    // TODO: I need to extract identifiers for metabolites and reactions from the Attribute Index.
    // TODO: I need to pass these to assembleNetwork().
    // TODO: assembleNetwork() should return network elements.

    // Extract identifiers of entities from the attribute index.
    // The full model has 2652 metabolites.
    var metaboliteIdentifiers = extractIndexEntityIdentifiers(
        "metabolite", attributeIndex
    );
    // The full model has 7785 reactions.
    var reactionIdentifiers = extractIndexEntityIdentifiers(
        "reaction", attributeIndex
    );
    var compartmentalization = true;
    var replicationMetabolites = [
        "ac", "accoa", "adp", "amp", "atp", "ca2", "camp", "cdp", "cl", "cmp",
        "co", "co2", "coa", "ctp", "datp", "dcmp", "dctp", "dna", "dtdp",
        "dtmp", "fe2", "fe3", "fmn", "gdp", "gmp", "gtp", "h", "h2", "h2o",
        "h2o2", "hco3", "i", "idp", "imp", "itp", "k", "na1", "nad", "nadh",
        "nadp", "nadph", "nh4", "no", "no2", "o2", "o2s", "oh1", "pi", "ppi",
        "pppi", "so3", "so4", "udp", "ump", "utp"
    ];

    // Assemble network.
    // 10437 nodes, 39353 links (general, no replication)
    // 23315 nodes, 39353 links (general, replication)
    // 29921 nodes, 44381 links (compartmental, no replication)
    // 35520 nodes 44381 links (compartmental, replication)
    // Only assemble network if it is below a threshold.
    if (
        metaboliteIdentifiers.length < 1500 &&
        reactionIdentifiers.length < 5000
    ) {
        var networkElements = assembleNetwork({
            compartmentalization: compartmentalization,
            replicationMetabolites: replicationMetabolites,
            metaboliteIdentifiers: metaboliteIdentifiers,
            reactionIdentifiers: reactionIdentifiers,
            model: model
        });
        // Evaluate network assembly.
        //console.log("networkElements");
        //console.log(networkElements);
        //var replicateNodes = checkReplicateElements(networkElements.nodes);
        //console.log("replicate nodes");
        //console.log(replicateNodes);
        //var replicateLinks = checkReplicateElements(networkElements.links);
        //console.log("replicate links");
        //console.log(replicateLinks);
        //var emptyNodes = networkElements.nodes.filter(function (node) {
        //    return !node.hasOwnProperty("identifier");
        //});
        //console.log("empty nodes");
        //console.log(emptyNodes);


        // Initialize an operable network from the network elements.
        var nodes = networkElements.nodes.map(function (node) {
            return [].concat(node.identifier, Object.assign({}, node));
        });
        var links = networkElements.links.map(function (link) {
            return [].concat(link.source, link.target, Object.assign({}, link));
        });
        var network = new jsnx.MultiDiGraph();
        network.addNodesFrom(nodes);
        network.addEdgesFrom(links);

        createActivateProximityMenu(network);

        // TODO: Now it's time to figure out some graph traversal algorithms.
        // TODO: Start with proximity/ego graph.

        var egoNetwork = induceEgoNetwork({
            node: "pyr_m",
            depth: 2,
            center: true,
            direction: null,
            network: network
        });
        drawNetwork(egoNetwork);
    }
}

// TODO: Figure out how to draw the ego networks in the view.
// TODO: Pass the function an instance of a network in JSNetworkX.
// TODO: Use getNodeAttributes and getEdgeAttributes, getting around the Map like I did for the ego graph function.
// TODO: Pass these arrays of objects for nodes and links to the D3 stuff...

/**
 * Draws a representation of a network in a node-link diagram.
 * @param {Object} network Network in JSNetworkX.
 */
function drawNetwork(network) {
    // Select entity interface.
    var entityInterface = document.getElementById("entity");
    // Create container for network visualization.
    var networkView = document.createElement("div");
    networkView.setAttribute("id", "network-view");
    entityInterface.appendChild(networkView);
    // Create graphical container for network visualization.
    // Create graphical container with D3 so that styles in CSS will control
    // dimensions.
    var networkGraph = d3.select("#network-view").append("svg");
    networkGraph.attr("id", "network-graph");

    // Determine the dimensions of the graphical container.
    var graphWidth = parseFloat(
        window.getComputedStyle(
            document
                .getElementById("network-graph")
        ).width.replace("px", "")
    );
    var graphHeight = parseFloat(
        window.getComputedStyle(
            document
                .getElementById("network-graph")
        ).height.replace("px", "")
    );

    // Extract nodes and links from the network to use in visualization.
    var nodeRecords = network.nodes(optData=true).map(function (node) {
        return node[1];
    });
    var linkRecords = network.edges(optData=true).map(function (edge) {
        return edge[2];
    });

    // Create links.
    // Create links before nodes so that nodes will appear over the links.
    // Contain all links within a single group.
    var linkGroup = networkGraph.append("g");
    var links = linkGroup.selectAll("line").data(linkRecords);
    links.exit().remove();
    var newLinks = links.enter().append("line");
    links = newLinks.merge(links);
    links.classed("link", true);

    // Create nodes.
    // Contain all nodes within a single group.
    var nodeGroup = networkGraph.append("g");
    var nodes = nodeGroup.selectAll("circle").data(nodeRecords);
    nodes.exit().remove();
    var newNodes = nodes.enter().append("circle");
    nodes = newNodes.merge(nodes);
    nodes.classed("node", true);
    nodes.classed("metabolite", function (data) {
        return data.entity === "metabolite";
    });
    nodes.classed("reaction", function (data) {
        return data.entity === "reaction";
    });

    // TODO: How can I accommodate networks of different scales?
    // TODO: I think I'll need variables for node and link dimensions as well as force parameters.

    // TODO: I can scale the radius of reactions by the number of metabolite nodes (in current network definition) they connect to.

    // Initiate the force simulation.
    // The force method assigns a specific force simulation to the name.
    // Collision force prevents overlap and occlusion of nodes.
    // The center force causes nodes to behave strangely when user repositions
    // them manually.
    var simulation = d3.forceSimulation()
        .nodes(nodeRecords)
        .force("center", d3.forceCenter()
            .x(graphWidth / 2)
            .y(graphHeight / 2)
        )
        .force("collision", d3.forceCollide()
            .radius(function (data) {
                if (data.entity === "metabolite") {
                    return 10;
                } else if (data.entity === "reaction") {
                    return 20;
                }
            })
            .strength(0.9)
            .iterations(1)
        )
        .force("charge", d3.forceManyBody()
            .strength(-250)
            .distanceMin(1)
            .distanceMax(200)
        )
        .force("link", d3.forceLink()
            .links(linkRecords)
            .id(function (d) {
                return d.identifier;
            })
            .distance(7)
        )
        //.force("positionX", d3.forceX()
        //    .x(graphWidth / 2)
        //    .strength(0.1)
        //)
        //.force("positionY", d3.forceY()
        //    .y(graphWidth / 2)
        //    .strength(0.1)
        //)
        .on("tick", restoreNodePositions);

    // Declare function to increment the force simulation.
    // Impose constraints on node positions (d.x and d.y) according to dimensions of bounding SVG element.
    var radius = 9;
    function restoreNodePositions() {
        nodes
            .attr("cx", function (d) {
                return d.x = Math.max(radius, Math.min(graphWidth - radius, d.x));
            })
            .attr("cy", function (d) {
                return d.y = Math.max(radius, Math.min(graphHeight - radius, d.y));
            });
        links
            .attr("x1", function (d) {return d.source.x;})
            .attr("y1", function (d) {return d.source.y;})
            .attr("x2", function (d) {return d.target.x;})
            .attr("y2", function (d) {return d.target.y;});
    };

}




////////////////////////////////////////////////////////////////////////////////
// Scrap?

/**
 * Prepares the attribute summary for immediate visual representation according
 * to user selection of entity.
 * @param {string} entity The entity, metabolite or reaction, of the current
 * selection.
 * @param {Array<Object<string>>} filterQueue Queue of filters to apply to the
 * attribute index.
 * @returns {Array<Object<string>>} Queue of filters to apply to the attribute
 * index.
 */
function composeFilterQueue(value, attribute, filterQueue) {
    var selection = "temporary...";
    var newFilter = {
        attribute: attribute,
        selection: selection,
        value: value
    };
    var newFilterQueue = [].concat(filterQueue, newFilter);
    return newFilterQueue;
}

// TODO: Make the name of this function more specific to what it does.
// TODO: Consider a name like controlAttributeSelection.
/**
 * Controls the attribute table recursively with user interaction.
 * @param {Array<Object<string>>} filterQueue Queue of filters to apply to the
 * attribute index.
 * @param {string} entity The entity, metabolite or reaction, of the current
 * selection.
 * @param {Array<Object<string>>} attributeSummary Summary of attribute index
 * with counts of entities with each value of each attribute.
 */
function controlAttributeTable(filterQueue, entity, attributeSummary) {

    // This function executes upon initial program execution, upon a change to
    // the selection of entity, and upon a change to the attribute index and
    // attribute summary.
    // The purpose of this function is to support iterative user interaction to
    // select values of attributes from the attribute menu.
    // These selections compose the filter queue.


    // TODO: Append rectangles for each value of the data.
    // TODO: Format rectangles according to data... I'll need to set both x positions and widths.


    // Define scale functions for bar charts.
    //var metaboliteScale = d3
    //    .scaleLinear()
    //    .domain([0, queue[0].countMetabolites])
    //    .range([0, 0.99*svgWidth]);
    // Append bar chart for metabolites.
    //var metaboliteBarCellSVGs = barCellSVGs
    //    .filter(function (data, index) {
    //        return (data.subtype === "metabolite");
    //    });
    //var metaboliteBars = metaboliteBarCellSVGs
    //    .append("rect");


    // TODO: Activate the submit button with the current version of the filterQueue.
    // TODO: The submit button should call a separate filter function that then calls controlAttributeMenu with the new attribute index.
    // TODO: I'm not sure it'll work to return the filterQueue from this function directly.


}

////////////////////////////////////////////////////////////////////////////////
// Query Interface
////////////////////////////////////////////////////////////////////////////////

/**
 * Initializes the query interface.
 * @param {Object} model Information about entities and relations in a metabolic
 * model.
 */
function controlQueryInterface(model) {
    // Create query queue.
    var queue = initializeQueryQueue(model)
    initializeVisualQueryQueue(queue);

    // Create query builder.
    appendQueryBuilderCombination();
    appendQueryBuilderType();
    activateQueryBuilderType(model);
    appendQueryBuilderAdd();
    activateQueryBuilderAdd(queue, model);
}

////////////////////////////////////////////////////////////////////////////////
// Query Builder Interface

/**
 * Appends elements to specify combination strategy to build queries.
 */
function appendQueryBuilderCombination() {
    // Create header.
    var builderHead = document.createElement("h3");
    builderHead.textContent = "Builder";
    var builder = document.getElementById("query-builder")
    builder.appendChild(builderHead);
    // Create options for combination strategy.
    var combination = document.createElement("div");
    // Create radio buttons for combination strategy.
    combination.appendChild(
        createLabelRadioButton({
            className: "query-combination-radio",
            name: "combination",
            value: "and",
            text: "and (-)"
        })
    );
    combination.appendChild(
        createLabelRadioButton({
            className: "query-combination-radio",
            name: "combination",
            value: "or",
            text: "or (+)"
        })
    );
    combination.appendChild(
        createLabelRadioButton({
            className: "query-combination-radio",
            name: "combination",
            value: "not",
            text: "not (x)"
        })
    );
    builder.appendChild(combination);
}

/**
 * Appends elements to specify query type to build queries.
 */
function appendQueryBuilderType() {
    // Create options for query type.
    var type = document.createElement("div");
    // Create radio buttons for query type.
    type.appendChild(
        createLabelRadioButton({
            className: "query-type-radio",
            name: "type",
            value: "attribute",
            text: "attribute"
        })
    );
    type.appendChild(
        createLabelRadioButton({
            className: "query-type-radio",
            name: "type",
            value: "topology",
            text: "topology"
        })
    );
    document.getElementById("query-builder").appendChild(type);
}

/**
 * Activates interactive elements to specify query type.
 * @param {Object} model Information about entities and relations in a metabolic
 * model.
 */
function activateQueryBuilderType(model) {
    // Activate event listeners.
    Array.from(
        document
            .getElementById("query-builder")
            .getElementsByClassName("query-type-radio")
    )
        .forEach(function (radio) {
            radio.addEventListener("change", function (event) {
                // Element on which the event originated is event.currentTarget.
                appendQueryBuilderDetail(model);
            });
        });
}

/**
 * Determines all possible attribute selections from a metabolic model.
 * @param {Object} model Information about entities and relations in a metabolic
 * model.
 */
function determineAttributeReference(model) {
    var metabolites = Object.values(model.sets.metabolites)
        .map(function (metabolite) {
            return metabolite.name + " (metabolite name)";
        });
    var reactions = Object.values(model.network.nodes.reactions)
        .map(function (reaction) {
            return reaction.name + " (reaction name)";
        });
    var compartments = Object.values(model.sets.compartments)
        .map(function (compartment) {
            return compartment.name + " (compartment name)";
        });
    var processes = Object.values(model.sets.processes).map(function (process) {
        return process.name + " (process name)";
    });
    var extras = [
        "undefined (process name)",
        "conversion (reaction type)",
        "transport (reaction type)",
        "irreversible (reaction direction)",
        "reversible (reaction direction)"
    ];
    // TODO: Include metabolites and reactions as they become relevant.
    return [].concat(compartments, processes, extras);
}

/**
 * Appends elements to build specific query steps.
 * @param {Object} model Information about entities and relations in a metabolic
 * model.
 */
function appendQueryBuilderDetail(model) {
    var builder = document.getElementById("query-builder");
    // Remove any existing components of the interface for query builder detail.
    if (document.getElementById("query-builder-detail")) {
        var queryBuilderDetail = document
            .getElementById("query-builder-detail");
        removeChildElements(queryBuilderDetail);
    } else {
        var queryBuilderDetail = document.createElement("div");
        queryBuilderDetail.setAttribute("id", "query-builder-detail");
        builder.insertBefore(
            queryBuilderDetail, document.getElementById("control-query")
        );
    }
    // Determine type of query.
    var queryType = determineRadioGroupValue(
        builder
            .getElementsByClassName("query-type-radio")
    );
    // Append elements to query assembly interface according to the type of
    // query.
    if (queryType === "attribute") {
        // Append elements to interface for assembly of query by attribute.
        // Determine list of attributes for reference.
        // TODO: The attribute reference list should be different for different combination strategies (and, or, not).
        var attributeReference = determineAttributeReference(model);
        // Create reference list for text field.
        var attributeList = document.createElement("datalist");
        attributeList.setAttribute("id", "attribute-options");
        attributeReference.forEach(function (element) {
            var option = document.createElement("option");
            option.setAttribute("value", element);
            attributeList.appendChild(option);
        });
        queryBuilderDetail.appendChild(attributeList);
        // Create text field.
        var textField = document.createElement("input");
        textField.setAttribute("autocomplete", "off");
        textField.setAttribute("class", "text");
        textField.setAttribute("id", "attribute-text");
        textField.setAttribute("list", "attribute-options");
        textField.setAttribute("type", "search");
        queryBuilderDetail.appendChild(textField);
        queryBuilderDetail.appendChild(document.createElement("br"));
    } else if (queryType === "topology") {
        // TODO: Eventually fill in the interface for topological queries.
    }
}

/**
 * Appends elements to add a new query step to the queue.
 */
function appendQueryBuilderAdd() {
    var builder = document.getElementById("query-builder");
    // Create button to add query step to queue.
    var add = document.createElement("button");
    add.setAttribute("id", "control-query");
    add.setAttribute("type", "button");
    add.textContent = "+";
    builder.appendChild(add);
}

/**
 * Activates interactive elements to add a new query step to the queue.
 * @param {Array<Object>} queue Details for steps in the query's queue.
 * @param {Object} model Information about entities and relations in a metabolic
 * model.
 */
function activateQueryBuilderAdd(queue, model) {
    // Activate event listeners.
    document
        .getElementById("control-query")
        .addEventListener("click", function handleEvent(event) {
            // Element on which the event originated is event.currentTarget.
            // Execute operation.
            controlQuery(queue, model);
            // Remove event listener after first execution of operation.
            event.currentTarget.removeEventListener(event.type, handleEvent);
        });
}

////////////////////////////////////////////////////////////////////////////////
// Query Queue Interface

/**
 * Initializes the query queue.
 * @param {Object} model Information about entities and relations in a metabolic
 * model.
 * @returns {Array<Object>} queue Details for steps in the query's queue.
 */
function initializeQueryQueue(model) {
    // Initialize query queue.
    var step = {
        collection: extractInitialCollectionFromModel(model),
        complete: true,
        type: "source",
        criterion: "model"
    };
    // Return initial query queue for use in query assembly and execution.
    return [].concat(step);
}

/**
 * Confirms that the query assembly interface is complete with all necessary
 * details.
 */
function confirmQueryAssembly() {
    // TODO: Return true/false whether or not the query step has complete/appropriate parameters.
}

/**
 * Extracts details from the query assembly interface.
 * @returns {Object} Details of the query step from the query assembly
 * interface.
 */
function extractQueryAssemblyDetails() {
    var queryAssembly = document.getElementById("query-builder");
    var combination = determineRadioGroupValue(
        queryAssembly.getElementsByClassName("query-combination-radio")
    );
    var type = determineRadioGroupValue(
        queryAssembly.getElementsByClassName("query-type-radio")
    );
    if (type === "attribute") {
        var text = document.getElementById("attribute-text").value;
        var value = text.slice(0, (text.lastIndexOf("(") - 1));
        var entityAttribute = text
            .slice((text.lastIndexOf("(") + 1), text.lastIndexOf(")"));
        var entity = entityAttribute.split(" ")[0];
        var attribute = entityAttribute.split(" ")[1];
        return {
            attribute: attribute,
            combination: combination,
            complete: false,
            criterion: value,
            entity: entity,
            type: type,
            value: value
        };
    } else if (type === "topology") {
        // TODO: Extract details for a topological query.
    }
}

// TODO: This might still be useful for reading details from steps in the query queue.
/**
 * Extracts details for steps in the query from elements in the Document Object
 * Model.
 */
function extractQueryDetails() {
    // Select all steps in the query's queue.
    var queryQueueSteps = document
        .getElementById("query-queue")
        .getElementsByClassName("query-step");
    var queryStepDetails = Array
        .prototype
        .map
        .call(queryQueueSteps, extractQueryStepDetails);
    console.log(queryStepDetails);
}

/**
 * Extracts details for a single step in the query from elements in the Document
 * Object Model.
 */
function extractQueryStepDetails(stepElement) {
    return {
        combination: determineRadioGroupValue(
            stepElement.getElementsByClassName("combination")
        ),
        type: "attribute",
        value: stepElement.getElementsByClassName("text")[0].value
    };
    // Determine the value of the text field.
}

/**
 * Determines the identifier for an entity with a specific name.
 * @param {Object} parameters Destructured object of parameters.
 * @param {string} parameters.name Name of an entity.
 * @param {string} parameters.entity Type of entity.
 * @param {Object} parameters.model Information about entities and relations in
 * a metabolic model.
 * @returns {string} Identifier of entity with specific name.
 */
function determineEntityIdentifierFromName({name, entity, model} = {}) {
    // Assume that there is a single record for each entity with each name.
    if (entity === "compartment") {
        return Object.keys(model.sets.compartments)
            .filter(function (identifier) {
                return model.sets.compartments[identifier].name === name;
            })[0];
    } else if (entity === "metabolite") {
        // TODO: Return identifier for compartmental or general metabolite, depending on how you implement the query function for metabolite.
    } else if (entity === "process") {
        return Object.keys(model.sets.processes).filter(function (identifier) {
            return model.sets.processes[identifier].name === name;
        })[0];
    } else if (entity === "reaction") {
        return Object.keys(model.network.nodes.reactions)
            .filter(function (identifier) {
                return model
                        .network
                        .nodes
                        .reactions[identifier]
                        .name === "name";
            })[0];
    }
}

/**
 * Executes all steps in the query and stores results of each step with queue
 * details.
 * @param {Array<Object>} queue Details for steps in the query's queue.
 * @param {Object} model Information about entities and relations in a metabolic
 * model.
 * @returns {Array<Object>} Details and collections for each step in query
 * queue.
 */
function executeQuery(queue, model) {
    return queue.map(function (step, index) {
        if (!step.complete) {
            // Query step is not complete.
            // Execute query step and record collection and summary.
            // Determine previous collection.
            // Use collection from previous step.
            var oldCollection = queue[index - 1].collection;
            // Determine type of query step.
            if (step.type === "attribute") {
                // Determine identifier from entity name.
                var identifier = determineEntityIdentifierFromName({
                    name: step.value,
                    entity: step.entity,
                    model: model
                });
                if (
                    step.entity === "compartment" && step.attribute === "name"
                ) {
                    // Execute query by compartment name.
                    var newCollection = collectCompartmentReactionsMetabolites({
                        compartment: identifier,
                        combination: step.combination,
                        collection: oldCollection,
                        model: model
                    });
                } else if (
                    step.entity === "metabolite" && step.attribute === "name"
                ) {
                    // Execute query by metabolite name.
                } else if (
                    step.entity === "process" && step.attribute === "name"
                ) {
                    // Execute query by process name.
                    var newCollection = collectProcessReactionsMetabolites({
                        process: identifier,
                        combination: step.combination,
                        collection: oldCollection,
                        model: model
                    });
                } else if (
                    step.entity === "reaction" && step.attribute === "name"
                ) {
                    // Execute query by reaction name.
                }
                // Return a new record for the query step.
                return {
                    attribute: step.attribute,
                    collection: newCollection,
                    combination: step.combination,
                    complete: true,
                    criterion: step.criterion,
                    entity: step.entity,
                    type: step.type,
                    value: step.value
                };
            } else if (step.type === "topology") {
                // TODO: Execute a topology query.
            }
        } else {
            // Query step is complete.
            // Return copy of query step.
            if (step.type === "source") {
                return {
                    collection: step.collection,
                    complete: step.complete,
                    type: step.type,
                    criterion: step.criterion
                };
            } else if (step.type === "attribute") {
                return {
                    attribute: step.attribute,
                    collection: step.collection,
                    combination: step.combination,
                    complete: step.complete,
                    criterion: step.criterion,
                    entity: step.entity,
                    type: step.type,
                    value: step.value
                };
            } else if (step.type === "topology") {
                // TODO: Return a copy of the object for a topology query step.
            }
        }
    });
}

/**
 * Extracts a summary of each query queue step for the query queue table.
 * @param {Array<Object>} queue Details for steps in the query's queue.
 * @returns {Array<Object>} Summary of each step in query queue.
 */
function extractQueueSummary(queue) {
    var combinationSymbol = {
        and: "-",
        or: "+",
        not: "x"
    };
    // Extract information from query queue for query queue table.
    return queue.map(function (step, index) {
        if (step.combination) {
            var combination = combinationSymbol[step.combination];
        } else {
            var combination = "...";
        }
        return {
            combination: combination,
            countMetabolites: step.collection.metabolites.length,
            countReactions: step.collection.reactions.length,
            countStep: index,
            criterion: step.criterion,
        };
    });
}

/**
 * Appends an additional query step to the query queue according to details from
 * the query assembly interface.
 * @param {Array<Object>} queue Summary of details for steps in the query's
 * queue.
 */
function appendQueryStep(queue) {
    // TODO: Once the user can remove steps, I'll need to handle the exit selection.

    // Select query queue table body.
    var body = d3
        .select("#query-queue")
        .select("table")
        .select("tbody");
    // Append query queue table rows.
    var rows = body
        .selectAll("tr")
        .data(queue)
        .enter()
        .append("tr");
    // Append query queue table cells.
    var cells = rows
        .selectAll("td")
        .data(function (step, index) {
            // Organize data for table columns.
            if (step.countStep === 0) {
                var removeType = "empty";
            } else if (step.countStep > 0) {
                var removeType = "button";
            }
            return [].concat(
                {
                    class: "query-queue-table-column-step",
                    type: "text",
                    value: step.countStep.toString()
                },
                {
                    class: "query-queue-table-column-combination",
                    type: "text",
                    value: step.combination
                },
                {
                    class: "query-queue-table-column-criterion",
                    type: "text",
                    value: step.criterion
                },
                {
                    class: "query-queue-table-column-metabolites",
                    subtype: "metabolite",
                    type: "bar",
                    value: step.countMetabolites
                },
                {
                    class: "query-queue-table-column-reactions",
                    subtype: "reaction",
                    type: "bar",
                    value: step.countReactions
                },
                {
                    class: "query-queue-table-column-remove",
                    type: removeType,
                    value: ""
                });
        })
        .enter()
        .append("td");
    cells
        .attr("class", function (data) {
            return data.class;
        });
    // Append text content of cells.
    var textCells = cells
        .filter(function (data, index) {
            return (data.type === "text");
        });
    textCells
        .text(function (data) {
            return data.value;
        });
    // Append graphical container for bar cells.
    var barCells = cells
        .filter(function (data, index) {
            return (data.type === "bar");
        });
    var barCellSVGs = barCells
        .append("svg");
    barCellSVGs
        .attr("class", "query-queue-table-cell-svg");
    // Determine the width of graphical container.
    var svgWidth = parseFloat(
        window.getComputedStyle(
            document.getElementsByClassName("query-queue-table-cell-svg")
                .item(0)
        )
            .width
            .replace("px", "")
    );
    // Define scale functions for bar chart for metabolites.
    var metaboliteScale = d3
        .scaleLinear()
        .domain([0, queue[0].countMetabolites])
        .range([0, 0.99*svgWidth]);
    // Append bar chart for metabolites.
    var metaboliteBarCellSVGs = barCellSVGs
        .filter(function (data, index) {
            return (data.subtype === "metabolite");
        });
    var metaboliteBars = metaboliteBarCellSVGs
        .append("rect");
    metaboliteBars
        .attr("width", function (data, index) {
            return metaboliteScale(data.value);
        })
        .attr("class", "query-queue-table-cell-bars-metabolite");
    // Define scale functions for bar chart for reactions.
    var reactionScale = d3
        .scaleLinear()
        .domain([0, queue[0].countReactions])
        .range([0, 0.99*svgWidth]);
    // Append bar chart for reactions.
    var reactionBarCellSVGs = barCellSVGs
        .filter(function (data, index) {
            return (data.subtype === "reaction");
        });
    var reactionBars = reactionBarCellSVGs
        .append("rect");
    reactionBars
        .attr("width", function (data, index) {
            return reactionScale(data.value);
        })
        .attr("class", "query-queue-table-cell-bars-reaction");

    // Append button content of remove cells.
    var removeCells = cells
        .filter(function (data, index) {
            return (data.type === "button");
        });
    var removeCellButtons = removeCells
        .append("button");
    removeCellButtons
        .text("x");
    // TODO: Activate event listeners for the remove buttons on each row.
    // TODO: Handle the removal properly, updating the table by D3.

}

/**
 * Controls the operations for appending additional query steps to the query
 * queue and executing these steps.
 * @param {Array<Object>} queue Details for steps in the query's queue.
 * @param {Object} model Information about entities and relations in a metabolic
 * model.
 */
function controlQuery(queue, model) {

    // TODO: Enable user to remove a single step from the query queue.
    // TODO: Set complete flag to false for all steps downstream of the modification.


    // TODO: Enable user to remove all steps from the query by a reset.

    // TODO: Implement query step confirmation.
    // TODO: Only execute the entire controlQuery process if the query step is complete.
    // Confirm that the query assembly interface is complete with all necessary
    // details.
    // If not then display an error message using alert.
    confirmQueryAssembly();

    // Extract information from query assembly interface.
    var queryStepDetails = extractQueryAssemblyDetails();
    var newQueue = [].concat(queue, queryStepDetails);

    // Remove contents of query assembly interface.
    removeRadioGroupSelection(
        document
            .getElementById("query-builder")
            .getElementsByClassName("query-combination-radio")
    );
    removeRadioGroupSelection(
        document
            .getElementById("query-builder")
            .getElementsByClassName("query-type-radio")
    );
    removeChildElements(document.getElementById("query-builder-detail"));

    // Execute all steps in query and store summaries of query results for each
    // step within the queue.
    var queueResults = executeQuery(newQueue, model);
    console.log(queueResults);

    // After each execution of controlQuery in the event handler, remove the
    // previous event listener and add a new event listener with new parameters.
    activateQueryBuilderAdd(queueResults, model);

    // Append a new step element to the query queue with representations for the
    // details of the query step.
    appendQueryStep(extractQueueSummary(queueResults));

    // Visualize the network that the query produces.
    visualizeNetwork(queueResults[queueResults.length - 1].collection, model);
}

////////////////////////////////////////////////////////////////////////////////
// Temporary Scrap


/**
 * Applies a function recursively to a live collection of elements in the
 * document object model (DOM).
 * @param {Object} elements Live collection of elements in the DOM.
 * @param {Function} applyFunction Function to apply on elements in the
 * collection.
 */
function applyToDocumentCollection(elements, applyFunction) {
    // Assign a class to elements in the collection to organize a queue for
    // recursive iteration.
    elements.classList.add("recursive-iteration-queue");
    // Select all elements that are in the queue for recursive iteration.
    // Assume that the class name of the queue is unique in the document.
    // The collection is live, so loss of the class will remove a step from
    // the queue.
    var queue = document
        .getElementsByClassName("recursive-iteration-queue");
    // Call recursive function to act on each element in the queue.
    applyToDocumentCollectionQueue(queue, applyFunction);
}

/**
 * Applies a function recursively to steps or elements in a queue.
 * @param {Object} queue Live collection of elements in the DOM.
 * @param {Function} applyFunction Function to apply on elements in the
 * collection.
 */
function applyToDocumentCollectionQueue(queue, applyFunction) {
    // Apply function to next element in the queue.
    applyFunction(queue[0]);
    // Remove queue class from next element to remove it from the queue.
    queue[0].classList.remove("recursive-iteration-queue");
    // If the queue is not empty, call recursive function to act on each element
    // in the queue.
    if (queue[0]) {
        applyToDocumentCollectionQueue(queue, applyFunction);
    }
}




// TODO: I need this version of a reduce method to extract information from elements for my query steps.

/**
 * Accumulates a value or object by recursive application of a function to a
 * live collection of elements in the document object model (DOM).
 * @param {Object} parameters Destructured object of parameters.
 * @param {Object} parameters.elements Live collection of elements in the DOM.
 * @param {Object} parameters.accumulator The value that accumulates from
 * iterative application of the function to the elements.
 * @param {Object} parameters.initialValue The initial value for the
 * accumulator.
 * @param {Object} parameters.operation The operation or function to apply on
 * elements.
 * @returns {Object} Identifiers of initial elements for the query step.

 */
function accumulateFromDocumentCollection({elements, collection, model} = {}) {
    // Assign a class to elements in the collection to organize a queue for
    // recursive iteration.
    elements.classList.add("recursive-iteration-queue");
    // Select all elements that are in the queue for recursive iteration.
    // Assume that the class name of the queue is unique in the document.
    // The collection is live, so loss of the class will remove a step from
    // the queue.
    var queue = document
        .getElementsByClassName("recursive-iteration-queue");
    // Call recursive function to act on each element in the queue.
    applyToDocumentCollectionQueue(queue, applyFunction);
}

/**
 * Accumulates an object by recursive application of a function to to steps or
 * elements in a queue.
 * @param {Object} queue Live collection of elements in the DOM.
 * @param {Function} applyFunction Function to apply on elements in the
 * collection.
 */
function accumulateFromDocumentCollectionQueue(queue, applyFunction) {
    // Apply function to next element in the queue.
    applyFunction(queue[0]);
    // Remove queue class from next element to remove it from the queue.
    queue[0].classList.remove("recursive-iteration-queue");
    // If the queue is not empty, call recursive function to act on each element
    // in the queue.
    if (queue[0]) {
        applyToDocumentCollectionQueue(queue, applyFunction);
    }
}

/**
 * Controls query by metabolic process.
 * @param {Object} event Record of event from Document Object Model.
 * @param {Object} model Information about entities and relations in a metabolic
 * model.
 */
function controlProcessQuery(event, model) {
    // Element on which the event originated is event.currentTarget.
    var process = document.getElementById("process-text").value;
    // Methionine and cysteine metabolism
    var compartment = document.getElementById("compartment-text").value;
    // c, m, e, n

    console.log(
        "Process Network for " + process +
        " within compartment " + compartment
    );
    var collection1 = collectProcessReactionsMetabolites({
        process: process,
        combination: "and",
        collection: extractInitialCollectionFromModel(model),
        model: model
    });
    var collection2 = collectCompartmentReactionsMetabolites({
        compartment: compartment,
        combination: "and",
        collection: collection1,
        model: model
    });
    console.log(collection2);
    visualizeNetwork(collection2, model);
}

/**
 * Controls the execution of all steps in the queue for the query.
 * @param {Object} parameters Destructured object of parameters.
 * @param {string} parameters.queue Elements that remain in the queue for
 * recursive iteration.
 * @param {Object<string, Array<string>>} parameters.collection Identifiers of
 * metabolites and reactions in the query's current collection.
 * @param {Object} parameters.model Information about entities and relations in
 * a metabolic model.
 * @returns {Array<string>>} Identifiers of initial elements for the query step.
 */
function controlQueryQueueStep({queue, collection, model} = {}) {}


// TODO: Use this function to organize the functionality for handling a single step from the query.
// TODO: Use this function to execute a single step right after adding it to the queue.
function controlQueryStep() {}


// TODO: Keep this function for now for the sake of reference.
// TODO: Some aspects might be useful in constructing the new query interface.
/**
 * Appends one additional query step to the query queue.
 * @param {Object} event Record of event from Document Object Model.
 */
function addQueryStep(event) {
    // Element on which the event originated is event.currentTarget.

    // Determine the count of the new step in the query queue.
    var steps = document
            .getElementById("query-queue")
            .getElementsByClassName("query-step");
    var stepCount = steps.length + 1;

    // Create element for query step.
    var step = document.createElement("div");
    step.setAttribute("class", "query-step");
    var header = document.createElement("h3");
    header.appendChild(document.createTextNode("Step " + stepCount));
    step.appendChild(header);

    // Create radio buttons for combination strategy.
    step.appendChild(
        createLabelRadioButton(
            "combination", "combination-step-" + stepCount, "and", "and"
        )
    );
    step.appendChild(
        createLabelRadioButton(
            "combination", "combination-step-" + stepCount, "or", "or"
        )
    );
    step.appendChild(
        createLabelRadioButton(
            "combination", "combination-step-" + stepCount, "not", "not"
        )
    );
    step.appendChild(document.createElement("br"));
    // Create text field.
    // <input class="query-step" id="compartment-text" type="text">
    var textField = document.createElement("input");
    textField.setAttribute("class", "text");
    textField.setAttribute("type", "text");
    step.appendChild(textField);
    step.appendChild(document.createElement("br"));
    // Create button to remove step from queue.
    var button = document.createElement("button");
    button.setAttribute("class", "remove-query-step");
    button.setAttribute("type", "button");
    // TODO: After removing a query element, I should update the step count for the step labels.
    // TODO: Maybe the event should trigger a specific container function that calls the general removeParentElement function along with another function to update query step counts.
    button.addEventListener("click", function (event) {
        // Element on which the event originated is event.currentTarget.
        removeParentElement(event.currentTarget);
    });
    button.appendChild(document.createTextNode("X"));
    step.appendChild(button);
    // Append step element to the query queue.
    document
        .getElementById("query-queue")
        .appendChild(step);

    // TODO: Update Step Count headers after deleting an intermediate step.

    // Activate delete buttons in query steps.
    //document
    //    .getElementById("query-queue")
    //    .querySelectorAll("div.query-step > button.remove")
    //    .forEach(function (element) {
    //        element.addEventListener("click", removeParentElement);
    //    });
}
