var curl = require("curlrequest");
var dl = require("download-git-repo");
var fs = require("fs");
var copydir = require("copy-dir");
const { COPYFILE_EXCL } = fs.constants;

function getLocalVer() {
	return new Promise((resolve, reject) => {
		//var path = "C:/WoW/_retail_/Interface/addons/ElvUI/ElvUI.toc";
		var path = "C:/WoW/_classic_/Interface/AddOns/ElvUI/ElvUI.toc";
		var rs = fs.createReadStream(path, { encoding: "utf8" });

		rs.on("data", data => {
			var ver = data.split("\n")[2];

			ver = ver.split(" ");
			ver = ver[2];
			localVer = ver;
			resolve(ver);
		}).on("error", err => {
			localVer = "";
			reject(err);
			console.error(err);
		});
	});
}

function getServerVer() {
	return new Promise((resolve, reject) => {
		//var url = "https://git.tukui.org/elvui/elvui-classic/raw/master/ElvUI/ElvUI.toc";
		var url =
			"https://git.tukui.org/elvui/elvui-classic/raw/master/ElvUI/ElvUI.toc";
		var options = {
			url: url
		};

		curl.request(options, (err, data, meta) => {
			var ver = data.split("\n")[2];

			ver = ver.split(" ");
			ver = ver[2];
			serverVer = ver;
			resolve(ver);
		});
	});
}

function compareResults() {
	return new Promise((resolve, reject) => {
		if (localVer == serverVer) {
			console.log("ElvUI is up-to-date.");
			resolve(0);
		} else {
			console.log("Local version: " + localVer);
			console.log("Server version: " + serverVer);
			console.log("ElvUI is out of date.");
			console.log("ElvUI is updating...");
			// "direct:https://git.tukui.org/elvui/elvui/-/archive/master/elvui-master.zip",
			dl(
				"direct:https://git.tukui.org/elvui/elvui-classic/-/archive/master/elvui-classic-master.zip",
				"./temp",
				err => {
					if (err) {
						resolve(1);
					} else {
						resolve(2);
					}
				}
			);
		}
	});
}

function copyRepo() {
	var src = "./temp";
	// var dest = "C:/WoW/_retail_/Interface/addons/";
	var dest = "C:/WoW/_classic_/Interface/AddOns/";
	copydir(src, dest, err => {
		if (err) {
			console.log("There was a problem with the request.");
		} else {
			console.log("Success! ElvUI Updated.");
		}
	});
}

getLocalVer()
	.then(() => {
		return getServerVer();
	})
	.then(() => {
		return compareResults().then(bool => {
			if (bool == 2) {
				return copyRepo();
			} else if (bool == 1) {
				console.error("There was a problem with the request.");
			}
		});
	});
