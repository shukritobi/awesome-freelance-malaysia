const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
const money=n=>`RM${Number(n).toFixed(0)}`;
let activeBrand='All';
let cart=JSON.parse(localStorage.getItem('farisSelectsCart')||'[]');

function bottleHTML(p, scale=''){
  return `<div class="product-bottle accent-${p.accent}" ${scale?'style="'+scale+'"':''}>
    <div class="product-bottle-label"><b>${p.name}</b><small>${p.brand} · ${p.size}</small></div>
  </div>`;
}
function renderProducts(list=PRODUCTS){
  $('#productGrid').innerHTML=list.map(p=>`
  <article class="product-card">
    <div class="product-visual">
      <span class="badge">${p.badge}</span>
      ${bottleHTML(p)}
      <button class="quick" onclick="openProduct('${p.id}')">Quick view</button>
    </div>
    <div class="product-meta">
      <div class="brand">${p.brand.toUpperCase()} · ${p.gender}</div>
      <div class="product-title">${p.name}</div>
      <div class="product-row"><span>${p.family}</span><span class="price">${money(p.price)} <span class="compare">${money(p.compareAt)}</span></span></div>
    </div>
  </article>`).join('');
}
function filterBrand(brand, el){
  activeBrand=brand;
  $$('.chip').forEach(x=>x.classList.remove('active')); el.classList.add('active');
  renderProducts(brand==='All'?PRODUCTS:PRODUCTS.filter(p=>p.brand===brand));
}
function openProduct(id){
  const p=PRODUCTS.find(x=>x.id===id);
  $('#productModalContent').innerHTML=`
    <div class="product-modal-visual">${bottleHTML(p,'transform:scale(1.25)')}</div>
    <div class="product-modal-copy">
      <div class="brand">${p.brand.toUpperCase()} · ${p.size} · ${p.gender}</div>
      <h3>${p.name}</h3>
      <div class="price" style="font-size:20px">${money(p.price)} <span class="compare">${money(p.compareAt)}</span></div>
      <p class="lead">${p.copy}</p>
      <div class="notes">
        <div class="note-card"><b>Top</b>${p.top.join(', ')}</div>
        <div class="note-card"><b>Heart</b>${p.heart.join(', ')}</div>
        <div class="note-card"><b>Base</b>${p.base.join(', ')}</div>
      </div>
      <button class="btn full" onclick="addToCart('${p.id}');closeModal()">Add to bag · ${money(p.price)}</button>
      <p class="note">Demo pricing only. Final Malaysia retail pricing, stock and authenticity documentation to be confirmed before launch.</p>
    </div>`;
  showOverlay(); $('#productModal').classList.add('show');
}
function closeModal(){
  $$('.modal').forEach(m=>m.classList.remove('show'));
  if(!$('#cartDrawer').classList.contains('show')&&!$('#searchPanel').classList.contains('show')) hideOverlay();
}
function addToCart(id){
  const found=cart.find(x=>x.id===id);
  if(found) found.qty++; else cart.push({id,qty:1});
  saveCart(); openCart();
}
function saveCart(){localStorage.setItem('farisSelectsCart',JSON.stringify(cart));renderCart()}
function renderCart(){
  const count=cart.reduce((a,b)=>a+b.qty,0); $('#cartCount').textContent=count;
  if(!cart.length){$('#cartBody').innerHTML='<p style="color:#777;font-size:13px">Your bag is empty. Start with a signature scent.</p>';$('#cartTotal').textContent='RM0';return}
  $('#cartBody').innerHTML=cart.map(item=>{
    const p=PRODUCTS.find(x=>x.id===item.id);
    return `<div class="cart-item">
      <div class="mini-bottle">${p.brand.slice(0,1)}·${p.name.replace('REEF ','').slice(0,2)}</div>
      <div><b>${p.name}</b><small>${p.brand} · ${p.size}</small>
      <div class="qty"><button onclick="qty('${p.id}',-1)">−</button><span>${item.qty}</span><button onclick="qty('${p.id}',1)">+</button></div></div>
      <b>${money(p.price*item.qty)}</b>
    </div>`}).join('');
  const total=cart.reduce((sum,item)=>sum+PRODUCTS.find(p=>p.id===item.id).price*item.qty,0);
  $('#cartTotal').textContent=money(total);
}
function qty(id,n){
  const it=cart.find(x=>x.id===id); if(!it)return; it.qty+=n;
  if(it.qty<=0) cart=cart.filter(x=>x.id!==id); saveCart();
}
function showOverlay(){ $('#overlay').classList.add('show');document.body.classList.add('lock')}
function hideOverlay(){ $('#overlay').classList.remove('show');document.body.classList.remove('lock')}
function openCart(){showOverlay();$('#cartDrawer').classList.add('show')}
function closeCart(){$('#cartDrawer').classList.remove('show');hideOverlay()}
function openCheckout(){
  if(!cart.length)return;
  $('#cartDrawer').classList.remove('show'); $('#checkoutModal').classList.add('show');showOverlay();
}
function demoOrder(e){
  e.preventDefault();
  $('#checkoutForm').innerHTML=`<div style="padding:40px 0;text-align:center"><div style="font-size:42px">✓</div><h3 style="font-size:36px">Demo checkout complete</h3><p style="color:#777;line-height:1.7">In Shopify this screen becomes the real checkout, with payment, shipping, stock and order notifications connected.</p><button type="button" class="btn" onclick="closeModal()">Back to store</button></div>`;
}
function openSearch(){showOverlay();$('#searchPanel').classList.add('show');setTimeout(()=>$('#searchInput').focus(),100)}
function closeSearch(){$('#searchPanel').classList.remove('show');hideOverlay()}
function searchProducts(q){
  q=q.toLowerCase().trim();
  const r=PRODUCTS.filter(p=>[p.name,p.brand,p.family,p.gender,...p.top,...p.heart,...p.base].join(' ').toLowerCase().includes(q));
  $('#searchResults').innerHTML=q?`${r.length} match${r.length!==1?'es':''}: `+r.slice(0,6).map(p=>`<button style="border:0;background:transparent;text-decoration:underline" onclick="closeSearch();openProduct('${p.id}')">${p.brand} ${p.name}</button>`).join(' · '):'Try “oud”, “vanilla”, “Gissah” or “men”.';
}
function quizPick(value,el){
  $$('.quiz button').forEach(b=>b.classList.remove('active'));el.classList.add('active');
  const map={
    'oud':['gissah-imperial-valley','reef-15','osma-noir'],
    'fresh':['reef-19','gissah-akoya','osma-breez'],
    'sweet':['osma-o','mold-oriental','mold-miss-vanilla'],
    'bold':['gissah-mavro','mold-clock','reef-11']
  };
  const picks=map[value].map(id=>PRODUCTS.find(p=>p.id===id));
  $('#quizResult').innerHTML=`Try: ${picks.map(p=>`<button style="border:0;background:transparent;color:#fff;text-decoration:underline;padding:0" onclick="openProduct('${p.id}')">${p.name}</button>`).join(' · ')}`;
}
function toggleFaq(el){el.parentElement.classList.toggle('open')}
$('#overlay').addEventListener('click',()=>{closeCart();closeSearch();closeModal()});
renderProducts();renderCart();
