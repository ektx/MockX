<template>
    <i class="mock-icon"></i>
</template>

<script>
export default {
    name: 'mock-icon',
    data () {
        return {}
    }
}
</script>

<style lang="scss">
@font-face {
    font-family: 'mockx';  /* project id 928233 */
    src: url('../../assets/font/iconfont.eot');
    src: url('../../assets/font/iconfont.eot?#iefix') format('embedded-opentype'),
    url('../../assets/font/iconfont.woff') format('woff'),
    url('../../assets/font/iconfont.ttf') format('truetype'),
    url('../../assets/font/iconfont.svg#mockx') format('svg');
}

.mock-icon {
    display: inline-block;
    height: 1em;
    width: 1em;
    font-size: 14px;
    font-family: 'mockx' !important;
    speak: none;
    font-style: normal;
    font-weight: normal;
    font-variant: normal;
    font-transform: none;
    line-height: 1;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;

    &::before {
        color: inherit;
    }  
}

$icons:
    app '\e605',
    browser '\e606'
;

@each $icon in $icons {
    $key: nth($icon, 1);
    $val: nth($icon, 2);

    .mock-icon.#{$key}::before {
        content: $val
    }
}
</style>

