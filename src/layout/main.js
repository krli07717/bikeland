import "./main.css";
import bicycleWhiteSvg from "../assets/icon-bicycle-white.svg";
import parkingSvg from "../assets/icon-parking.svg";
import mapMarkerGreySvg from "../assets/icon-map-marker-grey.svg";
import collapseTopSvg from "../assets/icon-collapse-top.svg";
import collapseDownSvg from "../assets/icon-collapse-down.svg";
import sortSvg from "../assets/icon-sort.svg";
import bicycle500Svg from "../assets/icon-bicycle-500.svg";
import parkingRedSvg from "../assets/icon-parking-red.svg";
import geolocactionSvg from "../assets/icon-geolocation.svg";
import userPositionMobileSvg from "../assets/icon-user-position-mobile.svg";
import React, { useState, useEffect, useRef } from "react";
import { Routes, Route, Outlet, useParams } from "react-router-dom";
import { asyncGetGeolocation } from "../utils/getGeolocation";
import fetchWithApiKey from "../utils/fetchTdxApi";
import L from "leaflet";

function BikeMap(props) {
  console.log("bikemap");
  const bikeMapRef = useRef(null);
  //   const [mapIsInititialized, setMapIsInitialized] = useState(false);
  useEffect(() => {
    //   create map
    // if (mapIsInititialized) return;
    if (bikeMapRef.current) return;
    console.log("creating map");

    bikeMapRef.current = L.map("bike_map", {
      attributionControl: false,
      zoomControl: false,
      center: props.userPosition,
      zoom: 16,
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
    if (!bikeMapRef.current) return;

    console.log("setting view");

    bikeMapRef.current.setView(props.userPosition, 18);
    const userPositionIcon = L.icon({
      iconUrl: userPositionMobileSvg,
      iconSize: [56, 56],
    });

    // remove previous marker!
    L.marker(props.userPosition, { icon: userPositionIcon }).addTo(
      bikeMapRef.current
    );
    console.log("added marker");
  });

  return <div id="bike_map"></div>;
}

function Main(props) {
  console.log("hello main");
  const TAIPEI_COORDINATES = [25.03746, 121.564558];
  const [userPosition, setUserPosition] = useState(TAIPEI_COORDINATES);
  const [bikesAvailable, setBikesAvailable] = useState([]);
  async function getUserPosition() {
    try {
      /* handle getting location message */
      const userCoordinates = await asyncGetGeolocation();
      console.log(userCoordinates);
      setUserPosition(userCoordinates);
    } catch (error) {
      throw error;
    }
  }

  useEffect(() => {
    // find User position on first render
    console.log("find User position on first render");
    getUserPosition();
  }, []);

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
      <BikeMap userPosition={userPosition} />
      <Routes>
        <Route
          path="/"
          element={
            <MapInfo
              handleLocateUser={getUserPosition}
              bikesAvailable={bikesAvailable}
            />
          }
        />
        <Route
          path="/route"
          element={
            <MapInfo
              handleLocateUser={getUserPosition}
              bikesAvailable={bikesAvailable}
            />
          }
        />
        <Route
          path="/scene"
          element={
            <MapInfo
              handleLocateUser={getUserPosition}
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

function MapInfo({ handleLocateUser, bikesAvailable }) {
  const [expandResultList, setExpandResultList] = useState(false);

  function handleExpandResultList() {
    setExpandResultList((isExpanded) => !isExpanded);
  }

  const collapseImg = expandResultList ? (
    <img src={collapseDownSvg} alt="collapse down icon" />
  ) : (
    <img src={collapseTopSvg} alt="collapse top icon" />
  );

  const results = bikesAvailable.map((station) => {
    const stationStatusText =
      station.serviceStatus !== 1
        ? "未營運"
        : station.availableRentBikes > 0 && station.availableReturnBikes > 0
        ? "可借可還"
        : station.availableReturnBikes > 0
        ? "只可停車"
        : "只可借車";
    const updateTime = /.*T(\d*:\d*)/g.exec(station.srcUpdateTime)[1];
    return (
      <div className="bike_result" key={station.stationId}>
        <div className="info">
          <h3 className="typography-bold typography-button">
            {station.stationName}
          </h3>
          <span className="status typography-medium typography-caption">
            {stationStatusText}
          </span>
          <span className="distance typography-medium typography-caption">
            <img src={mapMarkerGreySvg} alt="map marker icon" />
            {`於${updateTime}更新`}
          </span>
        </div>
        <div className="available">
          <div className="available_bikes">
            <img src={bicycle500Svg} alt="bicycle icon" />
            <span className="typography-medium typography-button">可租借</span>
            <span className="quantity typography-bold typography-h5">
              {station.availableRentBikes}
            </span>
          </div>
          <div className="available_parks">
            <img src={parkingRedSvg} alt="parking icon" />
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
        <button className="find_type selected typography-bold typography-button">
          <div className="find_type_img">
            <img src={bicycleWhiteSvg} alt="bicycle white icon" />
          </div>
          找單車
        </button>
        <button className="find_type typography-bold typography-button">
          <div className="find_type_img">
            <img src={parkingSvg} alt="parking icon" />
          </div>
          找車位
        </button>
      </div>
      <div className={`results_list ${expandResultList ? "expand" : ""}`}>
        <button className="geolocation" onClick={handleLocateUser}>
          <img src={geolocactionSvg} alt="geo location icon" />
        </button>
        <div className="collapse" onClick={handleExpandResultList}>
          {collapseImg}
        </div>
        <div className="filter">
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
