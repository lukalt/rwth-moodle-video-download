// this scrip is injected to the iframe which contains the opencast video player
window.addEventListener("load", function(){
    paella.opencast.getEpisode().then(function(ep) { // wait for the episode to be loaded
		var id = ep.id;
		var tracks = ep.mediapackage.media.track;
		var downloads = [];
		for(var i = 0; i < tracks.length; i++) {
			if(tracks[i].mimetype !== "video/mp4" || tracks[i].transport == "RTMP") {
				continue;
			}
			var tags = tracks[i].tags.tag;
			for(var j = 0; j < tags.length; j++) {
				if(tags[j].endsWith("-quality") !== -1) { // only consider tracks with a tag of the format "...-quality"
					downloads.push({resolution: [tags[j].split("p-")[0]], url: tracks[i].url, size_bytes: tracks[i].size});
					break;
				}
			}
		}
		var obj = {"id": id, "videos": downloads};
		parent.postMessage("DOWNLOADS:" + JSON.stringify(obj), "*");
	}, function(err) {
		console.log(err);
		parent.postMessage("DOWNLOADS:ERROR", "*");
	});
});
