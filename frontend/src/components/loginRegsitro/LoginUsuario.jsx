import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { iniciarSesion, verificarSuperAdmin } from "../../services/authService";
import { Input, Button } from "../ui";
import ferretrialogo from "../../img/chefgo_logo (1).png";
import Swal from "sweetalert2";

function LoginUsuario() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    correo: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [existeSuperAdmin, setExisteSuperAdmin] = useState(null);

  useEffect(() => {
    const verificarExistenciaSuperAdmin = async () => {
      try {
        const response = await verificarSuperAdmin();
        setExisteSuperAdmin(response.existeSuperAdmin);
      } catch (error) {
        console.error("Error al verificar SuperAdmin:", error);
        setExisteSuperAdmin(true);
      }
    };
    verificarExistenciaSuperAdmin();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await iniciarSesion(formData);
      const roleRoutes = {
        SuperAdmin: "/dashboard-superadmin",
        Admin: "/dashboard-admin",
        Cajero: "/dashboard-cajero",
        Almacenero: "/dashboard-almacenero",
        Trabajador: "/dashboard-cajero",
      };
      navigate(roleRoutes[res.usuario.rol] || "/dashboard", { replace: true });
      Swal.fire({
        icon: "success",
        title: "¡Bienvenido!",
        text: `Has iniciado sesión correctamente como ${res.usuario.rol}.`,
        confirmButtonText: "Continuar",
        timer: 2000,
        timerProgressBar: true,
      });
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-300 px-4 py-6 sm:py-8">
      {/* Preloader */}
      {isLoading && (
        <div className="fixed inset-0 bg-white/95 flex flex-col items-center justify-center z-50">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
          <p className="mt-4 text-slate-600 font-medium">Iniciando sesión...</p>
        </div>
      )}

      {/* Card - tema claro */}
      <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-xl shadow-slate-300/50 ring-1 ring-slate-200/80 p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <img
            src={ferretrialogo}
            alt="Ferretería"
            className="w-24 h-24 sm:w-28 sm:h-28 object-contain mb-4 sm:mb-6"
          />
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
            Bienvenido
          </h1>
          <h2 className="text-base sm:text-lg text-slate-600 mt-1 mb-6 sm:mb-8">
            Iniciar sesión
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <Input
            type="email"
            name="correo"
            placeholder="Correo electrónico"
            value={formData.correo}
            onChange={handleChange}
            disabled={isLoading}
            required
            iconRight={<Mail className="w-5 h-5" />}
          />
          <Input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
            required
            passwordToggle
          />
          <div className="flex justify-center pt-1">
            <Button
              type="submit"
              loading={isLoading}
              className="min-w-[140px]"
            >
              Entrar
            </Button>
          </div>
        </form>

        {existeSuperAdmin === false && (
          <p className="mt-5 sm:mt-6 text-center text-sm text-slate-600">
            ¿No tienes cuenta?{" "}
            <Link
              to="/register-superadmin"
              className="text-blue-600 font-medium hover:underline focus:outline-none focus:underline"
            >
              Registrar SuperAdmin
            </Link>
          </p>
        )}

        <p className="mt-6 sm:mt-8 text-xs text-slate-500 text-center leading-relaxed">
          Este sistema web fue desarrollado por el equipo de Desarrollo de
          Sistematizáte Perú, con el objetivo de facilitar la gestión de
          ferretería.
        </p>
      </div>
    </div>
  );
}

export default LoginUsuario;
