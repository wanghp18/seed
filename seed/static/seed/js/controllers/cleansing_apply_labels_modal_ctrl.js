/*
 * :copyright (c) 2014 - 2015, The Regents of the University of California, through Lawrence Berkeley National Laboratory (subject to receipt of any required approvals from the U.S. Department of Energy) and contributors. All rights reserved.
 * :author
 */
angular.module('BE.seed.controller.cleansing_apply_labels_modal_ctrl', [])
.controller('cleansing_apply_labels_modal_ctrl', [
  '$scope',
  '$uibModalInstance',
  'errorLabels',
  function(
    $scope,
    $uibModalInstance,
    errorLabels
    ){

    $scope.errorLabels = errorLabels;

    $scope.cancel = function (){
    	$uibModalInstance.dismiss('cancel');
    };

    $scope.done = function() {
    	$uibModalInstance.close();
    };

}]);
