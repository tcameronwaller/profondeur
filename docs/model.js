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
* Model representation of the application's state.
* This class stores methods that control the representation of the application's
* state.
* The class evaluates the application's state and responds accordingly.
*/
class Model {
  /**
  * Initializes an instance of the class.
  * @param {Object} state Application's state.
  */
  constructor(state) {
    // Set reference to class' current instance to persist across scopes.
    var self = this;
    // Set reference to application's state.
    self.state = state;
    // Set reference to browser's window.
    self.window = window;
    // Set reference to document object model (DOM).
    self.document = document;
    // Set reference to body.
    self.body = self.document.getElementsByTagName("body").item(0);
    // Evaluate application's state, respond, and represent accordingly.
    self.act(self);
    self.represent(self);
  }
  /**
  * Evaluates the application's state and responds accordingly.
  * @param {Object} self Instance of a class.
  */
  act(self) {
    if (!Model.determineApplicationControls(self.state)) {
      ActionGeneral.initializeApplicationControls(self.state);
    } else if (!Model.determineMetabolismBaseInformation(self.state)) {
      ActionGeneral.loadMetabolismBaseInformation(self.state);
    } else if (!Model.determineMetabolismSupplementInformation(self.state)) {
      ActionGeneral.loadMetabolismSupplementInformation(self.state);
    } else if (!Model.determineMetabolismDerivationInformation(self.state)) {
      ActionGeneral.deriveState(self.state);
    }

    // TODO: determine if

    // TODO: I need to automatically determine whether the simulation dimensions match those of the exploration view... and update if necessary
  }

  // TODO: maybe handle the dimensions for the exploration view here in the Model...

  /**
  * Evaluates the application's state and represents it accordingly in a visual
  * interface.
  * All alterations to the application's state initiate restoration of the
  * application's interface.
  * Evaluation only considers which views to initialize or restore in the
  * interface.
  * Individual views' content and behavior depends further on application's
  * state.
  * @param {Object} self Instance of a class.
  */
  represent(self) {
    // Evaluate the application's state and represent it appropriately in the
    // interface's views.
    // Determine which of interface's views are both relevant and active.
    // Initialize or restore instances of interface's relevant views.
    // For efficiency, changes to application's state only restore variant
    // aspects of views and preserve persistent aspects.
    // Pass these instances a reference to the application's state.
    // Pass these instances references to instances of other relevant views.
    if (
      Model.determineApplicationControls(self.state) &&
      Model.determineMetabolismBaseInformation(self.state) &&
      Model.determineMetabolismSupplementInformation(self.state) &&
      Model.determineMetabolismDerivationInformation(self.state)
    ) {
      // Restore views.
      self.restoreViews(self);
    }
  }
  /**
  * Restores views' content and behavior.
  * @param {Object} self Instance of a class.
  */
  restoreViews(self) {
    // Determine which views to restore.
    // Every change to application's state sets a parameter to control which
    // views to restore.
    // Interface view.
    self.restoreInterfaceView(self);
    // Tip view.
    self.restoreTipView(self);
    // Panel view.
    self.restorePanelView(self);
    // Control view.
    self.restoreControlView(self);
    // State view.
    self.restoreStateView(self);
    // Network view.
    self.restoreNetworkView(self);
    // Filter view.
    self.restoreFilterView(self);
    // Context view.
    self.restoreContextView(self);
    // Subnetwork view.
    self.restoreSubnetworkView(self);
    // Query view.
    self.restoreQueryView(self);
    // Measurement view.
    // Summary view.
    // Exploration view.
    self.restoreExplorationView(self);
    // Notice view.
    self.restoreNoticeView(self);
    // Progress view.
    self.restoreProgressView(self);
    // Topology view.
    self.restoreTopologyView(self);

    if (false) {
      // Prompt view.
      // Prompt view always exists but is only visible when active.
      if (self.state.viewsRestoration.prompt) {
        // Restore views.
        self.state.views.prompt = new ViewPrompt({
          interfaceView: self.state.views.interface,
          state: self.state,
          documentReference: self.document,
          windowReference: self.window
        });
      }
      // Summary view.
      if (self.state.viewsRestoration.summary) {
        // Restore views.
        self.state.views.summary = new ViewSummary({
          interfaceView: self.state.views.interface,
          tipView: self.state.views.tip,
          promptView: self.state.views.prompt,
          panelView: self.state.views.panel,
          state: self.state,
          documentReference: self.document
        });
      }
      // Exploration view.
      if (self.state.viewsRestoration.exploration) {
        // Restore views.
        self.state.views.exploration = new ViewExploration({
          interfaceView: self.state.views.interface,
          tipView: self.state.views.tip,
          promptView: self.state.views.prompt,
          state: self.state,
          documentReference: self.document,
          windowReference: self.window
        });
      }
    }
  }
  /**
  * Restores view's content and behavior.
  * @param {Object} self Instance of a class.
  */
  restoreInterfaceView(self) {
    // Interface view.
    if (self.state.viewsRestoration.interface) {
      // Restore views.
      self.state.views.interface = new ViewInterface({
        documentReference: self.document,
        body: self.body,
        state: self.state
      });
      // Change restoration.
      self.state.viewsRestoration.interface = false;
    }
  }
  /**
  * Restores view's content and behavior.
  * @param {Object} self Instance of a class.
  */
  restoreTipView(self) {
    // Panel view.
    if (self.state.viewsRestoration.tip) {
      // Restore views.
      self.state.views.tip = new ViewTip({
        documentReference: self.document,
        windowReference: self.window,
        state: self.state
      });
      // Change restoration.
      self.state.viewsRestoration.tip = false;
    }
  }
  /**
  * Restores view's content and behavior.
  * @param {Object} self Instance of a class.
  */
  restorePanelView(self) {
    // Panel view.
    if (self.state.viewsRestoration.panel) {
      // Restore views.
      self.state.views.panel = new ViewPanel({
        documentReference: self.document,
        state: self.state
      });
      // Change restoration.
      self.state.viewsRestoration.panel = false;
    }
  }
  /**
  * Restores view's content and behavior.
  * @param {Object} self Instance of a class.
  */
  restoreControlView(self) {
    // Control view.
    if (self.state.viewsRestoration.control) {
      // Restore views.
      self.state.views.control = new ViewControl({
        documentReference: self.document,
        state: self.state
      });
      // Change restoration.
      self.state.viewsRestoration.control = false;
    }
  }
  /**
  * Restores view's content and behavior.
  * @param {Object} self Instance of a class.
  */
  restoreStateView(self) {
    // State view.
    if (self.state.viewsRestoration.state) {
      // Restore views.
      if (Model.determineControlState(self.state)) {
        self.state.views.state = new ViewState({
          documentReference: self.document,
          state: self.state
        });
      } else {
        View.removeExistElement("state", self.document);
      }
      // Change restoration.
      self.state.viewsRestoration.state = false;
    }
  }
  /**
  * Restores view's content and behavior.
  * @param {Object} self Instance of a class.
  */
  restoreNetworkView(self) {
    // Network view.
    if (self.state.viewsRestoration.network) {
      // Restore views.
      if (Model.determineControlNetwork(self.state)) {
        self.state.views.network = new ViewNetwork({
          documentReference: self.document,
          state: self.state
        });
      } else {
        View.removeExistElement("network", self.document);
      }
      // Change restoration.
      self.state.viewsRestoration.network = false;
    }
  }
  /**
  * Restores view's content and behavior.
  * @param {Object} self Instance of a class.
  */
  restoreFilterView(self) {
    // Filter view.
    if (self.state.viewsRestoration.filter) {
      // Restore views.
      if (Model.determineNetworkFilter(self.state)) {
        self.state.views.filter = new ViewFilter({
          documentReference: self.document,
          state: self.state
        });
      } else {
        View.removeExistElement("filter", self.document);
      }
      // Change restoration.
      self.state.viewsRestoration.filter = false;
    }
  }
  /**
  * Restores view's content and behavior.
  * @param {Object} self Instance of a class.
  */
  restoreContextView(self) {
    // Context view.
    if (self.state.viewsRestoration.context) {
      // Restore views.
      if (Model.determineNetworkContext(self.state)) {
        self.state.views.context = new ViewContext({
          documentReference: self.document,
          state: self.state
        });
      } else {
        View.removeExistElement("context", self.document);
      }
      // Change restoration.
      self.state.viewsRestoration.context = false;
    }
  }
  /**
  * Restores view's content and behavior.
  * @param {Object} self Instance of a class.
  */
  restoreSubnetworkView(self) {
    // Subnetwork view.
    if (self.state.viewsRestoration.subnetwork) {
      // Restore views.
      if (Model.determineControlSubnetwork(self.state)) {
        self.state.views.subnetwork = new ViewSubnetwork({
          documentReference: self.document,
          state: self.state
        });
      } else {
        View.removeExistElement("subnetwork", self.document);
      }
      // Change restoration.
      self.state.viewsRestoration.subnetwork = false;
    }
  }
  /**
  * Restores view's content and behavior.
  * @param {Object} self Instance of a class.
  */
  restoreQueryView(self) {
    // Context view.
    if (self.state.viewsRestoration.query) {
      // Restore views.
      if (Model.determineSubnetworkQuery(self.state)) {
        self.state.views.query = new ViewQuery({
          documentReference: self.document,
          state: self.state
        });
      } else {
        View.removeExistElement("query", self.document);
      }
      // Change restoration.
      self.state.viewsRestoration.query = false;
    }
  }
  /**
  * Restores view's content and behavior.
  * @param {Object} self Instance of a class.
  */
  restoreExplorationView(self) {
    // Exploration view.
    if (self.state.viewsRestoration.exploration) {
      // Restore views.
      self.state.views.exploration = new ViewExploration({
        documentReference: self.document,
        state: self.state
      });
      // Change restoration.
      self.state.viewsRestoration.exploration = false;
    }
  }
  /**
  * Restores view's content and behavior.
  * @param {Object} self Instance of a class.
  */
  restoreNoticeView(self) {
    // Notice view.
    if (self.state.viewsRestoration.notice) {
      // Restore views.
      if (Model.determineExplorationNotice(self.state)) {
        self.state.views.notice = new ViewNotice({
          documentReference: self.document,
          state: self.state
        });
      } else {
        View.removeExistElement("notice", self.document);
      }
      // Change restoration.
      self.state.viewsRestoration.notice = false;
    }
  }
  /**
  * Restores view's content and behavior.
  * @param {Object} self Instance of a class.
  */
  restoreProgressView(self) {
    // Progress view.
    if (self.state.viewsRestoration.progress) {
      // Restore views.
      if (Model.determineExplorationProgress(self.state)) {
        self.state.views.progress = new ViewProgress({
          documentReference: self.document,
          state: self.state
        });
      } else {
        View.removeExistElement("progress", self.document);
      }
      // Change restoration.
      self.state.viewsRestoration.progress = false;
    }
  }
  /**
  * Restores view's content and behavior.
  * @param {Object} self Instance of a class.
  */
  restoreTopologyView(self) {
    // Topology view.
    if (self.state.viewsRestoration.topology) {
      // Restore views.
      if (Model.determineExplorationTopology(self.state)) {
        self.state.views.topology = new ViewTopology({
          documentReference: self.document,
          windowReference: self.window,
          state: self.state
        });
      } else {
        View.removeExistElement("topology", self.document);
      }
      // Change restoration.
      self.state.viewsRestoration.topology = false;
    }
  }




  // TODO: Mange exploration, progress, and topology views here...

  // Methods to evaluate application's state.

  /**
  * Determines whether the application's state has specific information.
  * @param {Object} state Application's state.
  * @returns {boolean} Whether the application's state matches criteria.
  */
  static determineApplicationControls(state) {
    if (false) {
      state.variablesNamesControls.forEach(function (variable) {
        if (state[variable] === null) {
          console.log("problem with state's variable, " + variable);
        }
      });
    }
    return state.variablesNamesControls.every(function (variable) {
      return !(state[variable] === null);
    });
  }
  /**
  * Determines whether the application's state has specific information.
  * @param {Object} state Application's state.
  * @returns {boolean} Whether the application's state matches criteria.
  */
  static determineMetabolismBaseInformation(state) {
    return (
      !(state.compartments === null) &&
      !(state.processes === null) &&
      !(state.metabolites === null) &&
      !(state.reactions === null)
    );
  }
  /**
  * Determines whether the application's state has specific information.
  * @param {Object} state Application's state.
  * @returns {boolean} Whether the application's state matches criteria.
  */
  static determineMetabolismSupplementInformation(state) {
    return !(state.defaultSimplificationsMetabolites === null);
  }
  /**
  * Determines whether the application's state has specific information.
  * @param {Object} state Application's state.
  * @returns {boolean} Whether the application's state matches criteria.
  */
  static determineMetabolismDerivationInformation(state) {
    return (
      !(state.totalSetsReactions === null) &&
      !(state.totalSetsMetabolites === null) &&
      !(state.accessSetsReactions === null) &&
      !(state.accessSetsMetabolites === null) &&
      !(state.filterSetsReactions === null) &&
      !(state.filterSetsMetabolites === null) &&
      !(state.setsCardinalities === null) &&
      !(state.setsSummaries === null) &&
      !(state.reactionsSimplifications === null) &&
      !(state.metabolitesSimplifications === null) &&
      !(state.candidatesReactions === null) &&
      !(state.candidatesMetabolites === null) &&
      !(state.candidatesSummaries === null) &&
      !(state.networkNodesReactions === null) &&
      !(state.networkNodesMetabolites === null) &&
      !(state.networkLinks === null) &&
      !(state.networkNodesRecords === null) &&
      !(state.networkLinksRecords === null) &&
      !(state.networkSummary === null) &&
      !(state.subnetworkNodesRecords === null) &&
      !(state.subnetworkLinksRecords === null) &&
      !(state.subnetworkSummary === null)
    );
  }
  /**
  * Determines whether the application's state has specific information.
  * @param {Object} state Application's state.
  * @returns {boolean} Whether the application's state matches criteria.
  */
  static determineSourceState(state) {
    return (Boolean(state.sourceState.name));
  }
  /**
  * Determines whether the application's state has specific information.
  * @param {Object} state Application's state.
  * @returns {boolean} Whether the application's state matches criteria.
  */
  static determineSourceData(state) {
    return (Boolean(state.sourceData.name));
  }
  /**
  * Determines tabs within control view.
  * @param {Object} state Application's state.
  * @returns {Array<string>} Names of tabs.
  */
  static determineControlTabs(state) {
    return Object.keys(state.controlViews);
  }
  /**
  * Determines tabs within network view.
  * @param {Object} state Application's state.
  * @returns {Array<string>} Names of tabs.
  */
  static determineNetworkTabs(state) {
    return Object.keys(state.networkViews);
  }
  /**
  * Determines tabs within network view.
  * @param {Object} state Application's state.
  * @returns {Array<string>} Names of tabs.
  */
  static determineSubnetworkTabs(state) {
    return Object.keys(state.subnetworkViews);
  }
  /**
  * Determines whether the application's state has specific information.
  * @param {Object} state Application's state.
  * @returns {boolean} Whether the application's state matches criteria.
  */
  static determineControlState(state) {
    return state.controlViews.state;
  }
  /**
  * Determines whether the application's state has specific information.
  * @param {Object} state Application's state.
  * @returns {boolean} Whether the application's state matches criteria.
  */
  static determineControlNetwork(state) {
    return state.controlViews.network;
  }
  /**
  * Determines whether the application's state has specific information.
  * @param {Object} state Application's state.
  * @returns {boolean} Whether the application's state matches criteria.
  */
  static determineNetworkFilter(state) {
    return state.networkViews.filter;
  }
  /**
  * Determines whether the application's state has specific information.
  * @param {Object} state Application's state.
  * @returns {boolean} Whether the application's state matches criteria.
  */
  static determineNetworkContext(state) {
    return state.networkViews.context;
  }
  /**
  * Determines whether the application's state has specific information.
  * @param {Object} state Application's state.
  * @returns {boolean} Whether the application's state matches criteria.
  */
  static determineControlSubnetwork(state) {
    return state.controlViews.subnetwork;
  }
  /**
  * Determines whether the application's state has specific information.
  * @param {Object} state Application's state.
  * @returns {boolean} Whether the application's state matches criteria.
  */
  static determineSubnetworkQuery(state) {
    return state.subnetworkViews.query;
  }
  /**
  * Determines whether the application's state has specific information.
  * @param {Object} state Application's state.
  * @returns {boolean} Whether the application's state matches criteria.
  */
  static determineControlMeasurement(state) {
    return state.controlViews.measurement;
  }
  /**
  * Determines whether the application's state has specific information.
  * @param {Object} state Application's state.
  * @returns {boolean} Whether the application's state matches criteria.
  */
  static determineExplorationNotice(state) {
    return !Model.determineNetworkDiagram(state);
  }
  /**
  * Determines whether the application's state has specific information.
  * @param {Object} state Application's state.
  * @returns {boolean} Whether the application's state matches criteria.
  */
  static determineExplorationProgress(state) {
    return (
      Model.determineNetworkDiagram(state) &&
      !Model.determineSimulationPreparation(state)
    );
  }
  /**
  * Determines whether the application's state has specific information.
  * @param {Object} state Application's state.
  * @returns {boolean} Whether the application's state matches criteria.
  */
  static determineExplorationTopology(state) {
    return (
      Model.determineNetworkDiagram(state) &&
      Model.determineSimulationPreparation(state)
    );
  }





  // TODO: introduce methods to determine exploration views




  /**
  * Determines whether the application's state has specific information.
  * @param {Object} state Application's state.
  * @returns {boolean} Whether the application's state matches criteria.
  */
  static determineMetabolitesMeasurements(state) {
    return Object.keys(state.metabolitesMeasurements).length > 0;
  }
  /**
  * Determines whether the application's state has specific information.
  * @param {Object} state Application's state.
  * @returns {boolean} Whether the application's state matches criteria.
  */
  static determineRogueQuery(state) {
    return (state.queryRogueFocus.identifier.length > 0);
  }
  /**
  * Determines whether the application's state has specific information.
  * @param {Object} state Application's state.
  * @returns {boolean} Whether the application's state matches criteria.
  */
  static determineProximityQuery(state) {
    return (
      (state.queryProximityFocus.identifier.length > 0) &&
      (
        (state.queryProximityDirection === "successors") ||
        (state.queryProximityDirection === "neighbors") ||
        (state.queryProximityDirection === "predecessors")
      ) &&
      (state.queryProximityDepth > 0)
    );
  }
  /**
  * Determines whether the application's state has specific information.
  * @param {Object} state Application's state.
  * @returns {boolean} Whether the application's state matches criteria.
  */
  static determinePathQuery(state) {
    return (
      (state.queryPathSource.identifier.length > 0) &&
      (state.queryPathTarget.identifier.length > 0) &&
      (
        (state.queryPathDirection === "forward") ||
        (state.queryPathDirection === "reverse") ||
        (state.queryPathDirection === "both")
      ) &&
      (state.queryPathCount > 0)
    );
  }
  /**
  * Determines whether the application's state has specific information.
  * @param {Object} state Application's state.
  * @returns {boolean} Whether the application's state matches criteria.
  */
  static determineConnectionQuery(state) {
    return (
      (
        (state.queryCombination === "inclusion") ||
        (state.queryCombination === "exclusion")
      ) &&
      (state.queryConnectionTargets.length > 1) &&
      (state.queryConnectionCount > 0)
    );
  }

  // TODO: is "determineNetworkDiagram" still necessary?


  /**
  * Determines whether the application's state has specific information.
  * @param {Object} state Application's state.
  * @returns {boolean} Whether the application's state matches criteria.
  */
  static determineNetworkDiagram(state) {
    return (
      Model.determineSubnetworkNodesMinimum(state) &&
      (
        Model.determineSubnetworkNodesMaximum(state) ||
        Model.determineForceNetworkDiagram(state)
      )
    );
  }
  /**
  * Determines whether the application's state has specific information.
  * @param {Object} state Application's state.
  * @returns {boolean} Whether the application's state matches criteria.
  */
  static determineSubnetworkNodesMinimum(state) {
    return (state.subnetworkNodesRecords.length > 0);
  }
  /**
  * Determines whether the application's state has specific information.
  * @param {Object} state Application's state.
  * @returns {boolean} Whether the application's state matches criteria.
  */
  static determineSubnetworkNodesMaximum(state) {
    return (state.subnetworkNodesRecords.length < 500);
  }
  /**
  * Determines whether the application's state has specific information.
  * @param {Object} state Application's state.
  * @returns {boolean} Whether the application's state matches criteria.
  */
  static determineForceNetworkDiagram(state) {
    return (state.forceNetworkDiagram);
  }
  /**
  * Determines whether the application's state has specific information.
  * @param {Object} state Application's state.
  * @returns {boolean} Whether the application's state matches criteria.
  */
  static determineSimulationPreparation(state) {
    return (
      state.simulationProgress.count > state.simulationProgress.preparation
    );
  }
  /**
  * Determines whether the application's state has specific information.
  * @param {Object} state Application's state.
  * @returns {boolean} Whether the application's state matches criteria.
  */
  static determineSimulationCompletion(state) {
    return (state.simulationProgress.completion);
  }
  /**
  * Determines whether the application's state has specific information.
  * @param {Object} state Application's state.
  * @returns {boolean} Whether the application's state matches criteria.
  */
  static determineEntitySelection(state) {
    return (
      (state.entitySelection.type.length > 0) &&
      (state.entitySelection.node.length > 0) &&
      (state.entitySelection.candidate.length > 0) &&
      (state.entitySelection.entity.length > 0)
    );
  }
  /**
  * Determines whether the application's state has specific information.
  * @param {Object} parameters Destructured object of parameters.
  * @param {number} parameters.length Length factor in pixels.
  * @param {number} parameters.width Width of container in pixels.
  * @param {number} parameters.height Height of container in pixels.
  * @param {Object} parameters.state Application's state.
  * @returns {boolean} Whether the node's entity has a selection.
  */
  static determineViewSimulationDimensions({length, width, height, state} = {}) {
    return (
      (length === state.simulationDimensions.length) &&
      (width === state.simulationDimensions.width) &&
      (height === state.simulationDimensions.height)
    );
  }
  /**
  * Determines whether the application's state has specific information.
  * @param {Object} parameters Destructured object of parameters.
  * @param {string} parameters.identifier Identifier of a node.
  * @param {string} parameters.type Type of entity, metabolite or reaction.
  * @param {Object} parameters.state Application's state.
  * @returns {boolean} Whether the node's entity has a selection.
  */
  static determineNodeEntitySelection({identifier, type, state} = {}) {
    return (
      (type === state.entitySelection.type) &&
      (identifier === state.entitySelection.node)
    );
  }
}
