import { DPM } from "./node_modules/@fnal/dpm/dist/browser.js";
import { LOOKUP } from "./node_modules/@fnal/lookup/dist/browser.js";
import { ParamStatus } from "./node_modules/@fnal/param-status/ParamStatus.js";

const dpm = new DPM();
const lookup = new LOOKUP();

const container = document.querySelector("#paramPage") || document.body;

function processData(di, className) {
  let initialData;
  return data => {
    if (initialData === undefined) initialData = data.data;
    document.querySelector(
      `[data-di = "${di}"] > .${className}`
    ).innerText = Number(data.data).toPrecision(4);
    if (className === "currentSetting") {
      document.querySelector(".previousSetting");
    }
  };
}

function startParamRequest({ value, parentElement }) {
  // TODO: Error to row - verify lookup
  lookup
    .deviceByName(value)
    .then(
      ({
        di,
        name,
        description,
        setting,
        reading,
        analogAlarm,
        digitalAlarm,
        status,
        control
      }) => {
        parentElement.dataset.di = di;

        parentElement.innerHTML = `<span class="settingAvailable" title="Settings are possible">${
          setting ? "-" : ""
        }</span>
      <span class="paramName" title="Parameter name">${name}</span>
      <span class="paramDescription" title="Description">${description}</span>
      <span class="previousSetting" title="Previous setting"></span>
      <span contenteditable class="currentSetting" title="Current setting"></span>
      <span class="bypassed" title="Parameter is bypassed"></span>
      <span class="currentReading" title="Current reading"></span>
      <span class="units" title="Units">${reading.scaling.common.units}</span>
      <span class="currentStatus" title="Current Status"></span>`;

        if (setting) {
          dpm.addRequest(
            `0:${di}.SETTING`,
            (_ => {
              let initialData;
              const currentSetting = document.querySelector(
                `[data-di = "${di}"] > .currentSetting`
              );
              const previousSetting = document.querySelector(
                `[data-di = "${di}"] > .previousSetting`
              );

              return data => {
                const formattedData = Number(data.data).toPrecision(4);

                if (initialData === undefined) {
                  initialData = formattedData;
                } else {
                  if (initialData !== formattedData) {
                    previousSetting.innerText = initialData;
                  } else {
                    previousSetting.innerText = "";
                  }
                }

                currentSetting.innerText = formattedData;
              };
            })(),
            console.error
          );
        }

        if (reading) {
          dpm.addRequest(
            `0:${di}.READING`,
            processData(di, "currentReading"),
            console.error
          );
        }

        if (analogAlarm) {
          const bypassed = document.querySelector(
            `[data-di = "${di}"] > .bypassed`
          );

          dpm.addRequest(
            `0:${di}.ANALOG`,
            data => {
              if (!data.alarm_enable) {
                bypassed.innerText = "*";
              } else {
                bypassed.innerText = "";
              }
            },
            console.error
          );
        }

        if (digitalAlarm) {
          //TODO: Display digital alarm status
        }

        if (status) {
          const paramStatus = new ParamStatus({
            container: document.querySelector(
              `[data-di = "${di}"] .currentStatus`
            )
          });
          dpm.addRequest(
            `0:${di}.STATUS`,
            paramStatus.handleNewData(status.altChars),
            console.error
          );
        }

        if (control) {
          //TODO: Create control menu when status is clicked
        }

        dpm.start();
      }
    )
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
    startParamRequest(element);
    focusNextInput(element);
  }
}

function prepPage() {
  container.innerHTML = `<div class="param-row" id="param-row-0" style="height:max-content"><input class="param-input" id="param-input-0"></input></div>`;
  const rowHeight = document.querySelector(".param-input").offsetHeight;
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
