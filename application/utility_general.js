/**
* Functionality of general utility.
* This class does not store any attributes and does not require instantiation.
* This class stores methods for external utility.
*/
class General {
  /**
  * Accesses a file at a specific path on client's system.
  * @param {string} path Directory path and file name.
  * @returns {Object} File at path on client's system.
  */
  static accessFileByPath(path) {
    return File.createFromFileName(path);
  }
  /**
  * Loads from file a version of an object in JavaScript Object Notation
  * (JSON) and passes this object to another function along with appropriate
  * parameters.
  * @param {Object} parameters Destructured object of parameters.
  * @param {Object} parameters.file File with object to load.
  * @param {Object} parameters.call Function to call upon completion of file
  * read.
  * @param {Object} parameters.parameters Parameters for the function to call
  * upon completion of file read.
  */
  static loadPassObject({file, call, parameters} = {}) {
    // Create a file reader object.
    var reader = new FileReader();
    // Specify operation to perform after file loads.
    reader.onload = function (event) {
      // Element on which the event originated is event.currentTarget.
      // After load, the file reader's result attribute contains the
      // file's contents, according to the read method.
      var data = JSON.parse(event.currentTarget.result);
      // Include the data in the parameters to pass to the call function.
      var dataParameter = {data: data};
      var newParameters = Object.assign({}, parameters, dataParameter);
      // Call function with new parameters.
      call(newParameters);
    };
    // Read file as text.
    reader.readAsText(file);
  }
  /**
  * Saves to file on client's system a version of an object in JavaScript
  * Object Notation (JSON).
  * @param {string} name Name of file.
  * @param {Object} object Object in memory to save.
  */
  static saveObject(name, object) {
    var objectJSON = JSON.stringify(object);
    var blob = new Blob([objectJSON], {type: "application/json"});
    var url = URL.createObjectURL(blob);
    var reference = document.createElement("a");
    reference.setAttribute("href", url);
    reference.setAttribute("download", name);
    document.body.appendChild(reference);
    reference.click();
    document.body.removeChild(reference);
  }
  /**
  * Removes from the Document Object Model (DOM) elements that do not have
  * specific values of a specific attribute.
  * @param {Object} parameters Destructured object of parameters.
  * @param {Array<string>} parameters.values Values of the attribute.
  * @param {string} parameters.attribute Attribute of interest.
  * @param {Object} parameters.elements Elements in the Document Object
  * Model (DOM).
  */
  static filterRemoveDocumentElements({values, attribute, elements} = {}) {
    Array.from(elements).forEach(function (element) {
      if (
        (!element.hasAttribute(attribute)) ||
        (!values.includes(element.getAttribute(attribute)))
      ) {
        element.parentElement.removeChild(element);
      }
    });
  }
  /**
  * Removes from the Document Object Model (DOM) all elements that are
  * children of a specific element.
  * @param {Object} element Element in the Document Object Model.
  */
  static removeDocumentChildren(element) {
    Array.from(element.children).forEach(function (child) {
      element.removeChild(child);
    });
  }

  /**
  * Extracts from nodes' records coordinates for positions from force
  * simulation.
  * @param {Array<Object>} nodes Records for nodes with positions from force
  * simulation.
  * @returns {Array<Object<number>>} Coordinates for nodes' positions.
  */
  static extractNodesCoordinates(nodes) {
    return nodes.map(function (node) {
      return General.extractNodeCoordinates(node);
    });
  }
  /**
  * Extracts from a node's record coordinates for position from force
  * simulation.
  * @param {Object} node Record for a node with position from force simulation.
  * @returns {Object<number>} Coordinates for node's position.
  */
  static extractNodeCoordinates(node) {
    return {
      x: node.x,
      y: node.y
    };
  }
  /**
  * Converts and normalizes coordinates of radial points relative to a central
  * origin.
  * @param {Object} parameters Destructured object of parameters.
  * @param {Array<Object<number>>} parameters.pointsCoordinates Records of
  * coordinates for points around a central origin.
  * @param {Object<number>} parameters.originCoordinates Record of coordinates
  * for a central origin.
  * @param {number} parameters.graphHeight Vertical dimension of graphical
  * container.
  * @returns {Array<Object>} Records of coordinates for points around a central
  * origin.
  */
  static convertNormalizeRadialCoordinates({
    pointsCoordinates, originCoordinates, graphHeight
  } = {}) {
    // Convert and normalize points' coordinates.
    return pointsCoordinates.map(function (pointCoordinates) {
      // Convert coordinates relative to origin on standard coordinate plane.
      var standardCoordinates = General.convertGraphCoordinates({
        pointX: pointCoordinates.x,
        pointY: pointCoordinates.y,
        originX: originCoordinates.x,
        originY: originCoordinates.y,
        height: graphHeight
      });
      // Compute measurement in radians of the positive angle in standard
      // position for the ray to the point.
      var angle = General.computeCoordinatesPositiveAngleRadians({
        x: standardCoordinates.x,
        y: standardCoordinates.y
      });
      // Compute coordinates of point at which a ray for the angle intersects
      // the unit circle at a radius of 1 unit from the origin.
      var normalCoordinates = General.computeAngleUnitIntersection(angle);
      // Return coordinates.
      return {
        x: normalCoordinates.x,
        y: normalCoordinates.y
      };
    });
  }
  /**
  * Converts the coordinates of a point within a scalable vector graph.
  * @param {Object} parameters Destructured object of parameters.
  * @param {number} parameters.pointX Point's coordinate on x-axis or abscissa.
  * @param {number} parameters.pointY Point's coordinate on y-axis or ordinate.
  * @param {number} parameters.originX Origin's coordinate on x-axis or
  * abscissa.
  * @param {number} parameters.originY Origin's coordinate on y-axis or
  * ordinate.
  * @param {number} parameters.height Height in pixels of scalable vector graph.
  * @returns {Object<number>} Coordinates of point.
  */
  static convertGraphCoordinates({
    pointX, pointY, originX, originY, height
  } = {}) {
    // The coordinates of scalable vector graphs originate at the top left
    // corner.
    // Coordinates of the x-axis or abscissa increase towards the right.
    // Coordinates of the y-axis or ordinate increase towards the bottom.
    // Invert the coordinates of the y-axis or ordinate.
    var pointYFlip = height - pointY;
    var originYFlip = height - originY;
    // Shift the point's coordinates relative to the new origin.
    var pointXShift = pointX - originX;
    var pointYShift = pointYFlip - originYFlip;
    // Return coordinates.
    return {
      x: pointXShift,
      y: pointYShift
    };
  }
  /**
  * Computes measurement in radians of the positive angle in standard position
  * with vertex at origin of coordinate plane, initial side on positive x-axis,
  * and terminal side to some point with specific coordinates.
  * @param {Object} parameters Destructured object of parameters.
  * @param {number} parameters.x Point's coordinate on x-axis or abscissa.
  * @param {number} parameters.y Point's coordinate on y-axis or ordinate.
  * @returns {number} Measurement of positive angle in radians.
  */
  static computeCoordinatesPositiveAngleRadians({x, y} = {}) {
    // Compute measurement in radians of the angle.
    // By default, angle with terminal side in quadrants 1 or 2 of coordinate
    // plane is positive.
    // By default, angle with terminal side in quadrants 3 or 4 of coordinate
    // plane is negative.
    var result = Math.atan2(y, x);
    // Determine if angle is positive or negative.
    if (result > 0) {
      // Angle is positive.
      var positiveResult = result;
    } else {
      // Angle is negative.
      // Convert negative angle to positive angle.
      var positiveResult = (2 * Math.PI) - result;
    }
    // Return measurement in radians of positive angle.
    return positiveResult;
  }
  /**
  * Converts an angle's measurement in radians to degrees.
  * @param {number} radians An angle's measurement in radians.
  * @returns {number} Angle's measurement in degrees.
  */
  static convertAngleRadiansDegrees(radians) {
    return radians * (180 / Math.PI);
  }
  /**
  * Computes coordinates of point at which an angle's terminal side intersects
  * the unit circle at a radius of 1 unit from the origin.
  * @param {number} angle Measurement of positive angle in radians.
  * @returns {Object<number>} Coordinates of point.
  */
  static computeAngleUnitIntersection(angle) {
    // Unit circle has a radius of 1 unit.
    // Hypotenuse of right triangle relevant to coordinates of any point on unit
    // circle has length of 1 unit.
    // Cosine of angle (adjacent/hypotenuse) is equal to the coordinate on
    // x-axis or abscissa of the point at which angle's terminal side intersects
    // unit circle.
    // Sine of angle (opposite/hypotenuse) is equal to the coordinate on y-axis
    // or ordinate of the point at which angle's terminal side intersects unit
    // circle.
    // Compute coordinates of the point at which angle's terminal side
    // intersects unit circle.
    var pointX = Math.cos(angle);
    var pointY = Math.sin(angle);
    // Return coordinates.
    return {
      x: pointX,
      y: pointY
    };
  }


  /**
  * Computes the sum of elements in an array.
  * @param {Array<number>} elements Array of elements.
  * @returns {number} Sum of elements.
  */
  static computeElementsSum(elements) {
    return elements.reduce(function (sum, value) {
      return sum + value;
    }, 0);
  }
  /**
  * Computes the mean of elements in an array.
  * @param {Array<number>} elements Array of elements.
  * @returns {number} Arithmetic mean of elements.
  */
  static computeElementsMean(elements) {
    var sum = General.computeElementsSum(elements);
    return sum / elements.length;
  }
  /**
  * Creates points for the source, center, and target vertices of a straight
  * polyline.
  * @param {Object} parameters Destructured object of parameters.
  * @param {Object<number>} parameters.source Records of coordinates for point
  * at source.
  * @param {Object<number>} parameters.target Record of coordinates for point at
  * target.
  * @returns {string} Definitions of points for a straight polyline.
  */
  static createStraightPolylinePoints({source, target} = {}) {
    var center = {
      x: General.computeElementsMean([source.x, target.x]),
      y: General.computeElementsMean([source.y, target.y])
    };
    return General.createPointsString([source, center, target]);
  }
  /**
  * Creates points for vertices of a horizontal, isosceles triangle.
  * @param {Object} parameters Destructured object of parameters.
  * @param {number} parameters.base Dimension of triangle's base.
  * @param {number} parameters.altitude Dimension of triangle's altitude.
  * @param {string} parameters.direction Direction, right or left, in which the
  * horizontal triangle's apex faces.
  * @returns {string} Definitions of points for an horizontal, isosceles
  * triangle.
  */
  static createHorizontalIsoscelesTrianglePoints({
    base, altitude, direction
  } = {}) {
    // The coordinates of scalable vector graphs originate at the top left
    // corner.
    // Coordinates of the x-axis or abscissa increase towards the right.
    // Coordinates of the y-axis or ordinate increase towards the bottom.
    // Determine direction in which triangle's apex faces.
    if (direction === "right") {
      // Triangle's apex faces right.
      // Determine coordinates of triangle's vertices.
      var vertex1 = {
        x: 0,
        y: 0
      };
      var vertex2 = {
        x: altitude,
        y: (base / 2)
      };
      var vertex3 = {
        x: 0,
        y: base
      };
    } else if (direction === "left") {
      // Triangle's apex faces left.
      // Determine coordinates of triangle's vertices.
      var vertex1 = {
        x: altitude,
        y: 0
      };
      var vertex2 = {
        x: altitude,
        y: base
      };
      var vertex3 = {
        x: 0,
        y: (base / 2)
      };
    }
    return General.createPointsString([vertex1, vertex2, vertex3]);
  }
  /**
  * Creates string for graphical points from coordinates of vertices.
  * @param {Array<Object<number>>} points Records of coordinates for points of
  * vertices.
  * @returns {string} Definition of point.
  */
  static createPointsString(points) {
    return points.reduce(function (string, point) {
      if (string.length > 0) {
        // String is not empty.
        // String contains previous points.
        // Include delimiter between previous points and current point.
        var delimiter = " ";
      } else {
        // String is empty.
        // String does not contain previous points.
        // Do not include delimiter.
        var delimiter = "";
      }
      // Compose previous and current points.
      return (string + delimiter + point.x + "," + point.y);
    }, "");
  }

  /**
  * Collects unique elements.
  * @param {Array} elements Array of elements.
  * @returns {Array} Unique elements.
  */
  static collectUniqueElements(elements) {
    // Collect and return unique elements.
    return elements.reduce(function (accumulator, element) {
      if (!accumulator.includes(element)) {
        // Method concat does not modify the original array.
        // Method concat returns a new array.
        // It is necessary to store this new array or return it
        // directly.
        return accumulator.concat(element);
      } else {
        return accumulator;
      }
    }, []);
  }
  /**
  * Collects unique arrays by inclusion of their elements.
  * @param {Array<Array>} arrays Array of arrays.
  * @returns {Array<Array>} Unique arrays.
  */
  static collectUniqueArraysByInclusion(arrays) {
    // Collect and return unique arrays.
    return arrays.reduce(function (collectionArrays, array) {
      // Determine whether the collection includes an array with the same
      // elements as the current array.
      var match = collectionArrays.some(function (collectionArray) {
        return General.compareArraysByMutualInclusion(array, collectionArray);
      });
      if (match) {
        // The collection includes an array with the same elements as the
        // current array.
        // Preserve the collection.
        return collectionArrays;
      } else {
        // The collection does not include an array with the same elements as
        // the current array.
        // Include the current array in the collection.
        // TODO: Using Array.concat() flattens the arrays into a single array...
        return collectionArrays.concat([array]);
      }
    }, []);
  }
  /**
  * Replaces all instances of a substring in a string.
  * @param {string} currentString The string that contains the substring for
  * replacement.
  * @param {string} target The substring for replacement.
  * @param {string} replacement The substring to substitute in place of the
  * substring for replacement.
  * @returns {string} New string after replacement of all instances.
  */
  static replaceAllString(currentString, target, replacement) {
    if (currentString.includes(target)) {
      var newString = currentString.replace(target, replacement);
      return General.replaceAllString(newString, target, replacement);
    } else {
      return currentString;
    }
  }
  /**
  * Collects a single value for an identical key from multiple objects.
  * @param {string} key Common key for all objects.
  * @param {Array<Object>} objects Array of objects.
  * @returns {Array} Values for the key from all objects.
  */
  static collectValueFromObjects(key, objects) {
    return objects.map(function (object) {
      return object[key];
    });
  }
  /**
  * Collects multiple values from arrays for identical keys from multiple
  * objects.
  * @param {string} key Common key for all objects.
  * @param {Array<Object>} objects Array of objects.
  * @returns {Array} Values for the key from all objects.
  */
  static collectValuesFromObjects(key, objects) {
    return objects.reduce(function (collection, object) {
      return [].concat(collection, object[key]);
    }, []);
  }
  /**
  * Compares two arrays by inclusion of elements.
  * @param {Array} firstArray Array of elements.
  * @param {Array} secondArray Array of elements.
  * @returns {boolean} Whether or not the first array includes all values of
  * the second array.
  */
  static compareArraysByInclusion(firstArray, secondArray) {
    return secondArray.every(function (element) {
      return firstArray.includes(element);
    });
  }
  /**
  * Compares two arrays by mutual inclusion of elements, such that each array
  * includes every element of the other array.
  * @param {Array} firstArray Array of elements.
  * @param {Array} secondArray Array of elements.
  * @returns {boolean} Whether the first and second arrays include each
  * other's elements mutually.
  */
  static compareArraysByMutualInclusion(firstArray, secondArray) {
    return (
      General.compareArraysByInclusion(firstArray, secondArray) &&
      General.compareArraysByInclusion(secondArray, firstArray)
    );
  }
  /**
  * Compares two arrays by values of elements at specific indices.
  * @param {Array} firstArray Array of elements.
  * @param {Array} secondArray Array of elements.
  * @returns {boolean} Whether or not the arrays have identical values at
  * every index.
  */
  static compareArraysByValuesIndices(firstArray, secondArray) {
    return firstArray.every(function (element, index) {
      return element === secondArray[index];
    });
  }
  /**
  * Checks objects elements for replicates by identifier.
  * @param {Array<Object<string>>} elements Objects elements with identifiers.
  * @returns {Array<Object<string>>} Object elements that have replicates.
  */
  static checkReplicateElements(elements) {
    // A more efficient algorithm would increment counts for each element
    // and then only return elements with counts greater than one.
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
  /**
  * Copies an array, shallowly, with omission of a specific count of elements
  * from a specific index.
  * @param {Object} parameters Destructured object of parameters.
  * @param {Array} parameters.array Array to copy.
  * @param {number} parameters.index Index at which to begin omission.
  * @param {number} parameters.count Count of elements to omit.
  * @returns {Array} Shallow copy of array with omissions.
  */
  static copyArrayOmitElements({array, index, count} = {}) {
    var before = array.slice(0, index);
    var after = array.slice(index + count);
    return [].concat(before, after);
  }
  /**
  * Sorts elements in arrray by order of characters' codes.
  * @param {Array<string>} array Array of elements to sort.
  * @returns {Array<string>} Shallow copy of array in sort order.
  */
  static sortArrayElementsByCharacter(array) {
    return array.slice().sort(function (firstElement, secondElement) {
      // Convert values to lower case for comparison.
      var firstValue = firstElement.toLowerCase();
      var secondValue = secondElement.toLowerCase();
      // Compare values by alphabetical order.
      if (firstValue < secondValue) {
        // Place first element before second element.
        return -1;
      } else if (firstValue > secondValue) {
        // Place first element after second element.
        return 1;
      } else {
        // Preserve current relative placements of elements.
        return 0;
      }
    });
  }



  /**
  * Determines the value of the only active radio button in a group.
  * @param {Object} radios Live collection of radio button elements in the
  * Document Object Model (DOM).
  * @returns {string} Value of the only active radio button from the group.
  */
  static determineRadioGroupValue(radios) {
    // Assume that only a single radio button in the group is active.
    return Array.from(radios).filter(function (radio) {
      return radio.checked;
    })[0].value;
  }

  /**
  * Extracts information about entities and sets from a custom assembly for a
  * model of metabolism and organizes these as new attributes to submit to
  * the application model.
  * @param {Object} assembly Information about entities and sets for a model
  * of metabolism.
  * @returns {Array<Object>} New attributes representing entities and sets
  * for a model of metabolism.
  */
  static extractAssemblyEntitiesSets(assembly) {
    // Extract attributes from assembly.
    var metabolites = {
      attribute: "metabolites",
      value: assembly.entities.metabolites
    };
    var reactions = {
      attribute: "reactions",
      value: assembly.entities.reactions
    };
    var compartments = {
      attribute: "compartments",
      value: assembly.sets.compartments
    };
    var genes = {
      attribute: "genes",
      value: assembly.sets.genes
    };
    var processes = {
      attribute: "processes",
      value: assembly.sets.processes
    };
    return [].concat(
      metabolites, reactions, compartments, genes, processes
    );
  }

}
