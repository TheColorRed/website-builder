"use strict";var builder;define("util/ajax",["require","exports"],function(e,t){async function a(...e){let t="",a={},n=1==e.length&&e[0]instanceof HTMLElement?e[0].method:2==e.length&&e[0]instanceof HTMLFormElement?e[0].method:2==e.length&&"string"==typeof e[0]?"get":3==e.length?e[2]:"get",i={method:n,headers:{"X-Requested-With":"XMLHttpRequest"}};if(1==e.length&&e[0]instanceof HTMLFormElement?(t=e[0].action,a=new FormData(e[0])):1==e.length&&"string"==typeof e[0]?(t=e[0],n="get"):2!=e.length&&3!=e.length||(t=e[0]instanceof HTMLFormElement?e[0].action:e[0],a=e[1]),"get"==n){if(a instanceof FormData){let e=Array.from(a.entries()).map(([e,t])=>encodeURIComponent(e)+"="+encodeURIComponent(t.toString())).join("&");e.length>0&&(t+="?"+e)}else if(a instanceof Object){let e=[];for(let t in a){let n=a[t];n&&e.push(encodeURIComponent(t)+"="+encodeURIComponent(n.toString()))}e.length>0&&(t+="?"+e.join("&"))}}else if(a instanceof FormData)i.body=a;else try{i.body=JSON.stringify(a)}catch(e){i.body=""}let r="",l=document.querySelector("meta[name=csrf]");l&&(r=l.content),r.length>0&&(i.headers["X-CSRF-Token"]=r);try{let e=await fetch(t,i),a=await e.text();try{return JSON.parse(a)}catch(e){return a}}catch(e){console.error(e.message)}return{}}Object.defineProperty(t,"__esModule",{value:!0}),t.toKeyValue=function(e){return Array.from(e).reduce((e,t)=>(e[t.name]=t.value||"",e),{})},t.send=a,t.submit=async function(e){let t="string"==typeof e?document.querySelector(e):e;if(t.reportValidity())return await a(t)}}),define("util/queryBuilder",["require","exports"],function(e,t){Object.defineProperty(t,"__esModule",{value:!0});class a{constructor(e=[]){this.params=e}static create(){return new a(a.parse(window.location.search))}static parse(e){return e.replace(/^\?/,"").split("&").map(e=>{let[t,a]=e.split("=",2);return{key:t,value:a}}).filter(e=>e.key.length>0)}update(){this.params=a.parse(window.location.search)}set(e,t){if(0==e.length)return;let a=this.params.find(t=>t.key==e);a?a.value=t:this.params.push({key:e,value:t})}get(e,t=""){let a=this.params.find(t=>t.key==e);return a?a.value:t}remove(...e){e.forEach(e=>{let t=this.params.findIndex(t=>t.key==e);t>-1&&this.params.splice(t,1)})}toString(){return 0==this.params.length?"":"?"+this.params.map(e=>e.key+"="+e.value).join("&")}}t.QueryBuilder=a,t.globalQuery=a.create()}),define("util/routes",["require","exports"],function(e,t){Object.defineProperty(t,"__esModule",{value:!0}),t.routes={data:[],get(e,t=""){let a=this.data.find(t=>t.name==e);return a&&a.path||t},is(e){let t=window.location.pathname;return!!this.data.find(a=>a.name==e&&a.path==t)},when(e,t="",a=""){let n=window.location.pathname;return this.data.find(t=>t.name==e&&t.path==n)?t:a}}}),define("util/elemental/Elemental",["require","exports","util/elemental/Element"],function(e,t,a){function n(e,t){let n;return n=e instanceof a.Element?e:new a.Element(e)}Object.defineProperty(t,"__esModule",{value:!0}),t.tag=n,t.$=function(e){return new i(e)};class i{constructor(e){this.items=[],e instanceof HTMLElement?this.items.push(e):Array.isArray(e)?this.items=e:"string"==typeof e&&(this.items=Array.from(document.querySelectorAll(e)))}dispatch(e){this.items.forEach(t=>e.split(" ").forEach(e=>t.dispatchEvent(new Event(e))))}broadcast(e){let t=[];t.push(...this.items),this.items.forEach(e=>t.push(...Array.from(e.querySelectorAll("*")))),(t=[...new Set(t)]).forEach(t=>e.split(" ").forEach(e=>t.dispatchEvent(new Event(e))))}count(){return this.items.length}find(e){let t=[];return this.items.forEach(a=>t.push(...Array.from(a.querySelectorAll(e)))),this.items=t,this}closest(e){let t,a=[];return this.items.forEach(n=>(t=n.closest(e))&&a.push(t)),this.items=a,this}remove(){return this.items.forEach(e=>e.remove()),this.items=[],this}toggleClass(e,t){let a=[];return a.push(...e.split(" ")),this.items.forEach(e=>a.forEach(a=>e.classList.toggle(a,t))),this}addClass(...e){let t=[];return e.forEach(e=>t.push(...e.split(" "))),this.items.forEach(e=>e.classList.add(...t)),this}removeClass(...e){let t=[];return e.forEach(e=>t.push(...e.split(" "))),this.items.forEach(e=>e.classList.remove(...t)),this}static join(...e){return a.Element.join(...e)}static forEach(e,t){return Array.isArray(e)?a.Element.each(e,t):new a.Element("")}static create(e,t){return n(e)}async ajax(...e){let t="",a={},n="get";n=4==e.length?e[2]:n;let i=e[e.length-1];2==e.length&&e[0]instanceof HTMLFormElement?(t=e[0].action,a=new FormData(e[0])):2==e.length&&"string"==typeof e[0]?t=e[0]:3!=e.length&&4!=e.length||(t=e[0]instanceof HTMLFormElement?e[0].action:e[0],a=e[1]);let r={method:n,headers:{"X-Requested-With":"XMLHttpRequest"}};if("get"==n){if(a instanceof FormData){let e=Array.from(a.entries()).map(([e,t])=>encodeURIComponent(e)+"="+encodeURIComponent(t.toString())).join("&");e.length>0&&(t+="?"+e)}else if(a instanceof Object){let e=[];for(let t in a){let n=a[t];n&&e.push(encodeURIComponent(t)+"="+encodeURIComponent(n.toString()))}e.length>0&&(t+="?"+e.join("&"))}}else if(a instanceof FormData)r.body=a;else try{r.body=JSON.stringify(a)}catch(e){r.body=""}let l="",s=document.querySelector("meta[name=csrf]");s&&(l=s.content),l.length>0&&(r.headers["X-CSRF-Token"]=l);let o={};try{let e=await fetch(t,r),a=await e.text();try{o=JSON.parse(a)}catch(e){o=a}}catch(e){console.error(e.message)}this.items.forEach(e=>null!==i&&i(o).render(e))}}}),define("util/elemental/Element",["require","exports","util/elemental/Elemental"],function(e,t,a){Object.defineProperty(t,"__esModule",{value:!0}),t.createElement=function(e,t,...i){let r=[];if(t)for(let e in t)r.push(`[${e}="${t[e]}"]`);let l=e+r.join("")+" "+i.map(e=>"string"==typeof e?e:" ").join("").trim(),s=i.map(e=>e instanceof n?e:null).filter(e=>e instanceof n),o=n.join(...s);return a.tag({tag:l,children:o})};class n{constructor(e){this.el=e}get rootElement(){return this._rootElement}broadcast(e){this._renderedTo instanceof HTMLElement&&a.$(this._renderedTo).broadcast(e)}dispatch(e){this._renderedTo instanceof HTMLElement&&a.$(this._renderedTo).dispatch(e)}render(e){let t=this.setRoot(e);return t?(t.innerHTML="",t.appendChild(this.rootElement),this._renderedTo=t,Array.from(t.querySelectorAll("*")).forEach(e=>e.dispatchEvent(new Event("loaded"))),this):this}append(e){let t=this.setRoot(e);return t?(t.appendChild(this.rootElement),this._renderedTo=t,Array.from(t.querySelectorAll("*")).forEach(e=>e.dispatchEvent(new Event("loaded"))),this):this.el}setRoot(e){let t=document.body;return e&&"string"==typeof e?t=document.querySelector(e):e instanceof n?t=e.rootElement:e&&e instanceof HTMLElement&&(t=e),this.el instanceof HTMLElement||this.el instanceof DocumentFragment?this._rootElement=this.el:this._rootElement=this.makeElement(this.el,t),t}compile(){if(this.el instanceof HTMLElement||this.el instanceof DocumentFragment)return this.el;let e=document.createDocumentFragment();return this._rootElement=this.makeElement(this.el,e),this._rootElement}toString(){if(this.rootElement instanceof HTMLElement)return this.rootElement.innerHTML;if(this.rootElement instanceof DocumentFragment){let e=document.createElement("div");for(let t of this.rootElement.children)e.appendChild(t);return e.innerHTML}return""}static each(e,t){let a=document.createDocumentFragment();for(let n=0;n<e.length;n++){let i=t(e[n],n,e);i.el instanceof HTMLElement||i.el instanceof DocumentFragment?a.appendChild(i.el):a.appendChild(i.makeElement(i.el,a))}return new n(a)}static join(...e){let t=document.createDocumentFragment();for(let a of e)a.el instanceof HTMLElement||a.el instanceof DocumentFragment?t.appendChild(a.el):t.appendChild(a.makeElement(a.el,t));return new n(t)}makeElement(e,t){if(e instanceof HTMLElement||e instanceof DocumentFragment)return t.appendChild(e),e;if(e instanceof n){let a=this.makeElement(e.el,t);return t.appendChild(a),e.el instanceof HTMLElement||e.el instanceof DocumentFragment?e.el:a}if(Array.isArray(e)){let t=document.createDocumentFragment();return e.forEach(e=>this.makeElement(e,t)),t}if("string"!=typeof e){let t=!0;if("function"==typeof e.render?t=e.render():"boolean"==typeof e.render&&(t=e.render),!1===t)return document.createDocumentFragment()}let a="string"==typeof e?e:e.tag?e.tag:"$frag";if(a instanceof n)return this.makeElement(a,t);if("string"==typeof a){let n=a.replace(/\s*\>(?![^[]*])\s*/g,">");if(n.includes(">")){let i=t;return n.split(/\s*\>(?![^[]*])\s*/).forEach(n=>{t=this.makeElement(n,t),a=n,"string"!=typeof e&&e.tag&&(e.tag=n)}),"string"!=typeof e&&e.children&&(Array.isArray(e.children)&&e.children.forEach(e=>{this.makeElement(e,t)}),e&&"object"==typeof e.children&&this.makeElement(e.children,t)),"string"!=typeof e&&t instanceof HTMLElement&&this.addEvents(e,t),"string"!=typeof e&&t instanceof HTMLElement&&this.addChildEvents(e,t),"string"!=typeof e&&t instanceof HTMLElement&&this.addSelectorEvents(e,t),i.firstChild}}let i=this.parseQuerySelector(a),r=i.fragment?document.createDocumentFragment():document.createElement(i.element);if(r instanceof HTMLElement&&(i.id.length>0&&(r.id=i.id),i.classList.length>0&&r.classList.add(...i.classList),i.attributes.forEach(e=>e.key?r instanceof HTMLElement&&r.setAttribute(e.key,e.value):r instanceof HTMLElement&&r.setAttribute(e.value,e.value)),i.properties.forEach(e=>r instanceof HTMLElement&&r.setAttribute(e,e))),t&&t.appendChild(r),"string"==typeof e)i.text.length>0&&this.makeText(i.text,r);else{let t=e.txt&&e.txt.length>0?e.txt:i.text.length>0?i.text:"";t.length>0&&this.makeText(t,r),e&&Array.isArray(e.children)?e.children.forEach(e=>{this.makeElement(e,r)}):e&&["object","string"].includes(typeof e.children)&&this.makeElement(e.children,r)}return void 0!==e&&"string"!=typeof e&&(r instanceof HTMLElement&&this.addEvents(e,r),r instanceof HTMLElement&&this.addChildEvents(e,r),r instanceof HTMLElement&&this.addSelectorEvents(e,r)),r.dispatchEvent(new Event("rendered")),r}makeText(e,t){let a=e;e=e.replace(/\#\{(.+?)\}/g,(e,t)=>this.makeElement(t,document.createDocumentFragment()).outerHTML),t instanceof HTMLElement&&a!=e?t.innerHTML=e:t.appendChild(document.createTextNode(e))}addEvents(...e){let t=2==e.length?e[0]:null,a=1==e.length?e[0]:e[1];if(t&&t.events){for(let e in t.events){let n=t.events[e];if(["function","string"].includes(typeof n)){if("function"==typeof n)a.addEventListener(e,n.bind(a));else if("string"==typeof n){let t=n.split(".").reduce((e,t)=>e&&e[t]?e[t]:null,window);t&&a.addEventListener(e,t.bind(a))}"visibility"==e&&new IntersectionObserver(t=>{for(let a of t)a.target.dispatchEvent(new Event(e))}).observe(a)}}a.dispatchEvent(new Event("created"))}}addSelectorEvents(...e){let t=2==e.length?e[0]:null,a=1==e.length?e[0]:e[1];if(t&&t.events&&t.events.$selector)for(let e in t.events.$selector){let n=t.events.$selector[e];Array.from(a.querySelectorAll(n.selector)).forEach(t=>{t.addEventListener(e,n.event)})}}addChildEvents(...e){let t=2==e.length?e[0]:null,a=1==e.length?e[0]:e[1];if(t&&t.events&&t.events.$children){let e=Array.from(a.children);for(let a in t.events.$children){let n=t.events.$children[a];["function","string"].includes(typeof n)&&e.forEach(e=>{if("function"==typeof n)e.addEventListener(a,n.bind(e));else if("string"==typeof n){let t=n.split(".").reduce((e,t)=>e&&e[t]?e[t]:null,window);t&&e.addEventListener(a,t.bind(e))}})}e.forEach(e=>e.dispatchEvent(new Event("rendered")))}}parseQuerySelector(e){let t={classList:[],id:"",element:"div",fragment:!1,attributes:[],properties:[],text:""},a=e.replace(/\s*\>(?![^[]*])\s*/g,">").replace(/\s+(?![^[]*]).+/,"").trim();return t.text=(e.match(/\s+(?![^[]*]).+/)||[""])[0].trim(),t.id=(a.match(/#[\w-_]+(?![^[]*])/)||[""])[0].replace("#",""),t.classList=(a.match(/\.[\w-_]+(?![^[]*])/g)||[]).map(e=>e.replace(".","")),t.element=a.toLowerCase().split(/[^a-z0-9]/,2)[0]||"div",(a.startsWith("$frag")||a.startsWith("$fragment"))&&(t.fragment=!0),t.attributes=(a.match(/\[.+?\]/g)||[]).reduce((e,t)=>{let a=t.split("="),n=a.shift(),i=a.join("=");return n=n||"",i=i||"",e.concat({key:n.replace(/^\[|\]$/g,""),value:i.replace(/\]$/g,"").replace(/^('|")/,"").replace(/('|")$/,"")})},[]),t.properties=(a.match(/:\w+(?![^[]*])/g)||[]).reduce((e,t)=>e.concat(t.replace(/^:/,"")),[]),t}}t.Element=n}),HTMLElement.prototype.addEventListeners=function(e,t,a){e.split(" ").filter(String).forEach(e=>this.addEventListener(e,t,a))},requirejs(["util/queryBuilder"],function(e){!function(t){let a=t.pushState;t.pushState=function(){a.apply(t,arguments),e.globalQuery.update(),window.dispatchEvent(new Event("pushstate"))}}(window.history),requirejs(["admin/init"])}),define("admin/templates/admin/media",["require","exports","admin/components/media","util/ajax","admin/templates/helper","util/queryBuilder","util/elemental/Elemental","util/elemental/Element","util/routes"],function(e,t,a,n,i,r,l,s,o){function d(e){e.preventDefault();let t=this.getAttribute("data-path");a.openDirectory(t||"")}function c(){let e=r.globalQuery.get("path"),t=r.globalQuery.get("file"),a=!!e,n=!!t;return l.tag({tag:"ul.breadcrumbs",events:{$selector:{click:{selector:"li > a",event:d}}},children:[{render:!a&&!n,tag:"li>strong media"},s.Element.each((n?t:e).split("/").filter(String),(e,t,a)=>t<a.length-1&&a.length>1||n?n&&t==a.length-1?l.tag([`li>strong ${e}`]):l.tag([`li>a[href=""][data-path="/${a.slice(0,t+1).join("/")}"] ${e}`]):l.tag([`li>strong ${e}`]))]})}function f(e){return l.tag([{render:e.length>0,tag:"p.fluid.row.text-bold",children:["span.col-1.text-center Actions","span.col-1.text-center Info","span.col-2 Date Uploaded","span.col-2 File Size"]},s.Element.each(e,(e,t)=>l.tag({tag:`p.fluid.row[data-id=${e._id}]`,children:[{tag:"span.col-1.text-center",children:{tag:"span.margin-right-5",children:[{tag:"a[title=\"Move to trash\"][href=''].trash-delete.red-text",children:"i.fa-lg.fa-fw.far.fa-trash-alt"},{tag:"span.spinner.hidden",children:"i.fa-lg.fa-fw.fas.fa-spin.fa-sync"}]}},{tag:"span.col-1.text-center",children:{render:0==t,tag:"span.label.label-info current"}},`span.col-2 ${new Date(e.uploadDate).toLocaleString("en-US")}`,`span.col-2[title=${String(e.length).replace(/\B(?=(\d{3})+(?!\d))/g,",")} Bytes] ${i.bytesToSize(e.length)}`]}))])}Object.defineProperty(t,"__esModule",{value:!0}),t.makeFilter=function(){let e=-1;return l.tag({children:[{tag:".fluid.row",children:[{tag:".col.media-query-filter",children:[{tag:'input[type="text"][placeholder="Search"]',events:{input(t){t.preventDefault(),clearTimeout(e),e=setTimeout(a.updateStateAndApplyFilter,300)},loaded(){let e=(window.location.search.replace(/^\?/,"").split("&").find(e=>e.startsWith("query="))||"").match(/(.+?)=(.+)/);this.value=(e&&e[2]?e[2]:"").trim(),a.updateStateAndApplyFilter()}}},"i.fas.fa-search.fa-3x"]}]},{tag:".fluid.row",events:{$children:{click(e){e.preventDefault(),l.$(this).toggleClass("active"),a.updateStateAndApplyFilter()}}},children:['a[href=""][data-type="image"].col.media-filter.image-filter Images','a[href=""][data-type="video"].col.media-filter.video-filter Videos','a[href=""][data-type="audio"].col.media-filter.audio-filter Audio','a[href=""][data-type="font"].col.media-filter.compress-filter Fonts','a[href=""][data-type="application"].col.media-filter.other-filter Apps']}]})},t.makeBreadCrumbs=c,t.makeDirectoryListing=function(e){return l.tag([{tag:"p.fluid.row.text-bold",render:e.length>0,children:["span.col-1.text-center Actions","span.col-3 Folder"]},s.Element.each(e,e=>l.tag({tag:`p.fluid.row[data-directory=${e.directory}]`,children:[{tag:"span.col-1.text-center",children:{tag:"span.margin-horizontal-5",children:[{tag:'a[title="Move to trash"][href=""].trash-delete.red-text',events:{async click(e){e.preventDefault();let t=this.closest("p.row");if(t){let e=t.getAttribute("data-directory");l.$(this).addClass("hidden").closest(".row").broadcast("spin"),await n.send(o.routes.get("api-admin-delete-media"),{directory:e},"post"),l.$(this).closest(".row").remove()}}},children:"i.fa-lg.fa-fw.far.fa-trash-alt"},{tag:"span.spinner.hidden",events:{spin(){l.$(this).removeClass("hidden")}},children:"i.fa-lg.fa-fw.fas.fa-spin.fa-sync"}]}},{tag:"span.col-3.overflow-ellipsis",events:{$children:{click(e){e.preventDefault();let t=this.getAttribute("data-path")||"";a.openDirectory(t)}}},children:`a.directory-item[href='?path=${e.directory}'][data-path='${e.directory}'][title='${e.nextDirectory}'] ${e.nextDirectory}`}]}))])},t.makeFileListing=function(e){return l.tag({children:[{tag:"p.fluid.row.text-bold",children:["span.col-1.text-center Actions","span.col-3 Filename","span.col-2 Number of Files","span.col-2 Size of Files"]},{tag:"p.fluid.row",children:{tag:"span.col-12.filter-count",events:{loaded:()=>l.$(".filter-count").dispatch("update"),update(){let e=l.$(".media-file.hidden").count();e>0?(this.parentElement&&this.parentElement.classList.remove("hidden"),this.textContent=1==e?`${e} file has`:`${e} files have`,this.textContent+=" been hidden with this filter"):this.parentElement&&this.parentElement.classList.add("hidden")}}}},s.Element.each(e,e=>l.tag({tag:`p.fluid.row.media-file.middle[data-filename='${e.filename}'][data-file='${e.file}'][data-type='${e.metadata.type}']`,events:{visibility:()=>l.$(".filter-count").dispatch("update")},children:[{tag:"span.col-1.text-center",children:[{tag:"span",children:{tag:'a[title="Move to trash"][href=""].trash-delete.red-text.margin-horizontal-5',events:{async click(e){e.preventDefault();let t=this.closest("p.row");if(t){let e=t.getAttribute("data-filename");l.$(this).addClass("hidden").closest(".row").broadcast("spin hide"),await n.send(o.routes.get("api-admin-delete-media"),{file:e},"post"),l.$(this).closest(".row").remove()}}},children:"i.fa-lg.fa-fw.far.fa-trash-alt"}},{tag:"span.spinner.hidden.margin-horizontal-5",events:{spin(){l.$(this).removeClass("hidden")}},children:"i.fa-lg.fa-fw.fas.fa-spin.fa-sync"},{tag:"span.preview",events:{hide(){l.$(this).addClass("hidden")}},children:{tag:`a[href=${e.filename}][target="_blank"].margin-horizontal-5`,children:"i.fa-lg.fa-fw.far.fa-eye"}}]},{tag:'span.col-3.overflow-ellipsis.middle[style="height: 32px"]',events:{$children:{click(t){t.preventDefault(),l.$("#media-listings").ajax(o.routes.get("api-admin-media-file"),{file:e.filename},t=>(r.globalQuery.set("file",e.filename),a.updateState(),l.tag([c(),f(t)])))}}},children:{tag:`a.middle.inline-flex[href='${o.routes.get("api-admin-media-file")}?file=${e.filename}'][title='${e.filename}']`,children:[{tag:'span.margin-right-5.center[style="width: 32px"]',children:{render:"image"==e.metadata.type,tag:`img[src="${e.filename}?h=32"][style="max-width: 32px"]`}},{tag:"span",txt:e.file}]}},`span.col-2 ${e.files}`,`span.col-2 ${i.bytesToSize(e.size)}`]}))]})},t.makeFileDetails=f}),define("admin/components/media",["require","exports","admin/templates/helper","admin/templates/admin/media","util/queryBuilder","util/routes","util/elemental/Element","util/elemental/Elemental"],function(e,t,a,n,i,r,l,s){async function o(e){e&&s.$("#media-listings").ajax(r.routes.get("api-admin-media-files"),{path:e},"get",t=>(i.globalQuery.remove("file"),c(e),l.Element.join(n.makeBreadCrumbs(),n.makeDirectoryListing(t.directories),n.makeFileListing(t.files))))}Object.defineProperty(t,"__esModule",{value:!0}),t.load=function(){!i.globalQuery.get("path").match(/^\/media/)&&i.globalQuery.set("path","/media"),a.loadPage("media"),n.makeFilter().render("#media-filters")},window.addEventListener("popstate",async e=>{e.preventDefault(),o(i.globalQuery.get("path"))}),t.openDirectory=o;let d=!1;function c(e){if(d)return;d=!0;let t=u(),a=m(),n=e||(i.globalQuery.get("path")||"");n.length>0&&i.globalQuery.set("path",n),a.length>0&&i.globalQuery.set("query",a),t.length>0&&i.globalQuery.set("types",t.join(",")),history.pushState({},"",i.globalQuery.toString()),d=!1}function f(){let e=u(),t=m();Array.from(document.querySelectorAll(".media-file")).forEach(a=>{let n=a.getAttribute("data-type")||"",i=a.getAttribute("data-file")||"";e.includes(n)&&i.includes(t)||i.includes(t)&&0==e.length||e.includes(n)&&0==t.length?a.classList.remove("hidden"):a.classList.add("hidden")})}function m(){let e=document.querySelector(".media-query-filter input");return e?e.value:""}function u(){return Array.from(document.querySelectorAll(".media-filter")).map(e=>e.classList.contains("active")?e.getAttribute("data-type"):"").filter(String)}t.updateState=c,t.updateStateAndApplyFilter=function(){c(),f()},t.applyFilter=f,t.getPath=function(){let e=(window.location.search.replace(/^\?/,"").split("&").find(e=>e.startsWith("path="))||"").match(/(.+?)=(.+)/);return e&&e[2]?e[2]:""}}),define("admin/templates/admin/pages",["require","exports","util/elemental/Elemental","util/elemental/Element"],function(e,t,a,n){Object.defineProperty(t,"__esModule",{value:!0}),t.makePage=function(e){return a.tag({tag:".well",children:[{tag:"p.fluid.row.text-bold",children:["span.col-1.text-center Actions","span.col-2 Title","span.col-2 path","span.col-2 Created","span.col-2 Updated"]},n.Element.each(e,e=>a.tag({tag:`p.fluid.row[data-page=${e.path}]`,children:[{tag:"span.col-1.text-center",children:[{tag:"a[href=''][title='Edit'].margin-horizontal-5",children:"i.fa-lg.fa-fw.far.fa-edit"},{tag:`a[href='${e.path}'][title='Preview'][target='_blank'].margin-horizontal-5`,children:"i.fa-lg.fa-fw.far.fa-eye"},{tag:"a[href=''][title='Move to trash'].margin-horizontal-5.red-text",children:"i.fa-lg.fa-fw.far.fa-trash-alt",events:{async click(e){e.preventDefault(),a.$(this).closest(".row").broadcast("spinnerTrash hideTrash")},hideTrash(){a.$(this).addClass("hidden")}}},{tag:"span.spinner.margin-horizontal-5.hidden",children:"i.fa-lg.fa-fw.fas.fa-spin.fa-sync",events:{spinnerTrash(){a.$(this).removeClass("hidden")}}}]},`span.col-2 ${e.title}`,`span.col-2 ${e.path}`,`span.col-2 ${new Date(e.createDate).toLocaleString("en-US")}`,`span.col-2 ${new Date(e.updateDate).toLocaleString("en-US")}`]}))]})}}),define("admin/templates/admin/home",["require","exports","util/elemental/Elemental"],function(e,t,a){Object.defineProperty(t,"__esModule",{value:!0}),t.makeHome=function(){return a.tag([".well>h1 Welcome"])}}),define("admin/templates/admin/trash",["require","exports","util/routes","util/ajax","util/elemental/Elemental","admin/templates/helper","util/elemental/Element"],function(e,t,a,n,i,r,l){async function s(e){e.preventDefault();let t=e.currentTarget,i=t.closest("[data-id]"),r=null;if(i&&(r=i.querySelector(".spinner")),i){let e=i.getAttribute("data-id");if(e&&e.length>0){r&&r.classList.remove("hidden"),t.classList.add("hidden");let l=t.classList.contains("trash-delete")?a.routes.get("api-admin-delete-media"):a.routes.get("api-admin-restore-media");await n.send(l,{id:e},"post"),i.remove()}}}Object.defineProperty(t,"__esModule",{value:!0}),t.makeTrash=function(e){return i.tag([{tag:".well",events:{$selector:{click:{selector:".trash-restore",event:s}}},children:[{render:e.length>0,tag:"p.row.text-bold",children:["span.col-1.text-center Actions","span.col-3 Filename","span.col-2 Date Uploaded","span.col-2 Date Deleted","span.col-2 File Size"]},{render:0==e.length,tag:"div The trash is empty!"},l.Element.each(e,e=>i.tag({tag:`p.row[data-id="${e.restore_id}"]`,children:[{tag:"span.col-1.text-center",children:[{tag:"span",children:['a[title="Purge from trash"][href=""].trash-purge.light-blue-text.margin-horizontal-5>i.fa-lg.fa-fw.far.fa-times-circle.red-text',"span.spinner.hidden.margin-horizontal-5>i.fa-lg.fa-fw.fas.fa-spin.fa-sync"]},{tag:"span",children:['a[title="Restore from trash"][href=""].trash-restore.light-blue-text.margin-horizontal-5>i.fa-lg.fa-fw.fas.fa-undo-alt',"span.spinner.hidden.margin-horizontal-5>i.fa-lg.fa-fw.fas.fa-spin.fa-sync"]}]},"span.col-3.overflow-ellipsis "+e.data.filename,"span.col-2 "+new Date(e.data.uploadDate).toLocaleString("en-US"),"span.col-2 "+new Date(e.deleteDate).toLocaleString("en-US"),`span.col-2>span[title="${String(e.data.length).replace(/\B(?=(\d{3})+(?!\d))/g,",")} Bytes"] `+r.bytesToSize(e.data.length)]}))]}])}}),define("admin/templates/helper",["require","exports","admin/templates/admin/media","admin/templates/admin/pages","admin/templates/admin/home","admin/templates/admin/trash","util/queryBuilder","util/routes","util/elemental/Element","util/elemental/Elemental"],function(e,t,a,n,i,r,l,s,o,d){Object.defineProperty(t,"__esModule",{value:!0}),t.loadPage=async function(e){switch(e){case"home":return i.makeHome().render("#primary-content"),!0;case"media":return l.globalQuery.get("file")?await d.$("#primary-content").ajax(s.routes.get("api-admin-media-file"),{file:l.globalQuery.get("file")},e=>o.Element.join(a.makeFilter(),d.tag({tag:".well#media-listings",children:[a.makeBreadCrumbs(),a.makeFileDetails(e)]}))):await d.$("#primary-content").ajax(s.routes.get("api-admin-media-files"),{path:l.globalQuery.get("path")},e=>o.Element.join(a.makeFilter(),d.tag({tag:".well#media-listings",children:[a.makeBreadCrumbs(),a.makeDirectoryListing(e.directories),a.makeFileListing(e.files)]}))),!0;case"pages":return await d.$("#primary-content").ajax(s.routes.get("api-admin-pages"),e=>n.makePage(e)),!0;case"trash":return await d.$("#primary-content").ajax(s.routes.get("api-admin-trash"),e=>r.makeTrash(e)),!0}return!1},t.bytesToSize=function(e){return e/1024/1024/1024/1024/1024>1?(e/1024/1024/1024/1024/1024).toFixed(2)+" PB":e/1024/1024/1024/1024>1?(e/1024/1024/1024/1024).toFixed(2)+" TB":e/1024/1024/1024>1?(e/1024/1024/1024).toFixed(2)+" GB":e/1024/1024>1?(e/1024/1024).toFixed(2)+" MB":e/1024>1?(e/1024).toFixed(2)+" KB":e+" Bytes"}}),define("admin/templates/admin/nav",["require","exports","admin/templates/helper","util/elemental/Elemental"],function(e,t,a,n){async function i(e){e.preventDefault();let t=e.currentTarget;await a.loadPage(t.getAttribute("data-tpl")||"")&&(window.history.pushState({},"",t.href||"/"),n.$(t).closest("ul").find("li").removeClass("active"),n.$(t).closest("li").addClass("active"))}Object.defineProperty(t,"__esModule",{value:!0}),t.mainNav=function(e){return n.tag({tag:"nav.main>ul",events:{$selector:{click:{selector:"li > a",event:i}}},children:[`li[class="${e.when("admin-home","active")}"]>a[href="${e.get("admin-home")}"][data-tpl="home"] #{i.fa-lg.fas.fa-fw.fa-home} Home`,`li[class="${e.when("admin-pages","active")}"]>a[href="${e.get("admin-pages")}"][data-tpl="pages"] #{i.fa-lg.fas.fa-fw.fa-columns} Pages`,{tag:`li[class="${e.when("admin-media","active")}"]>a[href="${e.get("admin-media")}"][data-tpl="media"]`,events:{$children:{click:i}},children:[{tag:"span.fa-layers.fa-fw.fa-lg",children:['i.fas.fa-music[data-fa-transform="down-3 right-3"]','i.fas.fa-camera[data-fa-transform="up-3 left-3"]']},"span Media"]},`li[class="${e.when("admin-themes","active")}"]>a[href="${e.get("admin-themes")}"]\n        #{i.fa-lg.fas.fa-fw.fa-palette} Themes`,`li[class="${e.when("admin-components","active")}"]>a[href="${e.get("admin-components")}"] #{i.fa-lg.fas.fa-fw.fa-puzzle-piece} Components`,`li[class="${e.when("admin-plugins","active")}"]>a[href="${e.get("admin-plugins")}"] #{i.fa-lg.fas.fa-fw.fa-plug} Plugins`,`li[class="${e.when("admin-comments","active")}"]>a[href="${e.get("admin-comments")}"] #{i.fa-lg.fas.fa-fw.fa-comments} Comments`,`li[class="${e.when("admin-tools","active")}"]>a[href="${e.get("admin-tools")}"] #{i.fa-lg.fas.fa-fw.fa-wrench} Tools`,`li[class="${e.when("admin-settings","active")}"]>a[href="${e.get("admin-settings")}"] #{i.fa-lg.fas.fa-fw.fa-cog} Settings`,`li[class="${e.when("admin-trash","active")}"]>a[href="${e.get("admin-trash")}"][data-tpl="trash"] #{i.fa-lg.fas.fa-fw.fa-trash-alt} Trash`,`li[class="${e.when("admin-logout","active")}"]>a[href="${e.get("admin-logout")}"] #{i.fa-lg.fas.fa-fw.fa-power-off} Logout`]})}}),define("admin/init",["require","exports","util/ajax","admin/templates/admin/nav","util/routes"],function(e,t,a,n,i){Object.defineProperty(t,"__esModule",{value:!0}),Array.from(document.querySelectorAll("form.ajax")).forEach(e=>{e.addEventListener("submit",async function(e){e.preventDefault();let t=await a.submit(this);if(this.hasAttribute("callback")){let e=this.getAttribute("callback");builder[e](t)}})}),a.send("/admin/api/routes/list").then(e=>{i.routes.data=e,console.log(e),n.mainNav(i.routes).render("#main-nav");let t=document.querySelector("[data-app]");if(t){let e=t.getAttribute("data-app");e&&requirejs([`admin/components/${e}`],function(e){e&&e.load&&e.load()})}})}),define("admin/components/home",["require","exports","admin/templates/helper"],function(e,t,a){Object.defineProperty(t,"__esModule",{value:!0}),t.load=function(){a.loadPage("home")}}),define("admin/components/install",["require","exports","util/ajax"],function(e,t,a){function n(e){return e.replace(/[^\w\s]+/g,"").replace(/\s/g,"-").replace(/-$/g,"").toLowerCase()}function i(e){let t=e.checkValidity();e.classList.toggle("required",!t)}Object.defineProperty(t,"__esModule",{value:!0});let r=document.querySelector("#install");r&&r.addEventListener("click",async e=>{e.preventDefault();let t=await a.submit(r.closest("form"));t.error?alert(t.message):window.location.href=REDIRECT_TO});let l=document.querySelector("#test-connection");l&&l.addEventListener("click",async e=>{let t=document.querySelectorAll("input[name^=db-]"),n=await a.send(TEST_CONN,a.toKeyValue(t),"post");n.error?alert(n.message):alert("Connection successful")});let s=document.querySelector("[name=website-title]"),o=document.querySelector("[name=db-database]");s&&o&&(o.value=n(s.value),s.addEventListener("input",function(){o.classList.contains("sync")&&(o.value=n(s.value))}),o.addEventListener("input",function(){o.classList.remove("sync")}));let d=document.querySelector(".re-sync");if(d&&d.addEventListener("click",e=>{e.preventDefault(),o&&o.classList.add("sync"),o&&s&&(o.value=n(s.value)),i(o)}),r){let e=r.closest("form");e&&Array.from(e.querySelectorAll("text,password,email,number".replace(/\w+/g,"input[type=$&]"))).forEach(e=>{i(e),e.addEventListener("input",function(){this.required&&i(e)})})}}),function(e){e.adminLogin=function(e){e.error||(window.location.href=e.location)}}(builder||(builder={})),define("admin/components/pages",["require","exports","admin/templates/helper"],function(e,t,a){Object.defineProperty(t,"__esModule",{value:!0}),t.load=function(){a.loadPage("pages")}}),builder||(builder={}),Array.from(document.querySelectorAll(".toggle-password")).forEach(e=>{let t=e.querySelector(".toggle"),a=e.querySelector("input[type=password]");t.addEventListener("click",e=>e.preventDefault()),a instanceof HTMLInputElement&&"password"==a.type&&t.addEventListener("click",()=>{a.type="password"==a.type?"text":"password";let e=t.querySelector("i");e&&(e.classList.toggle("fa-eye-slash","text"==a.type),e.classList.toggle("fa-eye","password"==a.type))})}),define("admin/components/trash",["require","exports","admin/templates/helper"],function(e,t,a){Object.defineProperty(t,"__esModule",{value:!0}),t.load=function(){a.loadPage("trash")}}),define("admin/components/upload",["require","exports","util/ajax"],function(e,t,a){Object.defineProperty(t,"__esModule",{value:!0}),Array.from(document.querySelectorAll(".upload-drag-drop")).forEach(e=>{e.addEventListeners("drag dragstart dragend dragover dragenter dragleave drop",function(e){e.preventDefault(),e.stopPropagation()}),e.addEventListeners("dragover dragenter",function(){this.classList.add("is-dragover")}),e.addEventListeners("dragleave dragend drop",function(){this.classList.remove("is-dragover")}),e.addEventListeners("drop",function(t){Array.from(t.dataTransfer.files).forEach(t=>{let n=new FileReader;n.addEventListener("load",async function(n){let i="";if("string"==typeof this.result&&"image"==(i=((this.result.match(/^data:(.+);/)||["",""])[1].split("/")||["",""])[0].trim())){let n=new Image;n.src=this.result;let i=document.querySelector(".upload-preview .preview");i.innerHTML="",i&&i.appendChild(n);let r=new FormData;r.set("path",document.querySelector("input[name=path]").value),r.set("file",t,t.name),await a.send(e,r)}}),n.readAsDataURL(t)})}),e.addEventListener("progress",e=>console.log(e.loaded,e.total));let t=e.querySelector("input[type=file]");if(t){let n=document.querySelector(".upload-preview .preview"),i=Array.from(document.querySelectorAll(".upload-preview .preview-info"));t.addEventListener("change",function(r){t.files instanceof FileList&&Array.from(t.files).forEach(async r=>{let l=new FileReader;l.addEventListener("loadend",async function(e){let t=new Blob([this.result]),a=new Image;a.src=window.URL.createObjectURL(t),n&&(i.forEach(e=>e.classList.add("hidden")),n.classList.remove("hidden"),n.appendChild(a))}),l.readAsArrayBuffer(r);let s=new FormData;s.set("path",document.querySelector("input[name=path]").value),s.set(t.name,r,r.name),await a.send(e,s)})})}})}),define("admin/templates/admin/upload",["require","exports","util/elemental/Elemental","util/routes"],function(e,t,a,n){Object.defineProperty(t,"__esModule",{value:!0}),t.makeUpload=function(){return a.tag({tag:".fluid.well",children:[{tag:`form.upload-drag-drop.ajax[action="${n.routes.get("api-admin-upload-media")}"][method="post"][enctype="multipart/form-data"]`,children:{tag:".fluid.row > .col-8.col-2-offset > .row.cell-no-margin",children:[".col-2.middle.text-right.gray /media",'.col-10: input[type="text"][name="path"][value="/"]']}},{tag:"label.file-group.row.margin-bottom-15",children:['input([ype="file"][name="file"][id="file"]:multiple',{tag:".row > .col-12",children:{tag:".upload-preview.center.vertical",children:["div.preview-info.margin-bottom-20 > i.fas.fa-cloud-upload-alt.fa-10x",'div.preview-info[style="font-size:2rem;"] #{strong Choose a file} or drag it here',"div.preview.hidden"]}}]}]})}});