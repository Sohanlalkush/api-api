import{u as S,a as A,_ as B}from"./DJzxP1Pn.js";import{r as i,T as L,o as M,e as T,c,U as x,v as E,x as t,M as l,z as d,A as N,W as R,i as w,t as O}from"./D6sixL08.js";import{useLayout as U}from"./BbKksSaT.js";import"./PPKyQjij.js";import"./CSF5agd9.js";const $={class:"layout-topbar"},q=t("i",{class:"pi pi-bars"},null,-1),z=[q],D=["src"],V=t("span",null,"Dashboard | WAHA",-1),W=t("i",{class:"pi pi-ellipsis-v"},null,-1),H=[W],I={class:"m-auto"},j=["disabled"],F=t("i",{class:"pi pi-refresh"},null,-1),G=t("span",null,"Refresh",-1),J=[F,G],tt={__name:"AppTopbar",setup(K){const{layoutConfig:p,onMenuToggle:_}=U(),s=i(null),n=i(!1);L();const r=S();M(()=>{v()}),T(()=>{h()});const m=c(()=>`/dashboard/layout/images/${p.darkTheme.value?"logo-white":"logo-dark"}.svg`),b=()=>{n.value=!n.value},f=c(()=>({"layout-topbar-menu-mobile-active":n.value})),v=()=>{s.value||(s.value=o=>{g(o)&&(n.value=!1)},document.addEventListener("click",s.value))},h=()=>{s.value&&(document.removeEventListener("click",s),s.value=null)},g=o=>{if(!n.value)return;const e=document.querySelector(".layout-topbar-menu"),a=document.querySelector(".layout-topbar-menu-button");return!(e.isSameNode(o.target)||e.contains(o.target)||a.isSameNode(o.target)||a.contains(o.target))};function k(){A("store",async()=>await r.refresh())}const{refreshing:u}=x(r);return(o,e)=>{const a=w("router-link"),y=B;return O(),E("div",$,[t("button",{class:"p-link layout-menu-button layout-topbar-button",onClick:e[0]||(e[0]=C=>l(_)())},z),d(a,{to:"/",class:"layout-topbar-logo"},{default:N(()=>[t("img",{class:"mb-1",src:m.value,alt:"logo"},null,8,D),V]),_:1}),t("button",{class:"p-link layout-topbar-menu-button layout-topbar-button",onClick:e[1]||(e[1]=C=>b())},H),t("div",{class:R(["layout-topbar-menu",f.value])},[t("div",I,[d(y,{refreshing:l(u)},null,8,["refreshing"])]),t("button",{onClick:k,class:"p-link layout-topbar-button",disabled:l(u)},J,8,j)],2)])}}};export{tt as default};