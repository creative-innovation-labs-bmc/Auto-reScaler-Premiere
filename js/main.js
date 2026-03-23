var csInterface = new CSInterface();

// --- DOM ELEMENTS ---
var curW = document.getElementById("currentWidth");
var curH = document.getElementById("currentHeight");
var curRatio = document.getElementById("currentRatio");
var tarW = document.getElementById("targetWidth");
var tarH = document.getElementById("targetHeight");
var tarRatio = document.getElementById("targetRatio");
var multiplierInput = document.getElementById("multiplierInput");
var lockRatio = document.getElementById("lockRatio");
var scopeSelect = document.getElementById("scopeSelect");
var btnScale = document.getElementById("btnScale");
var dynamicArrow = document.getElementById("dynamicArrow");

// --- CONTEXT-AWARE FOCUS TRACKING ---
var targetFocus = true; 
curW.addEventListener("focus", function() { targetFocus = false; });
curH.addEventListener("focus", function() { targetFocus = false; });
tarW.addEventListener("focus", function() { targetFocus = true; });
tarH.addEventListener("focus", function() { targetFocus = true; });

// --- MATH & UI UTILITIES ---
function updateArrow() {
    var cw = parseFloat(curW.value);
    var tw = parseFloat(tarW.value);
    if (isNaN(cw) || isNaN(tw)) return;

    if (tw > cw) { // Scale Up (Right)
        dynamicArrow.innerHTML = '<polyline points="9 18 15 12 9 6"></polyline>';
    } else if (tw < cw) { // Scale Down (Left)
        dynamicArrow.innerHTML = '<polyline points="15 18 9 12 15 6"></polyline>';
    } else { // Equal
        dynamicArrow.innerHTML = '<line x1="6" y1="10" x2="18" y2="10"></line><line x1="6" y1="14" x2="18" y2="14"></line>';
    }
}

function getAspectRatio(w, h) {
    if (w <= 0 || h <= 0 || isNaN(w) || isNaN(h)) return "N/A";
    function gcd(a, b) { return b == 0 ? a : gcd(b, a % b); }
    var divisor = gcd(w, h);
    if (divisor === 0) return "Custom";
    return (w / divisor) + ":" + (h / divisor);
}

function updateRatios() {
    curRatio.innerText = "Aspect Ratio: " + getAspectRatio(parseFloat(curW.value), parseFloat(curH.value));
    tarRatio.innerText = "Aspect Ratio: " + getAspectRatio(parseFloat(tarW.value), parseFloat(tarH.value));
    updateArrow();
}

// --- TWO-WAY BINDING & RATIO LOCK ---
function updateFromMultiplier() {
    var m = parseFloat(multiplierInput.value);
    if (!isNaN(m) && m > 0) {
        tarW.value = Math.round(parseFloat(curW.value) * m);
        tarH.value = Math.round(parseFloat(curH.value) * m);
        updateRatios();
    }
}

function updateFromTargetW() {
    if (lockRatio.checked && parseFloat(curW.value) > 0) {
        var ratio = parseFloat(curW.value) / parseFloat(curH.value);
        tarH.value = Math.round(parseFloat(tarW.value) / ratio);
    }
    var cw = parseFloat(curW.value);
    if (!isNaN(cw) && cw > 0) multiplierInput.value = parseFloat((parseFloat(tarW.value) / cw).toFixed(4));
    updateRatios();
}

function updateFromTargetH() {
    if (lockRatio.checked && parseFloat(curH.value) > 0) {
        var ratio = parseFloat(curW.value) / parseFloat(curH.value);
        tarW.value = Math.round(parseFloat(tarH.value) * ratio);
    }
    var cw = parseFloat(curW.value);
    if (!isNaN(cw) && cw > 0) multiplierInput.value = parseFloat((parseFloat(tarW.value) / cw).toFixed(4));
    updateRatios();
}

// Input Event Listeners
curW.addEventListener("input", updateFromMultiplier);
curH.addEventListener("input", updateFromMultiplier);
tarW.addEventListener("input", updateFromTargetW);
tarH.addEventListener("input", updateFromTargetH);
multiplierInput.addEventListener("input", updateFromMultiplier);

// --- PRESET BUTTONS ---
document.querySelectorAll(".preset-btn").forEach(function(btn) {
    btn.addEventListener("click", function() {
        var w = this.getAttribute("data-w");
        var h = this.getAttribute("data-h");

        if (targetFocus) {
            tarW.value = w; tarH.value = h;
            updateFromTargetW(); 
        } else {
            curW.value = w; curH.value = h;
            var tw = parseFloat(tarW.value);
            if (!isNaN(tw) && tw > 0) multiplierInput.value = parseFloat((tw / w).toFixed(4));
            updateRatios();
        }
    });
});

// --- LOAD BUTTONS ---
document.getElementById("btnLoadSeq").addEventListener("click", function() {
    csInterface.evalScript('getActiveSequenceDimensions()', function(result) {
        if (result && result !== "null") {
            var dims = result.split(",");
            curW.value = dims[0]; curH.value = dims[1];
            updateFromMultiplier(); 
        } else {
            document.getElementById("statusMessage").innerText = "Error: Please open a sequence.";
        }
    });
});

// --- CLEAR MARKERS BUTTON ---
document.getElementById("btnClearMarkers").addEventListener("click", function() {
    document.getElementById("statusMessage").innerText = "Clearing markers...";
    csInterface.evalScript('clearScaleMarkers()', function(result) {
        document.getElementById("statusMessage").innerText = result;
    });
});

// --- DYNAMIC BUTTON TEXT (MAGIC HOVER) ---
function refreshButtonText() {
    if (scopeSelect.value === "selected") {
        csInterface.evalScript('getSelectedClipCount()', function(count) {
            var c = parseInt(count);
            if (!isNaN(c) && c === 1) btnScale.innerText = "Process 1 Clip";
            else if (!isNaN(c) && c > 1) btnScale.innerText = "Process " + c + " Clips";
            else btnScale.innerText = "Process Selected Clips";
        });
    } else {
        btnScale.innerText = "Process Sequence";
    }
}
scopeSelect.addEventListener("change", refreshButtonText);
document.body.addEventListener("mouseenter", refreshButtonText);

// --- EXECUTE SCALING ---
btnScale.addEventListener("click", function() {
    var m = multiplierInput.value;
    var scope = scopeSelect.value;
    var skip = document.getElementById("skipKeyframes").checked;
    var rename = document.getElementById("renameSeq").checked;
    var duplicate = document.getElementById("duplicateSeq").checked; 
    var naming = document.getElementById("namingSelect").value;
    var markOver = document.getElementById("markOverScaled").checked; 
    var tw = tarW.value; var th = tarH.value;
    
    if (m > 0) {
        document.getElementById("statusMessage").innerText = "Processing...";
        var scriptCall = 'processSequence(' + m + ', "' + scope + '", ' + skip + ', ' + rename + ', ' + duplicate + ', "' + naming + '", ' + tw + ', ' + th + ', ' + markOver + ')';
        csInterface.evalScript(scriptCall, function(result) {
            document.getElementById("statusMessage").innerText = result;
        });
    }
});

// Initialize math on load
updateRatios(); 

// --- FOOTER EXTERNAL LINK ROUTER ---
document.getElementById("creditLink").addEventListener("click", function(e) {
    e.preventDefault(); // Prevents the panel from loading the website internally
    // IMPORTANT: Change this URL to your actual portfolio or website!
    csInterface.openURLInDefaultBrowser("https://www.linkedin.com/in/fooch"); 
});