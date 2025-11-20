"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

// 1. Contenedor de Cascada (Stagger)
// Usamos esto para envolver la página entera o rejillas grandes.
export const StaggerContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1, // Retraso suave entre elementos
            delayChildren: 0.1, // Pequeña pausa inicial para asegurar que el DOM existe
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 2. Elemento Hijo (Item)
// Úsalo para envolver cada Card o sección importante.
export const StaggerItem = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 10 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.4, ease: "easeOut" },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 3. Tarjeta Elegante (HoverCard)
// SIN SALTO (y: -4 eliminado). Solo brillo y sombra.
export const HoverCard = ({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Card>) => {
  return (
    <Card
      className={`h-full transition-all duration-300 hover:shadow-md hover:border-slate-300 ${className}`}
      {...props}
    >
      {children}
    </Card>
  );
};
