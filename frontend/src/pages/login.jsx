import { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  InputGroup,
  Spinner,
  Alert,
} from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";
import { Eye, EyeSlash, Envelope, Lock } from "react-bootstrap-icons";
import { Link, useNavigate } from "react-router-dom";
import { loginApi } from "../api/authapi.js";

const LoginSchema = Yup.object({
  email: Yup.string()
    .email("Enter a valid email")
    .required("Email is required"),

  password: Yup.string()
    .min(6, "Minimum 6 characters")
    .required("Password is required"),
});

const Login = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  return (
    <div
      className="min-vh-100 d-flex align-items-center"
      style={{
        background: "linear-gradient(135deg,#0f172a,#1e293b,#2563eb)",
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col lg={5} md={7}>
            <Card
              className="shadow-lg border-0"
              style={{
                borderRadius: "20px",
              }}
            >
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <h2 className="fw-bold">Welcome Back</h2>

                  <p className="text-muted">Staff Attendance Management</p>
                </div>

                {serverError.length > 0 && (
                  <Alert
                    variant="danger"
                    onClose={() => setServerError("")}
                    dismissible
                  >
                    {serverError}
                  </Alert>
                )}

                <Formik
                  initialValues={{
                    email: "",
                    password: "",
                  }}
                  validationSchema={LoginSchema}
                  onSubmit={async (values, { setSubmitting }) => {
                    try {
                      setServerError("");

                      const res = await loginApi(values);

                      const data = res.data;

                      localStorage.setItem(
                        "user",
                        JSON.stringify(res.data.data.user),
                      );
                      localStorage.setItem("token", res.data.data.token);
                      localStorage.setItem(
                        "refreshToken",
                        res.data.data.refreshToken,
                      );
                      if (data.data.user.role === "ADMIN") {
                        navigate("/admin");
                      } else if (data.data.user.role === "MANAGER") {
                        navigate("/manager");
                      } else if (data.data.user.role === "STAFF") {
                        navigate("/staff");
                      }
                    } catch (err) {
                      console.log("errrrrrr", err);
                      setServerError(
                        err?.response?.data?.message || "Login failed",
                      );
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                >
                  {({
                    handleSubmit,
                    handleChange,
                    values,
                    errors,
                    touched,
                    isSubmitting,
                  }) => (
                    <Form onSubmit={handleSubmit}>
                      <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>

                        <InputGroup>
                          <InputGroup.Text>
                            <Envelope />
                          </InputGroup.Text>

                          <Form.Control
                            type="email"
                            name="email"
                            placeholder="Enter email"
                            value={values.email}
                            onChange={handleChange}
                            isInvalid={touched.email && errors.email}
                          />

                          <Form.Control.Feedback type="invalid">
                            {errors.email}
                          </Form.Control.Feedback>
                        </InputGroup>
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label>Password</Form.Label>

                        <InputGroup>
                          <InputGroup.Text>
                            <Lock />
                          </InputGroup.Text>

                          <Form.Control
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Enter password"
                            value={values.password}
                            onChange={handleChange}
                            isInvalid={touched.password && errors.password}
                          />
                          <Button
                            variant="outline-secondary"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeSlash /> : <Eye />}
                          </Button>

                          <Form.Control.Feedback type="invalid">
                            {errors.password}
                          </Form.Control.Feedback>
                        </InputGroup>
                      </Form.Group>

                      <div className="d-grid">
                        <Button
                          variant="primary"
                          size="lg"
                          type="submit"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Spinner
                                animation="border"
                                size="sm"
                                className="me-2"
                              />
                              Signing In...
                            </>
                          ) : (
                            "Login"
                          )}
                        </Button>
                      </div>

                      <div className="text-center mt-4">
                        <small className="text-muted">
                          Don't have an account?{" "}
                          <Link
                            to="/register"
                            className="fw-semibold text-decoration-none"
                          >
                            Register
                          </Link>
                        </small>
                      </div>
                    </Form>
                  )}
                </Formik>
              </Card.Body>
            </Card>

            <div className="text-center text-white mt-3">
              <small>
                © {new Date().getFullYear()} Staff Attendance Management
              </small>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;
