import { useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ArrowRight, ChevronRight, Heart, Menu, Search, ShoppingBag, Sparkles, X } from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Link, Route, Switch, useLocation, useRoute, Router as WouterRouter } from 'wouter';

type Category = 'Todas' | 'Dragon Ball Z' | 'Naruto' | 'One Piece' | 'Jujutsu Kaisen' | 'Demon Slayer';

type Product = {
  id: string;
  name: string;
  series: string;
  category: Exclude<Category, 'Todas'>;
  price: number;
  image: string;
  fotos?: string[];
  badge?: string;
  descripcion: string;
  material: string;
  altura: string;
};

const queryClient = new QueryClient();

/** Antepone la subcarpeta de despliegue (ej. "/trade-animations-store/") a
 *  una imagen de /public — Vite no lo hace solo para rutas escritas a mano. */
function asset(nombreArchivo: string) {
  return `${import.meta.env.BASE_URL}${nombreArchivo.replace(/^\//, '')}`;
}

const products: Product[] = [
  {
    id: 'goku-ultra-instinct', name: 'Son Goku / Ultra Instinto', series: 'Dragon Ball Z', category: 'Dragon Ball Z', price: 129.9,
    image: asset('/goku-ultra-instinto.webp'), badge: 'Más buscada',
    descripcion: 'Son Goku en Ultra Instinto captura ese segundo suspendido antes del impacto. Una pieza pensada para destacar en cualquier vitrina.',
    material: 'Resina policromada', altura: '28 cm',
  },
  {
    id: 'naruto-sage-mode', name: 'Naruto / Modo Sabio', series: 'Naruto', category: 'Naruto', price: 114.9,
    image: asset('/naruto-modo-sabio.jpg'), badge: 'Nueva llegada',
    descripcion: 'Naruto en Modo Sabio, con los ojos y marcas características de esta transformación, sobre una base que recrea su presencia de combate.',
    material: 'PVC pintado a mano', altura: '25 cm',
  },
  {
    id: 'luffy-gear-five', name: 'Monkey D. Luffy / Gear 5', series: 'One Piece', category: 'One Piece', price: 159,
    image: asset('/luffy-gear-5.webp'), badge: 'Edición especial',
    descripcion: 'Luffy desatando su Gear 5 sobre una base de escombros y rayos, en plena acción, tal como se lo ve en el momento más icónico del arco de Egghead.',
    material: 'PVC / resina', altura: '30 cm',
  },
  {
    id: 'gojo-limitless', name: 'Satoru Gojo / Ilimitado', series: 'Jujutsu Kaisen', category: 'Jujutsu Kaisen', price: 149.5,
    image: asset('/gojo-ilimitado.webp'), badge: 'Favorita',
    descripcion: 'Satoru Gojo en pose de combate con su técnica Ilimitada, sobre una base de rocas fracturadas que transmite todo el poder del personaje.',
    material: 'PVC pintado', altura: '27 cm',
  },
  {
    id: 'nezuko-box', name: 'Nezuko / Caja de madera', series: 'Demon Slayer', category: 'Demon Slayer', price: 99.9,
    image: asset('/nezuko-caja-madera.webp'),
    descripcion: 'Nezuko en su clásica caja de madera de transporte, una de las piezas más buscadas por coleccionistas de Kimetsu no Yaiba.',
    material: 'PVC', altura: '15 cm',
  },
];

const categories: { name: Exclude<Category, 'Todas'>; count: string; number: string; className?: string; fondo: string }[] = [
  { name: 'Dragon Ball Z', count: '24 piezas', number: '01', className: 'large', fondo: asset('/fondo-dbz.jpg') },
  { name: 'Naruto', count: '18 piezas', number: '02', fondo: asset('/fondo-naruto.jpg') },
  { name: 'One Piece', count: '21 piezas', number: '03', fondo: asset('/fondo-one-piece.jpg') },
  { name: 'Jujutsu Kaisen', count: '16 piezas', number: '04', fondo: asset('/fondo-jujutsu-kaisen.jpg') },
  { name: 'Demon Slayer', count: '13 piezas', number: '05', fondo: asset('/fondo-demon-slayer.jpg') },
];

function money(value: number) {
  return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(value);
}

const WHATSAPP_NUMERO = '59162811626';

function linkPedido(cart: Product[]) {
  const lineas = cart.map((item) => `• ${item.name} — ${money(item.price)}`).join('\n');
  const total = money(cart.reduce((sum, item) => sum + item.price, 0));
  const texto = `¡Hola! Quiero hacer este pedido:\n\n${lineas}\n\nTotal: ${total}`;
  return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(texto)}`;
}

function BanderaBolivia() {
  return (
    <svg width="18" height="12" viewBox="0 0 27 18" className="bandera-bolivia" aria-label="Bolivia" role="img">
      <rect width="27" height="6" fill="#D52B1E" />
      <rect y="6" width="27" height="6" fill="#F9E300" />
      <rect y="12" width="27" height="6" fill="#007A33" />
    </svg>
  );
}

function IconoTikTok() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.6 5.82a4.28 4.28 0 0 1-1.02-2.82H12.5v12.35a2.53 2.53 0 1 1-2.53-2.53c.2 0 .4.03.59.08V9.66a5.66 5.66 0 0 0-.59-.03A5.63 5.63 0 1 0 15.6 15.3V9.4a7.32 7.32 0 0 0 4.3 1.38V7.66a4.28 4.28 0 0 1-3.3-1.84z" />
    </svg>
  );
}

function IconoWhatsApp() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.65-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.06 2.86 1.21 3.06c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z" />
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.96L2 22l5.25-1.38a9.86 9.86 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.25-4.38c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.83 2.41a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Z" />
    </svg>
  );
}

function ProductoDetalle({ product, onAdd, onToggleFavorite, favorites, onBack }: {
  product?: Product;
  onAdd: (product: Product) => void;
  onToggleFavorite: (id: string) => void;
  favorites: string[];
  onBack: () => void;
}) {
  const fotos = product ? (product.fotos && product.fotos.length > 0 ? product.fotos : [product.image]) : [];
  const [activeFoto, setActiveFoto] = useState(0);

  if (!product) {
    return (
      <section className="section product-detail">
        <div className="page-shell" style={{ textAlign: 'center' }}>
          <p className="section-intro" style={{ margin: '0 auto 20px' }}>No encontramos esa figura.</p>
          <a href="#coleccion" className="button-primary" onClick={(event) => { event.preventDefault(); onBack(); }}>Volver a la colección</a>
        </div>
      </section>
    );
  }

  return (
    <section className="section product-detail">
      <div className="page-shell">
        <a href="#coleccion" className="product-detail-back" onClick={(event) => { event.preventDefault(); onBack(); }} data-testid="link-back-collection">
          <ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} /> Volver a la colección
        </a>
        <div className="product-detail-grid">
          <div>
            <div className="product-detail-main-photo">
              <img src={fotos[activeFoto]} alt={product.name} data-testid="img-product-detail-main" />
            </div>
            {fotos.length > 1 && (
              <div className="product-detail-thumbs">
                {fotos.map((foto, index) => (
                  <button key={foto} className={`product-detail-thumb ${index === activeFoto ? 'active' : ''}`} onClick={() => setActiveFoto(index)} aria-label={`Ver foto ${index + 1}`} data-testid={`button-thumb-${index}`}>
                    <img src={foto} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="spotlight-copy">
            <div className="eyebrow">{product.series}{product.badge ? ` · ${product.badge}` : ''}</div>
            <h1>{product.name}</h1>
            <p>{product.descripcion}</p>
            <div className="spotlight-price">{money(product.price)}</div>
            <div className="hero-actions">
              <button className="button-primary" onClick={() => onAdd(product)} data-testid="button-detail-add">Reservar esta pieza <ArrowRight size={15} /></button>
              <button className="button-quiet" onClick={() => onToggleFavorite(product.id)} data-testid="button-detail-favorite">
                <Heart size={15} fill={favorites.includes(product.id) ? 'currentColor' : 'none'} /> {favorites.includes(product.id) ? 'Guardada' : 'Guardar'}
              </button>
            </div>
            <div className="spec-list">
              <div className="spec"><span>Anime</span><span>{product.series}</span></div>
              <div className="spec"><span>Material</span><span>{product.material}</span></div>
              <div className="spec"><span>Altura</span><span>{product.altura}</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Home() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('Todas');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cart, setCart] = useState<Product[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [navSolid, setNavSolid] = useState(false);
  const [, setLocation] = useLocation();
  const [pendingScroll, setPendingScroll] = useState<string | null>(null);
  const [matchProduct, paramsProduct] = useRoute('/producto/:id');
  const activeProduct = matchProduct ? products.find((product) => product.id === paramsProduct?.id) : undefined;

  useEffect(() => {
    if (matchProduct) { setNavSolid(true); return; }
    const heroEl = document.getElementById('inicio');
    if (!heroEl) return;
    const observer = new IntersectionObserver(
      ([entry]) => setNavSolid(!entry.isIntersecting),
      { rootMargin: '-77px 0px 0px 0px', threshold: 0 },
    );
    observer.observe(heroEl);
    return () => observer.disconnect();
  }, [matchProduct]);

  useEffect(() => {
    if (pendingScroll && !matchProduct) {
      document.getElementById(pendingScroll)?.scrollIntoView({ behavior: 'smooth' });
      setPendingScroll(null);
    }
  }, [pendingScroll, matchProduct]);

  const goToSection = (id: string) => {
    if (matchProduct) { setPendingScroll(id); setLocation('/'); }
    else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredProducts = useMemo(() => products.filter((product) => {
    const matchesCategory = activeCategory === 'Todas' || product.category === activeCategory;
    const search = query.trim().toLowerCase();
    const matchesQuery = !search || `${product.name} ${product.series} ${product.category}`.toLowerCase().includes(search);
    return matchesCategory && matchesQuery;
  }), [activeCategory, query]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const notify = (message: string) => setToast(message);
  const toggleFavorite = (id: string) => {
    setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    notify(favorites.includes(id) ? 'Quitado de tu lista de deseos' : 'Guardado en tu lista de deseos');
  };
  const addToCart = (product: Product) => {
    setCart((current) => current.some((item) => item.id === product.id) ? current : [...current, product]);
    notify(`${product.name} está en tu bolsa`);
  };
  return (
    <div className="grain">
      <div className="topbar">
        <div className="topbar-inner">
          <span className="topbar-dot" />
          <span>Envío gratuito a partir de Bs 80</span>
          <span className="topbar-dot" />
          <span>Empaquetado de galería, siempre</span>
        </div>
      </div>

      <header className={`nav-wrap ${navSolid ? 'nav-solid' : ''}`}>
        <nav className="nav page-shell" aria-label="Navegación principal">
          <a href="#inicio" className="brand" onClick={(event) => { event.preventDefault(); if (matchProduct) setLocation('/'); else document.getElementById('inicio')?.scrollIntoView({ behavior: 'smooth' }); }} data-testid="link-home">
            <span className="brand-mark"><span>T</span></span>
            <span className="brand-name">Trade Animations</span>
          </a>
          <div className={`nav-links ${mobileOpen ? 'mobile-visible' : ''}`}>
            <a className="nav-link" href="#coleccion" onClick={(event) => { event.preventDefault(); setMobileOpen(false); goToSection('coleccion'); }} data-testid="link-collection">Colección</a>
            <a className="nav-link" href="#categorias" onClick={(event) => { event.preventDefault(); setMobileOpen(false); goToSection('categorias'); }} data-testid="link-categories">Animes</a>
          </div>
          <div className="nav-actions">
            <button className="icon-button" onClick={() => goToSection('coleccion')} aria-label="Buscar figuras" data-testid="button-search">
              <Search size={17} strokeWidth={1.7} />
            </button>
            <button className="icon-button" onClick={() => setCartOpen(true)} aria-label="Abrir bolsa" data-testid="button-cart">
              <ShoppingBag size={17} strokeWidth={1.7} />
              {cart.length > 0 && <span className="cart-count" data-testid="text-cart-count">{cart.length}</span>}
            </button>
            <button className="icon-button mobile-menu" onClick={() => setMobileOpen((open) => !open)} aria-label="Abrir menú" data-testid="button-mobile-menu">
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>
      </header>

      <main>
        {matchProduct ? (
          <ProductoDetalle product={activeProduct} onAdd={(product) => { addToCart(product); setCartOpen(true); }} onToggleFavorite={toggleFavorite} favorites={favorites} onBack={() => goToSection('coleccion')} />
        ) : (
        <>
        <section className="hero" id="inicio" style={{ backgroundImage: `url(${asset('/hero-fondo-infinito.jpg')})` }}>
          <div className="hero-grid page-shell">
            <div className="hero-copy reveal">
              <div className="eyebrow hero-kicker">Para vitrinas con carácter</div>
              <h1>Tu próxima<br /><em>obsesión</em><br />empieza aquí.</h1>
              <p className="hero-subtitle">Figuras que convierten una estantería en una escena. Seleccionadas con ojo de coleccionista, enviadas con el cuidado que merecen.</p>
              <div className="hero-actions">
                <a className="button-primary" href="#coleccion" data-testid="link-explore-collection">Explorar colección <ArrowRight size={15} /></a>
                <button className="button-quiet" onClick={() => document.getElementById('categorias')?.scrollIntoView({ behavior: 'smooth' })} data-testid="button-discover-animes">Ver por anime <ChevronRight size={15} /></button>
              </div>
              <div className="hero-note"><span className="note-line" /><span><strong>01 / 05</strong> universos disponibles</span></div>
            </div>
            <div className="hero-art reveal reveal-delay-2">
              <img className="hero-figure" src={asset('/hero-gojo-cutout.png')} alt="Figura de Satoru Gojo" data-testid="img-hero-figure" />
            </div>
          </div>
        </section>

        <div className="marquee" aria-label="Manifiesto Trade Animations">
          <div className="marquee-track">
            {[1, 2].map((copy) => (
              <div className="marquee-item" key={copy}>
                <span>FIGURAS CON HISTORIA</span><span>DETALLES QUE SE DESCUBREN</span><span>HECHAS PARA MIRARLAS DE CERCA</span><span>ESTANTERÍAS CON ALMA</span>
              </div>
            ))}
          </div>
        </div>

        <section className="section categories" id="categorias">
          <div className="page-shell">
            <div className="section-header">
              <div><div className="eyebrow">Encuentra tu universo</div><h2 className="section-title">Elige tu<br /><span style={{ color: 'hsl(var(--primary))' }}>anime.</span></h2></div>
              <p className="section-intro">Cada anime tiene su propio espacio. Entra a tu universo favorito y encuentra la figura que quieres poner en primera fila.</p>
            </div>
            <div className="category-grid">
              {categories.map((category) => (
                <a
                  className={`category-card ${category.className === 'large' ? 'first-card' : ''}`}
                  href="#coleccion"
                  key={category.name}
                  onClick={() => { setActiveCategory(category.name); setQuery(''); }}
                  data-testid={`link-category-${category.name.toLowerCase().replaceAll(' ', '-')}`}
                  style={{
                    backgroundImage: `linear-gradient(180deg, rgba(20,16,16,.2), rgba(12,9,12,.8)), url(${category.fondo})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    color: '#f7f1e6',
                  }}
                >
                  <span className="category-number">{category.number}</span>
                  <div className="category-card-content"><span className="category-name">{category.name}</span><span className="category-count">{category.count}</span></div>
                  <ArrowRight className="category-arrow" size={18} />
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="section collection" id="coleccion">
          <div className="page-shell">
            <div className="section-header">
              <div><div className="eyebrow">La selección Kitsune</div><h2 className="section-title">Figuras por<br /><span style={{ color: 'hsl(var(--primary))' }}>anime.</span></h2></div>
              <p className="section-intro">Busca por franquicia, guarda tus favoritas y añade a tu bolsa las piezas que ya tienen un lugar en tu estantería.</p>
            </div>
            <div className="collection-tools">
              <label className="search-box" htmlFor="product-search"><Search size={15} /><input id="product-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre o serie..." data-testid="input-product-search" /></label>
              {(['Todas', 'Dragon Ball Z', 'Naruto', 'One Piece', 'Jujutsu Kaisen', 'Demon Slayer'] as Category[]).map((category) => (
                <button className={`filter-chip ${activeCategory === category ? 'active' : ''}`} onClick={() => setActiveCategory(category)} key={category} data-testid={`button-filter-${category.toLowerCase().replaceAll(' ', '-')}`}>{category}</button>
              ))}
              <span className="collection-status" data-testid="text-results-count">{filteredProducts.length} piezas visibles</span>
            </div>
            <div className="product-grid">
              {filteredProducts.length > 0 ? filteredProducts.map((product, index) => (
                <article className={`product-card reveal reveal-delay-${index + 1}`} key={product.id} data-testid={`card-product-${product.id}`}>
                  <Link href={`/producto/${product.id}`} className="product-visual" data-testid={`link-product-${product.id}`}>
                    {product.badge && <span className="product-badge">{product.badge}</span>}
                    <button className={`product-favorite ${favorites.includes(product.id) ? 'active' : ''}`} onClick={(event) => { event.preventDefault(); toggleFavorite(product.id); }} aria-label={`Guardar ${product.name}`} data-testid={`button-favorite-${product.id}`}><Heart size={16} fill={favorites.includes(product.id) ? 'currentColor' : 'none'} /></button>
                    <img src={product.image} alt={product.name} loading="lazy" data-testid={`img-product-${product.id}`} />
                  </Link>
                  <div className="product-info">
                    <div className="product-meta">{product.series}</div>
                    <h3 className="product-name"><Link href={`/producto/${product.id}`}>{product.name}</Link></h3>
                    <div className="product-bottom"><span className="product-price">{money(product.price)}</span><button className="add-button" onClick={() => addToCart(product)} data-testid={`button-add-${product.id}`}>Añadir <ShoppingBag size={13} /></button></div>
                  </div>
                </article>
               )) : <div className="empty-results" data-testid="empty-search-results">No encontramos esa figura. Prueba con otro nombre o anime.</div>}
            </div>
          </div>
        </section>

        <section className="section spotlight">
          <div className="page-shell spotlight-grid">
            <div className="spotlight-art"><img className="spotlight-img" src={asset('/goku-ultra-instinto.webp')} alt="Figura de Son Goku en Ultra Instinto" data-testid="img-spotlight-figure" /></div>
            <div className="spotlight-copy">
              <div className="eyebrow">Pieza destacada / Dragon Ball Z</div>
              <h2>El cielo<br />en una<br /><span style={{ color: 'hsl(var(--primary))' }}>pose.</span></h2>
              <p>Son Goku en Ultra Instinto captura ese segundo suspendido antes del impacto. Resina policromada, 28 centímetros de presencia y una pieza pensada para destacar.</p>
              <div className="spotlight-price">{money(products[0].price)}</div>
              <div className="hero-actions">
                <button className="button-primary" onClick={() => addToCart(products[0])} data-testid="button-spotlight-add">Reservar esta pieza <ArrowRight size={15} /></button>
                <Link href={`/producto/${products[0].id}`} className="button-quiet" data-testid="link-spotlight-details">Ver detalles <ChevronRight size={15} /></Link>
              </div>
              <div className="spec-list"><div className="spec"><span>Anime</span><span>Dragon Ball Z</span></div><div className="spec"><span>Material</span><span>Resina policromada</span></div><div className="spec"><span>Altura</span><span>28 cm</span></div></div>
            </div>
          </div>
        </section>
        </>
        )}
      </main>

      <footer className="footer">
        <div className="page-shell">
          <div className="footer-grid">
            <div>
              <a href="#inicio" className="brand" onClick={(event) => { event.preventDefault(); if (matchProduct) setLocation('/'); else document.getElementById('inicio')?.scrollIntoView({ behavior: 'smooth' }); }} data-testid="link-footer-home"><span className="brand-mark"><span>T</span></span><span className="brand-name">Trade Animations</span></a>
              <p>Figuras de anime seleccionadas para que cada estantería tenga su propio universo.</p>
            </div>
            <div>
              <h3>Showroom</h3>
              <p style={{ margin: '0 0 12px' }}>La Paz, Bolivia</p>
              <p style={{ margin: 0 }}>Envíos a todo el país <BanderaBolivia /></p>
            </div>
            <div>
              <h3>Navegación</h3>
              <a href="#coleccion" onClick={(event) => { event.preventDefault(); goToSection('coleccion'); }}>Colección</a>
              <a href="#categorias" onClick={(event) => { event.preventDefault(); goToSection('categorias'); }}>Animes</a>
            </div>
            <div>
              <h3>Seguinos</h3>
              <div className="footer-social">
                <a href="https://www.tiktok.com/@trade.animations.store" target="_blank" rel="noopener noreferrer" aria-label="TikTok de Trade Animations Store" data-testid="link-tiktok" className="footer-social-icon footer-social-tiktok"><IconoTikTok /></a>
                <a href={`https://wa.me/${WHATSAPP_NUMERO}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp de Trade Animations Store" data-testid="link-whatsapp" className="footer-social-icon footer-social-whatsapp"><IconoWhatsApp /></a>
              </div>
              <h3 style={{ marginTop: 22 }}>Contacto</h3>
              <a href={`https://wa.me/${WHATSAPP_NUMERO}`} target="_blank" rel="noopener noreferrer">+591 62811626</a>
            </div>
          </div>
          <div className="footer-bottom"><span>© 2026 TRADE ANIMATIONS STORE</span><span>COLECCIONA LO QUE TE MUEVE</span></div>
        </div>
      </footer>

      {cartOpen && <><div className="cart-panel-backdrop" onClick={() => setCartOpen(false)} /><aside className="cart-panel" aria-label="Tu bolsa" data-testid="cart-panel"><div className="cart-head"><h2>Tu bolsa</h2><button className="icon-button" onClick={() => setCartOpen(false)} aria-label="Cerrar bolsa" data-testid="button-close-cart"><X size={18} /></button></div>{cart.length === 0 ? <div className="cart-empty"><ShoppingBag size={25} /><p>Aquí aparecerán las piezas<br />que decidan acompañarte.</p></div> : <><div>{cart.map((item) => <div className="cart-item" key={item.id}><img src={item.image} alt="" /><div><h3>{item.name}</h3><p>{money(item.price)}</p></div><button className="icon-button" onClick={() => setCart((current) => current.filter((product) => product.id !== item.id))} aria-label={`Quitar ${item.name}`} data-testid={`button-remove-${item.id}`}><X size={14} /></button></div>)}</div><div className="cart-total"><span>Total</span><strong>{money(cart.reduce((sum, item) => sum + item.price, 0))}</strong></div><a className="button-primary" style={{ width: '100%', textAlign: 'center' }} href={linkPedido(cart)} target="_blank" rel="noopener noreferrer" data-testid="button-checkout">Pedir por WhatsApp <ArrowRight size={15} /></a></>}</aside></>}
      {toast && <div className="toast-message" role="status" data-testid="status-toast"><Sparkles size={14} style={{ verticalAlign: 'middle', marginRight: 7 }} />{toast}</div>}
    </div>
  );
}

function Router() {
  return (
    <ErrorBoundary resetKey={useLocation()[0]}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/producto/:id" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;