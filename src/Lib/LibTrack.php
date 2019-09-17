<?php


namespace App\Lib;


class LibTrack
{
  private $Db;

  public function __construct(LibDB $Db)
  {
    $this->Db = $Db;
  }

  public function getTracksList(string $start_date, string $end_date): array
  {
    $params = [
        $start_date,
        $end_date,
        $start_date,
        $end_date
    ];

    $cars = $this->Db->select('
        select 
            name, 
            type, 
            carrying, 
            seats_count 
        from Car
        inner join (
	          SELECT 
	              Car.car_id 
            from Car
	          left join Rent on Rent.car_ID=Car.car_ID
	          group by Car.car_id
	          having
	              sum(
	                  (? < start_date AND ? < start_date)
                    OR (? > end_date AND ? > end_date)
                    OR (start_date IS NULL)) = COUNT(*)
        ) as a on a.car_id = Car.car_id
        order by name;',
        $params
    );

    return $cars;
  }

  public function addNewCar(string $type, string $name, string $fuel_type,
                             $carrying, $seats_count, $comment, string $owner_ID): bool
  {
    $params = [
        $type,
        $name,
        $fuel_type,
        $carrying,
        $seats_count,
        $comment,
        $owner_ID
    ];

    return $this->Db->exec('
        INSERT INTO Car(
            type, 
            name, 
            fuel_type, 
            carrying, 
            seats_count, 
            comment, 
            owner_ID)
         VALUES(?, ?, ?, ?, ?, ?, ?);',
        $params
    );
  }

  public function deleteCarByID(int $carID): bool
  {
    return $this->Db->exec('DELETE FROM Car WHERE car_ID = ?;', [$carID]);
  }

  public function updateCarInfo(string $type, string $name, string $fuel_type,
                                $carrying, $seats_count, $comment, string $owner_ID, string $carID): bool
  {
    $params = [
        $type,
        $name,
        $fuel_type,
        $carrying,
        $seats_count,
        $comment,
        $owner_ID,
        $carID
    ];

    return $this->Db->exec('
        UPDATE Car SET 
            type=?, 
            name=?, 
            fuel_type=?, 
            carrying=?, 
            seats_count=?, 
            comment=?, 
            owner_ID=?
         WHERE car_ID=?;',
        $params
    );
  }
  public function getMostUsedCars()
  {
    return $this->Db->select('
        select 
          Car.car_ID,
            Car.name,
            count(*) as count_of_rents, 
            SUM(TIMESTAMPDIFF(HOUR,start_date, end_date)) as count_of_hours,
            SUM(case when end_date < now() then cost else 0 end) as payout
        from Rent
        inner join Car on Car.car_ID = Rent.car_ID
        group by car_ID
        having
          payout > 10000
        order by count_of_hours DESC;
    ');
  }
}

/*
 *
  select
	car_ID,
    count(*) as count_of_rents,
    SUM(TIMESTAMPDIFF(HOUR,start_date, end_date)) as count_of_hours,
    SUM(case when end_date < now() then cost else 0 end) as payout
from Rent
group by car_ID
having
	payout > 10000
order by count_of_hours DESC;
*/
