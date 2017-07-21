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
        // Control representation of the state of the model.
        this.represent();
        // Control action on the state of the model.
        this.act();
    }
    /**
     * Evaluates the context of the application's state and creates an
     * appropriate representation in a visual interface.
     */
    represent() {
        // If model does not have records of metabolic entities and sets, then
        // create source interface.
        if (!this.determineMetabolicEntitiesSets()) {
            // Initialize instance of source interface.
            // Pass this instance a reference to the model.
            new SourceView(this.model);

            // Load from file a default persistent state of the application.
            // The intent is for this action to be temporary during development.
            //var path = "../model/homo-sapiens/model_sets_network.json";
            //Action.loadDefaultState(path, this.model);
        }
        // TODO: Get rid of the source view after extraction... then the view
        // TODO: should be blank or something until all state attributes are available for set and entity views.
        // If application's model has appropriate information then create state
        // interface, set interface, and entity interface.
        if (
            this.determineMetabolicEntitiesSets() &&
            this.determineEntitiesAttributes() &&
            this.determineSets()
        ) {
            // Initialize instance of state interface.
            // Pass this instance a reference to the model.
            new StateView(this.model);
            // Initialize instance of set interface.
            // Pass this instance a reference to the model.
            new SetView(this.model);
            // Initialize instance of entity interface.
            // Pass this instance a reference to the model.

        }
    }
    /**
     * Evaluates the context of the application's state and executes automatic
     * actions as appropriate.
     */
    act() {}
    // Methods to evaluate state of application.
    /**
     * Determines whether or not the application's model has information about
     * metabolic entities and sets.
     */
    determineMetabolicEntitiesSets() {
        return (
            this.model.metabolites &&
            this.model.reactions &&
            this.model.compartments &&
            this.model.genes &&
            this.model.processes
        );
    }
    /**
     * Determines whether or not the application's model has information about
     * values of attributes of metabolic entities.
     */
    determineEntitiesAttributes() {
        return (
            this.model.allEntitiesAttributes &&
            this.model.currentEntitiesAttributes
        );
    }
    /**
     * Determines whether or not the application's model has information about
     * the interface for sets of metabolic entities.
     */
    determineSets() {
        return (
            this.model.setViewAttributesSelections &&
            this.model.setViewValuesSelections &&
            this.model.setViewEntity &&
            this.model.setViewFilter &&
            this.model.setsCardinalities &&
            this.model.setsSummary
        );
    }
}