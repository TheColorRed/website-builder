"use strict";var builder,Tagger;function tag(e,t){let n;return n=e instanceof Tagger.Element?e:new Tagger.Element(e)}function $(e){return new Tag(e)}!function(e){async function t(...e){let t="",n={},r=1==e.length?e[0].method:2==e.length?e[0].method:3==e.length?e[2]:"get",a={method:r,headers:{"X-Requested-With":"XMLHttpRequest"}};if(1==e.length?(t=e[0].action,n=new FormData(e[0])):2!=e.length&&3!=e.length||(t=e[0]instanceof HTMLFormElement?e[0].action:e[0],n=e[1]),"get"==r){if(n instanceof FormData){let e=Array.from(n.entries()).map(([e,t])=>encodeURIComponent(e)+"="+encodeURIComponent(t.toString())).join("&");e.length>0&&(t+="?"+e)}else if(n instanceof Object){let e=[];for(let t in n){let r=n[t];r&&e.push(encodeURIComponent(t)+"="+encodeURIComponent(r.toString()))}e.length>0&&(t+="?"+e.join("&"))}}else if(n instanceof FormData)a.body=n;else try{a.body=JSON.stringify(n)}catch(e){a.body=""}let i="",l=document.querySelector("meta[name=csrf]");l&&(i=l.content),i.length>0&&(a.headers["X-CSRF-Token"]=i);try{let e=await fetch(t,a),n=await e.text();try{return JSON.parse(n)}catch(e){return n}}catch(e){console.error(e.message)}return{}}async function n(e){let n="string"==typeof e?document.querySelector(e):e;if(n.reportValidity())return await t(n)}e.toKeyValue=function(e){return Array.from(e).reduce((e,t)=>(e[t.name]=t.value||"",e),{})},e.send=t,e.submit=n,Array.from(document.querySelectorAll("form.ajax")).forEach(t=>{t.addEventListener("submit",async function(t){t.preventDefault();let r=await n(this);if(this.hasAttribute("callback")){let t=this.getAttribute("callback");e[t](r)}})})}(builder||(builder={})),builder||(builder={}),Array.from(document.querySelectorAll(".toggle-password")).forEach(e=>{let t=e.querySelector(".toggle"),n=e.querySelector("input[type=password]");t.addEventListener("click",e=>e.preventDefault()),n instanceof HTMLInputElement&&"password"==n.type&&t.addEventListener("click",()=>{n.type="password"==n.type?"text":"password";let e=t.querySelector("i");e&&(e.classList.toggle("fa-eye-slash","text"==n.type),e.classList.toggle("fa-eye","password"==n.type))})}),function(e){function t(e){return e.replace(/[^\w\s]+/g,"").replace(/\s/g,"-").replace(/-$/g,"").toLowerCase()}function n(e){let t=e.checkValidity();e.classList.toggle("required",!t)}let r=document.querySelector("#install");r&&r.addEventListener("click",async t=>{t.preventDefault();let n=await e.submit(r.closest("form"));n.error?alert(n.message):window.location.href=REDIRECT_TO});let a=document.querySelector("#test-connection");a&&a.addEventListener("click",async t=>{let n=document.querySelectorAll("input[name^=db-]"),r=await e.send(TEST_CONN,e.toKeyValue(n),"post");r.error?alert(r.message):alert("Connection successful")});let i=document.querySelector("[name=website-title]"),l=document.querySelector("[name=db-database]");i&&l&&(l.value=t(i.value),i.addEventListener("input",function(){l.classList.contains("sync")&&(l.value=t(i.value))}),l.addEventListener("input",function(){l.classList.remove("sync")}));let s=document.querySelector(".re-sync");if(s&&s.addEventListener("click",e=>{e.preventDefault(),l&&l.classList.add("sync"),l&&i&&(l.value=t(i.value)),n(l)}),r){let e=r.closest("form");e&&Array.from(e.querySelectorAll("text,password,email,number".replace(/\w+/g,"input[type=$&]"))).forEach(e=>{n(e),e.addEventListener("input",function(){this.required&&n(e)})})}}(builder||(builder={})),function(e){e.adminLogin=function(e){e.error||(window.location.href=e.location)}}(builder||(builder={})),function(e){let t=document.getElementById("data-listings");if(t){let i=Array.from(document.querySelectorAll(".media-filter")),l=document.querySelector(".media-query-filter input");async function n(t){let n="";t instanceof HTMLElement?n=t.getAttribute("data-path")||"":"string"==typeof t&&(n=t);let a=await e.send(FILES_URL,{path:n},"get");history.pushState({},"",n?"?path="+n:""),r(a)}function r(e){t.innerHTML="";let r=[];var i,l;e.directories.length>0&&(r.push(tag({tag:"p.fluid.row.text-bold",children:["span.col-1.text-center Actions","span.col-3 Folder"]})),r.push((i=e.directories,Tag.each(i,e=>tag({tag:"p.fluid.row[data-directory=`${i.directory}`]",children:[{tag:"span.col-1.text-center",children:{tag:"span.margin-right-5",children:[{tag:'a[title="Move to trash"][href=""].trash-delete.red-text',children:"i.fa-lg.fa-fw.far.fa-trash-alt"},{tag:"span.spinner.hidden",children:"i.fa-lg.fa-fw.fas.fa-spin.fa-sync"}]}},{tag:"span.col-3.overflow-ellipsis",events:{children:{click(e){e.preventDefault(),n(this)}}},children:`a.directory-item[href='?path=${e.directory}'][data-path='${e.directory}'][title='${e.nextDirectory}'] ${e.nextDirectory}`}]}))))),e.files.length>0&&(r.push(tag({tag:"$frag",children:[{tag:"p.fluid.row.text-bold",children:["span.col-1.text-center Actions","span.col-3 Filename","span.col-2 Number of Files","span.col-2 Size of Files"]}]})),r.push((l=e.files,tag({tag:"$frag",children:[{tag:"p.fluid.row",children:{tag:"span.col-12.filter-count",events:{loaded:()=>$(".filter-count").dispatch("update"),update(){a();let e=$(".media-file.hidden").count();e>0?(this.parentElement&&this.parentElement.classList.remove("hidden"),this.textContent=1==e?`${e} file has`:`${e} files have`,this.textContent+=" been hidden with this filter"):this.parentElement&&this.parentElement.classList.add("hidden")}}}},Tag.each(l,e=>tag({tag:`p.fluid.row.media-file[data-filename='${e.filename}'][data-file='${e.file}'][data-type='${e.metadata.type}']`,events:{visibility:()=>$(".filter-count").dispatch("update")},children:[{tag:"span.col-1.text-center",children:[{tag:"span.margin-right-5",children:{tag:'a[title="Move to trash"][href=""].trash-delete.red-text',children:"i.fa-lg.fa-fw.far.fa-trash-alt"}},{tag:"span",children:{tag:'a[href=`${i.filename}`][target="_blank"]',children:"i.fa-lg.fa-fw.far.fa-eye"}}]},{tag:"span.col-3.overflow-ellipsis",children:`a[href='${FILE_URL}?file=${e.filename}'][title='${e.filename}'] ${e.file}`},`span.col-2 ${e.files}`,`span.col-2 ${function(e){return e/1024/1024/1024/1024/1024>1?(e/1024/1024/1024/1024/1024).toFixed(2)+" PB":e/1024/1024/1024/1024>1?(e/1024/1024/1024/1024).toFixed(2)+" TB":e/1024/1024/1024>1?(e/1024/1024/1024).toFixed(2)+" GB":e/1024/1024>1?(e/1024/1024).toFixed(2)+" MB":e/1024>1?(e/1024).toFixed(2)+" KB":e+" Bytes"}(e.size)}`]}))]})))),Tag.join(...r).render(t)}function a(){let e=i.map(e=>e.classList.contains("active")?e.getAttribute("data-type"):"").filter(String),n=l?l.value:"";Array.from(t.querySelectorAll(".media-file")).forEach(t=>{let r=t.getAttribute("data-type")||"",a=t.getAttribute("data-file")||"";e.includes(r)&&a.includes(n)||a.includes(n)&&0==e.length||e.includes(r)&&0==n.length?t.classList.remove("hidden"):t.classList.add("hidden")})}new MutationObserver(e=>{for(let t of e)t.addedNodes.forEach(e=>{let t=e;t instanceof HTMLElement&&Array.from(t.querySelectorAll(".directory-item")).forEach(e=>{e.addEventListener("click",async function(e){e.preventDefault(),await n(this)})})})}).observe(t,{childList:!0,subtree:!0}),n(((window.location.search.replace(/^\?/,"").split("&").find(e=>e.startsWith("path="))||"").split("=")||[""]).pop()),l&&l.addEventListener("input",e=>{e.preventDefault(),a()}),i.forEach(e=>{e.addEventListener("click",function(e){e.preventDefault(),this.classList.toggle("active"),a()})}),window.addEventListener("popstate",async t=>{t.preventDefault();let n=window.location.search.replace(/^\?/,"").split("&").find(e=>e.startsWith("path="));n&&(n=n.split("=").pop()),r(await e.send(FILES_URL,{path:n},"get"))})}}(builder||(builder={})),function(e){Array.from(document.querySelectorAll(".trash-delete, .trash-restore")).forEach(t=>{let n,r=t.closest("[data-id]");r&&(n=r.querySelector(".spinner")),t.addEventListener("click",async function(t){if(t.preventDefault(),r){n&&n.classList.remove("hidden"),this.classList.add("hidden");let t=r.getAttribute("data-id");if(t&&t.length>0){let n=this.classList.contains("trash-delete")?TRASH_URL:TRASH_RESTORE_URL;await e.send(n,{id:t},"post"),r.remove()}}})})}(builder||(builder={})),HTMLElement.prototype.addEventListeners=function(...e){e[0].split(" ").filter(e=>e.trim().length>0).forEach(t=>{this.addEventListener(t,e[1],e[2])})},function(e){Array.from(document.querySelectorAll(".upload-drag-drop")).forEach(t=>{t.addEventListeners("drag dragstart dragend dragover dragenter dragleave drop",function(e){e.preventDefault(),e.stopPropagation()}),t.addEventListeners("dragover dragenter",function(){this.classList.add("is-dragover")}),t.addEventListeners("dragleave dragend drop",function(){this.classList.remove("is-dragover")}),t.addEventListeners("drop",function(n){Array.from(n.dataTransfer.files).forEach(n=>{let r=new FileReader;r.addEventListener("load",async function(r){let a="";if("string"==typeof this.result&&"image"==(a=((this.result.match(/^data:(.+);/)||["",""])[1].split("/")||["",""])[0].trim())){let r=new Image;r.src=this.result;let a=document.querySelector(".upload-preview .preview");a.innerHTML="",a&&a.appendChild(r);let i=new FormData;i.set("path",document.querySelector("input[name=path]").value),i.set("file",n,n.name),await e.send(t,i)}}),r.readAsDataURL(n)})}),t.addEventListener("progress",e=>console.log(e.loaded,e.total));let n=t.querySelector("input[type=file]");if(n){let r=document.querySelector(".upload-preview .preview"),a=Array.from(document.querySelectorAll(".upload-preview .preview-info"));n.addEventListener("change",function(i){n.files instanceof FileList&&Array.from(n.files).forEach(async i=>{let l=new FileReader;l.addEventListener("loadend",async function(e){let t=new Blob([this.result]),n=new Image;n.src=window.URL.createObjectURL(t),r&&(a.forEach(e=>e.classList.add("hidden")),r.classList.remove("hidden"),r.appendChild(n))}),l.readAsArrayBuffer(i);let s=new FormData;s.set("path",document.querySelector("input[name=path]").value),s.set(n.name,i,i.name),await e.send(t,s)})})}})}(builder||(builder={})),function(e){class t{constructor(e){this.el=e}get rootElement(){return this._rootElement}render(e){let n=document.body;return e&&"string"==typeof e?n=document.querySelector(e):e instanceof t?n=e.rootElement:e&&e instanceof HTMLElement&&(n=e),n?(this.el instanceof HTMLElement||this.el instanceof DocumentFragment?this._rootElement=this.el:this._rootElement=this.makeElement(this.el,n),n.appendChild(this._rootElement),this._rootElement=n,Array.from(n.querySelectorAll("*")).forEach(e=>e.dispatchEvent(new Event("loaded"))),this):this}compile(){if(this.el instanceof HTMLElement||this.el instanceof DocumentFragment)return this.el;let e=document.createDocumentFragment();return this._rootElement=this.makeElement(this.el,e),this._rootElement}toString(){if(this.rootElement instanceof HTMLElement)return this.rootElement.innerHTML;if(this.rootElement instanceof DocumentFragment){let e=document.createElement("div");for(let t of this.rootElement.children)e.appendChild(t);return e.innerHTML}return""}static each(e,n){let r=document.createDocumentFragment();for(let t=0;t<e.length;t++){let a=n(e[t],t,e);a.el instanceof HTMLElement||a.el instanceof DocumentFragment?r.appendChild(a.el):r.appendChild(a.makeElement(a.el,r))}return new t(r)}static join(...e){let n=document.createDocumentFragment();for(let t of e)t.el instanceof HTMLElement||t.el instanceof DocumentFragment?n.appendChild(t.el):n.appendChild(t.makeElement(t.el,n));return new t(n)}makeElement(e,n){if(e instanceof HTMLElement||e instanceof DocumentFragment)return n.appendChild(e),e;if(e instanceof t){let t=this.makeElement(e.el,n);return n.appendChild(t),e.el instanceof HTMLElement||e.el instanceof DocumentFragment?e.el:t}let r=this.parseQuerySelector("string"==typeof e?e:e.tag||""),a=r.fragment?document.createDocumentFragment():document.createElement(r.element);if(a instanceof HTMLElement&&(r.id.length>0&&(a.id=r.id),r.classList.length>0&&a.classList.add(...r.classList),r.attributes.forEach(e=>e.key?a instanceof HTMLElement&&a.setAttribute(e.key,e.value):a instanceof HTMLElement&&a.setAttribute(e.value,e.value)),r.properties.forEach(e=>a instanceof HTMLElement&&a.setAttribute(e,e))),n.appendChild(a),"string"==typeof e)r.text.length>0&&a.appendChild(document.createTextNode(r.text));else{let t=e.txt&&e.txt.length>0?e.txt:r.text.length>0?r.text:"";t.length>0&&a.appendChild(document.createTextNode(t)),a instanceof HTMLElement&&this.addEvents(e,a),e&&Array.isArray(e.children)?e.children.forEach(e=>{this.makeElement(e,a)}):e&&["object","string"].includes(typeof e.children)&&this.makeElement(e.children,a),a instanceof HTMLElement&&this.addChildEvents(e,a)}return a.dispatchEvent(new Event("rendered")),a}addEvents(e,t){if(e.events){for(let n in e.events){let r=e.events[n];"function"==typeof r&&(t.addEventListener(n,r.bind(t)),"visibility"==n&&new IntersectionObserver(e=>{for(let t of e)t.target.dispatchEvent(new Event(n))}).observe(t))}t.dispatchEvent(new Event("created"))}}addChildEvents(e,t){if(e.events&&e.events.children){let n=Array.from(t.children);for(let t in e.events.children){let r=e.events.children[t];n.forEach(e=>e.addEventListener(t,r.bind(e)))}n.forEach(e=>e.dispatchEvent(new Event("rendered")))}}parseQuerySelector(e){let t={classList:[],id:"",element:"div",fragment:!1,attributes:[],properties:[],text:""};return t.id=(e.match(/#\w+(?![^[]*])/)||[""])[0].replace("#",""),t.classList=(e.match(/\.[\w-_]+(?![^[]*])/g)||[]).map(e=>e.replace(".","")),t.element=e.toLowerCase().split(/[^a-z0-9]/,2)[0]||"div",(e.startsWith("$frag")||e.startsWith("$fragment"))&&(t.fragment=!0),t.attributes=(e.match(/\[.+?\]/g)||[]).reduce((e,t)=>{let n=t.split("="),r=n.shift(),a=n.join("=");return r=r||"",a=a||"",e.concat({key:r.replace(/^\[|\]$/g,""),value:a.replace(/\]$/g,"").replace(/^('|")/,"").replace(/('|")$/,"")})},[]),t.properties=(e.match(/:\w+(?![^[]*])/g)||[]).reduce((e,t)=>e.concat(t.replace(/^:/,"")),[]),t.text=(e.match(/\s+(?![^[]*]).+/g)||[""])[0].trim(),t}}e.Element=t}(Tagger||(Tagger={}));class Tag{constructor(e){this.items=[],e instanceof HTMLElement?this.items.push(e):Array.isArray(e)?this.items=e:"string"==typeof e&&(this.items=Array.from(document.querySelectorAll(e)))}dispatch(e){this.items.forEach(t=>t.dispatchEvent(new Event(e)))}count(){return this.items.length}find(e){let t=[];return this.items.forEach(n=>t.push(...Array.from(n.querySelectorAll(e)))),this.items=t,this}closest(e){let t,n=[];return this.items.forEach(r=>(t=r.closest(e))&&n.push(t)),this.items=n,this}addClass(...e){let t=[];return e.forEach(e=>t.push(...e.split(" "))),this.items.forEach(e=>e.classList.add(...t)),this}removeClass(...e){let t=[];return e.forEach(e=>t.push(...e.split(" "))),this.items.forEach(e=>e.classList.remove(...t)),this}static join(...e){return Tagger.Element.join(...e)}static each(e,t){return Tagger.Element.each(e,t)}static create(e,t){return tag(e,t)}}