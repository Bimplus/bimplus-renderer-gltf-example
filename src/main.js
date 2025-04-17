import $ from "jquery";
window.$ = $; // Ensures global access if needed

import * as Renderer from "bimplus-renderer";
import { GLTFLoader } from "threegltf";
import { GridHelper } from "three";
import GltfContentLoader from "./gltfContentLoader";

import "./BimplusRendererExample.css";

import "material-design-lite/material.min.js";
import "material-design-lite/material.min.css";
import "material-design-lite/dist/material.grey-orange.min.css";

let loader = new GLTFLoader();

let viewport3D = null;
let viewer = null;

let createViewport = () => {
  // Basic settings for the renderer viewport
  let settings = {
    defaultOpacity: 0.5,
    disciplineOpacity: 0.1,
    pinSizeScaleFactor: 2,
    maxWebGLBufferSize: 350e12,
    mixedModelMode: true,
    pinFlyToDistance: 20000,
    nearClippingPlane: 0.01,

    slideThmbSize: [180, 112],

    // Enable usage of frame selecton
    //   BlueBlue:    (LEFT  MOUSE BUTTON) + SHIFT key
    //   GreenGreen:  (LEFT  MOUSE BUTTON) + CTRL key
    //                (RIGHT MOUSE BUTTON) + CTRL key
    useFrameSelection: true,
  };

  let units = {
    weight: {
      multiplicator: 0.001,
      unit: "kg",
    },
    length: {
      multiplicator: 0.001,
      unit: "m",
    },
    width: {
      multiplicator: 0.001,
      unit: "m",
    },
    height: {
      multiplicator: 0.001,
      unit: "m",
    },
    area: {
      multiplicator: 0.000001,
      unit: "m²",
    },
    volume: {
      multiplicator: 1e-9,
      unit: "m³",
    },
  };

  // Create a viewport inside the given dom element
  return new Renderer.Viewport3D({
    settings: settings,
    units: units,
    domElementId: "mainViewportContainer",
    name: "mainRendererViewport",
    GPUPick: true,
  });
};

// ===============================================================
// Set camera position
// ===============================================================

// Reset the current view and camera state
let resetView = function () {
  viewport3D.resetSelectionMode();
  viewport3D.restoreViewbox();
  viewport3D.setRotationCenter(null);
};

// Set camera to front view
let frontView = function () {
  viewport3D.setCameraResetAxis("x");
};

// Set camera to top view
let topView = function () {
  viewport3D.setCameraResetAxis("y");
};

// Set camera to side view
let sideView = function () {
  viewport3D.setCameraResetAxis("z");
};

// Set camera to pespective view
let pespectiveView = function () {
  viewport3D.setCameraResetAxis("xyz");
};

// ===============================================================
// Set object isolation
// ===============================================================

// Reset viewer selection mode
let resetSelectionMode = function () {
  if (viewport3D.checkSelectionMode("hideIsolated") === true) {
    isolateHide(); // toggle isolateHide mode
  } else if (viewport3D.checkSelectionMode("clipIsolated") === true) {
    isolateClippingBox(); // toggle isolateClippingBox mode
  } else {
    isolate(); // toggle isolate mode
  }
};

// Switch on isolation mode - all other elements will be grey and transparent
let isolate = function () {
  viewport3D.setSelectionMode("isolated");
};

// Switch on hidden isolation mode - all other elements will be hidden
let isolateHide = function () {
  viewport3D.setSelectionMode("hideIsolated");
};

// Switch on clipping isolation mode - all elements outside the isolated elements
// bounding box will be clipped
let isolateClippingBox = function () {
  viewport3D.setSelectionMode("clipIsolated");
};

// ===============================================================
// Colorize objects
// ===============================================================

let setAllObjectsToColor = function (color) {
  const objectIds = [];
  // Extract all object id's
  for (let obj of viewport3D.getObjectsContainer().getObjectsArray()) {
    objectIds.push(obj.id);
  }
  viewport3D.colorizeObjects(objectIds, color);
  viewport3D.draw();
};
let setAllObjectsToGreen = function () {
  setAllObjectsToColor("rgb(0,128,0)");
};
let setAllObjectsToBlue = function () {
  setAllObjectsToColor("rgb(0,0,255)");
};
let resetColorForAllObjects = function () {
  viewport3D.resetColoredObjects();
  viewport3D.draw();
};

// ===============================================================
// Toggle camera type
// ===============================================================
let toggleCameraType = function () {
  const $checkbox = $("#icon-toggle-camera-type");
  const isChecked = $checkbox.is(":checked");
  const $label = $checkbox.closest("label");

  if (isChecked) {
    $label.find(".icon-on").show();
    $label.find(".icon-off").hide();
    $label.attr("title", "Camera type is orthographic");
  } else {
    $label.find(".icon-on").hide();
    $label.find(".icon-off").show();
    $label.attr("title", "Camera type is perspective");
  }

  console.log("Camera type:", isChecked ? "Orthographic" : "Perspective");

  viewport3D.toggleProjectionMode(viewport3D);
};

// ===============================================================
// Hidding objects
// ===============================================================

// Switch on and off the hide mode in viewer. If this is enabled then clicking an object will hide it.
let toggleHideObject = function (value) {
  if (value === true) {
    viewport3D.setSelectionMode("hidden");
  } else {
    viewport3D.unsetSelectionMode("hidden");
  }
};
let resetHiddenObjects = function (value) {
  viewport3D.resetHiddenObjects();
  viewport3D.draw();
};
// ===============================================================
// Zoom to the selected objects
// ===============================================================
let centerObjects = function () {
  let selectedObjects = viewport3D.objectSets.selectedObjects.map((obj) => {
    return obj.id;
  });
  viewport3D.centerObjects(selectedObjects);
  console.debug("Center viewport for selected objects");
  if (selectedObjects.length == 0) {
    alert("Center function needs at least one selected object");
  }
};

// ===============================================================
// Renderer settings
// ===============================================================
let getDefaultSettings = function () {
  let viewportOcclusionOptions = viewport3D.getAmbientOcclusionOptions();
  viewport3D.setAmbientOcclusionOptions(viewportOcclusionOptions);
};

let toggleAmbientOcclusion = function () {
  let viewportOcclusionOptions = viewport3D.getAmbientOcclusionOptions();
  console.debug("Viewport ambient occlusion options", viewportOcclusionOptions);
  viewportOcclusionOptions.usage = !viewportOcclusionOptions.usage;
  viewportOcclusionOptions.usageForInteraction =
    !viewportOcclusionOptions.usageForInteraction;
  viewport3D.setAmbientOcclusionOptions(viewportOcclusionOptions);
  viewport3D.draw();
};
let toggleShadows = function () {
  let viewportOcclusionOptions = viewport3D.getAmbientOcclusionOptions();
  console.debug("Viewport ambient occlusion options", viewportOcclusionOptions);
  viewportOcclusionOptions.useShadows = !viewportOcclusionOptions.useShadows;
  viewportOcclusionOptions.useShadowsForInteraction =
    !viewportOcclusionOptions.useShadowsForInteraction;
  viewport3D.setAmbientOcclusionOptions(viewportOcclusionOptions);
  viewport3D.draw();
};
let toggleLightColor = function () {
  let viewportOcclusionOptions = viewport3D.getAmbientOcclusionOptions();
  console.debug("Viewport ambient occlusion options", viewportOcclusionOptions);

  // Switch from white light color to red
  if (viewportOcclusionOptions.lightColor.g === 1.0) {
    viewportOcclusionOptions.lightColor.g = 0.0;
  } else {
    viewportOcclusionOptions.lightColor.g = 1.0;
  }

  if (viewportOcclusionOptions.lightColor.b === 1.0) {
    viewportOcclusionOptions.lightColor.b = 0.0;
  } else {
    viewportOcclusionOptions.lightColor.b = 1.0;
  }

  viewport3D.setAmbientOcclusionOptions(viewportOcclusionOptions);
  viewport3D.draw();
};
let toggleAmbientLightColor = function () {
  let viewportOcclusionOptions = viewport3D.getAmbientOcclusionOptions();
  console.debug("Viewport ambient occlusion options", viewportOcclusionOptions);

  // Switch from white light color to red
  if (viewportOcclusionOptions.ambientLightColor.g === 0.6) {
    viewportOcclusionOptions.ambientLightColor.g = 1.0;
  } else {
    viewportOcclusionOptions.ambientLightColor.g = 0.6;
  }

  if (viewportOcclusionOptions.ambientLightColor.b === 0.6) {
    viewportOcclusionOptions.ambientLightColor.b = 0.0;
  } else {
    viewportOcclusionOptions.ambientLightColor.b = 0.6;
  }

  viewport3D.setAmbientOcclusionOptions(viewportOcclusionOptions);
  viewport3D.draw();
};

// Register event handlers
let registerEventListener = () => {
  $("#open-project-selection").click(function () {
    // Back to the project selection
    window.location.href = "/projects.html?token=" + token;
  });

  $("#menuViewResetView").click(function () {
    resetView();
  });

  $("#menuViewFrontView").click(function () {
    frontView();
  });

  $("#menuViewTopView").click(function () {
    topView();
  });

  $("#menuViewSideView").click(function () {
    sideView();
  });

  $("#menuViewPerspectiveView").click(function () {
    pespectiveView();
  });

  $("#menuIsolateReset").click(function () {
    resetSelectionMode();
  });

  $("#menuIsolateIsolate").click(function () {
    isolate();
  });

  $("#menuIsolateClippingBox").click(function () {
    isolateClippingBox();
  });

  $("#menuIsolateHide").click(function () {
    isolateHide();
  });

  $("#menuColorAllObjectsInGreen").click(function () {
    setAllObjectsToGreen();
  });

  $("#menuColorAllObjectsInBlue").click(function () {
    setAllObjectsToBlue();
  });

  $("#menuResetColorOfAllObjects").click(function () {
    resetColorForAllObjects();
  });

  $("#menuZoomTo").click(function () {
    centerObjects();
  });

  $("#menuToggleAmbientOcclusion").click(function () {
    toggleAmbientOcclusion();
  });

  $("#menuToggleShadows").click(function () {
    toggleShadows();
  });

  $("#menuToggleLightColor").click(function () {
    toggleLightColor();
  });

  $("#menuToggleAmbientLightColor").click(function () {
    toggleAmbientLightColor();
  });

  $("#icon-toggle-hide").click(function () {
    toggleHideObject(this.checked);
  });

  $("#icon-toggle-camera-type").click(function () {
    toggleCameraType();
  });

  $("#menuResetHiddenObjects").click(function () {
    resetHiddenObjects();
  });

  // This is required to update the viewer matrices properly
  window.addEventListener(
    "resize",
    function () {
      viewport3D.setViewportSize();
    },
    false
  );

  window.addEventListener("keydown", (event) => {
    console.debug(`Keydown event code=${event.code} key=${event.key}`);

    if (event.isComposing || event.keyCode === 229) {
      return;
    } else if (event.key === "Escape") {
      viewport3D.escapeKeyPressed();
    }
  });

  // Handle the selected3DObject event
  $(viewport3D.domElement).on("select3DObject", function (e, param) {
    // Try to get the selected object on top of the selection stack
    let selectedObject =
      viewport3D.objectSets.selectedObjects.length > 0
        ? viewport3D.objectSets.selectedObjects[
            viewport3D.objectSets.selectedObjects.length - 1
          ]
        : undefined;

    console.log("Renderer example - selected object:", selectedObject);
  });
};

let appendModelsOfProject = (project) => {
  // Load all models found inside the project
  let models = project.getModels();

  // Create DOM object string to be appended by jquery
  // This is the representation of a model in left panel
  let createModelListItem = function (model) {
    return (
      "" +
      '<li class="mdl-list__item">' +
      '  <span class="mdl-list__item-secondary-action" title="Switch model visibility">' +
      '    <label class="mdl-switch mdl-js-switch mdl-js-ripple-effect"' +
      'for="list-switch-' +
      model.id +
      '">' +
      '      <input type="checkbox" id="list-switch-' +
      model.id +
      '" class="mdl-switch__input"/>' +
      "    </label>" +
      "  </span>" +
      '  <span class="mdl-list__item-primary-content" title="' +
      model.name +
      '">' +
      model.name +
      "  </span>" +
      "</li>"
    );
  };

  // Loop through all project models and create the list items for the left menu
  models.forEach(function (model) {
    // Append item to the models list
    $(createModelListItem(model)).appendTo("#modelsList");

    // Register toggle event for the corresponding model
    $("#list-switch-" + model.id).click(async function () {
      // Get settings defaults from Renderer
      getDefaultSettings();

      // Counter of active loading requests - used to switch the spinner on or off
      let loadingCount = 0;

      if (this.checked) {
        loadingCount++;

        $("#spinner").css("display", "flex");

        // Trigger model loading for the currenly selected model
        // If model has already been loaded this call does nothing.
        // If it hasn't been loaded yet it loads all topology nodes with all disciplines of this model
        await viewer.loadModelStructure(model);
        let mvs = viewer.getModelViewState(model.id);
        mvs.setLayersVisible(true);
        mvs.setLeafNodesVisible(true);
        await viewer.setModelViewState(mvs);

        // Hide spinner in case of all load requests have been finished
        loadingCount--;
        if (loadingCount === 0) {
          $("#spinner").css("display", "none");
          viewport3D.setupProjectView();
        }
      } else {
        // Hide model
        model.setVisible(false);
        viewport3D.draw();
      }
    });
  });

  // This is required to update the DOM elements which where added dynamically.
  // See https://stackoverflow.com/questions/34579700/material-design-lite-js-not-applied-to-dynamically-loaded-html-file
  if (typeof componentHandler != "undefined") {
    componentHandler.upgradeAllRegistered();
  }
};

init();

async function init() {
  // Set api to null in order to use projectViewer
  let api = null;

  viewport3D = createViewport();

  registerEventListener();

  // Create grid helper and append to renderer custom scene
  let gridHelper = new GridHelper(100000, 20); // before a value of 100000 was used
  viewport3D.customScene.add(gridHelper);

  // Create a project viewer for the viewport which is using the api for requests,
  // but since no api is used, api was set to null
  viewer = new Renderer.ProjectViewer(api, viewport3D);

  // Load basic information of the project
  let projectDetails = { id: "GLTF_PROJECT_ID", name: "GLTFProject" };
  let projectRevisions = [];
  let project = await viewer.openProject(projectDetails, projectRevisions);

  // Load a glTF resource
  loader.load(
    // resource URL
    "simple_building.gltf",
    // called when the resource is loaded
    async function (gltf) {
      /// Create project model
      let divisionTopoNodeId = "ecc53ffa-c5c5-43ee-ac6c-0bd8ed0a95d7";
      let randomModelGuid = "abb8f5a8-c9c4-4628-9988-9f3a439f29eb";
      let model = new Renderer.ProjectModel(
        project,
        `GLTF-${randomModelGuid}`,
        divisionTopoNodeId
      );
      model.isExternal = true;
      model._externalId = "";
      model.name = "Simple Building";
      project.addModel(model);

      /// Create topologies
      let nodeId = "c3113fca-9416-4519-927a-30c8db8921bb";
      let leafNode = new Renderer.ProjectTopologyNode(
        model,
        nodeId,
        "Dachgeschoss"
      );
      model.addTopologyLeafNode(leafNode);
      await leafNode.setVisible(true);

      /// Create Layers
      let layers = [];
      let BuildingLayerID = `${Renderer.Layers.BuildingLayer}`;
      layers[BuildingLayerID] = {
        id: BuildingLayerID,
        name: "BuildingLayer",
      };

      /// Create GLTFContentLoader object and initialize
      let layer = layers[BuildingLayerID];
      let gltfContentLoader = new GltfContentLoader(
        viewport3D,
        project,
        model,
        layer,
        nodeId
      );
      await gltfContentLoader.initalize();

      /// Create model layers
      await gltfContentLoader.createModelLayers(model, layers);

      // Collect scene object geometries
      let objectGeometries = [];
      gltfContentLoader.collectObjectGeometries(gltf.scene, objectGeometries);

      // Load model geometry
      await gltfContentLoader.loadModelGeometry(model, objectGeometries);

      appendModelsOfProject(project);
    },
    // called while loading is progressing
    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    // called when loading has errors
    function (error) {
      console.log("An error happened");
    }
  );
}
