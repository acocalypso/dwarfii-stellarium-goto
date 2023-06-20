import React, { useState, useContext, useEffect } from "react";

import { ConnectionContext } from "@/stores/ConnectionContext";
import { ObservationObject } from "@/types";
import {
  renderLocalRiseSetTime,
  computeRaDecToAltAz,
  convertAzToCardinal,
} from "@/lib/astro_utils";
import { centerHandler, centerGotoHandler } from "@/lib/goto_utils";
import eventBus from "@/lib/event_bus";
import {
  convertHMSToDecimalDegrees,
  convertDMSToDecimalDegrees,
} from "@/lib/math_utils";

type AstronomyObjectPropType = {
  object: ObservationObject;
};

export default function DSOObject(props: AstronomyObjectPropType) {
  const { object } = props;

  let connectionCtx = useContext(ConnectionContext);
  const [errors, setErrors] = useState<string | undefined>();

  useEffect(() => {
    eventBus.on("clearErrors", () => {
      setErrors(undefined);
    });
  }, []);

  let raDecimal: undefined | number;
  let decDecimal: undefined | number;
  if (object.ra) {
    raDecimal = convertHMSToDecimalDegrees(object.ra);
  }
  if (object.dec) {
    decDecimal = convertDMSToDecimalDegrees(object.dec);
  }

  function renderRiseSetTime(object: ObservationObject) {
    if (connectionCtx.latitude && connectionCtx.longitude) {
      let times = renderLocalRiseSetTime(
        object,
        connectionCtx.latitude,
        connectionCtx.longitude
      );

      if (times?.error) {
        return <span>{times.error}</span>;
      }

      if (times) {
        return (
          <span>
            Rises: {times.rise}, Sets: {times.set}
          </span>
        );
      }
    }
  }

  function renderAltAz() {
    if (
      connectionCtx.latitude &&
      connectionCtx.longitude &&
      raDecimal &&
      decDecimal
    ) {
      let results = computeRaDecToAltAz(
        connectionCtx.latitude,
        connectionCtx.longitude,
        raDecimal,
        decDecimal
      );

      if (results) {
        return (
          <span>
            Alt: {results.alt.toFixed(0)}, Az: {results.az.toFixed(0)},{" "}
            {convertAzToCardinal(results.az)}
          </span>
        );
      }
    }
  }

  function renderRADec() {
    if (
      connectionCtx.latitude &&
      connectionCtx.longitude &&
      raDecimal &&
      decDecimal
    ) {
      return (
        <span>
          RA: {raDecimal.toFixed(2)}, Dec: {decDecimal.toFixed(2)}
        </span>
      );
    }
  }

  return (
    <div className="border-bottom p-2">
      <h3 className="fs-5">{object.displayName}</h3>
      <div className="row">
        <div className="col-md-4">
          {object.type} {object.constellation && " in " + object.constellation}
          <br />
          Size: {object.size}
          <br />
          Magnitude: {object.magnitude}
        </div>
        <div className="col-md-5">
          {renderRiseSetTime(object)}
          <br></br>
          {renderAltAz()}
          <br></br>
          {renderRADec()}
        </div>
        <div className="col-md-3">
          <button
            className="btn btn-primary me-2 mb-2"
            onClick={() => centerHandler(object, connectionCtx, setErrors)}
          >
            Center
          </button>
          <button
            className="btn btn-primary mb-2"
            onClick={() => centerGotoHandler(object, connectionCtx, setErrors)}
          >
            Goto
          </button>
          <br />
          {errors && <span className="text-danger">{errors}</span>}
        </div>
      </div>
    </div>
  );
}
