#!/bin/sh

#
# compare permissions defined in a local package.json file to those in okapi
# this assumes stripes-cli is installed and has a valid login token cached
#
# usage:
#    $0 path/to/package.json                 // to check all permissions found therein
#    $0 path/to/package.json some.permission // to check some.permission only
#


#
LOCAL_JSON=$1


#
# filter a package.json for a list of permissionNames
#
LOCAL=`cat $LOCAL_JSON | jq '.stripes.permissionSets'`


# are we checking one permission, or all permissions?
if [ $# -eq 2 ]; then
    LOCAL_NAMES=$2
else
    LOCAL_NAMES=`echo $LOCAL | jq -r '.[] | .permissionName'`
fi


for P in $LOCAL_NAMES; do
    OKAPI_SP=`stripes okapi get perms/permissions?query=permissionName==${P} --okapi https://folio-snapshot-okapi.aws.indexdata.com | jq '.permissions[0].subPermissions'`
    if [ "$OKAPI_SP" == "null" ] || [ -z "$OKAPI_SP" ]; then OKAPI_SP='[]'; fi;

    LOCAL_SP=`echo $LOCAL | jq --arg p $P '.[] | select(.permissionName==\$p).subPermissions'`
    if [ "$LOCAL_SP" == "null" ] || [ -z "$LOCAL_SP" ]; then LOCAL_SP='[]'; fi;


    echo "{ \"okapi\": $OKAPI_SP, \"local\": $LOCAL_SP }" | jq -e '(.okapi - .local | length==0) and (.local - .okapi | length==0)' 2>&1 1>/dev/null
    if [ $? -ne 0 ]; then
        O_OKAPI=`echo "{ \"okapi\": $OKAPI_SP, \"local\": $LOCAL_SP }" | jq -c '.okapi - .local'`
        O_LOCAL=`echo "{ \"okapi\": $OKAPI_SP, \"local\": $LOCAL_SP }" | jq -c '.local - .okapi'`

        echo "* $P"
        echo "    only local: $O_LOCAL"
        echo "    only okapi: $O_OKAPI"
    else
        echo "  $P"
    fi
done

