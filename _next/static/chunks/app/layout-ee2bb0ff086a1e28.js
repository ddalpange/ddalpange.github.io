(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[185],{6966:function(e,t){"use strict";let n;Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(){return{mountedInstances:new Set,updateHead:e=>{let t={};e.forEach(e=>{if("link"===e.type&&e.props["data-optimized-fonts"]){if(document.querySelector('style[data-href="'.concat(e.props["data-href"],'"]')))return;e.props.href=e.props["data-href"],e.props["data-href"]=void 0}let n=t[e.type]||[];n.push(e),t[e.type]=n});let r=t.title?t.title[0]:null,o="";if(r){let{children:e}=r.props;o="string"==typeof e?e:Array.isArray(e)?e.join(""):""}o!==document.title&&(document.title=o),["meta","base","link","style","script"].forEach(e=>{n(e,t[e]||[])})}}},t.isEqualNode=l,t.DOMAttributeNames=void 0;let r={acceptCharset:"accept-charset",className:"class",htmlFor:"for",httpEquiv:"http-equiv",noModule:"noModule"};function o(e){let{type:t,props:n}=e,o=document.createElement(t);for(let e in n){if(!n.hasOwnProperty(e)||"children"===e||"dangerouslySetInnerHTML"===e||void 0===n[e])continue;let l=r[e]||e.toLowerCase();"script"===t&&("async"===l||"defer"===l||"noModule"===l)?o[l]=!!n[e]:o.setAttribute(l,n[e])}let{children:l,dangerouslySetInnerHTML:a}=n;return a?o.innerHTML=a.__html||"":l&&(o.textContent="string"==typeof l?l:Array.isArray(l)?l.join(""):""),o}function l(e,t){if(e instanceof HTMLElement&&t instanceof HTMLElement){let n=t.getAttribute("nonce");if(n&&!e.getAttribute("nonce")){let r=t.cloneNode(!0);return r.setAttribute("nonce",""),r.nonce=n,n===e.nonce&&e.isEqualNode(r)}}return e.isEqualNode(t)}t.DOMAttributeNames=r,n=(e,t)=>{let n=document.getElementsByTagName("head")[0],r=n.querySelector("meta[name=next-head-count]"),a=Number(r.content),i=[];for(let t=0,n=r.previousElementSibling;t<a;t++,n=(null==n?void 0:n.previousElementSibling)||null){var u;(null==n?void 0:null==(u=n.tagName)?void 0:u.toLowerCase())===e&&i.push(n)}let d=t.map(o).filter(e=>{for(let t=0,n=i.length;t<n;t++){let n=i[t];if(l(n,e))return i.splice(t,1),!1}return!0});i.forEach(e=>{var t;return null==(t=e.parentNode)?void 0:t.removeChild(e)}),d.forEach(e=>n.insertBefore(e,r)),r.content=(a-i.length+d.length).toString()},("function"==typeof t.default||"object"==typeof t.default&&null!==t.default)&&void 0===t.default.__esModule&&(Object.defineProperty(t.default,"__esModule",{value:!0}),Object.assign(t.default,t),e.exports=t.default)},2070:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.handleClientScriptLoad=m,t.initScriptLoader=function(e){e.forEach(m),function(){let e=[...document.querySelectorAll('[data-nscript="beforeInteractive"]'),...document.querySelectorAll('[data-nscript="beforePageRender"]')];e.forEach(e=>{let t=e.id||e.getAttribute("src");p.add(t)})}()},t.default=void 0;var r=n(1222).Z,o=n(4450).Z,l=n(950).Z,a=n(3470).Z,i=o(n(3372)),u=l(n(962)),d=n(9993),s=n(6966),c=n(6586);let f=new Map,p=new Set,y=["onLoad","onReady","dangerouslySetInnerHTML","children","onError","strategy"],h=e=>{let{src:t,id:n,onLoad:r=()=>{},onReady:o=null,dangerouslySetInnerHTML:l,children:a="",strategy:i="afterInteractive",onError:u}=e,d=n||t;if(d&&p.has(d))return;if(f.has(t)){p.add(d),f.get(t).then(r,u);return}let c=()=>{o&&o(),p.add(d)},h=document.createElement("script"),m=new Promise((e,t)=>{h.addEventListener("load",function(t){e(),r&&r.call(this,t),c()}),h.addEventListener("error",function(e){t(e)})}).catch(function(e){u&&u(e)});for(let[n,r]of(l?(h.innerHTML=l.__html||"",c()):a?(h.textContent="string"==typeof a?a:Array.isArray(a)?a.join(""):"",c()):t&&(h.src=t,f.set(t,m)),Object.entries(e))){if(void 0===r||y.includes(n))continue;let e=s.DOMAttributeNames[n]||n.toLowerCase();h.setAttribute(e,r)}"worker"===i&&h.setAttribute("type","text/partytown"),h.setAttribute("data-nscript",i),document.body.appendChild(h)};function m(e){let{strategy:t="afterInteractive"}=e;"lazyOnload"===t?window.addEventListener("load",()=>{c.requestIdleCallback(()=>h(e))}):h(e)}function _(e){let{id:t,src:n="",onLoad:o=()=>{},onReady:l=null,strategy:s="afterInteractive",onError:f}=e,y=a(e,["id","src","onLoad","onReady","strategy","onError"]),{updateScripts:m,scripts:_,getIsSsr:v,appDir:b,nonce:g}=u.useContext(d.HeadManagerContext),E=u.useRef(!1);u.useEffect(()=>{let e=t||n;E.current||(l&&e&&p.has(e)&&l(),E.current=!0)},[l,t,n]);let M=u.useRef(!1);if(u.useEffect(()=>{!M.current&&("afterInteractive"===s?h(e):"lazyOnload"===s&&("complete"===document.readyState?c.requestIdleCallback(()=>h(e)):window.addEventListener("load",()=>{c.requestIdleCallback(()=>h(e))})),M.current=!0)},[e,s]),("beforeInteractive"===s||"worker"===s)&&(m?(_[s]=(_[s]||[]).concat([r({id:t,src:n,onLoad:o,onReady:l,onError:f},y)]),m(_)):v&&v()?p.add(t||n):v&&!v()&&h(e)),b){if("beforeInteractive"===s)return n?(i.default.preload(n,y.integrity?{as:"script",integrity:y.integrity}:{as:"script"}),u.default.createElement("script",{nonce:g,dangerouslySetInnerHTML:{__html:"(self.__next_s=self.__next_s||[]).push(".concat(JSON.stringify([n]),")")}})):(y.dangerouslySetInnerHTML&&(y.children=y.dangerouslySetInnerHTML.__html,delete y.dangerouslySetInnerHTML),u.default.createElement("script",{nonce:g,dangerouslySetInnerHTML:{__html:"(self.__next_s=self.__next_s||[]).push(".concat(JSON.stringify([0,r({},y)]),")")}}));"afterInteractive"===s&&n&&i.default.preload(n,y.integrity?{as:"script",integrity:y.integrity}:{as:"script"})}return null}Object.defineProperty(_,"__nextScript",{value:!0}),t.default=_,("function"==typeof t.default||"object"==typeof t.default&&null!==t.default)&&void 0===t.default.__esModule&&(Object.defineProperty(t.default,"__esModule",{value:!0}),Object.assign(t.default,t),e.exports=t.default)},3508:function(e,t,n){Promise.resolve().then(n.t.bind(n,7131,23)),Promise.resolve().then(n.t.bind(n,2070,23)),Promise.resolve().then(n.t.bind(n,8572,23))},8572:function(){}},function(e){e.O(0,[131,776,474,744],function(){return e(e.s=3508)}),_N_E=e.O()}]);