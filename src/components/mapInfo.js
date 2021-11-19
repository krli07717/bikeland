import collapseTopSvg from "../assets/icon-collapse-top.svg";
import collapseDownSvg from "../assets/icon-collapse-down.svg";
import sortSvg from "../assets/icon-sort.svg";
import bicycle400Svg from "../assets/icon-bicycle-400.svg";
import geolocactionSvg from "../assets/icon-geolocation.svg";
import bicycleWhiteSvg from "../assets/icon-bicycle-white.svg";
import parkingSvg from "../assets/icon-parking.svg";
import parkingWhiteSvg from "../assets/icon-parking-white.svg";

import { useState } from "react";
import BikeResults from "./bikeResults";

export default function MapInfo({
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
