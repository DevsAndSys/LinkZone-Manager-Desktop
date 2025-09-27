import { useEffect } from "react";
import ConnectionCard from "../components/ConnectionCard";
import NetworkCard from "../components/NetworkCard";
import PlannerCard from "../components/PlannerCard";
import SmsManagerCard from "../components/SmsManagerCard";
import UssdCard from "../components/UssdCard";
import useExternalLinks from "../hooks/useExternalLinks";
import LinkZone from "../types/LinkZone";

export default function CardsSection() {
  const linkZone = new LinkZone();
  const { openExternalLink } = useExternalLinks();

  const handleBitQbaClick = (e) => {
    e.preventDefault();
    openExternalLink("https://bitqba.com");
  };

  const handleDevsAndSysClick = (e) => {
    e.preventDefault();
    openExternalLink("https://devsandsys.com");
  };

  useEffect(() => {}, []);

  return (
    <div>
      <div className="flex flex-wrap justify-center w-full mt-20">
        <ConnectionCard linkZoneController={linkZone} />
        <NetworkCard linkZoneController={linkZone} />
        <UssdCard linkZoneController={linkZone} />
        <SmsManagerCard linkZoneController={linkZone} />
        <PlannerCard />
      </div>
      <div className="my-5 font-semibold text-center text-gray-700">
        <p className="text-2xl">
          Proyecto retomado por{" "}
          <button
            onClick={handleBitQbaClick}
            className="p-0 font-bold text-blue-500 bg-transparent border-none hover:underline focus:outline-none font-inherit"
            style={{ cursor: "pointer" }}
          >
            BitQba
          </button>{" "}
          y{" "}
          <button
            onClick={handleDevsAndSysClick}
            className="p-0 font-bold text-blue-500 bg-transparent border-none hover:underline focus:outline-none font-inherit"
            style={{ cursor: "pointer" }}
          >
            DevsAndSys
          </button>
        </p>
      </div>
      <div className="text-sm text-center text-gray-700 my-50">
        <p>Gracias a la comunidad Open Source cubana por su trabajo inicial.</p>
      </div>
    </div>
  );
}
