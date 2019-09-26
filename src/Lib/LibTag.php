<?php


namespace App\Lib;



class LibTag
{
  private $Db;

  public function __construct(LibDB $Db)
  {
    $this->Db = $Db;
  }

  public function getTagsList()
  {
    $params = [];
    return $this->Db->select('SELECT * FROM Tag;', $params);
  }

  public function addNewTag(?string $name, ?string $categoryName, ?string $color)
  {
    $params = [
      $name,
      $categoryName,
      $color
    ];

    return $this->Db->exec('
        INSERT INTO Tag (
            name,
            category_name,
            color)
        VALUES (?, ?, ?)',
        $params);

  }

  public function deleteTagByID(?string $ID)
  {
    $params = [
        $ID
    ];
    return $this->Db->exec('DELETE FROM Tag WHERE id = ?;', $params);
  }

  public function updateTagByID(?string $ID, ?string $name, ?string $categoryName, ?string $color)
  {
    $params = [
        $name,
        $categoryName,
        $color,
        $ID
    ];

    return $this->Db->exec('
        UPDATE Tag SET 
            name=?,
            category_name=?,
            color=? 
         WHERE id=?;',
        $params
    );
  }

  public function getCategoriesList() {
    $params = [];
    return $this->Db->select('SELECT * from Category;', $params);
  }

}
