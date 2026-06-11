"use client";



import { useCallback, useRef, useState, useEffect } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {

  faCoins,

  faBolt,

  faChartLine,

  faCrosshairs,

  faStore,

  faLock,

  faCrown,

  faHandPointer,

} from "@fortawesome/free-solid-svg-icons";

import {

  createInitialState,

  applyTap,

  applyBuyTap,

  applyBuyGoldMult,

  applyBuyCrit,

  stageName,

  monsterEmoji,

  isBossStage,

  goldMultiplierValue,

  critChancePercent,

  tapDamageGain,

} from "@/lib/gameLogic";

import MonsterCanvas from "@/components/MonsterCanvas";

import VfxLayer from "@/components/VfxLayer";

import BackgroundParticles from "@/components/BackgroundParticles";

import styles from "./page.module.css";



let effectId = 0;



function nextId() {

  effectId += 1;

  return effectId;

}



function spawnParticles(count, hues) {

  return Array.from({ length: count }, (_, i) => ({

    id: nextId(),

    type: "particle",

    x: 44 + Math.random() * 12,

    y: 38 + Math.random() * 12,

    dx: (Math.random() - 0.5) * 140,

    dy: -40 - Math.random() * 100,

    delay: i * 18,

    hue: hues[Math.floor(Math.random() * hues.length)],

  }));

}



function ShopButton({ canBuy, onClick, icon, lockedIcon, label, cost, variant }) {

  return (

    <button

      type="button"

      className={[

        styles.buyButton,

        canBuy && variant && styles[variant],

        canBuy ? styles.buyButtonReady : styles.buyButtonLocked,

      ]

        .filter(Boolean)

        .join(" ")}

      onClick={onClick}

      disabled={!canBuy}

    >

      <FontAwesomeIcon

        icon={canBuy ? icon : lockedIcon}

        className={styles.buyIcon}

        aria-hidden="true"

      />

      <span className={styles.buyLabel}>{label}</span>

      <span className={styles.buyCost}>{cost}g</span>

    </button>

  );

}



export default function Home() {

  const [state, setState] = useState(createInitialState);

  const [effects, setEffects] = useState([]);

  const [hitPulse, setHitPulse] = useState(0);

  const [arenaShake, setArenaShake] = useState(false);

  const [stageBurst, setStageBurst] = useState(false);

  const [goldPulse, setGoldPulse] = useState(false);

  const [tapPulse, setTapPulse] = useState(false);

  const [upgradeFlash, setUpgradeFlash] = useState(false);

  const [stagePop, setStagePop] = useState(false);

  const [tapBurst, setTapBurst] = useState(false);

  const effectTimers = useRef([]);

  const stateRef = useRef(state);



  useEffect(() => {

    stateRef.current = state;

  }, [state]);



  useEffect(() => {

    return () => {

      effectTimers.current.forEach(clearTimeout);

    };

  }, []);



  const emoji = monsterEmoji(state.stage);

  const isBoss = isBossStage(state.stage);

  const canBuyTap = state.gold >= state.costTap;

  const canBuyGoldMult = state.gold >= state.costGoldMult;

  const canBuyCrit = state.gold >= state.costCrit;

  const canBuyAny = canBuyTap || canBuyGoldMult || canBuyCrit;

  const hpPercent = Math.max(0, (state.hp / state.maxHp) * 100);

  const goldMultDisplay = Math.round(goldMultiplierValue(state.goldMultLevel) * 100);

  const critDisplay = critChancePercent(state.critLevel);

  const nextTapGain = tapDamageGain(state.tap);



  const addEffects = useCallback((newEffects) => {

    setEffects((current) => [...current, ...newEffects]);

    const ids = newEffects.map((e) => e.id);

    const timer = setTimeout(() => {

      setEffects((current) => current.filter((e) => !ids.includes(e.id)));

    }, 1500);

    effectTimers.current.push(timer);

  }, []);



  const triggerHit = useCallback(

    (damage, isCrit, goldEarned, isKill) => {

      setHitPulse((n) => n + 1);

      setTapBurst(true);

      setTimeout(() => setTapBurst(false), 450);

      setArenaShake(true);

      setGoldPulse(true);

      setTimeout(() => setArenaShake(false), 350);

      setTimeout(() => setGoldPulse(false), 400);



      const burst = spawnParticles(

        isKill ? 26 : isCrit ? 20 : 16,

        isCrit ? [45, 55, 330] : isKill ? [45, 330, 270] : [330, 280, 45],

      );



      addEffects([

        {

          id: nextId(),

          type: isCrit ? "critDamage" : "damage",

          text: isCrit ? `CRIT! -${damage}` : `-${damage}`,

          x: 48 + Math.random() * 8,

          y: 36 + Math.random() * 6,

        },

        {

          id: nextId(),

          type: "gold",

          text: `+${goldEarned}g`,

          x: 56 + Math.random() * 6,

          y: 44 + Math.random() * 6,

          delay: 60,

        },

        ...burst,

      ]);



      if (isKill) {

        setStageBurst(true);

        setStagePop(true);

        addEffects([

          {

            id: nextId(),

            type: "stageClear",

            text: "STAGE CLEAR!",

          },

          ...spawnParticles(24, [45, 55, 330, 270, 190]),

        ]);

        setTimeout(() => setStageBurst(false), 700);

        setTimeout(() => setStagePop(false), 600);

      }

    },

    [addEffects],

  );



  const handleTap = () => {

    const prev = stateRef.current;

    const next = applyTap(prev);

    triggerHit(next.lastDamage, next.lastCrit, next.lastGold, next.stage > prev.stage);

    setState(next);

  };



  const handleBuyTap = () => {

    const prev = stateRef.current;

    const gain = tapDamageGain(prev.tap);

    const next = applyBuyTap(prev);



    if (next.tap > prev.tap) {

      setTapPulse(true);

      setUpgradeFlash(true);

      addEffects([

        { id: nextId(), type: "upgrade", text: `TAP UP! +${gain} DMG` },

        ...spawnParticles(20, [120, 140, 90, 55]),

      ]);

      setTimeout(() => setTapPulse(false), 500);

      setTimeout(() => setUpgradeFlash(false), 700);

    }



    setState(next);

  };



  const handleBuyGoldMult = () => {

    const prev = stateRef.current;

    const next = applyBuyGoldMult(prev);



    if (next.goldMultLevel > prev.goldMultLevel) {

      setGoldPulse(true);

      setUpgradeFlash(true);

      addEffects([

        { id: nextId(), type: "upgrade", text: "GOLD MULT UP!" },

        ...spawnParticles(16, [45, 55, 40]),

      ]);

      setTimeout(() => setGoldPulse(false), 500);

      setTimeout(() => setUpgradeFlash(false), 700);

    }



    setState(next);

  };



  const handleBuyCrit = () => {

    const prev = stateRef.current;

    const next = applyBuyCrit(prev);



    if (next.critLevel > prev.critLevel) {

      setUpgradeFlash(true);

      addEffects([

        { id: nextId(), type: "upgrade", text: "CRIT CHANCE UP!" },

        ...spawnParticles(16, [330, 280, 45]),

      ]);

      setTimeout(() => setUpgradeFlash(false), 700);

    }



    setState(next);

  };



  return (

    <main className={styles.main}>

      <BackgroundParticles />

      <div className={styles.ambientOrbs} aria-hidden="true" />

      <div className={styles.sparkleField} aria-hidden="true" />

      <div className={styles.bgGlowPulse} aria-hidden="true" />



      <header className={styles.topBar}>

        <h1 className={styles.title}>Tap Protocol</h1>



        <div className={styles.currencies}>

          <div className={`${styles.currency} ${goldPulse ? styles.currencyPop : ""}`}>

            <FontAwesomeIcon icon={faCoins} className={`${styles.statIcon} ${styles.statIconGold}`} aria-hidden="true" />

            <span className={styles.gold}>Gold: {state.gold}</span>

          </div>

          <div className={`${styles.currency} ${tapPulse ? styles.currencyPop : ""}`}>

            <FontAwesomeIcon icon={faBolt} className={`${styles.statIcon} ${styles.statIconTap}`} aria-hidden="true" />

            <span className={styles.tap}>Tap damage: {state.tap}</span>

          </div>

          <div className={styles.currency}>

            <FontAwesomeIcon icon={faChartLine} className={`${styles.statIcon} ${styles.statIconMult}`} aria-hidden="true" />

            <span className={styles.stat}>Gold mult: {goldMultDisplay}%</span>

          </div>

          <div className={styles.currency}>

            <FontAwesomeIcon icon={faCrosshairs} className={`${styles.statIcon} ${styles.statIconCrit}`} aria-hidden="true" />

            <span className={styles.stat}>Crit: {critDisplay}%</span>

          </div>

        </div>

      </header>



      <div className={`${styles.stagePill} ${stagePop ? styles.stagePillPop : ""}`}>

        Stage {state.stage}

      </div>



      <div className={styles.gameBoard}>

        <section

          className={`${styles.arenaCard} ${arenaShake ? styles.arenaShake : ""} ${stageBurst ? styles.arenaBurst : ""}`}

        >

          <VfxLayer effects={effects} />

          <div className={styles.arenaSparkles} aria-hidden="true" />



          {isBoss && (

            <div className={styles.bossRibbon}>

              <FontAwesomeIcon icon={faCrown} className={styles.bossIcon} aria-hidden="true" />

              BOSS STAGE!

            </div>

          )}



          <p className={styles.monsterName} key={state.stage}>

            {stageName(state.stage)}

          </p>



          <button

            type="button"

            className={`${styles.monsterButton} ${stageBurst ? styles.monsterVanish : ""} ${tapBurst ? styles.tapBurst : ""}`}

            onClick={handleTap}

            aria-label={isBoss ? "Tap boss monster" : "Tap monster"}

          >

            <span className={styles.monsterGlow} aria-hidden="true" />

            <span className={styles.rippleRing} aria-hidden="true" />

            <span className={styles.rippleRing2} aria-hidden="true" />

            {tapBurst && <span className={styles.shockwave} aria-hidden="true" />}

            <MonsterCanvas

              emoji={emoji}

              isBoss={isBoss}

              hitPulse={hitPulse}

              className={styles.monsterCanvas}

            />

          </button>



          <div className={styles.hpBlock}>

            <p className={`${styles.hp} ${arenaShake ? styles.hpShake : ""}`}>

              HP: {state.hp} / {state.maxHp}

            </p>

            <div className={styles.hpBarTrack}>

              <div

                className={`${styles.hpBarFill} ${arenaShake ? styles.hpBarPulse : ""}`}

                style={{ width: `${hpPercent}%` }}

              />

            </div>

          </div>

        </section>



        <aside className={`${styles.shopCard} ${upgradeFlash ? styles.shopFlash : ""} ${canBuyAny ? styles.shopReady : ""}`}>

          <div className={styles.shopHeader}>

            <FontAwesomeIcon icon={faStore} className={styles.shopHeaderIcon} aria-hidden="true" />

            Shop

          </div>

          <div className={styles.shopButtons}>

            <ShopButton

              canBuy={canBuyTap}

              onClick={handleBuyTap}

              icon={faBolt}

              lockedIcon={faLock}

              label={`Tap damage (+${nextTapGain})`}

              cost={state.costTap}

            />

            <ShopButton

              canBuy={canBuyGoldMult}

              onClick={handleBuyGoldMult}

              icon={faChartLine}

              lockedIcon={faLock}

              label="Gold multiplier (+15%)"

              cost={state.costGoldMult}

              variant="buyButtonGold"

            />

            <ShopButton

              canBuy={canBuyCrit}

              onClick={handleBuyCrit}

              icon={faCrosshairs}

              lockedIcon={faLock}

              label="Crit chance (+5%)"

              cost={state.costCrit}

              variant="buyButtonCrit"

            />

          </div>

        </aside>

      </div>



      <footer className={styles.instructions}>

        <h2 className={styles.instructionsTitle}>

          <FontAwesomeIcon icon={faHandPointer} className={styles.instructionsIcon} aria-hidden="true" />

          How to Play

        </h2>

        <ol className={styles.instructionsList}>

          <li>Tap the monster.</li>

          <li>Spend gold on upgrades.</li>

          <li>Beat bosses every 5 stages.</li>

        </ol>

      </footer>

    </main>

  );

}


