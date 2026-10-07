'use client';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAdmin, useCan, useShell } from './AdminShell';
import {
  Avatar, Badge, Button, Card, Drawer, EmptyState, Field, Icon, Input, LinkButton, Menu,
  PageHeader, SearchInput, Select, Skeleton, StatusBadge, Tabs, Textarea,
  cls, copyText, firstName, fmtDate, money, norm, plural, relTime, useUI, waLink,
} from './kit';

type Tone = 'green' | 'amber' | 'blue' | 'violet' | 'red' | 'pink' | 'cyan' | 'gray' | 'outline';

/**
 * Centro de Mensajes y Atención al Cliente (World-Class Inbox):
 * Gestión multicanal de consultas web, leads mayoristas, cotizaciones B2B y soporte post-venta.
 * Con detección inteligente de intención, notas internas, plantillas rápidas por WhatsApp y correo,
 * e inteligencia comercial de compras previas del cliente.
 */

export type ContactMessage = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: 'new' | 'read' | 'answered';
  createdAt: string;
};

type FilterTab = 'inbox' | 'new' | 'answered' | 'wholesale' | 'all';
type MessageTopic = 'wholesale' | 'shipping' | 'product' | 'billing' | 'general';

interface TopicConfig {
  id: MessageTopic;
  label: string;
  icon: 'star' | 'truck' | 'tag' | 'cash' | 'inbox';
  tone: Tone;
}

const TOPICS: Record<MessageTopic, TopicConfig> = {
  wholesale: { id: 'wholesale', label: 'Mayorista & B2B', icon: 'star', tone: 'violet' },
  shipping: { id: 'shipping', label: 'Envíos & Entrega', icon: 'truck', tone: 'blue' },
  product: { id: 'product', label: 'Producto & Recetas', icon: 'tag', tone: 'amber' },
  billing: { id: 'billing', label: 'Pagos & Facturas', icon: 'cash', tone: 'green' },
  general: { id: 'general', label: 'Consulta General', icon: 'inbox', tone: 'gray' },
};

function detectTopic(msg: string): TopicConfig {
  const s = norm(msg);
  if (/caja|mayor|restaurante|distribui|institucional|chef|cotiz|negocio|por mayor|docena/.test(s)) {
    return TOPICS.wholesale;
  }
  if (/envio|entrega|guia|despacho|llegar|direccion|apto|barrio|ciudad|servientrega|interrapidisimo|flete/.test(s)) {
    return TOPICS.shipping;
  }
  if (/vencimiento|duracion|nevera|aceite|ingrediente|picante|sabor|conservar|frasco|abierto/.test(s)) {
    return TOPICS.product;
  }
  if (/pago|transferencia|nequi|daviplata|contraentrega|factura|recibo|bancolombia|efectivo/.test(s)) {
    return TOPICS.billing;
  }
  return TOPICS.general;
}

const STATUS_CONFIG: Record<ContactMessage['status'], { label: string; tone: Tone; icon: 'mail' | 'eye' | 'checkCircle' }> = {
  new: { label: 'Nuevo', tone: 'blue', icon: 'mail' },
  read: { label: 'Leído', tone: 'gray', icon: 'eye' },
  answered: { label: 'Respondido', tone: 'green', icon: 'checkCircle' },
};

export function Messages() {
  const api = useAdmin();
  const { toast, confirm } = useUI();
  const { refreshCounts } = useShell();
  const can = useCan();
  const canWrite = can('ops');

  const [rows, setRows] = useState<ContactMessage[] | null>(null);
  const [error, setError] = useState('');
  const [f, setF] = useState<FilterTab>('inbox');
  const [topicFilter, setTopicFilter] = useState<MessageTopic | 'all'>('all');
  const [q, setQ] = useState('');
  const [selId, setSelId] = useState<number | null>(null);
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const load = useCallback(() => {
    return api.messages()
      .then((r) => {
        setRows(r);
        setError('');
        // Si hay mensajes y no hay seleccionado, seleccionar el primero
        if (r.length > 0 && selId === null) {
          setSelId(r[0].id);
        }
      })
      .catch((e: Error) => setError(e.message));
  }, [api, selId]);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = useCallback(async (m: ContactMessage, status: ContactMessage['status'], quiet = false) => {
    if (!canWrite || m.status === status) return;
    setRows((r) => r?.map((x) => (x.id === m.id ? { ...x, status } : x)) ?? r);
    try {
      await api.setMessageStatus(m.id, status);
      refreshCounts();
      if (!quiet) {
        toast(
          status === 'answered'
            ? 'Marcado como respondido'
            : status === 'new'
            ? 'Marcado como no leído'
            : 'Marcado como leído'
        );
      }
    } catch (e) {
      setRows((r) => r?.map((x) => (x.id === m.id ? { ...x, status: m.status } : x)) ?? r);
      toast((e as Error).message, 'error');
    }
  }, [api, canWrite, refreshCounts, toast]);

  const deleteMsg = useCallback(async (m: ContactMessage) => {
    if (!canWrite) return;
    const ok = await confirm({
      title: '¿Eliminar este mensaje?',
      body: `Esta acción borrará la consulta de ${m.name} permanentemente.`,
      confirm: 'Eliminar mensaje',
      danger: true,
    });
    if (!ok) return;

    try {
      await api.deleteMessage(m.id);
      setRows((r) => (r ? r.filter((x) => x.id !== m.id) : null));
      if (selId === m.id) setSelId(null);
      refreshCounts();
      toast('Mensaje eliminado correctamente');
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  }, [api, canWrite, confirm, refreshCounts, selId, toast]);

  const all = useMemo(() => rows ?? [], [rows]);

  const counts = useMemo(() => {
    const inbox = all.filter((m) => m.status !== 'answered').length;
    const unread = all.filter((m) => m.status === 'new').length;
    const answered = all.filter((m) => m.status === 'answered').length;
    const wholesale = all.filter((m) => detectTopic(m.message).id === 'wholesale').length;
    return { inbox, unread, answered, wholesale, all: all.length };
  }, [all]);

  const list = useMemo(() => {
    const s = norm(q.trim());
    return all.filter((m) => {
      // Filtro por tab principal
      if (f === 'inbox' && m.status === 'answered') return false;
      if (f === 'new' && m.status !== 'new') return false;
      if (f === 'answered' && m.status !== 'answered') return false;
      if (f === 'wholesale' && detectTopic(m.message).id !== 'wholesale') return false;

      // Filtro por tema específico
      if (topicFilter !== 'all' && detectTopic(m.message).id !== topicFilter) return false;

      // Búsqueda de texto
      if (!s) return true;
      const topic = detectTopic(m.message);
      const corpus = norm(`${m.name} ${m.email} ${m.phone ?? ''} ${m.message} ${topic.label}`);
      return corpus.includes(s);
    });
  }, [all, f, topicFilter, q]);

  const sel = useMemo(() => (selId ? all.find((m) => m.id === selId) ?? null : null), [all, selId]);

  const open = useCallback((m: ContactMessage) => {
    setSelId(m.id);
    if (m.status === 'new') {
      setStatus(m, 'read', true);
    }
  }, [setStatus]);

  // Navegación con teclado: ↑ ↓ entre mensajes de la lista
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest('input, textarea, select') || document.querySelector('.bo-modal, .bo-cmd, .bo-drawer')) {
        return;
      }
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      const currentIndex = list.findIndex((m) => m.id === selId);
      const nextIndex = e.key === 'ArrowDown'
        ? Math.min(list.length - 1, currentIndex + 1)
        : Math.max(0, currentIndex - 1);
      const nextItem = list[nextIndex];
      if (nextItem) {
        e.preventDefault();
        open(nextItem);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [list, open, selId]);

  // Sembrar mensajes de prueba realistas para evaluación comercial
  const seedDemo = async () => {
    setSeeding(true);
    const demos = [
      {
        name: 'Chef Carlos Montoya',
        email: 'carlos.montoya@restauranteelolivo.co',
        phone: '3104567890',
        message: 'Hola equipo de La Cajita. Somos un restaurante en Chapinero y queremos incorporar sus pimentones ahumados a nuestra carta de entradas. ¿Manejan precios especiales para pedidos por caja de 12 o 24 frascos?',
      },
      {
        name: 'Mariana Restrepo',
        email: 'mariana.restrepo@gmail.com',
        phone: '3209876543',
        message: 'Buenas tardes, acabo de realizar un pedido pero omití colocar el número de apartamento en la dirección en Medellín. Mi correo de compra es este mismo. ¿Podrían confirmarme si alcanzan a agregarlo a la guía antes del despacho?',
      },
      {
        name: 'Diego Fernando Gómez',
        email: 'diego.gomez@outlook.com',
        phone: '3157891234',
        message: '¡Hola amigos de La Cajita! Probamos sus pimentones en la feria gastronómica y son deliciosos. Queremos saber cuánto tiempo duran una vez abiertos en la nevera y si el aceite de oliva se puede reutilizar para ensaladas.',
      },
    ];

    try {
      for (const d of demos) {
        await api.createMessage(d);
      }
      await load();
      refreshCounts();
      toast('3 consultas de prueba añadidas a la bandeja');
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Centro de Mensajes y Clientes"
        description="Atiende consultas de la tienda, solicitudes de restaurantes mayoristas y dudas de post-venta con respuesta directa por WhatsApp o correo."
        actions={
          <div className="bo-row" style={{ gap: 8, flexWrap: 'wrap' }}>
            <Badge tone="green" dot>Formulario web activo</Badge>
            <Button
              variant="secondary"
              icon="sparkle"
              loading={seeding}
              onClick={seedDemo}
              title="Añadir 3 consultas de prueba para explorar la bandeja"
            >
              Simular consultas
            </Button>
            {canWrite && (
              <Button
                variant="primary"
                icon="plus"
                onClick={() => setCreateDrawerOpen(true)}
              >
                Registrar consulta
              </Button>
            )}
            <Button
              icon="refresh"
              variant="ghost"
              onClick={() => {
                load();
                refreshCounts();
              }}
              aria-label="Actualizar bandeja"
            />
          </div>
        }
      />

      {/* KPI Command Bar */}
      <div className="bo-grid bo-grid-4 mb-4">
        <div className="bo-card bo-stat">
          <div className="bo-stat-head">
            <span className="bo-stat-label">Por atender</span>
            <Icon name="clock" size={18} className="muted" />
          </div>
          <div className="bo-stat-value bo-row" style={{ gap: 8 }}>
            <span>{counts.inbox}</span>
            {counts.inbox === 0 ? (
              <Badge tone="green" dot>Al día</Badge>
            ) : (
              <Badge tone="amber" dot>{plural(counts.inbox, 'pendiente', 'pendientes')}</Badge>
            )}
          </div>
          <div className="bo-stat-foot muted small">
            {counts.inbox === 0 ? 'Sin consultas pendientes por responder' : 'Requiere respuesta o seguimiento'}
          </div>
        </div>

        <div className="bo-card bo-stat">
          <div className="bo-stat-head">
            <span className="bo-stat-label">Sin leer</span>
            <Icon name="mail" size={18} className="muted" />
          </div>
          <div className="bo-stat-value bo-row" style={{ gap: 8 }}>
            <span>{counts.unread}</span>
            {counts.unread > 0 && <Badge tone="blue">Nuevos</Badge>}
          </div>
          <div className="bo-stat-foot muted small">
            {counts.unread === 0 ? 'Todos los mensajes han sido abiertos' : 'Consultas sin revisar en la bandeja'}
          </div>
        </div>

        <div className="bo-card bo-stat">
          <div className="bo-stat-head">
            <span className="bo-stat-label">Oportunidades Mayoristas</span>
            <Icon name="star" size={18} className="muted" />
          </div>
          <div className="bo-stat-value bo-row" style={{ gap: 8 }}>
            <span>{counts.wholesale}</span>
            {counts.wholesale > 0 && <Badge tone="violet">B2B</Badge>}
          </div>
          <div className="bo-stat-foot muted small">
            Restaurantes y pedidos especiales de frascos
          </div>
        </div>

        <div className="bo-card bo-stat">
          <div className="bo-stat-head">
            <span className="bo-stat-label">Respondidos</span>
            <Icon name="checkCircle" size={18} className="muted" />
          </div>
          <div className="bo-stat-value bo-row" style={{ gap: 8 }}>
            <span>{counts.answered}</span>
            <span className="small muted">de {counts.all}</span>
          </div>
          <div className="bo-stat-foot muted small">
            {counts.all > 0 ? `${Math.round((counts.answered / counts.all) * 100)}% resueltos exitosamente` : 'Sin histórico aún'}
          </div>
        </div>
      </div>

      {/* Main Inbox Card */}
      <Card flush className="bo-inbox-card">
        <div className={cls('bo-inbox', sel && 'has-sel')}>
          {/* Columna Izquierda: Lista de Mensajes */}
          <div className="bo-inbox-list">
            <div className="bo-inbox-tools">
              <SearchInput
                value={q}
                onChange={setQ}
                placeholder="Buscar por cliente, correo o texto..."
              />
              <Tabs
                value={f}
                onChange={(v) => setF(v as FilterTab)}
                items={[
                  { value: 'inbox', label: 'Por atender', count: rows ? counts.inbox : undefined, alert: counts.inbox > 0 },
                  { value: 'new', label: 'Sin leer', count: rows ? counts.unread : undefined },
                  { value: 'answered', label: 'Respondidos', count: rows ? counts.answered : undefined },
                  { value: 'wholesale', label: 'Mayoristas', count: rows ? counts.wholesale : undefined },
                  { value: 'all', label: 'Todos', count: rows ? counts.all : undefined },
                ]}
              />

              {/* Filtro rápido por tema */}
              <div className="bo-chips" style={{ paddingBottom: 4 }}>
                <button
                  type="button"
                  className={cls('bo-chip', topicFilter === 'all' && 'is-active')}
                  onClick={() => setTopicFilter('all')}
                >
                  Todos los temas
                </button>
                {Object.values(TOPICS).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={cls('bo-chip', topicFilter === t.id && 'is-active')}
                    onClick={() => setTopicFilter(t.id)}
                  >
                    <Icon name={t.icon} size={12} />
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bo-inbox-items">
              {error ? (
                <EmptyState small icon="alert" title="No pudimos cargar los mensajes" action={<Button size="sm" onClick={load}>Reintentar</Button>}>
                  {error}
                </EmptyState>
              ) : !rows ? (
                [0, 1, 2, 3].map((i) => (
                  <div key={i} className="bo-inbox-item">
                    <Skeleton w={36} h={36} r={18} />
                    <div className="grow">
                      <Skeleton w="55%" />
                      <Skeleton w="90%" h={10} style={{ marginTop: 8 }} />
                      <Skeleton w="70%" h={10} style={{ marginTop: 6 }} />
                    </div>
                  </div>
                ))
              ) : list.length === 0 ? (
                q || topicFilter !== 'all' ? (
                  <EmptyState small icon="search" title="Sin resultados con estos filtros">
                    <div className="bo-col" style={{ alignItems: 'center', gap: 8, marginTop: 8 }}>
                      <span>Prueba con otra palabra clave o quita los filtros.</span>
                      <Button size="sm" variant="ghost" onClick={() => { setQ(''); setTopicFilter('all'); setF('all'); }}>
                        Restablecer filtros
                      </Button>
                    </div>
                  </EmptyState>
                ) : f === 'inbox' || f === 'new' ? (
                  <div className="bo-inbox-zero">
                    <div className="bo-inbox-zero-icon">
                      <Icon name="checkCircle" size={36} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
                        ¡Bandeja al día!
                      </h3>
                      <p className="muted" style={{ margin: '6px 0 0', fontSize: 13.5 }}>
                        No hay consultas pendientes por atender. Todos tus clientes han sido respondidos.
                      </p>
                    </div>
                    <div className="bo-inbox-zero-grid">
                      <div className="bo-inbox-zero-card" onClick={seedDemo}>
                        <Icon name="sparkle" size={20} className="bo-t-green" />
                        <b>Simular consultas</b>
                        <p>Genera 3 leads de ejemplo para explorar la bandeja.</p>
                      </div>
                      <div className="bo-inbox-zero-card" onClick={() => setCreateDrawerOpen(true)}>
                        <Icon name="plus" size={20} className="bo-t-green" />
                        <b>Registrar lead</b>
                        <p>Añade un contacto de WhatsApp o llamada telefónica.</p>
                      </div>
                      <a className="bo-inbox-zero-card" href="/#contacto" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                        <Icon name="external" size={20} className="bo-t-green" />
                        <b>Ver formulario web</b>
                        <p>Revisa la sección de contacto en la tienda en línea.</p>
                      </a>
                    </div>
                  </div>
                ) : (
                  <EmptyState small icon="inbox" title="Bandeja vacía">
                    Las consultas que envían los visitantes desde la tienda aparecerán aquí sincronizadas en tiempo real.
                  </EmptyState>
                )
              ) : (
                list.map((m) => {
                  const topic = detectTopic(m.message);
                  const isNew = m.status === 'new';
                  const isSel = m.id === selId;

                  return (
                    <button
                      key={m.id}
                      className={cls(
                        'bo-inbox-item',
                        isNew && 'is-new',
                        isSel && 'is-active'
                      )}
                      onClick={() => open(m)}
                    >
                      <Avatar name={m.name} size={36} />
                      <div className="grow">
                        <div className="top">
                          <b>{m.name}</b>
                          <small title={fmtDate(m.createdAt)}>{relTime(m.createdAt)}</small>
                        </div>
                        <div className="meta-row">
                          <Badge tone={topic.tone}>
                            <Icon name={topic.icon} size={11} />
                            {topic.label}
                          </Badge>
                          {m.phone && <Badge tone="gray"><Icon name="whatsapp" size={11} />WA</Badge>}
                        </div>
                        <p>{m.message}</p>
                        <div className="foot">
                          <Badge tone={STATUS_CONFIG[m.status].tone} dot>
                            {STATUS_CONFIG[m.status].label}
                          </Badge>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Columna Derecha: Lector y Espacio de Trabajo */}
          <div className="bo-reader">
            {sel ? (
              <Reader
                key={sel.id}
                m={sel}
                canWrite={canWrite}
                onStatus={(s) => setStatus(sel, s)}
                onDelete={() => deleteMsg(sel)}
                onBack={() => setSelId(null)}
              />
            ) : (
              <div className="bo-reader-empty" style={{ margin: 'auto', textAlign: 'center', padding: 48 }}>
                <EmptyState
                  icon="inbox"
                  title={counts.inbox > 0 ? `${plural(counts.inbox, 'mensaje', 'mensajes')} por responder` : 'Selecciona una conversación'}
                >
                  Elige un contacto de la lista lateral para revisar el mensaje, consultar su historial y responder por WhatsApp o correo.
                  <div className="muted small" style={{ marginTop: 12 }}>
                    Tip: usa las flechas <b>↑</b> y <b>↓</b> del teclado para moverte rápidamente.
                  </div>
                </EmptyState>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Drawer: Registrar Consulta Manual */}
      <CreateMessageDrawer
        open={createDrawerOpen}
        onClose={() => setCreateDrawerOpen(false)}
        onCreated={(newMsg) => {
          setCreateDrawerOpen(false);
          load().then(() => {
            setSelId(newMsg.id);
            refreshCounts();
          });
        }}
      />
    </>
  );
}

// -----------------------------------------------------------------------------
// Reader / Workspace de Conversación
// -----------------------------------------------------------------------------

function Reader({
  m,
  canWrite,
  onStatus,
  onDelete,
  onBack,
}: {
  m: ContactMessage;
  canWrite: boolean;
  onStatus: (s: ContactMessage['status']) => void;
  onDelete: () => void;
  onBack: () => void;
}) {
  const api = useAdmin();
  const { toast } = useUI();
  const [orders, setOrders] = useState<any[] | null>(null);
  const [replyMode, setReplyMode] = useState<'reply' | 'internal'>('reply');
  const [composerText, setComposerText] = useState('');
  const [notes, setNotes] = useState<string[]>([]);
  const [newNote, setNewNote] = useState('');

  const topic = useMemo(() => detectTopic(m.message), [m.message]);
  const fn = firstName(m.name);

  // Cargar pedidos previos del cliente para inteligencia comercial
  useEffect(() => {
    api.customerOrders(m.email).then(setOrders).catch(() => setOrders([]));
  }, [api, m.email]);

  // Cargar notas internas locales
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`lacajita.inbox_notes_${m.id}`);
      if (stored) setNotes(JSON.parse(stored));
      else setNotes([]);
    } catch {
      setNotes([]);
    }
  }, [m.id]);

  const saveNote = () => {
    if (!newNote.trim()) return;
    const updated = [...notes, `${new Date().toLocaleDateString('es-CO')} · ${newNote.trim()}`];
    setNotes(updated);
    try {
      localStorage.setItem(`lacajita.inbox_notes_${m.id}`, JSON.stringify(updated));
      toast('Nota interna guardada');
      setNewNote('');
    } catch {
      // no-op
    }
  };

  const paidOrders = (orders ?? []).filter((o) => ['paid', 'preparing', 'shipped', 'delivered'].includes(o.status));
  const totalSpent = paidOrders.reduce((sum, o) => sum + (o.total ?? 0), 0);
  const lastOrder = orders?.[0];

  const sign = '\n\nUn abrazo,\nPimentones La Cajita\nhttps://lacajita.co';

  // Plantillas de respuesta rápida inteligentes por tema
  const templates = useMemo(() => {
    return [
      {
        id: 'greet',
        label: 'Agradecimiento',
        icon: 'sparkle',
        text: `Hola ${fn}, ¡muchas gracias por contactarnos! Con gusto te colaboramos con tu consulta.`,
      },
      {
        id: 'wholesale',
        label: 'Cotización Mayorista',
        icon: 'star',
        text: `Hola ${fn}, qué alegría saber de tu interés en nuestros pimentones. Manejamos precios especiales a partir de 12 frascos (caja mixta o sabor único) ideales para restaurantes y eventos. Cuéntanos qué cantidades proyectas para darte nuestra tarifa institucional y tiempos de entrega.`,
      },
      {
        id: 'shipping',
        label: 'Tiempos y Envíos',
        icon: 'truck',
        text: `Hola ${fn}, despachamos a toda Colombia. En Bogotá la entrega tarda de 1 a 2 días hábiles y a nivel nacional entre 2 y 4 días. Además, en compras superiores a $90.000 el envío es totalmente gratis.`,
      },
      {
        id: 'conservation',
        label: 'Conservación en nevera',
        icon: 'tag',
        text: `Hola ${fn}, nuestros pimentones están conservados en aceite de oliva y especias naturales. Una vez abierto el frasco, te recomendamos mantenerlo bien tapado en la nevera asegurando que el aceite cubra los pimentones. ¡Tiene una vida útil de más de 3 meses y el aceite aromatizado queda delicioso en ensaladas!`,
      },
      {
        id: 'order',
        label: lastOrder ? `Sobre pedido #${lastOrder.reference}` : 'Cómo comprar en línea',
        icon: 'orders',
        text: lastOrder
          ? `Hola ${fn}, respecto a tu pedido ${lastOrder.reference} registrado con entrega en ${lastOrder.city}: ya estamos al tanto y lo estamos gestionando con prioridad.`
          : `Hola ${fn}, puedes hacer tu compra directamente en nuestra tienda en línea en https://lacajita.co . Aceptamos transferencias, PSE y pago contraentrega en las principales ciudades.`,
      },
    ];
  }, [fn, lastOrder]);

  const applyTemplate = (text: string) => {
    setComposerText(text);
  };

  const answered = () => {
    if (canWrite && m.status !== 'answered') {
      onStatus('answered');
    }
  };

  const sendByMail = () => {
    const body = composerText.trim() || `Hola ${fn},\n\n`;
    const fullBody = `${body}${sign}\n\n—\nConsulta original:\n"${m.message}"`;
    const url = `mailto:${m.email}?subject=${encodeURIComponent('Respuesta a tu consulta · Pimentones La Cajita')}&body=${encodeURIComponent(fullBody)}`;
    window.location.href = url;
    answered();
  };

  const sendByWhatsApp = () => {
    if (!m.phone) return;
    const body = composerText.trim() || `Hola ${fn}, te escribimos de Pimentones La Cajita en respuesta a tu consulta. `;
    window.open(waLink(m.phone, body), '_blank');
    answered();
  };

  return (
    <>
      {/* Header del Lector */}
      <div className="bo-reader-head">
        <Button
          variant="ghost"
          iconOnly
          icon="chevronLeft"
          className="bo-only-sm"
          onClick={onBack}
          aria-label="Volver a la lista"
        />
        <Avatar name={m.name} size={42} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="bo-row" style={{ gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
              {m.name}
            </h2>
            <Badge tone={STATUS_CONFIG[m.status].tone} dot>
              {STATUS_CONFIG[m.status].label}
            </Badge>
            <Badge tone={topic.tone}>
              <Icon name={topic.icon} size={12} />
              {topic.label}
            </Badge>
            {paidOrders.length > 0 && (
              <Badge tone="violet" icon="star">
                Cliente VIP · {plural(paidOrders.length, 'compra', 'compras')}
              </Badge>
            )}
          </div>
          <div className="bo-msg-meta">
            <a href={`mailto:${m.email}`} title="Escribir correo">
              <Icon name="mail" size={13} />
              {m.email}
            </a>
            {m.phone && (
              <a href={waLink(m.phone)} target="_blank" rel="noreferrer" title="Chat de WhatsApp">
                <Icon name="whatsapp" size={13} className="bo-t-green" />
                {m.phone}
              </a>
            )}
            <span title={fmtDate(m.createdAt)} className="muted">
              <Icon name="clock" size={12} style={{ display: 'inline', marginRight: 4 }} />
              Recibido {fmtDate(m.createdAt)} ({relTime(m.createdAt)})
            </span>
          </div>
        </div>

        <div className="bo-row" style={{ gap: 6 }}>
          {canWrite && m.status !== 'answered' && (
            <Button
              size="sm"
              variant="secondary"
              icon="check"
              onClick={() => onStatus('answered')}
              title="Marcar como resuelto"
            >
              Resolver
            </Button>
          )}
          <Menu
            trigger={(t) => (
              <Button variant="ghost" iconOnly icon="more" onClick={t} aria-label="Más acciones de contacto" />
            )}
            items={[
              {
                label: 'Marcar como respondido',
                icon: 'checkCircle',
                onClick: () => onStatus('answered'),
                hidden: !canWrite || m.status === 'answered',
              },
              {
                label: 'Marcar como no leído',
                icon: 'mail',
                onClick: () => onStatus('new'),
                hidden: !canWrite || m.status === 'new',
              },
              {
                label: 'Copiar correo',
                icon: 'copy',
                onClick: async () => {
                  if (await copyText(m.email)) toast('Correo copiado al portapapeles');
                },
              },
              {
                label: 'Copiar mensaje',
                icon: 'copy',
                onClick: async () => {
                  if (await copyText(m.message)) toast('Mensaje copiado al portapapeles');
                },
              },
              {
                label: 'Ver perfil de cliente',
                icon: 'user',
                href: `/admin/clientes?email=${encodeURIComponent(m.email)}`,
                hidden: !orders?.length,
              },
              {
                label: 'Eliminar consulta',
                icon: 'trash',
                onClick: onDelete,
                hidden: !canWrite,
              },
            ]}
          />
        </div>
      </div>

      {/* Cuerpo del Mensaje y Contexto de CRM */}
      <div className="bo-reader-body">
        {/* Banner de Inteligencia Comercial de Clientes */}
        {orders && paidOrders.length > 0 ? (
          <div className="bo-crm-card">
            <div className="bo-crm-stats">
              <div className="bo-crm-stat">
                <span className="lbl">Historial de compras</span>
                <span className="val">{plural(paidOrders.length, 'pedido pagado', 'pedidos pagados')}</span>
              </div>
              <div className="bo-crm-stat">
                <span className="lbl">Total facturado</span>
                <span className="val bo-t-green">{money(totalSpent)}</span>
              </div>
              {lastOrder && (
                <div className="bo-crm-stat">
                  <span className="lbl">Último pedido</span>
                  <span className="val">
                    <Link href={`/admin/pedidos?id=${lastOrder.id}`} className="bo-t-green" style={{ textDecoration: 'none' }}>
                      #{lastOrder.reference} ({lastOrder.city})
                    </Link>
                  </span>
                </div>
              )}
            </div>
            <LinkButton size="sm" variant="ghost" icon="external" href={`/admin/clientes?email=${encodeURIComponent(m.email)}`}>
              Ficha del cliente
            </LinkButton>
          </div>
        ) : (
          <div className="bo-row bo-box" style={{ background: '#ffffff', padding: '10px 16px', gap: 10, fontSize: 13, color: 'var(--muted)' }}>
            <Icon name="info" size={16} className="bo-t-blue" />
            <span><b>Lead Potencial:</b> Este remitente no registra compras previas en la tienda. Brindar una respuesta rápida eleva la probabilidad de conversión a pedido.</span>
          </div>
        )}

        {/* Burbuja del mensaje del cliente */}
        <div className="bo-bubble-client">
          <div className="bo-bubble-client-head">
            <div className="bo-bubble-client-sender">
              <Icon name="inbox" size={15} className="muted" />
              <span>Mensaje del Formulario Web</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              icon="copy"
              onClick={async () => {
                if (await copyText(m.message)) toast('Mensaje copiado');
              }}
            >
              Copiar
            </Button>
          </div>
          <p className="bo-reader-msg">{m.message}</p>
        </div>

        {/* Notas internas del equipo */}
        {notes.length > 0 && (
          <div className="bo-internal-note">
            <div className="bo-internal-note-head">
              <span>Notas internas del equipo</span>
              <Icon name="shield" size={13} />
            </div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {notes.map((n, i) => (
                <li key={i} style={{ marginTop: 4 }}>{n}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Historial de pedidos si existen */}
        {orders && orders.length > 0 && (
          <div style={{ maxWidth: 680 }}>
            <div className="bo-dsec-title" style={{ marginBottom: 10 }}>
              <span>Pedidos de esta persona en la tienda</span>
            </div>
            <div className="bo-list bo-box" style={{ padding: 0, background: '#ffffff' }}>
              {orders.slice(0, 3).map((o) => (
                <Link
                  key={o.id}
                  className="bo-list-item is-click"
                  href={`/admin/pedidos?id=${o.id}`}
                  style={{ padding: '10px 14px' }}
                >
                  <div className="grow">
                    <b className="mono">#{o.reference}</b>
                    <div className="sub">{relTime(o.createdAt)} · {o.city}</div>
                  </div>
                  <StatusBadge status={o.status} />
                  <span className="money tnum strong" style={{ minWidth: 84, textAlign: 'right' }}>
                    {money(o.total)}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Compositor interactivo de respuestas y notas */}
      <div className="bo-composer">
        <div className="bo-composer-tabs">
          <button
            type="button"
            className={cls('bo-chip', replyMode === 'reply' && 'is-active')}
            onClick={() => setReplyMode('reply')}
          >
            <Icon name="reply" size={13} />
            Responder al cliente (WhatsApp / Correo)
          </button>
          <button
            type="button"
            className={cls('bo-chip', replyMode === 'internal' && 'is-active')}
            onClick={() => setReplyMode('internal')}
          >
            <Icon name="shield" size={13} />
            Añadir nota interna privada
          </button>
        </div>

        {replyMode === 'reply' ? (
          <>
            {/* Chips de plantillas rápidas */}
            <div className="bo-composer-templates">
              <span className="small muted" style={{ whiteSpace: 'nowrap', marginRight: 4 }}>Plantillas:</span>
              {templates.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className="bo-chip"
                  onClick={() => applyTemplate(t.text)}
                  title="Insertar en el editor"
                >
                  <Icon name={t.icon as any} size={12} />
                  {t.label}
                </button>
              ))}
            </div>

            {/* Área de redacción */}
            <textarea
              className="bo-composer-textarea"
              placeholder={`Escribe aquí la respuesta para ${fn}... O selecciona una plantilla superior.`}
              value={composerText}
              onChange={(e) => setComposerText(e.target.value)}
            />

            <div className="bo-composer-foot">
              <div className="bo-row" style={{ gap: 8 }}>
                {m.phone && (
                  <Button
                    variant="primary"
                    icon="whatsapp"
                    className="bo-btn-wa"
                    onClick={sendByWhatsApp}
                  >
                    Enviar por WhatsApp
                  </Button>
                )}
                <Button
                  variant="primary"
                  icon="mail"
                  onClick={sendByMail}
                >
                  Enviar por Correo
                </Button>
              </div>

              <div className="bo-row" style={{ gap: 8 }}>
                {canWrite && m.status !== 'answered' && (
                  <Button
                    variant="ghost"
                    icon="check"
                    onClick={answered}
                  >
                    Solo marcar como respondido
                  </Button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="bo-col" style={{ gap: 10 }}>
            <textarea
              className="bo-composer-textarea"
              placeholder="Escribe una nota privada visible solo para el equipo (ej. 'Confirmó por llamada que pagará por Nequi')"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
            />
            <div className="bo-row" style={{ justifyContent: 'flex-end', gap: 8 }}>
              <Button size="sm" variant="ghost" onClick={() => setNewNote('')}>
                Limpiar
              </Button>
              <Button size="sm" variant="primary" icon="check" onClick={saveNote}>
                Guardar nota en el historial
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// -----------------------------------------------------------------------------
// Drawer: Registrar Consulta Manual (Leads telefónicos, WhatsApp, Instagram)
// -----------------------------------------------------------------------------

function CreateMessageDrawer({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (msg: ContactMessage) => void;
}) {
  const api = useAdmin();
  const { toast } = useUI();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [channel, setChannel] = useState('WhatsApp');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'new' | 'answered'>('new');
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setName('');
    setEmail('');
    setPhone('');
    setChannel('WhatsApp');
    setMessage('');
    setStatus('new');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast('Por favor completa nombre, correo y mensaje', 'error');
      return;
    }

    setSaving(true);
    try {
      const fullMessage = channel !== 'Web' ? `[Origen: ${channel}] ${message.trim()}` : message.trim();
      const res = await api.createMessage({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        message: fullMessage,
        status,
      });
      toast('Consulta registrada exitosamente');
      reset();
      onCreated(res);
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Registrar Consulta de Contacto o Lead"
      size="md"
      footer={
        <div className="bo-row" style={{ justifyContent: 'flex-end', gap: 8 }}>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="primary" icon="check" loading={saving} onClick={handleSave}>
            Guardar consulta
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSave} className="bo-col" style={{ gap: 16 }}>
        <p className="muted small" style={{ margin: 0 }}>
          Registra consultas recibidas por canales externos como WhatsApp, Instagram Direct, ferias presenciales o llamadas de clientes.
        </p>

        <Field label="Nombre del contacto *">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Chef Mateo Morales"
            autoFocus
          />
        </Field>

        <Field label="Correo electrónico *">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="mateo@restaurante.com"
          />
        </Field>

        <Field label="Teléfono / WhatsApp de contacto">
          <Input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="3101234567"
          />
        </Field>

        <Field label="Canal de origen">
          <Select
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
          >
            <option value="WhatsApp">WhatsApp Directo</option>
            <option value="Instagram DM">Instagram Direct</option>
            <option value="Llamada telefónica">Llamada telefónica</option>
            <option value="Feria o Evento">Feria / Stand Presencial</option>
            <option value="Web">Formulario Web</option>
          </Select>
        </Field>

        <Field label="Consulta o requerimiento *">
          <Textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe qué solicitó el cliente o restaurante (ej. cotización de 30 frascos pimentón ahumado)..."
          />
        </Field>

        <Field label="Estado inicial">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
          >
            <option value="new">Nuevo (Por atender en la bandeja)</option>
            <option value="answered">Ya respondido / Resuelto</option>
          </Select>
        </Field>
      </form>
    </Drawer>
  );
}
