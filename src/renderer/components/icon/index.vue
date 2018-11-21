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
    src: url('//at.alicdn.com/t/font_928233_dzn779o84xb.eot');
    src: url('//at.alicdn.com/t/font_928233_dzn779o84xb.eot?#iefix') format('embedded-opentype'),
    url('//at.alicdn.com/t/font_928233_dzn779o84xb.woff') format('woff'),
    url('//at.alicdn.com/t/font_928233_dzn779o84xb.ttf') format('truetype'),
    url('//at.alicdn.com/t/font_928233_dzn779o84xb.svg#mockx') format('svg');
}

.mock-icon {
    display: block;
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

