//https://www.tukui.org/downloads/elvui-11.06.zip
//https://git.tukui.org/elvui/elvui/blob/master/ElvUI/ElvUI.toc
//C:\WoW\_retail_\Interface\addons\ElvUI
//Line 3
var curl = require('curlrequest');
var dl = require('download-git-repo');
var fs = require('fs');
var copydir = require('copy-dir')
const { COPYFILE_EXCL } = fs.constants;


function getLocalVer() {
    return new Promise((resolve, reject)=>{
        var path = "C:/WoW/_retail_/Interface/addons/ElvUI/ElvUI.toc"

        var rs = fs.createReadStream(path, {encoding: 'utf8'});
        rs.on('data', (data)=> {
            var ver = data.split('\n')[2];

            ver = ver.split(" ");
            ver = ver[2]
            // console.log("LOCAL: "+ver);
            localVer = ver;
            resolve(ver);
        })
        .on('close',  ()=> {
         })
        .on('error',  (err)=> {
            reject(err);
            console.error(err);
        })
    })
}

function getServerVerFromChangelog(){
    return new Promise((resolve, reject)=>{
        /** CHANGELOG URL **/
        var url = "https://git.tukui.org/elvui/elvui/raw/master/CHANGELOG.md"

        var options = {
        url: url,
        verbose: true,
        stderr: true
        }

        curl.request(options,  (err, data, meta)=> {
             var ver = data.split('\n')[0];
             ver = ver.split(" ");
             ver = ver[2]
             // console.log("SERVER: " +ver);
             serverVer = ver
             resolve(ver);
        });
    })
}

function getServerVer(){
    return new Promise((resolve, reject)=>{
        /** TOC URL **/
        var url = "https://git.tukui.org/elvui/elvui/raw/master/ElvUI/ElvUI.toc"

        var options = {
        url: url,
        // verbose: true,
        // stderr: true
        }

        curl.request(options,  (err, data, meta)=> {
            var ver = data.split('\n')[2];

            ver = ver.split(" ");
            ver = ver[2]
             // console.log("SERVER: " +ver);
             serverVer = ver
             resolve(ver);
        });
    })
}

function compareResults() {
    return new Promise((resolve, reject)=>{
        if (localVer==serverVer){
            console.log("ElvUI is up-to-date.")
            resolve(0)
        } else {
            console.log("Detects local version of "+localVer)
            console.log("Detects server version of "+serverVer)
            console.log("ElvUI is out of date.")
            console.log("ElvUI is updating...")
            
            // dl("direct:https://git.tukui.org/elvui/elvui/-/archive/master/elvui-master.zip","./temp", (err)=>{ //THIS URL WORKS PERFECTLY
            // dl("direct:https://git.tukui.org/elvui/elvui.git#master","./temp", { clone: true }, (err)=>{ //THIS TEST URL DOES BUT PROVIDES .GIT folder
            // dl("direct:https://git.tukui.org/elvui/elvui.git","./temp", (err)=>{  //THIS TEST URL DOESN'T WORK
            dl("direct:https://git.tukui.org/elvui/elvui/-/archive/master/elvui-master.zip","./temp", (err)=>{
                if (err) {
                    // console.log(err);
                    resolve(1)
                } else {
                    resolve(2)
                }
            })
        }
    })
}

function copyRepo(){
    var src= "./temp";
    // var dest="./tempCopy"
    var dest= "C:/WoW/_retail_/Interface/addons/";
    copydir(src, dest, (err)=>{
      if(err){
        // console.error(err);
        console.log("There was a problem with the request.")
      } else {
        console.log('Success! ElvUI Updated.');
      }
    })
}

getLocalVer().then(()=>{
    return getServerVer();
}).then(()=>{
    return compareResults().then((bool)=>{
        // console.log(bool)
        if (bool==2){
            return copyRepo();
        } else if (bool==1) {
            console.error("There was a problem with the request.")
        }
    });
})
