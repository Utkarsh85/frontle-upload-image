require('cropper/dist/cropper.css');
require('cropper');

var imageUpload= function (options) {

	var required=['input','display','uploadTrigger','uploadHeaders','uploadUrl','success','error'];

	if(!options.hasOwnProperty('input') || !options.hasOwnProperty('uploadTrigger') || !options.hasOwnProperty('display') || !options.hasOwnProperty('uploadUrl') || !options.hasOwnProperty('uploadHeaders') || !options.hasOwnProperty('uploadHeaders') || !options.hasOwnProperty('success') || !options.hasOwnProperty('error'))
		throw {msg:'Required properties'+required.join(',') +' not found.'};

	$(options.display).addClass('no-image-added');

	var Upload = {

		inputChangeHandle: function (ctx,next) {
			//Profile Input Change Handler
			var cropperOptions= options.cropperOptions || {
				aspectRatio:1,
				movable:false,
				scalable:false,
				zoomable:false,
				// autoCrop:true,
			};

			$(options.input).on('change',function (val) {
				var FR= new FileReader();
				FR.onload = function(e) {
					$(options.display).removeClass('no-image-added');
					$(options.display).cropper(cropperOptions);
					$(options.display).cropper('replace',e.target.result);
			    }; 
			    FR.readAsDataURL( val.target.files[0] );
			});

			next();
		},

		uploadProfileImage: function (val) {
			return $.ajax({
			    url: options.uploadUrl,
			    type:'post',
			    data: val,
			    // THIS MUST BE DONE FOR FILE UPLOADING
			    contentType: false,
			    processData: false,
			    headers:options.uploadHeaders
			    // ... Other options like success and etc
			}).promise();
		},

		uploadHandler: function (ctx,next) {
			
			var uploadButtonPressed= false;		

			//Upload Button Click Handler
			$(options.uploadTrigger).click(function () {
				new Promise(function (resolve,reject) {
					if($(options.display).hasClass('no-image-added'))
						return resolve(false);
					else
					{
						return resolve(true);
					}
				})
				.then(function (val) {
					if(val)
					{
						var ImgData=$(options.display).cropper('getData');
						var formData = new FormData();
						formData.append('w', ImgData.width);
						formData.append('h', ImgData.height);
						formData.append('top', ImgData.x);
						formData.append('left', ImgData.y);
						// Main magic with files here
						formData.append('image', $(options.input)[0].files[0]);
						if(options.name)
							formData.append('name', options.name);

						return formData;
					}
					else return null;
				})
				.then(function (val) {
					if(uploadButtonPressed === false && val)
					{
						uploadButtonPressed= true;
						return Upload.uploadProfileImage(val);
					}
					else
						return null;
				})
				.then(function (val) {
					if(val)
					{
						options.success(val);
						uploadButtonPressed= false;
					}
				})
				.catch(function (err) {
					options.error(err);
					uploadButtonPressed= false;
				});
			});

			next();
		}
	};


	return [
		Upload.inputChangeHandle,
		Upload.uploadHandler
	];
};

module.exports = imageUpload;