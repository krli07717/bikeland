import "./main.css";
import bicycleWhiteSvg from "../assets/icon-bicycle-white.svg";
import parkingSvg from "../assets/icon-parking.svg";
import mapMarkerGreySvg from "../assets/icon-map-marker-grey.svg";
import collapseTopSvg from "../assets/icon-collapse-top.svg";
import sortSvg from "../assets/icon-sort.svg";
import bicycle500Svg from "../assets/icon-bicycle-500.svg";
import parkingRedSvg from "../assets/icon-parking-red.svg";
import geolocactionSvg from "../assets/icon-geolocation.svg";
import React, { useEffect, useRef } from "react";
import { Routes, Route, Outlet, useParams } from "react-router-dom";
import L from "leaflet";

function BikeMap(props) {
  const bikeMapRef = useRef(null);

  useEffect(() => {
    //   create map
    if (bikeMapRef.current) return;
    bikeMapRef.current = L.map("bike_map", {
      attributionControl: false,
      zoomControl: false,
      center: [25.03746, 121.564558],
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
    // get location
    // handle getting location message
    console.log("added marker");
    function onLocationFound(e) {
      console.log(e);
      const radius = e.accuracy;
      L.marker(e.latlng)
        .addTo(bikeMapRef.current)
        .bindPopup("You are within " + radius + " meters from this point")
        .openPopup();
      L.circle(e.latlng, radius).addTo(bikeMapRef.current);
    }

    function onLocationError(e) {
      console.log(e.message);
    }

    bikeMapRef.current.on("locationfound", onLocationFound);
    bikeMapRef.current.on("locationerror", onLocationError);
    bikeMapRef.current.locate({ setView: true, maxZoom: 18 });
  }, []);
  return <div id="bike_map"></div>;
}

function Main(props) {
  console.log("hello main");

  return (
    <main>
      <BikeMap />
      <Routes>
        <Route path="/" element={<MapInfo />} />
        <Route path="/route" element={<MapInfo />} />
        <Route path="/scene" element={<MapInfo />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Outlet />
    </main>
  );
}

function MapInfo(props) {
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
      <div className="results_list">
        <button className="geolocation">
          <img src={geolocactionSvg} alt="geo location icon" />
        </button>
        {/* results_list toggle "expand" class */}
        <div className="collapse">
          <img src={collapseTopSvg} alt="collapse top icon" />
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
        <div className="results">
          <div className="bike_result">
            <div className="info">
              <h3 className="typography-bold typography-button">太原廣場</h3>
              <span className="status typography-medium typography-caption">
                可借可還
              </span>
              <span className="distance typography-medium typography-caption">
                <img src={mapMarkerGreySvg} alt="map marker icon" />
                距離25公尺
              </span>
            </div>
            <div className="available">
              <div className="available_bikes">
                <img src={bicycle500Svg} alt="bicycle icon" />
                <span className="typography-medium typography-button">
                  可租借
                </span>
                <span className="quantity typography-bold typography-h5">
                  43
                </span>
              </div>
              <div className="available_parks">
                <img src={parkingRedSvg} alt="parking icon" />
                <span className="typography-medium typography-button">
                  可停車
                </span>
                <span className="quantity typography-bold typography-h5">
                  4
                </span>
              </div>
            </div>
          </div>
          <div className="bike_result">
            <div className="info">
              <h3 className="typography-bold typography-button">太原廣場</h3>
              <span className="status typography-medium typography-caption">
                可借可還
              </span>
              <span className="distance typography-medium typography-caption">
                <img src={mapMarkerGreySvg} alt="map marker icon" />
                距離25公尺
              </span>
            </div>
            <div className="available">
              <div className="available_bikes">
                <img src={bicycle500Svg} alt="bicycle icon" />
                <span className="typography-medium typography-button">
                  可租借
                </span>
                <span className="quantity typography-bold typography-h5">
                  43
                </span>
              </div>
              <div className="available_parks">
                <img src={parkingRedSvg} alt="parking icon" />
                <span className="typography-medium typography-button">
                  可停車
                </span>
                <span className="quantity typography-bold typography-h5">
                  4
                </span>
              </div>
            </div>
          </div>
          <div className="bike_result">
            <div className="info">
              <h3 className="typography-bold typography-button">太原廣場</h3>
              <span className="status typography-medium typography-caption">
                可借可還
              </span>
              <span className="distance typography-medium typography-caption">
                <img src={mapMarkerGreySvg} alt="map marker icon" />
                距離25公尺
              </span>
            </div>
            <div className="available">
              <div className="available_bikes">
                <img src={bicycle500Svg} alt="bicycle icon" />
                <span className="typography-medium typography-button">
                  可租借
                </span>
                <span className="quantity typography-bold typography-h5">
                  43
                </span>
              </div>
              <div className="available_parks">
                <img src={parkingRedSvg} alt="parking icon" />
                <span className="typography-medium typography-button">
                  可停車
                </span>
                <span className="quantity typography-bold typography-h5">
                  4
                </span>
              </div>
            </div>
          </div>
          <div className="bike_result">
            <div className="info">
              <h3 className="typography-bold typography-button">太原廣場</h3>
              <span className="status typography-medium typography-caption">
                可借可還
              </span>
              <span className="distance typography-medium typography-caption">
                <img src={mapMarkerGreySvg} alt="map marker icon" />
                距離25公尺
              </span>
            </div>
            <div className="available">
              <div className="available_bikes">
                <img src={bicycle500Svg} alt="bicycle icon" />
                <span className="typography-medium typography-button">
                  可租借
                </span>
                <span className="quantity typography-bold typography-h5">
                  43
                </span>
              </div>
              <div className="available_parks">
                <img src={parkingRedSvg} alt="parking icon" />
                <span className="typography-medium typography-button">
                  可停車
                </span>
                <span className="quantity typography-bold typography-h5">
                  4
                </span>
              </div>
            </div>
          </div>
          <div className="bike_result">
            <div className="info">
              <h3 className="typography-bold typography-button">太原廣場</h3>
              <span className="status typography-medium typography-caption">
                可借可還
              </span>
              <span className="distance typography-medium typography-caption">
                <img src={mapMarkerGreySvg} alt="map marker icon" />
                距離25公尺
              </span>
            </div>
            <div className="available">
              <div className="available_bikes">
                <img src={bicycle500Svg} alt="bicycle icon" />
                <span className="typography-medium typography-button">
                  可租借
                </span>
                <span className="quantity typography-bold typography-h5">
                  43
                </span>
              </div>
              <div className="available_parks">
                <img src={parkingRedSvg} alt="parking icon" />
                <span className="typography-medium typography-button">
                  可停車
                </span>
                <span className="quantity typography-bold typography-h5">
                  4
                </span>
              </div>
            </div>
          </div>
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
