import React from "react";
import { Link } from "react-router-dom";
import trustSphereLogo from "../assets/trustSphereLogo.png";
import { useLocation } from "react-router-dom";
import { FaArrowRightLong } from "react-icons/fa6";


function LandingNavbar() {
    const path = useLocation().pathname;
  return (
    <div className="px-16 pt-6 flex justify-between items-center fixed top-0 w-full z-10">
      <div className="hidden md:flex gap-6 text-md font-medium text-white/65">
        <Link
          to="/"
          className="text-white transition-all duration-300 text-2xl font-semibold hover:text-white flex items-center gap-2"
        >
            <img src={trustSphereLogo} className="w-12 h-12"/> TrustSphere AI
        </Link>
      </div>
      <div className="hidden md:flex gap-6 text-md font-medium text-white/65">
        <Link
          to="/"
          className={"hover:text-white transition-all duration-300" + (path === "/" ? " text-white" : "")}
        >
          Home
        </Link>
        <Link
          to="/trustsphere/reviewAnalyzer"
          className={"hover:text-white transition-all duration-300" + (path.includes("reviewAnalyzer") ? " text-white" : "")}
        >
          Review Analyzer
        </Link>
        <Link to="/trustsphere/logoChecker" className={"hover:text-white transition-all duration-300" + (path.includes("logoChecker") ? " text-white" : "")}>
          Logo Detection
        </Link>
        <Link to="/trustsphere/trustGraph" className={"hover:text-white transition-all duration-300" + (path.includes("trustGraph") ? " text-white" : "")}>
          Trust Graph
        </Link>
      </div>
      <Link to="/dashboard" className="text-black bg-white rounded-md transition-all duration-300 text-sm py-2 px-3 font-semibold hover:text-black/65 flex items-center gap-2">
      Get Started <FaArrowRightLong className="w-3 h-3" />
        </Link>
    </div>
  );
}

export default LandingNavbar;
