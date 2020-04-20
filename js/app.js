import {Solution} from "./solution.js";
import {getChemicalDatabase} from "./database.js";

if (!window) console.error("ERROR! No window!");

const app = {
  running: false,
  toolSelection: null,
  speciesSelection: null,
  amountSelection: 0.001,
  temperatureSelection: 1,
  toggleRunning: toggleRunning
};

function loop(t) {
  app.solution.iterate(Math.min((t - app.lastT) * 0.001, 0.2));
  const ij = app.solution.Canvas.indexIJ(app.clientX, app.clientY);
  if (app.solution.Grid.has(...ij)) {
    app.probeContainer.innerHTML = app.solution.probe(...ij);
  }
  else {
    app.probeContainer.innerHTML = "";
  }
  app.lastT = t;
  if (app.running) requestAnimationFrame(loop);
}
function toggleRunning() {
  if (app.running) {
    app.running = false;
  }
  else {
    app.running = true;
    app.lastT = performance.now()
    loop(app.lastT);
  }
}
function toggleSimulation(e) {
  const name = e.target.getAttribute("for");
  app.solution[name] = !document.getElementById(name).checked;
}
function displaySelect(e) {
  app.solution.displayType = e.target.getAttribute("for");
}
function toolSelect(e) {
  app.toolSelection = e.target.getAttribute("for");
}
function speciesSelect(e) {
  app.speciesSelection = app.solution.StandardSpecies[e.target.getAttribute("for")];
}
function amountSelect(e) {
  const v = parseFloat(e.target.value);
  if (10 >= v && v > 0) {
    app.amountSelection = v;
  }
  else {
    alert("Amount selection must be between 0 - 10.");
    e.target.value = app.amountSelection;
  }
}
function temperatureSelect(e) {
  const v = parseFloat(e.target.value);
  if (10 >= v && v > 0) {
    app.temperatureSelection = v;
  }
  else {
    alert("Amount selection must be between 0 - 10.");
    e.target.value = app.temperatureSelection;
  }
}
function canvasClick(e) {
  toggleRunning();
  requestAnimationFrame(function() {
    const i = app.solution.Canvas.index(e.clientX, e.clientY);
    console.log(i);
    switch (app.toolSelection) {
      case "add-species":
      for (let slt of app.speciesSelection.solutes) app.solution.Concentrations[slt[0]][i] += app.amountSelection * slt[1];
       break;
      case "remove-species":
      for (let slt of app.speciesSelection.solutes) {
        console.log(app.amountSelection * slt[1]);
        const conc = app.solution.Concentrations[slt[0]];
        conc[i] -= app.amountSelection * slt[1];
        if (conc[i] < 0) conc[i] = 0;
      }
      break;
      case "heat-source":
      app.solution.temperature[i] += app.temperatureSelection;
      break;
      case "heat-sink":
      app.solution.temperature[i] -= app.temperatureSelection;
      if (app.solution.temperature[i] < 0) app.solution.temperature[i] = 0;
      break;
    }
    toggleRunning();
  });
}
function printProbe(e) {
  app.clientX = e.clientX;
  app.clientY = e.clientY;
}
function setupGUI(slt, std, rxn) {
  let first;
  app.simulationContainer = document.getElementById("simulation");
  app.displayContainer = document.getElementById("display");
  app.toolsContainer = document.getElementById("tools");
  app.speciesContainer = document.getElementById("species");
  app.probeContainer = document.getElementById("probe");

  app.amountInput = document.getElementById("amount-species");
  app.amountInput.value = app.amountSelection;
  app.temperatureInput = document.getElementById("amount-temperature");
  app.temperatureInput.value = app.temperatureSelection;

  first = true;
  app.toolOptions = app.toolsContainer.querySelectorAll(".button");
  app.toolOptions.forEach(t => t.addEventListener("click", toolSelect, {capture: false, passive: true}));
  app.toolsContainer.querySelectorAll(".tool-selection").forEach(function(t) {t.checked = first; first = false;});
  toolSelect({target: app.toolOptions[0]});

  app.simulationOptions = app.simulationContainer.querySelectorAll(".button");
  app.simulationOptions.forEach(t => t.addEventListener("click", toggleSimulation), {capture: false, passive: true});
  app.simulationContainer.querySelectorAll(".tool-selection").forEach(function(t) {t.checked = true});

  first = true;
  app.displayOptions = app.displayContainer.querySelectorAll(".button");
  app.displayOptions.forEach(t => t.addEventListener("click", displaySelect), {capture: false, passive: true});
  app.displayContainer.querySelectorAll(".tool-selection").forEach(function(t) {t.checked = first; first = false;});

  app.speciesOptions = [];
  first = true;
  let df = new DocumentFragment();
  for (let k of Object.keys(std)) {
    if (std[k].available) {
      const i = document.createElement("input");
      i.className = "tool-selection";
      i.type = "radio";
      i.id = k;
      i.value = k;
      i.name = "species";
      i.checked = first;
      const l = document.createElement("label");
      l.setAttribute("for", k);
      l.className = "button";
      l.title = std[k].name;
      l.innerHTML = std[k].symbol;
      l.addEventListener("click", speciesSelect, {capture: false, passive: true});
      if (first) speciesSelect({target: l});
      df.appendChild(i);
      df.appendChild(l);
      app.speciesOptions.push(l);
      first = false;
    }
  }
  app.speciesContainer.appendChild(df);

  app.reactionList = document.getElementById("reactionList");
  df = new DocumentFragment();
  for (let r of rxn) {
    let reactants = "";
    let products = (r.Backward > 0) ? " &#8644; " : " &rarr; ";
    for (let e of r.Equation) {
      if (e[0] < 0) {
        reactants += " + " + (e[0] == -1 ? "" : -e[0]) + (e[2] ? slt[e[1]].symbol + "<sub>(aq)</sub>" : std[e[1]].symbol + "<sub>(x)</sub>");
      }
      else {
        products +=  (e[0] == 1 ? "" : e[0]) + (e[2] ? slt[e[1]].symbol + "<sub>(aq)</sub>" : std[e[1]].symbol + "<sub>(x)</sub>") + " + ";
      }
    }
    const el = document.createElement("li");
    el.innerHTML = reactants.substr(3) + products.substr(0, products.length - 3);
    df.appendChild(el);
  }
  reactionList.appendChild(df);

  app.amountInput.addEventListener("change", amountSelect, {passive: true});
  app.temperatureInput.addEventListener("change", temperatureSelect, {passive: true});
  app.solution.Canvas.canvas.addEventListener("click", canvasClick, {passive: true});
  addEventListener("mousemove", printProbe, {passive: true});
  addEventListener("resize", function() {app.solution.Canvas.updateClientSize();}, {passive: true});
}
getChemicalDatabase().then(function(db) {
  app.solution = new Solution({
    db: db,
    rows: 15,
    columns: 20,
    DistanceBetweenCells: 1,
    react: true,
    diffuse: true,
    diffuseTemperature: true,
    displayType: "beer",
    canvas: document.getElementById("grid"),
    container: document.getElementById("gridContainer")
  });
  setupGUI(app.solution.SoluteSpecies, app.solution.StandardSpecies, app.solution.Reactions);
  app.solution.Canvas.updateClientSize();
  //app.solution.Concentrations["Cu(II)"][150] = 10.0;
  //app.solution.Concentrations["OH"][110] = 20.0;
  toggleRunning();
});

window.app = app;
