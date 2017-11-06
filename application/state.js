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
* Representation of the state of the application.
* ...
* This class stores methods that control the creation of a representation of
* the current state of the application. As part of this process, the methods
* evaluate the current state of the application to respond appropriately. These
* methods also call external methods as necessary.
*/
class State {
  /**
  * Initializes an instance of the class.
  * @param {Object} model Model of the comprehensive state of the
  * application.
  */
  constructor(model) {
    // Reference to model of application's state.
    this.model = model;
    // Control representation and behavior according to application's state.
    // Each change to the model of the application's state calls this class to
    // interpret the state.
    this.represent();
    // Control action on the state of the model.
    this.act();

  }
  /**
  * Evaluates the context of the application's state and creates an
  * appropriate representation in a visual interface.
  */
  represent() {
    // If application's state has appropriate information then create
    // interface for source.
    if (!this.determineMetabolicEntitiesSets()) {
      // Initialize instance of interface.
      // Pass this instance a reference to the model of the application's
      // state.
      new SourceView(this.model);
      // Load from file a default persistent state of the application.
      // The intent is for this action to be temporary during development.
      //var path = "../model/homo-sapiens/model_sets_network.json";
      //Action.loadDefaultState(path, this.model);
      // TODO: Get rid of the source view after extraction... then the view
      // TODO: should be blank or something until all state attributes are available for set and entity views.
    }
    // If application's state has appropriate information then create
    // interface for persistence.
    if (this.determineMetabolicEntitiesSets()) {
      // Initialize instance of interface.
      // Pass this instance a reference to the model of the application's
      // state.
      new PersistenceView(this.model);
    }
    // If application's state has appropriate information then create
    // interface for set.
    if (
      this.determineMetabolicEntitiesSets() &&
      this.determineTotalEntitiesSets() &&
      this.determineCurrentEntitiesSets() &&
      this.determineSetsCardinalities()
    ) {
      // Initialize instance of interface.
      // Pass this instance a reference to the model of the application's
      // state.
      new SetView(this.model);
    }
    // If application's state has appropriate information then create
    // interface for control of network's assembly.
    if (
      this.determineCandidateContext() &&
      this.determineCandidateEntities()
    ) {
      // Initialize instance of interface.
      // Pass this instance a reference to the model of the application's
      // state.
      new AssemblyView(this.model);
    }
    // If application's state has appropriate information then create
    // interface for place-holder in bottom of interface.
    if (
      this.determineCandidateContext() &&
      this.determineCandidateEntities()
    ) {
      // Initialize instance of interface.
      // Pass this instance a reference to the model of the application's
      // state.
      new BottomView(this.model);
    }
    // If application's state has appropriate information then create
    // interface for visual representation of network's topology.
    // TODO: Eventually, I think I'll need to split "determineNetworkElements"
    // TODO: to consider network's elements and subnetwork's elements... ie, I'll
    // TODO: need network's elements to allow topological traversal, but I won't
    // TODO: necessarily draw the network until I have the current network's elements...
    // TODO: those currently of interest for drawing...
    if (
      this.determineCandidateContext() &&
      this.determineCandidateEntities()
    ) {
      // Initialize instance of interface.
      // Pass this instance a reference to the model of the application's
      // state.
      new TopologyView(this.model);
    }
  }
  /**
  * Evaluates the context of the application's state and executes automatic
  * actions as appropriate.
  */
  act() {}
  // Methods to evaluate application's state.

  /**
  * Determines whether the application's state has information about metabolic
  * entities and sets.
  */
  determineMetabolicEntitiesSets() {
    return (
      !(this.model.metabolites === null) &&
      !(this.model.reactions === null) &&
      !(this.model.compartments === null) &&
      !(this.model.genes === null) &&
      !(this.model.processes === null)
    );
  }
  /**
  * Determines whether the application's state has information about all
  * entities' attribution to sets.
  */
  determineTotalEntitiesSets() {
    return (
      !(this.model.totalReactionsSets === null) &&
      !(this.model.totalMetabolitesSets === null)
    );
  }
  /**
  * Determines whether the application's state has information about current
  * entities' attribution to sets.
  */
  determineCurrentEntitiesSets() {
    return (
      !(this.model.setsFilters === null) &&
      !(this.model.accessReactionsSets === null) &&
      !(this.model.accessMetabolitesSets === null) &&
      !(this.model.filterReactionsSets === null) &&
      !(this.model.filterMetabolitesSets === null)
    );
  }
  /**
  * Determines whether or not the application's state has information about
  * sets of metabolic entities by their values of attributes.
  */
  determineSetsCardinalities() {
    return (
      !(this.model.setsEntities === null) &&
      !(this.model.setsFilter === null) &&
      !(this.model.setsCardinalities === null) &&
      !(this.model.setsSummary === null)
    );
  }
  /**
  * Determines whether or not the application's state has information about
  * context of interest for candidate entities.
  */
  determineCandidateContext() {
    return (
      !(this.model.compartmentalization === null) &&
      !(this.model.reactionsSimplifications === null) &&
      !(this.model.metabolitesSimplifications === null)
    );
  }
  /**
  * Determines whether or not the application's state has information about
  * candidate entities.
  */
  determineCandidateEntities() {
    return (
      !(this.model.reactionsCandidates === null) &&
      !(this.model.metabolitesCandidates === null)
    );
  }



  /**
  * Determines whether or not the application's state has information about
  * options for assembly of a network of relations between metabolic
  * entities.
  */
  determineNetworkAssembly() {
    return (
      !(this.model.compartmentalization === null) &&
      !(this.model.simplification === null)
    );
  }
  /**
  * Determines whether or not the application's state has information about
  * a network and subnetwork of relations between metabolic entities.
  */
  determineNetworkElements() {
    return (
      !(this.model.metabolitesNodes === null) &&
      !(this.model.reactionsNodes === null) &&
      !(this.model.links === null) &&
      !(this.model.currrentMetabolitesNodes === null) &&
      !(this.model.currentReactionsNodes === null) &&
      !(this.model.currentLinks === null)
    );
  }
}
