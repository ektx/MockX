<template>
    <div class="marked-box" v-html="inner"></div>
</template>

<script>
export default {
    name: 'marked-mod',
    props: {
        value: {
            type: String,
            default: ''
        }
    },
    data () {
        return {
            inner: ''
        }
    },
    watch: {
        value: {
            handler (val) {
                this.showMarked()
            },
            immediate: true
        }
    },
    methods: {
        // 展示 markedown 文件
		async showMarked () {
			const marked = (await import(/* webpackChunkName: "marked" */ 'marked')).default

			// 添加 TOC
			// https://marked.js.org/#/USING_PRO.md#renderer
			let renderer = new marked.Renderer()
			let toc = []
			let levelObj = {}

			renderer.heading = function (text, level) {
				if (level in levelObj) {
					levelObj[level] += 1
				} else {
					levelObj[level] = 1
				}

				let slug = encodeURI(text + '-' + levelObj[level])

				toc.push({
					level,
					slug,
					text,
					slug
				})

				return `<h${level} id="${slug}">${text}<a href="#${slug}" class="anchor"></a></h${level}>`
			}

			renderer.link = function (href, title, text) {
				let target = ''
				let end = ''

				if (href.startsWith('http')) {
					target = ' target="_blank" '
				}

				if (text.endsWith('  ')) {
					end = '<br/>'
				}

				return `<a href="${href}" ${target}>${text}</a>${end}`
			}
			
			renderer.paragraph = function (text) {
				let result = ''
				if (/\[toc\]/i.test(text)) {
					result = text
				} else {
					if (text.endsWith('  ')) {
						result = `${text}<br/>`
					} else {
						result = `<p>${text}</p>`
					}
				}

				return result
			}
			
			let html = marked(this.value, {renderer})
			let tocHtml = ``
			// 旧的级别
			let level = 0

			toc.forEach(val => {
				// 新建一个 ul
				if (level < val.level) {
					tocHtml += `<ul>`
				}
				// 相等时，表示为同级，只要为之前生成的 li 收尾
				else if (val.level === level) {
					tocHtml += `</li>`
				}
				// 小于时 表示现在需要返回上级 而上级的个数正好与级别差呈倍数
				else if (val.level < level) {
					tocHtml += `</li></ul>`.repeat(level - val.level)
				}

				tocHtml += `<li><a href="#${val.slug}">${val.text}</a>`

				// 将当前的级别赋值为老的级别 方便下次循环使用
				level = val.level
			})

			// 收尾 ul 因为前面我们并没有结束li与ul
			// ul与li都是在下次循环时进行收尾工作，最后一次需要人为处理
			tocHtml += `</li></ul>`.repeat(level)

            this.inner = html.replace(/\[toc\]/i, tocHtml)

			this.$nextTick(async function() {
				let codes = document.querySelectorAll('pre code')
				const HLJS = await import(/* webpackChunkName: "highlight" */ 'highlight.js')

				codes.forEach(code => {
					HLJS.highlightBlock(code)
				})
			})
        }
    }
}
</script>

<style lang="scss">
.marked-box {
    max-width: 800px;
    font-size: 14px;
    color: #333;
    position: relative;
    border-radius: 3px;

    &:empty {
        display: none
    }
    
    h1, h2, h3, h4, h5, h6 {
        margin: 0 0 1.5rem;
        color: #999;
        font-weight: bolder;
        user-select: none;

        &:target {
            color: #E91E63;
        }
    }
    h4, h5, h6 {
        color: #444;
    }

    h1 { font-size: 2rem; }
    h2 { font-size: 1.8rem; }
    h3 { font-size: 1.6rem; }
    h4 { font-size: 1.4rem; }
    h5 { font-size: 1.2rem; }
    h6 { font-size: 1rem; }

    h1:after,
    h2:after,
    h3:after {
        content: '';
        display: block;
        border-bottom: 1px solid #eee;
    }

    ul {
        padding: 0 0 0 2em;
        list-style: inherit;

        li {
            margin: 3px 0;
        }
    }

    p {
        margin: 1rem 0;
        line-height: 1.85rem;
    }

    a {
        color: #09f;
        font-weight: 400;

        &:hover {
            text-decoration: underline
        }
    }

    table {
        width: 100%;
        margin: 1rem 0;
        color: #555;

        th {
            text-align: left;
            color: #999;
        }

        td, th {
            font-size: 1.05rem;
            padding: .4rem 0rem;
            border-bottom: 1px solid #eee;
        }
    }

    /*  引用 */
    blockquote {
        margin: .5rem 0;
        padding: 3px 10px;
        border-left: 3px solid #4CAF50;
        background: #eee;
        border-radius: 0 2px 2px 0;
    }

    img {
        max-width: 100%;
    }

    em {
        font-style: italic;
    }
}

code, kbd, pre, samp, tt {
    font-family: "Roboto Mono", Monaco, courier, monospace;
    font-size: 12px;
    background-color: #f8f8f8;
    -webkit-font-smoothing: initial;
    -moz-osx-font-smoothing: initial;
}
code {
    color: #28962c;
    padding: 2px 7px;
    margin: 0 2px;
    border-radius: 2px;
}
</style>
