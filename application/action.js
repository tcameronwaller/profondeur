/**
 * Actions that modify the state of the application.
 * This class does not store any attributes and does not require instantiation.
 * This class stores methods that control all actions that modify the model for
 * the state of the application. The methods require a reference to the instance
 * of the model. These methods also call external methods as necessary.
 */
class Action {
    /**
     * Initiates the application.
     * @param {Object} model Model of the comprehensive state of the
     * application.
     */
    static initiateApplication(model) {
        // TODO: Instead, I wonder if I should initialize all of the attributes
        // TODO: of the model here...
        model.restore([]);
    }
    /**
     * Loads default assembly file.
     * @param {string} path Directory path and file name.
     * @param {Object} model Model of the comprehensive state of the
     * application.
     */
    static loadDefaultAssemblyFile(path, model) {
        // Load data for assembly from file.
        var assembly = General.loadFileByPath(path);
        // Extract attributes from assembly.
        var newAttributes = General.extractAssemblyEntitiesSets(assembly);
        // Pass attributes from assembly to model.
        model.restore(newAttributes);
    }

}
