export function Card({ children, className = '' }) {
  return <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>{children}</div>
}

export function CardHeader({ children }) {
  return <div className="flex flex-col space-y-1.5 p-6">{children}</div>
}

export function CardTitle({ children }) {
  return <h3 className="text-2xl font-semibold leading-none tracking-tight">{children}</h3>
}

export function CardDescription({ children }) {
  return <p className="text-sm text-muted-foreground">{children}</p>
}

export function CardContent({ children, className = '' }) {
  return <div className={`p-6 pt-0 ${className}`}>{children}</div>
}

