/* This be custom app */
function Display({ onBack }) {
  const [content, setContent] = React.useState(null);
  const [error, setError] = React.useState("");
  const [now, setNow] = React.useState(new Date());

  React.useEffect(() => {
    let active = true;

    async function loadDisplay() {
      try {
        const response = await fetch("/api/display", { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Display service returned ${response.status}`);
        }
        const data = await response.json();
        if (active) {
          setContent(data);
          setError("");
        }
      } catch (requestError) {
        if (active) {
          setError("The display could not load. Please check the kiosk server.");
          console.error(requestError);
        }
      }
    }

    loadDisplay();
    return () => {
      active = false;
    };
  }, []);

  return React.createElement(
    "section",
    { className: "display" },
    React.createElement(
      "div",
      { className: "display-content" },
      React.createElement("div", { className: "display-time" }, now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })),
      React.createElement("h1", null, content ? content.title : "One moment…"),
      error
        ? React.createElement("p", { className: "display-error", role: "alert" }, error)
        : React.createElement("p", null, content ? content.message : "Loading your display…")
    ),
    React.createElement("button", { className: "display-back", type: "button", onClick: onBack }, "Back to menu")
  );
}

/* Starts google photos on the tablet succesfully
adb shell am start -n     com.google.android.apps.photos/.home.HomeActivity
Starting: Intent { cmp=com.google.android.apps.photos/.home.HomeActivity }
*/
// const openPhotos = () => {
//     window.location.href =
//         "intent://#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;package=com.google.android.apps.photos;end";
// };

// const openPhotos = () => {
//     window.location.href =
//         "intent://#Intent;component=com.google.android.apps.photos/.home.HomeActivity;end";
// };

// const openPhotos = () => {
//     window.location.href =
//         "intent://launch#Intent;scheme=photos;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;component=com.google.android.apps.photos/.home.HomeActivity;end";
// };

function openPhotos() {
  fetch('http://127.0.0.1:8001/launch-photos')
    .then(response => {
      if (!response.ok) {
        console.error("Bridge server returned an error");
      }
    })
    .catch(err => {
      console.error("Failed to reach local Python bridge:", err);
    });
}

function ActivityPreview() {
  const [refresh, setRefresh] = React.useState(Date.now());
  const [status, setStatus] = React.useState("loading");

  React.useEffect(() => {
    const interval = window.setInterval(() => setRefresh(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  return React.createElement(
    "div",
    { className: "activity-preview" },
    React.createElement("img", {
      src: `/Activities/opencv-display.jpg?updated=${refresh}`,
      alt: "Current OpenCV activity display",
      onLoad: () => setStatus("ready"),
      onError: () => setStatus("unavailable"),
    }),
    status !== "ready"
      ? React.createElement(
          "p",
          { className: "activity-preview-status", role: status === "unavailable" ? "alert" : "status" },
          status === "unavailable"
            ? "The OpenCV display is unavailable. Start Activities/activities.py to show it here."
            : "Loading the OpenCV display…"
        )
      : null
  );
}

function Home({ onOpenDisplay }) {
  return React.createElement(
    "section",
    { className: "home" },
    React.createElement(ActivityPreview),
    React.createElement(
      "nav",
      { className: "menu", "aria-label": "Main menu" },
      React.createElement(
        "a",
        {
          className: "menu-card facebook",
          // href: "https://www.facebook.com/messages/t/1175402965857225",
          href: "https://www.facebook.com/messages",
        },
        React.createElement("span", { className: "icon", "aria-hidden": "true" }, "f"),
        React.createElement("strong", null, "Messenger"),
        React.createElement("small", null, "Facebook")
      ),
      React.createElement(
        "a",
        {
          className: "menu-card email",
          href: "https://mail.google.com/mail",
        },
        React.createElement("span", { className: "icon", "aria-hidden": "true" }, "✉"),
        React.createElement("strong", null, "Email"),
        React.createElement("small", null, "Gmail")
      ),
      React.createElement(
        "a",
        { 
          className: "menu-card photos",
          href: "https://photos.google.com",
        },
        React.createElement("span", { className: "icon", "aria-hidden": "true" }, "☼"),
        React.createElement("strong", null, "Photos"),
      ),
      React.createElement(
        "a",
        { 
          className: "menu-card rtbf",
          href: "https://auvio.rtbf.be/",
        },
        React.createElement("span", { className: "icon", "aria-hidden": "true" }, "📺"),
        React.createElement("strong", null, "RTBF Auvio"),
      )
    ),
  );
}

function KioskApp() { // Triggered when below variable change via their setters
  const [screen, setScreen] = React.useState("home");

  React.useEffect(() => {
    if (!("wakeLock" in navigator)) {
      console.warn("Screen Wake Lock is not supported by this browser.");
      return;
    }

    let active = true;
    let wakeLock = null;

    const requestWakeLock = async () => {
      if (!active || document.visibilityState !== "visible") {
        return;
      }

      try {
        wakeLock = await navigator.wakeLock.request("screen");
      } catch (error) {
        console.error("Could not keep the kiosk screen awake:", error);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        requestWakeLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    requestWakeLock();

    return () => {
      active = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (wakeLock && !wakeLock.released) {
        wakeLock.release().catch((error) => {
          console.error("Could not release the kiosk screen wake lock:", error);
        });
      }
    };
  }, []);

  React.useEffect(() => {
    const handleActivity = () => {
      if (screen === "display") {
        setScreen("home");
      }
    };

    window.addEventListener("pointerdown", handleActivity);
    window.addEventListener("keydown", handleActivity);

    return () => {
      window.removeEventListener("pointerdown", handleActivity);
      window.removeEventListener("keydown", handleActivity);
    };
  }, [screen]);

  return screen === "display"
    ? React.createElement(Display, { onBack: () => setScreen("home") })
    : React.createElement(Home, { onOpenDisplay: () => setScreen("display") });
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(KioskApp));
