<?php

/*
  Generate cookie
*/
//$bytes = random_bytes(60);
//var_dump(bin2hex($bytes));
//

/*
  Generate hash
*/

/*$password = 'root';
$hash = password_hash($password, PASSWORD_BCRYPT );

$flag = password_verify($password, $hash);

var_dump($hash);
*/

use Symfony\Component\Filesystem\Exception\IOExceptionInterface;
use Symfony\Component\Filesystem\Filesystem;

$filesystem = new Filesystem();

try {
  $filesystem->mkdir(sys_get_temp_dir().'/'.random_int(0, 1000));
} catch (IOExceptionInterface $exception) {
  echo "An error occurred while creating your directory at ".$exception->getPath();
}




