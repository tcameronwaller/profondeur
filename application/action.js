/*
Profondeur supports visual exploration and analysis of metabolic networks.
Copyright (C) 2017 Thomas Cameron Waller

This program is free software: you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free Software
Foundation, either version 3 of the License, or (at your option) any later
version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE.
See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with
this program.
If not, see <http://www.gnu.org/licenses/>.

This file is part of project Profondeur.
Project repository's address: https://github.com/tcameronwaller/profondeur/
Author's electronic address: tcameronwaller@gmail.com
Author's physical address:
T Cameron Waller
Scientific Computing and Imaging Institute
University of Utah
72 South Central Campus Drive Room 3750
Salt Lake City, Utah 84112
United States of America
*/

/**
* Actions that modify the state of the application.
* This class does not store any attributes and does not require instantiation.
* This class stores methods that control all actions that modify the model for
* the state of the application.
* The methods require a reference to the instance
* of the model.
* These methods also call external methods as necessary.
*/
class Action {
  // Methods herein intend to comprise discrete actions that impart changes to
  // the application's state.
  // Some actions necessitate changes to multiple aspects of the application
  // that coordinate together.
  // For efficiency, these actions impart these multiple changes
  // simultaneously.
  // Knowledge of the event that triggered the action informs which changes to
  // make to the application's state.
  //
  // To call the restore method of the model, it is necessary to pass the
  // method a reference to the current instance of the model.
  // Methods for general functionality relevant to application actions.

  // Submission to application's state.

  /**
  * Submits a novel value of a variable to the application's state.
  * @param {Object} parameters Destructured object of parameters.
  * @param {Object} parameters.value Value of the variable.
  * @param {string} parameters.variable Name of the variable.
  * @param {Object} parameters.state Application's state.
  */
  static submitStateVariableValue({value, variable, state} = {}) {
    var novelVariableValue = [{
      variable: variable,
      value: value
    }];
    state.restore(novelVariableValue, state);
  }
  /**
  * Submits novel values of variables to the application's state.
  * @param {Object} parameters Destructured object of parameters.
  * @param {Object} parameters.variablesValues Names and values of variables.
  * @param {Object} parameters.state Application's state.
  */
  static submitStateVariablesValues({variablesValues, state} = {}) {
    var novelVariablesValues = Object
    .keys(variablesValues).map(function (variable) {
      return {
        variable: variable,
        value: variablesValues[variable]
      };
    });
    state.restore(novelVariablesValues, state);
  }
  /**
  * Removes a variable's value from the application's state by submitting a
  * null value.
  * @param {Object} parameters Destructured object of parameters.
  * @param {string} parameters.variable Name of the variable.
  * @param {Object} parameters.state Application's state.
  */
  static removeStateVariableValue({variable, state} = {}) {
    Action.submitStateVariableValue({
      value: null,
      variable: variable,
      state: state
    });
  }

  // Direct actions.

  /**
  * Initializes the application's state by submitting null values of all
  * variables.
  * @param {Object} state Application's state.
  */
  static initializeApplication(state) {
    var variablesValues = state
    .variablesNames.reduce(function (collection, variableName) {
      var entry = {[variableName]: null};
      return Object.assign(collection, entry);
    }, {});
    // Submit variables' values to the application's state.
    Action.submitStateVariablesValues({
      variablesValues: variablesValues,
      state: state
    });
  }
  /**
  * Initializes values of variables of application's controls.
  * @param {Object} state Application's state.
  */
  static initializeApplicationControls(state) {
    var source = null;
    var controlViews = {
      state: true,
      set: false,
      candidacy: false,
      traversal: false
    };
    var topology = false;
    var topologyNovelty = true;
    // Initialize controls for set view.
    var setViewControls = Action.initializeSetViewControls();
    // Initialize controls for candidacy view.
    var candidacyViewControls = Action.initializeCandidacyViewControls();
    // Initialize controls for traversal view.
    var traversalViewControls = Action.initializeTraversalViewControls();
    // Compile variables' values.
    var novelVariablesValues = {
      source: source,
      controlViews: controlViews,
      topology: topology,
      topologyNovelty: topologyNovelty
    };
    var variablesValues = Object.assign(
      novelVariablesValues,
      setViewControls,
      candidacyViewControls,
      traversalViewControls
    );
    // Submit variables' values to the application's state.
    Action.submitStateVariablesValues({
      variablesValues: variablesValues,
      state: state
    });
  }
  /**
  * Restores values of variables of application's controls for set view.
  * @param {Object} state Application's state.
  */
  static restoreSetViewControls(state) {
    // Initialize controls for set view.
    var setViewControls = Action.initializeSetViewControls();
    // Determine current entities' attribution to sets.
    var currentEntitiesSets = Attribution.determineCurrentEntitiesSets({
      setsFilters: setViewControls.setsFilters,
      totalReactionsSets: state.totalReactionsSets,
      totalMetabolitesSets: state.totalMetabolitesSets,
      reactions: state.reactions
    });
    // Determine sets' cardinalities and prepare sets' summaries.
    var setsCardinalitiesSummaries = Cardinality
    .determineSetsCardinalitiesSummaries({
      setsEntities: setViewControls.setsEntities,
      setsFilter: setViewControls.setsFilter,
      accessReactionsSets: currentEntitiesSets.accessReactionsSets,
      accessMetabolitesSets: currentEntitiesSets.accessMetabolitesSets,
      filterReactionsSets: currentEntitiesSets.filterReactionsSets,
      filterMetabolitesSets: currentEntitiesSets.filterMetabolitesSets,
      setsSearches: setViewControls.setsSearches,
      setsSorts: setViewControls.setsSorts,
      compartments: state.compartments,
      processes: state.processes
    });
    // Determine candidate entities, their simplifications, and summaries.
    var candidatesSimplificationsSummaries = Candidacy
    .evaluateCandidacyContext({
      reactionsSets: currentEntitiesSets.filterReactionsSets,
      reactions: state.reactions,
      metabolites: state.metabolites,
      compartmentalization: state.compartmentalization,
      metabolitesSimplifications: state.metabolitesSimplifications,
      reactionsSimplifications: state.reactionsSimplifications,
      candidatesSearches: state.candidatesSearches,
      candidatesSorts: state.candidatesSorts,
      compartments: state.compartments
    });
    // Create network's elements.
    var networkElements = Network.createNetworkElements({
      reactionsCandidates: candidatesSimplificationsSummaries
      .reactionsCandidates,
      metabolitesCandidates: candidatesSimplificationsSummaries
      .metabolitesCandidates,
      reactionsSimplifications: candidatesSimplificationsSummaries
      .reactionsSimplifications,
      metabolitesSimplifications: candidatesSimplificationsSummaries
      .metabolitesSimplifications,
      reactions: state.reactions,
      metabolites: state.metabolites,
      compartmentalization: state.compartmentalization
    });
    // Create subnetwork's elements.
    var subnetworkElements = Network.copySubnetworkElements({
      networkNodesRecords: networkElements.networkNodesRecords,
      networkLinksRecords: networkElements.networkLinksRecords
    });
    // Compile variables' values.
    var variablesValues = Object.assign(
      setViewControls,
      currentEntitiesSets,
      setsCardinalitiesSummaries,
      candidatesSimplificationsSummaries,
      networkElements,
      subnetworkElements
    );
    // Submit variables' values to the application's state.
    Action.submitStateVariablesValues({
      variablesValues: variablesValues,
      state: state
    });
  }
  /**
  * Restores values of variables of application's controls for candidacy view.
  * @param {Object} state Application's state.
  */
  static restoreCandidacyViewControls(state) {
    // Initialize controls for candidacy view.
    var candidacyViewControls = Action.initializeCandidacyViewControls();
    // Determine candidate entities, their simplifications, and summaries.
    var candidatesSimplificationsSummaries = Candidacy
    .evaluateCandidacyContext({
      reactionsSets: state.filterReactionsSets,
      reactions: state.reactions,
      metabolites: state.metabolites,
      compartmentalization: candidacyViewControls.compartmentalization,
      metabolitesSimplifications: candidacyViewControls.metabolitesSimplifications,
      reactionsSimplifications: candidacyViewControls.reactionsSimplifications,
      candidatesSearches: candidacyViewControls.candidatesSearches,
      candidatesSorts: candidacyViewControls.candidatesSorts,
      compartments: state.compartments
    });
    // Create network's elements.
    var networkElements = Network.createNetworkElements({
      reactionsCandidates: candidatesSimplificationsSummaries
      .reactionsCandidates,
      metabolitesCandidates: candidatesSimplificationsSummaries
      .metabolitesCandidates,
      reactionsSimplifications: candidatesSimplificationsSummaries
      .reactionsSimplifications,
      metabolitesSimplifications: candidatesSimplificationsSummaries
      .metabolitesSimplifications,
      reactions: state.reactions,
      metabolites: state.metabolites,
      compartmentalization: state.compartmentalization
    });
    // Create subnetwork's elements.
    var subnetworkElements = Network.copySubnetworkElements({
      networkNodesRecords: networkElements.networkNodesRecords,
      networkLinksRecords: networkElements.networkLinksRecords
    });
    // Compile variables' values.
    var variablesValues = Object.assign(
      candidacyViewControls,
      candidatesSimplificationsSummaries,
      networkElements,
      subnetworkElements
    );
    // Submit variables' values to the application's state.
    Action.submitStateVariablesValues({
      variablesValues: variablesValues,
      state: state
    });
  }
  /**
  * Copies the subnetwork from the network and restores values of variables of
  * application's controls for traversal view.
  * @param {Object} state Application's state.
  */
  static copySubnetworkRestoreTraversalViewControls(state) {
    // Initialize controls for traversal view.
    var traversalViewControls = Action.initializeTraversalViewControls();
    // Create subnetwork's elements.
    var subnetworkElements = Network.copySubnetworkElements({
      networkNodesRecords: state.networkNodesRecords,
      networkLinksRecords: state.networkLinksRecords
    });
    // Compile variables' values.
    var variablesValues = Object.assign(
      traversalViewControls,
      subnetworkElements
    );
    // Submit variables' values to the application's state.
    Action.submitStateVariablesValues({
      variablesValues: variablesValues,
      state: state
    });
  }
  /**
  * Clears the subnetwork and restores values of variables of application's
  * controls for traversal view.
  * @param {Object} state Application's state.
  */
  static clearSubnetworkRestoreTraversalViewControls(state) {
    // Initialize controls for traversal view.
    var traversalViewControls = Action.initializeTraversalViewControls();
    // Create subnetwork's elements.
    var subnetworkElements = {
      subnetworkNodesRecords: [],
      subnetworkLinksRecords: []
    };
    // Compile variables' values.
    var variablesValues = Object.assign(
      traversalViewControls,
      subnetworkElements
    );
    // Submit variables' values to the application's state.
    Action.submitStateVariablesValues({
      variablesValues: variablesValues,
      state: state
    });
  }
  /**
  * Loads from file basic information about metabolic entities and sets.
  * @param {Object} state Application's state.
  */
  static loadMetabolismBaseInformation(state) {
    d3.json("metabolic_entities_sets.json", function (data) {
      Action.restoreMetabolismBaseInformation({
        data: data,
        state: state
      });
    });
  }
  /**
  * Derives information from basic information about metabolic entities and
  * sets.
  * @param {Object} state Application's state.
  */
  static deriveTotalMetabolismInformation(state) {
    // Determine total entities' attribution to sets.
    var totalEntitiesSets = Attribution
    .determineTotalEntitiesSets(state.reactions);
    // Determine current entities' attribution to sets.
    var currentEntitiesSets = Attribution.determineCurrentEntitiesSets({
      setsFilters: state.setsFilters,
      totalReactionsSets: totalEntitiesSets.totalReactionsSets,
      totalMetabolitesSets: totalEntitiesSets.totalMetabolitesSets,
      reactions: state.reactions
    });
    // Determine sets' cardinalities and prepare sets' summaries.
    var setsCardinalitiesSummaries = Cardinality
    .determineSetsCardinalitiesSummaries({
      setsEntities: state.setsEntities,
      setsFilter: state.setsFilter,
      accessReactionsSets: currentEntitiesSets.accessReactionsSets,
      accessMetabolitesSets: currentEntitiesSets.accessMetabolitesSets,
      filterReactionsSets: currentEntitiesSets.filterReactionsSets,
      filterMetabolitesSets: currentEntitiesSets.filterMetabolitesSets,
      setsSearches: state.setsSearches,
      setsSorts: state.setsSorts,
      compartments: state.compartments,
      processes: state.processes
    });
    // Determine candidate entities, their simplifications, and summaries.
    var candidatesSimplificationsSummaries = Candidacy
    .evaluateCandidacyContext({
      reactionsSets: currentEntitiesSets.filterReactionsSets,
      reactions: state.reactions,
      metabolites: state.metabolites,
      compartmentalization: state.compartmentalization,
      metabolitesSimplifications: state.metabolitesSimplifications,
      reactionsSimplifications: state.reactionsSimplifications,
      candidatesSearches: state.candidatesSearches,
      candidatesSorts: state.candidatesSorts,
      compartments: state.compartments
    });
    // Create network's elements.
    var networkElements = Network.createNetworkElements({
      reactionsCandidates: candidatesSimplificationsSummaries
      .reactionsCandidates,
      metabolitesCandidates: candidatesSimplificationsSummaries
      .metabolitesCandidates,
      reactionsSimplifications: candidatesSimplificationsSummaries
      .reactionsSimplifications,
      metabolitesSimplifications: candidatesSimplificationsSummaries
      .metabolitesSimplifications,
      reactions: state.reactions,
      metabolites: state.metabolites,
      compartmentalization: state.compartmentalization
    });
    // Create subnetwork's elements.
    var subnetworkElements = Network.copySubnetworkElements({
      networkNodesRecords: networkElements.networkNodesRecords,
      networkLinksRecords: networkElements.networkLinksRecords
    });
    // Compile variables' values.
    var variablesValues = Object.assign(
      totalEntitiesSets,
      currentEntitiesSets,
      setsCardinalitiesSummaries,
      candidatesSimplificationsSummaries,
      networkElements,
      subnetworkElements
    );
    // Submit variables' values to the application's state.
    Action.submitStateVariablesValues({
      variablesValues: variablesValues,
      state: state
    });
  }
  /**
  * Changes the selections of active panels within the control view.
  * @param {Object} parameters Destructured object of parameters.
  * @param {string} parameters.category Category of panel.
  * @param {Object} parameters.state Application's state.
  */
  static changeControlViews({category, state}) {
    // Change the view's selection.
    if (state.controlViews[category]) {
      var selection = false;
    } else {
      var selection = true;
    }
    // Create entry.
    var entry = {
      [category]: selection
    };
    var controlViews = Object.assign(state.controlViews, entry);
    // Compile variables' values.
    var novelVariablesValues = {
      controlViews: controlViews
    };
    var variablesValues = novelVariablesValues;
    // Submit variables' values to the application's state.
    Action.submitStateVariablesValues({
      variablesValues: variablesValues,
      state: state
    });
  }
  /**
  * Saves to file on client's system a persistent representation of the
  * application's state.
  * @param {Object} state Application's state.
  */
  static saveState(state) {
    var persistence = Action.createPersistentState(state);
    console.log("application's persistent state...");
    console.log(persistence);
    General.saveObject("state.json", persistence);
  }
  /**
  * Submits a novel source to the application's state.
  * @param {Object} source Reference to file object.
  * @param {Object} state Application's state.
  */
  static submitSource(source, state) {
    Action.submitStateVariableValue({
      value: source,
      variable: "source",
      state: state
    });
  }
  /**
  * Evaluates and loads from file a source of information about the
  * application's state, passing this information to another procedure to
  * restore the application's state.
  * @param {Object} state Application's state.
  */
  static evaluateLoadSource(state) {
    // Determine whether the application's state includes a source file.
    if (Model.determineSource(state)) {
      // Application's state includes a source file.
      General.loadPassObject({
        file: state.source,
        call: Action.evaluateRestoreState,
        parameters: {state: state}
      });
    } else {
      // Application's state does not include a source file.
      // Display error message.
      // Report message to remind user to select source file.
      var message = "please select a source file...";
      window.alert(message);
    }
  }
  /**
  * Executes a temporary procedure.
  * @param {Object} state Application's state.
  */
  static executeTemporaryProcedure(state) {
    // Initiate process timer.
    //console.time("timer");
    var startTime = window.performance.now();
    // Execute process.

    // Create subnetwork's elements.
    var nodes = Network.collectNodesTraverseBreadth({
      focus: "pyr",
      direction: "successors",
      limit: 2,
      nodes: state.networkNodesRecords,
      links: state.networkLinksRecords
    });
    var links = Network.collectLinksBetweenNodes({
      nodes: nodes,
      links: state.networkLinksRecords
    });
    var nodesRecords = Network.filterNodesLinksRecordsByIdentifiers({
      identifiers: nodes,
      records: state.networkNodesRecords
    });
    var linksRecords = Network.filterNodesLinksRecordsByIdentifiers({
      identifiers: links,
      records: state.networkLinksRecords
    });
    // Compile variables' values.
    var novelVariablesValues = {
      subnetworkNodesRecords: nodesRecords,
      subnetworkLinksRecords: linksRecords
    };
    var variablesValues = Object.assign(
      novelVariablesValues
    );
    // Submit variables' values to the application's state.
    Action.submitStateVariablesValues({
      variablesValues: variablesValues,
      state: state
    });

    // Terminate process timer.
    //console.timeEnd("timer");
    var endTime = window.performance.now();
    var duration = Math.round(endTime - startTime);
    console.log("process duration: " + duration + " milliseconds");
  }
  /**
  * Prepares and exports information about entities, reactions and metabolites,
  * that pass current filters by sets.
  * @param {Object} state Application's state.
  */
  static exportFilterEntitiesSummary(state) {
    // Prepare information.
    // Save information.
    // Reactions.
    var reactionsSummary = Evaluation.createEntitiesSummary({
      type: "reaction",
      identifiers: Object.keys(state.filterReactionsSets),
      reactions: state.reactions,
      metabolites: state.metabolites,
      reactionsSets: state.totalReactionsSets,
      metabolitesSets: state.totalMetabolitesSets,
      compartments: state.compartments,
      processes: state.processes
    });
    var reactionsSummaryString = General
    .convertRecordsStringTabSeparateTable(reactionsSummary);
    General.saveString("reactions_summary.txt", reactionsSummaryString);
    // Metabolites.
    var metabolitesSummary = Evaluation.createEntitiesSummary({
      type: "metabolite",
      identifiers: Object.keys(state.filterMetabolitesSets),
      reactions: state.reactions,
      metabolites: state.metabolites,
      reactionsSets: state.totalReactionsSets,
      metabolitesSets: state.totalMetabolitesSets,
      compartments: state.compartments,
      processes: state.processes
    });
    var metabolitesSummaryString = General
    .convertRecordsStringTabSeparateTable(metabolitesSummary);
    General.saveString("metabolites_summary.txt", metabolitesSummaryString);
  }
  /**
  * Prepares and exports information about entities, reactions and metabolites,
  * that merit representation in the subnetwork.
  * @param {Object} state Application's state.
  */
  static exportNetworkEntitiesSummary(state) {
    // Prepare information.
    // Save information.
    // Reactions.
    var nodesReactions = state.subnetworkNodesRecords.filter(function (record) {
      return record.type === "reaction";
    });
    var nodesReactionsIdentifiers = General
    .collectValueFromObjects("identifier", nodesReactions);
    var reactionsSummary = Evaluation.createEntitiesSummary({
      type: "reaction",
      identifiers: nodesReactionsIdentifiers,
      reactions: state.reactions,
      metabolites: state.metabolites,
      reactionsSets: state.totalReactionsSets,
      metabolitesSets: state.totalMetabolitesSets,
      compartments: state.compartments,
      processes: state.processes
    });
    var reactionsSummaryString = General
    .convertRecordsStringTabSeparateTable(reactionsSummary);
    General.saveString("reactions_summary.txt", reactionsSummaryString);
    // Metabolites.
    var nodesMetabolites = state
    .subnetworkNodesRecords.filter(function (record) {
      return record.type === "metabolite";
    });
    var nodesMetabolitesIdentifiers = General
    .collectValueFromObjects("identifier", nodesMetabolites);
    var metabolitesSummary = Evaluation.createEntitiesSummary({
      type: "metabolite",
      identifiers: nodesMetabolitesIdentifiers,
      reactions: state.reactions,
      metabolites: state.metabolites,
      reactionsSets: state.totalReactionsSets,
      metabolitesSets: state.totalMetabolitesSets,
      compartments: state.compartments,
      processes: state.processes
    });
    var metabolitesSummaryString = General
    .convertRecordsStringTabSeparateTable(metabolitesSummary);
    General.saveString("metabolites_summary.txt", metabolitesSummaryString);
  }
  /**
  * Changes the searches to filter summaries.
  * @param {Object} parameters Destructured object of parameters.
  * @param {string} parameters.type Type of summaries.
  * @param {string} parameters.category Name of category.
  * @param {string} parameters.string Search string by which to filter
  * records' names.
  * @param {Object} state Application's state.
  */
  static changeSearches({type, category, string, state} = {}) {
    // Determine searches.
    if (type === "sets") {
      var searchesName = "setsSearches";
    } else if (type === "candidates") {
      var searchesName = "candidatesSearches";
    }
    // Change the search's specifications.
    var searches = Action.changeCategoriesSearchString({
      category: category,
      string: string,
      searches: state[searchesName]
    });
    // Prepare summaries.
    if (type === "sets") {
      var summariesName = "setsSummaries";
      var summaries = Cardinality.prepareSetsSummaries({
        setsCardinalities: state.setsCardinalities,
        setsSearches: searches,
        setsSorts: state.setsSorts,
        compartments: state.compartments,
        processes: state.processes
      });
    } else if (type === "candidates") {
      var summariesName = "candidatesSummaries";
      var summaries = Candidacy.prepareCandidatesSummaries({
        reactionsCandidates: state.reactionsCandidates,
        metabolitesCandidates: state.metabolitesCandidates,
        candidatesSearches: searches,
        candidatesSorts: state.candidatesSorts
      });
    }
    // Compile variables' values.
    var novelVariablesValues = {
      [searchesName]: searches,
      [summariesName]: summaries
    };
    var variablesValues = novelVariablesValues;
    // Submit variables' values to the application's state.
    Action.submitStateVariablesValues({
      variablesValues: variablesValues,
      state: state
    });
  }
  /**
  * Changes the values of attributes to apply as filters to sets.
  * @param {Object} parameters Destructured object of parameters.
  * @param {string} parameters.value Value of attribute in current selection.
  * @param {string} parameters.attribute Attribute in current selection.
  * @param {Object} state Application's state.
  */
  static changeSetsFilters({value, attribute, state} = {}) {
    // Record set's selection for filters.
    var setsFilters = Attribution.recordSetSelectionFilters({
      value: value,
      attribute: attribute,
      setsFilters: state.setsFilters
    });
    // Determine current entities' attribution to sets.
    var currentEntitiesSets = Attribution.determineCurrentEntitiesSets({
      setsFilters: setsFilters,
      totalReactionsSets: state.totalReactionsSets,
      totalMetabolitesSets: state.totalMetabolitesSets,
      reactions: state.reactions
    });
    // Determine sets' cardinalities and prepare sets' summaries.
    var setsCardinalitiesSummaries = Cardinality
    .determineSetsCardinalitiesSummaries({
      setsEntities: state.setsEntities,
      setsFilter: state.setsFilter,
      accessReactionsSets: currentEntitiesSets.accessReactionsSets,
      accessMetabolitesSets: currentEntitiesSets.accessMetabolitesSets,
      filterReactionsSets: currentEntitiesSets.filterReactionsSets,
      filterMetabolitesSets: currentEntitiesSets.filterMetabolitesSets,
      setsSearches: state.setsSearches,
      setsSorts: state.setsSorts,
      compartments: state.compartments,
      processes: state.processes
    });
    // Determine candidate entities, their simplifications, and summaries.
    var candidatesSimplificationsSummaries = Candidacy
    .evaluateCandidacyContext({
      reactionsSets: currentEntitiesSets.filterReactionsSets,
      reactions: state.reactions,
      metabolites: state.metabolites,
      compartmentalization: state.compartmentalization,
      metabolitesSimplifications: state.metabolitesSimplifications,
      reactionsSimplifications: state.reactionsSimplifications,
      candidatesSearches: state.candidatesSearches,
      candidatesSorts: state.candidatesSorts,
      compartments: state.compartments
    });
    // Create network's elements.
    var networkElements = Network.createNetworkElements({
      reactionsCandidates: candidatesSimplificationsSummaries
      .reactionsCandidates,
      metabolitesCandidates: candidatesSimplificationsSummaries
      .metabolitesCandidates,
      reactionsSimplifications: candidatesSimplificationsSummaries
      .reactionsSimplifications,
      metabolitesSimplifications: candidatesSimplificationsSummaries
      .metabolitesSimplifications,
      reactions: state.reactions,
      metabolites: state.metabolites,
      compartmentalization: state.compartmentalization
    });
    // Create subnetwork's elements.
    var subnetworkElements = Network.copySubnetworkElements({
      networkNodesRecords: networkElements.networkNodesRecords,
      networkLinksRecords: networkElements.networkLinksRecords
    });
    // Initialize whether to draw a visual representation of network's topology.
    var topology = false;
    // Initialize novelty of network's topology.
    var topologyNovelty = true;
    // Compile variables' values.
    var novelVariablesValues = {
      setsFilters: setsFilters,
      topology: topology,
      topologyNovelty: topologyNovelty
    };
    var variablesValues = Object.assign(
      novelVariablesValues,
      currentEntitiesSets,
      setsCardinalitiesSummaries,
      candidatesSimplificationsSummaries,
      networkElements,
      subnetworkElements
    );
    // Submit variables' values to the application's state.
    Action.submitStateVariablesValues({
      variablesValues: variablesValues,
      state: state
    });
  }
  /**
  * Changes the selection of entities of interest for the sets' summary.
  * @param {Object} state Application's state.
  */
  static changeSetsEntities(state) {
    // Determine entities of interest.
    if (state.setsEntities === "metabolites") {
      var setsEntities = "reactions";
    } else if (state.setsEntities === "reactions") {
      var setsEntities = "metabolites";
    }
    // Determine sets' cardinalities and prepare sets' summaries.
    var setsCardinalitiesSummaries = Cardinality
    .determineSetsCardinalitiesSummaries({
      setsEntities: setsEntities,
      setsFilter: state.setsFilter,
      accessReactionsSets: state.accessReactionsSets,
      accessMetabolitesSets: state.accessMetabolitesSets,
      filterReactionsSets: state.filterReactionsSets,
      filterMetabolitesSets: state.filterMetabolitesSets,
      setsSearches: state.setsSearches,
      setsSorts: state.setsSorts,
      compartments: state.compartments,
      processes: state.processes
    });
    // Compile variables' values.
    var novelVariablesValues = {
      setsEntities: setsEntities
    };
    var variablesValues = Object.assign(
      novelVariablesValues,
      setsCardinalitiesSummaries
    );
    // Submit variables' values to the application's state.
    Action.submitStateVariablesValues({
      variablesValues: variablesValues,
      state: state
    });
  }
  /**
  * Changes the selection of filter for the sets' summary.
  * @param {Object} state Application's state.
  */
  static changeSetsFilter(state) {
    // Determine filter.
    if (state.setsFilter) {
      var setsFilter = false;
    } else {
      var setsFilter = true;
    }
    // Determine sets' cardinalities and prepare sets' summaries.
    var setsCardinalitiesSummaries = Cardinality
    .determineSetsCardinalitiesSummaries({
      setsEntities: state.setsEntities,
      setsFilter: setsFilter,
      accessReactionsSets: state.accessReactionsSets,
      accessMetabolitesSets: state.accessMetabolitesSets,
      filterReactionsSets: state.filterReactionsSets,
      filterMetabolitesSets: state.filterMetabolitesSets,
      setsSearches: state.setsSearches,
      setsSorts: state.setsSorts,
      compartments: state.compartments,
      processes: state.processes
    });
    // Compile variables' values.
    var novelVariablesValues = {
      setsFilter: setsFilter
    };
    var variablesValues = Object.assign(
      novelVariablesValues,
      setsCardinalitiesSummaries
    );
    // Submit variables' values to the application's state.
    Action.submitStateVariablesValues({
      variablesValues: variablesValues,
      state: state
    });
  }
  /**
  * Changes the specifications to sort summaries.
  * @param {Object} parameters Destructured object of parameters.
  * @param {string} parameters.type Type of summaries.
  * @param {string} parameters.category Name of category.
  * @param {string} parameters.criterion Criterion for sort.
  * @param {Object} parameters.state Application's state.
  */
  static changeSorts({type, category, criterion, state} = {}) {
    // Determine sorts.
    if (type === "sets") {
      var sortsName = "setsSorts";
    } else if (type === "candidates") {
      var sortsName = "candidatesSorts";
    }
    // Change the sorts' specifications.
    var sorts = Action.changeCategoriesSortCriterionOrder({
      category: category,
      criterion: criterion,
      sorts: state[sortsName]
    });
    // Sort summaries.
    if (type === "sets") {
      var summariesName = "setsSummaries";
      var summaries = Cardinality.sortSetsSummaries({
        setsSummaries: state.setsSummaries,
        setsSorts: sorts,
        compartments: state.compartments,
        processes: state.processes
      });
    } else if (type === "candidates") {
      var summariesName = "candidatesSummaries";
      var summaries = Candidacy.sortCandidatesSummaries({
        candidatesSummaries: state.candidatesSummaries,
        candidatesSorts: sorts,
        reactionsCandidates: state.reactionsCandidates,
        metabolitesCandidates: state.metabolitesCandidates
      });
    }
    // Compile variables' values.
    var novelVariablesValues = {
      [sortsName]: sorts,
      [summariesName]: summaries
    };
    var variablesValues = novelVariablesValues;
    // Submit variables' values to the application's state.
    Action.submitStateVariablesValues({
      variablesValues: variablesValues,
      state: state
    });
  }
  /**
  * Changes specification of compartmentalization's relevance
  * @param {Object} state Application's state.
  */
  static changeCompartmentalization(state) {
    // Determine compartmentalization.
    if (state.compartmentalization) {
      var compartmentalization = false;
    } else {
      var compartmentalization = true;
    }
    // Initialize selections for entities' simplification.
    // Simplifications are specific to candidate entities, which are specific to
    // the context of interest, of which compartmentalization is part.
    var simplifications = Candidacy.createInitialSimplifications();
    // Determine candidate entities, their simplifications, and summaries.
    var candidatesSimplificationsSummaries = Candidacy
    .evaluateCandidacyContext({
      reactionsSets: state.filterReactionsSets,
      reactions: state.reactions,
      metabolites: state.metabolites,
      compartmentalization: compartmentalization,
      metabolitesSimplifications: simplifications.metabolitesSimplifications,
      reactionsSimplifications: simplifications.reactionsSimplifications,
      candidatesSearches: state.candidatesSearches,
      candidatesSorts: state.candidatesSorts,
      compartments: state.compartments
    });
    // Create network's elements.
    var networkElements = Network.createNetworkElements({
      reactionsCandidates: candidatesSimplificationsSummaries
      .reactionsCandidates,
      metabolitesCandidates: candidatesSimplificationsSummaries
      .metabolitesCandidates,
      reactionsSimplifications: candidatesSimplificationsSummaries
      .reactionsSimplifications,
      metabolitesSimplifications: candidatesSimplificationsSummaries
      .metabolitesSimplifications,
      reactions: state.reactions,
      metabolites: state.metabolites,
      compartmentalization: compartmentalization
    });
    // Create subnetwork's elements.
    var subnetworkElements = Network.copySubnetworkElements({
      networkNodesRecords: networkElements.networkNodesRecords,
      networkLinksRecords: networkElements.networkLinksRecords
    });
    // Initialize whether to draw a visual representation of network's topology.
    var topology = false;
    // Initialize novelty of network's topology.
    var topologyNovelty = true;
    // Compile variables' values.
    var novelVariablesValues = {
      compartmentalization: compartmentalization,
      topology: topology,
      topologyNovelty: topologyNovelty
    };
    var variablesValues = Object.assign(
      novelVariablesValues,
      candidatesSimplificationsSummaries,
      networkElements,
      subnetworkElements
    );
    // Submit variables' values to the application's state.
    Action.submitStateVariablesValues({
      variablesValues: variablesValues,
      state: state
    });
  }
  /**
  * Changes explicit and implicit simplifications.
  * @param {Object} parameters Destructured object of parameters.
  * @param {string} parameters.identifier Identifier of a candidate entity.
  * @param {string} parameters.category Category of entities, metabolites or
  * reactions.
  * @param {string} parameters.method Method for simplification, omission or
  * replication.
  * @param {Object} parameters.state Application's state.
  */
  static changeSimplification({identifier, category, method, state} = {}) {
    // Change explicit and implicit designations of entities for simplification.
    var simplifications = Candidacy.changeSimplifications({
      identifier: identifier,
      category: category,
      method: method,
      reactionsCandidates: state.reactionsCandidates,
      metabolitesCandidates: state.metabolitesCandidates,
      reactionsSets: state.filterReactionsSets,
      reactions: state.reactions,
      compartmentalization: state.compartmentalization,
      reactionsSimplifications: state.reactionsSimplifications,
      metabolitesSimplifications: state.metabolitesSimplifications
    });
    // Create network's elements.
    var networkElements = Network.createNetworkElements({
      reactionsCandidates: state.reactionsCandidates,
      metabolitesCandidates: state.metabolitesCandidates,
      reactionsSimplifications: simplifications.reactionsSimplifications,
      metabolitesSimplifications: simplifications.metabolitesSimplifications,
      reactions: state.reactions,
      metabolites: state.metabolites,
      compartmentalization: state.compartmentalization
    });
    // Create subnetwork's elements.
    var subnetworkElements = Network.copySubnetworkElements({
      networkNodesRecords: networkElements.networkNodesRecords,
      networkLinksRecords: networkElements.networkLinksRecords
    });
    // Initialize whether to draw a visual representation of network's topology.
    var topology = false;
    // Initialize novelty of network's topology.
    var topologyNovelty = true;
    // Compile variables' values.
    var novelVariablesValues = {
      topology: topology,
      topologyNovelty: topologyNovelty
    };
    var variablesValues = Object.assign(
      novelVariablesValues,
      simplifications,
      networkElements,
      subnetworkElements
    );
    // Submit variables' values to the application's state.
    Action.submitStateVariablesValues({
      variablesValues: variablesValues,
      state: state
    });
  }
  /**
  * Changes the selection of combination in traversal view.
  * @param {string} type Type of combination, union or difference.
  * @param {Object} state Application's state.
  */
  static changeCombination(type, state) {
    // Compile variables' values.
    var novelVariablesValues = {
      traversalCombination: type
    };
    var variablesValues = Object.assign(novelVariablesValues);
    // Submit variables' values to the application's state.
    Action.submitStateVariablesValues({
      variablesValues: variablesValues,
      state: state
    });
  }
  /**
  * Changes the selection of type of controls in traversal view.
  * @param {string} type Type of traversal, rogue, proximity, or path.
  * @param {Object} state Application's state.
  */
  static changeTraversalType(type, state) {
    // Compile variables' values.
    var novelVariablesValues = {
      traversalType: type
    };
    var variablesValues = Object.assign(novelVariablesValues);
    // Submit variables' values to the application's state.
    Action.submitStateVariablesValues({
      variablesValues: variablesValues,
      state: state
    });
  }
  /**
  * Changes the selection of focus for rogue traversal.
  * @param {Object} parameters Destructured object of parameters.
  * @param {string} parameters.identifier Identifier of a node.
  * @param {string} parameters.type Type of a node, metabolite or reaction.
  * @param {Object} parameters.state Application's state.
  */
  static changeRogueFocus({identifier, type, state} = {}) {
    // Create record.
    var record = {
      identifier: identifier,
      type: type
    };
    // Compile variables' values.
    var novelVariablesValues = {
      rogueFocus: record
    };
    var variablesValues = Object.assign(novelVariablesValues);
    // Submit variables' values to the application's state.
    Action.submitStateVariablesValues({
      variablesValues: variablesValues,
      state: state
    });
  }
  /**
  * Changes the selection of topology.
  * @param {Object} state Application's state.
  */
  static changeTopology(state) {
    // Determine topology's novelty.
    if (state.topology) {
      var topology = false;
    } else {
      var topology = true;
    }
    // Compile variables' values.
    var novelVariablesValues = {
      topology: topology
    };
    var variablesValues = novelVariablesValues;
    // Submit variables' values to the application's state.
    Action.submitStateVariablesValues({
      variablesValues: variablesValues,
      state: state
    });
  }
  /**
  * Changes the selection of the novelty of the current network's topology.
  * @param {Object} state Application's state.
  */
  static changeTopologyNovelty(state) {
    // Determine topology's novelty.
    if (state.topologyNovelty) {
      var topologyNovelty = false;
    } else {
      var topologyNovelty = true;
    }
    // Compile variables' values.
    var novelVariablesValues = {
      topologyNovelty: topologyNovelty
    };
    var variablesValues = novelVariablesValues;
    // Submit variables' values to the application's state.
    Action.submitStateVariablesValues({
      variablesValues: variablesValues,
      state: state
    });
  }

  // Indirect actions.

  /**
  * Initializes values of variables of application's controls for set view.
  * @param {Object} state Application's state.
  */
  static initializeSetViewControls() {
    // Initialize controls.
    var setsFilters = Attribution.createInitialSetsFilters();
    var setsEntities = "metabolites";
    var setsFilter = false;
    var setsSearches = Cardinality.createInitialSetsSearches();
    var setsSorts = Cardinality.createInitialSetsSorts();
    // Compile information.
    var variablesValues = {
      setsFilters: setsFilters,
      setsEntities: setsEntities,
      setsFilter: setsFilter,
      setsSearches: setsSearches,
      setsSorts: setsSorts
    };
    // Return information.
    return variablesValues;
  }
  /**
  * Initializes values of variables of application's controls for candidacy
  * view.
  * @param {Object} state Application's state.
  */
  static initializeCandidacyViewControls() {
    // Initialize controls.
    var compartmentalization = false;
    var simplifications = Candidacy.createInitialSimplifications();
    var candidatesSearches = Candidacy.createInitialCandidatesSearches();
    var candidatesSorts = Candidacy.createInitialCandidatesSorts();
    // Compile information.
    var variablesValues = {
      compartmentalization: compartmentalization,
      reactionsSimplifications: simplifications.reactionsSimplifications,
      metabolitesSimplifications: simplifications.metabolitesSimplifications,
      candidatesSearches: candidatesSearches,
      candidatesSorts: candidatesSorts
    };
    // Return information.
    return variablesValues;
  }
  /**
  * Initializes values of variables of application's controls for traversal
  * view.
  * @param {Object} state Application's state.
  */
  static initializeTraversalViewControls() {
    // Initialize controls.
    var traversalCombination = "difference";
    var traversalType = "rogue";
    var rogueFocus = null;
    // Compile information.
    var variablesValues = {
      traversalCombination: traversalCombination,
      traversalType: traversalType,
      rogueFocus: rogueFocus
    };
    // Return information.
    return variablesValues;
  }


  /**
  * Restores basic information about metabolic entities and sets.
  * @param {Object} parameters Destructured object of parameters.
  * @param {Object} parameters.data Information about metabolic entities and
  * sets.
  * @param {Object} parameters.state Application's state.
  */
  static restoreMetabolismBaseInformation({data, state} = {}) {
    // Compile variables' values.
    var novelVariablesValues = {
      metabolites: data.metabolites,
      reactions: data.reactions,
      compartments: data.compartments,
      processes: data.processes,
      genes: data.genes
    };
    var variablesValues = novelVariablesValues;
    // Submit variables' values to the application's state.
    Action.submitStateVariablesValues({
      variablesValues: variablesValues,
      state: state
    });
  }
  /**
  * Creates persistent representation of the application's state.
  * @param {Object} state Application's state.
  * @returns {Object} Persistent representation of the application's state.
  */
  static createPersistentState(state) {
    return state.variablesNames.reduce(function (collection, variableName) {
      var entry = {
        [variableName]: state[variableName]
      };
      return Object.assign({}, collection, entry);
    }, {});
  }
  /**
  * Evaluates information from a persistent source to restore the application's
  * state.
  * @param {Object} parameters Destructured object of parameters.
  * @param {Object} parameters.data Persistent source of information about
  * application's state.
  * @param {Object} parameters.state Application's state.
  */
  static evaluateRestoreState({data, state} = {}) {
    // Determine appropriate procedure for source information.
    var model = (data.id === "MODEL1603150001");
    var clean = data.clean;
    if (!model) {
      Action.restoreState({
        data: data,
        state: state
      });
    } else if (model && clean) {
      Action.extractMetabolicEntitiesSets({
        data: data,
        state: state
      });
    } else if (model && !clean) {
      var cleanData = Clean.checkCleanMetabolicEntitiesSetsRecon2(data);
      Action.extractMetabolicEntitiesSets({
        data: cleanData,
        state: state
      });
    }
  }
  /**
  * Restores the application to a state from a persistent source.
  * @param {Object} parameters Destructured object of parameters.
  * @param {Object} parameters.data Persistent source of information about
  * application's state.
  * @param {Object} parameters.state Application's state.
  */
  static restoreState({data, state} = {}) {
    // Remove any information about source from the application's state.
    var source = null;
    // Compile variables' values.
    var novelVariablesValues = {
      source: source
    };
    var variablesValues = Object.assign(
      novelVariablesValues,
      data
    );
    // Submit variables' values to the application's state.
    Action.submitStateVariablesValues({
      variablesValues: variablesValues,
      state: state
    });
  }
  /**
  * Extracts information about metabolic entities and sets from a clean model
  * of metabolism.
  * @param {Object} parameters Destructured object of parameters.
  * @param {Object} parameters.data Information about metabolic entities and
  * sets.
  * @param {Object} parameters.state Application's state.
  */
  static extractMetabolicEntitiesSets({data, state} = {}) {
    // Extract information about metabolic entities and sets.
    // The complete model has 2652 metabolites.
    // The complete model has 7785 reactions.
    var metabolicEntitiesSets = Extraction
    .extractMetabolicEntitiesSetsRecon2(data);
    General.saveObject("metabolic_entities_sets.json", metabolicEntitiesSets);
  }
  /**
  * Changes the specifications to sort records in multiple categories.
  * @param {Object} parameters Destructured object of parameters.
  * @param {string} parameters.category Name of category.
  * @param {string} parameters.criterion Criterion for sort.
  * @param {Object<Object<string>>} parameters.sorts Specifications to sort
  * records in multiple categories.
  * @returns {Object<Object<string>>} Specifications to sort records in multiple
  * categories.
  */
  static changeCategoriesSortCriterionOrder({category, criterion, sorts} = {}) {
    // Change the specification only for the specific category.
    // Determine whether current criterion matches previous criterion.
    if (criterion === sorts[category].criterion) {
      // Current criterion matches previous criterion.
      // Change the specification's order.
      if (sorts[category].order === "descend") {
        var order = "ascend";
      } else if (sorts[category].order === "ascend") {
        var order = "descend";
      }
    } else {
      // Current criterion does not match previous criterion.
      // Change the specification to the current criterion with default order.
      var order = "descend";
    }
    // Create entry.
    var entry = {
      [category]: {
        criterion: criterion,
        order: order
      }
    };
    // Copy specifications.
    var copySorts = General.copyValue(sorts, true);
    // Include entry.
    var novelSorts = Object.assign(copySorts, entry);
    return novelSorts;
  }
  /**
  * Changes the searches to filter records in multiple categories.
  * @param {Object} parameters Destructured object of parameters.
  * @param {string} parameters.category Name of category.
  * @param {string} parameters.string String by which to filter records' names.
  * @param {Object<string>} parameters.searches Searches to filter records in
  * multiple categories.
  * @returns {Object<string>} Searches to filter sets' summaries.
  */
  static changeCategoriesSearchString({category, string, searches} = {}) {
    // Change the specification only for the specific category.
    // Create entry.
    var entry = {
      [category]: string.toLowerCase()
    };
    // Copy specifications.
    var copySearches = General.copyValue(searches, true);
    // Include entry.
    var novelSearches = Object.assign(copySearches, entry);
    return novelSearches;
  }




  ////////////////////////////////////////////////////////////////////////// ???

  /**
  * Restores controls for network's assembly to initial state.
  * @param {Object} model Model of the comprehensive state of the
  * application.
  */
  static restoreNetworkAssembly(model) {
    // Initialize application's attributes that relate to definition and
    // assemblyof network's elements from metabolic entities.
    var networkDefinitionAttributes = Action
    .initializeNetworkDefinitionAttributes();
    // Submit new values of attributes to the model of the application's
    // state.
    Action.submitAttributes({
      attributesValues: networkDefinitionAttributes,
      model: model
    });
  }
  /**
  * Removes the identifier for a single metabolite from the collection of
  * replications for the network's assembly.
  * Submits new values to the model of the application's state.
  * @param {Object} parameters Destructured object of parameters.
  * @param {string} parameters.identifier Identifier of a single metabolite.
  * @param {Object} parameters.model Model of the comprehensive state of the
  * application.
  */
  static removeCurrentReplication({identifier, model} = {}) {
    // Filter replications to omit any replication for the identifier.
    var replications = model.replications.filter(function (replication) {
      return !(replication === identifier);
    });
    // Submit new value of attribute to the model of the application's
    // state.
    Action.submitAttribute({
      value: replications,
      attribute: "replications",
      model: model
    });
  }
  /**
  * Includes the identifier for a single metabolite in the collection of
  * replications for the network's assembly.
  * Submits new values to the model of the application's state.
  * @param {Object} parameters Destructured object of parameters.
  * @param {string} parameters.name Name of a single metabolite.
  * @param {Object} parameters.model Model of the comprehensive state of the
  * application.
  */
  static includeNovelReplication({name, model} = {}) {
    // If name is valid for a current metabolite that is not already in the
    // collection of replications, then include that metabolite's identifier
    // in the collection of replications.
    // Determine the identifier for any current, novel metabolites that
    // match the name.
    // Metabolites have both unique identifiers and unique names.
    var nameMatches = model
    .currentMetabolites.filter(function (identifier) {
      return model.metabolites[identifier].name === name;
    });
    var novelNameMatches = nameMatches.filter(function (identifier) {
      return !model.replications.includes(identifier);
    });
    if ((novelNameMatches.length > 0)) {
      var replications = []
      .concat(model.replications, novelNameMatches[0]);
    } else {
      var replications = model.replications;
    }
    // Submit new value of attribute to the model of the application's
    // state.
    Action.submitAttribute({
      value: replications,
      attribute: "replications",
      model: model
    });
  }
  /**
  * Creates a network of nodes and links to represent metabolic entities,
  * metabolites and reactions, and relations between them.
  * @param {Object} model Model of the comprehensive state of the
  * application.
  */
  static traverseTopology(model) {
    // TODO: I don't want to initialize a network in JSNetworkX until I have to.
    if (false) {
      // Initialize an operable network in JSNetworkX from the network's
      // elements.
      var network = Network.initializeNetwork({
        links: networkElements.links,
        nodes: networkElements.nodes
      });
      // Induce subnetwork.
      //var subNetwork = Network.induceEgoNetwork({
      //    focus: "pyr_c",
      //    depth: 2,
      //    center: true,
      //    direction: null,
      //    network: network
      //});
      var subNetwork = network;
      // Extract information about nodes and links from the subnetwork.
      var subNodes = Network.extractNetworkNodes(subNetwork);
      var subLinks = Network.extractNetworkLinks(subNetwork);
      console.log("subnetwork elements");
      console.log(subNodes);
      console.log(subLinks);
    }
  }


  //////////////////////////////////////////////////////////////////////////////
  // TODO: SOME of these methods might be obsolete...

  /**
  * Initializes values of attributes that relate to definition and assembly of
  * network's elements from metabolic entities.
  * @returns {Object} Collection of multiple attributes that relate to
  * definition and assembly of network's elements.
  */
  static initializeNetworkDefinitionAttributes() {
    // Specify compartmentalization for representation of metabolic entities in
    // the network.
    var compartmentalization = true;
    // Specify simplification's method for representation of metabolic entities
    // in the network.
    var simplification = "omission";
    //var replications = [
    //  "ac", "accoa", "adp", "amp", "atp", "ca2", "camp", "cdp", "cl",
    //  "cmp", "co", "co2", "coa", "ctp", "datp", "dcmp", "dctp", "dna",
    //  "dtdp", "dtmp", "fe2", "fe3", "fmn", "gdp", "gmp", "gtp", "h", "h2",
    //  "h2o", "h2o2", "hco3", "i", "idp", "imp", "itp", "k", "na1", "nad",
    //  "nadh", "nadp", "nadph", "nh4", "no", "no2", "o2", "o2s", "oh1",
    //  "pi", "ppi", "pppi", "so3", "so4", "udp", "ump", "utp"
    //];
    // Compile attributes' values.
    var attributesValues = {
      compartmentalization: compartmentalization,
      simplification: simplification
    };
    // Return attributes' values.
    return attributesValues;
  }

  /**
  * Initializes values of attributes that relate to network's elements.
  * @returns {Object} Collection of multiple attributes that relate to network's
  * elements.
  */
  static initializeNetworkElementsAttributes() {
    // Initialize attributes for network's elements.
    var metabolitesNodes = null;
    var reactionsNodes = null;
    var links = null;
    var network = null;
    var currentMetabolitesNodes = null;
    var currentReactionsNodes = null;
    var currentLinks = null;
    var subNetwork = null;
    // Compile novel values of attributes.
    var attributesValues = {
      metabolitesNodes: metabolitesNodes,
      reactionsNodes: reactionsNodes,
      links: links,
      network: network,
      currentMetabolitesNodes: currentMetabolitesNodes,
      currentReactionsNodes: currentReactionsNodes,
      currentLinks: currentLinks,
      subNetwork: subNetwork
    };
    // Return attributes' values.
    return attributesValues;
  }
}
