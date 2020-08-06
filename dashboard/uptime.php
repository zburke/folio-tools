<?php

// echo 'success' if a platform's last build was successful
// echo 'failure' otherwise

$modules = [
  'build-platform-complete-snapshot',
  'build-platform-core-snapshot',
];

$module = $_GET['module'];
$jobRoot = $_GET['jobRoot'] ? $_GET['jobRoot'] : 'folio-org';
$branch = $_GET['branch'] ? $_GET['branch'] : 'master';
if (in_array($module, $modules)) {
  header('Content-type: text/plain;charset=utf-8');
  $data = "";
  // the save yarn.lock for #snapshot branches are a bit special
  if ($jobRoot == 'Automation' && $branch == 'snapshot') {
    $data = file_get_contents("https://jenkins-aws.indexdata.com/job/${jobRoot}/job/${module}/api/json?pretty=true");
  } else {
    $data = file_get_contents("https://jenkins-aws.indexdata.com/job/${jobRoot}/job/${module}/job/${branch}/api/json?pretty=true");
  }

  $json = json_decode($data);

  echo ($json->lastCompletedBuild->number == $json->lastSuccessfulBuild->number) ? 'success' : 'failure';
}
else {
  echo "${module} is not a recognized module";
}
