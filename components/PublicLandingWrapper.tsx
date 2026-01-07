import React from 'react';
import { useAuth } from '../context/AuthContext';

interface PublicLandingProps {
  onNavigateToDashboard?: () => void;
}

export default function PublicLanding({ onNavigateToDashboard }: PublicLandingProps) {
  const { user } = useAuth();
  
  // ... resto del código de PublicLanding permanece igual
  // Solo agregamos la prop y un botón para navegar al dashboard si es necesario
  
  return (
    <div>
      {/* Aquí iría todo el contenido actual de PublicLanding */}
      {/* Por ahora solo un placeholder para que compile */}
      <div className="p-8">
        <h1>Registro de Clientes</h1>
        {onNavigateToDashboard && (
          <button
            onClick={onNavigateToDashboard}
            className="mt-4 bg-skyworth-blue text-white px-4 py-2 rounded"
          >
            Ir al Dashboard
          </button>
        )}
      </div>
    </div>
  );
}
