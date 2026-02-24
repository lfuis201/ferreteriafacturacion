const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
/**
 * @swagger
 * components:
 *   schemas:
 *     Cliente:
 *       type: object
 *       required:
 *         - nombre
 *       properties:
 *         id:
 *           type: integer
 *           description: ID del cliente
 *         nombre:
 *           type: string
 *           description: Nombre del cliente
 *         tipoDocumento:
 *           type: string
 *           enum: [Doc.trib.no.dom.sin.ruc, DNI, RUC, CE, PASAPORTE, OTRO, CARNE SOLIC REFUGIO, C.IDENT.-RREE, PTP, DOC.ID.EXTR., CPP]
 *           description: Tipo de documento del cliente
 *         numeroDocumento:
 *           type: string
 *           description: Número de documento del cliente
 *         direccion:
 *           type: string
 *           description: Dirección del cliente
 *         telefono:
 *           type: string
 *           description: Teléfono del cliente
 *         codInterno:
 *           type: string
 *           description: Código interno del cliente
 *         email:
 *           type: string
 *           format: email
 *           description: Email del cliente
 *         estado:
 *           type: boolean
 *           description: Estado del cliente
 *         apellidoPaterno:
 *           type: string
 *           description: Apellido paterno del cliente
 *         apellidoMaterno:
 *           type: string
 *           description: Apellido materno del cliente
 *         nombres:
 *           type: string
 *           description: Nombres del cliente
 *         ubigeo:
 *           type: string
 *           description: Código ubigeo de la dirección
 *         viaTipo:
 *           type: string
 *           description: Tipo de vía (ej. AV., JR.)
 *         viaNombre:
 *           type: string
 *           description: Nombre de la vía
 *         zonaCodigo:
 *           type: string
 *           description: Código de zona (ej. URB.)
 *         zonaTipo:
 *           type: string
 *           description: Tipo de zona (ej. CORPAC)
 *         numero:
 *           type: string
 *           description: Número de la dirección
 *         interior:
 *           type: string
 *           description: Número interior
 *         lote:
 *           type: string
 *           description: Lote
 *         dpto:
 *           type: string
 *           description: Departamento
 *         manzana:
 *           type: string
 *           description: Manzana
 *         kilometro:
 *           type: string
 *           description: Kilómetro
 *         distrito:
 *           type: string
 *           description: Distrito
 *         provincia:
 *           type: string
 *           description: Provincia
 *         departamento:
 *           type: string
 *           description: Departamento
 *         pais:
 *           type: string
 *           description: País del cliente
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación del cliente
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de actualización del cliente
 *       example:
 *         id: 1
 *         nombre: REXTIE S.A.C.
 *         tipoDocumento: RUC
 *         numeroDocumento: "20601030013"
 *         direccion: "AV. JOSE GALVEZ BARRENECHEA NRO 566 INT. 101 URB. CORPAC"
 *         telefono: "987654321"
 *         codInterno: "CLI001"
 *         email: "contacto@rextie.com"
 *         estado: true
 *         apellidoPaterno: "GARCIA"
 *         apellidoMaterno: "LOPEZ"
 *         nombres: "JUAN CARLOS"
 *         ubigeo: "150131"
 *         viaTipo: "AV."
 *         viaNombre: "JOSE GALVEZ BARRENECHEA"
 *         zonaCodigo: "URB."
 *         zonaTipo: "CORPAC"
 *         numero: "566"
 *         interior: "101"
 *         lote: "-"
 *         dpto: "-"
 *         manzana: "-"
 *         kilometro: "-"
 *         distrito: "SAN ISIDRO"
 *         provincia: "LIMA"
 *         departamento: "LIMA"
 *         pais: "Perú"
 */
const Cliente = sequelize.define(
  "Cliente",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tipoDocumento: {
      type: DataTypes.ENUM(
        "Doc.trib.no.dom.sin.ruc",
        "DNI",
        "RUC",
        "CE",
        "PASAPORTE",
        "OTRO",
        "CARNE SOLIC REFUGIO",
        "C.IDENT.-RREE",
        "PTP",
        "DOC.ID.EXTR.",
        "CPP"
      ),
      allowNull: true,
    },
    numeroDocumento: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    direccion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pais: {
      type: DataTypes.ENUM(
        "Perú",
        "Afganistán",
        "Albania",
        "Alemania",
        "Andorra",
        "Angola",
        "Antigua y Barbuda",
        "Arabia Saudita",
        "Argelia",
        "Argentina",
        "Armenia",
        "Australia",
        "Austria",
        "Azerbaiyán",
        "Bahamas",
        "Bangladés",
        "Barbados",
        "Baréin",
        "Bélgica",
        "Belice",
        "Benín",
        "Bielorrusia",
        "Birmania (Myanmar)",
        "Bolivia",
        "Bosnia y Herzegovina",
        "Botsuana",
        "Brasil",
        "Brunéi",
        "Bulgaria",
        "Burkina Faso",
        "Burundi",
        "Bután",
        "Cabo Verde",
        "Camboya",
        "Camerún",
        "Canadá",
        "Catar",
        "Chad",
        "Chile",
        "China",
        "Chipre",
        "Colombia",
        "Comoras",
        "Corea del Norte",
        "Corea del Sur",
        "Costa de Marfil",
        "Costa Rica",
        "Croacia",
        "Cuba",
        "Dinamarca",
        "Dominica",
        "Ecuador",
        "Egipto",
        "El Salvador",
        "Emiratos Árabes Unidos",
        "Eritrea",
        "Eslovaquia",
        "Eslovenia",
        "España",
        "Estados Unidos",
        "Estonia",
        "Etiopía",
        "Fiyi",
        "Filipinas",
        "Finlandia",
        "Francia",
        "Gabón",
        "Gambia",
        "Georgia",
        "Ghana",
        "Grecia",
        "Granada",
        "Guatemala",
        "Guinea",
        "Guinea-Bisáu",
        "Guinea Ecuatorial",
        "Guyana",
        "Haití",
        "Honduras",
        "Hungría",
        "India",
        "Indonesia",
        "Irak",
        "Irán",
        "Irlanda",
        "Islandia",
        "Islas Marshall",
        "Islas Salomón",
        "Israel",
        "Italia",
        "Jamaica",
        "Japón",
        "Jordania",
        "Kazajistán",
        "Kenia",
        "Kirguistán",
        "Kiribati",
        "Kuwait",
        "Laos",
        "Lesoto",
        "Letonia",
        "Líbano",
        "Liberia",
        "Libia",
        "Liechtenstein",
        "Lituania",
        "Luxemburgo",
        "Macedonia del Norte",
        "Madagascar",
        "Malasia",
        "Malaui",
        "Maldivas",
        "Mali",
        "Malta",
        "Marruecos",
        "Mauricio",
        "Mauritania",
        "México",
        "Micronesia",
        "Moldavia",
        "Mónaco",
        "Mongolia",
        "Montenegro",
        "Mozambique",
        "Namibia",
        "Nauru",
        "Nepal",
        "Nicaragua",
        "Níger",
        "Nigeria",
        "Noruega",
        "Nueva Zelanda",
        "Omán",
        "Países Bajos",
        "Pakistán",
        "Palaos",
        "Panamá",
        "Papúa Nueva Guinea",
        "Paraguay",
        "Polonia",
        "Portugal",
        "Reino Unido",
        "República Centroafricana",
        "República Checa",
        "República del Congo",
        "República Democrática del Congo",
        "República Dominicana",
        "Ruanda",
        "Rumania",
        "Rusia",
        "Samoa",
        "San Cristóbal y Nieves",
        "San Marino",
        "San Vicente y las Granadinas",
        "Santa Lucía",
        "Santo Tomé y Príncipe",
        "Senegal",
        "Serbia",
        "Seychelles",
        "Sierra Leona",
        "Singapur",
        "Siria",
        "Somalia",
        "Sri Lanka",
        "Sudáfrica",
        "Sudán",
        "Sudán del Sur",
        "Suecia",
        "Suiza",
        "Surinam",
        "Tailandia",
        "Tanzania",
        "Tayikistán",
        "Timor Oriental",
        "Togo",
        "Tonga",
        "Trinidad y Tobago",
        "Túnez",
        "Turkmenistán",
        "Turquía",
        "Tuvalu",
        "Ucrania",
        "Uganda",
        "Uruguay",
        "Uzbekistán",
        "Vanuatu",
        "Venezuela",
        "Vietnam",
        "Yemen",
        "Yibuti",
        "Zambia",
        "Zimbabue"
      ),
      allowNull: true,
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    codInterno: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: {
          msg: "Debe ser un email válido",
        },
      },
      set(value) {
        // Si el valor está vacío, establecerlo como null en lugar de string vacío
        this.setDataValue("email", value === "" ? null : value);
      },
    },
    estado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    apellidoPaterno: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    apellidoMaterno: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nombres: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ubigeo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    viaTipo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    viaNombre: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    zonaCodigo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    zonaTipo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    numero: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    interior: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lote: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    dpto: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    manzana: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kilometro: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    distrito: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    provincia: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    departamento: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "Clientes",
    freezeTableName: true,
  }
);
module.exports = Cliente;
