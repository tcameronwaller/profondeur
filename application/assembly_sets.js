////////////////////////////////////////////////////////////////////////////////
// Assembly of Sets for Model
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// Creation of records for compartments

/**
 * Creates a record for a single compartment from a metabolic model.
 * @param {Object} compartments Information for all compartments of a metabolic
 * model.
 * @param {string} compartmentIdentifier Unique identifier of a compartment.
 * @returns {Object} Record for a compartment.
 */
function createCompartmentRecord(compartments, compartmentIdentifier) {
    return {
        id: compartmentIdentifier,
        name: compartments[compartmentIdentifier]
    };
}

/**
 * Creates records for all compartments from a metabolic model.
 * @param {Object} compartments Information for all compartments of a metabolic
 * model.
 * @returns {Array<Object>} Records for compartments.
 */
function createCompartmentRecords(compartments) {
    // Create records for compartments.
    return Object.keys(compartments).map(function (compartmentIdentifier) {
        return createCompartmentRecord(compartments, compartmentIdentifier);
    });
}

////////////////////////////////////////////////////////////////////////////////
// Creation of records for genes

/**
 * Checks to ensure that a gene participates in at least one reaction in the
 * metabolic model.
 * @param {string} geneIdentifier Identifier for a gene.
 * @param {Array<Object>} reactions Information for all reactions of a metabolic
 * model.
 * @returns {boolean} Whether or not the gene participates in a reaction.
 */
function checkGeneReactions(geneIdentifier, reactions) {
    // Confirm that gene participates in at least one reaction.
    if (countGeneReactions(geneIdentifier, reactions) >= 1) {
        return true;
    } else {
        console.log(
            "Check Genes: " + gene.id +
            " failed reaction check."
        );
        return false;
    }
}

/**
 * Checks a single gene from a metabolic model.
 * @param {string} geneIdentifier Identifier for a gene.
 * @param {Array<Object>} reactions Information for all reactions of a
 * metabolic model.
 */
function checkGene(geneIdentifier, reactions) {
    checkGeneReactions(geneIdentifier, reactions);
}

/**
 * Creates a record for a single gene from a metabolic model.
 * @param {string} processName Name of a metabolic subsystem or process.
 * @returns {Object} Record for a process.
 */
function createGeneRecord(gene) {
    return {
        id: gene.id,
        name: gene.name
    };
}

/**
 * Creates records for all genes from a metabolic model.
 * @param {Array<Object>} genes Information for all genes of a metabolic
 * model.
 * @param {Array<Object>} reactions Information for all reactions of a metabolic
 * model.
 * @returns {Array<Object>} Records for genes.
 */
function createGeneRecords(genes, reactions) {
    // Check genes.
    genes.map(function (gene) {
        return checkGene(gene.id, reactions);
    });
    // Create records for genes.
    return genes.map(createGeneRecord);
}

////////////////////////////////////////////////////////////////////////////////
// Creation of records for metabolites

/**
 * Checks a single metabolite from a metabolic model to ensure that all
 * compartmental records for a metabolite share identical properties.
 * @param {Array<Object>} setMetabolites Information for all compartmental
 * metabolites that are chemically identical.
 * @param {string} metaboliteIdentifier Unique identifier of general metabolite.
 * @returns {boolean} Whether or not all compartmental records for the
 * metabolite share identical properties.
 */
function checkMetaboliteSet(setMetabolites, metaboliteIdentifier) {
    // Confirm that all compartmental records have identical values for relevant
    // properties.
    ["charge", "formula", "name"].map(function (property) {
        if (
            collectUniqueElements(
                collectValuesFromObjects(setMetabolites, property)
            ).length <= 1
        ) {
            return true;
        } else {
            console.log(
                "Check Metabolite Sets: " + metaboliteIdentifier +
                " failed common properties check."
            );
            console.log(setMetabolites);
            return false;
        }
    });
}

/**
 * Determines a consensus charge for a set of metabolites.
 * @param {Array<Object>} setMetabolites Information for all compartmental
 * metabolites that are chemically identical.
 * @returns {string} Consensus charge for the set of metabolites.
 */
function determineMetaboliteSetCharge(setMetabolites) {
    var charges = collectValuesFromObjects(setMetabolites, "charge");
    if (collectUniqueElements(charges).length <= 1) {
        return collectUniqueElements(charges)[0];
    }
}

/**
 * Determines a consensus formula for a set of metabolites.
 * @param {Array<Object>} setMetabolites Information for all compartmental
 * metabolites that are chemically identical.
 * @returns {string} Consensus formula for the set of metabolites.
 */
function determineMetaboliteSetFormula(setMetabolites) {
    var formulas = collectValuesFromObjects(setMetabolites, "formula");
    if (collectUniqueElements(formulas).length <= 1) {
        return collectUniqueElements(formulas)[0];
    } else {
        // Chemical formulas for some metabolites in the model might include an
        // R character to denote a nonspecific alkyl substituent.
        // Inclusion of these nonspecific formulas can impart discrepancies in
        // separate records for the same metabolite.
        var formulasSpecific = formulas.filter(function (formula) {
            return !formula.includes("R");
        });
        if (collectUniqueElements(formulasSpecific).length === 1) {
            return collectUniqueElements(formulasSpecific)[0];
            //else if (collectUniqueElements(formulasSpecific).length > 1) {}
        } else {
            return formulas[0];
        }
    }
}

/**
 * Determines a consensus name for a set of metabolites.
 * @param {Array<Object>} setMetabolites Information for all compartmental
 * metabolites that are chemically identical.
 * @returns {string} Consensus name for the set of metabolites.
 */
function determineMetaboliteSetName(setMetabolites) {
    var names = collectValuesFromObjects(setMetabolites, "name");
    if (collectUniqueElements(names).length <= 1) {
        return collectUniqueElements(names)[0];
    } else if (
        (setMetabolites.every(function (metabolite) {
            return (metabolite.name.includes("_")) &&
                (metabolite.compartment ===
                extractCompartmentIdentifier(metabolite.name));
        })) &&
        (
            collectUniqueElements(
                extractMetaboliteIdentifiers(names)
            ).length === 1
        )
    ) {
        // Names for some metabolites in the model might include compartment
        // identifiers.
        // Inclusion of these compartment identifiers in the names can impart
        // discrepancies in separate records fro the same metabolite.
        return collectUniqueElements(extractMetaboliteIdentifiers(names))[0];
    } else if (
        (names.find(function (name) {
            return name.includes("(R)") || name.includes("(S)");
        }) != undefined) &&
        (collectUniqueElements(names.map(function (name) {
            return name.replace("(R)", "(R/S)");
        }).map(function (name) {
            return name.replace("(S)", "(R/S)");
        })).length === 1)
    ) {
        // Names for some metabolites in the model might include designations of
        // stereoisomers around chirality centers.
        // While these stereoisomers are chemically distinct, the model might
        // give them the same identifier.
        return collectUniqueElements(names.map(function (name) {
            return name.replace("(R)", "(R/S)");
        }).map(function (name) {
            return name.replace("(S)", "(R/S)");
        }))[0];
    } else {
        return names[0];
    }
}

/**
 * Creates a record for a single metabolite from a metabolic model.
 * @param {Array<Object>} metabolites Information for all metabolites of a
 * metabolic model.
 * @param {string} metaboliteIdentifier Unique identifier of general metabolite.
 * @returns {Object} Record for a metabolite.
 */
function createMetaboliteRecord(metabolites, metaboliteIdentifier) {
    // Collect all compartmental versions of the metabolite.
    var setMetabolites = filterCompartmentalMetabolitesByMetabolite(
        metabolites, metaboliteIdentifier
    );
    // Confirm that all compartmental records have identical values for relevant
    // properties.
    //checkMetaboliteSet(setMetabolites, metaboliteIdentifier);
    // Optionally introduce a conditional clause here to print the record for
    // specific metabolite sets and confirm proper correction for discrepancies.
    //if (metaboliteIdentifier === "CE7081") {}
    // Collect consensus properties from all metabolites in set.
    return {
        charge: determineMetaboliteSetCharge(setMetabolites),
        formula: determineMetaboliteSetFormula(setMetabolites),
        id: metaboliteIdentifier,
        name: determineMetaboliteSetName(setMetabolites)
    };
}

/**
 * Creates records for all metabolites from a metabolic model.
 * @param {Array<Object>} metabolites Information for all metabolites of a
 * metabolic model.
 * @returns {Array<Object>} Records for metabolites.
 */
function createMetaboliteRecords(metabolites) {
    // Check metabolites.
    // Create records for metabolites.
    return metabolites.reduce(function (accumulator, metabolite) {
        // Determine if a record already exists for the metabolite.
        if (accumulator.find(function (record) {
                return record.id === extractMetaboliteIdentifier(metabolite.id);
            }) === undefined) {
            // Create record for the metabolite.
            return accumulator.concat(createMetaboliteRecord(
                metabolites, extractMetaboliteIdentifier(metabolite.id)
                )
            );
        } else {
            return accumulator;
        }
    }, []);
}

////////////////////////////////////////////////////////////////////////////////
// Creation of records for processes

/**
 * Creates a record for a single metabolic process from a metabolic model.
 * @param {string} processName Name of a metabolic subsystem or process.
 * @returns {Object} Record for a process.
 */
function createProcessRecord(processName) {
    return {
        name: processName
    };
}

/**
 * Creates records for all processes from a metabolic model.
 * @param {Array<Object>} reactions Information for all reactions of a metabolic
 * model.
 * @returns {Array<Object>} Records for processes.
 */
function createProcessRecords(reactions) {
    // Create records for processes.
    // Assume that according to their annotation, all reactions in the metabolic
    // model participate in only a single metabolic process.
    return reactions.reduce(function (accumulator, reaction) {
        // Determine if a record already exists for the process.
        if (accumulator.find(function (record) {
                return record.name === reaction.subsystem;
            }) === undefined) {
            // Create record for the process.
            return accumulator.concat(createProcessRecord(reaction.subsystem));
        } else {
            return accumulator;
        }
    }, []);
}

////////////////////////////////////////////////////////////////////////////////
// Assembly of relational tables for sets

/**
 * Creates relational tables for information about sets of nodes of a
 * metabolic model.
 * @param {Object} model Information of a metabolic model from systems biology.
 * @returns {Object} Information about sets of nodes.
 */
function assembleSets(model) {
    return {
        sets: {
            compartments: createCompartmentRecords(model.compartments),
            genes: createGeneRecords(model.genes, model.reactions),
            metabolites: createMetaboliteRecords(model.metabolites),
            processes: createProcessRecords(model.reactions)
        }
    }
}
