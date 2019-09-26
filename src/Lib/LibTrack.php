<?php


namespace App\Lib;


class LibTrack
{
  private $Db;

  public function __construct(LibDB $Db)
  {
    $this->Db = $Db;
  }

  public function getTracksList(string $startRow, ?string $key, ?string $startDate, ?string $endDate, ?array $tags)
  {
    $params = [];
    $sql = 'select id, name, datetime, comment from Track';

    if ($key || $startDate || $endDate || $tags) {
      $sql .= ' where';
      $flagAnd = false;

      if ($key) {
        $params[] = '%'.$key.'%';
        $params[] = '%'.$key.'%';
        $sql .= ' name LIKE ? or comment LIKE ?';

        $flagAnd = true;
      }

      if ($startDate) {
        if ($flagAnd) {
          $sql .= ' and';
        } else {
          $flagAnd = true;
        }
        $params[] = $startDate;
        $sql .= ' datetime >= ?';
      }

      if ($endDate) {
        if ($flagAnd) {
          $sql .= ' and';
        } else {
          $flagAnd = true;
        }
        $params[] = $endDate;
        $sql .= ' datetime <= ?';
      }

      if ($tags) {
        if ($flagAnd) {
          $sql .= ' and';
        } else {
          $flagAnd = true;
        }
        $sql .= ' id in (SELECT distinct id_track FROM Tag inner join TrackHasTags on id = id_tag where';

        $flagOr = false;

        foreach ($tags as $tag) {
          if ($flagOr) {
            $sql .= ' or';
          } else {
            $flagOr = true;
          }
          $sql .= ' id = ?';
          $params[] = $tag;
        }
        $sql .= ')';
      }

    }
    $params[] = (int)$startRow;
    $sql .= ' order by datetime desc limit ?, 10;';

    return $this->Db->select($sql, $params);
  }

  public function getTrackByID(string $ID) {
    $params = [
        $ID
    ];
    return $this->Db->select('SELECT id, name, datetime, comment fROM Track WHERE id=?;', $params);
  }

  public function addNewTrack(?string $name, ?string $path, ?string $datetime, ?string $comment): bool
  {
    $params = [
      $name,
      $datetime,
      $path,
      $comment
    ];

    return $this->Db->exec('
        INSERT INTO Track (
            name, 
            datetime, 
            path, 
            comment) 
        VALUES (?, ?, ?, ?);
        
        ',
        $params
    );
  }

  public function updateTrackByID(string $ID, ?string $comment): bool
  {
    $params = [
        $comment,
        $ID
    ];

    return $this->Db->exec('
        UPDATE Track SET 
            comment=? 
         WHERE id=?;',
        $params
    );
  }

  public function deleteTrackByID(string $ID): bool
  {
    $params = [
        $ID
    ];
    return $this->Db->exec('DELETE FROM Track WHERE id = ?;', $params);
  }

  public function getTrackPathByID(string $ID) {
    $params = [
      $ID
    ];

    return $this->Db->select('select path from Track where id = ?', $params);
  }
  public function getTagsByID(string $ID)
  {
    $params = [
        $ID
    ];

    return $this->Db->select('
        SELECT 
            * 
        FROM musiclibrary.TrackHasTags
        inner join Tag on id = id_tag 
        where id_track = ?;
    ',
        $params);
  }

  public function addTracksTagByID(string $ID, string $tagID)
  {
    $params = [
        $tagID,
        $ID
    ];

    return $this->Db->exec('
        INSERT INTO TrackHasTags (
            id_tag, 
            id_track) 
        VALUES (?, ?);
        
        ',
        $params
    );

  }

  public function deleteTracksTagByID(string $ID, string $tagID)
  {
    $params = [
        $tagID,
        $ID
    ];

    return $this->Db->exec('
        DELETE FROM TrackHasTags where id_tag = ? and id_track = ? ',
        $params
    );

  }

  public function getTracksIDByPath(string $path)
  {
    $params = [
        $path
    ];

    return $this->Db->select('select id from Track where path = ?', $params);
  }
}

