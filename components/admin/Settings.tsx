'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { api as publicApi } from '@/lib/api';
import { useAdmin, useCan } from './AdminShell';
import {
  Affix, Badge, Button, Card, EmptyState, Field, Icon, Input, LinkButton, PageHeader, PageSkeleton, SaveBar, Textarea, cls, useUI, useUnsavedGuard, waLink,
} from './kit';

/**
 * Ajustes de la tienda: datos de contacto y pagos, con validación y vista previa de lo que ve el cliente.
 * Las reglas de envío viven en el módulo Envíos; las llaves de Wompi y del correo, en el servidor.
 */
const SECTIONS = [{ id: 'contacto', label: 'Contacto', icon: 'phone' }, { id: 'pagos', label: 'Pagos', icon: 'card' }, { id: 'envios', label: 'Envíos', icon: 'truck' }, { id: 'integraciones', label: 'Integraciones', icon: 'link' }] as const;
const cleanIg = (s: string) => s.trim().replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/^@/, '').replace(/\/.*$/, '');
const digits = (s: string) => (s || '').replace(/\D/g, '');

export function Settings() {
  const api = useAdmin(); const can = useCan(); const { toast, confirm } = useUI();
  const [orig, setOrig] = useState<Record<string, string> | null>(null); const [s, setS] = useState<Record<string, string> | null>(null); const [error, setError] = useState('');
  const [saving, setSaving] = useState(false); const [active, setActive] = useState('contacto');
  const editable = can('admin');
  const load = useCallback(() => api.settings().then((r) => { setOrig(r); setS(r); setError(''); }).catch((e: Error) => setError(e.message)), [api]);
  useEffect(() => { load(); }, [load]);
  // Medios de pago reales que ofrece el checkout (Wompi solo si sus llaves están configuradas en el servidor).
  const [methods, setMethods] = useState<string[] | null>(null);
  useEffect(() => { publicApi.store().then((x) => setMethods(x.paymentMethods)).catch(() => setMethods(null)); }, []);
  const methodBadge = (m: string) => methods == null ? <Badge tone="gray">Sin verificar</Badge> : methods.includes(m) ? <Badge tone="green" dot>Activo</Badge> : <Badge tone="amber" dot>Sin configurar</Badge>;
  const dirty = !!s && !!orig && JSON.stringify(s) !== JSON.stringify(orig);
  useUnsavedGuard(dirty);
  useEffect(() => {
    if (!s) return;
    const obs = new IntersectionObserver((en) => { const v = en.filter((e) => e.isIntersecting)[0]; if (v) setActive(v.target.id); }, { rootMargin: '-90px 0px -60% 0px' });
    SECTIONS.forEach((x) => { const el = document.getElementById(x.id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [!!s]); // eslint-disable-line react-hooks/exhaustive-deps

  const errors = useMemo(() => {
    const e: Record<string, string> = {}; if (!s) return e;
    const wa = digits(s.whatsapp);
    if (s.whatsapp && !(wa.length === 12 && wa.startsWith('57')) && !(wa.length === 10 && wa.startsWith('3'))) e.whatsapp = 'Escribe un celular colombiano: 10 dígitos (3001234567) o con indicativo (573001234567).';
    if (s.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.contact_email)) e.contact_email = 'Revisa el correo.';
    if (s.transfer_instructions && s.transfer_instructions.length > 1000) e.transfer_instructions = 'Máximo 1.000 caracteres.';
    return e;
  }, [s]);

  if (error) return <><PageHeader title="Ajustes" /><Card><EmptyState icon="alert" title="No pudimos cargar los ajustes" action={<Button onClick={load}>Reintentar</Button>}>{error}</EmptyState></Card></>;
  if (!s) return <PageSkeleton />;

  const set = (k: string, v: string) => setS((x) => x && ({ ...x, [k]: v }));
  const save = async () => {
    if (Object.keys(errors).length) { toast('Revisa los campos marcados.', 'error'); return; }
    const wa = digits(s.whatsapp); const body = { ...s, whatsapp: wa.length === 10 ? `57${wa}` : wa, instagram: cleanIg(s.instagram || '') };
    setSaving(true);
    try { const r = await api.saveSettings(body); setOrig(r); setS(r); toast('Ajustes guardados'); } catch (e) { toast((e as Error).message, 'error'); }
    setSaving(false);
  };
  const wa = digits(s.whatsapp); const waFull = wa.length === 10 ? `57${wa}` : wa;
  const ig = cleanIg(s.instagram || '');

  return (
    <>
      <PageHeader title="Ajustes" description="Datos de contacto y medios de pago que ven tus clientes." />
      {!editable && <div className="bo-callout bo-callout--gray" style={{ marginBottom: 16 }}><Icon name="lock" size={16} />Solo los administradores pueden cambiar los ajustes. Estás en modo lectura.</div>}
      <div className="bo-split">
        <nav className="bo-subnav" aria-label="Secciones">
          {SECTIONS.map((x) => <a key={x.id} href={`#${x.id}`} className={cls(active === x.id && 'is-active')} onClick={(e) => { e.preventDefault(); document.getElementById(x.id)?.scrollIntoView({ behavior: 'smooth' }); setActive(x.id); }}><Icon name={x.icon} size={16} />{x.label}</a>)}
        </nav>
        <div className="bo-stack">
          <section id="contacto" className="bo-anchor">
            <Card title="Contacto" description="Aparece en el pie de página, en la página de contacto y en los correos a clientes.">
              <div className="bo-form-grid">
                <Field label="WhatsApp de la tienda" error={errors.whatsapp} hint={!errors.whatsapp && waFull ? <>Los clientes te escribirán a <b>+{waFull.slice(0, 2)} {waFull.slice(2, 5)} {waFull.slice(5, 8)} {waFull.slice(8)}</b>{' · '}<a className="bo-link" href={waLink(waFull, 'Hola, esto es una prueba desde el administrador.')} target="_blank" rel="noreferrer">Probar</a></> : 'El botón flotante de la tienda abre este chat.'}>
                  <Affix icon="whatsapp"><Input inputMode="tel" value={s.whatsapp || ''} disabled={!editable} aria-invalid={!!errors.whatsapp} placeholder="3001234567" onChange={(e) => set('whatsapp', e.target.value)} /></Affix>
                </Field>
                <Field label="Correo de contacto" error={errors.contact_email}><Affix icon="mail"><Input type="email" value={s.contact_email || ''} disabled={!editable} aria-invalid={!!errors.contact_email} placeholder="hola@pimentoneslacajita.com" onChange={(e) => set('contact_email', e.target.value)} /></Affix></Field>
                <Field label="Teléfono visible" optional hint="Como quieres que se lea en la tienda."><Affix icon="phone"><Input value={s.contact_phone || ''} disabled={!editable} placeholder="+57 310 334 7621" onChange={(e) => set('contact_phone', e.target.value)} /></Affix></Field>
                <Field label="Ciudad" optional><Affix icon="pin"><Input value={s.contact_city || ''} disabled={!editable} placeholder="Bogotá, Colombia" onChange={(e) => set('contact_city', e.target.value)} /></Affix></Field>
                <Field className="span-2" label="Instagram" optional hint={ig ? <>Enlace: <a className="bo-link" href={`https://instagram.com/${ig}`} target="_blank" rel="noreferrer">instagram.com/{ig} <Icon name="external" size={12} /></a></> : 'Puedes pegar el usuario o el enlace completo.'}>
                  <Affix pre="@"><Input value={s.instagram || ''} disabled={!editable} placeholder="pimentones_la_cajita" onChange={(e) => set('instagram', e.target.value)} onBlur={() => set('instagram', cleanIg(s.instagram || ''))} /></Affix>
                </Field>
              </div>
            </Card>
          </section>

          <section id="pagos" className="bo-anchor">
            <Card title="Pagos" description="Medios de pago disponibles en el checkout.">
              <div className="bo-list bo-box" style={{ padding: 0, marginBottom: 20 }}>
                <div className="bo-list-item"><span className="bo-stat-icon" style={{ background: 'var(--blue-50)', color: 'var(--blue)' }}><Icon name="card" size={16} /></span><div className="grow"><b>Pago en línea (Wompi)</b><div className="sub">{methods && !methods.includes('wompi') ? 'Faltan las llaves de Wompi en el servidor: el checkout no lo ofrece.' : 'Tarjeta, PSE, Nequi. Se confirma solo.'}</div></div>{methodBadge('wompi')}</div>
                <div className="bo-list-item"><span className="bo-stat-icon" style={{ background: 'var(--violet-50)', color: 'var(--violet)' }}><Icon name="bank" size={16} /></span><div className="grow"><b>Transferencia</b><div className="sub">Confirmas el pago a mano en Pedidos.</div></div>{methodBadge('transfer')}</div>
                <div className="bo-list-item"><span className="bo-stat-icon" style={{ background: 'var(--amber-50)', color: 'var(--amber)' }}><Icon name="cash" size={16} /></span><div className="grow"><b>Contraentrega</b><div className="sub">Según el departamento, en Envíos.</div></div><a className="bo-link small" href="/admin/envios">Configurar <Icon name="arrowRight" size={13} /></a></div>
              </div>
              <div className="bo-grid bo-grid-2" style={{ alignItems: 'start' }}>
                <Field label="Instrucciones para transferencia" counter={(s.transfer_instructions || '').length} max={1000} error={errors.transfer_instructions} hint="Banco, tipo y número de cuenta, titular y a dónde enviar el comprobante.">
                  <Textarea rows={7} value={s.transfer_instructions || ''} maxLength={1000} disabled={!editable} placeholder={'Bancolombia ahorros 000-000000-00\nA nombre de Pimentones La Cajita\nEnvía el comprobante por WhatsApp.'} onChange={(e) => set('transfer_instructions', e.target.value)} />
                </Field>
                <div>
                  <div className="bo-dsec-title"><span>Así lo ve el cliente</span></div>
                  <div className="bo-preview-frame" style={{ padding: 14 }}>
                    <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 6px 20px -10px rgba(60,40,20,.25)' }}>
                      <b style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}><Icon name="bank" size={16} />Paga por transferencia</b>
                      <p style={{ whiteSpace: 'pre-wrap', fontSize: 13, color: '#4a4440', marginTop: 8, lineHeight: 1.6 }}>{s.transfer_instructions || <span className="faint">Aquí aparecerán tus instrucciones.</span>}</p>
                      {waFull && <div className="small" style={{ marginTop: 10, color: '#1b7a47', display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="whatsapp" size={14} />Enviar comprobante por WhatsApp</div>}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          <section id="envios" className="bo-anchor">
            <Card title="Envíos" description="Tarifas, tiempos de entrega, envío gratis y contraentrega por departamento.">
              <div className="bo-between"><span className="muted">Ahora todo lo de envíos está en un solo lugar, con simulador incluido.</span><LinkButton href="/admin/envios" iconRight="arrowRight">Ir a Envíos</LinkButton></div>
            </Card>
          </section>

          <section id="integraciones" className="bo-anchor">
            <Card title="Integraciones" description="Se configuran en el servidor por seguridad (variables de entorno).">
              <div className="bo-list bo-box" style={{ padding: 0 }}>
                <div className="bo-list-item"><Icon name="card" size={16} className="faint" /><div className="grow"><b>Wompi</b><div className="sub">Llaves pública, privada y de eventos.</div></div><Badge tone="outline" icon="lock">Servidor</Badge></div>
                <div className="bo-list-item"><Icon name="mail" size={16} className="faint" /><div className="grow"><b>Correo transaccional</b><div className="sub">Confirmaciones de pedido, envíos y avisos de contacto.</div></div><Badge tone="outline" icon="lock">Servidor</Badge></div>
              </div>
            </Card>
          </section>

          <SaveBar dirty={dirty} saving={saving} onSave={save} onDiscard={async () => { if (await confirm({ title: '¿Descartar los cambios?', confirm: 'Descartar', danger: true })) setS(orig); }} />
        </div>
      </div>
    </>
  );
}
