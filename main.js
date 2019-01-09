const dpm = new DPM();

function handleNewData(reading, info) {
  document.querySelector(".currentReading").innerText = reading.data;
}

dpm.addRequest("G:SCTIME", handleNewData);

dpm.start();
