import { useEffect, useState } from 'react';
import axios from 'axios';
import './Dashboard.css'; // ✅ crea este archivo para estilos

function Dashboard() {
    const [stats, setStats] = useState({
        totalVehiculos: 0,
        totalMarcas: 0,
        totalModelos: 0
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        const [vehRes, marcasRes, modelosRes] = await Promise.all([
            axios.get('http://localhost:3000/api/vehiculos'),
            axios.get('http://localhost:3000/api/marcas'),
            axios.get('http://localhost:3000/api/modelos')
        ]);

        const totalVehiculos = vehRes.data.length;

        setStats({
            totalVehiculos,
            totalMarcas: marcasRes.data.length,
            totalModelos: modelosRes.data.length
        });
    };

    return (
        <div className="dashboard-container">
            <h2>📊 Dashboard</h2>
            <div className="card-grid">
                <div className="card total">
                    <h3>Total Vehículos</h3>
                    <p>{stats.totalVehiculos}</p>
                </div>
                <div className="card marcas">
                    <h3>Total Marcas</h3>
                    <p>{stats.totalMarcas}</p>
                </div>
                <div className="card modelos">
                    <h3>Total Modelos</h3>
                    <p>{stats.totalModelos}</p>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;