<script lang="ts">
    type Props = {
        onClick: () => void;
    };

    let { onClick }: Props = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<span class="pinned-button" onclick={() => onClick()}>
    🔒
</span>

<style lang="scss">
    @use '../assets/colors' as *;

    $size: 24px;

    .pinned-button {
        display: inline-block;
        opacity: 0.75;
        cursor: pointer;
        font-size: $size;
        line-height: $size;

        &:hover {
            opacity: 1;
        }
    }
</style>
