// DOM loaded
document.addEventListener('DOMContentLoaded', function () {
    const deviceSelector = document.getElementById('deviceSelector');
    const changeActiveDeviceBtn = document.getElementById('changeActiveDeviceBtn');
  
    const ringBtn = document.getElementById('ring');
    const offhookBtn = document.getElementById('offhook');
    const onhookBtn = document.getElementById('onhook');
    const muteBtn = document.getElementById('mute');
    const unmuteBtn = document.getElementById('unmute');
    
    const noDeviceFound = document.getElementById('noDeviceFound');
  
    function showError(err) {
      let msg;
      if (err.name === "CommandError" && err.errmessage === "Unknown cmd" && err.command === "getinstallinfo" ) {
        msg = "Could not lookup installation info - Your installation is incomplete, out of date or corrupted.";
      } else if (err instanceof Error) {
        msg = err.toString();
      } else if ((typeof err === 'string') || (err instanceof String)) {
        msg = err; 
      } else {
        msg = JSON.stringify(err);
      }
  
      // Add nodes to show the error message
      var div = document.createElement("div");
      var att = document.createAttribute("class");
      att.value = "wrapper";
      div.setAttributeNode(att);
      div.innerHTML = msg;
      var br = document.createElement("br");
      var list = document.getElementById("section");
      list.insertBefore(br, list.childNodes[0]);
      list.insertBefore(div, list.childNodes[0]);
  
      toastr.info(msg);
    }
  
    // Helper to update device list returning promise that resolves when finished.
    function setupDevices() {
      while (deviceSelector.options.length > 0) {
        deviceSelector.remove(0);
      }
  
      // ysw modi point [[
      return dasan.getDevices().then((devices) => {
        console.log(" devices  ",devices);

        
        devices.forEach(device => {
          console.log(" device  ",device);
          var opt = document.createElement('option');
          opt.value = device.deviceID;
          opt.innerHTML = device.deviceName;
          deviceSelector.appendChild(opt);
        });
  
        changeActiveDeviceBtn.disabled = (devices.length === 0);
        ringBtn.disabled = (devices.length === 0);
        offhookBtn.disabled = (devices.length === 0);
        onhookBtn.disabled = (devices.length === 0);
        muteBtn.disabled = (devices.length === 0);
        unmuteBtn.disabled = (devices.length === 0);
  
        let notificationText = (devices.length === 0) ? "No Dasan device found - Please insert a Dasan Device!" : "";
        noDeviceFound.innerText = notificationText;
      });
      // ysw modi point ]]
    }
  
    dasan.addEventListener("mute", (event) => {
      dasan.setIsMute(true);
      toastr.info("The device requested to be muted");
    });
  
    dasan.addEventListener("unmute", (event) => {
      dasan.setIsMute(false);
      toastr.info("The device requested to be unmuted");
    });
  
    dasan.addEventListener("device attached", (event) => {
      dasan.setIsOffHook(false);
      dasan.setIsMute(false);
      toastr.info("A device was attached");
    });
  
    dasan.addEventListener("device detached", (event) => {
      dasan.setIsOffHook(false);
      dasan.setIsMute(false);
      toastr.info("A device was detached");
    });
  
    dasan.addEventListener("acceptcall", (event) => {
      dasan.setIsOffHook(true);
      toastr.info("Accept call from the device");
    });
  
    dasan.addEventListener("reject", (event) => {
      dasan.setIsOffHook(false);
      dasan.setIsMute(false);
      toastr.info("Reject call from the device");
    });
  
    dasan.addEventListener("endcall", (event) => {
      dasan.setIsOffHook(false);
      dasan.setIsMute(false);
      toastr.info("End call from the device");
    });
  
    dasan.addEventListener("flash", (event) => {
      toastr.info("Flash from the device");
    });
  
    ringBtn.onclick = function () {
      dasan.ring();
    }
  
    offhookBtn.onclick = function () {
      dasan.offHook();
    }
  
    onhookBtn.onclick = function () {
      dasan.onHook();
    }
  
    muteBtn.onclick = function () {
      dasan.mute();
    }
  
    unmuteBtn.onclick = function () {
      dasan.unmute();
    }
  

    // Refresh device list automatically when devices are inserted/removed:
    dasan.addEventListener(["device attached", "device detached"] , (event) => {
      setupDevices();
    });
  
    // Change active device when user asks:
    changeActiveDeviceBtn.onclick = () => {
      let id = deviceSelector.value;
  
      dasan.setActiveDeviceId(id).then(() => {
        toastr.info("Active device set to " + deviceSelector.options[deviceSelector.selectedIndex].text + " (id # " + id + ")");
      }).catch( (err) => {
        toastr.info("Error setting active device " + err)
      });
    };
  
    // Use the Dasan library - to be sure of the installation we also check it and report errors
    // This installation check is optional but is there to reduce support issues.
    dasan.init().then(() => dasan.getInstallInfo()).then( (installInfo) => { 
      if (installInfo.installationOk) {
        toastr.info("Dasan library initialized successfully");
        // Setup device list and enable/disable buttons according if min 1 jabra device is there.
        return setupDevices().then( () => {
          if (deviceSelector.options.length === 0) {
            noDeviceFound
          }
          // Additional setup here.
        });
      } else { // Installation not ok:
        showError("Installation not ok - Your installation is incomplete, out of date or corrupted.");
      }
    }).catch((err) => {
      showError(err);
    });
  }, false);