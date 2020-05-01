<?php

$modules = [
  'ui-acquisition-units',
  'ui-agreements',
  'ui-calendar',
  'ui-checkin',
  'ui-checkout',
  'ui-circulation',
  'ui-data-import',
  'ui-data-export',
  'ui-developer',
  'ui-eholdings',
  'ui-erm-usage',
  'ui-finance',
  'ui-finc-config',
  'ui-finc-select',
  'ui-inventory',
  'ui-invoice',
  'ui-licenses',
  'ui-local-kb-admin',
  'ui-marccat',
  'ui-myprofile',
  'ui-notes',
  'ui-orders',
  'ui-organizations',
  'ui-plugin-find-agreement',
  'ui-plugin-find-contact',
  'ui-plugin-find-erm-usage-data-provider',
  'ui-plugin-find-instance',
  'ui-plugin-find-interface',
  'ui-plugin-find-license',
  'ui-plugin-find-organization',
  'ui-plugin-find-po-line',
  'ui-plugin-find-user',
  'ui-receiving',
  'ui-requests',
  'ui-search',
  'ui-servicepoints',
  'ui-tags',
  'ui-tenant-settings',
  'ui-users',
  'ui-vendors',

  'stripes-components',
  'stripes-connect',
  'stripes-core',
  'stripes-erm-components',
  'stripes-data-transfer-components',
  'stripes-final-form',
  'stripes-form',
  'stripes-logger',
  'stripes-smart-components',
  'stripes-util',
  'stripes-cli',

  'platform-complete',
  'platform-core',
  'platform-erm',

];

$module = $_GET['module'];
$branch = $_GET['branch'] ? $_GET['branch'] : 'master';
if (in_array($module, $modules)) {
  header('Content-type: application/json;charset=utf-8');
  echo file_get_contents("https://jenkins-aws.indexdata.com/job/folio-org/job/${module}/job/${branch}/api/json?pretty=true");
}
else {
  header('Content-type: application/json;charset=utf-8');
  echo "{ \"error\": \"${module} is not a recognized module\" }";
}
