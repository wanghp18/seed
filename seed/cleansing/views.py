# !/usr/bin/env python
# encoding: utf-8
"""
:copyright (c) 2014 - 2015, The Regents of the University of California, through Lawrence Berkeley National Laboratory (subject to receipt of any required approvals from the U.S. Department of Energy) and contributors. All rights reserved.  # NOQA
:author
"""
import csv

from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseBadRequest, HttpResponseForbidden

from seed.cleansing.models import Cleansing
from seed.data_importer.models import ImportFile
from seed.decorators import ajax_request, get_prog_key
from seed.lib.superperms.orgs.models import Organization as SuperOrganization, OrganizationUser
from seed.models import StatusLabel
from seed.utils.api import api_endpoint
from seed.utils.cache import get_cache_raw, get_cache


# TODO The API is returning on both a POST and GET. Make sure to authenticate.


@api_endpoint
@ajax_request
@login_required
def get_cleansing_results(request):
    """
    Retrieve the details of the cleansing script. Also return any labels that
    were created as a result of these cleansing errors.
    """
    import_file_id = request.GET.get('import_file_id')
    organization_id = request.GET.get('organization_id')

    # Confirm that the organization exists and the user is a member
    try:
        org = SuperOrganization.objects.get(pk=organization_id)
        OrganizationUser.objects.get(organization=org, user=request.user)
    except (SuperOrganization.DoesNotExist, OrganizationUser.DoesNotExist):
        return HttpResponseForbidden()

    # Confirm this import file exists and the file belongs to the organization.
    try:
        ImportFile.objects.get(
            pk=import_file_id,
            import_record__super_organization=org
        )
    except ImportFile.DoesNotExist:
        return HttpResponseBadRequest('Invalid import file id.')

    cleansing_results = get_cache_raw(Cleansing.cache_key(import_file_id))
    label_names = []

    # add in additional fields for view
    for i, row in enumerate(cleansing_results):
        for j, result in enumerate(row['cleansing_results']):

            # Only return labels that are a product of an error.
            if result['severity'] == 'error':
                label_names.append(result['message'])

            if result['field'] in Cleansing.ASSESSOR_FIELDS_BY_COLUMN:
                result['field'] = Cleansing.ASSESSOR_FIELDS_BY_COLUMN[result['field']]['title']

    label_names = list(set(label_names))
    labels = StatusLabel.objects.filter(name__in=label_names, super_organization=org)

    return {
        'status': 'success',
        'message': 'Cleansing complete',
        'progress': 100,
        'data': {
            'cleansing_results': cleansing_results,
            'labels': [l.to_dict() for l in labels]
        }
    }


@api_endpoint
@ajax_request
@login_required
def get_progress(request):
    """
    Return the progress of the cleansing.
    """

    import_file_id = request.GET.get('import_file_id')
    return get_cache(get_prog_key('get_progress', import_file_id))['progress']


@api_endpoint
@ajax_request
@login_required
def get_csv(request):
    """
    Download a csv of the results.
    """

    import_file_id = request.GET.get('import_file_id')
    cleansing_results = get_cache_raw(Cleansing.cache_key(import_file_id))
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="Data Cleansing Results.csv"'

    writer = csv.writer(response)
    writer.writerow(['Address Line 1', 'PM Property ID', 'Tax Lot ID', 'Custom ID', 'Field',
                     'Error Message', 'Severity'])
    for row in cleansing_results:
        for result in row['cleansing_results']:
            field = result['field']
            if field in Cleansing.ASSESSOR_FIELDS_BY_COLUMN:
                field = Cleansing.ASSESSOR_FIELDS_BY_COLUMN[field]['title']
            writer.writerow([
                row['address_line_1'],
                row['pm_property_id'],
                row['tax_lot_id'],
                row['custom_id_1'],
                field,
                result['message'],
                result['severity']
            ])

    return response
