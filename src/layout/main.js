import "./main.css";
import { useState, useEffect } from "react";
import asyncGetGeolocation from "../utils/getGeolocation";
import { getAvailableBikes } from "../utils/fetchTdxApi";

import BikeMap from "../components/bikeMap";
import MapInfo from "../components/mapInfo";

function Main(props) {
  const TAIPEI_COORDINATES = [25.03746, 121.564558];
  const [userPosition, setUserPosition] = useState(TAIPEI_COORDINATES);
  const [bikesAvailable, setBikesAvailable] = useState([]);
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [isFindingBikes, setIsFindingBikes] = useState(true);

  function handleFindingType() {
    setIsFindingBikes((bool) => !bool);
  }

  async function handleLocateUser() {
    try {
      setIsLocatingUser(true);
      const userCoordinates = await asyncGetGeolocation();
      setIsLocatingUser(false);
      setUserPosition(userCoordinates);
    } catch (error) {
      throw error;
    }
  }

  // find User position on first render
  //   useEffect(() => {
  //     handleLocateUser();
  //   }, []);

  //fetch available bikes
  useEffect(() => {
    async function getBikes(userPosition) {
      try {
        const bikes = await getAvailableBikes(userPosition);
        setBikesAvailable(bikes);
      } catch (error) {
        throw error;
      }
    }
    getBikes(userPosition);
  }, [userPosition]);

  return (
    <main>
      <BikeMap
        userPosition={userPosition}
        bikesAvailable={bikesAvailable}
        isFindingBikes={isFindingBikes}
      />
      <MapInfo
        handleLocateUser={handleLocateUser}
        bikesAvailable={bikesAvailable}
        isLocatingUser={isLocatingUser}
        handleFindingType={handleFindingType}
        isFindingBikes={isFindingBikes}
      />
    </main>
  );
}

export default Main;
