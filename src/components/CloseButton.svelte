<script lang="ts">
    type Props = {
        onClick: () => void;
    };

    let { onClick }: Props = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<span class="close-button" onclick={() => onClick()}></span>

<style lang="scss">
    @use '../assets/colors' as *;

    $size: 24px;
    $half-size: calc($size / 2);

    .close-button {
        display: inline-block;
        position: relative;
        width: $size;
        height: $size;
        opacity: 0.75;
        cursor: pointer;

        &:hover {
            opacity: 1;
        }

        &:before, &:after {
            position: absolute;
            left: $half-size;
            content: ' ';
            height: $size;
            width: 2px;
            background-color: $kh-white;
        }
        &:before {
            transform: rotate(45deg);
        }
        &:after {
            transform: rotate(-45deg);
        }
    }
</style>
