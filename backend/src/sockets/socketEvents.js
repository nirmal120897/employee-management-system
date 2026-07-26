// Centralized event name constants - avoids typos and string duplication across files
export const SOCKET_EVENTS = Object.freeze({
  // outgoing (server -> clients)
  EMPLOYEE_CHECKED_IN: "employee_checked_in",
  EMPLOYEE_CHECKED_OUT: "employee_checked_out",
  ATTENDANCE_UPDATED: "attendance_updated",
  ONLINE_COUNT_CHANGED: "online_count_changed",

  // incoming (client -> server)
  CLIENT_JOIN: "client_join", // client announces its userId after connecting
});