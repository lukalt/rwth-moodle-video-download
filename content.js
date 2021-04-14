
function formatSize(bytes) {
	if(bytes < 1024) {
		return "1 KiB";
	} else if(bytes < 1024 * 1024) {
		return Math.round((bytes / 1024) / 1024) + " KiB";
	} else if(bytes < 1024 * 1024 * 1024) {
		return Math.round((bytes / 1024) / 1024) + " MiB";
	} else {
		return (Math.round((bytes / 1024) / 1024 / 1024 * 10) / 10).toLocaleString() + " GiB";
	}
}
function sortByResolution(videos) {
	videos.sort(function(a,b) {
		return a.resolution - b.resolution;
	});
}

function createDownloadBar(videos) {
	// remove any download bar if it already is present in the dom
	if (document.contains(document.getElementById("extension-video-download-bar"))) {
		document.getElementById("extension-video-download-bar").remove();
	} 
	
	// build the html for our download bar
	var html = "<div id=\"extension-video-download-bar\" class=\"dropdown\"><a class=\"btn btn-secondary dropdown-toggle\" role=\"button\" data-toggle=\"dropdown\">" + chrome.i18n.getMessage("downloadButton") + "</a><div class=\"dropdown-menu\"> ";
	for(var i = 0; i < videos.length; i++) {
	  var video = videos[i];
	  html += "<a class=\"dropdown-item\" title=\"Download " + video.resolution + "p\" href=\"" + video.url + "\" target=\"_blank\" download>" + video.resolution + "p (" + formatSize(video.size_bytes) + ")</a> ";
	}
	html += "</div></div>";
	
	// add this html just after the h2 in the dom (usually the title of the video)
	document.getElementsByTagName("h2")[0].insertAdjacentHTML('afterend', html);
}
// Wait for the child iFrame to send a message with video urls
window.addEventListener("message", function(e) {
	if(e.data.startsWith("DOWNLOADS:")) {
		// the message is prefixed with "DOWNLOADS:" and followed with a JSON object containing download urls for different video resolutions
		var suff = e.data.split("DOWNLOADS:")[1];
		if(suff === "ERROR") {
			document.getElementsByTagName("h2")[0].insertAdjacentHTML('afterend', "<p style=\"color:red;\">" + chrome.i18n.getMessage("downloadError") + "</p>");
			return;
		}
		var videos = JSON.parse(suff);
		if(videos.length === 0) {
			document.getElementsByTagName("h2")[0].insertAdjacentHTML('afterend', "<p style=\"color:red;\">" + chrome.i18n.getMessage("noDownloads") + "</p>");
			return;
		}
		sortByResolution(videos);
		createDownloadBar(videos);
	}
});