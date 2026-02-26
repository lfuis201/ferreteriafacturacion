import React, { useState, useEffect } from "react";
import {
  crearCliente,
  consultarRENIEC,
  actualizarCliente,
} from "../../services/clienteService";
import {
  User,
  Building,
  Mail,
  Phone,
  MapPin,
  Hash,
  Plus,
  X,
  Search,
  CheckCircle,
  Info,
  ArrowRight
} from "lucide-react";

// Simulación de datos de ubigeo - en tu aplicación real vendrían de una API
const ubigeosIniciales = [
  {
    id: "10101",
    codigo: "10101",
    departamento: "AMAZONAS",
    provincia: "CHACHAPOYAS",
    distrito: "CHACHAPOYAS",
  },
  {
    id: "10102",
    codigo: "10102",
    departamento: "AMAZONAS",
    provincia: "CHACHAPOYAS",
    distrito: "ASUNCION",
  },
  {
    id: "10103",
    codigo: "10103",
    departamento: "AMAZONAS",
    provincia: "CHACHAPOYAS",
    distrito: "BALSAS",
  },
  {
    id: "10104",
    codigo: "10104",
    departamento: "AMAZONAS",
    provincia: "CHACHAPOYAS",
    distrito: "CHETO",
  },
  {
    id: "10105",
    codigo: "10105",
    departamento: "AMAZONAS",
    provincia: "CHACHAPOYAS",
    distrito: "CHILQUIN",
  },
  {
    id: "10106",
    codigo: "10106",
    departamento: "AMAZONAS",
    provincia: "CHACHAPOYAS",
    distrito: "CHUQUIBAMBA",
  },
  {
    id: "10107",
    codigo: "10107",
    departamento: "AMAZONAS",
    provincia: "CHACHAPOYAS",
    distrito: "GRANADA",
  },
  {
    id: "10108",
    codigo: "10108",
    departamento: "AMAZONAS",
    provincia: "CHACHAPOYAS",
    distrito: "HUANCAS",
  },
  {
    id: "10109",
    codigo: "10109",
    departamento: "AMAZONAS",
    provincia: "CHACHAPOYAS",
    distrito: "LA JALCA",
  },
  {
    id: "10110",
    codigo: "10110",
    departamento: "AMAZONAS",
    provincia: "CHACHAPOYAS",
    distrito: "LEMERAMBA",
  },
  {
    id: "10111",
    codigo: "10111",
    departamento: "AMAZONAS",
    provincia: "CHACHAPOYAS",
    distrito: "LEVANTO",
  },
  {
    id: "10112",
    codigo: "10112",
    departamento: "AMAZONAS",
    provincia: "CHACHAPOYAS",
    distrito: "MAGDALENA",
  },
  {
    id: "10113",
    codigo: "10113",
    departamento: "AMAZONAS",
    provincia: "CHACHAPOYAS",
    distrito: "MARISCAL CASTILLA",
  },
  {
    id: "10114",
    codigo: "10114",
    departamento: "AMAZONAS",
    provincia: "CHACHAPOYAS",
    distrito: "MOLINOPAMPA",
  },
  {
    id: "10115",
    codigo: "10115",
    departamento: "AMAZONAS",
    provincia: "CHACHAPOYAS",
    distrito: "MONTEVIDEO",
  },
  {
    id: "10116",
    codigo: "10116",
    departamento: "AMAZONAS",
    provincia: "CHACHAPOYAS",
    distrito: "OLLEROS",
  },
  {
    id: "10117",
    codigo: "10117",
    departamento: "AMAZONAS",
    provincia: "CHACHAPOYAS",
    distrito: "QUINJALCA",
  },
  {
    id: "10118",
    codigo: "10118",
    departamento: "AMAZONAS",
    provincia: "CHACHAPOYAS",
    distrito: "SAN FRANCISCO DE DAGUAS",
  },
  {
    id: "10119",
    codigo: "10119",
    departamento: "AMAZONAS",
    provincia: "CHACHAPOYAS",
    distrito: "SAN ISIDRO DE MANO",
  },
  {
    id: "10120",
    codigo: "10120",
    departamento: "AMAZONAS",
    provincia: "CHACHAPOYAS",
    distrito: "SOLOCO",
  },
  {
    id: "10121",
    codigo: "10121",
    departamento: "AMAZONAS",
    provincia: "CHACHAPOYAS",
    distrito: "SONCHE",
  },
  {
    id: "10201",
    codigo: "10201",
    departamento: "AMAZONAS",
    provincia: "BAGUA",
    distrito: "LA PECA",
  },
  {
    id: "10202",
    codigo: "10202",
    departamento: "AMAZONAS",
    provincia: "BAGUA",
    distrito: "ARAMANGO",
  },
  {
    id: "10203",
    codigo: "10203",
    departamento: "AMAZONAS",
    provincia: "BAGUA",
    distrito: "COPALLIN",
  },
  {
    id: "10204",
    codigo: "10204",
    departamento: "AMAZONAS",
    provincia: "BAGUA",
    distrito: "EL PARCO",
  },
  {
    id: "10205",
    codigo: "10205",
    departamento: "AMAZONAS",
    provincia: "BAGUA",
    distrito: "BAGUA",
  },
  {
    id: "10206",
    codigo: "10206",
    departamento: "AMAZONAS",
    provincia: "BAGUA",
    distrito: "IMAZA",
  },

  {
    id: "10301",
    codigo: "10301",
    departamento: "AMAZONAS",
    provincia: "BONGARA",
    distrito: "JUMBILLA",
  },
  {
    id: "10302",
    codigo: "10302",
    departamento: "AMAZONAS",
    provincia: "BONGARA",
    distrito: "COROSHA",
  },
  {
    id: "10303",
    codigo: "10303",
    departamento: "AMAZONAS",
    provincia: "BONGARA",
    distrito: "CUISPES",
  },
  {
    id: "10304",
    codigo: "10304",
    departamento: "AMAZONAS",
    provincia: "BONGARA",
    distrito: "CHISQUILLA",
  },
  {
    id: "10305",
    codigo: "10305",
    departamento: "AMAZONAS",
    provincia: "BONGARA",
    distrito: "CHURUJA",
  },
  {
    id: "10306",
    codigo: "10306",
    departamento: "AMAZONAS",
    provincia: "BONGARA",
    distrito: "FLORIDA",
  },
  {
    id: "10307",
    codigo: "10307",
    departamento: "AMAZONAS",
    provincia: "BONGARA",
    distrito: "RECTA",
  },
  {
    id: "10308",
    codigo: "10308",
    departamento: "AMAZONAS",
    provincia: "BONGARA",
    distrito: "SAN CARLOS",
  },
  {
    id: "10309",
    codigo: "10309",
    departamento: "AMAZONAS",
    provincia: "BONGARA",
    distrito: "SHIPASBAMBA",
  },
  {
    id: "10310",
    codigo: "10310",
    departamento: "AMAZONAS",
    provincia: "BONGARA",
    distrito: "VALERA",
  },
  {
    id: "10311",
    codigo: "10311",
    departamento: "AMAZONAS",
    provincia: "BONGARA",
    distrito: "YAMBRASBAMBA",
  },
  {
    id: "10312",
    codigo: "10312",
    departamento: "AMAZONAS",
    provincia: "BONGARA",
    distrito: "JAZAN",
  },
  {
    id: "10401",
    codigo: "10401",
    departamento: "AMAZONAS",
    provincia: "LUYA",
    distrito: "LAMUD",
  },
  {
    id: "10402",
    codigo: "10402",
    departamento: "AMAZONAS",
    provincia: "LUYA",
    distrito: "CAMPORREDONDO",
  },
  {
    id: "10403",
    codigo: "10403",
    departamento: "AMAZONAS",
    provincia: "LUYA",
    distrito: "COCABAMBA",
  },
  {
    id: "10404",
    codigo: "10404",
    departamento: "AMAZONAS",
    provincia: "LUYA",
    distrito: "COLCAMAR",
  },
  {
    id: "10405",
    codigo: "10405",
    departamento: "AMAZONAS",
    provincia: "LUYA",
    distrito: "CONILA",
  },
  {
    id: "10406",
    codigo: "10406",
    departamento: "AMAZONAS",
    provincia: "LUYA",
    distrito: "INGULPATA",
  },
  {
    id: "10407",
    codigo: "10407",
    departamento: "AMAZONAS",
    provincia: "LUYA",
    distrito: "LONGUITA",
  },
  {
    id: "10408",
    codigo: "10408",
    departamento: "AMAZONAS",
    provincia: "LUYA",
    distrito: "LONYA CHICO",
  },
  {
    id: "10409",
    codigo: "10409",
    departamento: "AMAZONAS",
    provincia: "LUYA",
    distrito: "LUYA",
  },
  {
    id: "10410",
    codigo: "10410",
    departamento: "AMAZONAS",
    provincia: "LUYA",
    distrito: "LUYA VIEJO",
  },
  {
    id: "10411",
    codigo: "10411",
    departamento: "AMAZONAS",
    provincia: "LUYA",
    distrito: "MARIA",
  },
  {
    id: "10412",
    codigo: "10412",
    departamento: "AMAZONAS",
    provincia: "LUYA",
    distrito: "OCALLI",
  },
  {
    id: "10413",
    codigo: "10413",
    departamento: "AMAZONAS",
    provincia: "LUYA",
    distrito: "OCUMAL",
  },
  {
    id: "10414",
    codigo: "10414",
    departamento: "AMAZONAS",
    provincia: "LUYA",
    distrito: "PISUQUIA",
  },
  {
    id: "10415",
    codigo: "10415",
    departamento: "AMAZONAS",
    provincia: "LUYA",
    distrito: "SAN CRISTOBAL",
  },
  {
    id: "10416",
    codigo: "10416",
    departamento: "AMAZONAS",
    provincia: "LUYA",
    distrito: "SAN FRANCISCO DE YESO",
  },
  {
    id: "10417",
    codigo: "10417",
    departamento: "AMAZONAS",
    provincia: "LUYA",
    distrito: "SAN JERONIMO",
  },
  {
    id: "10418",
    codigo: "10418",
    departamento: "AMAZONAS",
    provincia: "LUYA",
    distrito: "SAN JUAN DE LOPECANCHA",
  },
  {
    id: "10419",
    codigo: "10419",
    departamento: "AMAZONAS",
    provincia: "LUYA",
    distrito: "SANTA CATALINA",
  },
  {
    id: "10420",
    codigo: "10420",
    departamento: "AMAZONAS",
    provincia: "LUYA",
    distrito: "SANTO TOMAS",
  },
  {
    id: "10421",
    codigo: "10421",
    departamento: "AMAZONAS",
    provincia: "LUYA",
    distrito: "TINGO",
  },
  {
    id: "10422",
    codigo: "10422",
    departamento: "AMAZONAS",
    provincia: "LUYA",
    distrito: "TRITA",
  },
  {
    id: "10423",
    codigo: "10423",
    departamento: "AMAZONAS",
    provincia: "LUYA",
    distrito: "PROVIDENCIA",
  },
  {
    id: "10501",
    codigo: "10501",
    departamento: "AMAZONAS",
    provincia: "RODRIGUEZ DE MENDOZA",
    distrito: "SAN NICOLAS",
  },
  {
    id: "10502",
    codigo: "10502",
    departamento: "AMAZONAS",
    provincia: "RODRIGUEZ DE MENDOZA",
    distrito: "COCHAMAL",
  },
  {
    id: "10503",
    codigo: "10503",
    departamento: "AMAZONAS",
    provincia: "RODRIGUEZ DE MENDOZA",
    distrito: "CHIRIMOTO",
  },
  {
    id: "10504",
    codigo: "10504",
    departamento: "AMAZONAS",
    provincia: "RODRIGUEZ DE MENDOZA",
    distrito: "HUAMBO",
  },
  {
    id: "10505",
    codigo: "10505",
    departamento: "AMAZONAS",
    provincia: "RODRIGUEZ DE MENDOZA",
    distrito: "LIMABAMBA",
  },
  {
    id: "10506",
    codigo: "10506",
    departamento: "AMAZONAS",
    provincia: "RODRIGUEZ DE MENDOZA",
    distrito: "LONGAR",
  },
  {
    id: "10507",
    codigo: "10507",
    departamento: "AMAZONAS",
    provincia: "RODRIGUEZ DE MENDOZA",
    distrito: "MILPUCC",
  },
  {
    id: "10508",
    codigo: "10508",
    departamento: "AMAZONAS",
    provincia: "RODRIGUEZ DE MENDOZA",
    distrito: "MARISCAL BENAVIDES",
  },
  {
    id: "10509",
    codigo: "10509",
    departamento: "AMAZONAS",
    provincia: "RODRIGUEZ DE MENDOZA",
    distrito: "OMIA",
  },
  {
    id: "10510",
    codigo: "10510",
    departamento: "AMAZONAS",
    provincia: "RODRIGUEZ DE MENDOZA",
    distrito: "SANTA ROSA",
  },
  {
    id: "10511",
    codigo: "10511",
    departamento: "AMAZONAS",
    provincia: "RODRIGUEZ DE MENDOZA",
    distrito: "TOTORA",
  },
  {
    id: "10512",
    codigo: "10512",
    departamento: "AMAZONAS",
    provincia: "RODRIGUEZ DE MENDOZA",
    distrito: "VISTA ALEGRE",
  },
  {
    id: "10601",
    codigo: "10601",
    departamento: "AMAZONAS",
    provincia: "CONDORCANQUI",
    distrito: "NIEVA",
  },
  {
    id: "10602",
    codigo: "10602",
    departamento: "AMAZONAS",
    provincia: "CONDORCANQUI",
    distrito: "RIO SANTIAGO",
  },
  {
    id: "10603",
    codigo: "10603",
    departamento: "AMAZONAS",
    provincia: "CONDORCANQUI",
    distrito: "EL CENEPA",
  },
  {
    id: "10701",
    codigo: "10701",
    departamento: "AMAZONAS",
    provincia: "UTCUBAMBA",
    distrito: "BAGUA GRANDE",
  },
  {
    id: "10702",
    codigo: "10702",
    departamento: "AMAZONAS",
    provincia: "UTCUBAMBA",
    distrito: "CALARIJRO",
  },
  {
    id: "10703",
    codigo: "10703",
    departamento: "AMAZONAS",
    provincia: "UTCUBAMBA",
    distrito: "CUMBA",
  },
  {
    id: "10704",
    codigo: "10704",
    departamento: "AMAZONAS",
    provincia: "UTCUBAMBA",
    distrito: "EL MILAGRO",
  },
  {
    id: "10705",
    codigo: "10705",
    departamento: "AMAZONAS",
    provincia: "UTCUBAMBA",
    distrito: "JAMALCA",
  },
  {
    id: "10706",
    codigo: "10706",
    departamento: "AMAZONAS",
    provincia: "UTCUBAMBA",
    distrito: "LONYA GRANDE",
  },
  {
    id: "10707",
    codigo: "10707",
    departamento: "AMAZONAS",
    provincia: "UTCUBAMBA",
    distrito: "YAMON",
  },
  {
    id: "20101",
    codigo: "20101",
    departamento: "ANCASH",
    provincia: "HUARAZ",
    distrito: "HUARAZ",
  },
  {
    id: "20102",
    codigo: "20102",
    departamento: "ANCASH",
    provincia: "HUARAZ",
    distrito: "INDEPENDENCIA",
  },
  {
    id: "20103",
    codigo: "20103",
    departamento: "ANCASH",
    provincia: "HUARAZ",
    distrito: "COCHABAMBA",
  },
  {
    id: "20104",
    codigo: "20104",
    departamento: "ANCASH",
    provincia: "HUARAZ",
    distrito: "COLCABAMBA",
  },
  {
    id: "20105",
    codigo: "20105",
    departamento: "ANCASH",
    provincia: "HUARAZ",
    distrito: "HUANCHAY",
  },
  {
    id: "20106",
    codigo: "20106",
    departamento: "ANCASH",
    provincia: "HUARAZ",
    distrito: "JANGAS",
  },
  {
    id: "20107",
    codigo: "20107",
    departamento: "ANCASH",
    provincia: "HUARAZ",
    distrito: "LA LIBERTAD",
  },
  {
    id: "20108",
    codigo: "20108",
    departamento: "ANCASH",
    provincia: "HUARAZ",
    distrito: "OLLEROS",
  },
  {
    id: "20109",
    codigo: "20109",
    departamento: "ANCASH",
    provincia: "HUARAZ",
    distrito: "PAMPAS GRANDE",
  },
  {
    id: "20110",
    codigo: "20110",
    departamento: "ANCASH",
    provincia: "HUARAZ",
    distrito: "PARIACOTO",
  },
  {
    id: "20111",
    codigo: "20111",
    departamento: "ANCASH",
    provincia: "HUARAZ",
    distrito: "PIRA",
  },
  {
    id: "20112",
    codigo: "20112",
    departamento: "ANCASH",
    provincia: "HUARAZ",
    distrito: "TARICA",
  },
  {
    id: "20201",
    codigo: "20201",
    departamento: "ANCASH",
    provincia: "AUA",
    distrito: "AUA",
  },
  {
    id: "20203",
    codigo: "20203",
    departamento: "ANCASH",
    provincia: "AUA",
    distrito: "CORIS",
  },
  {
    id: "20206",
    codigo: "20206",
    departamento: "ANCASH",
    provincia: "AUA",
    distrito: "HUACLLAN",
  },
  {
    id: "20206",
    codigo: "20206",
    departamento: "ANCASH",
    provincia: "AUA",
    distrito: "LA MERCED",
  },
  {
    id: "20208",
    codigo: "20208",
    departamento: "ANCASH",
    provincia: "AUA",
    distrito: "SUCHA",
  },
  {
    id: "20301",
    codigo: "20301",
    departamento: "ANCASH",
    provincia: "BOLOGNESI",
    distrito: "CHIOJIAN",
  },
  {
    id: "20302",
    codigo: "20302",
    departamento: "ANCASH",
    provincia: "BOLOGNESI",
    distrito: "ABELARDO PARDO LEZAMETA",
  },
  {
    id: "20304",
    codigo: "20304",
    departamento: "ANCASH",
    provincia: "BOLOGNESI",
    distrito: "AQUIA",
  },
  {
    id: "20305",
    codigo: "20305",
    departamento: "ANCASH",
    provincia: "BOLOGNESI",
    distrito: "CAJACAY",
  },
  {
    id: "20310",
    codigo: "20310",
    departamento: "ANCASH",
    provincia: "BOLOGNESI",
    distrito: "HUAYLLACAYAN",
  },
  {
    id: "20311",
    codigo: "20311",
    departamento: "ANCASH",
    provincia: "BOLOGNESI",
    distrito: "HUASTA",
  },
  {
    id: "20313",
    codigo: "20313",
    departamento: "ANCASH",
    provincia: "BOLOGNESI",
    distrito: "MANGAS",
  },
  {
    id: "20315",
    codigo: "20315",
    departamento: "ANCASH",
    provincia: "BOLOGNESI",
    distrito: "PACLLON",
  },
  {
    id: "20317",
    codigo: "20317",
    departamento: "ANCASH",
    provincia: "BOLOGNESI",
    distrito: "SAN MIGUEL DE CORPANQUI",
  },
  {
    id: "20320",
    codigo: "20320",
    departamento: "ANCASH",
    provincia: "BOLOGNESI",
    distrito: "TICLLOS",
  },
  {
    id: "20321",
    codigo: "20321",
    departamento: "ANCASH",
    provincia: "BOLOGNESI",
    distrito: "ANTONIO RAMONDI",
  },
  {
    id: "20322",
    codigo: "20322",
    departamento: "ANCASH",
    provincia: "BOLOGNESI",
    distrito: "CANIS",
  },
  {
    id: "20323",
    codigo: "20323",
    departamento: "ANCASH",
    provincia: "BOLOGNESI",
    distrito: "COLQUIOC",
  },
  {
    id: "20324",
    codigo: "20324",
    departamento: "ANCASH",
    provincia: "BOLOGNESI",
    distrito: "LA PRIMAVERA",
  },
  {
    id: "20325",
    codigo: "20325",
    departamento: "ANCASH",
    provincia: "BOLOGNESI",
    distrito: "HUALLANCA",
  },
  {
    id: "20401",
    codigo: "20401",
    departamento: "ANCASH",
    provincia: "CARHUAZ",
    distrito: "CARHUAZ",
  },
  {
    id: "20402",
    codigo: "20402",
    departamento: "ANCASH",
    provincia: "CARHUAZ",
    distrito: "ACOPAMPA",
  },
  {
    id: "20403",
    codigo: "20403",
    departamento: "ANCASH",
    provincia: "CARHUAZ",
    distrito: "AMASHCA",
  },
  {
    id: "20404",
    codigo: "20404",
    departamento: "ANCASH",
    provincia: "CARHUAZ",
    distrito: "ANTA",
  },
  {
    id: "20405",
    codigo: "20405",
    departamento: "ANCASH",
    provincia: "CARHUAZ",
    distrito: "ATAQUERO",
  },
  {
    id: "20406",
    codigo: "20406",
    departamento: "ANCASH",
    provincia: "CARHUAZ",
    distrito: "MARCARA",
  },
  {
    id: "20407",
    codigo: "20407",
    departamento: "ANCASH",
    provincia: "CARHUAZ",
    distrito: "PARIAHUANCA",
  },
  {
    id: "20408",
    codigo: "20408",
    departamento: "ANCASH",
    provincia: "CARHUAZ",
    distrito: "SAN MIGUEL DE ACO",
  },
  {
    id: "20409",
    codigo: "20409",
    departamento: "ANCASH",
    provincia: "CARHUAZ",
    distrito: "SHILLA",
  },
  {
    id: "20410",
    codigo: "20410",
    departamento: "ANCASH",
    provincia: "CARHUAZ",
    distrito: "TINCO",
  },
  {
    id: "20411",
    codigo: "20411",
    departamento: "ANCASH",
    provincia: "CARHUAZ",
    distrito: "YUNGAR",
  },
  {
    id: "20501",
    codigo: "20501",
    departamento: "ANCASH",
    provincia: "CASMA",
    distrito: "CASMA",
  },
  {
    id: "20502",
    codigo: "20502",
    departamento: "ANCASH",
    provincia: "CASMA",
    distrito: "BUENA VISTA ALTA",
  },
  {
    id: "20503",
    codigo: "20503",
    departamento: "ANCASH",
    provincia: "CASMA",
    distrito: "COMANDANTE NOEL",
  },
  {
    id: "20505",
    codigo: "20505",
    departamento: "ANCASH",
    provincia: "CASMA",
    distrito: "YAUTAN",
  },
  {
    id: "20601",
    codigo: "20601",
    departamento: "ANCASH",
    provincia: "CORONGO",
    distrito: "CORONGO",
  },
  {
    id: "20602",
    codigo: "20602",
    departamento: "ANCASH",
    provincia: "CORONGO",
    distrito: "ACO",
  },
  {
    id: "20603",
    codigo: "20603",
    departamento: "ANCASH",
    provincia: "CORONGO",
    distrito: "BAMBAS",
  },
  {
    id: "20604",
    codigo: "20604",
    departamento: "ANCASH",
    provincia: "CORONGO",
    distrito: "CUSCA",
  },
  {
    id: "20605",
    codigo: "20605",
    departamento: "ANCASH",
    provincia: "CORONGO",
    distrito: "LA PAMPA",
  },
  {
    id: "20606",
    codigo: "20606",
    departamento: "ANCASH",
    provincia: "CORONGO",
    distrito: "YANAC",
  },
  {
    id: "20607",
    codigo: "20607",
    departamento: "ANCASH",
    provincia: "CORONGO",
    distrito: "YUPAN",
  },
  {
    id: "20701",
    codigo: "20701",
    departamento: "ANCASH",
    provincia: "HUAYLAS",
    distrito: "CARAZ",
  },
  {
    id: "20702",
    codigo: "20702",
    departamento: "ANCASH",
    provincia: "HUAYLAS",
    distrito: "HUALLANCA",
  },
  {
    id: "20703",
    codigo: "20703",
    departamento: "ANCASH",
    provincia: "HUAYLAS",
    distrito: "HUATA",
  },
  {
    id: "20704",
    codigo: "20704",
    departamento: "ANCASH",
    provincia: "HUAYLAS",
    distrito: "HUAYLAS",
  },
  {
    id: "20705",
    codigo: "20705",
    departamento: "ANCASH",
    provincia: "HUAYLAS",
    distrito: "MATO",
  },
  {
    id: "20706",
    codigo: "20706",
    departamento: "ANCASH",
    provincia: "HUAYLAS",
    distrito: "PAMPAROMAS",
  },
  {
    id: "20707",
    codigo: "20707",
    departamento: "ANCASH",
    provincia: "HUAYLAS",
    distrito: "PUEBLO LIBRE",
  },
  {
    id: "20708",
    codigo: "20708",
    departamento: "ANCASH",
    provincia: "HUAYLAS",
    distrito: "SANTA CRUZ",
  },
  {
    id: "20709",
    codigo: "20709",
    departamento: "ANCASH",
    provincia: "HUAYLAS",
    distrito: "YURACMARCA",
  },
  {
    id: "20710",
    codigo: "20710",
    departamento: "ANCASH",
    provincia: "HUAYLAS",
    distrito: "SANTO TORIBIO",
  },
  {
    id: "20801",
    codigo: "20801",
    departamento: "ANCASH",
    provincia: "HUARI",
    distrito: "HUARI",
  },
  {
    id: "20802",
    codigo: "20802",
    departamento: "ANCASH",
    provincia: "HUARI",
    distrito: "CALAY",
  },
  {
    id: "20803",
    codigo: "20803",
    departamento: "ANCASH",
    provincia: "HUARI",
    distrito: "CHAVIN DE HUANTAR",
  },
  {
    id: "20804",
    codigo: "20804",
    departamento: "ANCASH",
    provincia: "HUARI",
    distrito: "HUACACHI",
  },
  {
    id: "20805",
    codigo: "20805",
    departamento: "ANCASH",
    provincia: "HUARI",
    distrito: "HUACHIS",
  },
  {
    id: "20806",
    codigo: "20806",
    departamento: "ANCASH",
    provincia: "HUARI",
    distrito: "HUACCHIS",
  },
  {
    id: "20807",
    codigo: "20807",
    departamento: "ANCASH",
    provincia: "HUARI",
    distrito: "HUANTAR",
  },
  {
    id: "20808",
    codigo: "20808",
    departamento: "ANCASH",
    provincia: "HUARI",
    distrito: "MASIN",
  },
  {
    id: "20809",
    codigo: "20809",
    departamento: "ANCASH",
    provincia: "HUARI",
    distrito: "PAUCAS",
  },
  {
    id: "20810",
    codigo: "20810",
    departamento: "ANCASH",
    provincia: "HUARI",
    distrito: "PONTO",
  },
  {
    id: "20811",
    codigo: "20811",
    departamento: "ANCASH",
    provincia: "HUARI",
    distrito: "RAHUAPAMPA",
  },
  {
    id: "20812",
    codigo: "20812",
    departamento: "ANCASH",
    provincia: "HUARI",
    distrito: "RAPAYAN",
  },
  {
    id: "20813",
    codigo: "20813",
    departamento: "ANCASH",
    provincia: "HUARI",
    distrito: "SAN MARCOS",
  },
  {
    id: "20814",
    codigo: "20814",
    departamento: "ANCASH",
    provincia: "HUARI",
    distrito: "SAN PEDRO DE CHANA",
  },
  {
    id: "20815",
    codigo: "20815",
    departamento: "ANCASH",
    provincia: "HUARI",
    distrito: "UCO",
  },
  {
    id: "20816",
    codigo: "20816",
    departamento: "ANCASH",
    provincia: "HUARI",
    distrito: "ANRA",
  },
  {
    id: "20901",
    codigo: "20901",
    departamento: "ANCASH",
    provincia: "MARISCAL LUZURIAGA",
    distrito: "PISCOBAMBA",
  },
  {
    id: "20902",
    codigo: "20902",
    departamento: "ANCASH",
    provincia: "MARISCAL LUZURIAGA",
    distrito: "CASCA",
  },
  {
    id: "20903",
    codigo: "20903",
    departamento: "ANCASH",
    provincia: "MARISCAL LUZURIAGA",
    distrito: "LUCMA",
  },
  {
    id: "20904",
    codigo: "20904",
    departamento: "ANCASH",
    provincia: "MARISCAL LUZURIAGA",
    distrito: "FIDEL OLIVAS ESCUDERO",
  },
  {
    id: "20905",
    codigo: "20905",
    departamento: "ANCASH",
    provincia: "MARISCAL LUZURIAGA",
    distrito: "LLAMA",
  },
  {
    id: "20906",
    codigo: "20906",
    departamento: "ANCASH",
    provincia: "MARISCAL LUZURIAGA",
    distrito: "LLUMPA",
  },
  {
    id: "20907",
    codigo: "20907",
    departamento: "ANCASH",
    provincia: "MARISCAL LUZURIAGA",
    distrito: "MUSGA",
  },
  {
    id: "20908",
    codigo: "20908",
    departamento: "ANCASH",
    provincia: "MARISCAL LUZURIAGA",
    distrito: "ELEAZAR GUZMAN BARRON",
  },
  {
    id: "21001",
    codigo: "21001",
    departamento: "ANCASH",
    provincia: "PALLASCA",
    distrito: "CABANA",
  },
  {
    id: "21002",
    codigo: "21002",
    departamento: "ANCASH",
    provincia: "PALLASCA",
    distrito: "BOLOGNESI",
  },
  {
    id: "21003",
    codigo: "21003",
    departamento: "ANCASH",
    provincia: "PALLASCA",
    distrito: "CONCHUCOS",
  },
  {
    id: "21004",
    codigo: "21004",
    departamento: "ANCASH",
    provincia: "PALLASCA",
    distrito: "HUACASCHUQUE",
  },
  {
    id: "21005",
    codigo: "21005",
    departamento: "ANCASH",
    provincia: "PALLASCA",
    distrito: "HUANDOVAL",
  },
  {
    id: "21006",
    codigo: "21006",
    departamento: "ANCASH",
    provincia: "PALLASCA",
    distrito: "LACABAMBA",
  },
  {
    id: "21007",
    codigo: "21007",
    departamento: "ANCASH",
    provincia: "PALLASCA",
    distrito: "LLAPO",
  },
  {
    id: "21008",
    codigo: "21008",
    departamento: "ANCASH",
    provincia: "PALLASCA",
    distrito: "PALLASCA",
  },
  {
    id: "21009",
    codigo: "21009",
    departamento: "ANCASH",
    provincia: "PALLASCA",
    distrito: "PAMPAS",
  },
  {
    id: "21010",
    codigo: "21010",
    departamento: "ANCASH",
    provincia: "PALLASCA",
    distrito: "SANTA ROSA",
  },

  {
    id: "21011",
    codigo: "21011",
    departamento: "ANCASH",
    provincia: "PALLASCA",
    distrito: "TAUCA",
  },
  {
    id: "21101",
    codigo: "21101",
    departamento: "ANCASH",
    provincia: "POMABAMBA",
    distrito: "POMABAMBA",
  },
  {
    id: "21102",
    codigo: "21102",
    departamento: "ANCASH",
    provincia: "POMABAMBA",
    distrito: "HUAYLLAN",
  },
  {
    id: "21103",
    codigo: "21103",
    departamento: "ANCASH",
    provincia: "POMABAMBA",
    distrito: "PAROBAMBA",
  },
  {
    id: "21104",
    codigo: "21104",
    departamento: "ANCASH",
    provincia: "POMABAMBA",
    distrito: "QUINUABAMBA",
  },
  {
    id: "21201",
    codigo: "21201",
    departamento: "ANCASH",
    provincia: "RECUAY",
    distrito: "RECUAY",
  },
  {
    id: "21202",
    codigo: "21202",
    departamento: "ANCASH",
    provincia: "RECUAY",
    distrito: "COTAPARACO",
  },
  {
    id: "21203",
    codigo: "21203",
    departamento: "ANCASH",
    provincia: "RECUAY",
    distrito: "HUAYLLAPAMPA",
  },
  {
    id: "21204",
    codigo: "21204",
    departamento: "ANCASH",
    provincia: "RECUAY",
    distrito: "MARCA",
  },
  {
    id: "21205",
    codigo: "21205",
    departamento: "ANCASH",
    provincia: "RECUAY",
    distrito: "PAMPAS CHICO",
  },
  {
    id: "21206",
    codigo: "21206",
    departamento: "ANCASH",
    provincia: "RECUAY",
    distrito: "PARARIN",
  },
  {
    id: "21207",
    codigo: "21207",
    departamento: "ANCASH",
    provincia: "RECUAY",
    distrito: "TAPACOCHA",
  },
  {
    id: "21208",
    codigo: "21208",
    departamento: "ANCASH",
    provincia: "RECUAY",
    distrito: "TICAPAMPA",
  },
  {
    id: "21209",
    codigo: "21209",
    departamento: "ANCASH",
    provincia: "RECUAY",
    distrito: "LLACLLIN",
  },
  {
    id: "21210",
    codigo: "21210",
    departamento: "ANCASH",
    provincia: "RECUAY",
    distrito: "CATAC",
  },
  {
    id: "21301",
    codigo: "21301",
    departamento: "ANCASH",
    provincia: "SANTA",
    distrito: "CHIMBOTE",
  },
  {
    id: "21302",
    codigo: "21302",
    departamento: "ANCASH",
    provincia: "SANTA",
    distrito: "CACERES DEL PERU",
  },
  {
    id: "21303",
    codigo: "21303",
    departamento: "ANCASH",
    provincia: "SANTA",
    distrito: "MACATE",
  },
  {
    id: "21304",
    codigo: "21304",
    departamento: "ANCASH",
    provincia: "SANTA",
    distrito: "MORO",
  },
  {
    id: "21305",
    codigo: "21305",
    departamento: "ANCASH",
    provincia: "SANTA",
    distrito: "NEPEÑA",
  },
  {
    id: "21306",
    codigo: "21306",
    departamento: "ANCASH",
    provincia: "SANTA",
    distrito: "SAMANCO",
  },
  {
    id: "21307",
    codigo: "21307",
    departamento: "ANCASH",
    provincia: "SANTA",
    distrito: "SANTA",
  },
  {
    id: "21308",
    codigo: "21308",
    departamento: "ANCASH",
    provincia: "SANTA",
    distrito: "COISHCO",
  },
  {
    id: "21309",
    codigo: "21309",
    departamento: "ANCASH",
    provincia: "SANTA",
    distrito: "NUEVO CHIMBOTE",
  },
  {
    id: "21401",
    codigo: "21401",
    departamento: "ANCASH",
    provincia: "SIHUAS",
    distrito: "SIHUAS",
  },
  {
    id: "21402",
    codigo: "21402",
    departamento: "ANCASH",
    provincia: "SIHUAS",
    distrito: "ALFONSO UGARTE",
  },
  {
    id: "21403",
    codigo: "21403",
    departamento: "ANCASH",
    provincia: "SIHUAS",
    distrito: "CHINGALPO",
  },
  {
    id: "21404",
    codigo: "21404",
    departamento: "ANCASH",
    provincia: "SIHUAS",
    distrito: "HUAYLLABAMBA",
  },
  {
    id: "21405",
    codigo: "21405",
    departamento: "ANCASH",
    provincia: "SIHUAS",
    distrito: "QUICHES",
  },
  {
    id: "21406",
    codigo: "21406",
    departamento: "ANCASH",
    provincia: "SIHUAS",
    distrito: "SICSIBAMBA",
  },
  {
    id: "21407",
    codigo: "21407",
    departamento: "ANCASH",
    provincia: "SIHUAS",
    distrito: "ACOBAMBA",
  },
  {
    id: "21408",
    codigo: "21408",
    departamento: "ANCASH",
    provincia: "SIHUAS",
    distrito: "CASHAPAMPA",
  },
  {
    id: "21409",
    codigo: "21409",
    departamento: "ANCASH",
    provincia: "SIHUAS",
    distrito: "RAGASH",
  },
  {
    id: "21410",
    codigo: "21410",
    departamento: "ANCASH",
    provincia: "SIHUAS",
    distrito: "SAN JUAN",
  },
  {
    id: "21501",
    codigo: "21501",
    departamento: "ANCASH",
    provincia: "YUNGAY",
    distrito: "YUNGAY",
  },
  {
    id: "21502",
    codigo: "21502",
    departamento: "ANCASH",
    provincia: "YUNGAY",
    distrito: "CASCAPARA",
  },
  {
    id: "21503",
    codigo: "21503",
    departamento: "ANCASH",
    provincia: "YUNGAY",
    distrito: "MANCOS",
  },
  {
    id: "21504",
    codigo: "21504",
    departamento: "ANCASH",
    provincia: "YUNGAY",
    distrito: "MATACOTO",
  },
  {
    id: "21505",
    codigo: "21505",
    departamento: "ANCASH",
    provincia: "YUNGAY",
    distrito: "QUILLO",
  },
  {
    id: "21506",
    codigo: "21506",
    departamento: "ANCASH",
    provincia: "YUNGAY",
    distrito: "RANRAHIRCA",
  },
  {
    id: "21507",
    codigo: "21507",
    departamento: "ANCASH",
    provincia: "YUNGAY",
    distrito: "SHUPLUY",
  },
  {
    id: "21508",
    codigo: "21508",
    departamento: "ANCASH",
    provincia: "YUNGAY",
    distrito: "YANAMA",
  },
  {
    id: "21601",
    codigo: "21601",
    departamento: "ANCASH",
    provincia: "ANTONIO RAIMONDI",
    distrito: "LLAMELLIN",
  },
  {
    id: "21602",
    codigo: "21602",
    departamento: "ANCASH",
    provincia: "ANTONIO RAIMONDI",
    distrito: "ACZO",
  },
  {
    id: "21603",
    codigo: "21603",
    departamento: "ANCASH",
    provincia: "ANTONIO RAIMONDI",
    distrito: "CHACCHO",
  },
  {
    id: "21604",
    codigo: "21604",
    departamento: "ANCASH",
    provincia: "ANTONIO RAIMONDI",
    distrito: "CHINGAS",
  },
  {
    id: "21605",
    codigo: "21605",
    departamento: "ANCASH",
    provincia: "ANTONIO RAIMONDI",
    distrito: "MIRGAS",
  },
  {
    id: "21606",
    codigo: "21606",
    departamento: "ANCASH",
    provincia: "ANTONIO RAIMONDI",
    distrito: "SAN JUAN DE RONTOY",
  },
  {
    id: "21701",
    codigo: "21701",
    departamento: "ANCASH",
    provincia: "CARLOS FITZCARRALD",
    distrito: "SAN LUIS",
  },
  {
    id: "21702",
    codigo: "21702",
    departamento: "ANCASH",
    provincia: "CARLOS FITZCARRALD",
    distrito: "YAUYA",
  },
  {
    id: "21703",
    codigo: "21703",
    departamento: "ANCASH",
    provincia: "CARLOS FITZCARRALD",
    distrito: "SAN NICOLAS",
  },
  {
    id: "21801",
    codigo: "21801",
    departamento: "ANCASH",
    provincia: "ASUNCION",
    distrito: "CHACAS",
  },
  {
    id: "21802",
    codigo: "21802",
    departamento: "ANCASH",
    provincia: "ASUNCION",
    distrito: "ACOCHACA",
  },
  {
    id: "21901",
    codigo: "21901",
    departamento: "ANCASH",
    provincia: "HUARMEY",
    distrito: "HUARMEY",
  },
  {
    id: "21902",
    codigo: "21902",
    departamento: "ANCASH",
    provincia: "HUARMEY",
    distrito: "COCHAPETI",
  },
  {
    id: "21903",
    codigo: "21903",
    departamento: "ANCASH",
    provincia: "HUARMEY",
    distrito: "HUAYAN",
  },
  {
    id: "21904",
    codigo: "21904",
    departamento: "ANCASH",
    provincia: "HUARMEY",
    distrito: "MALVAS",
  },
  {
    id: "21905",
    codigo: "21905",
    departamento: "ANCASH",
    provincia: "HUARMEY",
    distrito: "CULEBRAS",
  },
  {
    id: "22001",
    codigo: "22001",
    departamento: "ANCASH",
    provincia: "OCROS",
    distrito: "ACAS",
  },
  {
    id: "22002",
    codigo: "22002",
    departamento: "ANCASH",
    provincia: "OCROS",
    distrito: "CAJAMARQUILLA",
  },
  {
    id: "22003",
    codigo: "22003",
    departamento: "ANCASH",
    provincia: "OCROS",
    distrito: "CARHUAPAMPA",
  },
  {
    id: "22004",
    codigo: "22004",
    departamento: "ANCASH",
    provincia: "OCROS",
    distrito: "COCHAS",
  },
  {
    id: "22005",
    codigo: "22005",
    departamento: "ANCASH",
    provincia: "OCROS",
    distrito: "CONGAS",
  },
  {
    id: "22006",
    codigo: "22006",
    departamento: "ANCASH",
    provincia: "OCROS",
    distrito: "LLIPA",
  },
  {
    id: "22007",
    codigo: "22007",
    departamento: "ANCASH",
    provincia: "OCROS",
    distrito: "OCROS",
  },
  {
    id: "22008",
    codigo: "22008",
    departamento: "ANCASH",
    provincia: "OCROS",
    distrito: "SAN CRISTOBAL DE RAJAN",
  },
  {
    id: "22009",
    codigo: "22009",
    departamento: "ANCASH",
    provincia: "OCROS",
    distrito: "SAN PEDRO",
  },
  {
    id: "22010",
    codigo: "22010",
    departamento: "ANCASH",
    provincia: "OCROS",
    distrito: "SANTIAGO DE CHILCAS",
  },
  {
    id: "30101",
    codigo: "30101",
    departamento: "APURIMAC",
    provincia: "ABANCAY",
    distrito: "ABANCAY",
  },
  {
    id: "30102",
    codigo: "30102",
    departamento: "APURIMAC",
    provincia: "ABANCAY",
    distrito: "CIRCA",
  },
  {
    id: "30103",
    codigo: "30103",
    departamento: "APURIMAC",
    provincia: "ABANCAY",
    distrito: "CURAHUASI",
  },
  {
    id: "30104",
    codigo: "30104",
    departamento: "APURIMAC",
    provincia: "ABANCAY",
    distrito: "CHACOCHE",
  },
  {
    id: "30105",
    codigo: "30105",
    departamento: "APURIMAC",
    provincia: "ABANCAY",
    distrito: "HUANIPACA",
  },
  {
    id: "30106",
    codigo: "30106",
    departamento: "APURIMAC",
    provincia: "ABANCAY",
    distrito: "LAMBRAMA",
  },
  {
    id: "30107",
    codigo: "30107",
    departamento: "APURIMAC",
    provincia: "ABANCAY",
    distrito: "PICHIRHUA",
  },
  {
    id: "30108",
    codigo: "30108",
    departamento: "APURIMAC",
    provincia: "ABANCAY",
    distrito: "SAN PEDRO DE CACHORA",
  },
  {
    id: "30109",
    codigo: "30109",
    departamento: "APURIMAC",
    provincia: "ABANCAY",
    distrito: "TAMBURCO",
  },
  {
    id: "30201",
    codigo: "30201",
    departamento: "APURIMAC",
    provincia: "AYMARAES",
    distrito: "CHALHUANCA",
  },
  {
    id: "30202",
    codigo: "30202",
    departamento: "APURIMAC",
    provincia: "AYMARAES",
    distrito: "CAPAYA",
  },
  {
    id: "30203",
    codigo: "30203",
    departamento: "APURIMAC",
    provincia: "AYMARAES",
    distrito: "CARAYBAMBA",
  },
  {
    id: "30204",
    codigo: "30204",
    departamento: "APURIMAC",
    provincia: "AYMARAES",
    distrito: "COLCABAMBA",
  },
  {
    id: "30205",
    codigo: "30205",
    departamento: "APURIMAC",
    provincia: "AYMARAES",
    distrito: "COTARUSE",
  },
  {
    id: "30206",
    codigo: "30206",
    departamento: "APURIMAC",
    provincia: "AYMARAES",
    distrito: "CHAPIMARCA",
  },
  {
    id: "30207",
    codigo: "30207",
    departamento: "APURIMAC",
    provincia: "AYMARAES",
    distrito: "IHUAYLLO",
  },
  {
    id: "30208",
    codigo: "30208",
    departamento: "APURIMAC",
    provincia: "AYMARAES",
    distrito: "LUCRE",
  },
  {
    id: "30209",
    codigo: "30209",
    departamento: "APURIMAC",
    provincia: "AYMARAES",
    distrito: "POCOHUANCA",
  },
  {
    id: "30210",
    codigo: "30210",
    departamento: "APURIMAC",
    provincia: "AYMARAES",
    distrito: "SAÑAYCA",
  },
  {
    id: "30211",
    codigo: "30211",
    departamento: "APURIMAC",
    provincia: "AYMARAES",
    distrito: "SORAYA",
  },
  {
    id: "30212",
    codigo: "30212",
    departamento: "APURIMAC",
    provincia: "AYMARAES",
    distrito: "TAPAIRIHUA",
  },
  {
    id: "30213",
    codigo: "30213",
    departamento: "APURIMAC",
    provincia: "AYMARAES",
    distrito: "TINTAY",
  },
  {
    id: "30214",
    codigo: "30214",
    departamento: "APURIMAC",
    provincia: "AYMARAES",
    distrito: "TORAYA",
  },
  {
    id: "30215",
    codigo: "30215",
    departamento: "APURIMAC",
    provincia: "AYMARAES",
    distrito: "YANACA",
  },
  {
    id: "30216",
    codigo: "30216",
    departamento: "APURIMAC",
    provincia: "AYMARAES",
    distrito: "SAN JUAN DE CHACÑA",
  },
  {
    id: "30217",
    codigo: "30217",
    departamento: "APURIMAC",
    provincia: "AYMARAES",
    distrito: "JUSTO APU SAHUARAURA",
  },
  {
    id: "30301",
    codigo: "30301",
    departamento: "APURIMAC",
    provincia: "ANDAHUAYLAS",
    distrito: "ANDAHUAYLAS",
  },
  {
    id: "30302",
    codigo: "30302",
    departamento: "APURIMAC",
    provincia: "ANDAHUAYLAS",
    distrito: "ANDARAPA",
  },
  {
    id: "30303",
    codigo: "30303",
    departamento: "APURIMAC",
    provincia: "ANDAHUAYLAS",
    distrito: "CHIARA",
  },
  {
    id: "30304",
    codigo: "30304",
    departamento: "APURIMAC",
    provincia: "ANDAHUAYLAS",
    distrito: "HUANCARAMA",
  },
  {
    id: "30305",
    codigo: "30305",
    departamento: "APURIMAC",
    provincia: "ANDAHUAYLAS",
    distrito: "HUANCARAY",
  },
  {
    id: "30306",
    codigo: "30306",
    departamento: "APURIMAC",
    provincia: "ANDAHUAYLAS",
    distrito: "KISHUARA",
  },
  {
    id: "30307",
    codigo: "30307",
    departamento: "APURIMAC",
    provincia: "ANDAHUAYLAS",
    distrito: "PACOBAMBA",
  },
  {
    id: "30308",
    codigo: "30308",
    departamento: "APURIMAC",
    provincia: "ANDAHUAYLAS",
    distrito: "PAMPACHIRI",
  },
  {
    id: "30309",
    codigo: "30309",
    departamento: "APURIMAC",
    provincia: "ANDAHUAYLAS",
    distrito: "SAN ANTONIO DE CACHI",
  },
  {
    id: "30310",
    codigo: "30310",
    departamento: "APURIMAC",
    provincia: "ANDAHUAYLAS",
    distrito: "SAN JERONIMO",
  },
  {
    id: "30311",
    codigo: "30311",
    departamento: "APURIMAC",
    provincia: "ANDAHUAYLAS",
    distrito: "TALAVERA",
  },
  {
    id: "30312",
    codigo: "30312",
    departamento: "APURIMAC",
    provincia: "ANDAHUAYLAS",
    distrito: "TURPO",
  },
  {
    id: "30313",
    codigo: "30313",
    departamento: "APURIMAC",
    provincia: "ANDAHUAYLAS",
    distrito: "PACUCHA",
  },
  {
    id: "30314",
    codigo: "30314",
    departamento: "APURIMAC",
    provincia: "ANDAHUAYLAS",
    distrito: "POMACOCHA",
  },
  {
    id: "30315",
    codigo: "30315",
    departamento: "APURIMAC",
    provincia: "ANDAHUAYLAS",
    distrito: "SANTA MARIA DE CHICMO",
  },
  {
    id: "30316",
    codigo: "30316",
    departamento: "APURIMAC",
    provincia: "ANDAHUAYLAS",
    distrito: "TUMAY HUARACA",
  },
  {
    id: "30317",
    codigo: "30317",
    departamento: "APURIMAC",
    provincia: "ANDAHUAYLAS",
    distrito: "HUAYANA",
  },
  {
    id: "30318",
    codigo: "30318",
    departamento: "APURIMAC",
    provincia: "ANDAHUAYLAS",
    distrito: "SAN MIGUEL DE CHACCRAMPA",
  },
  {
    id: "30319",
    codigo: "30319",
    departamento: "APURIMAC",
    provincia: "ANDAHUAYLAS",
    distrito: "KAQUIABAMBA",
  },
  {
    id: "30320",
    codigo: "30320",
    departamento: "APURIMAC",
    provincia: "ANDAHUAYLAS",
    distrito: "JOSE MARIA ARGUEDAS",
  },
  {
    id: "30401",
    codigo: "30401",
    departamento: "APURIMAC",
    provincia: "ANTABAMBA",
    distrito: "ANTABAMBA",
  },
  {
    id: "30402",
    codigo: "30402",
    departamento: "APURIMAC",
    provincia: "ANTABAMBA",
    distrito: "EL ORO",
  },
  {
    id: "30403",
    codigo: "30403",
    departamento: "APURIMAC",
    provincia: "ANTABAMBA",
    distrito: "HUAQUIRCA",
  },
  {
    id: "30404",
    codigo: "30404",
    departamento: "APURIMAC",
    provincia: "ANTABAMBA",
    distrito: "JUAN ESPINOZA MEDRANO",
  },
  {
    id: "30405",
    codigo: "30405",
    departamento: "APURIMAC",
    provincia: "ANTABAMBA",
    distrito: "OROPESA",
  },
  {
    id: "30406",
    codigo: "30406",
    departamento: "APURIMAC",
    provincia: "ANTABAMBA",
    distrito: "PACHACONAS",
  },
  {
    id: "30407",
    codigo: "30407",
    departamento: "APURIMAC",
    provincia: "ANTABAMBA",
    distrito: "SABAINO",
  },
  {
    id: "30501",
    codigo: "30501",
    departamento: "APURIMAC",
    provincia: "COTABAMBAS",
    distrito: "TAMBOBAMBA",
  },
  {
    id: "30502",
    codigo: "30502",
    departamento: "APURIMAC",
    provincia: "COTABAMBAS",
    distrito: "COYLLURQUI",
  },
  {
    id: "30503",
    codigo: "30503",
    departamento: "APURIMAC",
    provincia: "COTABAMBAS",
    distrito: "COTABAMBAS",
  },
  {
    id: "30504",
    codigo: "30504",
    departamento: "APURIMAC",
    provincia: "COTABAMBAS",
    distrito: "HAQUIRA",
  },
  {
    id: "30505",
    codigo: "30505",
    departamento: "APURIMAC",
    provincia: "COTABAMBAS",
    distrito: "MARA",
  },
  {
    id: "30506",
    codigo: "30506",
    departamento: "APURIMAC",
    provincia: "COTABAMBAS",
    distrito: "CHALLHUAHUACHO",
  },
  {
    id: "30601",
    codigo: "30601",
    departamento: "APURIMAC",
    provincia: "GRAU",
    distrito: "CHUQUIBAMBILLA",
  },
  {
    id: "30602",
    codigo: "30602",
    departamento: "APURIMAC",
    provincia: "GRAU",
    distrito: "CURPAHUASI",
  },
  {
    id: "30603",
    codigo: "30603",
    departamento: "APURIMAC",
    provincia: "GRAU",
    distrito: "HUAILLATI",
  },
  {
    id: "30604",
    codigo: "30604",
    departamento: "APURIMAC",
    provincia: "GRAU",
    distrito: "MAMARA",
  },
  {
    id: "30605",
    codigo: "30605",
    departamento: "APURIMAC",
    provincia: "GRAU",
    distrito: "MARISCAL GAMARRA",
  },
  {
    id: "30606",
    codigo: "30606",
    departamento: "APURIMAC",
    provincia: "GRAU",
    distrito: "MICAELA BASTIDAS",
  },
  {
    id: "30607",
    codigo: "30607",
    departamento: "APURIMAC",
    provincia: "GRAU",
    distrito: "PROGRESO",
  },
  {
    id: "30608",
    codigo: "30608",
    departamento: "APURIMAC",
    provincia: "GRAU",
    distrito: "PATAYPAMPA",
  },
  {
    id: "30609",
    codigo: "30609",
    departamento: "APURIMAC",
    provincia: "GRAU",
    distrito: "SAN ANTONIO",
  },
  {
    id: "30610",
    codigo: "30610",
    departamento: "APURIMAC",
    provincia: "GRAU",
    distrito: "TURPAY",
  },
  {
    id: "30611",
    codigo: "30611",
    departamento: "APURIMAC",
    provincia: "GRAU",
    distrito: "VILCABAMBA",
  },
  {
    id: "30612",
    codigo: "30612",
    departamento: "APURIMAC",
    provincia: "GRAU",
    distrito: "VIRUNDO",
  },
  {
    id: "30613",
    codigo: "30613",
    departamento: "APURIMAC",
    provincia: "GRAU",
    distrito: "SANTA ROSA",
  },
  {
    id: "30614",
    codigo: "30614",
    departamento: "APURIMAC",
    provincia: "GRAU",
    distrito: "CURASCO",
  },
  {
    id: "30701",
    codigo: "30701",
    departamento: "APURIMAC",
    provincia: "CHINCHEROS",
    distrito: "CHINCHEROS",
  },
  {
    id: "30702",
    codigo: "30702",
    departamento: "APURIMAC",
    provincia: "CHINCHEROS",
    distrito: "ONGOY",
  },
  {
    id: "30703",
    codigo: "30703",
    departamento: "APURIMAC",
    provincia: "CHINCHEROS",
    distrito: "OCOBAMBA",
  },
  {
    id: "30704",
    codigo: "30704",
    departamento: "APURIMAC",
    provincia: "CHINCHEROS",
    distrito: "COCHARCAS",
  },
  {
    id: "30705",
    codigo: "30705",
    departamento: "APURIMAC",
    provincia: "CHINCHEROS",
    distrito: "ANCO HUALLO",
  },
  {
    id: "30706",
    codigo: "30706",
    departamento: "APURIMAC",
    provincia: "CHINCHEROS",
    distrito: "HUACCANA",
  },
  {
    id: "30707",
    codigo: "30707",
    departamento: "APURIMAC",
    provincia: "CHINCHEROS",
    distrito: "URANMARCA",
  },
  {
    id: "30708",
    codigo: "30708",
    departamento: "APURIMAC",
    provincia: "CHINCHEROS",
    distrito: "RANRACANCHA",
  },
  {
    id: "30709",
    codigo: "30709",
    departamento: "APURIMAC",
    provincia: "CHINCHEROS",
    distrito: "ROCCHACC",
  },
  {
    id: "30710",
    codigo: "30710",
    departamento: "APURIMAC",
    provincia: "CHINCHEROS",
    distrito: "EL PORVENIR",
  },
  {
    id: "30711",
    codigo: "30711",
    departamento: "APURIMAC",
    provincia: "CHINCHEROS",
    distrito: "LOS CHANKAS",
  },
  {
    id: "40101",
    codigo: "40101",
    departamento: "AREQUIPA",
    provincia: "AREQUIPA",
    distrito: "AREQUIPA",
  },
  {
    id: "40102",
    codigo: "40102",
    departamento: "AREQUIPA",
    provincia: "AREQUIPA",
    distrito: "CAYMA",
  },
  {
    id: "40103",
    codigo: "40103",
    departamento: "AREQUIPA",
    provincia: "AREQUIPA",
    distrito: "CERRO COLORADO",
  },

  {
    id: "40104",
    codigo: "40104",
    departamento: "AREQUIPA",
    provincia: "AREQUIPA",
    distrito: "CHARACATO",
  },
  {
    id: "40105",
    codigo: "40105",
    departamento: "AREQUIPA",
    provincia: "AREQUIPA",
    distrito: "CHIGUATA",
  },
  {
    id: "40106",
    codigo: "40106",
    departamento: "AREQUIPA",
    provincia: "AREQUIPA",
    distrito: "LA JOYA",
  },
  {
    id: "40107",
    codigo: "40107",
    departamento: "AREQUIPA",
    provincia: "AREQUIPA",
    distrito: "MIRAFLORES",
  },
  {
    id: "40108",
    codigo: "40108",
    departamento: "AREQUIPA",
    provincia: "AREQUIPA",
    distrito: "MOLLEBAYA",
  },
  {
    id: "40109",
    codigo: "40109",
    departamento: "AREQUIPA",
    provincia: "AREQUIPA",
    distrito: "PAUCARPATA",
  },
  {
    id: "40110",
    codigo: "40110",
    departamento: "AREQUIPA",
    provincia: "AREQUIPA",
    distrito: "POCSI",
  },
  {
    id: "40111",
    codigo: "40111",
    departamento: "AREQUIPA",
    provincia: "AREQUIPA",
    distrito: "POLOBAYA",
  },
  {
    id: "40112",
    codigo: "40112",
    departamento: "AREQUIPA",
    provincia: "AREQUIPA",
    distrito: "QUEQUEÑA",
  },
  {
    id: "40113",
    codigo: "40113",
    departamento: "AREQUIPA",
    provincia: "AREQUIPA",
    distrito: "SABANDIA",
  },
  {
    id: "40114",
    codigo: "40114",
    departamento: "AREQUIPA",
    provincia: "AREQUIPA",
    distrito: "SACHACA",
  },
  {
    id: "40115",
    codigo: "40115",
    departamento: "AREQUIPA",
    provincia: "AREQUIPA",
    distrito: "SAN JUAN DE SIGUAS",
  },
  {
    id: "40116",
    codigo: "40116",
    departamento: "AREQUIPA",
    provincia: "AREQUIPA",
    distrito: "SAN JUAN DE TARUCANI",
  },
  {
    id: "40117",
    codigo: "40117",
    departamento: "AREQUIPA",
    provincia: "AREQUIPA",
    distrito: "SANTA ISABEL DE SIGUAS",
  },
  {
    id: "40118",
    codigo: "40118",
    departamento: "AREQUIPA",
    provincia: "AREQUIPA",
    distrito: "SANTA RITA DE SHIUAS",
  },
  {
    id: "40119",
    codigo: "40119",
    departamento: "AREQUIPA",
    provincia: "AREQUIPA",
    distrito: "SOCABAYA",
  },
  {
    id: "40120",
    codigo: "40120",
    departamento: "AREQUIPA",
    provincia: "AREQUIPA",
    distrito: "TIABAYA",
  },
  {
    id: "40121",
    codigo: "40121",
    departamento: "AREQUIPA",
    provincia: "AREQUIPA",
    distrito: "UCHUMAYO",
  },
  {
    id: "40122",
    codigo: "40122",
    departamento: "AREQUIPA",
    provincia: "AREQUIPA",
    distrito: "VITOR",
  },
  {
    id: "40123",
    codigo: "40123",
    departamento: "AREQUIPA",
    provincia: "AREQUIPA",
    distrito: "YANAHUARA",
  },
  {
    id: "40124",
    codigo: "40124",
    departamento: "AREQUIPA",
    provincia: "AREQUIPA",
    distrito: "YARABAMBA",
  },
  {
    id: "40125",
    codigo: "40125",
    departamento: "AREQUIPA",
    provincia: "AREQUIPA",
    distrito: "YURA",
  },
  {
    id: "40126",
    codigo: "40126",
    departamento: "AREQUIPA",
    provincia: "AREQUIPA",
    distrito: "MARIANO MELGAR",
  },
  {
    id: "40127",
    codigo: "40127",
    departamento: "AREQUIPA",
    provincia: "AREQUIPA",
    distrito: "JACOBO HUNTER",
  },
  {
    id: "40128",
    codigo: "40128",
    departamento: "AREQUIPA",
    provincia: "AREQUIPA",
    distrito: "ALTO SELVA ALEGRE",
  },
  {
    id: "40129",
    codigo: "40129",
    departamento: "AREQUIPA",
    provincia: "AREQUIPA",
    distrito: "JOSE LUIS BUSTAMANTE Y RIVERO",
  },
  {
    id: "40201",
    codigo: "40201",
    departamento: "AREQUIPA",
    provincia: "CAYLLOMA",
    distrito: "CHIVAY",
  },
  {
    id: "40202",
    codigo: "40202",
    departamento: "AREQUIPA",
    provincia: "CAYLLOMA",
    distrito: "ACHOMA",
  },
  {
    id: "40203",
    codigo: "40203",
    departamento: "AREQUIPA",
    provincia: "CAYLLOMA",
    distrito: "CABANACONDE",
  },
  {
    id: "40204",
    codigo: "40204",
    departamento: "AREQUIPA",
    provincia: "CAYLLOMA",
    distrito: "CAYLLOMA",
  },
  {
    id: "40205",
    codigo: "40205",
    departamento: "AREQUIPA",
    provincia: "CAYLLOMA",
    distrito: "CALLALLI",
  },

  {
    id: "40206",
    codigo: "40206",
    departamento: "AREQUIPA",
    provincia: "CAYLLOMA",
    distrito: "COPORAQUE",
  },
  {
    id: "40207",
    codigo: "40207",
    departamento: "AREQUIPA",
    provincia: "CAYLLOMA",
    distrito: "HUAMBO",
  },
  {
    id: "40208",
    codigo: "40208",
    departamento: "AREQUIPA",
    provincia: "CAYLLOMA",
    distrito: "HUANCA",
  },
  {
    id: "40209",
    codigo: "40209",
    departamento: "AREQUIPA",
    provincia: "CAYLLOMA",
    distrito: "ICHUPAMPA",
  },
  {
    id: "40210",
    codigo: "40210",
    departamento: "AREQUIPA",
    provincia: "CAYLLOMA",
    distrito: "LARI",
  },
  {
    id: "40211",
    codigo: "40211",
    departamento: "AREQUIPA",
    provincia: "CAYLLOMA",
    distrito: "LLUTA",
  },
  {
    id: "40212",
    codigo: "40212",
    departamento: "AREQUIPA",
    provincia: "CAYLLOMA",
    distrito: "MACA",
  },
  {
    id: "40213",
    codigo: "40213",
    departamento: "AREQUIPA",
    provincia: "CAYLLOMA",
    distrito: "MADRIGAL",
  },
  {
    id: "40214",
    codigo: "40214",
    departamento: "AREQUIPA",
    provincia: "CAYLLOMA",
    distrito: "SAN ANTONIO DE CHUCA",
  },
  {
    id: "40215",
    codigo: "40215",
    departamento: "AREQUIPA",
    provincia: "CAYLLOMA",
    distrito: "SIBAYO",
  },
  {
    id: "40216",
    codigo: "40216",
    departamento: "AREQUIPA",
    provincia: "CAYLLOMA",
    distrito: "TAPAY",
  },
  {
    id: "40217",
    codigo: "40217",
    departamento: "AREQUIPA",
    provincia: "CAYLLOMA",
    distrito: "TISCO",
  },
  {
    id: "40218",
    codigo: "40218",
    departamento: "AREQUIPA",
    provincia: "CAYLLOMA",
    distrito: "TUTI",
  },
  {
    id: "40219",
    codigo: "40219",
    departamento: "AREQUIPA",
    provincia: "CAYLLOMA",
    distrito: "YANQUE",
  },
  {
    id: "40220",
    codigo: "40220",
    departamento: "AREQUIPA",
    provincia: "CAYLLOMA",
    distrito: "MAJES",
  },
  {
    id: "40301",
    codigo: "40301",
    departamento: "AREQUIPA",
    provincia: "CAMANA",
    distrito: "CAMANA",
  },
  {
    id: "40302",
    codigo: "40302",
    departamento: "AREQUIPA",
    provincia: "CAMANA",
    distrito: "JOSE MARIA QUIMPER",
  },
  {
    id: "40303",
    codigo: "40303",
    departamento: "AREQUIPA",
    provincia: "CAMANA",
    distrito: "MARIANO NICOLAS VALCARCEL",
  },
  {
    id: "40304",
    codigo: "40304",
    departamento: "AREQUIPA",
    provincia: "CAMANA",
    distrito: "MARISCAL CACERES",
  },
  {
    id: "40305",
    codigo: "40305",
    departamento: "AREQUIPA",
    provincia: "CAMANA",
    distrito: "NICOLAS DE PIEROLA",
  },
  {
    id: "40306",
    codigo: "40306",
    departamento: "AREQUIPA",
    provincia: "CAMANA",
    distrito: "OCOÑA",
  },
  {
    id: "40307",
    codigo: "40307",
    departamento: "AREQUIPA",
    provincia: "CAMANA",
    distrito: "QUILCA",
  },
  {
    id: "40308",
    codigo: "40308",
    departamento: "AREQUIPA",
    provincia: "CAMANA",
    distrito: "SAMUEL PASTOR",
  },
  {
    id: "40401",
    codigo: "40401",
    departamento: "AREQUIPA",
    provincia: "CARAVELI",
    distrito: "CARAVELI",
  },
  {
    id: "40402",
    codigo: "40402",
    departamento: "AREQUIPA",
    provincia: "CARAVELI",
    distrito: "ACARI",
  },
  {
    id: "40403",
    codigo: "40403",
    departamento: "AREQUIPA",
    provincia: "CARAVELI",
    distrito: "ATICO",
  },
  {
    id: "40404",
    codigo: "40404",
    departamento: "AREQUIPA",
    provincia: "CARAVELI",
    distrito: "ATIQUIPA",
  },
  {
    id: "40405",
    codigo: "40405",
    departamento: "AREQUIPA",
    provincia: "CARAVELI",
    distrito: "BELLA UNION",
  },
  {
    id: "40406",
    codigo: "40406",
    departamento: "AREQUIPA",
    provincia: "CARAVELI",
    distrito: "CAHUACHO",
  },
  {
    id: "40407",
    codigo: "40407",
    departamento: "AREQUIPA",
    provincia: "CARAVELI",
    distrito: "CHALA",
  },
  {
    id: "40408",
    codigo: "40408",
    departamento: "AREQUIPA",
    provincia: "CARAVELI",
    distrito: "CHAPARRA",
  },

  {
    id: "40409",
    codigo: "40409",
    departamento: "AREQUIPA",
    provincia: "CARAVELI",
    distrito: "HUANUHUANU",
  },
  {
    id: "40410",
    codigo: "40410",
    departamento: "AREQUIPA",
    provincia: "CARAVELI",
    distrito: "JAQUI",
  },
  {
    id: "40411",
    codigo: "40411",
    departamento: "AREQUIPA",
    provincia: "CARAVELI",
    distrito: "LOMAS",
  },
  {
    id: "40412",
    codigo: "40412",
    departamento: "AREQUIPA",
    provincia: "CARAVELI",
    distrito: "QUICACHA",
  },
  {
    id: "40413",
    codigo: "40413",
    departamento: "AREQUIPA",
    provincia: "CARAVELI",
    distrito: "YAUCA",
  },
  {
    id: "40501",
    codigo: "40501",
    departamento: "AREQUIPA",
    provincia: "CASTILLA",
    distrito: "APLAO",
  },
  {
    id: "40502",
    codigo: "40502",
    departamento: "AREQUIPA",
    provincia: "CASTILLA",
    distrito: "ANDAGUA",
  },
  {
    id: "40503",
    codigo: "40503",
    departamento: "AREQUIPA",
    provincia: "CASTILLA",
    distrito: "AYO",
  },
  {
    id: "40504",
    codigo: "40504",
    departamento: "AREQUIPA",
    provincia: "CASTILLA",
    distrito: "CHACHAS",
  },
  {
    id: "40505",
    codigo: "40505",
    departamento: "AREQUIPA",
    provincia: "CASTILLA",
    distrito: "CHILCAYMARCA",
  },
  {
    id: "40506",
    codigo: "40506",
    departamento: "AREQUIPA",
    provincia: "CASTILLA",
    distrito: "CHOCO",
  },
  {
    id: "40507",
    codigo: "40507",
    departamento: "AREQUIPA",
    provincia: "CASTILLA",
    distrito: "HUANCARQUI",
  },
  {
    id: "40508",
    codigo: "40508",
    departamento: "AREQUIPA",
    provincia: "CASTILLA",
    distrito: "MACHAGUAY",
  },
  {
    id: "40509",
    codigo: "40509",
    departamento: "AREQUIPA",
    provincia: "CASTILLA",
    distrito: "ORCOPAMPA",
  },
  {
    id: "40510",
    codigo: "40510",
    departamento: "AREQUIPA",
    provincia: "CASTILLA",
    distrito: "PAMPACOLCA",
  },
  {
    id: "40511",
    codigo: "40511",
    departamento: "AREQUIPA",
    provincia: "CASTILLA",
    distrito: "TIPAN",
  },
  {
    id: "40512",
    codigo: "40512",
    departamento: "AREQUIPA",
    provincia: "CASTILLA",
    distrito: "URACA",
  },
  {
    id: "40513",
    codigo: "40513",
    departamento: "AREQUIPA",
    provincia: "CASTILLA",
    distrito: "UKION",
  },
  {
    id: "40514",
    codigo: "40514",
    departamento: "AREQUIPA",
    provincia: "CASTILLA",
    distrito: "VIRACO",
  },
  {
    id: "40601",
    codigo: "40601",
    departamento: "AREQUIPA",
    provincia: "CONDESUYOS",
    distrito: "CHUQUIBAMBA",
  },
  {
    id: "40602",
    codigo: "40602",
    departamento: "AREQUIPA",
    provincia: "CONDESUYOS",
    distrito: "ANDARAY",
  },
  {
    id: "40603",
    codigo: "40603",
    departamento: "AREQUIPA",
    provincia: "CONDESUYOS",
    distrito: "CAYARANI",
  },
  {
    id: "40604",
    codigo: "40604",
    departamento: "AREQUIPA",
    provincia: "CONDESUYOS",
    distrito: "CHICHAS",
  },
  {
    id: "40605",
    codigo: "40605",
    departamento: "AREQUIPA",
    provincia: "CONDESUYOS",
    distrito: "IRAY",
  },
  {
    id: "40606",
    codigo: "40606",
    departamento: "AREQUIPA",
    provincia: "CONDESUYOS",
    distrito: "SALAMANCA",
  },
  {
    id: "40607",
    codigo: "40607",
    departamento: "AREQUIPA",
    provincia: "CONDESUYOS",
    distrito: "YANAQUIHUA",
  },
  {
    id: "40608",
    codigo: "40608",
    departamento: "AREQUIPA",
    provincia: "CONDESUYOS",
    distrito: "RIO GRANDE",
  },
  {
    id: "40701",
    codigo: "40701",
    departamento: "AREQUIPA",
    provincia: "ISLAY",
    distrito: "MOLLENDO",
  },
  {
    id: "40702",
    codigo: "40702",
    departamento: "AREQUIPA",
    provincia: "ISLAY",
    distrito: "COCACHACRA",
  },
  {
    id: "40703",
    codigo: "40703",
    departamento: "AREQUIPA",
    provincia: "ISLAY",
    distrito: "DEAN VALDIVIA",
  },
  {
    id: "40704",
    codigo: "40704",
    departamento: "AREQUIPA",
    provincia: "ISLAY",
    distrito: "ISLAY",
  },
  {
    id: "40705",
    codigo: "40705",
    departamento: "AREQUIPA",
    provincia: "ISLAY",
    distrito: "MEJIA",
  },
  {
    id: "40706",
    codigo: "40706",
    departamento: "AREQUIPA",
    provincia: "ISLAY",
    distrito: "PUNTA DE BOMBON",
  },
  {
    id: "40801",
    codigo: "40801",
    departamento: "AREQUIPA",
    provincia: "LA UNION",
    distrito: "COTAHUASI",
  },
  {
    id: "40802",
    codigo: "40802",
    departamento: "AREQUIPA",
    provincia: "LA UNION",
    distrito: "ALCA",
  },
  {
    id: "40803",
    codigo: "40803",
    departamento: "AREQUIPA",
    provincia: "LA UNION",
    distrito: "CHARCANA",
  },
  {
    id: "40804",
    codigo: "40804",
    departamento: "AREQUIPA",
    provincia: "LA UNION",
    distrito: "HUAYNACOTAS",
  },
  {
    id: "40805",
    codigo: "40805",
    departamento: "AREQUIPA",
    provincia: "LA UNION",
    distrito: "PAMPAMARCA",
  },
  {
    id: "40806",
    codigo: "40806",
    departamento: "AREQUIPA",
    provincia: "LA UNION",
    distrito: "PUYCA",
  },
  {
    id: "40807",
    codigo: "40807",
    departamento: "AREQUIPA",
    provincia: "LA UNION",
    distrito: "QUECHUALLA",
  },
  {
    id: "40808",
    codigo: "40808",
    departamento: "AREQUIPA",
    provincia: "LA UNION",
    distrito: "SAYLA",
  },
  {
    id: "40809",
    codigo: "40809",
    departamento: "AREQUIPA",
    provincia: "LA UNION",
    distrito: "TAURIA",
  },
  {
    id: "40810",
    codigo: "40810",
    departamento: "AREQUIPA",
    provincia: "LA UNION",
    distrito: "TOMEPAMPA",
  },
  {
    id: "40811",
    codigo: "40811",
    departamento: "AREQUIPA",
    provincia: "LA UNION",
    distrito: "TOPARA",
  },
  {
    id: "50101",
    codigo: "50101",
    departamento: "AYACUCHO",
    provincia: "HUAMANGA",
    distrito: "AYACUCHO",
  },
  {
    id: "50102",
    codigo: "50102",
    departamento: "AYACUCHO",
    provincia: "HUAMANGA",
    distrito: "ACOS VINCHOS",
  },
  {
    id: "50103",
    codigo: "50103",
    departamento: "AYACUCHO",
    provincia: "HUAMANGA",
    distrito: "CARMEN ALTO",
  },
  {
    id: "50104",
    codigo: "50104",
    departamento: "AYACUCHO",
    provincia: "HUAMANGA",
    distrito: "CHIARA",
  },
  {
    id: "50105",
    codigo: "50105",
    departamento: "AYACUCHO",
    provincia: "HUAMANGA",
    distrito: "QUINUA",
  },
  {
    id: "50106",
    codigo: "50106",
    departamento: "AYACUCHO",
    provincia: "HUAMANGA",
    distrito: "SAN JOSE DE TICLLAS",
  },
  {
    id: "50107",
    codigo: "50107",
    departamento: "AYACUCHO",
    provincia: "HUAMANGA",
    distrito: "SAN JUAN BAUTISTA",
  },
  {
    id: "50108",
    codigo: "50108",
    departamento: "AYACUCHO",
    provincia: "HUAMANGA",
    distrito: "SANTIAGO DE PISCHA",
  },
  {
    id: "50109",
    codigo: "50109",
    departamento: "AYACUCHO",
    provincia: "HUAMANGA",
    distrito: "VINCHOS",
  },
  {
    id: "50110",
    codigo: "50110",
    departamento: "AYACUCHO",
    provincia: "HUAMANGA",
    distrito: "TAMBILLO",
  },
  {
    id: "50111",
    codigo: "50111",
    departamento: "AYACUCHO",
    provincia: "HUAMANGA",
    distrito: "ACOCRO",
  },
  {
    id: "50112",
    codigo: "50112",
    departamento: "AYACUCHO",
    provincia: "HUAMANGA",
    distrito: "SOCOS",
  },
  {
    id: "50113",
    codigo: "50113",
    departamento: "AYACUCHO",
    provincia: "HUAMANGA",
    distrito: "OCROS",
  },
  {
    id: "50114",
    codigo: "50114",
    departamento: "AYACUCHO",
    provincia: "HUAMANGA",
    distrito: "PACAYCASA",
  },
  {
    id: "50115",
    codigo: "50115",
    departamento: "AYACUCHO",
    provincia: "HUAMANGA",
    distrito: "JESUS NAZARENO",
  },
  {
    id: "50116",
    codigo: "50116",
    departamento: "AYACUCHO",
    provincia: "HUAMANGA",
    distrito: "ANDRES AVELINO CACERES D.",
  },
  {
    id: "50201",
    codigo: "50201",
    departamento: "AYACUCHO",
    provincia: "CANGALLO",
    distrito: "CANGALLO",
  },
  {
    id: "50204",
    codigo: "50204",
    departamento: "AYACUCHO",
    provincia: "CANGALLO",
    distrito: "CHUSCHI",
  },
  {
    id: "50206",
    codigo: "50206",
    departamento: "AYACUCHO",
    provincia: "CANGALLO",
    distrito: "LOS MOROCHUCOS",
  },
  {
    id: "50207",
    codigo: "50207",
    departamento: "AYACUCHO",
    provincia: "CANGALLO",
    distrito: "PARAS",
  },
  {
    id: "50208",
    codigo: "50208",
    departamento: "AYACUCHO",
    provincia: "CANGALLO",
    distrito: "TOTOS",
  },
  {
    id: "50211",
    codigo: "50211",
    departamento: "AYACUCHO",
    provincia: "CANGALLO",
    distrito: "MARIA PARADO DE BELLIDO",
  },
  {
    id: "50301",
    codigo: "50301",
    departamento: "AYACUCHO",
    provincia: "HUANTA",
    distrito: "HUANTA",
  },
  {
    id: "50302",
    codigo: "50302",
    departamento: "AYACUCHO",
    provincia: "HUANTA",
    distrito: "AYAHUANCO",
  },
  {
    id: "50303",
    codigo: "50303",
    departamento: "AYACUCHO",
    provincia: "HUANTA",
    distrito: "HUAMANGUILLA",
  },
  {
    id: "50304",
    codigo: "50304",
    departamento: "AYACUCHO",
    provincia: "HUANTA",
    distrito: "IGUAIN",
  },
  {
    id: "50305",
    codigo: "50305",
    departamento: "AYACUCHO",
    provincia: "HUANTA",
    distrito: "LURICOCHA",
  },
  {
    id: "50307",
    codigo: "50307",
    departamento: "AYACUCHO",
    provincia: "HUANTA",
    distrito: "SANTILLANA",
  },
  {
    id: "50308",
    codigo: "50308",
    departamento: "AYACUCHO",
    provincia: "HUANTA",
    distrito: "SIVIA",
  },
  {
    id: "50309",
    codigo: "50309",
    departamento: "AYACUCHO",
    provincia: "HUANTA",
    distrito: "LLOCHEGUA",
  },
  {
    id: "50310",
    codigo: "50310",
    departamento: "AYACUCHO",
    provincia: "HUANTA",
    distrito: "CANAYRE",
  },
  {
    id: "50311",
    codigo: "50311",
    departamento: "AYACUCHO",
    provincia: "HUANTA",
    distrito: "UCHURACCAY",
  },
  {
    id: "50312",
    codigo: "50312",
    departamento: "AYACUCHO",
    provincia: "HUANTA",
    distrito: "PUCACOLPA",
  },
  {
    id: "50313",
    codigo: "50313",
    departamento: "AYACUCHO",
    provincia: "HUANTA",
    distrito: "CHACA",
  },
  {
    id: "50401",
    codigo: "50401",
    departamento: "AYACUCHO",
    provincia: "LA MAR",
    distrito: "SAN MIGUEL",
  },
  {
    id: "50402",
    codigo: "50402",
    departamento: "AYACUCHO",
    provincia: "LA MAR",
    distrito: "ANCO",
  },
  {
    id: "50403",
    codigo: "50403",
    departamento: "AYACUCHO",
    provincia: "LA MAR",
    distrito: "AYNA",
  },
  {
    id: "50404",
    codigo: "50404",
    departamento: "AYACUCHO",
    provincia: "LA MAR",
    distrito: "CHILCAS",
  },
  {
    id: "50405",
    codigo: "50405",
    departamento: "AYACUCHO",
    provincia: "LA MAR",
    distrito: "CHUNGUI",
  },
  {
    id: "50406",
    codigo: "50406",
    departamento: "AYACUCHO",
    provincia: "LA MAR",
    distrito: "TAMBO",
  },
  {
    id: "50407",
    codigo: "50407",
    departamento: "AYACUCHO",
    provincia: "LA MAR",
    distrito: "LUIS CARRANZA",
  },
  {
    id: "50408",
    codigo: "50408",
    departamento: "AYACUCHO",
    provincia: "LA MAR",
    distrito: "SANTA ROSA",
  },
  {
    id: "50409",
    codigo: "50409",
    departamento: "AYACUCHO",
    provincia: "LA MAR",
    distrito: "SAMUGARI",
  },
  {
    id: "50410",
    codigo: "50410",
    departamento: "AYACUCHO",
    provincia: "LA MAR",
    distrito: "ANCHIHUAY",
  },
  {
    id: "50411",
    codigo: "50411",
    departamento: "AYACUCHO",
    provincia: "LA MAR",
    distrito: "ORONCOY",
  },
  {
    id: "50501",
    codigo: "50501",
    departamento: "AYACUCHO",
    provincia: "LUCANAS",
    distrito: "PUQUIO",
  },
  {
    id: "50502",
    codigo: "50502",
    departamento: "AYACUCHO",
    provincia: "LUCANAS",
    distrito: "AUCARA",
  },
  {
    id: "50503",
    codigo: "50503",
    departamento: "AYACUCHO",
    provincia: "LUCANAS",
    distrito: "CABANA",
  },
  {
    id: "50504",
    codigo: "50504",
    departamento: "AYACUCHO",
    provincia: "LUCANAS",
    distrito: "CARMEN SALCEDO",
  },

  {
    id: "50506",
    codigo: "50506",
    departamento: "AYACUCHO",
    provincia: "LUCANAS",
    distrito: "CHAVIÑA",
  },
  {
    id: "50508",
    codigo: "50508",
    departamento: "AYACUCHO",
    provincia: "LUCANAS",
    distrito: "CHIPAO",
  },
  {
    id: "50510",
    codigo: "50510",
    departamento: "AYACUCHO",
    provincia: "LUCANAS",
    distrito: "HUAC-HUAS",
  },
  {
    id: "50511",
    codigo: "50511",
    departamento: "AYACUCHO",
    provincia: "LUCANAS",
    distrito: "LAFAMATE",
  },
  {
    id: "50512",
    codigo: "50512",
    departamento: "AYACUCHO",
    provincia: "LUCANAS",
    distrito: "LEONCIO PRADO",
  },
  {
    id: "50513",
    codigo: "50513",
    departamento: "AYACUCHO",
    provincia: "LUCANAS",
    distrito: "LUCANAS",
  },
  {
    id: "50514",
    codigo: "50514",
    departamento: "AYACUCHO",
    provincia: "LUCANAS",
    distrito: "LLAUTA",
  },
  {
    id: "50516",
    codigo: "50516",
    departamento: "AYACUCHO",
    provincia: "LUCANAS",
    distrito: "OCAÑA",
  },
  {
    id: "50517",
    codigo: "50517",
    departamento: "AYACUCHO",
    provincia: "LUCANAS",
    distrito: "OTOCA",
  },
  {
    id: "50520",
    codigo: "50520",
    departamento: "AYACUCHO",
    provincia: "LUCANAS",
    distrito: "SANCOS",
  },
  {
    id: "50521",
    codigo: "50521",
    departamento: "AYACUCHO",
    provincia: "LUCANAS",
    distrito: "SAN JUAN",
  },
  {
    id: "50522",
    codigo: "50522",
    departamento: "AYACUCHO",
    provincia: "LUCANAS",
    distrito: "SAN PEDRO",
  },
  {
    id: "50524",
    codigo: "50524",
    departamento: "AYACUCHO",
    provincia: "LUCANAS",
    distrito: "SANTA ANA DE HUAYCAHUACHO",
  },
  {
    id: "50525",
    codigo: "50525",
    departamento: "AYACUCHO",
    provincia: "LUCANAS",
    distrito: "SANTA LUCIA",
  },
  {
    id: "50529",
    codigo: "50529",
    departamento: "AYACUCHO",
    provincia: "LUCANAS",
    distrito: "SAISA",
  },
  {
    id: "50531",
    codigo: "50531",
    departamento: "AYACUCHO",
    provincia: "LUCANAS",
    distrito: "SAN PEDRO DE PALCO",
  },
  {
    id: "50532",
    codigo: "50532",
    departamento: "AYACUCHO",
    provincia: "LUCANAS",
    distrito: "SAN CRISTOBAL",
  },
  {
    id: "50601",
    codigo: "50601",
    departamento: "AYACUCHO",
    provincia: "PARINACOCHAS",
    distrito: "CORACORA",
  },
  {
    id: "50604",
    codigo: "50604",
    departamento: "AYACUCHO",
    provincia: "PARINACOCHAS",
    distrito: "CORONEL CASTAÑEDA",
  },
  {
    id: "50605",
    codigo: "50605",
    departamento: "AYACUCHO",
    provincia: "PARINACOCHAS",
    distrito: "CHUMPI",
  },
  {
    id: "50608",
    codigo: "50608",
    departamento: "AYACUCHO",
    provincia: "PARINACOCHAS",
    distrito: "PACAPAUSA",
  },
  {
    id: "50611",
    codigo: "50611",
    departamento: "AYACUCHO",
    provincia: "PARINACOCHAS",
    distrito: "PULLO",
  },
  {
    id: "50612",
    codigo: "50612",
    departamento: "AYACUCHO",
    provincia: "PARINACOCHAS",
    distrito: "PUYUSCA",
  },
  {
    id: "50615",
    codigo: "50615",
    departamento: "AYACUCHO",
    provincia: "PARINACOCHAS",
    distrito: "SAN FRANCISCO DE RAVACAYCO",
  },
  {
    id: "50616",
    codigo: "50616",
    departamento: "AYACUCHO",
    provincia: "PARINACOCHAS",
    distrito: "UPAHUACHO",
  },
  {
    id: "50701",
    codigo: "50701",
    departamento: "AYACUCHO",
    provincia: "VICTOR FAJARDO",
    distrito: "HUANCAPI",
  },
  {
    id: "50702",
    codigo: "50702",
    departamento: "AYACUCHO",
    provincia: "VICTOR FAJARDO",
    distrito: "ALCAMENCA",
  },
  {
    id: "50703",
    codigo: "50703",
    departamento: "AYACUCHO",
    provincia: "VICTOR FAJARDO",
    distrito: "APONGO",
  },
  {
    id: "50704",
    codigo: "50704",
    departamento: "AYACUCHO",
    provincia: "VICTOR FAJARDO",
    distrito: "CANARIA",
  },
  {
    id: "50706",
    codigo: "50706",
    departamento: "AYACUCHO",
    provincia: "VICTOR FAJARDO",
    distrito: "CAYARA",
  },
  {
    id: "50707",
    codigo: "50707",
    departamento: "AYACUCHO",
    provincia: "VICTOR FAJARDO",
    distrito: "COLCA",
  },
  {
    id: "50708",
    codigo: "50708",
    departamento: "AYACUCHO",
    provincia: "VICTOR FAJARDO",
    distrito: "HUALLA",
  },
  {
    id: "50709",
    codigo: "50709",
    departamento: "AYACUCHO",
    provincia: "VICTOR FAJARDO",
    distrito: "HUAMANQUIQUIA",
  },
  {
    id: "50710",
    codigo: "50710",
    departamento: "AYACUCHO",
    provincia: "VICTOR FAJARDO",
    distrito: "HUANCARAYLLA",
  },
  {
    id: "50713",
    codigo: "50713",
    departamento: "AYACUCHO",
    provincia: "VICTOR FAJARDO",
    distrito: "SARHUA",
  },
  {
    id: "50714",
    codigo: "50714",
    departamento: "AYACUCHO",
    provincia: "VICTOR FAJARDO",
    distrito: "VILCANCHOS",
  },
  {
    id: "50715",
    codigo: "50715",
    departamento: "AYACUCHO",
    provincia: "VICTOR FAJARDO",
    distrito: "ASQUIPATA",
  },
  {
    id: "50801",
    codigo: "50801",
    departamento: "AYACUCHO",
    provincia: "HUANCA SANCOS",
    distrito: "SANCOS",
  },
  {
    id: "50802",
    codigo: "50802",
    departamento: "AYACUCHO",
    provincia: "HUANCA SANCOS",
    distrito: "SACSAMARCA",
  },
  {
    id: "50803",
    codigo: "50803",
    departamento: "AYACUCHO",
    provincia: "HUANCA SANCOS",
    distrito: "SANTIAGO DE LUCANAMARCA",
  },
  {
    id: "50804",
    codigo: "50804",
    departamento: "AYACUCHO",
    provincia: "HUANCA SANCOS",
    distrito: "CARAPO",
  },
  {
    id: "50901",
    codigo: "50901",
    departamento: "AYACUCHO",
    provincia: "VILCAS HUAMAN",
    distrito: "VILCAS HUAMAN",
  },
  {
    id: "50902",
    codigo: "50902",
    departamento: "AYACUCHO",
    provincia: "VILCAS HUAMAN",
    distrito: "VISCHONGO",
  },
  {
    id: "50903",
    codigo: "50903",
    departamento: "AYACUCHO",
    provincia: "VILCAS HUAMAN",
    distrito: "ACCOMARCA",
  },
  {
    id: "50904",
    codigo: "50904",
    departamento: "AYACUCHO",
    provincia: "VILCAS HUAMAN",
    distrito: "CARHUANCA",
  },
  {
    id: "50905",
    codigo: "50905",
    departamento: "AYACUCHO",
    provincia: "VILCAS HUAMAN",
    distrito: "CONCEPCION",
  },
  {
    id: "50906",
    codigo: "50906",
    departamento: "AYACUCHO",
    provincia: "VILCAS HUAMAN",
    distrito: "HUAMBALPA",
  },
  {
    id: "50907",
    codigo: "50907",
    departamento: "AYACUCHO",
    provincia: "VILCAS HUAMAN",
    distrito: "SAURAMA",
  },
  {
    id: "50908",
    codigo: "50908",
    departamento: "AYACUCHO",
    provincia: "VILCAS HUAMAN",
    distrito: "INDEPENDENCIA",
  },
  {
    id: "51001",
    codigo: "51001",
    departamento: "AYACUCHO",
    provincia: "PAUCAR DEL SARA SARA",
    distrito: "PAUSA",
  },
  {
    id: "51002",
    codigo: "51002",
    departamento: "AYACUCHO",
    provincia: "PAUCAR DEL SARA SARA",
    distrito: "COLTA",
  },
  {
    id: "51003",
    codigo: "51003",
    departamento: "AYACUCHO",
    provincia: "PAUCAR DEL SARA SARA",
    distrito: "CORCULLA",
  },
  {
    id: "51004",
    codigo: "51004",
    departamento: "AYACUCHO",
    provincia: "PAUCAR DEL SARA SARA",
    distrito: "LAMPA",
  },
  {
    id: "51005",
    codigo: "51005",
    departamento: "AYACUCHO",
    provincia: "PAUCAR DEL SARA SARA",
    distrito: "MARCABAMBA",
  },
  {
    id: "51006",
    codigo: "51006",
    departamento: "AYACUCHO",
    provincia: "PAUCAR DEL SARA SARA",
    distrito: "OYOLO",
  },
  {
    id: "51007",
    codigo: "51007",
    departamento: "AYACUCHO",
    provincia: "PAUCAR DEL SARA SARA",
    distrito: "PARARCA",
  },
  {
    id: "51008",
    codigo: "51008",
    departamento: "AYACUCHO",
    provincia: "PAUCAR DEL SARA SARA",
    distrito: "SAN JAVIER DE ALPABAMBA",
  },
  {
    id: "51009",
    codigo: "51009",
    departamento: "AYACUCHO",
    provincia: "PAUCAR DEL SARA SARA",
    distrito: "SAN JOSE DE USHUA",
  },
  {
    id: "51010",
    codigo: "51010",
    departamento: "AYACUCHO",
    provincia: "PAUCAR DEL SARA SARA",
    distrito: "SARASARA",
  },
  {
    id: "51101",
    codigo: "51101",
    departamento: "AYACUCHO",
    provincia: "SUCRE",
    distrito: "QUEROBAMBA",
  },
  {
    id: "51102",
    codigo: "51102",
    departamento: "AYACUCHO",
    provincia: "SUCRE",
    distrito: "BELEN",
  },
  {
    id: "51103",
    codigo: "51103",
    departamento: "AYACUCHO",
    provincia: "SUCRE",
    distrito: "CHALCOS",
  },
  {
    id: "51104",
    codigo: "51104",
    departamento: "AYACUCHO",
    provincia: "SUCRE",
    distrito: "SAN SALVADOR DE QUIJE",
  },
  {
    id: "51105",
    codigo: "51105",
    departamento: "AYACUCHO",
    provincia: "SUCRE",
    distrito: "PAICO",
  },
  {
    id: "51106",
    codigo: "51106",
    departamento: "AYACUCHO",
    provincia: "SUCRE",
    distrito: "SANTIAGO DE PAUCARAY",
  },
  {
    id: "51107",
    codigo: "51107",
    departamento: "AYACUCHO",
    provincia: "SUCRE",
    distrito: "SAN PEDRO DE LARCAY",
  },
  {
    id: "51108",
    codigo: "51108",
    departamento: "AYACUCHO",
    provincia: "SUCRE",
    distrito: "SORAS",
  },
  {
    id: "51109",
    codigo: "51109",
    departamento: "AYACUCHO",
    provincia: "SUCRE",
    distrito: "HUACAÑA",
  },
  {
    id: "51110",
    codigo: "51110",
    departamento: "AYACUCHO",
    provincia: "SUCRE",
    distrito: "CHILCAYOC",
  },
  {
    id: "51111",
    codigo: "51111",
    departamento: "AYACUCHO",
    provincia: "SUCRE",
    distrito: "MORCOLLA",
  },
  {
    id: "60101",
    codigo: "60101",
    departamento: "CAJAMARCA",
    provincia: "CAJAMARCA",
    distrito: "CAJAMARCA",
  },
  {
    id: "60102",
    codigo: "60102",
    departamento: "CAJAMARCA",
    provincia: "CAJAMARCA",
    distrito: "ASUNCION",
  },
  {
    id: "60103",
    codigo: "60103",
    departamento: "CAJAMARCA",
    provincia: "CAJAMARCA",
    distrito: "COSPAN",
  },
  {
    id: "60104",
    codigo: "60104",
    departamento: "CAJAMARCA",
    provincia: "CAJAMARCA",
    distrito: "CHETILLA",
  },
  {
    id: "60105",
    codigo: "60105",
    departamento: "CAJAMARCA",
    provincia: "CAJAMARCA",
    distrito: "ENCAÑADA",
  },
  {
    id: "60106",
    codigo: "60106",
    departamento: "CAJAMARCA",
    provincia: "CAJAMARCA",
    distrito: "JESUS",
  },
  {
    id: "60107",
    codigo: "60107",
    departamento: "CAJAMARCA",
    provincia: "CAJAMARCA",
    distrito: "LOS BAÑOS DEL INCA",
  },
  {
    id: "60108",
    codigo: "60108",
    departamento: "CAJAMARCA",
    provincia: "CAJAMARCA",
    distrito: "LLACANORA",
  },
  {
    id: "60109",
    codigo: "60109",
    departamento: "CAJAMARCA",
    provincia: "CAJAMARCA",
    distrito: "MAGDALENA",
  },
  {
    id: "60110",
    codigo: "60110",
    departamento: "CAJAMARCA",
    provincia: "CAJAMARCA",
    distrito: "MATARA",
  },
  {
    id: "60111",
    codigo: "60111",
    departamento: "CAJAMARCA",
    provincia: "CAJAMARCA",
    distrito: "NAMORA",
  },
  {
    id: "60112",
    codigo: "60112",
    departamento: "CAJAMARCA",
    provincia: "CAJAMARCA",
    distrito: "SAN JUAN",
  },
  {
    id: "60201",
    codigo: "60201",
    departamento: "CAJAMARCA",
    provincia: "CAJABAMBA",
    distrito: "CAJABAMBA",
  },
  {
    id: "60202",
    codigo: "60202",
    departamento: "CAJAMARCA",
    provincia: "CAJABAMBA",
    distrito: "CACHACHI",
  },
  {
    id: "60203",
    codigo: "60203",
    departamento: "CAJAMARCA",
    provincia: "CAJABAMBA",
    distrito: "CONDEBAMBA",
  },
  {
    id: "60205",
    codigo: "60205",
    departamento: "CAJAMARCA",
    provincia: "CAJABAMBA",
    distrito: "SITACOCHA",
  },
  {
    id: "60301",
    codigo: "60301",
    departamento: "CAJAMARCA",
    provincia: "CELENDIN",
    distrito: "CELENDIN",
  },
  {
    id: "60302",
    codigo: "60302",
    departamento: "CAJAMARCA",
    provincia: "CELENDIN",
    distrito: "CORTEGANA",
  },
  {
    id: "60303",
    codigo: "60303",
    departamento: "CAJAMARCA",
    provincia: "CELENDIN",
    distrito: "CHUMUCH",
  },
  {
    id: "60304",
    codigo: "60304",
    departamento: "CAJAMARCA",
    provincia: "CELENDIN",
    distrito: "HUASMIN",
  },
  {
    id: "60305",
    codigo: "60305",
    departamento: "CAJAMARCA",
    provincia: "CELENDIN",
    distrito: "JORGE CHAVEZ",
  },
  {
    id: "60306",
    codigo: "60306",
    departamento: "CAJAMARCA",
    provincia: "CELENDIN",
    distrito: "JOSE GALVEZ",
  },
  {
    id: "60307",
    codigo: "60307",
    departamento: "CAJAMARCA",
    provincia: "CELENDIN",
    distrito: "MIGUEL IGLESIAS",
  },
  {
    id: "60308",
    codigo: "60308",
    departamento: "CAJAMARCA",
    provincia: "CELENDIN",
    distrito: "OXAMARCA",
  },
  {
    id: "60309",
    codigo: "60309",
    departamento: "CAJAMARCA",
    provincia: "CELENDIN",
    distrito: "SOROCHUCO",
  },
  {
    id: "60310",
    codigo: "60310",
    departamento: "CAJAMARCA",
    provincia: "CELENDIN",
    distrito: "SUCRE",
  },
  {
    id: "60311",
    codigo: "60311",
    departamento: "CAJAMARCA",
    provincia: "CELENDIN",
    distrito: "UTCO",
  },
  {
    id: "60312",
    codigo: "60312",
    departamento: "CAJAMARCA",
    provincia: "CELENDIN",
    distrito: "LA LIBERTAD DE PALLAN",
  },
  {
    id: "60401",
    codigo: "60401",
    departamento: "CAJAMARCA",
    provincia: "CONTUMAZA",
    distrito: "CONTUMAZA",
  },
  {
    id: "60403",
    codigo: "60403",
    departamento: "CAJAMARCA",
    provincia: "CONTUMAZA",
    distrito: "CHILETE",
  },
  {
    id: "60404",
    codigo: "60404",
    departamento: "CAJAMARCA",
    provincia: "CONTUMAZA",
    distrito: "GUZMANGO",
  },
  {
    id: "60405",
    codigo: "60405",
    departamento: "CAJAMARCA",
    provincia: "CONTUMAZA",
    distrito: "SAN BENITO",
  },
  {
    id: "60406",
    codigo: "60406",
    departamento: "CAJAMARCA",
    provincia: "CONTUMAZA",
    distrito: "CUPISNIQUE",
  },
  {
    id: "60407",
    codigo: "60407",
    departamento: "CAJAMARCA",
    provincia: "CONTUMAZA",
    distrito: "TANTARICA",
  },
  {
    id: "60408",
    codigo: "60408",
    departamento: "CAJAMARCA",
    provincia: "CONTUMAZA",
    distrito: "YONAN",
  },
  {
    id: "60409",
    codigo: "60409",
    departamento: "CAJAMARCA",
    provincia: "CONTUMAZA",
    distrito: "SANTA CRUZ DE TOLED",
  },
  {
    id: "60501",
    codigo: "60501",
    departamento: "CAJAMARCA",
    provincia: "CUTERVO",
    distrito: "CUTERVO",
  },
  {
    id: "60502",
    codigo: "60502",
    departamento: "CAJAMARCA",
    provincia: "CUTERVO",
    distrito: "CALLAYUC",
  },
  {
    id: "60503",
    codigo: "60503",
    departamento: "CAJAMARCA",
    provincia: "CUTERVO",
    distrito: "CUJILLO",
  },
  {
    id: "60504",
    codigo: "60504",
    departamento: "CAJAMARCA",
    provincia: "CUTERVO",
    distrito: "CHOROS",
  },
  {
    id: "60505",
    codigo: "60505",
    departamento: "CAJAMARCA",
    provincia: "CUTERVO",
    distrito: "LA RAMADA",
  },
  {
    id: "60506",
    codigo: "60506",
    departamento: "CAJAMARCA",
    provincia: "CUTERVO",
    distrito: "PIMPINGOS",
  },
  {
    id: "60507",
    codigo: "60507",
    departamento: "CAJAMARCA",
    provincia: "CUTERVO",
    distrito: "QUEROCOTILLO",
  },
  {
    id: "60508",
    codigo: "60508",
    departamento: "CAJAMARCA",
    provincia: "CUTERVO",
    distrito: "SAN ANDRES DE CUTERVO",
  },
  {
    id: "60509",
    codigo: "60509",
    departamento: "CAJAMARCA",
    provincia: "CUTERVO",
    distrito: "SAN JUAN DE CUTERVO",
  },
  {
    id: "60510",
    codigo: "60510",
    departamento: "CAJAMARCA",
    provincia: "CUTERVO",
    distrito: "SAN LUIS DE LUCMA",
  },
  {
    id: "60511",
    codigo: "60511",
    departamento: "CAJAMARCA",
    provincia: "CUTERVO",
    distrito: "SANTA CRUZ",
  },
  {
    id: "60512",
    codigo: "60512",
    departamento: "CAJAMARCA",
    provincia: "CUTERVO",
    distrito: "SANTO DOMINGO DE LA CAPILLA",
  },
  {
    id: "60513",
    codigo: "60513",
    departamento: "CAJAMARCA",
    provincia: "CUTERVO",
    distrito: "SANTO TOMAS",
  },
  {
    id: "60514",
    codigo: "60514",
    departamento: "CAJAMARCA",
    provincia: "CUTERVO",
    distrito: "SOCOTA",
  },
  {
    id: "60515",
    codigo: "60515",
    departamento: "CAJAMARCA",
    provincia: "CUTERVO",
    distrito: "TORIBIO CASANOVA",
  },
  {
    id: "60601",
    codigo: "60601",
    departamento: "CAJAMARCA",
    provincia: "CHOTA",
    distrito: "CHOTA",
  },
  {
    id: "60602",
    codigo: "60602",
    departamento: "CAJAMARCA",
    provincia: "CHOTA",
    distrito: "ANGUIA",
  },
  {
    id: "60603",
    codigo: "60603",
    departamento: "CAJAMARCA",
    provincia: "CHOTA",
    distrito: "COCHABAMBA",
  },

  {
    id: "60604",
    codigo: "60604",
    departamento: "CAJAMARCA",
    provincia: "CHOTA",
    distrito: "CONCHAN",
  },
  {
    id: "60605",
    codigo: "60605",
    departamento: "CAJAMARCA",
    provincia: "CHOTA",
    distrito: "CHADIN",
  },
  {
    id: "60606",
    codigo: "60606",
    departamento: "CAJAMARCA",
    provincia: "CHOTA",
    distrito: "CHIGURIP",
  },
  {
    id: "60607",
    codigo: "60607",
    departamento: "CAJAMARCA",
    provincia: "CHOTA",
    distrito: "CHIMBAN",
  },
  {
    id: "60608",
    codigo: "60608",
    departamento: "CAJAMARCA",
    provincia: "CHOTA",
    distrito: "HUAMBOS",
  },
  {
    id: "60609",
    codigo: "60609",
    departamento: "CAJAMARCA",
    provincia: "CHOTA",
    distrito: "LAJAS",
  },
  {
    id: "60610",
    codigo: "60610",
    departamento: "CAJAMARCA",
    provincia: "CHOTA",
    distrito: "LLAMA",
  },
  {
    id: "60611",
    codigo: "60611",
    departamento: "CAJAMARCA",
    provincia: "CHOTA",
    distrito: "MIRACOSTA",
  },
  {
    id: "60612",
    codigo: "60612",
    departamento: "CAJAMARCA",
    provincia: "CHOTA",
    distrito: "PACCHA",
  },
  {
    id: "60613",
    codigo: "60613",
    departamento: "CAJAMARCA",
    provincia: "CHOTA",
    distrito: "PION",
  },
  {
    id: "60614",
    codigo: "60614",
    departamento: "CAJAMARCA",
    provincia: "CHOTA",
    distrito: "QUEROCOTO",
  },
  {
    id: "60615",
    codigo: "60615",
    departamento: "CAJAMARCA",
    provincia: "CHOTA",
    distrito: "TACABAMBA",
  },
  {
    id: "60616",
    codigo: "60616",
    departamento: "CAJAMARCA",
    provincia: "CHOTA",
    distrito: "TOCMOCHE",
  },
  {
    id: "60617",
    codigo: "60617",
    departamento: "CAJAMARCA",
    provincia: "CHOTA",
    distrito: "SAN JUAN DE LICUPIS",
  },
  {
    id: "60618",
    codigo: "60618",
    departamento: "CAJAMARCA",
    provincia: "CHOTA",
    distrito: "CHOROPAMPA",
  },
  {
    id: "60619",
    codigo: "60619",
    departamento: "CAJAMARCA",
    provincia: "CHOTA",
    distrito: "CHALAMARCA",
  },
  {
    id: "60701",
    codigo: "60701",
    departamento: "CAJAMARCA",
    provincia: "HUALGAYOC",
    distrito: "BAMBAMARCA",
  },
  {
    id: "60702",
    codigo: "60702",
    departamento: "CAJAMarca",
    provincia: "HUALGAYOC",
    distrito: "CHUGUR",
  },
  {
    id: "60703",
    codigo: "60703",
    departamento: "CAJAMARCA",
    provincia: "HUALGAYOC",
    distrito: "HUALGAYOC",
  },
  {
    id: "60801",
    codigo: "60801",
    departamento: "CAJAMARCA",
    provincia: "JAEN",
    distrito: "JAEN",
  },
  {
    id: "60802",
    codigo: "60802",
    departamento: "CAJAMARCA",
    provincia: "JAEN",
    distrito: "BELLAVISTA",
  },
  {
    id: "60803",
    codigo: "60803",
    departamento: "CAJAMARCA",
    provincia: "JAEN",
    distrito: "COLASAY",
  },
  {
    id: "60804",
    codigo: "60804",
    departamento: "CAJAMARCA",
    provincia: "JAEN",
    distrito: "CHONTALI",
  },
  {
    id: "60805",
    codigo: "60805",
    departamento: "CAJAMARCA",
    provincia: "JAEN",
    distrito: "POMAHUACA",
  },
  {
    id: "60806",
    codigo: "60806",
    departamento: "CAJAMARCA",
    provincia: "JAEN",
    distrito: "PUCARA",
  },
  {
    id: "60807",
    codigo: "60807",
    departamento: "CAJAMARCA",
    provincia: "JAEN",
    distrito: "SALLIQUE",
  },
  {
    id: "60808",
    codigo: "60808",
    departamento: "CAJAMARCA",
    provincia: "JAEN",
    distrito: "SAN FELIPE",
  },
  {
    id: "60809",
    codigo: "60809",
    departamento: "CAJAMARCA",
    provincia: "JAEN",
    distrito: "SAN JOSE DEL ALTO",
  },
  {
    id: "60810",
    codigo: "60810",
    departamento: "CAJAMARCA",
    provincia: "JAEN",
    distrito: "SANTA ROSA",
  },
  {
    id: "60811",
    codigo: "60811",
    departamento: "CAJAMARCA",
    provincia: "JAEN",
    distrito: "LAS PIRIAS",
  },
  {
    id: "60812",
    codigo: "60812",
    departamento: "CAJAMARCA",
    provincia: "JAEN",
    distrito: "HUABAL",
  },
  {
    id: "60901",
    codigo: "60901",
    departamento: "CAJAMARCA",
    provincia: "SANTA CRUZ",
    distrito: "SANTA CRUZ",
  },
  {
    id: "60902",
    codigo: "60902",
    departamento: "CAJAMARCA",
    provincia: "SANTA CRUZ",
    distrito: "CATACHE",
  },
  {
    id: "60903",
    codigo: "60903",
    departamento: "CAJAMARCA",
    provincia: "SANTA CRUZ",
    distrito: "CHANCAYBAÑOS",
  },
  {
    id: "60904",
    codigo: "60904",
    departamento: "CAJAMARCA",
    provincia: "SANTA CRUZ",
    distrito: "LA ESPERANZA",
  },
  {
    id: "60905",
    codigo: "60905",
    departamento: "CAJAMARCA",
    provincia: "SANTA CRUZ",
    distrito: "NINABAMBA",
  },
  {
    id: "60906",
    codigo: "60906",
    departamento: "CAJAMARCA",
    provincia: "SANTA CRUZ",
    distrito: "PULAN",
  },
  {
    id: "60907",
    codigo: "60907",
    departamento: "CAJAMARCA",
    provincia: "SANTA CRUZ",
    distrito: "SEXI",
  },
  {
    id: "60908",
    codigo: "60908",
    departamento: "CAJAMARCA",
    provincia: "SANTA CRUZ",
    distrito: "UTICYACU",
  },
  {
    id: "60909",
    codigo: "60909",
    departamento: "CAJAMARCA",
    provincia: "SANTA CRUZ",
    distrito: "YAUYUCAN",
  },
  {
    id: "60910",
    codigo: "60910",
    departamento: "CAJAMARCA",
    provincia: "SANTA CRUZ",
    distrito: "ANDABAMBA",
  },
  {
    id: "60911",
    codigo: "60911",
    departamento: "CAJAMARCA",
    provincia: "SANTA CRUZ",
    distrito: "SAUCEPAMPA",
  },
  {
    id: "61001",
    codigo: "61001",
    departamento: "CAJAMARCA",
    provincia: "SAN MIGUEL",
    distrito: "SAN MIGUEL",
  },
  {
    id: "61002",
    codigo: "61002",
    departamento: "CAJAMARCA",
    provincia: "SAN MIGUEL",
    distrito: "CALQUIS",
  },
  {
    id: "61003",
    codigo: "61003",
    departamento: "CAJAMARCA",
    provincia: "SAN MIGUEL",
    distrito: "LA FLORIDA",
  },
  {
    id: "61004",
    codigo: "61004",
    departamento: "CAJAMARCA",
    provincia: "SAN MIGUEL",
    distrito: "LLAPA",
  },
  {
    id: "61005",
    codigo: "61005",
    departamento: "CAJAMARCA",
    provincia: "SAN MIGUEL",
    distrito: "NANCHOC",
  },
  {
    id: "61006",
    codigo: "61006",
    departamento: "CAJAMARCA",
    provincia: "SAN MIGUEL",
    distrito: "NIEPOS",
  },
  {
    id: "61007",
    codigo: "61007",
    departamento: "CAJAMARCA",
    provincia: "SAN MIGUEL",
    distrito: "SAN GREGORIO",
  },
  {
    id: "61008",
    codigo: "61008",
    departamento: "CAJAMARCA",
    provincia: "SAN MIGUEL",
    distrito: "SAN SILVESTRE DE COCHAN",
  },
  {
    id: "61009",
    codigo: "61009",
    departamento: "CAJAMARCA",
    provincia: "SAN MIGUEL",
    distrito: "EL PRADO",
  },
  {
    id: "61010",
    codigo: "61010",
    departamento: "CAJAMARCA",
    provincia: "SAN MIGUEL",
    distrito: "UNION AGUA BLANCA",
  },
  {
    id: "61011",
    codigo: "61011",
    departamento: "CAJAMARCA",
    provincia: "SAN MIGUEL",
    distrito: "TONGOD",
  },
  {
    id: "61012",
    codigo: "61012",
    departamento: "CAJAMARCA",
    provincia: "SAN MIGUEL",
    distrito: "CATILLUC",
  },
  {
    id: "61013",
    codigo: "61013",
    departamento: "CAJAMARCA",
    provincia: "SAN MIGUEL",
    distrito: "BOLIVAR",
  },
  {
    id: "61101",
    codigo: "61101",
    departamento: "CAJAMARCA",
    provincia: "SAN IGNACIO",
    distrito: "SAN IGNACIO",
  },
  {
    id: "61102",
    codigo: "61102",
    departamento: "CAJAMARCA",
    provincia: "SAN IGNACIO",
    distrito: "CHIRINOS",
  },
  {
    id: "61103",
    codigo: "61103",
    departamento: "CAJAMARCA",
    provincia: "SAN IGNACIO",
    distrito: "HUARANGO",
  },
  {
    id: "61104",
    codigo: "61104",
    departamento: "CAJAMARCA",
    provincia: "SAN IGNACIO",
    distrito: "NAMBALLE",
  },
  {
    id: "61105",
    codigo: "61105",
    departamento: "CAJAMARCA",
    provincia: "SAN IGNACIO",
    distrito: "LA COIPA",
  },
  {
    id: "61106",
    codigo: "61106",
    departamento: "CAJAMARCA",
    provincia: "SAN IGNACIO",
    distrito: "SAN JOSE DE LOURDES",
  },
  {
    id: "61107",
    codigo: "61107",
    departamento: "CAJAMARCA",
    provincia: "SAN IGNACIO",
    distrito: "TABACONAS",
  },
  {
    id: "61201",
    codigo: "61201",
    departamento: "CAJAMARCA",
    provincia: "SAN MARCOS",
    distrito: "PEDRO GALVEZ",
  },
  {
    id: "61202",
    codigo: "61202",
    departamento: "CAJAMARCA",
    provincia: "SAN MARCOS",
    distrito: "ICHOCAN",
  },
  {
    id: "61203",
    codigo: "61203",
    departamento: "CAJAMARCA",
    provincia: "SAN MARCOS",
    distrito: "GREgorio PITA",
  },
  {
    id: "61204",
    codigo: "61204",
    departamento: "CAJAMARCA",
    provincia: "SAN MARCOS",
    distrito: "JOSE MANUEL QUIROZ",
  },
  {
    id: "61205",
    codigo: "61205",
    departamento: "CAJAMARCA",
    provincia: "SAN MARCOS",
    distrito: "EDUARDO VILLANUEVA",
  },
  {
    id: "61206",
    codigo: "61206",
    departamento: "CAJAMARCA",
    provincia: "SAN MARCOS",
    distrito: "JOSE SABOGAL",
  },
  {
    id: "61207",
    codigo: "61207",
    departamento: "CAJAMARCA",
    provincia: "SAN MARCOS",
    distrito: "CHANCAY",
  },
  {
    id: "61301",
    codigo: "61301",
    departamento: "CAJAMARCA",
    provincia: "SAN PABLO",
    distrito: "SAN PABLO",
  },
  {
    id: "61302",
    codigo: "61302",
    departamento: "CAJAMARCA",
    provincia: "SAN PABLO",
    distrito: "SAN BERNARDINO",
  },
  {
    id: "61303",
    codigo: "61303",
    departamento: "CAJAMARCA",
    provincia: "SAN PABLO",
    distrito: "SAN LUIS",
  },
  {
    id: "61304",
    codigo: "61304",
    departamento: "CAJAMARCA",
    provincia: "SAN PABLO",
    distrito: "TUMBADEN",
  },
  {
    id: "70101",
    codigo: "70101",
    departamento: "CUSCO",
    provincia: "CUSCO",
    distrito: "CUSCO",
  },
  {
    id: "70102",
    codigo: "70102",
    departamento: "CUSCO",
    provincia: "CUSCO",
    distrito: "CCORCA",
  },
  {
    id: "70103",
    codigo: "70103",
    departamento: "CUSCO",
    provincia: "CUSCO",
    distrito: "POROY",
  },
  {
    id: "70104",
    codigo: "70104",
    departamento: "CUSCO",
    provincia: "CUSCO",
    distrito: "SAN JERONIMO",
  },
  {
    id: "70105",
    codigo: "70105",
    departamento: "CUSCO",
    provincia: "CUSCO",
    distrito: "SAN SEBASTIAN",
  },
  {
    id: "70106",
    codigo: "70106",
    departamento: "CUSCO",
    provincia: "CUSCO",
    distrito: "SANTIAGO",
  },
  {
    id: "70107",
    codigo: "70107",
    departamento: "CUSCO",
    provincia: "CUSCO",
    distrito: "SAYLLA",
  },
  {
    id: "70108",
    codigo: "70108",
    departamento: "CUSCO",
    provincia: "CUSCO",
    distrito: "WANCHAQ",
  },
  {
    id: "70201",
    codigo: "70201",
    departamento: "CUSCO",
    provincia: "ACOMAYO",
    distrito: "ACOMAYO",
  },
  {
    id: "70202",
    codigo: "70202",
    departamento: "CUSCO",
    provincia: "ACOMAYO",
    distrito: "ACOPIA",
  },
  {
    id: "70203",
    codigo: "70203",
    departamento: "CUSCO",
    provincia: "ACOMAYO",
    distrito: "ACOS",
  },
  {
    id: "70204",
    codigo: "70204",
    departamento: "CUSCO",
    provincia: "ACOMAYO",
    distrito: "POMACANCHI",
  },
  {
    id: "70205",
    codigo: "70205",
    departamento: "CUSCO",
    provincia: "ACOMAYO",
    distrito: "RONDOCAN",
  },
  {
    id: "70206",
    codigo: "70206",
    departamento: "CUSCO",
    provincia: "ACOMAYO",
    distrito: "SANGARARA",
  },
  {
    id: "70207",
    codigo: "70207",
    departamento: "CUSCO",
    provincia: "ACOMAYO",
    distrito: "MOSOC LLACTA",
  },
  {
    id: "70301",
    codigo: "70301",
    departamento: "CUSCO",
    provincia: "ANTA",
    distrito: "ANTA",
  },
  {
    id: "70302",
    codigo: "70302",
    departamento: "CUSCO",
    provincia: "ANTA",
    distrito: "CHINCHAYPUJIO",
  },
  {
    id: "70303",
    codigo: "70303",
    departamento: "CUSCO",
    provincia: "ANTA",
    distrito: "HUAROCONDO",
  },
  {
    id: "70304",
    codigo: "70304",
    departamento: "CUSCO",
    provincia: "ANTA",
    distrito: "LIMATAMBO",
  },
  {
    id: "70305",
    codigo: "70305",
    departamento: "CUSCO",
    provincia: "ANTA",
    distrito: "MOLLEPATA",
  },
  {
    id: "70306",
    codigo: "70306",
    departamento: "CUSCO",
    provincia: "ANTA",
    distrito: "PUCYURA",
  },
  {
    id: "70307",
    codigo: "70307",
    departamento: "CUSCO",
    provincia: "ANTA",
    distrito: "ZURITE",
  },
  {
    id: "70308",
    codigo: "70308",
    departamento: "CUSCO",
    provincia: "ANTA",
    distrito: "CACHIMAYO",
  },
  {
    id: "70309",
    codigo: "70309",
    departamento: "CUSCO",
    provincia: "ANTA",
    distrito: "ANCAHUASI",
  },
  {
    id: "70401",
    codigo: "70401",
    departamento: "CUSCO",
    provincia: "CALCA",
    distrito: "CALCA",
  },
  {
    id: "70402",
    codigo: "70402",
    departamento: "CUSCO",
    provincia: "CALCA",
    distrito: "COYA",
  },
  {
    id: "70403",
    codigo: "70403",
    departamento: "CUSCO",
    provincia: "CALCA",
    distrito: "LAMAY",
  },
  {
    id: "70404",
    codigo: "70404",
    departamento: "CUSCO",
    provincia: "CALCA",
    distrito: "LARES",
  },
  {
    id: "70405",
    codigo: "70405",
    departamento: "CUSCO",
    provincia: "CALCA",
    distrito: "PISAC",
  },
  {
    id: "70406",
    codigo: "70406",
    departamento: "CUSCO",
    provincia: "CALCA",
    distrito: "SAN SALVADOR",
  },
  {
    id: "70407",
    codigo: "70407",
    departamento: "CUSCO",
    provincia: "CALCA",
    distrito: "TARAY",
  },
  {
    id: "70408",
    codigo: "70408",
    departamento: "CUSCO",
    provincia: "CALCA",
    distrito: "YANATILE",
  },
  {
    id: "70501",
    codigo: "70501",
    departamento: "CUSCO",
    provincia: "CANAS",
    distrito: "YANAOCA",
  },
  {
    id: "70502",
    codigo: "70502",
    departamento: "CUSCO",
    provincia: "CANAS",
    distrito: "CHECCA",
  },
  {
    id: "70503",
    codigo: "70503",
    departamento: "CUSCO",
    provincia: "CANAS",
    distrito: "KUNTURKANKI",
  },
  {
    id: "70504",
    codigo: "70504",
    departamento: "CUSCO",
    provincia: "CANAS",
    distrito: "LANGUI",
  },
  {
    id: "70505",
    codigo: "70505",
    departamento: "CUSCO",
    provincia: "CANAS",
    distrito: "LAYO",
  },
  {
    id: "70506",
    codigo: "70506",
    departamento: "CUSCO",
    provincia: "CANAS",
    distrito: "PAMPAMARCA",
  },
  {
    id: "70507",
    codigo: "70507",
    departamento: "CUSCO",
    provincia: "CANAS",
    distrito: "QUEHUE",
  },
  {
    id: "70508",
    codigo: "70508",
    departamento: "CUSCO",
    provincia: "CANAS",
    distrito: "TUPAC AMARU",
  },
  {
    id: "70601",
    codigo: "70601",
    departamento: "CUSCO",
    provincia: "CANCHIS",
    distrito: "SICUANI",
  },
  {
    id: "70602",
    codigo: "70602",
    departamento: "CUSCO",
    provincia: "CANCHIS",
    distrito: "COMBAPATA",
  },
  {
    id: "70603",
    codigo: "70603",
    departamento: "CUSCO",
    provincia: "CANCHIS",
    distrito: "CHECACUPE",
  },
  {
    id: "70604",
    codigo: "70604",
    departamento: "CUSCO",
    provincia: "CANCHIS",
    distrito: "MARANGANI",
  },
  {
    id: "70605",
    codigo: "70605",
    departamento: "CUSCO",
    provincia: "CANCHIS",
    distrito: "PITUMARCA",
  },
  {
    id: "70606",
    codigo: "70606",
    departamento: "CUSCO",
    provincia: "CANCHIS",
    distrito: "SAN PABLO",
  },
  {
    id: "70607",
    codigo: "70607",
    departamento: "CUSCO",
    provincia: "CANCHIS",
    distrito: "SAN PEDRO",
  },
  {
    id: "70608",
    codigo: "70608",
    departamento: "CUSCO",
    provincia: "CANCHIS",
    distrito: "TINTa",
  },
  {
    id: "70701",
    codigo: "70701",
    departamento: "CUSCO",
    provincia: "CHUMBIVILCAS",
    distrito: "SANTO TOMAS",
  },
  {
    id: "70702",
    codigo: "70702",
    departamento: "CUSCO",
    provincia: "CHUMBIVILCAS",
    distrito: "CAPACMARCA",
  },
  {
    id: "70703",
    codigo: "70703",
    departamento: "CUSCO",
    provincia: "CHUMBIVILCAS",
    distrito: "COLOUEMARCA",
  },

  {
    id: "70704",
    codigo: "70704",
    departamento: "CUSCO",
    provincia: "CHUMBIVILCAS",
    distrito: "CHAMACA",
  },
  {
    id: "70705",
    codigo: "70705",
    departamento: "CUSCO",
    provincia: "CHUMBIVILCAS",
    distrito: "LIVITACA",
  },
  {
    id: "70706",
    codigo: "70706",
    departamento: "CUSCO",
    provincia: "CHUMBIVILCAS",
    distrito: "LLUSCO",
  },
  {
    id: "70707",
    codigo: "70707",
    departamento: "CUSCO",
    provincia: "CHUMBIVILCAS",
    distrito: "QUIÑOTA",
  },
  {
    id: "70708",
    codigo: "70708",
    departamento: "CUSCO",
    provincia: "CHUMBIVILCAS",
    distrito: "VEUILLE",
  },
  {
    id: "70801",
    codigo: "70801",
    departamento: "CUSCO",
    provincia: "ESPINAR",
    distrito: "ESPINAR",
  },
  {
    id: "70802",
    codigo: "70802",
    departamento: "CUSCO",
    provincia: "ESPINAR",
    distrito: "CONDOROMA",
  },
  {
    id: "70803",
    codigo: "70803",
    departamento: "CUSCO",
    provincia: "ESPINAR",
    distrito: "COPORAQUE",
  },
  {
    id: "70804",
    codigo: "70804",
    departamento: "CUSCO",
    provincia: "ESPINAR",
    distrito: "OCORURO",
  },
  {
    id: "70805",
    codigo: "70805",
    departamento: "CUSCO",
    provincia: "ESPINAR",
    distrito: "PALLPATA",
  },
  {
    id: "70806",
    codigo: "70806",
    departamento: "CUSCO",
    provincia: "ESPINAR",
    distrito: "PICHIGUA",
  },
  {
    id: "70807",
    codigo: "70807",
    departamento: "CUSCO",
    provincia: "ESPINAR",
    distrito: "SUYCKUTAMBO",
  },
  {
    id: "70808",
    codigo: "70808",
    departamento: "CUSCO",
    provincia: "ESPINAR",
    distrito: "ALTO PICHIGUA",
  },
  {
    id: "70901",
    codigo: "70901",
    departamento: "CUSCO",
    provincia: "LA CONVENCION",
    distrito: "SANTA ANA",
  },
  {
    id: "70902",
    codigo: "70902",
    departamento: "CUSCO",
    provincia: "LA CONVENCION",
    distrito: "ECHARATE",
  },
  {
    id: "70903",
    codigo: "70903",
    departamento: "CUSCO",
    provincia: "LA CONVENCION",
    distrito: "HUAYOPATA",
  },
  {
    id: "70904",
    codigo: "70904",
    departamento: "CUSCO",
    provincia: "LA CONVENCION",
    distrito: "MARANURA",
  },
  {
    id: "70905",
    codigo: "70905",
    departamento: "CUSCO",
    provincia: "LA CONVENCION",
    distrito: "OCOBAMBA",
  },
  {
    id: "70906",
    codigo: "70906",
    departamento: "CUSCO",
    provincia: "LA CONVENCION",
    distrito: "SANTA TERESA",
  },
  {
    id: "70907",
    codigo: "70907",
    departamento: "CUSCO",
    provincia: "LA CONVENCION",
    distrito: "VILCABAMBA",
  },
  {
    id: "70908",
    codigo: "70908",
    departamento: "CUSCO",
    provincia: "LA CONVENCION",
    distrito: "QUELLOUNO",
  },
  {
    id: "70909",
    codigo: "70909",
    departamento: "CUSCO",
    provincia: "LA CONVENCION",
    distrito: "KIMBIRI",
  },
  {
    id: "70910",
    codigo: "70910",
    departamento: "CUSCO",
    provincia: "LA CONVENCION",
    distrito: "PICHARI",
  },
  {
    id: "70911",
    codigo: "70911",
    departamento: "CUSCO",
    provincia: "LA CONVENCION",
    distrito: "INKAWASI",
  },
  {
    id: "70912",
    codigo: "70912",
    departamento: "CUSCO",
    provincia: "LA CONVENCION",
    distrito: "VILLA VIRGEN",
  },
  {
    id: "70913",
    codigo: "70913",
    departamento: "CUSCO",
    provincia: "LA CONVENCION",
    distrito: "VILLA KINTIARINA",
  },
  {
    id: "70915",
    codigo: "70915",
    departamento: "CUSCO",
    provincia: "LA CONVENCION",
    distrito: "MEGANTONI",
  },
  {
    id: "71001",
    codigo: "71001",
    departamento: "CUSCO",
    provincia: "PARURO",
    distrito: "PARURO",
  },
  {
    id: "71002",
    codigo: "71002",
    departamento: "CUSCO",
    provincia: "PARURO",
    distrito: "ACCHA",
  },
  {
    id: "71003",
    codigo: "71003",
    departamento: "CUSCO",
    provincia: "PARURO",
    distrito: "CCAPI",
  },
  {
    id: "71004",
    codigo: "71004",
    departamento: "CUSCO",
    provincia: "PARURO",
    distrito: "COLCHA",
  },
  {
    id: "71005",
    codigo: "71005",
    departamento: "CUSCO",
    provincia: "PARURO",
    distrito: "HUANOQUITE",
  },
  {
    id: "71006",
    codigo: "71006",
    departamento: "CUSCO",
    provincia: "PARURO",
    distrito: "OMACHA",
  },
  {
    id: "71007",
    codigo: "71007",
    departamento: "CUSCO",
    provincia: "PARURO",
    distrito: "YAURISQUE",
  },
  {
    id: "71008",
    codigo: "71008",
    departamento: "CUSCO",
    provincia: "PARURO",
    distrito: "PACCARITAMBO",
  },
  {
    id: "71009",
    codigo: "71009",
    departamento: "CUSCO",
    provincia: "PARURO",
    distrito: "PILLPINTO",
  },
  {
    id: "71101",
    codigo: "71101",
    departamento: "CUSCO",
    provincia: "PAUCARTAMBO",
    distrito: "PAUCARTAMBO",
  },
  {
    id: "71102",
    codigo: "71102",
    departamento: "CUSCO",
    provincia: "PAUCARTAMBO",
    distrito: "CAICAY",
  },
  {
    id: "71103",
    codigo: "71103",
    departamento: "CUSCO",
    provincia: "PAUCARTAMBO",
    distrito: "COLOUEPATA",
  },
  {
    id: "71104",
    codigo: "71104",
    departamento: "CUSCO",
    provincia: "PAUCARTAMBO",
    distrito: "CHALLABAMBA",
  },
  {
    id: "71105",
    codigo: "71105",
    departamento: "CUSCO",
    provincia: "PAUCARTAMBO",
    distrito: "KOSÑIPATA",
  },
  {
    id: "71106",
    codigo: "71106",
    departamento: "CUSCO",
    provincia: "PAUCARTAMBO",
    distrito: "HUANCARANI",
  },
  {
    id: "71201",
    codigo: "71201",
    departamento: "CUSCO",
    provincia: "QUISPICANCHI",
    distrito: "URCOS",
  },
  {
    id: "71202",
    codigo: "71202",
    departamento: "CUSCO",
    provincia: "QUISPICANCHI",
    distrito: "ANDAHUAYLILLAS",
  },
  {
    id: "71203",
    codigo: "71203",
    departamento: "CUSCO",
    provincia: "QUISPICANCHI",
    distrito: "CAMANTI",
  },
  {
    id: "71204",
    codigo: "71204",
    departamento: "CUSCO",
    provincia: "QUISPICANCHI",
    distrito: "CCARHUAYO",
  },
  {
    id: "71205",
    codigo: "71205",
    departamento: "CUSCO",
    provincia: "QUISPICANCHI",
    distrito: "CCATCA",
  },
  {
    id: "71206",
    codigo: "71206",
    departamento: "CUSCO",
    provincia: "QUISPICANCHI",
    distrito: "CUSIPATA",
  },
  {
    id: "71207",
    codigo: "71207",
    departamento: "CUSCO",
    provincia: "QUISPICANCHI",
    distrito: "HUARO",
  },
  {
    id: "71208",
    codigo: "71208",
    departamento: "CUSCO",
    provincia: "QUISPICANCHI",
    distrito: "LUCRE",
  },
  {
    id: "71209",
    codigo: "71209",
    departamento: "CUSCO",
    provincia: "QUISPICANCHI",
    distrito: "MARCAPATA",
  },
  {
    id: "71210",
    codigo: "71210",
    departamento: "CUSCO",
    provincia: "QUISPICANCHI",
    distrito: "OCONGATE",
  },
  {
    id: "71211",
    codigo: "71211",
    departamento: "CUSCO",
    provincia: "QUISPICANCHI",
    distrito: "OROPESA",
  },
  {
    id: "71212",
    codigo: "71212",
    departamento: "CUSCO",
    provincia: "QUISPICANCHI",
    distrito: "QUIQUIJANA",
  },
  {
    id: "71301",
    codigo: "71301",
    departamento: "CUSCO",
    provincia: "URUBAMBA",
    distrito: "URUBAMBA",
  },
  {
    id: "71302",
    codigo: "71302",
    departamento: "CUSCO",
    provincia: "URUBAMBA",
    distrito: "CHINCHERO",
  },
  {
    id: "71303",
    codigo: "71303",
    departamento: "CUSCO",
    provincia: "URUBAMBA",
    distrito: "HUAYLLABAMBA",
  },
  {
    id: "71304",
    codigo: "71304",
    departamento: "CUSCO",
    provincia: "URUBAMBA",
    distrito: "MACHUPICCHU",
  },
  {
    id: "71305",
    codigo: "71305",
    departamento: "CUSCO",
    provincia: "URUBAMBA",
    distrito: "MARAS",
  },
  {
    id: "71306",
    codigo: "71306",
    departamento: "CUSCO",
    provincia: "URUBAMBA",
    distrito: "OLLANTAYTAMBO",
  },
  {
    id: "71307",
    codigo: "71307",
    departamento: "CUSCO",
    provincia: "URUBAMBA",
    distrito: "YUCAY",
  },
  {
    id: "80101",
    codigo: "80101",
    departamento: "HUANCAVELICA",
    provincia: "HUANCAVELICA",
    distrito: "HUANCAVELICA",
  },
  {
    id: "80102",
    codigo: "80102",
    departamento: "HUANCAVELICA",
    provincia: "HUANCAVELICA",
    distrito: "ACOBAMBILLA",
  },
  {
    id: "80103",
    codigo: "80103",
    departamento: "HUANCAVELICA",
    provincia: "HUANCAVELICA",
    distrito: "ACORIA",
  },
  {
    id: "80104",
    codigo: "80104",
    departamento: "HUANCAVELICA",
    provincia: "HUANCAVELICA",
    distrito: "CONAYCA",
  },
  {
    id: "80105",
    codigo: "80105",
    departamento: "HUANCAVELICA",
    provincia: "HUANCAVELICA",
    distrito: "CUENCA",
  },
  {
    id: "80106",
    codigo: "80106",
    departamento: "HUANCAVELICA",
    provincia: "TAYACAJA",
    distrito: "HUACHOCOLPA",
  },
  {
    id: "80108",
    codigo: "80108",
    departamento: "HUANCAVELICA",
    provincia: "HUANCAVELICA",
    distrito: "HUAYLLAHUARA",
  },
  {
    id: "80109",
    codigo: "80109",
    departamento: "HUANCAVELICA",
    provincia: "HUANCAVELICA",
    distrito: "IZCUCHACA",
  },
  {
    id: "80110",
    codigo: "80110",
    departamento: "HUANCAVELICA",
    provincia: "HUANCAVELICA",
    distrito: "LARIA",
  },
  {
    id: "80111",
    codigo: "80111",
    departamento: "HUANCAVELICA",
    provincia: "HUANCAVELICA",
    distrito: "MANTA",
  },
  {
    id: "80112",
    codigo: "80112",
    departamento: "HUANCAVELICA",
    provincia: "HUANCAVELICA",
    distrito: "MARISCAL CACERES",
  },
  {
    id: "80113",
    codigo: "80113",
    departamento: "HUANCAVELICA",
    provincia: "HUANCAVELICA",
    distrito: "MOYA",
  },
  {
    id: "80114",
    codigo: "80114",
    departamento: "HUANCAVELICA",
    provincia: "HUANCAVELICA",
    distrito: "NUEVO OCCORO",
  },
  {
    id: "80115",
    codigo: "80115",
    departamento: "HUANCAVELICA",
    provincia: "HUANCAVELICA",
    distrito: "PLACA",
  },
  {
    id: "80116",
    codigo: "80116",
    departamento: "HUANCAVELICA",
    provincia: "HUANCAVELICA",
    distrito: "PILCHACA",
  },
  {
    id: "80117",
    codigo: "80117",
    departamento: "HUANCAVELICA",
    provincia: "HUANCAVELICA",
    distrito: "VILCA",
  },
  {
    id: "80118",
    codigo: "80118",
    departamento: "HUANCAVELICA",
    provincia: "HUANCAVELICA",
    distrito: "YAULI",
  },
  {
    id: "80119",
    codigo: "80119",
    departamento: "HUANCAVELICA",
    provincia: "HUANCAVELICA",
    distrito: "ASCENSION",
  },
  {
    id: "80120",
    codigo: "80120",
    departamento: "HUANCAVELICA",
    provincia: "HUANCAVELICA",
    distrito: "HUANDO",
  },
  {
    id: "80201",
    codigo: "80201",
    departamento: "HUANCAVELICA",
    provincia: "ACOBAMBA",
    distrito: "ACOBAMBA",
  },
  {
    id: "80202",
    codigo: "80202",
    departamento: "HUANCAVELICA",
    provincia: "ACOBAMBA",
    distrito: "ANTA",
  },
  {
    id: "80203",
    codigo: "80203",
    departamento: "HUANCAVELICA",
    provincia: "ACOBAMBA",
    distrito: "ANDABAMBA",
  },
  {
    id: "80204",
    codigo: "80204",
    departamento: "HUANCAVELICA",
    provincia: "ACOBAMBA",
    distrito: "CAJA",
  },
  {
    id: "80205",
    codigo: "80205",
    departamento: "HUANCAVELICA",
    provincia: "ACOBAMBA",
    distrito: "MARCAS",
  },
  {
    id: "80206",
    codigo: "80206",
    departamento: "HUANCAVELICA",
    provincia: "ACOBAMBA",
    distrito: "PAUCARA",
  },
  {
    id: "80207",
    codigo: "80207",
    departamento: "HUANCAVELICA",
    provincia: "ACOBAMBA",
    distrito: "POMACOCHA",
  },
  {
    id: "80208",
    codigo: "80208",
    departamento: "HUANCAVELICA",
    provincia: "ACOBAMBA",
    distrito: "ROSARIO",
  },
  {
    id: "80301",
    codigo: "80301",
    departamento: "HUANCAVELICA",
    provincia: "ANGARAES",
    distrito: "LIRCAY",
  },
  {
    id: "80302",
    codigo: "80302",
    departamento: "HUANCAVELICA",
    provincia: "ANGARAES",
    distrito: "ANCHONGA",
  },
  {
    id: "80303",
    codigo: "80303",
    departamento: "HUANCAVELICA",
    provincia: "ANGARAES",
    distrito: "CALLANMARCA",
  },
  {
    id: "80304",
    codigo: "80304",
    departamento: "HUANCAVELICA",
    provincia: "ANGARAES",
    distrito: "CONGALLA",
  },
  {
    id: "80305",
    codigo: "80305",
    departamento: "HUANCAVELICA",
    provincia: "ANGARAES",
    distrito: "CHINCHO",
  },
  {
    id: "80306",
    codigo: "80306",
    departamento: "HUANCAVELICA",
    provincia: "ANGARAES",
    distrito: "HUALLAY-GRANDE",
  },
  {
    id: "80307",
    codigo: "80307",
    departamento: "HUANCAVELICA",
    provincia: "ANGARAES",
    distrito: "HUANCA-HUANCA",
  },
  {
    id: "80308",
    codigo: "80308",
    departamento: "HUANCAVELICA",
    provincia: "ANGARAES",
    distrito: "JULCAMARCA",
  },
  {
    id: "80309",
    codigo: "80309",
    departamento: "HUANCAVELICA",
    provincia: "ANGARAES",
    distrito: "SAN ANTONIO DE ANTAPARCO",
  },
  {
    id: "80310",
    codigo: "80310",
    departamento: "HUANCAVELICA",
    provincia: "ANGARAES",
    distrito: "SANTO TOMAS DE PATA",
  },
  {
    id: "80311",
    codigo: "80311",
    departamento: "HUANCAVELICA",
    provincia: "ANGARAES",
    distrito: "SECOLLA",
  },
  {
    id: "80312",
    codigo: "80312",
    departamento: "HUANCAVELICA",
    provincia: "ANGARAES",
    distrito: "CCOCHACCASA",
  },
  {
    id: "80401",
    codigo: "80401",
    departamento: "HUANCAVELICA",
    provincia: "CASTROVIRREYNA",
    distrito: "CASTROVIRREYNA",
  },
  {
    id: "80402",
    codigo: "80402",
    departamento: "HUANCAVELICA",
    provincia: "CASTROVIRREYNA",
    distrito: "ARMA",
  },
  {
    id: "80403",
    codigo: "80403",
    departamento: "HUANCAVELICA",
    provincia: "CASTROVIRREYNA",
    distrito: "AURAHUA",
  },
  {
    id: "80405",
    codigo: "80405",
    departamento: "HUANCAVELICA",
    provincia: "CASTROVIRREYNA",
    distrito: "CAPILLAS",
  },
  {
    id: "80406",
    codigo: "80406",
    departamento: "HUANCAVELICA",
    provincia: "CASTROVIRREYNA",
    distrito: "COCAS",
  },
  {
    id: "80408",
    codigo: "80408",
    departamento: "HUANCAVELICA",
    provincia: "CASTROVIRREYNA",
    distrito: "CHUPAMARCA",
  },
  {
    id: "80409",
    codigo: "80409",
    departamento: "HUANCAVELICA",
    provincia: "CASTROVIRREYNA",
    distrito: "HUACHOS",
  },
  {
    id: "80410",
    codigo: "80410",
    departamento: "HUANCAVELICA",
    provincia: "CASTROVIRREYNA",
    distrito: "HUAMATAMBO",
  },
  {
    id: "80414",
    codigo: "80414",
    departamento: "HUANCAVELICA",
    provincia: "CASTROVIRREYNA",
    distrito: "MOLLEPAMPA",
  },
  {
    id: "80422",
    codigo: "80422",
    departamento: "HUANCAVELICA",
    provincia: "CASTROVIRREYNA",
    distrito: "SAN JUAN",
  },
  {
    id: "80427",
    codigo: "80427",
    departamento: "HUANCAVELICA",
    provincia: "CASTROVIRREYNA",
    distrito: "TANTARA",
  },
  {
    id: "80428",
    codigo: "80428",
    departamento: "HUANCAVELICA",
    provincia: "CASTROVIRREYNA",
    distrito: "TICRAPO",
  },
  {
    id: "80429",
    codigo: "80429",
    departamento: "HUANCAVELICA",
    provincia: "CASTROVIRREYNA",
    distrito: "SANTA ANA",
  },
  {
    id: "80501",
    codigo: "80501",
    departamento: "HUANCAVELICA",
    provincia: "TAYACAJA",
    distrito: "PAMPAS",
  },
  {
    id: "80502",
    codigo: "80502",
    departamento: "HUANCAVELICA",
    provincia: "TAYACAJA",
    distrito: "ACOSTAMBO",
  },
  {
    id: "80503",
    codigo: "80503",
    departamento: "HUANCAVELICA",
    provincia: "TAYACAJA",
    distrito: "ACRAQUIA",
  },
  {
    id: "80504",
    codigo: "80504",
    departamento: "HUANCAVELICA",
    provincia: "TAYACAJA",
    distrito: "AHUAYCHA",
  },
  {
    id: "80506",
    codigo: "80506",
    departamento: "HUANCAVELICA",
    provincia: "TAYACAJA",
    distrito: "COLCABAMBA",
  },
  {
    id: "80509",
    codigo: "80509",
    departamento: "HUANCAVELICA",
    provincia: "TAYACAJA",
    distrito: "DANIEL HERNANDEZ",
  },
  {
    id: "80511",
    codigo: "80511",
    departamento: "HUANCAVELICA",
    provincia: "HUANCAVELICA",
    distrito: "HUACHOCOLPA",
  },
  {
    id: "80512",
    codigo: "80512",
    departamento: "HUANCAVELICA",
    provincia: "TAYACAJA",
    distrito: "HUARIBAMBA",
  },
  {
    id: "80515",
    codigo: "80515",
    departamento: "HUANCAVELICA",
    provincia: "TAYACAJA",
    distrito: "ÑAHUIMPUQUIO",
  },
  {
    id: "80517",
    codigo: "80517",
    departamento: "HUANCAVELICA",
    provincia: "TAYACAJA",
    distrito: "PAZOS",
  },
  {
    id: "80518",
    codigo: "80518",
    departamento: "HUANCAVELICA",
    provincia: "TAYACAJA",
    distrito: "QUISHUAR",
  },

  {
    id: "80519",
    codigo: "80519",
    departamento: "HUANCAVELICA",
    provincia: "TAYACAJA",
    distrito: "SALCABAMBA",
  },
  {
    id: "80520",
    codigo: "80520",
    departamento: "HUANCAVELICA",
    provincia: "TAYACAJA",
    distrito: "SAN MARCOS DE ROCOHAC",
  },
  {
    id: "80523",
    codigo: "80523",
    departamento: "HUANCAVELICA",
    provincia: "TAYACAJA",
    distrito: "SURCUBAMBA",
  },
  {
    id: "80525",
    codigo: "80525",
    departamento: "HUANCAVELICA",
    provincia: "TAYACAJA",
    distrito: "TINTAY PUNCU",
  },
  {
    id: "80526",
    codigo: "80526",
    departamento: "HUANCAVELICA",
    provincia: "TAYACAJA",
    distrito: "SALCAHUASI",
  },
  {
    id: "80528",
    codigo: "80528",
    departamento: "HUANCAVELICA",
    provincia: "TAYACAJA",
    distrito: "QUICHUAS",
  },
  {
    id: "80529",
    codigo: "80529",
    departamento: "HUANCAVELICA",
    provincia: "TAYACAJA",
    distrito: "ANDAYMARCA",
  },
  {
    id: "80530",
    codigo: "80530",
    departamento: "HUANCAVELICA",
    provincia: "TAYACAJA",
    distrito: "ROBLE",
  },
  {
    id: "80531",
    codigo: "80531",
    departamento: "HUANCAVELICA",
    provincia: "TAYACAJA",
    distrito: "PICHOS",
  },
  {
    id: "80532",
    codigo: "80532",
    departamento: "HUANCAVELICA",
    provincia: "TAYACAJA",
    distrito: "SANTIAGO DE TUCUMA",
  },
  {
    id: "80601",
    codigo: "80601",
    departamento: "HUANCAVELICA",
    provincia: "HUAYTARA",
    distrito: "AYAVI",
  },
  {
    id: "80602",
    codigo: "80602",
    departamento: "HUANCAVELICA",
    provincia: "HUAYTARA",
    distrito: "CORDOVA",
  },
  {
    id: "80603",
    codigo: "80603",
    departamento: "HUANCAVELICA",
    provincia: "HUAYTARA",
    distrito: "HUAYACUNDO ARMA",
  },
  {
    id: "80604",
    codigo: "80604",
    departamento: "HUANCAVELICA",
    provincia: "HUAYTARA",
    distrito: "HUAYTARA",
  },
  {
    id: "80605",
    codigo: "80605",
    departamento: "HUANCAVELICA",
    provincia: "HUAYTARA",
    distrito: "LARAMARCA",
  },
  {
    id: "80606",
    codigo: "80606",
    departamento: "HUANCAVELICA",
    provincia: "HUAYTARA",
    distrito: "OCOYO",
  },
  {
    id: "80607",
    codigo: "80607",
    departamento: "HUANCAVELICA",
    provincia: "HUAYTARA",
    distrito: "PILPICHACA",
  },
  {
    id: "80608",
    codigo: "80608",
    departamento: "HUANCAVELICA",
    provincia: "HUAYTARA",
    distrito: "QUERCO",
  },
  {
    id: "80609",
    codigo: "80609",
    departamento: "HUANCAVELICA",
    provincia: "HUAYTARA",
    distrito: "QUITO ARMA",
  },
  {
    id: "80610",
    codigo: "80610",
    departamento: "HUANCAVELICA",
    provincia: "HUAYTARA",
    distrito: "SAN ANTONIO DE CUSICANCHA",
  },
  {
    id: "80611",
    codigo: "80611",
    departamento: "HUANCAVELICA",
    provincia: "HUAYTARA",
    distrito: "SAN FRANCISCO DE SANGAYAICO",
  },
  {
    id: "80612",
    codigo: "80612",
    departamento: "HUANCAVELICA",
    provincia: "HUAYTARA",
    distrito: "SAN ISIDRO",
  },
  {
    id: "80613",
    codigo: "80613",
    departamento: "HUANCAVELICA",
    provincia: "HUAYTARA",
    distrito: "SANTIAGO DE CHOCORVOS",
  },
  {
    id: "80614",
    codigo: "80614",
    departamento: "HUANCAVELICA",
    provincia: "HUAYTARA",
    distrito: "SANTIAGO DE QUIRAHUARA",
  },
  {
    id: "80615",
    codigo: "80615",
    departamento: "HUANCAVELICA",
    provincia: "HUAYTARA",
    distrito: "SANTO DOMINGO DE CAPILLAS",
  },
  {
    id: "80616",
    codigo: "80616",
    departamento: "HUANCAVELICA",
    provincia: "HUAYTARA",
    distrito: "TAMBO",
  },
  {
    id: "80701",
    codigo: "80701",
    departamento: "HUANCAVELICA",
    provincia: "CHURCAMPA",
    distrito: "CHURCAMPA",
  },
  {
    id: "80702",
    codigo: "80702",
    departamento: "HUANCAVELICA",
    provincia: "CHURCAMPA",
    distrito: "ANCO",
  },
  {
    id: "80703",
    codigo: "80703",
    departamento: "HUANCAVELICA",
    provincia: "CHURCAMPA",
    distrito: "CHINCHIHUASI",
  },
  {
    id: "80704",
    codigo: "80704",
    departamento: "HUANCAVELICA",
    provincia: "CHURCAMPA",
    distrito: "EL CARMEN",
  },
  {
    id: "80705",
    codigo: "80705",
    departamento: "HUANCAVELICA",
    provincia: "CHURCAMPA",
    distrito: "LA MERCED",
  },
  {
    id: "80706",
    codigo: "80706",
    departamento: "HUANCAVELICA",
    provincia: "CHURCAMPA",
    distrito: "LOCROJA",
  },
  {
    id: "80707",
    codigo: "80707",
    departamento: "HUANCAVELICA",
    provincia: "CHURCAMPA",
    distrito: "PAUCARBAMBA",
  },
  {
    id: "80708",
    codigo: "80708",
    departamento: "HUANCAVELICA",
    provincia: "CHURCAMPA",
    distrito: "SAN MIGUEL DE MAYOCO",
  },
  {
    id: "80709",
    codigo: "80709",
    departamento: "HUANCAVELICA",
    provincia: "CHURCAMPA",
    distrito: "SAN PEDRO DE CORIS",
  },
  {
    id: "80710",
    codigo: "80710",
    departamento: "HUANCAVELICA",
    provincia: "CHURCAMPA",
    distrito: "PACHAMARCA",
  },
  {
    id: "80711",
    codigo: "80711",
    departamento: "HUANCAVELICA",
    provincia: "CHURCAMPA",
    distrito: "COSME",
  },
  {
    id: "90101",
    codigo: "90101",
    departamento: "HUANUCO",
    provincia: "HUANUCO",
    distrito: "HUANUCO",
  },
  {
    id: "90102",
    codigo: "90102",
    departamento: "HUANUCO",
    provincia: "HUANUCO",
    distrito: "CHINCHAO",
  },
  {
    id: "90103",
    codigo: "90103",
    departamento: "HUANUCO",
    provincia: "HUANUCO",
    distrito: "CHURUBAMBA",
  },
  {
    id: "90104",
    codigo: "90104",
    departamento: "HUANUCO",
    provincia: "HUANUCO",
    distrito: "MARGOS",
  },
  {
    id: "90105",
    codigo: "90105",
    departamento: "HUANUCO",
    provincia: "HUANUCO",
    distrito: "QUISQUI",
  },
  {
    id: "90106",
    codigo: "90106",
    departamento: "HUANUCO",
    provincia: "HUANUCO",
    distrito: "SAN FRANCISCO DE CAYRAN",
  },
  {
    id: "90107",
    codigo: "90107",
    departamento: "HUANUCO",
    provincia: "HUANUCO",
    distrito: "SAN PEDRO DE CHAULAN",
  },
  {
    id: "90108",
    codigo: "90108",
    departamento: "HUANUCO",
    provincia: "HUANUCO",
    distrito: "SANTA MARIA DEL VALLE",
  },
  {
    id: "90109",
    codigo: "90109",
    departamento: "HUANUCO",
    provincia: "HUANUCO",
    distrito: "YARUMAYO",
  },
  {
    id: "90110",
    codigo: "90110",
    departamento: "HUANUCO",
    provincia: "HUANUCO",
    distrito: "AMARILIS",
  },
  {
    id: "90111",
    codigo: "90111",
    departamento: "HUANUCO",
    provincia: "HUANUCO",
    distrito: "PILLCO MARCA",
  },
  {
    id: "90112",
    codigo: "90112",
    departamento: "HUANUCO",
    provincia: "HUANUCO",
    distrito: "YACUS",
  },
  {
    id: "90113",
    codigo: "90113",
    departamento: "HUANUCO",
    provincia: "HUANUCO",
    distrito: "SAN PABLO DE PILLAO",
  },
  {
    id: "90201",
    codigo: "90201",
    departamento: "HUANUCO",
    provincia: "AMBO",
    distrito: "AMBO",
  },
  {
    id: "90202",
    codigo: "90202",
    departamento: "HUANUCO",
    provincia: "AMBO",
    distrito: "CAYNA",
  },
  {
    id: "90203",
    codigo: "90203",
    departamento: "HUANUCO",
    provincia: "AMBO",
    distrito: "COLPAS",
  },
  {
    id: "90204",
    codigo: "90204",
    departamento: "HUANUCO",
    provincia: "AMBO",
    distrito: "CONCHAMARCA",
  },
  {
    id: "90205",
    codigo: "90205",
    departamento: "HUANUCO",
    provincia: "AMBO",
    distrito: "HUACAR",
  },
  {
    id: "90206",
    codigo: "90206",
    departamento: "HUANUCO",
    provincia: "AMBO",
    distrito: "SAN FRANCISCO",
  },
  {
    id: "90207",
    codigo: "90207",
    departamento: "HUANUCO",
    provincia: "AMBO",
    distrito: "SAN RAFAEL",
  },
  {
    id: "90208",
    codigo: "90208",
    departamento: "HUANUCO",
    provincia: "AMBO",
    distrito: "TOMAY-KICHWA",
  },
  {
    id: "90301",
    codigo: "90301",
    departamento: "HUANUCO",
    provincia: "DOS DE MAYO",
    distrito: "LA UNION",
  },
  {
    id: "90307",
    codigo: "90307",
    departamento: "HUANUCO",
    provincia: "DOS DE MAYO",
    distrito: "CHUQUIS",
  },
  {
    id: "90312",
    codigo: "90312",
    departamento: "HUANUCO",
    provincia: "DOS DE MAYO",
    distrito: "MARIAS",
  },
  {
    id: "90314",
    codigo: "90314",
    departamento: "HUANUCO",
    provincia: "DOS DE MAYO",
    distrito: "PACHAS",
  },
  {
    id: "90316",
    codigo: "90316",
    departamento: "HUANUCO",
    provincia: "DOS DE MAYO",
    distrito: "QUIVILLA",
  },
  {
    id: "90317",
    codigo: "90317",
    departamento: "HUANUCO",
    provincia: "DOS DE MAYO",
    distrito: "RIPAN",
  },
  {
    id: "90321",
    codigo: "90321",
    departamento: "HUANUCO",
    provincia: "DOS DE MAYO",
    distrito: "SHUNQUI",
  },
  {
    id: "90322",
    codigo: "90322",
    departamento: "HUANUCO",
    provincia: "DOS DE MAYO",
    distrito: "SILLAPATA",
  },
  {
    id: "90323",
    codigo: "90323",
    departamento: "HUANUCO",
    provincia: "DOS DE MAYO",
    distrito: "YANAS",
  },
  {
    id: "90401",
    codigo: "90401",
    departamento: "HUANUCO",
    provincia: "HUAMALIES",
    distrito: "LLATA",
  },
  {
    id: "90402",
    codigo: "90402",
    departamento: "HUANUCO",
    provincia: "HUAMALIES",
    distrito: "ARANCAY",
  },
  {
    id: "90403",
    codigo: "90403",
    departamento: "HUANUCO",
    provincia: "HUAMALIES",
    distrito: "CHAVIN DE PARIARCA",
  },
  {
    id: "90404",
    codigo: "90404",
    departamento: "HUANUCO",
    provincia: "HUAMALIES",
    distrito: "JACAS GRANDE",
  },
  {
    id: "90405",
    codigo: "90405",
    departamento: "HUANUCO",
    provincia: "HUAMALIES",
    distrito: "JIRCAN",
  },
  {
    id: "90406",
    codigo: "90406",
    departamento: "HUANUCO",
    provincia: "HUAMALIES",
    distrito: "MIRAFLORES",
  },
  {
    id: "90407",
    codigo: "90407",
    departamento: "HUANUCO",
    provincia: "HUAMALIES",
    distrito: "MONZON",
  },
  {
    id: "90408",
    codigo: "90408",
    departamento: "HUANUCO",
    provincia: "HUAMALIES",
    distrito: "PUNCHAO",
  },
  {
    id: "90409",
    codigo: "90409",
    departamento: "HUANUCO",
    provincia: "HUAMALIES",
    distrito: "PUÑOS",
  },
  {
    id: "90410",
    codigo: "90410",
    departamento: "HUANUCO",
    provincia: "HUAMALIES",
    distrito: "SINGA",
  },
  {
    id: "90411",
    codigo: "90411",
    departamento: "HUANUCO",
    provincia: "HUAMALIES",
    distrito: "TANTAMAYO",
  },
  {
    id: "90501",
    codigo: "90501",
    departamento: "HUANUCO",
    provincia: "MARAÑON",
    distrito: "HUACRACHUCO",
  },
  {
    id: "90502",
    codigo: "90502",
    departamento: "HUANUCO",
    provincia: "MARAÑON",
    distrito: "CHOLON",
  },
  {
    id: "90505",
    codigo: "90505",
    departamento: "HUANUCO",
    provincia: "MARAÑON",
    distrito: "SAN BUENAVENTURA",
  },
  {
    id: "90506",
    codigo: "90506",
    departamento: "HUANUCO",
    provincia: "MARAÑON",
    distrito: "LA MORADA",
  },
  {
    id: "90507",
    codigo: "90507",
    departamento: "HUANUCO",
    provincia: "MARAÑON",
    distrito: "SANTA ROSA DE ALTO YANAJANCA",
  },
  {
    id: "90601",
    codigo: "90601",
    departamento: "HUANUCO",
    provincia: "LEONCIO PRADO",
    distrito: "RUPA-RUPA",
  },
  {
    id: "90602",
    codigo: "90602",
    departamento: "HUANUCO",
    provincia: "LEONCIO PRADO",
    distrito: "DANIEL ALOMIA ROBLES",
  },
  {
    id: "90603",
    codigo: "90603",
    departamento: "HUANUCO",
    provincia: "LEONCIO PRADO",
    distrito: "HERMILIO VALDIZAN",
  },
  {
    id: "90604",
    codigo: "90604",
    departamento: "HUANUCO",
    provincia: "LEONCIO PRADO",
    distrito: "LUVANDO",
  },
  {
    id: "90605",
    codigo: "90605",
    departamento: "HUANUCO",
    provincia: "LEONCIO PRADO",
    distrito: "MARIANO DAMASO BERAUN",
  },
  {
    id: "90606",
    codigo: "90606",
    departamento: "HUANUCO",
    provincia: "LEONCIO PRADO",
    distrito: "JOSE CRESPO Y CASTILLO",
  },
  {
    id: "90607",
    codigo: "90607",
    departamento: "HUANUCO",
    provincia: "LEONCIO PRADO",
    distrito: "PUCAYACU",
  },
  {
    id: "90608",
    codigo: "90608",
    departamento: "HUANUCO",
    provincia: "LEONCIO PRADO",
    distrito: "CASTILLO GRANDE",
  },
  {
    id: "90609",
    codigo: "90609",
    departamento: "HUANUCO",
    provincia: "LEONCIO PRADO",
    distrito: "PUEBLO NUEVO",
  },
  {
    id: "90610",
    codigo: "90610",
    departamento: "HUANUCO",
    provincia: "LEONCIO PRADO",
    distrito: "SANTO DOMINGO DE ANDA",
  },
  {
    id: "90701",
    codigo: "90701",
    departamento: "HUANUCO",
    provincia: "PACHITEA",
    distrito: "PANAO",
  },
  {
    id: "90702",
    codigo: "90702",
    departamento: "HUANUCO",
    provincia: "PACHITEA",
    distrito: "CHAGLIA",
  },
  {
    id: "90704",
    codigo: "90704",
    departamento: "HUANUCO",
    provincia: "PACHITEA",
    distrito: "MOLINO",
  },
  {
    id: "90706",
    codigo: "90706",
    departamento: "HUANUCO",
    provincia: "PACHITEA",
    distrito: "UMARI",
  },
  {
    id: "90801",
    codigo: "90801",
    departamento: "HUANUCO",
    provincia: "PUERTO INCA",
    distrito: "HONORIA",
  },
  {
    id: "90802",
    codigo: "90802",
    departamento: "HUANUCO",
    provincia: "PUERTO INCA",
    distrito: "PUERTO INCA",
  },
  {
    id: "90803",
    codigo: "90803",
    departamento: "HUANUCO",
    provincia: "PUERTO INCA",
    distrito: "CODO DEL POZUZO",
  },
  {
    id: "90804",
    codigo: "90804",
    departamento: "HUANUCO",
    provincia: "PUERTO INCA",
    distrito: "TOURNAVISTA",
  },
  {
    id: "90805",
    codigo: "90805",
    departamento: "HUANUCO",
    provincia: "PUERTO INCA",
    distrito: "YUYAPICHIS",
  },
  {
    id: "90901",
    codigo: "90901",
    departamento: "HUANUCO",
    provincia: "HUACAYBAMBA",
    distrito: "HUACAYBAMBA",
  },
  {
    id: "90902",
    codigo: "90902",
    departamento: "HUANUCO",
    provincia: "HUACAYBAMBA",
    distrito: "PINRA",
  },
  {
    id: "90903",
    codigo: "90903",
    departamento: "HUANUCO",
    provincia: "HUACAYBAMBA",
    distrito: "CANCHABAMBA",
  },
  {
    id: "90904",
    codigo: "90904",
    departamento: "HUANUCO",
    provincia: "HUACAYBAMBA",
    distrito: "COCHABAMBA",
  },
  {
    id: "91001",
    codigo: "91001",
    departamento: "HUANUCO",
    provincia: "LAURICOCHA",
    distrito: "JESUS",
  },
  {
    id: "91002",
    codigo: "91002",
    departamento: "HUANUCO",
    provincia: "LAURICOCHA",
    distrito: "BAÑOS",
  },
  {
    id: "91003",
    codigo: "91003",
    departamento: "HUANUCO",
    provincia: "LAURICOCHA",
    distrito: "SAN FRANCISCO DE ASIS",
  },
  {
    id: "91004",
    codigo: "91004",
    departamento: "HUANUCO",
    provincia: "LAURICOCHA",
    distrito: "QUEROPALCA",
  },
  {
    id: "91005",
    codigo: "91005",
    departamento: "HUANUCO",
    provincia: "LAURICOCHA",
    distrito: "SAN MIGUEL DE CAURI",
  },
  {
    id: "91006",
    codigo: "91006",
    departamento: "HUANUCO",
    provincia: "LAURICOCHA",
    distrito: "RONDOS",
  },
  {
    id: "91007",
    codigo: "91007",
    departamento: "HUANUCO",
    provincia: "LAURICOCHA",
    distrito: "JIVIA",
  },
  {
    id: "91101",
    codigo: "91101",
    departamento: "HUANUCO",
    provincia: "YAROWILCA",
    distrito: "CHAVINILLO",
  },
  {
    id: "91102",
    codigo: "91102",
    departamento: "HUANUCO",
    provincia: "YAROWILCA",
    distrito: "APARICIO POMARES",
  },
  {
    id: "91103",
    codigo: "91103",
    departamento: "HUANUCO",
    provincia: "YAROWILCA",
    distrito: "CAHUAC",
  },
  {
    id: "91104",
    codigo: "91104",
    departamento: "HUANUCO",
    provincia: "YAROWILCA",
    distrito: "CHACABAMBA",
  },
  {
    id: "91105",
    codigo: "91105",
    departamento: "HUANUCO",
    provincia: "YAROWILCA",
    distrito: "JACAS CHICO",
  },
  {
    id: "91106",
    codigo: "91106",
    departamento: "HUANUCO",
    provincia: "YAROWILCA",
    distrito: "OBAS",
  },
  {
    id: "91107",
    codigo: "91107",
    departamento: "HUANUCO",
    provincia: "YAROWILCA",
    distrito: "PAMPAMARCA",
  },
  {
    id: "91108",
    codigo: "91108",
    departamento: "HUANUCO",
    provincia: "YAROWILCA",
    distrito: "CHORAS",
  },
  {
    id: "100101",
    codigo: "100101",
    departamento: "ICA",
    provincia: "ICA",
    distrito: "ICA",
  },
  {
    id: "100102",
    codigo: "100102",
    departamento: "ICA",
    provincia: "ICA",
    distrito: "LA TINGUIÑA",
  },
  {
    id: "100103",
    codigo: "100103",
    departamento: "ICA",
    provincia: "ICA",
    distrito: "LOS AQUIJES",
  },

  {
    id: "100104",
    codigo: "100104",
    departamento: "ICA",
    provincia: "ICA",
    distrito: "PARCONA",
  },
  {
    id: "100105",
    codigo: "100105",
    departamento: "ICA",
    provincia: "ICA",
    distrito: "PUEBLO NUEVO",
  },
  {
    id: "100106",
    codigo: "100106",
    departamento: "ICA",
    provincia: "ICA",
    distrito: "SALAS",
  },
  {
    id: "100107",
    codigo: "100107",
    departamento: "ICA",
    provincia: "ICA",
    distrito: "SAN JOSE DE LOS MOLINOS",
  },
  {
    id: "100108",
    codigo: "100108",
    departamento: "ICA",
    provincia: "ICA",
    distrito: "SAN JUAN BAUTISTA",
  },
  {
    id: "100109",
    codigo: "100109",
    departamento: "ICA",
    provincia: "ICA",
    distrito: "SANTIAGO",
  },
  {
    id: "100110",
    codigo: "100110",
    departamento: "ICA",
    provincia: "ICA",
    distrito: "SUBTANJALLA",
  },
  {
    id: "100111",
    codigo: "100111",
    departamento: "ICA",
    provincia: "ICA",
    distrito: "YAUCA DEL ROSARIO",
  },
  {
    id: "100112",
    codigo: "100112",
    departamento: "ICA",
    provincia: "ICA",
    distrito: "TATE",
  },
  {
    id: "100113",
    codigo: "100113",
    departamento: "ICA",
    provincia: "ICA",
    distrito: "PACHACUTEC",
  },
  {
    id: "100114",
    codigo: "100114",
    departamento: "ICA",
    provincia: "ICA",
    distrito: "OCUCAJE",
  },
  {
    id: "100201",
    codigo: "100201",
    departamento: "ICA",
    provincia: "CHINCHA",
    distrito: "CHINCHA ALTA",
  },
  {
    id: "100202",
    codigo: "100202",
    departamento: "ICA",
    provincia: "CHINCHA",
    distrito: "CHAVIN",
  },
  {
    id: "100203",
    codigo: "100203",
    departamento: "ICA",
    provincia: "CHINCHA",
    distrito: "CHINCHA BAJA",
  },
  {
    id: "100204",
    codigo: "100204",
    departamento: "ICA",
    provincia: "CHINCHA",
    distrito: "EL CARMEN",
  },
  {
    id: "100205",
    codigo: "100205",
    departamento: "ICA",
    provincia: "CHINCHA",
    distrito: "GROCIO PRADO",
  },
  {
    id: "100206",
    codigo: "100206",
    departamento: "ICA",
    provincia: "CHINCHA",
    distrito: "SAN PEDRO DE HUACARPANA",
  },
  {
    id: "100207",
    codigo: "100207",
    departamento: "ICA",
    provincia: "CHINCHA",
    distrito: "SUNAMPE",
  },
  {
    id: "100208",
    codigo: "100208",
    departamento: "ICA",
    provincia: "CHINCHA",
    distrito: "TAMBO DE MORA",
  },
  {
    id: "100209",
    codigo: "100209",
    departamento: "ICA",
    provincia: "CHINCHA",
    distrito: "ALTO LARAN",
  },
  {
    id: "100210",
    codigo: "100210",
    departamento: "ICA",
    provincia: "CHINCHA",
    distrito: "PUEBLO NUEVO",
  },
  {
    id: "100211",
    codigo: "100211",
    departamento: "ICA",
    provincia: "CHINCHA",
    distrito: "SAN JUAN DE YANAC",
  },
  {
    id: "100301",
    codigo: "100301",
    departamento: "ICA",
    provincia: "NAZCA",
    distrito: "NAZCA",
  },
  {
    id: "100302",
    codigo: "100302",
    departamento: "ICA",
    provincia: "NAZCA",
    distrito: "CHANGUILLO",
  },
  {
    id: "100303",
    codigo: "100303",
    departamento: "ICA",
    provincia: "NAZCA",
    distrito: "EL INGENIO",
  },
  {
    id: "100304",
    codigo: "100304",
    departamento: "ICA",
    provincia: "NAZCA",
    distrito: "MARCONA",
  },
  {
    id: "100305",
    codigo: "100305",
    departamento: "ICA",
    provincia: "NAZCA",
    distrito: "VISTA ALEGRE",
  },
  {
    id: "100401",
    codigo: "100401",
    departamento: "ICA",
    provincia: "PISCO",
    distrito: "PISCO",
  },
  {
    id: "100402",
    codigo: "100402",
    departamento: "ICA",
    provincia: "PISCO",
    distrito: "HUANCANO",
  },
  {
    id: "100403",
    codigo: "100403",
    departamento: "ICA",
    provincia: "PISCO",
    distrito: "HUMAY",
  },
  {
    id: "100404",
    codigo: "100404",
    departamento: "ICA",
    provincia: "PISCO",
    distrito: "INDEPENDENCIA",
  },
  {
    id: "100405",
    codigo: "100405",
    departamento: "ICA",
    provincia: "PISCO",
    distrito: "PARACAS",
  },
  {
    id: "100406",
    codigo: "100406",
    departamento: "ICA",
    provincia: "PISCO",
    distrito: "SAN ANDRES",
  },
  {
    id: "100407",
    codigo: "100407",
    departamento: "ICA",
    provincia: "PISCO",
    distrito: "SAN CLEMENTE",
  },
  {
    id: "100408",
    codigo: "100408",
    departamento: "ICA",
    provincia: "PISCO",
    distrito: "TUPAC AMARU INCA",
  },
  {
    id: "100501",
    codigo: "100501",
    departamento: "ICA",
    provincia: "PALPA",
    distrito: "PALPA",
  },
  {
    id: "100502",
    codigo: "100502",
    departamento: "ICA",
    provincia: "PALPA",
    distrito: "LLIPATA",
  },
  {
    id: "100503",
    codigo: "100503",
    departamento: "ICA",
    provincia: "PALPA",
    distrito: "RIO GRANDE",
  },
  {
    id: "100504",
    codigo: "100504",
    departamento: "ICA",
    provincia: "PALPA",
    distrito: "SANTA CRUZ",
  },
  {
    id: "100505",
    codigo: "100505",
    departamento: "ICA",
    provincia: "PALPA",
    distrito: "TIBILLO",
  },
  {
    id: "110101",
    codigo: "110101",
    departamento: "JUNIN",
    provincia: "HUANCAYO",
    distrito: "HUANCAYO",
  },
  {
    id: "110103",
    codigo: "110103",
    departamento: "JUNIN",
    provincia: "HUANCAYO",
    distrito: "CARHUACALLANGA",
  },
  {
    id: "110104",
    codigo: "110104",
    departamento: "JUNIN",
    provincia: "HUANCAYO",
    distrito: "COLCA",
  },
  {
    id: "110105",
    codigo: "110105",
    departamento: "JUNIN",
    provincia: "HUANCAYO",
    distrito: "CULLHUAS",
  },
  {
    id: "110106",
    codigo: "110106",
    departamento: "JUNIN",
    provincia: "HUANCAYO",
    distrito: "CHACAPAMPA",
  },
  {
    id: "110107",
    codigo: "110107",
    departamento: "JUNIN",
    provincia: "HUANCAYO",
    distrito: "CHICCHE",
  },
  {
    id: "110108",
    codigo: "110108",
    departamento: "JUNIN",
    provincia: "HUANCAYO",
    distrito: "CHILCA",
  },
  {
    id: "110109",
    codigo: "110109",
    departamento: "JUNIN",
    provincia: "HUANCAYO",
    distrito: "CHONGOS ALTO",
  },
  {
    id: "110112",
    codigo: "110112",
    departamento: "JUNIN",
    provincia: "HUANCAYO",
    distrito: "CHUPURO",
  },
  {
    id: "110113",
    codigo: "110113",
    departamento: "JUNIN",
    provincia: "HUANCAYO",
    distrito: "EL TAMBO",
  },
  {
    id: "110114",
    codigo: "110114",
    departamento: "JUNIN",
    provincia: "HUANCAYO",
    distrito: "HUACRAPUQUIO",
  },
  {
    id: "110116",
    codigo: "110116",
    departamento: "JUNIN",
    provincia: "HUANCAYO",
    distrito: "HUALHUAS",
  },
  {
    id: "110118",
    codigo: "110118",
    departamento: "JUNIN",
    provincia: "HUANCAYO",
    distrito: "HUANCAN",
  },
  {
    id: "110119",
    codigo: "110119",
    departamento: "JUNIN",
    provincia: "HUANCAYO",
    distrito: "HUASICANCHA",
  },
  {
    id: "110120",
    codigo: "110120",
    departamento: "JUNIN",
    provincia: "HUANCAYO",
    distrito: "HUAYUCACHI",
  },
  {
    id: "110121",
    codigo: "110121",
    departamento: "JUNIN",
    provincia: "HUANCAYO",
    distrito: "INGENIO",
  },
  {
    id: "110122",
    codigo: "110122",
    departamento: "JUNIN",
    provincia: "HUANCAYO",
    distrito: "PARIAHUANCA",
  },
  {
    id: "110123",
    codigo: "110123",
    departamento: "JUNIN",
    provincia: "HUANCAYO",
    distrito: "PILCOMAYO",
  },
  {
    id: "110124",
    codigo: "110124",
    departamento: "JUNIN",
    provincia: "HUANCAYO",
    distrito: "PUCARA",
  },
  {
    id: "110125",
    codigo: "110125",
    departamento: "JUNIN",
    provincia: "HUANCAYO",
    distrito: "QUICHUAY",
  },
  {
    id: "110126",
    codigo: "110126",
    departamento: "JUNIN",
    provincia: "HUANCAYO",
    distrito: "QUILCAS",
  },
  {
    id: "110127",
    codigo: "110127",
    departamento: "JUNIN",
    provincia: "HUANCAYO",
    distrito: "SAN AGUSTIN",
  },
  {
    id: "110128",
    codigo: "110128",
    departamento: "JUNIN",
    provincia: "HUANCAYO",
    distrito: "SAN JERONIMO DE TUNAN",
  },
  {
    id: "110131",
    codigo: "110131",
    departamento: "JUNIN",
    provincia: "HUANCAYO",
    distrito: "SANTO DOMINGO DE ACOBAMBA",
  },
  {
    id: "110132",
    codigo: "110132",
    departamento: "JUNIN",
    provincia: "HUANCAYO",
    distrito: "SAÑO",
  },
  {
    id: "110133",
    codigo: "110133",
    departamento: "JUNIN",
    provincia: "HUANCAYO",
    distrito: "SAPALLANGA",
  },
  {
    id: "110134",
    codigo: "110134",
    departamento: "JUNIN",
    provincia: "HUANCAYO",
    distrito: "SICAYA",
  },
  {
    id: "110136",
    codigo: "110136",
    departamento: "JUNIN",
    provincia: "HUANCAYO",
    distrito: "VIQUES",
  },
  {
    id: "110201",
    codigo: "110201",
    departamento: "JUNIN",
    provincia: "CONCEPCION",
    distrito: "CONCEPCION",
  },
  {
    id: "110202",
    codigo: "110202",
    departamento: "JUNIN",
    provincia: "CONCEPCION",
    distrito: "ACO",
  },
  {
    id: "110203",
    codigo: "110203",
    departamento: "JUNIN",
    provincia: "CONCEPCION",
    distrito: "ANDAMARCA",
  },
  {
    id: "110204",
    codigo: "110204",
    departamento: "JUNIN",
    provincia: "CONCEPCION",
    distrito: "COMAS",
  },
  {
    id: "110205",
    codigo: "110205",
    departamento: "JUNIN",
    provincia: "CONCEPCION",
    distrito: "COCHAS",
  },
  {
    id: "110206",
    codigo: "110206",
    departamento: "JUNIN",
    provincia: "CONCEPCION",
    distrito: "CHAMBARA",
  },
  {
    id: "110207",
    codigo: "110207",
    departamento: "JUNIN",
    provincia: "CONCEPCION",
    distrito: "HEROINAS TOLEDO",
  },
  {
    id: "110208",
    codigo: "110208",
    departamento: "JUNIN",
    provincia: "CONCEPCION",
    distrito: "MANZANARES",
  },
  {
    id: "110209",
    codigo: "110209",
    departamento: "JUNIN",
    provincia: "CONCEPCION",
    distrito: "MARISCAL CASTILLA",
  },
  {
    id: "110210",
    codigo: "110210",
    departamento: "JUNIN",
    provincia: "CONCEPCION",
    distrito: "MATAHUASI",
  },
  {
    id: "110211",
    codigo: "110211",
    departamento: "JUNIN",
    provincia: "CONCEPCION",
    distrito: "MITO",
  },
  {
    id: "110212",
    codigo: "110212",
    departamento: "JUNIN",
    provincia: "CONCEPCION",
    distrito: "NUEVE DE JULIO",
  },
  {
    id: "110213",
    codigo: "110213",
    departamento: "JUNIN",
    provincia: "CONCEPCION",
    distrito: "ORCOTUNA",
  },
  {
    id: "110214",
    codigo: "110214",
    departamento: "JUNIN",
    provincia: "CONCEPCION",
    distrito: "SANTA ROSA DE OCOPA",
  },
  {
    id: "110215",
    codigo: "110215",
    departamento: "JUNIN",
    provincia: "CONCEPCION",
    distrito: "SAN JOSE DE QUERO",
  },
  {
    id: "110301",
    codigo: "110301",
    departamento: "JUNIN",
    provincia: "JAUJA",
    distrito: "JAUJA",
  },
  {
    id: "110302",
    codigo: "110302",
    departamento: "JUNIN",
    provincia: "JAUJA",
    distrito: "ACOLLA",
  },
  {
    id: "110303",
    codigo: "110303",
    departamento: "JUNIN",
    provincia: "JAUJA",
    distrito: "APATA",
  },
  {
    id: "110304",
    codigo: "110304",
    departamento: "JUNIN",
    provincia: "JAUJA",
    distrito: "ATAURA",
  },
  {
    id: "110305",
    codigo: "110305",
    departamento: "JUNIN",
    provincia: "JAUJA",
    distrito: "CANCHAYLLO",
  },
  {
    id: "110306",
    codigo: "110306",
    departamento: "JUNIN",
    provincia: "JAUJA",
    distrito: "EL MANTARO",
  },
  {
    id: "110307",
    codigo: "110307",
    departamento: "JUNIN",
    provincia: "JAUJA",
    distrito: "HUAMALI",
  },
  {
    id: "110308",
    codigo: "110308",
    departamento: "JUNIN",
    provincia: "JAUJA",
    distrito: "HUARIPAMPA",
  },
  {
    id: "110309",
    codigo: "110309",
    departamento: "JUNIN",
    provincia: "JAUJA",
    distrito: "HUERTAS",
  },
  {
    id: "110310",
    codigo: "110310",
    departamento: "JUNIN",
    provincia: "JAUJA",
    distrito: "JANAJAILLO",
  },
  {
    id: "110311",
    codigo: "110311",
    departamento: "JUNIN",
    provincia: "JAUJA",
    distrito: "JULCAN",
  },
  {
    id: "110312",
    codigo: "110312",
    departamento: "JUNIN",
    provincia: "JAUJA",
    distrito: "LEONOR ORDOÑEZ",
  },
  {
    id: "110313",
    codigo: "110313",
    departamento: "JUNIN",
    provincia: "JAUJA",
    distrito: "LLOCLLAPAMPA",
  },
  {
    id: "110314",
    codigo: "110314",
    departamento: "JUNIN",
    provincia: "JAUJA",
    distrito: "MARCO",
  },
  {
    id: "110315",
    codigo: "110315",
    departamento: "JUNIN",
    provincia: "JAUJA",
    distrito: "MASMA",
  },
  {
    id: "110316",
    codigo: "110316",
    departamento: "JUNIN",
    provincia: "JAUJA",
    distrito: "MOLINOS",
  },
  {
    id: "110317",
    codigo: "110317",
    departamento: "JUNIN",
    provincia: "JAUJA",
    distrito: "MONOBAMBA",
  },
  {
    id: "110318",
    codigo: "110318",
    departamento: "JUNIN",
    provincia: "JAUJA",
    distrito: "MUQUI",
  },
  {
    id: "110319",
    codigo: "110319",
    departamento: "JUNIN",
    provincia: "JAUJA",
    distrito: "MUQUIYAUYO",
  },
  {
    id: "110320",
    codigo: "110320",
    departamento: "JUNIN",
    provincia: "JAUJA",
    distrito: "PACA",
  },
  {
    id: "110321",
    codigo: "110321",
    departamento: "JUNIN",
    provincia: "JAUJA",
    distrito: "PACCHA",
  },
  {
    id: "110322",
    codigo: "110322",
    departamento: "JUNIN",
    provincia: "JAUJA",
    distrito: "PANCAN",
  },
  {
    id: "110323",
    codigo: "110323",
    departamento: "JUNIN",
    provincia: "JAUJA",
    distrito: "PARCO",
  },
  {
    id: "110324",
    codigo: "110324",
    departamento: "JUNIN",
    provincia: "JAUJA",
    distrito: "POMACANCHA",
  },
  {
    id: "110325",
    codigo: "110325",
    departamento: "JUNIN",
    provincia: "JAUJA",
    distrito: "RICRAN",
  },
  {
    id: "110326",
    codigo: "110326",
    departamento: "JUNIN",
    provincia: "JAUJA",
    distrito: "SAN LORENZO",
  },
  {
    id: "110327",
    codigo: "110327",
    departamento: "JUNIN",
    provincia: "JAUJA",
    distrito: "SAN PEDRO DE CHUNAN",
  },
  {
    id: "110328",
    codigo: "110328",
    departamento: "JUNIN",
    provincia: "JAUJA",
    distrito: "SINCOS",
  },
  {
    id: "110329",
    codigo: "110329",
    departamento: "JUNIN",
    provincia: "JAUJA",
    distrito: "TUNAN MARCA",
  },
  {
    id: "110330",
    codigo: "110330",
    departamento: "JUNIN",
    provincia: "JAUJA",
    distrito: "YAULI",
  },
  {
    id: "110331",
    codigo: "110331",
    departamento: "JUNIN",
    provincia: "JAUJA",
    distrito: "CURICACA",
  },
  {
    id: "110332",
    codigo: "110332",
    departamento: "JUNIN",
    provincia: "JAUJA",
    distrito: "MASMA CHICCHE",
  },
  {
    id: "110333",
    codigo: "110333",
    departamento: "JUNIN",
    provincia: "JAUJA",
    distrito: "SAUSA",
  },
  {
    id: "110334",
    codigo: "110334",
    departamento: "JUNIN",
    provincia: "JAUJA",
    distrito: "YAUYOS",
  },
  {
    id: "110401",
    codigo: "110401",
    departamento: "JUNIN",
    provincia: "JUNIN",
    distrito: "JUNIN",
  },
  {
    id: "110402",
    codigo: "110402",
    departamento: "JUNIN",
    provincia: "JUNIN",
    distrito: "CARHUAMAYO",
  },
  {
    id: "110403",
    codigo: "110403",
    departamento: "JUNIN",
    provincia: "JUNIN",
    distrito: "ONDORES",
  },
  {
    id: "110404",
    codigo: "110404",
    departamento: "JUNIN",
    provincia: "JUNIN",
    distrito: "ULCUMAYO",
  },
  {
    id: "110501",
    codigo: "110501",
    departamento: "JUNIN",
    provincia: "TARMA",
    distrito: "TARMA",
  },
  {
    id: "110502",
    codigo: "110502",
    departamento: "JUNIN",
    provincia: "TARMA",
    distrito: "ACOBAMBA",
  },
  {
    id: "110503",
    codigo: "110503",
    departamento: "JUNIN",
    provincia: "TARMA",
    distrito: "HUARICOLCA",
  },
  {
    id: "110504",
    codigo: "110504",
    departamento: "JUNIN",
    provincia: "TARMA",
    distrito: "HUASAHUASI",
  },
  {
    id: "110505",
    codigo: "110505",
    departamento: "JUNIN",
    provincia: "TARMA",
    distrito: "LA UNION",
  },
  {
    id: "110506",
    codigo: "110506",
    departamento: "JUNIN",
    provincia: "TARMA",
    distrito: "PALCA",
  },
  {
    id: "110507",
    codigo: "110507",
    departamento: "JUNIN",
    provincia: "TARMA",
    distrito: "PALCAMAYO",
  },
  {
    id: "110508",
    codigo: "110508",
    departamento: "JUNIN",
    provincia: "TARMA",
    distrito: "SAN PEDRO DE CAJAS",
  },
  {
    id: "110509",
    codigo: "110509",
    departamento: "JUNIN",
    provincia: "TARMA",
    distrito: "TAPO",
  },
  {
    id: "110601",
    codigo: "110601",
    departamento: "JUNIN",
    provincia: "YAULI",
    distrito: "LA OROYA",
  },
  {
    id: "110602",
    codigo: "110602",
    departamento: "JUNIN",
    provincia: "YAULI",
    distrito: "CHACAPALPA",
  },
  {
    id: "110603",
    codigo: "110603",
    departamento: "JUNIN",
    provincia: "YAULI",
    distrito: "HUAY HUAY",
  },
  {
    id: "110604",
    codigo: "110604",
    departamento: "JUNIN",
    provincia: "YAULI",
    distrito: "MARCAPOMACOCHA",
  },
  {
    id: "110605",
    codigo: "110605",
    departamento: "JUNIN",
    provincia: "YAULI",
    distrito: "MOROCOCHA",
  },
  {
    id: "110606",
    codigo: "110606",
    departamento: "JUNIN",
    provincia: "YAULI",
    distrito: "PACCHA",
  },
  {
    id: "110607",
    codigo: "110607",
    departamento: "JUNIN",
    provincia: "YAULI",
    distrito: "SANTA BARBARA DE CARHUACAYAN",
  },
  {
    id: "110608",
    codigo: "110608",
    departamento: "JUNIN",
    provincia: "YAULI",
    distrito: "SUITUCANCHA",
  },
  {
    id: "110609",
    codigo: "110609",
    departamento: "JUNIN",
    provincia: "YAULI",
    distrito: "YAULI",
  },
  {
    id: "110610",
    codigo: "110610",
    departamento: "JUNIN",
    provincia: "YAULI",
    distrito: "SANTA ROSA DE SACCO",
  },
  {
    id: "110701",
    codigo: "110701",
    departamento: "JUNIN",
    provincia: "SATIPO",
    distrito: "SATIPO",
  },
  {
    id: "110702",
    codigo: "110702",
    departamento: "JUNIN",
    provincia: "SATIPO",
    distrito: "COVIRIALI",
  },
  {
    id: "110703",
    codigo: "110703",
    departamento: "JUNIN",
    provincia: "SATIPO",
    distrito: "LLAYLLA",
  },
  {
    id: "110704",
    codigo: "110704",
    departamento: "JUNIN",
    provincia: "SATIPO",
    distrito: "MAZAMARI",
  },
  {
    id: "110705",
    codigo: "110705",
    departamento: "JUNIN",
    provincia: "SATIPO",
    distrito: "PAMPA HERMOSA",
  },
  {
    id: "110706",
    codigo: "110706",
    departamento: "JUNIN",
    provincia: "SATIPO",
    distrito: "PANGOA",
  },
  {
    id: "110707",
    codigo: "110707",
    departamento: "JUNIN",
    provincia: "SATIPO",
    distrito: "RIO NEGRO",
  },
  {
    id: "110708",
    codigo: "110708",
    departamento: "JUNIN",
    provincia: "SATIPO",
    distrito: "RIO TAMBO",
  },
  {
    id: "110709",
    codigo: "110709",
    departamento: "JUNIN",
    provincia: "SATIPO",
    distrito: "VIZCATAN DEL ENE",
  },
  {
    id: "110801",
    codigo: "110801",
    departamento: "JUNIN",
    provincia: "CHANCHAMAYO",
    distrito: "CHANCHAMAYO",
  },
  {
    id: "110802",
    codigo: "110802",
    departamento: "JUNIN",
    provincia: "CHANCHAMAYO",
    distrito: "SAN RAMON",
  },
  {
    id: "110803",
    codigo: "110803",
    departamento: "JUNIN",
    provincia: "CHANCHAMAYO",
    distrito: "VITOC",
  },
  {
    id: "110804",
    codigo: "110804",
    departamento: "JUNIN",
    provincia: "CHANCHAMAYO",
    distrito: "SAN LUIS DE SHUARO",
  },
  {
    id: "110805",
    codigo: "110805",
    departamento: "JUNIN",
    provincia: "CHANCHAMAYO",
    distrito: "PICHANAQUI",
  },
  {
    id: "110806",
    codigo: "110806",
    departamento: "JUNIN",
    provincia: "CHANCHAMAYO",
    distrito: "PERENE",
  },

  {
    id: "110901",
    codigo: "110901",
    departamento: "JUNIN",
    provincia: "CHUPACA",
    distrito: "CHUPACA",
  },
  {
    id: "110902",
    codigo: "110902",
    departamento: "JUNIN",
    provincia: "CHUPACA",
    distrito: "AHUAC",
  },
  {
    id: "110903",
    codigo: "110903",
    departamento: "JUNIN",
    provincia: "CHUPACA",
    distrito: "CHONGOS BAJO",
  },
  {
    id: "110904",
    codigo: "110904",
    departamento: "JUNIN",
    provincia: "CHUPACA",
    distrito: "HUACHAC",
  },
  {
    id: "110905",
    codigo: "110905",
    departamento: "JUNIN",
    provincia: "CHUPACA",
    distrito: "HUAMANCACA CHICO",
  },
  {
    id: "110906",
    codigo: "110906",
    departamento: "JUNIN",
    provincia: "CHUPACA",
    distrito: "SAN JUAN DE ISCOS",
  },
  {
    id: "110907",
    codigo: "110907",
    departamento: "JUNIN",
    provincia: "CHUPACA",
    distrito: "SAN JUAN DE JARPA",
  },
  {
    id: "110908",
    codigo: "110908",
    departamento: "JUNIN",
    provincia: "CHUPACA",
    distrito: "TRES DE DICIEMBRE",
  },
  {
    id: "110909",
    codigo: "110909",
    departamento: "JUNIN",
    provincia: "CHUPACA",
    distrito: "YANACANCHA",
  },
  {
    id: "120101",
    codigo: "120101",
    departamento: "LA LIBERTAD",
    provincia: "TRUJILLO",
    distrito: "TRUJILLO",
  },
  {
    id: "120102",
    codigo: "120102",
    departamento: "LA LIBERTAD",
    provincia: "TRUJILLO",
    distrito: "HUANCHACO",
  },
  {
    id: "120103",
    codigo: "120103",
    departamento: "LA LIBERTAD",
    provincia: "TRUJILLO",
    distrito: "LAREDO",
  },
  {
    id: "120104",
    codigo: "120104",
    departamento: "LA LIBERTAD",
    provincia: "TRUJILLO",
    distrito: "MOCHE",
  },
  {
    id: "120105",
    codigo: "120105",
    departamento: "LA LIBERTAD",
    provincia: "TRUJILLO",
    distrito: "SALAVERRY",
  },
  {
    id: "120106",
    codigo: "120106",
    departamento: "LA LIBERTAD",
    provincia: "TRUJILLO",
    distrito: "SIMBAL",
  },
  {
    id: "120107",
    codigo: "120107",
    departamento: "LA LIBERTAD",
    provincia: "TRUJILLO",
    distrito: "VICTOR LARCO HERRERA",
  },
  {
    id: "120109",
    codigo: "120109",
    departamento: "LA LIBERTAD",
    provincia: "TRUJILLO",
    distrito: "POROTO",
  },
  {
    id: "120110",
    codigo: "120110",
    departamento: "LA LIBERTAD",
    provincia: "TRUJILLO",
    distrito: "EL PORVENIR",
  },
  {
    id: "120111",
    codigo: "120111",
    departamento: "LA LIBERTAD",
    provincia: "TRUJILLO",
    distrito: "LA ESPERANZA",
  },
  {
    id: "120112",
    codigo: "120112",
    departamento: "LA LIBERTAD",
    provincia: "TRUJILLO",
    distrito: "FLORENCIA DE MORA",
  },
  {
    id: "120201",
    codigo: "120201",
    departamento: "LA LIBERTAD",
    provincia: "BOLIVAR",
    distrito: "BOLIVAR",
  },
  {
    id: "120202",
    codigo: "120202",
    departamento: "LA LIBERTAD",
    provincia: "BOLIVAR",
    distrito: "BAMBAMARCA",
  },
  {
    id: "120203",
    codigo: "120203",
    departamento: "LA LIBERTAD",
    provincia: "BOLIVAR",
    distrito: "CONDORMARCA",
  },
  {
    id: "120204",
    codigo: "120204",
    departamento: "LA LIBERTAD",
    provincia: "BOLIVAR",
    distrito: "LONGOTEA",
  },
  {
    id: "120205",
    codigo: "120205",
    departamento: "LA LIBERTAD",
    provincia: "BOLIVAR",
    distrito: "UCUNCHA",
  },
  {
    id: "120206",
    codigo: "120206",
    departamento: "LA LIBERTAD",
    provincia: "BOLIVAR",
    distrito: "UCHUMARCA",
  },
  {
    id: "120301",
    codigo: "120301",
    departamento: "LA LIBERTAD",
    provincia: "SANCHEZ CARRION",
    distrito: "HUAMACHUCO",
  },
  {
    id: "120302",
    codigo: "120302",
    departamento: "LA LIBERTAD",
    provincia: "SANCHEZ CARRION",
    distrito: "COCHORCO",
  },
  {
    id: "120303",
    codigo: "120303",
    departamento: "LA LIBERTAD",
    provincia: "SANCHEZ CARRION",
    distrito: "CURGOS",
  },
  {
    id: "120304",
    codigo: "120304",
    departamento: "LA LIBERTAD",
    provincia: "SANCHEZ CARRION",
    distrito: "CHUGAY",
  },
  {
    id: "120305",
    codigo: "120305",
    departamento: "LA LIBERTAD",
    provincia: "SANCHEZ CARRION",
    distrito: "MARCABAL",
  },
  {
    id: "120306",
    codigo: "120306",
    departamento: "LA LIBERTAD",
    provincia: "SANCHEZ CARRION",
    distrito: "SANAGORAN",
  },
  {
    id: "120307",
    codigo: "120307",
    departamento: "LA LIBERTAD",
    provincia: "SANCHEZ CARRION",
    distrito: "SARIN",
  },
  {
    id: "120308",
    codigo: "120308",
    departamento: "LA LIBERTAD",
    provincia: "SANCHEZ CARRION",
    distrito: "SARTIMBAMBA",
  },
  {
    id: "120401",
    codigo: "120401",
    departamento: "LA LIBERTAD",
    provincia: "OTUZCO",
    distrito: "OTUZCO",
  },
  {
    id: "120402",
    codigo: "120402",
    departamento: "LA LIBERTAD",
    provincia: "OTUZCO",
    distrito: "AGALLPAMPA",
  },
  {
    id: "120403",
    codigo: "120403",
    departamento: "LA LIBERTAD",
    provincia: "OTUZCO",
    distrito: "CHARAT",
  },
  {
    id: "120404",
    codigo: "120404",
    departamento: "LA LIBERTAD",
    provincia: "OTUZCO",
    distrito: "HUARANCHAL",
  },
  {
    id: "120405",
    codigo: "120405",
    departamento: "LA LIBERTAD",
    provincia: "OTUZCO",
    distrito: "LA CUESTA",
  },
  {
    id: "120408",
    codigo: "120408",
    departamento: "LA LIBERTAD",
    provincia: "OTUZCO",
    distrito: "PARANDAY",
  },
  {
    id: "120409",
    codigo: "120409",
    departamento: "LA LIBERTAD",
    provincia: "OTUZCO",
    distrito: "SALPO",
  },
  {
    id: "120410",
    codigo: "120410",
    departamento: "LA LIBERTAD",
    provincia: "OTUZCO",
    distrito: "SINSICAP",
  },
  {
    id: "120411",
    codigo: "120411",
    departamento: "LA LIBERTAD",
    provincia: "OTUZCO",
    distrito: "USQUIL",
  },
  {
    id: "120413",
    codigo: "120413",
    departamento: "LA LIBERTAD",
    provincia: "OTUZCO",
    distrito: "MACHE",
  },
  {
    id: "120501",
    codigo: "120501",
    departamento: "LA LIBERTAD",
    provincia: "PACASMAYO",
    distrito: "SAN PEDRO DE LLOC",
  },
  {
    id: "120503",
    codigo: "120503",
    departamento: "LA LIBERTAD",
    provincia: "PACASMAYO",
    distrito: "GUADALUPE",
  },
  {
    id: "120504",
    codigo: "120504",
    departamento: "LA LIBERTAD",
    provincia: "PACASMAYO",
    distrito: "JEQUETEPEQUE",
  },
  {
    id: "120506",
    codigo: "120506",
    departamento: "LA LIBERTAD",
    provincia: "PACASMAYO",
    distrito: "PACASMAYO",
  },
  {
    id: "120508",
    codigo: "120508",
    departamento: "LA LIBERTAD",
    provincia: "PACASMAYO",
    distrito: "SAN JOSE",
  },
  {
    id: "120601",
    codigo: "120601",
    departamento: "LA LIBERTAD",
    provincia: "PATAZ",
    distrito: "TAYABAMBA",
  },
  {
    id: "120602",
    codigo: "120602",
    departamento: "LA LIBERTAD",
    provincia: "PATAZ",
    distrito: "BULDIBUYO",
  },
  {
    id: "120603",
    codigo: "120603",
    departamento: "LA LIBERTAD",
    provincia: "PATAZ",
    distrito: "CHILLIA",
  },
  {
    id: "120604",
    codigo: "120604",
    departamento: "LA LIBERTAD",
    provincia: "PATAZ",
    distrito: "HUAYLILLAS",
  },
  {
    id: "120605",
    codigo: "120605",
    departamento: "LA LIBERTAD",
    provincia: "PATAZ",
    distrito: "HUANCASPATA",
  },
  {
    id: "120606",
    codigo: "120606",
    departamento: "LA LIBERTAD",
    provincia: "PATAZ",
    distrito: "HUAYO",
  },
  {
    id: "120607",
    codigo: "120607",
    departamento: "LA LIBERTAD",
    provincia: "PATAZ",
    distrito: "ONGON",
  },
  {
    id: "120608",
    codigo: "120608",
    departamento: "LA LIBERTAD",
    provincia: "PATAZ",
    distrito: "PARCOY",
  },
  {
    id: "120609",
    codigo: "120609",
    departamento: "LA LIBERTAD",
    provincia: "PATAZ",
    distrito: "PATAZ",
  },
  {
    id: "120610",
    codigo: "120610",
    departamento: "LA LIBERTAD",
    provincia: "PATAZ",
    distrito: "PIAS",
  },
  {
    id: "120611",
    codigo: "120611",
    departamento: "LA LIBERTAD",
    provincia: "PATAZ",
    distrito: "TAURIJA",
  },
  {
    id: "120612",
    codigo: "120612",
    departamento: "LA LIBERTAD",
    provincia: "PATAZ",
    distrito: "URPAY",
  },
  {
    id: "120613",
    codigo: "120613",
    departamento: "LA LIBERTAD",
    provincia: "PATAZ",
    distrito: "SANTIAGO DE CHALLAS",
  },

  {
    id: "120701",
    codigo: "120701",
    departamento: "LA LIBERTAD",
    provincia: "SANTIAGO DE CHUCO",
    distrito: "SANTIAGO DE CHUCO",
  },
  {
    id: "120702",
    codigo: "120702",
    departamento: "LA LIBERTAD",
    provincia: "SANTIAGO DE CHUCO",
    distrito: "CACHICADAN",
  },
  {
    id: "120703",
    codigo: "120703",
    departamento: "LA LIBERTAD",
    provincia: "SANTIAGO DE CHUCO",
    distrito: "MOLLEBAMBA",
  },
  {
    id: "120704",
    codigo: "120704",
    departamento: "LA LIBERTAD",
    provincia: "SANTIAGO DE CHUCO",
    distrito: "MOLLEPATA",
  },
  {
    id: "120705",
    codigo: "120705",
    departamento: "LA LIBERTAD",
    provincia: "SANTIAGO DE CHUCO",
    distrito: "QUIRUVILCA",
  },
  {
    id: "120706",
    codigo: "120706",
    departamento: "LA LIBERTAD",
    provincia: "SANTIAGO DE CHUCO",
    distrito: "SANTA CRUZ DE CHUCA",
  },
  {
    id: "120707",
    codigo: "120707",
    departamento: "LA LIBERTAD",
    provincia: "SANTIAGO DE CHUCO",
    distrito: "SITABAMBA",
  },
  {
    id: "120708",
    codigo: "120708",
    departamento: "LA LIBERTAD",
    provincia: "SANTIAGO DE CHUCO",
    distrito: "ANGASMARCA",
  },
  {
    id: "120801",
    codigo: "120801",
    departamento: "LA LIBERTAD",
    provincia: "ASCOPE",
    distrito: "ASCOPE",
  },
  {
    id: "120802",
    codigo: "120802",
    departamento: "LA LIBERTAD",
    provincia: "ASCOPE",
    distrito: "CHICAMA",
  },
  {
    id: "120803",
    codigo: "120803",
    departamento: "LA LIBERTAD",
    provincia: "ASCOPE",
    distrito: "CHOCOPE",
  },
  {
    id: "120804",
    codigo: "120804",
    departamento: "LA LIBERTAD",
    provincia: "ASCOPE",
    distrito: "SANTIAGO DE CAO",
  },
  {
    id: "120805",
    codigo: "120805",
    departamento: "LA LIBERTAD",
    provincia: "ASCOPE",
    distrito: "MAGDALENA DE CAO",
  },
  {
    id: "120806",
    codigo: "120806",
    departamento: "LA LIBERTAD",
    provincia: "ASCOPE",
    distrito: "PALJAN",
  },
  {
    id: "120807",
    codigo: "120807",
    departamento: "LA LIBERTAD",
    provincia: "ASCOPE",
    distrito: "RAZURI",
  },
  {
    id: "120808",
    codigo: "120808",
    departamento: "LA LIBERTAD",
    provincia: "ASCOPE",
    distrito: "CASA GRANDE",
  },
  {
    id: "120901",
    codigo: "120901",
    departamento: "LA LIBERTAD",
    provincia: "CHEPEN",
    distrito: "CHEPEN",
  },
  {
    id: "120902",
    codigo: "120902",
    departamento: "LA LIBERTAD",
    provincia: "CHEPEN",
    distrito: "PACANGA",
  },
  {
    id: "120903",
    codigo: "120903",
    departamento: "LA LIBERTAD",
    provincia: "CHEPEN",
    distrito: "PUEBLO NUEVO",
  },
  {
    id: "121001",
    codigo: "121001",
    departamento: "LA LIBERTAD",
    provincia: "JULCAN",
    distrito: "JULCAN",
  },
  {
    id: "121002",
    codigo: "121002",
    departamento: "LA LIBERTAD",
    provincia: "JULCAN",
    distrito: "CARABAMBA",
  },
  {
    id: "121003",
    codigo: "121003",
    departamento: "LA LIBERTAD",
    provincia: "JULCAN",
    distrito: "CALAMARCA",
  },
  {
    id: "121004",
    codigo: "121004",
    departamento: "LA LIBERTAD",
    provincia: "JULCAN",
    distrito: "HUASO",
  },
  {
    id: "121101",
    codigo: "121101",
    departamento: "LA LIBERTAD",
    provincia: "GRAN CHIMU",
    distrito: "CASCAS",
  },
  {
    id: "121102",
    codigo: "121102",
    departamento: "LA LIBERTAD",
    provincia: "GRAN CHIMU",
    distrito: "LUCMA",
  },
  {
    id: "121103",
    codigo: "121103",
    departamento: "LA LIBERTAD",
    provincia: "GRAN CHIMU",
    distrito: "MARMOT",
  },
  {
    id: "121104",
    codigo: "121104",
    departamento: "LA LIBERTAD",
    provincia: "GRAN CHIMU",
    distrito: "SAYAPULLO",
  },
  {
    id: "121201",
    codigo: "121201",
    departamento: "LA LIBERTAD",
    provincia: "VIRU",
    distrito: "VIRU",
  },
  {
    id: "121202",
    codigo: "121202",
    departamento: "LA LIBERTAD",
    provincia: "VIRU",
    distrito: "CHAO",
  },
  {
    id: "121203",
    codigo: "121203",
    departamento: "LA LIBERTAD",
    provincia: "VIRU",
    distrito: "GUADALUPITO",
  },
  {
    id: "130101",
    codigo: "130101",
    departamento: "LAMBAYEQUE",
    provincia: "CHICLAYO",
    distrito: "CHICLAYO",
  },

  {
    id: "130102",
    codigo: "130102",
    departamento: "LAMBAYEQUE",
    provincia: "CHICLAYO",
    distrito: "CHONGOYAPE",
  },
  {
    id: "130103",
    codigo: "130103",
    departamento: "LAMBAYEQUE",
    provincia: "CHICLAYO",
    distrito: "ETEN",
  },
  {
    id: "130104",
    codigo: "130104",
    departamento: "LAMBAYEQUE",
    provincia: "CHICLAYO",
    distrito: "ETEN PUERTO",
  },
  {
    id: "130105",
    codigo: "130105",
    departamento: "LAMBAYEQUE",
    provincia: "CHICLAYO",
    distrito: "LAGUNAS",
  },
  {
    id: "130106",
    codigo: "130106",
    departamento: "LAMBAYEQUE",
    provincia: "CHICLAYO",
    distrito: "MONSEFU",
  },
  {
    id: "130107",
    codigo: "130107",
    departamento: "LAMBAYEQUE",
    provincia: "CHICLAYO",
    distrito: "NUEVA ARICA",
  },
  {
    id: "130108",
    codigo: "130108",
    departamento: "LAMBAYEQUE",
    provincia: "CHICLAYO",
    distrito: "OYOTUN",
  },
  {
    id: "130109",
    codigo: "130109",
    departamento: "LAMBAYEQUE",
    provincia: "CHICLAYO",
    distrito: "PIOSI",
  },
  {
    id: "130110",
    codigo: "130110",
    departamento: "LAMBAYEQUE",
    provincia: "CHICLAYO",
    distrito: "PIMENTEL",
  },
  {
    id: "130111",
    codigo: "130111",
    departamento: "LAMBAYEQUE",
    provincia: "CHICLAYO",
    distrito: "REQUE",
  },
  {
    id: "130112",
    codigo: "130112",
    departamento: "LAMBAYEQUE",
    provincia: "CHICLAYO",
    distrito: "JOSE LEONARDO ORTIZ",
  },
  {
    id: "130113",
    codigo: "130113",
    departamento: "LAMBAYEQUE",
    provincia: "CHICLAYO",
    distrito: "SANTA ROSA",
  },
  {
    id: "130114",
    codigo: "130114",
    departamento: "LAMBAYEQUE",
    provincia: "CHICLAYO",
    distrito: "SAÑA",
  },
  {
    id: "130115",
    codigo: "130115",
    departamento: "LAMBAYEQUE",
    provincia: "CHICLAYO",
    distrito: "LA VICTORIA",
  },
  {
    id: "130116",
    codigo: "130116",
    departamento: "LAMBAYEQUE",
    provincia: "CHICLAYO",
    distrito: "CAVALTI",
  },
  {
    id: "130117",
    codigo: "130117",
    departamento: "LAMBAYEQUE",
    provincia: "CHICLAYO",
    distrito: "PATAPO",
  },
  {
    id: "130118",
    codigo: "130118",
    departamento: "LAMBAYEQUE",
    provincia: "CHICLAYO",
    distrito: "POMALCA",
  },
  {
    id: "130119",
    codigo: "130119",
    departamento: "LAMBAYEQUE",
    provincia: "CHICLAYO",
    distrito: "PUCALA",
  },
  {
    id: "130120",
    codigo: "130120",
    departamento: "LAMBAYEQUE",
    provincia: "CHICLAYO",
    distrito: "TUMAN",
  },
  {
    id: "130201",
    codigo: "130201",
    departamento: "LAMBAYEQUE",
    provincia: "FERREÑAFE",
    distrito: "FERREÑAFE",
  },
  {
    id: "130202",
    codigo: "130202",
    departamento: "LAMBAYEQUE",
    provincia: "FERREÑAFE",
    distrito: "INCAHUASI",
  },
  {
    id: "130203",
    codigo: "130203",
    departamento: "LAMBAYEQUE",
    provincia: "FERREÑAFE",
    distrito: "CAÑARIS",
  },
  {
    id: "130204",
    codigo: "130204",
    departamento: "LAMBAYEQUE",
    provincia: "FERREÑAFE",
    distrito: "PITIPO",
  },
  {
    id: "130205",
    codigo: "130205",
    departamento: "LAMBAYEQUE",
    provincia: "FERREÑAFE",
    distrito: "PUEBLO NUEVO",
  },
  {
    id: "130206",
    codigo: "130206",
    departamento: "LAMBAYEQUE",
    provincia: "FERREÑAFE",
    distrito: "MANUEL ANTONIO MESONES MURO",
  },
  {
    id: "130301",
    codigo: "130301",
    departamento: "LAMBAYEQUE",
    provincia: "LAMBAYEQUE",
    distrito: "LAMBAYEQUE",
  },
  {
    id: "130302",
    codigo: "130302",
    departamento: "LAMBAYEQUE",
    provincia: "LAMBAYEQUE",
    distrito: "CHOCHOPE",
  },
  {
    id: "130303",
    codigo: "130303",
    departamento: "LAMBAYEQUE",
    provincia: "LAMBAYEQUE",
    distrito: "ILLIMO",
  },
  {
    id: "130304",
    codigo: "130304",
    departamento: "LAMBAYEQUE",
    provincia: "LAMBAYEQUE",
    distrito: "JAYANCA",
  },
  {
    id: "130305",
    codigo: "130305",
    departamento: "LAMBAYEQUE",
    provincia: "LAMBAYEQUE",
    distrito: "MOCHUMI",
  },
  {
    id: "130306",
    codigo: "130306",
    departamento: "LAMBAYEQUE",
    provincia: "LAMBAYEQUE",
    distrito: "MORROPE",
  },
  {
    id: "130307",
    codigo: "130307",
    departamento: "LAMBAYEQUE",
    provincia: "LAMBAYEQUE",
    distrito: "MOTUPE",
  },
  {
    id: "130308",
    codigo: "130308",
    departamento: "LAMBAYEQUE",
    provincia: "LAMBAYEQUE",
    distrito: "OLMOS",
  },
  {
    id: "130309",
    codigo: "130309",
    departamento: "LAMBAYEQUE",
    provincia: "LAMBAYEQUE",
    distrito: "PACORA",
  },
  {
    id: "130310",
    codigo: "130310",
    departamento: "LAMBAYEQUE",
    provincia: "LAMBAYEQUE",
    distrito: "SALAS",
  },
  {
    id: "130311",
    codigo: "130311",
    departamento: "LAMBAYEQUE",
    provincia: "LAMBAYEQUE",
    distrito: "SAN JOSE",
  },
  {
    id: "130312",
    codigo: "130312",
    departamento: "LAMBAYEQUE",
    provincia: "LAMBAYEQUE",
    distrito: "TUCUME",
  },
  {
    id: "140101",
    codigo: "140101",
    departamento: "LIMA",
    provincia: "LIMA",
    distrito: "LIMA",
  },
  {
    id: "140102",
    codigo: "140102",
    departamento: "LIMA",
    provincia: "LIMA",
    distrito: "ANCON",
  },
  {
    id: "140103",
    codigo: "140103",
    departamento: "LIMA",
    provincia: "LIMA",
    distrito: "ATE",
  },
  {
    id: "140104",
    codigo: "140104",
    departamento: "LIMA",
    provincia: "LIMA",
    distrito: "BREÑA",
  },
  {
    id: "140105",
    codigo: "140105",
    departamento: "LIMA",
    provincia: "LIMA",
    distrito: "CARABAYLLO",
  },
  {
    id: "140106",
    codigo: "140106",
    departamento: "LIMA",
    provincia: "LIMA",
    distrito: "COMAS",
  },
  {
    id: "140107",
    codigo: "140107",
    departamento: "LIMA",
    provincia: "LIMA",
    distrito: "CHACLACAYO",
  },
  {
    id: "140108",
    codigo: "140108",
    departamento: "LIMA",
    provincia: "LIMA",
    distrito: "CHORRILLOS",
  },
  {
    id: "140109",
    codigo: "140109",
    departamento: "LIMA",
    provincia: "LIMA",
    distrito: "LA VICTORIA",
  },
  {
    id: "140110",
    codigo: "140110",
    departamento: "LIMA",
    provincia: "LIMA",
    distrito: "LA MOJINA",
  },
  {
    id: "140111",
    codigo: "140111",
    departamento: "LIMA",
    provincia: "LIMA",
    distrito: "LINCE",
  },
  {
    id: "140112",
    codigo: "140112",
    departamento: "LIMA",
    provincia: "LIMA",
    distrito: "LURIGANCHO",
  },
  {
    id: "140113",
    codigo: "140113",
    departamento: "LIMA",
    provincia: "LIMA",
    distrito: "LURIN",
  },
  {
    id: "140114",
    codigo: "140114",
    departamento: "LIMA",
    provincia: "LIMA",
    distrito: "MAGDALENA DEL MAR",
  },
  {
    id: "140115",
    codigo: "140115",
    departamento: "LIMA",
    provincia: "LIMA",
    distrito: "MIRAFLORES",
  },
  {
    id: "140116",
    codigo: "140116",
    departamento: "LIMA",
    provincia: "LIMA",
    distrito: "PACHACAMAC",
  },
  {
    id: "140117",
    codigo: "140117",
    departamento: "LIMA",
    provincia: "LIMA",
    distrito: "PUEBLO LIBRE",
  },
  {
    id: "140118",
    codigo: "140118",
    departamento: "LIMA",
    provincia: "LIMA",
    distrito: "PUCUSANA",
  },
  {
    id: "140119",
    codigo: "140119",
    departamento: "LIMA",
    provincia: "LIMA",
    distrito: "PUENTE PIEDRA",
  },
  {
    id: "140120",
    codigo: "140120",
    departamento: "LIMA",
    provincia: "LIMA",
    distrito: "PUNTA HERMOSA",
  },
  {
    id: "140121",
    codigo: "140121",
    departamento: "LIMA",
    provincia: "LIMA",
    distrito: "PUNTA NEGRA",
  },
  {
    id: "140122",
    codigo: "140122",
    departamento: "LIMA",
    provincia: "LIMA",
    distrito: "RIMAC",
  },
  {
    id: "140123",
    codigo: "140123",
    departamento: "LIMA",
    provincia: "LIMA",
    distrito: "SAN BARTOLO",
  },
  {
    id: "140124",
    codigo: "140124",
    departamento: "LIMA",
    provincia: "LIMA",
    distrito: "SAN ISIDRO",
  },
  {
    id: "140125",
    codigo: "140125",
    departamento: "LIMA",
    provincia: "LIMA",
    distrito: "BARRANCO",
  },
  {
    id: "140126",
    codigo: "140126",
    departamento: "LIMA",
    provincia: "LIMA",
    distrito: "SAN MARTIN DE PORRES",
  },
  {
    id: "140127",
    codigo: "140127",
    departamento: "LIMA",
    provincia: "LIMA",
    distrito: "SAN MIGUEL",
  },
  {
    id: "140128",
    codigo: "140128",
    departamento: "LIMA",
    provincia: "LIMA",
    distrito: "SANTA MARIA DEL MAR",
  },
  {
    id: "140129",
    codigo: "140129",
    departamento: "LIMA",
    provincia: "LIMA",
    distrito: "SANTA ROSA",
  },
  {
    id: "140130",
    codigo: "140130",
    departamento: "LIMA",
    provincia: "LIMA",
    distrito: "SANTIAGO DE SURCO",
  },
  {
    id: "140131",
    codigo: "140131",
    departamento: "LIMA",
    provincia: "LIMA",
    distrito: "SURQUILLO",
  },
  {
    id: "140132",
    codigo: "140132",
    departamento: "LIMA",
    provincia: "LIMA",
    distrito: "VILLA MARIA DEL TRIUNFO",
  },
  {
    id: "140133",
    codigo: "140133",
    departamento: "LIMA",
    provincia: "LIMA",
    distrito: "JESUS MARIA",
  },
  {
    id: "140134",
    codigo: "140134",
    departamento: "LIMA",
    provincia: "LIMA",
    distrito: "INDEPENDENCIA",
  },
  {
    id: "140135",
    codigo: "140135",
    departamento: "LIMA",
    provincia: "LIMA",
    distrito: "EL AGUSTINO",
  },
  {
    id: "140136",
    codigo: "140136",
    departamento: "LIMA",
    provincia: "LIMA",
    distrito: "SAN JUAN DE MIRAFLORES",
  },
  {
    id: "140137",
    codigo: "140137",
    departamento: "LIMA",
    provincia: "LIMA",
    distrito: "SAN JUAN DE LURIGANCHO",
  },
  {
    id: "140138",
    codigo: "140138",
    departamento: "LIMA",
    provincia: "LIMA",
    distrito: "SAN LUIS",
  },
  {
    id: "140139",
    codigo: "140139",
    departamento: "LIMA",
    provincia: "LIMA",
    distrito: "CIENEGUILLA",
  },
  {
    id: "140140",
    codigo: "140140",
    departamento: "LIMA",
    provincia: "LIMA",
    distrito: "SAN BORJA",
  },
  {
    id: "140141",
    codigo: "140141",
    departamento: "LIMA",
    provincia: "LIMA",
    distrito: "VILLA EL SALVADOR",
  },
  {
    id: "140142",
    codigo: "140142",
    departamento: "LIMA",
    provincia: "LIMA",
    distrito: "LOS OLIVOS",
  },
  {
    id: "140143",
    codigo: "140143",
    departamento: "LIMA",
    provincia: "LIMA",
    distrito: "SANTA ANITA",
  },
  {
    id: "140201",
    codigo: "140201",
    departamento: "LIMA",
    provincia: "CAJATAMBO",
    distrito: "CAJATAMBO",
  },
  {
    id: "140205",
    codigo: "140205",
    departamento: "LIMA",
    provincia: "CAJATAMBO",
    distrito: "COPA",
  },
  {
    id: "140206",
    codigo: "140206",
    departamento: "LIMA",
    provincia: "CAJATAMBO",
    distrito: "GORGOR",
  },
  {
    id: "140207",
    codigo: "140207",
    departamento: "LIMA",
    provincia: "CAJATAMBO",
    distrito: "HUANCAPON",
  },
  {
    id: "140208",
    codigo: "140208",
    departamento: "LIMA",
    provincia: "CAJATAMBO",
    distrito: "MANAS",
  },
  {
    id: "140301",
    codigo: "140301",
    departamento: "LIMA",
    provincia: "CANTA",
    distrito: "CANTA",
  },
  {
    id: "140302",
    codigo: "140302",
    departamento: "LIMA",
    provincia: "CANTA",
    distrito: "ARAHUAY",
  },
  {
    id: "140303",
    codigo: "140303",
    departamento: "LIMA",
    provincia: "CANTA",
    distrito: "HUAMANTANGA",
  },
  {
    id: "140304",
    codigo: "140304",
    departamento: "LIMA",
    provincia: "CANTA",
    distrito: "HUAROS",
  },
  {
    id: "140305",
    codigo: "140305",
    departamento: "LIMA",
    provincia: "CANTA",
    distrito: "LACHAQUI",
  },
  {
    id: "140306",
    codigo: "140306",
    departamento: "LIMA",
    provincia: "CANTA",
    distrito: "SAN BUENAVENTURA",
  },
  {
    id: "140307",
    codigo: "140307",
    departamento: "LIMA",
    provincia: "CANTA",
    distrito: "SANTA ROSA DE QUIVES",
  },
  {
    id: "140401",
    codigo: "140401",
    departamento: "LIMA",
    provincia: "CAÑETE",
    distrito: "SAN VICENTE DE CAÑETE",
  },
  {
    id: "140402",
    codigo: "140402",
    departamento: "LIMA",
    provincia: "CAÑETE",
    distrito: "CALANGO",
  },
  {
    id: "140403",
    codigo: "140403",
    departamento: "LIMA",
    provincia: "CAÑETE",
    distrito: "CERRO AZUL",
  },
  {
    id: "140404",
    codigo: "140404",
    departamento: "LIMA",
    provincia: "CAÑETE",
    distrito: "COAYLLO",
  },
  {
    id: "140405",
    codigo: "140405",
    departamento: "LIMA",
    provincia: "CAÑETE",
    distrito: "CHILCA",
  },
  {
    id: "140406",
    codigo: "140406",
    departamento: "LIMA",
    provincia: "CAÑETE",
    distrito: "IMPERIAL",
  },
  {
    id: "140407",
    codigo: "140407",
    departamento: "LIMA",
    provincia: "CAÑETE",
    distrito: "LUNAHUANA",
  },
  {
    id: "140408",
    codigo: "140408",
    departamento: "LIMA",
    provincia: "CAÑETE",
    distrito: "MALA",
  },
  {
    id: "140409",
    codigo: "140409",
    departamento: "LIMA",
    provincia: "CAÑETE",
    distrito: "NUEVO IMPERIAL",
  },
  {
    id: "140410",
    codigo: "140410",
    departamento: "LIMA",
    provincia: "CAÑETE",
    distrito: "PACARAN",
  },
  {
    id: "140411",
    codigo: "140411",
    departamento: "LIMA",
    provincia: "CAÑETE",
    distrito: "QUILMANA",
  },
  {
    id: "140412",
    codigo: "140412",
    departamento: "LIMA",
    provincia: "HUAROCHIRI",
    distrito: "SAN ANTONIO",
  },
  {
    id: "140413",
    codigo: "140413",
    departamento: "LIMA",
    provincia: "CAÑETE",
    distrito: "SAN LUIS",
  },
  {
    id: "140414",
    codigo: "140414",
    departamento: "LIMA",
    provincia: "CAÑETE",
    distrito: "SANTA CRUZ DE FLORES",
  },
  {
    id: "140415",
    codigo: "140415",
    departamento: "LIMA",
    provincia: "CAÑETE",
    distrito: "ZUÑIGA",
  },
  {
    id: "140416",
    codigo: "140416",
    departamento: "LIMA",
    provincia: "CAÑETE",
    distrito: "ASIA",
  },
  {
    id: "140501",
    codigo: "140501",
    departamento: "LIMA",
    provincia: "HUAURA",
    distrito: "HUACHO",
  },
  {
    id: "140502",
    codigo: "140502",
    departamento: "LIMA",
    provincia: "HUAURA",
    distrito: "AMBAR",
  },
  {
    id: "140504",
    codigo: "140504",
    departamento: "LIMA",
    provincia: "HUAURA",
    distrito: "CALETA DE CARQUIN",
  },
  {
    id: "140505",
    codigo: "140505",
    departamento: "LIMA",
    provincia: "HUAURA",
    distrito: "CHECRAS",
  },
  {
    id: "140506",
    codigo: "140506",
    departamento: "LIMA",
    provincia: "HUAURA",
    distrito: "HUALMAY",
  },
  {
    id: "140507",
    codigo: "140507",
    departamento: "LIMA",
    provincia: "HUAURA",
    distrito: "HUAURA",
  },
  {
    id: "140508",
    codigo: "140508",
    departamento: "LIMA",
    provincia: "HUAURA",
    distrito: "LEONCIO PRADO",
  },
  {
    id: "140509",
    codigo: "140509",
    departamento: "LIMA",
    provincia: "HUAURA",
    distrito: "PACCHO",
  },
  {
    id: "140511",
    codigo: "140511",
    departamento: "LIMA",
    provincia: "HUAURA",
    distrito: "SANTA LEONOR",
  },
  {
    id: "140512",
    codigo: "140512",
    departamento: "LIMA",
    provincia: "HUAURA",
    distrito: "SANTA MARIA",
  },
  {
    id: "140513",
    codigo: "140513",
    departamento: "LIMA",
    provincia: "HUAURA",
    distrito: "SAYAN",
  },
  {
    id: "140516",
    codigo: "140516",
    departamento: "LIMA",
    provincia: "HUAURA",
    distrito: "VEGUETA",
  },
  {
    id: "140601",
    codigo: "140601",
    departamento: "LIMA",
    provincia: "HUAROCHIRI",
    distrito: "MATUCANA",
  },
  {
    id: "140602",
    codigo: "140602",
    departamento: "LIMA",
    provincia: "HUAROCHIRI",
    distrito: "ANTIOQUIA",
  },
  {
    id: "140603",
    codigo: "140603",
    departamento: "LIMA",
    provincia: "HUAROCHIRi",
    distrito: "CALLAHUANCA",
  },
  {
    id: "140604",
    codigo: "140604",
    departamento: "LIMA",
    provincia: "HUAROCHIRI",
    distrito: "CARAMPOMA",
  },
  {
    id: "140605",
    codigo: "140605",
    departamento: "LIMA",
    provincia: "HUAROCHIRI",
    distrito: "CASTA",
  },
  {
    id: "140606",
    codigo: "140606",
    departamento: "LIMA",
    provincia: "HUAROCHIRI",
    distrito: "SAN JOSE DE LOS CHORRILLOS",
  },
  {
    id: "140607",
    codigo: "140607",
    departamento: "LIMA",
    provincia: "HUAROCHIRI",
    distrito: "CHICLA",
  },
  {
    id: "140608",
    codigo: "140608",
    departamento: "LIMA",
    provincia: "HUAROCHIRI",
    distrito: "HUANZA",
  },
  {
    id: "140609",
    codigo: "140609",
    departamento: "LIMA",
    provincia: "HUAROCHIRI",
    distrito: "HUAROCHIRI",
  },
  {
    id: "140610",
    codigo: "140610",
    departamento: "LIMA",
    provincia: "HUAROCHIRI",
    distrito: "LAHUAYAMBO",
  },
  {
    id: "140611",
    codigo: "140611",
    departamento: "LIMA",
    provincia: "HUAROCHIRI",
    distrito: "LANGA",
  },
  {
    id: "140612",
    codigo: "140612",
    departamento: "LIMA",
    provincia: "HUAROCHIRI",
    distrito: "MARIATANA",
  },
  {
    id: "140613",
    codigo: "140613",
    departamento: "LIMA",
    provincia: "HUAROCHIRI",
    distrito: "RICARDO PALMA",
  },
  {
    id: "140614",
    codigo: "140614",
    departamento: "LIMA",
    provincia: "HUAROCHIRI",
    distrito: "SAN ANDRES DE TUPICOCHA",
  },
  {
    id: "140615",
    codigo: "140615",
    departamento: "LIMA",
    provincia: "CAÑETE",
    distrito: "SAN ANTONIO",
  },
  {
    id: "140616",
    codigo: "140616",
    departamento: "LIMA",
    provincia: "HUAROCHIRI",
    distrito: "SAN BARTOLOME",
  },
  {
    id: "140617",
    codigo: "140617",
    departamento: "LIMA",
    provincia: "HUAROCHIRI",
    distrito: "SAN DAMIAN",
  },
  {
    id: "140618",
    codigo: "140618",
    departamento: "LIMA",
    provincia: "HUAROCHIRI",
    distrito: "SANGALLAYA",
  },
  {
    id: "140619",
    codigo: "140619",
    departamento: "LIMA",
    provincia: "HUAROCHIRI",
    distrito: "SAN JUAN DE TANTARANCHE",
  },
  {
    id: "140620",
    codigo: "140620",
    departamento: "LIMA",
    provincia: "HUAROCHIRI",
    distrito: "SAN LORENZO DE QUINTI",
  },
  {
    id: "140621",
    codigo: "140621",
    departamento: "LIMA",
    provincia: "HUAROCHIRI",
    distrito: "SAN MATEO",
  },
  {
    id: "140622",
    codigo: "140622",
    departamento: "LIMA",
    provincia: "HUAROCHIRI",
    distrito: "SAN MATEO DE OTAC",
  },
  {
    id: "140623",
    codigo: "140623",
    departamento: "LIMA",
    provincia: "HUAROCHIRI",
    distrito: "SAN PEDRO DE HUANCAYRE",
  },
  {
    id: "140624",
    codigo: "140624",
    departamento: "LIMA",
    provincia: "HUAROCHIRI",
    distrito: "SANTA CRUZ DE COCACHACRA",
  },
  {
    id: "140625",
    codigo: "140625",
    departamento: "LIMA",
    provincia: "HUAROCHIRI",
    distrito: "SANTA EULALIA",
  },
  {
    id: "140626",
    codigo: "140626",
    departamento: "LIMA",
    provincia: "HUAROCHIRI",
    distrito: "SANTIAGO DE ANCHUCAYA",
  },
  {
    id: "140627",
    codigo: "140627",
    departamento: "LIMA",
    provincia: "HUAROCHIRI",
    distrito: "SANTIAGO DE TUNA",
  },
  {
    id: "140628",
    codigo: "140628",
    departamento: "LIMA",
    provincia: "HUAROCHIRI",
    distrito: "SANTO DOMINGO DE LOS OLLEROS",
  },
  {
    id: "140629",
    codigo: "140629",
    departamento: "LIMA",
    provincia: "HUAROCHIRI",
    distrito: "SURCO",
  },
  {
    id: "140630",
    codigo: "140630",
    departamento: "LIMA",
    provincia: "HUAROCHIRI",
    distrito: "HUACHUPAMPA",
  },
  {
    id: "140631",
    codigo: "140631",
    departamento: "LIMA",
    provincia: "HUAROCHIRI",
    distrito: "SAN PEDRO DE LARAOS",
  },
  {
    id: "140632",
    codigo: "140632",
    departamento: "LIMA",
    provincia: "HUAROCHIRI",
    distrito: "SAN JUAN DE IRIS",
  },
  {
    id: "140701",
    codigo: "140701",
    departamento: "LIMA",
    provincia: "YAUYOS",
    distrito: "YAUYOS",
  },
  {
    id: "140702",
    codigo: "140702",
    departamento: "LIMA",
    provincia: "YAUYOS",
    distrito: "ALIS",
  },
  {
    id: "140703",
    codigo: "140703",
    departamento: "LIMA",
    provincia: "YAUYOS",
    distrito: "ALLAUCA",
  },
  {
    id: "140704",
    codigo: "140704",
    departamento: "LIMA",
    provincia: "YAUYOS",
    distrito: "AYAVIRI",
  },
  {
    id: "140705",
    codigo: "140705",
    departamento: "LIMA",
    provincia: "YAUYOS",
    distrito: "AZANGARO",
  },
  {
    id: "140706",
    codigo: "140706",
    departamento: "LIMA",
    provincia: "YAUYOS",
    distrito: "CACRA",
  },
  {
    id: "140707",
    codigo: "140707",
    departamento: "LIMA",
    provincia: "YAUYOS",
    distrito: "CARANIA",
  },
  {
    id: "140708",
    codigo: "140708",
    departamento: "LIMA",
    provincia: "YAUYOS",
    distrito: "COCHAS",
  },
  {
    id: "140709",
    codigo: "140709",
    departamento: "LIMA",
    provincia: "YAUYOS",
    distrito: "COLONIA",
  },
  {
    id: "140710",
    codigo: "140710",
    departamento: "LIMA",
    provincia: "YAUYOS",
    distrito: "CHOCOS",
  },
  {
    id: "140711",
    codigo: "140711",
    departamento: "LIMA",
    provincia: "YAUYOS",
    distrito: "HUAMPARA",
  },
  {
    id: "140712",
    codigo: "140712",
    departamento: "LIMA",
    provincia: "YAUYOS",
    distrito: "HUANCAYA",
  },
  {
    id: "140713",
    codigo: "140713",
    departamento: "LIMA",
    provincia: "YAUYOS",
    distrito: "HUANGASCAR",
  },
  {
    id: "140714",
    codigo: "140714",
    departamento: "LIMA",
    provincia: "YAUYOS",
    distrito: "HUANTAN",
  },
  {
    id: "140715",
    codigo: "140715",
    departamento: "LIMA",
    provincia: "YAUYOS",
    distrito: "HUAÑEC",
  },
  {
    id: "140716",
    codigo: "140716",
    departamento: "LIMA",
    provincia: "YAUYOS",
    distrito: "LARAOS",
  },
  {
    id: "140717",
    codigo: "140717",
    departamento: "LIMA",
    provincia: "YAUYOS",
    distrito: "LINCHA",
  },
  {
    id: "140718",
    codigo: "140718",
    departamento: "LIMA",
    provincia: "YAUYOS",
    distrito: "MIRAFLORES",
  },
  {
    id: "140719",
    codigo: "140719",
    departamento: "LIMA",
    provincia: "YAUYOS",
    distrito: "OMAS",
  },
  {
    id: "140720",
    codigo: "140720",
    departamento: "LIMA",
    provincia: "YAUYOS",
    distrito: "QUINCHES",
  },
  {
    id: "140721",
    codigo: "140721",
    departamento: "LIMA",
    provincia: "YAUYOS",
    distrito: "QUINOCAY",
  },
  {
    id: "140722",
    codigo: "140722",
    departamento: "LIMA",
    provincia: "YAUYOS",
    distrito: "SAN JOAQUIN",
  },
  {
    id: "140723",
    codigo: "140723",
    departamento: "LIMA",
    provincia: "YAUYOS",
    distrito: "SAN PEDRO DE PILAS",
  },
  {
    id: "140724",
    codigo: "140724",
    departamento: "LIMA",
    provincia: "YAUYOS",
    distrito: "TANTA",
  },
  {
    id: "140725",
    codigo: "140725",
    departamento: "LIMA",
    provincia: "YAUYOS",
    distrito: "TAURIPAMPA",
  },
  {
    id: "140726",
    codigo: "140726",
    departamento: "LIMA",
    provincia: "YAUYOS",
    distrito: "TUPE",
  },
  {
    id: "140727",
    codigo: "140727",
    departamento: "LIMA",
    provincia: "YAUYOS",
    distrito: "TOMAS",
  },
  {
    id: "140728",
    codigo: "140728",
    departamento: "LIMA",
    provincia: "YAUYOS",
    distrito: "VIÑAC",
  },
  {
    id: "140729",
    codigo: "140729",
    departamento: "LIMA",
    provincia: "YAUYOS",
    distrito: "VITIS",
  },
  {
    id: "140730",
    codigo: "140730",
    departamento: "LIMA",
    provincia: "YAUYOS",
    distrito: "HONGOS",
  },
  {
    id: "140731",
    codigo: "140731",
    departamento: "LIMA",
    provincia: "YAUYOS",
    distrito: "MADEAN",
  },
  {
    id: "140732",
    codigo: "140732",
    departamento: "LIMA",
    provincia: "YAUYOS",
    distrito: "PUTINZA",
  },
  {
    id: "140733",
    codigo: "140733",
    departamento: "LIMA",
    provincia: "YAUYOS",
    distrito: "CATAHUASI",
  },
  {
    id: "140801",
    codigo: "140801",
    departamento: "LIMA",
    provincia: "HUARAL",
    distrito: "HUARAL",
  },
  {
    id: "140802",
    codigo: "140802",
    departamento: "LIMA",
    provincia: "HUARAL",
    distrito: "ATAVILLOS ALTO",
  },
  {
    id: "140803",
    codigo: "140803",
    departamento: "LIMA",
    provincia: "HUARAL",
    distrito: "ATAVILLOS BAJO",
  },
  {
    id: "140804",
    codigo: "140804",
    departamento: "LIMA",
    provincia: "HUARAL",
    distrito: "AUCALLAMA",
  },
  {
    id: "140805",
    codigo: "140805",
    departamento: "LIMA",
    provincia: "HUARAL",
    distrito: "CHANCAY",
  },
  {
    id: "140806",
    codigo: "140806",
    departamento: "LIMA",
    provincia: "HUARAL",
    distrito: "IHUARI",
  },
  {
    id: "140807",
    codigo: "140807",
    departamento: "LIMA",
    provincia: "HUARAL",
    distrito: "LAMPIAN",
  },
  {
    id: "140808",
    codigo: "140808",
    departamento: "LIMA",
    provincia: "HUARAL",
    distrito: "PACARAOS",
  },
  {
    id: "140809",
    codigo: "140809",
    departamento: "LIMA",
    provincia: "HUARAL",
    distrito: "SAN MIGUEL DE ACOS",
  },
  {
    id: "140810",
    codigo: "140810",
    departamento: "LIMA",
    provincia: "HUARAL",
    distrito: "VEINTISIETE DE NOVIEMBRE",
  },
  {
    id: "140811",
    codigo: "140811",
    departamento: "LIMA",
    provincia: "HUARAL",
    distrito: "SANTA CRUZ DE ANDAMARCA",
  },
  {
    id: "140812",
    codigo: "140812",
    departamento: "LIMA",
    provincia: "HUARAL",
    distrito: "SUMBILCA",
  },
  {
    id: "140901",
    codigo: "140901",
    departamento: "LIMA",
    provincia: "BARRANCA",
    distrito: "BARRANCA",
  },
  {
    id: "140902",
    codigo: "140902",
    departamento: "LIMA",
    provincia: "BARRANCA",
    distrito: "PARAMONGA",
  },
  {
    id: "140903",
    codigo: "140903",
    departamento: "LIMA",
    provincia: "BARRANCA",
    distrito: "PATIVILCA",
  },
  {
    id: "140904",
    codigo: "140904",
    departamento: "LIMA",
    provincia: "BARRANCA",
    distrito: "SUPE",
  },
  {
    id: "140905",
    codigo: "140905",
    departamento: "LIMA",
    provincia: "BARRANCA",
    distrito: "SUPE PUERTO",
  },
  {
    id: "141001",
    codigo: "141001",
    departamento: "LIMA",
    provincia: "OYON",
    distrito: "OYON",
  },
  {
    id: "141002",
    codigo: "141002",
    departamento: "LIMA",
    provincia: "OYON",
    distrito: "NAVAN",
  },
  {
    id: "141003",
    codigo: "141003",
    departamento: "LIMA",
    provincia: "OYON",
    distrito: "CAUJUL",
  },
  {
    id: "141004",
    codigo: "141004",
    departamento: "LIMA",
    provincia: "OYON",
    distrito: "ANDAJES",
  },
  {
    id: "141005",
    codigo: "141005",
    departamento: "LIMA",
    provincia: "OYON",
    distrito: "PACHANGARA",
  },
  {
    id: "141006",
    codigo: "141006",
    departamento: "LIMA",
    provincia: "OYON",
    distrito: "COCHAMARCA",
  },
  {
    id: "150101",
    codigo: "150101",
    departamento: "LORETO",
    provincia: "MAYNAS",
    distrito: "IQUITOS",
  },
  {
    id: "150102",
    codigo: "150102",
    departamento: "LORETO",
    provincia: "MAYNAS",
    distrito: "ALTO NANAY",
  },
  {
    id: "150103",
    codigo: "150103",
    departamento: "LORETO",
    provincia: "MAYNAS",
    distrito: "FERNANDO LORES",
  },
  {
    id: "150104",
    codigo: "150104",
    departamento: "LORETO",
    provincia: "MAYNAS",
    distrito: "LAS AMAZONAS",
  },
  {
    id: "150105",
    codigo: "150105",
    departamento: "LORETO",
    provincia: "MAYNAS",
    distrito: "MAZAN",
  },
  {
    id: "150106",
    codigo: "150106",
    departamento: "LORETO",
    provincia: "MAYNAS",
    distrito: "NAPO",
  },
  {
    id: "150108",
    codigo: "150108",
    departamento: "LORETO",
    provincia: "MAYNAS",
    distrito: "TORRES CAUSANA",
  },
  {
    id: "150110",
    codigo: "150110",
    departamento: "LORETO",
    provincia: "MAYNAS",
    distrito: "INDIANA",
  },
  {
    id: "150111",
    codigo: "150111",
    departamento: "LORETO",
    provincia: "MAYNAS",
    distrito: "PUNCHANA",
  },
  {
    id: "150112",
    codigo: "150112",
    departamento: "LORETO",
    provincia: "MAYNAS",
    distrito: "BELEN",
  },
  {
    id: "150113",
    codigo: "150113",
    departamento: "LORETO",
    provincia: "MAYNAS",
    distrito: "SAN JUAN BAUTISTA",
  },
  {
    id: "150201",
    codigo: "150201",
    departamento: "LORETO",
    provincia: "ALTO AMAZONAS",
    distrito: "YURIMAGUAS",
  },
  {
    id: "150202",
    codigo: "150202",
    departamento: "LORETO",
    provincia: "ALTO AMAZONAS",
    distrito: "BALSAPUERTO",
  },
  {
    id: "150205",
    codigo: "150205",
    departamento: "LORETO",
    provincia: "ALTO AMAZONAS",
    distrito: "JEBEROS",
  },
  {
    id: "150206",
    codigo: "150206",
    departamento: "LORETO",
    provincia: "ALTO AMAZONAS",
    distrito: "LAGUNAS",
  },
  {
    id: "150210",
    codigo: "150210",
    departamento: "LORETO",
    provincia: "ALTO AMAZONAS",
    distrito: "SANTA CRUZ",
  },
  {
    id: "150211",
    codigo: "150211",
    departamento: "LORETO",
    provincia: "ALTO AMAZONAS",
    distrito: "TENIENTE CESAR LOPEZ ROJAS",
  },
  {
    id: "150301",
    codigo: "150301",
    departamento: "LORETO",
    provincia: "LORETO",
    distrito: "NAUTA",
  },
  {
    id: "150302",
    codigo: "150302",
    departamento: "LORETO",
    provincia: "LORETO",
    distrito: "PARINARI",
  },
  {
    id: "150303",
    codigo: "150303",
    departamento: "LORETO",
    provincia: "LORETO",
    distrito: "TIGRE",
  },
  {
    id: "150304",
    codigo: "150304",
    departamento: "LORETO",
    provincia: "LORETO",
    distrito: "URARINAS",
  },
  {
    id: "150305",
    codigo: "150305",
    departamento: "LORETO",
    provincia: "LORETO",
    distrito: "TROMPETEROS",
  },
  {
    id: "150401",
    codigo: "150401",
    departamento: "LORETO",
    provincia: "REQUENA",
    distrito: "REQUENA",
  },
  {
    id: "150402",
    codigo: "150402",
    departamento: "LORETO",
    provincia: "REQUENA",
    distrito: "ALTO TAPIICHE",
  },
  {
    id: "150403",
    codigo: "150403",
    departamento: "LORETO",
    provincia: "REQUENA",
    distrito: "CAPELO",
  },
  {
    id: "150404",
    codigo: "150404",
    departamento: "LORETO",
    provincia: "REQUENA",
    distrito: "EMILIO SAN MARTIN",
  },
  {
    id: "150405",
    codigo: "150405",
    departamento: "LORETO",
    provincia: "REQUENA",
    distrito: "MAQUIA",
  },
  {
    id: "150406",
    codigo: "150406",
    departamento: "LORETO",
    provincia: "REQUENA",
    distrito: "PUJNAHUA",
  },
  {
    id: "150407",
    codigo: "150407",
    departamento: "LORETO",
    provincia: "REQUENA",
    distrito: "SAQUENA",
  },
  {
    id: "150408",
    codigo: "150408",
    departamento: "LORETO",
    provincia: "REQUENA",
    distrito: "SOPLIN",
  },
  {
    id: "150409",
    codigo: "150409",
    departamento: "LORETO",
    provincia: "REQUENA",
    distrito: "TAPIICHE",
  },
  {
    id: "150410",
    codigo: "150410",
    departamento: "LORETO",
    provincia: "REQUENA",
    distrito: "JENARO HERRERA",
  },
  {
    id: "150411",
    codigo: "150411",
    departamento: "LORETO",
    provincia: "REQUENA",
    distrito: "YAQUERANA",
  },
  {
    id: "150501",
    codigo: "150501",
    departamento: "LORETO",
    provincia: "UCAYALI",
    distrito: "CONTAMANA",
  },
  {
    id: "150502",
    codigo: "150502",
    departamento: "LORETO",
    provincia: "UCAYALI",
    distrito: "VARGAS GUERRA",
  },
  {
    id: "150503",
    codigo: "150503",
    departamento: "LORETO",
    provincia: "UCAYALI",
    distrito: "PADRE MARQUEZ",
  },
  {
    id: "150504",
    codigo: "150504",
    departamento: "LORETO",
    provincia: "UCAYALI",
    distrito: "PAMPA HERMOSA",
  },
  {
    id: "150505",
    codigo: "150505",
    departamento: "LORETO",
    provincia: "UCAYALI",
    distrito: "SARAYACU",
  },
  {
    id: "150506",
    codigo: "150506",
    departamento: "LORETO",
    provincia: "UCAYALI",
    distrito: "INAHUAYA",
  },
  {
    id: "150601",
    codigo: "150601",
    departamento: "LORETO",
    provincia: "MARISCAL RAMON CASTILLA",
    distrito: "RAMON CASTILLA",
  },
  {
    id: "150602",
    codigo: "150602",
    departamento: "LORETO",
    provincia: "MARISCAL RAMON CASTILLA",
    distrito: "PEBAS",
  },
  {
    id: "150603",
    codigo: "150603",
    departamento: "LORETO",
    provincia: "MARISCAL RAMON CASTILLA",
    distrito: "YAVARI",
  },
  {
    id: "150604",
    codigo: "150604",
    departamento: "LORETO",
    provincia: "MARISCAL RAMON CASTILLA",
    distrito: "SAN PABLO",
  },
  {
    id: "150701",
    codigo: "150701",
    departamento: "LORETO",
    provincia: "DATEM DEL MARAÑON",
    distrito: "BARRANCA",
  },
  {
    id: "150702",
    codigo: "150702",
    departamento: "LORETO",
    provincia: "DATEM DEL MARAÑON",
    distrito: "ANDOAS",
  },
  {
    id: "150703",
    codigo: "150703",
    departamento: "LORETO",
    provincia: "DATEM DEL MARAÑON",
    distrito: "CAHUAPANAS",
  },
  {
    id: "150704",
    codigo: "150704",
    departamento: "LORETO",
    provincia: "DATEM DEL MARAÑON",
    distrito: "MANSERICHE",
  },
  {
    id: "150705",
    codigo: "150705",
    departamento: "LORETO",
    provincia: "DATEM DEL MARAÑON",
    distrito: "MORONA",
  },
  {
    id: "150706",
    codigo: "150706",
    departamento: "LORETO",
    provincia: "DATEM DEL MARAÑON",
    distrito: "PASTAZA",
  },
  {
    id: "150901",
    codigo: "150901",
    departamento: "LORETO",
    provincia: "PUTUMAYO",
    distrito: "PUTUMAYO",
  },
  {
    id: "150902",
    codigo: "150902",
    departamento: "LORETO",
    provincia: "PUTUMAYO",
    distrito: "ROSA PANDURO",
  },
  {
    id: "150903",
    codigo: "150903",
    departamento: "LORETO",
    provincia: "PUTUMAYO",
    distrito: "TENIENTE MANUEL CLAVERO",
  },
  {
    id: "150904",
    codigo: "150904",
    departamento: "LORETO",
    provincia: "PUTUMAYO",
    distrito: "YAGUAS",
  },
  {
    id: "160101",
    codigo: "160101",
    departamento: "MADRE DE DIOS",
    provincia: "TAMBOPATA",
    distrito: "TAMBOPATA",
  },
  {
    id: "160102",
    codigo: "160102",
    departamento: "MADRE DE DIOS",
    provincia: "TAMBOPATA",
    distrito: "INAMBARI",
  },
  {
    id: "160103",
    codigo: "160103",
    departamento: "MADRE DE DIOS",
    provincia: "TAMBOPATA",
    distrito: "LAS PIEDRAS",
  },
  {
    id: "160104",
    codigo: "160104",
    departamento: "MADRE DE DIOS",
    provincia: "TAMBOPATA",
    distrito: "LABERINTO",
  },
  {
    id: "160201",
    codigo: "160201",
    departamento: "MADRE DE DIOS",
    provincia: "MANU",
    distrito: "MANU",
  },
  {
    id: "160202",
    codigo: "160202",
    departamento: "MADRE DE DIOS",
    provincia: "MANU",
    distrito: "FITZCARRALD",
  },
  {
    id: "160203",
    codigo: "160203",
    departamento: "MADRE DE DIOS",
    provincia: "MANU",
    distrito: "MADRE DE DIOS",
  },
  {
    id: "160204",
    codigo: "160204",
    departamento: "MADRE DE DIOS",
    provincia: "MANU",
    distrito: "HUEPETUHE",
  },
  {
    id: "160301",
    codigo: "160301",
    departamento: "MADRE DE DIOS",
    provincia: "TAHUAMANU",
    distrito: "ÍÑAPARI",
  },
  {
    id: "160302",
    codigo: "160302",
    departamento: "MADRE DE DIOS",
    provincia: "TAHUAMANU",
    distrito: "IBERIA",
  },
  {
    id: "160303",
    codigo: "160303",
    departamento: "MADRE DE DIOS",
    provincia: "TAHUAMANU",
    distrito: "TAHUAMANU",
  },
  {
    id: "170101",
    codigo: "170101",
    departamento: "MOQUEGUA",
    provincia: "MARISCAL NIETO",
    distrito: "MOQUEGUA",
  },
  {
    id: "170102",
    codigo: "170102",
    departamento: "MOQUEGUA",
    provincia: "MARISCAL NIETO",
    distrito: "CARUMAS",
  },

  {
    id: "170104",
    codigo: "170104",
    departamento: "MOQUEGUA",
    provincia: "MARISCAL NIETO",
    distrito: "SAN CRISTOBAL",
  },
  {
    id: "170105",
    codigo: "170105",
    departamento: "MOQUEGUA",
    provincia: "MARISCAL NIETO",
    distrito: "TORATA",
  },
  {
    id: "170106",
    codigo: "170106",
    departamento: "MOQUEGUA",
    provincia: "MARISCAL NIETO",
    distrito: "SAMEGUA",
  },
  {
    id: "170201",
    codigo: "170201",
    departamento: "MOQUEGUA",
    provincia: "GENERAL SANCHEZ CERRO",
    distrito: "OMATE",
  },

  {
    id: "170202",
    codigo: "170202",
    departamento: "MOQUEGUA",
    provincia: "GENERAL SANCHEZ CERRO",
    distrito: "COALAQUE",
  },
  {
    id: "170203",
    codigo: "170203",
    departamento: "MOQUEGUA",
    provincia: "GENERAL SANCHEZ CERRO",
    distrito: "CHOJATA",
  },
  {
    id: "170204",
    codigo: "170204",
    departamento: "MOQUEGUA",
    provincia: "GENERAL SANCHEZ CERRO",
    distrito: "ICHUÑA",
  },
  {
    id: "170205",
    codigo: "170205",
    departamento: "MOQUEGUA",
    provincia: "GENERAL SANCHEZ CERRO",
    distrito: "LA CAPILLA",
  },
  {
    id: "170206",
    codigo: "170206",
    departamento: "MOQUEGUA",
    provincia: "GENERAL SANCHEZ CERRO",
    distrito: "LLOQUE",
  },
  {
    id: "170207",
    codigo: "170207",
    departamento: "MOQUEGUA",
    provincia: "GENERAL SANCHEZ CERRO",
    distrito: "MATALAQUE",
  },
  {
    id: "170208",
    codigo: "170208",
    departamento: "MOQUEGUA",
    provincia: "GENERAL SANCHEZ CERRO",
    distrito: "PUQUINA",
  },
  {
    id: "170209",
    codigo: "170209",
    departamento: "MOQUEGUA",
    provincia: "GENERAL SANCHEZ CERRO",
    distrito: "QUINISTAQUILLAS",
  },
  {
    id: "170210",
    codigo: "170210",
    departamento: "MOQUEGUA",
    provincia: "GENERAL SANCHEZ CERRO",
    distrito: "UBINAS",
  },
  {
    id: "170211",
    codigo: "170211",
    departamento: "MOQUEGUA",
    provincia: "GENERAL SANCHEZ CERRO",
    distrito: "YUNGA",
  },
  {
    id: "170301",
    codigo: "170301",
    departamento: "MOQUEGUA",
    provincia: "ILO",
    distrito: "ILO",
  },
  {
    id: "170302",
    codigo: "170302",
    departamento: "MOQUEGUA",
    provincia: "ILO",
    distrito: "EL ALGARROBAL",
  },
  {
    id: "170303",
    codigo: "170303",
    departamento: "MOQUEGUA",
    provincia: "ILO",
    distrito: "PACOCHA",
  },
  {
    id: "180101",
    codigo: "180101",
    departamento: "PASCO",
    provincia: "PASCO",
    distrito: "CHAUFIMARCA",
  },
  {
    id: "180103",
    codigo: "180103",
    departamento: "PASCO",
    provincia: "PASCO",
    distrito: "HUACHON",
  },
  {
    id: "180104",
    codigo: "180104",
    departamento: "PASCO",
    provincia: "PASCO",
    distrito: "HUARIACA",
  },
  {
    id: "180105",
    codigo: "180105",
    departamento: "PASCO",
    provincia: "PASCO",
    distrito: "HUAYLLAY",
  },
  {
    id: "180106",
    codigo: "180106",
    departamento: "PASCO",
    provincia: "PASCO",
    distrito: "NINACACA",
  },
  {
    id: "180107",
    codigo: "180107",
    departamento: "PASCO",
    provincia: "PASCO",
    distrito: "PALLANCHACRA",
  },
  {
    id: "180108",
    codigo: "180108",
    departamento: "PASCO",
    provincia: "PASCO",
    distrito: "PAUCARTAMBO",
  },
  {
    id: "180109",
    codigo: "180109",
    departamento: "PASCO",
    provincia: "PASCO",
    distrito: "SAN FCO DE ASIS DE YARUSYACAN",
  },
  {
    id: "180110",
    codigo: "180110",
    departamento: "PASCO",
    provincia: "PASCO",
    distrito: "SIMON BOLIVAR",
  },
  {
    id: "180111",
    codigo: "180111",
    departamento: "PASCO",
    provincia: "PASCO",
    distrito: "TICLACAYAN",
  },
  {
    id: "180112",
    codigo: "180112",
    departamento: "PASCO",
    provincia: "PASCO",
    distrito: "TINYAHUARCO",
  },
  {
    id: "180113",
    codigo: "180113",
    departamento: "PASCO",
    provincia: "PASCO",
    distrito: "VICCO",
  },
  {
    id: "180114",
    codigo: "180114",
    departamento: "PASCO",
    provincia: "PASCO",
    distrito: "YANACANCHA",
  },
  {
    id: "180201",
    codigo: "180201",
    departamento: "PASCO",
    provincia: "DANIEL CARRION",
    distrito: "YANAHUANCA",
  },
  {
    id: "180202",
    codigo: "180202",
    departamento: "PASCO",
    provincia: "DANIEL CARRION",
    distrito: "CHACAYAN",
  },
  {
    id: "180203",
    codigo: "180203",
    departamento: "PASCO",
    provincia: "DANIEL CARRION",
    distrito: "GOYLLARISQUIZGA",
  },
  {
    id: "180204",
    codigo: "180204",
    departamento: "PASCO",
    provincia: "DANIEL CARRION",
    distrito: "PAUCAR",
  },
  {
    id: "180205",
    codigo: "180205",
    departamento: "PASCO",
    provincia: "DANIEL CARRION",
    distrito: "SAN PEDRO DE PILLAO",
  },
  {
    id: "180206",
    codigo: "180206",
    departamento: "PASCO",
    provincia: "DANIEL CARRION",
    distrito: "SANTA ANA DE TUSI",
  },
  {
    id: "180207",
    codigo: "180207",
    departamento: "PASCO",
    provincia: "DANIEL CARRION",
    distrito: "TAPUC",
  },
  {
    id: "180208",
    codigo: "180208",
    departamento: "PASCO",
    provincia: "DANIEL CARRION",
    distrito: "VILCABAMBA",
  },
  {
    id: "180301",
    codigo: "180301",
    departamento: "PASCO",
    provincia: "OXAPAMPA",
    distrito: "OXAPAMPA",
  },
  {
    id: "180302",
    codigo: "180302",
    departamento: "PASCO",
    provincia: "OXAPAMPA",
    distrito: "CHONTABAMBA",
  },
  {
    id: "180303",
    codigo: "180303",
    departamento: "PASCO",
    provincia: "OXAPAMPA",
    distrito: "HUANCABAMBA",
  },
  {
    id: "180304",
    codigo: "180304",
    departamento: "PASCO",
    provincia: "OXAPAMPA",
    distrito: "PUERTO BERMUDEZ",
  },
  {
    id: "180305",
    codigo: "180305",
    departamento: "PASCO",
    provincia: "OXAPAMPA",
    distrito: "VILLA RICA",
  },
  {
    id: "180306",
    codigo: "180306",
    departamento: "PASCO",
    provincia: "OXAPAMPA",
    distrito: "POZUZO",
  },
  {
    id: "180307",
    codigo: "180307",
    departamento: "PASCO",
    provincia: "OXAPAMPA",
    distrito: " PALCAZU",
  },
  {
    id: "180308",
    codigo: "180308",
    departamento: "PASCO",
    provincia: "OXAPAMPA",
    distrito: "CONSTITUCION",
  },
  {
    id: "190101",
    codigo: "190101",
    departamento: "PIURA",
    provincia: "PIURA",
    distrito: "PIURA",
  },
  {
    id: "190103",
    codigo: "190103",
    departamento: "PIURA",
    provincia: "PIURA",
    distrito: "CASTILLA",
  },
  {
    id: "190104",
    codigo: "190104",
    departamento: "PIURA",
    provincia: "PIURA",
    distrito: "CATACAOS",
  },
  {
    id: "190105",
    codigo: "190105",
    departamento: "PIURA",
    provincia: "PIURA",
    distrito: "LA ARENA",
  },
  {
    id: "190106",
    codigo: "190106",
    departamento: "PIURA",
    provincia: "PIURA",
    distrito: "LA UNION",
  },
  {
    id: "190107",
    codigo: "190107",
    departamento: "PIURA",
    provincia: "PIURA",
    distrito: "LAS LOMAS",
  },
  {
    id: "190109",
    codigo: "190109",
    departamento: "PIURA",
    provincia: "PIURA",
    distrito: "TAMBO GRANDE",
  },
  {
    id: "190113",
    codigo: "190113",
    departamento: "PIURA",
    provincia: "PIURA",
    distrito: "CURA MORI",
  },
  {
    id: "190114",
    codigo: "190114",
    departamento: "PIURA",
    provincia: "PIURA",
    distrito: "EL TALLAN",
  },
  {
    id: "190115",
    codigo: "190115",
    departamento: "PIURA",
    provincia: "PIURA",
    distrito: "VEINTISEIS DE OCTUBRE",
  },
  {
    id: "190201",
    codigo: "190201",
    departamento: "PIURA",
    provincia: "AYABACA",
    distrito: "AYABACA",
  },
  {
    id: "190202",
    codigo: "190202",
    departamento: "PIURA",
    provincia: "AYABACA",
    distrito: "FRIAS",
  },
  {
    id: "190203",
    codigo: "190203",
    departamento: "PIURA",
    provincia: "AYABACA",
    distrito: "LAGUNAS",
  },
  {
    id: "190204",
    codigo: "190204",
    departamento: "PIURA",
    provincia: "AYABACA",
    distrito: "MONTERO",
  },
  {
    id: "190205",
    codigo: "190205",
    departamento: "PIURA",
    provincia: "AYABACA",
    distrito: "PACAIPAMPA",
  },
  {
    id: "190206",
    codigo: "190206",
    departamento: "PIURA",
    provincia: "AYABACA",
    distrito: "SAPILLICA",
  },
  {
    id: "190207",
    codigo: "190207",
    departamento: "PIURA",
    provincia: "AYABACA",
    distrito: "SICCHEZ",
  },
  {
    id: "190208",
    codigo: "190208",
    departamento: "PIURA",
    provincia: "AYABACA",
    distrito: "SUYO",
  },
  {
    id: "190209",
    codigo: "190209",
    departamento: "PIURA",
    provincia: "AYABACA",
    distrito: "JILILI",
  },
  {
    id: "190210",
    codigo: "190210",
    departamento: "PIURA",
    provincia: "AYABACA",
    distrito: "PAIMAS",
  },
  {
    id: "190301",
    codigo: "190301",
    departamento: "PIURA",
    provincia: "HUANCABAMBA",
    distrito: "HUANCABAMBA",
  },
  {
    id: "190302",
    codigo: "190302",
    departamento: "PIURA",
    provincia: "HUANCABAMBA",
    distrito: "CANCHAQUE",
  },
  {
    id: "190303",
    codigo: "190303",
    departamento: "PIURA",
    provincia: "HUANCABAMBA",
    distrito: "HUARMACA",
  },
  {
    id: "190304",
    codigo: "190304",
    departamento: "PIURA",
    provincia: "HUANCABAMBA",
    distrito: "SONDOR",
  },
  {
    id: "190305",
    codigo: "190305",
    departamento: "PIURA",
    provincia: "HUANCABAMBA",
    distrito: "SONDORILLO",
  },
  {
    id: "190306",
    codigo: "190306",
    departamento: "PIURA",
    provincia: "HUANCABAMBA",
    distrito: "EL CARMEN DE LA FRONTERA",
  },
  {
    id: "190307",
    codigo: "190307",
    departamento: "PIURA",
    provincia: "HUANCABAMBA",
    distrito: "SAN MIGUEL DE EL FAIQUE",
  },
  {
    id: "190308",
    codigo: "190308",
    departamento: "PIURA",
    provincia: "HUANCABAMBA",
    distrito: "LALAQUIZ",
  },
  {
    id: "190401",
    codigo: "190401",
    departamento: "PIURA",
    provincia: "MORROPON",
    distrito: "CHULUCANAS",
  },
  {
    id: "190402",
    codigo: "190402",
    departamento: "PIURA",
    provincia: "MORROPON",
    distrito: "BUENOS AIRES",
  },
  {
    id: "190403",
    codigo: "190403",
    departamento: "PIURA",
    provincia: "MORROPON",
    distrito: "CHALACO",
  },
  {
    id: "190404",
    codigo: "190404",
    departamento: "PIURA",
    provincia: "MORROPON",
    distrito: "MORROPON",
  },
  {
    id: "190405",
    codigo: "190405",
    departamento: "PIURA",
    provincia: "MORROPON",
    distrito: "SALITRAL",
  },
  {
    id: "190406",
    codigo: "190406",
    departamento: "PIURA",
    provincia: "MORROPON",
    distrito: "SANTA CATALINA DE MOSSA",
  },
  {
    id: "190407",
    codigo: "190407",
    departamento: "PIURA",
    provincia: "MORROPON",
    distrito: "SANTO DOMINGO",
  },
  {
    id: "190408",
    codigo: "190408",
    departamento: "PIURA",
    provincia: "MORROPON",
    distrito: "LA MATANZA",
  },
  {
    id: "190409",
    codigo: "190409",
    departamento: "PIURA",
    provincia: "MORROPON",
    distrito: "YAMANGO",
  },
  {
    id: "190410",
    codigo: "190410",
    departamento: "PIURA",
    provincia: "MORROPON",
    distrito: "SAN JUAN DE BIGOTE",
  },
  {
    id: "190501",
    codigo: "190501",
    departamento: "PIURA",
    provincia: "PAITA",
    distrito: "PAITA",
  },
  {
    id: "190502",
    codigo: "190502",
    departamento: "PIURA",
    provincia: "PAITA",
    distrito: "AMOTAPE",
  },
  {
    id: "190503",
    codigo: "190503",
    departamento: "PIURA",
    provincia: "PAITA",
    distrito: "ARENAL",
  },
  {
    id: "190504",
    codigo: "190504",
    departamento: "PIURA",
    provincia: "PAITA",
    distrito: "LA HUACA",
  },
  {
    id: "190505",
    codigo: "190505",
    departamento: "PIURA",
    provincia: "PAITA",
    distrito: "COLAN",
  },
  {
    id: "190506",
    codigo: "190506",
    departamento: "PIURA",
    provincia: "PAITA",
    distrito: "TAMARINDO",
  },
  {
    id: "190507",
    codigo: "190507",
    departamento: "PIURA",
    provincia: "PAITA",
    distrito: "VICHAYAL",
  },
  {
    id: "190601",
    codigo: "190601",
    departamento: "PIURA",
    provincia: "SULLANA",
    distrito: "SULLANA",
  },
  {
    id: "190602",
    codigo: "190602",
    departamento: "PIURA",
    provincia: "SULLANA",
    distrito: "BELLAVISTA",
  },
  {
    id: "190603",
    codigo: "190603",
    departamento: "PIURA",
    provincia: "SULLANA",
    distrito: "LANCONES",
  },
  {
    id: "190604",
    codigo: "190604",
    departamento: "PIURA",
    provincia: "SULLANA",
    distrito: "MARCAVELLCA",
  },
  {
    id: "190605",
    codigo: "190605",
    departamento: "PIURA",
    provincia: "SULLANA",
    distrito: "MIGUEL CHECA",
  },
  {
    id: "190606",
    codigo: "190606",
    departamento: "PIURA",
    provincia: "SULLANA",
    distrito: "QUERECOTILLO",
  },

  {
    id: "190607",
    codigo: "190607",
    departamento: "PIURA",
    provincia: "SULLANA",
    distrito: "SALITRAL",
  },
  {
    id: "190608",
    codigo: "190608",
    departamento: "PIURA",
    provincia: "SULLANA",
    distrito: "IGNACIO ESCUDERO",
  },
  {
    id: "190701",
    codigo: "190701",
    departamento: "PIURA",
    provincia: "TALARA",
    distrito: "PARIÑAS",
  },
  {
    id: "190702",
    codigo: "190702",
    departamento: "PIURA",
    provincia: "TALARA",
    distrito: "EL ALTO",
  },
  {
    id: "190703",
    codigo: "190703",
    departamento: "PIURA",
    provincia: "TALARA",
    distrito: "LA BREA",
  },
  {
    id: "190704",
    codigo: "190704",
    departamento: "PIURA",
    provincia: "TALARA",
    distrito: "LOBITOS",
  },
  {
    id: "190705",
    codigo: "190705",
    departamento: "PIURA",
    provincia: "TALARA",
    distrito: "MANCORA",
  },
  {
    id: "190706",
    codigo: "190706",
    departamento: "PIURA",
    provincia: "TALARA",
    distrito: "LOS ORGANOS",
  },
  {
    id: "190801",
    codigo: "190801",
    departamento: "PIURA",
    provincia: "SECHURA",
    distrito: "SECHURA",
  },
  {
    id: "190802",
    codigo: "190802",
    departamento: "PIURA",
    provincia: "SECHURA",
    distrito: "VICE",
  },
  {
    id: "190803",
    codigo: "190803",
    departamento: "PIURA",
    provincia: "SECHURA",
    distrito: "BERNAL",
  },
  {
    id: "190804",
    codigo: "190804",
    departamento: "PIURA",
    provincia: "SECHURA",
    distrito: "BELLAVISTA DE LA UNION",
  },
  {
    id: "190805",
    codigo: "190805",
    departamento: "PIURA",
    provincia: "SECHURA",
    distrito: "CRISTO NOS VALGA",
  },
  {
    id: "190806",
    codigo: "190806",
    departamento: "PIURA",
    provincia: "SECHURA",
    distrito: "RINCONADA-LUCUAR",
  },
  {
    id: "200101",
    codigo: "200101",
    departamento: "PUNO",
    provincia: "PUNO",
    distrito: "PUNO",
  },
  {
    id: "200102",
    codigo: "200102",
    departamento: "PUNO",
    provincia: "PUNO",
    distrito: "ACORA",
  },
  {
    id: "200103",
    codigo: "200103",
    departamento: "PUNO",
    provincia: "PUNO",
    distrito: "ATUNCOLLA",
  },
  {
    id: "200104",
    codigo: "200104",
    departamento: "PUNO",
    provincia: "PUNO",
    distrito: "CAPACHICA",
  },
  {
    id: "200105",
    codigo: "200105",
    departamento: "PUNO",
    provincia: "PUNO",
    distrito: "COATA",
  },
  {
    id: "200106",
    codigo: "200106",
    departamento: "PUNO",
    provincia: "PUNO",
    distrito: "CHUCUITO",
  },
  {
    id: "200107",
    codigo: "200107",
    departamento: "PUNO",
    provincia: "PUNO",
    distrito: "HUATA",
  },
  {
    id: "200108",
    codigo: "200108",
    departamento: "PUNO",
    provincia: "PUNO",
    distrito: "MAÑAZO",
  },
  {
    id: "200109",
    codigo: "200109",
    departamento: "PUNO",
    provincia: "PUNO",
    distrito: "PAUCARCOLLA",
  },
  {
    id: "200110",
    codigo: "200110",
    departamento: "PUNO",
    provincia: "PUNO",
    distrito: "PICHACANI",
  },
  {
    id: "200111",
    codigo: "200111",
    departamento: "PUNO",
    provincia: "PUNO",
    distrito: "SAN ANTONIO",
  },
  {
    id: "200112",
    codigo: "200112",
    departamento: "PUNO",
    provincia: "PUNO",
    distrito: "TIQUILLACA",
  },
  {
    id: "200113",
    codigo: "200113",
    departamento: "PUNO",
    provincia: "PUNO",
    distrito: "VILQUE",
  },
  {
    id: "200114",
    codigo: "200114",
    departamento: "PUNO",
    provincia: "PUNO",
    distrito: "PLATERIA",
  },
  {
    id: "200115",
    codigo: "200115",
    departamento: "PUNO",
    provincia: "PUNO",
    distrito: "AMANTANI",
  },
  {
    id: "200201",
    codigo: "200201",
    departamento: "PUNO",
    provincia: "AZANGARO",
    distrito: "AZANGARO",
  },
  {
    id: "200202",
    codigo: "200202",
    departamento: "PUNO",
    provincia: "AZANGARO",
    distrito: "ACHAYA",
  },
  {
    id: "200203",
    codigo: "200203",
    departamento: "PUNO",
    provincia: "AZANGARO",
    distrito: "ARAPA",
  },
  {
    id: "200204",
    codigo: "200204",
    departamento: "PUNO",
    provincia: "AZANGARO",
    distrito: "ASILLO",
  },
  {
    id: "200205",
    codigo: "200205",
    departamento: "PUNO",
    provincia: "AZANGARO",
    distrito: "CAMINACA",
  },
  {
    id: "200206",
    codigo: "200206",
    departamento: "PUNO",
    provincia: "AZANGARO",
    distrito: "CHUPA",
  },
  {
    id: "200207",
    codigo: "200207",
    departamento: "PUNO",
    provincia: "AZANGARO",
    distrito: "JOSE DOMINGO CHOQUERIANCA",
  },
  {
    id: "200208",
    codigo: "200208",
    departamento: "PUNO",
    provincia: "AZANGARO",
    distrito: "MUÑANI",
  },
  {
    id: "200210",
    codigo: "200210",
    departamento: "PUNO",
    provincia: "AZANGARO",
    distrito: "POTONI",
  },
  {
    id: "200212",
    codigo: "200212",
    departamento: "PUNO",
    provincia: "AZANGARO",
    distrito: "SAMAN",
  },
  {
    id: "200213",
    codigo: "200213",
    departamento: "PUNO",
    provincia: "AZANGARO",
    distrito: "SAN ANTON",
  },
  {
    id: "200214",
    codigo: "200214",
    departamento: "PUNO",
    provincia: "AZANGARO",
    distrito: "SAN JOSE",
  },
  {
    id: "200215",
    codigo: "200215",
    departamento: "PUNO",
    provincia: "AZANGARO",
    distrito: "SAN JUAN DE SALINAS",
  },
  {
    id: "200216",
    codigo: "200216",
    departamento: "PUNO",
    provincia: "AZANGARO",
    distrito: "SANTIAGO DE PUPUJA",
  },
  {
    id: "200217",
    codigo: "200217",
    departamento: "PUNO",
    provincia: "AZANGARO",
    distrito: "TIRAPATA",
  },
  {
    id: "200301",
    codigo: "200301",
    departamento: "PUNO",
    provincia: "CARABAYA",
    distrito: "MACUSANI",
  },
  {
    id: "200302",
    codigo: "200302",
    departamento: "PUNO",
    provincia: "CARABAYA",
    distrito: "AJOYANI",
  },
  {
    id: "200303",
    codigo: "200303",
    departamento: "PUNO",
    provincia: "CARABAYA",
    distrito: "AYAPATA",
  },
  {
    id: "200304",
    codigo: "200304",
    departamento: "PUNO",
    provincia: "CARabaya",
    distrito: "COASA",
  },
  {
    id: "200305",
    codigo: "200305",
    departamento: "PUNO",
    provincia: "CARABAYA",
    distrito: "CORANI",
  },
  {
    id: "200306",
    codigo: "200306",
    departamento: "PUNO",
    provincia: "CARABAYA",
    distrito: "CRUCERO",
  },
  {
    id: "200307",
    codigo: "200307",
    departamento: "PUNO",
    provincia: "CARABAYA",
    distrito: "ITUATA",
  },
  {
    id: "200308",
    codigo: "200308",
    departamento: "PUNO",
    provincia: "CARABAYA",
    distrito: "OLLACHEA",
  },
  {
    id: "200309",
    codigo: "200309",
    departamento: "PUNO",
    provincia: "CARABAYA",
    distrito: "SAN GABAN",
  },
  {
    id: "200310",
    codigo: "200310",
    departamento: "PUNO",
    provincia: "CARABAYA",
    distrito: "USICAYOS",
  },
  {
    id: "200401",
    codigo: "200401",
    departamento: "PUNO",
    provincia: "CHUCUITO",
    distrito: "JULI",
  },
  {
    id: "200402",
    codigo: "200402",
    departamento: "PUNO",
    provincia: "CHUCUITO",
    distrito: "DESAGUADERO",
  },
  {
    id: "200403",
    codigo: "200403",
    departamento: "PUNO",
    provincia: "CHUCUITO",
    distrito: "HUACULLANI",
  },
  {
    id: "200406",
    codigo: "200406",
    departamento: "PUNO",
    provincia: "CHUCUITO",
    distrito: "PISACOMA",
  },
  {
    id: "200407",
    codigo: "200407",
    departamento: "PUNO",
    provincia: "CHUCUITO",
    distrito: "POMATA",
  },
  {
    id: "200410",
    codigo: "200410",
    departamento: "PUNO",
    provincia: "CHUCUITO",
    distrito: "ZEPITA",
  },
  {
    id: "200412",
    codigo: "200412",
    departamento: "PUNO",
    provincia: "CHUCUITO",
    distrito: "KELLUVO",
  },
  {
    id: "200501",
    codigo: "200501",
    departamento: "PUNO",
    provincia: "HUANCANE",
    distrito: "HUANCANE",
  },
  {
    id: "200502",
    codigo: "200502",
    departamento: "PUNO",
    provincia: "HUANCANE",
    distrito: "COJATA",
  },
  {
    id: "200504",
    codigo: "200504",
    departamento: "PUNO",
    provincia: "HUANCANE",
    distrito: "INCHUPALLA",
  },
  {
    id: "200506",
    codigo: "200506",
    departamento: "PUNO",
    provincia: "HUANCANE",
    distrito: "PUSI",
  },
  {
    id: "200507",
    codigo: "200507",
    departamento: "PUNO",
    provincia: "HUANCANE",
    distrito: "ROSASPATA",
  },
  {
    id: "200508",
    codigo: "200508",
    departamento: "PUNO",
    provincia: "HUANCANE",
    distrito: "TARACO",
  },
  {
    id: "200509",
    codigo: "200509",
    departamento: "PUNO",
    provincia: "HUANCANE",
    distrito: "VILQUE CHICO",
  },
  {
    id: "200511",
    codigo: "200511",
    departamento: "PUNO",
    provincia: "HUANCANE",
    distrito: "HUATASANI",
  },
  {
    id: "200601",
    codigo: "200601",
    departamento: "PUNO",
    provincia: "LAMPA",
    distrito: "LAMPA",
  },
  {
    id: "200602",
    codigo: "200602",
    departamento: "PUNO",
    provincia: "LAMPA",
    distrito: "CABANILLA",
  },
  {
    id: "200603",
    codigo: "200603",
    departamento: "PUNO",
    provincia: "LAMPA",
    distrito: "CALAPUJA",
  },
  {
    id: "200604",
    codigo: "200604",
    departamento: "PUNO",
    provincia: "LAMPA",
    distrito: "NICASIO",
  },
  {
    id: "200605",
    codigo: "200605",
    departamento: "PUNO",
    provincia: "LAMPA",
    distrito: "OCUVIRI",
  },
  {
    id: "200606",
    codigo: "200606",
    departamento: "PUNO",
    provincia: "LAMPA",
    distrito: "PALCA",
  },
  {
    id: "200607",
    codigo: "200607",
    departamento: "PUNO",
    provincia: "LAMPA",
    distrito: "PARATIA",
  },
  {
    id: "200608",
    codigo: "200608",
    departamento: "PUNO",
    provincia: "LAMPA",
    distrito: "PUCARA",
  },
  {
    id: "200609",
    codigo: "200609",
    departamento: "PUNO",
    provincia: "LAMPA",
    distrito: "SANTA LUCIA",
  },
  {
    id: "200610",
    codigo: "200610",
    departamento: "PUNO",
    provincia: "LAMPA",
    distrito: "VILAVILA",
  },
  {
    id: "200701",
    codigo: "200701",
    departamento: "PUNO",
    provincia: "MELGAR",
    distrito: "AYAVIRI",
  },
  {
    id: "200702",
    codigo: "200702",
    departamento: "PUNO",
    provincia: "MELGAR",
    distrito: "ANTAUTA",
  },
  {
    id: "200703",
    codigo: "200703",
    departamento: "PUNO",
    provincia: "MELGAR",
    distrito: "CUPI",
  },
  {
    id: "200704",
    codigo: "200704",
    departamento: "PUNO",
    provincia: "MELGAR",
    distrito: "LLALLI",
  },
  {
    id: "200705",
    codigo: "200705",
    departamento: "PUNO",
    provincia: "MELGAR",
    distrito: "MACARI",
  },
  {
    id: "200706",
    codigo: "200706",
    departamento: "PUNO",
    provincia: "MELGAR",
    distrito: "NUÑOA",
  },
  {
    id: "200707",
    codigo: "200707",
    departamento: "PUNO",
    provincia: "MELGAR",
    distrito: "ORURILLO",
  },
  {
    id: "200708",
    codigo: "200708",
    departamento: "PUNO",
    provincia: "MELGAR",
    distrito: "SANTA ROSA",
  },
  {
    id: "200709",
    codigo: "200709",
    departamento: "PUNO",
    provincia: "MELGAR",
    distrito: "UMACHIRI",
  },
  {
    id: "200801",
    codigo: "200801",
    departamento: "PUNO",
    provincia: "SANDIA",
    distrito: "SANDIA",
  },
  {
    id: "200803",
    codigo: "200803",
    departamento: "PUNO",
    provincia: "SANDIA",
    distrito: "CUVOCUVO",
  },
  {
    id: "200804",
    codigo: "200804",
    departamento: "PUNO",
    provincia: "SANDIA",
    distrito: "LIMBANI",
  },
  {
    id: "200805",
    codigo: "200805",
    departamento: "PUNO",
    provincia: "SANDIA",
    distrito: "PHARA",
  },
  {
    id: "200806",
    codigo: "200806",
    departamento: "PUNO",
    provincia: "SANDIA",
    distrito: "PATAMBUCO",
  },
  {
    id: "200807",
    codigo: "200807",
    departamento: "PUNO",
    provincia: "SANDIA",
    distrito: "QUACA",
  },
  {
    id: "200808",
    codigo: "200808",
    departamento: "PUNO",
    provincia: "SANDIA",
    distrito: "SAN JUAN DEL ORO",
  },
  {
    id: "200810",
    codigo: "200810",
    departamento: "PUNO",
    provincia: "SANDIA",
    distrito: "YANAHUAYA",
  },
  {
    id: "200811",
    codigo: "200811",
    departamento: "PUNO",
    provincia: "SANDIA",
    distrito: "ALTO INAMBARI",
  },
  {
    id: "200812",
    codigo: "200812",
    departamento: "PUNO",
    provincia: "SANDIA",
    distrito: "SAN PEDRO DE PUTINA PUNCO",
  },
  {
    id: "200901",
    codigo: "200901",
    departamento: "PUNO",
    provincia: "SAN ROMAN",
    distrito: "JULIACA",
  },
  {
    id: "200902",
    codigo: "200902",
    departamento: "PUNO",
    provincia: "SAN ROMAN",
    distrito: "CABANA",
  },
  {
    id: "200903",
    codigo: "200903",
    departamento: "PUNO",
    provincia: "SAN ROMAN",
    distrito: "CABANILLAS",
  },
  {
    id: "200905",
    codigo: "200905",
    departamento: "PUNO",
    provincia: "SAN ROMAN",
    distrito: "SAN MIGUEL",
  },
  {
    id: "201001",
    codigo: "201001",
    departamento: "PUNO",
    provincia: "YUNGUYO",
    distrito: "YUNGUYO",
  },
  {
    id: "201002",
    codigo: "201002",
    departamento: "PUNO",
    provincia: "YUNGUYO",
    distrito: "UNICACHI",
  },
  {
    id: "201003",
    codigo: "201003",
    departamento: "PUNO",
    provincia: "YUNGUYO",
    distrito: "ANAPIA",
  },
  {
    id: "201004",
    codigo: "201004",
    departamento: "PUNO",
    provincia: "YUNGUYO",
    distrito: "COPANI",
  },
  {
    id: "201005",
    codigo: "201005",
    departamento: "PUNO",
    provincia: "YUNGUYO",
    distrito: "CUTURAPI",
  },
  {
    id: "201006",
    codigo: "201006",
    departamento: "PUNO",
    provincia: "YUNGUYO",
    distrito: "OLLARAYA",
  },
  {
    id: "201007",
    codigo: "201007",
    departamento: "PUNO",
    provincia: "YUNGUYO",
    distrito: "TINICACHI",
  },
  {
    id: "201101",
    codigo: "201101",
    departamento: "PUNO",
    provincia: "SAN ANTONIO DE PUTINA",
    distrito: "PUTINA",
  },
  {
    id: "201102",
    codigo: "201102",
    departamento: "PUNO",
    provincia: "SAN ANTONIO DE PUTINA",
    distrito: "PEDRO VILCA APAZA",
  },
  {
    id: "201103",
    codigo: "201103",
    departamento: "PUNO",
    provincia: "SAN ANTONIO DE PUTINA",
    distrito: "QUILCAPUNCU",
  },
  {
    id: "201104",
    codigo: "201104",
    departamento: "PUNO",
    provincia: "SAN ANTONIO DE PUTINA",
    distrito: "ANANEA",
  },
  {
    id: "201105",
    codigo: "201105",
    departamento: "PUNO",
    provincia: "SAN ANTONIO DE PUTINA",
    distrito: "SINA",
  },
  {
    id: "201201",
    codigo: "201201",
    departamento: "PUNO",
    provincia: "EL COLLAO",
    distrito: "LLAVE",
  },
  {
    id: "201202",
    codigo: "201202",
    departamento: "PUNO",
    provincia: "EL COLLAO",
    distrito: "PILCUYO",
  },
  {
    id: "201203",
    codigo: "201203",
    departamento: "PUNO",
    provincia: "EL COLLAO",
    distrito: "SANTA ROSA",
  },
  {
    id: "201204",
    codigo: "201204",
    departamento: "PUNO",
    provincia: "EL COLLAO",
    distrito: "CAPASO",
  },
  {
    id: "201205",
    codigo: "201205",
    departamento: "PUNO",
    provincia: "EL COLLAO",
    distrito: "CONDURIRI",
  },
  {
    id: "201301",
    codigo: "201301",
    departamento: "PUNO",
    provincia: "MOHO",
    distrito: "MOHO",
  },
  {
    id: "201302",
    codigo: "201302",
    departamento: "PUNO",
    provincia: "MOHO",
    distrito: "CONIMA",
  },
  {
    id: "201303",
    codigo: "201303",
    departamento: "PUNO",
    provincia: "MOHO",
    distrito: "TILALI",
  },
  {
    id: "201304",
    codigo: "201304",
    departamento: "PUNO",
    provincia: "MOHO",
    distrito: "HUAYRAPATA",
  },
  {
    id: "210101",
    codigo: "210101",
    departamento: "SAN MARTIN",
    provincia: "MOYOBAMBA",
    distrito: "MOYOBAMBA",
  },
  {
    id: "210102",
    codigo: "210102",
    departamento: "SAN MARTIN",
    provincia: "MOYOBAMBA",
    distrito: "CALZADA",
  },
  {
    id: "210103",
    codigo: "210103",
    departamento: "SAN MARTIN",
    provincia: "MOYOBAMBA",
    distrito: "HABANA",
  },
  {
    id: "210104",
    codigo: "210104",
    departamento: "SAN MARTIN",
    provincia: "MOYOBAMBA",
    distrito: "JEPELACIO",
  },
  {
    id: "210105",
    codigo: "210105",
    departamento: "SAN MARTIN",
    provincia: "MOYOBAMBA",
    distrito: "SORITOR",
  },
  {
    id: "210106",
    codigo: "210106",
    departamento: "SAN MARTIN",
    provincia: "MOYOBAMBA",
    distrito: "YANTALO",
  },
  {
    id: "210201",
    codigo: "210201",
    departamento: "SAN MARTIN",
    provincia: "HUALLAGA",
    distrito: "SAPOSOA",
  },
  {
    id: "210202",
    codigo: "210202",
    departamento: "SAN MARTIN",
    provincia: "HUALLAGA",
    distrito: "PISCOVACU",
  },
  {
    id: "210203",
    codigo: "210203",
    departamento: "SAN MARTIN",
    provincia: "HUALLAGA",
    distrito: "SACANCHE",
  },
  {
    id: "210204",
    codigo: "210204",
    departamento: "SAN MARTIN",
    provincia: "HUALLAGA",
    distrito: "TINGO DE SAPOSOA",
  },
  {
    id: "210205",
    codigo: "210205",
    departamento: "SAN MARTIN",
    provincia: "HUALLAGA",
    distrito: "ALTO SAPOSOA",
  },
  {
    id: "210206",
    codigo: "210206",
    departamento: "SAN MARTIN",
    provincia: "HUALLAGA",
    distrito: "EL ESLABON",
  },
  {
    id: "210301",
    codigo: "210301",
    departamento: "SAN MARTIN",
    provincia: "LAMAS",
    distrito: "LAMAS",
  },
  {
    id: "210303",
    codigo: "210303",
    departamento: "SAN MARTIN",
    provincia: "LAMAS",
    distrito: "BARRANQUITA",
  },
  {
    id: "210304",
    codigo: "210304",
    departamento: "SAN MARTIN",
    provincia: "LAMAS",
    distrito: "CAYNARACHI",
  },
  {
    id: "210305",
    codigo: "210305",
    departamento: "SAN MARTIN",
    provincia: "LAMAS",
    distrito: "CUÑUMBUQUI",
  },
  {
    id: "210306",
    codigo: "210306",
    departamento: "SAN MARTIN",
    provincia: "LAMAS",
    distrito: "PINTO RECODO",
  },
  {
    id: "210307",
    codigo: "210307",
    departamento: "SAN MARTIN",
    provincia: "LAMAS",
    distrito: "RUMISAPA",
  },
  {
    id: "210311",
    codigo: "210311",
    departamento: "SAN MARTIN",
    provincia: "LAMAS",
    distrito: "SHANAO",
  },
  {
    id: "210313",
    codigo: "210313",
    departamento: "SAN MARTIN",
    provincia: "LAMAS",
    distrito: "TABALOSOS",
  },
  {
    id: "210314",
    codigo: "210314",
    departamento: "SAN MARTIN",
    provincia: "LAMAS",
    distrito: "ZAPATERO",
  },
  {
    id: "210315",
    codigo: "210315",
    departamento: "SAN MARTIN",
    provincia: "LAMAS",
    distrito: "ALONSO DE ALVARADO",
  },
  {
    id: "210316",
    codigo: "210316",
    departamento: "SAN MARTIN",
    provincia: "LAMAS",
    distrito: "SAN ROQUE DE CUMBAZA",
  },
  {
    id: "210401",
    codigo: "210401",
    departamento: "SAN MARTIN",
    provincia: "MARISCAL CACERES",
    distrito: "JUANJUI",
  },
  {
    id: "210402",
    codigo: "210402",
    departamento: "SAN MARTIN",
    provincia: "MARISCAL CACERES",
    distrito: "CAMPANILLA",
  },
  {
    id: "210403",
    codigo: "210403",
    departamento: "SAN MARTIN",
    provincia: "MARISCAL CACERES",
    distrito: "HUICUNGO",
  },
  {
    id: "210404",
    codigo: "210404",
    departamento: "SAN MARTIN",
    provincia: "MARISCAL CACERES",
    distrito: "PACHIZA",
  },
  {
    id: "210405",
    codigo: "210405",
    departamento: "SAN MARTIN",
    provincia: "MARISCAL CACERES",
    distrito: "PAJARILLO",
  },
  {
    id: "210501",
    codigo: "210501",
    departamento: "SAN MARTIN",
    provincia: "RIOJA",
    distrito: "RIOJA",
  },
  {
    id: "210502",
    codigo: "210502",
    departamento: "SAN MARTIN",
    provincia: "RIOJA",
    distrito: "POSIC",
  },
  {
    id: "210503",
    codigo: "210503",
    departamento: "SAN MARTIN",
    provincia: "RIOJA",
    distrito: "YORONGOS",
  },
  {
    id: "210504",
    codigo: "210504",
    departamento: "SAN MARTIN",
    provincia: "RIOJA",
    distrito: "YURACYACU",
  },
  {
    id: "210505",
    codigo: "210505",
    departamento: "SAN MARTIN",
    provincia: "RIOJA",
    distrito: "NUEVA CAJAMARCA",
  },
  {
    id: "210506",
    codigo: "210506",
    departamento: "SAN MARTIN",
    provincia: "RIOJA",
    distrito: "ELIAS SOPLIN VARGAS",
  },
  {
    id: "210507",
    codigo: "210507",
    departamento: "SAN MARTIN",
    provincia: "RIOJA",
    distrito: "SAN FERNANDO",
  },
  {
    id: "210508",
    codigo: "210508",
    departamento: "SAN MARTIN",
    provincia: "RIOJA",
    distrito: "PARDO MIGUEL",
  },
  {
    id: "210509",
    codigo: "210509",
    departamento: "SAN MARTIN",
    provincia: "RIOJA",
    distrito: "AWAJUN",
  },
  {
    id: "210601",
    codigo: "210601",
    departamento: "SAN MARTIN",
    provincia: "SAN MARTIN",
    distrito: "TARAPOTO",
  },
  {
    id: "210602",
    codigo: "210602",
    departamento: "SAN MARTIN",
    provincia: "SAN MARTIN",
    distrito: "ALBERTO LEVEAU",
  },
  {
    id: "210604",
    codigo: "210604",
    departamento: "SAN MARTIN",
    provincia: "SAN MARTIN",
    distrito: "CACATACHI",
  },
  {
    id: "210606",
    codigo: "210606",
    departamento: "SAN MARTIN",
    provincia: "SAN MARTIN",
    distrito: "CHAZUTA",
  },
  {
    id: "210607",
    codigo: "210607",
    departamento: "SAN MARTIN",
    provincia: "SAN MARTIN",
    distrito: "CHIPURANA",
  },
  {
    id: "210608",
    codigo: "210608",
    departamento: "SAN MARTIN",
    provincia: "SAN MARTIN",
    distrito: "EL PORVENIR",
  },
  {
    id: "210609",
    codigo: "210609",
    departamento: "SAN MARTIN",
    provincia: "SAN MARTIN",
    distrito: "HUMBAYOC",
  },
  {
    id: "210610",
    codigo: "210610",
    departamento: "SAN MARTIN",
    provincia: "SAN MARTIN",
    distrito: "JUAN GUERRA",
  },
  {
    id: "210611",
    codigo: "210611",
    departamento: "SAN MARTIN",
    provincia: "SAN MARTIN",
    distrito: "MORALES",
  },
  {
    id: "210612",
    codigo: "210612",
    departamento: "SAN MARTIN",
    provincia: "SAN MARTIN",
    distrito: "PAPAPLAYA",
  },
  {
    id: "210616",
    codigo: "210616",
    departamento: "SAN MARTIN",
    provincia: "SAN MARTIN",
    distrito: "SAN ANTONIO",
  },
  {
    id: "210619",
    codigo: "210619",
    departamento: "SAN MARTIN",
    provincia: "SAN MARTIN",
    distrito: "SAUCE",
  },
  {
    id: "210620",
    codigo: "210620",
    departamento: "SAN MARTIN",
    provincia: "SAN MARTIN",
    distrito: "SHAPAJA",
  },
  {
    id: "210621",
    codigo: "210621",
    departamento: "SAN MARTIN",
    provincia: "SAN MARTIN",
    distrito: "LA BANDA DE SHILCAYO",
  },
  {
    id: "210701",
    codigo: "210701",
    departamento: "SAN MARTIN",
    provincia: "BELLAVISTA",
    distrito: "BELLAVISTA",
  },
  {
    id: "210702",
    codigo: "210702",
    departamento: "SAN MARTIN",
    provincia: "BELLAVISTA",
    distrito: "SAN RAFAEL",
  },
  {
    id: "210703",
    codigo: "210703",
    departamento: "SAN MARTIN",
    provincia: "BELLavista",
    distrito: "SAN PABLO",
  },
  {
    id: "210704",
    codigo: "210704",
    departamento: "SAN MARTIN",
    provincia: "BELLAVISTA",
    distrito: "ALTO BIAVO",
  },
  {
    id: "210705",
    codigo: "210705",
    departamento: "SAN MARTIN",
    provincia: "BELLAVISTA",
    distrito: "HUALLAGA",
  },
  {
    id: "210706",
    codigo: "210706",
    departamento: "SAN MARTIN",
    provincia: "BELLAVISTA",
    distrito: "BAJO BIAVO",
  },
  {
    id: "210801",
    codigo: "210801",
    departamento: "SAN MARTIN",
    provincia: "TOCACHE",
    distrito: "TOCACHE",
  },
  {
    id: "210802",
    codigo: "210802",
    departamento: "SAN MARTIN",
    provincia: "TOCACHE",
    distrito: "NUEVO PROGRESO",
  },
  {
    id: "210803",
    codigo: "210803",
    departamento: "SAN MARTIN",
    provincia: "TOCACHE",
    distrito: "POLVORA",
  },
  {
    id: "210804",
    codigo: "210804",
    departamento: "SAN MARTIN",
    provincia: "TOCACHE",
    distrito: "SHUNTE",
  },
  {
    id: "210805",
    codigo: "210805",
    departamento: "SAN MARTIN",
    provincia: "TOCACHE",
    distrito: "UCHIZA",
  },
  {
    id: "210901",
    codigo: "210901",
    departamento: "SAN MARTIN",
    provincia: "PICOTA",
    distrito: "PICOTA",
  },
  {
    id: "210902",
    codigo: "210902",
    departamento: "SAN MARTIN",
    provincia: "PICOTA",
    distrito: "BUENOS AIRES",
  },
  {
    id: "210903",
    codigo: "210903",
    departamento: "SAN MARTIN",
    provincia: "PICOTA",
    distrito: "CASPIZAPA",
  },
  {
    id: "210904",
    codigo: "210904",
    departamento: "SAN MARTIN",
    provincia: "PICOTA",
    distrito: "PILLUANA",
  },
  {
    id: "210905",
    codigo: "210905",
    departamento: "SAN MARTIN",
    provincia: "PICOTA",
    distrito: "PUCACACA",
  },
  {
    id: "210906",
    codigo: "210906",
    departamento: "SAN MARTIN",
    provincia: "PICOTA",
    distrito: "SAN CRISTOBAL",
  },
  {
    id: "210907",
    codigo: "210907",
    departamento: "SAN MARTIN",
    provincia: "PICOTA",
    distrito: "SAN HILARION",
  },
  {
    id: "210908",
    codigo: "210908",
    departamento: "SAN MARTIN",
    provincia: "PICOTA",
    distrito: "TINGO DE PONASA",
  },
  {
    id: "210909",
    codigo: "210909",
    departamento: "SAN MARTIN",
    provincia: "PICOTA",
    distrito: "TRES UNIDOS",
  },
  {
    id: "210910",
    codigo: "210910",
    departamento: "SAN MARTIN",
    provincia: "PICOTA",
    distrito: "SHAMBOYACU",
  },
  {
    id: "211001",
    codigo: "211001",
    departamento: "SAN MARTIN",
    provincia: "EL DORADO",
    distrito: "SAN JOSE DE SISA",
  },
  {
    id: "211002",
    codigo: "211002",
    departamento: "SAN MARTIN",
    provincia: "EL DORADO",
    distrito: "AGUA BLANCA",
  },
  {
    id: "211003",
    codigo: "211003",
    departamento: "SAN MARTIN",
    provincia: "EL DORADO",
    distrito: "SHATOJA",
  },
  {
    id: "211004",
    codigo: "211004",
    departamento: "SAN MARTIN",
    provincia: "EL DORADO",
    distrito: "SAN MARTIN",
  },
  {
    id: "211005",
    codigo: "211005",
    departamento: "SAN MARTIN",
    provincia: "EL DORADO",
    distrito: "SANTA ROSA",
  },
  {
    id: "220101",
    codigo: "220101",
    departamento: "TACNA",
    provincia: "TACNA",
    distrito: "TACNA",
  },
  {
    id: "220102",
    codigo: "220102",
    departamento: "TACNA",
    provincia: "TACNA",
    distrito: "CALANA",
  },
  {
    id: "220104",
    codigo: "220104",
    departamento: "TACNA",
    provincia: "TACNA",
    distrito: "INCLAN",
  },
  {
    id: "220107",
    codigo: "220107",
    departamento: "TACNA",
    provincia: "TACNA",
    distrito: "PACHIA",
  },
  {
    id: "220108",
    codigo: "220108",
    departamento: "TACNA",
    provincia: "TACNA",
    distrito: "PALCA",
  },
  {
    id: "220109",
    codigo: "220109",
    departamento: "TACNA",
    provincia: "TACNA",
    distrito: "POCOLLAY",
  },
  {
    id: "220110",
    codigo: "220110",
    departamento: "TACNA",
    provincia: "TACNA",
    distrito: "SAMA",
  },
  {
    id: "220111",
    codigo: "220111",
    departamento: "TACNA",
    provincia: "TACNA",
    distrito: "ALTO DE LA ALIANZA",
  },
  {
    id: "220112",
    codigo: "220112",
    departamento: "TACNA",
    provincia: "TACNA",
    distrito: "CIUDAD NUEVA",
  },
  {
    id: "220113",
    codigo: "220113",
    departamento: "TACNA",
    provincia: "TACNA",
    distrito: "CORONEL GREGORIO ALBARRACIN L",
  },
  {
    id: "220114",
    codigo: "220114",
    departamento: "TACNA",
    provincia: "TACNA",
    distrito: "LA YARADA LOS PALOS",
  },
  {
    id: "220201",
    codigo: "220201",
    departamento: "TACNA",
    provincia: "TARATA",
    distrito: "TARATA",
  },
  {
    id: "220205",
    codigo: "220205",
    departamento: "TACNA",
    provincia: "TARATA",
    distrito: "HERDES ALBARRACIN",
  },
  {
    id: "220206",
    codigo: "220206",
    departamento: "TACNA",
    provincia: "TARATA",
    distrito: "ESTIQUE",
  },
  {
    id: "220207",
    codigo: "220207",
    departamento: "TACNA",
    provincia: "TARATA",
    distrito: "ESTIQUE PAMPA",
  },
  {
    id: "220210",
    codigo: "220210",
    departamento: "TACNA",
    provincia: "TARATA",
    distrito: "SITAJARA",
  },
  {
    id: "220211",
    codigo: "220211",
    departamento: "TACNA",
    provincia: "TARATA",
    distrito: "SUSAPAYA",
  },
  {
    id: "220212",
    codigo: "220212",
    departamento: "TACNA",
    provincia: "TARATA",
    distrito: "TARICACHI",
  },
  {
    id: "220213",
    codigo: "220213",
    departamento: "TACNA",
    provincia: "TARATA",
    distrito: "TICACO",
  },
  {
    id: "220301",
    codigo: "220301",
    departamento: "TACNA",
    provincia: "JORGE BASADRE",
    distrito: "LOCUMBA",
  },
  {
    id: "220302",
    codigo: "220302",
    departamento: "TACNA",
    provincia: "JORGE BASADRE",
    distrito: "ITE",
  },
  {
    id: "220303",
    codigo: "220303",
    departamento: "TACNA",
    provincia: "JORGE BASADRE",
    distrito: "ILABAYA",
  },
  {
    id: "220401",
    codigo: "220401",
    departamento: "TACNA",
    provincia: "CANDARAVE",
    distrito: "CANDARAVE",
  },
  {
    id: "220402",
    codigo: "220402",
    departamento: "TACNA",
    provincia: "CANDARAVE",
    distrito: "CAIRANI",
  },
  {
    id: "220403",
    codigo: "220403",
    departamento: "TACNA",
    provincia: "CANDARAVE",
    distrito: "CURIBAYA",
  },
  {
    id: "220404",
    codigo: "220404",
    departamento: "TACNA",
    provincia: "CANDARAVE",
    distrito: "HUANUARA",
  },
  {
    id: "220405",
    codigo: "220405",
    departamento: "TACNA",
    provincia: "CANDARAVE",
    distrito: "QUILAHUANI",
  },
  {
    id: "220406",
    codigo: "220406",
    departamento: "TACNA",
    provincia: "CANDARAVE",
    distrito: "CAMILACA",
  },
  {
    id: "230101",
    codigo: "230101",
    departamento: "TUMBES",
    provincia: "TUMBES",
    distrito: "TUMBES",
  },
  {
    id: "230102",
    codigo: "230102",
    departamento: "TUMBES",
    provincia: "TUMBES",
    distrito: "CORRALES",
  },
  {
    id: "230103",
    codigo: "230103",
    departamento: "TUMBES",
    provincia: "TUMBES",
    distrito: "LA CRUZ",
  },
  {
    id: "230104",
    codigo: "230104",
    departamento: "TUMBES",
    provincia: "TUMBES",
    distrito: "PAMPAS DE HOSPITAL",
  },
  {
    id: "230105",
    codigo: "230105",
    departamento: "TUMBES",
    provincia: "TUMBES",
    distrito: "SAN JACINTO",
  },
  {
    id: "230106",
    codigo: "230106",
    departamento: "TUMBES",
    provincia: "TUMBES",
    distrito: "SAN JUAN DE LA VIRGEN",
  },
  {
    id: "230201",
    codigo: "230201",
    departamento: "TUMBES",
    provincia: "CONTRALMIRANTE VILLAR",
    distrito: "ZORRITOS",
  },
  {
    id: "230202",
    codigo: "230202",
    departamento: "TUMBES",
    provincia: "CONTRALMIRANTE VILLAR",
    distrito: "CASTAS",
  },
  {
    id: "230203",
    codigo: "230203",
    departamento: "TUMBES",
    provincia: "CONTRALMIRANTE VILLAR",
    distrito: "CANOAS DE PUNTA SAL",
  },
  {
    id: "230301",
    codigo: "230301",
    departamento: "TUMBES",
    provincia: "ZARUMILLA",
    distrito: "ZARUMILLA",
  },
  {
    id: "230302",
    codigo: "230302",
    departamento: "TUMBES",
    provincia: "ZARUMILLA",
    distrito: "MATAPALO",
  },
  {
    id: "230303",
    codigo: "230303",
    departamento: "TUMBES",
    provincia: "ZARUMILLA",
    distrito: "PAPAYAL",
  },
  {
    id: "230304",
    codigo: "230304",
    departamento: "TUMBES",
    provincia: "ZARUMILLa",
    distrito: "AGUAS VERDES",
  },
  {
    id: "240101",
    codigo: "240101",
    departamento: "LIMA",
    provincia: "CALLAO",
    distrito: "CALLAO",
  },
  {
    id: "240102",
    codigo: "240102",
    departamento: "LIMA",
    provincia: "CALLAO",
    distrito: "BELLAVISTA",
  },
  {
    id: "240103",
    codigo: "240103",
    departamento: "LIMA",
    provincia: "CALLAO",
    distrito: "LA PUNTA",
  },
  {
    id: "240104",
    codigo: "240104",
    departamento: "LIMA",
    provincia: "CALLAO",
    distrito: "CARMEN DE LA LEGUA-REYNOSO",
  },
  {
    id: "240105",
    codigo: "240105",
    departamento: "LIMA",
    provincia: "CALLAO",
    distrito: "LA PERLA",
  },
  {
    id: "240106",
    codigo: "240106",
    departamento: "LIMA",
    provincia: "CALLAO",
    distrito: "VENTANILLA",
  },
  {
    id: "240107",
    codigo: "240107",
    departamento: "LIMA",
    provincia: "CALLAO",
    distrito: "MI PERU",
  },
  {
    id: "250101",
    codigo: "250101",
    departamento: "UCAYALI",
    provincia: "CORONEL PORTILLO",
    distrito: "CALLERIA",
  },
  {
    id: "250102",
    codigo: "250102",
    departamento: "UCAYALI",
    provincia: "CORONEL PORTILLO",
    distrito: "YARINACOCHA",
  },
  {
    id: "250103",
    codigo: "250103",
    departamento: "UCAYALI",
    provincia: "CORONEL PORTILLO",
    distrito: "MASISEA",
  },
  {
    id: "250104",
    codigo: "250104",
    departamento: "UCAYALI",
    provincia: "CORONEL PORTILLO",
    distrito: "CAMPOVERDE",
  },
  {
    id: "250105",
    codigo: "250105",
    departamento: "UCAYALI",
    provincia: "CORONEL PORTILLO",
    distrito: "IPARIA",
  },
  {
    id: "250106",
    codigo: "250106",
    departamento: "UCAYALI",
    provincia: "CORONEL PORTILLO",
    distrito: "NUEVA REQUENA",
  },
  {
    id: "250107",
    codigo: "250107",
    departamento: "UCAYALI",
    provincia: "CORONEL PORTILLO",
    distrito: "MANANTAY",
  },
  {
    id: "250201",
    codigo: "250201",
    departamento: "UCAYALI",
    provincia: "PADRE ABAD",
    distrito: "PADRE ABAD",
  },
  {
    id: "250203",
    codigo: "250203",
    departamento: "UCAYALI",
    provincia: "PADRE ABAD",
    distrito: "CURIMANA",
  },
  {
    id: "250204",
    codigo: "250204",
    departamento: "UCAYALI",
    provincia: "PADRE ABAD",
    distrito: "NESHUYA",
  },
  {
    id: "250205",
    codigo: "250205",
    departamento: "UCAYALI",
    provincia: "PADRE ABAD",
    distrito: "ALEXANDER VON HUMBOLDT",
  },
  {
    id: "250301",
    codigo: "250301",
    departamento: "UCAYALI",
    provincia: "ATALAYA",
    distrito: "RAMON CASTILLA",
  },
  {
    id: "250302",
    codigo: "250302",
    departamento: "UCAYALI",
    provincia: "ATALAYA",
    distrito: "TAHUANIA",
  },
  {
    id: "250303",
    codigo: "250303",
    departamento: "UCAYALI",
    provincia: "ATALAYA",
    distrito: "YURUA",
  },
  {
    id: "250304",
    codigo: "250304",
    departamento: "UCAYALI",
    provincia: "ATALAYA",
    distrito: "SEPAHUA",
  },
  {
    id: "250401",
    codigo: "250401",
    departamento: "UCAYALI",
    provincia: "PURUS",
    distrito: "PURUS",
  },
];

// Modal para añadir nuevo ubigeo
function ModalNuevoUbigeo({ isOpen, onClose, onUbigeoCreado }) {
  const [nuevoUbigeo, setNuevoUbigeo] = useState({
    codigo: "",
    departamento: "",
    provincia: "",
    distrito: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoUbigeo((prev) => ({
      ...prev,
      [name]: value.toUpperCase(),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !nuevoUbigeo.codigo ||
      !nuevoUbigeo.departamento ||
      !nuevoUbigeo.provincia ||
      !nuevoUbigeo.distrito
    ) {
      alert("Todos los campos son obligatorios");
      return;
    }

    const ubigeoCompleto = {
      id: nuevoUbigeo.codigo,
      ...nuevoUbigeo,
    };

    onUbigeoCreado(ubigeoCompleto);

    // Limpiar formulario
    setNuevoUbigeo({
      codigo: "",
      departamento: "",
      provincia: "",
      distrito: "",
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
            Nuevo Ubigeo
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
            {/* Código */}
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
                Código Ubigeo *
              </label>
              <input
                type="text"
                name="codigo"
                value={nuevoUbigeo.codigo}
                onChange={handleInputChange}
                placeholder="Ej: 150101"
                maxLength="6"
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

            {/* Departamento */}
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
                Departamento *
              </label>
              <select
                name="departamento"
                value={nuevoUbigeo.departamento}
                onChange={handleInputChange}
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "12px",
                }}
              >
                <option value="">Seleccione un departamento</option>
                <option value="AMAZONAS">AMAZONAS</option>
                <option value="ANCASH">ANCASH</option>
                <option value="APURIMAC">APURIMAC</option>
                <option value="AREQUIPA">AREQUIPA</option>
                <option value="AYACUCHO">AYACUCHO</option>
                <option value="CAJAMARCA">CAJAMARCA</option>
                <option value="CALLAO">CALLAO</option>
                <option value="CUSCO">CUSCO</option>
                <option value="HUANCAVELICA">HUANCAVELICA</option>
                <option value="HUANUCO">HUANUCO</option>
                <option value="ICA">ICA</option>
                <option value="JUNIN">JUNIN</option>
                <option value="LA_LIBERTAD">LA LIBERTAD</option>
                <option value="LAMBAYEQUE">LAMBAYEQUE</option>
                <option value="LIMA">LIMA</option>
                <option value="LORETO">LORETO</option>
                <option value="MADRE_DE_DIOS">MADRE DE DIOS</option>
                <option value="MOQUEGUA">MOQUEGUA</option>
                <option value="PASCO">PASCO</option>
                <option value="PIURA">PIURA</option>
                <option value="PUNO">PUNO</option>
                <option value="SAN_MARTIN">SAN MARTÍN</option>
                <option value="TACNA">TACNA</option>
                <option value="TUMBES">TUMBES</option>
                <option value="UCAYALI">UCAYALI</option>
              </select>
            </div>

            {/* Provincia */}
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
                Provincia *
              </label>
              <select
                name="provincia"
                value={nuevoUbigeo.provincia}
                onChange={handleInputChange}
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "12px",
                }}
              >
                {/* Amazonas */}
                <option value="CHACHAPOYAS">CHACHAPOYAS</option>
                <option value="BAGUA">BAGUA</option>
                <option value="BONGARA">BONGARA</option>
                <option value="CONDORCANQUI">CONDORCANQUI</option>
                <option value="LUYA">LUYA</option>
                <option value="RODRIGUEZ_DE_MENDOZA">
                  RODRÍGUEZ DE MENDOZA
                </option>
                <option value="UTCUBAMBA">UTCUBAMBA</option>

                {/* Áncash*/}
                <option value="HUARAZ">HUARAZ</option>
                <option value="AIJA">AIJA</option>
                <option value="ANTONIO_RAYMONDI">ANTONIO RAYMONDI</option>
                <option value="ASUNCION">ASUNCIÓN</option>
                <option value="BOLOGNESI">BOLOGNESI</option>
                <option value="CARHUAZ">CARHUAZ</option>
                <option value="CARLOS_FERMIN_DEL_CASTILLO">
                  CARLOS FERMÍN DEL CASTILLO
                </option>
                <option value="CASMA">CASMA</option>
                <option value="CORONGO">CORONGO</option>
                <option value="HUARI">HUARI</option>
                <option value="HUARMEY">HUARMEY</option>
                <option value="HUAYLAS">HUAYLAS</option>
                <option value="MARISCAL_LOPEZ">MARISCAL LOPEZ</option>
                <option value="PALLASCA">PALLASCA</option>
                <option value="POMABAMBA">POMABAMBA</option>
                <option value="RECUAY">RECUAY</option>
                <option value="SANTA">SANTA</option>
                <option value="SIHUAS">SIHUAS</option>
                <option value="YUNGAY">YUNGAY</option>

                {/* Apurímac */}
                <option value="ABANCAY">ABANCAY</option>
                <option value="ANDAHUAYLAS">ANDAHUAYLAS</option>
                <option value="ANTABAMBA">ANTABAMBA</option>
                <option value="AYMARAES">AYMARAES</option>
                <option value="COTABAMBAS">COTABAMBAS</option>
                <option value="GRAU">GRAU</option>

                {/* Arequipa*/}
                <option value="AREQUIPA">AREQUIPA</option>
                <option value="CAMANA">CAMANA</option>
                <option value="CARAVELI">CARAVELI</option>
                <option value="CASTILLA">CASTILLA</option>
                <option value="CAYLLOMA">CAYLLOMA</option>
                <option value="CONDESUYOS">CONDESUYOS</option>
                <option value="ISLAY">ISLAY</option>
                <option value="LA_UNION">LA UNION</option>

                {/* Ayacucho */}
                <option value="HUAMANGA">HUAMANGA</option>
                <option value="CANGALLO">CANGALLO</option>
                <option value="HUANCA_SANCOS">HUANCA SANCOS</option>
                <option value="LA_MAR">LA MAR</option>
                <option value="LUCANAS">LUCANAS</option>
                <option value="PARINACOCHAS">PARINACOCHAS</option>
                <option value="PAUCAR_DEL_SARA_SARA">
                  PAUCAR DEL SARA SARA
                </option>
                <option value="SUCRE">SUCRE</option>
                <option value="VICTOR_FAINES">VICTOR FAINES</option>
                <option value="VILCAS_HUAMAN">VILCAS HUAMAN</option>

                {/* Cajamarca */}
                <option value="CAJAMARCA">CAJAMARCA</option>
                <option value="CAJABAMBA">CAJABAMBA</option>
                <option value="CELENDIN">CELENDIN</option>
                <option value="CHOTA">CHOTA</option>
                <option value="CONTUMAZA">CONTUMAZA</option>
                <option value="CUTERVO">CUTERVO</option>
                <option value="HUALGAYOC">HUALGAYOC</option>
                <option value="JAEN">JAEN</option>
                <option value="SAN_MIGUEL">SAN MIGUEL</option>
                <option value="SAN_PABLO">SAN PABLO</option>
                <option value="SANTA_CRUZ">SANTA CRUZ</option>

                {/* Callao */}
                <option value="CALLAO">CALLAO</option>

                {/* Cusco */}
                <option value="CUSCO">CUSCO</option>
                <option value="ACOMAYO">ACOMAYO</option>
                <option value="ANTA">ANTA</option>
                <option value="CALCA">CALCA</option>
                <option value="CANAS">CANAS</option>
                <option value="CANCHIS">CANCHIS</option>
                <option value="CHUMBIVILCAS">CHUMBIVILCAS</option>
                <option value="ESPINAR">ESPINAR</option>
                <option value="LA_CONVENCION">LA CONVENCIÓN</option>
                <option value="PARURO">PARURO</option>
                <option value="PAUCARTAMBO">PAUCARTAMBO</option>
                <option value="QUISPICANCHI">QUISPICANCHI</option>
                <option value="URUBAMBA">URUBAMBA</option>

                {/* Huancavelica */}
                <option value="HUANCAVELICA">HUANCAVELICA</option>
                <option value="ACOBAMBA">ACOBAMBA</option>
                <option value="ANGARAES">ANGARAES</option>
                <option value="CASTROVIRREYNA">CASTROVIRREYNA</option>
                <option value="CHURCAMPA">CHURCAMPA</option>
                <option value="HUAYTARA">HUAYTARA</option>
                <option value="TAYACAJA">TAYACAJA</option>

                {/* Huánuco */}
                <option value="HUANUCO">HUANUCO</option>
                <option value="AMBO">AMBO</option>
                <option value="DOS_DE_MAYO">DOS DE MAYO</option>
                <option value="HUACAYBAMBA">HUACAYBAMBA</option>
                <option value="HUAMALIES">HUAMALIES</option>
                <option value="LEONCIO_PRADO">LEONCIO PRADO</option>
                <option value="MARAÑON">MARAÑON</option>
                <option value="PACHITEA">PACHITEA</option>
                <option value="PUERTO_INCA">PUERTO INCA</option>
                <option value="LAURICOCHA">LAURICOCHA</option>
                <option value="YAROWILCA">YAROWILCA</option>

                {/* Ica*/}
                <option value="ICA">ICA</option>
                <option value="CHINCHA">CHINCHA</option>
                <option value="NASCA">NASCA</option>
                <option value="PALPA">PALPA</option>
                <option value="PISCO">PISCO</option>

                {/* Junín */}
                <option value="HUANCAYO">HUANCAYO</option>
                <option value="CONCEPCION">CONCEPCION</option>
                <option value="CHANCHAMAYO">CHANCHAMAYO</option>
                <option value="JUNIN">JUNIN</option>
                <option value="SATIPO">SATIPO</option>
                <option value="TARMA">TARMA</option>
                <option value="YAULI">YAULI</option>

                {/* La Libertad  */}
                <option value="TRUJILLO">TRUJILLO</option>
                <option value="ASCOPE">ASCOPE</option>
                <option value="BOLIVAR">BOLIVAR</option>
                <option value="CHEPEN">CHEPEN</option>
                <option value="JULCAN">JULCAN</option>
                <option value="OTUZCO">OTUZCO</option>
                <option value="PACASMAYO">PACASMAYO</option>
                <option value="PATAZ">PATAZ</option>
                <option value="SANTIAGO_DE_CHUCO">SANTIAGO DE CHUCO</option>
                <option value="SANCHEZ_CARRION">SANCHEZ CARRION</option>
                <option value="SANTIAGO_DE_CHUCO">SANTIAGO DE CHUCO</option>
                <option value="SANTIAGO_DE_CHUCO">SANTIAGO DE CHUCO</option>

                {/* Lambayeque */}
                <option value="CHICLAYO">CHICLAYO</option>
                <option value="FERREÑAFE">FERREÑAFE</option>
                <option value="LAMBAYEQUE">LAMBAYEQUE</option>

                {/* Lima  */}
                <option value="LIMA">LIMA</option>
                <option value="BARRANCA">BARRANCA</option>
                <option value="CAJATAMBO">CAJATAMBO</option>
                <option value="CANTA">CANTA</option>
                <option value="CAÑETE">CAÑETE</option>
                <option value="HUARAL">HUARAL</option>
                <option value="HUAROCHIRI">HUAROCHIRI</option>
                <option value="HUAURA">HUAURA</option>
                <option value="OYON">OYON</option>
                <option value="YAUYOS">YAUYOS</option>

                {/* Loreto  */}
                <option value="MAYNAS">MAYNAS</option>
                <option value="ALTO_PUTUMAYO">ALTO PUTUMAYO</option>
                <option value="LORETO">LORETO</option>
                <option value="MARISCAL_RAMON_CASTILLA">
                  MARISCAL RAMÓN CASTILLA
                </option>
                <option value="REQUENA">REQUENA</option>
                <option value="UCAYALI">UCAYALI</option>

                {/* Madre de Dios */}
                <option value="TAHUAMANU">TAHUAMANU</option>
                <option value="MANU">MANU</option>
                <option value="TAMBOPATA">TAMBOPATA</option>

                {/* Moquegua */}
                <option value="MOQUEGUA">MOQUEGUA</option>
                <option value="GENERAL_SANCHEZ_CERRO">
                  GENERAL SÁNCHEZ CERRO
                </option>
                <option value="ILO">ILO</option>

                {/* Pasco */}
                <option value="PASCO">PASCO</option>
                <option value="DANIEL_ALCIDES_CARRION">
                  DANIEL ALCIDES CARRIÓN
                </option>
                <option value="OXAPAMPA">OXAPAMPA</option>

                {/* Piura */}
                <option value="PIURA">PIURA</option>
                <option value="AYABACA">AYABACA</option>
                <option value="HUANCABAMBA">HUANCABAMBA</option>
                <option value="MORROPON">MORROPON</option>
                <option value="PACAIPAMPA">PACAIPAMPA</option>
                <option value="PAITA">PAITA</option>
                <option value="SULLANA">SULLANA</option>
                <option value="TALARA">TALARA</option>
                <option value="SECHURA">SECHURA</option>

                {/* Puno */}
                <option value="PUNO">PUNO</option>
                <option value="AZANGARO">AZANGARO</option>
                <option value="CARABAYA">CARABAYA</option>
                <option value="CHUCUITO">CHUCUITO</option>
                <option value="EL_COLLAR">EL COLLAR</option>
                <option value="HUANCANE">HUANCANE</option>
                <option value="LAMPA">LAMPA</option>
                <option value="MELGAR">MELGAR</option>
                <option value="MOHO">MOHO</option>
                <option value="SAN_ROMAN">SAN ROMAN</option>
                <option value="SAN_ANTONIO_DE_PUTINA">
                  SAN ANTONIO DE PUTINA
                </option>
                <option value="SANDIA">SANDIA</option>
                <option value="YUNGUYO">YUNGUYO</option>

                {/* San Martín */}
                <option value="MOYOBAMBA">MOYOBAMBA</option>
                <option value="BELLAVISTA">BELLAVISTA</option>
                <option value="EL_DORADO">EL DORADO</option>
                <option value="HUALLAGA">HUALLAGA</option>
                <option value="LAMAS">LAMAS</option>
                <option value="MARISCAL_CACERES">MARISCAL CÁCERES</option>
                <option value="PICOTA">PICOTA</option>
                <option value="RIOJA">RIOJA</option>
                <option value="SAN_MARTIN">SAN MARTÍN</option>
                <option value="TOCACHE">TOCACHE</option>

                {/* Tacna */}
                <option value="TACNA">TACNA</option>
                <option value="CANDARAVE">CANDARAVE</option>
                <option value="JORGE_BASADRE">JORGE BASADRE</option>
                <option value="TARATA">TARATA</option>

                {/* Tumbes */}
                <option value="TUMBES">TUMBES</option>
                <option value="CONTRALMIRANTE_VILLAR">
                  CONTRALMIRANTE VILLAR
                </option>
                <option value="ZARUMILLA">ZARUMILLA</option>

                {/* Ucayali */}
                <option value="CORONEL_PORTILLO">CORONEL PORTILLO</option>
                <option value="ATALAYA">ATALAYA</option>
                <option value="PADRE_ABAD">PADRE ABAD</option>
                <option value="PURUS">PURUS</option>
              </select>
            </div>

            {/* Distrito */}
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
                Distrito *
              </label>
              <select
                name="distrito"
                value={nuevoUbigeo.distrito}
                onChange={handleInputChange}
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "12px",
                }}
              >
                <option value="">Seleccione un distrito</option>

                <option value="CHACHAPOYAS">CHACHAPOYAS</option>
                <option value="ASUNCION">ASUNCION</option>
                <option value="BALSAS">BALSAS</option>
                <option value="CHETO">CHETO</option>
                <option value="CHILIQUIN">CHILIQUIN</option>
                <option value="CHUQUIBAMBA">CHUQUIBAMBA</option>
                <option value="GRANADA">GRANADA</option>
                <option value="HUANCAS">HUANCAS</option>
                <option value="LA JALCA">LA JALCA</option>
                <option value="LEIMEBAMBA">LEIMEBAMBA</option>
                <option value="LEVANTO">LEVANTO</option>
                <option value="MAGDALENA">MAGDALENA</option>
                <option value="MARISCAL CASTILLA">MARISCAL CASTILLA</option>
                <option value="MOLINOPAMPA">MOLINOPAMPA</option>
                <option value="MONTEVIDEO">MONTEVIDEO</option>
                <option value="OLLEROS">OLLEROS</option>
                <option value="QUINJALCA">QUINJALCA</option>
                <option value="SAN FRANCISCO DE DAGUAS">
                  SAN FRANCISCO DE DAGUAS
                </option>
                <option value="SAN ISIDRO DE MAINO">SAN ISIDRO DE MAINO</option>
                <option value="SOLOCO">SOLOCO</option>
                <option value="SONCHE">SONCHE</option>
                <option value="LA PECA">LA PECA</option>
                <option value="ARAMANGO">ARAMANGO</option>
                <option value="COPALLIN">COPALLIN</option>
                <option value="EL PARCO">EL PARCO</option>
                <option value="BAGUA">BAGUA</option>
                <option value="IMAZA">IMAZA</option>

                <option value="JUMBILLA">JUMBILLA</option>
                <option value="COROSHA">COROSHA</option>
                <option value="CUISPES">CUISPES</option>
                <option value="CHISQUILLA">CHISQUILLA</option>
                <option value="CHURUJA">CHURUJA</option>
                <option value="FLORIDA">FLORIDA</option>
                <option value="RECTA">RECTA</option>
                <option value="SAN CARLOS">SAN CARLOS</option>
                <option value="SHIPASBAMBA">SHIPASBAMBA</option>
                <option value="VALERA">VALERA</option>
                <option value="YAMBRASBAMBA">YAMBRASBAMBA</option>
                <option value="JAZAN">JAZAN</option>
                <option value="LAMUD">LAMUD</option>
                <option value="CAMPORREDONDO">CAMPORREDONDO</option>
                <option value="COCABAMBA">COCABAMBA</option>
                <option value="COLCAMAR">COLCAMAR</option>
                <option value="CONILA">CONILA</option>
                <option value="INGUILPATA">INGUILPATA</option>
                <option value="LONGUITA">LONGUITA</option>
                <option value="LONYA CHICO">LONYA CHICO</option>
                <option value="LUYA">LUYA</option>
                <option value="LUYA VIEJO">LUYA VIEJO</option>
                <option value="MARIA">MARIA</option>
                <option value="OCALLI">OCALLI</option>
                <option value="OCUMAL">OCUMAL</option>
                <option value="PISUQUIA">PISUQUIA</option>
                <option value="SAN CRISTOBAL">SAN CRISTOBAL</option>
                <option value="SAN FRANCISCO DE YESO">
                  SAN FRANCISCO DE YESO
                </option>
                <option value="SAN JERONIMO">SAN JERONIMO</option>
                <option value="SAN JUAN DE LOPECANCHA">
                  SAN JUAN DE LOPECANCHA
                </option>
                <option value="SANTA CATALINA">SANTA CATALINA</option>

                <option value="JUMBILLA">JUMBILLA</option>
                <option value="COROSHA">COROSHA</option>
                <option value="CUISPES">CUISPES</option>
                <option value="CHISQUILLA">CHISQUILLA</option>
                <option value="CHURUJA">CHURUJA</option>
                <option value="FLORIDA">FLORIDA</option>
                <option value="RECTA">RECTA</option>
                <option value="SAN CARLOS">SAN CARLOS</option>
                <option value="SHIPASBAMBA">SHIPASBAMBA</option>
                <option value="VALERA">VALERA</option>
                <option value="YAMBRASBAMBA">YAMBRASBAMBA</option>
                <option value="JAZAN">JAZAN</option>
                <option value="LAMUD">LAMUD</option>
                <option value="CAMPORREDONDO">CAMPORREDONDO</option>
                <option value="COCABAMBA">COCABAMBA</option>
                <option value="COLCAMAR">COLCAMAR</option>
                <option value="CONILA">CONILA</option>
                <option value="INGUILPATA">INGUILPATA</option>
                <option value="LONGUITA">LONGUITA</option>
                <option value="LONYA CHICO">LONYA CHICO</option>
                <option value="LUYA">LUYA</option>
                <option value="LUYA VIEJO">LUYA VIEJO</option>
                <option value="MARIA">MARIA</option>
                <option value="OCALLI">OCALLI</option>
                <option value="OCUMAL">OCUMAL</option>
                <option value="PISUQUIA">PISUQUIA</option>
                <option value="SAN CRISTOBAL">SAN CRISTOBAL</option>
                <option value="SAN FRANCISCO DE YESO">
                  SAN FRANCISCO DE YESO
                </option>
                <option value="SAN JERONIMO">SAN JERONIMO</option>
                <option value="SAN JUAN DE LOPECANCHA">
                  SAN JUAN DE LOPECANCHA
                </option>
                <option value="SANTA CATALINA">SANTA CATALINA</option>

                <option value="SANTO TOMAS">SANTO TOMAS</option>
                <option value="TINGO">TINGO</option>
                <option value="TRITA">TRITA</option>
                <option value="PROVIDENCIA">PROVIDENCIA</option>
                <option value="SAN NICOLAS">SAN NICOLAS</option>
                <option value="COCHAMAL">COCHAMAL</option>
                <option value="CHIRIMOTO">CHIRIMOTO</option>
                <option value="HUAMBO">HUAMBO</option>
                <option value="LIMABAMBA">LIMABAMBA</option>
                <option value="LONGAR">LONGAR</option>
                <option value="MILPUCC">MILPUCC</option>
                <option value="MARISCAL BENAVIDES">MARISCAL BENAVIDES</option>
                <option value="OMIA">OMIA</option>
                <option value="SANTA ROSA">SANTA ROSA</option>
                <option value="TOTORA">TOTORA</option>
                <option value="VISTA ALEGRE">VISTA ALEGRE</option>
                <option value="NIEVA">NIEVA</option>
                <option value="RIO SANTIAGO">RIO SANTIAGO</option>
                <option value="EL CENEPA">EL CENEPA</option>
                <option value="BAGUA GRANDE">BAGUA GRANDE</option>
                <option value="CAJARURO">CAJARURO</option>
                <option value="CUMBA">CUMBA</option>
                <option value="EL MILAGRO">EL MILAGRO</option>
                <option value="JAMALCA">JAMALCA</option>
                <option value="LONYA GRANDE">LONYA GRANDE</option>
                <option value="YAMON">YAMON</option>
                <option value="HUARAZ">HUARAZ</option>
                <option value="INDEPENDENCIA">INDEPENDENCIA</option>
                <option value="COCHABAMBA">COCHABAMBA</option>
                <option value="COLCABAMBA">COLCABAMBA</option>
                <option value="HUANCHAY">HUANCHAY</option>

                <option value="JANGAS">JANGAS</option>
                <option value="LA LIBERTAD">LA LIBERTAD</option>
                <option value="OLLEROS">OLLEROS</option>
                <option value="PAMPAS GRANDE">PAMPAS GRANDE</option>
                <option value="PARIACOTO">PARIACOTO</option>
                <option value="PIRA">PIRA</option>
                <option value="TARICA">TARICA</option>
                <option value="AIJA">AIJA</option>
                <option value="CORIS">CORIS</option>
                <option value="HUACLLAN">HUACLLAN</option>
                <option value="LA MERCED">LA MERCED</option>
                <option value="SUCCHA">SUCCHA</option>
                <option value="CHIQUIAN">CHIQUIAN</option>
                <option value="ABELARDO PARDO LEZAME">
                  ABELARDO PARDO LEZAME
                </option>
                <option value="AQUIA">AQUIA</option>
                <option value="CAJACAY">CAJACAY</option>
                <option value="HUAYLLACAYAN">HUAYLLACAYAN</option>
                <option value="HUASTA">HUASTA</option>
                <option value="MANGAS">MANGAS</option>
                <option value="PACLLON">PACLLON</option>
                <option value="SAN MIGUEL DE CORPANQ">
                  SAN MIGUEL DE CORPANQ
                </option>
                <option value="TICLLOS">TICLLOS</option>
                <option value="ANTONIO RAIMONDI">ANTONIO RAIMONDI</option>
                <option value="CANIS">CANIS</option>
                <option value="COLQUIOC">COLQUIOC</option>
                <option value="LA PRIMAVERA">LA PRIMAVERA</option>
                <option value="HUALLANCA">HUALLANCA</option>
                <option value="CARHUAZ">CARHUAZ</option>
                <option value="ACOPAMPA">ACOPAMPA</option>
                <option value="AMASHCA">AMASHCA</option>
                <option value="ANTA">ANTA</option>

                <option value="ATAQUERO">ATAQUERO</option>
                <option value="MARCARA">MARCARA</option>
                <option value="PARIAHUANCA">PARIAHUANCA</option>
                <option value="SAN MIGUEL DE ACO">SAN MIGUEL DE ACO</option>
                <option value="SHILLA">SHILLA</option>
                <option value="TINCO">TINCO</option>
                <option value="YUNGAR">YUNGAR</option>
                <option value="CASMA">CASMA</option>
                <option value="BUENA VISTA ALTA">BUENA VISTA ALTA</option>
                <option value="COMANDANTE NOEL">COMANDANTE NOEL</option>
                <option value="YAUTAN">YAUTAN</option>
                <option value="CORONGO">CORONGO</option>
                <option value="ACO">ACO</option>
                <option value="BAMBAS">BAMBAS</option>
                <option value="CUSCA">CUSCA</option>
                <option value="LA PAMPA">LA PAMPA</option>
                <option value="YANAC">YANAC</option>
                <option value="YUPAN">YUPAN</option>
                <option value="CARAZ">CARAZ</option>
                <option value="HUALLANCA">HUALLANCA</option>
                <option value="HUATA">HUATA</option>
                <option value="HUAYLAS">HUAYLAS</option>
                <option value="MATO">MATO</option>
                <option value="PAMPAROMAS">PAMPAROMAS</option>
                <option value="PUEBLO LIBRE">PUEBLO LIBRE</option>
                <option value="SANTA CRUZ">SANTA CRUZ</option>
                <option value="YURACMARCA">YURACMARCA</option>
                <option value="SANTO TORIBIO">SANTO TORIBIO</option>
                <option value="HUARI">HUARI</option>
                <option value="CAJAY">CAJAY</option>
                <option value="CHAVIN DE HUANTAR">CHAVIN DE HUANTAR</option>
                <option value="HUACACHI">HUACACHI</option>
                <option value="HUACHIS">HUACHIS</option>
                <option value="HUACCHIS">HUACCHIS</option>
                <option value="HUANTAR">HUANTAR</option>
                <option value="MASIN">MASIN</option>
                <option value="PAUCAS">PAUCAS</option>
                <option value="PONTO">PONTO</option>
                <option value="RAHUAPAMPA">RAHUAPAMPA</option>
                <option value="RAPAYAN">RAPAYAN</option>
                <option value="SAN MARCOS">SAN MARCOS</option>
                <option value="SAN PEDRO DE CHANA">SAN PEDRO DE CHANA</option>
                <option value="UCO">UCO</option>
                <option value="ANRA">ANRA</option>
                <option value="PISCOBAMBA">PISCOBAMBA</option>
                <option value="CASCA">CASCA</option>
                <option value="LUCMA">LUCMA</option>
                <option value="FIDEL OLIVAS ESCUDERO">
                  FIDEL OLIVAS ESCUDERO
                </option>
                <option value="LLAMA">LLAMA</option>
                <option value="LLUMPA">LLUMPA</option>
                <option value="MUSGA">MUSGA</option>
                <option value="ELEAZAR GUZMAN BARRON">
                  ELEAZAR GUZMAN BARRON
                </option>
                <option value="CABANA">CABANA</option>
                <option value="BOLOGNESI">BOLOGNESI</option>
                <option value="CONCHUCOS">CONCHUCOS</option>
                <option value="HUACASCHUQUE">HUACASCHUQUE</option>
                <option value="HUANDOVAL">HUANDOVAL</option>
                <option value="LACABAMBA">LACABAMBA</option>
                <option value="LLAPO">LLAPO</option>
                <option value="PALLASCA">PALLASCA</option>
                <option value="PAMPAS">PAMPAS</option>
                <option value="SANTA ROSA">SANTA ROSA</option>
                <option value="TAUCA">TAUCA</option>
                <option value="POMABAMBA">POMABAMBA</option>
                <option value="HUAYLLAN">HUAYLLAN</option>
                <option value="PAROBAMBA">PAROBAMBA</option>
                <option value="QUINUABAMBA">QUINUABAMBA</option>
                <option value="RECUAY">RECUAY</option>
                <option value="COTAPARACO">COTAPARACO</option>
                <option value="HUAYLLAPAMPA">HUAYLLAPAMPA</option>
                <option value="MARCA">MARCA</option>
                <option value="PAMPAS CHICO">PAMPAS CHICO</option>
                <option value="PARARIN">PARARIN</option>
                <option value="TAPACOCHA">TAPACOCHA</option>
                <option value="TICAPAMPA">TICAPAMPA</option>
                <option value="LLACLLIN">LLACLLIN</option>
                <option value="CATAC">CATAC</option>
                <option value="CHIMBOTE">CHIMBOTE</option>
                <option value="CACERES DEL PERU">CACERES DEL PERU</option>
                <option value="MACATE">MACATE</option>
                <option value="MORO">MORO</option>
                <option value="NEPENA">NEPENA</option>
                <option value="SAMANCO">SAMANCO</option>
                <option value="SANTA">SANTA</option>
                <option value="COISHCO">COISHCO</option>
                <option value="NUEVO CHIMBOTE">NUEVO CHIMBOTE</option>
                <option value="SIHUAS">SIHUAS</option>
                <option value="ALFONSO UGARTE">ALFONSO UGARTE</option>
                <option value="CHINGALPO">CHINGALPO</option>
                <option value="HUAYLLABAMBA">HUAYLLABAMBA</option>
                <option value="QUICHES">QUICHES</option>
                <option value="SICSIBAMBA">SICSIBAMBA</option>
                <option value="ACOBAMBA">ACOBAMBA</option>
                <option value="CASHAPAMPA">CASHAPAMPA</option>
                <option value="RAGASH">RAGASH</option>
                <option value="SAN JUAN">SAN JUAN</option>
                <option value="YUNGAY">YUNGAY</option>
                <option value="CASCAPARA">CASCAPARA</option>
                <option value="MANCOS">MANCOS</option>
                <option value="MATACOTO">MATACOTO</option>
                <option value="QUILLO">QUILLO</option>
                <option value="RANRAHIRCA">RANRAHIRCA</option>
                <option value="SHUPLUY">SHUPLUY</option>
                <option value="YANAMA">YANAMA</option>
                <option value="LLAMELLIN">LLAMELLIN</option>
                <option value="ACZO">ACZO</option>
                <option value="CHACCHO">CHACCHO</option>
                <option value="CHINGAS">CHINGAS</option>
                <option value="MIRGAS">MIRGAS</option>
                <option value="SAN JUAN DE RONTOY">SAN JUAN DE RONTOY</option>
                <option value="SAN LUIS">SAN LUIS</option>
                <option value="YAUYA">YAUYA</option>
                <option value="SAN NICOLAS">SAN NICOLAS</option>
                <option value="CHACAS">CHACAS</option>
                <option value="ACOCHACA">ACOCHACA</option>
                <option value="HUARMEY">HUARMEY</option>
                <option value="COCHAPETI">COCHAPETI</option>
                <option value="HUAYAN">HUAYAN</option>
                <option value="MALVAS">MALVAS</option>
                <option value="ACCAS">ACCAS</option>
                <option value="CAJAMARQUILLA">CAJAMARQUILLA</option>
                <option value="CARHUAPAMPA">CARHUAPAMPA</option>
                <option value="COCHAS">COCHAS</option>

                <option value="CONGAS">CONGAS</option>
                <option value="LLIPA">LLIPA</option>
                <option value="OCROS">OCROS</option>
                <option value="SAN CRISTOBAL DE RAJAN">
                  SAN CRISTOBAL DE RAJAN
                </option>
                <option value="SAN PEDRO">SAN PEDRO</option>
                <option value="SANTIAGO DE CHILCAS">SANTIAGO DE CHILCAS</option>
                <option value="ABANCAY">ABANCAY</option>
                <option value="CIRCA">CIRCA</option>
                <option value="CURAHUASI">CURAHUASI</option>
                <option value="CHACOCHE">CHACOCHE</option>
                <option value="HUANIPACA">HUANIPACA</option>
                <option value="LAMBRAMA">LAMBRAMA</option>
                <option value="PICHIRHUA">PICHIRHUA</option>
                <option value="SAN PEDRO DE CACHORA">
                  SAN PEDRO DE CACHORA
                </option>
                <option value="TAMBURCO">TAMBURCO</option>
                <option value="CHALHUANCA">CHALHUANCA</option>
                <option value="CAPAYA">CAPAYA</option>
                <option value="CARAYBAMBA">CARAYBAMBA</option>
                <option value="COLCABAMBA">COLCABAMBA</option>
                <option value="COTARUSE">COTARUSE</option>
                <option value="CHAPIMARCA">CHAPIMARCA</option>
                <option value="IHUAYLLO">IHUAYLLO</option>
                <option value="LUCRE">LUCRE</option>
                <option value="POCOHUANCA">POCOHUANCA</option>
                <option value="SAÑAYCA">SAÑAYCA</option>
                <option value="SORAYA">SORAYA</option>
                <option value="TAPAIRIHUA">TAPAIRIHUA</option>
                <option value="TINTAY">TINTAY</option>
                <option value="TORAYA">TORAYA</option>
                <option value="YANACA">YANACA</option>
                <option value="SAN JUAN DE CHACÑA">SAN JUAN DE CHACÑA</option>
                <option value="JUSTO APU SAHUARAURA">
                  JUSTO APU SAHUARAURA
                </option>
                <option value="ANDAHUAYLAS">ANDAHUAYLAS</option>
                <option value="ANDARAPA">ANDARAPA</option>
                <option value="CHIARA">CHIARA</option>
                <option value="HUANCARAMA">HUANCARAMA</option>
                <option value="HUANCARAY">HUANCARAY</option>
                <option value="KISHUARA">KISHUARA</option>
                <option value="PACOBAMBA">PACOBAMBA</option>
                <option value="PAMPACHIRI">PAMPACHIRI</option>
                <option value="SAN ANTONIO DE CACHI">
                  SAN ANTONIO DE CACHI
                </option>
                <option value="SAN JERONIMO">SAN JERONIMO</option>
                <option value="TALAVERA">TALAVERA</option>
                <option value="TURPO">TURPO</option>
                <option value="PACUCHA">PACUCHA</option>
                <option value="POMACOCHA">POMACOCHA</option>
                <option value="SANTA MARIA DE CHICMO">
                  SANTA MARIA DE CHICMO
                </option>
                <option value="TUMAY HUARACA">TUMAY HUARACA</option>
                <option value="HUAYANA">HUAYANA</option>
                <option value="SAN MIGUEL DE CHACCRAMPA">
                  SAN MIGUEL DE CHACCRAMPA
                </option>
                <option value="KAQUIABAMBA">KAQUIABAMBA</option>
                <option value="JOSE MARIA ARGUEDAS">JOSE MARIA ARGUEDAS</option>
                <option value="ANTABAMBA">ANTABAMBA</option>
                <option value="EL ORO">EL ORO</option>
                <option value="HUAQUIRCA">HUAQUIRCA</option>
                <option value="JUAN ESPINOZA MEDRANO">
                  JUAN ESPINOZA MEDRANO
                </option>
                <option value="OROPESA">OROPESA</option>
                <option value="PACHACONAS">PACHACONAS</option>
                <option value="SABAINO">SABAINO</option>
                <option value="TAMBOBAMBA">TAMBOBAMBA</option>
                <option value="COYLLURQUI">COYLLURQUI</option>
                <option value="COTABAMBAS">COTABAMBAS</option>
                <option value="HAGUIRA">HAGUIRA</option>
                <option value="MARA">MARA</option>
                <option value="CHALLHUAHUACHO">CHALLHUAHUACHO</option>
                <option value="CHUQUIBAMBILLA">CHUQUIBAMBILLA</option>
                <option value="CURPAHUASI">CURPAHUASI</option>
                <option value="HUAILLATI">HUAILLATI</option>
                <option value="MAMARA">MAMARA</option>
                <option value="MARISCAL GAMARRA">MARISCAL GAMARRA</option>
                <option value="MICAELA BASTIDAS">MICAELA BASTIDAS</option>
                <option value="PROGRESO">PROGRESO</option>
                <option value="PATAYPAMPA">PATAYPAMPA</option>
                <option value="SAN ANTONIO">SAN ANTONIO</option>
                <option value="TURPAY">TURPAY</option>
                <option value="VILCABAMBA">VILCABAMBA</option>
                <option value="VIRUNDO">VIRUNDO</option>
                <option value="SANTA ROSA">SANTA ROSA</option>
                <option value="CURASCO">CURASCO</option>
                <option value="CHINCHEROS">CHINCHEROS</option>
                <option value="ONGOY">ONGOY</option>
                <option value="OCOBAMBA">OCOBAMBA</option>
                <option value="COCHARCAS">COCHARCAS</option>
                <option value="ANCO HUALLO">ANCO HUALLO</option>
                <option value="HUACCANA">HUACCANA</option>
                <option value="URANMARCA">URANMARCA</option>
                <option value="RANRACANCHA">RANRACANCHA</option>
                <option value="ROCCHACO">ROCCHACO</option>
                <option value="EL PORVENIR">EL PORVENIR</option>
                <option value="LOS CHANKAS">LOS CHANKAS</option>
                <option value="AREQUIPA">AREQUIPA</option>
                <option value="CAYMA">CAYMA</option>
                <option value="CERRO COLORADO">CERRO COLORADO</option>

                <option value="CHARACATO">CHARACATO</option>
                <option value="CHIGIATA">CHIGIATA</option>
                <option value="LA JOYA">LA JOYA</option>
                <option value="MIRAFLORES">MIRAFLORES</option>
                <option value="MOLLEBAYA">MOLLEBAYA</option>
                <option value="PAUCARPATA">PAUCARPATA</option>
                <option value="POOSI">POOSI</option>
                <option value="POLOBAYA">POLOBAYA</option>
                <option value="QUEQUEÑA">QUEQUEÑA</option>
                <option value="SABANDIA">SABANDIA</option>
                <option value="SACHACA">SACHACA</option>
                <option value="SAN JUAN DE SIGUAS">SAN JUAN DE SIGUAS</option>
                <option value="SAN JUAN DE TARUCANI">
                  SAN JUAN DE TARUCANI
                </option>
                <option value="SANTA ISABEL DE SIGUAS">
                  SANTA ISABEL DE SIGUAS
                </option>
                <option value="SANTA RITA DE SHIUAS">
                  SANTA RITA DE SHIUAS
                </option>
                <option value="SOCABAYA">SOCABAYA</option>
                <option value="TIABAYA">TIABAYA</option>
                <option value="UCHUMAYO">UCHUMAYO</option>
                <option value="VITOR">VITOR</option>
                <option value="YANAHUARA">YANAHUARA</option>
                <option value="YARABAMBA">YARABAMBA</option>
                <option value="YURA">YURA</option>
                <option value="MARIANO MELGAR">MARIANO MELGAR</option>
                <option value="JACOBO HUNTER">JACOBO HUNTER</option>
                <option value="ALTO SEIVA ALEGRE">ALTO SEIVA ALEGRE</option>
                <option value="JOSE LUIS BUSTAMANTE Y RIVERO">
                  JOSE LUIS BUSTAMANTE Y RIVERO
                </option>
                <option value="CHIVAY">CHIVAY</option>
                <option value="ACHOMA">ACHOMA</option>
                <option value="CABANACONDE">CABANACONDE</option>
                <option value="CAYLLOMA">CAYLLOMA</option>
                <option value="CALLALLI">CALLALLI</option>
                <option value="COPORAQUE">COPORAQUE</option>
                <option value="HUAMBO">HUAMBO</option>
                <option value="HUANCA">HUANCA</option>
                <option value="ICHUPAMPA">ICHUPAMPA</option>
                <option value="LARI">LARI</option>
                <option value="LLUTA">LLUTa</option>
                <option value="MACA">MACA</option>
                <option value="MADRIGAL">MADRIGAL</option>
                <option value="SAN ANTONIO DE CHUCA">
                  SAN ANTONIO DE CHUCA
                </option>
                <option value="SIBAYO">SIBAYO</option>
                <option value="TAPAY">TAPAY</option>
                <option value="TISCO">TISCO</option>
                <option value="TUTI">TUTI</option>
                <option value="YANQUE">YANQUE</option>
                <option value="MAJES">MAJES</option>
                <option value="CAMANA">CAMANA</option>
                <option value="JOSE MARIA QUIMPER">JOSE MARIA QUIMPER</option>
                <option value="MARIANO NICOLAS VALCARCEL">
                  MARIANO NICOLAS VALCARCEL
                </option>
                <option value="MARISCAL CACERES">MARISCAL CACERES</option>
                <option value="NICOLAS DE PIEROLA">NICOLAS DE PIEROLA</option>
                <option value="OCOÑA">OCOÑA</option>
                <option value="QUILCA">QUILCA</option>
                <option value="SAMUEL PASTOR">SAMUEL PASTOR</option>
                <option value="CARAVELLI">CARAVELLI</option>
                <option value="ACARI">ACARI</option>
                <option value="ATICO">ATICO</option>
                <option value="ATIQUIPA">ATIQUIPA</option>
                <option value="BELLA UNION">BELLA UNION</option>
                <option value="CAHIJACHO">CAHIJACHO</option>
                <option value="CHALA">CHALA</option>
                <option value="CHAPARRA">CHAPARRA</option>
                <option value="MEJIA">MEJIA</option>
                <option value="PUNTA DE BOMBON">PUNTA DE BOMBON</option>
                <option value="COTAHUASI">COTAHUASI</option>
                <option value="ALCA">ALCA</option>
                <option value="CHARCANA">CHARCANA</option>
                <option value="HUAYNACOTAS">HUAYNACOTAS</option>
                <option value="PAMPAMARCA">PAMPAMARCA</option>
                <option value="PUYCA">PUYCA</option>
                <option value="QUECHUALLA">QUECHUALLA</option>
                <option value="SAYLA">SAYLA</option>
                <option value="TAURIA">TAURIA</option>
                <option value="TOMEPAMPA">TOMEPAMPA</option>
                <option value="TORO">TORO</option>
                <option value="AVACUCHO">AVACUCHO</option>
                <option value="ACOS VINCHOS">ACOS VINCHOS</option>
                <option value="CARMEN ALTO">CARMEN ALTO</option>
                <option value="CHIARA">CHIARA</option>
                <option value="QUINUA">QUINUA</option>
                <option value="SAN JOSE DE TICLLAS">SAN JOSE DE TICLLAS</option>
                <option value="SAN JUAN BAUTISTA">SAN JUAN BAUTISTA</option>
                <option value="SANTIAGO DE PISCHA">SANTIAGO DE PISCHA</option>
                <option value="VINCHOS">VINCHOS</option>
                <option value="TAMBILLO">TAMBILLO</option>
                <option value="ACOCRO">ACOCRO</option>
                <option value="SOCOS">SOCOS</option>
                <option value="OCROS">OCROS</option>
                <option value="PACAYCASA">PACAYCASA</option>
                <option value="JESUS NAZARENO">JESUS NAZARENO</option>
                <option value="ANDRES AVELINO CACERES D.">
                  ANDRES AVELINO CACERES D.
                </option>
                <option value="CANGALLO">CANGALLO</option>
                <option value="CHUSCHI">CHUSCHI</option>
                <option value="LOS MOROCHUCOS">LOS MOROCHUCOS</option>
                <option value="PARAS">PARAS</option>
                <option value="TOTOS">TOTOS</option>
                <option value="MARIA PARADO DE BELLIDO">
                  MARIA PARADO DE BELLIDO
                </option>
                <option value="HUANTA">HUANTA</option>
                <option value="AYAHUANCO">AYAHUANCO</option>
                <option value="HJAMANGUILLA">HJAMANGUILLA</option>
                <option value="IGUAIN">IGUAIN</option>
                <option value="LURICOCHA">LURICOCHA</option>
                <option value="SANTILLANA">SANTILLANA</option>
                <option value="SIVIA">SIVIA</option>
                <option value="LLOCHEGUA">LLOCHEGUA</option>
                <option value="CANAYRE">CANAYRE</option>
                <option value="UCHURACCAY">UCHURACCAY</option>
                <option value="PUCACOLPA">PUCACOLPA</option>
                <option value="CHACA">CHACA</option>
                <option value="SAN MIGUEL">SAN MIGUEL</option>
                <option value="ANCO">ANCO</option>
                <option value="ATNA">ATNA</option>
                <option value="CHILCAS">CHILCAS</option>
                <option value="CHUNGUI">CHUNGUI</option>
                <option value="TAMBO">TAMBO</option>
                <option value="LUIS CARRANZA">LUIS CARRANZA</option>
                <option value="SANTA ROSA">SANTA ROSA</option>
                <option value="SAMUGARI">SAMUGARI</option>
                <option value="ANCHIHUAY">ANCHIHUAY</option>
                <option value="ORONCOOY">ORONCOOY</option>
                <option value="PUQUIO">PUQUIO</option>
                <option value="AUCARA">AUCARA</option>
                <option value="CABANA">CABANA</option>
                <option value="CARMEN SALCEDO">CARMEN SALCEDO</option>
                <option value="CHAVIÑA">CHAVIÑA</option>
                <option value="CHIPAO">CHIPAO</option>
                <option value="HUACHUAS">HUACHUAS</option>
                <option value="LARAMATE">LARAMATE</option>
                <option value="LEONCIO PRADO">LEONCIO PRADO</option>
                <option value="LUCAVIAS">LUCAVIAS</option>
                <option value="LLAUTA">LLAUTA</option>
                <option value="OCAÍA">OCAÍA</option>
                <option value="OTOCA">OTOCA</option>
                <option value="SANCOS">SANCOS</option>
                <option value="SAN JUAN">SAN JUAN</option>
                <option value="SAN PEDRO">SAN PEDRO</option>
                <option value="SANTA ANA DE HUAYCANUACHO">
                  SANTA ANA DE HUAYCANUACHO
                </option>
                <option value="SANTA LUCIA">SANTA LUCIA</option>
                <option value="SAISA">SAISA</option>
                <option value="SAN PEDRO DE PALCO">SAN PEDRO DE PALCO</option>
                <option value="SAN CRISTOBAL">SAN CRISTOBAL</option>
                <option value="CORACORA">CORACORA</option>
                <option value="CORONEL CASTAÑEDA">CORONEL CASTAÑEDA</option>
                <option value="CHUMPI">CHUMPI</option>
                <option value="PACAPUUSA">PACAPUUSA</option>
                <option value="PULLO">PULLO</option>
                <option value="PUYUSCA">PUYUSCA</option>
                <option value="SAN FRANCISCO DE RAVACAYCO">
                  SAN FRANCISCO DE RAVACAYCO
                </option>
                <option value="UPAHUACHO">UPAHUACHO</option>
                <option value="HUANCAPI">HUANCAPI</option>
                <option value="ALCAMENCA">ALCAMENCA</option>
                <option value="APONGO">APONGO</option>
                <option value="CANARIA">CANARIA</option>
                <option value="CAYARA">CAYARA</option>
                <option value="COLCA">COLCA</option>

                <option value="HUALLA">HUALLA</option>
                <option value="HUAMANQUIQUIA">HUAMANQUIQUIA</option>
                <option value="HUANCARAYLLA">HUANCARAYLLA</option>
                <option value="SARHUA">SARHUA</option>
                <option value="VILCANCHOS">VILCANCHOS</option>
                <option value="ASQUIRATA">ASQUIRATA</option>
                <option value="SANCOS">SANCOS</option>
                <option value="SACSAMARCA">SACSAMARCA</option>
                <option value="SANTIAGO DE LUCANAMARCA">
                  SANTIAGO DE LUCANAMARCA
                </option>
                <option value="CARAPO">CARAPO</option>
                <option value="VILCAS HUAMAN">VILCAS HUAMAN</option>
                <option value="VISCHONGO">VISCHONGO</option>
                <option value="ACCOMARCA">ACCOMARCA</option>
                <option value="CARHUANCA">CARHUANCA</option>
                <option value="CONCEPCION">CONCEPCION</option>
                <option value="HUAMBALPA">HUAMBALPA</option>
                <option value="SAURAMA">SAURAMA</option>
                <option value="INDEPENDENCIA">INDEPENDENCIA</option>
                <option value="PAUSA">PAUSA</option>
                <option value="COLTA">COLTA</option>
                <option value="CORCULLA">CORCULLA</option>
                <option value="LAMPA">LAMPA</option>
                <option value="MARCABAMBA">MARCABAMBA</option>
                <option value="OYOLO">OYOLO</option>
                <option value="PARARCA">PARARCA</option>
                <option value="SAN JAVIER DE ALPABAMBA">
                  SAN JAVIER DE ALPABAMBA
                </option>
                <option value="SAN JOSE DE USHUA">SAN JOSE DE USHUA</option>
                <option value="SARA SARA">SARA SARA</option>
                <option value="QUEROBAMBA">QUEROBAMBA</option>
                <option value="BELEN">BELEN</option>
                <option value="CHALCOS">CHALCOS</option>
                <option value="SAN SALVADOR DE QUIJE">
                  SAN SALVADOR DE QUIJE
                </option>
                <option value="PAICO">PAICO</option>
                <option value="SANTIAGO DE PAJCARAY">
                  SANTIAGO DE PAJCARAY
                </option>
                <option value="SAN PEDRO DE LARCAY">SAN PEDRO DE LARCAY</option>
                <option value="SORAS">SORAS</option>
                <option value="HUACAÑA">HUACAÑA</option>
                <option value="CHILCAYOC">CHILCAYOC</option>
                <option value="MORCOLLA">MORCOLLA</option>
                <option value="CAJAMARCA">CAJAMARCA</option>
                <option value="ASUNCION">ASUNCION</option>
                <option value="COSPAN">COSPAN</option>
                <option value="CHETILLA">CHETILLA</option>
                <option value="ENCAÑADA">ENCAÑADA</option>
                <option value="JESUS">JESUS</option>
                <option value="LOS BAÑOS DEL INCA">LOS BAÑOS DEL INCA</option>
                <option value="LLACANORA">LLACANORA</option>
                <option value="MAGDALENA">MAGDALENA</option>
                <option value="MATARA">MATARA</option>
                <option value="NAMORA">NAMORA</option>
                <option value="SAN JUAN">SAN JUAN</option>
                <option value="CAJABAMBA">CAJABAMBA</option>
                <option value="CACHACHI">CACHACHI</option>
                <option value="CONDEBAMBA">CONDEBAMBA</option>
                <option value="SITACOCHA">SITACOCHA</option>
                <option value="CELENDIN">CELENDIN</option>
                <option value="CORTEGANA">CORTEGANA</option>
                <option value="CHUMUCH">CHUMUCH</option>
                <option value="HUASMIN">HUASMIN</option>
                <option value="JORGE CHAVEZ">JORGE CHAVEZ</option>
                <option value="JOSE GALVEZ">JOSE GALVEZ</option>
                <option value="MIGUEL IGLESIAS">MIGUEL IGLESIAS</option>
                <option value="OXAMARCA">OXAMARCA</option>
                <option value="SOROCHUCO">SOROCHUCO</option>
                <option value="SUCRE">SUCRE</option>
                <option value="UTCO">UTCO</option>
                <option value="LA LIBERTAD DE PALLAN">
                  LA LIBERTAD DE PALLAN
                </option>
                <option value="CONTUMAZA">CONTUMAZA</option>
                <option value="CHILETE">CHILETE</option>
                <option value="GUZMANGO">GUZMANGO</option>
                <option value="SAN BENITO">SAN BENITO</option>
                <option value="CUPISNIQUE">CUPISNIQUE</option>
                <option value="TANTARICA">TANTARICA</option>
                <option value="YONAN">YONAN</option>
                <option value="SANTA CRUZ DE TOLED">SANTA CRUZ DE TOLED</option>
                <option value="CUTERVO">CUTERVO</option>
                <option value="CALLAYUC">CALLAYUC</option>
                <option value="CUJILLO">CUJILLO</option>
                <option value="CHOROS">CHOROS</option>
                <option value="LA RAMADA">LA RAMADA</option>
                <option value="PIMPINGOS">PIMPINGOS</option>
                <option value="QUEROCOTILLO">QUEROCOTILLO</option>
                <option value="SAN ANDRES DE CUTERVO">
                  SAN ANDRES DE CUTERVO
                </option>
                <option value="SAN JUAN DE CUTERVO">SAN JUAN DE CUTERVO</option>
                <option value="SAN LUIS DE LUCMA">SAN LUIS DE LUCMA</option>
                <option value="SANTA CRUZ">SANTA CRUZ</option>
                <option value="SANTO DOMINGO DE LA CAPILLA">
                  SANTO DOMINGO DE LA CAPILLA
                </option>
                <option value="SANTO TOMAS">SANTO TOMAS</option>
                <option value="SOCOTA">SOCOTA</option>
                <option value="TORIBIO CASANOVA">TORIBIO CASANOVA</option>
                <option value="CHOTA">CHOTA</option>
                <option value="ANGUIA">ANGUIA</option>
                <option value="COCHABAMBA">COCHABAMBA</option>
                <option value="CHALAMARCA">CHALAMARCA</option>
                <option value="CHUGUR">CHUGUR</option>
                <option value="HUALGAYOC">HUALGAYOC</option>
                <option value="SALLIQUE">SALLIQUE</option>
                <option value="SAN FELIPE">SAN FELIPE</option>
                <option value="SAN JOSE DEL ALTO">SAN JOSE DEL ALTO</option>
                <option value="SANTA ROSA">SANTA ROSA</option>
                <option value="LAS PIRIAS">LAS PIRIAS</option>
                <option value="HUABAL">HUABAL</option>
                <option value="CATACHE">CATACHE</option>
                <option value="CHANCAYBAÑOS">CHANCAYBAÑOS</option>
                <option value="LA ESPERANZA">LA ESPERANZA</option>
                <option value="NINABAMBA">NINABAMBA</option>
                <option value="PULAN">PULAN</option>
                <option value="SEXI">SEXI</option>
                <option value="UTICYACU">UTICYACU</option>
                <option value="YAUYUCAN">YAUYUCAN</option>
                <option value="ANDABAMBA">ANDABAMBA</option>
                <option value="SAUCEPAMPA">SAUCEPAMPA</option>
                <option value="SAN MIGUEL">SAN MIGUEL</option>
                <option value="CALQUIS">CALQUIS</option>
                <option value="LA FLORIDA">LA FLORIDA</option>
                <option value="LLAPA">LLAPA</option>
                <option value="NANCHOC">NANCHOC</option>
                <option value="NIEPOS">NIEPOS</option>
                <option value="SAN GREGORIO">SAN GREGORIO</option>
                <option value="SAN SILVESTRE DE COCHAN">
                  SAN SILVESTRE DE COCHAN
                </option>
                <option value="EL PRADO">EL PRADO</option>
                <option value="UNION AGUA BLANCA">UNION AGUA BLANCA</option>
                <option value="TONGOD">TONGOD</option>
                <option value="CATILLUC">CATILLUC</option>
                <option value="BOLIVAR">BOLIVAR</option>
                <option value="SAN IGNACIO">SAN IGNACIO</option>
                <option value="CHIRINOS">CHIRINOS</option>
                <option value="HUARANGO">HUARANGO</option>
                <option value="NAMBALLE">NAMBALLE</option>
                <option value="LA COIPA">LA COIPA</option>
                <option value="SAN JOSE DE LOURDES">SAN JOSE DE LOURDES</option>
                <option value="TABACONAS">TABACONAS</option>

                <option value="PEDRO GAUVEZ">PEDRO GAUVEZ</option>
                <option value="ICHOCAN">ICHOCAN</option>
                <option value="GREGORIO PITA">GREGORIO PITA</option>
                <option value="JOSE MANUEL QUIROZ">JOSE MANUEL QUIROZ</option>
                <option value="EDUARDO VILLANUEVA">EDUARDO VILLANUEVA</option>
                <option value="JOSE SABOGAL">JOSE SABOGAL</option>
                <option value="CHANCAY">CHANCAY</option>
                <option value="SAN PABLO">SAN PABLO</option>
                <option value="SAN BERNARDINO">SAN BERNARDINO</option>
                <option value="SAN LUIS">SAN LUIS</option>
                <option value="TUMBADEN">TUMBADEN</option>
                <option value="CUSCO">CUSCO</option>
                <option value="CCORCA">CCORCA</option>
                <option value="POROY">POROY</option>
                <option value="SAN JERONIMO">SAN JERONIMO</option>
                <option value="SAN SEBASTIAN">SAN SEBASTIAN</option>
                <option value="SANTIAGO">SANTIAGO</option>
                <option value="SAYLLA">SAYLLA</option>
                <option value="WANCHAO">WANCHAO</option>
                <option value="ACOMAYO">ACOMAYO</option>
                <option value="ACOPIA">ACOPIA</option>
                <option value="ACOS">ACOS</option>
                <option value="POMACANCHI">POMACANCHI</option>
                <option value="RONDOCAN">RONDOCAN</option>
                <option value="SANGARARA">SANGARARA</option>
                <option value="MOSOC LLACTA">MOSOC LLACTA</option>
                <option value="ANTA">ANTA</option>
                <option value="CHINCHAYPUJIO">CHINCHAYPUJIO</option>
                <option value="HUAROCONDO">HUAROCONDO</option>
                <option value="LIMATAMBO">LIMATAMBO</option>
                <option value="MOLLEPATA">MOLLEPATA</option>
                <option value="PUCYURA">PUCYURA</option>
                <option value="ZURITE">ZURITE</option>
                <option value="CACHMAYO">CACHMAYO</option>
                <option value="ANCAHUASI">ANCAHUASI</option>
                <option value="CALCA">CALCA</option>
                <option value="COYA">COYA</option>
                <option value="LAMAY">LAMAY</option>
                <option value="LARES">LARES</option>
                <option value="PISAC">PISAC</option>
                <option value="SAN SALVADOR">SAN SALVADOR</option>
                <option value="TARAY">TARAY</option>
                <option value="VANATLE">VANATLE</option>
                <option value="YANJOCA">YANJOCA</option>
                <option value="CHECCA">CHECCA</option>
                <option value="KUNTURKANKI">KUNTURKANKI</option>
                <option value="LANSUI">LANSUI</option>
                <option value="LAYO">LAYO</option>
                <option value="PAMPAMARCA">PAMPAMARCA</option>
                <option value="QUEHUE">QUEHUE</option>
                <option value="TUPAC AMARU">TUPAC AMARU</option>
                <option value="SICIANI">SICIANI</option>
                <option value="COMBARATA">COMBARATA</option>
                <option value="CHECACUPE">CHECACUPE</option>
                <option value="MARANGANI">MARANGANI</option>
                <option value="PITUMARCA">PITUMARCA</option>
                <option value="SAN PABLO">SAN PABLO</option>
                <option value="SAN PEDRO">SAN PEDRO</option>
                <option value="TINTA">TINTA</option>
                <option value="SANTO TOMAS">SANTO TOMAS</option>
                <option value="CAPACIMARCA">CAPACIMARCA</option>
                <option value="COLQUEMARCA">COLQUEMARCA</option>
                <option value="CHAMACA">CHAMACA</option>
                <option value="LIVITACA">LIVITACA</option>
                <option value="LLUSCO">LLUSCO</option>
                <option value="QUIÑOTA">QUIÑOTA</option>
                <option value="VELLILE">VELLILE</option>
                <option value="ESPINAR">ESPINAR</option>
                <option value="CONDOPOMA">CONDOPOMA</option>
                <option value="COPORAQUE">COPORAQUE</option>
                <option value="OCORURO">OCORURO</option>
                <option value="PALLPARA">PALLPARA</option>
                <option value="PICHIGUA">PICHIGUA</option>
                <option value="SUYCKUTAMBO">SUYCKUTAMBO</option>
                <option value="ALTO PICHIGUA">ALTO PICHIGUA</option>
                <option value="SANTA ANA">SANTA ANA</option>
                <option value="ECHARATE">ECHARATE</option>
                <option value="HUAYOPATA">HUAYOPATA</option>
                <option value="MARANURA">MARANURA</option>
                <option value="OCOBAMBA">OCOBAMBA</option>
                <option value="SANTA TERESA">SANTA TERESA</option>
                <option value="VILCABAMBA">VILCABAMBA</option>
                <option value="QUELLOUNO">QUELLOUNO</option>
                <option value="KIMBIRI">KIMBIRI</option>
                <option value="PICHARI">PICHARI</option>
                <option value="INKAWASI">INKAWASI</option>
                <option value="VILLA VIRGEN">VILLA VIRGEN</option>
                <option value="VILLA KNITIAFINA">VILLA KNITIAFINA</option>
                <option value="MEGANTONI">MEGANTONI</option>
                <option value="PARURO">PARURO</option>
                <option value="ACCHA">ACCHA</option>
                <option value="CCAPI">CCAPI</option>
                <option value="COLCHA">COLCHA</option>
                <option value="QUIQULANA">QUIQULANA</option>
                <option value="CHINCHERO">CHINCHERO</option>
                <option value="HUAYLLABAMBA">HUAYLLABAMBA</option>
                <option value="MACHUPICCHU">MACHUPICCHU</option>
                <option value="ACOBAMBILLA">ACOBAMBILLA</option>
                <option value="ACORIA">ACORIA</option>
                <option value="CONAYCA">CONAYCA</option>
                <option value="CUENCA">CUENCA</option>
                <option value="HUACHOCOLPA">HUACHOCOLPA</option>
                <option value="HUAYLLAHUARA">HUAYLLAHUARA</option>
                <option value="IZOUCHACA">IZOUCHACA</option>
                <option value="LARIA">LARIA</option>
                <option value="MANTA">MANTA</option>
                <option value="MARISCAL CACERES">MARISCAL CACERES</option>
                <option value="MOYA">MOYA</option>
                <option value="NUEVO OCCORO">NUEVO OCCORO</option>
                <option value="PALCA">PALCA</option>
                <option value="PILCHACA">PILCHACA</option>
                <option value="VILCA">VILCA</option>
                <option value="VAULI">VAULI</option>
                <option value="ASCENSION">ASCENSION</option>
                <option value="HUANDO">HUANDO</option>
                <option value="ACOBAMBA">ACOBAMBA</option>
                <option value="ANTA">ANTA</option>
                <option value="ANDABAMBA">ANDABAMBA</option>
                <option value="CAJA">CAJA</option>
                <option value="MARCAS">MARCAS</option>
                <option value="PAUCARA">PAUCARA</option>
                <option value="POMACOCHA">POMACOCHA</option>
                <option value="ROSARIO">ROSARIO</option>
                <option value="LIRCAY">LIRCAY</option>
                <option value="ANCHONGA">ANCHONGA</option>
                <option value="CALLANMARCA">CALLANMARCA</option>
                <option value="CONGALLA">CONGALLA</option>
                <option value="CHINCHO">CHINCHO</option>
                <option value="HUALLAYGRANDE">HUALLAYGRANDE</option>
                <option value="HUANCA-HUANCA">HUANCA-HUANCA</option>
                <option value="JULCAMARCA">JULCAMARCA</option>
                <option value="SAN ANTONIO DE ANTAPARCO">
                  SAN ANTONIO DE ANTAPARCO
                </option>
                <option value="SANTO TOMAS DE PARA">SANTO TOMAS DE PARA</option>
                <option value="SEOCLLA">SEOCLLA</option>
                <option value="CCOCHACCASA">CCOCHACCASA</option>
                <option value="CASTROVIRREYNA">CASTROVIRREYNA</option>
                <option value="ARMA">ARMA</option>
                <option value="AURAHUA">AURAHUA</option>
                <option value="CAPILLAS">CAPILLAS</option>
                <option value="COCAS">COCAS</option>
                <option value="CHUPAMARCA">CHUPAMARCA</option>
                <option value="HUACHOS">HUACHOS</option>
                <option value="HUMIATAMBO">HUMIATAMBO</option>
                <option value="MOLLEPAMPA">MOLLEPAMPA</option>
                <option value="SAN JUAN">SAN JUAN</option>
                <option value="TANTARA">TANTARA</option>
                <option value="TICRAPO">TICRAPO</option>
                <option value="SANTA ANA">SANTA ANA</option>
                <option value="PAMPAS">PAMPAS</option>
                <option value="ACOSTAMBO">ACOSTAMBO</option>
                <option value="ACRAQUIA">ACRAQUIA</option>
                <option value="AHUAYCHA">AHUAYCHA</option>
                <option value="COLCABAMBA">COLCABAMBA</option>
                <option value="DANIEL HERNANDEZ">DANIEL HERNANDEZ</option>
                <option value="HUACHOCOLPA">HUACHOCOLPA</option>
                <option value="HUARIBAMBA">HUARIBAMBA</option>
                <option value="RAHUIMPUQUIO">RAHUIMPUQUIO</option>
                <option value="PAZOS">PAZOS</option>
                <option value="QUISHUAR">QUISHUAR</option>

                <option value="SALCABAMBA">SALCABAMBA</option>
                <option value="SAN MARCOS DE ROCHAC">
                  SAN MARCOS DE ROCHAC
                </option>
                <option value="SURCUBAMBA">SURCUBAMBA</option>
                <option value="TINTAY PUNCU">TINTAY PUNCU</option>
                <option value="SALCAHUASI">SALCAHUASI</option>
                <option value="QUICHUAS">QUICHUAS</option>
                <option value="ANDAYMARCA">ANDAYMARCA</option>
                <option value="ROBLE">ROBLE</option>
                <option value="PICHOS">PICHOS</option>
                <option value="SANTIAGO DE TUCUMA">SANTIAGO DE TUCUMA</option>
                <option value="AYAVI">AYAVI</option>
                <option value="CORDOVA">CORDOVA</option>
                <option value="HUAYACUNDO ARMA">HUAYACUNDO ARMA</option>
                <option value="HUAYTARA">HUAYTARA</option>
                <option value="LARAMARCA">LARAMARCA</option>
                <option value="OCOYO">OCOYO</option>
                <option value="PILPICHACA">PILPICHACA</option>
                <option value="QUERCO">QUERCO</option>
                <option value="QUITO ARMA">QUITO ARMA</option>
                <option value="SAN ANTONIO DE CUSICANCHA">
                  SAN ANTONIO DE CUSICANCHA
                </option>
                <option value="SAN FRANCISCO DE SANGAYAICO">
                  SAN FRANCISGO DE SANGAYAICO
                </option>
                <option value="SAN ISIDRO">SAN ISIDRO</option>
                <option value="SANTIAGO DE CHOCORVOS">
                  SANTIAGO DE CHOCORVOS
                </option>
                <option value="SANTIAGO DE QUIRAHUARA">
                  SANTIAGO DE QUIRAHUARA
                </option>
                <option value="SANTO DOMINGO DE CAPILLAS">
                  SANTO DOMINGO DE CAPILLAS
                </option>
                <option value="TAMBO">TAMBO</option>
                <option value="CHURCAMPA">CHURCAMPA</option>
                <option value="ANCO">ANCO</option>
                <option value="CHINCHIHUASI">CHINCHIHUASI</option>
                <option value="EL CARMEN">EL CARMEN</option>
                <option value="LA MERCED">LA MERCED</option>
                <option value="LOCROJA">LOCROJA</option>
                <option value="PAUCARBAMBA">PAUCARBAMBA</option>
                <option value="SAN MIGUEL DE MAYOCO">
                  SAN MIGUEL DE MAYOCO
                </option>
                <option value="SAN PEDRO DE CORIS">SAN PEDRO DE CORIS</option>
                <option value="PACHAMARCA">PACHAMARCA</option>
                <option value="COSME">COSME</option>
                <option value="HUANUCO">HUANUCO</option>
                <option value="CHINCHAO">CHINCHAO</option>
                <option value="CHURUBAMBA">CHURUBAMBA</option>
                <option value="MARGOS">MARGOS</option>
                <option value="QUISQUI">QUISQUI</option>
                <option value="SAN FRANCISCO DE CAYRAN">
                  SAN FRANCISCO DE CAYRAN
                </option>
                <option value="SAN PEDRO DE CHALLAN">
                  SAN PEDRO DE CHALLAN
                </option>
                <option value="SANTA MARIA DEL VALLE">
                  SANTA MARIA DEL VALLE
                </option>
                <option value="YARUMAYO">YARUMAYO</option>
                <option value="AMARILIS">AMARILIS</option>
                <option value="PILLCO MARCA">PILLCO MARCA</option>
                <option value="VACUS">VACUS</option>
                <option value="SAN PABLO DE PILLAO">SAN PABLO DE PILLAO</option>
                <option value="AMBO">AMBO</option>
                <option value="CAYNA">CAYNA</option>
                <option value="COLPAS">COLPAS</option>
                <option value="CONCHAMARCA">CONCHAMARCA</option>
                <option value="HUACAR">HUACAR</option>
                <option value="SAN FRANCISCO">SAN FRANCISCO</option>
                <option value="SAN RAFAEL">SAN RAFAEL</option>
                <option value="TOMAYKICHWA">TOMAYKICHWA</option>
                <option value="LA UNION">LA UNION</option>
                <option value="CHUQUIS">CHUQUIS</option>
                <option value="MARIAS">MARIAS</option>
                <option value="PACHAS">PACHAS</option>
                <option value="QUIVILLA">QUIVILLA</option>
                <option value="RIPAN">RIPAN</option>
                <option value="SHUNQUI">SHUNQUI</option>
                <option value="SILLARATA">SILLARATA</option>
                <option value="VANAS">VANAS</option>
                <option value="LLATA">LLATA</option>
                <option value="ARANCAY">ARANCAY</option>
                <option value="CHAVIN DE PARIARCA">CHAVIN DE PARIARCA</option>
                <option value="JACAS GRANDE">JACAS GRANDE</option>
                <option value="JIRCAN">JIRCAN</option>
                <option value="MIRAFLORES">MIRAFLORES</option>
                <option value="MONZON">MONZON</option>
                <option value="PUNCHAO">PUNCHAO</option>
                <option value="PUÑOS">PUÑOS</option>
                <option value="SINGA">SINGA</option>
                <option value="TANTAMAYO">TANTAMAYO</option>
                <option value="HUACRACHUCO">HUACRACHUCO</option>
                <option value="CHOLON">CHOLON</option>
                <option value="SAN BUENAVENTURA">SAN BUENAVENTURA</option>
                <option value="LA MORADA">LA MORADA</option>
                <option value="SANTA ROSA DE ALTO YANAJANCA">
                  SANTA ROSA DE ALTO YANAJANCA
                </option>
                <option value="RUPA RUPA">RUPA RUPA</option>
                <option value="DANIEL ALOMIA ROBLES">
                  DANIEL ALOMIA ROBLES
                </option>
                <option value="HERMILLO VALDIZAN">HERMILLO VALDIZAN</option>
                <option value="LUYANDO">LUYANDO</option>
                <option value="MARIANO DAMASO BERAUN">
                  MARIANO DAMASO BERAUN
                </option>
                <option value="JOSE CRESPO Y CASTILLO">
                  JOSE CRESPO Y CASTILLO
                </option>
                <option value="PUCAYACU">PUCAYACU</option>
                <option value="CASTILLO GRANDE">CASTILLO GRANDE</option>
                <option value="PUEBLO NUEVO">PUEBLO NUEVO</option>
                <option value="SANTO DOMINGO DE ANDA">
                  SANTO DOMINGO DE ANDA
                </option>
                <option value="PANAD">PANAD</option>
                <option value="CHAGLLA">CHAGLLA</option>
                <option value="MOLINO">MOLINO</option>
                <option value="UMARI">UMARI</option>
                <option value="HONORIA">HONORIA</option>
                <option value="PUERTO INCA">PUERTO INCA</option>
                <option value="CODO DEL POZUZO">CODO DEL POZUZO</option>
                <option value="TOURNAVISTA">TOURNAVISTA</option>
                <option value="YUVAPICHIS">YUVAPICHIS</option>
                <option value="HUACAYBAMBA">HUACAYBAMBA</option>
                <option value="PINRA">PINRA</option>
                <option value="CANCHABAMBA">CANCHABAMBA</option>
                <option value="COCHABAMBA">COCHABAMBA</option>
                <option value="JESUS">JESUS</option>
                <option value="BAÑOS">BAÑOS</option>
                <option value="SAN FRANCISCO DE ASIS">
                  SAN FRANCISCO DE ASIS
                </option>
                <option value="QUEROPALCA">QUEROPALCA</option>
                <option value="SAN MIGUEL DE CAURI">SAN MIGUEL DE CAURI</option>
                <option value="RONDOS">RONDOS</option>
                <option value="JIVIA">JIVIA</option>
                <option value="CHAVINILLO">CHAVINILLO</option>
                <option value="APARICIO POMARES">APARICIO POMARES</option>
                <option value="CAHUAC">CAHUAC</option>
                <option value="CHACABAMBA">CHACABAMBA</option>
                <option value="JACAS CHICO">JACAS CHICO</option>
                <option value="OBAS">OBAS</option>
                <option value="PAMPAMARCA">PAMPAMARCA</option>
                <option value="CHORAS">CHORAS</option>
                <option value="ICA">ICA</option>
                <option value="LA TINGUIÑA">LA TINGUIÑA</option>
                <option value="LOS AQUIJES">LOS AQUIJES</option>
                <option value="PARCONA">PARCONA</option>
                <option value="OCUCAJE">OCUCAJE</option>
                <option value="PACHACUTEC">PACHACUTEC</option>
                <option value="SALAS">SALAS</option>
                <option value="SAN JOSE DE LOS MOLINOS">
                  SAN JOSE DE LOS MOLINOS
                </option>
                <option value="SAN JUAN BAUTISTA">SAN JUAN BAUTISTA</option>
                <option value="SANTIAGO">SANTIAGO</option>
                <option value="SUBTANJALLA">SUBTANJALLA</option>
                <option value="YAUCA DEL ROSARIO">YAUCA DEL ROSARIO</option>
                <option value="TATE">TATE</option>
                <option value="CHINCHA ALTA">CHINCHA ALTA</option>
                <option value="CHAVIN">CHAVIN</option>
                <option value="CHINCHA BAJA">CHINCHA BAJA</option>
                <option value="EL CARMEN">EL CARMEN</option>
                <option value="GROCIO PRADO">GROCIO PRADO</option>
                <option value="SAN PEDRO DE HUACARPANA">
                  SAN PEDRO DE HUACARPANA
                </option>
                <option value="SUNAMPE">SUNAMPE</option>
                <option value="TAMBO DE MORA">TAMBO DE MORA</option>
                <option value="ALTO LARAN">ALTO LARAN</option>
                <option value="SAN JUAN DE YANAC">SAN JUAN DE YANAC</option>
                <option value="NAZCA">NAZCA</option>
                <option value="CHANGUILLO">CHANGUILLO</option>
                <option value="EL INGENIO">EL INGENIO</option>
                <option value="MARCONA">MARCONa</option>
                <option value="VISTA ALEGRE">VISTA ALEGRE</option>
                <option value="PISCO">PISCO</option>
                <option value="HUANCANO">HUANCANO</option>
                <option value="HUMAY">HUMAY</option>
                <option value="INDEPENDENCIA">INDEPENDENCIA</option>
                <option value="PARACAS">PARACAS</option>
                <option value="SAN ANDRES">SAN ANDRES</option>
                <option value="SAN CLEMENTE">SAN CLEMENTE</option>
                <option value="TUPAC AMARU INCA">TUPAC AMARU INCA</option>
                <option value="PALPA">PALPA</option>
                <option value="LLIPATA">LLIPATA</option>
                <option value="RIO GRANDE">RIO GRANDE</option>
                <option value="SANTA CRUZ">SANTA CRUZ</option>
                <option value="TIBILLO">TIBILLO</option>
                <option value="HUMICAYO">HUMICAYO</option>
                <option value="CARHUACALLANGA">CARHUACALLANGA</option>
                <option value="COLCA">COLCA</option>
                <option value="CULLHUAS">CULLHUAS</option>
                <option value="CHACAPAMPA">CHACAPAMPA</option>
                <option value="CHICCHE">CHICCHE</option>
                <option value="CHILCA">CHILCA</option>
                <option value="CHONGOS ALTO">CHONGOS ALTO</option>
                <option value="CHUPURO">CHUPURO</option>
                <option value="EL TAMBO">EL TAMBO</option>
                <option value="HUACRAPUQUIO">HUACRAPUQUIO</option>
                <option value="HUALHUAS">HUALHUAS</option>
                <option value="HUANCAN">HUANCAN</option>
                <option value="HUASICANCHA">HUASICANCHA</option>
                <option value="HUAYUCACHI">HUAYUCACHI</option>
                <option value="INGENIO">INGENIO</option>
                <option value="PARIAHUANCA">PARIAHUANCA</option>
                <option value="PILCOMAYO">PILCOMAYO</option>
                <option value="PUCARA">PUCARA</option>
                <option value="QUICHUAY">QUICHUAY</option>
                <option value="QUILCAS">QUILCAS</option>
                <option value="SAN AGUSTIN">SAN AGUSTIN</option>

                <option value="SAN JERONIMO DE TUNAN">
                  SAN JERONIMO DE TUNAN
                </option>
                <option value="SANTO DOMINGO DE ACOBAMBA">
                  SANTO DOMINGO DE ACOBAMBA
                </option>
                <option value="SAÑO">SAÑO</option>
                <option value="SAPALLANGA">SAPALLANGA</option>
                <option value="SICAYA">SICAYA</option>
                <option value="VIQUES">VIQUES</option>
                <option value="CONCEPCION">CONCEPCION</option>
                <option value="ACO">ACO</option>
                <option value="ANDAMARCA">ANDAMARCA</option>
                <option value="COMAS">COMAS</option>
                <option value="COCHAS">COCHAS</option>
                <option value="CHAMBARA">CHAMBARA</option>
                <option value="HEROINAS TOLEDO">HEROINAS TOLEDO</option>
                <option value="MANZANARES">MANZANARES</option>
                <option value="MARISCAL CASTILLA">MARISCAL CASTILLA</option>
                <option value="MATAHUASI">MATAHUASI</option>
                <option value="MITO">MITO</option>
                <option value="NUEVE DE JULIO">NUEVE DE JULIO</option>
                <option value="ORCOTUNA">ORCOTUNA</option>
                <option value="SANTA ROSA DE OCOPA">SANTA ROSA DE OCOPA</option>
                <option value="SAN JOSE DE QUERO">SAN JOSE DE QUERO</option>
                <option value="JAUJA">JAUJA</option>
                <option value="ACOLLA">ACOLLA</option>
                <option value="APATA">APATA</option>
                <option value="ATAURA">ATAURA</option>
                <option value="CANCHAYLLO">CANCHAYLLO</option>
                <option value="EL MANTARO">EL MANTARO</option>
                <option value="HUAMALI">HUAMALI</option>
                <option value="HUARIPAMPA">HUARIPAMPA</option>
                <option value="HUERTAS">HUERTAS</option>
                <option value="JANJAILLO">JANJAILLO</option>
                <option value="JULCAN">JULCAN</option>
                <option value="LEONOR ORDOÑEZ">LEONOR ORDOÑEZ</option>
                <option value="LLOCLLAPAMPA">LLOCLLAPAMPA</option>
                <option value="MARCO">MARCO</option>
                <option value="MASMA">MASMA</option>
                <option value="MOLINOS">MOLINOS</option>
                <option value="MONOBAMBA">MONOBAMBA</option>
                <option value="MUQUI">MUQUI</option>
                <option value="MUQUIYAUYO">MUQUIYAUYO</option>
                <option value="PACA">PACA</option>
                <option value="PACCHA">PACCHA</option>
                <option value="PANCAN">PANCAN</option>
                <option value="PARCO">PARCO</option>
                <option value="POMACANCHA">POMACANCHA</option>
                <option value="RICRAN">RICRAN</option>
                <option value="SAN LORENZO">SAN LORENZO</option>
                <option value="SAN PEDRO DE CHUNAN">SAN PEDRO DE CHUNAN</option>
                <option value="SINCOS">SINCOS</option>
                <option value="TUNAN MARCA">TUNAN MARCA</option>
                <option value="YAULI">YAULI</option>
                <option value="CURICACA">CURICACA</option>
                <option value="MASMA CHICCHE">MASMA CHICCHE</option>
                <option value="SAUSA">SAUSA</option>
                <option value="YAUYOS">YAUYOS</option>
                <option value="JUNIN">JUNIN</option>
                <option value="CARHUAMAYO">CARHUAMAYO</option>
                <option value="ONDORES">ONDORES</option>
                <option value="ULCUMAYO">ULCUMAYO</option>
                <option value="TARMA">TARMA</option>
                <option value="ACOBAMBA">ACOBAMBA</option>
                <option value="HUARICOLCA">HUARICOLCA</option>
                <option value="HUASAHUASI">HUASAHUASI</option>
                <option value="LA UNION">LA UNION</option>
                <option value="PALCA">PALCA</option>
                <option value="PALCAMAYO">PALCAMAYO</option>
                <option value="SAN PEDRO DE CAJAS">SAN PEDRO DE CAJAS</option>
                <option value="TAPO">TAPO</option>
                <option value="LA OROYA">LA OROYA</option>
                <option value="CHACAPALPA">CHACAPALPA</option>
                <option value="HUAY-HUAY">HUAY-HUAY</option>
                <option value="MARCAPOMACOCHA">MARCAPOMACOCHA</option>
                <option value="MOROCOCHA">MOROCOCHA</option>
                <option value="PACCHA">PACCHA</option>
                <option value="SANTA BARBARA DE CARHUACAYAN">
                  SANTA BARBARA DE CARHUACAYAN
                </option>
                <option value="SUITUCANCHA">SUITUCANCHA</option>
                <option value="YAULI">YAULI</option>
                <option value="SANTA ROSA DE SACCO">SANTA ROSA DE SACCO</option>
                <option value="SATIPO">SATIPO</option>
                <option value="COVIRIALI">COVIRIALI</option>
                <option value="LLAYLLA">LLAYLLA</option>
                <option value="MZAMARI">MAZAMARI</option>
                <option value="PAMPA HERMOSA">PAMPA HERMOSA</option>
                <option value="PANGOA">PANGOA</option>
                <option value="RIO NEGRO">RIO NEGRO</option>
                <option value="RIO TAMBO">RIO TAMBO</option>
                <option value="VIZCATAN DEL ENE">VIZCATAN DEL ENE</option>
                <option value="CHANCHAMAYO">CHANCHAMAYO</option>
                <option value="SAN RAMON">SAN RAMON</option>
                <option value="VITOC">VITOC</option>
                <option value="SAN LUIS DE SHUARO">SAN LUIS DE SHUARO</option>
                <option value="PICHANAQUI">PICHANAQUI</option>
                <option value="PERENE">PERENE</option>
                <option value="CHUPACA">CHUPACA</option>
                <option value="AHUAC">AHUAC</option>
                <option value="CHONGOS BAJO">CHONGOS BAJO</option>
                <option value="HUACHAC">HUACHAC</option>
                <option value="HUAMANCACA CHICO">HUAMANCACA CHICO</option>
                <option value="SAN JUAN DE ISCOS">SAN JUAN DE ISCOS</option>
                <option value="SAN JUAN DE JARPA">SAN JUAN DE JARPA</option>
                <option value="TRES DE DICIEMBRE">TRES DE DICIEMBRE</option>
                <option value="YANACANCHA">YANACANCHA</option>
                <option value="TRUJILLO">TRUJILLO</option>
                <option value="HUANCHACO">HUANCHACO</option>
                <option value="LAREDO">LAREDO</option>
                <option value="MOCHE">MOCHE</option>
                <option value="SALAVERRY">SALAVERRY</option>
                <option value="SIMBAL">SIMBAL</option>
                <option value="VICTOR LARCO HERRERA">
                  VICTOR LARCO HERRERA
                </option>
                <option value="POROTO">POROTO</option>
                <option value="EL PORVENIR">EL PORVENIR</option>
                <option value="LA ESPERANZA">LA ESPERANZA</option>
                <option value="FLORENCIA DE MORA">FLORENCIA DE MORA</option>
                <option value="BOLIVAR">BOLIVAR</option>
                <option value="BAMBAMARCA">BAMBAMARCA</option>
                <option value="CONDORMARCA">CONDORMARCA</option>
                <option value="LONGOTEA">LONGOTEA</option>
                <option value="UCUNCHA">UCUNCHA</option>
                <option value="UCHUMARCA">UCHUMARCA</option>
                <option value="HUAMACHUCO">HUAMACHUCO</option>
                <option value="COCHORCO">COCHORCO</option>
                <option value="CURGOS">CURGOS</option>
                <option value="CHUGBAY">CHUGBAY</option>
                <option value="MARCABAL">MARCABAL</option>
                <option value="SANAGORAN">SANAGORAN</option>
                <option value="SARIN">SARIN</option>
                <option value="SARTIMBAMBA">SARTIMBAMBA</option>
                <option value="OTUZCO">OTUZCO</option>
                <option value="AGALLPAMPA">AGALLPAMPA</option>
                <option value="CHARAT">CHARAT</option>
                <option value="HUARANCHAL">HUARANCHAL</option>
                <option value="LA CUESTA">LA CUESTA</option>
                <option value="PARANDAY">PARANDAY</option>
                <option value="SALPO">SALPO</option>
                <option value="SINSICAP">SINSICAP</option>
                <option value="USQUIL">USQUIL</option>
                <option value="MACHE">MACHE</option>
                <option value="SAN PEDRO DE LLOO">SAN PEDRO DE LLOO</option>
                <option value="GUADALUPE">GUADALUPE</option>
                <option value="JEQUETEPEQUE">JEQUETEPEQUE</option>
                <option value="PACASMAYO">PACASMAYO</option>
                <option value="SAN JOSE">SAN JOSE</option>
                <option value="TAYABAMBA">TAYABAMBA</option>
                <option value="BULDIBUYO">BULDIBUYO</option>
                <option value="CHILLIA">CHILLIA</option>
                <option value="HUAYLILLAS">HUAYLILLAS</option>
                <option value="HUANCASPATA">HUANCASPATA</option>
                <option value="HUAYO">HUAYO</option>
                <option value="ONGON">ONGON</option>
                <option value="PARCOY">PARCOY</option>
                <option value="PATAZ">PATAZ</option>
                <option value="PIAS">PIAS</option>
                <option value="TAURIJA">TAURIJA</option>
                <option value="URPAY">URPAY</option>
                <option value="SANTIAGO DE CHALLAS">SANTIAGO DE CHALLAS</option>

                <option value="SANTIAGO DE CHUCO">SANTIAGO DE CHUCO</option>
                <option value="CACHICADAN">CACHICADAN</option>
                <option value="MOLLEBAMBA">MOLLEBAMBA</option>
                <option value="MOLLEPATA">MOLLEPATA</option>
                <option value="QUIRUVILCA">QUIRUVILCA</option>
                <option value="SANTA CRUZ DE CHUCA">SANTA CRUZ DE CHUCA</option>
                <option value="SITABAMBA">SITABAMBA</option>
                <option value="ANGASMARCA">ANGASMARCA</option>
                <option value="ASCOPE">ASCOPE</option>
                <option value="CHICAMA">CHICAMA</option>
                <option value="CHOCOPE">CHOCOPE</option>
                <option value="SANTIAGO DE CAO">SANTIAGO DE CAO</option>
                <option value="MAGDALENA DE CAO">MAGDALENA DE CAO</option>
                <option value="PAIJAN">PAIJAN</option>
                <option value="RAZURI">RAZURI</option>
                <option value="CASA GRANDE">CASA GRANDE</option>
                <option value="CHEPEN">CHEPEN</option>
                <option value="PACANGA">PACANGA</option>
                <option value="PUEBLO NUEVO">PUEBLO NUEVO</option>
                <option value="JULCAN">JULCAN</option>
                <option value="CARABAMBA">CARABAMBA</option>
                <option value="CALAMARCA">CALAMARCA</option>
                <option value="HUASO">HUASO</option>
                <option value="CASCAS">CASCAS</option>
                <option value="LUCMA">LUCMA</option>
                <option value="MARMOT">MARMOT</option>
                <option value="SAYAPULLO">SAYAPULLO</option>
                <option value="VIRU">VIRU</option>
                <option value="CHAO">CHAO</option>
                <option value="GUADALUPITO">GUADALUPITO</option>
                <option value="CHICLAYO">CHICLAYO</option>
                <option value="CHONGOYAPE">CHONGOYAPE</option>
                <option value="ETEN">ETEN</option>
                <option value="ETEN PUERTO">ETEN PUERTO</option>
                <option value="LAGUNAS">LAGUNAS</option>
                <option value="MONSEFU">MONSEFU</option>
                <option value="NUEVA ARICA">NUEVA ARICA</option>
                <option value="OYOTUN">OYOTUN</option>
                <option value="PICSI">PICSI</option>
                <option value="PIMENTEL">PIMENTEL</option>
                <option value="REQUE">REQUE</option>
                <option value="JOSE LEONARDO ORTIZ">JOSE LEONARDO ORTIZ</option>
                <option value="SANTA ROSA">SANTA ROSA</option>
                <option value="SAÑA">SAÑA</option>
                <option value="LA VICTORIA">LA VICTORIA</option>
                <option value="CAYALTI">CAYALTI</option>
                <option value="PATAPO">PATAPO</option>
                <option value="POMALCA">POMALCA</option>
                <option value="PUCALA">PUCALA</option>
                <option value="TUMAN">TUMAN</option>
                <option value="FERREÑAFE">FERREÑAFE</option>
                <option value="INCAHUASI">INCAHUASI</option>
                <option value="CAÑARIS">CAÑARIS</option>
                <option value="PITIPO">PITIPO</option>
                <option value="PUEBLO NUEVO">PUEBLO NUEVO</option>
                <option value="MANUEL ANTONIO MESONES MURO">
                  MANUEL ANTONIO MESONES MURO
                </option>
                <option value="LAMBAYEQUE">LAMBAYEQUE</option>
                <option value="CHOCHOPE">CHOCHOPE</option>
                <option value="ILLIMO">ILLIMO</option>
                <option value="JAYANCA">JAYANCA</option>
                <option value="MOCHUMI">MOCHUMI</option>
                <option value="MORROPE">MORROPE</option>
                <option value="MOTUPE">MOTUPE</option>
                <option value="OLMOS">OLMOS</option>
                <option value="PACORA">PACORA</option>
                <option value="SALAS">SALAS</option>
                <option value="SAN JOSE">SAN JOSE</option>
                <option value="TUCUME">TUCUME</option>
                <option value="LIMA">LIMA</option>
                <option value="ANCON">ANCON</option>
                <option value="ATE">ATE</option>
                <option value="BREÑA">BREÑA</option>
                <option value="CARABAYLLO">CARABAYLLO</option>
                <option value="COMAS">COMAS</option>
                <option value="CHACLACAYO">CHACLACAYO</option>
                <option value="CHORRILLOS">CHORRILLOS</option>
                <option value="LA VICTORIA">LA VICTORIA</option>
                <option value="LA MOLINA">LA MOLINA</option>
                <option value="LINCE">LINCE</option>
                <option value="LURIGANCHO">LURIGANCHO</option>
                <option value="LURIN">LURIN</option>
                <option value="MAGDALENA DEL MAR">MAGDALENA DEL MAR</option>
                <option value="MIRAFLORES">MIRAFLORES</option>
                <option value="PACHACAMAC">PACHACAMAC</option>
                <option value="PUEBLO LIBRE">PUEBLO LIBRE</option>
                <option value="PUCUSANA">PUCUSANA</option>
                <option value="PUENTE PIEDRA">PUENTE PIEDRA</option>
                <option value="PUNTA HERMOSA">PUNTA HERMOSA</option>
                <option value="PUNTA NEGRA">PUNTA NEGRA</option>
                <option value="RIMAC">RIMAC</option>
                <option value="SAN BARTOLO">SAN BARTOLO</option>
                <option value="SAN ISIDRO">SAN ISIDRO</option>
                <option value="BARRANCO">BARRANCO</option>
                <option value="SAN MARTIN DE PORRES">
                  SAN MARTIN DE PORRES
                </option>
                <option value="SAN MIGUEL">SAN MIGUEL</option>
                <option value="SANTA MARIA DEL MAR">SANTA MARIA DEL MAR</option>
                <option value="SANTA ROSA">SANTA ROSA</option>
                <option value="SANTIAGO DE SURCO">SANTIAGO DE SURCO</option>
                <option value="SURQUILLO">SURQUILLO</option>
                <option value="VILLA MARIA DEL TRIUNFO">
                  VILLA MARIA DEL TRIUNFO
                </option>
                <option value="JESUS MARIA">JESUS MARIA</option>
                <option value="INDEPENDENCIA">INDEPENDENCIA</option>
                <option value="EL AGUSTINO">EL AGUSTINO</option>
                <option value="SAN JUAN DE MIRAFLORES">
                  SAN JUAN DE MIRAFLORES
                </option>
                <option value="SAN JUAN DE LURIGANCHO">
                  SAN JUAN DE LURIGANCHO
                </option>
                <option value="SAN LUIS">SAN LUIS</option>
                <option value="CIENEGUILLA">CIENEGUILLA</option>
                <option value="SAN BORJA">SAN BORJA</option>
                <option value="VILLA EL SALVADOR">VILLA EL SALVOR</option>
                <option value="LOS OLIVOS">LOS OLIVOS</option>
                <option value="SANTA ANITA">SANTA ANITA</option>
                <option value="CAJATAMBO">CAJATAMBO</option>
                <option value="COPA">COPA</option>
                <option value="GORGOR">GORGOR</option>
                <option value="HUANCAPON">HUANCAPON</option>
                <option value="MANAS">MANAS</option>
                <option value="CANTA">CANTA</option>
                <option value="ARAHUAY">ARAHUAY</option>
                <option value="HUAMANTANGA">HUAMANTANGA</option>
                <option value="HUAROS">HUAROS</option>
                <option value="LACHAQUI">LACHAQUI</option>
                <option value="SAN BUENAVENTURA">SAN BUENAVENTURA</option>
                <option value="SANTA ROSA DE QUIVES">
                  SANTA ROSA DE QUIVES
                </option>
                <option value="SAN VICENTE DE CAÑETE">
                  SAN VICENTE DE CAÑETE
                </option>
                <option value="CALANGO">CALANGO</option>
                <option value="CERRO AZUL">CERRO AZUL</option>
                <option value="COAYLLO">COAYLLO</option>
                <option value="CHILCA">CHILCA</option>
                <option value="IMPERIAL">IMPERIAL</option>
                <option value="LUNAHUANA">LUNAHUANA</option>
                <option value="MALA">MALA</option>
                <option value="NUEVO IMPERIAL">NUEVO IMPERIAL</option>
                <option value="PACARAN">PACARAN</option>
                <option value="QUILMANA">QUILMANA</option>
                <option value="SAN ANTONIO">SAN ANTONIO</option>
                <option value="SAN LUIS">SAN LUIS</option>
                <option value="SANTA CRUZ DE FLORES">
                  SANTA CRUZ DE FLORES
                </option>
                <option value="ZUÑIGA">ZUÑIGA</option>
                <option value="ASIA">ASIA</option>
                <option value="HUACHO">HUACHO</option>
                <option value="AMBAR">AMBAR</option>
                <option value="CALETA DE CARQUIN">CALETA DE CARQUIN</option>
                <option value="CHECRAS">CHECRAS</option>
                <option value="HUALMAY">HUALMAY</option>
                <option value="HUAURA">HUAURA</option>
                <option value="LEONCIO PRADO">LEONCIO PRADO</option>
                <option value="PACCHO">PACCHO</option>
                <option value="SANTA LEONOR">SANTA LEONOR</option>
                <option value="SANTA MARIA">SANTA MARIA</option>
                <option value="SAYAN">SAYAN</option>
                <option value="VEGUETA">VEGUETA</option>
                <option value="MATUCANA">MATUCANA</option>
                <option value="ANTIOQUIA">ANTIOQUIA</option>
                <option value="CALLAHUANCA">CALLAHUANCA</option>
                <option value="CARAMPOMA">CARAMPOMA</option>
                <option value="CHICLA">CHICLA</option>
                <option value="HUANZA">HUANZA</option>
                <option value="HUAROCHIRI">HUAROCHIRI</option>
                <option value="LAHUAYTAMBO">LAHUAYTAMBO</option>
                <option value="LANGA">LANGA</option>
                <option value="MARIATANA">MARIATANA</option>
                <option value="RICARDO PALMA">RICARDO PALMA</option>
                <option value="SAN ANDRES DE TUPICOCHA">
                  SAN ANDRES DE TUPICOCHA
                </option>
                <option value="SAN ANTONIO">SAN ANTONIO</option>
                <option value="SAN BARTOLOME">SAN BARTOLOME</option>
                <option value="SAN DAMIAN">SAN DAMIAN</option>
                <option value="SANGALLAYA">SANGALLAYA</option>
                <option value="SAN JUAN DE TANTARANCHE">
                  SAN JUAN DE TANTARANCHE
                </option>
                <option value="SAN LORENZO DE QUINTI">
                  SAN LORENZO DE QUINTI
                </option>
                <option value="SAN MATEO">SAN MATEO</option>
                <option value="SAN MATEO DE OTAO">SAN MATEO DE OTAO</option>
                <option value="SAN PEDRO DE HUANCAYRE">
                  SAN PEDRO DE HUANCAYRE
                </option>
                <option value="SANTA CRUZ DE COCACHACRA">
                  SANTA CRUZ DE COCACHACRA
                </option>
                <option value="SANTA EULALIA">SANTA EULALIA</option>
                <option value="SANTIAGO DE ANCHUCAYA">
                  SANTIAGO DE ANCHUCAYA
                </option>
                <option value="SANTIAGO DE TUNA">SANTIAGO DE TUNA</option>
                <option value="SANTO DOMINGO DE LOS OLLEROS">
                  SANTO DOMINGO DE LOS OLLEROS
                </option>
                <option value="SURCO">SURCO</option>
                <option value="HUACHUPAMPA">HUACHUPAMPA</option>
                <option value="SAN PEDRO DE LARAOS">SAN PEDRO DE LARAOS</option>
                <option value="SAN JUAN DE IRIS">SAN JUAN DE IRIS</option>
                <option value="YAUYOS">YAUYOS</option>
                <option value="ALIS">ALIS</option>
                <option value="ALLAUCA">ALLAUCA</option>

                <option value="YAUYOS">YAUYOS</option>
                <option value="SAN JOAQUIN">SAN JOAQUIN</option>
                <option value="SAN PEDRO DE PILAS">SAN PEDRO DE PILAS</option>
                <option value="TANTA">TANTA</option>
                <option value="TAURIPAMPA">TAURIPAMPA</option>
                <option value="ATAVILLOS ALTO">ATAVILLOS ALTO</option>
                <option value="ATAVILLOS BAJO">ATAVILLOS BAJO</option>
                <option value="AUCALLAMA">AUCALLAMA</option>
                <option value="CHANCAY">CHANCAY</option>
                <option value="IHUARI">IHUARI</option>
                <option value="LAMPIAN">LAMPIAN</option>
                <option value="PACARAOS">PACARAOS</option>
                <option value="SAN MIGUEL DE ACOS">SAN MIGUEL DE ACOS</option>
                <option value="VEINTISIETE DE NOVIEMBRE">
                  VEINTISIETE DE NOVIEMBRE
                </option>
                <option value="SANTA CRUZ DE ANDAMARCA">
                  SANTA CRUZ DE ANDAMARCA
                </option>
                <option value="SUMBILCA">SUMBILCA</option>
                <option value="BARRANCA">BARRANCA</option>
                <option value="PARAMONGA">PARAMONGA</option>
                <option value="PATIVILCA">PATIVILCA</option>
                <option value="SUPE">SUPE</option>
                <option value="SUPE PUERTO">SUPE PUERTO</option>
                <option value="OYON">OYON</option>
                <option value="NAVAN">NAVAN</option>
                <option value="CAUJUL">CAUJUL</option>
                <option value="ANDAJES">ANDAJES</option>
                <option value="PACHANGARA">PACHANGARA</option>
                <option value="COCHAMARCA">COCHAMARCA</option>
                <option value="IQUITOS">IQUITOS</option>
                <option value="ALTO NANAY">ALTO NANAY</option>
                <option value="FERNANDO LORES">FERNANDO LORES</option>
                <option value="LAS AMAZONAS">LAS AMAZONAS</option>
                <option value="MAZAN">MAZAN</option>
                <option value="NAPO">NAPO</option>
                <option value="TORRES CAUSANA">TORRES CAUSANA</option>
                <option value="INDIANA">INDIANA</option>
                <option value="PUNCHANA">PUNCHANA</option>
                <option value="BELEN">BELEN</option>
                <option value="SAN JUAN BAUTISTA">SAN JUAN BAUTISTA</option>
                <option value="YURIMAGUAS">YURIMAGUAS</option>
                <option value="BALSAPUERTO">BALSAPUERTO</option>
                <option value="JEBEROS">JEBEROS</option>
                <option value="LAGUNAS">LAGUNAS</option>
                <option value="SANTA CRUZ">SANTA CRUZ</option>
                <option value="TENIENTE CESAR LOPEZ ROJAS">
                  TENIENTE CESAR LOPEZ ROJAS
                </option>
                <option value="NAUTA">NAUTA</option>
                <option value="PARINARI">PARINARI</option>
                <option value="TIGRE">TIGRE</option>
                <option value="URARINAS">URARINAS</option>
                <option value="TROMPETEROS">TROMPETEROS</option>
                <option value="REQUENA">REQUENA</option>
                <option value="ALTO TAPICHE">ALTO TAPICHE</option>
                <option value="CAPELO">CAPELO</option>
                <option value="EMILIO SAN MARTIN">EMILIO SAN MARTIN</option>
                <option value="MAGUIA">MAGUIA</option>
                <option value="PUINAHUA">PUINAHUA</option>
                <option value="SAQUENA">SAQUENA</option>
                <option value="SOPLIN">SOPLIN</option>
                <option value="TAPICHE">TAPICHE</option>
                <option value="JENARO HERRERA">JENARO HERRERA</option>
                <option value="YAQUERANA">YAQUERANA</option>
                <option value="CONTAMANA">CONTAMANA</option>
                <option value="VARGAS GUERRA">VARGAS GUERRA</option>
                <option value="PADRE MARQUEZ">PADRE MARQUEZ</option>
                <option value="PAMPA HERMOSA">PAMPA HERMOSA</option>
                <option value="SARAYACU">SARAYACU</option>
                <option value="INAHUAYA">INAHUAYA</option>
                <option value="RAMON CASTILLA">RAMON CASTILLA</option>
                <option value="PEBAS">PEBAS</option>
                <option value="YAVARI">YAVARI</option>
                <option value="SAN PABLO">SAN PABLO</option>
                <option value="BARRANCA">BARRANCA</option>
                <option value="ANDOAS">ANDOAS</option>
                <option value="CAHUAPANAS">CAHUAPANAS</option>
                <option value="MANSERICHE">MANSERICHE</option>
                <option value="MORONA">MORONA</option>
                <option value="PASTAZA">PASTAZA</option>
                <option value="PUTUMAYO">PUTUMAYO</option>
                <option value="ROSA PANDURO">ROSA PANDURO</option>
                <option value="TENIENTE MANUEL CLAVERO">
                  TENIENTE MANUEL CLAVERO
                </option>
                <option value="YAGUAS">YAGUAS</option>
                <option value="TAMBOPATA">TAMBOPATA</option>
                <option value="INAMBARI">INAMBARI</option>
                <option value="LAS PIEDRAS">LAS PIEDRAS</option>
                <option value="LABERINTO">LABERINTO</option>
                <option value="MANU">MANU</option>
                <option value="FITZCARRALD">FITZCARRALD</option>
                <option value="MADRE DE DIOS">MADRE DE DIOS</option>
                <option value="HUEPETUHE">HUEPETUHE</option>
                <option value="IÑAPARI">IÑAPARI</option>
                <option value="IBERIA">IBERIA</option>
                <option value="TAHUAMANU">TAHUAMANU</option>
                <option value="MOQUEGUA">MOQUEGUA</option>
                <option value="CARUMAS">CARUMAS</option>
                <option value="CUCHUMBAYA">CUCHUMBAYA</option>
                <option value="SAN CRISTOBAL">SAN CRISTOBAL</option>
                <option value="TORATA">TORATA</option>
                <option value="SAMEGUA">SAMEGUA</option>
                <option value="OMATE">OMATE</option>
                <option value="COALAQUE">COALAQUE</option>
                <option value="CHOJATA">CHOJATA</option>
                <option value="ICHUÑA">ICHUÑA</option>
                <option value="LA CAPILLA">LA CAPILLa</option>
                <option value="LLOQUE">LLOQUE</option>
                <option value="MATALAQUE">MATALAQUE</option>
                <option value="PUQUINA">PUQUINA</option>
                <option value="QUINISTAQUILLAS">QUINISTAQUILLAS</option>
                <option value="UBINAS">UBINAS</option>
                <option value="YUNGA">YUNGA</option>
                <option value="ILO">ILO</option>
                <option value="EL ALGARROBAL">EL ALGARROBAL</option>
                <option value="PACOCHA">PACOCHA</option>
                <option value="CHAUPIMARCA">CHAUPIMARCA</option>
                <option value="HUACHON">HUACHON</option>
                <option value="HUARIACA">HUARIACA</option>
                <option value="HUAYLLAY">HUAYLLAY</option>
                <option value="NINACACA">NINACACA</option>
                <option value="PALLANCHACRA">PALLANCHACRA</option>
                <option value="PAUCARTAMBO">PAUCARTAMBO</option>
                <option value="SAN FRANCISCO DE ASIS DE YARUSYACAN">
                  SAN FRANCISCO DE ASIS DE YARUSYACAN
                </option>
                <option value="SIMON BOLIVAR">SIMON BOLIVAR</option>
                <option value="TICLACAYAN">TICLACAYAN</option>
                <option value="TINYAHUARCO">TINYAHUARCO</option>
                <option value="VICCO">VICCO</option>
                <option value="YANACANCHA">YANACANCHA</option>
                <option value="YANAHUANCA">YANAHUANCA</option>
                <option value="CHACAYAN">CHACAYAN</option>
                <option value="GOYLLARISQUIZGA">GOYLLARISQUIZGA</option>
                <option value="PAUCAR">PAUCAR</option>
                <option value="SAN PEDRO DE PILLAO">SAN PEDRO DE PILLAO</option>
                <option value="SANTA ANA DE TUSI">SANTA ANA DE TUSI</option>
                <option value="TAPUC">TAPUC</option>
                <option value="VILCABAMBA">VILCABAMBA</option>
                <option value="OXAPAMPA">OXAPAMPA</option>
                <option value="CHONTABAMBA">CHONTABAMBA</option>
                <option value="HUANCABAMBA">HUANCABAMBA</option>
                <option value="PUERTO BERMUDEZ">PUERTO BERMUDEZ</option>
                <option value="VILLA RICA">VILLA RICA</option>
                <option value="POZUZO">POZUZO</option>
                <option value="PALCAZU">PALCAZU</option>
                <option value="CONSTITUCION">CONSTITUCION</option>
                <option value="PIURA">PIURA</option>
                <option value="CASTILLA">CASTILLA</option>
                <option value="CATACAOS">CATACAOS</option>
                <option value="LA ARENA">LA ARENA</option>
                <option value="LA UNION">LA UNION</option>
                <option value="LAS LOMAS">LAS LOMAS</option>
                <option value="TAMBO GRANDE">TAMBO GRANDE</option>
                <option value="CURA MORI">CURA MORI</option>
                <option value="EL TALLAN">EL TALLAN</option>
                <option value="VEINTISEIS DE OCTUBRE">
                  VEINTISEIS DE OCTUBRE
                </option>
                <option value="AYABACA">AYABACA</option>
                <option value="FRIAS">FRIAS</option>
                <option value="LAGUNAS">LAGUNAS</option>
                <option value="MONTERO">MONTERO</option>
                <option value="PACAPAMBA">PACAPAMBA</option>
                <option value="SAPILLICA">SAPILLICA</option>
                <option value="SICCHEZ">SICCHEZ</option>
                <option value="SUYO">SUYO</option>
                <option value="JILILI">JILILI</option>
                <option value="PAMAS">PAMAS</option>
                <option value="HUANCABAMBA">HUANCABAMBA</option>
                <option value="CANCHAQUE">CANCHAQUE</option>
                <option value="HUARMACA">HUARMACA</option>
                <option value="SONDOR">SONDOR</option>
                <option value="SONDORILLO">SONDORILLO</option>
                <option value="EL CARMEN DE LA FRONTERA">
                  EL CARMEN DE LA FRONTERA
                </option>
                <option value="SAN MIGUEL DE EL FAIQUE">
                  SAN MIGUEL DE EL FAIQUE
                </option>
                <option value="LALAQUIZ">LALAQUIZ</option>
                <option value="CHULUCANAS">CHULUCANAS</option>
                <option value="BUENOS AIRES">BUENOS AIRES</option>
                <option value="CHALACO">CHALACO</option>
                <option value="MORROPON">MORROPON</option>
                <option value="SALITRAL">SALITRAL</option>
                <option value="SANTA CATALINA DE MOSSA">
                  SANTA CATALINA DE MOSSA
                </option>
                <option value="SANTO DOMINGO">SANTO DOMINGO</option>
                <option value="LA MATANZA">LA MATANZA</option>
                <option value="YAMANGO">YAMANGO</option>
                <option value="SAN JUAN DE BIGOTE">SAN JUAN DE BIGOTE</option>
                <option value="PAITA">PAITA</option>
                <option value="AMOTAPE">AMOTAPE</option>
                <option value="ARENAL">ARENAL</option>
                <option value="LA HUACA">LA HUACA</option>
                <option value="COLAN">COLAN</option>
                <option value="TAMARINDO">TAMARINDO</option>
                <option value="VICHAYAL">VICHAYAL</option>
                <option value="SULLANA">SULLANA</option>
                <option value="BELLAVISTA">BELLAVISTA</option>
                <option value="LANCONES">LANCONES</option>
                <option value="MARCAVELICA">MARCAVELICA</option>
                <option value="MIGUEL CHECA">MIGUEL CHECA</option>
                <option value="QUERECOTILLO">QUERECOTILLO</option>
                <option value="SALITRAL">SALITRAL</option>
                <option value="IGNACIO ESCUDERO">IGNACIO ESCUDERO</option>
                <option value="PARIÑAS">PARIÑAS</option>
                <option value="EL ALTO">EL ALTO</option>
                <option value="LA BREA">LA BREA</option>
                <option value="LOBITOS">LOBITOS</option>
                <option value="MANCORA">MANCORA</option>
                <option value="LOS ORGANOS">LOS ORGANOS</option>
                <option value="SECHURA">SECHURA</option>
                <option value="VICE">VICE</option>
                <option value="BERNAL">BERNAL</option>
                <option value="BELLAVISTA DE LA UNION">
                  BELLAVISTA DE LA UNION
                </option>
                <option value="CRISTO NOS VALGA">CRISTO NOS VALGA</option>
                <option value="RINCONADA LLICUAR">RINCONADA LLICUAR</option>
                <option value="PUNO">PUNO</option>
                <option value="ACORA">ACORA</option>
                <option value="ATUNCOLLA">ATUNCOLLA</option>
                <option value="CAPACHICA">CAPACHICA</option>
                <option value="COATA">COATA</option>
                <option value="CHUCUITO">CHUCUITO</option>
                <option value="HUATA">HUATA</option>
                <option value="MAÑAZO">MAÑAZO</option>
                <option value="PAUCARCOLLA">PAUCARCOLLA</option>
                <option value="PICHACANI">PICHACANI</option>
                <option value="SAN ANTONIO">SAN ANTONIO</option>
                <option value="TIQUILLACA">TIQUILLACA</option>
                <option value="VILQUE">VILQUE</option>
                <option value="PLATERIA">PLATERIA</option>
                <option value="AMANTANI">AMANTANI</option>
                <option value="AZANGARO">AZANGARO</option>
                <option value="ACHAYA">ACHAYA</option>
                <option value="ARAPA">ARAPA</option>
                <option value="ASILLO">ASILLO</option>
                <option value="CAMINACA">CAMINACA</option>
                <option value="CHUPA">CHUPA</option>
                <option value="JOSE DOMINGO CHOQUEHUANCA">
                  JOSE DOMINGO CHOQUEHUANCA
                </option>
                <option value="MUÑANI">MUÑANI</option>
                <option value="POTONI">POTONI</option>
                <option value="SAMAN">SAMAN</option>
                <option value="SAN ANTON">SAN ANTON</option>
                <option value="SAN JOSE">SAN JOSE</option>
                <option value="SAN JUAN DE SALINAS">SAN JUAN DE SALINAS</option>
                <option value="SANTIAGO DE PUPUJA">SANTIAGO DE PUPUJA</option>
                <option value="TIRAPATA">TIRAPATA</option>
                <option value="MACUSANI">MACUSANI</option>
                <option value="AJLLATA">AJLLATA</option>
                <option value="AYAPATA">AYAPATA</option>
                <option value="COASA">COASA</option>
                <option value="CORANI">CORANI</option>
                <option value="CRUCERO">CRUCERO</option>
                <option value="ITUATA">ITUATA</option>
                <option value="OLLACHEA">OLLACHEA</option>
                <option value="SAN GABAN">SAN GABAN</option>
                <option value="USICAYOS">USICAYOS</option>
                <option value="JULI">JULI</option>
                <option value="DESAGUADERO">DESAGUADERO</option>
                <option value="HUACULLANI">HUACULLANI</option>
                <option value="PISACOMA">PISACOMA</option>
                <option value="POMATA">POMATA</option>
                <option value="ZEPITA">ZEPITA</option>
                <option value="KELLUYO">KELLUYO</option>
                <option value="HUANCANE">HUANCANE</option>

                <option value="COJATA">COJATA</option>
                <option value="INCHUPALLA">INCHUPALLA</option>
                <option value="PUSI">PUSI</option>
                <option value="ROSASPATA">ROSASPATA</option>
                <option value="TARACO">TARACO</option>
                <option value="VILQUE CHICO">VILQUE CHICO</option>
                <option value="HUATASANI">HUATASANI</option>
                <option value="LAMPA">LAMPA</option>
                <option value="CABANILLA">CABANILLA</option>
                <option value="CALAPUJA">CALAPUJA</option>
                <option value="NICASIO">NICASIO</option>
                <option value="OCUVIRI">OCUVIRI</option>
                <option value="PALCA">PALCA</option>
                <option value="PARATIA">PARATIA</option>
                <option value="PUCARA">PUCARA</option>
                <option value="SANTA LUCIA">SANTA LUCIA</option>
                <option value="VILAVILA">VILAVILA</option>
                <option value="AYAVIRI">AYAVIRI</option>
                <option value="ANTAUTA">ANTAUTA</option>
                <option value="CUPI">CUPI</option>
                <option value="LLALLI">LLALLI</option>
                <option value="MACARI">MACARI</option>
                <option value="NUÑOA">NUÑOA</option>
                <option value="ORURILLO">ORURILLO</option>
                <option value="SANTA ROSA">SANTA ROSA</option>
                <option value="UMACHIRI">UMACHIRI</option>
                <option value="SANDIA">SANDIA</option>
                <option value="CUYOCUYO">CUYOCUYO</option>
                <option value="LIMBANI">LIMBANI</option>
                <option value="PHARA">PHARA</option>
                <option value="PATAMBUCO">PATAMBUCO</option>
                <option value="QUIACA">QUIACA</option>
                <option value="SAN JUAN DEL ORO">SAN JUAN DEL ORO</option>
                <option value="YANAHUAYA">YANAHUAYA</option>
                <option value="ALTO INAMBARI">ALTO INAMBARI</option>
                <option value="SAN PEDRO DE PUTINA PUNCO">
                  SAN PEDRO DE PUTINA PUNCO
                </option>
                <option value="JULIACA">JULIACA</option>
                <option value="CABANA">CABANA</option>
                <option value="CABANILLAS">CABANILLAS</option>
                <option value="CARACOTO">CARACOTO</option>
                <option value="SAN MIGUEL">SAN MIGUEL</option>
                <option value="YUNGUYO">YUNGUYO</option>
                <option value="UNICACHI">UNICACHI</option>
                <option value="ANAPIA">ANAPIA</option>
                <option value="CORANI">CORANI</option>
                <option value="CUTURAPI">CUTURAPI</option>
                <option value="OLLARAYA">OLLARAYA</option>
                <option value="TINICACHI">TINICACHI</option>
                <option value="PUTINA">PUTINA</option>
                <option value="PEDRO VILCA APAZA">PEDRO VILCA APAZA</option>
                <option value="QUILCAPUNCU">QUILCAPUNCU</option>
                <option value="ANANEA">ANANEA</option>
                <option value="SINA">SINA</option>
                <option value="ILAVE">ILAVE</option>
                <option value="PILCUYO">PILCUYO</option>
                <option value="SANTA ROSA">SANTA ROSA</option>
                <option value="CAPASO">CAPASO</option>
                <option value="CONDURIRI">CONDURIRI</option>
                <option value="MOHO">MOHO</option>
                <option value="CONIMA">CONIMA</option>
                <option value="TILALI">TILALI</option>
                <option value="HUAYRAPATA">HUAYRAPATA</option>
                <option value="MOYOBAMBA">MOYOBAMBA</option>
                <option value="CALZADA">CALZADA</option>
                <option value="HABANA">HABANA</option>
                <option value="JEPELACIO">JEPELACIO</option>
                <option value="SORITOR">SORITOR</option>
                <option value="YANTALO">YANTALO</option>
                <option value="SAPOSOA">SAPOSOA</option>
                <option value="PISCOYACU">PISCOYACU</option>
                <option value="SACANCHE">SACANCHE</option>
                <option value="TINGO DE SAPOSOA">TINGO DE SAPOSOA</option>
                <option value="ALTO SAPOSOA">ALTO SAPOSOA</option>
                <option value="EL ESLABON">EL ESLABON</option>
                <option value="LAMAS">LAMAS</option>
                <option value="BARRANQUITA">BARRANQUITA</option>
                <option value="CAYNARACHI">CAYNARACHI</option>
                <option value="CUÑUMBUQUI">CUÑUMBUQUI</option>
                <option value="PINTO RECODO">PINTO RECODO</option>
                <option value="RUMISAPA">RUMISAPA</option>
                <option value="SHANAO">SHANAO</option>
                <option value="TABALOSOS">TABALOSOS</option>
                <option value="ZAPATERO">ZAPATERO</option>
                <option value="ALONSO DE ALVARADO">ALONSO DE ALVARADO</option>
                <option value="SAN ROQUE DE CUMBAZA">
                  SAN ROQUE DE CUMBAZA
                </option>
                <option value="JUANJUI">JUANJUI</option>
                <option value="CAMPANILLA">CAMPANILLA</option>
                <option value="HUICUNGO">HUICUNGO</option>
                <option value="PACHIZA">PACHIZA</option>
                <option value="PAJARILLO">PAJARILLO</option>
                <option value="RIOJA">RIOJA</option>
                <option value="POSIC">POSIC</option>
                <option value="YORONGOS">YORONGOS</option>
                <option value="YURACYACU">YURACYACU</option>
                <option value="NUEVA CAJAMARCA">NUEVA CAJAMARCA</option>
                <option value="ELIAS SOPLIN VARGAS">ELIAS SOPLIN VARGAS</option>
                <option value="SAN FERNANDO">SAN FERNANDO</option>
                <option value="PARDO MIGUEL">PARDO MIGUEL</option>
                <option value="AWAJUN">AWAJUN</option>
                <option value="TARAPOTO">TARAPOTO</option>
                <option value="ALBERTO LEVEAU">ALBERTO LEVEAU</option>
                <option value="CACATACHI">CACATACHI</option>
                <option value="CHAZUTA">CHAZUTA</option>
                <option value="CHIPURANA">CHIPURANA</option>
                <option value="EL PORVENIR">EL PORVENIR</option>
                <option value="HUMBAYO">HUMBAYO</option>
                <option value="JUAN GUERRA">JUAN GUERRA</option>
                <option value="MORALES">MORALES</option>
                <option value="PARAPLAYA">PARAPLAYA</option>
                <option value="SAN ANTONIO">SAN ANTONIO</option>
                <option value="SAUCE">SAUCE</option>
                <option value="SHAPAJA">SHAPAJA</option>
                <option value="LA BANDA DE SHILCAYO">
                  LA BANDA DE SHILCAYO
                </option>
                <option value="BELLAVISTA">BELLAVISTA</option>
                <option value="SAN RAFAEL">SAN RAFAEL</option>
                <option value="SAN PABLO">SAN PABLO</option>
                <option value="ALTO BIAVO">ALTO BIAVO</option>
                <option value="HUALLAGA">HUALLAGA</option>
                <option value="BAJO BIAVO">BAJO BIAVO</option>
                <option value="TOCACHE">TOCACHE</option>
                <option value="NUEVO PROGRESO">NUEVO PROGRESO</option>
                <option value="POLVORA">POLVORA</option>
                <option value="SHUNTE">SHUNTE</option>
                <option value="UCHIZA">UCHIZA</option>
                <option value="PICOTA">PICOTA</option>
                <option value="BUENOS AIRES">BUENOS AIRES</option>
                <option value="CASPIZAPA">CASPIZAPA</option>
                <option value="PILLUANA">PILLUANA</option>
                <option value="PUCACACA">PUCACACA</option>
                <option value="SAN CRISTOBAL">SAN CRISTOBAL</option>
                <option value="SAN HILARION">SAN HILARION</option>
                <option value="TINGO DE PONASA">TINGO DE PONASA</option>
                <option value="TRES UNIDOS">TRES UNIDOS</option>
                <option value="SHAMBOYACU">SHAMBOYACU</option>
                <option value="SAN JOSE DE SISA">SAN JOSE DE SISA</option>
                <option value="AGUA BLANCA">AGUA BLANCA</option>
                <option value="SHATOJA">SHATOJA</option>
                <option value="SAN MARTIN">SAN MARTIN</option>
                <option value="SANTA ROSA">SANTA ROSA</option>
                <option value="TACNA">TACNA</option>
                <option value="CALANA">CALANA</option>
                <option value="INCLAN">INCLAN</option>
                <option value="PACHIA">PACHIA</option>
                <option value="PALCA">PALCA</option>
                <option value="POCOLLAY">POCOLLAY</option>
                <option value="SAMA">SAMA</option>
                <option value="ALTO DE LA ALIANZA">ALTO DE LA ALIANZA</option>
                <option value="CIUDAD NUEVA">CIUDAD NUEVA</option>
                <option value="CORONEL GREGORIO ALBARRACIN">
                  CORONEL GREGORIO ALBARRACIN
                </option>
                <option value="LA YARADA LOS PALOS">LA YARADA LOS PALOS</option>
                <option value="TARATA">TARATA</option>
                <option value="HEROES ALBARRACIN">HEROES ALBARRACIN</option>
                <option value="ESTIQUE">ESTIQUE</option>
                <option value="ESTIQUE PAMPA">ESTIQUE PAMPA</option>
                <option value="SITAJARA">SITAJARA</option>
                <option value="SUSAPAYA">SUSAPAYA</option>
                <option value="TARUCACHI">TARUCACHI</option>
                <option value="TICACO">TICACO</option>
                <option value="LOCUMBA">LOCUMBA</option>
                <option value="ITE">ITE</option>
                <option value="ILABAYA">ILABAYA</option>
                <option value="CANDARAVE">CANDARAVE</option>
                <option value="CAIRANI">CAIRANI</option>
                <option value="CURIBAYA">CURIBAYA</option>
                <option value="HUANUARA">HUANUARA</option>
                <option value="QUILAHUANI">QUILAHUANI</option>
                <option value="CAMILACA">CAMILACA</option>
                <option value="TUMBES">TUMBES</option>
                <option value="CORRALES">CORRALES</option>
                <option value="LA CRUZ">LA CRUZ</option>
                <option value="PAMPAS DE HOSPITAL">PAMPAS DE HOSPITAL</option>
                <option value="SAN JACINTO">SAN JACINTO</option>
                <option value="SAN JUAN DE LA VIRGEN">
                  SAN JUAN DE LA VIRGEN
                </option>
                <option value="ZORRITOS">ZORRITOS</option>
                <option value="CASITAS">CASITAS</option>
                <option value="CANOAS DE PUNTA SAL">CANOAS DE PUNTA SAL</option>
                <option value="ZARUMILLA">ZARUMILLA</option>
                <option value="MATAPALO">MATAPALO</option>
                <option value="PAPAYAL">PAPAYAL</option>
                <option value="AGUAS VERDES">AGUAS VERDES</option>
                <option value="CALLAO">CALLAO</option>
                <option value="BELLAVISTA">BELLAVISTA</option>
                <option value="LA PUNTA">LA PUNTA</option>
                <option value="CARMEN DE LA LEGUA REYNOSO">
                  CARMEN DE LA LEGUA REYNOSO
                </option>
                <option value="LA PERLA">LA PERLA</option>
                <option value="VENTANILLA">VENTANILLa</option>
                <option value="MI PERU">MI PERU</option>
                <option value="CALLERIA">CALLERIA</option>
                <option value="YARINACOCHA">YARINACOCHA</option>
                <option value="MASISEA">MASISEA</option>
                <option value="CAMPOVERDE">CAMPOVERDE</option>
                <option value="IPARIA">IPARIA</option>
                <option value="NUEVA REQUENA">NUEVA REQUENA</option>
                <option value="MANANTAY">MANANTAY</option>
                <option value="PADRE ABAD">PADRE ABAD</option>
                <option value="IRAZOLA">IRAZOLA</option>
                <option value="CURIMANA">CURIMANA</option>
                <option value="NESHUYA">NESHUYA</option>
                <option value="ALEXANDER VON HUMBOLDT">
                  ALEXANDER VON HUMBOLDT
                </option>
                <option value="RAYMONDI">RAYMONDI</option>
                <option value="TAHUANIA">TAHUANIA</option>
                <option value="YURUA">YURUA</option>
                <option value="SEPAHUA">SEPAHUA</option>
                <option value="PURUS">PURUS</option>
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

// Componente principal del modal cliente
function ModalCliente({ onClose, onClienteCreado, clienteEditando }) {
  const [loading, setLoading] = useState(false);
  const [consultandoRENIEC, setConsultandoRENIEC] = useState(false);
  const [mensajeRENIEC, setMensajeRENIEC] = useState("");
  const [ubigeos, setUbigeos] = useState(ubigeosIniciales);
  const [modalUbigeoOpen, setModalUbigeoOpen] = useState(false);
  // Evita que el número de documento cambie el tipo seleccionado manualmente
  const [seleccionManualTipoDoc, setSeleccionManualTipoDoc] = useState(false);
  const [clienteData, setClienteData] = useState({
    nombre: "",
    tipoDocumento: "DNI",
    numeroDocumento: "",
    direccion: "",
    telefono: "",
    email: "",
    codInterno: "",
    pais: "Perú",
    ubigeo: "",
    departamento: "",
    provincia: "",
    distrito: "",
  });

  // Efecto para cargar datos del cliente cuando está en modo edición
  useEffect(() => {
    if (clienteEditando) {
      setClienteData({
        nombre: clienteEditando.nombre || "",
        tipoDocumento: clienteEditando.tipoDocumento || "DNI",
        numeroDocumento: clienteEditando.numeroDocumento || "",
        direccion: clienteEditando.direccion || "",
        telefono: clienteEditando.telefono || "",
        email: clienteEditando.email || "",
        codInterno: clienteEditando.codInterno || "",
        pais: clienteEditando.pais || "Perú",
        ubigeo: clienteEditando.ubigeo || "",
        departamento: clienteEditando.departamento || "",
        provincia: clienteEditando.provincia || "",
        distrito: clienteEditando.distrito || "",
      });

      // Establecer los valores seleccionados para los dropdowns
      if (clienteEditando.departamento)
        setDepartamentoSeleccionado(clienteEditando.departamento);
      if (clienteEditando.provincia)
        setProvinciaSeleccionada(clienteEditando.provincia);
      if (clienteEditando.distrito)
        setDistritoSeleccionado(clienteEditando.distrito);
    }
  }, [clienteEditando]);

  // Lista de países disponibles
  const paises = [
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
    "Perú",
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
    "Zimbabue",
  ];

  const [paisesFiltrados, setPaisesFiltrados] = useState(paises);
  const [busquedaPais, setBusquedaPais] = useState("");
  const [mostrarListaPaises, setMostrarListaPaises] = useState(false);

  // Estados para ubigeo
  const [busquedaUbigeo, setBusquedaUbigeo] = useState("");
  const [mostrarListaUbigeos, setMostrarListaUbigeos] = useState(false);

  // Datos de ejemplo del cliente REXTIE
  const datosRextie = {
    nombre: "REXTIE S.A.C./ REXI SERVICIOS FINANCIEROS",
    tipoDocumento: "RUC",
    numeroDocumento: "20601030013",
    direccion: "AV. JOSE GALVEZ BARRENECHEA NRO 566 INT. 101 URB. CORPAC",
    telefono: "987654321",
    email: "contacto@rextie.com",
    codInterno: "CLI001",
    pais: "Perú",
    ubigeo: "150101",
  };

  // Datos de ejemplo con DNI
  const datosDNI = {
    nombre: "",
    tipoDocumento: "DNI",
    numeroDocumento: "71496588",
    direccion: "",
    telefono: "987654321",
    email: "cliente@example.com",
    codInterno: "CLI002",
    pais: "Perú",
    ubigeo: "150101",
  };

  const cargarDatosRextie = () => {
    setClienteData(datosRextie);
    setMensajeRENIEC("");
  };

  const cargarDatosDNI = () => {
    setClienteData(datosDNI);
    setMensajeRENIEC("");
  };

  // Estados para selección de ubigeo horizontal
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState("");
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState("");
  const [distritoSeleccionado, setDistritoSeleccionado] = useState("");
  const [consultaAutomatica, setConsultaAutomatica] = useState(false);

  // Función para obtener la longitud máxima según el tipo de documento
  const getMaxLength = (tipoDocumento) => {
    switch (tipoDocumento) {
      case "RUC":
        return 11;
      case "DNI":
        return 8;
      case "CE":
        return 12;
      case "PASAPORTE":
        return 12;
      case "Doc.trib.no.dom.sin.ruc":
        return 15;
      case "CARNE_SOLIC_REFUGIO":
        return 12;
      case "C_IDENT_RREE":
        return 12;
      case "PTP":
        return 12;
      case "DOC_ID_EXTR":
        return 15;
      case "CPP":
        return 12;
      default:
        return 15;
    }
  };

  // Función para detectar tipo de documento automáticamente
  const detectarTipoDocumento = (numero) => {
    const numeroLimpio = numero.replace(/\D/g, "");
    if (numeroLimpio.length === 8) {
      return "DNI";
    } else if (numeroLimpio.length === 11) {
      return "RUC";
    }
    return clienteData.tipoDocumento;
  };

  // Función para consultar automáticamente cuando se completa el documento
  const consultarAutomaticamente = async (tipoDoc, numeroDoc) => {
    if (consultaAutomatica) return;

    const numeroLimpio = numeroDoc.replace(/\D/g, "");
    if (
      (tipoDoc === "DNI" && numeroLimpio.length === 8) ||
      (tipoDoc === "RUC" && numeroLimpio.length === 11)
    ) {
      setConsultaAutomatica(true);
      try {
        setConsultandoRENIEC(true);
        setMensajeRENIEC("Consultando automáticamente...");

        const data = await consultarRENIEC(tipoDoc, numeroDoc);

        if (data.datos) {
          const datosRENIEC = data.datos;

          setClienteData((prev) => ({
            ...prev,
            nombre:
              tipoDoc === "DNI"
                ? `${datosRENIEC.nombres || ""} ${datosRENIEC.apellidoPaterno || ""
                  } ${datosRENIEC.apellidoMaterno || ""}`.trim()
                : datosRENIEC.nombre || "",
            direccion: datosRENIEC.direccion || "",
            ubigeo: datosRENIEC.ubigeo || "",
            departamento: datosRENIEC.departamento || "",
            provincia: datosRENIEC.provincia || "",
            distrito: datosRENIEC.distrito || "",
          }));

          if (datosRENIEC.departamento)
            setDepartamentoSeleccionado(datosRENIEC.departamento);
          if (datosRENIEC.provincia)
            setProvinciaSeleccionada(datosRENIEC.provincia);
          if (datosRENIEC.distrito)
            setDistritoSeleccionado(datosRENIEC.distrito);

          setMensajeRENIEC(
            `✅ Datos obtenidos automáticamente de ${tipoDoc === "DNI" ? "RENIEC" : "SUNAT"
            }`
          );
        }
      } catch (error) {
        console.error("Error en consulta automática:", error);
        setMensajeRENIEC(`❌ Error en consulta automática: ${error.message}`);
      } finally {
        setConsultandoRENIEC(false);
        setConsultaAutomatica(false);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Si el usuario cambia manualmente el tipo de documento, deshabilitamos la autodetección
    if (name === "tipoDocumento") {
      setSeleccionManualTipoDoc(true);
    }

    if (name === "numeroDocumento") {
      if (value !== clienteData.numeroDocumento) {
        setClienteData((prev) => ({
          ...prev,
          nombre: "",
          direccion: "",
          ubigeo: "",
          departamento: "",
          provincia: "",
          distrito: "",
          [name]: value,
        }));

        setDepartamentoSeleccionado("");
        setProvinciaSeleccionada("");
        setDistritoSeleccionado("");
        setMensajeRENIEC("");

        const tipoDetectado = detectarTipoDocumento(value);
        // Solo cambiar automáticamente el tipo si NO fue seleccionado manualmente
        if (
          !seleccionManualTipoDoc &&
          tipoDetectado !== clienteData.tipoDocumento
        ) {
          setClienteData((prev) => ({ ...prev, tipoDocumento: tipoDetectado }));
        }

        // Para la consulta automática, respetar el tipo seleccionado manualmente
        setTimeout(
          () =>
            consultarAutomaticamente(
              seleccionManualTipoDoc
                ? clienteData.tipoDocumento
                : tipoDetectado,
              value
            ),
          500
        );
      } else {
        setClienteData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setClienteData((prev) => ({ ...prev, [name]: value }));
    }

    if (name === "numeroDocumento" || name === "tipoDocumento") {
      setMensajeRENIEC("");
    }
  };

  // Función para manejar selección de ubigeo horizontal
  const handleUbigeoSelection = (tipo, valor) => {
    if (tipo === "departamento") {
      setDepartamentoSeleccionado(valor);
      setProvinciaSeleccionada("");
      setDistritoSeleccionado("");
      setClienteData((prev) => ({
        ...prev,
        departamento: valor,
        provincia: "",
        distrito: "",
        ubigeo: "",
      }));
    } else if (tipo === "provincia") {
      setProvinciaSeleccionada(valor);
      setDistritoSeleccionado("");
      setClienteData((prev) => ({
        ...prev,
        provincia: valor,
        distrito: "",
        ubigeo: "",
      }));
    } else if (tipo === "distrito") {
      setDistritoSeleccionado(valor);
      const ubigeoCompleto = ubigeos.find(
        (u) =>
          u.departamento === departamentoSeleccionado &&
          u.provincia === provinciaSeleccionada &&
          u.distrito === valor
      );
      if (ubigeoCompleto) {
        setClienteData((prev) => ({
          ...prev,
          distrito: valor,
          ubigeo: ubigeoCompleto.codigo,
          departamento: departamentoSeleccionado,
          provincia: provinciaSeleccionada,
        }));
      }
    }
  };

  // Función para consultar RENIEC manualmente
  const consultarRENIECManual = async () => {
    if (!clienteData.numeroDocumento || !clienteData.tipoDocumento) {
      alert("Debe ingresar el tipo y número de documento");
      return;
    }

    if (
      clienteData.tipoDocumento !== "DNI" &&
      clienteData.tipoDocumento !== "RUC"
    ) {
      alert("Solo se puede consultar RENIEC para DNI y RUC");
      return;
    }

    try {
      setConsultandoRENIEC(true);
      setMensajeRENIEC("Consultando RENIEC...");

      // Consulta real a la API de RENIEC usando el servicio
      const data = await consultarRENIEC(
        clienteData.tipoDocumento,
        clienteData.numeroDocumento
      );

      if (data.datos) {
        const datosRENIEC = data.datos;

        setClienteData((prev) => ({
          ...prev,
          nombre:
            prev.nombre ||
            (clienteData.tipoDocumento === "DNI"
              ? `${datosRENIEC.nombres || ""} ${datosRENIEC.apellidoPaterno || ""
                } ${datosRENIEC.apellidoMaterno || ""}`.trim()
              : datosRENIEC.nombre || ""),
          direccion: prev.direccion || datosRENIEC.direccion || "",
          ubigeo: prev.ubigeo || datosRENIEC.ubigeo || "",
        }));

        setMensajeRENIEC(
          `✅ Datos obtenidos de ${clienteData.tipoDocumento === "DNI" ? "RENIEC" : "SUNAT"
          } exitosamente`
        );
      } else {
        throw new Error("No se encontraron datos para el documento consultado");
      }
    } catch (error) {
      console.error("Error al consultar RENIEC:", error);
      setMensajeRENIEC(
        `❌ Error al consultar ${clienteData.tipoDocumento === "DNI" ? "RENIEC" : "SUNAT"
        }: ${error.message}`
      );
    } finally {
      setConsultandoRENIEC(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!clienteData.numeroDocumento) {
      alert("El número de documento es obligatorio");
      return;
    }

    try {
      setLoading(true);

      // Preparar datos para enviar al backend
      const datosParaEnviar = {
        ...clienteData,
        departamento: clienteData.departamento,
        provincia: clienteData.provincia,
        distrito: clienteData.distrito,
        consultarRENIEC:
          clienteData.tipoDocumento === "DNI" ||
          clienteData.tipoDocumento === "RUC",
      };

      console.log("Enviando datos al backend:", datosParaEnviar);

      let response;
      if (clienteEditando) {
        // Modo edición - actualizar cliente existente
        response = await actualizarCliente(clienteEditando.id, datosParaEnviar);
        console.log("✅ Cliente actualizado exitosamente:", response);
        alert("Cliente actualizado exitosamente");
      } else {
        // Modo creación - crear nuevo cliente
        response = await crearCliente(datosParaEnviar);
        console.log("✅ Cliente creado exitosamente:", response);
        alert("Cliente creado exitosamente");
      }

      // Obtener el cliente de la respuesta
      const cliente = response.cliente || response;
      onClienteCreado(cliente);
      // Cerrar el modal automáticamente tras crear el cliente
      if (!clienteEditando && typeof onClose === "function") {
        onClose();
      }

      // Limpiar el formulario solo si no estamos editando
      if (!clienteEditando) {
        setClienteData({
          nombre: "",
          tipoDocumento: "DNI",
          numeroDocumento: "",
          direccion: "",
          telefono: "",
          email: "",
          codInterno: "",
          pais: "Perú",
          ubigeo: "",
          departamento: "",
          provincia: "",
          distrito: "",
        });
        setSeleccionManualTipoDoc(false);
        setDepartamentoSeleccionado("");
        setProvinciaSeleccionada("");
        setDistritoSeleccionado("");
        setMensajeRENIEC("");
      }
    } catch (error) {
      console.error("❌ Error al procesar cliente:", error);
      const accion = clienteEditando ? "actualizar" : "crear";
      alert(`Error al ${accion} el cliente: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener el nombre completo del ubigeo
  const obtenerNombreUbigeo = (codigoUbigeo) => {
    const ubigeo = ubigeos.find((u) => u.codigo === codigoUbigeo);
    return ubigeo
      ? `${ubigeo.codigo} - ${ubigeo.departamento}, ${ubigeo.provincia}, ${ubigeo.distrito}`
      : codigoUbigeo;
  };

  // Función para manejar la creación de nuevo ubigeo
  const handleUbigeoCreado = (nuevoUbigeo) => {
    // Agregar timestamp al nuevo ubigeo para ordenamiento
    const ubigeoConTimestamp = {
      ...nuevoUbigeo,
      fechaCreacion: new Date().toISOString(),
    };

    // Agregar al principio de la lista (más reciente primero)
    setUbigeos((prev) => [ubigeoConTimestamp, ...prev]);

    // Actualizar el cliente con el nuevo ubigeo seleccionado
    setClienteData((prev) => ({
      ...prev,
      ubigeo: nuevoUbigeo.codigo,
      departamento: nuevoUbigeo.departamento,
      provincia: nuevoUbigeo.provincia,
      distrito: nuevoUbigeo.distrito,
    }));

    // Actualizar también los selects horizontales
    setDepartamentoSeleccionado(nuevoUbigeo.departamento);
    setProvinciaSeleccionada(nuevoUbigeo.provincia);
    setDistritoSeleccionado(nuevoUbigeo.distrito);

    // Actualizar el campo de búsqueda
    setBusquedaUbigeo(`${nuevoUbigeo.codigo} - ${nuevoUbigeo.distrito}`);

    setModalUbigeoOpen(false);
    alert("Ubigeo creado exitosamente y seleccionado");
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            width: "90%",
            maxWidth: "900px",
            maxHeight: "90vh",
            overflow: "auto",
            position: "relative",
          }}
        >
          <div
            style={{
              padding: "20px",
              borderBottom: "1px solid #eee",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#333",
                }}
              >
                Nuevo Cliente
              </h3>
              <div
                style={{
                  marginTop: "8px",
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  onClick={cargarDatosRextie}
                  style={{
                    background: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "4px 8px",
                    cursor: "pointer",
                    fontSize: "10px",
                    fontWeight: "bold",
                  }}
                >
                  📋 RUC Ejemplo (Plantilla)
                </button>
                <button
                  type="button"
                  onClick={cargarDatosDNI}
                  style={{
                    background: "#17a2b8",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "4px 8px",
                    cursor: "pointer",
                    fontSize: "10px",
                    fontWeight: "bold",
                  }}
                >
                  🆔 DNI Ejemplo (Plantilla)
                </button>
              </div>
              <small
                style={{
                  display: "block",
                  marginTop: "4px",
                  fontSize: "10px",
                  color: "#666",
                }}
              >
                💡 Los datos de DNI y RUC se consultan automáticamente
              </small>
            </div>
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

          <form onSubmit={handleSubmit} style={{ padding: "20px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "15px",
                marginBottom: "20px",
              }}
            >
              {/* Nombre Completo */}
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
                  Nombre Completo / Nombre comercial{" "}
                  {clienteData.tipoDocumento !== "DNI" &&
                    clienteData.tipoDocumento !== "RUC" &&
                    "*"}
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={clienteData.nombre}
                  onChange={handleInputChange}
                  required={
                    clienteData.tipoDocumento !== "DNI" &&
                    clienteData.tipoDocumento !== "RUC"
                  }
                  placeholder={
                    clienteData.tipoDocumento === "DNI"
                      ? "Se completará automáticamente con RENIEC"
                      : clienteData.tipoDocumento === "RUC"
                        ? "Se completará automáticamente con SUNAT"
                        : "Nombre completo / Nombre comercial"
                  }
                  style={{
                    width: "85%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "12px",
                    backgroundColor:
                      (clienteData.tipoDocumento === "DNI" ||
                        clienteData.tipoDocumento === "RUC") &&
                        !clienteData.nombre
                        ? "#f8f9fa"
                        : "white",
                  }}
                />
              </div>

              {/* Tipo de Documento */}
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
                  Tipo de Documento
                </label>
                <select
                  name="tipoDocumento"
                  value={clienteData.tipoDocumento}
                  onChange={handleInputChange}
                  style={{
                    width: "70%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                >
                  <option value="Doc.trib.no.dom.sin.ruc">
                    Doc. Trib. No Dom. Sin RUC
                  </option>
                  <option value="DNI">DNI</option>
                  <option value="RUC">RUC</option>
                  <option value="CE">CE</option>
                  <option value="PASAPORTE">Pasaporte</option>
                  <option value="CARNE_SOLIC_REFUGIO">
                    CARNE SOLIC REFUGIO
                  </option>
                  <option value="C_IDENT_RREE">C.IDENT.-RREE</option>
                  <option value="PTP">PTP</option>
                  <option value="DOC_ID_EXTR">DOC.ID.EXTR.</option>
                  <option value="CPP">CPP</option>
                  <option value="OTRO">Otro</option>
                </select>
              </div>

              {/* Número de Documento */}
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
                  Número de Documento *
                </label>
                <div
                  style={{
                    position: "relative",
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                  }}
                >
                  <input
                    type="text"
                    name="numeroDocumento"
                    value={clienteData.numeroDocumento}
                    onChange={handleInputChange}
                    required
                    maxLength={getMaxLength(clienteData.tipoDocumento)}
                    placeholder={`Ingrese documento (máx. ${getMaxLength(
                      clienteData.tipoDocumento
                    )} caracteres)`}
                    style={{
                      flex: 1,
                      padding: "8px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "12px",
                    }}
                  />

                  {/* Contador de dígitos para TODOS los tipos de documento */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "6px 10px",
                      backgroundColor: "#f8f9fa",
                      border: "1px solid #dee2e6",
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontWeight: "600",
                      color:
                        clienteData.numeroDocumento.length ===
                          getMaxLength(clienteData.tipoDocumento)
                          ? "#28a745"
                          : clienteData.numeroDocumento.length > 0
                            ? "#17a2b8"
                            : "#6c757d",
                      minWidth: "60px",
                    }}
                  >
                    <span style={{ fontSize: "13px", fontWeight: "700" }}>
                      {clienteData.numeroDocumento.length}/
                      {getMaxLength(clienteData.tipoDocumento)}
                    </span>
                    {clienteData.numeroDocumento.length ===
                      getMaxLength(clienteData.tipoDocumento) && (
                        <span style={{ fontSize: "14px" }}>✓</span>
                      )}
                  </div>
                </div>

                {/* Barra de progreso visual para TODOS los tipos de documento */}
                <div
                  style={{
                    marginTop: "4px",
                    height: "3px",
                    backgroundColor: "#e9ecef",
                    borderRadius: "2px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "90%",
                      backgroundColor:
                        clienteData.numeroDocumento.length ===
                          getMaxLength(clienteData.tipoDocumento)
                          ? "#28a745"
                          : clienteData.numeroDocumento.length > 0
                            ? "#17a2b8"
                            : "#e9ecef",
                      width: `${(clienteData.numeroDocumento.length /
                          getMaxLength(clienteData.tipoDocumento)) *
                        100
                        }%`,
                      transition:
                        "width 0.2s ease-in-out, background-color 0.2s ease-in-out",
                    }}
                  />
                </div>

                {/* Información del tipo de documento seleccionado */}
                <div
                  style={{
                    marginTop: "4px",
                    fontSize: "10px",
                    color: "#666",
                    fontStyle: "italic",
                  }}
                >
                  {clienteData.tipoDocumento === "DNI" && "📝 DNI: 8 dígitos"}
                  {clienteData.tipoDocumento === "RUC" && "🏢 RUC: 11 dígitos"}
                  {clienteData.tipoDocumento === "CE" &&
                    "🆔 Carnet de Extranjería: 12 caracteres"}
                  {clienteData.tipoDocumento === "PASAPORTE" &&
                    "🛂 Pasaporte: 12 caracteres"}
                  {clienteData.tipoDocumento === "CARNE_SOLIC_REFUGIO" &&
                    "🛡️ Carné de Solicitante de Refugio: 12 caracteres"}
                  {clienteData.tipoDocumento === "C_IDENT_RREE" &&
                    "🌐 Carné de Identidad RREE: 12 caracteres"}
                  {clienteData.tipoDocumento === "PTP" &&
                    "📄 Permiso Temporal de Permanencia: 12 caracteres"}
                  {clienteData.tipoDocumento === "DOC_ID_EXTR" &&
                    "🌍 Documento de Identidad Extranjero: 15 caracteres"}
                  {clienteData.tipoDocumento === "CPP" &&
                    "📋 Carné de Permiso de Permanencia: 12 caracteres"}
                  {clienteData.tipoDocumento === "Doc.trib.no.dom.sin.ruc" &&
                    "💼 Documento Tributario No Domiciliado sin RUC: 15 caracteres"}
                  {clienteData.tipoDocumento === "OTRO" &&
                    "📄 Otro documento: 15 caracteres"}
                </div>
              </div>

              {/* Email */}
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
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={clienteData.email}
                  onChange={handleInputChange}
                  style={{
                    width: "70%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                />
              </div>

              {/* Teléfono */}
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
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={clienteData.telefono}
                  onChange={handleInputChange}
                  style={{
                    width: "40%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                />
              </div>

              {/* Código Interno */}
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
                  Código Interno
                </label>
                <input
                  type="text"
                  name="codInterno"
                  value={clienteData.codInterno}
                  onChange={handleInputChange}
                  placeholder="Código interno del cliente"
                  style={{
                    width: "50%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                />
              </div>

              {/* País */}
              <div style={{ position: "relative" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  País
                </label>
                <input
                  type="text"
                  value={busquedaPais || clienteData.pais}
                  onChange={(e) => {
                    const valor = e.target.value;
                    setBusquedaPais(valor);

                    const filtrados = paises.filter((pais) =>
                      pais.toLowerCase().includes(valor.toLowerCase())
                    );
                    setPaisesFiltrados(filtrados);
                    setMostrarListaPaises(true);

                    if (paises.includes(valor)) {
                      setClienteData((prev) => ({ ...prev, pais: valor }));
                    }
                  }}
                  onFocus={() => {
                    setMostrarListaPaises(true);
                    setBusquedaPais("");
                  }}
                  onBlur={() => {
                    setTimeout(() => {
                      setMostrarListaPaises(false);
                      setBusquedaPais("");
                    }, 200);
                  }}
                  placeholder="Buscar país..."
                  style={{
                    width: "40%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                />

                {mostrarListaPaises && paisesFiltrados.length > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      backgroundColor: "white",
                      border: "1px solid #ddd",
                      borderTop: "none",
                      borderRadius: "0 0 4px 4px",
                      maxHeight: "150px",
                      overflowY: "auto",
                      zIndex: 1000,
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                  >
                    {paisesFiltrados.slice(0, 10).map((pais, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          setClienteData((prev) => ({ ...prev, pais }));
                          setMostrarListaPaises(false);
                          setBusquedaPais("");
                        }}
                        style={{
                          padding: "8px 12px",
                          cursor: "pointer",
                          fontSize: "12px",
                          borderBottom:
                            index < paisesFiltrados.slice(0, 10).length - 1
                              ? "1px solid #eee"
                              : "none",
                          backgroundColor:
                            pais === clienteData.pais ? "#e7f3ff" : "white",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = "#f8f9fa";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor =
                            pais === clienteData.pais ? "#e7f3ff" : "white";
                        }}
                      >
                        {pais}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selección de Ubigeo */}
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "12px",
                      fontWeight: "bold",
                      color: "#333",
                    }}
                  >
                    Ubigeo
                  </label>
                  <button
                    type="button"
                    onClick={() => setModalUbigeoOpen(true)}
                    style={{
                      backgroundColor: "#007bff",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      padding: "4px 8px",
                      fontSize: "10px",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.backgroundColor = "#0056b3")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.backgroundColor = "#007bff")
                    }
                  >
                    + Nuevo
                  </button>
                </div>

                {/* Buscador de Ubigeo */}
                <input
                  type="text"
                  placeholder="Buscar por departamento, provincia, distrito o código"
                  value={busquedaUbigeo}
                  onChange={(e) => {
                    setBusquedaUbigeo(e.target.value);
                    setMostrarListaUbigeos(true);
                  }}
                  onFocus={() => setMostrarListaUbigeos(true)}
                  onBlur={() => {
                    // Delay para permitir el clic en la lista
                    setTimeout(() => setMostrarListaUbigeos(false), 200);
                  }}
                  style={{
                    width: "50%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "12px",
                    marginBottom: "8px",
                  }}
                />

                {/* Lista desplegable de ubigeos */}
                {mostrarListaUbigeos && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      backgroundColor: "white",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      maxHeight: "200px",
                      overflowY: "auto",
                      zIndex: 1000,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  >
                    {(() => {
                      const filteredUbigeos = busquedaUbigeo
                        ? ubigeos.filter(
                          (ubigeo) =>
                            ubigeo.departamento
                              .toLowerCase()
                              .includes(busquedaUbigeo.toLowerCase()) ||
                            ubigeo.provincia
                              .toLowerCase()
                              .includes(busquedaUbigeo.toLowerCase()) ||
                            ubigeo.distrito
                              .toLowerCase()
                              .includes(busquedaUbigeo.toLowerCase()) ||
                            ubigeo.codigo.includes(busquedaUbigeo)
                        )
                        : ubigeos.slice(0, 10);

                      if (filteredUbigeos.length === 0) {
                        return (
                          <div
                            style={{
                              padding: "12px",
                              textAlign: "center",
                              color: "#666",
                              fontSize: "11px",
                            }}
                          >
                            No se encontraron ubigeos que coincidan con la
                            búsqueda
                          </div>
                        );
                      }

                      return filteredUbigeos.slice(0, 10).map((ubigeo) => (
                        <div
                          key={ubigeo.codigo}
                          onClick={() => {
                            setClienteData((prev) => ({
                              ...prev,
                              ubigeo: ubigeo.codigo,
                              departamento: ubigeo.departamento,
                              provincia: ubigeo.provincia,
                              distrito: ubigeo.distrito,
                            }));
                            setBusquedaUbigeo(
                              `${ubigeo.codigo} - ${ubigeo.distrito}`
                            );
                            setMostrarListaUbigeos(false);
                            setDepartamentoSeleccionado(ubigeo.departamento);
                            setProvinciaSeleccionada(ubigeo.provincia);
                            setDistritoSeleccionado(ubigeo.distrito);
                          }}
                          style={{
                            padding: "8px",
                            cursor: "pointer",
                            borderBottom: "1px solid #eee",
                            fontSize: "11px",
                          }}
                          onMouseEnter={(e) =>
                            (e.target.style.backgroundColor = "#f5f5f5")
                          }
                          onMouseLeave={(e) =>
                            (e.target.style.backgroundColor = "white")
                          }
                        >
                          <strong>{ubigeo.codigo}</strong> -{" "}
                          {ubigeo.departamento}, {ubigeo.provincia},{" "}
                          {ubigeo.distrito}
                        </div>
                      ));
                    })()}
                  </div>
                )}

                {/* Separador */}
                <div
                  style={{
                    margin: "12px 0",
                    padding: "8px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "4px",
                    border: "1px solid #e9ecef",
                    fontSize: "11px",
                    fontWeight: "600",
                    color: "#666",
                    textAlign: "center",
                  }}
                >
                  O selecciona manualmente por departamento:
                </div>

                {/* Selects horizontales */}
                <div
                  style={{ display: "flex", gap: "10px", marginBottom: "10px" }}
                >
                  {/* Departamento */}
                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "3px",
                        fontSize: "11px",
                        fontWeight: "600",
                        color: "#666",
                      }}
                    >
                      DEPARTAMENTO
                    </label>
                    <select
                      value={departamentoSeleccionado}
                      onChange={(e) =>
                        handleUbigeoSelection("departamento", e.target.value)
                      }
                      style={{
                        width: "100%",
                        padding: "6px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "11px",
                        backgroundColor: "white",
                      }}
                    >
                      <option value="">Seleccionar...</option>
                      {[...new Set(ubigeos.map((u) => u.departamento))]
                        .sort()
                        .map((departamento) => (
                          <option key={departamento} value={departamento}>
                            {departamento}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Provincia */}
                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "3px",
                        fontSize: "11px",
                        fontWeight: "600",
                        color: "#666",
                      }}
                    >
                      PROVINCIA
                    </label>
                    <select
                      value={provinciaSeleccionada}
                      onChange={(e) =>
                        handleUbigeoSelection("provincia", e.target.value)
                      }
                      disabled={!departamentoSeleccionado}
                      style={{
                        width: "100%",
                        padding: "6px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "11px",
                        backgroundColor: departamentoSeleccionado
                          ? "white"
                          : "#f5f5f5",
                      }}
                    >
                      <option value="">Seleccionar...</option>
                      {departamentoSeleccionado &&
                        [
                          ...new Set(
                            ubigeos
                              .filter(
                                (u) =>
                                  u.departamento === departamentoSeleccionado
                              )
                              .map((u) => u.provincia)
                          ),
                        ]
                          .sort()
                          .map((provincia) => (
                            <option key={provincia} value={provincia}>
                              {provincia}
                            </option>
                          ))}
                    </select>
                  </div>

                  {/* Distrito */}
                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "3px",
                        fontSize: "11px",
                        fontWeight: "600",
                        color: "#666",
                      }}
                    >
                      DISTRITO
                    </label>
                    <select
                      value={distritoSeleccionado}
                      onChange={(e) =>
                        handleUbigeoSelection("distrito", e.target.value)
                      }
                      disabled={!provinciaSeleccionada}
                      style={{
                        width: "100%",
                        padding: "6px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "11px",
                        backgroundColor: provinciaSeleccionada
                          ? "white"
                          : "#f5f5f5",
                      }}
                    >
                      <option value="">Seleccionar...</option>
                      {provinciaSeleccionada &&
                        ubigeos
                          .filter(
                            (u) =>
                              u.departamento === departamentoSeleccionado &&
                              u.provincia === provinciaSeleccionada
                          )
                          .map((u) => u.distrito)
                          .sort()
                          .map((distrito) => (
                            <option key={distrito} value={distrito}>
                              {distrito}
                            </option>
                          ))}
                    </select>
                  </div>
                </div>

                {/* Mostrar código de ubigeo seleccionado */}
                {clienteData.ubigeo && (
                  <div
                    style={{
                      padding: "8px",
                      backgroundColor: "#f0f9ff",
                      border: "1px solid #0ea5e9",
                      borderRadius: "4px",
                      fontSize: "11px",
                      color: "#0c4a6e",
                    }}
                  >
                    <strong>Código Ubigeo:</strong> {clienteData.ubigeo} -{" "}
                    {clienteData.departamento}, {clienteData.provincia},{" "}
                    {clienteData.distrito}
                  </div>
                )}
              </div>

              {/* Dirección */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  Dirección
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={clienteData.direccion}
                  onChange={handleInputChange}
                  placeholder="Dirección completa."
                  style={{
                    width: "55%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                />
              </div>

              {/* Mensaje de RENIEC */}
              {mensajeRENIEC && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <div
                    style={{
                      padding: "10px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      backgroundColor: mensajeRENIEC.includes("✅")
                        ? "#d4edda"
                        : mensajeRENIEC.includes("❌")
                          ? "#f8d7da"
                          : "#fff3cd",
                      color: mensajeRENIEC.includes("✅")
                        ? "#155724"
                        : mensajeRENIEC.includes("❌")
                          ? "#721c24"
                          : "#856404",
                      border: `1px solid ${mensajeRENIEC.includes("✅")
                          ? "#c3e6cb"
                          : mensajeRENIEC.includes("❌")
                            ? "#f5c6cb"
                            : "#ffeaa7"
                        }`,
                    }}
                  >
                    {mensajeRENIEC}
                  </div>
                </div>
              )}

              {/* Botón para consultar RENIEC manualmente */}
              {(clienteData.tipoDocumento === "DNI" ||
                clienteData.tipoDocumento === "RUC") &&
                clienteData.numeroDocumento && (
                  <div style={{ gridColumn: "1 / -1" }}>
                    <button
                      type="button"
                      onClick={consultarRENIECManual}
                      disabled={consultandoRENIEC}
                      style={{
                        padding: "8px 16px",
                        border: "none",
                        borderRadius: "4px",
                        backgroundColor: consultandoRENIEC
                          ? "#6c757d"
                          : "#17a2b8",
                        color: "white",
                        cursor: consultandoRENIEC ? "not-allowed" : "pointer",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      {consultandoRENIEC
                        ? "🔄 Consultando..."
                        : `🔍 Consultar ${clienteData.tipoDocumento === "DNI"
                          ? "RENIEC"
                          : "SUNAT"
                        }`}
                    </button>
                    <small
                      style={{
                        display: "block",
                        marginTop: "4px",
                        fontSize: "10px",
                        color: "#666",
                      }}
                    >
                      Consulta manual opcional. Al crear el cliente se consulta
                      automáticamente.
                    </small>
                  </div>
                )}

              {/* Información automática */}
              <div style={{ gridColumn: "1 / -1" }}>
                <div
                  style={{
                    padding: "10px",
                    borderRadius: "4px",
                    fontSize: "11px",
                    backgroundColor: "#e7f3ff",
                    color: "#0066cc",
                    border: "1px solid #b3d9ff",
                  }}
                >
                  <strong>💡 Consulta Automática:</strong>
                  <br />• <strong>DNI:</strong> Se obtienen automáticamente
                  nombres, apellidos y dirección de RENIEC
                  <br />• <strong>RUC:</strong> Se obtiene automáticamente razón
                  social y dirección de SUNAT
                  <br />• <strong>Otros documentos:</strong> Se usan los datos
                  que ingreses manualmente
                  <br />• <strong>Ubigeo:</strong> Puedes buscar por código o
                  ubicación, o crear uno nuevo
                </div>
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
                disabled={loading}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "4px",
                  backgroundColor: loading ? "#6c757d" : "#007bff",
                  color: "white",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontSize: "12px",
                }}
              >
                {loading ? "Creando..." : "Crear Cliente"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal para nuevo ubigeo */}
      <ModalNuevoUbigeo
        isOpen={modalUbigeoOpen}
        onClose={() => setModalUbigeoOpen(false)}
        onUbigeoCreado={handleUbigeoCreado}
      />
    </>
  );
}

export default ModalCliente;
