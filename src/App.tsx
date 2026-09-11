import { useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ArrowRight, ChevronRight, Heart, Menu, Search, ShoppingBag, Sparkles, X } from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

type Category = 'Todas' | 'Dragon Ball Z' | 'Naruto' | 'One Piece' | 'Jujutsu Kaisen' | 'Demon Slayer';

type Product = {
  id: string;
  name: string;
  series: string;
  category: Exclude<Category, 'Todas'>;
  price: number;
  image: string;
  badge?: string;
};

const queryClient = new QueryClient();

const products: Product[] = [
  { id: 'goku-ultra-instinct', name: 'Son Goku / Ultra Instinto', series: 'Dragon Ball Z', category: 'Dragon Ball Z', price: 129.9, image: '/starship-swordsman.png', badge: 'Más buscada' },
  { id: 'naruto-sage-mode', name: 'Naruto / Modo Sabio', series: 'Naruto', category: 'Naruto', price: 114.9, image: '/fox-spirit.png', badge: 'Nueva llegada' },
  { id: 'luffy-gear-five', name: 'Monkey D. Luffy / Gear 5', series: 'One Piece', category: 'One Piece', price: 159, image: '/moonlit-miko.png', badge: 'Edición especial' },
  { id: 'gojo-limitless', name: 'Satoru Gojo / Ilimitado', series: 'Jujutsu Kaisen', category: 'Jujutsu Kaisen', price: 149.5, image: '/forest-witch.png', badge: 'Favorita' },
  { id: 'nezuko-box', name: 'Nezuko / Caja de madera', series: 'Demon Slayer', category: 'Demon Slayer', price: 99.9, image: '/fox-spirit.png' },
];

const categories: { name: Exclude<Category, 'Todas'>; count: string; number: string; className?: string }[] = [
  { name: 'Dragon Ball Z', count: '24 piezas', number: '01', className: 'large' },
  { name: 'Naruto', count: '18 piezas', number: '02' },
  { name: 'One Piece', count: '21 piezas', number: '03' },
  { name: 'Jujutsu Kaisen', count: '16 piezas', number: '04' },
  { name: 'Demon Slayer', count: '13 piezas', number: '05' },
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

function Home() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('Todas');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cart, setCart] = useState<Product[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState('');

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

      <header className="nav-wrap">
        <nav className="nav page-shell" aria-label="Navegación principal">
          <a href="#inicio" className="brand" data-testid="link-home">
            <span className="brand-mark"><span>T</span></span>
            <span className="brand-name">Trade Animations</span>
          </a>
          <div className={`nav-links ${mobileOpen ? 'mobile-visible' : ''}`}>
            <a className="nav-link" href="#coleccion" data-testid="link-collection">Colección</a>
            <a className="nav-link" href="#categorias" data-testid="link-categories">Animes</a>
          </div>
          <div className="nav-actions">
            <button className="icon-button" onClick={() => document.getElementById('coleccion')?.scrollIntoView({ behavior: 'smooth' })} aria-label="Buscar figuras" data-testid="button-search">
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
        <section className="hero" id="inicio">
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
              <div className="hero-orb" />
              <img className="hero-figure" src="/moonlit-miko.png" alt="Figura Kitsune Moon sobre fondo cálido" data-testid="img-hero-figure" />
              <div className="hero-side-note"><span>Selección del mes</span>La luz también<br />se colecciona.</div>
            </div>
          </div>
        </section>

        <div className="marquee" aria-label="Manifiesto Kitsune">
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
                <a className={`category-card ${category.className === 'large' ? 'first-card' : ''}`} href="#coleccion" key={category.name} onClick={() => { setActiveCategory(category.name); setQuery(''); }} data-testid={`link-category-${category.name.toLowerCase().replaceAll(' ', '-')}`}>
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
                  <div className="product-visual">
                    {product.badge && <span className="product-badge">{product.badge}</span>}
                    <button className={`product-favorite ${favorites.includes(product.id) ? 'active' : ''}`} onClick={() => toggleFavorite(product.id)} aria-label={`Guardar ${product.name}`} data-testid={`button-favorite-${product.id}`}><Heart size={16} fill={favorites.includes(product.id) ? 'currentColor' : 'none'} /></button>
                    <img src={product.image} alt={product.name} loading="lazy" data-testid={`img-product-${product.id}`} />
                  </div>
                  <div className="product-info">
                    <div className="product-meta">{product.series}</div>
                    <h3 className="product-name">{product.name}</h3>
                    <div className="product-bottom"><span className="product-price">{money(product.price)}</span><button className="add-button" onClick={() => addToCart(product)} data-testid={`button-add-${product.id}`}>Añadir <ShoppingBag size={13} /></button></div>
                  </div>
                </article>
               )) : <div className="empty-results" data-testid="empty-search-results">No encontramos esa figura. Prueba con otro nombre o anime.</div>}
            </div>
          </div>
        </section>

        <section className="section spotlight">
          <div className="page-shell spotlight-grid">
            <div className="spotlight-art"><img className="spotlight-img" src="/starship-swordsman.png" alt="Figura de Son Goku en Ultra Instinto" data-testid="img-spotlight-figure" /></div>
            <div className="spotlight-copy">
              <div className="eyebrow">Pieza destacada / Dragon Ball Z</div>
              <h2>El cielo<br />en una<br /><span style={{ color: 'hsl(var(--primary))' }}>pose.</span></h2>
              <p>Son Goku en Ultra Instinto captura ese segundo suspendido antes del impacto. Resina policromada, 28 centímetros de presencia y una pieza pensada para destacar.</p>
              <div className="spotlight-price">{money(products[0].price)}</div>
              <button className="button-primary" onClick={() => addToCart(products[0])} data-testid="button-spotlight-add">Reservar esta pieza <ArrowRight size={15} /></button>
              <div className="spec-list"><div className="spec"><span>Anime</span><span>Dragon Ball Z</span></div><div className="spec"><span>Material</span><span>Resina policromada</span></div><div className="spec"><span>Altura</span><span>28 cm</span></div></div>
            </div>
          </div>
        </section>

      </main>

      <footer className="footer">
        <div className="page-shell">
          <div className="footer-grid">
             <div><a href="#inicio" className="brand" data-testid="link-footer-home"><span className="brand-mark"><span>T</span></span><span className="brand-name">Trade Animations</span></a><p>Figuras de anime seleccionadas para que cada estantería tenga su propio universo.</p></div>
             <div><h3>Explora</h3><a href="#coleccion">Colección</a><a href="#categorias">Animes</a></div>
            <div><h3>Ayuda</h3><a href={`https://wa.me/${WHATSAPP_NUMERO}`} target="_blank" rel="noopener noreferrer">Contacto por WhatsApp</a><a href="#inicio" onClick={() => notify('Envío a todo el país')}>Envíos</a><a href="#inicio" onClick={() => notify('Consultanos por cambios y devoluciones')}>Devoluciones</a></div>
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