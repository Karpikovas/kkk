<?php

namespace App\Lib;

use Symfony\Component\Filesystem\Exception\IOExceptionInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

class LibFile
{
  private $targetDirectory;

  public function __construct(ParameterBagInterface $params)
  {
    $this->targetDirectory = $params->get('FILE_UPLOADS');
  }




}
