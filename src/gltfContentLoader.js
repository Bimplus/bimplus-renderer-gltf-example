import * as Renderer from "bimplus-renderer";

export default class GltfContentLoader extends Renderer.ContentLoader {
  constructor(viewport, project, model, layer, nodeId) {
    super(viewport);

    this._project = project;
    this._model = model;
    this._layer = layer;
    this._nodeId = nodeId;
  }

  _createInterleaveArray(arrayOne, arrayTwo) {
    let interleaveArray = new Float32Array(arrayOne.length + arrayTwo.length);

    for (let i = 0; i < arrayOne.length / 3; i++) {
      let offset = i * 3;
      let interleaveOffset = i * 6;
      // positions
      interleaveArray[interleaveOffset] = arrayOne[offset];
      interleaveArray[interleaveOffset + 1] = arrayOne[offset + 1];
      interleaveArray[interleaveOffset + 2] = arrayOne[offset + 2];
      // normals
      interleaveArray[interleaveOffset + 3] = arrayTwo[offset];
      interleaveArray[interleaveOffset + 4] = arrayTwo[offset + 1];
      interleaveArray[interleaveOffset + 5] = arrayTwo[offset + 2];
    }
    return interleaveArray;
  }

  _createInterleaveIndArray(array) {
    let indArray = new Uint16Array(array.length);

    for (let k = 0; k < array.length * 3; k++) {
      let ind = array[k];
      let interleaveInd = Math.floor(ind / 6) * 6 + (ind % 6);
      indArray[k] = interleaveInd;
    }

    return indArray;
  }

  collectObjectGeometries(scene, objectGeometries) {
    let objectFactory = new Renderer.ObjectFactory();
    for (let mesh of scene.children) {

      console.debug("Mesh name: ", mesh.name);
      // mesh.scale.set(1000, 1000, 1000);
      // mesh.updateMatrixWorld(true); // Update world matrix (and force update children)

      /// Create visualObjects
      let visualObj = objectFactory.createVisualObject({
        id: mesh.uuid,
        model: this._model.id,
        node: this._nodeId,
        name: mesh.name,
        revision: 1,
        discipline: this._layer.id,
        groupBoundary: true,
      });

      /// Create interleave array with positions and normals
      let posArray = mesh.geometry.attributes.position.array;
      let normArray = mesh.geometry.attributes.normal.array;
      let posNormArray = this._createInterleaveArray(posArray, normArray);

      /// Create index array that corresponds to interleave array
      let indArray = mesh.geometry.index.array;
      let interleaveIndArray = this._createInterleaveIndArray(indArray);

      /// Create Geometries Array
      let color = {
        x: mesh.material.color.r,
        y: mesh.material.color.g,
        z: mesh.material.color.b,
        w: 1.0,
      };

      let objectGeometry = {
        geometries: [
          {
            vertices: posNormArray,
            indices: interleaveIndArray,
            opaque: true,
            matrix: mesh.matrixWorld.elements,
            color: color,
          },
        ],
        object: visualObj,
      };

      objectGeometries.push(objectGeometry);

      let objectsContainer = this._project.getObjectsContainer();
      if (objectsContainer.addObject(visualObj) === false) {
        console.error(
          `Failed to add object with gltfid ${visualObj} to objects container`
        );
      }
    }
    return objectGeometries;
  }

  createModelLayers(model, layers) {
    let layersVisible = false;
    this._createModelLayers(model, layers, layersVisible);
  }

  loadModelGeometry(model, objectGeometries) {
    this._loadModelGeometry(model, objectGeometries);
  }
}
