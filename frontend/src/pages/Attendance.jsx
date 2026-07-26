import { useEffect, useState } from "react";
import {
  checkInApi,
  checkOutApi,
  myAttendanceApi,
  allAttendanceApi,
} from "../api/attandance.js";
import { toast } from "react-toastify";
import Pagination from "../components/Pagination";
import socket from "../socket.js";
function Attendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isStaffView = user?.role === "STAFF";
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1 });

  const fetchAttendance = async (targetPage = page) => {
    try {
      setLoading(true);
      const res = isStaffView
        ? await myAttendanceApi(targetPage, 10)
        : await allAttendanceApi(targetPage, 10);
      console.log(">>>>>res", res);

      setRecords(res.data.data || []);
      setPagination(res.data.pagination || { totalPages: 1 });
    } catch (error) {
      console.log(">>>fetchAttendance error", error.response.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => await fetchAttendance(page))();
  }, [isStaffView, page]);
  useEffect(() => {
    const refreshOnUpdate = () => {
      fetchAttendance(page);
    };

    if (socket.connected) {
      socket.on("employee_checked_in", refreshOnUpdate);
      socket.on("employee_checked_out", refreshOnUpdate);
    } else {
      socket.once("connect", () => {
        socket.on("employee_checked_in", refreshOnUpdate);
        socket.on("employee_checked_out", refreshOnUpdate);
      });
    }

    return () => {
      socket.off("employee_checked_in", refreshOnUpdate);
      socket.off("employee_checked_out", refreshOnUpdate);
    };
  }, []);
  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      await checkInApi();
      toast?.success
        ? toast.success("Checked in successfully")
        : alert("Checked in successfully");
      fetchAttendance();
    } catch (error) {
      const msg = error.response?.data?.message || "Check-in failed";
      toast?.error ? toast.error(msg) : alert(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      await checkOutApi();
      toast?.success
        ? toast.success("Checked out successfully")
        : alert("Checked out successfully");
      fetchAttendance();
    } catch (error) {
      console.log(">>>", error.response.data.message);

      const msg = error.response?.data?.message || "Check-out failed";
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <h3 className="mb-4">Attendance</h3>

      {isStaffView && (
        <div className="d-flex gap-3 mb-4">
          <button
            className="btn btn-success"
            onClick={handleCheckIn}
            disabled={actionLoading}
          >
            {actionLoading ? "Please wait..." : "Check In"}
          </button>
          <button
            className="btn btn-outline-danger"
            onClick={handleCheckOut}
            disabled={actionLoading}
          >
            {actionLoading ? "Please wait..." : "Check Out"}
          </button>
        </div>
      )}

      {loading ? (
        <p>Loading attendance...</p>
      ) : records.length === 0 ? (
        <p className="text-muted">No attendance records found.</p>
      ) : (
        <div className="table-responsive card shadow-sm p-2">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                {!isStaffView && <th>Employee</th>}
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Working Hours</th>
                <th>Overtime</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  {!isStaffView && <td>{r.user?.name || "-"}</td>}
                  <td>{new Date(r.date).toLocaleDateString()}</td>
                  <td>
                    {r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : "-"}
                  </td>
                  <td>
                    {r.checkOut
                      ? new Date(r.checkOut).toLocaleTimeString()
                      : "-"}
                  </td>
                  <td>{r.workingHours ?? "-"}</td>
                  <td>{r.overtimeHours ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination
        page={page}
        totalPages={pagination.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}

export default Attendance;
