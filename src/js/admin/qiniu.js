let qiniu = require('qiniu-js');
let eventHub = require('./eventHub.js');
let uploader = Qiniu.uploader({
        runtimes: 'html5',    //上传模式,依次退化
        browse_button: 'upload',       //上传选择的点选按钮，**必需**
        uptoken_url : 'http://localhost:8888/uptoken',
        domain: 'pawftvtj8.bkt.clouddn.com',   //bucket 域名，下载资源时用到，**必需**
        get_new_uptoken: false,  //设置上传文件的时候是否每次都重新获取新的token
        max_file_size: '40mb',           //最大文件体积限制
        dragdrop: true,                   //开启可拖曳上传
        drop_element: 'mainPanel',        //拖曳上传区域元素的ID，拖曳文件或文件夹后可触发上传
        auto_start: true,                 //选择文件后自动上传，若关闭需要自己绑定事件触发上传
        init: {
            'FilesAdded': function(up, files) {
                plupload.each(files, function(file) {
                    // 文件添加进队列后,处理相关的事情
                    let musicInfo = file.name.split('-');
                    let name = musicInfo[1]? musicInfo[1].trim().slice(0, musicInfo[1].lastIndexOf('.') - 1) : undefined;
                    let artist = musicInfo[0]? musicInfo[0].trim() : undefined;
                    let size = parseFloat(file.size / 1024 / 1024).toFixed(2) + 'MB';
                    let saveStatus = '上传中';
                    let id = file.id
                    let data = {
                        name: name,
                        artist: artist,
                        size: size,
                        saveStatus: saveStatus,
                        id: id
                    }

                    eventHub.emit('uploadstart', data);
                });
            },
            'BeforeUpload': function(up, file) {
                // 每个文件上传前,处理相关的事情
            },
            'UploadProgress': function(up, file) {
                // 每个文件上传时,处理相关的事情
            },
            'FileUploaded': function(up, file, info) {
                // 每个文件上传成功后,处理相关的事情
                let domain = up.getOption('domain');
                let res = JSON.parse(info.response);
                let sourceLink = 'http://' + domain + '/' + encodeURIComponent(res.key);

                let data = {
                    link: sourceLink,
                    id: file.id
                }
                eventHub.emit('uploadover', data);
            },
            'Error': function(up, err, errTip) {
                //上传出错时,处理相关的事情
            },
            'UploadComplete': function() {
                //队列文件处理完毕后,处理相关的事情
            },
        }
    });
