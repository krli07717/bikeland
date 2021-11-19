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
import { Routes, Route, Outlet, useParams } from "react-router-dom";
import { asyncGetGeolocation } from "../utils/getGeolocation";
import { getAvailableBikes } from "../utils/fetchTdxApi";
import L from "leaflet";

function decideByAvailability(options) {
  const { source, resultNone, resultFew, resultNormal } = options;
  if (source === 0) return resultNone;
  if (source <= 5) return resultFew;
  return resultNormal;
}

function BikeMap({ userPosition, bikesAvailable, isFindingBikes }) {
  console.log("hello bikemap");
  const bikeMapRef = useRef(null);
  const userPositionMarkerRef = useRef(null);
  const bikeMarkersRef = useRef([]);

  useEffect(() => {
    if (bikeMapRef.current) return;
    console.log("creating map");

    //   create map

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

  useEffect(() => {
    //  setView
    if (!bikeMapRef.current) return; //no map

    console.log("setting view");

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

    console.log("added user marker");
  }, [userPosition]);

  useEffect(() => {
    if (!bikeMapRef.current) return; //no map

    console.log("setting bike markers");

    // console.log(
    //   `Current bike markers before readding: `,
    //   bikeMarkersRef.current
    // );

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

    // console.log(`after adding markers bikesRef: `, bikeMarkersRef.current);
  }, [bikesAvailable, isFindingBikes]);

  useEffect(() => {
    return function clearMap() {
      console.log("clearMap exec");
      if (bikeMapRef.current) {
        bikeMapRef.current.remove();
        bikeMapRef.current = null;
      }
    };
  }, []);

  return <div id="bike_map"></div>;
}

function Main(props) {
  console.log("hello main");
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
      console.log(userCoordinates);
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

  useEffect(() => {
    console.log("fetching available bikes");
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
      <Routes>
        <Route
          path="/"
          element={
            <MapInfo
              handleLocateUser={handleLocateUser}
              bikesAvailable={bikesAvailable}
              isLocatingUser={isLocatingUser}
              handleFindingType={handleFindingType}
              isFindingBikes={isFindingBikes}
            />
          }
        />
        {/* <Route
          path="/route"
          element={
            <MapInfo
              handleLocateUser={handleLocateUser}
              bikesAvailable={bikesAvailable}
            />
          }
        />
        <Route
          path="/scene"
          element={
            <MapInfo
              handleLocateUser={handleLocateUser}
              bikesAvailable={bikesAvailable}
            />
          }
        /> */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
  );
}

function BikeResults({ bikesAvailable, keyword, sortMethod }) {
  console.log("hello bike results");

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

  const noBikeResults = (
    <h3 className="no_results typography-bold typography-h5">沒有搜尋結果</h3>
  );

  return bikeResults.length ? bikeResults : noBikeResults;
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

function NotFound(props) {
  //redirect
  return <button>NOT FOUND</button>;
}

export default Main;
