// src/components/loginRegsitro/RegistroSuperAdmin.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { registrarSuperAdmin } from '../../services/authService';
import { obtenerSucursalesPublico } from '../../services/sucursalService';
import '../../styles/RegistroUsuario.css';
import ferretrialogo from "../../img/chefgo_logo (1).png";
import Swal from 'sweetalert2';

function RegistroSuperAdmin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    password: '',
    rol: 'SuperAdmin', // Fijo como SuperAdmin
    sucursalId: '' // Opcional para SuperAdmin
  });
  const [sucursales, setSucursales] = useState([]);
  const [cargandoSucursales, setCargandoSucursales] = useState(true);

  // Cargar sucursales al montar el componente
  useEffect(() => {
    const cargarSucursales = async () => {
      try {
        const response = await obtenerSucursalesPublico();
        setSucursales(response.sucursales || []);
      } catch (error) {
        console.error('Error al cargar sucursales:', error);
        // No mostrar error al usuario ya que las sucursales son opcionales
      } finally {
        setCargandoSucursales(false);
      }
    };

    cargarSucursales();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const datosRegistro = {
        ...formData,
        sucursalId: formData.sucursalId || null
      };

      await registrarSuperAdmin(datosRegistro);

      await Swal.fire({
        icon: 'success',
        title: '¡SuperAdmin registrado exitosamente!',
        text: 'El SuperAdmin ha sido creado correctamente. Ahora puedes iniciar sesión.',
        confirmButtonText: 'Ir a iniciar sesión'
      });

      navigate('/');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error al registrar SuperAdmin',
        text: err.message || 'Ocurrió un error inesperado.',
      });
    }
  };

  return (
    <div className="register-container">
      <img className="school-logo" src={ferretrialogo} alt="ferretrialogo" />
      <h1>Bienvenido</h1>
      <h2>Registro de Super Administrador</h2>
      <p className="superadmin-info">
        Este formulario es para crear el primer SuperAdmin del sistema.
        El SuperAdmin tendrá control total sobre todas las funcionalidades.
      </p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre: Juan"
          value={formData.nombre}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="apellido"
          placeholder="Apellido: Pérez"
          value={formData.apellido}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="correo"
          placeholder="Correo electrónico"
          value={formData.correo}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <div className="rol-display">
          <label>Rol: Super Administrador</label>
          <p className="rol-description">
            Como SuperAdmin tendrás acceso completo al sistema, incluyendo la gestión de usuarios, sucursales y todas las funcionalidades.
          </p>
        </div>
        <div className="sucursal-selection">
           <label htmlFor="sucursalId">Sucursal (Opcional):</label>
           <select
             id="sucursalId"
             name="sucursalId"
             value={formData.sucursalId}
             onChange={handleChange}
             disabled={cargandoSucursales}
           >
             <option value="">Sin sucursal asignada (Acceso global)</option>
             {cargandoSucursales ? (
               <option disabled>Cargando sucursales...</option>
             ) : (
               sucursales.map((sucursal) => (
                 <option key={sucursal.id} value={sucursal.id}>
                   {sucursal.nombre} - {sucursal.ubicacion}
                 </option>
               ))
             )}
           </select>
           <p className="sucursal-description">
             {formData.sucursalId 
               ? "Tendrás acceso completo al sistema con enfoque en la sucursal seleccionada."
               : "Tendrás acceso completo a todas las sucursales del sistema."
             }
           </p>
         </div>
        <button type="submit">Registrar SuperAdmin</button>
      </form>
      <p>¿Ya tienes cuenta? <a href="/">Inicia Sesión</a></p>
      <br />
      <p className="disclaimer">
        Este sistema web fue desarrollado por el equipo de Desarrollo de Sistematízate Perú,
        con el objetivo de facilitar la gestión de ferretería.
      </p>
    </div>
  );
}

export default RegistroSuperAdmin;