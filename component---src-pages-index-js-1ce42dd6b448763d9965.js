"use strict";(self.webpackChunkyh_blog=self.webpackChunkyh_blog||[]).push([[678],{9535:function(e,t,l){var a=l(7294),i=l(5444),n=l(2359);t.Z=function(){var e,t,o=(0,i.useStaticQuery)("230163734"),r=null===(e=o.site.siteMetadata)||void 0===e?void 0:e.author,c=null===(t=o.site.siteMetadata)||void 0===t?void 0:t.social;return a.createElement("div",{className:"bio"},a.createElement(n.S,{className:"bio-avatar",layout:"fixed",formats:["auto"],src:"https://ddalpange.github.io/images/profile.jpeg",width:50,height:50,quality:95,alt:"Profile picture",__imageData:l(539)}),(null==r?void 0:r.name)&&a.createElement("p",null,"Written by ",a.createElement("strong",null,r.name)," ",(null==r?void 0:r.summary)||null," ",a.createElement("a",{href:"https://github.com/"+((null==c?void 0:c.github)||"")},"You should follow them on Github")))}},7704:function(e,t,l){l.r(t);var a=l(7294),i=l(5444),n=l(9535),o=l(7198),r=l(3751);t.default=function(e){var t,l=e.data,c=e.location,s=(null===(t=l.site.siteMetadata)||void 0===t?void 0:t.title)||"Title",u=l.allMarkdownRemark.nodes;return 0===u.length?a.createElement(o.Z,{location:c,title:s},a.createElement(r.Z,{title:"All posts"}),a.createElement(n.Z,null),a.createElement("p",null,'No blog posts found. Add markdown posts to "content/blog" (or the directory you specified for the "gatsby-source-filesystem" plugin in gatsby-config.js).')):a.createElement(o.Z,{location:c,title:s},a.createElement(r.Z,{title:"All posts"}),a.createElement(n.Z,null),a.createElement("ol",{style:{listStyle:"none"}},u.map((function(e){var t=e.frontmatter.title||e.fields.slug;return a.createElement("li",{key:e.fields.slug},a.createElement("article",{className:"post-list-item",itemScope:!0,itemType:"http://schema.org/Article"},a.createElement("header",null,a.createElement("h2",null,a.createElement(i.Link,{to:e.fields.slug,itemProp:"url"},a.createElement("span",{itemProp:"headline"},t))),a.createElement("small",null,e.frontmatter.date)),a.createElement("section",null,a.createElement("p",{dangerouslySetInnerHTML:{__html:e.frontmatter.description||e.excerpt},itemProp:"description"}))))}))))}},539:function(e){e.exports=JSON.parse('{"layout":"fixed","backgroundColor":"#e8b898","images":{"fallback":{"src":"/static/ca52b97d3cc63c215f667733f6483aef/d24ee/profile.jpg","srcSet":"/static/ca52b97d3cc63c215f667733f6483aef/d24ee/profile.jpg 50w,\\n/static/ca52b97d3cc63c215f667733f6483aef/64618/profile.jpg 100w","sizes":"50px"},"sources":[]},"width":50,"height":50}')}}]);
//# sourceMappingURL=component---src-pages-index-js-1ce42dd6b448763d9965.js.map