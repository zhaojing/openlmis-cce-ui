/*
 * This program is part of the OpenLMIS logistics management information system platform software.
 * Copyright © 2017 VillageReach
 *
 * This program is free software: you can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License as published by the Free Software Foundation, either
 * version 3 of the License, or (at your option) any later version.
 *  
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 
 * See the GNU Affero General Public License for more details. You should have received a copy of
 * the GNU Affero General Public License along with this program. If not, see
 * http://www.gnu.org/licenses.  For additional information contact info@OpenLMIS.org. 
 */

(function() {

    'use strict';

    /**
     * @ngdoc controller
     * @name admin-cce-upload.controller:CceUploadController
     *
     * @description
     * Controller for uploading CCE catalog item.
     */
    angular
        .module('admin-cce-upload')
        .controller('CceUploadController', controller);

    controller.$inject = ['catalogItemService', 'notificationService', 'loadingModalService'];

    function controller(catalogItemService, notificationService, loadingModalService) {

        var vm = this;

        vm.upload = upload;

        /**
         * @ngdoc property
         * @propertyOf admin-cce-upload.controller:CceUploadController
         * @name file
         * @type {Object}
         *
         * Holds csv file.
         * @description
         */
        vm.file = undefined;

        /**
         * @ngdoc method
         * @methodOf admin-cce-upload.controller:CceUploadController
         * @name upload
         *
         * @description
         * Uploads csv file with catalog item to the server.
         */
        function upload() {
            if (!vm.file) {
                notificationService.error('adminCceUpload.fileIsNotSelected');
            } else {
                loadingModalService.open();
                catalogItemService.upload(vm.file).then(function() {
                    notificationService.success('adminCceUpload.uploadSuccess');
                }, function() {
                    notificationService.error('adminCceUploadUpload.uploadFailed');
                }).finally(loadingModalService.close);
            }
        }
    }

})();