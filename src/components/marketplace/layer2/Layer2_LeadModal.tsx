"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Layer2LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  assetName: string;
}

export default function Layer2LeadModal({ isOpen, onClose, onSuccess, assetName }: Layer2LeadModalProps) {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    pais: "",
    ciudad: "",
    email: "",
    telefono: ""
  });
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  useEffect(() => {
    if (isSent) {
      const timer = setTimeout(() => {
        onSuccess();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isSent, onSuccess]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    // Simulación de envío
    setTimeout(() => {
      setIsSending(false);
      setIsSent(true);
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20
        }}>
          {/* Backdrop con Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0, 0, 0, 0.4)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            style={{
              position: "relative",
              background: "#FFFFFF",
              width: "100%",
              maxWidth: 320,
              borderRadius: 16,
              padding: "24px 20px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              overflow: "hidden"
            }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                background: "none",
                border: "none",
                fontSize: 18,
                color: "#9CA3AF",
                cursor: "pointer",
                padding: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              ✕
            </button>

            {!isSent ? (
              <>
                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: "#0F1117", marginBottom: 4 }}>
                    Me interesa este activo
                  </h3>
                  <p style={{ fontSize: 10, color: "#6B7280" }}>
                    {assetName}
                  </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <label style={{ fontSize: 10, fontWeight: 600, color: "#374151" }}>Nombre</label>
                      <input
                        required
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        style={{ fontSize: 12, padding: "8px 10px", borderRadius: 8, border: "1px solid #E5E7EB", outline: "none", background: "#F9FAFB" }}
                        placeholder="Ej: Juan"
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <label style={{ fontSize: 10, fontWeight: 600, color: "#374151" }}>Apellido</label>
                      <input
                        required
                        name="apellido"
                        value={formData.apellido}
                        onChange={handleChange}
                        style={{ fontSize: 12, padding: "8px 10px", borderRadius: 8, border: "1px solid #E5E7EB", outline: "none", background: "#F9FAFB" }}
                        placeholder="Ej: Pérez"
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <label style={{ fontSize: 10, fontWeight: 600, color: "#374151" }}>País</label>
                      <input
                        required
                        name="pais"
                        value={formData.pais}
                        onChange={handleChange}
                        style={{ fontSize: 12, padding: "8px 10px", borderRadius: 8, border: "1px solid #E5E7EB", outline: "none", background: "#F9FAFB" }}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <label style={{ fontSize: 10, fontWeight: 600, color: "#374151" }}>Ciudad</label>
                      <input
                        required
                        name="ciudad"
                        value={formData.ciudad}
                        onChange={handleChange}
                        style={{ fontSize: 12, padding: "8px 10px", borderRadius: 8, border: "1px solid #E5E7EB", outline: "none", background: "#F9FAFB" }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <label style={{ fontSize: 10, fontWeight: 600, color: "#374151" }}>Email</label>
                    <input
                      required
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      style={{ fontSize: 12, padding: "8px 10px", borderRadius: 8, border: "1px solid #E5E7EB", outline: "none", background: "#F9FAFB" }}
                      placeholder="email@ejemplo.com"
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <label style={{ fontSize: 10, fontWeight: 600, color: "#374151" }}>Teléfono</label>
                    <input
                      required
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      style={{ fontSize: 12, padding: "8px 10px", borderRadius: 8, border: "1px solid #E5E7EB", outline: "none", background: "#F9FAFB" }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSending}
                    style={{
                      marginTop: 10,
                      background: "#000000",
                      color: "#FFFFFF",
                      border: "none",
                      padding: "12px",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: isSending ? "not-allowed" : "pointer",
                      opacity: isSending ? 0.7 : 1,
                      transition: "all 0.2s"
                    }}
                  >
                    {isSending ? "Enviando..." : "Enviar interés"}
                  </button>
                </form>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ 
                  width: 48, height: 48, borderRadius: "50%", background: "#ECFDF5", color: "#10B981",
                  display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 24
                }}>
                  ✓
                </div>
                <div style={{ fontSize: 9, color: "#374151", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Mensaje enviado. Un asesor lo contactará a la brevedad
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
