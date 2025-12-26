import { useState, useActionState } from "react";
import "./LoginPage.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Container, Card, Form, Button } from "react-bootstrap";
import { Eye, EyeSlash } from "react-bootstrap-icons";
import CustomAlert from "../components/utils/Alert";

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const loginAction = async (prevState, formData) => {
    const username = formData.get("username");
    const password = formData.get("password");

    if (!username || !password) {
      // Ritorna l'errore E lo username inserito
      return { error: "Inserisci username e password", prevUsername: username };
    }

    try {
      const res = await login(username, password);
      if (res.success) {
        navigate("/");
        return { error: null };
      } else {
        // Ritorna l'errore E lo username inserito
        return { error: "Credenziali errate", prevUsername: username };
      }
    } catch (err) {
      return { error: "Errore server, " + err.message, prevUsername: username };
    }
  };

  const [state, formAction, isPending] = useActionState(loginAction, { error: null });

  return (
    <Container className="login-container">
      <Card className="login-card">
        <Card.Body className="login-card-body">
          <div className="login-header">
            <h2 className="login-title">RecapApp</h2>
          </div>

          {state?.error && <CustomAlert message={state.error} type="error" />}

          <Form action={formAction} className="login-form">
            <div className="login-group">
              <label className="form-label-custom">USERNAME</label>
              <Form.Control
                name="username"
                type="text"
                placeholder="Inserisci il tuo username"
                disabled={isPending}
                defaultValue={state?.prevUsername || ""}
              />
            </div>
            <div className="login-group">
              <label className="form-label-custom">PASSWORD</label>
              <div className="password-wrapper">
                <Form.Control
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Inserisci la tua password"
                  disabled={isPending}
                  className="input-password"
                />
                <span className="password-icon" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                </span>
              </div>
            </div>
            <Button type="submit" className="login-btn" disabled={isPending}>
              {isPending ? "Accesso in corso..." : "Login"}
            </Button>
          </Form>
          <div className="login-footer">
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
