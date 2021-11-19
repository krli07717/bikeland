import jsSHA from "jssha/dist/sha1";

function getRequestHeader() {
  const APP_ID = process.env.REACT_APP_APP_ID;
  const APP_KEY = process.env.REACT_APP_APP_KEY;

  const GMTString = new Date().toGMTString();
  const ShaObj = new jsSHA("SHA-1", "TEXT");
  ShaObj.setHMACKey(APP_KEY, "TEXT");
  ShaObj.update("x-date: " + GMTString);
  const HMAC = ShaObj.getHMAC("B64");
  const Authorization =
    'hmac username="' +
    APP_ID +
    '", algorithm="hmac-sha1", headers="x-date", signature="' +
    HMAC +
    '"';

  return {
    Authorization: Authorization,
    "X-Date": GMTString /*,'Accept-Encoding': 'gzip'*/,
  }; //如果要將js運行在伺服器，可額外加入 'Accept-Encoding': 'gzip'，要求壓縮以減少網路傳輸資料量
}

export async function getAvailableBikes(userPosition) {
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
        stationAddress: stationData[i].StationAddress.Zh_tw,
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
    return result;
  } catch (error) {
    throw error;
  }
}

export default async function fetchTdxApi(url) {
  try {
    const response = await fetch(url, { headers: getRequestHeader() });
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}
