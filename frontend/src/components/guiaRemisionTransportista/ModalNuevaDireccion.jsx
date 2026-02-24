import React, { useState } from 'react';

// Datos de ubigeo simplificados (solo 3 como solicitado)
const ubigeosIniciales = [
  {
    id: "150101",
    codigo: "150101",
    departamento: "LIMA",
    provincia: "LIMA",
    distrito: "LIMA",
  },
  {
    id: "150102",
    codigo: "150102",
    departamento: "LIMA",
    provincia: "LIMA",
    distrito: "ANCON",
  },
  {
    id: "150103",
    codigo: "150103",
    departamento: "LIMA",
    provincia: "LIMA",
    distrito: "ATE",
  }
];

function ModalNuevaDireccion({ isOpen, onClose, onDireccionCreada, tipo }) {
  const [nuevaDireccion, setNuevaDireccion] = useState({
    codigo: "",
    departamento: "",
    provincia: "",
    distrito: "",
    direccion: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevaDireccion((prev) => ({
      ...prev,
      [name]: value.toUpperCase(),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !nuevaDireccion.departamento ||
      !nuevaDireccion.provincia ||
      !nuevaDireccion.distrito ||
      !nuevaDireccion.direccion
    ) {
      alert("Todos los campos son obligatorios");
      return;
    }

    const direccionCompleta = `${nuevaDireccion.direccion}, ${nuevaDireccion.distrito}, ${nuevaDireccion.provincia}, ${nuevaDireccion.departamento}`;
    
    const direccionData = {
      direccionCompleta,
      codigo: nuevaDireccion.codigo
    };
    
    onDireccionCreada(direccionData);

    // Limpiar formulario
    setNuevaDireccion({
      codigo: "",
      departamento: "",
      provincia: "",
      distrito: "",
      direccion: ""
    });
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1500,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          width: "90%",
          maxWidth: "500px",
          maxHeight: "80vh",
          overflow: "auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid #eee",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: "bold",
              color: "#333",
            }}
          >
            Nueva dirección de {tipo === 'partida' ? 'partida' : 'llegada'}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: "30px",
              height: "30px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            ×
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ padding: "20px" }}>
          <div
            style={{
              display: "grid",
              gap: "15px",
              marginBottom: "20px",
            }}
          >
            {/* Dirección */}
             <div>
               <label
                 style={{
                   display: "block",
                   marginBottom: "5px",
                   fontSize: "12px",
                   fontWeight: "bold",
                   color: "#333",
                 }}
               >
                 Dirección *
               </label>
               <input
                 type="text"
                 name="direccion"
                 value={nuevaDireccion.direccion}
                 onChange={handleInputChange}
                 placeholder="Ej: Av. Los Olivos 123"
                 required
                 style={{
                   width: "100%",
                   padding: "8px",
                   border: "1px solid #ddd",
                   borderRadius: "4px",
                   fontSize: "12px",
                 }}
               />
             </div>

             {/* Código de Ubigeo */}
             <div>
               <label
                 style={{
                   display: "block",
                   marginBottom: "5px",
                   fontSize: "12px",
                   fontWeight: "bold",
                   color: "#333",
                 }}
               >
                 Código Ubigeo
               </label>
               <input
                 type="text"
                 name="codigo"
                 value={nuevaDireccion.codigo}
                 readOnly
                 style={{
                   width: "100%",
                   padding: "8px",
                   border: "1px solid #ddd",
                   borderRadius: "4px",
                   fontSize: "12px",
                   backgroundColor: "#f8f9fa",
                   color: "#666"
                 }}
               />
             </div>

            {/* Ubigeo */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "#333",
                }}
              >
                Ubigeo
              </label>
              <select
                name="departamento"
                value={nuevaDireccion.departamento}
                onChange={(e) => {
                  const selectedUbigeo = ubigeosIniciales.find(u => u.departamento === e.target.value);
                  if (selectedUbigeo) {
                    setNuevaDireccion(prev => ({
                      ...prev,
                      departamento: selectedUbigeo.departamento,
                      provincia: selectedUbigeo.provincia,
                      distrito: selectedUbigeo.distrito,
                      codigo: selectedUbigeo.codigo
                    }));
                  }
                }}
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "12px",
                }}
              >
                <option value="">Seleccionar</option>
                {ubigeosIniciales.map(ubigeo => (
                  <option key={ubigeo.id} value={ubigeo.departamento}>
                    {ubigeo.departamento} - {ubigeo.provincia} - {ubigeo.distrito}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Botones */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "20px",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 20px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                backgroundColor: "#f8f9fa",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                padding: "10px 20px",
                border: "none",
                borderRadius: "4px",
                backgroundColor: "#28a745",
                color: "white",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalNuevaDireccion;