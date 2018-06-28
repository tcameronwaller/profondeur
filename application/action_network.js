/*
This file is part of project Profondeur
(https://github.com/tcameronwaller/profondeur/).

Profondeur supports visual exploration and analysis of metabolic networks.
Copyright (C) 2018 Thomas Cameron Waller

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

Thomas Cameron Waller
tcameronwaller@gmail.com
Department of Biochemistry
University of Utah
Room 5520C, Emma Eccles Jones Medical Research Building
15 North Medical Drive East
Salt Lake City, Utah 84112
United States of America
*/

/**
* Actions that modify the application's state.
* This class does not store any attributes and does not require instantiation.
* This class stores methods that control actions that modify the application's
* state.
* The methods require a reference to the instance of the state.
* These methods also call external methods as necessary.
*/
class ActionNetwork {

  // Direct actions.

  /**
  * Restores values of application's variables for controls relevant to view.
  * @param {Object} state Application's state.
  */
  static restoreControls(state) {
    // Initialize relevant controls to default values.
    var network = ActionNetwork.initializeControls();
    var filter = ActionFilter.initializeControls();
    var context = ActionContext.initializeControls();
    // Copy information about application's state.
    var stateCopy = ActionState.createPersistence(state);
    // Replace information about relevant controls.
    var novelState = Object.assign(
      stateCopy,
      network,
      filter,
      context
    );
    // Determine which views to restore.
    var novelViewsRestoration = ActionInterface.changeViewsRestoration({
      views: [
        "network",
        "filter",
        "context",
        "subnetwork",
        "query",
        "measurement",
        "summary",
        "exploration"
      ],
      type: true,
      viewsRestoration: state.viewsRestoration
    });
    // Derive dependent state.
    var dependentStateVariables = ActionNetwork.deriveState({
      metabolites: state.metabolites,
      reactions: state.reactions,
      compartments: state.compartments,
      processes: state.processes,
      viewsRestoration: novelViewsRestoration,
      state: novelState
    });
    // Compile information.
    var novelVariablesValues = {};
    var variablesValues = Object.assign(
      novelVariablesValues,
      network,
      filter,
      context,
      dependentStateVariables
    );
    // Submit variables' values to the application's state.
    ActionGeneral.submitStateVariablesValues({
      variablesValues: variablesValues,
      state: state
    });
  }

  // TODO: export info about subnetwork's elements

  /**
  * Exports information.
  * @param {Object} state Application's state.
  */
  static export(state) {
    console.log("export network");
  }


  /**
  * Changes the selections of active panels within the panel view.
  * @param {Object} parameters Destructured object of parameters.
  * @param {string} parameters.category Category of panel.
  * @param {Object} parameters.state Application's state.
  */
  static changeView({category, state}) {
    // Multiple subordinate views within control view can be active
    // simultaneously.
    // Change the view's selection.
    if (state.networkViews[category]) {
      var selection = false;
    } else {
      var selection = true;
    }
    // Create entry.
    var entry = {
      [category]: selection
    };
    var networkViews = Object.assign(state.networkViews, entry);
    // Determine which views to restore.
    var viewsRestoration = ActionInterface.changeViewsRestoration({
      views: [category],
      type: true,
      viewsRestoration: state.viewsRestoration
    });
    // Compile variables' values.
    var novelVariablesValues = {
      networkViews: networkViews,
      viewsRestoration: viewsRestoration
    };
    var variablesValues = novelVariablesValues;
    // Submit variables' values to the application's state.
    ActionGeneral.submitStateVariablesValues({
      variablesValues: variablesValues,
      state: state
    });
  }

  // Indirect actions.

  /**
  * Initializes values of application's variables for controls relevant to view.
  * @returns {Object} Values of application's variables for view's controls.
  */
  static initializeControls() {
    // Initialize controls.
    var networkViews = {
      filter: false,
      context: false,
    };
    // Compile information.
    var variablesValues = {
      networkViews: networkViews
    };
    // Return information.
    return variablesValues;
  }
  /**
  * Derives application's dependent state from controls relevant to view.
  * @param {Object} parameters Destructured object of parameters.
  * @param {Object} parameters.metabolites Information about metabolites.
  * @param {Object} parameters.reactions Information about reactions.
  * @param {Object} parameters.compartments Information about compartments.
  * @param {Object} parameters.processes Information about processes.
  * @param {Object<boolean>} parameters.viewsRestoration Information about
  * whether to restore each view.
  * @param {Object} parameters.state Application's state.
  * @returns {Object} Values of application's variables.
  */
  static deriveState({metabolites, reactions, compartments, processes, viewsRestoration, state} = {}) {
    // Derive state relevant to view.
    // Determine which views to restore.
    var novelViewsRestoration = ActionInterface.changeViewsRestoration({
      views: [
        "network",
        "filter",
        "context",
        "subnetwork",
        "query",
        "measurement",
        "summary",
        "exploration"
      ],
      type: true,
      viewsRestoration: viewsRestoration
    });
    // Derive dependent state.
    var dependentStateVariables = ActionFilter.deriveState({
      setsFilters: state.setsFilters,
      setsFilter: state.setsFilter,
      setsEntities: state.setsEntities,
      setsSearches: state.setsSearches,
      setsSorts: state.setsSorts,
      metabolites: metabolites,
      reactions: reactions,
      compartments: compartments,
      processes: processes,
      viewsRestoration: novelViewsRestoration,
      state: state
    });
    // Compile information.
    var novelVariablesValues = {};
    var variablesValues = Object.assign(
      novelVariablesValues,
      dependentStateVariables
    );
    // Return information.
    return variablesValues;
  }

}