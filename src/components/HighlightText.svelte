<script lang="ts">
    type Props = {
        text: string;
        shouldHighlight?: boolean;
        indices?: Set<number>;
    };

    let { text, shouldHighlight = true, indices = new Set() }: Props = $props();
</script>

<div class="highlight-text">
    {#each text as char, index}
    <span class="character" class:highlight={shouldHighlight && indices.has(index)}>{char}</span>
    {/each}
</div>

<style lang="scss">
    @use '../assets/colors' as *;
    @use '../assets/mixins' as *;

    .highlight-text {
        @include normalize;
        font-size: 16px;
        color: $kh-white;

        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
    }

    .character {
        margin: 0;
        padding: 0;
        &.highlight {
            font-weight: bold;
            color: $kh-pink;
        }
    }

</style>
