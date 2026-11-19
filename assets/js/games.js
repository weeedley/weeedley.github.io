const GAMES = {
  hunt: {
    title: "HUNT: SHOWDOWN 1896",
    theme: {
      primary: "#a31621",
      accent: "#a31621",
      text: "#ffffff"
    },
    products: [
      {
        id: 1,
        name: "Wallhack",
        description: "Provides persistent line-of-sight intelligence by surfacing enemy positions through otherwise non-transparent environmental assets.",
        features: ["Cross-surface opponent visibility", "Distance and health telemetry", "Context-aware visibility prioritization"],
        price: "$19.99",
        image: "assets/images/products/hunt/cheat_hunt_wallhack.jpg"
      },
      {
        id: 2,
        name: "Aimbot",
        description: "Automates target acquisition and engagement alignment to reduce manual aiming overhead across high-pressure combat scenarios.",
        features: ["Humanized target acquisition", "Configurable engagement FOV", "Continuous aim-path smoothing"],
        price: "$19.99",
        image: "assets/images/products/hunt/cheat_hunt_aimbot.jpg"
      },
      {
        id: 3,
        name: "Boss Locator",
        description: "Converts boss-location uncertainty into actionable map intelligence for faster compound-level decision making.",
        features: ["Real-time boss position telemetry", "Compound-level location mapping", "Integrated tactical map overlay"],
        price: "free",
        image: "assets/images/products/hunt/cheat_hunt_bosslocation.jpg"
      },
      {
        id: 4,
        name: "AI Assist",
        description: "Applies adaptive intelligence to optimize tracking and predictive lead without disrupting input continuity.",
        features: ["Adaptive target tracking", "Dynamic recoil compensation", "Predictive movement lead"],
        price: "$19.99",
        image: "assets/images/products/hunt/cheat_hunt_ai.jpg"
      }
    ]
  },

  arc: {
    title: "ARC RAIDERS",
    theme: {
      primary: "#31f68a",
      accent: "#31f68a",
      text: "#ffffff"
    },
    products: [
            {
        id: 1,
        name: "Infinite Stash Capacity",
        description: "Decouples inventory retention from conventional storage ceilings to enable uninterrupted long-term asset accumulation.",
        features: ["Uncapped stash allocation", "Zero mandatory inventory rationalization", "Persistent item-retention capacity"],
        price: "$19.99",
        image: "assets/images/products/arc/cheat_arc_stash.jpg"
      },
      {
        id: 2,
        name: "Scrappy Yield Override",
        description: "Recalibrates scrap-output calculations to deliver materially stronger resource returns across standard loot interactions.",
        features: ["Enhanced Scrappy yield", "Predictable material conversion", "Reduced dependency on baseline resources"],
        price: "free",
        image: "assets/images/products/arc/cheat_arc_scrappy.jpg"
      },
      {
        id: 3,
        name: "Persistent Loot After Death",
        description: "Maintains acquired inventory state across unsuccessful raid outcomes by neutralizing conventional post-death rollback behavior.",
        features: ["Post-death loot retention", "Failure-state inventory protection", "Persistent account-bound item state"],
        price: "$19.99",
        image: "assets/images/products/arc/cheat_arc_loot.jpg"
      },
      {
        id: 4,
        name: "Extraction Timer Override",
        description: "Compresses the standard extraction workflow by removing time-based evacuation dependencies from the return-to-Speranza process.",
        features: ["Immediate evacuation activation", "Guaranteed Speranza return pathway", "Elevator-phase survivability assurance"],
        price: "$9.99",
        image: "assets/images/products/arc/cheat_arc_extract.jpg"
      },
      {
        id: 5,
        name: "Endless Gameplay",
        description: "Extends session continuity beyond conventional downed and death states to preserve active participation after standard failure conditions.",
        features: ["Hä was geht jetzt ab?", "Alter ich bin wieder im game!", "Da kicken die Weeedleyhacks wieder richtig..."],
        price: "use code thirsty15 for 15% off",
        image: "assets/images/products/arc/cheat_arc_timer.jpg",
        link: "https://www.twitch.tv/videos/2686554101"
      }
    ]
  },

  pubg: {
    title: "PUBG",
    theme: {
      primary: "#F2AA00",
      accent: "#F2AA00",
      text: "#ffffff"
    },
    products: [
            {
        id: 1,
        name: "No Blue Zone Damage",
        description: "Neutralizes active Blue Zone damage processing to enable unrestricted operational continuity outside the designated safe area.",
        features: ["Zero Blue Zone damage intake", "Extended out-of-circle positioning", "Eliminated late-phase zone pressure"],
        price: "free",
        image: "assets/images/products/pubg/cheat_pubg_bluezone.jpg"
      },
      {
        id: 2,
        name: "Bullet Drop Linearization",
        description: "Standardizes projectile trajectory behavior across engagement distances to reduce ballistic unpredictability at range.",
        features: ["Predictable vertical drop profile", "Reduced trajectory variance", "Consistent long-range ballistic behavior"],
        price: "$9.99",
        image: "assets/images/products/pubg/cheat_pubg_drop.jpg"
      },
      {
        id: 3,
        name: "Recoil Compensator",
        description: "Actively moderates weapon recoil impulses to stabilize firing behavior across single-shot, burst, and sustained engagements.",
        features: ["First-shot impulse suppression", "Enhanced burst-pattern stability", "Optional zero-recoil operating mode"],
        price: "$19.99",
        image: "assets/images/products/pubg/cheat_pubg_recoil.jpg"
      }
    ]
  },

  bf6: {
    title: "BATTLEFIELD 6",
    theme: {
      primary: "#F2AA00",
      accent: "#FF3C00",
      text: "#ffffff"
    },
    products: [
            {
        id: 1,
        name: "Auto-Aimlock",
        description: "Streamlines target acquisition by aligning engagement inputs with high-priority hostile entities across dynamic combat scenarios.",
        features: ["Context-aware target prioritization", "Input-path stabilization", "Adaptive engagement alignment"],
        price: "$29.99",
        image: "assets/images/products/bf6/cheat_bf6_aimbot.jpg"
      },
      {
        id: 2,
        name: "Wallhack",
        description: "Elevates battlefield visibility by exposing hostile positional data beyond conventional line-of-sight constraints.",
        features: ["Persistent hostile object outlining", "Through-surface depth awareness", "Context-sensitive battlefield telemetry"],
        price: "$9.99",
        image: "assets/images/products/bf6/cheat_bf6_wallhack.jpg"
      },
      {
        id: 3,
        name: "ESP Control Panel",
        description: "Centralizes real-time entity intelligence into a configurable visualization layer for streamlined battlefield information management.",
        features: ["Real-time entity intelligence", "Configurable visual data presentation", "Low-overhead information delivery"],
        price: "free",
        image: "assets/images/products/bf6/cheat_bf6_esp.jpg"
      }
    ]
  },

  wardogs: {
    title: "WARDOGS",
    theme: {
      primary: "#F2AA00",
      accent: "#a0653b",
      text: "#ffffff"
    },
    products: [
            {
        id: 1,
        name: "Wallhack",
        description: "Transforms structural occlusion into actionable positional intelligence by maintaining hostile visibility across environmental barriers.",
        features: ["Cross-structure threat visibility", "Proactive positional awareness", "Reduced corner-related information latency"],
        price: "$9.99",
        image: "assets/images/products/wardogs/cheat_wardogs_wallhack.jpg"
      },
      {
        id: 2,
        name: "Double Control Boost",
        description: "Accelerates objective-value realization by applying a permanent 2× multiplier to control-driven ticket generation.",
        features: ["2× control-ticket accrual", "Persistent objective-value amplification", "Zero additional control-point effort"],
        price: "$19.99",
        image: "assets/images/products/wardogs/cheat_wardogs_2xboost.jpg"
      }
    ]
  },

  hunger: {
    title: "HUNGER",
    theme: {
      primary: "#F2AA00",
      accent: "#b12209",
      text: "#ffffff"
    },
    products: [
            {
        id: 1,
        name: "Soon™",
        description: "",
        features: [""],
        price: "Soon™",
        image: "assets/images/products/hunger/cheat_hunger_soon.jpg"
      }
    ]
  }
};