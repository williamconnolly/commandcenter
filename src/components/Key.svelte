<script lang="ts">
    type Props = {
        small?: boolean;
        children?: import('svelte').Snippet;
    };

    let { small = false, children }: Props = $props();

    const lineHeight = small ? 11 : 15;
    const height = small ? 10 : 15;
</script>

<code style="line-height: {lineHeight}px; height: {height}px">
    {@render children?.()}
</code>

<style lang="scss">
    @use '../assets/colors' as *;

    code {
        display: inline-block;
        white-space: pre-wrap;
        font-family: monospace;
        padding: 2px 4px;
        background-color: $kh-light;
        border-radius: 4px;
        color: black;
    }

</style>
