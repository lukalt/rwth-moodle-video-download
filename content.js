
var lectureName;
var trimmedLectureName;
var agreementKey;
var accessPermmited = false;

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

function createDownloadBar(id, videos) {
	// remove any download bar if it already is present in the dom
	if (document.contains(document.getElementById("extension-video-download-bar-" + id))) {
		document.getElementById("extension-video-download-bar-" + id).remove();
	} 
	if (document.contains(document.getElementById("agreement-alert"))) {
		document.getElementById("agreement-alert").remove();
	} 
	
	// build the html for our download bar
	var html = "<div id=\"extension-video-download-bar-" + id + "\" class=\"extension-video-download-bars\"";
	if(!accessPermmited) {
		html += " style=\"display:none\"";
	}
	html += " =\"dropdown\"><a class=\"btn btn-secondary dropdown-toggle\" role=\"button\" data-toggle=\"dropdown\">" + chrome.i18n.getMessage("downloadButton") + "</a><div class=\"dropdown-menu\"> ";
	for(var i = 0; i < videos.length; i++) {
	  var video = videos[i];
	  html += " <a class=\"dropdown-item\" title=\"Download " + video.resolution + "p\" href=\"" + video.url + "\" target=\"_blank\" download>" + video.resolution + "p";
	  if(video.size_bytes > 0) {
		html += " (" + formatSize(video.size_bytes) + ")";
	  }
	  html += "</a> ";
	}
	html += "</div></div>";
	
	if(!accessPermmited) {
		html += "<div class=\"alert alert-info agreement-alerts\">" + chrome.i18n.getMessage("agreement");
		html += "<button class=\"btn btn-sm btn-secondary\" id=\"agreement-btn-" + id + "\">" + chrome.i18n.getMessage("agreementButton") + "</button></div>";
	}
	// add this html just after the h2 in the dom (usually the title of the video)
	var iframes = document.getElementsByTagName("iframe");
	for(var i = 0; i < iframes.length; i++) {
		var iframe = iframes[i];
		if(iframe.src && iframe.src.indexOf(id) >= 0) {
			iframe.parentElement.parentElement.parentElement.insertAdjacentHTML('beforebegin', html);
			if(!accessPermmited) {
				document.getElementById("agreement-btn-" + id).addEventListener("click", function() {
					var els1 = document.getElementsByClassName("agreement-alerts");
					for(var j = 0; j < els1.length; j++) {
						els1[j].remove();
					}
					var d = {};
					d[agreementKey] = true;
					chrome.storage.local.set(d, function() {
					  var els = document.getElementsByClassName("extension-video-download-bars");
					  for(var i = 0; i < els.length; i++) {
						  els[i].style.display = "block";
					  }
					});
				});
			}
			break;
		}
	}

}



// Wait for the child iFrame to send a message with video urls
window.addEventListener("message", function(e) {	
	lectureName = document.getElementsByTagName("h1")[0].innerText;
	trimmedLectureName = lectureName.replace(/[^a-z0-9]/gmi, " ").replace(/\s+/g, "_").toLowerCase();
	agreementKey = "rwth.moodle.extension.permission." + trimmedLectureName;
	if(e.data.startsWith("DOWNLOADS:")) {
		// the message is prefixed with "DOWNLOADS:" and followed with a JSON object containing download urls for different video resolutions
		var suff = e.data.split("DOWNLOADS:", 2)[1];
		if(suff === "ERROR") {
			document.getElementsByTagName("h2")[0].insertAdjacentHTML('afterend', "<p style=\"color:red;\">" + chrome.i18n.getMessage("downloadError") + "</p>");
			return;
		}
		var obj = JSON.parse(suff);
		var videos = obj.videos;
		if(videos.length === 0) {
			document.getElementsByTagName("h2")[0].insertAdjacentHTML('afterend', "<p style=\"color:red;\">" + chrome.i18n.getMessage("noDownloads") + "</p>");
			return;
		}
		sortByResolution(videos);
		var d = [];
		d.push(agreementKey);
		chrome.storage.local.get(d, function(result) {
		   accessPermmited = result != {} && result[agreementKey];
		   createDownloadBar(obj.id, videos);
		});
	}
});