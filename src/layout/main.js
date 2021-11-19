import "./main.css";
import bicycleWhiteSvg from "../assets/icon-bicycle-white.svg";
import parkingSvg from "../assets/icon-parking.svg";
import parkingRedSvg from "../assets/icon-parking-red.svg";
import parkingGreySvg from "../assets/icon-parking-grey.svg";
import parkingWhiteSvg from "../assets/icon-parking-white.svg";
import collapseTopSvg from "../assets/icon-collapse-top.svg";
import collapseDownSvg from "../assets/icon-collapse-down.svg";
import sortSvg from "../assets/icon-sort.svg";
import bicycle400Svg from "../assets/icon-bicycle-400.svg";
import bicycle500Svg from "../assets/icon-bicycle-500.svg";
import bicycleRedSvg from "../assets/icon-bicycle-red.svg";
import bicycleGreySvg from "../assets/icon-bicycle-grey.svg";
import geolocactionSvg from "../assets/icon-geolocation.svg";
import userPositionMobileSvg from "../assets/icon-user-position-mobile.svg";
import React, { useState, useEffect, useRef } from "react";
import asyncGetGeolocation from "../utils/getGeolocation";
import decideByAvailability from "../utils/decideByAvailability";
import { getAvailableBikes } from "../utils/fetchTdxApi";
import BikeResults from "../components/bikeResults";
import L from "leaflet";

function BikeMap({ userPosition, bikesAvailable, isFindingBikes }) {
  const bikeMapRef = useRef(null);
  const userPositionMarkerRef = useRef(null);
  const bikeMarkersRef = useRef([]);

  //   create map
  useEffect(() => {
    if (bikeMapRef.current) return;
    bikeMapRef.current = L.map("bike_map", {
      attributionControl: false,
      zoomControl: false,
      center: userPosition,
      zoom: 15,
      layers: [
        L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        }),
      ],
    });
  }, []);

  //  setView
  useEffect(() => {
    if (!bikeMapRef.current) return; //no map

    // remove current user marker
    if (userPositionMarkerRef.current)
      bikeMapRef.current.removeLayer(userPositionMarkerRef.current);

    bikeMapRef.current.setView(userPosition, 15);

    // create icon
    const userPositionIcon = L.icon({
      iconUrl: userPositionMobileSvg,
      iconSize: [56, 56],
    });

    // create marker
    userPositionMarkerRef.current = L.marker(userPosition, {
      icon: userPositionIcon,
    });

    // add marker
    userPositionMarkerRef.current.addTo(bikeMapRef.current);
  }, [userPosition]);

  //setting bikeMarkers
  useEffect(() => {
    if (!bikeMapRef.current) return; //no map

    //remove previous bike markers
    bikeMarkersRef.current.forEach((bikeMarker) => {
      // map remove bikeMarker
      bikeMapRef.current.removeLayer(bikeMarker);
    });

    bikeMarkersRef.current = [];

    bikesAvailable.forEach((station, index) => {
      // assign created DivIcon to bikesRef

      const bikeMarkerStatusStyle_bikes = decideByAvailability({
        source: station.availableRentBikes,
        resultNone: "none",
        resultFew: "few",
        resultNormal: "",
      });

      const bikeMarkerStatusStyle_parks = decideByAvailability({
        source: station.availableReturnBikes,
        resultNone: "none",
        resultFew: "few",
        resultNormal: "",
      });

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
        resultNone: `<img src=${bicycleGreySvg} alt="bicycle icon" />`,
        resultFew: `<img src=${bicycleRedSvg} alt="bicycle icon" />`,
        resultNormal: `<img src=${bicycle500Svg} alt="bicycle icon" />`,
      });

      const availableParksImg = decideByAvailability({
        source: station.availableReturnBikes,
        resultNone: `<img src=${parkingGreySvg} alt="parking icon" />`,
        resultFew: `<img src=${parkingRedSvg} alt="parking icon" />`,
        resultNormal: `<img src=${parkingSvg} alt="parking icon" />`,
      });

      bikeMarkersRef.current[index] = L.marker(
        [station.stationPosition.lat, station.stationPosition.lng],
        {
          icon: L.divIcon({
            html: `<span class="bikeMarker_number typography-bold typography-button">${
              isFindingBikes
                ? station.availableRentBikes
                : station.availableReturnBikes
            }</span>`,
            className: `bikeMarker ${
              isFindingBikes
                ? bikeMarkerStatusStyle_bikes
                : bikeMarkerStatusStyle_parks
            }`,
          }),
        }
      );

      const updateTime = /.*T(\d*:\d*)/g.exec(station.srcUpdateTime)[1];

      // bind popup to markers?
      const popupHtml = `<div class="bikeMarkers_popup">
        <h3 class="typography-bold typography-button">${station.stationName}</h3>
        <div class="popup_info">
            <div class="popup_bikes ${availableBikesStyle}">
                ${availableBikesImg}
                <span class="quantity typography-bold typography-button">${station.availableRentBikes}</span>
            </div>
            <div class="popup_parks ${availableParksStyle}">
                ${availableParksImg}
                <span class="quantity typography-bold typography-button">${station.availableReturnBikes}</span>
            </div>
            <span class="update_time typography-medium typography-caption">${updateTime}更新</span>
        </div>
      </div>`;

      bikeMarkersRef.current[index].bindPopup(popupHtml, {
        className: "popupClass",
      });

      // bikesRef.current[index] add to map
      bikeMarkersRef.current[index].addTo(bikeMapRef.current);
    });
  }, [bikesAvailable, isFindingBikes]);

  //clear map unmount
  useEffect(() => {
    return function clearMap() {
      if (bikeMapRef.current) {
        bikeMapRef.current.remove();
        bikeMapRef.current = null;
      }
    };
  }, []);

  return <div id="bike_map"></div>;
}

function MapInfo({
  handleLocateUser,
  bikesAvailable,
  isLocatingUser,
  handleFindingType,
  isFindingBikes,
}) {
  const [expandResultList, setExpandResultList] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [sortMethod, setSortMethod] = useState(0);

  function handleSortResults() {
    setSortMethod((state) => ++state % 4);
  }

  function handleExpandResultList() {
    setExpandResultList((isExpanded) => !isExpanded);
  }

  function handleSetKeyword(e) {
    setKeyword(e.target.value);
  }

  const collapseTip = (
    <div className="collapse" onClick={handleExpandResultList}>
      {expandResultList ? (
        <img src={collapseDownSvg} alt="collapse down icon" />
      ) : (
        <img src={collapseTopSvg} alt="collapse top icon" />
      )}
    </div>
  );
  const locatingMessage = (
    <div className="locating_message">
      <span className="typography-bold typography-h4">定位中</span>
    </div>
  );

  const getLocationButton = (
    <button
      className="geolocation"
      disabled={isLocatingUser ? true : false}
      onClick={handleLocateUser}
    >
      <img src={geolocactionSvg} alt="geo location icon" />
    </button>
  );

  return (
    <div className="bikemap_info">
      <div className="find_type_wrapper">
        <label htmlFor="find_bikes">
          <input
            type="radio"
            name="find_type"
            id="find_bikes"
            checked={isFindingBikes}
            onChange={() => {
              return;
            }}
            hidden
          />
          <button
            className="find_type typography-bold typography-button"
            onClick={handleFindingType}
          >
            <div className="find_type_img">
              {isFindingBikes ? (
                <img src={bicycleWhiteSvg} alt="bicycle white icon" />
              ) : (
                <img src={bicycle400Svg} alt="bicycle white icon" />
              )}
            </div>
            找單車
          </button>
        </label>
        <label htmlFor="find_parks">
          <input
            type="radio"
            name="find_type"
            id="find_parks"
            checked={!isFindingBikes}
            onChange={() => {
              return;
            }}
            hidden
          />
          <button
            className="find_type typography-bold typography-button"
            onClick={handleFindingType}
          >
            <div className="find_type_img">
              {isFindingBikes ? (
                <img src={parkingSvg} alt="parking icon" />
              ) : (
                <img src={parkingWhiteSvg} alt="parking icon" />
              )}
            </div>
            找車位
          </button>
        </label>
      </div>
      {isLocatingUser ? locatingMessage : null}
      <div className={`results_list ${expandResultList ? "expand" : ""}`}>
        {getLocationButton}
        {collapseTip}
        <div className="filter">
          <input
            className="typography-medium typography-caption"
            type="search"
            placeholder="搜尋站點或鄰近地點"
            value={keyword}
            onChange={handleSetKeyword}
          />
          <button
            className="sort typography-bold typography-caption"
            onClick={handleSortResults}
          >
            <img src={sortSvg} alt="sort icon" />
            排序
          </button>
        </div>
        <div className="results">
          <BikeResults
            keyword={keyword}
            sortMethod={sortMethod}
            bikesAvailable={bikesAvailable}
          />
        </div>
      </div>
    </div>
  );
}

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

  //   useEffect(() => {
  //     // find User position on first render
  //     console.log("find User position on first render");
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
