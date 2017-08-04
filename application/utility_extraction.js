/**
 * Functionality of utility for extracting information about metabolic entities
 * and sets.
 * This class does not store any attributes and does not require instantiation.
 * This class stores methods for external utility.
 */
class Extraction {
    // Master control of extraction procedure.
    /**
     * Extracts information about metabolic entities and sets from the Recon 2.2
     * model of human metabolism from systems biology.
     * @param {Object} data Information about a metabolic model from systems
     * biology, conversion from SBML to JSON formats by COBRApy and libSBML.
     * @param {Object<string>} data.compartments Identifiers and names of
     * compartments.
     * @param {Array<Object<string>>} data.genes Identifiers and names of genes.
     * @param {Array<Object<string>>} data.metabolites Information about
     * compartment-specific metabolites.
     * @param {Array<Object<string>>} data.reactions Information about
     * reactions.
     * @returns {Object} Information about metabolic entities and sets.
     */
    static extractMetabolicEntitiesSetsRecon2(data) {
        // Extract information about sets.
        var compartments = Extraction
            .createCompartmentRecords(data.compartments);
        var genes = Extraction.createGeneRecords(data.genes);
        // TODO: Remove the "set" records for operations. I'll store this information differently...
        var operations = Extraction.createOperationRecords();
        var processes = Extraction.createProcessRecords(data.reactions);
        // TODO: Remove the "set" records for reversibilities. I'll store this information differently...
        var reversibilities = Extraction.createReversibilityRecords();
        // Extract information about entities.
        var metabolites = Extraction
            .createMetaboliteRecords(data.metabolites, data.reactions);
        // TODO: There are a lot of changes for reactions' records...
        var reactions = Extraction
            .createReactionRecords(data.reactions, processes);
        return {
            compartments: compartments,
            genes: genes,
            operations: operations,
            processes: processes,
            reversibilities: reversibilities,
            metabolites: metabolites,
            reactions: reactions
        };
    }
    // Extract sets.
    // Extract compartments.
    /**
     * Creates records for all compartments in a metabolic model.
     * @param {Object} compartments Information about all compartments in a
     * metabolic model.
     * @returns {Object} Records for compartments.
     */
    static createCompartmentRecords(compartments) {
        // Create records for compartments.
        return Object.keys(compartments)
            .reduce(function (collection, identifier) {
                var newRecord = Extraction
                    .createCompartmentRecord(
                        identifier, compartments[identifier]
                    );
                return Object.assign({}, collection, newRecord);
            }, {});
    }
    /**
     * Creates a record for a single compartment in a metabolic model.
     * @param {string} identifier Identifier of a single compartment.
     * @param {string} name Name of a single compartment.
     * @returns {Object} Record for a compartment.
     */
    static createCompartmentRecord(identifier, name) {
        return {
            [identifier]: {
                identifier: identifier,
                name: name
            }
        };
    }
    // Extract genes.
    /**
     * Creates records for all genes in a metabolic model.
     * @param {Array<Object>} genes Information for all genes of a metabolic
     * model.
     * @returns {Object} Records for genes.
     */
    static createGeneRecords(genes) {
        // Create records for genes.
        return genes.reduce(function (collection, gene) {
            var newRecord = Extraction.createGeneRecord(gene);
            return Object.assign({}, collection, newRecord);
        }, {});
    }
    /**
     * Creates a record for a single gene in a metabolic model.
     * @param {Object<string>} gene Information about a single gene.
     * @returns {Object} Record for a gene.
     */
    static createGeneRecord(gene) {
        return {
            [gene.id]: {
                identifier: gene.id,
                name: gene.name
            }
        };
    }
    // Extract operations.
    /**
     * Creates records for all operations in a metabolic model.
     * @returns {Object} Records for operations.
     */
    static createOperationRecords() {
        // Reactions involve either chemical conversion or compartmental
        // transport.
        // Individual reactions can involve both operations.
        return {
            c: {
                identifier: "c",
                name: "conversion"
            },
            t: {
                identifier: "t",
                name: "transport"
            }
        };
    }
    // Extract processes.
    /**
     * Creates records for all processes from a metabolic model.
     * @param {Array<Object>} reactions Information for all reactions of a
     * metabolic model.
     * @returns {Object} Records for processes.
     */
    static createProcessRecords(reactions) {
        // Create records for processes.
        // Assume that according to their annotation, all reactions in the
        // metabolic model participate in only a single metabolic process.
        // Include a set for undefined processes.
        return reactions.reduce(function (collection, reaction) {
            // Determine if the reaction has an annotation for process.
            if (reaction.subsystem) {
                var name = reaction.subsystem;
            } else {
                var name = "other";
            }
            // Determine if a record already exists for the process.
            if (Object.keys(collection).find(function (key) {
                    return collection[key].name === name;
                })) {
                return collection;
            } else {
                // Create record for the process.
                var newRecord = Extraction
                    .createProcessRecord(name, Object.keys(collection).length);
                return Object.assign({}, collection, newRecord);
            }
        }, {});
    }
    /**
     * Creates a record for a single metabolic process from a metabolic model.
     * @param {string} processName Name of a metabolic subsystem or process.
     * @param {number} length Length of collection of records for processes.
     * @returns {Object} Record for a process.
     */
    static createProcessRecord(processName, length) {
        var processIdentifier = "process_" + (length + 1).toString();
        return {
            [processIdentifier]: {
                identifier: processIdentifier,
                name: processName
            }
        };
    }
    // Extract reversibilities.
    /**
     * Creates records for all reversibilities in a metabolic model.
     * @returns {Object} Records for reversibilities.
     */
    static createReversibilityRecords() {
        return {
            i: {
                identifier: "i",
                name: "irreversible"
            },
            r: {
                identifier: "r",
                name: "reversible"
            }
        };
    }
    // Extract entities.
    // Extract metabolites.
    /**
     * Creates records for all metabolites from a metabolic model.
     * @param {Array<Object>} metabolites Information for all metabolites of a
     * metabolic model.
     * @param {Array<Object>} reactions Information for all reactions in a
     * metabolic model.
     * @returns {Object<string>} Records for metabolites.
     */
    static createMetaboliteRecords(metabolites, reactions) {
        // Collect the identifiers of reactions in which each metabolite
        // participates.
        var metaboliteReactions = Extraction
            .collectMetaboliteReactions(reactions);
        // Create records for general metabolites, without consideration for
        // compartmental occurrence.
        // Create records for metabolites.
        return metabolites.reduce(function (collection, metabolite) {
            // Determine if a record already exists for the metabolite.
            var identifier = Clean.extractMetaboliteIdentifier(metabolite.id);
            if (collection.hasOwnProperty(identifier)) {
                // A record exists for the metabolite.
                return collection;
            } else {
                // A record does not exist for the metabolite.
                // Create a new record for the metabolite.
                var newRecord = Extraction
                    .createMetaboliteRecord(
                        metabolite, metaboliteReactions[identifier]
                    );
                return Object.assign({}, collection, newRecord);
            }
        }, {});
    }
    /**
     * Collects the identifiers of all reactions in which each metabolite
     * participates.
     * @param {Array<Object>} reactions Information for all reactions in a
     * metabolic model.
     * @returns {Object<Array<string>>} Identifiers of reactions in which each
     * metabolite participates.
     */
    static collectMetaboliteReactions(reactions) {
        // To simplify the collection operation, flatten the information about
        // reactions and metabolites.
        var reactionsMetabolites = Extraction
            .extractReactionMetabolitePairs(reactions);
        // Collect the identifiers of reactions in which each metabolite
        // participates.
        // Assume that every metabolite in the model participates in at least
        // one reaction.
        return reactionsMetabolites
            .reduce(function (metaboliteReactions, pair) {
                if (metaboliteReactions.hasOwnProperty(pair.metabolite)) {
                    // The collection has a record for the metabolite.
                    // Include the identifier of the current reaction in the
                    // record.
                    // The new record will replace the previous record.
                    var oldReactions = metaboliteReactions[pair.metabolite];
                    if (!oldReactions.includes(pair.reaction)) {
                        var newReactions = []
                            .concat(oldReactions, pair.reaction);
                    } else {
                        var newReactions = oldReactions;
                    }
                    var newRecord = {
                        [pair.metabolite]: newReactions
                    };
                    return Object.assign({}, metaboliteReactions, newRecord);
                } else {
                    // The collection does not have a record for the metabolite.
                    // Create a new record for the metabolite and include the
                    // identifier of the current reaction.
                    var newRecord = {
                        [pair.metabolite]: [].concat(pair.reaction)
                    };
                    return Object.assign({}, metaboliteReactions, newRecord);
                }
            }, {});
    }
    /**
     * Extracts identifiers of metabolites from reactions and associates these
     * with identifiers of the reactions in which they participate.
     * @param {Array<Object>} reactions Information for all reactions in a
     * metabolic model.
     * @returns {Array<Object<string>>} Identifiers of metabolites with
     * identifiers of the reactions in which they participate.
     */
    static extractReactionMetabolitePairs(reactions) {
        return reactions.reduce(function (collection, reaction) {
            // Extract the identifiers of all metabolites that participate in
            // the reaction, and associate these with the identifier of the
            // reaction.
            var pairs = Object
                .keys(reaction.metabolites)
                .map(function (identifier) {
                    var metaboliteIdentifier = Clean
                        .extractMetaboliteIdentifier(identifier);
                    return {
                        metabolite: metaboliteIdentifier,
                        reaction: reaction.id
                    };
                });
            return [].concat(collection, pairs);
        }, []);
    }
    /**
     * Creates a record for a single metabolite from a metabolic model.
     * @param {Object<string>} metabolite Information about a single metabolite.
     * @param {Array<string>} metaboliteReactions Identifiers of reactions in
     * which a single metabolite participates.
     * @returns {Object} Record for a metabolite.
     */
    static createMetaboliteRecord(metabolite, metaboliteReactions) {
        // Previous checks and cleans of the data ensure that attributes
        // specific to general metabolites are consistent without discrepancies
        // between records for compartmental metabolites.
        var identifier = Clean.extractMetaboliteIdentifier(metabolite.id);
        return {
            [identifier]: {
                charge: metabolite.charge,
                formula: metabolite.formula,
                identifier: identifier,
                name: metabolite.name,
                reactions: metaboliteReactions
            }
        };
    }
    // Extract reactions.
    /**
     * Creates records for all reactions from a metabolic model.
     * @param {Array<Object>} reactions Information for all reactions in a
     * metabolic model.
     * @param {Object<string>} processes Information about all processes in a
     * metabolic model.
     * @returns {Object<string>} Records for reactions.
     */
    static createReactionRecords(reactions, processes) {
        // Create records for reactions.
        return reactions.reduce(function (collection, reaction) {
            var newRecord = Extraction
                .createReactionRecord(reaction, processes);
            return Object.assign({}, collection, newRecord);
        }, {});
    }
    /**
     * Creates a record for a single reaction from a metabolic model.
     * @param {Object} reaction Information for a reaction.
     * @param {Object} processes Information about all processes in a metabolic
     * model.
     * @returns {Object} Record for a node for a reaction.
     */
    static createReactionRecord(reaction, processes) {
        // Extract genes that have a role in the reaction.
        var genes = Clean.extractGenesFromRule(reaction.gene_reaction_rule);
        // Create records for metabolites that participate in the reaction,
        // their roles as reactants or products, and the compartments in which they participate.
        var metabolites = Extraction
            .createReactionMetabolites(reaction.metabolites);
        // TODO: Eliminate concept of "operations".
        // TODO: Introduce "conversion", "dispersal", and "transport".
        var operations = Extraction.determineReactionOperations(metabolites);
        // TODO: Use arrays to accommodate multiple processes for a reaction.
        // TODO: Use transport reactions to fill-in multi-compartmental processes...
        var process = Extraction
            .determineReactionProcessIdentifier(reaction.subsystem, processes);
        // TODO: Store reversibility as true/false.
        // Determine whether or not the reaction's reactants and products are
        // chemically different.
        var conversion = Extraction
            .determineReactionChemicalConversion(metabolites);
        // Determine whether or not the reaction's metabolites participate in
        // multiple compartments.
        var dispersal = Extraction
            .determineReactionMultipleCompartments(metabolites);
        // Determine whether or not any of the reaction's reactants and products
        // are chemically the same but participate in different compartments.
        // Determine whether or not the reaction is reversible.
        // TODO: Change the output of determineReactionReversibility so that it outputs true/false.
        var reversibility = Extraction
            .determineReactionReversibility(
                reaction.lower_bound, reaction.upper_bound
            );
        return {
            [reaction.id]: {
                conversion: conversion,
                dispersal: dispersal,
                genes: genes,
                identifier: reaction.id,
                metabolites: metabolites,
                name: reaction.name,
                operations: operations,
                process: process,
                reversibility: reversibility
            }
        };
    }
    /**
     * Creates records for the metabolites that participate in a reaction.
     * @param {Object<number>} reactionMetabolites Information about metabolites
     * that participate in a reaction.
     * @returns {Array<Object<string>>} Information about metabolites that
     * participate in a reaction.
     */
    static createReactionMetabolites(reactionMetabolites) {
        return Object.keys(reactionMetabolites).map(function (identifier) {
            return {
                identifier: Clean.extractMetaboliteIdentifier(identifier),
                role: Extraction.determineReactionMetaboliteRole(
                    reactionMetabolites[identifier]
                ),
                compartment: Clean.extractCompartmentIdentifier(identifier)
            };
        });
    }
    /**
     * Determines the role of a metabolite in a reaction, either as a reactant
     * or a product.
     * @param {number} code Code designator for metabolite role in reaction.
     * @returns {string} The metabolite's role as a reactant or product in the
     * reaction.
     */
    static determineReactionMetaboliteRole(code) {
        if (code < 0) {
            return "reactant";
        } else if (code > 0) {
            return "product";
        }
    }
    /**
     * Determines the identifier for a reaction's process.
     * @param {string} subsystem Name for a reaction's process.
     * @param {Object} processes Information about all processes in a metabolic
     * model.
     * @returns {string} Identifier for the reaction's process.
     */
    static determineReactionProcessIdentifier(subsystem, processes) {
        if (subsystem) {
            var name = subsystem;
        } else {
            var name = "other";
        }
        return Object.keys(processes).filter(function (key) {
            return processes[key].name === name;
        })[0];
    }
    /**
     * Determines the operations, conversion or transport, that describe the
     * effect of a reaction on its metabolites.
     * @param {Array<Object<string>>} reactionMetabolites Information about
     * metabolites that participate in a reaction.
     * @returns {Array<string>} Identifiers of operations.
     */
    static determineReactionOperations(reactionMetabolites) {
        // Determine if the reaction involves different metabolites in reactants
        // and products.
        // If the reaction involves different metabolites in reactants and
        // products, then consider the reaction to involve a chemical conversion
        // operation.
        if (
            Extraction.determineReactionChemicalConversion(reactionMetabolites)
        ) {
            var conversion = [].concat("c");
        } else {
            var conversion = [];
        }
        // Determine if the reaction involves metabolites in multiple
        // compartments.
        // If the reaction involves metabolites in multiple compartments, then
        // consider the reaction to involve a transport operation.
        if (
            Extraction
                .determineReactionMultipleCompartments(reactionMetabolites)
        ) {
            var conversionTransport = conversion.concat("t");
        } else {
            var conversionTransport = conversion;
        }
        return conversionTransport;
    }
    /**
     * Determines whether or not a reaction involves a chemical conversion
     * between its reactant and product metabolites.
     * @param {Array<Object<string>>} reactionMetabolites Information about
     * metabolites that participate in a reaction.
     * @returns {boolean} Whether or not metabolites change chemically.
     */
    static determineReactionChemicalConversion(reactionMetabolites) {
        var reactants = reactionMetabolites
            .filter(function (metabolite) {
                return metabolite.role === "reactant";
            }).map(function (reactant) {
                return reactant.identifier;
            });
        var products = reactionMetabolites
            .filter(function (metabolite) {
                return metabolite.role === "product";
            }).map(function (product) {
                return product.identifier;
            });
        return (
            !General.compareArraysByInclusion(reactants, products) &&
            !General.compareArraysByInclusion(products, reactants)
        );
    }
    /**
     * Determines whether or not a reaction involves metabolites in multiple
     * compartments.
     * @param {Array<Object<string>>} reactionMetabolites Information about
     * metabolites that participate in a reaction.
     * @returns {boolean} Whether or not metabolites are in multiple
     * compartments.
     */
    static determineReactionMultipleCompartments(reactionMetabolites) {
        var compartments = Extraction.extractReactionMetabolitesCompartments(
            reactionMetabolites
        );
        return (compartments.length > 1);
    }
    /**
     * Extracts unique compartments in which metabolites participate in a
     * reaction.
     * @param {Array<Object<string>>} reactionMetabolites Information about
     * metabolites that participate in a reaction.
     * @returns {Array<string>} Identifiers of compartments.
     */
    static extractReactionMetabolitesCompartments(reactionMetabolites) {
        var compartments = reactionMetabolites.map(function (metabolite) {
            return metabolite.compartment;
        });
        return General.collectUniqueElements(compartments);
    }
    /**
     * Determines whether a reaction's boundaries indicate reversibility or
     * irreversibility.
     * @param {number} lowBound Lower boundary for reaction.
     * @param {number} upBound Upper boundary for reaction.
     * @returns {string} Whether the reaction is reversible or irreversible.
     */
    static determineReactionReversibility(lowBound, upBound) {
        if (lowBound < 0 && 0 < upBound) {
            // Reaction is reversible.
            return "r";
        } else {
            // Reaction is irreversible.
            return "i";
        }
    }
    /**
     * Determines whether or not the reaction involves the same metabolite as
     * both reactant and product.
     * @param {Array<Object>} reactionMetabolites Information about metabolites
     * that participate in a reaction.
     * @returns {boolean} Indicator of whether or not the reaction involves the
     * same metabolite as both reactant and product.
     */
    static determineReactionSameChemicalDifferentCompartments(
        reactionMetabolites
    ) {
        var reactants = reactionMetabolites.filter(function (metabolite) {
            return metabolite.role === "reactant";
        }).map(function (reactant) {
            return reactant.identifier;
        });
        var products = reactionMetabolites.filter(function (metabolite) {
            return metabolite.role === "product";
        }).map(function (product) {
            return product.identifier;
        });
        return reactants.some(function (reactant) {
            return products.includes(reactant);
        });
    }
}