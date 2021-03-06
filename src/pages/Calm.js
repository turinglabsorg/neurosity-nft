import React, { useState, useEffect } from "react";
import { navigate } from "@reach/router";

import { notion, useNotion } from "../services/notion";
import { Nav } from "../components/Nav";
const QRCode = require('qrcode.react');

export function Calm() {
  const { user } = useNotion();
  const [calm, setCalm] = useState(0);
  const [focus, setFocus] = useState(0);
  const [waves, setWaves] = useState([]);
  const [seed, setSeed] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const calmSub = notion.calm().subscribe((calm) => {
      const calmScore = Math.trunc(calm.probability * 100);
      setCalm(calmScore);
    });

    const focusSub = notion.focus().subscribe((focus) => {
      const focusScore = Math.trunc(focus.probability * 100);
      setFocus(focusScore);
    });

    const wawesSub = notion.brainwaves("raw").subscribe((waves) => {
      setWaves(waves);
      let seed = ""
      for (let k in waves.data) {
        for (let j in waves.data[k]) {
          if (waves.data[k][j] < 1) {
            waves.data[k][j] = waves.data[k][j] * -1
          }
          seed += waves.data[k][j].toString()
        }
      }
      setSeed(seed)
      console.log('WAVES', waves)
    });

    return () => {
      calmSub.unsubscribe();
      focusSub.unsubscribe();
      wawesSub.unsubscribe();
    };
  }, [user]);

  return (
    <main className="main-container">
      <div style={{ width: "20%", float: "left", textAlign: "center"}}>
        {user ? <Nav /> : null}
        <div className="calm-score">
          &nbsp;{calm}% <div className="calm-word">Calm</div>
        </div>
        <div className="calm-score">
          &nbsp;{focus}% <div className="calm-word">Focus</div>
        </div>
      </div>
      <div style={{ width: "80%", float: "left", textAlign: "center"}}>
        <div style={{ width: "500px", height: "500px", display: "inline-block", margin: "0 25px", overflow: "hidden", "word-break": "break-all" }}>{seed}</div>
        <QRCode value={seed} style={{ width: "500px", height: "500px", margin: "0 25px", display: "inline-block" }} />
      </div>
    </main>
  );
}
