import React from "react";
import "./App.css";
import Header from "./layout/header";
import Main from "./layout/main";

function App() {
  console.log("hello app");

  return (
    <>
      <Header />
      <Main />
    </>
  );
}

// nav status "/ ,BIKE_PAGE, ROUTE_PAGE, SCENE_PAGE"
// keyword status "?keyword=中正路"

export default App;
