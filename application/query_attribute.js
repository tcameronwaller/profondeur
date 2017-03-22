
/**
 * Determines identifiers of initial elements for a query step.
 * @param {Object} parameters Destructured object of parameters.
 * @param {string} parameters.type Type of elements, either metabolites or
 * reactions.
 * @param {string} parameters.combination Indication of logical operator and,
 * or, not for combination of new selection with the query's current collection.
 * @param {Object<string, Array<string>>} parameters.collection Identifiers of
 * metabolites and reactions in the query's current collection.
 * @param {Object} parameters.model Information about entities and relations in
 * a metabolic model.
 * @returns {Array<string>>} Identifiers of initial elements for the query step.
 */
function determineInitialElements(
    {type, combination, collection, model} = {}
) {
    // Determine identifiers of initial elements according to the combination
    // strategy.
    // These initial elements are the set to filter in the query step.
    // The reason to determine initial elements according to the combination
    // strategy is to make the filter operation more efficient.
    if (combination === "and" || combination === "not") {
        // Combination strategies and and not only need to consider elements
        // from the current collection.
        var initialElements = collection[type];
    } else if (combination === "or") {
        // Combination strategy or needs to consider all elements from the
        // metabolic model.
        var initialElements = collectValuesFromObjects(
            Object.values(model.network.nodes[type]), "id"
        );
    }
    return initialElements;
}

/**
 * Combines elements according to specific strategies.
 * @param {Object} parameters Destructured object of parameters.
 * @param {Array<string>} parameters.newElements Elements that meet some new
 * selection criteria.
 * @param {Array<string>} parameters.oldElements Elements from a previous
 * collection.
 * @param {string} parameters.strategy Indication of logical operator and, or,
 * not for combination of new selection with the query's current collection.
 * @returns {Array<string>} Result of combination.
 */
function combineElements({newElements, oldElements, strategy} = {}) {
    // Combine elements initially.
    var initialCombination = collectUniqueElements(oldElements.concat(newElements));
    // Prepare final combination according to logical strategy.
    if (strategy === "and") {
        // Combination strategy and includes elements that exist both in the old
        // elements and in the new elements.
        var finalCombination = initialCombination
            .filter(function (element) {
                return (
                    oldElements.includes(element) &&
                    newElements.includes(element)
                );
            });
    } else if (combination === "or") {
        // Combination strategy or includes elements that exist either in the
        // old elements or in the new elements.
        var finalCombination = initialCombination;
    } else if (combination === "not") {
        // Combination strategy not includes elements that exist in the old
        // elements but not in the new elements.
        var finalCombination = oldElements.filter(function (element) {
            return !newElements.includes(element);
        });
    }
    return finalCombination;
}

/**
 * Extracts metabolites that participate either as reactants or products in
 * specific reactions.
 * @param {Array<string>} reactionIdentifiers Unique identifiers for reactions.
 * @param {Object} model Information about entities and relations in a metabolic
 * model.
 * @returns {Array<string>} Unique identifiers for metabolites.
 */
function extractReactionMetabolites(reactionIdentifiers, model) {
    var reactions = reactionIdentifiers.map(function (identifier) {
        return model.network.nodes.reactions[identifier];
    });
    return collectUniqueElements(
        reactions
            .map(function (reaction) {
                return [].concat(
                    reaction.products, reaction.reactants
                );
            })
            .reduce(function (accumulator, element) {
                return accumulator.concat(element);
            }, [])
    );
}

/**
 * Collects identifiers of reactions that are part of a specific metabolic
 * process along with identifiers of their metabolites.
 * @param {Object} parameters Destructured object of parameters.
 * @param {string} parameters.process Identifier or name for a specific
 * metabolic process.
 * @param {string} parameters.combination Indication of logical operator and,
 * or, not for combination of new selection with the query's current collection.
 * @param {Object<string, Array<string>>} parameters.collection Identifiers of
 * metabolites and reactions in the query's current collection.
 * @param {Object} parameters.model Information about entities and relations in
 * a metabolic model.
 * @returns {Object<string, Array<string>>} Identifiers of reactions and
 * metabolites in the query's new collection.
 */
function collectProcessReactionsMetabolites(
    {process, combination, collection, model} = {}
    ) {
    // Determine identifiers of initial reactions according to the combination
    // strategy.
    var initialReactions = determineInitialElements({
        type: "reactions",
        combination: combination,
        collection: collection,
        model: model
    });
    // Filter initial reaction identifiers for those of reactions that
    // participate in a specific metabolic process.
    // Refer to the metabolic model for the record of each reaction.
    var reactions = initialReactions.filter(function (reaction) {
        return model
                .network
                .nodes
                .reactions[reaction]
                .process === process;
    });
    // Collect identifiers of metabolites that participate in the reactions.
    var metabolites = extractReactionMetabolites(reactions, model);
    // Prepare new collection according to combination strategy.
    return {
        metabolites: combineElements({
            newElements: metabolites,
            oldElements: collection.metabolites,
            strategy: combination
        }),
        reactions: combineElements({
            newElements: reactions,
            oldElements: collection.reactions,
            strategy: combination
        })
    };
}

/**
 * Collects identifiers of metabolites in a specific cellular compartment along
 * with identifiers of their reactions.
 * @param {Object} parameters Destructured object of parameters.
 * @param {string} parameters.compartment Identifier for a specific cellular
 * compartment.
 * @param {string} parameters.combination Indication of logical operator and,
 * or, not for combination of new selection with the query's current collection.
 * @param {Object<string, Array<string>>} parameters.collection Identifiers of
 * metabolites and reactions in the query's current collection.
 * @param {Object} parameters.model Information about entities and relations in
 * a metabolic model.
 * @returns {Object<string, Array<string>>} Identifiers of reactions and
 * metabolites in the query's new collection.
 */
function collectCompartmentReactionsMetabolites(
    {compartment, combination, collection, model} = {}
    ) {
    // Determine identifiers of initial metabolites and reactions according to
    // the combination strategy.
    var initialMetabolites = determineInitialElements({
        type: "metabolites",
        combination: combination,
        collection: collection,
        model: model
    });
    var initialReactions = determineInitialElements({
        type: "reactions",
        combination: combination,
        collection: collection,
        model: model
    });
    // Filter initial metabolite identifiers for those in a specific cellular
    // compartment.
    // Refer to the metabolic model for the record of each metabolite.
    var metabolites = initialMetabolites.filter(function (metabolite) {
        return model
                .network
                .nodes
                .metabolites[metabolite]
                .compartment === compartment;
    });
    // Filter initial reactions identifiers for those that involve metabolites
    // in a specific cellular compartment.
    // Refer to the metabolic model for the record of each reaction.
    var reactions = initialReactions.filter(function (reaction) {
        var reactionMetabolites = [].concat(
            Object.values(model.network.nodes.reactions[reaction].products),
            Object.values(model.network.nodes.reactions[reaction].reactants)
        );
        // Keep reaction only if all of its metabolites are in a specific
        // compartment.
        // TODO: I'm not sure if this is the best strategy.
        // TODO: Should I instead keep reactions if any of their metabolites are in the compartment?
        // TODO: Also, should I consider only metabolites that match the selection (such as from the current collection)? <-- Yes.
        // TODO: Or should I consider all metabolites in the model that are within the compartment... that doesn't make any sense at all.
        return reactionMetabolites.every(function (metabolite) {
            metabolites.includes(metabolite);
        });
    });



}









// TODO: Get the process network function to work.
// TODO: Integrate this functionality with the interface.






// TODO: Next step... get function to work for including transport events to connect a discontinuous, multi-compartment network.
// TODO: This could just be a check box on the process network interface.





// TODO: Include transport reactions.
// TODO: Prioritize which transport reactions to include by those with the least number of reactants/products.
// TODO: Otherwise, there are a lot of transport reactions that are not primarily for the relevant metabolites.
// 2. Recursively find pairs or collections of metabolites... oh... just use the metabolite identifier in the node's data!

function includeTransportReactions() {
    // Determine whether or not multiple compartmental version of the same
    // metabolite participate in the process.
    var sets = initialMetabolites
        .reduce(function (accumulator, compartmentalIdentifier, index, array) {
            if (
                accumulator.filter(function (element) {
                    return element.includes(compartmentalIdentifier);
                }).length < 1
            ) {
                // The identifier for the compartmental metabolite is not
                // already in the collection.
                var identifier = model
                    .network
                    .nodes
                    .filter(function (node) {
                        return node.data.type === "metabolite";
                    })
                    .filter(function (node) {
                        return node.data.id === compartmentalIdentifier;
                    })[0]
                    .data
                    .metabolite;
                var set = array.filter(function (element) {
                    return model
                            .network
                            .nodes
                            .filter(function (node) {
                                return node.data.type === "metabolite";
                            })
                            .filter(function (node) {
                                return node.data.id === element;
                            })[0]
                            .data
                            .metabolite === identifier;
                });
                if (set.length > 1) {
                    // Multiple compartmental versions of the same metabolite
                    // participate in the process.
                    return accumulator.concat([set]);
                } else {
                    return accumulator;
                }
            } else {
                return accumulator;
            }
        }, []);
    console.log(sets);
    // TODO: Now filter reactions for reactions that involve combinations of the compartmental metabolites in reactants or products...
    // TODO: For simplicity, consider all reactants and products of the reaction together (collectMetabolitesOfReactions).
    // TODO: Be sure to consider all possible permutations of the compartmental metabolites.
    // TODO: An easy way to do that might be to select all reactions that involve >= 2 of the compartmental metabolites either as reactants or products.
    // Identify putative transport reactions as those whose metabolites
    // (reactants or products) include multiple compartmental metabolites from
    // the set.
    var transportReactions = model
        .network
        .nodes
        .filter(function (node) {
            return node.data.type === "reaction";
        })
        .filter(function (reaction) {
            return sets.some(function (set) {
                return set.filter(function (identifier) {
                        return [].concat(
                            reaction.data.products, reaction.data.reactants
                        ).includes(identifier);
                    }).length > 1;
            });
        });
    console.log(transportReactions);

    // TODO: I think the algorithm works up to this point.
    // TODO: Including these transport reactions increases the scale of the subnetwork dramatically.
    // TODO: There are a lot of transport reactions.
}

