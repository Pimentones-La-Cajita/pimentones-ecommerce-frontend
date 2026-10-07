'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ADMIN_ROLES } from '@lacajita/shared';
import { ROLE_LABEL, useAdmin, useCan, useMe } from './AdminShell';
import {
  Avatar, Badge, Button, Card, Drawer, EmptyState, Field, Icon, Input, Menu, Modal, PageHeader, SearchInput, Select, TableSkeleton, Tabs, cls,
  copyText, fmtDate, fmtDay, plural, relTime, STATUS_META, norm, useUI, type IconName, type MenuItem,
} from './kit';

/**
 * Equipo (quién entra y qué puede hacer) y Bitácora (qué se hizo, quién y cuándo) en frases legibles.
 */
type Role = (typeof ADMIN_ROLES)[number];
const ROLE_META: Record<Role, { icon: IconName; tone: 'violet' | 'blue' | 'green' | 'gray'; desc: string; can: string[]; cannot: string[] }> = {
  owner: { icon: 'key', tone: 'violet', desc: 'Control total del negocio.', can: ['Todo lo de Administrador', 'Invitar y gestionar el equipo'], cannot: [] },
  admin: { icon: 'shield', tone: 'blue', desc: 'Gestiona la tienda.', can: ['Productos, cupones y envíos', 'Contenido y ajustes', 'Ver la bitácora'], cannot: ['Gestionar el equipo'] },
  ops: { icon: 'box', tone: 'green', desc: 'Opera el día a día.', can: ['Pedidos y despachos', 'Inventario y lotes', 'Responder mensajes'], cannot: ['Precios, cupones y ajustes'] },
  viewer: { icon: 'eye', tone: 'gray', desc: 'Consulta sin modificar.', can: ['Ver tablero, pedidos y reportes'], cannot: ['Hacer cambios'] },
};
const genPassword = () => { const a = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'; const s = '!#$%*?'; let p = ''; const r = new Uint32Array(14); crypto.getRandomValues(r); r.forEach((n, i) => { p += i === 6 ? s[n % s.length] : a[n % a.length]; }); return p; };
const ADMIN_URL = typeof window !== 'undefined' ? `${window.location.origin}/admin` : '/admin';

export function Users() {
  const api = useAdmin(); const can = useCan();
  const [tab, setTab] = useState<'team' | 'audit'>('team');
  const [users, setUsers] = useState<any[] | null>(null); const [error, setError] = useState('');
  const load = useCallback(() => api.users().then((r) => { setUsers(r); setError(''); }).catch((e: Error) => setError(e.message)), [api]);
  useEffect(() => { load(); }, [load]);
  const [invite, setInvite] = useState(false);

  return (
    <>
      <PageHeader title="Equipo y bitácora" description="Quién tiene acceso al administrador, qué puede hacer cada persona y el registro de todo lo que se cambia."
        actions={tab === 'team' && can('owner') && <Button variant="primary" icon="plus" onClick={() => setInvite(true)}>Invitar persona</Button>} />
      <div style={{ marginBottom: 18 }}><Tabs value={tab} onChange={setTab} items={[{ value: 'team', label: 'Equipo', count: users?.filter((u) => u.active).length }, { value: 'audit', label: 'Bitácora' }]} /></div>
      {tab === 'team' ? <Team users={users} error={error} reload={load} onInvite={() => setInvite(true)} /> : <Audit users={users ?? []} />}
      {invite && <InviteDrawer existing={(users ?? []).map((u) => u.email)} onClose={() => setInvite(false)} onCreated={load} />}
    </>
  );
}

// ---------------------------------------------------------------------------
function Team({ users, error, reload, onInvite }: { users: any[] | null; error: string; reload: () => void; onInvite: () => void }) {
  const api = useAdmin(); const can = useCan(); const me = useMe(); const { toast, confirm } = useUI();
  const [reset, setReset] = useState<any>(null); const [pwd, setPwd] = useState(''); const [busy, setBusy] = useState(false);
  const owner = can('owner');
  const byRole = useMemo(() => Object.fromEntries(ADMIN_ROLES.map((r) => [r, (users ?? []).filter((u) => u.role === r && u.active).length])), [users]);

  const update = async (u: any, body: object, ok: string) => {
    try { await api.updateUser(u.id, body); toast(ok); reload(); } catch (e) { toast((e as Error).message, 'error'); }
  };
  const changeRole = async (u: any, role: Role) => {
    if (role === u.role) return;
    if (!(await confirm({ title: `¿Cambiar el rol de ${u.name}?`, body: `Pasará de ${ROLE_LABEL[u.role]} a ${ROLE_LABEL[role]}: ${ROLE_META[role].desc}`, confirm: 'Cambiar rol', icon: ROLE_META[role].icon }))) return;
    update(u, { role }, `${u.name} ahora es ${ROLE_LABEL[role]}`);
  };
  const toggleActive = async (u: any) => {
    if (u.active && !(await confirm({ title: `¿Quitar el acceso a ${u.name}?`, body: 'No podrá volver a entrar al administrador. Su historial en la bitácora se conserva y puedes reactivarlo cuando quieras.', confirm: 'Quitar acceso', danger: true }))) return;
    update(u, { active: !u.active }, u.active ? `${u.name} ya no tiene acceso` : `${u.name} tiene acceso de nuevo`);
  };
  const doReset = async () => {
    setBusy(true);
    try { await api.updateUser(reset.id, { password: pwd }); toast(`Contraseña de ${reset.name} actualizada`); await copyText(pwd); setReset(null); } catch (e) { toast((e as Error).message, 'error'); }
    setBusy(false);
  };

  return (
    <div className="bo-stack">
      <div className="bo-roles">
        {ADMIN_ROLES.map((r) => (
          <div key={r} className="bo-card" style={{ padding: 16 }}>
            <div className="bo-between"><span className="bo-row" style={{ gap: 8 }}><span className="bo-stat-icon" style={{ background: `var(--${ROLE_META[r].tone === 'gray' ? 'hover' : ROLE_META[r].tone + '-50'})`, color: ROLE_META[r].tone === 'gray' ? 'var(--muted)' : `var(--${ROLE_META[r].tone})` }}><Icon name={ROLE_META[r].icon} size={15} /></span><b>{ROLE_LABEL[r]}</b></span><span className="small muted">{plural(byRole[r] ?? 0, 'persona', 'personas')}</span></div>
            <p className="small muted" style={{ margin: '8px 0 10px' }}>{ROLE_META[r].desc}</p>
            <div className="bo-stack" style={{ gap: 4 }}>
              {ROLE_META[r].can.map((c) => <span key={c} className="bo-perm"><Icon name="check" size={13} style={{ color: 'var(--brand)' }} />{c}</span>)}
              {ROLE_META[r].cannot.map((c) => <span key={c} className="bo-perm no"><Icon name="x" size={13} />{c}</span>)}
            </div>
          </div>
        ))}
      </div>

      <Card flush title="Personas con acceso" description={owner ? 'Como propietario puedes invitar, cambiar roles y quitar accesos.' : 'Solo el propietario puede gestionar el equipo.'}>
        <div style={{ height: 12 }} />
        {error ? <EmptyState icon="alert" title="No pudimos cargar el equipo" action={<Button onClick={reload}>Reintentar</Button>}>{error}</EmptyState>
          : !users ? <TableSkeleton rows={3} cols={4} />
          : users.length === 0 ? <EmptyState icon="users" title="Aún no hay personas" action={owner ? <Button variant="primary" icon="plus" onClick={onInvite}>Invitar</Button> : undefined} />
          : (
            <div className="bo-table-wrap">
              <table className="bo-table">
                <thead><tr><th>Persona</th><th>Rol</th><th>Estado</th><th className="bo-hide-sm">Último acceso</th>{owner && <th className="w-act" />}</tr></thead>
                <tbody>
                  {users.map((u) => {
                    const self = u.id === me?.id;
                    const items: MenuItem[] = [
                      { group: 'Cambiar rol' },
                      ...ADMIN_ROLES.map((r) => ({ label: `${ROLE_LABEL[r]}${r === u.role ? ' (actual)' : ''}`, icon: ROLE_META[r].icon, onClick: () => changeRole(u, r), hidden: self })),
                      'sep',
                      { label: 'Restablecer contraseña', icon: 'key', onClick: () => { setPwd(genPassword()); setReset(u); } },
                      { label: u.active ? 'Quitar acceso' : 'Reactivar acceso', icon: u.active ? 'lock' : 'check', danger: u.active, onClick: () => toggleActive(u), hidden: self },
                    ];
                    return (
                      <tr key={u.id} style={!u.active ? { opacity: 0.6 } : undefined}>
                        <td><div className="bo-cell-main"><Avatar name={u.name} size={34} /><div><b className="bo-row" style={{ gap: 6 }}>{u.name}{self && <Badge tone="outline">Tú</Badge>}</b><span>{u.email}</span></div></div></td>
                        <td><Badge tone={ROLE_META[u.role as Role]?.tone ?? 'gray'} icon={ROLE_META[u.role as Role]?.icon}>{ROLE_LABEL[u.role] ?? u.role}</Badge></td>
                        <td>{u.active ? <Badge tone="green" dot>Activo</Badge> : <Badge tone="gray" dot>Sin acceso</Badge>}</td>
                        <td className="bo-hide-sm muted" title={u.lastLoginAt ? fmtDate(u.lastLoginAt) : undefined}>{u.lastLoginAt ? relTime(u.lastLoginAt) : 'Nunca ha entrado'}</td>
                        {owner && <td className="w-act"><Menu trigger={(t) => <Button size="sm" variant="ghost" iconOnly icon="more" onClick={t} aria-label={`Acciones para ${u.name}`} />} items={items} /></td>}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
      </Card>

      <Modal open={!!reset} onClose={() => setReset(null)}>
        {reset && <>
          <span className="bo-modal-icon" style={{ background: 'var(--brand-50)', color: 'var(--brand)' }}><Icon name="key" size={20} /></span>
          <h3>Nueva contraseña para {reset.name}</h3>
          <p>Compártela por un canal seguro. Al guardar la copiamos al portapapeles.</p>
          <div className="bo-row" style={{ marginTop: 14 }}><Input className="mono" value={pwd} onChange={(e) => setPwd(e.target.value)} aria-invalid={pwd.length < 8} /><Button iconOnly icon="refresh" onClick={() => setPwd(genPassword())} aria-label="Generar otra" /></div>
          {pwd.length < 8 && <div className="bo-field-error" style={{ marginTop: 6 }}><Icon name="alert" size={13} />Mínimo 8 caracteres.</div>}
          <div className="bo-modal-actions"><Button onClick={() => setReset(null)}>Cancelar</Button><Button variant="primary" loading={busy} disabled={pwd.length < 8} onClick={doReset}>Guardar y copiar</Button></div>
        </>}
      </Modal>
    </div>
  );
}

// ---------------------------------------------------------------------------
function InviteDrawer({ existing, onClose, onCreated }: { existing: string[]; onClose: () => void; onCreated: () => void }) {
  const api = useAdmin(); const { toast } = useUI();
  const [u, setU] = useState({ name: '', email: '', role: 'ops' as Role, password: genPassword() }); const [show, setShow] = useState(true);
  const [busy, setBusy] = useState(false); const [touched, setTouched] = useState(false); const [done, setDone] = useState(false);
  const errors: Record<string, string> = {};
  if (u.name.trim().length < 2) errors.name = 'Escribe su nombre.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(u.email)) errors.email = 'Revisa el correo.';
  else if (existing.includes(u.email.trim().toLowerCase())) errors.email = 'Esta persona ya tiene una cuenta.';
  if (u.password.length < 8) errors.password = 'Mínimo 8 caracteres.';
  const valid = !Object.keys(errors).length; const err = (k: string) => (touched ? errors[k] : undefined);
  const message = `Hola ${u.name.split(' ')[0]}, te di acceso al administrador de Pimentones La Cajita como ${ROLE_LABEL[u.role]}.\n\nEntra en: ${ADMIN_URL}\nCorreo: ${u.email.trim().toLowerCase()}\nContraseña temporal: ${u.password}\n\nTe recomiendo cambiarla después de entrar.`;
  const create = async () => {
    setTouched(true); if (!valid) return;
    setBusy(true);
    try { await api.createUser({ ...u, email: u.email.trim().toLowerCase(), name: u.name.trim() }); setDone(true); onCreated(); toast(`${u.name} ya tiene acceso`); }
    catch (e) { toast((e as Error).message, 'error'); }
    setBusy(false);
  };
  return (
    <Drawer open onClose={onClose} size="md" title={done ? 'Acceso creado' : 'Invitar persona'} subtitle={done ? 'Comparte estos datos para que pueda entrar.' : 'Crea su acceso y elige qué podrá hacer.'}
      footer={done ? <Button variant="primary" onClick={onClose}>Listo</Button> : <><Button onClick={onClose}>Cancelar</Button><Button variant="primary" icon="check" loading={busy} onClick={create}>Crear acceso</Button></>}>
      {done ? (
        <div className="bo-stack">
          <div className="bo-all-done"><Icon name="checkCircle" size={20} /><span><b>{u.name}</b> ya puede entrar como {ROLE_LABEL[u.role]}.</span></div>
          <div className="bo-box bo-box--subtle"><pre style={{ margin: 0, whiteSpace: 'pre-wrap', font: '13px/1.6 var(--sans)' }}>{message}</pre></div>
          <div className="bo-row"><Button icon="copy" onClick={async () => { if (await copyText(message)) toast('Mensaje copiado'); }}>Copiar mensaje</Button></div>
          <div className="bo-callout bo-callout--amber"><Icon name="alert" size={16} />Por seguridad no volveremos a mostrar esta contraseña.</div>
        </div>
      ) : (
        <>
          <div className="bo-fieldset">
            <div className="bo-form-grid">
              <Field label="Nombre" error={err('name')}><Input autoFocus value={u.name} aria-invalid={!!err('name')} onChange={(e) => setU({ ...u, name: e.target.value })} placeholder="Laura Gómez" /></Field>
              <Field label="Correo" error={err('email')}><Input type="email" value={u.email} aria-invalid={!!err('email')} onChange={(e) => setU({ ...u, email: e.target.value })} placeholder="laura@correo.com" /></Field>
            </div>
          </div>
          <div className="bo-fieldset">
            <div className="bo-fieldset-head"><h3>¿Qué podrá hacer?</h3></div>
            <div className="bo-stack" style={{ gap: 8 }}>
              {ADMIN_ROLES.filter((r) => r !== 'owner').map((r) => (
                <button key={r} type="button" className={cls('bo-choice', u.role === r && 'is-active')} onClick={() => setU({ ...u, role: r })} style={{ width: '100%' }}>
                  <Icon name={ROLE_META[r].icon} size={18} />
                  <div style={{ flex: 1 }}><b>{ROLE_LABEL[r]}</b><span>{ROLE_META[r].desc} {ROLE_META[r].can.join(' · ')}.</span></div>
                  {u.role === r && <Icon name="checkCircle" size={18} style={{ color: 'var(--brand)' }} />}
                </button>
              ))}
            </div>
          </div>
          <div className="bo-fieldset">
            <Field label="Contraseña temporal" error={err('password')} hint="La generamos por ti. Podrás copiarla al terminar.">
              <div className="bo-row">
                <Input className="mono" type={show ? 'text' : 'password'} value={u.password} autoComplete="new-password" onChange={(e) => setU({ ...u, password: e.target.value })} />
                <Button iconOnly icon={show ? 'eyeOff' : 'eye'} onClick={() => setShow(!show)} aria-label={show ? 'Ocultar' : 'Mostrar'} />
                <Button iconOnly icon="refresh" onClick={() => setU({ ...u, password: genPassword() })} aria-label="Generar otra" />
              </div>
            </Field>
          </div>
        </>
      )}
    </Drawer>
  );
}

// ---------------------------------------------------------------------------
const ENTITY: Record<string, { label: string; icon: IconName; color: string }> = {
  pedido: { label: 'Pedidos', icon: 'orders', color: 'var(--blue)' }, producto: { label: 'Productos', icon: 'tag', color: 'var(--violet)' },
  inventario: { label: 'Inventario', icon: 'layers', color: 'var(--brand)' }, cupon: { label: 'Cupones', icon: 'ticket', color: 'var(--pink)' },
  zona: { label: 'Envíos', icon: 'truck', color: 'var(--cyan)' }, contenido: { label: 'Contenido', icon: 'file', color: 'var(--amber)' },
  ajustes: { label: 'Ajustes', icon: 'sliders', color: 'var(--ink-2)' }, usuario: { label: 'Equipo', icon: 'shield', color: 'var(--violet)' },
  mensaje: { label: 'Mensajes', icon: 'inbox', color: 'var(--blue)' },
};
const FIELD: Record<string, string> = { name: 'nombre', price: 'precio', stock: 'inventario', description: 'descripción', image: 'foto', active: 'visibilidad', tagline: 'frase corta', kicker: 'frase superior', pairing: 'maridaje', slug: 'dirección web', sizeG: 'contenido', sort: 'posición' };
const parse = (d: unknown): any => { if (!d) return {}; if (typeof d === 'string') { try { return JSON.parse(d); } catch { return {}; } } return d; };

function sentence(a: any, productName: (id: string) => string): { text: React.ReactNode; detail?: string } {
  const d = parse(a.detail); const id = String(a.entityId ?? '');
  switch (a.entity) {
    case 'pedido': {
      if (d.status) return { text: <>movió el pedido <b className="mono">{id}</b> a <b>{STATUS_META[d.status]?.label ?? d.status}</b></>, detail: d.tracking ? `Guía ${d.tracking}${d.carrier ? ` · ${d.carrier}` : ''}` : undefined };
      if (d.tracking) return { text: <>registró la guía del pedido <b className="mono">{id}</b></>, detail: `${d.carrier ?? ''} ${d.tracking}`.trim() };
      if (d.adminNotes !== undefined) return { text: <>actualizó las notas internas del pedido <b className="mono">{id}</b></> };
      return { text: <>actualizó el pedido <b className="mono">{id}</b></> };
    }
    case 'producto': {
      const name = d.name || productName(id);
      if (a.action === 'crear') return { text: <>creó el producto <b>{name}</b></> };
      if (a.action === 'desactivar') return { text: <>ocultó el producto <b>{name}</b></> };
      const keys = Object.keys(d);
      if (keys.length === 1 && keys[0] === 'active') return { text: <>{d.active ? 'mostró' : 'ocultó'} <b>{name}</b> en la tienda</> };
      return { text: <>editó el producto <b>{name}</b></>, detail: keys.length ? `Cambió: ${keys.map((k) => FIELD[k] ?? k).join(', ')}` : undefined };
    }
    case 'inventario':
      if (a.action === 'lote') return { text: <>registró el lote <b className="mono">{d.code}</b> de <b>{productName(id)}</b> (+{d.quantity})</> };
      return { text: <>ajustó el inventario de <b>{productName(id)}</b> ({d.delta > 0 ? '+' : ''}{d.delta})</>, detail: d.note };
    case 'cupon': return { text: <>{a.action === 'crear' ? 'creó' : 'editó'} el cupón <b className="mono">{id}</b>{d.active === false ? ' (pausado)' : ''}</> };
    case 'zona': return { text: <>actualizó el envío a <b>{id}</b></>, detail: d.rate != null ? `$${Number(d.rate).toLocaleString('es-CO')} · ${d.daysMin}–${d.daysMax} días${d.codAvailable ? ' · contraentrega' : ''}${d.active === false ? ' · inactivo' : ''}` : undefined };
    case 'contenido': return { text: <>actualizó el contenido de la tienda</> };
    case 'ajustes': return { text: <>cambió los ajustes de la tienda</>, detail: Object.keys(d).length ? undefined : undefined };
    case 'usuario':
      if (a.action === 'crear') return { text: <>dio acceso a <b>{id}</b>{d.role ? ` como ${ROLE_LABEL[d.role]}` : ''}</> };
      if (d.active === false) return { text: <>quitó el acceso a <b>{id}</b></> };
      if (d.active === true) return { text: <>reactivó el acceso de <b>{id}</b></> };
      if (d.role) return { text: <>cambió el rol de <b>{id}</b> a {ROLE_LABEL[d.role]}</> };
      return { text: <>actualizó la cuenta de <b>{id}</b></> };
    case 'mensaje': return { text: <>marcó un mensaje como <b>{({ new: 'no leído', read: 'leído', answered: 'respondido' } as Record<string, string>)[d.status] ?? d.status}</b></> };
    default: return { text: <>{a.action} {a.entity} <b>{id}</b></> };
  }
}

function Audit({ users }: { users: any[] }) {
  const api = useAdmin(); const can = useCan();
  const [rows, setRows] = useState<any[] | null>(null); const [products, setProducts] = useState<Record<string, string>>({}); const [error, setError] = useState('');
  const [q, setQ] = useState(''); const [actor, setActor] = useState(''); const [entity, setEntity] = useState('');
  const load = useCallback(() => {
    api.audit().then((r) => { setRows(r); setError(''); }).catch((e: Error) => setError(e.message));
    api.products().then((p) => setProducts(Object.fromEntries(p.map((x: any) => [String(x.id), x.name])))).catch(() => {});
  }, [api]);
  useEffect(() => { if (can('admin')) load(); }, [load]); // eslint-disable-line react-hooks/exhaustive-deps
  const nameOf = (email: string) => users.find((u) => u.email === email)?.name ?? email;
  const productName = (id: string) => products[id] ?? `#${id}`;
  const actors = useMemo(() => [...new Set((rows ?? []).map((r) => r.actor))], [rows]);
  const list = useMemo(() => (rows ?? []).filter((a) => (!actor || a.actor === actor) && (!entity || a.entity === entity) &&
    (!q || norm(`${a.actor} ${a.entity} ${a.entityId} ${a.action} ${typeof a.detail === 'string' ? a.detail : JSON.stringify(a.detail ?? '')} ${a.entity === 'producto' || a.entity === 'inventario' ? productName(String(a.entityId)) : ''}`).includes(norm(q)))), [rows, actor, entity, q, products]); // eslint-disable-line react-hooks/exhaustive-deps
  const days = useMemo(() => list.reduce<[string, any[]][]>((acc, a) => { const k = fmtDay(a.createdAt); const last = acc[acc.length - 1]; if (last && last[0] === k) last[1].push(a); else acc.push([k, [a]]); return acc; }, []), [list]);
  const today = fmtDay(new Date()); const yesterday = fmtDay(new Date(Date.now() - 86400000));

  if (!can('admin')) return <Card><EmptyState icon="lock" title="Solo para administradores">La bitácora está disponible para administradores y propietarios.</EmptyState></Card>;
  return (
    <Card flush>
      <div className="bo-toolbar">
        <SearchInput value={q} onChange={setQ} placeholder="Buscar: pedido, producto, cupón…" />
        <Select sm value={actor} onChange={(e) => setActor(e.target.value)} style={{ width: 200 }} aria-label="Persona"><option value="">Todas las personas</option>{actors.map((a) => <option key={a} value={a}>{nameOf(a)}</option>)}</Select>
        <Select sm value={entity} onChange={(e) => setEntity(e.target.value)} style={{ width: 170 }} aria-label="Área"><option value="">Todas las áreas</option>{Object.entries(ENTITY).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</Select>
        <div className="bo-toolbar-right"><Button size="sm" variant="ghost" icon="refresh" onClick={() => { setRows(null); load(); }}>Actualizar</Button></div>
      </div>
      <div style={{ padding: '4px 20px 20px' }}>
        {error ? <EmptyState icon="alert" title="No pudimos cargar la bitácora" action={<Button onClick={load}>Reintentar</Button>}>{error}</EmptyState>
          : !rows ? <TableSkeleton rows={5} cols={2} />
          : list.length === 0 ? <EmptyState icon="history" title={rows.length ? 'Nada coincide con los filtros' : 'Aún no hay actividad'}>{rows.length ? 'Prueba quitando algún filtro.' : 'Cada cambio que haga el equipo quedará registrado aquí.'}</EmptyState>
          : days.map(([day, items]) => (
            <div key={day}>
              <div className="bo-tl-day">{day === today ? 'Hoy' : day === yesterday ? 'Ayer' : day} · {items.length}</div>
              <div className="bo-timeline">
                {items.map((a) => {
                  const e = ENTITY[a.entity] ?? { icon: 'info' as IconName, color: 'var(--muted)', label: a.entity }; const s = sentence(a, productName);
                  return (
                    <div key={a.id} className="bo-tl-item">
                      <span className="bo-tl-icon" style={{ color: e.color }}><Icon name={e.icon} size={14} /></span>
                      <div className="bo-tl-body">
                        <div><b>{nameOf(a.actor)}</b> {s.text}</div>
                        {s.detail && <div className="small" style={{ color: 'var(--ink-2)', marginTop: 2 }}>{s.detail}</div>}
                        <div className="bo-tl-meta" title={fmtDate(a.createdAt)}>{new Date(a.createdAt).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' })} · {e.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        {rows && rows.length >= 200 && <p className="small muted" style={{ marginTop: 8 }}>Se muestran las últimas 200 acciones.</p>}
      </div>
    </Card>
  );
}
