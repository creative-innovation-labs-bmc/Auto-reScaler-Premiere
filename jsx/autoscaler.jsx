function getActiveSequenceDimensions() {
    app.enableQE();
    var seq = app.project.activeSequence;
    if (seq) {
        var settings = seq.getSettings();
        if (settings) return settings.videoFrameWidth + "," + settings.videoFrameHeight;
    }
    return "null";
}

function getSelectedClipCount() {
    var seq = app.project.activeSequence;
    if (!seq) return "0";
    var count = 0;
    for (var i = 0; i < seq.videoTracks.numTracks; i++) {
        var track = seq.videoTracks[i];
        for (var j = 0; j < track.clips.numItems; j++) {
            if (track.clips[j].isSelected()) count++;
        }
    }
    return count.toString();
}

function clearScaleMarkers() {
    var seq = app.project.activeSequence;
    if (!seq) return "Error: Open a sequence first.";
    
    try {
        var markersToDelete = [];
        var currentMarker = seq.markers.getFirstMarker();
        
        while (currentMarker) {
            if (currentMarker.name === "Auto reScaler: >100% Scale") {
                markersToDelete.push(currentMarker);
            }
            currentMarker = seq.markers.getNextMarker(currentMarker);
        }
        
        for (var i = 0; i < markersToDelete.length; i++) {
            seq.markers.deleteMarker(markersToDelete[i]);
        }
        return "Cleared " + markersToDelete.length + " red scale marker(s).";
    } catch (e) {
        return "Error clearing markers: " + e.message;
    }
}

function processSequence(scaleFactor, scope, skipKeyframes, renameSeq, duplicateSeq, namingConvention, targetW, targetH, markOverScaled) {
    try {
        app.enableQE();
        var proj = app.project;
        var seq = proj.activeSequence; // The sequence we start with

        if (!seq) return "Error: Open a sequence first.";

        var protectKeyframes = (skipKeyframes === true || skipKeyframes === "true");
        var shouldRename = (renameSeq === true || renameSeq === "true");
        var shouldDuplicate = (duplicateSeq === true || duplicateSeq === "true");
        var markOver100 = (markOverScaled === true || markOverScaled === "true"); 

        var targetResString = targetW + "x" + targetH;
        var originalName = seq.name; 
        
        // --- SMART RENAMING LOGIC ---
        var cleanName = originalName.replace(/\s*\[?\b\d{3,5}x\d{3,5}\b\]?\s*/g, " ").replace(/^\s+|\s+$/g, "");
        var newName = cleanName; 
        
        if (shouldRename) {
            if (namingConvention === "prefix") {
                newName = targetResString + " " + cleanName;
            } else {
                newName = cleanName + " " + targetResString;
            }
        } else if (shouldDuplicate) {
            newName = cleanName + " (Scaled)";
        }

        var foundClone = null;

        // --- SECURE BACKUP LOGIC ---
        if (shouldDuplicate) {
            var existingIDs = {};
            for(var s = 0; s < proj.sequences.numSequences; s++) {
                 existingIDs[proj.sequences[s].sequenceID] = true;
            }

            // Clone the sequence. (Premiere automatically moves UI focus to this clone!)
            if (seq.clone()) {
                 for(var s = 0; s < proj.sequences.numSequences; s++) {
                      var candidate = proj.sequences[s];
                      if (!existingIDs[candidate.sequenceID]) {
                           foundClone = candidate;
                           break;
                      }
                 }
            }
        }

        // --- SAFE RENAMING ---
        // 1. Rename the original sequence (which we will upscale) to free up the original name
        if (shouldRename || shouldDuplicate) {
            seq.name = newName; 
        }
        // 2. Rename the clone to the exact original name (This is the backup!)
        if (shouldDuplicate && foundClone) {
            foundClone.name = originalName; 
        }

        // --- CHANGE SETTINGS ON TARGET SEQUENCE ---
        var settings = seq.getSettings();
        settings.videoFrameWidth = parseInt(targetW);
        settings.videoFrameHeight = parseInt(targetH);
        seq.setSettings(settings);

        // --- SCALING LOGIC ---
        var tracks = seq.videoTracks;
        var markers = seq.markers;
        var clipsUpdated = 0;
        var clipsSkipped = 0;
        var lockedTracks = 0;
        var overScaledCount = 0; 

        for (var i = 0; i < tracks.numTracks; i++) {
            var track = tracks[i];
            
            if (track.isLocked()) {
                lockedTracks++;
                continue; 
            }
            
            for (var j = 0; j < track.clips.numItems; j++) {
                var clip = track.clips[j];
                
                if (scope === "selected" && !clip.isSelected()) continue; 

                var components = clip.components;
                if (components) {
                    for (var k = 0; k < components.numItems; k++) {
                        var component = components[k];
                        
                        if (component.displayName === "Motion") {
                            var scaleProp = component.properties.getParamForDisplayName("Scale");
                            var posProp = component.properties.getParamForDisplayName("Position");
                            
                            var hasKeyframes = ((scaleProp && scaleProp.isTimeVarying()) || (posProp && posProp.isTimeVarying()));

                            if (protectKeyframes && hasKeyframes) {
                                clipsSkipped++;
                                var newMarker = markers.createMarker(clip.start.seconds);
                                newMarker.name = "Auto reScaler: Skipped";
                                newMarker.comments = "Keyframes detected on Scale or Position.";
                                try { newMarker.setColorByIndex(4); } catch(e) {}
                                continue; 
                            }

                            if (scaleProp && !hasKeyframes) {
                                try {
                                    var currentScale = scaleProp.getValue();
                                    var newScale = currentScale * parseFloat(scaleFactor);
                                    
                                    scaleProp.setValue(newScale);
                                    clipsUpdated++;

                                    if (newScale > 100.0) {
                                        overScaledCount++;
                                        if (markOver100) {
                                            var lossMarker = markers.createMarker(clip.start.seconds);
                                            lossMarker.name = "Auto reScaler: >100% Scale";
                                            lossMarker.comments = "Scale is " + Math.round(newScale) + "%. Check for quality loss.";
                                            try { lossMarker.setColorByIndex(4); } catch(e) {}
                                        }
                                    }

                                } catch(err) {}
                            }
                        }
                    }
                }
            }
        }
        
        // --- FORMATTED OUTPUT MESSAGE ---
        var finalMsg = "Success! Scaled " + clipsUpdated + " clips.";
        if (shouldDuplicate) finalMsg = "Backup created in Bin! " + finalMsg;
        if (overScaledCount > 0) finalMsg += "\n" + overScaledCount + " clips over 100% scale.";
        if (clipsSkipped > 0) finalMsg += "\n(" + clipsSkipped + " skipped for keyframes.)";

        // --- SAFE UI TAB SWITCHING ---
        // Force Premiere to snap the timeline back to the upscaled sequence.
        if (shouldDuplicate) {
            try {
                proj.openSequence(seq);
            } catch (e) {
                // If Premiere resists, swallow the crash and add a gentle note to the user.
                finalMsg += "\n(Note: Please double-click the newly scaled sequence in the bin to open it.)";
            }
        }
        
        return finalMsg;
        
    } catch (error) {
        // If anything else fails, print the exact line and error to the UI instead of crashing
        return "Script Error line " + error.line + ": " + error.message;
    }
}