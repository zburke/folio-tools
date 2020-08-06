<?php

// echo 'success' if a platform's last build was successful
// echo 'failure' otherwise

$url = str_replace('uptime.php', 'proxy.php', $_SERVER['SCRIPT_URI']);

$module = $_GET['module'];
$jobRoot = $_GET['jobRoot'] ? $_GET['jobRoot'] : 'folio-org';
$branch = $_GET['branch'] ? $_GET['branch'] : 'master';

header('Content-type: text/plain;charset=utf-8');
try {
  $data = file_get_contents("${url}?module=${module}&jobRoot=${jobRoot}&branch=${branch}");
  $json = json_decode($data);
  if (property_exists($json, 'lastSuccessfulBuild')) {
    echo ($json->lastCompletedBuild->number == $json->lastSuccessfulBuild->number) ? 'success' : 'failure';
  } else {
    echo 'failure';
  }
} catch (Exception $e) {
  print_r($e);
}
