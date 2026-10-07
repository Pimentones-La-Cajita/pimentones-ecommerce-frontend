'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { adminApi, ApiError } from '@/lib/api';
import { Avatar, Button, Icon, Menu, UIProvider, cls, plural, type IconName } from './kit';

type Api = ReturnType<typeof adminApi>;
type Me = { id: number; email: string; name: string; role: string };
const Ctx = createContext<Api | null>(null);
const MeCtx = createContext<Me | null>(null);
export const useAdmin = () => useContext(Ctx)!;
export const useMe = () => useContext(MeCtx);
const KEY = 'lacajita.admin';

/** Permisos: owner > admin > ops > viewer (mismo orden que valida la API). */
const RANK: Record<string, number> = { viewer: 0, ops: 1, admin: 2, owner: 3 };
export const ROLE_LABEL: Record<string, string> = { owner: 'Propietario', admin: 'Administrador', ops: 'Operaciones', viewer: 'Solo lectura' };
export function useCan() { const me = useMe(); return (min: 'viewer' | 'ops' | 'admin' | 'owner') => (RANK[me?.role ?? 'viewer'] ?? 0) >= RANK[min]; }

/** Contadores que alimentan la barra lateral, la campana y el tablero. */
type Counts = { pendingConfirmation: number; toShip: number; unread: number; lowStock: number };
const ShellCtx = createContext<{ counts: Counts; refreshCounts: () => void }>({ counts: { pendingConfirmation: 0, toShip: 0, unread: 0, lowStock: 0 }, refreshCounts: () => {} });
export const useShell = () => useContext(ShellCtx);

type NavItem = { href: string; label: string; icon: IconName; count?: keyof Counts | 'orders'; keywords?: string };
const NAV: { group: string; items: NavItem[] }[] = [
  { group: 'Inicio', items: [{ href: '/admin', label: 'Tablero', icon: 'dashboard', keywords: 'inicio resumen ventas' }] },
  { group: 'Ventas', items: [
    { href: '/admin/pedidos', label: 'Pedidos', icon: 'orders', count: 'orders', keywords: 'ordenes despachar pagos remision' },
    { href: '/admin/clientes', label: 'Clientes', icon: 'users', keywords: 'compradores suscriptores boletin' },
  ] },
  { group: 'Catálogo', items: [
    { href: '/admin/productos', label: 'Productos', icon: 'tag', keywords: 'frascos precios fotos' },
    { href: '/admin/inventario', label: 'Inventario', icon: 'layers', count: 'lowStock', keywords: 'stock lotes bodega ajuste' },
    { href: '/admin/cupones', label: 'Cupones', icon: 'ticket', keywords: 'descuentos promociones codigos' },
  ] },
  { group: 'Operación', items: [
    { href: '/admin/envios', label: 'Envíos', icon: 'truck', keywords: 'zonas tarifas departamentos contraentrega' },
    { href: '/admin/mensajes', label: 'Mensajes', icon: 'inbox', count: 'unread', keywords: 'contacto bandeja correo' },
  ] },
  { group: 'Tienda', items: [
    { href: '/admin/contenido', label: 'Contenido', icon: 'file', keywords: 'textos portada preguntas faq' },
    { href: '/admin/ajustes', label: 'Ajustes', icon: 'sliders', keywords: 'configuracion contacto whatsapp transferencia' },
    { href: '/admin/usuarios', label: 'Equipo y bitácora', icon: 'shield', keywords: 'usuarios roles permisos auditoria' },
  ] },
];
const ALL = NAV.flatMap((g) => g.items.map((i) => ({ ...i, group: g.group })));
const isActive = (pathname: string, href: string) => (href === '/admin' ? pathname === '/admin' : pathname === href || pathname.startsWith(href + '/'));

/** Puerta de acceso + estructura del backoffice. */
export function AdminShell({ children }: { children: ReactNode }) {
  // La sesión se lee después de montar: servidor y navegador pintan lo mismo (sin errores de hidratación).
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState('');
  const [me, setMe] = useState<Me | null>(null);
  useEffect(() => {
    try { setToken(sessionStorage.getItem(KEY) || ''); setMe(JSON.parse(sessionStorage.getItem(KEY + '.me') || 'null')); } catch { /* no-op */ }
    setReady(true);
  }, []);

  const logout = useCallback(() => {
    try { sessionStorage.removeItem(KEY); sessionStorage.removeItem(KEY + '.me'); } catch { /* no-op */ }
    setToken(''); setMe(null);
  }, []);

  const api = useMemo(() => {
    const a = adminApi(token);
    return Object.fromEntries(Object.entries(a).map(([k, fn]) => [k, async (...args: unknown[]) => {
      try { return await (fn as (...a: unknown[]) => Promise<unknown>)(...args); }
      catch (e) { if (e instanceof ApiError && e.status === 401 && k !== 'login') logout(); throw e; }
    }])) as unknown as Api;
  }, [token, logout]);

  if (!ready) return <div className="bo-boot" aria-busy="true"><img src="/img/isotipo.svg" alt="" width={56} height={56} /></div>;
  if (!token) {
    return <Login onToken={(t, u) => { try { sessionStorage.setItem(KEY, t); sessionStorage.setItem(KEY + '.me', JSON.stringify(u)); } catch { /* no-op */ } setToken(t); setMe(u); }} />;
  }
  return (
    <Ctx.Provider value={api}>
      <MeCtx.Provider value={me}>
        <UIProvider>
          <Frame me={me} onLogout={logout}>{children}</Frame>
        </UIProvider>
      </MeCtx.Provider>
    </Ctx.Provider>
  );
}

function Frame({ me, onLogout, children }: { me: Me | null; onLogout: () => void; children: ReactNode }) {
  const api = useAdmin();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [counts, setCounts] = useState<Counts>({ pendingConfirmation: 0, toShip: 0, unread: 0, lowStock: 0 });

  const refreshCounts = useCallback(() => {
    Promise.all([api.summary(), api.messages('new')])
      .then(([s, m]: [any, any[]]) => setCounts({ pendingConfirmation: s.pendingConfirmation, toShip: s.toShip, unread: m.length, lowStock: s.lowStock?.length ?? 0 }))
      .catch(() => {});
  }, [api]);
  useEffect(() => { refreshCounts(); const t = setInterval(refreshCounts, 60_000); return () => clearInterval(t); }, [refreshCounts]);
  useEffect(() => { setMenuOpen(false); refreshCounts(); }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { const h = () => setScrolled(window.scrollY > 4); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);

  const current = ALL.find((i) => isActive(pathname, i.href)) ?? ALL[0];
  const orderCount = counts.pendingConfirmation + counts.toShip;
  const countFor = (k?: NavItem['count']) => (k === 'orders' ? orderCount : k ? counts[k] : 0);
  const totalAlerts = orderCount + counts.unread + counts.lowStock;
  const shell = useMemo(() => ({ counts, refreshCounts }), [counts, refreshCounts]);

  return (
    <ShellCtx.Provider value={shell}>
      <div className="bo">
        <div className="bo-layout">
          <aside className={cls('bo-side', menuOpen && 'is-open')} aria-label="Navegación del backoffice">
            <div className="bo-side-top">
              <Link href="/admin" className="bo-brand" aria-label="Ir al tablero"><img src="/img/logo.svg" alt="Pimentones La Cajita" /></Link>
              <a href="/" target="_blank" rel="noreferrer" className="bo-store">
                <Icon name="store" size={18} />
                <div><b>Tienda en línea</b><span><i className="bo-live" />Publicada · ver sitio</span></div>
                <Icon name="external" size={14} />
              </a>
            </div>
            <nav className="bo-nav">
              {NAV.map((g) => (
                <div key={g.group} className="bo-nav-group">
                  <span className="bo-nav-title">{g.group}</span>
                  {g.items.map((it) => {
                    const n = countFor(it.count); const active = isActive(pathname, it.href);
                    return (
                      <Link key={it.href} href={it.href} className={cls('bo-nav-item', active && 'is-active')} aria-current={active ? 'page' : undefined}>
                        <Icon name={it.icon} size={18} />{it.label}
                        {n > 0 && <span className={cls('bo-nav-count', it.count === 'lowStock' ? 'is-warn' : 'is-alert')}>{n}</span>}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>
            <div className="bo-side-foot">
              <Menu up left trigger={(toggle) => (
                <button className="bo-user" onClick={toggle}>
                  <Avatar name={me?.name || 'Admin'} size={34} />
                  <div><b>{me?.name || 'Administrador'}</b><span>{ROLE_LABEL[me?.role ?? ''] ?? me?.role}</span></div>
                  <Icon name="chevronUp" size={16} className="faint" />
                </button>
              )} items={[
                { group: me?.email ?? '' },
                { label: 'Ver tienda', icon: 'external', href: '/', external: true },
                { label: 'Equipo y bitácora', icon: 'shield', href: '/admin/usuarios' },
                'sep',
                { label: 'Cerrar sesión', icon: 'logout', onClick: onLogout, danger: true },
              ]} />
            </div>
          </aside>
          <div className={cls('bo-scrim', menuOpen && 'is-open')} onClick={() => setMenuOpen(false)} />

          <div className="bo-main">
            <header className={cls('bo-topbar', scrolled && 'is-scrolled')}>
              <Button variant="ghost" iconOnly icon="menu" className="bo-burger" onClick={() => setMenuOpen(true)} aria-label="Abrir menú" />
              <div className="bo-crumbs"><span className="bo-hide-sm">{current.group}</span><Icon name="chevronRight" size={14} className="faint bo-hide-sm" /><b>{current.label}</b></div>
              <div className="bo-top-actions">
                <Menu trigger={(toggle) => (
                  <span style={{ position: 'relative', display: 'inline-flex' }}>
                    <Button variant="ghost" iconOnly icon="bell" onClick={toggle} aria-label={`Pendientes: ${totalAlerts}`} />
                    {totalAlerts > 0 && <span style={{ position: 'absolute', top: 6, right: 7, width: 8, height: 8, borderRadius: 8, background: 'var(--red)', boxShadow: '0 0 0 2px #fff' }} />}
                  </span>
                )} items={totalAlerts === 0 ? [{ group: 'Pendientes' }, { label: 'Todo al día. No hay nada pendiente.', icon: 'checkCircle' }] : [
                  { group: 'Pendientes' },
                  { label: `${plural(counts.pendingConfirmation, 'pago', 'pagos')} por confirmar`, icon: 'card', href: '/admin/pedidos?tab=pending', hidden: !counts.pendingConfirmation },
                  { label: `${plural(counts.toShip, 'pedido', 'pedidos')} por despachar`, icon: 'truck', href: '/admin/pedidos?tab=paid', hidden: !counts.toShip },
                  { label: `${plural(counts.unread, 'mensaje nuevo', 'mensajes nuevos')}`, icon: 'inbox', href: '/admin/mensajes', hidden: !counts.unread },
                  { label: `${plural(counts.lowStock, 'producto', 'productos')} con inventario bajo`, icon: 'alert', href: '/admin/inventario?f=attention', hidden: !counts.lowStock },
                ]} />
                <a href="/" target="_blank" rel="noreferrer" className="bo-btn bo-btn--secondary bo-btn--sm bo-hide-sm"><Icon name="external" size={15} />Ver tienda</a>
              </div>
            </header>
            <main className="bo-content">{children}</main>
          </div>
        </div>
      </div>
    </ShellCtx.Provider>
  );
}

function Login({ onToken }: { onToken: (t: string, u: { id: number; email: string; name: string; role: string }) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Solo en desarrollo: nunca se publican credenciales en el sitio en producción.
  const isDev = process.env.NODE_ENV !== 'production';
  const fillDemo = () => {
    setEmail('admin@pimentoneslacajita.com');
    setPassword('LaCajita2026!Admin#Seguro');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const r = await adminApi('').login(email, password);
      onToken(r.token, r.user);
    } catch (err) {
      setError((err as Error).message || 'Credenciales no válidas. Revisa correo y contraseña.');
      setBusy(false);
    }
  };

  return (
    <div className="admin-split-auth">
      {/* PANEL IZQUIERDO: SHOWCASE EDITORIAL & EXPERIENCIA DE MARCA */}
      <aside className="admin-showcase-pane">
        <div className="admin-showcase-bg-layer" />
        <div className="admin-showcase-overlay" />

        <div className="admin-showcase-content">
          <header className="admin-showcase-top">
            <div className="admin-status-badge">
              <span className="status-radar-dot" />
              <span>CONSOLA DE OPERACIÓN</span>
            </div>
            <span className="admin-origin-tag">Bogotá D.C., Colombia</span>
          </header>

          <div className="admin-showcase-hero">
            <span className="admin-artisan-tag">CONSERVAS ARTESANALES DE AUTOR</span>
            <h2 className="admin-showcase-headline">
              Todo tu negocio, en un solo lugar.
            </h2>
            <p className="admin-showcase-desc">
              Confirma pagos, despacha pedidos, controla tus lotes de producción y mira cómo van las ventas, desde el computador o el celular.
            </p>

            <div className="admin-showcase-features">
              <div className="showcase-feat-item">
                <span className="feat-icon"><Icon name="orders" size={18} /></span>
                <div>
                  <strong>Pedidos paso a paso</strong>
                  <span>Cada pedido te dice qué sigue: confirmar, preparar o despachar</span>
                </div>
              </div>
              <div className="showcase-feat-item">
                <span className="feat-icon"><Icon name="layers" size={18} /></span>
                <div>
                  <strong>Inventario con trazabilidad</strong>
                  <span>Lotes con vencimiento y cada frasco registrado</span>
                </div>
              </div>
              <div className="showcase-feat-item">
                <span className="feat-icon"><Icon name="shield" size={18} /></span>
                <div>
                  <strong>Acceso por roles</strong>
                  <span>Cada persona del equipo ve solo lo que necesita</span>
                </div>
              </div>
            </div>
          </div>

          <footer className="admin-showcase-footer">
            <p className="artisan-quote">
              “El secreto está en la paciencia del fuego lento y la selección rigurosa de cada pimentón.”
            </p>
            <span className="quote-author">— Taller Artesanal La Cajita</span>
          </footer>
        </div>
      </aside>

      {/* PANEL DERECHO: FORMULARIO ULTRA LIMPIO, ELEGANTE Y RESPONSIVO */}
      <section className="admin-form-pane">
        <div className="admin-form-card">
          <header className="admin-form-header">
            <div className="admin-logo-wrapper">
              <img
                src="/img/logo-vertical.svg"
                alt="Pimentones La Cajita"
                className="admin-official-brand-logo"
              />
            </div>
            <div className="admin-access-badge">PANEL ADMINISTRATIVO</div>
            <h1 className="admin-form-title">Iniciar sesión</h1>
            <p className="admin-form-subtitle">
              Entra con el correo y la contraseña que te dio el propietario de la tienda.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="admin-login-form">
            <div className="admin-field-group">
              <label htmlFor="auth-email" className="admin-field-label">
                CORREO ELECTRÓNICO
              </label>
              <div className="admin-field-input-box">
                <svg className="field-svg-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <input
                  id="auth-email"
                  type="email"
                  required
                  placeholder="admin@pimentoneslacajita.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  className="admin-text-input"
                />
              </div>
            </div>

            <div className="admin-field-group">
              <div className="admin-field-label-split">
                <label htmlFor="auth-password" className="admin-field-label">
                  CONTRASEÑA
                </label>
                <button
                  type="button"
                  className="admin-toggle-pwd-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Ver u ocultar contraseña"
                >
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
              <div className="admin-field-input-box">
                <svg className="field-svg-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="admin-text-input"
                />
              </div>
            </div>

            {error && (
              <div className="admin-alert-box" role="alert">
                <svg className="alert-svg-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="admin-primary-btn"
              disabled={busy}
            >
              {busy ? (
                <span className="btn-spinner-state">
                  <span className="admin-button-spinner" /> Validando acceso…
                </span>
              ) : (
                <span className="btn-ready-state">
                  Entrar <Icon name="arrowRight" size={16} />
                </span>
              )}
            </button>

            {isDev && (
              <button
                type="button"
                onClick={fillDemo}
                className="admin-autofill-btn"
                title="Solo visible en desarrollo"
              >
                Usar cuenta de prueba (solo desarrollo)
              </button>
            )}
          </form>

          <footer className="admin-form-footer">
            <Link href="/" className="admin-return-link">
              ← Volver a la tienda
            </Link>
            <div className="admin-security-note">
              <Icon name="lock" size={12} /> <span>Conexión segura</span>
            </div>
          </footer>
        </div>
      </section>
    </div>
  );
}
