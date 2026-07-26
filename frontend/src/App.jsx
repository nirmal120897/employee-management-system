import { Link, Outlet } from "react-router-dom";
import { Navbar, Container, Nav } from "react-bootstrap";
import { PersonCircle } from "react-bootstrap-icons";

export default function App() {
  return (
    <div className="bg-light min-vh-100">
      <Navbar bg="white" expand="lg" className="shadow-sm border-bottom py-3">
        <Container>
          <Navbar.Brand as={Link} to="/" className="fw-bold text-primary fs-4">
            <PersonCircle className="me-2" />
            Staff Attendance
          </Navbar.Brand>

          <Navbar.Toggle />

          <Navbar.Collapse className="justify-content-end">
            <Nav className="gap-2">
              <Nav.Link as={Link} to="/" className="fw-semibold">
                Home
              </Nav.Link>

              <Nav.Link as={Link} to="/login" className="fw-semibold">
                Login
              </Nav.Link>

              <Nav.Link as={Link} to="/register" className="p-0">
                <button className="btn btn-primary px-4">Register</button>
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <main>
        <Outlet />

        <section
          className="text-white d-flex align-items-center"
          style={{
            minHeight: "85vh",
            background: "linear-gradient(135deg,#0f172a,#1e3a8a,#2563eb)",
          }}
        >
          <Container>
            <div className="row align-items-center">
              <div className="col-lg-6">
                <h1 className="display-4 fw-bold mb-3">
                  Staff Attendance Management System
                </h1>

                <p className="lead mb-4">
                  Easily manage employees, attendance, reports and role-based
                  access from one secure platform.
                </p>

                <Link to="/login" className="btn btn-light btn-lg me-3">
                  Login
                </Link>

                <Link to="/register" className="btn btn-outline-light btn-lg">
                  Register
                </Link>
              </div>

              <div className="col-lg-6 mt-5 mt-lg-0">
                <div className="row g-4">
                  <div className="col-6">
                    <div className="card shadow border-0 text-center p-4">
                      <h2 className="text-primary fw-bold">500+</h2>
                      <p className="mb-0">Employees</p>
                    </div>
                  </div>

                  <div className="col-6">
                    <div className="card shadow border-0 text-center p-4">
                      <h2 className="text-success fw-bold">99%</h2>
                      <p className="mb-0">Accuracy</p>
                    </div>
                  </div>

                  <div className="col-6">
                    <div className="card shadow border-0 text-center p-4">
                      <h2 className="text-warning fw-bold">24/7</h2>
                      <p className="mb-0">Availability</p>
                    </div>
                  </div>

                  <div className="col-6">
                    <div className="card shadow border-0 text-center p-4">
                      <h2 className="text-danger fw-bold">100%</h2>
                      <p className="mb-0">Secure</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section className="py-5 bg-white">
          <Container>
            <h2 className="text-center fw-bold mb-5">Why Choose Our System?</h2>

            <div className="row g-4">
              <div className="col-md-3">
                <div className="card h-100 shadow-sm border-0 text-center p-4">
                  <h4>📅</h4>
                  <h5>Attendance</h5>
                  <p className="text-muted">
                    Track daily employee attendance effortlessly.
                  </p>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card h-100 shadow-sm border-0 text-center p-4">
                  <h4>👥</h4>
                  <h5>Employees</h5>
                  <p className="text-muted">
                    Manage staff and managers in one place.
                  </p>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card h-100 shadow-sm border-0 text-center p-4">
                  <h4>📊</h4>
                  <h5>Reports</h5>
                  <p className="text-muted">
                    Generate attendance reports instantly.
                  </p>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card h-100 shadow-sm border-0 text-center p-4">
                  <h4>🔒</h4>
                  <h5>Security</h5>
                  <p className="text-muted">
                    JWT authentication with role-based access.
                  </p>
                </div>
              </div>
            </div>
          </Container>
        </section>

        <footer className="bg-dark text-white text-center py-3">
          © {new Date().getFullYear()} Staff Attendance Management System
        </footer>
      </main>
    </div>
  );
}
