/*
 * :copyright (c) 2014 - 2015, The Regents of the University of California, through Lawrence Berkeley National Laboratory (subject to receipt of any required approvals from the U.S. Department of Energy) and contributors. All rights reserved.
 * :author
 */
angular.module('BE.seed.controller.cleansing_apply_labels_modal_ctrl', [])
.controller('cleansing_apply_labels_modal_ctrl', [
  '$scope',
  '$uibModalInstance',
  'errorLabels',
  'cleansingResults',
  'label_service',
  function(
    $scope,
    $uibModalInstance,
    errorLabels,
    cleansingResults,
    label_service
    ){


    /* DEFINE SCOPE AND LOCAL VARS  */
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */   

    //keep track of process of applying labels
    $scope.apply_labels_complete = false;
    $scope.apply_labels_error = false;

    //A list of labels for cleansing errors in this data set.
    //Note that some labels might be 'temporary' as they haven't
    //been created on the server yet. 
    $scope.errorLabels = errorLabels;

    //cleansingResults array: contains objects with a building "id" and a "cleansingResults".
    //This child "cleansingResults" array contains objects with an error "message" property.
    //In this controller, we're only concerned with these "id" and "message" properties.
    $scope.cleansingResults = cleansingResults;




    /* HANDLE UI INTERACTIONS */
    /* ~~~~~~~~~~~~~~~~~~~~~~ */   

    /*  User has selected 'Cancel' on modal,
        so don't apply any labels */
    $scope.cancel = function (){
    	$uibModalInstance.dismiss('cancel');
    };

    /* User has clicked 'Done' button after applying labels */
    $scope.done = function() {
        $uibModalInstance.close();    
    };

    /*  Use has clicked 'Apply Now' on modal, which means
        apply all labels they have selected */
    $scope.apply_now = function() {

        $scope.apply_labels_complete = false;
        $scope.apply_labels_error = false;

        //Get data in right format for service
        var bulk_update_labels_data = build_bulk_update_labels_data();  

        //TODO: show progress

        //do call
        label_service.bulk_update_building_labels(bulk_update_labels_data).then(
            function(data){
                //if labels were applied successfully, 
                //switch mode of modal to show success message and 'done'
                $scope.apply_labels_complete = true;                
            },
            function(data, status) {
                // Rejected promise, error occurred.
                // TODO: Make this nicer...just doing alert for development
                alert('Error updating building labels: ' + status);
                $scope.apply_labels_error = true;
            }       	
        );
    };



    /* 'PRIVATE' HELPER FUNCTIONS */
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~ */   


    /* Build an array of objects defining labels and the buildings they should be applied to */
    function build_bulk_update_labels_data(){

        var bulk_update_labels_data = [];
        var selectedLabels = _.filter(errorLabels, function(label){
            return label.is_checked_add===true;
        });

        _.each(selectedLabels, function(label){
            
            var update_label_data = {
                label_id: label.id,
                building_ids: []
            };

            //collect all building ids this label should be applied to
            _.each($scope.cleansingResults, function(cleansingResult){
                if (_.findWhere(cleansingResult.cleansing_results, {message: label.name})){
                    update_label_data.building_ids.push(cleansingResult.id);
                }
            });

            //assign defaults for a new label created during data cleansing
            if (update_label_data.label_id===null){
                update_label.label_name = label.name;                 
                update_label_data.color = "red";
                update_label_data.label = "danger";
            }

            bulk_update_labels_data.push( update_label_data );
        
        });

        return bulk_update_labels_data;
    }

   



}]);
