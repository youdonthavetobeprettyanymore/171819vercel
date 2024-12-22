import{c as Pe,g as Xe}from"./client.X89VUMzK.js";var se={exports:{}};/** @license
 * eventsource.js
 * Available under MIT License (MIT)
 * https://github.com/Yaffle/EventSource/
 */(function(be,_e){(function(m){var O=m.setTimeout,M=m.clearTimeout,w=m.XMLHttpRequest,fe=m.XDomainRequest,de=m.ActiveXObject,z=m.EventSource,N=m.document,Re=m.Promise,Q=m.fetch,ue=m.Response,K=m.TextDecoder,ce=m.TextEncoder,Y=m.AbortController;if(typeof window<"u"&&typeof N<"u"&&!("readyState"in N)&&N.body==null&&(N.readyState="loading",window.addEventListener("load",function(e){N.readyState="complete"},!1)),w==null&&de!=null&&(w=function(){return new de("Microsoft.XMLHTTP")}),Object.create==null&&(Object.create=function(e){function r(){}return r.prototype=e,new r}),Date.now||(Date.now=function(){return new Date().getTime()}),Y==null){var Ae=Q;Q=function(e,r){var n=r.signal;return Ae(e,{headers:r.headers,credentials:r.credentials,cache:r.cache}).then(function(t){var o=t.body.getReader();return n._reader=o,n._aborted&&n._reader.cancel(),{status:t.status,statusText:t.statusText,headers:t.headers,body:{getReader:function(){return o}}}})},Y=function(){this.signal={_reader:null,_aborted:!1},this.abort=function(){this.signal._reader!=null&&this.signal._reader.cancel(),this.signal._aborted=!0}}}function le(){this.bitsNeeded=0,this.codePoint=0}le.prototype.decode=function(e){function r(d,u,i){if(i===1)return d>=128>>u&&d<<u<=2047;if(i===2)return d>=2048>>u&&d<<u<=55295||d>=57344>>u&&d<<u<=65535;if(i===3)return d>=65536>>u&&d<<u<=1114111;throw new Error}function n(d,u){if(d===6*1)return u>>6>15?3:u>31?2:1;if(d===6*2)return u>15?3:2;if(d===6*3)return 3;throw new Error}for(var t=65533,o="",a=this.bitsNeeded,s=this.codePoint,c=0;c<e.length;c+=1){var f=e[c];a!==0&&(f<128||f>191||!r(s<<6|f&63,a-6,n(a,s)))&&(a=0,s=t,o+=String.fromCharCode(s)),a===0?(f>=0&&f<=127?(a=0,s=f):f>=192&&f<=223?(a=6*1,s=f&31):f>=224&&f<=239?(a=6*2,s=f&15):f>=240&&f<=247?(a=6*3,s=f&7):(a=0,s=t),a!==0&&!r(s,a,n(a,s))&&(a=0,s=t)):(a-=6,s=s<<6|f&63),a===0&&(s<=65535?o+=String.fromCharCode(s):(o+=String.fromCharCode(55296+(s-65535-1>>10)),o+=String.fromCharCode(56320+(s-65535-1&1023))))}return this.bitsNeeded=a,this.codePoint=s,o};var xe=function(){try{return new K().decode(new ce().encode("test"),{stream:!0})==="test"}catch(e){console.debug("TextDecoder does not support streaming option. Using polyfill instead: "+e)}return!1};(K==null||ce==null||!xe())&&(K=le);var b=function(){};function L(e){this.withCredentials=!1,this.readyState=0,this.status=0,this.statusText="",this.responseText="",this.onprogress=b,this.onload=b,this.onerror=b,this.onreadystatechange=b,this._contentType="",this._xhr=e,this._sendTimeout=0,this._abort=b}L.prototype.open=function(e,r){this._abort(!0);var n=this,t=this._xhr,o=1,a=0;this._abort=function(i){n._sendTimeout!==0&&(M(n._sendTimeout),n._sendTimeout=0),(o===1||o===2||o===3)&&(o=4,t.onload=b,t.onerror=b,t.onabort=b,t.onprogress=b,t.onreadystatechange=b,t.abort(),a!==0&&(M(a),a=0),i||(n.readyState=4,n.onabort(null),n.onreadystatechange())),o=0};var s=function(){if(o===1){var i=0,l="",A=void 0;if("contentType"in t)i=200,l="OK",A=t.contentType;else try{i=t.status,l=t.statusText,A=t.getResponseHeader("Content-Type")}catch{i=0,l="",A=void 0}i!==0&&(o=2,n.readyState=2,n.status=i,n.statusText=l,n._contentType=A,n.onreadystatechange())}},c=function(){if(s(),o===2||o===3){o=3;var i="";try{i=t.responseText}catch{}n.readyState=3,n.responseText=i,n.onprogress()}},f=function(i,l){if((l==null||l.preventDefault==null)&&(l={preventDefault:b}),c(),o===1||o===2||o===3){if(o=4,a!==0&&(M(a),a=0),n.readyState=4,i==="load")n.onload(l);else if(i==="error")n.onerror(l);else if(i==="abort")n.onabort(l);else throw new TypeError;n.onreadystatechange()}},d=function(i){t!=null&&(t.readyState===4?(!("onload"in t)||!("onerror"in t)||!("onabort"in t))&&f(t.responseText===""?"error":"load",i):t.readyState===3?"onprogress"in t||c():t.readyState===2&&s())},u=function(){a=O(function(){u()},500),t.readyState===3&&c()};"onload"in t&&(t.onload=function(i){f("load",i)}),"onerror"in t&&(t.onerror=function(i){f("error",i)}),"onabort"in t&&(t.onabort=function(i){f("abort",i)}),"onprogress"in t&&(t.onprogress=c),"onreadystatechange"in t&&(t.onreadystatechange=function(i){d(i)}),("contentType"in t||!("ontimeout"in w.prototype))&&(r+=(r.indexOf("?")===-1?"?":"&")+"padding=true"),t.open(e,r,!0),"readyState"in t&&(a=O(function(){u()},0))},L.prototype.abort=function(){this._abort(!1)},L.prototype.getResponseHeader=function(e){return this._contentType},L.prototype.setRequestHeader=function(e,r){var n=this._xhr;"setRequestHeader"in n&&n.setRequestHeader(e,r)},L.prototype.getAllResponseHeaders=function(){return this._xhr.getAllResponseHeaders!=null&&this._xhr.getAllResponseHeaders()||""},L.prototype.send=function(){if((!("ontimeout"in w.prototype)||!("sendAsBinary"in w.prototype)&&!("mozAnon"in w.prototype))&&N!=null&&N.readyState!=null&&N.readyState!=="complete"){var e=this;e._sendTimeout=O(function(){e._sendTimeout=0,e.send()},4);return}var r=this._xhr;"withCredentials"in r&&(r.withCredentials=this.withCredentials);try{r.send(void 0)}catch(n){throw n}};function ve(e){return e.replace(/[A-Z]/g,function(r){return String.fromCharCode(r.charCodeAt(0)+32)})}function he(e){for(var r=Object.create(null),n=e.split(`\r
`),t=0;t<n.length;t+=1){var o=n[t],a=o.split(": "),s=a.shift(),c=a.join(": ");r[ve(s)]=c}this._map=r}he.prototype.get=function(e){return this._map[ve(e)]},w!=null&&w.HEADERS_RECEIVED==null&&(w.HEADERS_RECEIVED=2);function pe(){}pe.prototype.open=function(e,r,n,t,o,a,s){e.open("GET",o);var c=0;e.onprogress=function(){var d=e.responseText,u=d.slice(c);c+=u.length,n(u)},e.onerror=function(d){d.preventDefault(),t(new Error("NetworkError"))},e.onload=function(){t(null)},e.onabort=function(){t(null)},e.onreadystatechange=function(){if(e.readyState===w.HEADERS_RECEIVED){var d=e.status,u=e.statusText,i=e.getResponseHeader("Content-Type"),l=e.getAllResponseHeaders();r(d,u,i,new he(l))}},e.withCredentials=a;for(var f in s)Object.prototype.hasOwnProperty.call(s,f)&&e.setRequestHeader(f,s[f]);return e.send(),e};function ye(e){this._headers=e}ye.prototype.get=function(e){return this._headers.get(e)};function ge(){}ge.prototype.open=function(e,r,n,t,o,a,s){var c=null,f=new Y,d=f.signal,u=new K;return Q(o,{headers:s,credentials:a?"include":"same-origin",signal:d,cache:"no-store"}).then(function(i){return c=i.body.getReader(),r(i.status,i.statusText,i.headers.get("Content-Type"),new ye(i.headers)),new Re(function(l,A){var W=function(){c.read().then(function(T){if(T.done)l(void 0);else{var y=u.decode(T.value,{stream:!0});n(y),W()}}).catch(function(T){A(T)})};W()})}).catch(function(i){if(i.name!=="AbortError")return i}).then(function(i){t(i)}),{abort:function(){c!=null&&c.cancel(),f.abort()}}};function G(){this._listeners=Object.create(null)}function Ee(e){O(function(){throw e},0)}G.prototype.dispatchEvent=function(e){e.target=this;var r=this._listeners[e.type];if(r!=null)for(var n=r.length,t=0;t<n;t+=1){var o=r[t];try{typeof o.handleEvent=="function"?o.handleEvent(e):o.call(this,e)}catch(a){Ee(a)}}},G.prototype.addEventListener=function(e,r){e=String(e);var n=this._listeners,t=n[e];t==null&&(t=[],n[e]=t);for(var o=!1,a=0;a<t.length;a+=1)t[a]===r&&(o=!0);o||t.push(r)},G.prototype.removeEventListener=function(e,r){e=String(e);var n=this._listeners,t=n[e];if(t!=null){for(var o=[],a=0;a<t.length;a+=1)t[a]!==r&&o.push(t[a]);o.length===0?delete n[e]:n[e]=o}};function P(e){this.type=e,this.target=void 0}function we(e,r){P.call(this,e),this.data=r.data,this.lastEventId=r.lastEventId}we.prototype=Object.create(P.prototype);function k(e,r){P.call(this,e),this.status=r.status,this.statusText=r.statusText,this.headers=r.headers}k.prototype=Object.create(P.prototype);function me(e,r){P.call(this,e),this.error=r.error}me.prototype=Object.create(P.prototype);var ee=-1,I=0,X=1,V=2,te=-1,H=0,re=1,Te=2,De=3,Fe=/^text\/event\-stream(;.*)?$/i,Oe=1e3,Ne=18e6,ne=function(e,r){var n=e==null?r:parseInt(e,10);return n!==n&&(n=r),ae(n)},ae=function(e){return Math.min(Math.max(e,Oe),Ne)},q=function(e,r,n){try{typeof r=="function"&&r.call(e,n)}catch(t){Ee(t)}};function _(e,r){G.call(this),r=r||{},this.onopen=void 0,this.onmessage=void 0,this.onerror=void 0,this.url=void 0,this.readyState=void 0,this.withCredentials=void 0,this.headers=void 0,this._close=void 0,Le(this,e,r)}function Ie(){return w!=null&&"withCredentials"in w.prototype||fe==null?new w:new fe}var He=Q!=null&&ue!=null&&"body"in ue.prototype;function Le(e,r,n){r=String(r);var t=!!n.withCredentials,o=n.lastEventIdQueryParameterName||"lastEventId",a=ae(1e3),s=ne(n.heartbeatTimeout,45e3),c="",f=a,d=!1,u=0,i=n.headers||{},l=n.Transport,A=He&&l==null?void 0:new L(l!=null?new l:Ie()),W=l!=null&&typeof l!="string"?new l:A==null?new ge:new pe,T=void 0,y=0,R=ee,U="",Z="",x="",J="",g=H,oe=0,j=0,je=function(h,v,C,S){if(R===I)if(h===200&&C!=null&&Fe.test(C)){R=X,d=Date.now(),f=a,e.readyState=X;var E=new k("open",{status:h,statusText:v,headers:S});e.dispatchEvent(E),q(e,e.onopen,E)}else{var p="";h!==200?(v&&(v=v.replace(/\s+/g," ")),p="EventSource's response has a status "+h+" "+v+" that is not 200. Aborting the connection."):p="EventSource's response has a Content-Type specifying an unsupported type: "+(C==null?"-":C.replace(/\s+/g," "))+". Aborting the connection.",ie();var E=new k("error",{status:h,statusText:v,headers:S});e.dispatchEvent(E),q(e,e.onerror,E),console.error(p)}},Me=function(h){if(R===X){for(var v=-1,C=0;C<h.length;C+=1){var S=h.charCodeAt(C);(S===10||S===13)&&(v=C)}var E=(v!==-1?J:"")+h.slice(0,v+1);J=(v===-1?J:"")+h.slice(v+1),h!==""&&(d=Date.now(),u+=h.length);for(var p=0;p<E.length;p+=1){var S=E.charCodeAt(p);if(g===te&&S===10)g=H;else if(g===te&&(g=H),S===13||S===10){if(g!==H){g===re&&(j=p+1);var D=E.slice(oe,j-1),F=E.slice(j+(j<p&&E.charCodeAt(j)===32?1:0),p);D==="data"?(U+=`
`,U+=F):D==="id"?Z=F:D==="event"?x=F:D==="retry"?(a=ne(F,a),f=a):D==="heartbeatTimeout"&&(s=ne(F,s),y!==0&&(M(y),y=O(function(){$()},s)))}if(g===H){if(U!==""){c=Z,x===""&&(x="message");var B=new we(x,{data:U.slice(1),lastEventId:Z});if(e.dispatchEvent(B),x==="open"?q(e,e.onopen,B):x==="message"?q(e,e.onmessage,B):x==="error"&&q(e,e.onerror,B),R===V)return}U="",x=""}g=S===13?te:H}else g===H&&(oe=p,g=re),g===re?S===58&&(j=p+1,g=Te):g===Te&&(g=De)}}},Se=function(h){if(R===X||R===I){R=ee,y!==0&&(M(y),y=0),y=O(function(){$()},f),f=ae(Math.min(a*16,f*2)),e.readyState=I;var v=new me("error",{error:h});e.dispatchEvent(v),q(e,e.onerror,v),h!=null&&console.error(h)}},ie=function(){R=V,T!=null&&(T.abort(),T=void 0),y!==0&&(M(y),y=0),e.readyState=V},$=function(){if(y=0,R!==ee){if(!d&&T!=null)Se(new Error("No activity within "+s+" milliseconds. "+(R===I?"No response received.":u+" chars received.")+" Reconnecting.")),T!=null&&(T.abort(),T=void 0);else{var h=Math.max((d||Date.now())+s-Date.now(),1);d=!1,y=O(function(){$()},h)}return}d=!1,u=0,y=O(function(){$()},s),R=I,U="",x="",Z=c,J="",oe=0,j=0,g=H;var v=r;if(r.slice(0,5)!=="data:"&&r.slice(0,5)!=="blob:"&&c!==""){var C=r.indexOf("?");v=C===-1?r:r.slice(0,C+1)+r.slice(C+1).replace(/(?:^|&)([^=&]*)(?:=[^&]*)?/g,function(F,B){return B===o?"":F}),v+=(r.indexOf("?")===-1?"?":"&")+o+"="+encodeURIComponent(c)}var S=e.withCredentials,E={};E.Accept="text/event-stream";var p=e.headers;if(p!=null)for(var D in p)Object.prototype.hasOwnProperty.call(p,D)&&(E[D]=p[D]);try{T=W.open(A,je,Me,Se,v,S,E)}catch(F){throw ie(),F}};e.url=r,e.readyState=I,e.withCredentials=t,e.headers=i,e._close=ie,$()}_.prototype=Object.create(G.prototype),_.prototype.CONNECTING=I,_.prototype.OPEN=X,_.prototype.CLOSED=V,_.prototype.close=function(){this._close()},_.CONNECTING=I,_.OPEN=X,_.CLOSED=V,_.prototype.withCredentials=void 0;var Ce=z;w!=null&&(z==null||!("withCredentials"in z.prototype))&&(Ce=_),function(e){{var r=e(_e);r!==void 0&&(be.exports=r)}}(function(e){e.EventSourcePolyfill=_,e.NativeEventSource=z,e.EventSource=Ce})})(typeof globalThis>"u"?typeof window<"u"?window:typeof self<"u"?self:Pe:globalThis)})(se,se.exports);var qe=se.exports,Ue=qe.EventSourcePolyfill;const Be=Xe(Ue),Ve=Object.freeze(Object.defineProperty({__proto__:null,default:Be},Symbol.toStringTag,{value:"Module"}));export{Ve as b};
