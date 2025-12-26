import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import { Eye, EyeSlash } from "react-bootstrap-icons";
import CustomAlert from "../components/utils/Alert";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Inserisci username e password");
      return;
    }

    setLoading(true);
    try {
      const res = await login(username, password);
      if (res.success) navigate("/");
      else setError("Credenziali errate");
    } catch {
      setError("Errore server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center mt-5">
      <Card className="login-card w-100 border-0 py-4 px-4" style={{ maxWidth: "450px" }}>
        <Card.Body className="p-0">
          {/* Header Card */}
          <div className="text-center mb-4">
            <h2 className="fw-bold text-primary-custom">RecapApp</h2>
          </div>

          {error && <CustomAlert message={error} type="error" />}

          <Form onSubmit={handleSubmit}>
            {/* GRUPPO USERNAME */}
            <div className="mb-3">
              <label className="form-label-custom">USERNAME</label>
              <Form.Control
                type="text"
                placeholder="Inserisci il tuo username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* GRUPPO PASSWORD */}
            <div className="mb-3">
              <div className="d-flex justify-content-between">
                <label className="form-label-custom">PASSWORD</label>
              </div>

              <div className="password-wrapper">
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  placeholder="Inserisci la tua password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  style={{ paddingRight: "3rem" }}
                />
                <span className="password-icon" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                </span>
              </div>
            </div>

            {/* BOTTONE LOGIN */}
            <Button type="submit" className="btn-primary-custom w-100 shadow-sm" disabled={loading}>
              {loading ? "Accesso in corso..." : "ACCEDI"}
            </Button>
          </Form>

          {/* Footer Card */}
          <div className="mt-4 text-center">
            <small className="text-muted">
              Test users: alice, bob, charlie
              <br />
              Passwords: Alice2025!, Bob@2025, Charlie#2025
            </small>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default LoginPage;
