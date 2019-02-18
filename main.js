import { DPM } from "./node_modules/@fnal/dpm/dist/browser.js";
import { LOOKUP } from "./node_modules/@fnal/lookup/dist/browser.js";
import { ParamStatus } from "./node_modules/@fnal/param-status/ParamStatus.js";

const dpm = new DPM();
const lookup = new LOOKUP();
// const paramStatus = new ParamStatus();

const container = document.querySelector("#paramPage") || document.body;

function startParamRequest({ value, parentElement }) {
  // TODO: Error to row - verify lookup
  lookup
    .deviceByName(value)
    .then(({ di, name, description }) => {
      parentElement.dataset.di = di;

      parentElement.innerHTML = `<span class="settingAvailable" title="Settings are possible"></span>
      <span class="paramName" title="Parameter name">${name}</span>
      <span class="paramDescription" title="Description">${description}</span>
      <span class="previousSetting" title="Previous setting"></span>
      <span class="currentSetting" title="Current setting"></span>
      <span class="bypassed" title="Parameter is bypassed"></span>
      <span class="currentReading" title="Current reading">DPM_Pend</span>
      <span class="units" title="Units"></span>
      <span class="currentStatus" title="Current Status"></span>`;

      // const settingAvailable = document.createElement("span");
      // settingAvailable.className("settingAvailable");
      // const paramDescription = document.createElement("span");
      // paramDescription.className("paramDescription");
      // const previousSetting = document.createElement("span");
      // previousSetting.className("previousSetting");
      // const currentSetting = document.createElement("span");
      // currentSetting.className("currentSetting");
      // const bypassed = document.createElement("span");
      // bypassed.className("bypassed");
      // const currentReading = document.createElement("span");
      // currentReading.className("currentReading");
      // const units = document.createElement("span");
      // units.className("units");
      // const currentStatus = document.createElement("span");
      // currentStatus.className("currentStatus");

      // parentElement.prepend(settingAvailable);
      // parentElement.appendChild(paramDescription);
      // parentElement.appendChild(previousSetting);
      // parentElement.appendChild(currentSetting);
      // parentElement.appendChild(bypassed);
      // parentElement.appendChild(currentReading);
      // parentElement.appendChild(units);
      // parentElement.appendChild(currentStatus);
    })
    .catch(console.error);
}

function focusNextInput(input) {
  input.parentElement.nextElementSibling.firstElementChild.focus();
}

function doSomeMath(mathString) {
  return eval(mathString);
}

function determineRequest(element) {
  const inputString = element.value.trim();
  const firstCharacter = inputString.split("")[0];

  if (firstCharacter === "#") {
    console.log(doSomeMath(inputString.slice(1).trim()));
    focusNextInput(element);
  } else if (firstCharacter === "!") {
    focusNextInput(element);
  } else {
    console.log(element);
    startParamRequest(element);
  }
}

function parseInput(inputElement) {
  const paramRow = inputElement.parentElement;
  const paramInput = inputElement.textContent;
  lookup.getDeviceByName(inputElement.textContent).then(lookupInfo => {
    lookupInfo;
  });
  // TODO: Get di
  // TODO: Crate all param-row fields
  // TODO: Initiate LOOKUP and DPM requests
}

function prepPage() {
  container.innerHTML = `<div class="param-row" id="param-row-0" style="height:max-content"><input class="param-input" id="param-input-0"></input></div>`;
  const rowHeight = document.querySelector(".param-row").offsetHeight;
  const containerHeight = container.offsetHeight;
  const inputsInContainer = Math.floor(containerHeight / rowHeight);

  Array(inputsInContainer - 1)
    .fill(0)
    .forEach((_, index) => {
      const newRow = document.createElement("div");
      newRow.className = "param-row";
      newRow.id = `param-row-${index + 1}`;
      const newInput = document.createElement("input");
      newInput.className = "param-input";
      newInput.id = `param-input-${index + 1}`;
      newInput.addEventListener("keyup", ({ code, target }) => {
        if (code === "Enter") determineRequest(target);
      });
      newRow.appendChild(newInput);
      container.appendChild(newRow);
    });
}

prepPage();

// const settingAvailable = document.querySelector(".settingAvailable");
// const paramName = document.querySelector(".paramName");
// const paramDescription = document.querySelector(".paramDescription");
// const previousSetting = document.querySelector(".previousSetting");
// const currentSetting = document.querySelector(".currentSetting");
// const bypassed = document.querySelector(".bypassed");
// const currentReading = document.querySelector(".currentReading");
// const units = document.querySelector(".units");
// const currentStatus = document.querySelector(".currentStatus");

// const dpm = new DPM();
// const lookup = new LOOKUP();
// const paramStatus = new ParamStatus({ container: currentStatus });

// function handleNewReadingData(reading, info) {
//   currentReading.innerText = Number(reading.data).toPrecision(4);
// }

// function handleNewSettingData(setting, info) {
//   currentSetting.innerText = Number(setting.data).toPrecision(4);
// }

// lookup
//   .deviceByName(paramName.innerText)
//   .then(properties => {
//     if (properties.setting) {
//       dpm.addRequest(`${paramName.innerText}.SETTING`, handleNewSettingData);
//       settingAvailable.innerText = "-";
//     }

//     if (properties.name) {
//       paramName.innerText = properties.name;
//     }

//     if (properties.di) {
//       paramName.title = properties.di;
//     }

//     if (properties.description) {
//       paramDescription.innerText = properties.description;
//     }

//     // TODO: Maybe properties.analogAlarm.flags ?
//     if (properties.bypassed) {
//       bypassed.innerText = properties.bypassed;
//     }

//     if (properties.reading) {
//       currentReading.innerText = "DPM_Pend";
//       dpm.addRequest(`${paramName.innerText}.READING`, handleNewReadingData);
//       units.innerText = properties.reading.scaling.common.units;
//     }

//     if (properties.status) {
//       dpm.addRequest(
//         `${paramName.innerText}.STATUS`,
//         paramStatus.handleNewData(properties.status)
//       );
//     }

//     // TODO: Control

//     return properties;
//   })
//   .then(console.log)
//   .catch(console.error);

// dpm.start();

/**
    <section>
      <span class="settingAvailable" title="Settings are possible"></span>
      <span class="paramName" title="Parameter name">F:MT5EL</span>
      <span class="paramDescription" title="Description"></span>
      <span class="previousSetting" title="Previous setting"></span>
      <span class="currentSetting" title="Current setting"></span>
      <span class="bypassed" title="Parameter is bypassed"></span>
      <span class="currentReading" title="Current reading"></span>
      <span class="units" title="Units"></span>
      <span class="currentStatus" title="Current Status"></span>
    </section>
 */
