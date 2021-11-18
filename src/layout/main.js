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
import fetchWithApiKey from "../utils/fetchTdxApi";
import L from "leaflet";

function BikeMap({ userPosition, bikesAvailable, isFindingBikes }) {
  console.log("bikemap");
  const bikeMapRef = useRef(null);
  const userPositionMarkerRef = useRef(null);
  const bikeMarkersRef = useRef([]);

  useEffect(() => {
    //   create map
    if (bikeMapRef.current) return;
    console.log("creating map");

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

    console.log("added marker");
  });

  useEffect(() => {
    if (!bikeMapRef.current) return; //no map

    console.log("setting bike markers");

    console.log(
      `Current bike markers before readding: `,
      bikeMarkersRef.current
    );

    //remove previous bike markers
    bikeMarkersRef.current.forEach((bikeMarker) => {
      // map remove bikeMarker
      bikeMapRef.current.removeLayer(bikeMarker);
    });

    bikeMarkersRef.current = [];

    bikesAvailable.forEach((station, index) => {
      // assign created DivIcon to bikesRef

      const bikeMarkerStatusStyle_bikes =
        station.availableRentBikes === 0
          ? "none"
          : station.availableRentBikes <= 5
          ? "few"
          : "";

      const bikeMarkerStatusStyle_parks =
        station.availableReturnBikes === 0
          ? "none"
          : station.availableReturnBikes <= 5
          ? "few"
          : "";

      const availableBikesStyle =
        station.availableRentBikes === 0
          ? "none"
          : station.availableRentBikes <= 5
          ? "few"
          : "";

      const availableParksStyle =
        station.availableReturnBikes === 0
          ? "none"
          : station.availableReturnBikes <= 5
          ? "few"
          : "";

      const availableBikesImg =
        station.availableRentBikes === 0
          ? `<img src=${bicycleGreySvg} alt="bicycle icon" />`
          : station.availableRentBikes <= 5
          ? `<img src=${bicycleRedSvg} alt="bicycle icon" />`
          : `<img src=${bicycle500Svg} alt="bicycle icon" />`;

      const availableParksImg =
        station.availableReturnBikes === 0
          ? `<img src=${parkingGreySvg} alt="parking icon" />`
          : station.availableReturnBikes <= 5
          ? `<img src=${parkingRedSvg} alt="parking icon" />`
          : `<img src=${parkingSvg} alt="parking icon" />`;

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

      // bind popup to markers?
      const popupHtml = `<div class="bikeMarkers_popup">
        <h3 class="typography-bold typography-button">${
          station.stationName
        }</h3>
        <div class="popup_info">
            <div class="popup_bikes ${availableBikesStyle}">
                ${availableBikesImg}
                <span class="quantity typography-bold typography-button">${
                  station.availableRentBikes
                }</span>
            </div>
            <div class="popup_parks ${availableParksStyle}">
                ${availableParksImg}
                <span class="quantity typography-bold typography-button">${
                  station.availableReturnBikes
                }</span>
            </div>
            <span class="update_time typography-medium typography-caption">${
              /.*T(\d*:\d*)/g.exec(station.srcUpdateTime)[1]
            }更新</span>
        </div>
      </div>`;
      bikeMarkersRef.current[index].bindPopup(popupHtml, {
        className: "popupClass",
      });

      // bikesRef.current[index] add to map
      bikeMarkersRef.current[index].addTo(bikeMapRef.current);

      //   console.log(`added bikeMarker: `, bikeMarkersRef.current[index]);
    });

    console.log(`after adding markers bikesRef: `, bikeMarkersRef.current);
  });

  return <div id="bike_map"></div>;
}

function Main(props) {
  console.log("hello main");
  const TAIPEI_COORDINATES = [25.03746, 121.564558];
  const [userPosition, setUserPosition] = useState(TAIPEI_COORDINATES);
  const [bikesAvailable, setBikesAvailable] = useState([]);
  const [showLocatingMessage, setShowLocatingMessage] = useState(false);
  const [isFindingBikes, setIsFindingBikes] = useState(true);

  function handleFindingType() {
    setIsFindingBikes((bool) => !bool);
  }

  async function handleLocateUser() {
    try {
      setShowLocatingMessage(true);
      const userCoordinates = await asyncGetGeolocation();
      setShowLocatingMessage(false);
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

  const API_KEY = {
    APP_ID: process.env.REACT_APP_APP_ID,
    APP_KEY: process.env.REACT_APP_APP_KEY,
  };

  const fetchTdxApi = fetchWithApiKey(API_KEY);

  async function getAvailableBikes() {
    try {
      const [lat, lng] = userPosition;
      const stationUrl = `https://ptx.transportdata.tw/MOTC/v2/Bike/Station/NearBy?$top=30&$spatialFilter=nearby(${lat},${lng},1000)&$format=JSON`;
      const bikeUrl = `https://ptx.transportdata.tw/MOTC/v2/Bike/Availability/NearBy?$top=30&$spatialFilter=nearby(${lat},${lng},1000)&$format=JSON`;
      const data = await Promise.allSettled([
        fetchTdxApi(stationUrl),
        fetchTdxApi(bikeUrl),
      ]);
      const result = [];
      const [stationData, bikeData] = [data[0].value, data[1].value];
      for (let i = 0; i < stationData.length; i++) {
        let stationStatus = {
          stationId: stationData[i].StationUID,
          stationName: stationData[i].StationName.Zh_tw,
          stationPosition: {
            lat: stationData[i].StationPosition.PositionLat,
            lng: stationData[i].StationPosition.PositionLon,
          },
          serviceStatus: bikeData[i].ServiceStatus,
          availableRentBikes: bikeData[i].AvailableRentBikes,
          availableReturnBikes: bikeData[i].AvailableReturnBikes,
          srcUpdateTime: bikeData[i].SrcUpdateTime,
        };
        result.push(stationStatus);
      }
      console.log(result);
      setBikesAvailable(result);
      return result;
      // 地點換時間
    } catch (error) {
      throw error;
    }
  }

  useEffect(() => {
    console.log("fetching available bikes");
    // first time fetchinng Bike Availability
    getAvailableBikes();
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
              showLocatingMessage={showLocatingMessage}
              handleFindingType={handleFindingType}
              isFindingBikes={isFindingBikes}
            />
          }
        />
        <Route
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
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Outlet />
    </main>
  );
}

function MapInfo({
  handleLocateUser,
  bikesAvailable,
  showLocatingMessage,
  handleFindingType,
  isFindingBikes,
}) {
  const [expandResultList, setExpandResultList] = useState(false);

  function handleExpandResultList() {
    setExpandResultList((isExpanded) => !isExpanded);
  }

  const collapseImg = expandResultList ? (
    <img src={collapseDownSvg} alt="collapse down icon" />
  ) : (
    <img src={collapseTopSvg} alt="collapse top icon" />
  );

  // implement sort

  const results = bikesAvailable.map((station) => {
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
        : station.availableRentBikes === 0 || station.availableReturnBikes === 0
        ? "limited"
        : "";
    const availableBikesStyle =
      station.availableRentBikes === 0
        ? "none"
        : station.availableRentBikes <= 5
        ? "few"
        : "";
    const availableParksStyle =
      station.availableReturnBikes === 0
        ? "none"
        : station.availableReturnBikes <= 5
        ? "few"
        : "";
    const availableBikesImg =
      station.availableRentBikes === 0 ? (
        <img src={bicycleGreySvg} alt="bicycle icon" />
      ) : station.availableRentBikes <= 5 ? (
        <img src={bicycleRedSvg} alt="bicycle icon" />
      ) : (
        <img src={bicycle500Svg} alt="bicycle icon" />
      );
    const availableParksImg =
      station.availableReturnBikes === 0 ? (
        <img src={parkingGreySvg} alt="parking icon" />
      ) : station.availableReturnBikes <= 5 ? (
        <img src={parkingRedSvg} alt="parking icon" />
      ) : (
        <img src={parkingSvg} alt="parking icon" />
      );
    const updateTime = /.*T(\d*:\d*)/g.exec(station.srcUpdateTime)[1];
    return (
      <div className="bike_result" key={station.stationId}>
        <div className="info">
          <h3 className="typography-bold typography-button">
            {station.stationName}
          </h3>
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
            <span className="typography-medium typography-button">可租借</span>
            <span className="quantity typography-bold typography-h5">
              {station.availableRentBikes}
            </span>
          </div>
          <div className={`available_parks ${availableParksStyle}`}>
            {availableParksImg}
            <span className="typography-medium typography-button">可停車</span>
            <span className="quantity typography-bold typography-h5">
              {station.availableReturnBikes}
            </span>
          </div>
        </div>
      </div>
    );
  });

  return (
    <div className="bikemap_info">
      <div className="find_type_wrapper">
        <label>
          <input
            type="radio"
            name="find_type"
            checked={isFindingBikes}
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
        <label>
          <input
            type="radio"
            name="find_type"
            checked={!isFindingBikes}
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
      {showLocatingMessage ? (
        <div className="locating_message">
          <span className="typography-bold typography-h4">定位中</span>
        </div>
      ) : null}
      <div className={`results_list ${expandResultList ? "expand" : ""}`}>
        <button className="geolocation" onClick={handleLocateUser}>
          <img src={geolocactionSvg} alt="geo location icon" />
        </button>
        <div className="collapse" onClick={handleExpandResultList}>
          {collapseImg}
        </div>
        <div className="filter">
          {results.length ? (
            <>
              <input
                className="typography-medium typography-caption"
                type="search"
                placeholder="搜尋站點或鄰近地點"
                value=""
              />
              <button className="sort typography-bold typography-caption">
                <img src={sortSvg} alt="sort icon" />
                排序
              </button>
            </>
          ) : (
            <h3 className="no_results typography-bold typography-h5">
              一公里內沒有youbike車站
            </h3>
          )}
        </div>
        <div className="results">{results}</div>
      </div>
    </div>
  );
}

function NotFound(props) {
  //redirect
  return <button>NOT FOUND</button>;
}

export default Main;
