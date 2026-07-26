import { useEffect, useState } from "react";
import socket from "../socket.js";
import { UseAuth } from "../context/contextapi.jsx";

function LiveAttendanceWidget() {
  const { user } = UseAuth();
  const [onlineCount, setOnlineCount] = useState(0);
  const [feed, setFeed] = useState([]);

  useEffect(() => {
    if (!user) return;

    if (socket.connected) {
      socket.emit("client_join", user.id);
    } else {
      socket.once("connect", () => {
        socket.emit("client_join", user.id);
      });
    }

    const handleCheckIn = (payload) => {
      console.log("..>handleCheckIn", payload);

      setFeed((prev) =>
        [
          { type: "check-in", time: new Date(), record: payload.record },
          ...prev,
        ].slice(0, 10),
      ); // sirf last 10 events rakho
    };

    const handleCheckOut = (payload) => {
      console.log("..>habdelcheckout", payload);

      setFeed((prev) =>
        [
          { type: "check-out", time: new Date(), record: payload.record },
          ...prev,
        ].slice(0, 10),
      );
    };

    const handleOnlineCount = (payload) => {
      setOnlineCount(payload.onlineCount || 0);
    };

    socket.on("employee_checked_in", handleCheckIn);
    socket.on("employee_checked_out", handleCheckOut);
    socket.on("online_count_changed", handleOnlineCount);

    return () => {
      socket.off("employee_checked_in", handleCheckIn);
      socket.off("employee_checked_out", handleCheckOut);
      socket.off("online_count_changed", handleOnlineCount);
    };
  }, [user]);

  return (
    <div className="card shadow-sm p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0">Live Activity</h6>
        <span className="badge bg-success">{onlineCount} Online</span>
      </div>

      {feed.length === 0 ? (
        <p className="text-muted small mb-0">No one is Online.</p>
      ) : (
        <ul
          className="list-unstyled mb-0"
          style={{ maxHeight: "260px", overflowY: "auto" }}
        >
          {feed.map((item, idx) => (
            <li
              key={idx}
              className="d-flex justify-content-between border-bottom py-2 small"
            >
              <span>
                {item.type === "check-in"
                  ? `${item?.record?.user?.name}      🟢 Checked in`
                  : `🔴 Checked out`}
              </span>
              <span className="text-muted">
                {item.time.toLocaleTimeString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default LiveAttendanceWidget;
