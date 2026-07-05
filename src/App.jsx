import { useEffect, useState } from "react";
const api=import.meta.env.VITE_API_URL;
const pad = (num) => String(num).padStart(2, '0');

function formatSeconds(totalSeconds) {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  // Helper to ensure 2 digits

  return `${pad(days)}:${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function App() {
  const [siteError, setSiteError] = useState(null);
  const [timestamps, setTimestamps] = useState([]);
  const [currentTime, setCurrentTime] = useState(Date.now());
  
  const addStopwatch = async (formData) => {
    setSiteError(null);

    const name = formData.get("timerName");
    let startTime = formData.get("startTime");
    
    const fields = {name};
    if (startTime) fields.startTime = startTime;
    else {
      const nextTime = new Date(currentTime).toISOString();
      fields.startTime = nextTime;
    }
    
    try {
      if (!name) throw {message: "Your stopwatch must have a name"}
      const rsp = await fetch(`${api}/stopwatch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(fields)
      });

      const json = await rsp.json();
      if (!!json.error) throw json.error;

      await getTimestamps();
    } catch (err) {
      setSiteError(err);
    }
  };

  const getTimestamps = async () => {
    setSiteError(null);

    try {
      const rsp = await fetch(`${api}/stopwatch`);
      const json = await rsp.json();

      setTimestamps(json.timestamps.map((ts) => {
        // console.log(ts);
        const epoch = new Date(ts.startTime);
        let timestamp = epoch.getTime();
        timestamp += +ts.totalPause;
        if (ts.paused) {
          ts.currentPauseMS = new Date(ts.currentPause).getTime();
        }
        
        ts.epoch = epoch;
        ts.timestamp = timestamp;
        return ts;
      }));
    } catch (err) {
      setSiteError(err.message);
    }
  }

  useEffect(() => {
    getTimestamps();
    const timerInt = setInterval(() => {
      setCurrentTime(Date.now());
    } , 250);
    return () => {
      clearInterval(timerInt);
    };
  }, []);

  return (
    <>
      {/* <p>{currentTime}</p> */}
      <form action={addStopwatch}>
        <label>
          Stopwatch Name:
          <input type="text" name="timerName" required /> 
          <input type="datetime-local" name="startTime" />
          <button>Start Stopwatch</button>
        </label>
      </form>
      <p>{siteError}</p>
      <ul>
        {timestamps.sort((a,b) => a.id-b.id).map((ts, idx) => {
          let totalSecs = ts.timestamp;
          if (ts.paused) {
            totalSecs += currentTime - ts.currentPauseMS
          }
          totalSecs = currentTime - totalSecs;
          totalSecs = Math.floor(totalSecs/1000);

          return (
            <li key={idx}>
              <h2>{ts.name}</h2>
              <p>{ts.epoch.toLocaleDateString()} @ {ts.epoch.toLocaleTimeString()}</p>
              <h3>{formatSeconds(totalSecs)}</h3>
              <div className="watch-controls">
                <button onClick={async () => {
                  const timestamp = new Date(currentTime).toISOString();

                  try {
                    const rsp = await fetch(`${api}/stopwatch/${ts.id}/pause`, {
                      method: "PATCH",
                      headers: {
                        "Content-Type": "application/json"
                      },
                      body: JSON.stringify({timestamp})
                    });
                    const json = await rsp.json();
                    if (!!json.error) throw json.error;

                    await getTimestamps();
                  } catch (err) {
                    setSiteError(err);
                  }
                }}>
                  {ts.paused ? "Start" : "Pause"}
                </button>
                <button onClick={async() => {
                  const doDelete = confirm("Are you sure to delete?");
                  if (!doDelete) return;
                  try {
                    const rsp = await fetch(`${api}/stopwatch/${ts.id}`, {
                      method: "DELETE"
                    });
                    const json = await rsp.json();
                    if (!!json.error) throw json.error;
  
                    await getTimestamps();
                  } catch (err) {
                    setSiteError(err);
                  }
                }}>Delete</button>
              </div>
            </li>
          )
        })}
      </ul>
    </>
  )
}

export default App;
