import { Navbar, Container, Nav, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function Topbar() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.clear();

    navigate("/login");
  };

  return (
    <Navbar bg="white" className="shadow-sm border-bottom">
      <Container fluid>
        <Navbar.Brand>
          Welcome,
          <strong className="ms-2">{user?.name}</strong>
        </Navbar.Brand>

        <Nav>
          <Button variant="danger" onClick={logout}>
            Logout
          </Button>
        </Nav>
      </Container>
    </Navbar>
  );
}
