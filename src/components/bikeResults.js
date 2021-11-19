import parkingSvg from "../assets/icon-parking.svg";
import parkingRedSvg from "../assets/icon-parking-red.svg";
import parkingGreySvg from "../assets/icon-parking-grey.svg";

import bicycle500Svg from "../assets/icon-bicycle-500.svg";
import bicycleRedSvg from "../assets/icon-bicycle-red.svg";
import bicycleGreySvg from "../assets/icon-bicycle-grey.svg";

import filterNoResults from "./filterNoResults";
import decideByAvailability from "../utils/decideByAvailability";

export default function BikeResults({ bikesAvailable, keyword, sortMethod }) {
  const sortMethods = {
    0: (stationA, stationB) => 0, //fetched default
    1: (stationA, stationB) =>
      stationB.availableRentBikes - stationA.availableRentBikes,
    2: (stationA, stationB) =>
      stationB.availableReturnBikes - stationA.availableReturnBikes,
    3: (stationA, stationB) => {
      const stationAHour = /.*T(\d*)/g.exec(stationA.srcUpdateTime)[1];
      const stationAMinute = /.*T\d*:(\d*)/g.exec(stationA.srcUpdateTime)[1];
      const stationBHour = /.*T(\d*)/g.exec(stationB.srcUpdateTime)[1];
      const stationBMinute = /.*T\d*:(\d*)/g.exec(stationB.srcUpdateTime)[1];
      if (stationAHour === stationBHour) return stationBMinute - stationAMinute;
      return stationBHour - stationAHour;
    },
  };

  const bikeResults = bikesAvailable
    .filter((station) => {
      if (!keyword) return true;
      return (
        station.stationName.includes(keyword) ||
        station.stationAddress.includes(keyword)
      );
    })
    .sort(sortMethods[sortMethod])
    .map((station) => {
      const stationStatusText =
        station.serviceStatus !== 1
          ? "未營運"
          : station.availableRentBikes > 0 && station.availableReturnBikes > 0
          ? "可借可還"
          : station.availableReturnBikes > 0
          ? "只可停車"
          : "只可借車";
      const stationStatusStyle =
        station.serviceStatus !== 1
          ? "off"
          : station.availableRentBikes === 0 ||
            station.availableReturnBikes === 0
          ? "limited"
          : "";

      const availableBikesStyle = decideByAvailability({
        source: station.availableRentBikes,
        resultNone: "none",
        resultFew: "few",
        resultNormal: "",
      });

      const availableParksStyle = decideByAvailability({
        source: station.availableReturnBikes,
        resultNone: "none",
        resultFew: "few",
        resultNormal: "",
      });

      const availableBikesImg = decideByAvailability({
        source: station.availableRentBikes,
        resultNone: <img src={bicycleGreySvg} alt="bicycle icon" />,
        resultFew: <img src={bicycleRedSvg} alt="bicycle icon" />,
        resultNormal: <img src={bicycle500Svg} alt="bicycle icon" />,
      });

      const availableParksImg = decideByAvailability({
        source: station.availableReturnBikes,
        resultNone: <img src={parkingGreySvg} alt="parking icon" />,
        resultFew: <img src={parkingRedSvg} alt="parking icon" />,
        resultNormal: <img src={parkingSvg} alt="parking icon" />,
      });

      const updateTime = /.*T(\d*:\d*)/g.exec(station.srcUpdateTime)[1];
      const stationName = /(YouBike)?(.*)/g.exec(station.stationName)[2];
      return (
        <div className="bike_result" key={station.stationId}>
          <div className="info">
            <h3 className="typography-bold typography-button">{stationName}</h3>
            <span
              className={`status ${stationStatusStyle} typography-medium typography-caption`}
            >
              {stationStatusText}
            </span>
            <span className="distance typography-medium typography-caption">
              {`${updateTime} 更新`}
            </span>
          </div>
          <div className="available">
            <div className={`available_bikes ${availableBikesStyle}`}>
              {availableBikesImg}
              <span className="typography-medium typography-button">
                可租借
              </span>
              <span className="quantity typography-bold typography-h5">
                {station.availableRentBikes}
              </span>
            </div>
            <div className={`available_parks ${availableParksStyle}`}>
              {availableParksImg}
              <span className="typography-medium typography-button">
                可停車
              </span>
              <span className="quantity typography-bold typography-h5">
                {station.availableReturnBikes}
              </span>
            </div>
          </div>
        </div>
      );
    });

  return bikeResults.length ? bikeResults : filterNoResults;
}
