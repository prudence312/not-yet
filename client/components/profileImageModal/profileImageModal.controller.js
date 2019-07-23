'use strict';

import angular from 'angular';

export class ProfileImageModalController {
  title = 'Select Profile Picture';
  isVideo = false;
  isGravatar = false;
  isUploadPic = false;

  /*@ngInject*/
  constructor($uibModalInstance, gravatar) {
    'ngInject';
    this.$uibModalInstance = $uibModalInstance;
    this.gravatar = gravatar;
  }

  $onInit() {}

  takePic() {
    this.isVideo = true;
    this.isGravatar = false;
    this.isUploadPic = false;
    var video = document.getElementById('video');

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(function(stream) {
          video.srcObject = stream;
        });
    }
  }

  fromgravatar() {
    this.isGravatar = true;
    this.isVideo = false;
    this.isUploadPic = false;
  }

  uploadPic() {
    this.isUploadPic = true;
    this.isGravatar = false;
    this.isVideo = false;
  }

  // close modal
  close() {
    this.$uibModalInstance.dismiss('close');
  }

  // save modal
  save() {}
}

export default angular
  .module('directives.profileImageModal', [])
  .controller('profileImageModal', ProfileImageModalController).name;
