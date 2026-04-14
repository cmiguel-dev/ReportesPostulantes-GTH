// app/postulantes-actuales/page.js
"use client";

import { useEffect, useState, useMemo } from "react";
import { getPostulantesActuales } from "../../services/postulantesActualesService";
import PostulantesCharts from "../../components/PostulantesCharts";

export default function PostulantesActualesPage() {
  const [postulantes, setPostulantes] = useState([]);
  const [filteredPostulantes, setFilteredPostulantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    areas: {},
    carreras: {},
    universidades: {},
    estados: {},
    mediosEntero: {}
  });
  
  // Filtros
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroPeriodo, setFiltroPeriodo] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 20;

  async function loadData() {
    setLoading(true);
    const data = await getPostulantesActuales(mostrarTodos ? "all" : 200, 0);
    setPostulantes(data);
    generarEstadisticas(data);
    setLoading(false);
  }

  function generarEstadisticas(data) {
    const areas = {};
    const carreras = {};
    const universidades = {};
    const estados = {};
    const mediosEntero = {};

    data.forEach((item) => {
      // Áreas
      areas[item.area] = (areas[item.area] || 0) + 1;
      
      // Carreras
      carreras[item.carrera] = (carreras[item.carrera] || 0) + 1;
      
      // Universidades
      universidades[item.universidad] = (universidades[item.universidad] || 0) + 1;
      
      // Estados
      estados[item.estado_postulante] = (estados[item.estado_postulante] || 0) + 1;
      
      // Medios de enteró
      mediosEntero[item.medio_enteró] = (mediosEntero[item.medio_enteró] || 0) + 1;
    });

    setStats({ areas, carreras, universidades, estados, mediosEntero });
  }

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...postulantes];
    
    // Filtro por estado
    if (filtroEstado !== "todos") {
      filtered = filtered.filter(p => p.estado_postulante === filtroEstado);
    }
    
    // Filtro por período
    if (filtroPeriodo !== "todos") {
      const ahora = new Date();
      let fechaLimite = new Date();
      
      switch(filtroPeriodo) {
        case "1sem":
          fechaLimite.setDate(ahora.getDate() - 7);
          break;
        case "2sem":
          fechaLimite.setDate(ahora.getDate() - 14);
          break;
        case "1mes":
          fechaLimite.setMonth(ahora.getMonth() - 1);
          break;
        case "3meses":
          fechaLimite.setMonth(ahora.getMonth() - 3);
          break;
        default:
          fechaLimite = null;
      }
      
      if (fechaLimite) {
        filtered = filtered.filter(p => {
          if (!p.fecha_postulacion) return false;
          return new Date(p.fecha_postulacion) >= fechaLimite;
        });
      }
    }
    
    // Búsqueda por nombre o email
    if (busqueda) {
      const busquedaLower = busqueda.toLowerCase();
      filtered = filtered.filter(p => 
        p.nombre.toLowerCase().includes(busquedaLower) ||
        p.email.toLowerCase().includes(busquedaLower) ||
        p.carrera.toLowerCase().includes(busquedaLower)
      );
    }
    
    setFilteredPostulantes(filtered);
    setPaginaActual(1);
  }, [postulantes, filtroEstado, filtroPeriodo, busqueda]);

  useEffect(() => {
    loadData();
  }, [mostrarTodos]);

  // Paginación
  const indexOfLastItem = paginaActual * itemsPorPagina;
  const indexOfFirstItem = indexOfLastItem - itemsPorPagina;
  const currentItems = filteredPostulantes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPostulantes.length / itemsPorPagina);

  const getEstadoBadge = (estado) => {
    const badges = {
      "falta agendar": "warning",
      "ya se entrevistó": "success",
      "rechazó": "danger",
      "no respondió": "secondary",
      "en proceso": "info"
    };
    return badges[estado] || "secondary";
  };

  const getEstadoTexto = (estado) => {
    const textos = {
      "falta agendar": "📅 Falta agendar",
      "ya se entrevistó": "✅ Ya se entrevistó",
      "rechazó": "❌ Rechazó",
      "no respondió": "📵 No respondió",
      "en proceso": "🔄 En proceso"
    };
    return textos[estado] || estado;
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p>Cargando postulantes...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>📝 Postulantes Actuales (Formulario Wix)</h2>
        <button 
          className="btn btn-outline-primary"
          onClick={() => setMostrarTodos(!mostrarTodos)}
        >
          {mostrarTodos ? "📄 Mostrar solo últimos" : "📚 Mostrar todos"}
        </button>
      </div>
      
      <div className="alert alert-info">
        <strong>Total de postulantes:</strong> {postulantes.length} | 
        <strong> Mostrando:</strong> {filteredPostulantes.length} después de filtros
      </div>

      {/* Filtros */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-4 mb-2">
              <label className="form-label">🔍 Buscar</label>
              <input
                type="text"
                className="form-control"
                placeholder="Nombre, email o carrera..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            
            <div className="col-md-4 mb-2">
              <label className="form-label">📌 Estado</label>
              <select 
                className="form-select"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="todos">Todos los estados</option>
                <option value="falta agendar">📅 Falta agendar</option>
                <option value="ya se entrevistó">✅ Ya se entrevistó</option>
                <option value="rechazó">❌ Rechazó</option>
                <option value="no respondió">📵 No respondió</option>
                <option value="en proceso">🔄 En proceso</option>
              </select>
            </div>
            
            <div className="col-md-4 mb-2">
              <label className="form-label">📅 Período</label>
              <select 
                className="form-select"
                value={filtroPeriodo}
                onChange={(e) => setFiltroPeriodo(e.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="1sem">Última semana</option>
                <option value="2sem">Últimas 2 semanas</option>
                <option value="1mes">Último mes</option>
                <option value="3meses">Últimos 3 meses</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      {/* <PostulantesCharts stats={stats} /> */}

      {/* Tabla de postulantes */}
      <div className="card mt-4">
        <div className="card-header">
          <h4>📋 Lista de Postulantes</h4>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Fecha</th>
                  <th>Nombre</th>
                  <th>Teléfono</th>
                  <th>Email</th>
                  <th>Área</th>
                  <th>Carrera</th>
                  <th>Universidad</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((postulante, idx) => (
                  <tr key={postulante.id}>
                    <td>{indexOfFirstItem + idx + 1}</td>
                    <td>{postulante.fecha_envio ? new Date(postulante.fecha_envio).toLocaleDateString('es-PE') : '-'}</td>
                    <td>{postulante.nombre}</td>
                    <td>{postulante.telefono}</td>
                    <td>{postulante.email}</td>
                    <td>{postulante.area}</td>
                    <td>{postulante.carrera}</td>
                    <td>{postulante.universidad}</td>
                    <td>
                      <span className={`badge bg-${getEstadoBadge(postulante.estado_postulante)}`}>
                        {getEstadoTexto(postulante.estado_postulante)}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-sm btn-info"
                        data-bs-toggle="modal"
                        data-bs-target={`#modal-${postulante.id}`}
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Paginación */}
          {totalPages > 1 && (
            <nav>
              <ul className="pagination justify-content-center">
                <li className={`page-item ${paginaActual === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPaginaActual(paginaActual - 1)}>Anterior</button>
                </li>
                {[...Array(totalPages)].map((_, i) => (
                  <li key={i} className={`page-item ${paginaActual === i + 1 ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setPaginaActual(i + 1)}>{i + 1}</button>
                  </li>
                ))}
                <li className={`page-item ${paginaActual === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPaginaActual(paginaActual + 1)}>Siguiente</button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>

      {/* Gráficos */}
      <PostulantesCharts stats={stats} />

      {/* Modales para ver detalles */}
      {currentItems.map((postulante) => (
        <div key={`modal-${postulante.id}`} className="modal fade" id={`modal-${postulante.id}`} tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Detalles del Postulante</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>📅 Fecha:</strong> {postulante.fecha_envio ? new Date(postulante.fecha_envio).toLocaleString('es-PE') : '-'}</p>
                    <p><strong>👤 Nombre:</strong> {postulante.nombre}</p>
                    <p><strong>📧 Email:</strong> {postulante.email}</p>
                    <p><strong>📱 Teléfono:</strong> {postulante.telefono}</p>
                    <p><strong>🎂 Edad:</strong> {postulante.edad}</p>
                    <p><strong>📍 Ubicación:</strong> {postulante.distrito}, {postulante.provincia}, {postulante.pais}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>🏢 Área:</strong> {postulante.area}</p>
                    <p><strong>🎓 Carrera:</strong> {postulante.carrera}</p>
                    <p><strong>🏫 Universidad:</strong> {postulante.universidad}</p>
                    <p><strong>📚 Ciclo:</strong> {postulante.ciclo}</p>
                    <p><strong>💼 Modalidad:</strong> {postulante.modalidad_trabajo}</p>
                    <p><strong>📢 Se enteró por:</strong> {postulante.medio_enteró}</p>
                  </div>
                </div>
                <hr />
                <div className="row">
                  <div className="col-12">
                    <p><strong>💼 Experiencia previa:</strong> {postulante.experiencia_previa || "No especifica"}</p>
                    <p><strong>🔗 LinkedIn:</strong> {postulante.linkedin ? <a href={postulante.linkedin} target="_blank">Ver perfil</a> : "No especifica"}</p>
                    {postulante.cv_url && (
                      <p><strong>📄 CV:</strong> <a href={postulante.cv_url} target="_blank">Descargar CV</a></p>
                    )}
                    <p><strong>✅ Cumplió pasos:</strong> {postulante.cumplio_pasos}</p>
                    {postulante.observacion_rechazo && (
                      <p><strong>⚠️ Observación:</strong> {postulante.observacion_rechazo}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

