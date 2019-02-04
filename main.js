const settingAvailable = document.querySelector(".settingAvailable");
const paramName = document.querySelector(".paramName");
const paramDescription = document.querySelector(".paramDescription");
const previousSetting = document.querySelector(".previousSetting");
const currentSetting = document.querySelector(".currentSetting");
const bypassed = document.querySelector(".bypassed");
const currentReading = document.querySelector(".currentReading");
const units = document.querySelector(".units");
const currentStatus = document.querySelector(".currentStatus");

const dpm = new DPM();
const lookup = new LOOKUP();

function handleNewReadingData(reading, info) {
  currentReading.innerText = Number(reading.data).toPrecision(4);
}

function handleNewSettingData(setting, info) {
  currentSetting.innerText = Number(setting.data).toPrecision(4);
}

function characterColorDecoder(twoBytes) {
  const byteString = twoBytes.toString(16).padStart(4, 0);
  const firstByte = parseInt(byteString.slice(0, 2), 16);
  const secondByte = parseInt(byteString.slice(2), 16);

  return {
    color: colorParser(firstByte),
    character: characterParser(secondByte)
  };
}

function colorParser(colorIndex) {
  const colors = [
    "black",
    "blue",
    "green",
    "cyan",
    "red",
    "magenta",
    "yellow",
    "white"
  ];
  return colors[colorIndex];
}

function characterParser(charCode) {
  return String.fromCharCode(charCode);
}

// Object.fromEntries polyfill
//https://github.com/tc39/proposal-object-from-entries/blob/master/polyfill.js
function parseStatusChars(chars) {
  return Object.fromEntries(
    Object.entries(chars).map(entry => [
      entry[0],
      characterColorDecoder(entry[1])
    ])
  );
}

function coloredCharacter({ character, color }) {
  return `<span style="color: ${color}">${character}</span>`;
}

function handleNewStatusData(config) {
  return (status, info) => {
    let textStatus = "";

    if (status.on === true) {
      textStatus += coloredCharacter(config.on);
    } else if (status.on === false) {
      textStatus += coloredCharacter(config.off);
    }

    if (status.ready === true) {
      textStatus += coloredCharacter(config.ready);
    } else if (status.ready === false) {
      textStatus += coloredCharacter(config.tripped);
    }

    if (status.remote === true) {
      textStatus += coloredCharacter(config.remote);
    } else if (status.remote === false) {
      textStatus += coloredCharacter(config.local);
    }

    if (status.positive === true) {
      textStatus += coloredCharacter(config.positive);
    } else if (status.positive === false) {
      textStatus += coloredCharacter(config.negative);
    }

    // TODO: Ramp isn't available?
    if (status.ramp === true) {
      textStatus += coloredCharacter({ character: "R", color: "green" });
    } else if (status.ramp === false) {
      textStatus += coloredCharacter({ character: "D", color: "yellow" });
    }

    currentStatus.innerHTML = textStatus;
  };
}

lookup
  .deviceByName(paramName.innerText)
  .then(properties => {
    if (properties.setting) {
      dpm.addRequest(`${paramName.innerText}.SETTING`, handleNewSettingData);
      settingAvailable.innerText = "-";
    }

    if (properties.name) {
      paramName.innerText = properties.name;
    }

    if (properties.di) {
      paramName.title = properties.di;
    }

    if (properties.description) {
      paramDescription.innerText = properties.description;
    }

    // TODO: Maybe properties.analogAlarm.flags ?
    if (properties.bypassed) {
      bypassed.innerText = properties.bypassed;
    }

    if (properties.reading) {
      currentReading.innerText = "DPM_Pend";
      dpm.addRequest(`${paramName.innerText}.READING`, handleNewReadingData);
      units.innerText = properties.reading.scaling.common.units;
    }

    if (properties.status) {
      dpm.addRequest(
        `${paramName.innerText}.STATUS`,
        handleNewStatusData(parseStatusChars(properties.status.altChars))
      );
    }

    // TODO: Control

    return properties;
  })
  .then(properties => {
    dpm.start();
    return properties;
  })
  .then(console.log)
  .catch(console.error);
