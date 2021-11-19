import bicycle500Svg from "../assets/icon-bicycle-500.svg";
import bicycleRedSvg from "../assets/icon-bicycle-red.svg";
import bicycleGreySvg from "../assets/icon-bicycle-grey.svg";
import parkingSvg from "../assets/icon-parking.svg";
import parkingRedSvg from "../assets/icon-parking-red.svg";
import parkingGreySvg from "../assets/icon-parking-grey.svg";
import userPositionMobileSvg from "../assets/icon-user-position-mobile.svg";

import { useEffect, useRef } from "react";
import decideByAvailability from "../utils/decideByAvailability";
import L from "leaflet";

export default function BikeMap({
  userPosition,
  bikesAvailable,
  isFindingBikes,
}) {
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
