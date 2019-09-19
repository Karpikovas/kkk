<?php


namespace App\Lib;

use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use PDO;

class LibDB
{
  private $params;
  private $connection;

  public function __construct(ParameterBagInterface $params)
  {
    $this->params = $params;
  }

  private function testInitConnection()
  {
    if (!$this->connection) {
      $dsn = "mysql:host={$this->params->get('DATABASE_HOST')};dbname={$this->params->get('DATABASE_NAME')}";
      $db = new PDO($dsn, $this->params->get('DATABASE_USER'), $this->params->get('DATABASE_PASSWORD'));
      $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
      $db->exec("set names utf8");
      $this->connection = $db;
    }
  }

  private function getType($item) {
    if (is_int($item)) {
      return PDO::PARAM_INT;
    } else {
      return PDO::PARAM_STR;
    }
  }

  public function select(string $sql, array $params = []): array
  {
    $this->testInitConnection();
    $stmt = $this->connection->prepare($sql);

    $i = 1;

    foreach ($params as $param) {
      $stmt->bindValue($i, $param, $this->getType($param));
      $i++;
    }

    $stmt->execute();

    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $stmt->closeCursor();
    return $data;
  }

  public function exec(string $sql, array $params = [])
  {
    $this->testInitConnection();
    $stmt = $this->connection->prepare($sql);

    $i = 1;

    foreach ($params as $param) {
      $stmt->bindValue($i, $param, $this->getType($param));
      $i++;
    }

    $error = $stmt->execute();
    $stmt->closeCursor();
    return $error;
  }
}
