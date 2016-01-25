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

    //A list of labels for cleansing errors in this data set.
    //Note that some labels might be 'temporary' as they haven't
    //been created on the server yet. 
    $scope.errorLabels = errorLabels;

    /*  User has selected 'Cancel' on modal,
        so don't apply any labels */
    $scope.cancel = function (){
    	$uibModalInstance.dismiss('cancel');
    };

    /*  Use has clicked 'Done' on modal, which means
        apply all labels they have selected */
    $scope.done = function() {
    	$uibModalInstance.close();
    };



}]);
