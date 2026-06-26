import { ArrowBigLeft, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link, useNavigate } from 'react-router'
import { useState, useEffect, type JSX } from 'react'
import { RUTAS } from "@/lib/const"

interface ReportErrorProps {
  readonly className?: string
  readonly redirect?: string
  readonly error?: {
    code: string
    message: string
  }
}

/**
 *  Componente de reporte de error con diseño centrado y opción de redirección.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {string} [props.className] - Clase CSS adicional para personalizar el contenedor principal.
 * @property {string} [redirect="/"] - Si se proporciona, se renderiza un botón que redirige al valor del redirect.
 * @param {Object} [props.error] - Objeto que contiene el código y mensaje de error. Por defecto, muestra un error 404.
 *
 * @returns {JSX.Element} Un componente visual que representa la página de error 404 con un diseño centrado.
 */
export default function ReportError({ className, redirect = RUTAS.dashboard, error = { code: '404', message: 'Lo sentimos, la página que buscas no existe.' } }: ReportErrorProps): JSX.Element {
  const [ isVisible, setIsVisible ] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const t = setTimeout(() => setIsVisible(true), 0)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className={`min-h-screen flex items-center justify-center bg-background ${className ?? ''}`}>
      <div className="text-center">
        <h1 className="text-9xl max-md:text-7xl font-extrabold text-foreground tracking-widest">
          <span className="inline-block animate-bounce">{error.code.slice(0, 1)}</span>
          <span className="inline-block animate-bounce delay-100">{error.code.slice(1, 2)}</span>
          <span className="inline-block animate-bounce delay-200">{error.code.slice(2, 3)}</span>
        </h1>
        <div className={`mt-4 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-2xl font-semibold mb-8 text-foreground">
            {error.message}
          </p>
          <div className="flex justify-center gap-4 mt-6">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate(-1)}
              className="font-semibold cursor-pointer text-primary border-primary hover:bg-primary/10 hover:text-primary transition-all duration-300 shadow-md hover:shadow-lg transform"
            >
              <ArrowBigLeft className="mr-2 h-5 w-5" />
              Volver
            </Button>
            {redirect && (
              <Link to={redirect}>
                <Button variant="outline" size="lg" className="font-semibold cursor-pointer text-accent-foreground border-accent-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-300 shadow-md hover:shadow-lg transform">
                  <Home className="mr-2 h-5 w-5" />
                  Inicio
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
