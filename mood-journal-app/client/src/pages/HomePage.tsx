import React from "react";
import { useIsDesktop } from "../hooks/useResponsive";
import HomeMobile from "./HomeMobile";
import HomeDesktop from "./HomeDesktop";

const HomePage: React.FC = () => {
  const isDesktop = useIsDesktop();
  return isDesktop ? <HomeDesktop /> : <HomeMobile />;
};

export default HomePage;
