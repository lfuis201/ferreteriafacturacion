// src/components/LoginUsuario.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { iniciarSesion, verificarSuperAdmin } from "../../services/authService";
import "../../styles/LoginUsuario.css";
import ferretrialogo from "../../img/chefgo_logo (1).png";
import Swal from "sweetalert2";

function LoginUsuario() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    correo: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [existeSuperAdmin, setExisteSuperAdmin] = useState(null); // null mientras carga

  useEffect(() => {
    const verificarExistenciaSuperAdmin = async () => {
      try {
        const response = await verificarSuperAdmin();
        console.log('Respuesta verificarSuperAdmin:', response);
        setExisteSuperAdmin(response.existeSuperAdmin);
      } catch (error) {
        console.error('Error al verificar SuperAdmin:', error);
        setExisteSuperAdmin(true); // Por defecto, asumir que existe para no mostrar el enlace
      }
    };

    verificarExistenciaSuperAdmin();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await iniciarSesion(formData);

      // Mostrar SweetAlert después de un pequeño retraso para que el preloader se muestre
      setTimeout(async () => {
        await Swal.fire({
          icon: "success",
          title: "¡Bienvenido!",
          text: `Has iniciado sesión correctamente como ${res.usuario.rol}.`,
          confirmButtonText: "Continuar",
        });

        // Redirigir según el rol
        const roleRoutes = {
          "SuperAdmin": "/dashboard-superadmin",
          "Admin": "/dashboard-admin",
          "Cajero": "/dashboard-cajero",
          "Almacenero": "/dashboard-almacenero"
        };

        navigate(roleRoutes[res.usuario.rol] || "/");
      }, 300); // Pequeño retraso para que el preloader se muestre
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Credenciales incorrectas",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {isLoading && (
        <div className="preloader">
          <div className="spinner"></div>
          <br /><br />
          <br /> <br />
          <p>Iniciando sesión...</p>
        </div>
      )}
      <img className="school-logo" src={ferretrialogo} alt="Ferretería" />
      <h1>Bienvenido</h1>
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="correo"
          placeholder="Correo electrónico"
          value={formData.correo}
          onChange={handleChange}
          disabled={isLoading}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
          disabled={isLoading}
          required
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Cargando..." : "Entrar"}
        </button>
      </form>
      {existeSuperAdmin === false && (
        <p>
          ¿No tienes cuenta? <a href="/register-superadmin">Registrar SuperAdmin</a>
        </p>
      )}
      <br />
      <p className="disclaimer">
        Este sistema web fue desarrollado por el equipo de Desarrollo de Sistematizáte Perú,
        con el objetivo de facilitar la gestión de ferretería.
      </p>
    </div>
  );
}

export default LoginUsuario;