if (typeof window.CustomEvent !== 'function') { window.CustomEvent = function (event, params) { params = params || { bubbles: false, cancelable: false, detail: null }; var evt = document.createEvent('CustomEvent'); evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail); return evt; }; }
var docs = {};
docs.cache = true;
docs.sections = [];
docs.document = {
  title: "Documentation",
  separator: " | "
};
docs.file = {
  assets: "assets.html",
  load: "load.json",
  map: "map.json"
};
docs.event = {
  onSectionLoad: "DOCSSectionLoaded"
};
docs.label = {
  title: "data-title",
  tags: "data-tags",
  desc: "data-desc",
  index: "data-index",
  skip: "data-skip",
  source: "data-source",
  src: "data-src"
};
docs.param = {
  query: "query",
  section: "section"
};
docs.assets = {
  sources: [],
  nodes: [],
  awaiting: []
};
docs.ui = {
  minFontSize: 16,
  baseFontSize: "1vw",
  minScale: 0.5,
  baseScale: 1,
  maxScale: 2,
  scaleIncrement: 0.1
};
docs.ui.scale = docs.ui.baseScale;
docs.ui.node = {
  loading: document.querySelector(".loading"),
  main: document.querySelector(".main"),
  menuButton: document.querySelector(".menu-button"),
  home: document.querySelector(".home"),
  map: document.querySelector(".home .map"),
  mapList: document.querySelector(".home .map-list"),
  search: document.querySelector(".home .search"),
  searchResult: document.querySelector(".home .search-result"),
  content: document.querySelector(".content"),
  side: document.querySelector(".side"),
  sidebar: document.querySelector(".side .sidebar"),
  nav: document.querySelector(".nav"),
  overflow: document.querySelector(".nav .overflow"),
  overflowMenu: document.querySelector(".nav .overflow-menu"),
  menu: document.querySelector(".nav .menu"),
  zoom: document.querySelector(".zoom"),
  zoomBase: document.querySelector(".zoom .zoom-base")
};
docs.setFontsize = function () {
  document.body.style.fontSize = docs.ui.baseFontSize;
  var computed = parseFloat(window.getComputedStyle(document.body).getPropertyValue("font-size").replace("px", ""));
  if (computed < docs.ui.minFontSize) {
    document.body.style.fontSize = "calc(" + docs.ui.minFontSize + "px * " + docs.ui.scale + ")";
  } else {
    document.body.style.fontSize = "calc(" + docs.ui.baseFontSize + " * " + docs.ui.scale + ")";
  }
};
docs.zoomIn = function () {
  var computed = docs.ui.scale + docs.ui.scaleIncrement;
  if (parseInt(computed * 100) <= parseInt(docs.ui.maxScale * 100)) {
    docs.ui.scale = computed;
    docs.ui.node.zoomBase.innerText = parseInt(docs.ui.scale * 100) + "%";
    docs.processUi();
  }
};
docs.zoomOut = function () {
  var computed = docs.ui.scale - docs.ui.scaleIncrement;
  if (parseInt(computed * 100) >= parseInt(docs.ui.minScale * 100)) {
    docs.ui.scale = computed;
    docs.ui.node.zoomBase.innerText = parseInt(docs.ui.scale * 100) + "%";
    docs.processUi();
  }
};
docs.zoomBase = function () {
  if (docs.ui.scale != docs.ui.baseScale) {
    docs.ui.scale = docs.ui.baseScale;
    docs.ui.node.zoomBase.innerText = parseInt(docs.ui.scale * 100) + "%";
    docs.processUi();
  }
};
docs.getNodeWidth = function (node) {
  var result = parseFloat(window.getComputedStyle(node).getPropertyValue("width").replace("px", ""));
  if (isNaN(result)) { result = 0; }
  return result;
};
docs.getChildrenWidth = function (node) {
  var i, children = node.children, childrenLen = children.length, width = 0;
  for (i = 0; i < childrenLen; i++) {
    width = width + docs.getNodeWidth(children[i]);
  }
  return width;
};
docs.toggleSidebar = function () {
  docs.ui.node.side.classList.toggle("-show_large");
};
docs.setNavbar = function () {
  var menuWidth = docs.getNodeWidth(docs.ui.node.menu);
  var menuChildrenWidth = docs.getChildrenWidth(docs.ui.node.menu);
  if (menuChildrenWidth > menuWidth) {
    while (menuChildrenWidth > menuWidth && docs.ui.node.menu.children.length > 0) {
      docs.ui.node.overflowMenu.insertBefore(docs.ui.node.menu.children[docs.ui.node.menu.children.length - 1], docs.ui.node.overflowMenu.children[0]);
      menuChildrenWidth = docs.getChildrenWidth(docs.ui.node.menu);
    }
  } else {
    while (menuChildrenWidth <= menuWidth && docs.ui.node.overflowMenu.children.length > 0) {
      docs.ui.node.menu.appendChild(docs.ui.node.overflowMenu.children[0]);
      menuChildrenWidth = docs.getChildrenWidth(docs.ui.node.menu);
      if (menuChildrenWidth > menuWidth) {
        docs.ui.node.overflowMenu.insertBefore(docs.ui.node.menu.children[docs.ui.node.menu.children.length - 1], docs.ui.node.overflowMenu.children[0]);
      }
    }
  }
  if (docs.ui.node.overflowMenu.children.length > 0) {
    docs.ui.node.overflow.style.visibility = "visible";
  } else {
    docs.ui.node.overflow.style.visibility = "hidden";
  }
};
docs.processUi = function () {
  docs.setFontsize();
  docs.setNavbar();
};
docs.init = function () {
  docs.showLoading();
  docs.loadAssets();
  docs.loadAllSections(function () {
    document.title = docs.document.title;
    docs.buildMap(docs.ui.node.mapList, docs.sections);
    docs.buildSidebar(docs.ui.node.sidebar, docs.sections);
    docs.processUi();
    window.addEventListener("resize", docs.processUi);
    window.addEventListener("keydown", function (e) {
      if (e.key === 'Enter' && e.target.classList.contains("search-input")) {
        docs.clickSearch(e.target);
      }
    });
    docs.ui.node.side.querySelector(".search-button").addEventListener("click", function (e) {
      docs.clickSearch(e.currentTarget);
    });
    docs.ui.node.home.querySelector(".search-button").addEventListener("click", function (e) {
      docs.clickSearch(e.currentTarget);
    });
    window.addEventListener('popstate', function (e) {
      docs.paramAction(window.location.href);
    });
    docs.ui.node.zoomBase.innerText = parseInt(docs.ui.scale * 100) + "%";
    docs.paramAction(window.location.href);
    docs.hideLoading();
  });
};
docs.paramAction = function (url) {
  params = docs.getUrlParams(url);
  if (params[docs.param.query]) {
    docs.queryAction(params[docs.param.query]);
  } else if (params[docs.param.section]) {
    docs.sectionAction(params[docs.param.section]);
  } else {
    docs.mapAction();
  }
};
docs.buildMap = function (node, sections) {
  var i = 0, sectionsLen = sections.length, section, ol, li, item;
  ol = document.createElement("ol");
  while (i < sectionsLen) {
    section = sections[i];
    li = document.createElement("li");
    item = document.createElement("button");
    item.classList.add("map-item");
    item.innerText = section.title;
    item.setAttribute(docs.label.index, section.index);
    item.addEventListener("click", function (e) {
      docs.clickItem(e.currentTarget);
    });
    li.appendChild(item);
    docs.buildMap(li, section.sub);
    ol.appendChild(li);
    i++;
  }
  node.appendChild(ol);
};
docs.buildSidebar = function (node, sections) {
  var i = 0, sectionsLen = sections.length, section, group, item;
  while (i < sectionsLen) {
    section = sections[i];
    group = document.createElement("div");
    group.classList.add("side-group");
    item = document.createElement("button");
    item.classList.add("side-item");
    item.innerText = section.title;
    item.setAttribute(docs.label.index, section.index);
    item.addEventListener("click", function (e) {
      docs.clickItem(e.currentTarget);
    });
    group.appendChild(item);
    docs.buildSidebar(group, section.sub);
    node.appendChild(group);
    i++;
  }
};
docs.clickSearch = function (node) {
  if (node.hasAttribute(docs.label.index)) {
    var index, input, value;
    index = node.getAttribute(docs.label.index);
    input = document.querySelector(".search-input[" + docs.label.index + "='" + index + "']");
    value = input.value;
    input.value = "";
    docs.queryAction(value, true);
  }
};
docs.clickItem = function (node) {
  if (node.hasAttribute(docs.label.index)) {
    var index = node.getAttribute(docs.label.index);
    docs.sectionAction(index, true);
  }
};
docs.activateSideItem = function (index) {
  document.querySelector(".side .side-item[" + docs.label.index + "='" + index + "']").classList.add("active");
};
docs.mapAction = function (state) {
  if (state) {
    window.history.pushState({}, "", window.location.origin + window.location.pathname);
  }
  document.title = docs.document.title;
  docs.showMap();
};
docs.sectionAction = function (index, state) {
  docs.loadAndShowSection(index, function () {
    var param;
    if (state) {
      param = {};
      param[docs.param.section] = index;
      window.history.pushState(param, "", window.location.origin + window.location.pathname + "?" + docs.urlEncode(param));
    }
    document.title = docs.document.title + docs.document.separator + docs.getSection(index).title;
    docs.activateSideItem(index);
    document.dispatchEvent(new CustomEvent(docs.event.onSectionLoad, {
      detail: docs.getSection(index)
    }));
  });
};
docs.onSectionLoad = function (func, once) {
  var execute;
  if (once) {
    execute = function (e) {
      func(e.detail);
      document.removeEventListener(docs.event.onSectionLoad, execute);
    };
  } else {
    execute = function (e) {
      func(e.detail);
    };
  }
  document.addEventListener(docs.event.onSectionLoad, execute);
};
docs.queryAction = function (value, state) {
  if (value != "") {
    var i, param, query, queryLen, section, item, h4, h3, p;
    if (state) {
      param = {};
      param[docs.param.query] = value;
      window.history.pushState(param, "", window.location.origin + window.location.pathname + "?" + docs.urlEncode(param));
    }
    document.title = docs.document.title;
    docs.showLoading();
    query = docs.querySections(value);
    queryLen = query.length;
    docs.showSearch();
    docs.ui.node.searchResult.innerHTML = "";
    h4 = document.createElement("h4");
    h4.classList.add("-text-center");
    h4.innerText = '"' + value + '"';
    docs.ui.node.searchResult.appendChild(h4);
    i = 0;
    while (i < queryLen) {
      section = query[i];
      item = document.createElement("div");
      item.classList.add("search-item");
      item.setAttribute(docs.label.index, section.index);
      item.addEventListener("click", function (e) {
        docs.clickItem(e.currentTarget);
      });
      h3 = document.createElement("h3");
      h3.innerText = section.title;
      p = document.createElement("p");
      p.innerText = section.desc;
      item.appendChild(h3);
      item.appendChild(p);
      docs.ui.node.searchResult.appendChild(item);
      i++;
    }
    docs.hideLoading();
  }
};
docs.loadAllSections = function (callback) {
  docs.xhr(docs.file.assets, function (xhr) {
    if (xhr.status == 200) {
      docs.ui.node.content.insertAdjacentHTML("beforeend", xhr.responseText);
      docs.manageAssets();
    }
    docs.loadScriptsNS(function () {
      docs.xhr(docs.file.map, function (xhr) {
        var loadJSON, urls;
        if (xhr.status == 200) {
          loadJSON = JSON.parse(xhr.responseText);
          if (loadJSON.hasOwnProperty("document")) {
            docs.document.title = loadJSON.document;
          }
          if (loadJSON.hasOwnProperty("separator")) {
            docs.document.separator = loadJSON.separator;
          }
          docs.sections = loadJSON.sections;
          docs.addIndex(docs.sections, []);
          docs.hideAll();
          if (typeof callback === 'function') {
            callback();
          }
          docs.DOMLoad();
        } else {
          docs.xhr(docs.file.load, function (xhr) {
            if (xhr.status == 200) {
              loadJSON = JSON.parse(xhr.responseText);
              if (loadJSON.hasOwnProperty("document")) {
                docs.document.title = loadJSON.document;
              }
              if (loadJSON.hasOwnProperty("separator")) {
                docs.document.separator = loadJSON.separator;
              }
              urls = loadJSON.sections;
              docs.loadMultipleSections(urls, 0, function () {
                docs.manageAssets();
                docs.loadScriptsNS(function () {
                  docs.sections = docs.createSections(docs.ui.node.content);
                  docs.addIndex(docs.sections, []);
                  docs.hideAll();
                  if (typeof callback === 'function') {
                    callback();
                  }
                  docs.DOMLoad();
                });
              });
            }
          });
        }
      });
    });
  });
};
docs.loadMultipleSections = function (urls, index, callback) {
  var url, urlsLen = urls.length;
  if (index < urlsLen) {
    url = urls[index];
    docs.loadSections(url, docs.ui.node.content, { urls: urls, index: index, callback: callback }, function (e) {
      e.index++;
      docs.loadMultipleSections(e.urls, e.index, e.callback);
    });
  } else {
    if (typeof callback === 'function') {
      callback();
    }
  }
};
docs.loadSections = function (url, node, callbackObject, callback) {
  docs.xhr(url, function (xhr) {
    if (xhr.status == 200) {
      if (node === docs.ui.node.content) {
        node.insertAdjacentHTML("beforeend", xhr.responseText);
      } else {
        node.outerHTML = xhr.responseText;
      }
      var section, src;
      while (section = docs.ui.node.content.querySelector("section:not([" + docs.label.src + "]):not([" + docs.label.source + "])")) {
        section.setAttribute(docs.label.source, url);
      }
      section = docs.ui.node.content.querySelector("section[" + docs.label.src + "]");
      if (section) {
        src = section.getAttribute(docs.label.src);
        docs.loadSections(src, section, callbackObject, callback);
      } else {
        if (typeof callback === 'function') {
          callback(callbackObject);
        }
      }
    } else {
      if (typeof callback === 'function') {
        callback(callbackObject);
      }
    }
  });
};
docs.getSection = function (index) {
  var i, section = docs.sections, indexLen;
  index = index.split("."), indexLen = index.length;
  for (i = 0; i < indexLen; i++) {
    if (i == (indexLen - 1)) {
      section = section[index[i]];
    } else {
      section = section[index[i]].sub;
    }
  }
  return section;
};
docs.getSectionNode = function (title, desc, tags) {
  var i, nodes = docs.ui.node.content.querySelectorAll("section"), nodesLen = nodes.length, node, nodeTitle, nodeDesc, nodeTags;
  for (i = 0; i < nodesLen; i++) {
    node = nodes[i];
    nodeTitle = docs.getAttribute(node, docs.label.title).trim();
    nodeDesc = docs.getAttribute(node, docs.label.desc).trim();
    nodeTags = docs.getAttribute(node, docs.label.tags).trim();
    if (title == nodeTitle && desc == nodeDesc && tags == nodeTags) {
      return node;
    }
  }
};
docs.loadAndShowSection = function (index, callback) {
  var section = docs.getSection(index);
  if (section) {
    docs.showLoading();
    if (section.node == null) {
      docs.hideAll();
      docs.loadSections(section.source, docs.ui.node.content, {}, function () {
        docs.manageAssets();
        docs.loadScriptsNS(function () {
          docs.addNode(docs.sections, section.source);
          docs.hideAll();
          docs.showSection(section);
          docs.hideLoading();
          if (typeof callback === 'function') {
            callback();
          }
        });
      });
    } else {
      docs.showSection(section);
      docs.hideLoading();
      if (typeof callback === 'function') {
        callback();
      }
    }
  } else {
    docs.mapAction(true);
  }
};
docs.prepareExportMap = function (map, index, result) {
  var mapLen = map.length, val, obj;
  while (index < mapLen) {
    val = map[index];
    obj = {
      text: val["text"],
      title: val["title"],
      titleLC: val["titleLC"],
      desc: val["desc"],
      descLC: val["descLC"],
      tags: val["tags"],
      tagsLC: docs.shallowClone(val["tagsLC"]),
      source: val["source"],
      index: val["index"],
      sub: docs.prepareExportMap(val["sub"], 0, [])
    };
    result.push(obj);
    index++;
  }
  return result;
};
docs.exportMap = function () {
  docs.hideAll();
  docs.showLoading();
  docs.xhr(docs.file.load, function (xhr) {
    if (xhr.status == 200) {
      var loadJSON = JSON.parse(xhr.responseText), urls = loadJSON.sections, preparedMap, dataMap, node;
      docs.loadMultipleSections(urls, 0, function () {
        docs.manageAssets();
        docs.loadScriptsNS(function () {
          docs.sections = docs.createSections(docs.ui.node.content);
          docs.addIndex(docs.sections, []);
          docs.mapAction(true);
          docs.hideLoading();
          preparedMap = {
            document: docs.document.title,
            separator: docs.document.separator,
            sections: docs.prepareExportMap(docs.sections, 0, [])
          };
          dataMap = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(preparedMap));
          node = document.createElement('a');
          node.setAttribute("href", dataMap);
          node.setAttribute("download", docs.file.map);
          docs.ui.node.content.appendChild(node);
          node.click();
          node.parentNode.removeChild(node);
        });
      });
    }
  });
};
docs.createSections = function (node) {
  var i, section, sections = [], sectionClone, tagsLen, obj;
  while (section = node.querySelector("section:not([" + docs.label.skip + "])")) {
    obj = {};
    sectionClone = section.cloneNode(true);
    Array.prototype.slice.call(sectionClone.getElementsByTagName('section')).forEach(
      function (node) {
        node.parentNode.removeChild(node);
      });
    obj["text"] = sectionClone.innerText.trim().toLowerCase();
    obj["title"] = docs.getAttribute(section, docs.label.title).trim();
    obj["titleLC"] = obj["title"].toLowerCase();
    obj["desc"] = docs.getAttribute(section, docs.label.desc).trim();
    obj["descLC"] = obj["desc"].toLowerCase();
    obj["tags"] = docs.getAttribute(section, docs.label.tags).trim();
    obj["tagsLC"] = obj["tags"].toLowerCase().split(",");
    tagsLen = obj["tagsLC"].length;
    for (i = 0; i < tagsLen; i++) {
      obj["tagsLC"][i] = obj["tagsLC"][i].trim();
    }
    obj["source"] = docs.getAttribute(section, docs.label.source);
    obj["node"] = section.cloneNode(true);
    section.setAttribute(docs.label.skip, "");
    obj["sub"] = docs.createSections(section);
    sections.push(obj);
  }
  return sections;
};
docs.addNode = function (sections, source) {
  var i = 0, sectionsLen = sections.length, section;
  while (i < sectionsLen) {
    section = sections[i];
    if (section.source == source && section.node == null) {
      section.node = docs.getSectionNode(section.title, section.desc, section.tags).cloneNode(true);
    }
    docs.addNode(section["sub"], source);
    i++;
  }
};
docs.addIndex = function (sections, index) {
  var i = 0, sectionsLen = sections.length, section;
  index.push(i);
  while (i < sectionsLen) {
    section = sections[i];
    index.pop();
    index.push(i);
    section["index"] = index.join(".");
    docs.addIndex(section["sub"], docs.shallowClone(index));
    i++;
  }
};
docs.hideSide = function () {
  docs.ui.node.side.classList.add("-hide");
  docs.ui.node.main.classList.remove("-push-3_large");
  docs.ui.node.menuButton.classList.add("-hide");
};
docs.showSide = function () {
  docs.ui.node.side.classList.remove("-hide");
  docs.ui.node.main.classList.add("-push-3_large");
  docs.ui.node.menuButton.classList.remove("-hide");
};
docs.showMap = function () {
  docs.hideAll();
  docs.ui.node.content.appendChild(docs.ui.node.home);
  docs.ui.node.map.classList.remove("-hide");
  docs.ui.node.search.classList.add("-hide");
};
docs.showSearch = function () {
  docs.hideAll();
  docs.ui.node.content.appendChild(docs.ui.node.home);
  docs.ui.node.search.classList.remove("-hide");
  docs.ui.node.map.classList.add("-hide");
};
docs.showSection = function (section) {
  docs.hideAll();
  docs.showSide();
  docs.ui.node.content.appendChild(section.node.cloneNode(true));
};
docs.showLoading = function () {
  docs.ui.node.loading.classList.remove("-hide");
};
docs.hideLoading = function () {
  docs.ui.node.loading.classList.add("-hide");
};
docs.hideAll = function () {
  var active;
  while (active = document.querySelector(".side .side-item.active")) {
    active.classList.remove("active");
  }
  docs.hideSide();
  docs.ui.node.content.innerHTML = "";
};
docs.getAttribute = function (node, attr) {
  if (node.hasAttribute(attr)) {
    return node.getAttribute(attr);
  } else {
    return "";
  }
};
docs.indexOfArr = function (arr, str) {
  var i, arrLen = arr.length, result = -1;
  for (i = 0; i < arrLen; i++) {
    if (arr[i].indexOf(str) !== -1) {
      result = i;
      break;
    }
  }
  return result;
};
docs.querySections = function (query, sections, result) {
  var i = 0, section, sectionsLen, root = false;
  if (sections == null) {
    root = true;
    sections = docs.sections;
    query = query.trim().toLowerCase();
    if (query == "") {
      return false;
    }
    result = {
      title: [],
      tags: [],
      desc: [],
      text: []
    };
  }
  sectionsLen = sections.length;
  while (i < sectionsLen) {
    section = sections[i];
    if (section.titleLC.indexOf(query) !== -1) {
      result.title.push(section);
    } else if (docs.indexOfArr(section.tagsLC, query) !== -1) {
      result.tags.push(section);
    } else if (section.descLC.indexOf(query) !== -1) {
      result.desc.push(section);
    } else if (section.text.indexOf(query) !== -1) {
      result.text.push(section);
    }
    result = docs.querySections(query, section.sub, result);
    i++;
  }
  if (root) {
    return result.title.concat(result.tags).concat(result.desc).concat(result.text);
  } else {
    return result;
  }
};
docs.manageAssets = function (arg) {
  var i, elems, elemsLen, elem;
  if (arg == null) { arg = {}; }
  if (arg.style == null) { arg.style = 1; }
  if (arg.script == null) { arg.script = 1; }
  if (arg.head == null) { arg.head = 1; }
  if (arg.style == 2) {
    elemsLen = docs.assets.nodes.length;
    for (i = elemsLen - 1; i >= 0; i--) {
      elem = docs.assets.nodes[i];
      if (elem.tagName == "STYLE") {
        docs.assets.nodes.splice(i, 1);
        docs.assets.sources.splice(docs.assets.sources.indexOf(elem.innerText), 1);
        elem.parentNode.removeChild(elem);
      } else if (elem.tagName == "LINK" && elem.rel == "stylesheet") {
        docs.assets.nodes.splice(i, 1);
        docs.assets.sources.splice(docs.assets.sources.indexOf(elem.href), 1);
        elem.disabled = true;
        elem.parentNode.removeChild(elem);
      }
    }
  }
  if (arg.style == 0) {
    elems = docs.shallowClone(document.getElementsByTagName("style"));
    elemsLen = elems.length;
    for (i = 0; i < elemsLen; i++) {
      elem = elems[i];
      if (docs.assets.nodes.indexOf(elem) === -1) {
        elem.parentNode.removeChild(elem);
      }
    }
    elems = docs.shallowClone(document.querySelectorAll("link[rel=stylesheet]"));
    elemsLen = elems.length;
    for (i = 0; i < elemsLen; i++) {
      docs.assets.nodes.splice(i, 1);
      elem = elems[i];
      if (docs.assets.nodes.indexOf(elem) === -1) {
        elem.disabled = true;
        elem.parentNode.removeChild(elem);
      }
    }
  }
  if (arg.style == 1 || arg.style == 2) {
    elems = docs.shallowClone(document.getElementsByTagName("style"));
    elemsLen = elems.length;
    for (i = 0; i < elemsLen; i++) {
      elem = elems[i];
      if (docs.assets.nodes.indexOf(elem) === -1) {
        if (docs.assets.sources.indexOf(elem.innerText) !== -1) {
          elem.parentNode.removeChild(elem);
        } else {
          document.head.appendChild(elem);
          docs.assets.sources.push(elem.innerText);
          docs.assets.nodes.push(elem);
        }
      }
    }
    elems = docs.shallowClone(document.querySelectorAll("link[rel=stylesheet]"));
    elemsLen = elems.length;
    for (i = 0; i < elemsLen; i++) {
      elem = elems[i];
      if (docs.assets.nodes.indexOf(elem) === -1) {
        if (docs.assets.sources.indexOf(elem.href) !== -1) {
          elem.disabled = true;
          elem.parentNode.removeChild(elem);
        } else {
          document.head.appendChild(elem);
          elem.href = elem.href;
          docs.assets.sources.push(elem.href);
          docs.assets.nodes.push(elem);
        }
      }
    }
  }
  if (arg.script == 0) {
    elems = docs.shallowClone(document.getElementsByTagName("script"));
    elemsLen = elems.length;
    for (i = 0; i < elemsLen; i++) {
      elem = elems[i];
      if (docs.assets.nodes.indexOf(elem) === -1) {
        elem.parentNode.removeChild(elem);
      }
    }
  }
  if (arg.script == 1 || arg.script == 2) {
    elems = docs.shallowClone(document.getElementsByTagName("script"));
    elemsLen = elems.length;
    for (i = 0; i < elemsLen; i++) {
      elem = elems[i];
      if (docs.assets.nodes.indexOf(elem) === -1) {
        if (elem.src == "") {
          if (docs.assets.sources.indexOf(elem.innerText) !== -1) {
            if (arg.script == 2) {
              docs.assets.awaiting.push(elem);
            }
            elem.parentNode.removeChild(elem);
          } else {
            document.head.appendChild(elem);
            docs.assets.sources.push(elem.innerText);
            docs.assets.nodes.push(elem);
            docs.assets.awaiting.push(elem);
          }
        } else {
          if (docs.assets.sources.indexOf(elem.src) !== -1) {
            if (arg.script == 2) {
              docs.assets.awaiting.push(elem);
            }
            elem.parentNode.removeChild(elem);
          } else {
            document.head.appendChild(elem);
            docs.assets.sources.push(elem.src);
            docs.assets.nodes.push(elem);
            docs.assets.awaiting.push(elem);
          }
        }
      }
    }
  }
  if (arg.head == 2) {
    elemsLen = docs.assets.nodes.length;
    for (i = elemsLen - 1; i >= 0; i--) {
      elem = docs.assets.nodes[i];
      if ((elem.tagName == "LINK" && elem.rel != "stylesheet") || elem.tagName == "META" || elem.tagName == "TITLE" || elem.tagName == "BASE") {
        docs.assets.nodes.splice(i, 1);
        docs.assets.sources.splice(docs.assets.sources.indexOf(elem.outerHTML), 1);
        if (elem.tagName == "LINK") {
          elem.disabled = true;
        }
        elem.parentNode.removeChild(elem);
      }
    }
  }
  if (arg.head == 0) {
    elems = docs.shallowClone(document.querySelectorAll("link:not([rel=stylesheet])"));
    elems = elems.concat(docs.shallowClone(document.querySelectorAll("meta")));
    elems = elems.concat(docs.shallowClone(document.querySelectorAll("title")));
    elems = elems.concat(docs.shallowClone(document.querySelectorAll("base")));
    elemsLen = elems.length;
    for (i = 0; i < elemsLen; i++) {
      elem = elems[i];
      if (docs.assets.nodes.indexOf(elem) === -1) {
        if (elem.tagName == "LINK") {
          elem.disabled = true;
        }
        elem.parentNode.removeChild(elem);
      }
    }
  }
  if (arg.head == 1 || arg.head == 2) {
    elems = docs.shallowClone(document.querySelectorAll("link:not([rel=stylesheet])"));
    elems = elems.concat(docs.shallowClone(document.querySelectorAll("meta")));
    elems = elems.concat(docs.shallowClone(document.querySelectorAll("title")));
    elems = elems.concat(docs.shallowClone(document.querySelectorAll("base")));
    elemsLen = elems.length;
    for (i = 0; i < elemsLen; i++) {
      elem = elems[i];
      if (docs.assets.nodes.indexOf(elem) === -1) {
        if (docs.assets.sources.indexOf(elem.outerHTML) !== -1) {
          elem.parentNode.removeChild(elem);
        } else {
          document.head.appendChild(elem);
          if (elem.tagName == "LINK") {
            elem.href = elem.href;
          }
          docs.assets.sources.push(elem.outerHTML);
          docs.assets.nodes.push(elem);
        }
      }
    }
  }
};
docs.loadAssets = function () {
  load("meta");
  load("title");
  load("base");
  load("link");
  load("style");
  load("script");
  function load(name) {
    var i, tags = docs.shallowClone(document.getElementsByTagName(name)), tag, tagsLen = tags.length;
    for (i = 0; i < tagsLen; i++) {
      tag = tags[i];
      document.head.appendChild(tag);
      if (name == "link" && tag.rel == "stylesheet") {
        docs.assets.sources.push(tag.href);
      } else if (name == "script" && tag.src != "") {
        docs.assets.sources.push(tag.src);
      } else if (name == "style" || (name == "script" && tag.src == "")) {
        docs.assets.sources.push(tag.innerText);
      } else {
        docs.assets.sources.push(tag.outerHTML);
      }
      docs.assets.nodes.push(tag);
    }
  }
};
docs.loadScriptsNS = function (callback) {
  var nodes = docs.assets.awaiting;
  var len = nodes.length, node;
  if (len > 0) {
    node = nodes[0];
    if (node.src) {
      docs.getScript(node.src, function () {
        nodes.shift();
        docs.loadScriptsNS(callback);
      });
    } else {
      docs.DOMEval(node.text);
      nodes.shift();
      docs.loadScriptsNS(callback);
    }
  } else {
    docs.assets.awaiting = [];
    if (typeof callback === 'function') {
      setTimeout(function () {
        callback();
      }, 0);
    }
  }
};
docs.eval = function (str) {
  try { return eval(str); } catch (e) { }
};
docs.checkType = function (input) {
  var typeString = Object.prototype.toString.call(input);
  return typeString.slice(8, typeString.length - 1).toLowerCase();
};
docs.shallowClone = function (obj) {
  var type = docs.checkType(obj), clone, i, len;
  if (type === "array" || type === "htmlcollection" || type === "nodelist") {
    clone = [], len = obj.length, i = 0;
    while (i < len) {
      clone.push(obj[i]);
      i++;
    }
    return clone;
  } else if (type === "object") {
    clone = {};
    for (i in obj) {
      clone[i] = obj[i];
    }
    return clone;
  } else {
    return obj;
  }
};
docs.getUrlParams = function (url) {
  var i, result = {}, queryString, keyValuePairs, keyValuePair, paramName, paramValue;
  queryString = query_string(url);
  if (queryString) {
    keyValuePairs = queryString.split('&');
    for (i = 0; i < keyValuePairs.length; i++) {
      keyValuePair = keyValuePairs[i].split('=');
      paramName = keyValuePair[0];
      if (keyValuePair[1]) {
        paramValue = keyValuePair[1];
      } else {
        paramValue = '';
      }
      result[paramName] = decodeURIComponent(paramValue.replace(/\+/g, ' '));
    }
  }
  function query_string(url) {
    var reducedUrl, queryString;
    reducedUrl = url.split('#')[0];
    queryString = reducedUrl.split('?')[1];
    if (!queryString) {
      if (reducedUrl.search('=') !== false) {
        queryString = reducedUrl;
      }
    }
    return queryString;
  }
  return result;
};
docs.urlEncode = function (obj) {
  var key, result;
  if (typeof obj === 'object') {
    result = [];
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        result.push(key + '=' + encodeURIComponent(obj[key]));
      }
    }
    result = result.join('&');
  } else {
    result = obj;
  }
  return result;
};
docs.xhr = function (url, callback, arg) {
  if (arg == null) { arg = {}; }
  if (arg.cache == null) { arg.cache = docs.cache; }
  if (arg.method == null) { arg.method = 'GET'; }
  if (arg.data == null) { arg.data = ''; }
  if (arg.async == null) { arg.async = true; }
  var xhr, guid, cacheUrl, hashUrl, key, mergedObj, urlObj;
  arg.method = arg.method.toUpperCase();
  xhr = new XMLHttpRequest();
  if (arg.type != null) {
    xhr.responseType = arg.type;
  }
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      callback(xhr);
    }
  };
  if (arg.method == 'GET' && !arg.cache) {
    guid = Date.now();
    cacheUrl = url.replace(/#.*$/, "");
    hashUrl = url.slice(cacheUrl.length);
    cacheUrl = cacheUrl.replace(/([?&])_=[^&]*/, function (m1, m2) { return m2; });
    hashUrl = ((/\?/).test(cacheUrl) ? "&" : "?") + "_=" + (guid++) + hashUrl;
    url = cacheUrl + hashUrl;
  }
  if (arg.method == 'GET' && arg.data != '') {
    mergedObj = {};
    urlObj = docs.getUrlParams(url);
    for (key in urlObj) { mergedObj[key] = urlObj[key]; }
    for (key in arg.data) { mergedObj[key] = arg.data[key]; }
    url = url.split(/[?#]/)[0] + '?' + docs.urlEncode(mergedObj);
  }
  xhr.open(arg.method, url, arg.async);
  if (arg.method == 'GET') {
    xhr.send();
  } else {
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send(docs.urlEncode(arg.data));
  }
};
docs.DOMLoad = function () {
  document.dispatchEvent(new CustomEvent('DOMContentLoaded'));
  window.dispatchEvent(new CustomEvent('DOMContentLoaded'));
  window.dispatchEvent(new CustomEvent('load'));
};
docs.DOMEval = function (code) {
  var script;
  script = document.createElement("script");
  script.text = code;
  document.head.appendChild(script).parentNode.removeChild(script);
};
docs.getScript = function (url, callback) {
  docs.xhr(url, function (xhr) {
    if (xhr.status == 200) {
      docs.DOMEval(xhr.responseText);
    }
    if (typeof callback === 'function') {
      setTimeout(function () {
        callback(xhr);
      }, 0);
    }
  }, { method: "GET" });
};