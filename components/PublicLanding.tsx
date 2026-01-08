import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders } from '../config/api';
import TermsModal from './TermsModal';
import ScannerModal from './ScannerModal';



const Confetti = () => {
  const [particles, setParticles] = useState<any[]>([]);
  useEffect(() => {
    const colors = ['#FFD700', '#005BBB', '#28A745', '#FFFFFF'];
    setParticles(Array.from({ length: 50 }).map((_, i) => ({
      id: i, left: Math.random() * 100 + '%', bg: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 2 + 's', duration: Math.random() * 3 + 2 + 's',
    })));
  }, []);
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map((p) => (
        <div key={p.id} className="absolute w-3 h-3 rounded-sm opacity-80 animate-fall"
          style={{ left: p.left, backgroundColor: p.bg, top: '-20px', animationDuration: p.duration, animationDelay: p.delay }}
        />
      ))}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-fall { animation-name: fall; animation-timing-function: linear; animation-iteration-count: infinite; }
      `}</style>
    </div>
  );
};

interface PublicLandingProps {
  onNavigateToDashboard?: () => void;
}

export default function PublicLanding({ onNavigateToDashboard }: PublicLandingProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<{cupones: string[], mensaje: string} | null>(null);
  const [showTerms, setShowTerms] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  
  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Calculate time remaining until April 16, 2026
  useEffect(() => {
    const calculateTimeLeft = () => {
      const targetDate = new Date('2026-04-16T00:00:00').getTime();
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', ci: '', email: '', phone: '', tipoDocumentoIdentidad: '', lugarEmision: '', code: '', terms: false
  });
  
  const [files, setFiles] = useState<{ ciFront: File | null; ciBack: File | null; invoice: File | null; }>({
    ciFront: null, ciBack: null, invoice: null
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = 'checked' in e.target ? e.target.checked : false;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: 'ciFront' | 'ciBack' | 'invoice') => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({ ...prev, [key]: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validación: Verificar que hay un vendedor autenticado
      if (!user || !user.email) {
        throw new Error("⚠️ Debes iniciar sesión como vendedor para registrar ventas. Por favor, recarga la página e inicia sesión.");
      }

      if (user.rol === "ADMIN") {
        throw new Error(
          "Los administradores no pueden registrar ventas. Solo los vendedores están autorizados para registrar clientes."
        );
      }

      if (user.rol !== "VENDEDOR") {
        throw new Error(
          "Solo los vendedores pueden registrar ventas. Tu rol actual no tiene permiso para esta acción."
        );
      }
    
     if (!files.ciFront || !files.ciBack || !files.invoice) 
        throw new Error("Árbitro: Falta documentación obligatoria (CI y Factura).");
      if (!formData.terms) 
        throw new Error("Debes aceptar el reglamento del torneo.");

      // Prepare FormData for multipart/form-data upload
      const apiFormData = new FormData();
      apiFormData.append('nombre', `${formData.firstName} ${formData.lastName}`);
      apiFormData.append('ci', formData.ci);
      apiFormData.append('email', formData.email);
      apiFormData.append('telefono', formData.phone);
      apiFormData.append('tipoDocumentoIdentidad', formData.tipoDocumentoIdentidad);
      apiFormData.append('lugarEmision', formData.lugarEmision);
      apiFormData.append('serialIngresado', formData.code.toUpperCase().trim());
      apiFormData.append('vendedorEmail', user?.email || '');
      
      apiFormData.append('ciAnverso', files.ciFront);
      apiFormData.append('ciReverso', files.ciBack);
      apiFormData.append('notaVenta', files.invoice);

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.REGISTER_CLIENT}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: apiFormData,
      });

      const data = await response.json();
      
      console.log('📊 Response data:', { ok: response.ok, status: response.status, data });
      
      if (!response.ok || data.error) {
        const errorMsg = data.mensaje || data.message || 'Error en el registro';
        console.error('❌ Registration failed:', errorMsg);
        throw new Error(errorMsg);
      }

      console.log('? Registration successful:', data.data);
      
      const cupones = data.data?.codigos_cupones || [];
      const whatsappEnviado = data.data?.whatsappEnviado;
      const errorWhatsapp = data.data?.errorWhatsapp;
      
      // Construir HTML para el SweetAlert
      let htmlContent = '<div class="text-left">';
      htmlContent += '<p class="mb-4 text-gray-600">Se han generado tus cupones exitosamente:</p>';
      htmlContent += '<ul class="list-none space-y-2 mb-4">';
      cupones.forEach((cupon: string, index: number) => {
        htmlContent += `<li class="font-mono bg-blue-50 p-2 rounded border border-blue-100 flex items-center gap-2">
          <span class="bg-skyworth-blue text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">${index + 1}</span> 
          <span class="font-bold text-skyworth-dark tracking-wider">${cupon}</span>
        </li>`;
      });
      htmlContent += '</ul>';
      
      if (!whatsappEnviado && errorWhatsapp) {
        htmlContent += `<div class="mt-4 p-3 bg-yellow-50 text-yellow-800 rounded text-sm border border-yellow-200 flex items-start gap-2">
          <span>⚠️</span>
          <span>Nota: No se pudo enviar el mensaje por WhatsApp. ${errorWhatsapp}</span>
        </div>`;
      }
      htmlContent += '</div>';

      // Mostrar SweetAlert
      Swal.fire({
        title: '<span class="font-sport text-skyworth-blue">¡GOLAZO!</span>',
        text: data.message || 'Registro exitoso',
        html: htmlContent,
        icon: 'success',
        confirmButtonText: 'VOLVER AL ESTADIO',
        confirmButtonColor: '#005BBB',
        background: '#fff',
        customClass: {
          title: 'font-sport',
          confirmButton: 'font-sport rounded-xl px-6 py-3 text-lg',
          popup: 'rounded-3xl border-4 border-skyworth-accent'
        },
        padding: '2em',
        width: '32em',
        backdrop: `
          rgba(0,59,150,0.4)
        `
      }).then(() => {
        // Limpiar formulario al cerrar
        setFormData({
            firstName: '', 
            lastName: '', 
            ci: '', 
            email: '', 
            phone: '', 
            tipoDocumentoIdentidad: '', 
            lugarEmision: '', 
            code: '', 
            terms: false
        });
        setFiles({
            ciFront: null,
            ciBack: null,
            invoice: null
        });
        
        // Recargar página para asegurar estado limpio (opcional, pero pedido en bot�n anterior)
        window.location.reload();
      });
    } catch (err: any) {
      console.error('🚨 Exception during registration:', err);
      const errorMessage = err.message || "Error en el registro. Intenta de nuevo.";
      
      // Mostrar error con SweetAlert
      Swal.fire({
        title: '<span class="font-sport text-red-600">¡TARJETA ROJA!</span>',
        html: `<div class="text-left">
          <p class="text-gray-700 font-semibold mb-2">El árbitro ha detenido el juego:</p>
          <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p class="text-red-800 font-bold">${errorMessage}</p>
          </div>
        </div>`,
        icon: 'error',
        confirmButtonText: 'VOLVER A INTENTAR',
        confirmButtonColor: '#DC2626',
        background: '#fff',
        customClass: {
          title: 'font-sport',
          confirmButton: 'font-sport rounded-xl px-6 py-3 text-lg',
          popup: 'rounded-3xl border-4 border-red-500'
        },
        padding: '2em',
        width: '32em',
        backdrop: `rgba(220, 38, 38, 0.4)`
      });
    } finally {
      setLoading(false);
    }
  };

  // Si TODO est� correcto, mostrar pantalla con confetti
  if (successData) {
    return (
      <div className="min-h-screen bg-stadium-gradient flex flex-col items-center justify-center p-4">
        <Confetti />
        <div className="bg-white rounded-3xl md:rounded-3xl shadow-2xl p-6 md:p-12 max-w-xl w-full text-center animate-fade-in border-t-8 md:border-t-8 border-skyworth-accent relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 md:w-32 md:h-32 bg-skyworth-accent opacity-10 rounded-bl-full"></div>
          <div className="text-5xl md:text-6xl mb-4 md:mb-6 animate-bounce">🏆</div>
          <h2 className="text-4xl md:text-5xl font-sport text-skyworth-dark leading-none">¡GOLAZO!</h2>
          <p className="text-gray-400 font-black uppercase tracking-wider md:tracking-[0.3em] text-[10px] md:text-xs mt-2 md:mt-3">TU FICHAJE HA SIDO VALIDADO POR EL VAR</p>
          
          <div className="my-6 md:my-8 p-5 md:p-8 bg-gray-50 border-2 md:border-3 border-dashed border-skyworth-blue/20 rounded-2xl md:rounded-2xl relative">
            <div className="absolute -top-3 md:-top-4 left-1/2 -translate-x-1/2 bg-skyworth-blue text-white px-4 md:px-6 py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-wide md:tracking-widest">Tus Tickets de la Suerte</div>
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 mt-2 md:mt-4">
              {successData.cupones.map((cupon, index) => (
                <span key={index} className="bg-skyworth-accent text-skyworth-dark px-3 md:px-4 py-2 md:py-2 rounded-xl md:rounded-xl font-mono font-black text-sm md:text-base shadow-lg border-2 border-white transform hover:scale-110 transition-transform cursor-default">
                  {cupon}
                </span>
              ))}
            </div>
          </div>
          
          <button onClick={() => window.location.reload()} className="w-full py-4 md:py-5 bg-skyworth-blue text-white font-sport text-2xl md:text-3xl rounded-2xl md:rounded-2xl shadow-2xl hover:bg-skyworth-dark transition-all transform hover:scale-105 border-b-4 md:border-b-6 border-blue-900 active:border-b-0 active:translate-y-1 md:active:translate-y-2">
            VOLVER AL ESTADIO
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} onAccept={() => setFormData(p => ({ ...p, terms: true }))} />
      <ScannerModal isOpen={showScanner} onClose={() => setShowScanner(false)} onScan={(c) => setFormData(p => ({ ...p, code: c.toUpperCase() }))} />

      {/* Hero Section - Skyworth Stadium */}
      <header className="bg-stadium-gradient text-white py-12 md:py-20 px-4 text-center relative overflow-hidden min-h-[70vh] flex flex-col justify-center border-b-8 md:border-b-8 border-skyworth-accent">
        <div className="absolute inset-0 bg-pattern-soccer opacity-10"></div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="inline-block bg-skyworth-accent text-skyworth-dark px-4 md:px-8 py-2 md:py-2 rounded-full font-black text-[9px] md:text-xs tracking-wider md:tracking-[0.3em] mb-4 md:mb-6 uppercase shadow-[0_0_40px_rgba(255,215,0,0.5)] animate-pulse">
            🏆 CAMPAÑA OFICIAL SKYWORTH 2026
          </div>
          
          {/* Countdown Timer */}
          <div className="mb-6 md:mb-8">
            <div className="bg-gradient-to-br from-blue-900/80 to-blue-950/90 backdrop-blur-xl rounded-2xl md:rounded-3xl p-4 md:p-8 max-w-2xl mx-auto border-2 border-skyworth-accent/30 shadow-2xl">
              <p className="text-skyworth-accent font-black text-xs md:text-sm uppercase tracking-wider md:tracking-[0.3em] mb-3 md:mb-5">Gran Sorteo: 16 de Abril</p>
              <div className="grid grid-cols-4 gap-2 md:gap-4">
                {[
                  { value: String(timeLeft.days).padStart(2, '0'), label: 'DÍAS' },
                  { value: String(timeLeft.hours).padStart(2, '0'), label: 'HRS' },
                  { value: String(timeLeft.minutes).padStart(2, '0'), label: 'MIN' },
                  { value: String(timeLeft.seconds).padStart(2, '0'), label: 'SEG' }
                ].map((item, idx) => (
                  <div key={idx} className="bg-blue-950/60 rounded-xl md:rounded-2xl p-3 md:p-5 border border-white/10">
                    <div className="text-3xl md:text-5xl lg:text-6xl font-mono font-black text-white mb-1 md:mb-2">{item.value}</div>
                    <div className="text-skyworth-accent text-[9px] md:text-xs font-black tracking-wider">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-sport leading-[0.85] md:leading-[0.85] tracking-tight md:tracking-tight mb-4 md:mb-6 drop-shadow-[0_8px_20px_rgba(0,0,0,0.6)]">
            GANA TU PASE <br/> A LA <span className="text-skyworth-accent">FINAL</span>
          </h1>
          <p className="text-sm sm:text-base md:text-xl lg:text-2xl text-white/90 font-light max-w-5xl mx-auto mb-6 md:mb-10 italic font-sport tracking-wide md:tracking-wide leading-tight md:leading-tight px-4">
            "ESTRENAR UN SKYWORTH NUNCA TE ACERCÓ TANTO AL CAMPO DE JUEGO"
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 max-w-4xl mx-auto mb-6 md:mb-10">
             <div className="bg-gradient-to-br from-yellow-400 to-skyworth-accent p-6 md:p-8 rounded-3xl md:rounded-3xl border-2 border-yellow-300 shadow-2xl transform transition hover:scale-105 group">
                <span className="text-4xl md:text-5xl block mb-2 md:mb-4 transition-transform group-hover:rotate-12">🏟️</span>
                <h3 className="font-sport text-2xl md:text-3xl text-skyworth-dark leading-none">5 ENTRADAS</h3>
                <p className="text-[10px] md:text-xs font-black opacity-60 uppercase tracking-wider md:tracking-[0.2em] mt-2 md:mt-3">Para nuestros clientes estrella</p>
             </div>
             <div className="bg-skyworth-grass/20 backdrop-blur-2xl p-6 md:p-8 rounded-3xl md:rounded-3xl border-2 border-skyworth-grass/40 shadow-2xl transform transition hover:scale-105 group">
                <span className="text-4xl md:text-5xl block mb-2 md:mb-4 transition-transform group-hover:rotate-12">🎫</span>
                <h3 className="font-sport text-2xl md:text-3xl text-white leading-none">6 ENTRADAS</h3>
                <p className="text-[10px] md:text-xs font-black opacity-60 uppercase tracking-wider md:tracking-[0.2em] mt-2 md:mt-3">Exclusivo Cuerpo Técnico (Staff)</p>
             </div>
          </div>

          <button 
            onClick={() => document.getElementById('registro')?.scrollIntoView({ behavior: 'smooth' })}
            className="mt-4 md:mt-6 animate-bounce bg-white text-skyworth-blue w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto shadow-2xl border-2 md:border-3 border-skyworth-accent transform hover:scale-110 transition-all cursor-pointer"
          >
            <span className="text-xl md:text-2xl font-bold">↓</span>
          </button>
        </div>
      </header>

      {/* Form Section */}
      <section id="registro" className="py-8 md:py-16 px-4 bg-skyworth-dark relative overflow-hidden">
        <div className="absolute inset-0 grass-pattern opacity-5"></div>
        
        <div className="max-w-4xl mx-auto bg-white rounded-3xl md:rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden relative z-10 border-t-6 md:border-t-8 border-skyworth-grass">
          <div className="p-6 md:p-10 lg:p-12">
            <div className="text-center mb-6 md:mb-10">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-sport text-skyworth-dark leading-none tracking-tight">FICHA DE INSCRIPCIÓN</h2>
              <div className="w-20 md:w-24 h-1.5 md:h-2 bg-skyworth-accent mx-auto rounded-full mt-3 md:mt-4"></div>
              <p className="text-gray-400 font-black text-[9px] md:text-xs tracking-wider md:tracking-[0.3em] mt-3 md:mt-5 uppercase">NUEVO FICHAJE: REGISTRA TU TV Y GANA</p>
            </div>



            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {['firstName', 'lastName', 'ci', 'tipoDocumentoIdentidad', 'lugarEmision', 'email', 'phone'].map((field) => (
                  <div key={field} className="relative group">
                    <label className="text-[8px] md:text-[10px] font-black text-skyworth-blue uppercase tracking-wide md:tracking-wide absolute -top-2 md:-top-2.5 left-3 md:left-4 bg-white px-2 md:px-3 z-10 transition-colors group-focus-within:text-skyworth-accent">
                      {field === 'firstName' ? 'Nombre Completo' : 
                       field === 'lastName' ? 'Apellidos' : 
                       field === 'ci' ? 'Carnet / DNI' : 
                       field === 'tipoDocumentoIdentidad' ? 'Tipo de Documento' :
                       field === 'lugarEmision' ? 'Lugar de Emisión' :
                       field === 'email' ? 'Correo Electrónico' : 'WhatsApp / Celular'}
                    </label>
                    {field === 'tipoDocumentoIdentidad' ? (
                      <select
                        required
                        name={field}
                        value={(formData as any)[field]}
                        onChange={handleInputChange}
                        className="w-full p-3 md:p-4 border-2 md:border-3 border-gray-100 rounded-xl md:rounded-xl focus:border-skyworth-grass outline-none transition-all bg-gray-50/50 font-bold text-gray-800 text-sm md:text-base shadow-inner focus:bg-white"
                      >
                        <option value="">Seleccione tipo</option>
                        <option value="CI">CI</option>
                        <option value="Pasaporte">Pasaporte</option>
                        <option value="CI Extranjero">CI Extranjero</option>
                      </select>
                    ) : field === 'lugarEmision' ? (
                      <select
                        required
                        name={field}
                        value={(formData as any)[field]}
                        onChange={handleInputChange}
                        className="w-full p-3 md:p-4 border-2 md:border-3 border-gray-100 rounded-xl md:rounded-xl focus:border-skyworth-grass outline-none transition-all bg-gray-50/50 font-bold text-gray-800 text-sm md:text-base shadow-inner focus:bg-white"
                      >
                        <option value="">Seleccione departamento</option>
                        <option value="La Paz">La Paz</option>
                        <option value="Cochabamba">Cochabamba</option>
                        <option value="Santa Cruz">Santa Cruz</option>
                        <option value="Oruro">Oruro</option>
                        <option value="Potosí">Potosí</option>
                        <option value="Chuquisaca">Chuquisaca</option>
                        <option value="Tarija">Tarija</option>
                        <option value="Beni">Beni</option>
                        <option value="Pando">Pando</option>
                        <option value="No Registra">No Registra</option>
                      </select>
                    ) : (
                      <input 
                        required name={field} 
                        type={field === 'email' ? 'email' : 'text'}
                        value={(formData as any)[field]} 
                        onChange={handleInputChange} 
                        className="w-full p-3 md:p-4 border-2 md:border-3 border-gray-100 rounded-xl md:rounded-xl focus:border-skyworth-grass outline-none transition-all bg-gray-50/50 font-bold text-gray-800 text-sm md:text-base shadow-inner focus:bg-white"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-skyworth-blue p-4 md:p-6 rounded-2xl md:rounded-2xl border-2 md:border-3 border-skyworth-accent/30 text-white shadow-2xl relative">
                <div className="absolute -top-3 md:-top-3 left-1/2 -translate-x-1/2 bg-skyworth-accent text-skyworth-dark px-3 md:px-6 py-1 md:py-1.5 rounded-full font-black text-[8px] md:text-[9px] uppercase tracking-wider md:tracking-[0.2em] shadow-xl">Serial del Equipo</div>
                <div className="flex flex-col md:flex-row gap-2 md:gap-4 mt-2 md:mt-2">
                  <input 
                    required name="code" value={formData.code} onChange={handleInputChange} 
                    placeholder="CÓDIGO (EJ: SKY-2025-X)" 
                    className="flex-1 p-3 md:p-4 rounded-xl md:rounded-xl font-mono text-base md:text-xl uppercase text-skyworth-dark font-black outline-none focus:ring-3 md:focus:ring-4 focus:ring-skyworth-accent/40 shadow-inner text-center placeholder:text-gray-300 placeholder:text-xs md:placeholder:text-sm" 
                  />
                  <button type="button" onClick={() => setShowScanner(true)} className="bg-skyworth-accent text-skyworth-dark px-4 md:px-8 py-3 md:py-4 rounded-xl md:rounded-xl font-sport text-lg md:text-2xl shadow-2xl hover:bg-white transition-all transform active:scale-95 flex items-center justify-center gap-2 md:gap-3 group">
                      <span className="group-hover:scale-125 transition-transform text-xl md:text-2xl">📸</span> 
                    <span className="mt-0.5">ESCANEAR</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4 md:space-y-6 pt-3 md:pt-4">
                <h3 className="font-sport text-xl md:text-2xl lg:text-3xl text-skyworth-dark border-b-3 md:border-b-4 border-skyworth-grass inline-block pb-1.5 md:pb-2 tracking-wide md:tracking-wide">EXPEDIENTE DE FICHAJE</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5">
                  {[
                    { id: 'ciFront', label: 'C.I. FRONTAL', icon: '🪪' },
                    { id: 'ciBack', label: 'C.I. REVERSO', icon: '🪪' },
                    { id: 'invoice', label: 'FACTURA / NOTA DE VENTA', icon: '🧾' }
                  ].map((doc) => (
                    <label key={doc.id} className={`border-2 md:border-3 border-dashed rounded-xl md:rounded-2xl p-4 md:p-6 text-center cursor-pointer transition-all hover:scale-105 active:scale-95 group ${(files as any)[doc.id] ? 'border-skyworth-grass bg-green-50' : 'border-gray-200 hover:border-skyworth-blue hover:bg-blue-50'}`}>
                      <span className="text-3xl md:text-4xl block mb-2 md:mb-3 group-hover:animate-bounce">{doc.icon}</span>
                      <span className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-wider md:tracking-wide block">{doc.label}</span>
                      <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, doc.id as any)} className="hidden" />
                      {(files as any)[doc.id] && (
                        <div className="text-xs md:text-sm text-skyworth-grass font-black mt-2 md:mt-3 flex items-center justify-center gap-2 md:gap-2 animate-fade-in">
                          <span className="text-base md:text-xl">✓</span> LISTO
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 md:gap-5 p-3 md:p-5 bg-gray-50 rounded-xl md:rounded-2xl border-2 md:border-3 border-gray-100 shadow-inner">
                <input required type="checkbox" name="terms" checked={formData.terms} onChange={handleInputChange} className="w-6 h-6 md:w-8 md:h-8 rounded-md md:rounded-lg accent-skyworth-grass cursor-pointer shadow-lg flex-shrink-0" />
                <span className="text-xs md:text-sm text-gray-600 font-bold leading-tight">
                    Declaro que la información es verídica y acepto el <button type="button" onClick={() => setShowTerms(true)} className="text-skyworth-blue underline font-black decoration-2 md:decoration-2 underline-offset-2 md:underline-offset-4">reglamento oficial</button> del Torneo Skyworth 2026.
                </span>
              </div>

              <button disabled={loading} type="submit" className={`w-full py-4 md:py-5 rounded-xl md:rounded-2xl text-white font-sport text-xl md:text-2xl lg:text-3xl tracking-wide md:tracking-wide shadow-[0_10px_30px_rgba(0,0,0,0.3)] transform transition-all border-b-4 md:border-b-6 active:border-b-0 active:translate-y-2 md:active:translate-y-3 ${loading ? 'bg-gray-400 border-gray-500 cursor-not-allowed scale-95' : 'bg-gradient-to-r from-skyworth-grass to-skyworth-pitch border-green-900 hover:brightness-110'}`}>
                {loading ? 'REVISANDO VAR...' : '¡SOLICITAR FICHAJE!'}
              </button>
            </form>
          </div>
        </div>
      </section>

      <footer className="bg-skyworth-dark text-white py-8 md:py-16 text-center border-t-6 md:border-t-8 border-skyworth-accent relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern-soccer opacity-5"></div>
        <div className="relative z-10">
            <p className="font-sport text-3xl md:text-4xl lg:text-5xl tracking-wider md:tracking-[0.4em] mb-3 md:mb-5 text-skyworth-accent opacity-90">SKYWORTH</p>
            <p className="text-[9px] md:text-xs opacity-40 font-black tracking-wider md:tracking-[0.4em] uppercase mb-4 md:mb-8 px-4">Sponsor oficial de tu pasión por el fútbol</p>
            <div className="pt-4 md:pt-8 border-t border-white/5 max-w-3xl mx-auto px-4 md:px-10">
                {/* Banner de Vendedor Autenticado */}
                {user && user.email && (
                  <div className="bg-green-50/10 border border-green-500/30 p-3 md:p-4 rounded-xl mb-4 md:mb-6 shadow-sm backdrop-blur-sm">
                    <div className="flex items-center justify-center gap-2 md:gap-3">
                      <span className="text-xl md:text-2xl">✅</span>
                      <div>
                        <p className="font-black text-green-400 text-xs md:text-sm">Vendedor Autenticado</p>
                        <p className="text-green-300 text-[10px] md:text-xs font-mono">{user.email}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <button 
                    onClick={onNavigateToDashboard} 
                    className="text-[9px] md:text-[10px] opacity-20 hover:opacity-100 transition-all border-2 border-white/20 px-3 md:px-6 py-2 md:py-3 rounded-full font-black uppercase tracking-wider md:tracking-[0.2em] hover:bg-white hover:text-skyworth-dark hover:scale-105 active:scale-95"
                >
                    Acceso Personal Autorizado / Staff Técnico
                </button>
            </div>
        </div>
      </footer>
    </div>
  );
}


